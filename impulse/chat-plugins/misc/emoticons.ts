/*
* Pokemon Showdown
* Emoticons
* @author PrinceSky-Git
* 
* Instructions: Replace sendChatMessage in server/chat.ts with this:
* sendChatMessage(message: string) {
*   const emoticons = Impulse.parseEmoticons(message, this.room);
*   if (this.pmTarget) {
*     const blockInvites = this.pmTarget.settings.blockInvites;
*     if (blockInvites && /^<<.*>>$/.test(message.trim())) {
*       if (!this.user.can('lock') && blockInvites === true || !Users.globalAuth.atLeast(this.user, blockInvites as GroupSymbol)) {
*         Chat.maybeNotifyBlocked(`invite`, this.pmTarget, this.user);
*         return this.errorReply(`${this.pmTarget.name} is blocking room invites.`);
*       }
*     }
*     Chat.PrivateMessages.send((emoticons ? `/html ${emoticons}` : `${message}`), this.user, this.pmTarget);
*   } else if (this.room) {
*     if (emoticons && !this.room.disableEmoticons) {
*       for (const u in this.room.users) {
*         const curUser = Users.get(u);
*         if (!curUser || !curUser.connected) continue;
*         if (Impulse.ignoreEmotes[curUser.user.id]) {
*           curUser.sendTo(this.room, `${(this.room.type === 'chat' ? `|c:|${(~~(Date.now() / 1000))}|` : `|c|`)}${this.user.getIdentity(this.room)}|${message}`);
*           continue;
*         }
*         curUser.sendTo(this.room, `${(this.room.type === 'chat' ? `|c:|${(~~(Date.now() / 1000))}|` : `|c|`)}${this.user.getIdentity(this.room)}|/html ${emoticons}`);
*       }
*       this.room.log.log.push(`${(this.room.type === 'chat' ? `|c:|${(~~(Date.now() / 1000))}|` : `|c|`)}${this.user.getIdentity(this.room)}|/html ${emoticons}`);
*       this.room.game?.onLogMessage?.(message, this.user);
*     } else {
*       this.room.add(`|c|${this.user.getIdentity(this.room)}|${message}`);
*     }
*   } else {
*     this.connection.popup(`Your message could not be sent:\n\n${message}\n\nIt needs to be sent to a user or room.`);
*   }
* }
* 
* KNOWN BEHAVIOR:
* - Users who have enabled "ignore emoticons" will still see emoticons in chat history when they rejoin.
* - New messages will correctly respect their ignore preference.
*/

import Autolinker from 'autolinker';
import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

interface EmoticonEntry { _id: string; url: string; addedBy: string; addedAt: Date; }
interface EmoticonConfigDocument { _id: string; emoteSize: number; lastUpdated: Date; }
interface IgnoreEmotesDocument { _id: string; ignored: boolean; lastUpdated: Date; }
interface IgnoreEmotesData { [userId: string]: boolean; }

const EmoticonDB = ImpulseDB<EmoticonEntry>('emoticons');
const EmoticonConfigDB = ImpulseDB<EmoticonConfigDocument>('emoticonconfig');
const IgnoreEmotesDB = ImpulseDB<IgnoreEmotesDocument>('ignoreemotes');

let emoticons: { [key: string]: string } = { "spGun": "https://i.ibb.co/78y8mKv/spGun.jpg" };
let emoteRegex: RegExp = new RegExp("spGun", "g");
let emoteSize: number = 32;
Impulse.ignoreEmotes = {} as IgnoreEmotesData;

const logEmoticonAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('emoticonlogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to emoticon log:', err);
	}
};

const getEmoteSize = () => emoteSize.toString();

