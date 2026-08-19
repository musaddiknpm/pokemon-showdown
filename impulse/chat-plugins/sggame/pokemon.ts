import { Utils } from '../../../lib';
import { type PokemonEntry, type ModeConfig, type ModeData, type BiomeEntry, type TrainerMon, type SGGameState, type StatTable, type RarityTier } from './types';
import { BASE_EXP, GROWTH_RATES } from './data/pokemon-data';
import { expForLevel, applyExpAndLevelUp } from '../../utils/exp';
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




export function getLevelScaling(floor: number, config?: ModeConfig): { cap: number, min: number, max: number, bossLevel?: number } {
	if (config?.levelScalingFn) {
		return config.levelScalingFn(floor);
	}

	const bossInterval = config?.bossInterval || 10;
	const bossFloor = Math.ceil(Math.max(1, floor) / bossInterval) * bossInterval;
	const bossBaseLevel = Math.floor((Math.max(1, bossFloor - 1) - 1) / 2) + 3;
	const cap = bossBaseLevel + 2;

	const isBossFloor = floor % bossInterval === 0;
	const effectiveFloor = isBossFloor ? floor - 1 : floor;
	const baseLevel = Math.floor((Math.max(1, effectiveFloor) - 1) / 2) + 3;
	let level = isBossFloor ? baseLevel + 1 : baseLevel;

	if (!isBossFloor) {
		const prevBossFloor = Math.floor((floor - 1) / bossInterval) * bossInterval;
		if (prevBossFloor > 0) {
			const prevBossLevel = Math.floor((Math.max(1, prevBossFloor - 1) - 1) / 2) + 3 + 1;
			if (level <= prevBossLevel) level = prevBossLevel + 1;
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
			if (currentHappiness >= 160) validEvos.push({ evoTo: toID(evoName), evoLevel: 1 });
			continue;
		}
		const fallback = evo.evoType ? (EVO_TYPE_FALLBACK_LEVEL[evo.evoType] ?? 36) : 36;
		const evoLevel = evo.evoLevel ?? fallback;
		if (evoLevel > 0) validEvos.push({ evoTo: toID(evoName), evoLevel });
	}
	if (!validEvos.length) return null;
	return Utils.randomElement(validEvos);
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


export function getMegaEvolution(speciesId: string, itemId: string): string | null {
	const dexItem = Dex.items.get(toID(itemId)) as ReturnType<typeof Dex.items.get> & { megaEvolves?: string, megaStone?: string };
	if (dexItem.megaEvolves && toID(dexItem.megaEvolves) === toID(speciesId)) {
		return dexItem.megaStone || null;
	}
	return null;
}


function calculateExpectedHits(move: Move): number {
	const acc = typeof move.accuracy === 'number' ? move.accuracy / 100 : 1;
	if (!move.multihit) return acc;
	if (Array.isArray(move.multihit)) {
		const [min, max] = move.multihit;
		if (min === 2 && max === 5) return acc * (2 * (1 / 6) + 3 * (1 / 3) + 4 * (1 / 3) + 5 * (1 / 6));
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
		return Math.floor((bp * calculateExpectedHits(move)) / turns);
	}

	const acc = typeof move.accuracy === 'number' ? move.accuracy / 100 : 1;
	return Math.floor((bp * acc) / turns);
}

export function getAllLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const viableMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (viableMoves.has(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\d)L(\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= level) {
					viableMoves.add(move);
					break;
				}
			}
		}
	}

	if (!viableMoves.size) return ['tackle'];
	return Array.from(viableMoves);
}

export function getLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	return getAllLevelUpMoves(speciesId, level, genNumber).slice(-4);
}

export function getEggMoves(speciesId: string, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const eggMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (eggMoves.has(move)) continue;
			for (const src of learnset[move]) {
				if (src.startsWith(`${gen}E`) || src.startsWith(`E`)) {
					eggMoves.add(move);
					break;
				}
			}
		}
	}
	return Array.from(eggMoves);
}

