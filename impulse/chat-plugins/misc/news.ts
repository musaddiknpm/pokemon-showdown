import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization } from '../customization/manager';
import { initMiscDB } from './database';

const SERVER_NAME = 'Impulse';

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
	await initMiscDB();
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
	init() {
		Customization.register({
			name: 'news',
			startTag: '/* NEWS START */',
			endTag: '/* NEWS END */',
			generateCSS() {
				const serverId = toID(SERVER_NAME);
				return (
					`}\n` +
					`.pm-window-${serverId}news .challenge { display: none !important; }\n` +
					`.pm-window-${serverId}news .pm-buttonbar { display: none !important; }\n` +
					`.pm-window-${serverId}news .pm-log-add { display: none !important; }\n` +
					`.pm-window-${serverId}news form { display: none !important; }\n` +
					`.pm-window-${serverId}news .pm-log { bottom: 0 !important; }`
				);
			},
		});

		void Customization.updateCSS();
	},

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
			`${entry.desc}<br><br>` +
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
			timestamp
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
	}
};

void initNews()
	.then(() => NewsManager.init())
	.catch(err => Monitor.crashlog(err, 'News PG init failed'));

export const loginfilter: Chat.LoginFilter = user => {
	NewsManager.onConnect(user);
};

export const commands: Chat.ChatCommands = wrapCommands({
	svn: 'servernews',
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

			if (!title || !desc) return this.parse('/svn help');
			const id = toID(title);

			if (posts[id]) throw new Chat.ErrorMessage(`A news entry titled "${title}" already exists.`);

			await NewsManager.addPost(id, title, desc, user.name);
			this.sendReply(`Added news: "${title}"`);
		},

		delete: 'remove',
		async remove(target, room, user) {
			this.checkCan('bypassall');
			const id = toID(target);
			if (!id) return this.parse('/svn help');

			if (!posts[id]) throw new Chat.ErrorMessage(`News entry "${target}" not found.`);
			
			await NewsManager.removePost(id);
			this.sendReply(`Deleted news entry: "${target}"`);
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
				`<b>/svn view</b>: View the latest news.<hr>` +
				`<b>/svn add [title], [desc]</b>: Add a news entry.<hr>` +
				`<b>/svn remove [title]</b>: Delete a news entry.<hr>` +
				`<b>/svn block/unblock</b>: Toggle login notifications.`
			);
		},
	},
	svnhelp: 'servernews help',
});
