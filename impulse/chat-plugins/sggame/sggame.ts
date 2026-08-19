
import { Chat } from '../../../server/chat';
import { loadUser, getState, setState, getUserData, saveUserData } from './database';
import { type SGGameState } from './types';
import { renderGamePage, refreshGamePage } from './render';
import { devCommands } from './dev-tools';
import { SGGameBattleResolver } from './battle';
import { hasPendingActions, clearStaleBattleRoom, ActionResolvers, CommandContext, syncBattleOutcome, processBattleExperience } from './sggame-core';

export const commands: Chat.ChatCommands = {
	sggame: {
		async start(target, room, user) {
			await loadUser(user.id);
			if (!user.named) throw new Chat.ErrorMessage("Login required.");
			let state = getState(user.id);

			if (!state) {
				state = {
					floor: 1, gameMode: 'classic', team: [],
					money: 3000,
					keyItems: {}, inventory: {}, highestFloor: 0,
					displayName: user.name, recordTeam: [],
				} as SGGameState;
				state.view = 'welcome';
				setState(user.id, state);
			}

			return this.parse('/join view-sggame');
		},

		async newgame(target, room, user) {
			await loadUser(user.id);
			const newState: SGGameState = {
				floor: 1, gameMode: 'classic', team: [],
				money: 3000,
				keyItems: {}, inventory: {}, highestFloor: 0,
				displayName: user.name, recordTeam: [],
				view: 'main'
			};
			setState(user.id, newState);
			return this.parse('/sggame start');
		},

		async saveslot(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return;
			const slot = parseInt(target.trim());
			if (isNaN(slot)) return;
			
			const userData = getUserData(user.id);
			userData.saveSlots[slot] = JSON.parse(JSON.stringify(state));
			saveUserData(user.id);
			
			state.notification = `Saved to Slot ${slot}!`;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async loadslot(target, room, user) {
			await loadUser(user.id);
			const slot = parseInt(target.trim());
			if (isNaN(slot)) return;

			const userData = getUserData(user.id);
			const slotData = userData.saveSlots?.[slot];
			if (!slotData) return;

			setState(user.id, slotData as SGGameState);
			refreshGamePage(user);
		},

		async view(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return;
			
			const parts = target.trim().split(' ');
			const viewName = parts[0] as SGGameState['view'];
			
			if (viewName) state.view = viewName;
			if (viewName === 'stats') state.pendingStatsSlot = parseInt(parts[1]);
			
			setState(user.id, state);
			refreshGamePage(user);
		},

		async battle(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return;

			const targetSplit = target.split(',');
			const battleRoomId = targetSplit[0].trim();
			const msgType = targetSplit[1]?.trim();
			const msg = targetSplit.slice(2).join(',').trim();

			if (state.battleRoomId !== battleRoomId) return;

			if (msgType === 'end') {
				clearStaleBattleRoom(state, user.id);
				state.view = 'main';
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async prebattle(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.team.length === 0) return;
			
			if (new SGGameBattleResolver(user, state).start()) {
				state.view = 'main';
				setState(user.id, state);
				refreshGamePage(user);
			}
		},
		
		async act(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return;
			
			const parts = target.trim().split(' ');
			const action = parts[0];
			const rest = parts.slice(1).join(' ');
			
			if (ActionResolvers[action]) {
				if (ActionResolvers[action](state, user, rest, this)) {
					setState(user.id, state);
					refreshGamePage(user);
				}
			}
		},

		async quit(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return;
			
			const userData = getUserData(user.id);
			state.team = [];
			saveUserData(user.id);
			
			this.parse('/sggame view welcome');
		},

		...devCommands,
		'': 'help',
		async help(target, room, user) {
			return this.sendReplyBox(`<b>SGGame Commands:</b><br>/sggame start`);
		}
	}
};

export const handlers: Chat.Handlers = {
	onBattleEnd(battle, winner, players) {
		const match = SGGameBattleResolver.activeMatches.get(battle.roomid);
		if (!match) return;

		SGGameBattleResolver.activeMatches.delete(battle.roomid);
		const botUser = Users.get(match.botUserId);
		if (botUser) SGGameBattleResolver.destroyBotUser(botUser);

		const state = getState(match.userId);
		if (!state) return;

		const room = Rooms.get(battle.roomid);
		const logLines: string[] = room?.log?.log ?? [];

		syncBattleOutcome(logLines, state);

		delete state.battleRoomId;

		const isTrainerBattle = match.isTrainerBattle ?? false;
		
		if (toID(winner) === match.userId) {
			const detailMsgs = processBattleExperience(logLines, state, isTrainerBattle);

			if (state.caughtPokemon) {
				const caughtMon = state.caughtPokemon;
				if (state.team.length < 6) {
					state.team.push(caughtMon);
				} else {
					state.pendingSwap = caughtMon;
				}
				delete state.caughtPokemon;
			}

			if (detailMsgs.length) {
				state.notification = (state.notification ? state.notification + '<br>' : '') + detailMsgs.join('<br>');
			}
		} else {
			state.notification = "You lost the battle!";
		}

		state.view = 'main';
		setState(match.userId, state);
		const hUser = Users.get(match.userId);
		if (hUser) refreshGamePage(hUser);
	},
};
