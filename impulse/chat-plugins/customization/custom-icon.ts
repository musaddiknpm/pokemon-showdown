import { wrapCommands } from '../../impulse-utils';
import { Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization, initDB, getCustomizationTable } from './manager';
import { nameColor } from './custom-color';

const DEFAULTS = {
	SIZE: 24,
	MIN: 1,
	MAX: 100,
	DIRECTION: 'none',
	COLOR1: '#ff0000',
	COLOR2: '#b30000',
} as const;

interface IconEntry {
	url: string;
	size: number;
	direction: string;
	color1: string;
	color2: string;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

let iconData: Record<string, IconEntry> = {};

export const IconManager = {
	async init(): Promise<void> {
		Customization.register({
			name: 'icon',
			startTag: '/* CUSTOM ICON START */',
			endTag: '/* CUSTOM ICON END */',
			generateCSS: () => Object.entries(iconData)
				.map(([userId, entry]) => {
					const size = entry.size || DEFAULTS.SIZE;
					const dir = entry.direction || DEFAULTS.DIRECTION;
					const c1 = entry.color1 || DEFAULTS.COLOR1;
					const c2 = entry.color2 || DEFAULTS.COLOR2;
					
					if (dir === 'none') {
						return `[id$="-userlist-user-${userId}"] { ` +
							`background-image: url("${entry.url}") !important; ` +
							`background-repeat: no-repeat !important; ` +
							`background-position: right 5px center !important; ` +
							`background-size: ${size}px auto !important; ` +
						`}`;
					}

					const gradient = dir === 'center'
						? `radial-gradient(circle, ${c1}, ${c2})`
						: `linear-gradient(${dir}, ${c1}, ${c2})`;

					return `[id$="-userlist-user-${userId}"] { ` +
						`background-image: url("${entry.url}"), ${gradient} !important; ` +
						`background-repeat: no-repeat, no-repeat !important; ` +
						`background-position: right 5px center, center !important; ` +
						`background-size: ${size}px auto, 100% 100% !important; ` +
					`}`;
				})
				.join('\n'),
		});

		await initDB();
		const rows = await getCustomizationTable().select({}, [
			'user_id', 'icon_url', 'icon_size', 'icon_direction', 'icon_color1', 'icon_color2'
		]);
		
		iconData = {};
		for (const row of rows) {
			if (row.icon_url) {
				iconData[row.user_id] = {
					url: row.icon_url,
					size: row.icon_size || DEFAULTS.SIZE,
					direction: row.icon_direction || DEFAULTS.DIRECTION,
					color1: row.icon_color1 || DEFAULTS.COLOR1,
					color2: row.icon_color2 || DEFAULTS.COLOR2,
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
				icon_direction: entry.direction,
				icon_color1: entry.color1,
				icon_color2: entry.color2,
				updated_at: Date.now()
			}, ['user_id']);
		} else {
			delete iconData[userid];
			await getCustomizationTable().update({ 
				icon_url: null, 
				icon_size: null, 
				icon_direction: null, 
				icon_color1: null, 
				icon_color2: null 
			}, { user_id: userid });
		}
	},

	validateSize(sizeStr: string) {
		if (!sizeStr) return { valid: true, size: DEFAULTS.SIZE };
		const size = parseInt(sizeStr, 10);
		if (isNaN(size) || size < DEFAULTS.MIN || size > DEFAULTS.MAX) {
			return { valid: false, error: `Size must be an integer between ${DEFAULTS.MIN} and ${DEFAULTS.MAX}.` };
		}
		return { valid: true, size };
	}
};

export const commands: Chat.ChatCommands = {
	icon: {
		async set(target, room, user) {
			this.checkCan('bypassall');
			const [name, url, sizeStr, directionStr, color1, color2] = target.split(',').map(s => s.trim());
			if (!name || !url) return this.parse('/icon help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (iconData[targetId]) throw new Chat.ErrorMessage("User already has an icon. Use '/icon update'.");

			const result = IconManager.validateSize(sizeStr);
			if (!result.valid) return this.errorReply(result.error);

			const direction = directionStr || DEFAULTS.DIRECTION; 
			const c1 = color1 || DEFAULTS.COLOR1;
			const c2 = color2 || DEFAULTS.COLOR2;

			const colorRegex = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/;
			if (color1 && !colorRegex.test(c1)) throw new Chat.ErrorMessage("Invalid format for Color 1.");
			if (color2 && !colorRegex.test(c2)) throw new Chat.ErrorMessage("Invalid format for Color 2.");

			const now = Date.now();
			iconData[targetId] = {
				url,
				size: result.size,
				direction, 
				color1: c1,
				color2: c2,
				setBy: user.id,
				createdAt: now,
				updatedAt: now,
			};

			await IconManager.save(targetId, iconData[targetId]);
			await Customization.updateCSS();

			this.sendReply(`|raw|Icon configuration set for ${nameColor(name, true)}.`);
		},

		async update(target, room, user) {
			this.checkCan('bypassall');
			const [name, url, sizeStr, directionStr, color1, color2] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!iconData[targetId]) throw new Chat.ErrorMessage("This user does not have an icon set.");

			const colorRegex = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/;

			if (url) iconData[targetId].url = url;
			if (sizeStr) {
				const result = IconManager.validateSize(sizeStr);
				if (result.valid) iconData[targetId].size = result.size;
			}
			if (directionStr) iconData[targetId].direction = directionStr;
			if (color1 && colorRegex.test(color1)) iconData[targetId].color1 = color1;
			if (color2 && colorRegex.test(color2)) iconData[targetId].color2 = color2;

			iconData[targetId].updatedAt = Date.now();
			await IconManager.save(targetId, iconData[targetId]);
			await Customization.updateCSS();

			this.sendReply(`|raw|Icon configuration updated for ${nameColor(name, true)}.`);
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			const targetId = toID(target);
			if (!targetId) return this.parse('/icon help');

			if (!iconData[targetId]) throw new Chat.ErrorMessage("This user does not have an icon set.");

			await IconManager.save(targetId, null);
			await Customization.updateCSS();

			this.sendReply(`Icon deleted for user: ${targetId}.`);
		},

		help: [
			`Syntax options for /icon settings:`,
			`/icon set [user], [url], [size]` +
			` - Sets only a floating userlist sprite icon on the right edge.`,
			`/icon set [user], [url], [size], [direction], [color1], [color2]` +
			` - Sets an icon centered along with custom styling gradients. (Directions: to right, to left, to bottom, center).`,
			`/icon update [user], [url], [size], [direction], [color1], [color2]` +
			` - Selectively modifies properties. Leave commas empty to skip configurations. Use 'none' as direction to drop a background gradient.`,
			`/icon delete [user] - Wipes custom styling variables assigned to an individual user configuration row.`
		],
	},
};
