import { type PokemonEntry, type ModeConfig, type ModeData, type BiomeEntry, type TrainerMon, type PokeRogueState, type StatTable, type RarityTier } from './types';
import { BASE_EXP, GROWTH_RATES } from './pokemon-basic-data';
import { SHOP_ITEMS } from './items';

export interface AIPokemonSet {
	species: string;
	name: string;
	level: number;
	ability: string;
	nature: string;
	ivs: StatTable;
	evs: StatTable;
	item: string;
	shiny: boolean;
	teraType: string;
	moves: string[];
	gender: string;
}

const expLevels = [
	[0, 15, 52, 122, 237, 406, 637, 942, 1326, 1800, 2369, 3041, 3822, 4719, 5737, 6881, 8155, 9564, 11111, 12800, 14632, 16610, 18737, 21012, 23437, 26012, 28737, 31610, 34632, 37800, 41111, 44564, 48155, 51881, 55737, 59719, 63822, 68041, 72369, 76800, 81326, 85942, 90637, 95406, 100237, 105122, 110052, 115015, 120001, 125000, 131324, 137795, 144410, 151165, 158056, 165079, 172229, 179503, 186894, 194400, 202013, 209728, 217540, 225443, 233431, 241496, 249633, 257834, 267406, 276458, 286328, 296358, 305767, 316074, 326531, 336255, 346965, 357812, 367807, 378880, 390077, 400293, 411686, 423190, 433572, 445239, 457001, 467489, 479378, 491346, 501878, 513934, 526049, 536557, 548720, 560922, 571333, 583539, 591882, 600000],
	[0, 6, 21, 51, 100, 172, 274, 409, 583, 800, 1064, 1382, 1757, 2195, 2700, 3276, 3930, 4665, 5487, 6400, 7408, 8518, 9733, 11059, 12500, 14060, 15746, 17561, 19511, 21600, 23832, 26214, 28749, 31443, 34300, 37324, 40522, 43897, 47455, 51200, 55136, 59270, 63605, 68147, 72900, 77868, 83058, 88473, 94119, 100000, 106120, 112486, 119101, 125971, 133100, 140492, 148154, 156089, 164303, 172800, 181584, 190662, 200037, 209715, 219700, 229996, 240610, 251545, 262807, 274400, 286328, 298598, 311213, 324179, 337500, 351180, 365226, 379641, 394431, 409600, 425152, 441094, 457429, 474163, 491300, 508844, 526802, 545177, 563975, 583200, 602856, 622950, 643485, 664467, 685900, 707788, 730138, 752953, 776239, 800000],
	[0, 8, 27, 64, 125, 216, 343, 512, 729, 1000, 1331, 1728, 2197, 2744, 3375, 4096, 4913, 5832, 6859, 8000, 9261, 10648, 12167, 13824, 15625, 17576, 19683, 21952, 24389, 27000, 29791, 32768, 35937, 39304, 42875, 46656, 50653, 54872, 59319, 64000, 68921, 74088, 79507, 85184, 91125, 97336, 103823, 110592, 117649, 125000, 132651, 140608, 148877, 157464, 166375, 175616, 185193, 195112, 205379, 216000, 226981, 238328, 250047, 262144, 274625, 287496, 300763, 314432, 328509, 343000, 357911, 373248, 389017, 405224, 421875, 438976, 456533, 474552, 493039, 512000, 531441, 551368, 571787, 592704, 614125, 636056, 658503, 681472, 704969, 729000, 753571, 778688, 804357, 830584, 857375, 884736, 912673, 941192, 970299, 1000000],
	[0, 9, 57, 96, 135, 179, 236, 314, 419, 560, 742, 973, 1261, 1612, 2035, 2535, 3120, 3798, 4575, 5460, 6458, 7577, 8825, 10208, 11735, 13411, 15244, 17242, 19411, 21760, 24294, 27021, 29949, 33084, 36435, 40007, 43808, 47846, 52127, 56660, 61450, 66505, 71833, 77440, 83335, 89523, 96012, 102810, 109923, 117360, 125126, 133229, 141677, 150476, 159635, 169159, 179056, 189334, 199999, 211060, 222522, 234393, 246681, 259392, 272535, 286115, 300140, 314618, 329555, 344960, 360838, 377197, 394045, 411388, 429235, 447591, 466464, 485862, 505791, 526260, 547274, 568841, 590969, 613664, 636935, 660787, 685228, 710266, 735907, 762160, 789030, 816525, 844653, 873420, 902835, 932903, 963632, 995030, 1027103, 1059860],
	[0, 10, 33, 80, 156, 270, 428, 640, 911, 1250, 1663, 2160, 2746, 3430, 4218, 5120, 6141, 7290, 8573, 10000, 11576, 13310, 15208, 17280, 19531, 21970, 24603, 27440, 30486, 33750, 37238, 40960, 44921, 49130, 53593, 58320, 63316, 68590, 74148, 80000, 86151, 92610, 99383, 106480, 113906, 121670, 129778, 138240, 147061, 156250, 165813, 175760, 186096, 196830, 207968, 219520, 231491, 243890, 256723, 270000, 283726, 297910, 312558, 327680, 343281, 359370, 375953, 393040, 410636, 428750, 447388, 466560, 486271, 506530, 527343, 548720, 570666, 593190, 616298, 640000, 664301, 689210, 714733, 740880, 767656, 795070, 823128, 851840, 881211, 911250, 941963, 973360, 1005446, 1038230, 1071718, 1105920, 1140841, 1176490, 1212873, 1250000],
	[0, 4, 13, 32, 65, 112, 178, 276, 393, 540, 745, 967, 1230, 1591, 1957, 2457, 3046, 3732, 4526, 5440, 6482, 7666, 9003, 10506, 12187, 14060, 16140, 18439, 20974, 23760, 26811, 30146, 33780, 37731, 42017, 46656, 50653, 55969, 60505, 66560, 71677, 78533, 84277, 91998, 98415, 107069, 114205, 123863, 131766, 142500, 151222, 163105, 172697, 185807, 196322, 210739, 222231, 238036, 250562, 267840, 281456, 300293, 315059, 335544, 351520, 373744, 390991, 415050, 433631, 459620, 479600, 507617, 529063, 559209, 582187, 614566, 639146, 673863, 700115, 737280, 765275, 804997, 834809, 877201, 908905, 954084, 987754, 1035837, 1071552, 1122660, 1160499, 1214753, 1254796, 1312322, 1354652, 1415577, 1460276, 1524731, 1571884, 1640000],
];

