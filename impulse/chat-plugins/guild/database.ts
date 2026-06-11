import { PG } from '../../pg';
import type { Guild, GuildMember, InvitedMember, SeasonInfo } from './types';

interface GuildRow {
	id: string;
	owner_id: string;
	name: string;
	chatroom: string;
	description: string;
	icon: string | null;
	background: string | null;
	visibility: string;
	join_policy: string;
	points: number;
	member_limit: number;
	created_at: number | string;
	updated_at: number | string;
}

interface GuildMemberRow {
	guild_id: string;
	user_id: string;
	username: string;
	role: string;
	joined_at: number | string;
	points: number;
	total_points: number;
}

interface GuildInviteRow {
	guild_id: string;
	user_id: string;
	invited_at: number | string;
	expires_at: number | string;
	invited_by: string;
	status: string;
}

interface GuildBanRow {
	guild_id: string;
	user_id: string;
}

interface GuildCooldownRow {
	userid: string;
	expiration: number | string;
}

interface GuildSeasonRow {
	id: number;
	season: number;
	lastresetat: number | string;
	nextresetat: number | string;
}

interface GuildSettingsRow {
	id: number;
	global_member_limit: number;
}

const getGuildTable = () => PG.getTable<GuildRow>('guild', 'id');
const getMemberTable = () => PG.getTable<GuildMemberRow>('guild_member', 'user_id');
const getInviteTable = () => PG.getTable<GuildInviteRow>('guild_invite', 'user_id');
const getBanTable = () => PG.getTable<GuildBanRow>('guild_ban', 'user_id');
const getCooldownTable = () => PG.getTable<GuildCooldownRow>('guild_cooldown', 'userid');
const getSeasonTable = () => PG.getTable<GuildSeasonRow>('guild_season', 'id');
const getSettingsTable = () => PG.getTable<GuildSettingsRow>('guild_settings', 'id');

const guildCache = new Map<string, Guild>();

export const destroy = () => { 
	if (listenerClient) {
		listenerClient.release();
		listenerClient = null;
	}
};

let initPromise: Promise<void> | null = null;
let listenerClient: import('pg').PoolClient | null = null;

export const initDB = async (): Promise<void> => {
	if (!initPromise) {
		initPromise = (async () => {
			let attempts = 0;
			while (!PG.isReady && attempts < 20) {
				await new Promise(resolve => setTimeout(resolve, 500));
				attempts++;
			}
			if (!PG.isReady) {
				initPromise = null;
				return;
			}

			await PG.query(`
				CREATE TABLE IF NOT EXISTS guild (
					id TEXT PRIMARY KEY,
					owner_id TEXT NOT NULL,
					name TEXT NOT NULL,
					chatroom TEXT NOT NULL,
					description TEXT,
					icon TEXT,
					background TEXT,
					visibility TEXT NOT NULL,
					join_policy TEXT NOT NULL,
					points INTEGER DEFAULT 0,
					member_limit INTEGER DEFAULT 10,
					created_at BIGINT NOT NULL,
					updated_at BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS guild_member (
					guild_id TEXT NOT NULL,
					user_id TEXT PRIMARY KEY,
					username TEXT NOT NULL,
					role TEXT NOT NULL,
					joined_at BIGINT NOT NULL,
					points INTEGER DEFAULT 0,
					total_points INTEGER DEFAULT 0,
					FOREIGN KEY (guild_id) REFERENCES guild(id) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS guild_invite (
					guild_id TEXT NOT NULL,
					user_id TEXT NOT NULL,
					invited_at BIGINT NOT NULL,
					expires_at BIGINT NOT NULL,
					invited_by TEXT NOT NULL,
					status TEXT NOT NULL,
					PRIMARY KEY (guild_id, user_id),
					FOREIGN KEY (guild_id) REFERENCES guild(id) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS guild_ban (
					guild_id TEXT NOT NULL,
					user_id TEXT NOT NULL,
					PRIMARY KEY (guild_id, user_id),
					FOREIGN KEY (guild_id) REFERENCES guild(id) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS guild_cooldown (
					userid TEXT PRIMARY KEY,
					expiration BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS guild_season (
					id INTEGER PRIMARY KEY CHECK (id = 1),
					season INTEGER NOT NULL,
					lastresetat BIGINT NOT NULL,
					nextresetat BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS guild_settings (
					id INTEGER PRIMARY KEY CHECK (id = 1),
					global_member_limit INTEGER DEFAULT 10
				);
			`);

			if (!listenerClient) {
				try { listenerClient = await PG.pool.connect(); } catch(err) { listenerClient = null; return; }
				await listenerClient.query('LISTEN guild_updates');
				await listenerClient.query('LISTEN guild_points_update');
				await listenerClient.query('LISTEN guild_member_points');
				listenerClient.on('notification', (msg) => {
					if (msg.channel === 'guild_updates' && msg.payload) {
						if (msg.payload === 'ALL') {
							guildCache.clear();
						} else {
							guildCache.delete(msg.payload);
						}
					} else if (msg.channel === 'guild_points_update' && msg.payload) {
						try {
							const data = JSON.parse(msg.payload);
							const guild = guildCache.get(data.id);
							if (guild) {
								guild.points = data.points;
							}
						} catch {}
					} else if (msg.channel === 'guild_member_points' && msg.payload) {
						try {
							const data = JSON.parse(msg.payload);
							const guild = guildCache.get(data.guildId);
							if (guild) {
								const member = guild.members.find((m: any) => m.id === data.userId);
								if (member) {
									member.points = data.points;
									member.totalPoints = data.totalPoints;
								}
							}
						} catch {}
					}
				});
			}
		})();
	}
	return initPromise;
};

