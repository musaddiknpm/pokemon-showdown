import { PG } from '../../pg';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initMiscDB } from './database';

interface SeenUsersRow {
	user_id: string;
	username: string;
	last_seen: number | string;
	action: string;
}

const getSeenTable = () => PG.getTable<SeenUsersRow>('seen_users', 'user_id');

// userid → timestamp of last disconnect
let seenData: Record<string, number> = {};

/**
 * Returns the last time a user was active:
 * - If they are online right now → Date.now()
 * - If they have a recorded disconnect → that timestamp
 * - If never seen → 0
 *
 * Safe to call from any module. No DB reads, pure in-memory.
 */
export const getLastSeen = (userid: string): number => {
	const user = Users.get(userid);
	if (user?.connected) return Date.now();
	return seenData[userid] ?? 0;
};

async function initSeen() {
	await initMiscDB();
	const rows = await getSeenTable().select();
	seenData = {};
	for (const row of rows) {
		seenData[row.user_id] = Number(row.last_seen);
	}
}

void initSeen().catch(err => Monitor.crashlog(err, 'Seen PG init failed'));

const pendingSeenUpdates = new Map<string, { username: string, lastSeen: number }>();
let seenBatchTimer: NodeJS.Timeout | null = null;

const SeenManager = {
	update(userid: string, username: string): void {
		const now = Date.now();
		seenData[userid] = now;
		pendingSeenUpdates.set(userid, { username, lastSeen: now });
		if (!seenBatchTimer) {
			seenBatchTimer = setTimeout(() => {
				void SeenManager.flushUpdates();
			}, 60 * 1000);
		}
	},

	async flushUpdates(): Promise<void> {
		if (pendingSeenUpdates.size === 0) return;
		await initMiscDB();
		const entries = Array.from(pendingSeenUpdates.entries());
		pendingSeenUpdates.clear();
		seenBatchTimer = null;

		const placeholders = entries.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3}, 'disconnected')`).join(', ');
		const values = entries.flatMap(([userid, data]) => [userid, data.username, data.lastSeen]);

		// Kept Raw SQL: Requires inserting batch array via parameterized loops
		await PG.query(`
			INSERT INTO seen_users (user_id, username, last_seen, action) 
			VALUES ${placeholders} 
			ON CONFLICT (user_id) DO UPDATE SET last_seen = EXCLUDED.last_seen, username = EXCLUDED.username
		`, values);
	},

	/** Remove all records older than `days` days. Returns count removed. */
	async cleanup(days: number): Promise<number> {
		const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
		let removed = 0;
		for (const userid in seenData) {
			if (seenData[userid] < cutoff) {
				delete seenData[userid];
				removed++;
			}
		}
		
		if (removed > 0) {
			await initMiscDB();
			await getSeenTable().delete({ last_seen: { lt: cutoff } });
		}
		
		return removed;
	},

	format(name: string, date: number | null): string {
		const coloredName = nameColor(name, true, true);
		const user = Users.get(name);

		if (user?.connected) {
			return `${coloredName} is <b><font color="limegreen">Online</font></b>`;
		}
		if (!date) {
			return `${coloredName} has <b><font color="red">never</font></b> been online.`;
		}

		const duration = Chat.toDurationString(Date.now() - date, { precision: true });
		return `${coloredName} was last seen <b>${duration}</b> ago.`;
	},
};

export const handlers: Chat.Handlers = {
	onDisconnect(user) {
		if (user.named && !user.connections.length) {
			void SeenManager.update(user.id, user.name);
		}
	},
};

export const commands: Chat.ChatCommands = {
	seen: {
		''(target, room, user) {
			if (!this.runBroadcast()) return;

			const targetId = toID(target);
			if (!targetId || targetId.length > 18) return this.parse('/seen help');

			const lastSeen = seenData[targetId] ?? null;
			this.sendReplyBox(SeenManager.format(target, lastSeen));
		},

		recent: 'recentseen',
		async recentseen(target, room, user) {
			this.checkCan('bypassall');
			if (!this.runBroadcast()) return;

			const limit = Math.min(parseInt(target) || 25, 100);

			// We can fetch directly from DB to get username too, but memory is fine
			const recent = Object.entries(seenData)
				.sort(([, a], [, b]) => b - a)
				.slice(0, limit);

			if (!recent.length) return this.sendReply("No history found.");

			const dataRows = recent.map(([id, date]) => {
				const u = Users.get(id);
				const status = u?.connected ?
					`<b style="color: limegreen">Online</b>` :
					Chat.toDurationString(Date.now() - date) + ' ago';
				return [nameColor(id, true), status];
			});

			const html = Table(`Recently Seen (${recent.length})`, ["User", "Last Seen"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		async cleanup(target, room, user) {
			this.checkCan('bypassall');
			const days = parseInt(target) || 365;
			if (days < 30) throw new Chat.ErrorMessage("Minimum cleanup threshold is 30 days.");

			const removed = await SeenManager.cleanup(days);
			this.sendReply(`Deleted ${removed} records older than ${days} days.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Seen Commands</b></center><hr>` +
				`<b>/seen [user]</b>: Check last connection time.<hr>` +
				`<b>/seen recent [limit]</b>: Show recently active users (Staff only).<hr>` +
				`<b>/seen cleanup [days]</b>: Clear old records (Staff only).`
			);
		},
	},
	recentseen: 'seen recentseen',
	seenhelp: 'seen help',
};

export const destroy = () => {
	if (seenBatchTimer) clearTimeout(seenBatchTimer);
	seenBatchTimer = null;
	void SeenManager.flushUpdates();
};
