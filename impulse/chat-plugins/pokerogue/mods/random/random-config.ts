import { type ModeConfig, type ModeData, type PokeRogueState, type TrainerMon } from '../../types';

import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from '../classic/biomes';
import { TRAINERS as ClassicTrainers } from '../classic/trainers';
import { CLASSIC_STARTERS } from '../classic/classic-config';
import { CLASSIC_BOSSES } from '../classic/classic-bosses';

export const randomConfig: ModeConfig = {
	progression: false,
	biomeRotationInterval: 10,
	bossInterval: 10,
	hasTrainers: true,
	randomizeMoves: true,
	randomizeAbilities: true,
	startingBiome: 'Town',
	starterLevel: 5,
	generation: 9,
	baseFormat: '[Gen 9] PokeRogue',
	doublesFormat: '[Gen 9] PokeRogue Doubles',
	economy: {
		startingMoney: 10000,
		startingKeyItems: { 'Exp. All': 2, 'Exp. Charm': 1 },
		startingInventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
	},

	mechanicUnlocks: {
		terastallize: 25,
	},

	milestoneRewards: [
		{ floor: 8, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		{ floor: 8, interval: false, itemType: 'keyItem', itemName: 'Exp. All', amount: 1 },
		{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		{ floor: 25, interval: false, itemType: 'keyItem', itemName: 'Exp. All', amount: 1 },
		{ floor: 25, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		{ floor: 50, interval: true, itemType: 'voucher', itemName: 'plus', amount: 1 },
		{ floor: 200, interval: true, itemType: 'voucher', itemName: 'gold', amount: 1 },
	],

	lastBiome: {
		biome: 'End',
		floor: '191-200',
	},

	victoryConfig: {
		name: 'Champion',
		dialog: 'You have conquered all 200 floors of the Random run! A true master of chaos!',
	},
};

export const randomData: ModeData = {
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: ClassicTrainers,
	starters: CLASSIC_STARTERS,
	excludedBiomes: ['End'],

	resolveTrainer: (floor: number, state: PokeRogueState, config: ModeConfig) => {
		const trainers = ClassicTrainers;
		if (!trainers) return null;

		const floorKey = `Floor_${floor}`;
		if (trainers[floorKey]) {
			const trainerNames = Object.keys(trainers[floorKey]);
			const selectedName = trainerNames[Math.floor(Math.random() * trainerNames.length)];
			return { key: floorKey, name: selectedName };
		}

		const gymInterval = 30;

		if (!state.firstGymLeaderWave) {
			state.firstGymLeaderWave = Math.random() < 0.5 ? 20 : 30;
		}

		if (floor >= state.firstGymLeaderWave && (floor - state.firstGymLeaderWave) % gymInterval === 0) {
			const gymKeys = Object.keys(trainers).filter(k => k.startsWith('GYM_'));
			if (gymKeys.length > 0) {
				let targetTier = '1';
				if (floor >= 50 && floor < 100) targetTier = '3';
				if (floor >= 100) targetTier = '5';

				const scaledGymKey = gymKeys.find(k => k.includes(`tier_${targetTier}`)) || gymKeys[0];
				const gymTrainers = Object.keys(trainers[scaledGymKey]);

				if (gymTrainers.length > 0) {
					const selectedGymTrainer = gymTrainers[Math.floor(Math.random() * gymTrainers.length)];
					return { key: scaledGymKey, name: selectedGymTrainer };
				}
			}
		}

		if (state.currentBiome === config.startingBiome) return null;

		const lastTrainer = state.lastTrainerFloor || -99;
		if (floor - lastTrainer < 3) return null;

		if (Math.random() > 0.10) return null;

		const currentBiome = state.currentBiome || config.startingBiome;
		const validTrainers: { key: string, name: string, chance: number }[] = [];
		let totalChance = 0;

		for (const [categoryKey, categoryData] of Object.entries(trainers)) {
			if (categoryKey.startsWith('Floor_')) continue;
			if (categoryKey.startsWith('GYM_')) continue;

			if (categoryKey.startsWith('STANDARD_early') && floor > 30) continue;
			if (categoryKey.startsWith('STANDARD_mid') && (floor <= 30 || floor > 100)) continue;
			if (categoryKey.startsWith('STANDARD_late') && floor <= 100) continue;

			for (const [trainerName, trainerData] of Object.entries(categoryData)) {
				if (trainerData.biome) {
					const allowedBiomes = Array.isArray(trainerData.biome) ? trainerData.biome : [trainerData.biome];
					if (!allowedBiomes.includes(currentBiome)) {
						continue;
					}
				}

				const chanceWeight = trainerData.chance ?? 10;
				validTrainers.push({ key: categoryKey, name: trainerName, chance: chanceWeight });
				totalChance += chanceWeight;
			}
		}

		if (validTrainers.length > 0) {
			state.lastTrainerFloor = floor;

			let roll = Math.random() * totalChance;
			for (const trainer of validTrainers) {
				roll -= trainer.chance;
				if (roll <= 0) {
					return { key: trainer.key, name: trainer.name };
				}
			}
			return { key: validTrainers[validTrainers.length - 1].key, name: validTrainers[validTrainers.length - 1].name };
		}

		return null;
	},

	resolveBoss: (floor: number, currentBiome: string, config: ModeConfig): TrainerMon[] | null => {
		const floorKey = floor.toString();

		if (CLASSIC_BOSSES[floorKey]) {
			const bossNames = Object.keys(CLASSIC_BOSSES[floorKey]);
			const selectedBoss = bossNames[Math.floor(Math.random() * bossNames.length)];
			return CLASSIC_BOSSES[floorKey][selectedBoss].pool;
		}

		return null;
	},
};