function parseMessage(message: string): string {
	if (message.substr(0, 5) === "/html") {
		message = message.substr(5);
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>');
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>');
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>');
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;');
		message = Autolinker.link(message.replace(/&#x2f;/g, '/'), { stripPrefix: false, phone: false, twitter: false });
		return message;
	}
	message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
	message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>');
	message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>');
	message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>');
	message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;');
	message = Autolinker.link(message, { stripPrefix: false, phone: false, twitter: false });
	return message;
}
Impulse.parseMessage = parseMessage;

const escapeRegExp = (str: string) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

const buildEmoteRegex = () => {
	const emoteArray = Object.keys(emoticons).map(e => escapeRegExp(e));
	emoteRegex = emoteArray.length > 0 ? new RegExp(`(${emoteArray.join('|')})`, 'g') : new RegExp("^$", "g");
};

const loadEmoticons = async () => {
	try {
		const emoticonDocs = await EmoticonDB.find({}, { projection: { _id: 1, url: 1 } });
		if (emoticonDocs.length > 0) {
			emoticons = {};
			emoticonDocs.forEach(doc => emoticons[doc._id] = doc.url);
		}

		const config = await EmoticonConfigDB.findOne({ _id: 'config' });
		if (config) emoteSize = config.emoteSize;

		const ignoreEmotesDocs = await IgnoreEmotesDB.find({ ignored: true }, { projection: { _id: 1 } });
		Impulse.ignoreEmotes = {};
		ignoreEmotesDocs.forEach(doc => Impulse.ignoreEmotes[doc._id] = true);

		buildEmoteRegex();
	} catch (e) {
		console.error('Error loading emoticons:', e);
	}
};

const saveEmoteSize = async (size: number) => {
	try {
		await EmoticonConfigDB.upsert({ _id: 'config' }, { $set: { emoteSize: size, lastUpdated: new Date() } });
		emoteSize = size;
	} catch (e) {
		console.error('Error saving emote size:', e);
	}
};

const addEmoticon = async (name: string, url: string, user: User) => {
	await EmoticonDB.insertOne({ _id: name, url, addedBy: user.name, addedAt: new Date() });
	emoticons[name] = url;
	buildEmoteRegex();
};

const deleteEmoticon = async (name: string) => {
	await EmoticonDB.deleteOne({ _id: name });
	delete emoticons[name];
	buildEmoteRegex();
};

const parseEmoticons = (message: string, room?: Room): string | false => {
	if (emoteRegex.test(message)) {
		const size = getEmoteSize();
		message = Impulse.parseMessage(message).replace(emoteRegex, (match: string) => 
			`<img src="${emoticons[match]}" title="${match}" height="${size}" width="${size}">`
		);
		return message;
	}
	return false;
};
Impulse.parseEmoticons = parseEmoticons;

loadEmoticons();

const renderEmoticonGrid = (emotes: Array<{ _id: string; url: string }>) => 
	emotes.map(e => 
		`<div style="text-align: center; padding: 10px;"><img src="${e.url}" height="40" width="40" style="display: block; margin: 0 auto;"><br><small>${Chat.escapeHTML(e._id)}</small></div>`
	);

export const commands: Chat.ChatCommands = {
	emoticon: {
		async add(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roomowner');
			if (!target) return this.parse("/emoticon help");

			const [name, url] = target.split(",").map(s => s.trim());
			if (!url) return this.parse("/emoticon help");
			if (name.length > 10) return this.errorReply("Emoticons may not be longer than 10 characters.");
			if (await EmoticonDB.exists({ _id: name })) return this.errorReply(`${name} is already an emoticon.`);

			await addEmoticon(name, url, user);
			await logEmoticonAction('ADD', user.name, name, `URL: ${url}`);

			this.sendReply(`|raw|Emoticon ${Chat.escapeHTML(name)} added: <img src="${url}" width="40" height="40">`);
		},

		delete: "del",
		remove: "del",
		rem: "del",
		async del(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roomowner');
			if (!target) return this.parse("/emoticon help");

			const emote = await EmoticonDB.findOne({ _id: target });
			if (!emote) return this.errorReply("That emoticon does not exist.");

			await deleteEmoticon(target);
			await logEmoticonAction('DELETE', user.name, target, `URL: ${emote.url}, Added by: ${emote.addedBy}`);

			this.sendReply("Emoticon removed.");
		},

		async toggle(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roommod');
			room.disableEmoticons = !room.disableEmoticons;
			Rooms.global.writeChatRoomData();
			const action = room.disableEmoticons ? 'Disabled' : 'Enabled';
			await logEmoticonAction('TOGGLE', user.name, room.roomid, `${action} emoticons`);
			this.privateModAction(`(${user.name} ${action.toLowerCase()} emoticons.)`);
		},

		async ''(target, room, user) {
			if (!this.runBroadcast()) return;
			const emoteKeys = Object.keys(emoticons);
			if (emoteKeys.length === 0) return this.sendReplyBox('No emoticons available.');

			const rows: string[][] = [];
			for (let i = 0; i < emoteKeys.length; i += 5) {
				const row = [];
				for (let j = i; j < i + 5 && j < emoteKeys.length; j++) {
					row.push(renderEmoticonGrid([{ _id: emoteKeys[j], url: emoticons[emoteKeys[j]] }])[0]);
				}
				rows.push(row);
			}

			const tableHTML = ImpulseUI.contentTable({ title: 'Available Emoticons', rows });
			this.sendReplyBox(`<center><details><summary>Click to view emoticons</summary>${tableHTML}</details></center>`);
		},

		async ignore(target, room, user) {
			if (Impulse.ignoreEmotes[user.id]) return this.errorReply('Already ignoring emoticons.');
			await IgnoreEmotesDB.upsert({ _id: user.id }, { $set: { ignored: true, lastUpdated: new Date() } });
			Impulse.ignoreEmotes[user.id] = true;
			this.sendReply('Ignoring emoticons. Note: Chat history may still show emoticons when rejoining.');
		},

		async unignore(target, room, user) {
			if (!Impulse.ignoreEmotes[user.id]) return this.errorReply('Not ignoring emoticons.');
			await IgnoreEmotesDB.deleteOne({ _id: user.id });
			delete Impulse.ignoreEmotes[user.id];
			this.sendReply('No longer ignoring emoticons.');
		},

		async size(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.errorReply('Specify a size (16-256).');

			const size = parseInt(target);
			if (isNaN(size) || size < 16 || size > 256) return this.errorReply('Size must be 16-256.');

			const oldSize = emoteSize;
			await saveEmoteSize(size);
			await logEmoticonAction('SIZE', user.name, 'Global', `${oldSize}px → ${size}px`);

			this.sendReply(`Emoticon size set to ${size}px.`);
		},

		async list(target, room, user) {
			if (!this.runBroadcast()) return;

			const result = await EmoticonDB.findPaginated({}, { page: parseInt(target) || 1, limit: 50, sort: { _id: 1 } });
			if (result.total === 0) return this.sendReply('No emoticons.');

			const rows: string[][] = [];
			for (let i = 0; i < result.docs.length; i += 5) {
				rows.push(renderEmoticonGrid(result.docs.slice(i, i + 5)) as string[]);
			}

			const tableHTML = ImpulseUI.contentTable({ title: `Emoticons (Page ${result.page}/${result.totalPages})`, rows });
			const pagination = ImpulseUI.pagination({
				commandString: '/emoticon list',
				currentPage: result.page,
				totalPages: result.totalPages,
				totalResults: result.total,
				resultsPerPage: result.limit
			});

			this.sendReply(`|raw|${tableHTML}${pagination}`);
		},

		async count(target, room, user) {
			const count = await EmoticonDB.countDocuments({});
			this.sendReply(`${count} emoticon(s) available.`);
		},

		async info(target, room, user) {
			if (!target) return this.errorReply('Usage: /emoticon info <name>');

			const emote = await EmoticonDB.findOne({ _id: target });
			if (!emote) return this.errorReply(`Emoticon "${target}" not found.`);

			const rows = [
				[`<img src="${emote.url}" height="40" width="40">`],
				[`<b>URL:</b> ${Chat.escapeHTML(emote.url)}`],
				[`<b>Added by:</b> ${Impulse.nameColor(emote.addedBy, true, true)}`],
				[`<b>Added:</b> ${emote.addedAt.toUTCString()}`]
			];

			const tableHTML = ImpulseUI.contentTable({ title: `Emoticon: ${Chat.escapeHTML(target)}`, rows });
			this.sendReplyBox(tableHTML);
		},

		randemote() {
			const emoteKeys = Object.keys(emoticons);
			if (!emoteKeys.length) return this.errorReply('No emoticons available.');
			this.parse(emoteKeys[Math.floor(Math.random() * emoteKeys.length)]);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('emoticonlogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (!logs.length) return this.sendReply('No logs found.');

				const rows = logs.map(log => [
					Chat.escapeHTML(`[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`)
				]);

				const tableHTML = ImpulseUI.contentTable({ title: `Logs (Last ${logs.length})`, rows });
				const scrollable = ImpulseUI.scrollable(tableHTML, '370px');

				this.sendReply(`|raw|${scrollable}`);
			} catch (err) {
				console.error('Error reading logs:', err);
				return this.errorReply('Failed to read logs.');
			}
		},

		async stats(target, room, user) {
			this.checkCan('roomowner');

			try {
				const total = await EmoticonDB.countDocuments({});
				const recent = await EmoticonDB.find({}, { sort: { addedAt: -1 }, limit: 5, projection: { _id: 1, addedBy: 1, addedAt: 1 } });
				const topContrib = await EmoticonDB.aggregate([
					{ $group: { _id: '$addedBy', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 }
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentAdds = await ImpulseDB('emoticonlogs').countDocuments({ action: 'ADD', timestamp: { $gte: sevenDaysAgo } });
				const recentDels = await ImpulseDB('emoticonlogs').countDocuments({ action: 'DELETE', timestamp: { $gte: sevenDaysAgo } });
				const ignoring = await IgnoreEmotesDB.countDocuments({ ignored: true });

				let rows: string[][] = [
					[`<strong>Total:</strong> ${total}`],
					[`<strong>Size:</strong> ${emoteSize}px`],
					[`<strong>Ignoring:</strong> ${ignoring}`]
				];

				if (topContrib.length) {
					rows.push([`<strong>Top Contributors:</strong>`]);
					topContrib.forEach(c => rows.push([`${Impulse.nameColor(c._id, true, true)}: ${c.count}`]));
				}

				if (recent.length) {
					rows.push([`<strong>Recent:</strong>`]);
					recent.forEach(e => rows.push([`<strong>${Chat.escapeHTML(e._id)}</strong> by ${Impulse.nameColor(e.addedBy, true, true)} on ${e.addedAt.toLocaleDateString()}`]));
				}

				rows.push([`<strong>Activity (7 Days):</strong>`]);
				rows.push([`Added: ${recentAdds}`]);
				rows.push([`Deleted: ${recentDels}`]);

				const tableHTML = ImpulseUI.contentTable({ title: 'Statistics', rows });
				this.sendReply(`|raw|${tableHTML}`);
			} catch (err) {
				console.error('Error generating stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;

			const rows = [
				[`<code>/emoticon</code> - Shows all emoticons`],
				[`<code>/emoticon add [name], [url]</code> - Add emoticon (&)`],
				[`<code>/emoticon del [name]</code> - Remove emoticon (&)`],
				[`<code>/emoticon toggle</code> - Enable/disable emoticons (#)`],
				[`<code>/emoticon list [page]</code> - Paginated list`],
				[`<code>/emoticon ignore</code> - Ignore emoticons`],
				[`<code>/emoticon unignore</code> - Show emoticons`],
				[`<code>/emoticon size [px]</code> - Set size (&)`],
				[`<code>/emoticon info [name]</code> - Info about emoticon`],
				[`<code>/emoticon count</code> - Total emoticons`],
				[`<code>/emoticon stats</code> - Statistics (&)`],
				[`<code>/emoticon logs [num]</code> - View logs (&)`],
				[`<code>/randemote</code> - Random emoticon`],
				[`<small>Note: History may show emoticons even if ignored</small>`]
			];

			const tableHTML = ImpulseUI.contentTable({ title: 'Emoticon Commands', rows });
			this.sendReplyBox(tableHTML);
		},
	},
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticons: 'emoticon',
	blockemote: "ignoreemotes",
	blockemotes: "ignoreemotes",
	blockemoticon: "ignoreemotes",
	blockemoticons: "ignoreemotes",
	ignoreemotes() { this.parse('/emoticon ignore'); },
	unblockemote: "unignoreemotes",
	unblockemotes: "unignoreemotes",
	unblockemoticon: "unignoreemotes",
	unblockemoticons: "unignoreemotes",
	unignoreemotes() { this.parse('/emoticon unignore'); },
	randemote() { this.parse('/emoticon randemote'); },
};
