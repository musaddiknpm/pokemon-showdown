/*
* Pokemon Showdown
* Seen & Clearall chat-plugin
*/

import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';
import { FS } from '../../../lib';

const CLEARALL_LOG_PATH = 'logs/clearall.txt';

const logClearallAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		const logEntry = `[${new Date().toISOString()}] ${action} | Staff: ${staff} | Target: ${target}${details ? ` | ${details}` : ''}\n`;
		await FS(CLEARALL_LOG_PATH).append(logEntry);
	} catch (err) {
		console.error('Error writing clearall log:', err);
	}
};

interface SeenDocument {
	_id: string;
	lastSeen: Date;
}

const SeenDB = ImpulseDB<SeenDocument>('seen');

const trackSeen = (userid: string) => {
	void SeenDB.upsert({ _id: userid }, { $set: { lastSeen: new Date() } }).catch(err => console.error('Error tracking seen:', err));
};

Impulse.Seen = trackSeen;

export const handlers: Chat.Handlers = {
	onDisconnect(user: User) {
		if (user.named && user.connections.length === 0) Impulse.Seen(user.id);
	}
};

const getLastSeen = async (userid: string): Promise<Date | null> => {
	const doc = await SeenDB.findOne({ _id: userid }, { projection: { lastSeen: 1 } });
	return doc?.lastSeen || null;
};

const getRecentUsers = async (limit = 50): Promise<SeenDocument[]> => {
	return SeenDB.find({}, { sort: { lastSeen: -1 }, limit, projection: { _id: 1, lastSeen: 1 } });
};

const cleanupOldSeen = async (daysOld = 365): Promise<number> => {
	const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
	const result = await SeenDB.deleteMany({ lastSeen: { $lt: cutoff } });
	return result.deletedCount || 0;
};

const clearRooms = (rooms: Room[], user: User): string[] => {
	const cleared: string[] = [];
	for (const room of rooms) {
		if (!room) continue;
		if (room.log.log) room.log.log.length = 0;

		const userIds = Object.keys(room.users) as ID[];
		userIds.forEach(userId => {
			const u = Users.get(userId);
			u?.connections?.forEach(conn => u.leaveRoom(room, conn));
		});

		cleared.push(room.id);
		setTimeout(() => {
			userIds.forEach(userId => {
				const u = Users.get(userId);
				u?.connections?.forEach(conn => u.joinRoom(room, conn));
			});
		}, 1000);
	}
	return cleared;
};

export const commands: Chat.ChatCommands = {
	seen: {
		async ''(target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) return this.parse('/seen help');

			const targetUser = Users.get(target);
			if (targetUser?.connected) {
				return this.sendReplyBox(`${Impulse.nameColor(targetUser.name, true, true)} is <b><font color='limegreen'>Online</font></b>.`);
			}

			try {
				const lastSeen = await getLastSeen(toID(target));
				if (!lastSeen) {
					return this.sendReplyBox(`${Impulse.nameColor(target, true, true)} has <b><font color='red'>never been online</font></b>.`);
				}

				const duration = Chat.toDurationString(Date.now() - lastSeen.getTime(), { precision: true });
				this.sendReplyBox(`${Impulse.nameColor(target, true, true)} was last seen <b>${duration}</b> ago.`);
			} catch (err: any) {
				this.errorReply('Error retrieving seen data: ' + err.message);
			}
		},

		async recent(target, room, user) {
			this.checkCan('globalban');
			if (!this.runBroadcast()) return;

			const limit = Math.min(parseInt(target) || 25, 100);

			try {
				const recent = await getRecentUsers(limit);
				if (!recent.length) return this.sendReply('No seen data.');

				const rows = recent.map((doc, i) => [
					`${i + 1}`,
					Impulse.nameColor(doc._id, true),
					Chat.toDurationString(Date.now() - doc.lastSeen.getTime()),
				]);

				const tableHTML = ImpulseUI.contentTable({
					title: `Recently Seen (${recent.length})`,
					rows,
				});

				this.sendReply(`|raw|${tableHTML}`);
			} catch (err: any) {
				this.errorReply('Error: ' + err.message);
			}
		},

		async cleanup(target, room, user) {
			this.checkCan('globalban');
			if (!this.runBroadcast()) return;

			const days = parseInt(target) || 365;
			if (days < 30) return this.errorReply('Minimum: 30 days.');

			try {
				const deleted = await cleanupOldSeen(days);
				this.sendReply(`Deleted ${deleted} records older than ${days} days.`);
			} catch (err: any) {
				this.errorReply('Error: ' + err.message);
			}
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;

			const rows = [
				[`<code>/seen [user]</code> - Last connection time`],
				[`<code>/seen recent [limit]</code> - Recently seen users (@)`],
				[`<code>/seen cleanup [days]</code> - Delete records over X days (@)`],
			];

			const tableHTML = ImpulseUI.contentTable({
				title: 'Seen Commands',
				rows,
			});

			this.sendReplyBox(tableHTML);
		},
	},

	seenhelp() { this.parse('/seen help'); },

	clearall: {
		async ''(target, room, user) {
			if (room?.battle) return this.sendReply("Cannot clearall in battle rooms.");
			if (!room) return this.errorReply("Requires a room.");

			this.checkCan('roommod', null, room);
			clearRooms([room], user);
			await logClearallAction('CLEARALL', user.name, room.roomid, 'Cleared 1 room');
		},

		async global(target, room, user) {
			this.checkCan('bypassall');
			const rooms = Rooms.global.chatRooms.filter((r): r is Room => !!r && !r.battle);
			const cleared = clearRooms(rooms, user);
			await logClearallAction('GLOBAL_CLEARALL', user.name, 'All', `Cleared ${cleared.length}: ${cleared.join(', ')}`);
		},

		async logs(target, room, user) {
			this.checkCan('bypassall');

			try {
				const content = await FS(CLEARALL_LOG_PATH).readIfExists();
				if (!content) return this.sendReply('No logs found.');

				const lines = content.trim().split('\n');
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const recent = lines.slice(-numLines).reverse();

				const rows = recent.map(line => [Chat.escapeHTML(line)]);

				const tableHTML = ImpulseUI.contentTable({
					title: `Clearall Logs (Last ${recent.length})`,
					rows,
				});

				const scrollable = ImpulseUI.scrollable(tableHTML, '370px');
				this.sendReply(`|raw|${scrollable}`);
			} catch (err) {
				console.error('Error reading logs:', err);
				return this.errorReply('Failed to read logs.');
			}
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;

			const rows = [
				[`<code>/clearall</code> - Clear room chat (#)`],
				[`<code>/clearall global</code> - Clear all rooms (~)`],
				[`<code>/clearall logs [num]</code> - View logs 1-500 (~)`],
			];

			const tableHTML = ImpulseUI.contentTable({
				title: 'Clearall Commands',
				rows,
			});

			this.sendReplyBox(tableHTML);
		},
	},

	globalclearall() { this.parse('/clearall global'); },
	clearalllogs() { this.parse('/clearall logs'); },
	clearallhelp() { this.parse('/clearall help'); },
	recentseen() { this.parse('/seen recent'); },
	cleanupseen() { this.parse('/seen cleanup'); },
};
