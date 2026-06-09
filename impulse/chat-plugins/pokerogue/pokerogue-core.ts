import { Utils } from '../../../lib';
import { type PokemonEntry, type PokeRogueState, type StatusCondition, type GameMode, type ModeConfig, type BiomePool, type PokeRogueView, type EggData, type StatTable } from './types';
import { EGG_POOLS, getStarterCost, type EggTier } from './starter-data';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { CATCH_RATES } from './pokemon-basic-data';
import { SHOP_ITEMS, genItem, generateDraftOptions, getRewardMoney, getItemPrice, getRerollCost } from './items';
import {
	getState, setState, getUserData, saveUserData, globalStats, saveGlobalStats, recordRunStats,
} from './database';
import {
	pickStarterOptions, expForLevel, applyExpAndLevelUp, getLevelUpEvo,
	getLevelUpMoves, getMovesLearnedBetween, calcKillExp, getExpType, getExpYield, botLevel,
	packTeam, genPokemon, processLevelUpEvolutions, getItemEvolution, getMegaEvolution,
	getEggMoves, getAllLevelUpMoves, getLevelScaling, rollTeraTypeForSpecies,
} from './pokemon';
import { activeMatches, startBattle, destroyBotUser, parseBattleState } from './battle';
import { renderGamePage, refreshGamePage } from './render';
import { devCommands } from './dev-tools';

export const LADDER_RESET_CONFIRM_WINDOW = 2 * 60 * 1000;
export const pendingLadderResetConfirmations = new Map<ID, number>();

export const EXP_SHARE_NAME = 'Exp. All';
export const EV_STAT_LABELS: Record<string, string> = {
	hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed',
};
export const MAX_EV_TOTAL = 508;
export const MAX_EV_STAT = 252;
export const EV_VITAMIN_GAIN = 10;

export const RESIDUAL_FROM_TAGS: Record<string, true> = {
	'Leech Seed': true, 'Salt Cure': true, 'Infestation': true, 'Whirlpool': true,
	'Bind': true, 'Wrap': true, 'Clamp': true, 'Fire Spin': true, 'Sand Tomb': true,
	'Magma Storm': true, 'Snap Trap': true, 'Thunder Cage': true, 'Octolock': true,
	'Curse': true, 'Nightmare': true, 'Bad Dreams': true, 'Perish Song': true,
	'Future Sight': true, 'Doom Desire': true,
};

export const SELF_KO_MOVES = new Set([
	'explosion', 'selfdestruct', 'mistyexplosion', 'memento',
	'healingwish', 'lunardance', 'finalgambit',
]);

export function hasPendingActions(state: PokeRogueState, ignoreDraft = false): boolean {
	return !!(
		state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
		state.moveToLearn || state.pendingItemName || state.itemOptions?.length ||
		state.pendingConsumableType || (!ignoreDraft && state.pendingRewardDraft?.length) ||
		state.pendingMoveSlot !== undefined || state.pendingReleaseSlot !== undefined
	);
}

export function repairEmptyPendingChoice(state: PokeRogueState, userId: string): void {
	if (!state.pendingChoice || state.pendingChoice.length) return;
	const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
	state.pendingChoice = pickStarterOptions(modeData.starters);
	setState(userId, state);
}

export function isBossFloorBoundary(floor: number, bossInterval = 10): boolean {
	return floor % bossInterval === 0;
}

export function parseFloorRange(range: string): { start: number, end: number } | null {
	const match = /^(\d+)-(\d+)$/.exec(range.trim());
	if (!match) return null;
	return { start: parseInt(match[1]), end: parseInt(match[2]) };
}

export function pickNextBiome(
	currentBiome: string,
	data: { transitions: Record<string, { biome: string, weight: number }[]>, excludedBiomes?: string[], biomes: Record<string, BiomePool> },
	startingBiome: string
): string {
	const excluded = new Set(data.excludedBiomes ?? []);
	const options = (data.transitions[currentBiome] ?? []).filter(t => !excluded.has(t.biome));

	if (options.length > 0) {
		let totalWeight = 0;
		for (const t of options) totalWeight += t.weight;
		let roll = Math.random() * totalWeight;
		for (const t of options) {
			roll -= t.weight;
			if (roll <= 0) return t.biome;
		}
		return options[options.length - 1].biome;
	}

	const fallbackOptions = Object.keys(data.biomes).filter(b => b !== startingBiome && !excluded.has(b));
	return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)] || startingBiome;
}

export function clearStaleBattleRoom(state: PokeRogueState, userId: string): void {
	if (!state.battleRoomId) return;
	const bRoom = Rooms.get(state.battleRoomId as RoomID);
	if (!bRoom?.battle || bRoom.battle.ended) {
		delete state.battleRoomId;
		setState(userId, state);
	}
}

export function processLevelUp(
	mon: PokemonEntry,
	oldLevel: number,
	oldSpecies: string,
	evolved: boolean,
	teamIdx: number,
	state: PokeRogueState,
	genNumber: number,
): string[] {
	const detailMsgs: string[] = [];

	const oldName = Dex.species.get(toID(oldSpecies)).name;
	const currentName = Dex.species.get(toID(mon.species)).name;

	if (evolved) {
		detailMsgs.push(`&nbsp;&nbsp;↳ <b>${oldName}</b> evolved into <b>${currentName}</b> and reached Lv. ${mon.level}!`);
	} else if (mon.level > oldLevel) {
		detailMsgs.push(`&nbsp;&nbsp;↳ <b>${currentName}</b> reached Lv. ${mon.level}!`);
	}

	if (!mon.moves) mon.moves = getLevelUpMoves(mon.species, oldLevel, genNumber);

	const newMoves = getMovesLearnedBetween(oldSpecies, oldLevel, mon.level, false, genNumber);
	if (evolved) {
		const evoMoves = getMovesLearnedBetween(mon.species, oldLevel, mon.level, true, genNumber);
		for (const m of evoMoves) if (!newMoves.includes(m)) newMoves.push(m);
	}

	state.pendingMoves = state.pendingMoves ?? [];

	for (const move of newMoves) {
		if (mon.moves.includes(move)) continue;
		if (state.pendingMoves.some(p => p.pokemonIndex === teamIdx && p.move === move)) continue;

		if (mon.moves.length < 4) {
			mon.moves.push(move);
			detailMsgs.push(`&nbsp;&nbsp;↳ <b>${currentName}</b> learned <b>${Dex.moves.get(move).name}</b>!`);
		} else {
			state.pendingMoves.push({ pokemonIndex: teamIdx, move, speciesName: mon.species });
		}
	}

	return detailMsgs;
}

export function applyRarerCandy(state: PokeRogueState, config: ModeConfig): string[] {
	const candyJarStacks = state.keyItems?.['Candy Jar'] || 0;
	const levelsToGain = 1 + candyJarStacks;
	const notifs = [`The party gained ${levelsToGain} level(s)!`];

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		if ((mon.currentHp ?? 100) <= 0) continue;

		const oldLevel = mon.level;
		const oldSpecies = mon.species;

		mon.level += levelsToGain;
		mon.exp = expForLevel(mon.level, mon.expType || getExpType(mon.species));
		mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);

		const evolved = processLevelUpEvolutions(mon);
		const msgs = processLevelUp(mon, oldLevel, oldSpecies, evolved, i, state, config.generation || 9);
		if (msgs.length) notifs.push(...msgs);
	}

	return notifs;
}

export function parseKillExp(
	logLines: string[],
	state: PokeRogueState,
	floor: number,
	isBossFloor: boolean,
	isTrainerBattle: boolean
): { expMap: Map<number, number>, baseShareExpMap: Map<number, number> } {
	const expMap = new Map<number, number>();
	const baseShareExpMap = new Map<number, number>();

	for (const line of logLines) {
		if (!line.includes('PR_EXP|')) continue;

		const parts = line.split('|');
		const dataIndex = parts.indexOf('PR_EXP') + 1;
		const enemySpecies = parts[dataIndex];
		const enemyLevel = parseInt(parts[dataIndex + 1]);
		const participantSpeciesIds = parts[dataIndex + 2] ? parts[dataIndex + 2].split(',') : [];

		const participantIndices = new Set<number>();
		for (const sid of participantSpeciesIds) {
			const idx = state.team.findIndex(m => toID(m.species) === sid && (m.currentHp ?? 100) > 0);
			if (idx !== -1) participantIndices.add(idx);
		}

		if (participantIndices.size === 0 && state.team.length > 0) {
			participantIndices.add(0);
		}

		const validParticipantCount = Math.max(1, participantIndices.size);
		const b = getExpYield(enemySpecies);

		const a = isTrainerBattle ? 1.5 : 1;
		const rawKillExp = Math.floor(Math.floor((b * enemyLevel) / 5 + 1) * a);
		const basePerParticipant = Math.max(1, Math.floor(rawKillExp / validParticipantCount));

		for (const teamIdx of participantIndices) {
			const mon = state.team[teamIdx];
			if (!mon) continue;
			const hasLuckyEgg = mon.heldItem === 'luckyegg';
			const exp = calcKillExp(enemySpecies, enemyLevel, validParticipantCount, isBossFloor, hasLuckyEgg, isTrainerBattle);
			expMap.set(teamIdx, (expMap.get(teamIdx) ?? 0) + exp);
		}

		for (let i = 0; i < state.team.length; i++) {
			if (participantIndices.has(i)) continue;
			if ((state.team[i].currentHp ?? 100) <= 0) continue;
			baseShareExpMap.set(i, (baseShareExpMap.get(i) ?? 0) + basePerParticipant);
		}
	}

	return { expMap, baseShareExpMap };
}