export function getMovesLearnedBetween(speciesId: string, oldLevel: number, newLevel: number, isEvolution = false, genNumber = 9, randomizeMoves = false): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const learned = new Set<string>();

	const regex = new RegExp(`^${gen}L(\\d+)$`);
	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const [moveid, sources] of Object.entries(learnset)) {
			if (learned.has(moveid)) continue;
			for (const src of sources as string[]) {
				const match = regex.exec(src);
				if (match) {
					const learnLvl = parseInt(match[1]);
					if (learnLvl > oldLevel && learnLvl <= newLevel) learned.add(moveid);
					else if (isEvolution && learnLvl === 0) learned.add(moveid);
					break;
				}
			}
		}
	}
	let uniqueLearned = Array.from(learned);

	if (randomizeMoves) {
		const allMoves = Dex.moves.all().filter(m => !m.isNonstandard && !m.isZ && !m.isMax && m.id !== 'struggle');
		const randomMoves = new Set<string>();
		while (randomMoves.size < uniqueLearned.length) {
			randomMoves.add(Utils.randomElement(allMoves).id);
		}
		uniqueLearned = Array.from(randomMoves);
	}

	return uniqueLearned;
}

function collectViableMoves(speciesId: string, chosenLevel: number, genNumber: number, floor: number): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const viableMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (viableMoves.has(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\d)L(\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= chosenLevel) {
					viableMoves.add(move);
					break;
				}
			}
		}
	}

	if (floor > 100) {
		for (const learnsetIndex of fullLearn) {
			const learnset = learnsetIndex.learnset;
			if (!learnset) continue;
			for (const move in learnset) {
				if (!viableMoves.has(move) && (learnset[move] as string[]).some((src: string) => src.startsWith(`${gen}E`))) {
					viableMoves.add(move);
				}
			}
		}
	}

	return viableMoves.size ? Array.from(viableMoves) : ['tackle'];
}