const BANNED_ABILITIES = new Set([
	'truant', 'slowstart', 'defeatist', 'stall', 'klutz', 'illuminate',
	'runaway', 'honeygather', 'pickup', 'frisk',
]);

const STRONG_ABILITIES = new Set([
	'speedboost', 'drizzle', 'drought', 'sandstream', 'snowwarning',
	'intimidate', 'download', 'protean', 'libero', 'magicguard',
	'wonderguard', 'multiscale', 'roughskin', 'adaptability',
	'toughclaws', 'sheerforce', 'hugepower', 'purepower', 'contrary',
	'regenerator', 'toxicboost', 'guts', 'swiftswim', 'chlorophyll',
	'sandforce', 'sandrush', 'unburden', 'trickster', 'prankster',
	'analytic', 'technician', 'serenegrace', 'strongjaw', 'megalauncher',
	'pixilate', 'aerilate', 'refrigerate', 'galvanize', 'liquidvoice',
]);

const GOOD_STATUS_MOVES = new Set([
	'thunderwave', 'willowisp', 'toxic', 'spore', 'sleeppowder',
	'swordsdance', 'nastyplot', 'dragondance', 'calmmind', 'quiverdance',
	'shellsmash', 'recover', 'roost', 'softboiled', 'moonlight',
	'morningsun', 'synthesis', 'stealthrock', 'slackoff', 'milkdrink',
	'lifedew', 'healorder', 'shoreup', 'wish', 'protect',
	'bulkup', 'coilingcurrent', 'tidyup', 'victorydance', 'growl',
]);

const EVO_TYPE_FALLBACK_LEVEL: Partial<Record<string, number>> = {
	trade: 36, useItem: 36, levelFriendship: 20,
	levelMove: 30, levelExtra: 20, levelHold: 30,
};

export function canLearnTM(speciesId: string, moveId: string): boolean {
	let canLearn = false;
	let spData = Dex.species.get(speciesId);

	while (spData && !canLearn) {
		const learnsetData = Dex.species.getLearnsetData(spData.id)?.learnset;
		if (learnsetData?.[moveId]) canLearn = true;

		if (spData.prevo) {
			spData = Dex.species.get(spData.prevo);
		} else if (spData.baseSpecies && toID(spData.baseSpecies) !== spData.id) {
			spData = Dex.species.get(spData.baseSpecies);
		} else {
			break;
		}
	}
	return canLearn;
}

function weightedPick(pool: BiomeEntry[]): string {
	let totalWeight = 0;
	for (const entry of pool) totalWeight += entry.weight;
	let roll = Math.random() * totalWeight;
	for (const entry of pool) {
		roll -= entry.weight;
		if (roll < 0) return entry.species;
	}
	return pool[pool.length - 1].species;
}

export function getBaseSpecies(speciesId: string): string {
	let currentId = toID(speciesId);
	while (true) {
		const sp = Dex.species.get(currentId);
		if (sp.prevo) {
			currentId = toID(sp.prevo);
		} else if (sp.baseSpecies && toID(sp.baseSpecies) !== currentId) {
			currentId = toID(sp.baseSpecies);
		} else {
			break;
		}
	}
	return currentId;
}

export function getExpYield(speciesId: string): number {
	const id = toID(speciesId);
	if (BASE_EXP[id]) return BASE_EXP[id];

	const sp = Dex.species.get(id);
	if (!sp.exists) return 70;
	const bs = sp.baseStats ?? { hp: 45, atk: 45, def: 45, spa: 45, spd: 45, spe: 45 };
	return Math.round((bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe) / 3.5);
}

export function getExpType(speciesId: string): string {
	const id = toID(speciesId);
	if (GROWTH_RATES[id]) return GROWTH_RATES[id];

	const sp = Dex.species.get(id);
	if (sp.exists && sp.baseSpecies) {
		const baseId = toID(sp.baseSpecies);
		if (baseId !== id && GROWTH_RATES[baseId]) return GROWTH_RATES[baseId];
	}

	if (sp.exists) {
		const bs = sp.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		if (bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe >= 580) return 'Slow';
	}
	return 'Medium Fast';
}

function getMediumFastExp(level: number): number {
	if (level <= 100) return expLevels[2][level - 1];
	return Math.floor(level ** 3);
}

export function expForLevel(level: number, expType = 'Medium Fast'): number {
	if (level <= 1) return 0;

	const rateIdx = { Erratic: 0, Fast: 1, 'Medium Fast': 2, 'Medium Slow': 3, Slow: 4, Fluctuating: 5 }[expType] ?? 2;

	if (level <= 100) {
		const levelExp = expLevels[rateIdx][level - 1];
		return rateIdx === 2 ? levelExp : Math.floor(levelExp * 0.325 + getMediumFastExp(level) * 0.675);
	}

	if (expType === 'Medium Fast') return Math.floor(level ** 3);

	const raw = {
		Erratic: (level ** 4 + level ** 3 * 2000) / 3500,
		Fast: (level ** 3 * 4) / 5,
		'Medium Slow': (level ** 3 * 6) / 5 - 15 * level ** 2 + 100 * level - 140,
		Slow: (level ** 3 * 5) / 4,
		Fluctuating: (level ** 3 * (level / 2 + 8) * 4) / (100 + level),
	}[expType] ?? (level ** 3);

	return Math.floor(raw * 0.325 + getMediumFastExp(level) * 0.675);
}

export function calcKillExp(
	enemySpeciesId: string,
	enemyLevel: number,
	participantsCount: number,
	isBossFloor: boolean,
	hasLuckyEgg = false,
	isTrainer = false
): number {
	const b = getExpYield(enemySpeciesId);
	const L = enemyLevel;
	const s = Math.max(1, participantsCount);

	const a = (isBossFloor || isTrainer) ? 1.5 : 1;

	let expValue = Math.floor((b * L) / 5 + 1);
	expValue = Math.floor(expValue * a);
	expValue = Math.floor(expValue / s);

	if (hasLuckyEgg) {
		expValue = Math.floor(expValue * 1.5);
	}

	return Math.max(1, expValue);
}

