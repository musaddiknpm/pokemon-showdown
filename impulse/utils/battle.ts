import { ObjectReadWriteStream } from '../../lib/streams';
import { getUtilityAI, clearUtilityAI } from './ai';

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
	playerTeam: any[];
}

export interface ActiveBotMatch {
	userId: ID;
	botUserId: ID;
	botTeam?: any[];
	isDoubles?: boolean;
	onTurn?: (room: AnyObject, turn: number) => void;
	isTrainerBattle?: boolean;
	matchContext?: AnyObject;
}

let botCounter = 0;
const noopWorker = {
	process: {
		send: () => {},
	},
	stream: {
		write: () => {},
	},
} as any;

export class UtilityBattleResolver {
	user: User;
	
	static activeMatches: Map<RoomID, ActiveBotMatch> = (global as any).UtilityActiveMatches || new Map<RoomID, ActiveBotMatch>();
	static botBattleHandlers: Map<string, (roomid: string, requestLine: string) => void> = (global as any).UtilityBotHandlers || new Map<string, (roomid: string, requestLine: string) => void>();
	static {
		(global as any).UtilityActiveMatches = UtilityBattleResolver.activeMatches;
		(global as any).UtilityBotHandlers = UtilityBattleResolver.botBattleHandlers;
	}

	constructor(user: User) {
		this.user = user;
	}

