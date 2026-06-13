import * as https from 'node:https';
import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { PG } from '../../pg';

export const CONFIG_PATH = 'config/custom.css' as const;

export interface UserCustomizationRow {
	user_id: string;
	color?: string | null;
	icon_url?: string | null;
	icon_size?: number | null;
	icon_direction?: string | null;
	icon_color1?: string | null;
	icon_color2?: string | null;
	symbol?: string | null;
	symbol_color?: string | null;
	updated_at?: number | string;
}

export const getCustomizationTable = () => PG.getTable<UserCustomizationRow>('user_customization', 'user_id');

let initPromise: Promise<void> | null = null;
export const initDB = async (): Promise<void> => {
	if (!initPromise) {
		initPromise = (async () => {
			let attempts = 0;
			while (!PG.isReady && attempts < 20) {
				await new Promise(resolve => setTimeout(resolve, 500));
				attempts++;
			}
			if (!PG.isReady) {
				initPromise = null;
				return;
			}
			await PG.query(`
				CREATE TABLE IF NOT EXISTS user_customization (
					user_id TEXT PRIMARY KEY,
					color TEXT,
					icon_url TEXT,
					icon_size INTEGER,
					icon_direction TEXT,
					icon_color1 TEXT,
					icon_color2 TEXT,
					symbol TEXT,
					symbol_color TEXT,
					updated_at BIGINT NOT NULL
				);
			`);
			await PG.query(`
				ALTER TABLE user_customization 
				ADD COLUMN IF NOT EXISTS icon_direction TEXT,
				ADD COLUMN IF NOT EXISTS icon_color1 TEXT,
				ADD COLUMN IF NOT EXISTS icon_color2 TEXT;
			`);
		})();
	}
	return initPromise;
};

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

export interface CustomizationModule {
	name: string;
	startTag: string;
	endTag: string;
	generateCSS?: () => string;
	onIdentityUpdate?: (user: User, identity: string, room: BasicRoom | null) => string;
}

export class CustomizationManager {
	readonly modules = new Map<string, CustomizationModule>();
	private initialized = false;
	private updateTimer: NodeJS.Timeout | null = null;
	private isUpdating = false;
	private updatePending = false;

	register(module: CustomizationModule): void {
		this.modules.set(module.name, module);
	}

	updateCSS(): Promise<void> {
		if (this.updateTimer) clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(() => {
			void this._performCSSUpdate();
		}, 2000);
		return Promise.resolve();
	}

	private async _performCSSUpdate(): Promise<void> {
		if (this.isUpdating) {
			this.updatePending = true;
			return;
		}
		this.isUpdating = true;
		this.updatePending = false;

		try {
			let css = await FS(CONFIG_PATH).readIfExists();

			for (const module of this.modules.values()) {
				if (!module.generateCSS) continue;

				const content = module.generateCSS();
				const block = `${module.startTag}\n${content}\n${module.endTag}`;

				if (!css.includes(module.startTag)) {
					css = `${css.trimEnd()}\n\n${block}\n`;
				} else {
					const startIndex = css.indexOf(module.startTag);
					const endIndex = css.indexOf(module.endTag) + module.endTag.length;
					css = css.slice(0, startIndex) + block + css.slice(endIndex);
				}
			}

			await FS(CONFIG_PATH).safeWrite(css);
			reloadCSS();
		} finally {
			this.isUpdating = false;
			if (this.updatePending) {
				void this._performCSSUpdate();
			}
		}
	}

	getIdentity(user: User, identity: string, room: BasicRoom | null = null): string {
		let newIdentity = identity;
		for (const module of this.modules.values()) {
			if (module.onIdentityUpdate) {
				newIdentity = module.onIdentityUpdate(user, newIdentity, room);
			}
		}
		return newIdentity;
	}

	init(): void {
		if (this.initialized) return;
		this.initialized = true;

		interface CustomUser extends User {
			_originalGetIdentity?: (room: BasicRoom | null) => string;
		}
		const userProto = Users.User.prototype as CustomUser;

		if (!userProto._originalGetIdentity) {
			userProto._originalGetIdentity = Users.User.prototype.getIdentity;
		}

		const originalGetIdentity = userProto._originalGetIdentity;
		Users.User.prototype.getIdentity = function (this: User, room: BasicRoom | null = null) {
			const identity = originalGetIdentity.call(this, room);
			if (typeof Customization !== 'undefined') return Customization.getIdentity(this, identity, room);
			return identity;
		};
	}

	notify(setter: User, targetName: string, action: string, message: string): void {
		Rooms.get('staff')
			?.add(`|html|<div class="infobox"><b>${Utils.escapeHTML(setter.name)}</b> ${message}</div>`)
			.update();

		const targetUser = Users.get(toID(targetName));
		if (targetUser?.connected) {
			targetUser.popup(`|html|${Utils.escapeHTML(setter.name)} has ${action} your customization.<br />${message}`);
		}
	}
}

export const Customization = new CustomizationManager();

declare global {
	var Customization: CustomizationManager;
}

global.Customization = Customization;

Customization.init();