export function getLevelScaling(floor: number, config?: ModeConfig): { cap: number, min: number, max: number, bossLevel?: number } {
	if (config?.levelScalingFn) {
		return config.levelScalingFn(floor);
	}

	const bossInterval = config?.bossInterval || 10;
	const bossFloor = Math.ceil(Math.max(1, floor) / bossInterval) * bossInterval;
	const bossEffectiveFloor = bossFloor - 1;
	const bossBaseLevel = Math.floor((Math.max(1, bossEffectiveFloor) - 1) / 2) + 3;
	const cap = bossBaseLevel + 2;

	const isBossFloor = floor % bossInterval === 0;
	const effectiveFloor = isBossFloor ? floor - 1 : floor;
	const baseLevel = Math.floor((Math.max(1, effectiveFloor) - 1) / 2) + 3;
	let level = isBossFloor ? baseLevel + 1 : baseLevel;

	if (!isBossFloor) {
		const prevBossFloor = Math.floor((floor - 1) / bossInterval) * bossInterval;
		if (prevBossFloor > 0) {
			const prevBossEffectiveFloor = prevBossFloor - 1;
			const prevBossLevel = Math.floor((Math.max(1, prevBossEffectiveFloor) - 1) / 2) + 3 + 1;
			if (level <= prevBossLevel) {
				level = prevBossLevel + 1;
			}
		}
	}

	return { cap, min: level, max: level, bossLevel: isBossFloor ? level : undefined };
}

export function levelScaleForFloor(floor: number, config?: ModeConfig): [number, number] {
	const scaling = getLevelScaling(floor, config);
	return [scaling.min, scaling.max];
}

export function botLevel(floor: number, config?: ModeConfig): number {
	const [minLevel] = levelScaleForFloor(floor, config);
	return minLevel;
}

export function getLevelUpEvo(speciesId: string, currentHappiness = 70): { evoTo: string, evoLevel: number } | null {
	const species = Dex.species.get(toID(speciesId));
	if (!species.exists || !species.evos.length) return null;
	const validEvos: { evoTo: string, evoLevel: number }[] = [];
	for (const evoName of species.evos) {
		const evo = Dex.species.get(toID(evoName));
		if (evo.evoType === 'other') continue;
		if (evo.evoType === 'levelFriendship') {
			if (currentHappiness >= 160) {
				validEvos.push({ evoTo: toID(evoName), evoLevel: 1 });
			}
			continue;
		}
		const fallback = evo.evoType ? (EVO_TYPE_FALLBACK_LEVEL[evo.evoType] ?? 36) : 36;
		const evoLevel = evo.evoLevel ?? fallback;
		if (evoLevel > 0) validEvos.push({ evoTo: toID(evoName), evoLevel });
	}
	if (!validEvos.length) return null;
	return validEvos[Math.floor(Math.random() * validEvos.length)];
}

export function processLevelUpEvolutions(mon: PokemonEntry): boolean {
	let evolved = false;
	while (true) {
		const evo = getLevelUpEvo(mon.species, mon.happiness ?? 70);
		if (!evo || mon.level < evo.evoLevel) break;
		mon.expType = getExpType(evo.evoTo);
		mon.species = evo.evoTo;
		evolved = true;
	}
	return evolved;
}

export function getItemEvolution(speciesId: string, itemId: string): string | null {
	const dexSpecies = Dex.species.get(toID(speciesId));
	if (!dexSpecies.evos) return null;
	const pendingItemId = toID(itemId);

	for (const newEvo of dexSpecies.evos) {
		const evoData = Dex.species.get(newEvo);
		const evoItemId = toID(evoData.evoItem);

		const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
		const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId === pendingItemId;
		const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && pendingItemId === 'linkingcord';

		if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution) {
			return evoData.id;
		}
	}
	return null;
}

export function getMegaEvolution(speciesId: string, itemId: string): string | null {
	const dexItem = Dex.items.get(toID(itemId)) as ReturnType<typeof Dex.items.get> & { megaEvolves?: string, megaStone?: string };
	if (dexItem.megaEvolves && toID(dexItem.megaEvolves) === toID(speciesId)) {
		return dexItem.megaStone || null;
	}
	return null;
}

export function applyExpAndLevelUp(
	mon: PokemonEntry,
	expGained: number,
	currentFloor = 100,
	config?: ModeConfig
): { evolved: boolean, oldLevel: number } {
	const oldLevel = mon.level;

	const scaling = getLevelScaling(currentFloor, config);
	const levelCap = Math.min(10000, scaling.cap);

	if (mon.level >= levelCap) {
		return { evolved: false, oldLevel };
	}

	mon.exp += expGained;
	const expType = mon.expType ?? getExpType(mon.species);

	const maxExpAllowed = expForLevel(levelCap, expType);
	if (mon.exp > maxExpAllowed) {
		mon.exp = maxExpAllowed;
	}

	let leveledUp = false;
	while (mon.level < levelCap && mon.exp >= expForLevel(mon.level + 1, expType)) {
		mon.level++;
		leveledUp = true;
	}

	if (leveledUp) {
		mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);
	}

	const evolved = processLevelUpEvolutions(mon);

	return { evolved, oldLevel };
}

function calculateExpectedHits(move: Move): number {
	const acc = typeof move.accuracy === 'number' ? move.accuracy / 100 : 1;
	if (!move.multihit) return acc;
	if (Array.isArray(move.multihit)) {
		const [min, max] = move.multihit;
		if (min === 2 && max === 5) {
			const expectedHits = 2 * (1 / 6) + 3 * (1 / 3) + 4 * (1 / 3) + 5 * (1 / 6);
			return acc * expectedHits;
		}
		if (min === 2 && max === 3) return acc * (1 + acc + acc ** 2) / 2;
		let expected = 0;
		for (let hits = min; hits <= max; hits++) {
			const prob = hits < max ? acc ** hits * (1 - acc) : acc ** max;
			expected += hits * prob;
		}
		return expected;
	}
	const fixedHits = move.multihit;
	let expected = 0;
	for (let hits = 1; hits <= fixedHits; hits++) {
		const prob = hits < fixedHits ? acc ** hits * (1 - acc) : acc ** fixedHits;
		expected += hits * prob;
	}
	return expected;
}

