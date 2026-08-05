import { toID } from '../../../sim/dex';
import { Customization, initDB, getCustomizationTable } from './manager';
import { nameColor } from './custom-color';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/ as const;

interface SymbolColorEntry {
	color: string;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

let symbolData: Record<string, SymbolColorEntry> = {};

const SymbolColorManager = {
	async init(): Promise<void> {
		Customization.register({
			name: 'symbol-color',
			startTag: '/* CUSTOM SYMBOL COLOR START */',
			endTag: '/* CUSTOM SYMBOL COLOR END */',
			generateCSS: () => Object.entries(symbolData)
				.map(([userId, entry]) => {
					const selector = `[id$="-userlist-user-${userId}"] button > em.group`;
					const chatSelector = `[class$="chatmessage-${userId}"] strong small, .groupsymbol`;
					return `${selector} { color: ${entry.color} !important; }\n${chatSelector} { color: ${entry.color} !important; }`;
				})
				.join('\n'),
		});

		await initDB();
		const rows = await getCustomizationTable().select({}, ['user_id', 'symbol_color']);
		symbolData = {};
		for (const row of rows) {
			if (row.symbol_color) {
				symbolData[row.user_id] = {
					color: row.symbol_color,
					setBy: '',
					createdAt: 0,
					updatedAt: 0,
				};
			}
		}
	},

	async save(userid: string, entry: SymbolColorEntry | null): Promise<void> {
		await initDB();
		if (entry) {
			symbolData[userid] = entry;
			await getCustomizationTable().upsert({
				user_id: userid,
				symbol_color: entry.color,
				updated_at: Date.now(),
			}, ['user_id']);
		} else {
			delete symbolData[userid];
			await getCustomizationTable().update({ symbol_color: null }, { user_id: userid });
		}
	},

	validateColor(color: string): boolean {
		return HEX_REGEX.test(color);
	},
} as const;

void SymbolColorManager.init().catch(err => Monitor.crashlog(err, 'Custom symbol-color JSON init failed'));

export const commands: Chat.ChatCommands = {
	sc: 'symbolcolor',
	symbolcolor: {
		async set(target, room, user) {
			this.checkCan('bypassall');
			const [name, rawColor] = target.split(',').map(s => s.trim());
			if (!name || !rawColor) return this.parse('/sc help');

			const color = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (!SymbolColorManager.validateColor(color)) throw new Chat.ErrorMessage("Invalid hex color format.");
			if (symbolData[targetId]) throw new Chat.ErrorMessage("User already has a symbol color.");

			const now = Date.now();
			symbolData[targetId] = { color, setBy: user.id, createdAt: now, updatedAt: now };

			await SymbolColorManager.save(targetId, symbolData[targetId]);
			await Customization.updateCSS();

			this.sendReply(`|raw|Symbol color set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set symbol color for ${name} to <font color="${color}">${color}</font>.`);
		},

		async update(target, room, user) {
			this.checkCan('bypassall');
			const [name, rawColor] = target.split(',').map(s => s.trim());
			const targetId = toID(name);
			const color = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User does not have a symbol color.");
			if (!SymbolColorManager.validateColor(color)) throw new Chat.ErrorMessage("Invalid hex color format.");

			symbolData[targetId].color = color;
			symbolData[targetId].updatedAt = Date.now();

			await SymbolColorManager.save(targetId, symbolData[targetId]);
			await Customization.updateCSS();

			this.sendReply(`|raw|Symbol color updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated symbol color for ${name} to <font color="${color}">${color}</font>.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User has no symbol color.");

			delete symbolData[targetId];
			await SymbolColorManager.save(targetId, null);
			await Customization.updateCSS();

			this.sendReply(`Symbol color removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed symbol color for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Symbol Color Commands</b></center><hr>` +
				`<b>/sc set [user], [hex]</b>: Set a user's symbol color.<hr>` +
				`<b>/sc update [user], [hex]</b>: Update symbol color.<hr>` +
				`<b>/sc delete [user]</b>: Remove symbol color.`
			);
		},

		'': 'help',
	},
};
