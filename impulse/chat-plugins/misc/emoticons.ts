import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { escapeHTML } from '../../../lib/utils';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initMiscDB } from './database';

const CONFIG = {
	MIN_SIZE: 16,
	MAX_SIZE: 256,
	DEFAULT_SIZE: 32,
	MAX_NAME_LENGTH: 10,
	VALID_URL: /^https:\/\/[^\s"'<>]+\.(?:png|gif|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?$/i,
	VALID_NAME: /^[\w:)(|-]{1,10}$/,
};

interface EmoticonEntry {
	readonly url: string;
	readonly addedBy: string;
	readonly addedAt: number;
}

interface EmoticonRow {
	name: string;
	url: string;
	added_by: string;
	added_at: number | string;
}

interface EmoticonSettingRow {
	id: number;
	emote_size: number;
}

interface EmoticonIgnoreRow {
	user_id: string;
}

const getEmoteTable = () => PG.getTable<EmoticonRow>('emoticons', 'name');
const getEmoteSettingsTable = () => PG.getTable<EmoticonSettingRow>('emoticon_settings', 'id');
const getEmoteIgnoresTable = () => PG.getTable<EmoticonIgnoreRow>('emoticon_ignores', 'user_id');

let emoteCache: Record<string, EmoticonEntry> = {};
const ignoreCache = new Set<string>();
let currentEmoteSize = CONFIG.DEFAULT_SIZE;

let emoteRegex = /^$/g;

function buildRegex() {
	const keys = Object.keys(emoteCache);
	emoteRegex = keys.length > 0 ?
		new RegExp(`(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g') :
		/^$/g;
}

const EmoteManager = {
	async init() {
		await initMiscDB();

		const emotesRows = await getEmoteTable().select();
		emoteCache = {};
		for (const row of emotesRows) {
			emoteCache[row.name] = {
				url: row.url,
				addedBy: row.added_by,
				addedAt: Number(row.added_at),
			};
		}

		const ignoresRows = await getEmoteIgnoresTable().select();
		ignoreCache.clear();
		for (const row of ignoresRows) {
			ignoreCache.add(row.user_id);
		}

		const sizeRow = await getEmoteSettingsTable().findById(1);
		if (sizeRow) {
			currentEmoteSize = Number(sizeRow.emote_size);
		} else {
			await getEmoteSettingsTable().insert({ id: 1, emote_size: currentEmoteSize });
		}

		buildRegex();
	},
	
	async addEmote(name: string, url: string, addedBy: string) {
		const addedAt = Date.now();
		emoteCache[name] = { url, addedBy, addedAt };
		buildRegex();
		
		await initMiscDB();
		await getEmoteTable().upsert({
			name,
			url,
			added_by: addedBy,
			added_at: addedAt
		}, ['name']);
	},
	
	async removeEmote(name: string) {
		delete emoteCache[name];
		buildRegex();
		
		await initMiscDB();
		await getEmoteTable().deleteById(name);
	},
	
	async setSize(size: number) {
		currentEmoteSize = size;
		await initMiscDB();
		await getEmoteSettingsTable().updateById(1, { emote_size: size });
	},
	
	async setIgnore(userid: string, ignore: boolean) {
		if (ignore) {
			ignoreCache.add(userid);
			await initMiscDB();
			await getEmoteIgnoresTable().upsert({ user_id: userid }, ['user_id']);
		} else {
			ignoreCache.delete(userid);
			await initMiscDB();
			await getEmoteIgnoresTable().deleteById(userid);
		}
	},

	parseMarkdown(raw: string): string {
		return Chat.formatText(raw, true);
	},

	parseEmotes(message: string): string | false {
		emoteRegex.lastIndex = 0;
		if (!emoteRegex.test(message)) return false;

		const size = currentEmoteSize;
		const parsed = this.parseMarkdown(message).replace(emoteRegex, match => {
			const entry = emoteCache[match];
			if (!entry) return escapeHTML(match);
			return `<img src="${escapeHTML(entry.url)}" title="${escapeHTML(match)}" height="${size}" width="${size}" style="vertical-align:middle" loading="lazy">`;
		});

		return parsed;
	},
};

EmoteManager.init().catch(err => {
	Monitor.crashlog(err, 'Emoticons PG init failed');
});

export const parseMessage = (msg: string) => msg.startsWith('/html') ? msg.slice(5).replace(/&#x2f;/g, '/') : EmoteManager.parseMarkdown(msg);

export const chatfilter: Chat.ChatFilter = (message, user, room) => {
	if (room?.disableEmoticons || ignoreCache.has(user.id)) return message;
	const parsed = EmoteManager.parseEmotes(message);
	return parsed ? `/html ${parsed}` : message;
};

export const commands: Chat.ChatCommands = wrapCommands({
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticons: 'emoticon',
	emoticon: {
		async add(target, room, user) {
			this.checkCan('bypassall');
			const [name, url] = target.split(',').map(s => s.trim());
			if (!name || !url) return this.parse('/emote help');

			if (!CONFIG.VALID_NAME.test(name)) throw new Chat.ErrorMessage(`Names must be 1-${CONFIG.MAX_NAME_LENGTH} chars (letters/numbers/:_-|()).`);
			if (!CONFIG.VALID_URL.test(url)) throw new Chat.ErrorMessage("Invalid image URL (must be HTTPS and PNG/GIF/JPG/WEBP).");
			if (emoteCache[name]) throw new Chat.ErrorMessage(`"${name}" already exists.`);

			await EmoteManager.addEmote(name, url, user.id);

			this.sendReply(`|raw|Emoticon <b>${escapeHTML(name)}</b> added.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const name = target.trim();
			if (!emoteCache[name]) throw new Chat.ErrorMessage("Emoticon not found.");

			await EmoteManager.removeEmote(name);

			this.sendReply(`Emoticon "${name}" deleted.`);
		},

		async size(target, room, user) {
			this.checkCan('bypassall');
			const size = parseInt(target);
			if (isNaN(size) || size < CONFIG.MIN_SIZE || size > CONFIG.MAX_SIZE) {
				throw new Chat.ErrorMessage(`Size must be between ${CONFIG.MIN_SIZE} and ${CONFIG.MAX_SIZE}.`);
			}
			await EmoteManager.setSize(size);

			this.sendReply(`Emoticon size set to ${size}px.`);
		},

		async ignore(target, room, user) {
			if (ignoreCache.has(user.id)) throw new Chat.ErrorMessage("Already ignoring emoticons.");
			await EmoteManager.setIgnore(user.id, true);
			this.sendReply("You are now ignoring emoticons.");
		},

		async unignore(target, room, user) {
			if (!ignoreCache.has(user.id)) throw new Chat.ErrorMessage("You aren't ignoring emoticons.");
			await EmoteManager.setIgnore(user.id, false);
			this.sendReply("You are no longer ignoring emoticons.");
		},

		toggle(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roommod');
			room.disableEmoticons = !room.disableEmoticons;
			this.privateModAction(`(${user.name} ${room.disableEmoticons ? 'disabled' : 'enabled'} emoticons in this room.)`);
			if (room.persist) Rooms.global.writeChatRoomData();
		},

		info(target) {
			if (!this.runBroadcast()) return;
			const name = target.trim();
			const emote = emoteCache[name];
			if (!emote) throw new Chat.ErrorMessage("Emoticon not found.");

			this.sendReplyBox(
				`<strong>Emoticon Info: ${escapeHTML(name)}</strong><br />` +
				`<img src="${emote.url}" width="40" height="40"><br />` +
				`URL: ${escapeHTML(emote.url)}<br />` +
				`Added by: ${nameColor(emote.addedBy, true)}`
			);
		},

		''(target, room, user): void {
			if (!this.runBroadcast()) return;

			const emoteKeys = Object.keys(emoteCache);
			if (emoteKeys.length === 0) return this.sendReplyBox("No emoticons available.");

			const rows: string[][] = [];
			for (let i = 0; i < emoteKeys.length; i += 5) {
				const row: string[] = [];
				for (let j = i; j < i + 5 && j < emoteKeys.length; j++) {
					const name = emoteKeys[j];
					const emote = emoteCache[name];
					row.push(`<center><img src="${escapeHTML(emote.url)}" width="32" height="32" title="${escapeHTML(name)}"><br /><code>${escapeHTML(name)}</code></center>`);
				}
				rows.push(row);
			}

			this.sendReply(`|html|${Table('Available Emoticons', [], rows)}`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Emoticon Commands</b></center><hr>` +
				`<b>/emote add [name], [url]</b>: Add an emote.<hr>` +
				`<b>/emote delete [name]</b>: Remove an emote.<hr>` +
				`<b>/emote size [px]</b>: Set display size.<hr>` +
				`<b>/emote toggle</b>: Enable/disable in room.<hr>` +
				`<b>/emote ignore/unignore</b>: Toggle your personal view.`
			);
		},
	},
});
