import { ObjectReadWriteStream } from '../../../lib/streams';
import { StreamWorker } from '../../../lib/process-manager';
import { type ModeConfig, type PokeRogueState, type PokemonEntry } from './types';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { genAIPokemon, packAITeam, packTeam, type AIPokemonSet, botLevel } from './pokemon';
import { setState, getState, loadUser } from './database';

export interface ParsedPokemonState {
	species: string;
	level: number;
	hp: number;
	maxHp: number;
	status: string;
	fainted: boolean;
}

export interface ParsedBattleState {
	p1TeamHp: Record<number, number>;
	p1TeamStatus: Record<number, string>;
	p1FaintedIndices: Set<number>;
	p2Active: Map<string, ParsedPokemonState>;
	p1ActiveFainted: boolean;
	consumedItems: { teamIdx: number, itemId: string }[];
}

export function parseBattleState(logLines: string[], playerTeam: PokemonEntry[]): ParsedBattleState {
	const p1TeamHp: Record<number, number> = {};
	const p1TeamStatus: Record<number, string> = {};
	const p1FaintedIndices = new Set<number>();

	const p2Active = new Map<string, ParsedPokemonState>();
	let p1ActiveFainted = false;

	const consumedItems: { teamIdx: number, itemId: string }[] = [];

	const p1SlotToTeamIdx: Record<string, number> = {};
	const p1ActivelyAssigned = new Set<number>();

	const itemSlotMap: Record<string, number> = {};
	const itemAssigned = new Set<number>();

	const p1SlotState = new Map<string, boolean>();

	for (const line of logLines) {
		const swMatch = /^\|(?:switch|drag)\|(p[12][a-z]): [^|]+\|([^|,]+)(?:, L(\d+))?[^|]*\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
		if (swMatch) {
			const slot = swMatch[1];
			const species = toID(swMatch[2].trim());
			const level = swMatch[3] ? parseInt(swMatch[3]) : 0;
			const hp = parseInt(swMatch[4]);
			const maxHp = swMatch[5] ? parseInt(swMatch[5]) : 100;
			const status = swMatch[6] || '';

			if (slot.startsWith('p1')) {
				p1SlotState.set(slot, false);

				const prev = p1SlotToTeamIdx[slot];
				if (prev !== undefined) p1ActivelyAssigned.delete(prev);

				let matched = -1;
				for (let i = 0; i < playerTeam.length; i++) {
					if (!p1ActivelyAssigned.has(i) && toID(playerTeam[i].species) === species && !p1FaintedIndices.has(i) && (playerTeam[i].currentHp ?? 100) > 0) {
						matched = i;
						break;
					}
				}
				if (matched !== -1) {
					p1SlotToTeamIdx[slot] = matched;
					p1ActivelyAssigned.add(matched);
					p1TeamHp[matched] = hp;
					p1TeamStatus[matched] = status;
				}

				const prevItem = itemSlotMap[slot];
				if (prevItem !== undefined) itemAssigned.delete(prevItem);
				const logBase = toID(Dex.species.get(species).baseSpecies || species);
				for (let i = 0; i < playerTeam.length; i++) {
					const teamBase = toID(Dex.species.get(playerTeam[i].species).baseSpecies || playerTeam[i].species);
					if (!itemAssigned.has(i) && teamBase === logBase && !p1FaintedIndices.has(i) && (playerTeam[i].currentHp ?? 100) > 0) {
						itemSlotMap[slot] = i;
						itemAssigned.add(i);
						break;
					}
				}
			} else {
				p2Active.set(slot, { species, level, hp, maxHp, status, fainted: hp <= 0 });
			}
			continue;
		}

		const dmgMatch = /^\|(?:-damage|-heal)\|(p[12][a-z]): [^|]+\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
		if (dmgMatch) {
			const slot = dmgMatch[1];
			const hp = parseInt(dmgMatch[2]);
			const maxHp = dmgMatch[3] ? parseInt(dmgMatch[3]) : 100;
			const status = dmgMatch[4] || '';

			if (slot.startsWith('p1')) {
				const idx = p1SlotToTeamIdx[slot];
				if (idx !== undefined) {
					p1TeamHp[idx] = hp;
					if (status) p1TeamStatus[idx] = status;
				}
			} else {
				const s = p2Active.get(slot);
				if (s) {
					s.hp = hp;
					if (dmgMatch[3]) s.maxHp = maxHp;
					if (status) s.status = status;
				}
			}
			continue;
		}

		const stMatch = /^\|-status\|(p[12][a-z]): [^|]+\|(brn|psn|tox|par|slp|frz)/.exec(line);
		if (stMatch) {
			const slot = stMatch[1];
			const status = stMatch[2];
			if (slot.startsWith('p1')) {
				const idx = p1SlotToTeamIdx[slot];
				if (idx !== undefined) p1TeamStatus[idx] = status;
			} else {
				const s = p2Active.get(slot);
				if (s) s.status = status;
			}
			continue;
		}

		const cureMatch = /^\|-curestatus\|(p[12][a-z]):/.exec(line);
		if (cureMatch) {
			const slot = cureMatch[1];
			if (slot.startsWith('p1')) {
				const idx = p1SlotToTeamIdx[slot];
				if (idx !== undefined) p1TeamStatus[idx] = '';
			} else {
				const s = p2Active.get(slot);
				if (s) s.status = '';
			}
			continue;
		}

		const faintMatch = /^\|faint\|(p[12][a-z]):/.exec(line);
		if (faintMatch) {
			const slot = faintMatch[1];
			if (slot.startsWith('p1')) {
				p1SlotState.set(slot, true);

				const idx = p1SlotToTeamIdx[slot];
				if (idx !== undefined) {
					p1TeamHp[idx] = 0;
					p1TeamStatus[idx] = '';
					p1FaintedIndices.add(idx);
					p1ActivelyAssigned.delete(idx);
					delete p1SlotToTeamIdx[slot];
				}
			} else {
				const s = p2Active.get(slot);
				if (s) {
					s.fainted = true;
					s.hp = 0;
					s.status = '';
				}
			}
			continue;
		}

		const endItemMatch = /^\|-enditem\|p1([a-z]): [^|]+\|([^|]+)/.exec(line);
		if (endItemMatch) {
			if (line.includes('[from] move: Knock Off') || line.includes('[from] move: Thief') || line.includes('[from] move: Incinerate')) continue;
			const slot = 'p1' + endItemMatch[1];
			const itemId = toID(endItemMatch[2].trim());
			const teamIdx = itemSlotMap[slot];
			if (teamIdx !== undefined) {
				consumedItems.push({ teamIdx, itemId });
			}
		}
	}

	if (p1SlotState.size > 0) {
		let totalAlive = 0;
		for (let i = 0; i < playerTeam.length; i++) {
			let hp = playerTeam[i].currentHp ?? 100;
			if (p1TeamHp[i] !== undefined) hp = p1TeamHp[i];
			if (p1FaintedIndices.has(i)) hp = 0;
			if (hp > 0) totalAlive++;
		}

		const activeAliveCount = Array.from(p1SlotState.values()).filter(isFainted => !isFainted).length;
		const hasFaintedSlot = Array.from(p1SlotState.values()).includes(true);

		p1ActiveFainted = activeAliveCount === 0 || (hasFaintedSlot && totalAlive > activeAliveCount);
	}

	return {
		p1TeamHp,
		p1TeamStatus,
		p1FaintedIndices,
		p2Active,
		p1ActiveFainted,
		consumedItems,
	};
}