export function applyExpShare(
	expMap: Map<number, number>,
	baseShareExpMap: Map<number, number>,
	state: PokeRogueState,
	config: ModeConfig
): Map<number, number> {
	const maxExpAllStacks = SHOP_ITEMS['expall']?.maxStack ?? 5;
	const maxExpCharmStacks = SHOP_ITEMS['expcharm']?.maxStack ?? 99;
	const maxSuperExpCharmStacks = SHOP_ITEMS['superexpcharm']?.maxStack ?? 30;

	const expAllStacks = Math.min(maxExpAllStacks, (state.keyItems?.['Exp. All'] || 0));
	const expCharmStacks = Math.min(maxExpCharmStacks, (state.keyItems?.['Exp. Charm'] || 0));
	const superExpCharmStacks = Math.min(maxSuperExpCharmStacks, (state.keyItems?.['Super Exp. Charm'] || 0));

	const charmMult = 1 + (0.25 * expCharmStacks) + (0.60 * superExpCharmStacks);

	const result = new Map<number, number>();
	const scaling = getLevelScaling(state.floor, config);
	const levelCap = scaling.cap;

	const aliveTeam = state.team.map((mon, idx) => ({ mon, idx })).filter(m => (m.mon.currentHp ?? 100) > 0);
	if (aliveTeam.length === 0) return result;

	let levelSum = 0;
	for (const m of aliveTeam) levelSum += m.mon.level;
	const meanLevel = levelSum / aliveTeam.length;
	let pooledExp = 0;

	for (const [teamIdx, baseExp] of expMap) {
		const mon = state.team[teamIdx];
		if (!mon || (mon.currentHp ?? 100) <= 0) continue;

		const rawExp = Math.floor(baseExp * charmMult);
		let penalty = 0;

		if (mon.level >= levelCap) {
			penalty = 1.0;
		} else if (mon.level > meanLevel) {
			const diff = mon.level - meanLevel;
			const basePenalty = diff * 0.15;
			const scalingFactor = Math.max(1, expAllStacks) / maxExpAllStacks;
			penalty = Math.min(1.0, basePenalty * scalingFactor);
		}

		const keptExp = Math.floor(rawExp * (1 - penalty));
		pooledExp += (rawExp - keptExp);
		result.set(teamIdx, keptExp);
	}

	if (expAllStacks > 0) {
		for (const [teamIdx, basePerParticipant] of baseShareExpMap) {
			if (expMap.has(teamIdx)) continue;
			const mon = state.team[teamIdx];
			if (!mon || (mon.currentHp ?? 100) <= 0) continue;

			let benchedExp = Math.floor(basePerParticipant * expAllStacks * 0.2);
			const hasLuckyEgg = mon.heldItem === 'luckyegg';
			if (hasLuckyEgg) benchedExp = Math.floor(benchedExp * 1.5);
			benchedExp = Math.max(1, Math.floor(benchedExp * charmMult));

			let penalty = 0;
			if (mon.level >= levelCap) {
				penalty = 1.0;
			} else if (mon.level > meanLevel) {
				const diff = mon.level - meanLevel;
				const basePenalty = diff * 0.15;
				const scalingFactor = expAllStacks / maxExpAllStacks;
				penalty = Math.min(1.0, basePenalty * scalingFactor);
			}

			const keptExp = Math.floor(benchedExp * (1 - penalty));
			pooledExp += (benchedExp - keptExp);
			result.set(teamIdx, keptExp);
		}
	}

	if (pooledExp > 0) {
		let recipients = aliveTeam.filter(m => m.mon.level < levelCap && m.mon.level < meanLevel);
		if (recipients.length === 0) {
			recipients = aliveTeam.filter(m => m.mon.level < levelCap);
		}

		if (recipients.length > 0) {
			let totalWeight = 0;
			const weights = new Map<number, number>();
			const useDistanceWeighting = recipients.some(m => m.mon.level < meanLevel);

			for (const { mon, idx } of recipients) {
				let weight = 1;
				if (useDistanceWeighting) {
					weight = Math.max(1, meanLevel - mon.level);
				}
				if (mon.heldItem === 'luckyegg') weight *= 1.4;
				weights.set(idx, weight);
				totalWeight += weight;
			}

			for (const { idx } of recipients) {
				const share = (weights.get(idx)! / totalWeight) * pooledExp;
				const current = result.get(idx) || 0;
				result.set(idx, current + Math.floor(share));
			}
		}
	}

	for (const [teamIdx, _] of expMap) {
		const current = result.get(teamIdx) || 0;
		const mon = state.team[teamIdx];
		if (mon && mon.level < levelCap && current === 0) {
			result.set(teamIdx, 1);
		}
	}

	return result;
}

export function processBattleExperience(
	logLines: string[],
	state: PokeRogueState,
	floor: number,
	isBossFloor: boolean,
	isTrainerBattle: boolean,
	config: ModeConfig
): string[] {
	const detailMsgs: string[] = [];
	const { expMap: rawExpMap, baseShareExpMap } = parseKillExp(logLines, state, floor, isBossFloor, isTrainerBattle);
	const expMap = applyExpShare(rawExpMap, baseShareExpMap, state, config);

	let expMultiplier = 1;
	if (config.economy?.expMultiplier !== undefined) {
		expMultiplier = typeof config.economy.expMultiplier === 'function' ? config.economy.expMultiplier(floor) : config.economy.expMultiplier;
	}

	if (expMap.size > 0) {
		for (const [teamIdx, baseExpGained] of expMap) {
			const mon = state.team[teamIdx];
			if (!mon || (mon.currentHp ?? 100) === 0) continue;

			const expGained = Math.floor(baseExpGained * expMultiplier);

			const oldSpecies = mon.species;
			const spName = Dex.species.get(toID(oldSpecies)).name;

			const isActive = rawExpMap.has(teamIdx);
			const sourceTag = !isActive ? ' <span style="color:#8ab4f8;font-size:10px">(Exp. All)</span>' : '';

			detailMsgs.push(`<b>${spName}</b> gained ${expGained} Exp.${sourceTag}`);

			const { evolved, oldLevel } = applyExpAndLevelUp(mon, expGained, floor, config);
			detailMsgs.push(...processLevelUp(mon, oldLevel, oldSpecies, evolved, teamIdx, state, config.generation || 9));
		}
	}

	return detailMsgs;
}

export function syncBattleOutcome(
	logLines: string[],
	state: PokeRogueState,
): { consumedItems: string[] } {
	const parsed = parseBattleState(logLines, state.team);

	for (const [idxStr, hp] of Object.entries(parsed.p1TeamHp)) {
		const idx = Number(idxStr);
		state.team[idx].currentHp = parsed.p1FaintedIndices.has(idx) ? 0 : hp;
	}
	for (const idx of parsed.p1FaintedIndices) {
		state.team[idx].currentHp = 0;
	}

	for (const [idxStr, status] of Object.entries(parsed.p1TeamStatus)) {
		const idx = Number(idxStr);
		if (status) {
			state.team[idx].status = status as StatusCondition;
		} else {
			delete state.team[idx].status;
		}
	}

	const consumedItems: string[] = [];
	for (const { teamIdx, itemId } of parsed.consumedItems) {
		if (state.team[teamIdx].heldItem === itemId) {
			delete state.team[teamIdx].heldItem;
			const dexItem = Dex.items.get(itemId);
			consumedItems.push(dexItem.name || itemId);
		}
	}

	return { consumedItems };
}

