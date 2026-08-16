import * as https from 'node:https';
import { FS } from '../../../lib/fs';
import { PG } from '../../pg';
import { Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { initMiscDB } from './database';

const SERVER_NAME = 'Impulse';
const CONFIG_PATH = 'config/custom.css' as const;
const START_TAG = '/* NEWS START */';
const END_TAG = '/* NEWS END */';

const reloadCSS = (): void => {
	if (global.Config?.serverid) {
		const url = `https://play.pokemonshowdown.com/customcss.php?server=${Config.serverid}&invalidate`;
		const req = https.get(url, () => {});
		req.on('error', err => {
			Monitor.warn(`Failed to reload custom CSS from central server: ${err.message}`);
		});
		req.end();
	}
};

interface NewsPost {
	id: string;
	title: string;
	desc: string;
	postedBy: string;
	postTime: string;
	timestamp: number;
}

interface NewsRow {
	id: string;
	title: string;
	description: string;
	posted_by: string;
	post_time: string;
	timestamp: number | string;
}

interface NewsBlockedRow {
	user_id: string;
}

const getNewsTable = () => PG.getTable<NewsRow>('news', 'id');
const getNewsBlockedTable = () => PG.getTable<NewsBlockedRow>('news_blocked', 'user_id');

// In-memory state
let posts: Record<string, NewsPost> = {};
const blocked = new Set<string>();

async function initNews() {
	const ok = await initMiscDB();
	if (!ok) return;
	const postsRows = await getNewsTable().select();
	posts = {};
	for (const row of postsRows) {
		posts[row.id] = {
			id: row.id,
			title: row.title,
			desc: row.description,
			postedBy: row.posted_by,
			postTime: row.post_time,
			timestamp: Number(row.timestamp),
		};
	}

	const blockedRows = await getNewsBlockedTable().select();
	blocked.clear();
	for (const row of blockedRows) {
		blocked.add(row.user_id);
	}
}

const NewsManager = {
	formatDate(date = new Date()) {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
	},

	generateDisplay(limit = 2): string {
		const sorted = Object.values(posts)
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);

		if (!sorted.length) return `<center><em>No recent news.</em></center>`;

		const content = sorted.map(entry =>
			`<div style="margin-bottom: 8px; padding: 5px;">` +
			`<strong>${Utils.escapeHTML(entry.title)}</strong><br><br>` +
			`${Utils.escapeHTML(entry.desc)}<br><br>` +
			`<small>— ${Utils.escapeHTML(entry.postedBy)} on ${entry.postTime}</small>` +
			`</div>`
		).join('<hr>');

		const serverId = toID(SERVER_NAME);
		return `<div class="${serverId}-news-box">${content}</div>`;
	},

	onConnect(user: User) {
		if (blocked.has(user.id)) return;
		const display = this.generateDisplay();
		if (display.includes('No recent news.')) return;
		user.send(`|pm|${SERVER_NAME} News|${user.getIdentity()}|/raw ${display}`);
	},

	async addPost(id: string, title: string, desc: string, postedBy: string) {
		const postTime = this.formatDate();
		const timestamp = Date.now();
		posts[id] = { id, title, desc, postedBy, postTime, timestamp };

		await initMiscDB();
		await getNewsTable().upsert({
			id,
			title,
			description: desc,
			posted_by: postedBy,
			post_time: postTime,
			timestamp,
		}, ['id']);
	},

	async removePost(id: string) {
		delete posts[id];
		await initMiscDB();
		await getNewsTable().deleteById(id);
	},

	async setBlocked(userid: string, isBlocked: boolean) {
		if (isBlocked) {
			blocked.add(userid);
			await initMiscDB();
			await getNewsBlockedTable().upsert({ user_id: userid }, ['user_id']);
		} else {
			blocked.delete(userid);
			await initMiscDB();
			await getNewsBlockedTable().deleteById(userid);
		}
	},

	async updateCSS() {
		const serverId = toID(SERVER_NAME);
		const content = (
			`\n` +
			`.pm-window-${serverId}news .challenge { display: none !important; }\n` +
			`.pm-window-${serverId}news .pm-buttonbar { display: none !important; }\n` +
			`.pm-window-${serverId}news .pm-log-add { display: none !important; }\n` +
			`.pm-window-${serverId}news form { display: none !important; }\n` +
			`.pm-window-${serverId}news .pm-log { bottom: 0 !important; }`
		);
		const block = `${START_TAG}\n${content}\n${END_TAG}`;

		try {
			let css = await FS(CONFIG_PATH).readIfExists();
			if (!css.includes(START_TAG)) {
				css = `${css.trimEnd()}\n\n${block}\n`;
			} else {
				const startIndex = css.indexOf(START_TAG);
				const endIndex = css.indexOf(END_TAG) + END_TAG.length;
				css = css.slice(0, startIndex) + block + css.slice(endIndex);
			}

			await FS(CONFIG_PATH).safeWrite(css);
			reloadCSS();
		} catch (err) {
			Monitor.warn(`Failed to update news CSS: ${(err as Error).message}`);
		}
	},

	init() {
		void this.updateCSS();
	},
};

void initNews()
	.then(() => NewsManager.init())
	.catch(err => Monitor.warn(`News PG init failed: ${(err as Error).message}`));

export const loginfilter: Chat.LoginFilter = user => {
	NewsManager.onConnect(user);
};

export const commands: Chat.ChatCommands = {
	servernews: {
		view(target, room, user) {
			if (!this.runBroadcast()) return;
			const display = NewsManager.generateDisplay();
			this.sendReplyBox(`<strong>${SERVER_NAME} News:</strong><hr />${display}`);
		},

		async add(target, room, user) {
			this.checkCan('bypassall');
			const [title, ...descParts] = target.split(',').map(s => s.trim());
			const desc = descParts.join(',');

			if (!title || !desc) return this.parse('/servernews help');
			const id = toID(title);

			if (posts[id]) throw new Chat.ErrorMessage(`A news entry titled "${title}" already exists.`);

			await NewsManager.addPost(id, title, desc, user.name);
			this.sendReply(`The news entry "${title}" has been added.`);
		},

		delete: 'remove',
		async remove(target, room, user) {
			this.checkCan('bypassall');
			const id = toID(target);
			if (!id) return this.parse('/servernews help');

			if (!posts[id]) throw new Chat.ErrorMessage(`The news entry "${target}" could not be found.`);

			await NewsManager.removePost(id);
			this.sendReply(`The news entry "${target}" has been deleted.`);
		},

		async block(target, room, user) {
			if (blocked.has(user.id)) throw new Chat.ErrorMessage("You have already blocked server news.");
			await NewsManager.setBlocked(user.id, true);
			this.sendReply("You will no longer receive news popups on login.");
		},

		async unblock(target, room, user) {
			if (!blocked.has(user.id)) throw new Chat.ErrorMessage("You do not have server news blocked.");
			await NewsManager.setBlocked(user.id, false);
			this.sendReply("You will now receive news popups on login.");
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Server News Commands</b></center><hr>` +
				`<b>/servernews view</b>: View the latest news.<hr>` +
				`<b>/servernews add [title], [desc]</b>: Add a news entry. (&, ~)<hr>` +
				`<b>/servernews remove [title]</b>: Delete a news entry. (&, ~)<hr>` +
				`<b>/servernews block/unblock</b>: Toggle login notifications.`
			);
		},
	},
};
