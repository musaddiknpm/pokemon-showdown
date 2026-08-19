import { Utils } from '../../lib';

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

function isFainted(pokemon: BattlePokemonLike | BattleRequestPokemon | null | undefined): boolean {
	return !pokemon || !!pokemon.fainted || (pokemon.hp !== undefined && pokemon.hp <= 0) || !!pokemon.condition?.endsWith(' fnt');
}

function parseHpRatio(condition: string | undefined): number {
	if (!condition || condition.endsWith(' fnt')) return 0;
	const match = /^(\d+)\/(\d+)/.exec(condition);
	if (!match) return 1;
	return parseInt(match[1]) / parseInt(match[2]);
}

export class UtilityAI {
	roomid: string;
	gen: number;
	options: AnyObject;
	room: AnyObject | null;
	turn = 0;
		recentMoveHistory: Map<number, Map<string, number>>;

	constructor(roomid: string, gen: number, options: AnyObject = {}) {
		this.roomid = roomid;
		this.gen = gen;
		this.options = options;
		this.room = Rooms.get(roomid as RoomID) || null;
		this.recentMoveHistory = new Map();
	}

	receiveRequest(requestJson: string, turn: number, options?: AnyObject): string {
		this.turn = turn;
		
		this.room = Rooms.get(this.roomid as RoomID) || null;

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
		if (request.forceSwitch) return this.handleForceSwitch(request);
		if (request.active) return this.processActiveChoices(request);
		return 'move 1';
	}

	private recordMoveUsed(slot: number, moveId: string): void {
		if (!this.recentMoveHistory.has(slot)) this.recentMoveHistory.set(slot, new Map());
		this.recentMoveHistory.get(slot)!.set(moveId, this.turn);
	}

	private getLastUsedTurn(slot: number, moveId: string): number {
		return this.recentMoveHistory.get(slot)?.get(moveId) ?? -99;
	}

	private getOpponentSpecies(slot: number): string {
		const oppActive = this.room?.battle?.p1?.active?.[slot];
		if (isFainted(oppActive)) return '';
		return toID(oppActive.species?.name ?? '');
	}

	private getOpponentAbility(slot: number): string {
		const oppActive = this.room?.battle?.p1?.active?.[slot];
		if (isFainted(oppActive)) return '';
		return toID(oppActive.ability ?? oppActive.baseAbility ?? '');
	}

	private getOpponentMoveTypes(slot: number): string[] {
		const oppActive = this.room?.battle?.p1?.active?.[slot];
		if (!oppActive) return [];
		const species = Dex.species.get(oppActive.species?.name ?? '');
		return species.exists ? species.types : [];
	}

	private getMatchupContext(slot: number, pokemon: BattleRequestPokemon): MatchupContext {
		const userSpecies = toID(pokemon?.details?.split(',')[0] ?? '');
		const targetSpecies = this.getOpponentSpecies(slot);

		const ctx: MatchupContext = {
			gen: this.gen,
			turn: this.turn,
			userPokemon: pokemon,
			userSpecies,
			userDex: Dex.species.get(userSpecies),
			targetSpecies,
			targetDex: Dex.species.get(targetSpecies),
			targetAbility: this.getOpponentAbility(slot),
			boosts: pokemon?.boosts ?? {},
			oppStatus: '',
			targetCondition: '',
			hazardsSet: new Set(),
			screensSet: new Set(),
			allyFainted: false,
		};

		try {
			const oppActive = (this.room?.battle)?.p1?.active?.[slot];
			if (!isFainted(oppActive)) {
				ctx.oppStatus = oppActive.status ?? '';
				ctx.targetCondition = oppActive.condition ?? '';
			}

			const p1SideConditions = (this.room?.battle)?.p1?.sideConditions ?? {};
			for (const cond of Object.keys(p1SideConditions)) ctx.hazardsSet.add(cond);

			const p2SideConditions = (this.room?.battle)?.p2?.sideConditions ?? {};
			for (const cond of Object.keys(p2SideConditions)) ctx.screensSet.add(cond);

			ctx.allyFainted = (this.room?.battle)?.p2?.pokemon?.some((p: BattlePokemonLike) => isFainted(p)) ?? false;
		} catch {}

		return ctx;
	}

