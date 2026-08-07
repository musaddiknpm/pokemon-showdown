import { escapeHTML } from '../../../lib/utils';
import { GuildRepository, getGuildCooldown, setGuildCooldown, setGuildCooldowns, getSeasonInfo, saveSeasonInfo, getGlobalMemberLimit, setGlobalMemberLimit } from './database';
import { getLastSeen } from '../misc/seen';
import type { Guild, GuildMember } from './types';

export async function endGuildSeason() {
	const topGuilds = await GuildRepository.getTopGuilds(3);
	const topMembers = await GuildRepository.getTopMembers(3);

	const seasonData = await getSeasonInfo();
	const seasonNumber = seasonData.season;

	const allChatrooms = await GuildRepository.getAllChatrooms();
	for (const chatroom of allChatrooms) {
		broadcastToGuild(chatroom, `<b>Guild Season ${seasonNumber} has officially ended!</b><br />Check out the global leaderboards to see the winners! Points have been reset for the new season.`, 'blue');
	}

	for (const g of topGuilds) {
		const owner = Users.get(g.owner_id);
		if (owner) owner.popup(`|html|<b>Congratulations!</b><br />Your guild <b>${g.name}</b> placed in the top 3 for Season ${seasonNumber}!<br />Rewards will be distributed shortly.`);
	}

	for (const m of topMembers) {
		const user = Users.get(m.id);
		if (user) user.popup(`|html|<b>Congratulations!</b><br />You placed in the top 3 global members for Season ${seasonNumber}!<br />Rewards will be distributed shortly.`);
	}

	await GuildRepository.resetAllPoints();

	seasonData.season += 1;
	seasonData.lastResetAt = Date.now();
	seasonData.nextResetAt = Date.now() + (14 * 24 * 60 * 60 * 1000);
	await saveSeasonInfo(seasonData);
}

declare global {
	var GuildSeasonTimer: NodeJS.Timeout | undefined;
}

if (global.GuildSeasonTimer) {
	clearInterval(global.GuildSeasonTimer);
}
global.GuildSeasonTimer = setInterval(() => {
	void (async () => {
		const seasonData = await getSeasonInfo();
		if (Date.now() >= seasonData.nextResetAt) {
			await endGuildSeason();
		}
	})().catch(err => Monitor.crashlog(err, 'Guild Season Timer crashed'));
}, 1000 * 60 * 60);

function formatCooldown(expiration: number) {
	return Chat.toDurationString(expiration - Date.now(), { precision: 2 });
}

const ROLE_HIERARCHY: Record<string, number> = {
	'Master': 5,
	'Champion': 4,
	'Elite': 3,
	'Veteran': 2,
	'Trainer': 1,
	'Rookie': 0,
};

const VALID_ROLES = Object.keys(ROLE_HIERARCHY);

function checkGuildAuth(guild: import('./types').Guild, user: import('../../../server/user-groups').User, allowedRoles: string[] | null, actionDesc: string) {
	const userMember = guild.members.find(m => m.id === user.id);
	if (!userMember && !user.can('bypassall')) {
		return { error: `You are not a member of '${guild.name}'.` };
	}
	if (userMember && allowedRoles && !allowedRoles.some(r => userMember.role === r) && !user.can('bypassall')) {
		return { error: `You do not have permission to ${actionDesc}.` };
	}
	return { userMember };
}

const ROLE_TO_RANK: Record<string, string> = {
	'Master': '#',
	'Champion': '\u2605',
	'Elite': '@',
	'Veteran': '%',
	'Trainer': '\u2606',
	'Rookie': '+',
};

function updateRoomAuth(guild: Guild, userId: string, role: string | null) {
	if (!guild.chatroom) return;
	const room = Rooms.get(guild.chatroom as RoomID);
	if (!room) return;

	if (role && ROLE_TO_RANK[role]) {
		room.auth.set(userId, ROLE_TO_RANK[role] as import('../../../server/user-groups').GroupSymbol);
	} else {
		room.auth.delete(userId);
	}
	if (room.saveSettings) room.saveSettings();
}

function broadcastToGuild(guildOrRoomId: Guild | string, message: string, type: 'green' | 'red' | 'blue') {
	const roomId = typeof guildOrRoomId === 'string' ? guildOrRoomId : guildOrRoomId.chatroom;
	if (!roomId) return;
	const room = Rooms.get(roomId as RoomID);
	if (room) {
		room.add(`|html|<div class="broadcast-${type}" style="text-align: center;">${message}</div>`).update();
	}
}

async function resolveGuildWithVariadic(user: User, target: string): Promise<{ guild: Guild | null, rest: string, error?: string }> {
	if (user.can('bypassall') && target.includes(',')) {
		const firstPart = target.split(',')[0].trim();
		const possibleGuildId = toID(firstPart);
		const possibleGuild = await GuildRepository.getGuildById(possibleGuildId);
		if (possibleGuild) {
			return { guild: possibleGuild, rest: target.slice(target.indexOf(',') + 1).trim() };
		}
	}

	const guild = await GuildRepository.getGuildByMemberId(user.id);
	if (!guild) return { guild: null, rest: target, error: "You are not a member of any guild." };
	return { guild, rest: target };
}

