import { type GameMode, type ModeConfig, type ModeData } from './types';

const defaultModeConfig: ModeConfig = {
	name: 'Pokemon Game',
	bossInterval: 10,
	startingBiome: 'Town',
	generation: 9,
	baseFormat: 'gen9sggamesingles',
	doublesFormat: 'gen9sggamedoubles',
	economy: { startingMoney: 3000 }
};

const defaultModeData: ModeData = {
	biomes: {},
	transitions: {},
	trainers: {},
	starters: [],
};

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = { 'classic': defaultModeConfig };
export const MODE_REGISTRY: Record<GameMode, ModeData> = { 'classic': defaultModeData };