interface BattlePokemonLike {
	fainted?: boolean;
	hp?: number;
	condition?: string;
	species?: { name?: string } | string;
	ability?: string;
	baseAbility?: string;
}

interface BattleRequestPokemon {
	details?: string;
	condition?: string;
	fainted?: boolean;
	hp?: number;
	commanding?: boolean;
	stats?: { atk?: number, spa?: number };
	boosts?: Record<string, number>;
}

interface BattleRequestMove {
	id: string;
	disabled?: boolean;
	pp?: number;
}

interface BattleRequestActive {
	moves?: BattleRequestMove[];
	trapped?: boolean;
	maybeTrapped?: boolean;
	partiallyTrapped?: boolean;
	canMegaEvo?: boolean;
	canUltraBurst?: boolean;
	canDynamax?: boolean;
	canTerastallize?: boolean;
	teraType?: string;
	maxMoves?: { maxMoves?: BattleRequestMove[] };
}

interface BattleChoiceRequest {
	wait?: boolean;
	teamPreview?: boolean;
	forceSwitch?: boolean[];
	active?: BattleRequestActive[];
	side?: { pokemon?: BattleRequestPokemon[] };
}

interface ScoredSwitch {
	idx: number;
	score: number;
}

interface ScoredMove {
	m: BattleRequestMove;
	originalIdx: number;
	score: number;
	target: number | null;
}

interface MatchupContext {
	gen: number;
	turn: number;
	userPokemon: BattleRequestPokemon;
	userSpecies: string;
	userDex: ReturnType<typeof Dex.species.get>;
	targetSpecies: string;
	targetDex: ReturnType<typeof Dex.species.get>;
	targetAbility: string;
	boosts: Record<string, number>;
	oppStatus: string;
	targetCondition: string;
	hazardsSet: Set<string>;
	screensSet: Set<string>;
	allyFainted: boolean;
}

interface ActiveRougeMatch {
	userId: ID;
	botUserId: ID;
	floor: number;
	lastPanelTurn?: number;
	isTrainerBattle?: boolean;
	botTeam?: AIPokemonSet[];
	isDoubles?: boolean;
}

const TRAINER_NAME = 'PokéRogue Challenger';

const ABILITY_IMMUNITIES: Record<string, string[]> = {
	levitate: ['Ground'],
	flashfire: ['Fire'],
	voltabsorb: ['Electric'],
	waterabsorb: ['Water'],
	dryskin: ['Water'],
	stormdrain: ['Water'],
	lightningrod: ['Electric'],
	motordrive: ['Electric'],
	sapsipper: ['Grass'],
	wonderguard: [],
	eartheater: ['Ground'],
	wellbakedbody: ['Fire'],
	windpower: [],
	purifyingsalt: ['Ghost'],
	bulletproof: [],
	soundproof: [],
};

const BULLETPROOF_MOVES = new Set([
	'aurasphere', 'barrage', 'beachballfall', 'beedrillrage', 'cannonball',
	'electroball', 'energyball', 'focusblast', 'gyroball', 'iceball',
	'magnetbomb', 'mindblown', 'mistball', 'mudbomb', 'octazooka',
	'paleowave', 'payday', 'pollenpuff', 'rockblast', 'rockwrecker',
	'seedbomb', 'shadowball', 'sludgebomb', 'weatherball', 'zingzap',
]);

