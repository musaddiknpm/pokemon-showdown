import { FS } from '../../../lib/fs';
import { type GameMode, type ModeConfig, type ModeData } from './types';

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {};
export const MODE_REGISTRY: Record<GameMode, ModeData> = {};

const modsDir = FS(__dirname).path + '/mods';
const modFS = FS(modsDir);
if (modFS.existsSync() && modFS.isDirectorySync()) {
	for (const dir of modFS.readdirSync()) {
		if (FS(`${modsDir}/${dir}`).isDirectorySync()) {
			try {
				const mod = require(`./mods/${dir}/${dir}-config`);
				if (mod[`${dir}Config`] && mod[`${dir}Data`]) {
					MODE_CONFIGS[dir] = mod[`${dir}Config`];
					MODE_REGISTRY[dir] = mod[`${dir}Data`];
				}
			} catch (e) {
				console.error(`Failed to load Pokerogue mod: ${dir}`, e);
			}
		}
	}
}