	private static handleSwitchEvent(match: RegExpExecArray, state: ParseState) {
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
					state.itemAssigned.add(i);
					break;
				}
			}
		} else {
			state.p2Active.set(slot, { species: match[2].trim(), level, hp, maxHp, status, fainted: hp === 0 });
		}
	}

	private static handleDamageEvent(match: RegExpExecArray, state: ParseState) {
		const slot = match[1];
		const hp = parseInt(match[2]);
		const status = match[4] || '';

		if (slot.startsWith('p1')) {
			const idx = state.p1SlotToTeamIdx[slot];
			if (idx !== undefined) {
				state.p1TeamHp[idx] = hp;
				if (status) state.p1TeamStatus[idx] = status;
			}
		} else {
			const active = state.p2Active.get(slot);
			if (active) {
				active.hp = hp;
				if (status) active.status = status;
			}
		}
	}

	private static handleStatusEvent(match: RegExpExecArray, state: ParseState) {
		const slot = match[1];
		const status = match[2];
		if (slot.startsWith('p1')) {
			const idx = state.p1SlotToTeamIdx[slot];
			if (idx !== undefined) state.p1TeamStatus[idx] = status;
		} else {
			const active = state.p2Active.get(slot);
			if (active) active.status = status;
		}
	}

	private static handleCureStatusEvent(match: RegExpExecArray, state: ParseState) {
		const slot = match[1];
		if (slot.startsWith('p1')) {
			const idx = state.p1SlotToTeamIdx[slot];
			if (idx !== undefined) state.p1TeamStatus[idx] = '';
		} else {
			const active = state.p2Active.get(slot);
			if (active) active.status = '';
		}
	}

	private static handleFaintEvent(match: RegExpExecArray, state: ParseState) {
		const slot = match[1];
		if (slot.startsWith('p1')) {
			state.p1SlotState.set(slot, true);
			const idx = state.p1SlotToTeamIdx[slot];
			if (idx !== undefined) {
				state.p1TeamHp[idx] = 0;
				state.p1FaintedIndices.add(idx);
			}
		} else {
			const active = state.p2Active.get(slot);
			if (active) {
				active.hp = 0;
				active.fainted = true;
			}
		}
	}

	private static handleEndItemEvent(line: string, match: RegExpExecArray, state: ParseState) {
		const slot = match[1];
		if (slot.startsWith('p1') && line.includes('[eat]')) {
			const itemText = match[2];
			const itemId = toID(itemText);
			const idx = state.itemSlotMap[slot];
			if (idx !== undefined) {
				state.consumedItems.push({ teamIdx: idx, itemId });
			}
		}
	}

	static parseBattleState(logLines: string[], playerTeam: any[]): ParsedBattleState {
		const state: ParseState = {
			p1TeamHp: {}, p1TeamStatus: {}, p1FaintedIndices: new Set(),
			p2Active: new Map(), consumedItems: [],
			p1SlotToTeamIdx: {}, p1ActivelyAssigned: new Set(),
			itemSlotMap: {}, itemAssigned: new Set(),
			p1SlotState: new Map(), playerTeam
		};

		const reSwitch = /^\|(?:switch|drag|replace)\|([^|]+)\|([^|,]+)(?:, L(\d+))?(?:, [MF])?\|(\d+)\/(\d+)(?:\s+([a-z]+))?/;
		const reDamage = /^\|(?:-damage|-heal)\|([^|]+)\|(\d+)\/(\d+)(?:\s+([a-z]+))?/;
		const reStatus = /^\|-status\|([^|]+)\|([a-z]+)/;
		const reCureStatus = /^\|-curestatus\|([^|]+)\|([a-z]+)/;
		const reFaint = /^\|faint\|([^|]+)/;
		const reEndItem = /^\|-enditem\|([^|]+)\|([^|]+)/;

		for (const line of logLines) {
			let match = reSwitch.exec(line);
			if (match) { UtilityBattleResolver.handleSwitchEvent(match, state); continue; }

			match = reDamage.exec(line);
			if (match) { UtilityBattleResolver.handleDamageEvent(match, state); continue; }

			match = reStatus.exec(line);
			if (match) { UtilityBattleResolver.handleStatusEvent(match, state); continue; }

			match = reCureStatus.exec(line);
			if (match) { UtilityBattleResolver.handleCureStatusEvent(match, state); continue; }

			match = reFaint.exec(line);
			if (match) { UtilityBattleResolver.handleFaintEvent(match, state); continue; }

			match = reEndItem.exec(line);
			if (match) { UtilityBattleResolver.handleEndItemEvent(line, match, state); continue; }
		}

		let p1ActiveFainted = false;
		for (const fainted of state.p1SlotState.values()) {
			if (fainted) {
				p1ActiveFainted = true;
				break;
			}
		}

		return {
			p1TeamHp: state.p1TeamHp,
			p1TeamStatus: state.p1TeamStatus,
			p1FaintedIndices: state.p1FaintedIndices,
			p2Active: state.p2Active,
			p1ActiveFainted,
			consumedItems: state.consumedItems,
		};
	}

	static destroyBotUser(botUser: User): void {
		UtilityBattleResolver.botBattleHandlers.delete(botUser.id);
		if (botUser.connections[0]) botUser.connections[0].destroy();
		botUser.disconnectAll();
		botUser.destroy();
	}

	private cleanupStaleBotMatch(playerId: string) {
		for (const [roomId, match] of UtilityBattleResolver.activeMatches) {
			if (match.userId === playerId) {
				const staleRoomId = roomId;
				const staleRoom = Rooms.get(staleRoomId);
				if (staleRoom) staleRoom.destroy();
				const staleMatch = UtilityBattleResolver.activeMatches.get(staleRoomId);
				if (staleMatch) {
					const staleBot = Users.get(staleMatch.botUserId);
					if (staleBot) UtilityBattleResolver.destroyBotUser(staleBot);
				}
				UtilityBattleResolver.activeMatches.delete(staleRoomId);
			}
		}
	}

	private createBotUser(playerId: string, trainerName: string): User {
		const uid = ++botCounter;
		const connId = `bot-${uid}`;
		const botInternalName = `utilitybot${uid}`;

		this.cleanupStaleBotMatch(playerId);

		const conn = new Users.Connection(connId, noopWorker, String(uid), null, '127.0.0.1', null);
		const botUser = new Users.User(conn);
		conn.user = botUser;

		botUser.forceRename(botInternalName, true);
		const mutableBotUser = botUser as User & { name: string, named: boolean, sendTo: (roomid: RoomID | BasicRoom | null, data: string) => void };
		mutableBotUser.name = trainerName;
		mutableBotUser.named = false;

		mutableBotUser.sendTo = function (roomid: RoomID | BasicRoom | null, data: string) {
			if (typeof data === 'string') {
				const lines = data.split('\n');
				const roomidStr = typeof roomid === 'string' ? roomid : roomid?.roomid ?? '';

				for (const line of lines) {
					if (line.startsWith('|request|')) {
						setTimeout(() => {
							const handler = UtilityBattleResolver.botBattleHandlers.get(botUser.id);
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

	private createBattleRoom(botUser: User, format: string, roomTitle: string, playerTeam: string, botPackedTeam: string): AnyObject | null {
		try {
			return Rooms.createBattle({
				format, rated: false,
				title: roomTitle,
				players: [{ user: this.user, team: playerTeam }, { user: botUser, team: botPackedTeam }],
			});
		} catch (e) {
			UtilityBattleResolver.destroyBotUser(botUser);
			this.user.popup("Failed to start the battle. Please try again.");
			Monitor.crashlog(e as Error, "Utility battle creation");
			return null;
		}
	}

	private registerBotBattleHandler(botUser: User, aiOptions: AnyObject, gen: number) {
		UtilityBattleResolver.botBattleHandlers.set(botUser.id, (roomid, requestLine) => {
			void (async () => {
				const room = Rooms.get(roomid as RoomID);
				if (!room?.battle) return;

				const match = UtilityBattleResolver.activeMatches.get(roomid as RoomID);
				const turn = room.battle.turn || 0;

				if (match && match.onTurn) {
					match.onTurn(room, turn);
				}

				const ai = getUtilityAI(roomid, gen, aiOptions);
				const choice = ai.receiveRequest(requestLine, turn, aiOptions);
				void room.battle.stream.write(`>p2 ${choice}`);
			})();
		});
	}

	start(
		botTeamData: { packedTeam: string, isTrainer: boolean, trainerName?: string, team: any[], isDoubles?: boolean },
		format: string,
		roomTitle: string,
		playerPackedTeam: string,
		aiOptions: AnyObject,
		gen: number,
		onTurn?: (room: AnyObject, turn: number) => void,
		matchContext?: AnyObject
	): AnyObject | null {
		
		const botUser = this.createBotUser(this.user.id, botTeamData.trainerName || (botTeamData.isTrainer ? "Trainer" : "Wild Encounter"));
		
		const battleRoom = this.createBattleRoom(botUser, format, roomTitle, playerPackedTeam, botTeamData.packedTeam);
		if (!battleRoom) return null;

		this.registerBotBattleHandler(botUser, aiOptions, gen);

		UtilityBattleResolver.activeMatches.set(battleRoom.roomid, {
			userId: this.user.id, 
			botUserId: botUser.id, 
			botTeam: botTeamData.team,
			isDoubles: botTeamData.isDoubles,
			isTrainerBattle: botTeamData.isTrainer,
			onTurn,
			matchContext
		});

		clearUtilityAI(battleRoom.roomid);
		return battleRoom;
	}
}