const SOUNDPROOF_MOVES = new Set([
	'boomburst', 'bugbuzz', 'chatter', 'clangingscales', 'clangoroussoul',
	'disarmingvoice', 'echoedvoice', 'grasswhistle', 'growl', 'healbell',
	'howl', 'hypervoice', 'meloettaspiritedstep', 'nobleroar', 'overdrive',
	'perishsong', 'relicsong', 'roar', 'round', 'screech', 'shadowball',
	'sing', 'snarl', 'snore', 'sparklingsurge', 'supersonic', 'uproar',
]);

class NoopStream extends ObjectReadWriteStream<string> {
	override _write(_data: string): void {}
}

const noopWorker = new StreamWorker(new NoopStream());
let botCounter = 0;

const botBattleHandlers = new Map<string, (roomid: string, requestLine: string) => void>();
export const activeMatches = new Map<RoomID, ActiveRougeMatch>();
const recentMoveHistory = new Map<string, Map<number, Map<string, number>>>();

function isFainted(pokemon: BattlePokemonLike | BattleRequestPokemon | null | undefined): boolean {
	return !pokemon || !!pokemon.fainted || (pokemon.hp !== undefined && pokemon.hp <= 0) || !!pokemon.condition?.endsWith(' fnt');
}

function parseHpRatio(condition: string | undefined): number {
	if (!condition || condition.endsWith(' fnt')) return 0;
	const match = /^(\d+)\/(\d+)/.exec(condition);
	if (!match) return 1;
	return parseInt(match[1]) / parseInt(match[2]);
}

function recordMoveUsed(roomid: string, slot: number, moveId: string, turn: number): void {
	if (!recentMoveHistory.has(roomid)) recentMoveHistory.set(roomid, new Map());
	const slots = recentMoveHistory.get(roomid)!;
	if (!slots.has(slot)) slots.set(slot, new Map());
	slots.get(slot)!.set(moveId, turn);
}

function getLastUsedTurn(roomid: string, slot: number, moveId: string): number {
	return recentMoveHistory.get(roomid)?.get(slot)?.get(moveId) ?? -99;
}

function clearMoveHistory(roomid: string): void {
	recentMoveHistory.delete(roomid);
}

function getOpponentSpecies(room: AnyObject | null | undefined, slot: number): string {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (isFainted(oppActive)) return '';
		return toID(oppActive.species?.name ?? '');
	} catch {
		return '';
	}
}

function getOpponentAbility(room: AnyObject | null | undefined, slot: number): string {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (isFainted(oppActive)) return '';
		return toID(oppActive.ability ?? oppActive.baseAbility ?? '');
	} catch {
		return '';
	}
}

function getOpponentMoveTypes(room: AnyObject | null | undefined, slot: number): string[] {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (!oppActive) return [];
		const species = Dex.species.get(oppActive.species?.name ?? '');
		return species.exists ? species.types : [];
	} catch {
		return [];
	}
}

function getMatchupContext(room: AnyObject | null | undefined, slot: number, pokemon: BattleRequestPokemon, gen: number, turn: number): MatchupContext {
	const userSpecies = toID(pokemon?.details?.split(',')[0] ?? '');
	const targetSpecies = getOpponentSpecies(room, slot);

	const ctx: MatchupContext = {
		gen,
		turn,
		userPokemon: pokemon,
		userSpecies,
		userDex: Dex.species.get(userSpecies),
		targetSpecies,
		targetDex: Dex.species.get(targetSpecies),
		targetAbility: getOpponentAbility(room, slot),
		boosts: pokemon?.boosts ?? {},
		oppStatus: '',
		targetCondition: '',
		hazardsSet: new Set(),
		screensSet: new Set(),
		allyFainted: false,
	};

	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (!isFainted(oppActive)) {
			ctx.oppStatus = oppActive.status ?? '';
			ctx.targetCondition = oppActive.condition ?? '';
		}

		const p1SideConditions = (room?.battle)?.p1?.sideConditions ?? {};
		for (const cond of Object.keys(p1SideConditions)) ctx.hazardsSet.add(cond);

		const p2SideConditions = (room?.battle)?.p2?.sideConditions ?? {};
		for (const cond of Object.keys(p2SideConditions)) ctx.screensSet.add(cond);

		ctx.allyFainted = (room?.battle)?.p2?.pokemon?.some((p: BattlePokemonLike) => isFainted(p)) ?? false;
	} catch {}

	return ctx;
}

function getTypeMultiplier(gen: number, atkType: string, defTypes: string[]): number {
	let multiplier = 1;
	for (const defType of defTypes) {
		const val = Dex.mod(`gen${gen}`).data.TypeChart[toID(defType)]?.damageTaken?.[atkType] ?? 0;
		if (val === 3) return 0;
		if (val === 2) multiplier *= 0.5;
		if (val === 1) multiplier *= 2;
	}
	return multiplier;
}

function getWorstIncomingMultiplier(gen: number, atkTypes: string[], defTypes: string[]): number {
	let worst = 1;
	for (const atkType of atkTypes) {
		const eff = getTypeMultiplier(gen, atkType, defTypes);
		if (eff > worst) worst = eff;
	}
	return worst;
}