function calculateEffectivePower(move: Move): number {
	if (!move.exists || move.category === 'Status') return 0;

	const bp = move.basePower || 60;
	let turns = 1;

	if (move.flags?.recharge) turns = 2;
	if (move.flags?.charge && !move.flags?.recharge) turns = 2;
	if ((move as { delayedAttack?: boolean }).delayedAttack) turns = 3;

	if (move.multihit) {
		const expectedHits = calculateExpectedHits(move);
		return Math.floor((bp * expectedHits) / turns);
	}

	const acc = typeof move.accuracy === 'number' ? move.accuracy / 100 : 1;
	return Math.floor((bp * acc) / turns);
}

export function getAllLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) {
			gen--;
			continue;
		}
		break;
	}

	const fullLearn = Dex.species.getFullLearnset(id);
	const viableMoves: string[] = [];

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		for (const move in learnset) {
			if (viableMoves.includes(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\d)L(\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= level) {
					viableMoves.push(move);
					break;
				}
			}
		}
	}

	if (!viableMoves.length) return ['tackle'];
	return viableMoves;
}

export function getLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	return getAllLevelUpMoves(speciesId, level, genNumber).slice(-4);
}

export function getEggMoves(speciesId: string, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) {
			gen--;
			continue;
		}
		break;
	}

	const fullLearn = Dex.species.getFullLearnset(id);
	const eggMoves: string[] = [];

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		for (const move in learnset) {
			if (eggMoves.includes(move)) continue;
			for (const src of learnset[move]) {
				if (src.startsWith(`${gen}E`) || src.startsWith(`E`)) {
					eggMoves.push(move);
					break;
				}
			}
		}
	}
	return eggMoves;
}

export function getMovesLearnedBetween(speciesId: string, oldLevel: number, newLevel: number, isEvolution = false, genNumber = 9): string[] {
	const id = toID(speciesId);
	const sp = Dex.species.get(id);
	const learnsetData = Dex.species.getLearnsetData(id);
	const baseLearnsetData = (sp.baseSpecies && toID(sp.baseSpecies) !== id) ?
		Dex.species.getLearnsetData(toID(sp.baseSpecies)) :
		null;
	const learnset = {
		...(baseLearnsetData?.learnset ?? {}),
		...(learnsetData?.learnset ?? {}),
	};
	if (!Object.keys(learnset).length) return [];

	const learned: string[] = [];
	const regex = new RegExp(`^${genNumber}L(\\d+)$`);
	for (const [moveid, sources] of Object.entries(learnset)) {
		for (const src of sources) {
			const match = regex.exec(src);
			if (match) {
				const learnLvl = parseInt(match[1]);
				if (learnLvl > oldLevel && learnLvl <= newLevel) learned.push(moveid);
				else if (isEvolution && learnLvl === 0) learned.push(moveid);
				break;
			}
		}
	}
	return Array.from(new Set(learned));
}

function pickBestMoves(speciesId: string, chosenLevel: number, genNumber: number, floor: number, config?: ModeConfig): string[] {
	if (config?.randomizeMoves) {
		const allMoves = Dex.moves.all().filter(m => !m.isNonstandard && m.category !== 'Status' && !m.isZ && !m.isMax && m.id !== 'struggle');
		const randomMoves: string[] = [];
		for (let i = 0; i < 4; i++) {
			randomMoves.push(allMoves[Math.floor(Math.random() * allMoves.length)].id);
		}
		return randomMoves;
	}

	const species = Dex.species.get(toID(speciesId));
	const fullLearn = Dex.species.getFullLearnset(toID(speciesId));
	const viableMoves: string[] = [];

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		for (const move in learnset) {
			if (viableMoves.includes(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\d)L(\d+)$/.exec(src);
				if (match && parseInt(match[1]) === genNumber && parseInt(match[2]) <= chosenLevel) {
					viableMoves.push(move);
					break;
				}
			}
		}
	}

	if (floor > 100) {
		const learnsetData = Dex.species.getLearnsetData(toID(speciesId));
		const learnset = learnsetData?.learnset ?? {};
		for (const move in learnset) {
			if (viableMoves.includes(move)) continue;
			if ((learnset[move] as string[]).some((src: string) => src.startsWith(`${genNumber}E`))) {
				viableMoves.push(move);
			}
		}
	}

	if (!viableMoves.length) return ['tackle'];

	const isPhysical = species.baseStats.atk >= species.baseStats.spa;

	if (floor <= 100) {
		const damaging = viableMoves
			.map(moveId => {
				const move = Dex.moves.get(moveId);
				if (!move.exists || move.category === 'Status') return null;
				let score = calculateEffectivePower(move);
				if (isPhysical && move.category === 'Physical') score *= 1.2;
				if (!isPhysical && move.category === 'Special') score *= 1.2;
				return { moveId, score, type: move.type };
			})
			.filter((m): m is { moveId: string, score: number, type: string } => m !== null)
			.sort((a, b) => b.score - a.score);

		const picked: string[] = [];
		const usedTypes = new Set<string>();

		const stabMove = damaging.find(m => species.types.includes(m.type));
		if (stabMove) {
			picked.push(stabMove.moveId);
			usedTypes.add(stabMove.type);
		}

		for (const { moveId, type } of damaging) {
			if (picked.length >= 2) break;
			if (!picked.includes(moveId) && !usedTypes.has(type)) {
				picked.push(moveId);
				usedTypes.add(type);
			}
		}

		for (const { moveId } of damaging) {
			if (picked.length >= 2) break;
			if (!picked.includes(moveId)) picked.push(moveId);
		}

		const remaining = viableMoves.filter(m => !picked.includes(m));
		for (let i = remaining.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[remaining[i], remaining[j]] = [remaining[j], remaining[i]];
		}
		for (const moveId of remaining) {
			if (picked.length >= 4) break;
			picked.push(moveId);
		}

		return picked.slice(0, 4).map(m => Dex.moves.get(m).id || toID(m));
	}

	const scored = viableMoves.map(moveId => {
		const move = Dex.moves.get(moveId);
		if (!move.exists) return { moveId, score: 0, type: 'Normal', isStatus: false };

		const isStatus = move.category === 'Status';
		let score = 0;

		if (isStatus) {
			score = GOOD_STATUS_MOVES.has(moveId) ? 40 : 8;
		} else {
			score = calculateEffectivePower(move);
			if (species.types.includes(move.type)) score *= 1.5;
			if (isPhysical && move.category === 'Physical') score *= 1.2;
			if (!isPhysical && move.category === 'Special') score *= 1.2;
		}

		return { moveId, score, type: move.type, isStatus };
	});

	scored.sort((a, b) => b.score - a.score);

	const picked: string[] = [];
	const usedTypes = new Set<string>();
	let statusCount = 0;

	const stabMove = scored.find(({ type, isStatus }) => !isStatus && species.types.includes(type));
	if (stabMove) {
		picked.push(stabMove.moveId);
		usedTypes.add(stabMove.type);
	}

	for (const { moveId, type, isStatus } of scored) {
		if (picked.length >= 4) break;
		if (picked.includes(moveId)) continue;
		if (isStatus) {
			if (statusCount === 0) {
				picked.push(moveId);
				statusCount++;
			}
			continue;
		}
		if (!usedTypes.has(type)) {
			picked.push(moveId);
			usedTypes.add(type);
		}
	}

	for (const { moveId } of scored) {
		if (picked.length >= 4) break;
		if (!picked.includes(moveId)) picked.push(moveId);
	}

	return picked.slice(0, 4).map(m => Dex.moves.get(m).id || toID(m));
}

