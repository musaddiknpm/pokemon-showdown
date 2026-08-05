import { ObjectReadWriteStream } from '../../../lib/streams';
import { StreamWorker } from '../../../lib/process-manager';
import { type ModeConfig, type PokeRogueState, type PokemonEntry } from './types';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { genAIPokemon, packAITeam, packTeam, type AIPokemonSet, botLevel } from './pokemon';
import { getPokeRogueAI, clearPokeRogueAI } from './ai';
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

interface ParseState {
	p1TeamHp: Record<number, number>;
	p1TeamStatus: Record<number, string>;
	p1FaintedIndices: Set<number>;
	p2Active: Map<string, ParsedPokemonState>;
	consumedItems: { teamIdx: number, itemId: string }[];
	p1SlotToTeamIdx: Record<string, number>;
	p1ActivelyAssigned: Set<number>;
	itemSlotMap: Record<string, number>;
	itemAssigned: Set<number>;
	p1SlotState: Map<string, boolean>;
	playerTeam: PokemonEntry[];
}

function handleSwitchEvent(match: RegExpExecArray, state: ParseState) {
	const slot = match[1];
	const species = toID(match[2].trim());
	const level = match[3] ? parseInt(match[3]) : 0;
	const hp = parseInt(match[4]);
	const maxHp = match[5] ? parseInt(match[5]) : 100;
	const status = match[6] || '';

	if (slot.startsWith('p1')) {
		state.p1SlotState.set(slot, false);
		const prev = state.p1SlotToTeamIdx[slot];
		if (prev !== undefined) state.p1ActivelyAssigned.delete(prev);

		let matched = -1;
		for (let i = 0; i < state.playerTeam.length; i++) {
			if (!state.p1ActivelyAssigned.has(i) && toID(state.playerTeam[i].species) === species && !state.p1FaintedIndices.has(i) && (state.playerTeam[i].currentHp ?? 100) > 0) {
				matched = i; break;
			}
		}
		if (matched !== -1) {
			state.p1SlotToTeamIdx[slot] = matched;
			state.p1ActivelyAssigned.add(matched);
			state.p1TeamHp[matched] = hp;
			state.p1TeamStatus[matched] = status;
		}

		const prevItem = state.itemSlotMap[slot];
		if (prevItem !== undefined) state.itemAssigned.delete(prevItem);
		const logBase = toID(Dex.species.get(species).baseSpecies || species);
		for (let i = 0; i < state.playerTeam.length; i++) {
			const teamBase = toID(Dex.species.get(state.playerTeam[i].species).baseSpecies || state.playerTeam[i].species);
			if (!state.itemAssigned.has(i) && teamBase === logBase && !state.p1FaintedIndices.has(i) && (state.playerTeam[i].currentHp ?? 100) > 0) {
				state.itemSlotMap[slot] = i;
				state.itemAssigned.add(i); break;
			}
		}
	} else {
		state.p2Active.set(slot, { species, level, hp, maxHp, status, fainted: hp <= 0 });
	}
}

function handleDamageEvent(match: RegExpExecArray, state: ParseState) {
	const slot = match[1];
	const hp = parseInt(match[2]);
	const maxHp = match[3] ? parseInt(match[3]) : 100;
	const status = match[4] || '';

	if (slot.startsWith('p1')) {
		const idx = state.p1SlotToTeamIdx[slot];
		if (idx !== undefined) {
			state.p1TeamHp[idx] = hp;
			if (status) state.p1TeamStatus[idx] = status;
		}
	} else {
		const s = state.p2Active.get(slot);
		if (s) {
			s.hp = hp;
			if (match[3]) s.maxHp = maxHp;
			if (status) s.status = status;
		}
	}
}

function handleStatusEvent(match: RegExpExecArray, state: ParseState) {
	const slot = match[1];
	const status = match[2];
	if (slot.startsWith('p1')) {
		const idx = state.p1SlotToTeamIdx[slot];
		if (idx !== undefined) state.p1TeamStatus[idx] = status;
	} else {
		const s = state.p2Active.get(slot);
		if (s) s.status = status;
	}
}

function handleCureStatusEvent(match: RegExpExecArray, state: ParseState) {
	const slot = match[1];
	if (slot.startsWith('p1')) {
		const idx = state.p1SlotToTeamIdx[slot];
		if (idx !== undefined) state.p1TeamStatus[idx] = '';
	} else {
		const s = state.p2Active.get(slot);
		if (s) s.status = '';
	}
}