function pickMovesEarlyFloor(viableMoves: string[], species: Species): string[] {
	const isPhysical = species.baseStats.atk >= species.baseStats.spa;
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
	if (stabMove) { picked.push(stabMove.moveId); usedTypes.add(stabMove.type); }

	for (const { moveId, type } of damaging) {
		if (picked.length >= 2) break;
		if (!picked.includes(moveId) && !usedTypes.has(type)) { picked.push(moveId); usedTypes.add(type); }
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

function pickMovesLateFloor(viableMoves: string[], species: Species): string[] {
	const isPhysical = species.baseStats.atk >= species.baseStats.spa;
	const scored = viableMoves.map(moveId => {
		const move = Dex.moves.get(moveId);
		if (!move.exists) return { moveId, score: 0, type: 'Normal', isStatus: false };
		const isStatus = move.category === 'Status';
		let score = isStatus ? (GOOD_STATUS_MOVES.has(moveId) ? 40 : 8) : calculateEffectivePower(move);
		if (!isStatus) {
			if (species.types.includes(move.type)) score *= 1.5;
			if (isPhysical && move.category === 'Physical') score *= 1.2;
			if (!isPhysical && move.category === 'Special') score *= 1.2;
		}
		return { moveId, score, type: move.type, isStatus };
	}).sort((a, b) => b.score - a.score);

	const picked: string[] = [];
	const usedTypes = new Set<string>();
	let statusCount = 0;

	const stabMove = scored.find(({ type, isStatus }) => !isStatus && species.types.includes(type));
	if (stabMove) { picked.push(stabMove.moveId); usedTypes.add(stabMove.type); }

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
		if (!usedTypes.has(type)) { picked.push(moveId); usedTypes.add(type); }
	}
	for (const { moveId } of scored) {
		if (picked.length >= 4) break;
		if (!picked.includes(moveId)) picked.push(moveId);
	}
	return picked.slice(0, 4).map(m => Dex.moves.get(m).id || toID(m));
}

function pickBestMoves(speciesId: string, chosenLevel: number, genNumber: number, floor: number, config?: ModeConfig): string[] {
	if (config?.randomizeMoves) {
		const allMoves = Dex.moves.all().filter(m => !m.isNonstandard && m.category !== 'Status' && !m.isZ && !m.isMax && m.id !== 'struggle');
		return Array.from({ length: 4 }, () => Utils.randomElement(allMoves).id);
	}

	const species = Dex.species.get(toID(speciesId));
	const viableMoves = collectViableMoves(speciesId, chosenLevel, genNumber, floor);

	return floor <= 100 ?
		pickMovesEarlyFloor(viableMoves, species) :
		pickMovesLateFloor(viableMoves, species);
}

function pickBestAbility(species: Species, floor: number, config?: ModeConfig, abilityCharms = 0): string {
	if (config?.randomizeAbilities) {
		const allAbilities = Dex.abilities.all().filter(a => !a.isNonstandard);
		return Utils.randomElement(allAbilities).id;
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
			if (abilityCharms > 0) baseChance *= 2 ** Math.min(abilityCharms, 4);
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

	if (floor <= 10) return Utils.randomElement(natures) ?? 'Hardy';

	const forceGood = floor > 150 || Math.random() < 0.5;
	if (!forceGood) return Utils.randomElement(natures) ?? 'Hardy';

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
	if (Math.random() < 0.8) return Utils.randomElement(speciesTypes) || 'Normal';
	const allTypes = Dex.types.all().map(t => t.name);
	return Utils.randomElement(allTypes) || 'Normal';
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
	return Utils.randomElement(allItems).id;
}

function rollRaritySpawn(floor: number, isBoss: boolean, isStarter: boolean, luck = 0): RarityTier {
	if (isStarter) {
		const rand = Math.random() * 100;
		if (floor <= 5) {
			if (rand < 70) return 'Common';
			if (rand < 95) return 'Uncommon';
			return 'Rare';
		}
		if (rand < 50) return 'Common';
		if (rand < 80) return 'Uncommon';
		if (rand < 95) return 'Rare';
		return 'Super Rare';
	}

	if (isBoss) {
		const maxRoll = Math.max(1, 64 - Math.floor(luck / 2));
		let roll = Math.floor(Math.random() * maxRoll) + 1;
		if (floor < 70 && roll <= 6) roll = 7;
		if (roll <= 1) return 'Boss Ultra Rare';
		if (roll <= 6) return 'Boss Super Rare';
		if (roll <= 20) return 'Boss Rare';
		return 'Boss';
	}

	const roll = Math.floor(Math.random() * 512) + 1;
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
	return Utils.shuffle([...availableStarters]).slice(0, 5);
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
	const activeBiomes = data?.biomes || {};
	const resolveBiome = data?.resolveBiome ?? defaultResolveBiome;
	const activeBiome = currentBiome || config?.startingBiome || 'Town';
	const biomeName = resolveBiome(floor, activeBiome, config ?? {} as ModeConfig);

	let pool: BiomeEntry[] = starter ?
		Object.values(activeBiomes).flatMap(b => b[rarity] || []) :
		activeBiomes[biomeName]?.[rarity] || activeBiomes[activeBiome]?.[rarity] || [];

	if (!pool.length) {
		if (config?.emptyPoolFallbackFn) {
			pool = config.emptyPoolFallbackFn(floor, rarity, isBossFloor, activeBiomes);
		} else {
			const excludedBiomes = new Set(data?.excludedBiomes ?? []);
			pool = Object.entries(activeBiomes)
				.filter(([bName]) => !excludedBiomes.has(bName))
				.flatMap(([, biomeData]) => biomeData[rarity] || []);
			if (!pool.length) {
				const fallbackTier: RarityTier = isBossFloor ? 'Boss' : 'Common';
				for (const biomeData of Object.values(activeBiomes)) {
					if (biomeData[fallbackTier]?.length) { pool = biomeData[fallbackTier]; break; }
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

	if (!pool.length) pool = [{ species: 'eevee', weight: 100 }, { species: 'porygon', weight: 100 }];
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
		if (Dex.mod(`gen${genNumber}`).species.get(speciesIdForGen).isNonstandard) { genNumber--; continue; }
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
	}
	return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
}

function rollShiny(shinyCharms: number): boolean {
	let shinyRate = 2048;
	if (shinyCharms === 1) shinyRate = 256;
	else if (shinyCharms === 2) shinyRate = 128;
	else if (shinyCharms === 3) shinyRate = 64;
	else if (shinyCharms >= 4) shinyRate = 32;
	return Math.floor(Math.random() * shinyRate) === 0;
}

interface ForcedMonConfig {
	exactSpecies: boolean;
	forcedMoves?: string[];
	forcedIvs?: StatTable;
	forcedEvs?: StatTable;
	forcedAbility?: string;
	forcedTeraType?: string;
	forcedItem?: string;
	forcedShiny?: boolean;
	forcedNature?: string;
	forcedGender?: 'M' | 'F' | 'N';
}

function extractForcedConfig(forced: string | TrainerMon, speciesId: string): { finalSpeciesId: string } & ForcedMonConfig {
	if (typeof forced === 'string') return { finalSpeciesId: toID(forced), exactSpecies: false };
	return {
		finalSpeciesId: toID(forced.species),
		exactSpecies: !!forced.exactSpecies,
		forcedMoves: forced.moves?.length ? forced.moves : undefined,
		forcedIvs: forced.ivs,
		forcedEvs: forced.evs,
		forcedAbility: forced.ability,
		forcedTeraType: forced.teraType,
		forcedItem: forced.item,
		forcedShiny: forced.shiny,
		forcedNature: forced.nature,
		forcedGender: forced.gender,
	};
}

function resolveSpeciesForLevel(speciesId: string, chosenLevel: number, exactSpecies: boolean, floor: number, isBossFloor: boolean): string {
	if (exactSpecies) return speciesId;
	let finalId = speciesId;

	while (true) {
		const sp = Dex.species.get(finalId);
		if (!sp.prevo) break;
		const requiredLevel = sp.evoLevel ?? (sp.evoType ? EVO_TYPE_FALLBACK_LEVEL[sp.evoType] ?? 36 : 36);
		if (chosenLevel >= requiredLevel) break;
		finalId = toID(sp.prevo);
	}

	return applyBossEvolutions(finalId, chosenLevel, floor, isBossFloor);
}

function resolveAbility(finalSpecie: Species, forcedAbility: string | undefined, floor: number, config: ModeConfig | undefined, abilityCharms: number): string {
	if (config?.randomizeAbilities) return pickBestAbility(finalSpecie, floor, config, abilityCharms);
	if (!forcedAbility) return pickBestAbility(finalSpecie, floor, config, abilityCharms);
	if (forcedAbility === 'Hidden') return finalSpecie.abilities['H'] || finalSpecie.abilities['0'];
	if (forcedAbility === '0' || forcedAbility === '1') return finalSpecie.abilities[forcedAbility] || finalSpecie.abilities['0'];
	return forcedAbility;
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
	const minLevel = typeof level === 'number' ? level : level[0];
	const maxLevel = typeof level === 'number' ? level : (level[1] ?? level[0]);
	const allTypes = Dex.types.all().map(t => t.name);
	const gennedMons: AIPokemonSet[] = [];

	for (let depth = 0; gennedMons.length < quantity; depth++) {
		const chosenLevel = determineLevel(minLevel, maxLevel, depth);
		const isForced = !!(forcedSpeciesPool && forcedSpeciesPool.length > depth);

		let speciesId = '';
		let cfg: ForcedMonConfig = { exactSpecies: false };

		if (isForced) {
			const extracted = extractForcedConfig(forcedSpeciesPool[depth], '');
			speciesId = extracted.finalSpeciesId;
			cfg = extracted;
		} else {
			speciesId = getBaseSpecies(weightedPick(buildSpawnPool(floor, isBossFloor, starter, luck, currentBiome, config, data)));
		}

		const finalSpeciesId = resolveSpeciesForLevel(speciesId, chosenLevel, cfg.exactSpecies, floor, isBossFloor);
		const finalSpecie = Dex.species.get(finalSpeciesId);
		const genNumber = getValidGeneration(finalSpecie.name, config?.generation || 9);

		const ivs = cfg.forcedIvs ? { ...cfg.forcedIvs } : rollIVs(floor);
		const evs = cfg.forcedEvs ? { ...cfg.forcedEvs } : calcEVSpread(finalSpecie, floor);
		const nature = cfg.forcedNature ?? pickNatureForSpecies(finalSpecie, floor);
		const ability = resolveAbility(finalSpecie, cfg.forcedAbility, floor, config, abilityCharms);
		const shiny = cfg.forcedShiny ?? rollShiny(shinyCharms);
		const item = cfg.forcedItem ?? pickRandomHeldItem(finalSpecie.name);
		const teraType = cfg.forcedTeraType ?? (Math.floor(Math.random() * 20) === 0 ?
			Utils.randomElement(allTypes) :
			Utils.randomElement(finalSpecie.types));
		const moves = config?.randomizeMoves || !cfg.forcedMoves ?
			pickBestMoves(finalSpecie.name, chosenLevel, genNumber, floor, config) :
			cfg.forcedMoves.slice(0, 4).map(m => Dex.moves.get(m).id || toID(m));

		gennedMons.push({
			species: finalSpecie.id,
			name: finalSpecie.baseSpecies,
			level: chosenLevel,
			ability, nature, ivs, evs, item, shiny, teraType, moves,
			gender: cfg.forcedGender ?? (finalSpecie.gender || (Math.random() < 0.5 ? 'M' : 'F')),
		});
	}

	return gennedMons;
}

function resolveTrainerTeam(
	floor: number,
	forcedTrainer: string,
	trainerKey: string,
	config: ModeConfig,
	data: ModeData,
	state?: SGGameState
): { forcedTeam: (string | TrainerMon)[] | undefined, actualQuantity: number, isTrainerBattle: boolean, trainerName: string | undefined, isTrainerDoubles: boolean } {
	const trainerData = data.trainers?.[trainerKey]?.[forcedTrainer];
	if (!config.hasTrainers || !trainerData) {
		return { forcedTeam: undefined, actualQuantity: 0, isTrainerBattle: false, trainerName: undefined, isTrainerDoubles: false };
	}

	let forcedTeam: (string | TrainerMon)[] | undefined = undefined;
	let actualQuantity = trainerData.teamSize;

	if (!trainerData.random && (trainerData.pool || trainerData.slotPools || trainerData.memoryId)) {
		forcedTeam = [];
		const memoryKey = trainerData.memoryId;
		const rememberedSpecies: string[] = (memoryKey && state) ? (state.trainerMemories?.[memoryKey] ?? []) : [];
		if (memoryKey && state && !state.trainerMemories) state.trainerMemories = {};

		const globalPool = trainerData.pool ? [...trainerData.pool].sort(() => 0.5 - Math.random()) : [];
		let globalIdx = 0;

		for (let i = 1; i <= trainerData.teamSize; i++) {
			if (rememberedSpecies[i - 1]) {
				let pick: TrainerMon = { species: rememberedSpecies[i - 1] };
				if (trainerData.slotPools?.[i]?.length) {
					const slotConfig = Utils.randomElement(trainerData.slotPools[i]);
					if (typeof slotConfig === 'object') pick = { ...slotConfig, species: rememberedSpecies[i - 1] };
				}
				if (trainerData.exactSpecies !== undefined && pick.exactSpecies === undefined) pick.exactSpecies = trainerData.exactSpecies;
				forcedTeam.push(pick);
			} else {
				let rawPick: string | TrainerMon | undefined;
				if (trainerData.slotPools?.[i]?.length) {
					rawPick = Utils.randomElement(trainerData.slotPools[i]);
				} else if (globalIdx < globalPool.length) {
					rawPick = globalPool[globalIdx++];
				}
				if (rawPick) {
					const pick: TrainerMon = typeof rawPick === 'string' ? { species: rawPick } : { ...rawPick };
					if (trainerData.exactSpecies !== undefined && pick.exactSpecies === undefined) pick.exactSpecies = trainerData.exactSpecies;
					forcedTeam.push(pick);
					if (memoryKey && state?.trainerMemories) {
						state.trainerMemories[memoryKey] = state.trainerMemories[memoryKey] || [];
						state.trainerMemories[memoryKey].push(pick.species);
					}
				}
			}
		}
		actualQuantity = forcedTeam.length;
	}

	return { forcedTeam, actualQuantity, isTrainerBattle: true, trainerName: forcedTrainer, isTrainerDoubles: !!trainerData.doubles };
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
	abilityCharms = 0,
	state?: SGGameState
): { team: AIPokemonSet[], isTrainer: boolean, trainerName?: string, isDoubles?: boolean } {
	const scale = getLevelScaling(floor, config);
	const activeBossInterval = config?.bossInterval || 10;
	const isBossFloor = floor % activeBossInterval === 0;
	const effectiveScale: [number, number] = (isBossFloor && scale.bossLevel !== undefined) ?
		[scale.bossLevel, scale.bossLevel] :
		[scale.min, scale.max];

	const lookupKey = trainerKey || floor.toString();
	let { forcedTeam, actualQuantity, isTrainerBattle, trainerName, isTrainerDoubles } = forcedTrainer && config && data ?
		resolveTrainerTeam(floor, forcedTrainer, lookupKey, config, data, state) :
		{ forcedTeam: undefined, actualQuantity: quantity, isTrainerBattle: false, trainerName: undefined, isTrainerDoubles: false };

	if (!actualQuantity) actualQuantity = quantity;

	if (!isTrainerBattle && isBossFloor && data?.resolveBoss) {
		const resolvedBossTeam = data.resolveBoss(floor, currentBiome || config?.startingBiome || 'Town', config!);
		if (resolvedBossTeam?.length) {
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
		`${atkBoost}:${defBoost}:${spaBoost}:${spdBoost}:${speBoost}` : '';

	const misc = [
		mon.happiness !== undefined && mon.happiness !== 255 ? mon.happiness.toString() : '',
		'', mon.ball || '', '', '', mon.teraType || '',
		mon.currentHp !== undefined && mon.currentHp !== 100 ? mon.currentHp.toString() : '',
		mon.status || '', bstBoostsStr, '',
	];

	while (misc.length > 0 && misc[misc.length - 1] === '') misc.pop();
	if (misc.length > 0) base += misc.join(',');
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

	const misc = ['', '', '', '', '', set.teraType || ''];
	while (misc.length > 0 && misc[misc.length - 1] === '') misc.pop();
	if (misc.length > 0) base += misc.join(',');
	return base;
}

export function packTeam(mons: PokemonEntry[]): string {
	return mons.map(m => packPokemon(m)).join(']');
}

export function packAITeam(sets: AIPokemonSet[]): string {
	return sets.map(s => packAIPokemon(s)).join(']');
}

export function getItemEvolution(speciesId: string, itemId: string): string | null {
	const dexSpecies = Dex.species.get(toID(speciesId));
	if (!dexSpecies.evos) return null;
	const pendingItemId = toID(itemId);

	const validEvos = [];

	for (const newEvo of dexSpecies.evos) {
		const evoData = Dex.species.get(newEvo);
		const evoItemId = toID(evoData.evoItem);

		const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
		const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId === pendingItemId;
		const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && pendingItemId === 'linkingcord';
		
		const isTradeStone = pendingItemId === 'tradestone';
		const isItemOrTradeEvo = evoData.evoType === 'useItem' || evoData.evoType === 'trade';

		if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution || (isTradeStone && isItemOrTradeEvo)) {
			validEvos.push(evoData.id);
		}
	}

	if (validEvos.length === 0) return null;
	return Utils.randomElement(validEvos);
}