function pickBestAbility(species: Species, floor: number, config?: ModeConfig, abilityCharms = 0): string {
	if (config?.randomizeAbilities) {
		const allAbilities = Dex.abilities.all().filter(a => !a.isNonstandard);
		return allAbilities[Math.floor(Math.random() * allAbilities.length)].id;
	}

	const abilities = species.abilities;
	const candidates: { id: string, priority: number }[] = [];

	for (const slot of ['S', 'H', '1', '0'] as const) {
		if (!abilities[slot]) continue;
		const id = toID(abilities[slot]);
		if (BANNED_ABILITIES.has(id)) continue;

		let priority = 0;

		if (slot === 'S') {
			const chance = floor >= 150 ? 0.12 : floor >= 100 ? 0.06 : 0.02;
			priority = Math.random() < chance ? 100 : 0;
		} else if (slot === 'H') {
			let baseChance = 1 / 128;
			if (abilityCharms > 0) {
				baseChance *= 2 ** Math.min(abilityCharms, 4);
			}

			const chance = floor >= 99 ? Math.max(0.20, baseChance) : floor >= 60 ? Math.max(0.10, baseChance) : baseChance;
			priority = Math.random() < chance ? 80 : 0;
		} else if (slot === '1') {
			priority = Math.random() < 0.5 ? 50 : 0;
		} else {
			priority = 30;
		}

		if (STRONG_ABILITIES.has(id)) priority += 20;

		candidates.push({ id, priority });
	}

	if (!candidates.length) return abilities['0'] ?? '';

	candidates.sort((a, b) => b.priority - a.priority);
	return candidates[0].id;
}

function pickNatureForSpecies(species: Species, floor: number): string {
	const natures = Dex.natures.all().map(n => n.name);

	if (floor <= 10) {
		return natures[Math.floor(Math.random() * natures.length)] ?? 'Hardy';
	}

	const forceGood = floor > 150 || Math.random() < 0.5;
	if (!forceGood) {
		return natures[Math.floor(Math.random() * natures.length)] ?? 'Hardy';
	}

	const bs = species.baseStats;
	const isPhysical = bs.atk > bs.spa;
	const isFast = bs.spe >= 80;
	const isBulky = (bs.hp + bs.def + bs.spd) >= 220;

	if (isPhysical) {
		if (isFast) return 'Jolly';
		if (isBulky) return Math.random() < 0.5 ? 'Adamant' : 'Careful';
		return 'Adamant';
	} else {
		if (isFast) return 'Timid';
		if (isBulky) return Math.random() < 0.5 ? 'Modest' : 'Calm';
		return 'Modest';
	}
}

function calcEVSpread(_species: Species, _floor: number): StatTable {
	return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

export function rollTeraTypeForSpecies(speciesName: string): string {
	const dexSpecies = Dex.species.get(toID(speciesName));
	const speciesTypes = dexSpecies.types.length ? dexSpecies.types : ['Normal'];
	if (Math.random() < 0.8) {
		return speciesTypes[Math.floor(Math.random() * speciesTypes.length)] || 'Normal';
	}
	const allTypes = Dex.types.all().map(t => t.name);
	return allTypes[Math.floor(Math.random() * allTypes.length)] || 'Normal';
}

function pickRandomHeldItem(speciesName: string): string {
	if (Math.floor(Math.random() * 20) !== 0) return '';
	const allItems = Dex.items.all().filter(i => {
		if (i.isNonstandard && i.isNonstandard !== 'Past') return false;
		if (i.zMove) return true;
		if (i.itemUser) return i.itemUser.some(u => toID(u) === toID(speciesName));
		return Object.values(i).some(v => typeof v === 'function');
	});
	if (!allItems.length) return '';
	return allItems[Math.floor(Math.random() * allItems.length)].id;
}

function rollRaritySpawn(floor: number, isBoss: boolean, isStarter: boolean, luck = 0): RarityTier {
	if (isStarter) {
		const rand = Math.random() * 100;
		if (floor <= 5) {
			if (rand < 70) return 'Common';
			if (rand < 95) return 'Uncommon';
			return 'Rare';
		} else {
			if (rand < 50) return 'Common';
			if (rand < 80) return 'Uncommon';
			if (rand < 95) return 'Rare';
			return 'Super Rare';
		}
	}

	if (isBoss) {
		const maxRoll = Math.max(1, 64 - Math.floor(luck / 2));
		let roll = Math.floor(Math.random() * maxRoll) + 1;

		if (floor < 70 && roll <= 6) {
			roll = 7;
		}

		if (roll <= 1) return 'Boss Ultra Rare';
		if (roll <= 6) return 'Boss Super Rare';
		if (roll <= 20) return 'Boss Rare';
		return 'Boss';
	}

	const maxRoll = 512;
	const roll = Math.floor(Math.random() * maxRoll) + 1;

	if (roll <= 1) return 'Ultra Rare';
	if (roll <= 6) return 'Super Rare';
	if (roll <= 32) return 'Rare';
	if (roll <= 156) return 'Uncommon';
	return 'Common';
}

function defaultResolveBiome(floor: number, currentBiome: string, config: ModeConfig): string {
	if (config.lastBiome) {
		const match = /^(\d+)-(\d+)$/.exec(config.lastBiome.floor.trim());
		if (match && floor >= parseInt(match[1]) && floor <= parseInt(match[2])) {
			return config.lastBiome.biome;
		}
	}
	return currentBiome;
}

export function pickStarterOptions(availableStarters: string[]): string[] {
	const shuffled = [...availableStarters];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, 5);
}