function getMoveEffectiveness(gen: number, moveData: ReturnType<typeof Dex.moves.get>, targetDex: ReturnType<typeof Dex.species.get>, targetAbility: string): number {
	const moveType = moveData.type;
	const moveId = moveData.id as string;

	if (targetAbility === 'wonderguard') {
		const eff = getTypeMultiplier(gen, moveType, targetDex.types);
		return eff > 1 ? eff : 0;
	}

	if (targetAbility === 'bulletproof' && BULLETPROOF_MOVES.has(moveId)) return 0;
	if (targetAbility === 'soundproof' && SOUNDPROOF_MOVES.has(moveId)) return 0;

	const immuneTypes = ABILITY_IMMUNITIES[targetAbility];
	if (immuneTypes?.includes(moveType)) return 0;

	return getTypeMultiplier(gen, moveType, targetDex.types);
}

function getStatCategoryModifier(moveData: ReturnType<typeof Dex.moves.get>, pokemon: BattleRequestPokemon): number {
	if (moveData.category === 'Status') return 1;

	const stats = pokemon.stats;
	if (!stats) return 1;

	if (moveData.category === 'Physical') {
		return (stats.atk ?? 0) >= (stats.spa ?? 0) ? 1.1 : 0.85;
	} else {
		return (stats.spa ?? 0) >= (stats.atk ?? 0) ? 1.1 : 0.85;
	}
}

function estimateVariablePower(moveId: string, pokemon?: BattleRequestPokemon): number {
	if ((moveId === 'eruption' || moveId === 'waterspout') && pokemon) {
		const hp = parseHpRatio(pokemon.condition);
		return Math.max(1, Math.floor(150 * hp));
	}

	const estimates: Record<string, number> = {
		gyroball: 60, electroball: 60, heatcrash: 60, heavyslam: 60,
		lowkick: 60, grassknot: 60, waterspout: 100, eruption: 100,
		reversal: 50, flail: 50, magnitude: 70, naturalgift: 70,
		trumpcard: 40, returnn: 102, frustration: 102,
		hiddenpower: 60, weatherball: 50, terrainpulse: 50,
		powertrip: 40, storedpower: 40, punishment: 60,
		knockoff: 65, acrobatics: 55, fling: 50,
	};
	return estimates[moveId] ?? 0;
}

function getDefensiveScore(gen: number, switchInSpecies: string, oppMoveTypes: string[]): number {
	const dex = Dex.species.get(switchInSpecies);
	if (!dex.exists) return 0;
	let score = 0;
	for (const atkType of oppMoveTypes) {
		const eff = getTypeMultiplier(gen, atkType, dex.types);
		if (eff === 0) score += 3;
		else if (eff < 1) score += 1;
		else if (eff > 1) score -= 1.5;
	}
	return score;
}

