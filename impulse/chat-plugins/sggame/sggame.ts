
import { Chat } from '../../../server/chat';
import { loadUser, getState, setState, getUserData, saveUserData } from './database';
import { type SGGameState } from './types';
import { renderGamePage, refreshGamePage } from './render';
import { devCommands } from './dev-tools';
import { UtilityBattleResolver } from '../../utils/battle';
import { buildBotTeam } from './sggame-core';
import { packTeam } from './pokemon';
import { MODE_CONFIGS } from './config';
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
			
			
			const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);
			if (!livingTeam.length) {
				user.popup("All your Pokémon have fainted!");
				return;
			}
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const isBoss = state.floor % config.bossInterval === 0;
			const botTeamData = buildBotTeam(state, config);
			const isDoubles = botTeamData.isDoubles ?? (!botTeamData.isTrainer && !isBoss && botTeamData.team.length > 1 && livingTeam.length > 1);
			const format = (isDoubles && config.doublesFormat) ? config.doublesFormat : config.baseFormat;
			let opponentTitle = botTeamData.isTrainer && botTeamData.trainerName ? botTeamData.trainerName : (botTeamData.isTrainer ? "Trainer" : "Wild Encounter");
			if (isBoss && !botTeamData.isTrainer) opponentTitle = `BOSS ${opponentTitle}`;
			const roomTitle = `SGGame Battle - Floor ${state.floor}: ${user.name} vs ${opponentTitle}`;

			const resolver = new UtilityBattleResolver(user);
			const battleRoom = resolver.start(botTeamData, format, roomTitle, packTeam(livingTeam), config, config.generation || 9, (room, turn) => {
				const activeConfig = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
				if (state.floor % activeConfig.bossInterval !== 0 && !botTeamData.isTrainer) {
					const inv = state.inventory || {};
					const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
						`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
						`<button name="send" value="/sggame catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
						`</div>`;
					const playerUser = Users.get(user.id);
					if (playerUser) {
						if ((room as any).lastPanelTurn && (room as any).lastPanelTurn !== turn) playerUser.sendTo(room as any, `|uhtmlchange|catchpanel-${(room as any).lastPanelTurn}|`);
						if ((room as any).lastPanelTurn !== turn) {
							playerUser.sendTo(room as any, `|uhtml|catchpanel-${turn}|${catchHTML}`);
							(room as any).lastPanelTurn = turn;
						}
					}
				}
			}, state);

			if (battleRoom) {
				state.battleRoomId = battleRoom.roomid;
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


export const pages: Chat.PageTable = {
	async sggame(args, user) {
		await loadUser(user.id);
		if (!user.named) throw new Chat.ErrorMessage('Login required.');
		const state = getState(user.id);
		if (!state) return `<div class="pr-popup"><div class="pr-popup-header"><h2>SGGame</h2></div><div style="text-align:center;padding:16px"><button name="send" value="/sggame start" class="button">Start New Run</button></div></div>`;
		const v = state.view || 'main';
		this.title = `SGGame - ${v.toUpperCase()}`;

		const html = renderGamePage(state, user);

		if (state.notification) {
			delete state.notification;
			setState(user.id, state);
		}

		return html;
	},
};

export const handlers: Chat.Handlers = {
	onBattleEnd(battle, winner, players) {
		const match = UtilityBattleResolver.activeMatches.get(battle.roomid);
		if (!match) return;

		UtilityBattleResolver.activeMatches.delete(battle.roomid);
		const botUser = Users.get(match.botUserId);
		if (botUser) UtilityBattleResolver.destroyBotUser(botUser);

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
