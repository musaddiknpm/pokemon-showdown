/*
* Pokemon Showdown
* Ontime chat-plugin
* 
* Integration: Uses Chat event handler system for session time tracking
*/
import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';
import { checkAndAwardOntimeBadge } from '../badges/badges-config';

interface OntimeDocument {
	_id: string;
	ontime: number;
}

const OntimeDB = ImpulseDB<OntimeDocument>('ontime');
const ONTIME_LEADERBOARD_SIZE = 100;

const convertTime = (time: number) => {
	const s = Math.floor((time / 1000) % 60);
	const m = Math.floor((time / (1000 * 60)) % 60);
	const h = Math.floor(time / (1000 * 60 * 60));
	return { h, m, s };
};

const displayTime = (t: { h: number; m: number; s: number }): string => {
	const parts: string[] = [];
	if (t.h > 0) parts.push(`${t.h.toLocaleString()} ${t.h === 1 ? 'hour' : 'hours'}`);
	if (t.m > 0) parts.push(`${t.m.toLocaleString()} ${t.m === 1 ? 'minute' : 'minutes'}`);
	if (t.s > 0) parts.push(`${t.s.toLocaleString()} ${t.s === 1 ? 'second' : 'seconds'}`);
	return parts.length ? parts.join(', ') : '0 seconds';
};

export const handlers: Chat.Handlers = {
	onDisconnect(user: User) {
		const isLastConnection = user.connections.length === 0;
		if (user.named && isLastConnection && !user.isPublicBot) {
			const sessionTime = user.lastDisconnected - user.lastConnected;
			if (sessionTime > 0) {
				void OntimeDB.updateOne({ _id: user.id }, { $inc: { ontime: sessionTime } }, { upsert: true });
			}
		}
	}
};

export const commands: Chat.ChatCommands = {
	ontime: {
		'': 'check',
		async check(target, room, user) {
			if (!this.runBroadcast()) return;

			const targetId = toID(target) || user.id;
			const targetUser = Users.get(targetId);

			if (targetUser?.isPublicBot) {
				return this.sendReplyBox(`${Impulse.nameColor(targetId, true)} is a bot and does not track ontime.`);
			}

			const ontimeDoc = await OntimeDB.findOne({ _id: targetId });
			const totalOntime = ontimeDoc?.ontime || 0;

			if (!totalOntime && !targetUser?.connected) {
				return this.sendReplyBox(`${Impulse.nameColor(targetId, true)} has never been online.`);
			}

			const currentOntime = targetUser?.connected && targetUser.lastConnected ? Date.now() - targetUser.lastConnected : 0;
			await checkAndAwardOntimeBadge(targetId);

			const buf = `${Impulse.nameColor(targetId, true)}'s total ontime is <strong>${displayTime(convertTime(totalOntime + currentOntime))}</strong>. ${targetUser?.connected ? `Current session: <strong>${displayTime(convertTime(currentOntime))}</strong>.` : ''}`;
			this.sendReplyBox(buf);
		},

		async ladder(target, room, user) {
			if (!this.runBroadcast()) return;

			const ontimeData = await OntimeDB.find({}, { sort: { ontime: -1 }, limit: ONTIME_LEADERBOARD_SIZE });
			const ontimeMap = new Map(ontimeData.map(d => [d._id, d.ontime]));

			for (const u of Users.users.values()) {
				if (u.connected && u.named && !ontimeMap.has(u.id) && !u.isPublicBot) {
					ontimeMap.set(u.id, 0);
				}
			}

			const ladderData = [...ontimeMap.entries()]
				.map(([userid, ontime]) => {
					const u = Users.get(userid);
					const currentOntime = u?.connected && u.lastConnected ? Date.now() - u.lastConnected : 0;
					return { name: userid, time: ontime + currentOntime };
				})
				.sort((a, b) => b.time - a.time)
				.slice(0, ONTIME_LEADERBOARD_SIZE);

			if (!ladderData.length) return this.sendReplyBox("Leaderboard empty.");

			const rows = ladderData.map((entry, i) => [
				(i + 1).toString(),
				Impulse.nameColor(entry.name, true),
				displayTime(convertTime(entry.time)),
			]);

			const tableHTML = ImpulseUI.contentTable({
				title: 'Ontime Leaderboard',
				rows,
			});

			return this.sendReply(`|raw|${tableHTML}`);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;

			const rows = [
				[`<code>/ontime [user]</code> - Check user's online time`],
				[`<code>/ontime ladder</code> - Top 100 by ontime`],
			];

			const tableHTML = ImpulseUI.contentTable({
				title: 'Ontime Commands',
				rows,
			});

			this.sendReplyBox(tableHTML);
		},
	},

	ontimehelp() { this.parse('/ontime help'); },
};
