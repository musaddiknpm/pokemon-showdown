import { wrapCommands } from '../../impulse-utils';
import { Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization, initDB, getCustomizationTable } from './manager';
import { nameColor } from './custom-color';

const DEFAULTS = {
	SIZE: 24,
	MIN: 1,
	MAX: 100,
} as const;

interface IconEntry {
	url: string;
	size: number;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

type ValidationResult =
	| { valid: true, size: number }
	| { valid: false, size: 0, error: string };

let iconData: Record<string, IconEntry> = {};

const IconManager = {
	async init(): Promise<void> {
		Customization.register({
			name: 'icon',
			startTag: '/* CUSTOM ICON START */',
			endTag: '/* CUSTOM ICON END */',
			generateCSS: () => Object.entries(iconData)
				.map(([userId, entry]) => {
					const size = entry.size || DEFAULTS.SIZE;
					return `[id$="-userlist-user-${userId}"] { background: url("${entry.url}") right no-repeat !important; background-size: ${size}px !important; }`;
				})
				.join('\n'),
		});

		await initDB();
		const rows = await getCustomizationTable().select({}, ['user_id', 'icon_url', 'icon_size']);
		iconData = {};
		for (const row of rows) {
			if (row.icon_url) {
				iconData[row.user_id] = {
					url: row.icon_url,
					size: row.icon_size || DEFAULTS.SIZE,
					setBy: '',
					createdAt: 0,
					updatedAt: 0,
				};
			}
		}
	},

	async save(userid: string, entry: IconEntry | null): Promise<void> {
		await initDB();
		if (entry) {
			iconData[userid] = entry;
			await getCustomizationTable().upsert({
				user_id: userid,
				icon_url: entry.url,
				icon_size: entry.size,
				updated_at: Date.now()
			}, ['user_id']);
		} else {
			delete iconData[userid];
			await getCustomizationTable().update({ icon_url: null, icon_size: null }, { user_id: userid });
		}
	},

	validateSize(sizeStr?: string): ValidationResult {
		if (!sizeStr) return { valid: true, size: DEFAULTS.SIZE };
		const size = parseInt(sizeStr);
		if (isNaN(size) || size < DEFAULTS.MIN || size > DEFAULTS.MAX) {
			return { valid: false, size: 0, error: `Invalid size. Use ${DEFAULTS.MIN}-${DEFAULTS.MAX}px.` };
		}
		return { valid: true, size };
	},
} as const;

void IconManager.init().catch(err => Monitor.crashlog(err, 'Custom icon JSON init failed'));

export const commands: Chat.ChatCommands = wrapCommands({
	ic: 'icon',
	usericon: 'icon',
	icon: {
		async set(target, room, user) {
			this.checkCan('bypassall');
			const [name, url, sizeStr] = target.split(',').map(s => s.trim());
			if (!name || !url) return this.parse('/icon help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (iconData[targetId]) throw new Chat.ErrorMessage("User already has an icon. Use '/icon update' or '/icon delete'.");

			const result = IconManager.validateSize(sizeStr);
			if (!result.valid) return this.errorReply(result.error);

			const now = Date.now();
			iconData[targetId] = {
				url,
				size: result.size,
				setBy: user.id,
				createdAt: now,
				updatedAt: now,
			};

			await IconManager.save(targetId, iconData[targetId]);
			await Customization.updateCSS();

			const sizeInfo = result.size !== DEFAULTS.SIZE ? ` (${result.size}px)` : '';
			this.sendReply(`|raw|Icon set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set userlist icon for ${name}${sizeInfo}.`);
		},

		async update(target, room, user) {
			this.checkCan('bypassall');
			const [name, url, sizeStr] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!iconData[targetId]) throw new Chat.ErrorMessage("This user does not have an icon set.");

			if (url) iconData[targetId].url = url;
			if (sizeStr) {
				const result = IconManager.validateSize(sizeStr);
				if (!result.valid) return this.errorReply(result.error);
				iconData[targetId].size = result.size;
			}

			iconData[targetId].updatedAt = Date.now();
			await IconManager.save(targetId, iconData[targetId]);
			await Customization.updateCSS();

			this.sendReply(`|raw|Icon updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated userlist icon for ${name}.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);

			if (!iconData[targetId]) throw new Chat.ErrorMessage("User has no icon.");

			delete iconData[targetId];
			await IconManager.save(targetId, null);
			await Customization.updateCSS();

			this.sendReply(`Icon removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed userlist icon for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Icon Commands</b></center><hr>` +
				`<b>/icon set [user], [url], [size]</b>: Set a user's icon (${DEFAULTS.MIN}-${DEFAULTS.MAX}px).<hr>` +
				`<b>/icon update [user], [url], [size]</b>: Update an existing icon.<hr>` +
				`<b>/icon delete [user]</b>: Remove an icon.`
			);
		},
	},
	iconhelp: 'icon help',
});