export function processFloorRewards(
	state: PokeRogueState,
	clearedFloor: number,
	config: ModeConfig,
	userId: string
): { extraNotifs: string[] } {
	const extraNotifs: string[] = [];
	const userData = getUserData(userId);
	const newlyHatched: PokemonEntry[] = [];

	if (userData.eggs && userData.eggs.length > 0) {
		for (let i = userData.eggs.length - 1; i >= 0; i--) {
			const egg = userData.eggs[i];
			egg.wavesRemaining--;
			if (egg.wavesRemaining <= 0) {
				const sid = toID(egg.species);
				const bannerType = egg.bannerType || 'generic';
				const shinyOdds = bannerType === 'shiny' ? 64 : 128;
				const isShiny = Math.floor(Math.random() * shinyOdds) === 0;
				const dexSpecies = Dex.species.get(sid);

				const allNatures = Dex.natures.all().map(n => n.name);
				const randomNature = allNatures[Math.floor(Math.random() * allNatures.length)] || 'Hardy';

				const generatedTeraType = rollTeraTypeForSpecies(sid);

				let haName = '';
				if (dexSpecies.abilities['H']) {
					const haRoll = Math.floor(Math.random() * 192) === 0;
					if (haRoll) haName = dexSpecies.abilities['H'];
				}

				const eggMoveTier = egg.tier ?? 'Common';
				const eggMoveOddsMap: Record<string, [number, number]> = {
					'Common': [48, 16],
					'Rare': [24, 12],
					'Epic': [12, 6],
					'Legendary': [6, 3],
				};
				const [genericOdds, moveUpOdds] = eggMoveOddsMap[eggMoveTier] ?? [48, 16];
				const eggMoveOdds = bannerType === 'eggmove' ? moveUpOdds : genericOdds;
				const eggMoveRoll = Math.floor(Math.random() * eggMoveOdds) === 0;
				let unlockedEggMove = '';
				if (eggMoveRoll) {
					const allEggMoves = getEggMoves(sid, config.generation || 9);
					const existingUnlocked = userData.starters[sid]?.unlockedEggMoves || [];
					const availableToUnlock = allEggMoves.filter(m => !existingUnlocked.includes(m));
					if (availableToUnlock.length > 0) {
						unlockedEggMove = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
					}
				}

				const hatchedMon: PokemonEntry = {
					species: sid, level: 5, exp: 0,
					moves: [], nature: randomNature, ability: haName || dexSpecies.abilities['0'] || '',
					shiny: isShiny, teraType: generatedTeraType,
					eggTier: egg.tier,
				};
				newlyHatched.push(hatchedMon);

				if (!userData.starters[sid]) {
					userData.starters[sid] = {
						...hatchedMon,
						unlockedNatures: [randomNature],
						unlockedAbilities: [haName || dexSpecies.abilities['0'] || ''],
						unlockedTeraTypes: [generatedTeraType],
						unlockedEggMoves: unlockedEggMove ? [unlockedEggMove] : [],
						selectedNature: randomNature,
						selectedAbility: haName || dexSpecies.abilities['0'] || '',
						selectedTeraType: generatedTeraType,
					} as PokemonEntry;
				} else {
					const starter = userData.starters[sid];
					const unlockedFeatures: string[] = [];

					if (!starter.unlockedNatures) starter.unlockedNatures = [starter.nature || 'Hardy'];
					if (!starter.unlockedNatures.includes(randomNature)) {
						starter.unlockedNatures.push(randomNature);
						unlockedFeatures.push('Nature');
					}

					if (!starter.unlockedTeraTypes) starter.unlockedTeraTypes = [starter.teraType || 'Normal'];
					if (!starter.unlockedTeraTypes.includes(generatedTeraType)) {
						starter.unlockedTeraTypes.push(generatedTeraType);
						unlockedFeatures.push('Tera');
					}
					const hasLegacyNormalTera = starter.teraType === 'Normal' && !dexSpecies.types.includes('Normal');
					const hasLegacySelectedTera = starter.selectedTeraType === 'Normal' && !dexSpecies.types.includes('Normal');
					if (!starter.teraType || hasLegacyNormalTera) starter.teraType = generatedTeraType;
					if (!starter.selectedTeraType || hasLegacySelectedTera) starter.selectedTeraType = generatedTeraType;

					if (haName) {
						if (!starter.unlockedAbilities) starter.unlockedAbilities = [starter.ability || dexSpecies.abilities['0'] || ''];
						if (!starter.unlockedAbilities.includes(haName)) {
							starter.unlockedAbilities.push(haName);
							unlockedFeatures.push('Hidden Ability');
						}
					}

					if (isShiny && !starter.shiny) {
						starter.shiny = true;
					}

					if (unlockedEggMove) {
						if (!starter.unlockedEggMoves) starter.unlockedEggMoves = [];
						if (!starter.unlockedEggMoves.includes(unlockedEggMove)) {
							starter.unlockedEggMoves.push(unlockedEggMove);
							unlockedFeatures.push(`Egg Move`);
						}
					}
				}
				userData.eggs.splice(i, 1);
			}
		}
	}

	if (newlyHatched.length > 0) {
		state.hatchedEggs = newlyHatched;
	}

	if (clearedFloor > (state.highestFloor ?? 0)) {
		state.highestFloor = clearedFloor;
		state.recordTeam = state.team.map(m => ({ ...m }));
	}
	recordRunStats(userId, state.gameMode, clearedFloor, state.team);

	if (config.milestoneRewards) {
		for (const reward of config.milestoneRewards) {
			const trigger = reward.interval ? clearedFloor % reward.floor === 0 : clearedFloor === reward.floor;
			if (trigger) {
				if (reward.itemType === 'keyItem') {
					state.keyItems = state.keyItems ?? {};
					let added = 0;
					const currentAmount = state.keyItems[reward.itemName] || 0;
					const shopItemDef = Object.values(SHOP_ITEMS).find(item => item.name === reward.itemName);
					const maxStack = shopItemDef?.maxStack ?? 1;

					for (let i = 0; i < reward.amount; i++) {
						if ((currentAmount + added) >= maxStack) continue;
						added++;
					}

					if (added > 0) {
						state.keyItems[reward.itemName] = currentAmount + added;
						extraNotifs.push(`<div style="text-align: center;"><b>Milestone Reward: Received ${added}x ${reward.itemName} for clearing Floor ${clearedFloor}!</b></div>`);
					}
				} else if (reward.itemType === 'inventory') {
					const ballType = reward.itemName.replace(' ', '').toLowerCase();
					state.inventory = state.inventory || {};
					const shopItemDef = SHOP_ITEMS[ballType];
					const maxStack = shopItemDef?.maxStack ?? 99;
					let added = 0;
					const currentAmount = state.inventory[ballType] || 0;

					for (let i = 0; i < reward.amount; i++) {
						if ((currentAmount + added) >= maxStack) continue;
						added++;
					}

					if (added > 0) {
						state.inventory[ballType] = currentAmount + added;
						extraNotifs.push(`<div style="text-align: center;"><b>Milestone Reward: Received ${added}x ${reward.itemName} for clearing Floor ${clearedFloor}!</b></div>`);
					}
				} else if (reward.itemType === 'voucher') {
					if (!userData.vouchers) userData.vouchers = { regular: 0, plus: 0, premium: 0, gold: 0 };
					const vType = reward.itemName as 'regular' | 'plus' | 'premium' | 'gold';
					userData.vouchers[vType] = (userData.vouchers[vType] || 0) + reward.amount;

					let color = '#ffffff';
					if (vType === 'gold') color = '#fbbf24';
					else if (vType === 'premium') color = '#a78bfa';
					else if (vType === 'plus') color = '#60a5fa';

					const displayType = vType.charAt(0).toUpperCase() + vType.slice(1);
					extraNotifs.push(`<div style="text-align: center; color: ${color};"><b>Milestone Reward: Received an Egg Voucher ${displayType}!</b></div>`);
				}
			}
		}
	}

	if (isBossFloorBoundary(clearedFloor, config.bossInterval)) {
		for (const mon of state.team) {
			mon.currentHp = 100;
			delete mon.status;
		}
		extraNotifs.push(`<div style="text-align: center;"><b>Zone Boss Defeated! Full heal!</b></div>`);
	}

	saveUserData(userId);
	return { extraNotifs };
}

export function handleBattleLoss(state: PokeRogueState, floor: number, userId: string): void {
	delete state.pendingMoves;
	delete state.pendingSwap;
	delete state.moveToLearn;
	delete state.pendingItemName;
	delete state.itemOptions;
	delete state.purchasedItem;
	delete state.caughtPokemon;
	delete state.pendingTrainer;
	delete state.pendingTrainerKey;
	delete state.pendingRewardDraft;
	delete state.rerollCount;

	if ((state.keyItems?.['Revive'] || 0) > 0) {
		state.keyItems['Revive']--;
		if (state.keyItems['Revive'] <= 0) delete state.keyItems['Revive'];

		state.notification = (state.notification ?? '') +
			`<br><b>Revive used!</b> Retrying Floor ${floor}`;
	} else {
		if (floor > (state.highestFloor ?? 0)) {
			state.highestFloor = floor;
			state.recordTeam = state.team.map(m => ({ ...m }));
		}
		recordRunStats(userId, state.gameMode, floor, state.team);
		state.gameOver = true;
		state.lastRunFloor = floor;
		state.floor = 1;
		state.team = [];
	}
}