function scoreStatusMove(moveId: string, ctx: MatchupContext): number {
	const hpRatio = parseHpRatio(ctx.userPokemon?.condition);
	const boosts = ctx.boosts;

	const alreadyStatused = !!ctx.oppStatus;

	if (['thunderwave', 'glare', 'stunspore'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 55;
	}

	if (['spore', 'sleeppowder', 'hypnosis', 'lovelykiss', 'sing', 'darkvoid'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 65;
	}

	if (['willowisp', 'scald'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 50;
	}

	if (['toxic', 'poisongas', 'poisonpowder'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 45;
	}

	if (moveId === 'stealthrock') {
		return ctx.hazardsSet.has('stealthrock') ? -Infinity : 40;
	}
	if (moveId === 'spikes') {
		const count = (ctx.hazardsSet.has('spikes') ? 1 : 0);
		return count >= 3 ? -Infinity : 38;
	}
	if (moveId === 'toxicspikes') {
		return ctx.hazardsSet.has('toxicspikes') ? -Infinity : 35;
	}
	if (moveId === 'stickyweb') {
		return ctx.hazardsSet.has('stickyweb') ? -Infinity : 36;
	}

	if (moveId === 'reflect') return ctx.screensSet.has('reflect') ? -Infinity : 35;
	if (moveId === 'lightscreen') return ctx.screensSet.has('lightscreen') ? -Infinity : 35;
	if (moveId === 'auroraveil') return ctx.screensSet.has('auroraveil') ? -Infinity : 38;

	const setupMoves: Record<string, number> = {
		swordsdance: 75, nastyplot: 75, calmmind: 70, dragondance: 80,
		quiverdance: 80, shellsmash: 85, growth: 60, bulkup: 65,
		coilingcurrent: 70, tidyup: 65, victorydance: 80,
		agility: 55, rockpolish: 55,
	};
	if (setupMoves[moveId] !== undefined) {
		const relevantBoost = ['calmmind', 'nastyplot', 'quiverdance', 'growth'].includes(moveId) ?
			(boosts['spa'] ?? 0) :
			(boosts['atk'] ?? 0);

		if (relevantBoost >= 3) return -Infinity;

		const boostPenalty = relevantBoost * 15;
		const baseScore = ctx.turn <= 3 ? setupMoves[moveId] : setupMoves[moveId] * 0.5;
		return Math.max(0, baseScore - boostPenalty);
	}

	if (['recover', 'roost', 'moonlight', 'morningsun', 'synthesis', 'slackoff',
		'milkdrink', 'softboiled', 'shoreup', 'lifedew', 'healorder'].includes(moveId)) {
		if (hpRatio > 0.75) return -5;
		if (hpRatio < 0.35) return 80;
		if (hpRatio < 0.55) return 60;
		return 30;
	}

	if (moveId === 'taunt') return 30;

	return 15;
}

function scoreMove(move: BattleRequestMove, ctx: MatchupContext): number {
	const moveData = Dex.moves.get(move.id);
	if (!moveData.exists) return 0;

	if (moveData.category === 'Status') {
		return scoreStatusMove(move.id, ctx);
	}

	const effectiveness = ctx.targetDex.exists ?
		getMoveEffectiveness(ctx.gen, moveData, ctx.targetDex, ctx.targetAbility) :
		1;

	if (effectiveness === 0) return -Infinity;

	let basePower = moveData.basePower ?? 0;
	if (basePower === 0) {
		basePower = estimateVariablePower(move.id, ctx.userPokemon);
	}
	if (basePower === 0) return 5;

	let score = basePower * effectiveness;

	if (ctx.userDex.exists && ctx.userDex.types.includes(moveData.type)) {
		score *= 1.5;
	}

	score *= getStatCategoryModifier(moveData, ctx.userPokemon);

	const acc = moveData.accuracy;
	if (typeof acc === 'number') {
		score *= acc / 100;
	}

	if (moveData.recoil || moveData.mindBlownRecoil) score *= 0.85;
	if ((moveData as { struggle?: boolean }).struggle) score *= 0.5;

	if (moveData.multihit) score *= 1.25;

	if ((moveData.priority ?? 0) > 0) {
		const hpRatio = parseHpRatio(ctx.userPokemon?.condition);
		const targetHpRatio = parseHpRatio(ctx.targetCondition);

		if (targetHpRatio < 0.25) score *= 1.4;
		else if (hpRatio < 0.35) score *= 1.2;
		else score *= 0.95;
	}

	if (moveData.flags?.charge && !moveData.flags?.recharge) score *= 0.75;

	if (moveData.flags?.recharge) score *= 0.8;

	if (moveData.drain && parseHpRatio(ctx.userPokemon?.condition) < 0.5) score *= 1.15;

	return score;
}

function shouldSwitch(
	request: BattleChoiceRequest,
	activeIdx: number,
	room: AnyObject | null | undefined,
	alreadyChosen: number[],
	ctx: MatchupContext
): number {
	const pokemon = request.side?.pokemon ?? [];
	const currentPokemon = pokemon[activeIdx];
	if (!currentPokemon) return 0;

	const active = request.active?.[activeIdx];

	if (active?.trapped || active?.maybeTrapped || active?.partiallyTrapped) return 0;

	const hpRatio = parseHpRatio(currentPokemon.condition);

	const moves: BattleRequestMove[] = active?.moves ?? [];
	const usableMoves = moves.filter((m: BattleRequestMove) => !m.disabled && (m.pp ?? 1) > 0);

	let bestMoveScore = 0;
	for (const m of usableMoves) {
		const moveData = Dex.moves.get(m.id);
		if (!moveData.exists || moveData.category === 'Status') continue;
		const eff = ctx.targetDex.exists ? getMoveEffectiveness(ctx.gen, moveData, ctx.targetDex, ctx.targetAbility) : 1;
		if (eff > bestMoveScore) bestMoveScore = eff;
	}

	const isWalled = bestMoveScore === 0;

	let worstIncomingEff = 1;
	if (ctx.targetDex.exists && ctx.userDex.exists) {
		worstIncomingEff = getWorstIncomingMultiplier(ctx.gen, ctx.targetDex.types, ctx.userDex.types);
	}

	const inBadMatchup = worstIncomingEff >= 2;
	const isLowHp = hpRatio < 0.25;
	const isCriticallyLow = hpRatio < 0.15;

	if (!isWalled && !inBadMatchup && !isLowHp) return 0;
	if (hpRatio > 0.65 && !isWalled) return 0;

	const numActive = request.active?.length ?? 0;
	const oppMoveTypes = getOpponentMoveTypes(room, activeIdx);

	const bench = pokemon
		.map((p: BattleRequestPokemon, idx: number) => ({ p, idx: idx + 1 }))
		.filter(({ p, idx }: { p: BattleRequestPokemon, idx: number }) =>
			idx > numActive &&
			!isFainted(p) &&
			!alreadyChosen.includes(idx)
		);

	if (!bench.length) return 0;

	const scored = bench.map(({ p, idx }: { p: BattleRequestPokemon, idx: number }) => {
		const benchSpecies = toID(p.details?.split(',')[0] ?? '');
		const benchDex = Dex.species.get(benchSpecies);
		let score = 0;

		score += getDefensiveScore(ctx.gen, benchSpecies, oppMoveTypes) * 1.5;

		if (benchDex.exists && ctx.targetDex.exists) {
			for (const atkType of benchDex.types) {
				const eff = getTypeMultiplier(ctx.gen, atkType, ctx.targetDex.types);
				if (eff > 1) score += eff * 2;
			}
		}

		score += parseHpRatio(p.condition) * 8;

		if (ctx.targetDex.exists && benchDex.exists) {
			for (const atkType of ctx.targetDex.types) {
				const eff = getTypeMultiplier(ctx.gen, atkType, benchDex.types);
				if (eff >= 2) score -= 3;
				if (eff === 0) score += 2;
			}
		}

		const benchHp = parseHpRatio(p.condition);
		if (benchHp < 0.3) score -= 4;

		return { idx, score };
	}).sort((a: ScoredSwitch, b: ScoredSwitch) => b.score - a.score);

	const best = scored[0];

	if (isCriticallyLow && bench.length) return scored[0]?.idx ?? 0;
	if (best && best.score > 3) return best.idx;

	return 0;
}

function makeAIChoice(requestJson: string, roomid: string, turn: number, gen: number, config: ModeConfig): string {
	let request: BattleChoiceRequest;
	try {
		request = JSON.parse(requestJson.startsWith('|request|') ? requestJson.slice(9) : requestJson);
	} catch {
		return 'move 1';
	}

	if (!request || request.wait) return 'pass';

	if (request.teamPreview) {
		const count = request.side?.pokemon?.length ?? 1;
		const order = Array.from({ length: count }, (_, i) => i + 1);
		return `team ${order.join('')}`;
	}

	if (request.forceSwitch) {
		const choices: string[] = [];
		const pokemon = request.side?.pokemon ?? [];
		const chosen: number[] = [];
		const numActive = (request.forceSwitch).length;

		for (const forceSwitchEntry of (request.forceSwitch)) {
			if (!forceSwitchEntry) {
				choices.push('pass');
				continue;
			}

			const available = pokemon
				.map((p: BattleRequestPokemon, idx: number) => ({ p, idx: idx + 1 }))
				.filter(({ p, idx }: { p: BattleRequestPokemon, idx: number }) =>
					idx > numActive &&
					!isFainted(p) &&
					!chosen.includes(idx)
				)
				.sort((a: { p: BattleRequestPokemon, idx: number }, b: { p: BattleRequestPokemon, idx: number }) => {
					const aHp = parseHpRatio(a.p.condition);
					const bHp = parseHpRatio(b.p.condition);
					return bHp - aHp;
				});

			if (available.length) {
				const pick = available[0];
				chosen.push(pick.idx);
				choices.push(`switch ${pick.idx}`);
			} else {
				choices.push('pass');
			}
		}
		return choices.join(', ');
	}

	if (request.active) {
		const choicesList: string[] = [];
		const chosenSwitchTargets: number[] = [];

		const room = Rooms.get(roomid as RoomID);
		const match = activeMatches.get(roomid as RoomID);
		const currentFloor = match?.floor ?? 1;
		const numActive = request.active.length;

		const oppActiveSlots: number[] = [];
		const p1Active = ((room?.battle)?.p1?.active ?? []) as BattlePokemonLike[];
		for (let j = 0; j < p1Active.length; j++) {
			if (!isFainted(p1Active[j])) {
				oppActiveSlots.push(j);
			}
		}
		if (!oppActiveSlots.length) oppActiveSlots.push(0);

		for (let i = 0; i < numActive; i++) {
			const active = request.active[i];
			const pokemon = request.side?.pokemon?.[i];

			if (!active || !pokemon || isFainted(pokemon) || pokemon.commanding) {
				choicesList.push('pass');
				continue;
			}

			const primaryTargetSlot = oppActiveSlots[0] || 0;
			const defaultCtx = getMatchupContext(room, primaryTargetSlot, pokemon, gen, turn);

			const switchIdx = shouldSwitch(request, i, room, chosenSwitchTargets, defaultCtx);
			if (switchIdx > 0) {
				chosenSwitchTargets.push(switchIdx);
				choicesList.push(`switch ${switchIdx}`);
				continue;
			}

			const moves: BattleRequestMove[] = active?.moves ?? [];
			const usableMoves = moves.filter((m: BattleRequestMove) => !m.disabled && (m.pp ?? 1) > 0);

			if (!usableMoves.length) {
				choicesList.push(numActive > 1 ? `move 1 ${oppActiveSlots[0] + 1}` : 'move 1');
				continue;
			}

			const scored: ScoredMove[] = [];

			for (const m of usableMoves) {
				const moveData = Dex.moves.get(m.id);
				const originalIdx = moves.indexOf(m) + 1;

				const needsTarget = !['all', 'allAdjacent', 'allAdjacentFoes', 'allySide', 'allyTeam', 'foeSide', 'randomNormal', 'scripted', 'self'].includes(moveData.target || 'normal');
				const targetsAlly = ['adjacentAlly', 'adjacentAllyOrSelf'].includes(moveData.target || '');

				let ppMod = 1;
				const pp = m.pp ?? 99;
				if (pp > 1) {
					const lastUsed = getLastUsedTurn(roomid, i, m.id);
					const turnsSince = turn - lastUsed;
					if (turnsSince === 1) ppMod = 0.72;
					else if (turnsSince === 2) ppMod = 0.88;
					else if (turnsSince === 3) ppMod = 0.95;
				}

				if (needsTarget && numActive > 1) {
					if (targetsAlly) {
						const allySlot = i === 0 ? 1 : 0;
						const allyPokemon = request.side?.pokemon?.[allySlot];
						let score = 5 * ppMod;
						if (isFainted(allyPokemon)) score = -Infinity;
						scored.push({ m, originalIdx, score, target: -(allySlot + 1) });
					} else {
						for (const targetSlot of oppActiveSlots) {
							const targetCtx = getMatchupContext(room, targetSlot, pokemon, gen, turn);
							let score = scoreMove(m, targetCtx);
							score *= ppMod;
							scored.push({ m, originalIdx, score, target: targetSlot + 1 });
						}
					}
				} else {
					let score = scoreMove(m, defaultCtx);
					score *= ppMod;
					scored.push({ m, originalIdx, score, target: null });
				}
			}

			scored.sort((a: ScoredMove, b: ScoredMove) => b.score - a.score);

			let pickIdx = 0;
			if (scored.length > 1 && scored[0].score > 0) {
				const ratio = scored[1].score / scored[0].score;
				if (ratio >= 0.85 && Math.random() < 0.1) pickIdx = 1;
			}

			const pick = scored[pickIdx];
			let chosen: string;

			if (!pick || pick.score === -Infinity || pick.score <= 0) {
				const fallback = scored.find((s: ScoredMove) => s.score > -Infinity && s.score > 0);
				if (fallback) {
					chosen = `move ${fallback.originalIdx}${fallback.target ? ` ${fallback.target}` : ''}`;
					recordMoveUsed(roomid, i, fallback.m.id, turn);
				} else {
					chosen = numActive > 1 ? `move 1 ${oppActiveSlots[0] + 1}` : 'move 1';
				}
			} else {
				chosen = `move ${pick.originalIdx}${pick.target ? ` ${pick.target}` : ''}`;
				recordMoveUsed(roomid, i, pick.m.id, turn);
			}

			if (active.canMegaEvo && config.mechanicUnlocks?.mega && currentFloor >= config.mechanicUnlocks.mega) {
				chosen += ' mega';
			} else if (active.canTerastallize && config.mechanicUnlocks?.terastallize && currentFloor >= config.mechanicUnlocks.terastallize) {
				const teraType = active.teraType;
				let teraDefensiveOk = true;
				if (teraType && defaultCtx.targetDex.exists) {
					const worstTeraIncoming = getWorstIncomingMultiplier(gen, defaultCtx.targetDex.types, [teraType]);
					if (worstTeraIncoming >= 2) teraDefensiveOk = false;
				}

				const chosenMoveId = pick?.m?.id ?? '';
				const chosenMoveData = Dex.moves.get(chosenMoveId);
				const teraOffensiveBoost = teraType && chosenMoveData.exists && chosenMoveData.type === teraType;

				let worstIncoming = 1;
				if (defaultCtx.targetDex.exists && defaultCtx.userDex.exists) {
					worstIncoming = getWorstIncomingMultiplier(gen, defaultCtx.targetDex.types, defaultCtx.userDex.types);
				}
				const hpRatio = parseHpRatio(pokemon.condition);

				if (
					teraDefensiveOk &&
					(worstIncoming >= 2 || currentFloor > 40 || teraOffensiveBoost) &&
					hpRatio > 0.3 &&
					Math.random() < 0.7
				) {
					chosen += ' terastallize';
				}
			}

			choicesList.push(chosen);
		}

		return choicesList.join(', ') || 'move 1';
	}

	return 'move 1';
}

export function destroyBotUser(botUser: User): void {
	botBattleHandlers.delete(botUser.id);
	for (const c of botUser.connections.slice()) {
		c.onDisconnect();
	}
	if (Users.get(botUser.id) === botUser) {
		Users.delete(botUser);
	}
}

function createBotUser(playerId: string): User {
	const uid = ++botCounter;
	const connId = `pokerogue-bot-${uid}`;
	const botInternalName = `pokeroguebot${uid}`;

	let staleRoomId: RoomID | undefined;
	for (const [roomId, match] of activeMatches) {
		if (match.userId === toID(playerId)) {
			staleRoomId = roomId;
			break;
		}
	}
	if (staleRoomId !== undefined) {
		const room = Rooms.get(staleRoomId);
		const battleEnded = !room?.battle || room.battle.ended;
		if (battleEnded) {
			const staleMatch = activeMatches.get(staleRoomId);
			if (staleMatch) {
				const staleBot = Users.get(staleMatch.botUserId);
				if (staleBot) destroyBotUser(staleBot);
			}
			activeMatches.delete(staleRoomId);
		}
	}

	const conn = new Users.Connection(
		connId,
		noopWorker,
		String(uid),
		null,
		'127.0.0.1',
		null
	);

	const botUser = new Users.User(conn);
	conn.user = botUser;

	botUser.forceRename(botInternalName, true);
	const mutableBotUser = botUser as User & { name: string, named: boolean, sendTo: (roomid: RoomID | BasicRoom | null, data: string) => void };
	mutableBotUser.name = TRAINER_NAME;
	mutableBotUser.named = false;

	mutableBotUser.sendTo = function (roomid: RoomID | BasicRoom | null, data: string) {
		if (typeof data === 'string') {
			const lines = data.split('\n');
			const roomidStr = typeof roomid === 'string' ? roomid : roomid?.roomid ?? '';

			for (const line of lines) {
				if (line.startsWith('|request|')) {
					setTimeout(() => {
						const handler = botBattleHandlers.get(botUser.id);
						if (handler) handler(roomidStr, line);
					}, 150);
					break;
				} else if (line.startsWith('|error|[Invalid choice]')) {
					setTimeout(() => {
						void Rooms.get(roomidStr)?.battle?.stream.write(`>p2 default`);
					}, 50);
				}
			}
		}
	};

	return botUser;
}

function buildBotTeam(state: PokeRogueState): { packedTeam: string, isTrainer: boolean, trainerName?: string, team: AIPokemonSet[] } {
	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

	const floor = state.floor;

	const isBossFloor = floor % config.bossInterval === 0;

	let size = 1;
	if (!isBossFloor) {
		const hasLure = (state.lureCharges ?? 0) > 0;
		const doubleChance = hasLure ? 0.85 : 0.15;
		if (Math.random() < doubleChance) size = 2;
	}

	const luck = state.luck ?? 0;
	const trainerKey = state.pendingTrainerKey;

	const shinyCharms = state.keyItems?.['Shiny Charm'] || 0;
	const abilityCharms = state.keyItems?.['Ability Charm'] || 0;

	const result = genAIPokemon(
		size,
		floor,
		luck,
		state.pendingTrainer,
		trainerKey,
		state.currentBiome || config.startingBiome,
		config,
		data,
		shinyCharms,
		abilityCharms,
		state
	);

	return {
		packedTeam: packAITeam(result.team),
		isTrainer: result.isTrainer,
		trainerName: result.trainerName,
		team: result.team,
	};
}

export function startBattle(user: User, state: PokeRogueState): boolean {
	const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);

	if (!livingTeam.length) {
		user.popup('All your Pokémon have fainted! Use a Revive from the shop before battling.');
		return false;
	}

	const playerTeam = packTeam(livingTeam);

	const botTeamData = buildBotTeam(state);
	const botTeam = botTeamData.packedTeam;
	const isTrainer = botTeamData.isTrainer;
	const trainerName = botTeamData.trainerName;

	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const isBoss = state.floor % config.bossInterval === 0;

	const isDoubles = !isTrainer && !isBoss && botTeamData.team.length > 1 && livingTeam.length > 1;

	if (state.pendingTrainer) {
		delete state.pendingTrainer;
	}
	if (state.pendingTrainerKey) {
		delete state.pendingTrainerKey;
	}

	const botUser = createBotUser(user.id);

	let opponentTitle = isTrainer && trainerName ? trainerName : (isTrainer ? TRAINER_NAME : 'Wild Encounter');
	if (isBoss && !isTrainer) opponentTitle = `BOSS ${opponentTitle}`;

	if (isTrainer && trainerName) {
		botUser.name = trainerName;
	} else if (!isTrainer) {
		const wildNames = botTeamData.team.map(m => Dex.species.get(toID(m.species)).name).filter(Boolean);
		if (wildNames.length) botUser.name = `Wild ${wildNames.join(' & ')}`;
	}

	const botSlot = 'p2' as const;
	const format = (isDoubles && config.doublesFormat) ? config.doublesFormat : config.baseFormat;

	let battleRoom: AnyObject | null = null;
	try {
		battleRoom = Rooms.createBattle({
			format,
			players: [
				{ user, team: playerTeam },
				{ user: botUser, team: botTeam },
			],
			rated: false,
			title: `PokéRogue Battle - Floor ${state.floor}: ${user.name} vs ${opponentTitle}`,
		});
	} catch (e) {
		destroyBotUser(botUser);
		user.popup('Failed to start the PokéRogue battle. Please try again.');
		Monitor.crashlog(e as Error, 'PokéRogue battle creation');
		return false;
	}

	if (!battleRoom) {
		destroyBotUser(botUser);
		return false;
	}

	botBattleHandlers.set(botUser.id, (roomid, requestLine) => {
		void (async () => {
			const room = Rooms.get(roomid as RoomID);
			if (!room?.battle) return;

			const match = activeMatches.get(roomid as RoomID);
			let gen = 9;
			let activeConfig: ModeConfig = MODE_CONFIGS['classic'];
			if (match) {
				await loadUser(match.userId);
				const activeState = getState(match.userId);
				if (activeState) {
					activeConfig = MODE_CONFIGS[activeState.gameMode] || MODE_CONFIGS['classic'];
					gen = activeConfig.generation || 9;
					if (activeState.floor % activeConfig.bossInterval !== 0 && !match.isTrainerBattle) {
						const turn = room.battle.turn || 0;

						if (turn > 0 && match.lastPanelTurn !== turn) {
							const inv = activeState.inventory || {};
							const pb = inv['pokeball'] || 0;
							const gb = inv['greatball'] || 0;
							const ub = inv['ultraball'] || 0;
							const mb = inv['masterball'] || 0;

							const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
								`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
								`<button name="send" value="/pokerogue catch pokeball" class="button" ${pb ? '' : 'disabled'}>Poké Ball (${pb})</button> ` +
								`<button name="send" value="/pokerogue catch greatball" class="button" ${gb ? '' : 'disabled'}>Great Ball (${gb})</button> ` +
								`<button name="send" value="/pokerogue catch ultraball" class="button" ${ub ? '' : 'disabled'}>Ultra Ball (${ub})</button> ` +
								`<button name="send" value="/pokerogue catch masterball" class="button" ${mb ? '' : 'disabled'}>Master Ball (${mb})</button>` +
								`</div>`;

							const playerUser = Users.get(match.userId);
							if (playerUser) {
								if (match.lastPanelTurn) {
									playerUser.sendTo(room, `|uhtmlchange|catchpanel-${match.lastPanelTurn}|`);
								}
								playerUser.sendTo(room, `|uhtml|catchpanel-${turn}|${catchHTML}`);
							}
							match.lastPanelTurn = turn;
						}
					}
				}
			}

			const turn = room.battle.turn || 0;
			const choice = makeAIChoice(requestLine, roomid, turn, gen, activeConfig);
			void room.battle.stream.write(`>${botSlot} ${choice}`);
		})();
	});

	state.battleRoomId = battleRoom.roomid;
	setState(user.id, state);

	activeMatches.set(battleRoom.roomid, {
		userId: user.id,
		botUserId: botUser.id,
		floor: state.floor,
		isTrainerBattle: isTrainer,
		botTeam: botTeamData.team,
		isDoubles,
	});

	clearMoveHistory(battleRoom.roomid);

	return true;
}
