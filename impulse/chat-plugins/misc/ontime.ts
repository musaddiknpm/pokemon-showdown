import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initMiscDB } from './database';

const MAX_USERID_LENGTH = 18;

interface OntimeEntry {
	totalTime: number;
	isBlocked: boolean;
}

interface OntimeRow {
	user_id: string;
	total_time: number | string;
	is_blocked: number;
}

const getOntimeTable = () => PG.getTable<OntimeRow>('ontime', 'user_id');

// userid → { totalTime, isBlocked }
let ontimeData: Record<string, OntimeEntry> = {};

async function initOntime() {
	await initMiscDB();
	const rows = await getOntimeTable().select();
	ontimeData = {};
	for (const row of rows) {
		ontimeData[row.user_id] = {
			totalTime: Number(row.total_time),
			isBlocked: row.is_blocked === 1,
		};
	}
}

void initOntime().catch(err => Monitor.crashlog(err, 'Ontime PG init failed'));

const pendingOntimeUpdates = new Map<string, number>();
let ontimeBatchTimer: NodeJS.Timeout | null = null;

const OntimeManager = {
	displayTime(ms: number) {
		return Chat.toDurationString(ms, { precision: true }) || '0 seconds';
	},

	getSessionTime(user: User | undefined) {
		if (!user?.connected || !user.lastConnected) return 0;
		return Math.max(0, Date.now() - user.lastConnected);
	},

	update(userid: string, sessionTime: number): void {
		if (sessionTime <= 0) return;
		const entry = ontimeData[userid];
		// Silently skip blocked users
		if (entry?.isBlocked) return;

		if (entry) {
			entry.totalTime += sessionTime;
		} else {
			ontimeData[userid] = { totalTime: sessionTime, isBlocked: false };
		}
		
		pendingOntimeUpdates.set(userid, (pendingOntimeUpdates.get(userid) || 0) + sessionTime);
		if (!ontimeBatchTimer) {
			ontimeBatchTimer = setTimeout(() => {
				void OntimeManager.flushUpdates();
			}, 60 * 1000);
		}
	},

	async flushUpdates(): Promise<void> {
		if (pendingOntimeUpdates.size === 0) return;
		await initMiscDB();
		const entries = Array.from(pendingOntimeUpdates.entries());
		pendingOntimeUpdates.clear();
		ontimeBatchTimer = null;

		const placeholders = entries.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}, 0)`).join(', ');
		const values = entries.flatMap(([userid, sessionTime]) => [userid, sessionTime]);

		// Kept Raw SQL: Requires relative database math (total_time = ontime.total_time + EXCLUDED.total_time)
		await PG.query(`
			INSERT INTO ontime (user_id, total_time, is_blocked) 
			VALUES ${placeholders} 
			ON CONFLICT (user_id) DO UPDATE SET total_time = ontime.total_time + EXCLUDED.total_time
		`, values);
	},

	async setBlocked(userid: string, blocked: boolean): Promise<void> {
		const totalTime = ontimeData[userid]?.totalTime || 0;
		ontimeData[userid] = { totalTime, isBlocked: blocked };

		await initMiscDB();
		await getOntimeTable().upsert({
			user_id: userid,
			total_time: totalTime,
			is_blocked: blocked ? 1 : 0
		}, ['user_id'], 'is_blocked');
	}
};

export const handlers: Chat.Handlers = {
	onDisconnect(user) {
		if (!user.named || user.connections.length > 0 || user.isPublicBot) return;
		const sessionTime = OntimeManager.getSessionTime(user);
		void OntimeManager.update(user.id, sessionTime);
	},
};

export const commands: Chat.ChatCommands = wrapCommands({
	ontime: {
		'': 'check',
		check(target, room, user) {
			if (!this.runBroadcast()) return;
			const targetId = toID(target) || user.id;
			if (targetId.length > MAX_USERID_LENGTH) throw new Chat.ErrorMessage("Invalid username.");

			const targetUser = Users.get(targetId);
			if (targetUser?.isPublicBot) return this.sendReplyBox(`${nameColor(targetId, true)} is a bot and is not tracked.`);

			const entry = ontimeData[targetId];
			if (entry?.isBlocked) return this.sendReplyBox(`${nameColor(targetId, true)} is blocked from tracking ontime.`);

			const savedTime = entry?.totalTime ?? 0;
			const sessionTime = OntimeManager.getSessionTime(targetUser);
			const total = savedTime + sessionTime;

			if (!total) return this.sendReplyBox(`${nameColor(targetId, true)} has no recorded ontime.`);

			let output = `${nameColor(targetId, true)}'s total ontime is <b>${OntimeManager.displayTime(total)}</b>.`;
			if (sessionTime > 0) output += `<br /><small>Current session: ${OntimeManager.displayTime(sessionTime)}</small>`;

			this.sendReplyBox(output);
		},

		ladder(target, room, user) {
			if (!this.runBroadcast()) return;

			const leaderboard = Object.entries(ontimeData)
				.filter(([, e]) => !e.isBlocked)
				.map(([userid, e]) => {
					const session = OntimeManager.getSessionTime(Users.get(userid));
					return { id: userid, total: e.totalTime + session };
				})
				.sort((a, b) => b.total - a.total)
				.slice(0, 50);

			if (!leaderboard.length) return this.sendReplyBox("The ontime leaderboard is empty.");

			const dataRows = leaderboard.map((entry, i) => [
				`${i + 1}`,
				nameColor(entry.id, true),
				OntimeManager.displayTime(entry.total),
			]);

			const html = Table("Ontime Leaderboard", ["Rank", "User", "Time"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		async block(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);
			if (!targetId || targetId.length > MAX_USERID_LENGTH) throw new Chat.ErrorMessage("Invalid username.");

			const entry = ontimeData[targetId];
			if (entry?.isBlocked) throw new Chat.ErrorMessage("User is already blocked.");

			await OntimeManager.setBlocked(targetId, true);
			this.sendReply(`${targetId} has been blocked from ontime tracking.`);
		},

		async unblock(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);
			const entry = ontimeData[targetId];
			if (!entry?.isBlocked) throw new Chat.ErrorMessage("User is not blocked.");

			await OntimeManager.setBlocked(targetId, false);
			this.sendReply(`${targetId} has been unblocked.`);
		},

		blocklist(target, room, user) {
			this.checkCan('bypassall');
			const blocked = Object.entries(ontimeData)
				.filter(([, e]) => e.isBlocked)
				.map(([userid]) => userid);

			if (!blocked.length) return this.sendReply("No users are currently blocked.");
			this.sendReply(`Blocked users: ${blocked.join(', ')}`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Ontime Commands</b></center><hr>` +
				`<b>/ontime [user]</b>: Check a user's total time.<hr>` +
				`<b>/ontime ladder</b>: View the top active users.<hr>` +
				`<b>/ontime block/unblock [user]</b>: Toggle tracking for a user.`
			);
		},
	},
});

export const destroy = () => {
	if (ontimeBatchTimer) clearTimeout(ontimeBatchTimer);
	ontimeBatchTimer = null;
	void OntimeManager.flushUpdates();
};