export interface CommandContext {
	errorReply(msg: string): void;
	sendReplyBox(html: string): void;
	parse(cmd: string): void;
}

export const ActionResolvers: Record<string, (state: PokeRogueState, user: User, rest: string, ctx: CommandContext) => boolean> = {
	hatched(state, user, rest, ctx) {
		if (rest === 'continue') {
			delete state.hatchedEggs;
			return true;
		}
		return false;
	},

	learnmove(state, user, rest, ctx) {
		if (!state.pendingMoves?.length) return false;
		const pending = state.pendingMoves[0];
		const mon = state.team[pending.pokemonIndex];
		if (!mon.moves) mon.moves = getLevelUpMoves(mon.species, mon.level, MODE_CONFIGS[state.gameMode]?.generation || 9);

		if (rest === 'skip') {
			state.notification = `Your Pokémon gave up on learning <b>${Dex.moves.get(pending.move).name}</b>.`;
		} else {
			const slot = parseInt(rest) - 1;
			if (isNaN(slot) || slot < 0 || slot >= mon.moves.length) {
				ctx.errorReply("Invalid move slot.");
				return false;
			}
			const oldMoveName = Dex.moves.get(mon.moves[slot]).name;
			mon.moves[slot] = pending.move;
			state.notification = `Forgot ${oldMoveName} and learned <b>${Dex.moves.get(pending.move).name}</b>!`;
		}
		state.pendingMoves.shift();
		return true;
	},

	swapmon(state, user, rest, ctx) {
		if (!state.pendingSwap) return false;
		const newMon = state.pendingSwap;
		const newMonName = Dex.species.get(toID(newMon.species)).name;

		if (rest === 'skip') {
			state.notification = `You released <b>${newMonName}</b> into the wild.`;
		} else {
			const slot = parseInt(rest) - 1;
			if (isNaN(slot) || slot < 0 || slot >= state.team.length) {
				ctx.errorReply("Invalid team slot.");
				return false;
			}
			const oldMonName = Dex.species.get(toID(state.team[slot].species)).name;
			state.team[slot] = newMon;
			if (state.pendingMoves) state.pendingMoves = state.pendingMoves.filter(p => p.pokemonIndex !== slot);
			state.notification = `You replaced ${oldMonName} with <b>${newMonName}</b>!`;
		}
		delete state.pendingSwap;
		return true;
	},

	pickitem(state, user, rest, ctx) {
		if (!state.itemOptions?.length) return false;
		if (rest === 'skip') {
			delete state.itemOptions;
			delete state.purchasedItem;
		} else {
			const dexItem = Dex.items.get(rest);
			if (!dexItem.exists) {
				ctx.errorReply("Unknown item.");
				return false;
			}
			state.pendingItemName = dexItem.name;
			delete state.itemOptions;
			delete state.purchasedItem;
		}
		return true;
	},

	giveitem(state, user, rest, ctx) {
		if (!state.pendingItemName) {
			ctx.errorReply("No item pending.");
			return false;
		}
		const itemKey = state.purchasedItem;

		if (rest === 'skip') {
			delete state.pendingItemName;
			delete state.purchasedItem;
			delete state.pendingItemIsEvo;
			delete state.pendingItemIsMega;
			delete state.pendingItemIsGmax;
			delete state.pendingItemIsStackable;

			if (state.pendingDraftPick) {
				delete state.pendingDraftPick;
			} else if (itemKey) {
				const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
				const item = activeShop[itemKey];
				if (item) state.money = (state.money || 0) + getItemPrice(state.floor, item.moneyMultiplier);
			}

			if (state.pendingRewardDraft) state.view = 'draft';
			else { state.floor++; state.view = 'main'; }
			return true;
		}

		const slot = parseInt(rest) - 1;
		if (isNaN(slot) || slot < 0 || slot >= state.team.length) {
			ctx.errorReply("Invalid team slot.");
			return false;
		}

		const mon = state.team[slot];
		const dexNewItem = Dex.items.get(state.pendingItemName);
		const dexSpecies = Dex.species.get(toID(mon.species));

		if (itemKey === 'memorymushroom') {
			const allMoves = getMovesLearnedBetween(mon.species, 1, mon.level, false, MODE_CONFIGS[state.gameMode]?.generation || 9);
			if (allMoves.length === 0) {
				ctx.errorReply("This Pokémon has no moves to remember.");
				return false;
			}
			state.pendingMoves = [{ pokemonIndex: slot, move: allMoves[Math.floor(Math.random() * allMoves.length)], speciesName: mon.species }];
			delete state.purchasedItem;
			delete state.pendingItemName;

			if (state.pendingDraftPick) {
				delete state.pendingRewardDraft;
				delete state.rerollCount;
				delete state.pendingDraftPick;
			}

			if (state.pendingRewardDraft) state.view = 'draft';
			else { state.floor++; state.view = 'main'; }
			return true;
		}

		let evoTarget = '';
		if (state.pendingItemIsEvo) {
			evoTarget = getItemEvolution(mon.species, state.pendingItemName) || '';
			if (!evoTarget && !state.pendingItemIsStackable) {
				ctx.errorReply("That Pokémon can't evolve with this item.");
				return false;
			}
		} else if (state.pendingItemIsMega) {
			evoTarget = getMegaEvolution(mon.species, state.pendingItemName) || '';
			if (!evoTarget) {
				ctx.errorReply("That Pokémon can't Mega Evolve with this stone.");
				return false;
			}
		} else if (state.pendingItemIsGmax) {
			const spData = Dex.species.get(toID(mon.species));
			if (spData.canGigantamax) {
				evoTarget = spData.name + '-Gmax';
			}
			if (!evoTarget) {
				ctx.errorReply("That Pokémon can't Gigantamax with this mushroom.");
				return false;
			}
		}

		if (evoTarget && (state.pendingItemIsEvo || state.pendingItemIsMega || state.pendingItemIsGmax)) {
			mon.species = toID(evoTarget);
			mon.expType = getExpType(evoTarget);
			const evoName = Dex.species.get(evoTarget).name;
			const actionName = state.pendingItemIsMega ? 'Mega Evolved' : (state.pendingItemIsGmax ? 'Gigantamaxed' : 'evolved');
			state.notification = `<b>${dexSpecies.name}</b> ${actionName} into <b>${evoName}</b>!`;

			const genNumber = MODE_CONFIGS[state.gameMode]?.generation || 9;
			const evoMoves = getMovesLearnedBetween(evoTarget, mon.level, mon.level, true, genNumber);

			state.pendingMoves = state.pendingMoves ?? [];
			for (const move of evoMoves) {
				if (mon.moves.includes(move)) continue;
				if (state.pendingMoves.some(p => p.pokemonIndex === slot && p.move === move)) continue;

				if (mon.moves.length < 4) {
					mon.moves.push(move);
					state.notification += `<br>&nbsp;&nbsp;↳ <b>${evoName}</b> learned <b>${Dex.moves.get(move).name}</b>!`;
				} else {
					state.pendingMoves.push({ pokemonIndex: slot, move, speciesName: mon.species });
				}
			}
		} else {
			if (state.pendingItemIsStackable) {
				if (!mon.stackedItems) mon.stackedItems = {};
				const validItemKey = itemKey || toID(state.pendingItemName);
				mon.stackedItems[validItemKey] = Math.min(99, (mon.stackedItems[validItemKey] || 0) + 1);
				state.notification = `Gave <b>${Utils.escapeHTML(dexNewItem.name)}</b> to <b>${dexSpecies.name}</b>! (x${mon.stackedItems[validItemKey]})`;
			} else {
				if (dexNewItem.forcedForme && dexSpecies.otherFormes?.includes(dexNewItem.forcedForme)) {
					mon.species = toID(dexNewItem.forcedForme);
				} else if (mon.heldItem) {
					const dexOldItem = Dex.items.get(mon.heldItem);
					if (dexOldItem.forcedForme && dexSpecies.otherFormes?.includes(dexOldItem.forcedForme)) {
						mon.species = toID(dexSpecies.changesFrom ?? dexSpecies.baseSpecies);
					}
				}
				mon.heldItem = toID(state.pendingItemName);
				state.notification = `Gave <b>${Utils.escapeHTML(dexNewItem.name)}</b> to <b>${dexSpecies.name}</b>!`;
			}
		}

		delete state.pendingItemName;
		delete state.purchasedItem;
		delete state.pendingItemIsEvo;
		delete state.pendingItemIsMega;
		delete state.pendingItemIsGmax;
		delete state.pendingItemIsStackable;

		if (state.pendingDraftPick) {
			delete state.pendingRewardDraft;
			delete state.rerollCount;
			delete state.pendingDraftPick;
		}

		if (state.pendingRewardDraft) state.view = 'draft';
		else { state.floor++; state.view = 'main'; }
		return true;
	},

	useshopitem(state, user, rest, ctx) {
		if (!state.purchasedItem) {
			ctx.errorReply("No item selected.");
			return false;
		}
		const itemKey = state.purchasedItem;

		if (rest === 'skip') {
			delete state.purchasedItem;
			delete state.pendingConsumableType;

			if (state.pendingDraftPick) {
				delete state.pendingDraftPick;
			} else if (itemKey) {
				const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
				const item = activeShop[itemKey];
				if (item) state.money = (state.money || 0) + getItemPrice(state.floor, item.moneyMultiplier);
			}

			if (state.pendingRewardDraft) state.view = 'draft';
			else { state.floor++; state.view = 'main'; }
			return true;
		}

		const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
		const item = activeShop[itemKey];
		if (!item) {
			ctx.errorReply("Unknown item.");
			return false;
		}

		const slot = parseInt(rest) - 1;
		if (isNaN(slot) || slot < 0 || slot >= state.team.length) {
			ctx.errorReply("Invalid team slot.");
			return false;
		}
		const mon = state.team[slot];
		const hp = mon.currentHp ?? 100;

		if (item.type === 'healHP') {
			if (hp <= 0) { ctx.errorReply("Can't heal a fainted Pokémon. Use a Revive."); return false; }
			if (hp >= 100) { ctx.errorReply("That Pokémon is already at full HP."); return false; }

			const spData = Dex.species.get(toID(mon.species));
			const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			const evs = mon.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			const maxHpActual = Math.floor((2 * bs.hp + 31 + Math.floor(evs.hp / 4)) * mon.level / 100) + mon.level + 10;
			const healPctCalculated = item.healAmount ? Math.max(item.healPercent || 0, (item.healAmount / maxHpActual) * 100) : (item.healPercent || 0);

			mon.currentHp = item.isMax ? 100 : Math.min(100, hp + Math.round(healPctCalculated));
			if (item.curesStatus) delete mon.status;

			mon.happiness = Math.min(255, (mon.happiness ?? 70) + 3);
			state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> restored HP! (${hp}% → ${mon.currentHp}%)`;
		} else if (item.type === 'rareCandy') {
			if (hp <= 0) { ctx.errorReply("Can't use on a fainted Pokémon."); return false; }
			const candyJarStacks = state.keyItems?.['Candy Jar'] || 0;
			const levelsToGain = 1 + candyJarStacks;

			const oldLevel = mon.level;
			const oldSpecies = mon.species;

			mon.level += levelsToGain;
			mon.exp = expForLevel(mon.level, mon.expType || getExpType(mon.species));
			mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);

			const evolved = processLevelUpEvolutions(mon);
			const currentName = Dex.species.get(toID(mon.species)).name;
			state.notification = `<b>${currentName}</b> leveled up by ${levelsToGain} (Lv. ${mon.level})!`;

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const msgs = processLevelUp(mon, oldLevel, oldSpecies, evolved, slot, state, config.generation || 9);
			if (msgs.length) state.notification += '<br>' + msgs.join('<br>');
		} else if (item.type === 'cureStatus') {
			if (hp <= 0) { ctx.errorReply("Can't cure a fainted Pokémon."); return false; }
			if (!mon.status) { ctx.errorReply("That Pokémon has no status condition."); return false; }
			const oldStatus = mon.status;
			delete mon.status;
			state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s ${oldStatus.toUpperCase()} was cured!`;
		} else if (item.type === 'revive') {
			if (hp > 0) { ctx.errorReply("That Pokémon hasn't fainted."); return false; }
			const revAmt = item.reviveAmount || 50;
			mon.currentHp = (item.isMax || mon.species === 'shedinja') ? 100 : revAmt;
			delete mon.status;
			state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> was revived${item.isMax ? ' to full health' : ''}!`;
		} else if (item.type === 'vitamin') {
			if (hp <= 0) { ctx.errorReply("Can't use on a fainted Pokémon."); return false; }
			const evStat = (item).evStat as keyof NonNullable<PokemonEntry['evs']>;
			if (!evStat) { ctx.errorReply("Invalid vitamin."); return false; }
			if (!mon.evs) mon.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			let totalEvs = 0;
			for (const val of Object.values(mon.evs)) totalEvs += val;
			if (totalEvs >= 508) { ctx.errorReply("This Pokémon's EVs are maxed out (508 total)."); return false; }
			if (mon.evs[evStat] >= 252) { ctx.errorReply(`This Pokémon's EV in this stat is already at max (252).`); return false; }

			const gain = Math.min(item.evGain ?? 10, 252 - mon.evs[evStat], 508 - totalEvs);
			mon.evs[evStat] += gain;
			mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);
			state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s EVs raised by ${gain}! (Now: ${mon.evs[evStat]}/252)`;
		} else if (item.type === 'tm') {
			if (hp <= 0) { ctx.errorReply("Can't use on a fainted Pokémon."); return false; }
			const moveId = itemKey.includes('_') ? itemKey.substring(itemKey.indexOf('_') + 1).replace(/[^a-z0-9]/g, '') : toID(item.name.replace(/^TM\d+\s*/i, ''));
			const moveData = Dex.moves.get(moveId);
			if (!moveData.exists) { ctx.errorReply("This TM is invalid or unimplemented."); return false; }
			if (mon.moves.includes(moveData.id)) { ctx.errorReply("This Pokémon already knows this move."); return false; }

			if (mon.moves.length < 4) {
				mon.moves.push(moveData.id);
				state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> learned <b>${moveData.name}</b>!`;
			} else {
				state.pendingMoves = state.pendingMoves || [];
				state.pendingMoves.push({ pokemonIndex: slot, move: moveData.id, speciesName: mon.species });
				state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> is trying to learn <b>${moveData.name}</b>!`;
			}
		} else if (item.type === 'mint') {
			if (hp <= 0) { ctx.errorReply("Can't use on a fainted Pokémon."); return false; }
			const natureName = item.name.replace(' Mint', '');
			const nature = Dex.natures.get(natureName);
			if (!nature.exists) { ctx.errorReply("Invalid mint."); return false; }

			mon.nature = nature.name;
			mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);
			state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s stats changed to match the <b>${nature.name}</b> nature!`;

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			if (state.gameMode === 'classic' || config.progression) {
				const userData = getUserData(user.id);
				let baseSpecies = toID(mon.species);
				while (true) {
					const sp = Dex.species.get(baseSpecies);
					const prevo = sp.prevo;
					if (!prevo) break;
					baseSpecies = toID(prevo);
				}
				const starterData = userData.starters[baseSpecies];
				if (starterData) {
					if (!starterData.unlockedNatures) starterData.unlockedNatures = [starterData.nature!];
					if (!starterData.unlockedNatures.includes(nature.name)) {
						starterData.unlockedNatures.push(nature.name);
						saveUserData(user.id);
					}
				}
			}
		} else if (item.type === 'xItem') {
			if (hp <= 0) { ctx.errorReply("Can't use on a fainted Pokémon."); return false; }
			const stat = item.buffStat!;
			if (!mon.activeBuffs) mon.activeBuffs = {};

			if (mon.activeBuffs[stat]) {
				state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> used ${item.name}! Its stat boost duration was refreshed!`;
			} else {
				state.notification = `<b>${Dex.species.get(toID(mon.species)).name}</b> used ${item.name}! Its stat is boosted for 5 battles!`;
			}

			mon.activeBuffs[stat] = 5;
		}

		delete state.purchasedItem;
		delete state.pendingConsumableType;

		if (state.pendingDraftPick) {
			delete state.pendingRewardDraft;
			delete state.rerollCount;
			delete state.pendingDraftPick;
		}

		if (state.pendingRewardDraft) state.view = 'draft';
		else { state.floor++; state.view = 'main'; }
		return true;
	},
};

export function handleDraftAction(target: string, user: User, state: PokeRogueState, ctx: CommandContext): boolean {
	if (target.trim() === 'skip') {
		delete state.pendingRewardDraft;
		delete state.rerollCount;
		state.floor++;
		state.view = 'main';
		return true;
	}

	const idx = parseInt(target.trim()) - 1;
	if (isNaN(idx) || idx < 0 || idx >= state.pendingRewardDraft!.length) return false;

	const itemKey = state.pendingRewardDraft![idx];
	const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
	const item = activeShop[itemKey];

	if (item.type === 'pokeball') {
		state.inventory = state.inventory || {};
		const maxStack = item.maxStack ?? 99;

		let amountToAdd = 1;
		if (itemKey === 'pokeball' || itemKey === 'greatball') amountToAdd = 5;
		else if (itemKey === 'ultraball') amountToAdd = 2;
		else if (itemKey === 'masterball') amountToAdd = 1;

		if ((state.inventory[itemKey] || 0) < maxStack) {
			const actualAdded = Math.min(amountToAdd, maxStack - (state.inventory[itemKey] || 0));
			state.inventory[itemKey] = (state.inventory[itemKey] || 0) + actualAdded;
			state.notification = `You took ${actualAdded}x <b>${item.name}</b>!`;
		} else {
			ctx.errorReply(`You can't hold any more ${item.name}s!`);
			return false;
		}
		delete state.pendingRewardDraft;
		delete state.rerollCount;
		state.floor++;
		state.view = 'main';
	} else if (item.type === 'key') {
		state.keyItems = state.keyItems || {};
		const maxStack = item.maxStack ?? 1;
		if ((state.keyItems[item.name] || 0) < maxStack) {
			state.keyItems[item.name] = (state.keyItems[item.name] || 0) + 1;
			state.notification = `Obtained Key Item: <b>${item.name}</b>!`;
		} else {
			ctx.errorReply(`You can't hold any more ${item.name}s!`);
			return false;
		}
		delete state.pendingRewardDraft;
		delete state.rerollCount;
		state.floor++;
		state.view = 'main';
	} else if (item.type === 'itemPack') {
		delete state.pendingRewardDraft;
		delete state.rerollCount;

		if (itemKey === 'starter_token') {
			state.notification = `You unlocked a new Starter!`;
			state.floor++;
			state.view = 'main';
		} else if (itemKey === 'lure' || itemKey === 'superlure' || itemKey === 'maxlure') {
			const charges = itemKey === 'lure' ? 5 : itemKey === 'superlure' ? 10 : 25;
			state.lureCharges = (state.lureCharges || 0) + charges;
			state.notification = `Lure active! Doubles chance increased for ${state.lureCharges} battles!`;
			state.floor++;
			state.view = 'main';
		} else if (itemKey === 'rarercandy') {
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const notifs = applyRarerCandy(state, config);
			state.notification = notifs.join('<br>');
			state.floor++;
			state.view = 'main';
		} else {
			const amuletCoinStacks = state.keyItems?.['Amulet Coin'] || 0;
			let rewardMoney = getRewardMoney(state.floor, item.moneyMultiplier || 1);
			if (amuletCoinStacks > 0) rewardMoney = Math.floor(rewardMoney * (1 + 0.20 * amuletCoinStacks));

			state.money = (state.money || 0) + rewardMoney;
			state.notification = `You sold the ${item.name} for $${rewardMoney}!`;
			state.floor++;
			state.view = 'main';
		}
	} else if (item.type === 'item' || item.type === 'evolveItem' || item.type === 'megaStone' || item.type === 'stackableItem' || item.type === 'gmaxMushroom') {
		state.pendingDraftPick = true;
		state.purchasedItem = itemKey;
		state.pendingItemName = item.name;
		state.pendingItemIsEvo = item.type === 'evolveItem' || itemKey === 'metalcoat';
		state.pendingItemIsMega = item.type === 'megaStone';
		state.pendingItemIsGmax = item.type === 'gmaxMushroom';
		state.pendingItemIsStackable = item.type === 'stackableItem' || itemKey === 'metalcoat';
		state.view = 'main';
	} else if (['healHP', 'revive', 'cureStatus', 'vitamin', 'tm', 'mint', 'rareCandy', 'xItem'].includes(item.type)) {
		state.pendingDraftPick = true;
		state.purchasedItem = itemKey;
		state.pendingConsumableType = item.type;
		state.view = 'main';
	}
	return true;
}

