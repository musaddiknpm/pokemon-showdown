import * as crypto from 'node:crypto';
import { escapeHTML } from '../../../lib/utils';
import { toID } from '../../../sim/dex';
import { Customization, initDB, getCustomizationTable } from './manager';

let customColors: Record<string, string> = {};
const colorCache: Record<string, string> = {};

const ColorManager = {
	async init(): Promise<void> {
		Customization.register({
			name: 'color',
			startTag: '/* CUSTOM COLOR START */',
			endTag: '/* CUSTOM COLOR END */',
			generateCSS: () => Object.entries(customColors)
				.map(([id, color]) => ColorManager.generateCSS(id, color))
				.join('\n'),
		});

		const connected = await initDB();
		if (!connected) return;
		const rows = await getCustomizationTable().select({}, ['user_id', 'color']);
		customColors = {};
		for (const row of rows) {
			if (row.color) customColors[row.user_id] = row.color;
		}
	},

	async save(userid: string, color: string | null): Promise<void> {
		await initDB();
		if (color) {
			customColors[userid] = color;
			await getCustomizationTable().upsert({
				user_id: userid,
				color,
				updated_at: Date.now(),
			}, ['user_id']);
		} else {
			delete customColors[userid];
			await getCustomizationTable().update({ color: null }, { user_id: userid });
		}
	},

	validateHex(color: string): boolean {
		return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
	},

	hslToRgb(h: number, s: number, l: number): string {
		const c = (100 - Math.abs(2 * l - 100)) * s / 100 / 100;
		const x = c * (1 - Math.abs((h / 60) % 2 - 1));
		const m = l / 100 - c / 2;
		let r = 0, g = 0, b = 0;

		const hCase = Math.floor(h / 60);
		if (hCase === 0) {
			r = c; g = x;
		} else if (hCase === 1) {
			r = x; g = c;
		} else if (hCase === 2) {
			g = c; b = x;
		} else if (hCase === 3) {
			g = x; b = c;
		} else if (hCase === 4) {
			r = x; b = c;
		} else if (hCase === 5) {
			r = c; b = x;
		}

		const toHex = (val: number): string =>
			Math.round((val + m) * 255).toString(16).padStart(2, '0');

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	},

	generateCSS(userid: string, color: string): string {
		const selector = [
			`[class$="chatmessage-${userid}"] strong`,
			`[class$="chatmessage-${userid} mine"] strong`,
			`[class$="chatmessage-${userid} highlighted"] strong`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) strong`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) strong em`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) span`,
		].join(', ');
		return `${selector} { color: ${color} !important; }`;
	},
} as const;

void ColorManager.init().catch(err => Monitor.warn(`Custom color JSON init failed: ${(err as Error).message}`));

export const hashColor = (name: string): string => {
	const id = toID(name);
	if (customColors[id]) return customColors[id];
	if (colorCache[id]) return colorCache[id];

	const hash = crypto.createHash('md5').update(id).digest('hex');
	const h = parseInt(hash.slice(4, 8), 16) % 360;
	const s = (parseInt(hash.slice(0, 4), 16) % 50) + 40;
	const l = Math.floor(parseInt(hash.slice(8, 12), 16) % 20 + 30);

	const color = ColorManager.hslToRgb(h, s, l);
	colorCache[id] = color;
	return color;
};

export const nameColor = (name: string, bold = true, userGroup = false): string => {
	const userId = toID(name);
	const symbol = userGroup && Users.globalAuth.get(userId) ?
		`<font color="#948A88">${Users.globalAuth.get(userId)}</font>` :
		'';
	const userName = escapeHTML(Users.getExact(name)?.name || name);
	return `${symbol}${bold ? '<b>' : ''}<font color="${hashColor(name)}">${userName}</font>${bold ? '</b>' : ''}`;
};

export const reloadCSS = async (): Promise<void> => {
	await ColorManager.init();
	for (const key in colorCache) delete colorCache[key];
	await Customization.updateCSS();
};

export const commands: Chat.ChatCommands = {
	cc: 'customcolor',
	customcolor: {
		async set(target, room, user) {
			this.checkCan('bypassall');
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !color) return this.parse('/cc help');

			const targetId = toID(name);
			if (!ColorManager.validateHex(color)) throw new Chat.ErrorMessage("The hex color format is invalid. Please use the format #RRGGBB.");

			customColors[targetId] = color;
			colorCache[targetId] = color;
			await ColorManager.save(targetId, color);
			await Customization.updateCSS();

			Customization.notify(user, name, 'set', `set custom color for <b>${escapeHTML(name)}</b> to <font color="${color}">${color}</font>.`);
			this.sendReply(`|raw|The custom color for <b><font color="${color}">${escapeHTML(name)}</font></b> has been set.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);
			if (!customColors[targetId]) throw new Chat.ErrorMessage(`${target} doesn't have a custom color set.`);

			delete customColors[targetId];
			delete colorCache[targetId];
			await ColorManager.save(targetId, null);
			await Customization.updateCSS();

			Customization.notify(user, target, 'removed', `removed custom color for <b>${targetId}</b>.`);
			this.sendReply(`The custom color for ${targetId} has been removed.`);
		},

		preview(target) {
			this.checkBroadcast();
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !ColorManager.validateHex(color)) throw new Chat.ErrorMessage("Invalid usage. The correct format is: /cc preview [user], [hex].");
			this.sendReplyBox(`<b><font size="3" color="${color}">${escapeHTML(name)}</font></b>`);
		},

		async reload(target, room, user) {
			this.checkCan('bypassall');
			await reloadCSS();
			this.privateModAction(`(${user.name} has reloaded the custom colors.)`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Color Commands</b></center><hr>` +
				`<b>/cc set [user], [hex]</b>: Sets a custom color for a user.<hr>` +
				`<b>/cc delete [user]</b>: Removes a user's custom color.<hr>` +
				`<b>/cc preview [user], [hex]</b>: Previews a custom color for a user.`
			);
		},
	},
};