function determineLevel(minLevel: number, maxLevel: number, depth: number): number {
	if (depth > 500) return Math.floor(Math.random() * (maxLevel - minLevel)) + minLevel;
	for (let curLevel = minLevel; curLevel <= maxLevel; curLevel++) {
		const gap = maxLevel - curLevel;
		if (gap === 0 || Math.floor(Math.random() * gap) === 0) return curLevel;
	}
	return maxLevel;
}

function buildSpawnPool(
	floor: number,
	isBossFloor: boolean,
	starter: boolean,
	luck: number,
	currentBiome: string | undefined,
	config: ModeConfig | undefined,
	data: ModeData | undefined
): BiomeEntry[] {
	const rarity = rollRaritySpawn(floor, isBossFloor, starter, luck);
	let pool: BiomeEntry[] = [];
	const activeBiomes = data?.biomes || {};
	const resolveBiome = data?.resolveBiome ?? defaultResolveBiome;
	const activeBiome = currentBiome || config?.startingBiome || 'Town';
	const biomeName = resolveBiome(floor, activeBiome, config ?? {} as ModeConfig);

	if (starter) {
		for (const b of Object.values(activeBiomes)) {
			const tierPool = b[rarity];
			if (tierPool && tierPool.length > 0) pool.push(...tierPool);
		}
	} else {
		pool = activeBiomes[biomeName]?.[rarity] || activeBiomes[activeBiome]?.[rarity] || [];
	}

	if (!pool || pool.length === 0) {
		if (config?.emptyPoolFallbackFn) {
			pool = config.emptyPoolFallbackFn(floor, rarity, isBossFloor, activeBiomes);
		} else {
			pool = [];
			const excludedBiomes = new Set(data?.excludedBiomes ?? []);
			for (const [bName, biomeData] of Object.entries(activeBiomes)) {
				if (excludedBiomes.has(bName)) continue;
				const tierPool = biomeData[rarity];
				if (tierPool && tierPool.length > 0) pool.push(...tierPool);
			}
			if (pool.length === 0) {
				const fallbackTier: RarityTier = isBossFloor ? 'Boss' : 'Common';
				for (const biomeData of Object.values(activeBiomes)) {
					const tierPool = biomeData[fallbackTier];
					if (tierPool && tierPool.length > 0) {
						pool = tierPool;
						break;
					}
				}
			}
		}
	}

	if (config?.poolFilterFn) {
		pool = config.poolFilterFn(pool, floor, isBossFloor);
	} else if (floor < 100) {
		pool = pool.filter(mon => {
			let sp = Dex.species.get(mon.species);
			while (sp.prevo || (sp.baseSpecies && toID(sp.baseSpecies) !== toID(sp.name))) {
				sp = sp.prevo ? Dex.species.get(sp.prevo) : Dex.species.get(sp.baseSpecies);
			}
			return sp.evos && sp.evos.length > 0;
		});
	}

	if (!pool || pool.length === 0) pool = [{ species: 'eevee', weight: 100 }, { species: 'porygon', weight: 100 }];
	return pool;
}

function applyBossEvolutions(speciesId: string, chosenLevel: number, floor: number, isBossFloor: boolean): string {
	let finalSpeciesId = speciesId;
	while (true) {
		const evo = getLevelUpEvo(finalSpeciesId);
		if (!evo || chosenLevel < evo.evoLevel) break;

		if (isBossFloor) {
			if (floor <= 20) break;
			if (floor <= 40) {
				const nextEvo = Dex.species.get(evo.evoTo);
				if (!nextEvo.evos || nextEvo.evos.length === 0) break;
			}
		}
		finalSpeciesId = evo.evoTo;
	}
	return finalSpeciesId;
}

function getValidGeneration(speciesName: string, baseGen: number): number {
	let genNumber = baseGen;
	const speciesIdForGen = toID(speciesName);
	while (genNumber > 1) {
		if (Dex.mod(`gen${genNumber}`).species.get(speciesIdForGen).isNonstandard) {
			genNumber--;
			continue;
		}
		break;
	}
	return genNumber;
}

function rollIVs(floor: number): StatTable {
	if (floor <= 10) {
		return {
			hp: Math.floor(Math.random() * 32), atk: Math.floor(Math.random() * 32),
			def: Math.floor(Math.random() * 32), spa: Math.floor(Math.random() * 32),
			spd: Math.floor(Math.random() * 32), spe: Math.floor(Math.random() * 32),
		};
	} else if (floor <= 20) {
		const rollIv = () => 15 + Math.floor(Math.random() * 17);
		return { hp: rollIv(), atk: rollIv(), def: rollIv(), spa: rollIv(), spd: rollIv(), spe: rollIv() };
	} else if (floor <= 30) {
		const rollIv = () => 20 + Math.floor(Math.random() * 12);
		return { hp: rollIv(), atk: rollIv(), def: rollIv(), spa: rollIv(), spd: rollIv(), spe: rollIv() };
	} else {
		return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
	}
}

function rollShiny(shinyCharms: number): boolean {
	let shinyRate = 2048;
	if (shinyCharms === 1) shinyRate = 256;
	else if (shinyCharms === 2) shinyRate = 128;
	else if (shinyCharms === 3) shinyRate = 64;
	else if (shinyCharms >= 4) shinyRate = 32;
	return Math.floor(Math.random() * shinyRate) === 0;
}