export const commands: Chat.ChatCommands = {
	guild: {
		async create(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Access denied. Only global administrators can create a guild.");

			const parts = target.split(',').map(p => p.trim());
			const name = parts[0];
			if (!name) return this.parse('/help guild create');

			const ownerId = parts.length > 1 ? toID(parts[1]) : user.id;
			const ownerName = parts.length > 1 ? parts[1] : user.name;

			const id = toID(name);
			if (!id) throw new Chat.ErrorMessage("Guild name must contain alphanumeric characters.");
			if (id.length > 20) throw new Chat.ErrorMessage("Guild name must be 20 characters or less.");

			if (await GuildRepository.guildExists(id)) throw new Chat.ErrorMessage(`Guild '${name}' already exists.`);

			const existingGuild = await GuildRepository.getGuildByMemberId(ownerId);
			if (existingGuild) {
				throw new Chat.ErrorMessage(`User '${ownerName}' is already in a guild.`);
			}

			const roomId = `guild${id}` as RoomID;
			if (Rooms.get(roomId)) throw new Chat.ErrorMessage("A room for this guild already exists.");

			const titleName = `Guild: ${name}`;
			if (!Rooms.global.addChatRoom(titleName)) {
				throw new Chat.ErrorMessage("Failed to create the persistent chatroom for this guild.");
			}

			const guildRoom = Rooms.get(roomId);
			if (!guildRoom) throw new Chat.ErrorMessage("Failed to retrieve the created chatroom.");

			const defaultDesc = `Welcome to the ${name} Guild Chat Room.`;
			guildRoom.desc = defaultDesc;
			guildRoom.isPrivate = false;
			guildRoom.auth.set(ownerId, '#');
			if (guildRoom.saveSettings) guildRoom.saveSettings();

			const limit = await getGlobalMemberLimit();
			await GuildRepository.createGuild({
				id, ownerId, name, chatroom: roomId, description: defaultDesc,
				icon: null, background: null, visibility: 'public', joinPolicy: 'open',
				points: 0,
				memberLimit: limit, createdAt: new Date(), updatedAt: new Date(),
			}, {
				id: ownerId, username: ownerName, role: 'Master', joinedAt: new Date(),
				points: 0, totalPoints: 0,
			});
			this.sendReply(`Guild '${name}' has been created successfully with '${ownerName}' as the owner.`);

			const targetUser = Users.get(ownerId);
			if (targetUser) {
				targetUser.popup(`|html|Your guild <b>${name}</b> has been created by ${user.name}!`);
				targetUser.joinRoom(roomId);
			}
		},

		async delete(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Access denied. Only global administrators can delete a guild.");

			const guildId = toID(target);
			if (!guildId) return this.parse('/help guild delete');

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) throw new Chat.ErrorMessage(`Guild '${target}' not found.`);

			if (guild.chatroom) {
				const chatroom = Rooms.get(guild.chatroom as RoomID);
				if (chatroom) {
					Rooms.global.deregisterChatRoom(guild.chatroom);
					chatroom.destroy();
				}
			}

			await GuildRepository.deleteGuild(guildId);
			this.sendReply(`Guild '${guild.name}' has been deleted.`);

			const ownerUser = Users.get(guild.ownerId);
			if (ownerUser) {
				ownerUser.popup(`|html|The guild <b>${guild.name}</b> has been deleted by ${user.name}.`);
			}
		},

		async join(target, room, user) {
			const id = toID(target);
			if (!id) return this.parse('/help guild join');

			const guild = await GuildRepository.getGuildById(id);
			if (!guild) throw new Chat.ErrorMessage(`Guild '${id}' not found.`);

			const cooldown = await getGuildCooldown(user.id);
			if (cooldown && !user.can('bypassall')) {
				throw new Chat.ErrorMessage(`You must wait ${formatCooldown(cooldown)} before joining another guild.`);
			}

			const userGuild = await GuildRepository.getGuildByMemberId(user.id);
			if (userGuild) {
				throw new Chat.ErrorMessage(`You are already in a guild. You must leave it before joining another.`);
			}

			if (guild.memberCount >= guild.memberLimit) {
				throw new Chat.ErrorMessage(`Guild '${guild.name}' has reached its member limit of ${guild.memberLimit}.`);
			}

			if (guild.banned.includes(user.id)) {
				throw new Chat.ErrorMessage(`You are banned from joining '${guild.name}'.`);
			}

			if (guild.joinPolicy === 'invite-only') {
				const inviteIndex = guild.invited.findIndex(i => i.userId === user.id && i.status === 'pending');
				if (inviteIndex === -1) {
					throw new Chat.ErrorMessage(`Guild '${guild.name}' is invite-only, and you do not have a pending invite.`);
				}
				const invite = guild.invited[inviteIndex];
				if (invite.expiresAt < new Date()) {
					await GuildRepository.updateInviteStatus(guild.id, user.id, 'revoked');
					throw new Chat.ErrorMessage(`Your invite to '${guild.name}' has expired.`);
				}
			}

			let hadInvite = false;
			if (guild.invited.some(i => i.userId === user.id && i.status === 'pending')) {
				hadInvite = true;
				await GuildRepository.removeInvite(guild.id, user.id);
			}

			await GuildRepository.addMember(guild.id, {
				id: user.id, username: user.name, role: 'Rookie', joinedAt: new Date(),
				points: 0, totalPoints: 0,
			});
			updateRoomAuth(guild, user.id, 'Rookie');
			
			if (hadInvite) {
				user.send(`|pm|~|~|/uhtmlchange guildinvite-${guild.id},You have successfully joined the guild <b>${guild.name}</b>!`);
			} else {
				this.sendReply(`You have successfully joined '${guild.name}'.`);
			}
			
			user.joinRoom(guild.chatroom as RoomID);

			broadcastToGuild(guild, `${user.name} has joined the guild.`, 'green');
		},

		async leave(target, room, user) {
			const { guild, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const memberIndex = guild.members.findIndex(m => m.id === user.id);
			if (memberIndex === -1) throw new Chat.ErrorMessage(`You are not a member of '${guild.name}'.`);

			if (guild.ownerId === user.id) {
				throw new Chat.ErrorMessage("You cannot leave a guild you own. Transfer ownership or delete the guild first.");
			}

			updateRoomAuth(guild, user.id, null);
			await GuildRepository.removeMember(guild.id, user.id);
			await setGuildCooldown(user.id);
			this.sendReply(`You have left '${guild.name}'. You must wait 12 hours before joining another guild.`);

			broadcastToGuild(guild, `${user.name} has left the guild.`, 'red');
		},

		async promote(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const parts = rest.split(',').map(p => p.trim());
			if (parts.length !== 2) return this.parse('/help guild promote');

			const targetId = toID(parts[0]);
			const roleStr = parts[1];

			const auth = checkGuildAuth(guild, user, null, "");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const targetMember = guild.members.find(m => m.id === targetId);
			if (!targetMember) {
				throw new Chat.ErrorMessage(`User '${parts[0]}' is not a member of '${guild.name}'.`);
			}

			if (!VALID_ROLES.includes(roleStr)) {
				throw new Chat.ErrorMessage(`Invalid role '${roleStr}'. Valid roles: ${VALID_ROLES.join(', ')}`);
			}

			if (roleStr === 'Master') {
				throw new Chat.ErrorMessage("You cannot promote a user to Master. Use /guild transfer instead.");
			}

			if (targetMember.role === roleStr) {
				throw new Chat.ErrorMessage(`User '${parts[0]}' is already a ${roleStr}.`);
			}

			const userRoleRank = userMember ? ROLE_HIERARCHY[userMember.role] : 99;
			const targetRoleRank = ROLE_HIERARCHY[targetMember.role];
			const newRoleRank = ROLE_HIERARCHY[roleStr];

			if (newRoleRank <= targetRoleRank) {
				throw new Chat.ErrorMessage(`Role '${roleStr}' is not a promotion from '${targetMember.role}'. Use /guild demote instead.`);
			}

			if (!user.can('bypassall')) {
				if (userRoleRank <= targetRoleRank) throw new Chat.ErrorMessage("You can only promote users with a lower rank than yours.");
				if (userRoleRank <= newRoleRank) throw new Chat.ErrorMessage("You cannot promote users to a rank equal to or higher than yours.");
			}

			updateRoomAuth(guild, targetMember.id, roleStr);
			await GuildRepository.updateMemberRole(guild.id, targetMember.id, roleStr);

			this.sendReply(`You promoted '${targetMember.username}' to ${roleStr} in '${guild.name}'.`);

			const targetUser = Users.get(targetMember.id);
			if (targetUser) {
				targetUser.popup(`|html|You have been promoted to <b>${roleStr}</b> in the guild <b>${guild.name}</b> by ${user.name}!`);
			}

			broadcastToGuild(guild, `${targetMember.username} has been promoted to ${roleStr}.`, 'green');
		},

		async demote(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const parts = rest.split(',').map(p => p.trim());
			if (parts.length !== 2) return this.parse('/help guild demote');

			const targetId = toID(parts[0]);
			const roleStr = parts[1];

			const auth = checkGuildAuth(guild, user, null, "");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const targetMember = guild.members.find(m => m.id === targetId);
			if (!targetMember) {
				throw new Chat.ErrorMessage(`User '${parts[0]}' is not a member of '${guild.name}'.`);
			}

			if (!VALID_ROLES.includes(roleStr)) {
				throw new Chat.ErrorMessage(`Invalid role '${roleStr}'. Valid roles: ${VALID_ROLES.join(', ')}`);
			}

			if (targetMember.role === roleStr) {
				throw new Chat.ErrorMessage(`User '${parts[0]}' is already a ${roleStr}.`);
			}

			const userRoleRank = userMember ? ROLE_HIERARCHY[userMember.role] : 99;
			const targetRoleRank = ROLE_HIERARCHY[targetMember.role];
			const newRoleRank = ROLE_HIERARCHY[roleStr];

			if (newRoleRank >= targetRoleRank) {
				throw new Chat.ErrorMessage(`Role '${roleStr}' is not a demotion from '${targetMember.role}'. Use /guild promote instead.`);
			}

			if (!user.can('bypassall')) {
				if (userRoleRank <= targetRoleRank) throw new Chat.ErrorMessage("You can only demote users with a lower rank than yours.");
			}

			if (targetMember.id === guild.ownerId) {
				throw new Chat.ErrorMessage("You cannot demote the guild owner.");
			}

			updateRoomAuth(guild, targetMember.id, roleStr);
			await GuildRepository.updateMemberRole(guild.id, targetMember.id, roleStr);

			this.sendReply(`You demoted '${targetMember.username}' to ${roleStr} in '${guild.name}'.`);

			const targetUser = Users.get(targetMember.id);
			if (targetUser) {
				targetUser.popup(`|html|You have been demoted to <b>${roleStr}</b> in the guild <b>${guild.name}</b> by ${user.name}.`);
			}

			broadcastToGuild(guild, `${targetMember.username} has been demoted to ${roleStr}.`, 'red');
		},

		async setdesc(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const desc = rest.trim();
			if (!desc) return this.parse('/help guild setdesc');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild description.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (guild.chatroom) {
				const chatroom = Rooms.get(guild.chatroom as RoomID);
				if (chatroom) {
					chatroom.settings.desc = desc;
					if (chatroom.saveSettings) chatroom.saveSettings();
				}
			}

			await GuildRepository.updateGuildSettings(guild.id, { description: desc });
			this.sendReply(`You updated the description of '${guild.name}'.`);
		},

		async visibility(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const visibilityStr = rest.trim();
			if (!visibilityStr) return this.parse('/help guild visibility');

			const validVisibilities = ['public', 'private'];
			if (!validVisibilities.includes(visibilityStr)) {
				throw new Chat.ErrorMessage("Visibility must be 'public' or 'private'.");
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild visibility.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (guild.visibility === visibilityStr) {
				throw new Chat.ErrorMessage(`Guild visibility is already '${visibilityStr}'.`);
			}

			if (guild.chatroom) {
				const chatroom = Rooms.get(guild.chatroom as RoomID);
				if (chatroom) {
					chatroom.settings.isPrivate = visibilityStr === 'private' ? 'hidden' : false;
					if (chatroom.saveSettings) chatroom.saveSettings();
				}
			}

			await GuildRepository.updateGuildSettings(guild.id, { visibility: visibilityStr as any });
			this.sendReply(`You updated the visibility of '${guild.name}' to '${visibilityStr}'.`);
		},

		async seticon(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const url = rest.trim();
			if (!url) return this.parse('/help guild seticon');

			const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
			const lowerUrl = url.toLowerCase();
			const isValid = validExtensions.some(ext => lowerUrl.endsWith(ext));
			if (!isValid) {
				throw new Chat.ErrorMessage(`The icon URL must end with an image extension (${validExtensions.join(', ')}).`);
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild icon.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			await GuildRepository.updateGuildSettings(guild.id, { icon: url, hasSetIcon: true });
			this.sendReply(`You have successfully updated the icon for '${guild.name}'.`);
		},

		async setbg(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const url = rest.trim();
			if (!url) return this.parse('/help guild setbg');

			const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
			const lowerUrl = url.toLowerCase();
			const isValid = validExtensions.some(ext => lowerUrl.endsWith(ext));
			if (!isValid) {
				throw new Chat.ErrorMessage(`The background URL must end with an image extension (${validExtensions.join(', ')}).`);
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild background.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			await GuildRepository.updateGuildSettings(guild.id, { background: url, hasSetBackground: true });
			this.sendReply(`You have successfully updated the background for '${guild.name}'.`);
		},

		async setpolicy(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const policy = rest.trim().toLowerCase();
			if (!['open', 'invite-only'].includes(policy)) return this.parse('/help guild setpolicy');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the join policy.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (guild.joinPolicy === policy) {
				throw new Chat.ErrorMessage(`Guild join policy is already '${policy}'.`);
			}

			await GuildRepository.updateGuildSettings(guild.id, { joinPolicy: policy as any });
			this.sendReply(`You updated the join policy of '${guild.name}' to '${policy}'.`);
		},

		async invite(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild invite');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "invite users.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (guild.members.some(m => m.id === targetId)) {
				throw new Chat.ErrorMessage(`User '${rest}' is already a member of '${guild.name}'.`);
			}

			if (guild.banned.includes(targetId)) {
				throw new Chat.ErrorMessage(`User '${rest}' is banned from '${guild.name}' and cannot be invited.`);
			}

			const existingGuild = await GuildRepository.getGuildByMemberId(targetId);
			if (existingGuild) {
				throw new Chat.ErrorMessage(`User '${rest}' is already in a guild.`);
			}

			const pendingIndex = guild.invited.findIndex(i => i.userId === targetId && i.status === 'pending');
			if (pendingIndex !== -1) {
				const pending = guild.invited[pendingIndex];
				if (pending.expiresAt > new Date()) {
					throw new Chat.ErrorMessage(`User '${rest}' already has a pending invite to '${guild.name}'.`);
				}
				await GuildRepository.removeInvite(guild.id, targetId);
			}

			const targetUser = Users.get(targetId);
			const targetName = targetUser ? targetUser.name : rest.trim();

			const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

			await GuildRepository.createInvite(guild.id, {
				userId: targetId, invitedAt: new Date(), expiresAt, invitedBy: user.id, status: 'pending',
			});
			this.sendReply(`You have invited '${targetName}' to join '${guild.name}'.`);

			if (targetUser) {
				targetUser.send(`|pm|~|~|/uhtml guildinvite-${guild.id},You have been invited to join the guild <b>${guild.name}</b> by ${user.name}! <br /><button name="send" value="/guild join ${guild.id}">Click here to join</button> or <button name="send" value="/guild reject ${guild.id}">Reject</button>`);
			}
		},

		async revokeinvite(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild revokeinvite');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "revoke invites.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const inviteIndex = guild.invited.findIndex(i => i.userId === targetId && i.status === 'pending');
			if (inviteIndex === -1) {
				throw new Chat.ErrorMessage(`User '${rest}' does not have a pending invite to '${guild.name}'.`);
			}

			await GuildRepository.updateInviteStatus(guild.id, targetId, 'revoked');
			this.sendReply(`You have revoked the invite for '${rest}' to join '${guild.name}'.`);
			
			const targetUser = Users.get(targetId);
			if (targetUser) {
				targetUser.send(`|pm|~|~|/uhtmlchange guildinvite-${guild.id},The invite to join <b>${guild.name}</b> was revoked.`);
			}
		},

		async reject(target, room, user) {
			const guildId = toID(target);
			if (!guildId) return this.parse('/help guild reject');

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) throw new Chat.ErrorMessage(`Guild '${guildId}' not found.`);

			const inviteIndex = guild.invited.findIndex(i => i.userId === user.id && i.status === 'pending');
			if (inviteIndex === -1) {
				throw new Chat.ErrorMessage(`You do not have a pending invite to '${guild.name}'.`);
			}

			await GuildRepository.updateInviteStatus(guild.id, user.id, 'rejected');
			user.send(`|pm|~|~|/uhtmlchange guildinvite-${guild.id},You have rejected the invite to join <b>${guild.name}</b>.`);
		},

		async transfer(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild transfer');

			if (guild.ownerId !== user.id && !user.can('bypassall')) {
				throw new Chat.ErrorMessage("Only the guild owner can transfer ownership.");
			}

			if (guild.ownerId === targetId) {
				throw new Chat.ErrorMessage("You cannot transfer ownership to the current owner.");
			}

			const newOwnerMember = guild.members.find(m => m.id === targetId);
			if (!newOwnerMember) {
				throw new Chat.ErrorMessage(`User '${rest}' is not a member of '${guild.name}'.`);
			}

			const oldOwnerMember = guild.members.find(m => m.id === guild.ownerId);
			const oldOwnerId = guild.ownerId;

			updateRoomAuth(guild, newOwnerMember.id, 'Master');
			if (oldOwnerMember) updateRoomAuth(guild, oldOwnerMember.id, 'Rookie');

			await GuildRepository.updateMemberRole(guild.id, newOwnerMember.id, 'Master');
			if (oldOwnerMember) await GuildRepository.updateMemberRole(guild.id, oldOwnerMember.id, 'Rookie');
			await GuildRepository.updateGuildSettings(guild.id, { ownerId: newOwnerMember.id });
			this.sendReply(`You have successfully transferred ownership of '${guild.name}' to '${newOwnerMember.username}'.`);

			const newOwnerUser = Users.get(newOwnerMember.id);
			if (newOwnerUser) {
				newOwnerUser.popup(`|html|You have been granted ownership of the guild <b>${guild.name}</b> by ${user.name}!`);
			}

			const oldOwnerUser = Users.get(oldOwnerId);
			if (oldOwnerUser && oldOwnerUser.id !== user.id) {
				oldOwnerUser.popup(`|html|Ownership of your guild <b>${guild.name}</b> has been transferred to ${newOwnerMember.username} by ${user.name}.`);
			} else if (oldOwnerUser && oldOwnerUser.id === user.id) {
				oldOwnerUser.popup(`|html|You have successfully transferred ownership of your guild <b>${guild.name}</b> to ${newOwnerMember.username}.`);
			}

			broadcastToGuild(guild, `Guild ownership has been transferred to ${newOwnerMember.username}.`, 'green');
		},

		async memberlimit(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Access denied. Only global administrators can change the global member limit.");
			const limit = parseInt(target);
			if (isNaN(limit) || limit <= 0) throw new Chat.ErrorMessage("Usage: /guild memberlimit [number]");

			await setGlobalMemberLimit(limit);
			this.sendReply(`You have successfully updated the global member limit to ${limit} for all guilds.`);

			const allChatrooms = await GuildRepository.getAllChatrooms();
			for (const chatroom of allChatrooms) {
				broadcastToGuild(chatroom, `An administrator has updated the guild member limit to ${limit}!`, 'green');
			}
		},

		async give(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Only admins can give points.");
			const parts = target.split(',');
			if (parts.length !== 2) return this.parse('/help guild give');

			const guildId = toID(parts[0]);
			const amount = parseInt(parts[1].trim());
			if (isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Amount must be a positive number.");

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) throw new Chat.ErrorMessage(`Guild '${parts[0]}' not found.`);

			await GuildRepository.addGuildPoints(guild.id, amount);
			this.sendReply(`Gave ${amount} points to guild '${guild.name}'.`);

			const owner = Users.get(guild.ownerId);
			if (owner) {
				owner.popup(`|html|An administrator has awarded your guild <b>${guild.name}</b> with <b>${amount} points</b>!`);
			}
		},

		async take(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Only admins can take points.");
			const parts = target.split(',');
			if (parts.length !== 2) return this.parse('/help guild take');

			const guildId = toID(parts[0]);
			const amount = parseInt(parts[1].trim());
			if (isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Amount must be a positive number.");

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) throw new Chat.ErrorMessage(`Guild '${parts[0]}' not found.`);

			await GuildRepository.addGuildPoints(guild.id, -amount);
			this.sendReply(`Took ${amount} points from guild '${guild.name}'.`);

			const owner = Users.get(guild.ownerId);
			if (owner) {
				owner.popup(`|html|An administrator has deducted <b>${amount} points</b> from your guild <b>${guild.name}</b>.`);
			}
		},

		async kick(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild kick');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "kick users.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (targetId === guild.ownerId) {
				throw new Chat.ErrorMessage("You cannot kick the guild owner.");
			}

			const targetIndex = guild.members.findIndex(m => m.id === targetId);
			if (targetIndex === -1) {
				throw new Chat.ErrorMessage(`User '${rest}' is not a member of '${guild.name}'.`);
			}

			const targetMember = guild.members[targetIndex];
			if (userMember && !user.can('bypassall')) {
				if (ROLE_HIERARCHY[userMember.role] <= ROLE_HIERARCHY[targetMember.role]) {
					throw new Chat.ErrorMessage("You can only kick users with a lower rank than yours.");
				}
			}

			updateRoomAuth(guild, targetId, null);
			await GuildRepository.removeMember(guild.id, targetId);
			await setGuildCooldown(targetId);
			this.sendReply(`You have kicked '${targetMember.username}' from '${guild.name}'.`);

			const targetUser = Users.get(targetId);
			if (targetUser) {
				targetUser.popup(`|html|You have been kicked from the guild <b>${guild.name}</b> by ${user.name}.`);
			}

			broadcastToGuild(guild, `${targetMember.username} was kicked from the guild by ${user.name}.`, 'red');
		},

		async ban(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild ban');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "ban users.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			if (targetId === guild.ownerId) {
				throw new Chat.ErrorMessage("You cannot ban the guild owner.");
			}

			if (guild.banned.includes(targetId)) {
				throw new Chat.ErrorMessage(`User '${rest}' is already banned from '${guild.name}'.`);
			}

			let targetName = rest.trim();

			const targetIndex = guild.members.findIndex(m => m.id === targetId);
			if (targetIndex !== -1) {
				const targetMember = guild.members[targetIndex];
				targetName = targetMember.username;

				if (userMember && !user.can('bypassall')) {
					if (ROLE_HIERARCHY[userMember.role] <= ROLE_HIERARCHY[targetMember.role]) {
						throw new Chat.ErrorMessage("You can only ban users with a lower rank than yours.");
					}
				}

				updateRoomAuth(guild, targetId, null);
				await setGuildCooldown(targetId);
				await GuildRepository.removeMember(guild.id, targetId);
			}

			await GuildRepository.banUser(guild.id, targetId);
			this.sendReply(`You have banned '${targetName}' from '${guild.name}'.`);

			const targetUser = Users.get(targetId);
			if (targetUser) {
				targetUser.popup(`|html|You have been banned from the guild <b>${guild.name}</b> by ${user.name}.`);
			}

			broadcastToGuild(guild, `${targetName} was banned from the guild by ${user.name}.`, 'red');
		},

		async unban(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild unban');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "unban users.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const banIndex = guild.banned.indexOf(targetId);
			if (banIndex === -1) {
				throw new Chat.ErrorMessage(`User '${rest}' is not banned from '${guild.name}'.`);
			}

			await GuildRepository.unbanUser(guild.id, targetId);
			this.sendReply(`You have unbanned '${rest}' from '${guild.name}'.`);

			const targetUser = Users.get(targetId);
			if (targetUser) {
				targetUser.popup(`|html|You have been unbanned from the guild <b>${guild.name}</b> by ${user.name}.`);
			}
		},

		async members(target, room, user) {
			if (!this.runBroadcast()) return;
			let guild: Guild | undefined;
			const targetId = toID(target);
			if (targetId) {
				guild = await GuildRepository.getGuildById(targetId);
				if (!guild) throw new Chat.ErrorMessage(`Guild '${target}' not found.`);

				const userMember = guild.members.find(m => m.id === user.id);
				if (!userMember && !user.can('bypassall') && guild.visibility === 'private') {
					throw new Chat.ErrorMessage(`Guild '${guild.name}' is private. You cannot view its members.`);
				}
			} else {
				guild = await GuildRepository.getGuildByMemberId(user.id);
				if (!guild) return this.parse('/help guild members');
			}

			const sortedMembers = [...guild.members].sort((a, b) => {
				const roleDiff = ROLE_HIERARCHY[b.role] - ROLE_HIERARCHY[a.role];
				if (roleDiff !== 0) return roleDiff;
				return b.points - a.points;
			});

			this.sendReplyBox(
				<div class="pad" style={{ maxHeight: '350px', overflowY: 'auto' }}>
					<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>
						{guild.name} Roster ({guild.memberCount} / {guild.memberLimit})
					</div>
					<hr />
					<table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', marginTop: '15px' }}>
						<tr>
							<th style={{ padding: '4px' }}>Username</th>
							<th style={{ padding: '4px' }}>Role</th>
							<th style={{ padding: '4px' }}>Joined Date</th>
							<th style={{ padding: '4px' }}>Points</th>
						</tr>
						{sortedMembers.map(m => {
							const joinedStr = new Date(m.joinedAt).toISOString().split('T')[0];
							return (
								<tr style={{ borderTop: '1px solid #ccc' }}>
									<td style={{ padding: '4px' }}><b>{m.username}</b></td>
									<td style={{ padding: '4px' }}>{m.role}</td>
									<td style={{ padding: '4px' }}>{joinedStr}</td>
									<td style={{ padding: '4px' }}>{m.points}</td>
								</tr>
							);
						})}
					</table>
				</div>
			);
		},

		async info(target, room, user) {
			if (!this.runBroadcast()) return;
			let guild: Guild | undefined;
			const targetId = toID(target);
			if (targetId) {
				guild = await GuildRepository.getGuildById(targetId);
				if (!guild) throw new Chat.ErrorMessage(`Guild '${target}' not found.`);

				const userMember = guild.members.find(m => m.id === user.id);
				if (!userMember && !user.can('bypassall') && guild.visibility === 'private') {
					throw new Chat.ErrorMessage(`Guild '${guild.name}' is private. You cannot view its info.`);
				}
			} else {
				guild = await GuildRepository.getGuildByMemberId(user.id);
				if (!guild) return this.parse('/help guild info');
			}

			const owner = guild.members.find(m => m.id === guild.ownerId);
			const ownerName = owner ? owner.username : guild.ownerId;
			const createdStr = new Date(guild.createdAt).toISOString().split('T')[0];

			const bgUrl = guild.background || 'https://wallpapercave.com/wp/wp8695829.png';
			const bgStyle = {
				background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${bgUrl}') center/cover no-repeat`,
				padding: '8px',
				borderRadius: '4px',
				color: 'white',
				textShadow: '1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black'
			};

			this.sendReplyBox(
				<div style={bgStyle}>
					<center>
						<b><big><big>{guild.name}</big></big></b><br />
						<span style={{ fontSize: '10pt', color: 'white' }}>{guild.description || 'No description set.'}</span>
					</center>
					<hr style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }} />
					<table cellPadding={2} cellSpacing={0} border={0} width="100%">
						<tr>
							{guild.icon ? (
								<>
									<td width="90" valign="top"><img src={guild.icon} width={80} height={80} /></td>
									<td width="8"></td>
								</>
							) : null}
							<td valign="top" style={{ color: 'white' }}>
								<b>Master:</b> {ownerName}<br />
								<b>Members:</b> {guild.memberCount} / {guild.memberLimit}<br />
								<b>Points:</b> {guild.points}<br />
								<b>Policy:</b> {guild.joinPolicy === 'open' ? 'Open' : 'Invite-Only'}<br />
								<b>Founded:</b> {createdStr}
							</td>
						</tr>
					</table>
				</div>
			);
		},

		async announce(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			if (!rest) return this.parse('/help guild announce');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion'], "Only the Master or Champions can send guild announcements.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			let sentCount = 0;
			const announceText = `|html|<div style="font-size: 11pt;"><b>[${guild.name} Announcement]</b><br />By ${user.name}<hr />${escapeHTML(rest)}</div>`;

			for (const member of guild.members) {
				const targetUser = Users.get(member.id);
				if (targetUser?.connected) {
					targetUser.popup(announceText);
					sentCount++;
				}
			}

			this.sendReply(`Announcement successfully sent to ${sentCount} online members.`);
		},

		async activity(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "Only Elites and above can view the activity log.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const sortedMembers = [...guild.members].sort((a, b) => getLastSeen(b.id) - getLastSeen(a.id));

			this.sendReplyBox(
				<div class="pad" style={{ maxHeight: '350px', overflowY: 'auto' }}>
					<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>
						{guild.name} - Activity Log
					</div>
					<hr />
					<table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
						<tr>
							<th style={{ padding: '4px' }}>Username</th>
							<th style={{ padding: '4px' }}>Role</th>
							<th style={{ padding: '4px' }}>Last Active</th>
						</tr>
						{sortedMembers.map(m => {
							const ts = getLastSeen(m.id);
							let dateStr = '';
							let daysAgo = '';

							if (Users.get(m.id)?.connected) {
								dateStr = 'Online';
								daysAgo = 'now';
							} else if (!ts) {
								dateStr = 'Never';
								daysAgo = '—';
							} else {
								const dateObj = new Date(ts);
								dateStr = dateObj.toISOString().split('T')[0];
								const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
								daysAgo = days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
							}

							return (
								<tr style={{ borderTop: '1px solid #ccc' }}>
									<td style={{ padding: '4px' }}><b>{m.username}</b></td>
									<td style={{ padding: '4px' }}>{m.role}</td>
									<td style={{ padding: '4px' }}>{dateStr} <i>({daysAgo})</i></td>
								</tr>
							);
						})}
					</table>
				</div>
			);
		},

		async purge(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) throw new Chat.ErrorMessage(error);
			if (!guild) return;

			const days = parseInt(rest);
			if (isNaN(days) || days <= 0) return this.parse('/help guild purge');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion'], "Only the Master or Champions can purge inactive members.");
			if (auth.error) throw new Chat.ErrorMessage(auth.error);
			const userMember = auth.userMember;

			const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
			const toPurge = [];

			for (const m of guild.members) {
				if (['Master', 'Champion', 'Elite'].includes(m.role)) continue;
				if (m.id === user.id) continue;

				const lastSeen = getLastSeen(m.id);
				// lastSeen === 0 means never recorded — treat as inactive from epoch
				if (lastSeen < cutoffDate) {
					toPurge.push(m);
				}
			}

			if (toPurge.length === 0) {
				return this.sendReply(`No members found who have been inactive for ${days} days or more (Elites and above are exempt).`);
			}

			const userIdsToPurge = [];
			for (const m of toPurge) {
				const index = guild.members.findIndex(member => member.id === m.id);
				if (index !== -1) {
					updateRoomAuth(guild, m.id, null);
					userIdsToPurge.push(m.id);

					const targetUser = Users.get(m.id);
					if (targetUser) {
						targetUser.popup(`|html|You have been purged from the guild <b>${guild.name}</b> due to inactivity.`);
					}
				}
			}

			if (userIdsToPurge.length > 0) {
				await setGuildCooldowns(userIdsToPurge);
				await GuildRepository.removeMembers(guild.id, userIdsToPurge);
			}

			this.sendReply(`Successfully purged ${toPurge.length} inactive members from '${guild.name}'.`);
		},

		async ladder(target, room, user) {
			if (!this.runBroadcast()) return;
			const sortedGuilds = await GuildRepository.getTopGuilds(50);
			if (sortedGuilds.length === 0) throw new Chat.ErrorMessage("There are currently no guilds registered.");

			this.sendReplyBox(
				<div class="pad" style={{ maxHeight: '350px', overflowY: 'auto' }}>
					<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>
						Global Guild Leaderboard
					</div>
					<hr />
					<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
						<tr>
							<th style={{ padding: '4px' }}>Rank</th>
							<th style={{ padding: '4px' }}>Guild Name</th>
							<th style={{ padding: '4px' }}>Master</th>
							<th style={{ padding: '4px' }}>Members</th>
							<th style={{ padding: '4px' }}>Points</th>
						</tr>
						{sortedGuilds.map((g, idx) => {
							const rank = idx + 1;
							const ownerId = (g as any).ownerId || (g as any).owner_id;
							const ownerName = (g as any).ownerName || ownerId;
							
							const memberCount = (g as any).memberCount || 0;
							const memberLimit = (g as any).member_limit || 0;

							return (
								<tr style={{ borderTop: '1px solid #ccc' }}>
									<td style={{ padding: '4px' }}><b>#{rank}</b></td>
									<td style={{ padding: '4px' }}><b>{g.name}</b></td>
									<td style={{ padding: '4px' }}>{ownerName}</td>
									<td style={{ padding: '4px' }}>{memberCount} / {memberLimit}</td>
									<td style={{ padding: '4px' }}><b>{g.points}</b></td>
								</tr>
							);
						})}
					</table>
				</div>
			);
		},

		top(target, room, user) {
			return this.parse('/guild ladder');
		},

		async topmembers(target, room, user) {
			if (!this.runBroadcast()) return;
			const sortedMembers = await GuildRepository.getTopMembers(50);
			if (sortedMembers.length === 0) throw new Chat.ErrorMessage("There are currently no guild members.");

			this.sendReplyBox(
				<div class="pad" style={{ maxHeight: '350px', overflowY: 'auto' }}>
					<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>
						Top Guild Members
					</div>
					<hr />
					<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
						<tr>
							<th style={{ padding: '4px' }}>Rank</th>
							<th style={{ padding: '4px' }}>Username</th>
							<th style={{ padding: '4px' }}>Guild</th>
							<th style={{ padding: '4px' }}>Total Points</th>
						</tr>
						{sortedMembers.map((m, idx) => {
							const rank = idx + 1;
							return (
								<tr style={{ borderTop: '1px solid #ccc' }}>
									<td style={{ padding: '4px' }}><b>#{rank}</b></td>
									<td style={{ padding: '4px' }}><b>{m.username}</b></td>
									<td style={{ padding: '4px' }}>{m.guildName}</td>
									<td style={{ padding: '4px' }}><b>{m.totalPoints}</b></td>
								</tr>
							);
						})}
					</table>
				</div>
			);
		},

		async endseason(target, room, user) {
			if (!user.can('bypassall')) throw new Chat.ErrorMessage("Only global administrators can manually end the guild season.");

			await endGuildSeason();
			this.sendReply(`You have successfully ended the current Guild Season. All points have been reset, and rewards have been distributed.`);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;

			const commands = [
				{ cmd: '/guild create', usage: '[name], [owner]', desc: 'Creates a new guild. Optionally assign an owner.', perm: 'Admin' },
				{ cmd: '/guild delete', usage: '[name]', desc: 'Deletes a guild.', perm: 'Admin' },
				{ cmd: '/guild join', usage: '[name]', desc: 'Joins an open guild.', perm: 'All' },
				{ cmd: '/guild leave', usage: '', desc: 'Leaves your guild.', perm: 'Member' },
				{ cmd: '/guild promote', usage: '[user], [role]', desc: 'Promotes a user in your guild.', perm: 'Master/Champion' },
				{ cmd: '/guild demote', usage: '[user], [role]', desc: 'Demotes a user in your guild.', perm: 'Master/Champion' },
				{ cmd: '/guild setdesc', usage: '[description]', desc: 'Sets the description of your guild and its chatroom.', perm: 'Master/Champion' },
				{ cmd: '/guild seticon', usage: '[url]', desc: 'Sets the guild\'s icon.', perm: 'Master/Champion' },
				{ cmd: '/guild setbg', usage: '[url]', desc: 'Sets the guild\'s background.', perm: 'Master/Champion' },
				{ cmd: '/guild visibility', usage: '[public/private]', desc: 'Sets the visibility of your guild and its chatroom.', perm: 'Master/Champion' },
				{ cmd: '/guild setpolicy', usage: '[open/invite-only]', desc: 'Sets the join policy.', perm: 'Master/Champion' },
				{ cmd: '/guild invite', usage: '[user]', desc: 'Invites a user to the guild.', perm: 'Master/Champion/Elite' },
				{ cmd: '/guild revokeinvite', usage: '[user]', desc: 'Revokes a pending invite.', perm: 'Master/Champion/Elite' },
				{ cmd: '/guild reject', usage: '[guild]', desc: 'Rejects a guild invite.', perm: 'All' },
				{ cmd: '/guild transfer', usage: '[user]', desc: 'Transfers guild ownership to another member.', perm: 'Master' },
				{ cmd: '/guild kick', usage: '[user]', desc: 'Kicks a user from the guild.', perm: 'Master/Champion' },
				{ cmd: '/guild ban', usage: '[user]', desc: 'Bans a user from the guild.', perm: 'Master/Champion' },
				{ cmd: '/guild unban', usage: '[user]', desc: 'Unbans a user from the guild.', perm: 'Master/Champion' },
				{ cmd: '/guild members', usage: '[guild (opt)]', desc: 'Views the roster of your (or a specific) guild.', perm: 'All' },
				{ cmd: '/guild info', usage: '[guild (opt)]', desc: 'Views the profile of your (or a specific) guild.', perm: 'All' },
				{ cmd: '/guild announce', usage: '[message]', desc: 'Pushes a popup announcement to all online guild members.', perm: 'Master/Champion' },
				{ cmd: '/guild activity', usage: '', desc: 'Views member activity sorted by last login.', perm: 'Master/Champion/Elite' },
				{ cmd: '/guild purge', usage: '[days]', desc: 'Kicks members (below Elite) who have been inactive for [days].', perm: 'Master/Champion' },
				{ cmd: '/guild ladder', usage: '', desc: 'Displays the Global Guild Leaderboard sorted by Points.', perm: 'All' },
				{ cmd: '/guild topmembers', usage: '', desc: 'Displays the top 50 players on the server sorted by Total Points.', perm: 'All' },
				{ cmd: '/guild memberlimit', usage: '[number]', desc: 'Sets the global member limit for all guilds.', perm: 'Admin' },
				{ cmd: '/guild give', usage: '[guild], [amount]', desc: 'Gives points directly to a guild.', perm: 'Admin' },
				{ cmd: '/guild take', usage: '[guild], [amount]', desc: 'Takes points directly from a guild.', perm: 'Admin' },
				{ cmd: '/guild endseason', usage: '', desc: 'Manually ends the current Guild Season and resets all points.', perm: 'Admin' },
			];

			this.sendReplyBox(
				<div class="pad" style={{ maxHeight: '350px', overflowY: 'auto' }}>
					<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>
						Guild Commands Help Menu
					</div>
					<hr />
					<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
						<tr>
							<th style={{ padding: '4px' }}>Command</th>
							<th style={{ padding: '4px' }}>Usage</th>
							<th style={{ padding: '4px' }}>Description</th>
							<th style={{ padding: '4px' }}>Permission</th>
						</tr>
						{commands.map(c => (
							<tr style={{ borderTop: '1px solid #ccc' }}>
								<td style={{ padding: '4px' }}><b>{c.cmd}</b></td>
								<td style={{ padding: '4px' }}>{c.usage}</td>
								<td style={{ padding: '4px', textAlign: 'left' }}>{c.desc}</td>
								<td style={{ padding: '4px' }}>{c.perm}</td>
							</tr>
						))}
					</table>
					<div style={{ marginTop: '10px', fontSize: '10pt', color: '#666', textAlign: 'center' }}>
						<i>Note: Admins can optionally prefix management commands with the guild name: /guild promote [guild], [user], [role]</i>
					</div>
				</div>
			);
		},
	},

	guildhelp: [
		`|html|<div class="infobox" style="text-align: center; padding: 10px;">Please use <b><button name="send" value="/guild help">/guild help</button></b> to view the fully formatted guild commands menu!</div>`
	],
};