export function handleBuyShopAction(target: string, user: User, state: PokeRogueState, ctx: CommandContext): boolean {
	const itemKey = toID(target);
	const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
	const item = activeShop[itemKey];

	if (!item?.isShopItem) { ctx.errorReply("Unknown shop item."); return false; }

	const price = getItemPrice(state.floor, item.moneyMultiplier);
	if ((state.money || 0) < price) { ctx.errorReply(`Not enough money! Need $${price}.`); return false; }

	state.money -= price;

	if (itemKey === 'sacredash') {
		for (const mon of state.team) {
			if ((mon.currentHp ?? 100) <= 0) {
				mon.currentHp = 100;
				delete mon.status;
			}
		}
		state.notification = `Sacred Ash revived all fainted Pokémon!`;
		return true;
	}

	if (itemKey === 'rarercandy') {
		const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
		const notifs = applyRarerCandy(state, config);
		state.notification = notifs.join('<br>');
		if (state.pendingRewardDraft) state.view = 'draft';
		else { state.floor++; state.view = 'main'; }
		return true;
	}

	state.purchasedItem = itemKey;
	if (item.type === 'item' || item.type === 'evolveItem' || item.type === 'megaStone' || item.type === 'stackableItem' || item.type === 'gmaxMushroom') {
		state.pendingItemName = item.name;
		state.pendingItemIsEvo = item.type === 'evolveItem' || itemKey === 'metalcoat';
		state.pendingItemIsMega = item.type === 'megaStone';
		state.pendingItemIsGmax = item.type === 'gmaxMushroom';
		state.pendingItemIsStackable = item.type === 'stackableItem' || itemKey === 'metalcoat';
	} else if (item.type === 'healHP' || item.type === 'revive' || item.type === 'cureStatus' || item.type === 'vitamin' || item.type === 'tm' || item.type === 'mint' || item.type === 'rareCandy' || item.type === 'xItem') {
		state.pendingConsumableType = item.type;
	}
	state.view = 'main';
	return true;
}