async function invalidateCache(guildId: string) {
	guildCache.delete(guildId);
	await PG.query(`SELECT pg_notify('guild_updates', $1)`, [guildId]);
}

async function reconstructGuild(guildRow: GuildRow): Promise<Guild> {
	const [membersRes, invitesRes, bansRes] = await Promise.all([
		getMemberTable().select({ guild_id: guildRow.id }),
		getInviteTable().select({ guild_id: guildRow.id }),
		getBanTable().select({ guild_id: guildRow.id })
	]);

	const members: GuildMember[] = membersRes.map(m => ({
		id: m.user_id,
		username: m.username,
		role: m.role as GuildMember['role'],
		joinedAt: new Date(Number(m.joined_at)),
		points: m.points,
		totalPoints: m.total_points,
	}));

	const invited: InvitedMember[] = invitesRes.map(i => ({
		userId: i.user_id,
		invitedAt: new Date(Number(i.invited_at)),
		expiresAt: new Date(Number(i.expires_at)),
		invitedBy: i.invited_by,
		status: i.status as InvitedMember['status'],
	}));

	const banned: string[] = bansRes.map(b => b.user_id);

	return {
		id: guildRow.id,
		ownerId: guildRow.owner_id,
		name: guildRow.name,
		chatroom: guildRow.chatroom,
		description: guildRow.description || '',
		icon: guildRow.icon,
		background: guildRow.background,
		visibility: guildRow.visibility as any,
		joinPolicy: guildRow.join_policy as any,
		points: guildRow.points,
		memberLimit: guildRow.member_limit,
		memberCount: members.length,
		members,
		invited,
		banned,
		createdAt: new Date(Number(guildRow.created_at)),
		updatedAt: new Date(Number(guildRow.updated_at)),
	};
}