export function genPokemon(
	quantity: number,
	level: number | number[],
	starter = false,
	floor = 1,
	isBossFloor = false,
	luck = 0,
	forcedSpeciesPool?: (string | TrainerMon)[],
	currentBiome?: string,
	config?: ModeConfig,
	data?: ModeData,
	shinyCharms = 0,
	abilityCharms = 0
): AIPokemonSet[] {
	let minLevel: number;
	let maxLevel: number;
	if (typeof level === 'number') {
		minLevel = level;
		maxLevel = level;
	} else {
		minLevel = level[0];
		maxLevel = level[1] ?? level[0];
	}

	const allTypes = Dex.types.all().map(t => t.name);
	const gennedMons: AIPokemonSet[] = [];
	let depth = 0;

	while (gennedMons.length < quantity) {
		const chosenLevel = determineLevel(minLevel, maxLevel, depth);

		let finalSpeciesId = '';
		let forcedMoves: string[] | undefined = undefined;
		let forcedIvs: StatTable | undefined = undefined;
		let forcedEvs: StatTable | undefined = undefined;
		let forcedAbility: string | undefined = undefined;
		let forcedTeraType: string | undefined = undefined;
		let forcedItem: string | undefined = undefined;
		let forcedShiny: boolean | undefined = undefined;
		let forcedNature: string | undefined = undefined;
		let forcedGender: 'M' | 'F' | 'N' | undefined = undefined;

		const isForced = !!(forcedSpeciesPool && forcedSpeciesPool.length > depth);

		if (isForced) {
			const forced = forcedSpeciesPool[depth];
			if (typeof forced === 'string') {
				finalSpeciesId = toID(forced);
			} else {
				finalSpeciesId = toID(forced.species);
				if (forced.moves && forced.moves.length > 0) forcedMoves = forced.moves;
				if (forced.ivs) forcedIvs = forced.ivs;
				if (forced.evs) forcedEvs = forced.evs;
				if (forced.ability) forcedAbility = forced.ability;
				if (forced.teraType) forcedTeraType = forced.teraType;
				if (forced.item) forcedItem = forced.item;
				if (forced.shiny !== undefined) forcedShiny = forced.shiny;
				if (forced.nature) forcedNature = forced.nature;
				if (forced.gender) forcedGender = forced.gender;
			}
		} else {
			const pool = buildSpawnPool(floor, isBossFloor, starter, luck, currentBiome, config, data);
			finalSpeciesId = getBaseSpecies(weightedPick(pool));
		}

		finalSpeciesId = applyBossEvolutions(finalSpeciesId, chosenLevel, floor, isBossFloor);
		const finalSpecie = Dex.species.get(finalSpeciesId);

		const genNumber = getValidGeneration(finalSpecie.name, config?.generation || 9);

		const ivs = forcedIvs ? { ...forcedIvs } : rollIVs(floor);
		const evs = forcedEvs ? { ...forcedEvs } : calcEVSpread(finalSpecie, floor);
		const nature = forcedNature ?? pickNatureForSpecies(finalSpecie, floor);

		let ability = '';
		if (config?.randomizeAbilities) {
			ability = pickBestAbility(finalSpecie, floor, config, abilityCharms);
		} else if (forcedAbility) {
			if (forcedAbility === 'Hidden') {
				ability = finalSpecie.abilities['H'] || finalSpecie.abilities['0'];
			} else if (forcedAbility === '0' || forcedAbility === '1') {
				ability = finalSpecie.abilities[forcedAbility] || finalSpecie.abilities['0'];
			} else {
				ability = forcedAbility;
			}
		} else {
			ability = pickBestAbility(finalSpecie, floor, config, abilityCharms);
		}

		const shiny = forcedShiny ?? rollShiny(shinyCharms);

		const item = forcedItem ?? pickRandomHeldItem(finalSpecie.name);
		const teraType = forcedTeraType ?? (Math.floor(Math.random() * 20) === 0 ?
			allTypes[Math.floor(Math.random() * allTypes.length)] :
			finalSpecie.types[Math.floor(Math.random() * finalSpecie.types.length)]);

		let moves: string[] = [];
		if (config?.randomizeMoves) {
			moves = pickBestMoves(finalSpecie.name, chosenLevel, genNumber, floor, config);
		} else if (forcedMoves) {
			moves = forcedMoves.slice(0, 4).map(m => Dex.moves.get(m).id || toID(m));
		} else {
			moves = pickBestMoves(finalSpecie.name, chosenLevel, genNumber, floor, config);
		}

		gennedMons.push({
			species: finalSpecie.id,
			name: finalSpecie.baseSpecies,
			level: chosenLevel,
			ability,
			nature,
			ivs,
			evs,
			item,
			shiny,
			teraType,
			moves,
			gender: forcedGender ?? (finalSpecie.gender || (Math.random() < 0.5 ? 'M' : 'F')),
		});

		depth++;
	}

	return gennedMons;
}