export function handleChooseAction(target: string, user: User, state: PokeRogueState, ctx: CommandContext): boolean {
	const userData = getUserData(user.id);
	const n = parseInt(target) - 1;
	if (!state.pendingChoice || isNaN(n) || n < 0 || n >= state.pendingChoice.length) return false;
	const choice = state.pendingChoice[n];

	const isStarterChoice = state.pendingChoiceType === 'starter' || !state.team?.length;
	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
	const maxCost = config.maxStarterCost || 10;

	let addedLevel = config.starterLevel ?? 5;
	if (!isStarterChoice) {
		const maxPlayerLevel = state.team.length > 0 ? Math.max(...state.team.map(m => m.level)) : (config.starterLevel ?? 5);
		if (state.floor <= 30) addedLevel = Math.max(1, maxPlayerLevel - 1);
		else if (state.floor <= 50) addedLevel = Math.max(1, maxPlayerLevel - 2);
		else {
			const levelDrop = Math.floor(Math.random() * 2) + 2;
			addedLevel = Math.max(1, maxPlayerLevel - levelDrop);
		}
	}

	let finalSpecies = choice;
	if (!isStarterChoice) {
		while (true) {
			const evo = getLevelUpEvo(finalSpecies, 70);
			if (!evo || addedLevel < evo.evoLevel) break;
			finalSpecies = evo.evoTo;
		}
	}

	if (isStarterChoice) {
		let currentCost = 0;
		if (state.team) {
			for (const mon of state.team) currentCost += getStarterCost(mon.species);
		}
		const newCost = getStarterCost(finalSpecies);
		if (currentCost + newCost > maxCost) {
			ctx.errorReply(`Total starter cost cannot exceed ${maxCost}.`);
			return false;
		}
		if (state.team?.length >= 6) {
			ctx.errorReply("You can only choose up to 6 starters.");
			return false;
		}
		if (state.team?.some(m => toID(m.species) === toID(finalSpecies))) {
			ctx.errorReply("You have already selected this starter.");
			return false;
		}
	}

	let newMon: PokemonEntry;
	const savedStarter = isStarterChoice ? userData.starters[toID(finalSpecies)] : null;

	const randomIvs = {
		hp: Math.floor(Math.random() * 32), atk: Math.floor(Math.random() * 32), def: Math.floor(Math.random() * 32),
		spa: Math.floor(Math.random() * 32), spd: Math.floor(Math.random() * 32), spe: Math.floor(Math.random() * 32),
	};
	const shiny = savedStarter ? !!savedStarter.shiny : (Math.floor(Math.random() * 4096) === 0);
	const gender = savedStarter?.gender || Dex.species.get(finalSpecies).gender || (Math.random() < 0.5 ? 'M' : 'F');
	const allTypes = Dex.types.all().map(t => t.name);
	const teraType = savedStarter?.selectedTeraType || savedStarter?.teraType || (Math.floor(Math.random() * 20) === 0 ?
		allTypes[Math.floor(Math.random() * allTypes.length)] :
		Dex.species.get(finalSpecies).types[Math.floor(Math.random() * Dex.species.get(finalSpecies).types.length)]);

	const commonProps = {
		ivs: savedStarter?.ivs ? { ...savedStarter.ivs } : randomIvs,
		evs: savedStarter?.evs ? { ...savedStarter.evs } : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
		shiny, gender: gender === 'M' || gender === 'F' || gender === 'N' ? gender : 'N', teraType, happiness: 120,
		originalTrainer: state.displayName || user.name, otId: user.id.substring(0, 6),
		metLocation: "Professor Oak's Lab", metLevel: addedLevel, metDate: Date.now(),
		marks: savedStarter?.marks ? [...savedStarter.marks] : [], ball: savedStarter?.ball || 'pokeball',
	};

	if (config.randomizeMoves || config.randomizeAbilities) {
		const generated = genPokemon(1, addedLevel, true, state.floor, false, 0, [finalSpecies], state.currentBiome, config, data);
		const g = generated[0];
		newMon = {
			species: g.species, level: g.level, exp: expForLevel(g.level, getExpType(g.species)), expType: getExpType(g.species),
			moves: g.moves, nature: savedStarter?.selectedNature || savedStarter?.nature || g.nature,
			ability: savedStarter?.selectedAbility || savedStarter?.ability || g.ability, ...commonProps,
		} as PokemonEntry;
	} else {
		const finalExpType = getExpType(finalSpecies);
		const initialMoves = getLevelUpMoves(finalSpecies, addedLevel, config.generation);

		const allLevelMoves = getAllLevelUpMoves(finalSpecies, addedLevel, config.generation || 9);
		const validEggMoves = getEggMoves(finalSpecies, config.generation || 9);
		const legalPool = new Set([...allLevelMoves, ...validEggMoves]);

		let validatedMoves = initialMoves;
		if (savedStarter?.selectedMoves) {
			validatedMoves = savedStarter.selectedMoves.filter(m => legalPool.has(m));
			for (const m of initialMoves) {
				if (validatedMoves.length >= 4) break;
				if (!validatedMoves.includes(m)) validatedMoves.push(m);
			}
		}

		const natures = Dex.natures.all().map(n => n.name);
		const hash = ((state.floor ?? 1) * 37) + (n * 13) + Dex.species.get(finalSpecies).id.length;
		const displayNature = natures[hash % natures.length] ?? 'Hardy';

		newMon = {
			species: finalSpecies, level: addedLevel, exp: expForLevel(addedLevel, finalExpType), expType: finalExpType,
			moves: validatedMoves,
			nature: savedStarter?.selectedNature || savedStarter?.nature || displayNature,
			ability: savedStarter?.selectedAbility || savedStarter?.ability || Dex.species.get(finalSpecies).abilities[0] || '', ...commonProps,
		} as PokemonEntry;
	}

	if (isStarterChoice) {
		const sid = toID(finalSpecies);
		if (!userData.starters[sid]) {
			userData.starters[sid] = {
				...newMon,
				unlockedNatures: [newMon.nature!],
				unlockedAbilities: [newMon.ability!],
				unlockedTeraTypes: [newMon.teraType!],
				selectedNature: newMon.nature,
				selectedAbility: newMon.ability,
				selectedTeraType: newMon.teraType,
			};
			saveUserData(user.id);
		}
		state.team = state.team || [];
		state.team.push(newMon);
		state.isConfiguringStarter = true;

		const useNewStarterSelectionUI = data.useNewStarterSelectionUI !== false;
		if (!useNewStarterSelectionUI) {
			delete state.pendingChoice;
			delete state.pendingChoiceType;
			delete state.pendingChoiceFloor;
			state.view = 'stats';
			state.pendingStatsSlot = 0;
		}
	} else if (state.team.length < 6) {
		state.team.push(newMon);
	} else {
		state.pendingSwap = newMon;
	}

	if (!isStarterChoice) {
		delete state.pendingChoice;
		delete state.pendingChoiceType;
		delete state.pendingChoiceFloor;
	}
	return true;
}