export const GuildRepository = {
	async getGuildById(guildId: string): Promise<Guild | null> {
		await initDB();
		if (guildCache.has(guildId)) return guildCache.get(guildId)!;

		const row = await getGuildTable().findById(guildId);
		if (!row) return null;
		
		const guild = await reconstructGuild(row);
		guildCache.set(guildId, guild);
		return guild;
	},

	async getGuildByMemberId(userId: string): Promise<Guild | null> {
		await initDB();
		const rows = await getMemberTable().select({ user_id: userId }, ['guild_id'], { limit: 1 });
		if (rows.length === 0) return null;
		return this.getGuildById(rows[0].guild_id);
	},

	async getAllGuilds(): Promise<Guild[]> {
		await initDB();
		const rows = await getGuildTable().select();
		const guilds: Guild[] = [];
		const missingGuilds: GuildRow[] = [];

		for (const row of rows) {
			const guildId = row.id;
			if (guildCache.has(guildId)) {
				guilds.push(guildCache.get(guildId)!);
			} else {
				missingGuilds.push(row);
			}
		}

		if (missingGuilds.length > 0) {
			const missingIds = missingGuilds.map(g => g.id);
			
			// PGTable natively translates arrays in buildWhere() to `IN ($1, $2, ...)`
			const [membersRes, invitesRes, bansRes] = await Promise.all([
				getMemberTable().select({ guild_id: missingIds }),
				getInviteTable().select({ guild_id: missingIds }),
				getBanTable().select({ guild_id: missingIds })
			]);

			const membersByGuild = new Map<string, GuildMember[]>();
			const invitesByGuild = new Map<string, InvitedMember[]>();
			const bansByGuild = new Map<string, string[]>();

			for (const id of missingIds) {
				membersByGuild.set(id, []);
				invitesByGuild.set(id, []);
				bansByGuild.set(id, []);
			}

			for (const m of membersRes) {
				membersByGuild.get(m.guild_id)!.push({
					id: m.user_id, username: m.username, role: m.role as GuildMember['role'],
					joinedAt: new Date(Number(m.joined_at)), points: m.points, totalPoints: m.total_points,
				});
			}

			for (const i of invitesRes) {
				invitesByGuild.get(i.guild_id)!.push({
					userId: i.user_id, invitedAt: new Date(Number(i.invited_at)),
					expiresAt: new Date(Number(i.expires_at)), invitedBy: i.invited_by, status: i.status as InvitedMember['status'],
				});
			}

			for (const b of bansRes) {
				bansByGuild.get(b.guild_id)!.push(b.user_id);
			}

			for (const guildRow of missingGuilds) {
				const members = membersByGuild.get(guildRow.id)!;
				const guild: Guild = {
					id: guildRow.id, ownerId: guildRow.owner_id, name: guildRow.name, chatroom: guildRow.chatroom,
					description: guildRow.description || '', icon: guildRow.icon, background: guildRow.background,
					visibility: guildRow.visibility as any, joinPolicy: guildRow.join_policy as any, points: guildRow.points,
					memberLimit: guildRow.member_limit, memberCount: members.length,
					members, invited: invitesByGuild.get(guildRow.id)!, banned: bansByGuild.get(guildRow.id)!,
					createdAt: new Date(Number(guildRow.created_at)), updatedAt: new Date(Number(guildRow.updated_at)),
				};
				guildCache.set(guild.id, guild);
				guilds.push(guild);
			}
		}

		return guilds;
	},

	async guildExists(guildId: string): Promise<boolean> {
		if (guildCache.has(guildId)) return true;
		await initDB();
		return await getGuildTable().exists({ id: guildId });
	},

	async createGuild(guildInput: Omit<Guild, 'members' | 'invited' | 'banned' | 'memberCount'>, owner: GuildMember): Promise<void> {
		await initDB();
		await getGuildTable().insert({
			id: guildInput.id,
			owner_id: guildInput.ownerId,
			name: guildInput.name,
			chatroom: guildInput.chatroom,
			description: guildInput.description,
			icon: guildInput.icon,
			background: guildInput.background,
			visibility: guildInput.visibility,
			join_policy: guildInput.joinPolicy,
			points: guildInput.points,
			member_limit: guildInput.memberLimit,
			created_at: guildInput.createdAt.getTime(),
			updated_at: guildInput.updatedAt.getTime(),
		});
		await this.addMember(guildInput.id, owner);
	},

	async deleteGuild(guildId: string): Promise<void> {
		await initDB();
		await getGuildTable().deleteById(guildId);
		await invalidateCache(guildId);
	},

	async updateGuildSettings(guildId: string, settings: Partial<Guild>): Promise<void> {
		await initDB();
		
		const mapping: Record<string, string> = {
			ownerId: 'owner_id', name: 'name', chatroom: 'chatroom', description: 'description',
			icon: 'icon', background: 'background', visibility: 'visibility', joinPolicy: 'join_policy',
			points: 'points', memberLimit: 'member_limit', updatedAt: 'updated_at',
		};

		const updateData: Partial<GuildRow> = {};
		let hasUpdates = false;

		for (const [key, val] of Object.entries(settings)) {
			if (mapping[key]) {
				let dbVal = val;
				if (typeof val === 'boolean') dbVal = val ? 1 : 0;
				if (val instanceof Date) dbVal = val.getTime();
				
				(updateData as any)[mapping[key]] = dbVal;
				hasUpdates = true;
			}
		}

		if (!hasUpdates) return;

		if (!updateData.updated_at) {
			updateData.updated_at = Date.now();
		}

		await getGuildTable().updateById(guildId, updateData);
		await invalidateCache(guildId);
	},

	async addMember(guildId: string, member: GuildMember): Promise<void> {
		await initDB();
		await getMemberTable().insert({
			guild_id: guildId,
			user_id: member.id,
			username: member.username,
			role: member.role,
			joined_at: member.joinedAt.getTime(),
			points: member.points,
			total_points: member.totalPoints
		});
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async removeMember(guildId: string, userId: string): Promise<void> {
		await initDB();
		await getMemberTable().delete({ guild_id: guildId, user_id: userId });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async removeMembers(guildId: string, userIds: string[]): Promise<void> {
		if (userIds.length === 0) return;
		await initDB();
		await getMemberTable().delete({ guild_id: guildId, user_id: userIds });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async updateMemberRole(guildId: string, userId: string, role: string): Promise<void> {
		await initDB();
		await getMemberTable().update({ role }, { guild_id: guildId, user_id: userId });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async addGuildPoints(guildId: string, points: number): Promise<void> {
		await initDB();
		const res = await PG.query(`
			UPDATE guild 
			SET points = GREATEST(0, points + $1), 
			    updated_at = $2 
			WHERE id = $3
			RETURNING points
		`, [points, Date.now(), guildId]);
		if (res.rows.length) {
			await PG.query(`SELECT pg_notify('guild_points_update', $1)`, [JSON.stringify({id: guildId, points: res.rows[0].points})]);
		}
	},

	async addMemberPoints(guildId: string, userId: string, points: number): Promise<void> {
		await initDB();
		const res = await PG.query(`
			UPDATE guild_member 
			SET points = GREATEST(0, points + $1), 
			    total_points = GREATEST(0, total_points + $1) 
			WHERE guild_id = $2 AND user_id = $3
			RETURNING points, total_points
		`, [points, guildId, userId]);
		if (res.rows.length) {
			await PG.query(`SELECT pg_notify('guild_member_points', $1)`, [JSON.stringify({guildId, userId, points: res.rows[0].points, totalPoints: res.rows[0].total_points})]);
		}
	},

	async resetAllPoints(): Promise<void> {
		await initDB();
		await PG.query('UPDATE guild SET points = 0');
		await PG.query('UPDATE guild_member SET points = 0, total_points = 0');
		guildCache.clear();
		await PG.query(`SELECT pg_notify('guild_updates', 'ALL')`);
	},

	async createInvite(guildId: string, invite: InvitedMember): Promise<void> {
		await initDB();
		await getInviteTable().upsert({
			guild_id: guildId,
			user_id: invite.userId,
			invited_at: invite.invitedAt.getTime(),
			expires_at: invite.expiresAt.getTime(),
			invited_by: invite.invitedBy,
			status: invite.status
		}, ['guild_id', 'user_id']);
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async updateInviteStatus(guildId: string, userId: string, status: string): Promise<void> {
		await initDB();
		await getInviteTable().update({ status }, { guild_id: guildId, user_id: userId });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async removeInvite(guildId: string, userId: string): Promise<void> {
		await initDB();
		await getInviteTable().delete({ guild_id: guildId, user_id: userId });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async banUser(guildId: string, userId: string): Promise<void> {
		await initDB();
		// Kept raw SQL: ON CONFLICT DO NOTHING behavior is not supported by PGTable.upsert()
		await PG.query(`
			INSERT INTO guild_ban (guild_id, user_id) VALUES ($1, $2)
			ON CONFLICT (guild_id, user_id) DO NOTHING
		`, [guildId, userId]);
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},

	async unbanUser(guildId: string, userId: string): Promise<void> {
		await initDB();
		await getBanTable().delete({ guild_id: guildId, user_id: userId });
		await getGuildTable().updateById(guildId, { updated_at: Date.now() });
		await invalidateCache(guildId);
	},
};

export async function setGuildCooldown(userId: string): Promise<void> {
	await initDB();
	const expiration = Date.now() + 12 * 60 * 60 * 1000;
	await getCooldownTable().upsert({ userid: userId, expiration }, ['userid']);
}

export async function setGuildCooldowns(userIds: string[]): Promise<void> {
	if (userIds.length === 0) return;
	await initDB();
	const expiration = Date.now() + 12 * 60 * 60 * 1000;
	
	const placeholders = [];
	const args = [];
	let argCount = 1;
	for (const id of userIds) {
		placeholders.push(`($${argCount++}, $${argCount++})`);
		args.push(id, expiration);
	}
	
	// Kept raw SQL: PGTable lacks a batch upsert mechanism for array payloads
	await PG.query(`
		INSERT INTO guild_cooldown (userid, expiration) VALUES ${placeholders.join(', ')}
		ON CONFLICT (userid) DO UPDATE SET expiration = EXCLUDED.expiration
	`, args);
}

export async function getGuildCooldown(userId: string): Promise<number | null> {
	await initDB();
	const row = await getCooldownTable().findById(userId);
	if (!row) return null;
	
	const expiration = Number(row.expiration);
	if (Date.now() > expiration) {
		await getCooldownTable().deleteById(userId);
		return null;
	}
	return expiration;
}

export async function getSeasonInfo(): Promise<SeasonInfo> {
	await initDB();
	const row = await getSeasonTable().findById(1);
	if (row) {
		return {
			season: row.season,
			lastResetAt: Number(row.lastresetat),
			nextResetAt: Number(row.nextresetat),
		};
	}

	const now = Date.now();
	const data: SeasonInfo = {
		season: 1,
		lastResetAt: now,
		nextResetAt: now + (14 * 24 * 60 * 60 * 1000),
	};
	await saveSeasonInfo(data);
	return data;
}

export async function saveSeasonInfo(data: SeasonInfo): Promise<void> {
	await initDB();
	await getSeasonTable().upsert({
		id: 1,
		season: data.season,
		lastresetat: data.lastResetAt,
		nextresetat: data.nextResetAt
	}, ['id']);
}

let globalMemberLimitCache: number | null = null;

export async function getGlobalMemberLimit(): Promise<number> {
	if (globalMemberLimitCache !== null) return globalMemberLimitCache;

	await initDB();
	const row = await getSettingsTable().findById(1);
	if (row) {
		globalMemberLimitCache = Number(row.global_member_limit);
		return globalMemberLimitCache;
	}
	
	await getSettingsTable().upsert({ id: 1, global_member_limit: 10 }, ['id']);
	globalMemberLimitCache = 10;
	return 10;
}

export async function setGlobalMemberLimit(limit: number): Promise<void> {
	await initDB();
	await getSettingsTable().upsert({ id: 1, global_member_limit: limit }, ['id']);
	globalMemberLimitCache = limit;
	
	// Update all existing guilds
	await PG.query(`UPDATE guild SET member_limit = $1`, [limit]);
	
	// Clear cache and broadcast update
	guildCache.clear();
	await PG.query(`SELECT pg_notify('guild_updates', 'ALL')`);
}
