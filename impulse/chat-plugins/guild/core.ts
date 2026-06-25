import { wrapCommands } from '../../impulse-utils';
import { Utils } from '../../../lib';
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
		const room = Rooms.get(chatroom as RoomID);
		if (room) {
			room.add(`|html|<div class="broadcast-blue"><b>Guild Season ${seasonNumber} has officially ended!</b><br />Check out the global leaderboards to see the winners! Points have been reset for the new season.</div>`).update();
		}
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

export const commands: Chat.ChatCommands = wrapCommands({
	guild: {
		help(target, room, user) {
			return this.parse('/help guild');
		},

		async create(target, room, user) {
			if (!user.can('bypassall')) return this.errorReply("Access denied. Only global administrators can create a guild.");

			const parts = target.split(',').map(p => p.trim());
			const name = parts[0];
			if (!name) return this.parse('/help guild create');

			const ownerId = parts.length > 1 ? toID(parts[1]) : user.id;
			const ownerName = parts.length > 1 ? parts[1] : user.name;

			const id = toID(name);
			if (!id) return this.errorReply("Guild name must contain alphanumeric characters.");
			if (id.length > 20) return this.errorReply("Guild name must be 20 characters or less.");

			if (await GuildRepository.guildExists(id)) return this.errorReply(`Guild '${name}' already exists.`);

			const existingGuild = await GuildRepository.getGuildByMemberId(ownerId);
			if (existingGuild) {
				return this.errorReply(`User '${ownerName}' is already in a guild.`);
			}

			const roomId = `guild${id}` as RoomID;
			if (Rooms.get(roomId)) return this.errorReply("A room for this guild already exists.");

			const titleName = `Guild: ${name}`;
			if (!Rooms.global.addChatRoom(titleName)) {
				return this.errorReply("Failed to create the persistent chatroom for this guild.");
			}

			const guildRoom = Rooms.get(roomId);
			if (!guildRoom) return this.errorReply("Failed to retrieve the created chatroom.");

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
			if (!user.can('bypassall')) return this.errorReply("Access denied. Only global administrators can delete a guild.");

			const guildId = toID(target);
			if (!guildId) return this.parse('/help guild delete');

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) return this.errorReply(`Guild '${target}' not found.`);

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
			if (!guild) return this.errorReply(`Guild '${id}' not found.`);

			const cooldown = await getGuildCooldown(user.id);
			if (cooldown && !user.can('bypassall')) {
				return this.errorReply(`You must wait ${formatCooldown(cooldown)} before joining another guild.`);
			}

			const userGuild = await GuildRepository.getGuildByMemberId(user.id);
			if (userGuild) {
				return this.errorReply(`You are already in a guild. You must leave it before joining another.`);
			}

			if (guild.memberCount >= guild.memberLimit) {
				return this.errorReply(`Guild '${guild.name}' has reached its member limit of ${guild.memberLimit}.`);
			}

			if (guild.banned.includes(user.id)) {
				return this.errorReply(`You are banned from joining '${guild.name}'.`);
			}

			if (guild.joinPolicy === 'invite-only') {
				const inviteIndex = guild.invited.findIndex(i => i.userId === user.id && i.status === 'pending');
				if (inviteIndex === -1) {
					return this.errorReply(`Guild '${guild.name}' is invite-only, and you do not have a pending invite.`);
				}
				const invite = guild.invited[inviteIndex];
				if (invite.expiresAt < new Date()) {
					await GuildRepository.updateInviteStatus(guild.id, user.id, 'revoked');
					return this.errorReply(`Your invite to '${guild.name}' has expired.`);
				}
				await GuildRepository.updateInviteStatus(guild.id, user.id, 'revoked');
			}

			await GuildRepository.addMember(guild.id, {
				id: user.id, username: user.name, role: 'Rookie', joinedAt: new Date(),
				points: 0, totalPoints: 0,
			});
			updateRoomAuth(guild, user.id, 'Rookie');
			this.sendReply(`You have successfully joined '${guild.name}'.`);
			user.joinRoom(guild.chatroom as RoomID);
		},

		async leave(target, room, user) {
			const { guild, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const memberIndex = guild.members.findIndex(m => m.id === user.id);
			if (memberIndex === -1) return this.errorReply(`You are not a member of '${guild.name}'.`);

			if (guild.ownerId === user.id) {
				return this.errorReply("You cannot leave a guild you own. Transfer ownership or delete the guild first.");
			}

			updateRoomAuth(guild, user.id, null);
			await GuildRepository.removeMember(guild.id, user.id);
			await setGuildCooldown(user.id);
			this.sendReply(`You have left '${guild.name}'. You must wait 12 hours before joining another guild.`);
		},

		async promote(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const parts = rest.split(',').map(p => p.trim());
			if (parts.length !== 2) return this.parse('/help guild promote');

			const targetId = toID(parts[0]);
			const roleStr = parts[1];

			const auth = checkGuildAuth(guild, user, null, "");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			const targetMember = guild.members.find(m => m.id === targetId);
			if (!targetMember) {
				return this.errorReply(`User '${parts[0]}' is not a member of '${guild.name}'.`);
			}

			if (!VALID_ROLES.includes(roleStr)) {
				return this.errorReply(`Invalid role '${roleStr}'. Valid roles: ${VALID_ROLES.join(', ')}`);
			}

			if (targetMember.role === roleStr) {
				return this.errorReply(`User '${parts[0]}' is already a ${roleStr}.`);
			}

			const userRoleRank = userMember ? ROLE_HIERARCHY[userMember.role] : 99;
			const targetRoleRank = ROLE_HIERARCHY[targetMember.role];
			const newRoleRank = ROLE_HIERARCHY[roleStr];

			if (newRoleRank <= targetRoleRank) {
				return this.errorReply(`Role '${roleStr}' is not a promotion from '${targetMember.role}'. Use /guild demote instead.`);
			}

			if (!user.can('bypassall')) {
				if (userRoleRank <= targetRoleRank) return this.errorReply("You can only promote users with a lower rank than yours.");
				if (userRoleRank <= newRoleRank) return this.errorReply("You cannot promote users to a rank equal to or higher than yours.");
			}

			updateRoomAuth(guild, targetMember.id, roleStr);
			await GuildRepository.updateMemberRole(guild.id, targetMember.id, roleStr);

			this.sendReply(`You promoted '${targetMember.username}' to ${roleStr} in '${guild.name}'.`);

			const targetUser = Users.get(targetMember.id);
			if (targetUser) {
				targetUser.popup(`|html|You have been promoted to <b>${roleStr}</b> in the guild <b>${guild.name}</b> by ${user.name}!`);
			}
		},

		async demote(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const parts = rest.split(',').map(p => p.trim());
			if (parts.length !== 2) return this.parse('/help guild demote');

			const targetId = toID(parts[0]);
			const roleStr = parts[1];

			const auth = checkGuildAuth(guild, user, null, "");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			const targetMember = guild.members.find(m => m.id === targetId);
			if (!targetMember) {
				return this.errorReply(`User '${parts[0]}' is not a member of '${guild.name}'.`);
			}

			if (!VALID_ROLES.includes(roleStr)) {
				return this.errorReply(`Invalid role '${roleStr}'. Valid roles: ${VALID_ROLES.join(', ')}`);
			}

			if (targetMember.role === roleStr) {
				return this.errorReply(`User '${parts[0]}' is already a ${roleStr}.`);
			}

			const userRoleRank = userMember ? ROLE_HIERARCHY[userMember.role] : 99;
			const targetRoleRank = ROLE_HIERARCHY[targetMember.role];
			const newRoleRank = ROLE_HIERARCHY[roleStr];

			if (newRoleRank >= targetRoleRank) {
				return this.errorReply(`Role '${roleStr}' is not a demotion from '${targetMember.role}'. Use /guild promote instead.`);
			}

			if (!user.can('bypassall')) {
				if (userRoleRank <= targetRoleRank) return this.errorReply("You can only demote users with a lower rank than yours.");
			}

			if (targetMember.id === guild.ownerId) {
				return this.errorReply("You cannot demote the guild owner.");
			}

			updateRoomAuth(guild, targetMember.id, roleStr);
			await GuildRepository.updateMemberRole(guild.id, targetMember.id, roleStr);

			this.sendReply(`You demoted '${targetMember.username}' to ${roleStr} in '${guild.name}'.`);

			const targetUser = Users.get(targetMember.id);
			if (targetUser) {
				targetUser.popup(`|html|You have been demoted to <b>${roleStr}</b> in the guild <b>${guild.name}</b> by ${user.name}.`);
			}
		},

		async setdesc(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const desc = rest.trim();
			if (!desc) return this.parse('/help guild setdesc');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild description.");
			if (auth.error) return this.errorReply(auth.error);
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
			if (error) return this.errorReply(error);
			if (!guild) return;

			const visibilityStr = rest.trim();
			if (!visibilityStr) return this.parse('/help guild visibility');

			const validVisibilities = ['public', 'private'];
			if (!validVisibilities.includes(visibilityStr)) {
				return this.errorReply("Visibility must be 'public' or 'private'.");
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild visibility.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			if (guild.visibility === visibilityStr) {
				return this.errorReply(`Guild visibility is already '${visibilityStr}'.`);
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
			if (error) return this.errorReply(error);
			if (!guild) return;

			const url = rest.trim();
			if (!url) return this.parse('/help guild seticon');

			const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
			const lowerUrl = url.toLowerCase();
			const isValid = validExtensions.some(ext => lowerUrl.endsWith(ext));
			if (!isValid) {
				return this.errorReply(`The icon URL must end with an image extension (${validExtensions.join(', ')}).`);
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild icon.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			await GuildRepository.updateGuildSettings(guild.id, { icon: url, hasSetIcon: true });
			this.sendReply(`You have successfully updated the icon for '${guild.name}'.`);
		},

		async setbg(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const url = rest.trim();
			if (!url) return this.parse('/help guild setbg');

			const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
			const lowerUrl = url.toLowerCase();
			const isValid = validExtensions.some(ext => lowerUrl.endsWith(ext));
			if (!isValid) {
				return this.errorReply(`The background URL must end with an image extension (${validExtensions.join(', ')}).`);
			}

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the guild background.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			await GuildRepository.updateGuildSettings(guild.id, { background: url, hasSetBackground: true });
			this.sendReply(`You have successfully updated the background for '${guild.name}'.`);
		},
		
		async setpolicy(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const policy = rest.trim().toLowerCase();
			if (!['open', 'invite-only'].includes(policy)) return this.parse('/help guild setpolicy');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "change the join policy.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			if (guild.joinPolicy === policy) {
				return this.errorReply(`Guild join policy is already '${policy}'.`);
			}

			await GuildRepository.updateGuildSettings(guild.id, { joinPolicy: policy as any });
			this.sendReply(`You updated the join policy of '${guild.name}' to '${policy}'.`);
		},

		async invite(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild invite');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "invite users.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			if (guild.members.some(m => m.id === targetId)) {
				return this.errorReply(`User '${rest}' is already a member of '${guild.name}'.`);
			}

			const existingGuild = await GuildRepository.getGuildByMemberId(targetId);
			if (existingGuild) {
				return this.errorReply(`User '${rest}' is already in a guild.`);
			}

			const pendingIndex = guild.invited.findIndex(i => i.userId === targetId && i.status === 'pending');
			if (pendingIndex !== -1) {
				const pending = guild.invited[pendingIndex];
				if (pending.expiresAt > new Date()) {
					return this.errorReply(`User '${rest}' already has a pending invite to '${guild.name}'.`);
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
				targetUser.send(`|pm|~|~|/html You have been invited to join the guild <b>${guild.name}</b> by ${user.name}! <br /><button name="send" value="/guild join ${guild.id}">Click here to join</button> or <button name="send" value="/guild reject ${guild.id}">Reject</button>`);
			}
		},

		async revokeinvite(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild revokeinvite');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "revoke invites.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			const inviteIndex = guild.invited.findIndex(i => i.userId === targetId && i.status === 'pending');
			if (inviteIndex === -1) {
				return this.errorReply(`User '${rest}' does not have a pending invite to '${guild.name}'.`);
			}

			await GuildRepository.updateInviteStatus(guild.id, targetId, 'revoked');
			this.sendReply(`You have revoked the invite for '${rest}' to join '${guild.name}'.`);
		},

		async reject(target, room, user) {
			const guildId = toID(target);
			if (!guildId) return this.parse('/help guild reject');

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) return this.errorReply(`Guild '${guildId}' not found.`);

			const inviteIndex = guild.invited.findIndex(i => i.userId === user.id && i.status === 'pending');
			if (inviteIndex === -1) {
				return this.errorReply(`You do not have a pending invite to '${guild.name}'.`);
			}

			await GuildRepository.updateInviteStatus(guild.id, user.id, 'rejected');
			this.sendReply(`You have rejected the invite to join '${guild.name}'.`);
		},

		async transfer(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild transfer');

			if (guild.ownerId !== user.id && !user.can('bypassall')) {
				return this.errorReply("Only the guild owner can transfer ownership.");
			}

			if (guild.ownerId === targetId) {
				return this.errorReply("You cannot transfer ownership to the current owner.");
			}

			const newOwnerMember = guild.members.find(m => m.id === targetId);
			if (!newOwnerMember) {
				return this.errorReply(`User '${rest}' is not a member of '${guild.name}'.`);
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
		},

		async memberlimit(target, room, user) {
			if (!user.can('bypassall')) return this.errorReply("Access denied. Only global administrators can change the global member limit.");
			const limit = parseInt(target);
			if (isNaN(limit) || limit <= 0) return this.errorReply("Usage: /guild memberlimit [number]");

			await setGlobalMemberLimit(limit);
			this.sendReply(`You have successfully updated the global member limit to ${limit} for all guilds.`);
			
			const allChatrooms = await GuildRepository.getAllChatrooms();
			for (const chatroom of allChatrooms) {
				const guildRoom = Rooms.get(chatroom as RoomID);
				if (guildRoom) {
					guildRoom.add(`|html|<div class="broadcast-green">An administrator has updated the guild member limit to ${limit}!</div>`).update();
				}
			}
		},

		async give(target, room, user) {
			if (!user.can('bypassall')) return this.errorReply("Only admins can give points.");
			const parts = target.split(',');
			if (parts.length !== 2) return this.parse('/help guild give');

			const guildId = toID(parts[0]);
			const amount = parseInt(parts[1].trim());
			if (isNaN(amount) || amount <= 0) return this.errorReply("Amount must be a positive number.");

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) return this.errorReply(`Guild '${parts[0]}' not found.`);

			await GuildRepository.addGuildPoints(guild.id, amount);
			this.sendReply(`Gave ${amount} points to guild '${guild.name}'.`);

			const owner = Users.get(guild.ownerId);
			if (owner) {
				owner.popup(`|html|An administrator has awarded your guild <b>${guild.name}</b> with <b>${amount} points</b>!`);
			}
		},

		async take(target, room, user) {
			if (!user.can('bypassall')) return this.errorReply("Only admins can take points.");
			const parts = target.split(',');
			if (parts.length !== 2) return this.parse('/help guild take');

			const guildId = toID(parts[0]);
			const amount = parseInt(parts[1].trim());
			if (isNaN(amount) || amount <= 0) return this.errorReply("Amount must be a positive number.");

			const guild = await GuildRepository.getGuildById(guildId);
			if (!guild) return this.errorReply(`Guild '${parts[0]}' not found.`);

			await GuildRepository.addGuildPoints(guild.id, -amount);
			this.sendReply(`Took ${amount} points from guild '${guild.name}'.`);

			const owner = Users.get(guild.ownerId);
			if (owner) {
				owner.popup(`|html|An administrator has deducted <b>${amount} points</b> from your guild <b>${guild.name}</b>.`);
			}
		},

		async kick(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild kick');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "kick users.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			if (targetId === guild.ownerId) {
				return this.errorReply("You cannot kick the guild owner.");
			}

			const targetIndex = guild.members.findIndex(m => m.id === targetId);
			if (targetIndex === -1) {
				return this.errorReply(`User '${rest}' is not a member of '${guild.name}'.`);
			}

			const targetMember = guild.members[targetIndex];
			if (userMember && !user.can('bypassall')) {
				if (ROLE_HIERARCHY[userMember.role] <= ROLE_HIERARCHY[targetMember.role]) {
					return this.errorReply("You can only kick users with a lower rank than yours.");
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
		},

		async ban(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild ban');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "ban users.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			if (targetId === guild.ownerId) {
				return this.errorReply("You cannot ban the guild owner.");
			}

			if (guild.banned.includes(targetId)) {
				return this.errorReply(`User '${rest}' is already banned from '${guild.name}'.`);
			}

			let targetName = rest.trim();

			const targetIndex = guild.members.findIndex(m => m.id === targetId);
			if (targetIndex !== -1) {
				const targetMember = guild.members[targetIndex];
				targetName = targetMember.username;

				if (userMember && !user.can('bypassall')) {
					if (ROLE_HIERARCHY[userMember.role] <= ROLE_HIERARCHY[targetMember.role]) {
						return this.errorReply("You can only ban users with a lower rank than yours.");
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
		},

		async unban(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const targetId = toID(rest);
			if (!targetId) return this.parse('/help guild unban');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "unban users.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			const banIndex = guild.banned.indexOf(targetId);
			if (banIndex === -1) {
				return this.errorReply(`User '${rest}' is not banned from '${guild.name}'.`);
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
				if (!guild) return this.errorReply(`Guild '${target}' not found.`);

				const userMember = guild.members.find(m => m.id === user.id);
				if (!userMember && !user.can('bypassall') && guild.visibility === 'private') {
					return this.errorReply(`Guild '${guild.name}' is private. You cannot view its members.`);
				}
			} else {
				guild = await GuildRepository.getGuildByMemberId(user.id);
				if (!guild) return this.parse('/help guild members');
			}

			let html = `<div class="pad" style="max-height: 400px; overflow-y: scroll;">`;
			html += `<div style="text-align: center; font-weight: bold; font-size: 14pt;">${guild.name} Roster (${guild.memberCount} / ${guild.memberLimit})</div><hr />`;

			const roles = ['Master', 'Champion', 'Elite', 'Veteran', 'Trainer', 'Rookie'];

			for (const role of roles) {
				const membersInRole = guild.members.filter(m => m.role === role);
				if (membersInRole.length === 0) continue;

				html += `<b>${role}s (${membersInRole.length})</b><br />`;
				html += `<ul style="margin-top: 0;">`;
				for (const m of membersInRole) {
					const joinedStr = new Date(m.joinedAt).toISOString().split('T')[0];
					html += `<li><b>${m.username}</b> <i>(Joined: ${joinedStr}, Points: ${m.points})</i></li>`;
				}
				html += `</ul>`;
			}

			html += `</div>`;

			this.sendReplyBox(html);
		},

		async info(target, room, user) {
			if (!this.runBroadcast()) return;
			let guild: Guild | undefined;
			const targetId = toID(target);
			if (targetId) {
				guild = await GuildRepository.getGuildById(targetId);
				if (!guild) return this.errorReply(`Guild '${target}' not found.`);

				const userMember = guild.members.find(m => m.id === user.id);
				if (!userMember && !user.can('bypassall') && guild.visibility === 'private') {
					return this.errorReply(`Guild '${guild.name}' is private. You cannot view its info.`);
				}
			} else {
				guild = await GuildRepository.getGuildByMemberId(user.id);
				if (!guild) return this.parse('/help guild info');
			}

			const owner = guild.members.find(m => m.id === guild.ownerId);
			const ownerName = owner ? owner.username : guild.ownerId;
			const createdStr = new Date(guild.createdAt).toISOString().split('T')[0];

			const iconCell = guild.icon ?
				`<td width="90" valign="top"><img src="${Utils.escapeHTML(guild.icon)}" width="80" height="80" /></td><td width="8"></td>` :
				'';

			const bgUrl = guild.background || 'https://wallpapercave.com/wp/wp8695829.png';
			const bgStyle = `background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${Utils.escapeHTML(bgUrl)}') center/cover no-repeat; padding: 8px; border-radius: 4px; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;`;

			const html =
				`<div style="${bgStyle}">` +
				`<center><b><big><big>${Utils.escapeHTML(guild.name)}</big></big></b><br />` +
				`<span style="font-size: 10pt; color: white;">${Utils.escapeHTML(guild.description || 'No description set.')}</span></center>` +
				`<hr style="border-color: rgba(255, 255, 255, 0.4);" />` +
				`<table cellpadding="2" cellspacing="0" border="0" width="100%"><tr>` +
				iconCell +
				`<td valign="top" style="color: white;">` +
				`<b>Master:</b> ${Utils.escapeHTML(ownerName)}<br />` +
				`<b>Members:</b> ${guild.memberCount} / ${guild.memberLimit}<br />` +
				`<b>Points:</b> ${guild.points}<br />` +
				`<b>Policy:</b> ${guild.joinPolicy === 'open' ? 'Open' : 'Invite-Only'}<br />` +
				`<b>Founded:</b> ${createdStr}` +
				`</td></tr></table>` +
				`</div>`;

			this.sendReplyBox(html);
		},

		async announce(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			if (!rest) return this.parse('/help guild announce');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion'], "Only the Master or Champions can send guild announcements.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			let sentCount = 0;
			const announceText = `|html|<div style="font-size: 11pt;"><b>[${guild.name} Announcement]</b><br />By ${user.name}<hr />${Utils.escapeHTML(rest)}</div>`;

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
			if (error) return this.errorReply(error);
			if (!guild) return;

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion', 'Elite'], "Only Elites and above can view the activity log.");
			if (auth.error) return this.errorReply(auth.error);
			const userMember = auth.userMember;

			const sortedMembers = [...guild.members].sort((a, b) => getLastSeen(b.id) - getLastSeen(a.id));

			let html = `<div class="pad" style="max-height: 400px; overflow-y: scroll;">`;
			html += `<h2>${guild.name} - Activity Log</h2><hr />`;
			html += `<table style="width: 100%; text-align: left; border-collapse: collapse;">`;
			html += `<tr><th>Username</th><th>Role</th><th>Last Active</th></tr>`;

			for (const m of sortedMembers) {
				const ts = getLastSeen(m.id);
				let dateStr: string;
				let daysAgo: string;

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

				html += `<tr><td><b>${m.username}</b></td><td>${m.role}</td><td>${dateStr} <i>(${daysAgo})</i></td></tr>`;
			}
			html += `</table></div>`;

			this.sendReplyBox(html);
		},

		async purge(target, room, user) {
			const { guild, rest, error } = await resolveGuildWithVariadic(user, target);
			if (error) return this.errorReply(error);
			if (!guild) return;

			const days = parseInt(rest);
			if (isNaN(days) || days <= 0) return this.parse('/help guild purge');

			const auth = checkGuildAuth(guild, user, ['Master', 'Champion'], "Only the Master or Champions can purge inactive members.");
			if (auth.error) return this.errorReply(auth.error);
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
			if (sortedGuilds.length === 0) return this.errorReply("There are currently no guilds registered.");

			let html = `<div class="pad" style="max-height: 400px; overflow-y: scroll;">`;
			html += `<div style="text-align: center; font-weight: bold; font-size: 14pt;">Global Guild Leaderboard</div><hr />`;
			html += `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;
			html += `<tr><th style="padding: 4px;">Rank</th><th style="padding: 4px;">Guild Name</th><th style="padding: 4px;">Master</th><th style="padding: 4px;">Members</th><th style="padding: 4px;">Points</th></tr>`;

			let rank = 1;
			for (const g of sortedGuilds) {
				const ownerId = (g as any).ownerId || (g as any).owner_id;
				const ownerName = ownerId; // Simplified since we don't eager load members anymore for ladder

				html += `<tr style="border-top: 1px solid #ccc;">`;
				html += `<td style="padding: 4px;"><b>#${rank}</b></td>`;
				html += `<td style="padding: 4px;"><b>${Utils.escapeHTML(g.name)}</b></td>`;
				html += `<td style="padding: 4px;">${Utils.escapeHTML(ownerName)}</td>`;
				html += `<td style="padding: 4px;">${g.memberCount} / ${g.memberLimit}</td>`;
				html += `<td style="padding: 4px;"><b>${g.points}</b></td>`;
				html += `</tr>`;
				rank++;
			}

			html += `</table></div>`;
			this.sendReplyBox(html);
		},

		top(target, room, user) {
			return this.parse('/guild ladder');
		},

		async topmembers(target, room, user) {
			if (!this.runBroadcast()) return;
			const sortedMembers = await GuildRepository.getTopMembers(50);
			if (sortedMembers.length === 0) return this.errorReply("There are currently no guild members.");

			let html = `<div class="pad" style="max-height: 400px; overflow-y: scroll;">`;
			html += `<div style="text-align: center; font-weight: bold; font-size: 14pt;">Top Guild Members</div><hr />`;
			html += `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;
			html += `<tr><th style="padding: 4px;">Rank</th><th style="padding: 4px;">Username</th><th style="padding: 4px;">Guild</th><th style="padding: 4px;">Total Points</th></tr>`;

			let rank = 1;
			for (const m of sortedMembers) {
				html += `<tr style="border-top: 1px solid #ccc;">`;
				html += `<td style="padding: 4px;"><b>#${rank}</b></td>`;
				html += `<td style="padding: 4px;"><b>${Utils.escapeHTML(m.username)}</b></td>`;
				html += `<td style="padding: 4px;">${Utils.escapeHTML(m.guildName)}</td>`;
				html += `<td style="padding: 4px;"><b>${m.totalPoints}</b></td>`;
				html += `</tr>`;
				rank++;
			}

			html += `</table></div>`;
			this.sendReplyBox(html);
		},

		async endseason(target, room, user) {
			if (!user.can('bypassall')) return this.errorReply("Only global administrators can manually end the guild season.");

			await endGuildSeason();
			this.sendReply(`You have successfully ended the current Guild Season. All points have been reset, and rewards have been distributed.`);
		},
	},

	guildhelp: [
		"/guild create [name], [owner] - (Admin) Creates a new guild. Optionally assign an owner.",
		"/guild delete [name] - (Admin) Deletes a guild.",
		"/guild join [name] - Joins an open guild.",
		"/guild leave - Leaves your guild.",
		"/guild promote [user], [role] - Promotes a user in your guild.",
		"/guild demote [user], [role] - Demotes a user in your guild.",
		"/guild setdesc [description] - Sets the description of your guild and its chatroom.",
		"/guild seticon [url] - Sets the guild's icon.",
		"/guild setbg [url] - Sets the guild's background.",
		"/guild visibility [public/private] - Sets the visibility of your guild and its chatroom.",
		"/guild setpolicy [open/invite-only] - Sets the join policy.",
		"/guild invite [user] - Invites a user to the guild.",
		"/guild revokeinvite [user] - Revokes a pending invite.",
		"/guild reject [guild] - Rejects a guild invite.",
		"/guild transfer [user] - Transfers guild ownership to another member.",
		"/guild kick [user] - Kicks a user from the guild.",
		"/guild ban [user] - Bans a user from the guild.",
		"/guild unban [user] - Unbans a user from the guild.",
		"/guild members - Views the roster of your guild.",
		"/guild members [guild] - Views the roster of a specific public guild.",
		"/guild info - Views the profile of your guild.",
		"/guild info [guild] - Views the profile of a specific public guild.",
		"/guild announce [message] - Pushes a popup announcement to all online guild members.",
		"/guild activity - Views member activity sorted by last login.",
		"/guild purge [days] - Kicks members (below Elite) who have been inactive for [days].",
		"/guild ladder (or /guild top) - Displays the Global Guild Leaderboard sorted by Points.",
		"/guild topmembers - Displays the top 50 players on the server sorted by Total Points.",
		"/guild memberlimit [number] - (Admin) Sets the global member limit for all guilds.",
		"/guild give [guild], [amount] - (Admin) Gives points directly to a guild.",
		"/guild take [guild], [amount] - (Admin) Takes points directly from a guild.",
		"/guild endseason - (Admin) Manually ends the current Guild Season and resets all points.",
		"Admins can optionally prefix management commands with the guild name: /guild promote [guild], [user], [role]",
	],
});