	private getTypeMultiplier(atkType: string, defTypes: string[]): number {
		let multiplier = 1;
		for (const defType of defTypes) {
			if (!Dex.mod(`gen${this.gen}`).getImmunity(atkType, defType)) return 0;
			multiplier *= (2 ** Dex.mod(`gen${this.gen}`).getEffectiveness(atkType, defType));
		}
		return multiplier;
	}

	private getWorstIncomingMultiplier(atkTypes: string[], defTypes: string[]): number {
		let worst = 1;
		for (const atkType of atkTypes) {
			const eff = this.getTypeMultiplier(atkType, defTypes);
			if (eff > worst) worst = eff;
		}
		return worst;
	}

	private getMoveEffectiveness(moveData: ReturnType<typeof Dex.moves.get>, targetDex: ReturnType<typeof Dex.species.get>, targetAbility: string): number {
		const moveType = moveData.type;
		const moveId = moveData.id as string;

		if (targetAbility === 'wonderguard') {
			const eff = this.getTypeMultiplier(moveType, targetDex.types);
			return eff > 1 ? eff : 0;
		}

		if (targetAbility === 'bulletproof' && BULLETPROOF_MOVES.has(moveId)) return 0;
		if (targetAbility === 'soundproof' && SOUNDPROOF_MOVES.has(moveId)) return 0;

		const immuneTypes = ABILITY_IMMUNITIES[targetAbility];
		if (immuneTypes?.includes(moveType)) return 0;

		return this.getTypeMultiplier(moveType, targetDex.types);
	}

	private getStatCategoryModifier(moveData: ReturnType<typeof Dex.moves.get>, pokemon: BattleRequestPokemon): number {
		if (moveData.category === 'Status') return 1;

		const stats = pokemon.stats;
		if (!stats) return 1;

		if (moveData.category === 'Physical') {
			return (stats.atk ?? 0) >= (stats.spa ?? 0) ? 1.1 : 0.85;
		} else {
			return (stats.spa ?? 0) >= (stats.atk ?? 0) ? 1.1 : 0.85;
		}
	}

