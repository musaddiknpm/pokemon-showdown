import { toID } from '../../../sim/dex';
import { Customization, initDB, getCustomizationTable } from './manager';
import { nameColor } from './custom-color';

const BLOCKED_SYMBOLS = ['', '~', '&', '#', '@', '%', '*', '+'] as const;

interface CustomSymbolEntry {
	symbol: string;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

type ValidationResult =
	| { valid: true } |
	{ valid: false, error: string };

let symbolData: Record<string, CustomSymbolEntry> = {};

const SymbolManager = {
	async init(): Promise<void> {
		Customization.register({
			name: 'symbol',
			startTag: '/* CUSTOM SYMBOL START */',
			endTag: '/* CUSTOM SYMBOL END */',
			onIdentityUpdate: (user, identity, room) => {
				const entry = symbolData[user.id];
				if (!entry) return identity;

				const { symbol } = entry;
				if (user.locked || user.namelocked) return identity;

				if (room) {
					if (room.isMuted(user)) return identity;
					const roomGroup = room.auth.get(user);
					if (roomGroup === user.tempGroup || roomGroup === ' ') return symbol + user.name;
					return roomGroup + user.name;
				}

				if (user.semilocked) return identity;

				return symbol + user.name;
			},
		});

		await initDB();
		const rows = await getCustomizationTable().select({}, ['user_id', 'symbol']);
		symbolData = {};
		for (const row of rows) {
			if (row.symbol) {
				symbolData[row.user_id] = {
					symbol: row.symbol,
					setBy: '',
					createdAt: 0,
					updatedAt: 0,
				};
			}
		}
	},

	async save(userid: string, entry: CustomSymbolEntry | null): Promise<void> {
		await initDB();
		if (entry) {
			symbolData[userid] = entry;
			await getCustomizationTable().upsert({
				user_id: userid,
				symbol: entry.symbol,
				updated_at: Date.now(),
			}, ['user_id']);
		} else {
			delete symbolData[userid];
			await getCustomizationTable().update({ symbol: null }, { user_id: userid });
		}
	},

	validate(symbol: string): ValidationResult {
		if (!symbol || symbol.length !== 1) {
			return { valid: false, error: "Symbol must be a single character." };
		}
		if ((BLOCKED_SYMBOLS as readonly string[]).includes(symbol)) {
			return { valid: false, error: `The following symbols are blocked: ${BLOCKED_SYMBOLS.join(' ')}` };
		}
		return { valid: true };
	},

	apply(userid: string): void {
		Users.get(userid)?.updateIdentity();
	},
} as const;

void SymbolManager.init().catch(err => Monitor.crashlog(err, 'Custom symbol JSON init failed'));

export const commands: Chat.ChatCommands = {
	cs: 'symbol',
	customsymbol: 'symbol',
	symbol: {
		async set(target, room, user) {
			this.checkCan('bypassall');
			const [name, symbol] = target.split(',').map(s => s.trim());
			if (!name || !symbol) return this.parse('/cs help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (symbolData[targetId]) throw new Chat.ErrorMessage("User already has a custom symbol. Use '/cs update'.");

			const validation = SymbolManager.validate(symbol);
			if (!validation.valid) throw new Chat.ErrorMessage(validation.error);

			const now = Date.now();
			symbolData[targetId] = { symbol, setBy: user.id, createdAt: now, updatedAt: now };

			await SymbolManager.save(targetId, symbolData[targetId]);
			SymbolManager.apply(targetId);

			this.sendReply(`|raw|Custom symbol set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set custom symbol for ${name} to <strong>${symbol}</strong>.`);
		},

		async update(target, room, user) {
			this.checkCan('bypassall');
			const [name, symbol] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User does not have a custom symbol.");

			const validation = SymbolManager.validate(symbol);
			if (!validation.valid) throw new Chat.ErrorMessage(validation.error);

			symbolData[targetId].symbol = symbol;
			symbolData[targetId].updatedAt = Date.now();

			await SymbolManager.save(targetId, symbolData[targetId]);
			SymbolManager.apply(targetId);

			this.sendReply(`|raw|Custom symbol updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated custom symbol for ${name} to <strong>${symbol}</strong>.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User has no custom symbol.");

			delete symbolData[targetId];
			await SymbolManager.save(targetId, null);
			SymbolManager.apply(targetId);

			this.sendReply(`Custom symbol removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed custom symbol for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Symbol Commands</b></center><hr>` +
				`<b>/cs set [user], [symbol]</b>: Set a custom symbol.<hr>` +
				`<b>/cs update [user], [symbol]</b>: Update the symbol.<hr>` +
				`<b>/cs delete [user]</b>: Remove the symbol.<hr>` +
				`<center><small>Blocked: ${BLOCKED_SYMBOLS.join(' ')}</small></center>`
			);
		},

		'': 'help',
	},
	symbolhelp: 'symbol help',
};

export const loginfilter: Chat.LoginFilter = user => {
	SymbolManager.apply(user.id);
};