export function handleCatchAction(target: string, room: AnyObject, user: User, state: PokeRogueState, ctx: CommandContext): void {
	const catchMatch = activeMatches.get(room.roomid);
	if (!catchMatch || catchMatch.userId !== user.id) {
		ctx.errorReply("You can only catch Pokémon in your own battle.");
		return;
	}

	if (!room.battle.turn) { ctx.errorReply("The battle hasnt started yet!"); return; }
	if (state.caughtPokemon) { ctx.errorReply("You already caught this Pokémon!"); return; }

	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const floor = state.floor;
	if (floor % config.bossInterval === 0 || catchMatch.isTrainerBattle) {
		ctx.errorReply("You cannot catch Trainer or Boss Pokémon!");
		return;
	}

	const targetMatch = target.trim().split(' ');
	const ballType = toID(targetMatch[0]);
	const reqSlot = targetMatch[1] ? targetMatch[1].toLowerCase() : '';

	if (!['pokeball', 'greatball', 'ultraball', 'masterball'].includes(ballType)) {
		ctx.errorReply("Invalid Poké Ball type.");
		return;
	}

	state.inventory = state.inventory || {};
	if ((state.inventory[ballType] || 0) <= 0) { ctx.errorReply(`You don't have any ${ballType}s left!`); return; }

	const now = Date.now();
	const lastThrow = state.lastThrowTime || 0;
	if (now - lastThrow < 1500) {
		ctx.errorReply("Please wait a moment before throwing another Poké Ball.");
		return;
	}
	state.lastThrowTime = now;

	const log = room.log?.log || [];
	const parsed = parseBattleState(log, state.team);
	const p1Fainted = parsed.p1ActiveFainted;
	const p2State = parsed.p2Active;

	for (const data of p2State.values()) if (!data.level) data.level = botLevel(floor, config);

	let aliveOpponents = 0;
	for (const [, data] of p2State.entries()) if (!data.fainted && data.hp > 0) aliveOpponents++;

	if (aliveOpponents > 1) {
		ctx.errorReply("It's no good! It's impossible to aim when there are multiple Pokémon!");
		return;
	}
	if (p1Fainted) {
		ctx.errorReply("You cannot throw a Poké Ball while your Pokémon is fainted! Please send out a new Pokémon first.");
		return;
	}

	let targetMon = null;
	if (reqSlot) {
		targetMon = p2State.get(reqSlot);
		if (!targetMon || targetMon.fainted) { ctx.errorReply("That target is not available to catch."); return; }
	} else {
		for (const [, data] of p2State.entries()) {
			if (!data.fainted && data.hp > 0) { targetMon = data; break; }
		}
	}

	if (!targetMon || targetMon.fainted) { ctx.errorReply("There is no active Pokémon to catch."); return; }

	const p2Species = targetMon.species;
	const p2Level = targetMon.level;
	let p2Hp = targetMon.hp;
	const p2MaxHp = targetMon.maxHp;
	let p2Status = targetMon.status;

	if (p2Status === 'none') p2Status = '';
	if (p2Hp === -1) p2Hp = 100;

	state.inventory[ballType]--;
	setState(user.id, state);

	const turn = room.battle.turn || 1;
	const inv = state.inventory;
	const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
		`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
		`<button name="send" value="/pokerogue catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
		`<button name="send" value="/pokerogue catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
		`<button name="send" value="/pokerogue catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
		`<button name="send" value="/pokerogue catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
		`</div>`;

	user.sendTo(room as BasicRoom, `|uhtmlchange|catchpanel-${turn}|${catchHTML}`);
	room.add(`|c|~|You threw a ${ballType}!`).update();

	const baseCatchRate = CATCH_RATES[p2Species] || 45;
	let ballBonus = 1;
	if (ballType === 'greatball') ballBonus = 1.5;
	if (ballType === 'ultraball') ballBonus = 2.0;

	let statusBonus = 1;
	if (['slp', 'frz'].includes(p2Status)) statusBonus = 2.5;
	else if (['brn', 'psn', 'tox', 'par'].includes(p2Status)) statusBonus = 1.5;

	const hpPercent = p2Hp / p2MaxHp;
	const modifiedCatchRate = (1 - (2 / 3) * hpPercent) * baseCatchRate * ballBonus * statusBonus;
	const shakeProb = Math.min(65536, Math.floor(65536 * (modifiedCatchRate / 255) ** 0.1875));

	let shakes = 0;
	if (ballType === 'masterball') {
		shakes = 3;
	} else {
		for (let i = 0; i < 3; i++) {
			if (Math.floor(Math.random() * 65536) < shakeProb) shakes++;
			else break;
		}
	}

	if (shakes === 3) {
		const dexSp = Dex.species.get(p2Species);
		room.add(`|c|~|Gotcha! ${dexSp.name} was caught!`).update();

		const p1Participants = new Set<string>();
		let p2SwitchIdx = 0;

		for (let i = log.length - 1; i >= 0; i--) {
			if (/^\|(?:switch|drag)\|p2[a-z]:/.test(log[i])) { p2SwitchIdx = i; break; }
		}

		for (let i = p2SwitchIdx; i >= 0; i--) {
			const match = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
			if (match) { p1Participants.add(toID(match[1])); break; }
		}

		for (let i = p2SwitchIdx; i < log.length; i++) {
			const match = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
			if (match) p1Participants.add(toID(match[1]));
		}

		const participantsStr = Array.from(p1Participants).join(',');
		room.add(`|-message|PR_EXP|${p2Species}|${p2Level}|${participantsStr}`).update();

		const hpPct = Math.max(1, Math.round((p2Hp / p2MaxHp) * 100));
		const natures = Dex.natures.all().map(n => n.name);
		const randomNature = natures[Math.floor(Math.random() * natures.length)];

		let caughtMoves = getLevelUpMoves(p2Species, p2Level, config.generation);
		let caughtAbility = Dex.species.get(p2Species).abilities[0] || '';
		let caughtItem = '';

		const freshCaughtIvs: StatTable = {
			hp: Math.floor(Math.random() * 32), atk: Math.floor(Math.random() * 32), def: Math.floor(Math.random() * 32),
			spa: Math.floor(Math.random() * 32), spd: Math.floor(Math.random() * 32), spe: Math.floor(Math.random() * 32),
		};
		let caughtShiny = false;
		let caughtGender: PokemonEntry['gender'] = Dex.species.get(p2Species).gender || (Math.random() < 0.5 ? 'M' : 'F');
		let caughtTera = Dex.species.get(p2Species).types[0];

		if (catchMatch.botTeam) {
			const botMon = catchMatch.botTeam.find(m => toID(m.species) === p2Species || toID(m.name) === p2Species);
			if (botMon) {
				if (botMon.moves && botMon.moves.length > 0) caughtMoves = botMon.moves;
				if (botMon.ability) caughtAbility = botMon.ability;
				if (botMon.item) caughtItem = botMon.item;
				if (botMon.shiny) caughtShiny = botMon.shiny;
				if (botMon.gender === 'M' || botMon.gender === 'F' || botMon.gender === 'N') caughtGender = botMon.gender;
				if (botMon.teraType) caughtTera = botMon.teraType;
			}
		}

		const caught: PokemonEntry = {
			species: p2Species, level: p2Level, exp: expForLevel(p2Level, getExpType(p2Species)), expType: getExpType(p2Species),
			moves: caughtMoves, nature: randomNature, currentHp: hpPct, ability: caughtAbility, ball: ballType,
			ivs: freshCaughtIvs, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
			shiny: caughtShiny, gender: caughtGender === 'M' || caughtGender === 'F' || caughtGender === 'N' ? caughtGender : 'N', teraType: caughtTera, happiness: 70,
			originalTrainer: state.displayName || user.name, otId: user.id.substring(0, 6),
			metLocation: `${state.currentBiome || 'Wild Area'} (Floor ${state.floor})`, metLevel: p2Level,
			metDate: Date.now(), marks: [],
		};

		if (caughtItem) caught.heldItem = caughtItem;
		if (p2Status === 'brn' || p2Status === 'psn' || p2Status === 'tox' || p2Status === 'par' || p2Status === 'slp' || p2Status === 'frz') caught.status = p2Status;

		const userData = getUserData(user.id);

		if (state.gameMode === 'classic' || config.progression) {
			let baseSpecies = p2Species;
			while (true) {
				const sp = Dex.species.get(baseSpecies);
				const prevo = sp.prevo;
				if (!prevo) break;
				baseSpecies = toID(prevo);
			}

			const existingStarter = userData.starters[baseSpecies];
			const baseDex = Dex.species.get(baseSpecies);

			const bestIvs: StatTable = existingStarter?.ivs ? {
				hp: Math.max(existingStarter.ivs.hp, freshCaughtIvs.hp), atk: Math.max(existingStarter.ivs.atk, freshCaughtIvs.atk),
				def: Math.max(existingStarter.ivs.def, freshCaughtIvs.def), spa: Math.max(existingStarter.ivs.spa, freshCaughtIvs.spa),
				spd: Math.max(existingStarter.ivs.spd, freshCaughtIvs.spd), spe: Math.max(existingStarter.ivs.spe, freshCaughtIvs.spe),
			} : { ...freshCaughtIvs };

			const isShiny = existingStarter?.shiny || caught.shiny;

			const unlockedNatures = new Set(existingStarter?.unlockedNatures || []);
			if (existingStarter?.nature) unlockedNatures.add(existingStarter.nature);
			if (existingStarter?.selectedNature) unlockedNatures.add(existingStarter.selectedNature);
			const oldNaturesSize = unlockedNatures.size;
			if (caught.nature) unlockedNatures.add(caught.nature);

			const unlockedAbilities = new Set(existingStarter?.unlockedAbilities || []);
			if (existingStarter?.ability) unlockedAbilities.add(existingStarter.ability);
			if (existingStarter?.selectedAbility) unlockedAbilities.add(existingStarter.selectedAbility);
			const oldAbilitiesSize = unlockedAbilities.size;
			if (caught.ability) unlockedAbilities.add(caught.ability);

			const unlockedTeraTypes = new Set(existingStarter?.unlockedTeraTypes || []);
			if (existingStarter?.teraType) unlockedTeraTypes.add(existingStarter.teraType);
			if (existingStarter?.selectedTeraType) unlockedTeraTypes.add(existingStarter.selectedTeraType);
			const oldTeraSize = unlockedTeraTypes.size;
			if (caught.teraType) unlockedTeraTypes.add(caught.teraType);

			const selectedNature = existingStarter?.selectedNature || caught.nature;
			const selectedAbility = existingStarter?.selectedAbility || caught.ability;
			const selectedTeraType = existingStarter?.selectedTeraType || caught.teraType;

			const baseCaught: PokemonEntry = {
				...caught, species: baseSpecies, level: 5, exp: expForLevel(5, getExpType(baseSpecies)), expType: getExpType(baseSpecies),
				moves: getLevelUpMoves(baseSpecies, 5, config.generation), ability: selectedAbility, nature: selectedNature,
				shiny: !!isShiny, ivs: bestIvs, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
				metLevel: 5, metLocation: `${state.currentBiome || 'Wild Area'} (Floor ${state.floor})`, currentHp: 100,
				ball: caught.ball, gender: caught.gender, teraType: caught.teraType, marks: caught.marks ? [...caught.marks] : [],
				unlockedNatures: Array.from(unlockedNatures),
				unlockedAbilities: Array.from(unlockedAbilities),
				unlockedTeraTypes: Array.from(unlockedTeraTypes),
				selectedNature,
				selectedAbility,
				selectedTeraType,
			};

			delete baseCaught.status;
			delete baseCaught.heldItem;

			userData.starters[baseSpecies] = baseCaught;
			saveUserData(user.id);

			const starterUnlocks: string[] = [];
			if (!existingStarter) {
				starterUnlocks.push(`&nbsp;&nbsp;↳ ${baseDex.name} - Unlocked as a Starter!`);
			} else {
				if (!existingStarter.shiny && caught.shiny) {
					starterUnlocks.push(`&nbsp;&nbsp;↳ ${baseDex.name} - Unlocked Shiny form!`);
				}
				if (unlockedNatures.size > oldNaturesSize) {
					starterUnlocks.push(`&nbsp;&nbsp;↳ ${baseDex.name} - Unlocked ${caught.nature} Nature.`);
				}
				if (unlockedAbilities.size > oldAbilitiesSize) {
					const abilityName = Dex.abilities.get(caught.ability).name || caught.ability;
					starterUnlocks.push(`&nbsp;&nbsp;↳ ${baseDex.name} - Unlocked ${abilityName} Ability.`);
				}
				if (unlockedTeraTypes.size > oldTeraSize) {
					starterUnlocks.push(`&nbsp;&nbsp;↳ ${baseDex.name} - Unlocked ${caught.teraType} Tera Type.`);
				}
			}
			caught.starterUnlocks = starterUnlocks;
		}

		state.caughtPokemon = caught;
		setState(user.id, state);

		const match = activeMatches.get(room.roomid);
		if (match) {
			const botUser = Users.get(match.botUserId);
			if (botUser) {
				setTimeout(() => { if (room.battle && !room.battle.ended) (room.battle).forfeit(botUser); }, 300);
			}
		}
	} else {
		const catchMatch = activeMatches.get(room.roomid);
		const passChoice = catchMatch?.isDoubles ? 'pass, pass' : 'pass';
		void room.battle.stream.write(`>p1 ${passChoice}`);

		let escapeMsg = `|c|~|Oh no! The Pokémon broke free!`;
		if (shakes === 1) escapeMsg = `|c|~|Aww! It appeared to be caught!`;
		if (shakes === 2) escapeMsg = `|c|~|Aargh! Almost had it!`;
		room.add(escapeMsg).update();
	}
}