	private estimateVariablePower(moveId: string, pokemon?: BattleRequestPokemon): number {
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

	private getDefensiveScore(switchInSpecies: string, oppMoveTypes: string[]): number {
		const dex = Dex.species.get(switchInSpecies);
		if (!dex.exists) return 0;
		let score = 0;
		for (const atkType of oppMoveTypes) {
			const eff = this.getTypeMultiplier(atkType, dex.types);
			if (eff === 0) score += 3;
			else if (eff < 1) score += 1;
			else if (eff > 1) score -= 1.5;
		}
		return score;
	}

	private scoreSetupMove(moveId: string, boosts: Record<string, number>): number {
		const setupMoves: Record<string, number> = {
			swordsdance: 75, nastyplot: 75, calmmind: 70, dragondance: 80,
			quiverdance: 80, shellsmash: 85, growth: 60, bulkup: 65,
			coilingcurrent: 70, tidyup: 65, victorydance: 80,
			agility: 55, rockpolish: 55,
		};
		if (setupMoves[moveId] === undefined) return -1;

		const relevantBoost = ['calmmind', 'nastyplot', 'quiverdance', 'growth'].includes(moveId) ?
			(boosts['spa'] ?? 0) : (boosts['atk'] ?? 0);

		if (relevantBoost >= 3) return -Infinity;

		const boostPenalty = relevantBoost * 15;
		const baseScore = this.turn <= 3 ? setupMoves[moveId] : setupMoves[moveId] * 0.5;
		return Math.max(0, baseScore - boostPenalty);
	}

	private scoreStatusMove(moveId: string, ctx: MatchupContext): number {
		const hpRatio = parseHpRatio(ctx.userPokemon?.condition);
		const alreadyStatused = !!ctx.oppStatus;

		if (['thunderwave', 'glare', 'stunspore'].includes(moveId)) return alreadyStatused ? -Infinity : 55;
		if (['spore', 'sleeppowder', 'hypnosis', 'lovelykiss', 'sing', 'darkvoid'].includes(moveId)) return alreadyStatused ? -Infinity : 65;
		if (['willowisp', 'scald'].includes(moveId)) return alreadyStatused ? -Infinity : 50;
		if (['toxic', 'poisongas', 'poisonpowder'].includes(moveId)) return alreadyStatused ? -Infinity : 45;

		if (moveId === 'stealthrock') return ctx.hazardsSet.has('stealthrock') ? -Infinity : 40;
		if (moveId === 'spikes') return (ctx.hazardsSet.has('spikes') ? 1 : 0) >= 3 ? -Infinity : 38;
		if (moveId === 'toxicspikes') return ctx.hazardsSet.has('toxicspikes') ? -Infinity : 35;
		if (moveId === 'stickyweb') return ctx.hazardsSet.has('stickyweb') ? -Infinity : 36;
		if (moveId === 'reflect') return ctx.screensSet.has('reflect') ? -Infinity : 35;
		if (moveId === 'lightscreen') return ctx.screensSet.has('lightscreen') ? -Infinity : 35;
		if (moveId === 'auroraveil') return ctx.screensSet.has('auroraveil') ? -Infinity : 38;

		const setupScore = this.scoreSetupMove(moveId, ctx.boosts);
		if (setupScore !== -1) return setupScore;

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

	private scoreMove(move: BattleRequestMove, ctx: MatchupContext): number {
		const moveData = Dex.moves.get(move.id);
		if (!moveData.exists) return 0;

		if (moveData.category === 'Status') {
			return this.scoreStatusMove(move.id, ctx);
		}

		const effectiveness = ctx.targetDex.exists ?
			this.getMoveEffectiveness(moveData, ctx.targetDex, ctx.targetAbility) :
			1;

		if (effectiveness === 0) return -Infinity;

		let basePower = moveData.basePower ?? 0;
		if (basePower === 0) {
			basePower = this.estimateVariablePower(move.id, ctx.userPokemon);
		}
		if (basePower === 0) return 5;

		let score = basePower * effectiveness;

		if (ctx.userDex.exists && ctx.userDex.types.includes(moveData.type)) {
			score *= 1.5;
		}

		score *= this.getStatCategoryModifier(moveData, ctx.userPokemon);

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

	private scoreBenchSwitch(p: BattleRequestPokemon, idx: number, ctx: MatchupContext, oppMoveTypes: string[]): ScoredSwitch {
		const benchSpecies = toID(p.details?.split(',')[0] ?? '');
		const benchDex = Dex.species.get(benchSpecies);
		let score = this.getDefensiveScore(benchSpecies, oppMoveTypes) * 1.5;

		if (benchDex.exists && ctx.targetDex.exists) {
			for (const atkType of benchDex.types) {
				const eff = this.getTypeMultiplier(atkType, ctx.targetDex.types);
				if (eff > 1) score += eff * 2;
			}
		}
		score += parseHpRatio(p.condition) * 8;

		if (ctx.targetDex.exists && benchDex.exists) {
			for (const atkType of ctx.targetDex.types) {
				const eff = this.getTypeMultiplier(atkType, benchDex.types);
				if (eff >= 2) score -= 3;
				if (eff === 0) score += 2;
			}
		}
		if (parseHpRatio(p.condition) < 0.3) score -= 4;
		return { idx, score };
	}

	private shouldSwitch(request: BattleChoiceRequest, activeIdx: number, alreadyChosen: number[], ctx: MatchupContext): number {
		const pokemon = request.side?.pokemon ?? [];
		const currentPokemon = pokemon[activeIdx];
		const active = request.active?.[activeIdx];
		if (!currentPokemon || active?.trapped || active?.maybeTrapped || active?.partiallyTrapped) return 0;

		const hpRatio = parseHpRatio(currentPokemon.condition);
		const usableMoves = (active?.moves ?? []).filter((m: BattleRequestMove) => !m.disabled && (m.pp ?? 1) > 0);

		let bestMoveScore = 0;
		for (const m of usableMoves) {
			const moveData = Dex.moves.get(m.id);
			if (!moveData.exists || moveData.category === 'Status') continue;
			const eff = ctx.targetDex.exists ? this.getMoveEffectiveness(moveData, ctx.targetDex, ctx.targetAbility) : 1;
			if (eff > bestMoveScore) bestMoveScore = eff;
		}

		const isWalled = bestMoveScore === 0;
		let worstIncomingEff = 1;
		if (ctx.targetDex.exists && ctx.userDex.exists) {
			worstIncomingEff = this.getWorstIncomingMultiplier(ctx.targetDex.types, ctx.userDex.types);
		}

		const isCriticallyLow = hpRatio < 0.15;
		if (!isWalled && worstIncomingEff < 2 && hpRatio >= 0.25) return 0;
		if (hpRatio > 0.65 && !isWalled) return 0;

		const numActive = request.active?.length ?? 0;
		const bench = pokemon.map((p: BattleRequestPokemon, idx: number) => ({ p, idx: idx + 1 }))
			.filter(({ p, idx }: { p: BattleRequestPokemon, idx: number }) => idx > numActive && !isFainted(p) && !alreadyChosen.includes(idx));

		if (!bench.length) return 0;
		const oppMoveTypes = this.getOpponentMoveTypes(activeIdx);
		const scored = bench.map(({ p, idx }: { p: BattleRequestPokemon, idx: number }) => this.scoreBenchSwitch(p, idx, ctx, oppMoveTypes))
			.sort((a: ScoredSwitch, b: ScoredSwitch) => b.score - a.score);

		const best = scored[0];
		if (isCriticallyLow && bench.length) return scored[0]?.idx ?? 0;
		if (best && best.score > 3) return best.idx;
		return 0;
	}

	private handleForceSwitch(request: BattleChoiceRequest): string {
		const choices: string[] = [];
		const pokemon = request.side?.pokemon ?? [];
		const chosen: number[] = [];
		const numActive = (request.forceSwitch ?? []).length;

		for (const forceSwitchEntry of (request.forceSwitch ?? [])) {
			if (!forceSwitchEntry) {
				choices.push('pass'); continue;
			}
			const available = pokemon.map((p: BattleRequestPokemon, idx: number) => ({ p, idx: idx + 1 }))
				.filter(({ p, idx }: { p: BattleRequestPokemon, idx: number }) => idx > numActive && !isFainted(p) && !chosen.includes(idx))
				.sort((a: { p: BattleRequestPokemon, idx: number }, b: { p: BattleRequestPokemon, idx: number }) => parseHpRatio(b.p.condition) - parseHpRatio(a.p.condition));

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

	private processActiveChoices(request: BattleChoiceRequest): string {
		const choicesList: string[] = [];
		const chosenSwitchTargets: number[] = [];
		const numActive = request.active?.length ?? 0;

		const oppActiveSlots: number[] = [];
		const p1Active = ((this.room?.battle)?.p1?.active ?? []) as BattlePokemonLike[];
		for (let j = 0; j < p1Active.length; j++) if (!isFainted(p1Active[j])) oppActiveSlots.push(j);
		if (!oppActiveSlots.length) oppActiveSlots.push(0);

		for (let i = 0; i < numActive; i++) {
			const active = request.active?.[i];
			const pokemon = request.side?.pokemon?.[i];

			if (!active || !pokemon || isFainted(pokemon) || pokemon.commanding) {
				choicesList.push('pass'); continue;
			}

			const primaryTargetSlot = oppActiveSlots[0] || 0;
			const defaultCtx = this.getMatchupContext(primaryTargetSlot, pokemon);
			const switchIdx = this.shouldSwitch(request, i, chosenSwitchTargets, defaultCtx);

			if (switchIdx > 0) {
				chosenSwitchTargets.push(switchIdx); choicesList.push(`switch ${switchIdx}`); continue;
			}

			const usableMoves = (active?.moves ?? []).filter((m: BattleRequestMove) => !m.disabled && (m.pp ?? 1) > 0);
			if (!usableMoves.length) {
				choicesList.push(numActive > 1 ? `move 1 ${oppActiveSlots[0] + 1}` : 'move 1'); continue;
			}

			const scored = this.scoreActiveMoves(active.moves ?? [], usableMoves, i, numActive, request, pokemon, oppActiveSlots, defaultCtx);
			scored.sort((a: ScoredMove, b: ScoredMove) => b.score - a.score);

			let pickIdx = 0;
			if (scored.length > 1 && scored[0].score > 0 && (scored[1].score / scored[0].score) >= 0.85 && Math.random() < 0.1) pickIdx = 1;
			const pick = scored[pickIdx];

			let chosen = this.formatChosenMove(pick, scored, oppActiveSlots, numActive, i);
			chosen += this.evaluateTerastallize(active, defaultCtx, pokemon, pick);
			choicesList.push(chosen);
		}
		return choicesList.join(', ') || 'move 1';
	}

	private scoreActiveMoves(allMoves: BattleRequestMove[], usableMoves: BattleRequestMove[], i: number, numActive: number, request: BattleChoiceRequest, pokemon: BattleRequestPokemon, oppActiveSlots: number[], defaultCtx: MatchupContext): ScoredMove[] {
		const scored: ScoredMove[] = [];
		for (const m of usableMoves) {
			const moveData = Dex.moves.get(m.id);
			const originalIdx = allMoves.indexOf(m) + 1;
			const needsTarget = !['all', 'allAdjacent', 'allAdjacentFoes', 'allySide', 'allyTeam', 'foeSide', 'randomNormal', 'scripted', 'self'].includes(moveData.target || 'normal');
			const targetsAlly = ['adjacentAlly', 'adjacentAllyOrSelf'].includes(moveData.target || '');

			let ppMod = 1;
			const pp = m.pp ?? 99;
			if (pp > 1) {
				const turnsSince = this.turn - this.getLastUsedTurn(i, m.id);
				if (turnsSince === 1) ppMod = 0.72; else if (turnsSince === 2) ppMod = 0.88; else if (turnsSince === 3) ppMod = 0.95;
			}

			if (needsTarget && numActive > 1) {
				if (targetsAlly) {
					const allySlot = i === 0 ? 1 : 0;
					const allyPokemon = request.side?.pokemon?.[allySlot];
					const score = isFainted(allyPokemon) ? -Infinity : 5 * ppMod;
					scored.push({ m, originalIdx, score, target: -(allySlot + 1) });
				} else {
					for (const targetSlot of oppActiveSlots) {
						const targetCtx = this.getMatchupContext(targetSlot, pokemon);
						const score = this.scoreMove(m, targetCtx) * ppMod;
						scored.push({ m, originalIdx, score, target: targetSlot + 1 });
					}
				}
			} else {
				const score = this.scoreMove(m, defaultCtx) * ppMod;
				scored.push({ m, originalIdx, score, target: null });
			}
		}
		return scored;
	}

	private formatChosenMove(pick: ScoredMove, scored: ScoredMove[], oppActiveSlots: number[], numActive: number, i: number): string {
		if (!pick || pick.score === -Infinity || pick.score <= 0) {
			const fallback = scored.find((s: ScoredMove) => s.score > -Infinity && s.score > 0);
			if (fallback) {
				this.recordMoveUsed(i, fallback.m.id);
				return `move ${fallback.originalIdx}${fallback.target ? ` ${fallback.target}` : ''}`;
			} else {
				return numActive > 1 ? `move 1 ${oppActiveSlots[0] + 1}` : 'move 1';
			}
		} else {
			this.recordMoveUsed(i, pick.m.id);
			return `move ${pick.originalIdx}${pick.target ? ` ${pick.target}` : ''}`;
		}
	}

	private evaluateTerastallize(active: BattleRequestActive, defaultCtx: MatchupContext, pokemon: BattleRequestPokemon, pick: ScoredMove): string {
		if (active.canMegaEvo) return ' mega';
		if (active.canTerastallize) {
			const teraType = active.teraType;
			let teraDefensiveOk = true;
			if (teraType && defaultCtx.targetDex.exists) {
				const worstTeraIncoming = this.getWorstIncomingMultiplier(defaultCtx.targetDex.types, [teraType]);
				if (worstTeraIncoming >= 2) teraDefensiveOk = false;
			}

			const chosenMoveData = Dex.moves.get(pick?.m?.id ?? '');
			const teraOffensiveBoost = teraType && chosenMoveData.exists && chosenMoveData.type === teraType;
			let worstIncoming = 1;
			if (defaultCtx.targetDex.exists && defaultCtx.userDex.exists) {
				worstIncoming = this.getWorstIncomingMultiplier(defaultCtx.targetDex.types, defaultCtx.userDex.types);
			}

			if (teraDefensiveOk && (worstIncoming >= 2 || (this.options?.aggression || 0) > 40 || teraOffensiveBoost) && parseHpRatio(pokemon.condition) > 0.3 && Math.random() < 0.7) {
				return ' terastallize';
			}
		}
		return '';
	}
}

export const aiInstances: Map<string, UtilityAI> = (global as any).UtilityAIInstances || new Map<string, UtilityAI>();
(global as any).UtilityAIInstances = aiInstances;

export function getUtilityAI(roomid: string, gen: number, options: AnyObject = {}): UtilityAI {
	if (!aiInstances.has(roomid)) {
		aiInstances.set(roomid, new UtilityAI(roomid, gen, options));
	}
	const ai = aiInstances.get(roomid)!;
	ai.gen = gen;
	ai.options = options;
	return ai;
}

export function clearUtilityAI(roomid: string) {
	aiInstances.delete(roomid);
}