export function genAIPokemon(
	quantity: number,
	floor = 1,
	luck = 0,
	forcedTrainer?: string,
	trainerKey?: string,
	currentBiome?: string,
	config?: ModeConfig,
	data?: ModeData,
	shinyCharms = 0,
	abilityCharms = 0
): { team: AIPokemonSet[], isTrainer: boolean, trainerName?: string, isDoubles?: boolean } {
	const scale = getLevelScaling(floor, config);
	const activeBossInterval = config?.bossInterval || 10;
	const isBossFloor = floor % activeBossInterval === 0;

	let effectiveScale: [number, number];
	if (isBossFloor && scale.bossLevel !== undefined) {
		effectiveScale = [scale.bossLevel, scale.bossLevel];
	} else {
		effectiveScale = [scale.min, scale.max];
	}

	let forcedTeam: (string | TrainerMon)[] | undefined = undefined;
	let actualQuantity = quantity;
	let isTrainerBattle = false;
	let trainerName: string | undefined = undefined;
	let isTrainerDoubles = false;
	const lookupKey = trainerKey || floor.toString();

	if (config?.hasTrainers && data?.trainers?.[lookupKey]?.[forcedTrainer!]) {
		isTrainerBattle = true;
		trainerName = forcedTrainer;
		const trainerData = data.trainers[lookupKey][forcedTrainer!];

		actualQuantity = trainerData.teamSize;
		isTrainerDoubles = !!trainerData.doubles;

		if (!trainerData.random && (trainerData.pool || trainerData.slotPools || trainerData.memoryId)) {
			forcedTeam = [];
			const memoryKey = trainerData.memoryId;
			let rememberedSpecies: string[] = [];

			if (memoryKey && state) {
				if (!state.trainerMemories) state.trainerMemories = {};
				if (state.trainerMemories[memoryKey]) {
					rememberedSpecies = state.trainerMemories[memoryKey];
				}
			}

			const globalPool = trainerData.pool ? [...trainerData.pool].sort(() => 0.5 - Math.random()) : [];
			let globalIdx = 0;

			for (let i = 1; i <= trainerData.teamSize; i++) {
				if (rememberedSpecies[i - 1]) {
					const baseSpecies = rememberedSpecies[i - 1];
					let pick: string | TrainerMon = baseSpecies;

					if (trainerData.slotPools?.[i] && trainerData.slotPools[i].length > 0) {
						const slotPool = trainerData.slotPools[i];
						const slotConfig = slotPool[Math.floor(Math.random() * slotPool.length)];
						if (typeof slotConfig === 'object') {
							pick = { ...slotConfig, species: baseSpecies };
						}
					}
					forcedTeam.push(pick);
				} else {
					let pick: string | TrainerMon | undefined;
					if (trainerData.slotPools?.[i] && trainerData.slotPools[i].length > 0) {
						const slotPool = trainerData.slotPools[i];
						pick = slotPool[Math.floor(Math.random() * slotPool.length)];
					} else if (globalIdx < globalPool.length) {
						pick = globalPool[globalIdx];
						globalIdx++;
					}

					if (pick) {
						forcedTeam.push(pick);
						if (memoryKey && state) {
							state.trainerMemories[memoryKey] = state.trainerMemories[memoryKey] || [];
							const speciesStr = typeof pick === 'string' ? pick : pick.species;
							state.trainerMemories[memoryKey].push(speciesStr);
						}
					}
				}
			}
			actualQuantity = forcedTeam.length;
		}
	}

	if (!isTrainerBattle && isBossFloor && data?.resolveBoss) {
		const resolvedBossTeam = data.resolveBoss(floor, currentBiome || config?.startingBiome || 'Town', config!);

		if (resolvedBossTeam && resolvedBossTeam.length > 0) {
			const shuffledPool = [...resolvedBossTeam].sort(() => 0.5 - Math.random());
			forcedTeam = [shuffledPool[0]];
			actualQuantity = 1;
		}
	}

	const mons = genPokemon(actualQuantity, effectiveScale, false, floor, isBossFloor, luck, forcedTeam, currentBiome, config, data, shinyCharms, abilityCharms);

	mons.sort((a, b) => a.level - b.level);
	return { team: mons, isTrainer: isTrainerBattle, trainerName, isDoubles: isTrainerDoubles };
}

export function packPokemon(mon: PokemonEntry): string {
	const sp = Dex.species.get(toID(mon.species));
	const name = sp.exists ? sp.name : mon.species;
	const ability = mon.ability || sp.abilities[0] || '';
	const nature = mon.nature || 'Hardy';
	if (!mon.moves) mon.moves = getLevelUpMoves(toID(mon.species), mon.level);

	const evs = mon.evs ? `${mon.evs.hp},${mon.evs.atk},${mon.evs.def},${mon.evs.spa},${mon.evs.spd},${mon.evs.spe}` : '';
	const ivs = mon.ivs ? `${mon.ivs.hp},${mon.ivs.atk},${mon.ivs.def},${mon.ivs.spa},${mon.ivs.spd},${mon.ivs.spe}` : '';
	const gender = mon.gender || 'M';
	const shiny = mon.shiny ? 'S' : '';
	const item = mon.heldItem ?? '';
	const moves = mon.moves.join(',');

	let base = `${name}||${item}|${ability}|${moves}|${nature}|${evs}|${gender}|${ivs}|${shiny}|${mon.level}|`;

	const atkBoost = mon.activeBuffs?.atk ? 10 : 0;
	const defBoost = mon.activeBuffs?.def ? 10 : 0;
	const spaBoost = mon.activeBuffs?.spa ? 10 : 0;
	const spdBoost = mon.activeBuffs?.spd ? 10 : 0;
	const speBoost = mon.activeBuffs?.spe ? 10 : 0;

	const bstBoostsStr = (atkBoost || defBoost || spaBoost || spdBoost || speBoost) ?
		`${atkBoost}:${defBoost}:${spaBoost}:${spdBoost}:${speBoost}` :
		'';

	let stackedItemStr = '';
	if (mon.stackedItems) {
		const stacks = Object.entries(mon.stackedItems).map(([id, count]) => `${id}:${count}`);
		stackedItemStr = stacks.join(';');
	}

	const misc = [
		mon.happiness !== undefined && mon.happiness !== 255 ? mon.happiness.toString() : '',
		'',
		mon.ball || '',
		'',
		'',
		mon.teraType || '',
		mon.currentHp !== undefined && mon.currentHp !== 100 ? mon.currentHp.toString() : '',
		mon.status || '',
		bstBoostsStr,
		'',
		stackedItemStr,
	];

	while (misc.length > 0 && misc[misc.length - 1] === '') {
		misc.pop();
	}

	if (misc.length > 0) {
		base += misc.join(',');
	}

	return base;
}

export function packAIPokemon(set: AIPokemonSet): string {
	const sp = Dex.species.get(toID(set.species));
	const name = sp.exists ? sp.name : set.species;
	const ivStr = `${set.ivs.hp},${set.ivs.atk},${set.ivs.def},${set.ivs.spa},${set.ivs.spd},${set.ivs.spe}`;
	const evStr = `${set.evs.hp},${set.evs.atk},${set.evs.def},${set.evs.spa},${set.evs.spd},${set.evs.spe}`;
	const movesStr = set.moves.map(m => Dex.moves.get(m).name || m).join(',');
	const shinyStr = set.shiny ? 'S' : '';

	let base = `${name}||${set.item}|${set.ability}|${movesStr}|${set.nature}|${evStr}|${set.gender}|${ivStr}|${shinyStr}|${set.level}|`;

	const misc = [
		'',
		'',
		'',
		'',
		'',
		set.teraType || '',
	];

	while (misc.length > 0 && misc[misc.length - 1] === '') {
		misc.pop();
	}

	if (misc.length > 0) {
		base += misc.join(',');
	}

	return base;
}

export function packTeam(mons: PokemonEntry[]): string {
	return mons.map(m => packPokemon(m)).join(']');
}

export function packAITeam(sets: AIPokemonSet[]): string {
	return sets.map(s => packAIPokemon(s)).join(']');
}