function handleFaintEvent(match: RegExpExecArray, state: ParseState) {
	const slot = match[1];
	if (slot.startsWith('p1')) {
		state.p1SlotState.set(slot, true);
		const idx = state.p1SlotToTeamIdx[slot];
		if (idx !== undefined) {
			state.p1TeamHp[idx] = 0;
			state.p1TeamStatus[idx] = '';
			state.p1FaintedIndices.add(idx);
			state.p1ActivelyAssigned.delete(idx);
			delete state.p1SlotToTeamIdx[slot];
		}
	} else {
		const s = state.p2Active.get(slot);
		if (s) {
			s.fainted = true; s.hp = 0; s.status = '';
		}
	}
}

function handleEndItemEvent(line: string, match: RegExpExecArray, state: ParseState) {
	if (line.includes('[from] move: Knock Off') || line.includes('[from] move: Thief') || line.includes('[from] move: Incinerate')) return;
	const slot = 'p1' + match[1];
	const itemId = toID(match[2].trim());
	const teamIdx = state.itemSlotMap[slot];
	if (teamIdx !== undefined) {
		state.consumedItems.push({ teamIdx, itemId });
	}
}

export function parseBattleState(logLines: string[], playerTeam: PokemonEntry[]): ParsedBattleState {
	const state: ParseState = {
		p1TeamHp: {}, p1TeamStatus: {}, p1FaintedIndices: new Set(),
		p2Active: new Map(), consumedItems: [], p1SlotToTeamIdx: {},
		p1ActivelyAssigned: new Set(), itemSlotMap: {}, itemAssigned: new Set(),
		p1SlotState: new Map(), playerTeam,
	};

	for (const line of logLines) {
		let match = /^\|(?:switch|drag)\|(p[12][a-z]): [^|]+\|([^|,]+)(?:, L(\d+))?[^|]*\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
		if (match) { handleSwitchEvent(match, state); continue; }
		match = /^\|(?:-damage|-heal)\|(p[12][a-z]): [^|]+\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
		if (match) { handleDamageEvent(match, state); continue; }
		match = /^\|-status\|(p[12][a-z]): [^|]+\|(brn|psn|tox|par|slp|frz)/.exec(line);
		if (match) { handleStatusEvent(match, state); continue; }
		match = /^\|-curestatus\|(p[12][a-z]):/.exec(line);
		if (match) { handleCureStatusEvent(match, state); continue; }
		match = /^\|faint\|(p[12][a-z]):/.exec(line);
		if (match) { handleFaintEvent(match, state); continue; }
		match = /^\|-enditem\|p1([a-z]): [^|]+\|([^|]+)/.exec(line);
		if (match) { handleEndItemEvent(line, match, state); continue; }
	}

	let p1ActiveFainted = false;
	if (state.p1SlotState.size > 0) {
		let totalAlive = 0;
		for (let i = 0; i < playerTeam.length; i++) {
			let hp = playerTeam[i].currentHp ?? 100;
			if (state.p1TeamHp[i] !== undefined) hp = state.p1TeamHp[i];
			if (state.p1FaintedIndices.has(i)) hp = 0;
			if (hp > 0) totalAlive++;
		}
		const activeAliveCount = Array.from(state.p1SlotState.values()).filter(f => !f).length;
		const hasFaintedSlot = Array.from(state.p1SlotState.values()).includes(true);
		p1ActiveFainted = activeAliveCount === 0 || (hasFaintedSlot && totalAlive > activeAliveCount);
	}

	return {
		p1TeamHp: state.p1TeamHp, p1TeamStatus: state.p1TeamStatus,
		p1FaintedIndices: state.p1FaintedIndices, p2Active: state.p2Active,
		p1ActiveFainted, consumedItems: state.consumedItems,
	};
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

class NoopStream extends ObjectReadWriteStream<string> {
	override _write(_data: string): void {}
}

const noopWorker = new StreamWorker(new NoopStream());
let botCounter = 0;

const botBattleHandlers: Map<string, (roomid: string, requestLine: string) => void> = (global as any).PokeRogueBotHandlers || new Map<string, (roomid: string, requestLine: string) => void>();
(global as any).PokeRogueBotHandlers = botBattleHandlers;
export const activeMatches: Map<RoomID, ActiveRougeMatch> = (global as any).PokeRogueActiveMatches || new Map<RoomID, ActiveRougeMatch>();
(global as any).PokeRogueActiveMatches = activeMatches;
export function destroyBotUser(botUser: User): void {
	botBattleHandlers.delete(botUser.id);
	for (const c of botUser.connections.slice()) {
		c.onDisconnect();
	}
	if (Users.get(botUser.id) === botUser) {
		Users.delete(botUser);
	}
}

function cleanupStaleBotMatch(playerId: string) {
	let staleRoomId: RoomID | undefined;
	for (const [roomId, match] of activeMatches) {
		if (match.userId === toID(playerId)) {
			staleRoomId = roomId; break;
		}
	}
	if (staleRoomId !== undefined) {
		const room = Rooms.get(staleRoomId);
		if (!room?.battle || room.battle.ended) {
			const staleMatch = activeMatches.get(staleRoomId);
			if (staleMatch) {
				const staleBot = Users.get(staleMatch.botUserId);
				if (staleBot) destroyBotUser(staleBot);
			}
			activeMatches.delete(staleRoomId);
		}
	}
}

function createBotUser(playerId: string): User {
	const uid = ++botCounter;
	const connId = `pokerogue-bot-${uid}`;
	const botInternalName = `pokeroguebot${uid}`;

	cleanupStaleBotMatch(playerId);

	const conn = new Users.Connection(connId, noopWorker, String(uid), null, '127.0.0.1', null);
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
					}, 150); break;
				} else if (line.startsWith('|error|[Invalid choice]')) {
					setTimeout(() => { void Rooms.get(roomidStr)?.battle?.stream.write(`>p2 default`); }, 50);
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

function createBattleRoom(user: User, botUser: User, botTeamData: any, state: PokeRogueState, isBoss: boolean, config: ModeConfig, livingTeam: PokemonEntry[], playerTeam: string): AnyObject | null {
	const isTrainer = botTeamData.isTrainer;
	const isDoubles = !isTrainer && !isBoss && botTeamData.team.length > 1 && livingTeam.length > 1;
	const format = (isDoubles && config.doublesFormat) ? config.doublesFormat : config.baseFormat;

	let opponentTitle = isTrainer && botTeamData.trainerName ? botTeamData.trainerName : (isTrainer ? TRAINER_NAME : 'Wild Encounter');
	if (isBoss && !isTrainer) opponentTitle = `BOSS ${opponentTitle}`;

	if (isTrainer && botTeamData.trainerName) {
		botUser.name = botTeamData.trainerName;
	} else if (!isTrainer) {
		const wildNames = botTeamData.team.map((m: any) => Dex.species.get(toID(m.species)).name).filter(Boolean);
		if (wildNames.length) botUser.name = `Wild ${wildNames.join(' & ')}`;
	}

	try {
		return Rooms.createBattle({
			format, rated: false,
			title: `PokéRogue Battle - Floor ${state.floor}: ${user.name} vs ${opponentTitle}`,
			players: [{ user, team: playerTeam }, { user: botUser, team: botTeamData.packedTeam }],
		});
	} catch (e) {
		destroyBotUser(botUser);
		user.popup('Failed to start the PokéRogue battle. Please try again.');
		Monitor.crashlog(e as Error, 'PokéRogue battle creation');
		return null;
	}
}

function registerBotBattleHandler(botUser: User) {
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
							const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
								`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
								`<button name="send" value="/pokerogue catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
								`<button name="send" value="/pokerogue catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
								`<button name="send" value="/pokerogue catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
								`<button name="send" value="/pokerogue catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
								`</div>`;

							const playerUser = Users.get(match.userId);
							if (playerUser) {
								if (match.lastPanelTurn) playerUser.sendTo(room, `|uhtmlchange|catchpanel-${match.lastPanelTurn}|`);
								playerUser.sendTo(room, `|uhtml|catchpanel-${turn}|${catchHTML}`);
							}
							match.lastPanelTurn = turn;
						}
					}
				}
			}

			const turn = room.battle.turn || 0;
			const ai = getPokeRogueAI(roomid as string, gen, activeConfig);
			const choice = ai.receiveRequest(requestLine, turn, match?.floor ?? 1);
			void room.battle.stream.write(`>p2 ${choice}`);
		})();
	});
}

export function startBattle(user: User, state: PokeRogueState): boolean {
	const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);
	if (!livingTeam.length) {
		user.popup('All your Pokémon have fainted! Use a Revive from the shop before battling.');
		return false;
	}

	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const isBoss = state.floor % config.bossInterval === 0;
	if (state.pendingTrainer) delete state.pendingTrainer;
	if (state.pendingTrainerKey) delete state.pendingTrainerKey;

	const botTeamData = buildBotTeam(state);
	const botUser = createBotUser(user.id);
	const playerTeam = packTeam(livingTeam);

	const battleRoom = createBattleRoom(user, botUser, botTeamData, state, isBoss, config, livingTeam, playerTeam);
	if (!battleRoom) return false;

	registerBotBattleHandler(botUser);

	state.battleRoomId = battleRoom.roomid;
	setState(user.id, state);

	const isDoubles = !botTeamData.isTrainer && !isBoss && botTeamData.team.length > 1 && livingTeam.length > 1;
	activeMatches.set(battleRoom.roomid, {
		userId: user.id, botUserId: botUser.id, floor: state.floor,
		isTrainerBattle: botTeamData.isTrainer, botTeam: botTeamData.team, isDoubles,
	});

	clearPokeRogueAI(battleRoom.roomid);
	return true;
}
