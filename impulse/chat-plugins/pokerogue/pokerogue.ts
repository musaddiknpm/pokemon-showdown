import { Utils } from '../../../lib';
import { type PokemonEntry, type PokeRogueState, type StatusCondition, type GameMode, type ModeConfig, type BiomePool, type PokeRogueView, type EggData, type StatTable } from './types';
import { EGG_POOLS, getStarterCost, type EggTier } from './starter-data';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { CATCH_RATES } from './pokemon-basic-data';
import { SHOP_ITEMS, genItem, generateDraftOptions, getRewardMoney, getItemPrice, getRerollCost } from './items';
import {
	loadUser, getState, setState, getUserData, saveUserData, globalStats, saveGlobalStats, recordRunStats,
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
export * from './pokerogue-core';
import {
	LADDER_RESET_CONFIRM_WINDOW,
	pendingLadderResetConfirmations,
	EXP_SHARE_NAME,
	EV_STAT_LABELS,
	MAX_EV_TOTAL,
	MAX_EV_STAT,
	EV_VITAMIN_GAIN,
	RESIDUAL_FROM_TAGS,
	SELF_KO_MOVES,
	hasPendingActions,
	repairEmptyPendingChoice,
	isBossFloorBoundary,
	parseFloorRange,
	pickNextBiome,
	clearStaleBattleRoom,
	processLevelUp,
	applyRarerCandy,
	parseKillExp,
	applyExpShare,
	processBattleExperience,
	syncBattleOutcome,
	processFloorRewards,
	handleBattleLoss,
	CommandContext,
	ActionResolvers,
	handleDraftAction,
	handleBuyShopAction,
	handleChooseAction,
	handleCatchAction,
} from './pokerogue-core';

export const commands: Chat.ChatCommands = {
	pokerogue: {
		async start(target, room, user) {
			await loadUser(user.id);
			if (!user.named) return this.errorReply("Login required.");
			let state = getState(user.id);

			if (state && Array.isArray(state.keyItems)) {
				const migratedItems: Record<string, number> = {};
				for (const item of state.keyItems) migratedItems[item] = (migratedItems[item] || 0) + 1;
				state.keyItems = migratedItems;
				setState(user.id, state);
			}

			if (state?.battleRoomId) {
				const bRoom = Rooms.get(state.battleRoomId as RoomID);
				if (!bRoom?.battle || bRoom.battle.ended) delete state.battleRoomId;
			}

			const hasActiveRun = state && ((state.team?.length > 0) || ((state.floor ?? 1) > 1) || (state.pendingChoice?.length ?? 0) > 0);
			const isGameOver = state?.gameOver;

			if (!state || (!hasActiveRun && !isGameOver)) {
				const userData = getUserData(user.id);
				const previousHighestFloor = userData.stats?.['classic']?.highestFloor || 0;

				if (previousHighestFloor > 0) {
					return this.parse('/pokerogue newgame classic');
				}

				const defaultConfig = MODE_CONFIGS['classic'];
				const previousRecordTeam = userData.stats?.['classic']?.recordTeam || [];
				state = {
					floor: 1, gameMode: 'classic', currentBiome: defaultConfig.startingBiome, team: [],
					money: defaultConfig.economy.startingMoney || 0, timesRerolled: 0, rotationalShop: [],
					keyItems: { ...(defaultConfig.economy.startingKeyItems || {}) },
					inventory: { ...(defaultConfig.economy.startingInventory || {}) },
					highestFloor: 0, displayName: state?.displayName || user.name,
					recordTeam: previousRecordTeam,
				} as PokeRogueState;

				state.view = 'welcome';
				setState(user.id, state);
			}
			return this.parse('/join view-pokerogue');
		},

		async newgame(target, room, user) {
			await loadUser(user.id);
			const targetParts = target.trim().toLowerCase().split(' ');
			const isConfirm = targetParts.includes('confirm');
			let modeStr = targetParts[0];
			if (isConfirm && targetParts.length > 1) modeStr = targetParts.find(p => p !== 'confirm') || 'classic';

			const requestedMode = (modeStr || 'classic');
			const finalMode = MODE_CONFIGS[requestedMode] ? requestedMode : 'classic';

			const userData = getUserData(user.id);
			const existingInMode = userData.runs[finalMode];
			const previousHighestFloor = userData.stats?.[finalMode]?.highestFloor || 0;
			const previousRecordTeam = userData.stats?.[finalMode]?.recordTeam || [];

			if (existingInMode?.gameOver || existingInMode?.gameWon) {
				delete existingInMode.gameOver; delete existingInMode.gameWon; delete existingInMode.lastRunFloor;
				existingInMode.floor = 1;
				setState(user.id, existingInMode);
			}

			const hasProgress = existingInMode && (existingInMode.team?.length > 0 || (existingInMode.floor ?? 1) > 1);
			if (hasProgress && !isConfirm) {
				return this.sendReplyBox(`<b>Warning: Run in progress for ${finalMode}!</b><br><button name="send" value="/pokerogue newgame ${finalMode} confirm" class="button">Yes, start fresh</button>`);
			}

			const config = MODE_CONFIGS[finalMode];
			const modeData = MODE_REGISTRY[finalMode] || MODE_REGISTRY['classic'];
			const useNewStarterSelectionUI = modeData.useNewStarterSelectionUI !== false;
			const unlockedStarterIds = Object.keys(userData.starters || {});
			const starterPool = useNewStarterSelectionUI ? [...new Set([...modeData.starters, ...unlockedStarterIds])] : modeData.starters;

			const newState: PokeRogueState = {
				floor: 1, gameMode: finalMode, currentBiome: config.startingBiome, team: [],
				money: config.economy.startingMoney || 0, timesRerolled: 0, rotationalShop: [],
				keyItems: { ...(config.economy.startingKeyItems || {}) }, inventory: { ...(config.economy.startingInventory || {}) },
				pendingChoice: useNewStarterSelectionUI ? starterPool : pickStarterOptions(starterPool),
				pendingChoiceType: 'starter', highestFloor: previousHighestFloor,
				displayName: existingInMode?.displayName || user.name, recordTeam: previousRecordTeam,
			};

			newState.view = useNewStarterSelectionUI ? 'starterselect' : 'main';
			setState(user.id, newState);
			recordRunStats(user.id, finalMode, 1, []);

			if (newState.view !== 'welcome') repairEmptyPendingChoice(newState, user.id);
			return this.parse('/pokerogue start');
		},

		async saveslot(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.gameOver || state.battleRoomId) return this.errorReply("Cannot save right now.");
			if (hasPendingActions(state)) return this.errorReply("You must resolve your pending choices before saving.");

			const slot = parseInt(target.trim());
			if (isNaN(slot) || slot < 1 || slot > 3) return this.errorReply("Invalid save slot. Must be 1, 2, or 3.");

			const userData = getUserData(user.id);
			if (!userData.saveSlots) userData.saveSlots = {};
			userData.saveSlots[slot] = JSON.parse(JSON.stringify(state));

			delete userData.runs[state.gameMode];
			saveUserData(user.id);

			const defaultConfig = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const nextState = {
				floor: 1, gameMode: state.gameMode, currentBiome: defaultConfig.startingBiome, team: [],
				money: defaultConfig.economy.startingMoney || 0, timesRerolled: 0, rotationalShop: [],
				keyItems: { ...(defaultConfig.economy.startingKeyItems || {}) },
				inventory: { ...(defaultConfig.economy.startingInventory || {}) },
				highestFloor: 0, displayName: user.name,
				recordTeam: [],
			} as PokeRogueState;

			nextState.notification = `Progress successfully saved and suspended to <b>Slot ${slot}</b>!`;
			nextState.view = 'welcome';
			setState(user.id, nextState);
			refreshGamePage(user);
		},

		async loadslot(target, room, user) {
			await loadUser(user.id);
			const slot = parseInt(target.trim());
			if (isNaN(slot) || slot < 1 || slot > 3) return this.errorReply("Invalid save slot. Must be 1, 2, or 3.");

			const userData = getUserData(user.id);
			const slotData = userData.saveSlots?.[slot];
			if (!slotData) return this.errorReply("That save slot is empty.");

			const currentState = getState(user.id);
			if (currentState?.battleRoomId) {
				const bRoom = Rooms.get(currentState.battleRoomId as RoomID);
				if (bRoom?.battle && !bRoom.battle.ended) return this.errorReply("You cannot load a game while currently in a battle!");
			}

			const restoredState = JSON.parse(JSON.stringify(slotData)) as PokeRogueState;
			userData.runs[restoredState.gameMode] = restoredState;
			userData.activeMode = restoredState.gameMode;
			delete userData.saveSlots[slot];
			saveUserData(user.id);

			const newState = getState(user.id);
			if (newState) {
				newState.notification = `Game loaded successfully from <b>Slot ${slot}</b>!`;
				newState.view = 'main';
				setState(user.id, newState);
			}
			refreshGamePage(user);
		},

		async status(target, room, user) {
			await loadUser(user.id);
			if (!this.runBroadcast()) return;
			const tId = toID(target) || user.id;
			const s = getState(tId);
			if (!s) return this.errorReply(`No run found for ${tId}.`);
			const buf = `<b>PokéRogue Status: ${tId}</b><br>Mode: ${s.gameMode || 'classic'} | Floor ${s.floor} | Money: $${s.money ?? 0}<br>${s.team.map(m => `Lv.${m.level} ${m.species}`).join(', ')}`;
			this.sendReplyBox(buf);
		},

		async quit(target, room, user) {
			await loadUser(user.id);
			const s = getState(user.id);
			if (s?.battleRoomId) {
				const match = activeMatches.get(s.battleRoomId as RoomID);
				if (match) {
					const bot = Users.get(match.botUserId);
					if (bot) destroyBotUser(bot);
					activeMatches.delete(s.battleRoomId as RoomID);
				}
				Rooms.get(s.battleRoomId)?.battle?.forfeit(user);
			}
			if (s) {
				s.gameOver = true;
				s.lastRunFloor = s.floor;
				s.floor = 1;
				s.team = [];
				delete s.pendingMoves;
				delete s.pendingSwap;
				delete s.pendingChoice;
				delete s.moveToLearn;
				delete s.pendingItemName;
				delete s.itemOptions;
				delete s.purchasedItem;
				delete s.pendingConsumableType;
				delete s.pendingTrainer;
				delete s.pendingTrainerKey;
				delete s.pendingRewardDraft;
				delete s.rerollCount;
				delete s.pendingItemIsEvo;
				delete s.pendingItemIsMega;
				delete s.pendingItemIsGmax;
				delete s.pendingItemIsStackable;
				setState(user.id, s);
			}
			refreshGamePage(user);
		},

		async view(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');

			const args = target.trim().split(' ');
			const v = args[0] as PokeRogueView;

			if (['main', 'top', 'guide', 'resetconfirm', 'welcome', 'stats', 'save', 'load', 'starterselect', 'draft', 'gacha', 'incubator'].includes(v)) {
				if (v === 'top') {
					if (args[1]) state.topMode = args[1];
					else if (!state.topMode) state.topMode = 'classic';
					state.view = 'top';
					setState(user.id, state);
				} else if (v === 'main' && !state.isConfiguringStarter && state.pendingChoiceType === 'starter' && state.pendingChoice?.length) {
					const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
					if (modeData.useNewStarterSelectionUI !== false) {
						state.view = 'starterselect';
						setState(user.id, state);
						refreshGamePage(user);
						return;
					}
				}

				if (v === 'main' && state.isConfiguringStarter) {
					const userData = getUserData(user.id);
					const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
					const unlockedStarterIds = Object.keys(userData.starters || {});
					const starterPool = modeData.useNewStarterSelectionUI !== false ?
						[...new Set([...modeData.starters, ...unlockedStarterIds])] : modeData.starters;

					state.team = []; state.pendingChoice = starterPool; state.pendingChoiceType = 'starter';
					delete state.isConfiguringStarter; delete state.pendingStatsSlot; delete state.statsTab;
					delete state.starterSearch;
					state.view = 'starterselect';
					setState(user.id, state);
					refreshGamePage(user);
					return;
				}

				if (v === 'stats') {
					const slot = parseInt(args[1]);
					if (!isNaN(slot) && slot >= 0 && slot < state.team.length) {
						state.pendingStatsSlot = slot;
						state.statsTab = state.statsTab ?? 0;
					} else return;
				} else {
					delete state.pendingStatsSlot; delete state.statsTab;
				}

				state.view = v;
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async pull(target, room, user) {
			await loadUser(user.id);
			const parts = target.split(',').map(p => p.trim());
			const type = parts[0].toLowerCase();
			const rawBanner = parts[1] || 'generic';
			const bannerType: EggData['bannerType'] = rawBanner === 'shiny' || rawBanner === 'eggmove' || rawBanner === 'generic' ? rawBanner : 'generic';

			const validTypes: Record<string, number> = { regular: 1, plus: 5, premium: 10, gold: 25 };
			if (!validTypes[type]) return this.errorReply("Invalid voucher type.");

			const userData = getUserData(user.id);
			if (!userData.vouchers) userData.vouchers = { regular: 0, plus: 0, premium: 0, gold: 0 };
			if (!userData.eggs) userData.eggs = [];

			const pulls = validTypes[type];

			if (userData.eggs.length + pulls > 100) {
				const state = getState(user.id);
				if (state) {
					state.notification = `Your incubator is too full to pull ${pulls} egg(s)! You can only hold a maximum of 100 eggs. (Currently holding: ${userData.eggs.length})`;
					setState(user.id, state);
				}
				refreshGamePage(user);
				return;
			}

			const currentVouchers = userData.vouchers[type] || 0;
			if (currentVouchers <= 0) return this.errorReply(`You don't have any ${type} vouchers!`);

			userData.vouchers[type] = currentVouchers - 1;

			const allSpeciesFallback = Dex.species.all().filter(s => s.exists && !s.isNonstandard && !s.isMega && !s.isPrimal && (!s.prevo || s.prevo === '')).map(s => s.id);

			let highestTierRolled = 0;

			for (let i = 0; i < pulls; i++) {
				let roll = Math.floor(Math.random() * 256);

				if (i === pulls - 1) {
					if (type === 'premium' && highestTierRolled < 1) {
						roll = Math.floor(Math.random() * 52);
					} else if (type === 'gold' && highestTierRolled < 2) {
						roll = Math.floor(Math.random() * 8);
					}
				}

				let tier: EggTier = 'Common';
				let waves = 10;
				let tierValue = 0;

				if (roll < 1) {
					tier = 'Legendary';
					waves = 100;
					tierValue = 3;
				} else if (roll < 8) {
					tier = 'Epic';
					waves = 50;
					tierValue = 2;
				} else if (roll < 52) {
					tier = 'Rare';
					waves = 25;
					tierValue = 1;
				}

				if (tierValue > highestTierRolled) {
					highestTierRolled = tierValue;
				}

				const haRoll = Math.floor(Math.random() * 192) === 0;

				const pool = EGG_POOLS[tier] && EGG_POOLS[tier].length > 0 ? EGG_POOLS[tier] : allSpeciesFallback;
				const species = pool[Math.floor(Math.random() * pool.length)];

				userData.eggs.push({ species, wavesRemaining: waves, tier, shiny: false, hiddenAbility: haRoll, bannerType } satisfies EggData);
			}

			saveUserData(user.id);

			const state = getState(user.id);
			if (state) {
				state.notification = `You redeemed a ${type} voucher and received ${pulls} egg(s)!`;
				setState(user.id, state);
			}
			refreshGamePage(user);
		},

		async statstab(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			const args = target.trim().split(' ');
			const dir = args[0];
			const TAB_COUNT = 3;
			let current = state.statsTab ?? 0;

			if (dir === 'next') current = (current + 1) % TAB_COUNT;
			else if (dir === 'prev') current = (current - 1 + TAB_COUNT) % TAB_COUNT;
			else {
				const n = parseInt(dir);
				if (!isNaN(n) && n >= 0 && n < TAB_COUNT) current = n;
			}
			state.statsTab = current;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async startersearch(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'starterselect') return;
			state.starterSearch = target.trim().toLowerCase();
			state.starterPage = 0;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async starterpage(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'starterselect') return;
			const page = parseInt(target.trim());
			if (!isNaN(page)) {
				state.starterPage = page;
			}
			setState(user.id, state);
			refreshGamePage(user);
		},

		async cyclestarter(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state?.isConfiguringStarter) return;
			const userData = getUserData(user.id);

			const parts = target.trim().split(' ');
			const trait = parts[0];
			const direction = parts[1];
			const slot = parseInt(parts[2]) || 0;

			if (slot < 0 || slot >= state.team.length) return;

			const mon = state.team[slot];
			let baseSpecies = toID(mon.species);

			while (true) {
				const sp = Dex.species.get(baseSpecies);
				if (!sp.prevo) break;
				baseSpecies = toID(sp.prevo);
			}

			let starterData = userData.starters[baseSpecies];
			if (!starterData) {
				starterData = {
					unlockedNatures: [mon.nature!],
					unlockedAbilities: [mon.ability!],
					unlockedTeraTypes: [mon.teraType!],
					selectedNature: mon.nature!,
					selectedAbility: mon.ability!,
					selectedTeraType: mon.teraType!,
				} as PokemonEntry;
				userData.starters[baseSpecies] = starterData;
			}

			const traitMap: Record<string, { p: 'unlockedNatures' | 'unlockedAbilities' | 'unlockedTeraTypes', m: 'nature' | 'ability' | 'teraType', s: 'selectedNature' | 'selectedAbility' | 'selectedTeraType', n: string }> = {
				'nature': { p: 'unlockedNatures', m: 'nature', s: 'selectedNature', n: 'Natures' },
				'ability': { p: 'unlockedAbilities', m: 'ability', s: 'selectedAbility', n: 'Abilities' },
				'tera': { p: 'unlockedTeraTypes', m: 'teraType', s: 'selectedTeraType', n: 'Tera Types' },
			};

			if (traitMap[trait]) {
				const { p, m, s, n } = traitMap[trait];
				const pool = starterData[p]?.length ? starterData[p] : [mon[m]!];
				if (!pool.includes(mon[m]!)) pool.push(mon[m]! as any);

				if (pool.length <= 1) state.notification = `You haven't unlocked any other ${n} for this Pokémon yet! Catch duplicates in the wild to expand your options.`;
				else {
					let idx = pool.indexOf(mon[m]! as any);
					if (direction === 'next') idx = (idx + 1) % pool.length;
					if (direction === 'prev') idx = (idx - 1 + pool.length) % pool.length;

					mon[m] = pool[idx] as any;
					starterData[s] = pool[idx] as any;
					(starterData as any)[m] = pool[idx];
				}
			} else if (trait === 'move') {
				const moveIndex = parseInt(parts[3]);
				if (isNaN(moveIndex) || moveIndex < 0 || moveIndex >= 4) return;

				if (!mon.moves) mon.moves = [];
				const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
				const allLevelMoves = getAllLevelUpMoves(baseSpecies, mon.level, config.generation || 9);
				const validEggMoves = getEggMoves(baseSpecies, config.generation || 9);

				const legalUnlockedEggMoves = (starterData.unlockedEggMoves || []).filter(m => validEggMoves.includes(m));
				const pool = [...new Set([...allLevelMoves, ...legalUnlockedEggMoves])];

				if (pool.length <= mon.moves.length && pool.length <= 4) {
					state.notification = `You haven't unlocked any additional legal moves for this Pokémon yet!`;
				} else {
					let currentMove = mon.moves[moveIndex];
					if (!currentMove) {
						currentMove = pool.find(m => !mon.moves.includes(m)) || pool[0];
						mon.moves[moveIndex] = currentMove;
					}

					let idx = pool.indexOf(currentMove);
					if (idx === -1) idx = 0;

					let attempts = 0;
					while (attempts < pool.length) {
						if (direction === 'next') idx = (idx + 1) % pool.length;
						if (direction === 'prev') idx = (idx - 1 + pool.length) % pool.length;

						const candidate = pool[idx];
						const alreadyHas = mon.moves.some((m, i) => i !== moveIndex && m === candidate);
						if (!alreadyHas) {
							mon.moves[moveIndex] = candidate;
							break;
						}
						attempts++;
					}

					starterData.selectedMoves = [...mon.moves];
				}
			}

			saveUserData(user.id);
			setState(user.id, state);
			refreshGamePage(user);
		},

		async confirmstarter(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state?.isConfiguringStarter) return;

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const maxCost = config.maxStarterCost || 10;

			let totalCost = 0;
			for (const mon of state.team) totalCost += getStarterCost(mon.species);
			if (totalCost > maxCost) return this.errorReply(`Total starter cost cannot exceed ${maxCost}.`);

			delete state.pendingChoice;
			delete state.pendingChoiceType;
			delete state.pendingChoiceFloor;
			delete state.isConfiguringStarter;
			state.view = 'main';

			setState(user.id, state);
			refreshGamePage(user);
		},

		async removestarter(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'starterselect') return;
			const slot = parseInt(target.trim());
			if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid slot.");
			state.team.splice(slot, 1);
			if (state.team.length === 0) delete state.isConfiguringStarter;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async startrun(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'starterselect') return;
			if (!state.team || state.team.length === 0) return this.errorReply("You must select at least one starter.");

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const maxCost = config.maxStarterCost || 10;

			let totalCost = 0;
			for (const mon of state.team) totalCost += getStarterCost(mon.species);
			if (totalCost > maxCost) return this.errorReply(`Total starter cost cannot exceed ${maxCost}.`);

			delete state.pendingChoice;
			delete state.pendingChoiceType;
			delete state.pendingChoiceFloor;
			delete state.isConfiguringStarter;
			state.view = 'main';
			setState(user.id, state);
			refreshGamePage(user);
		},

		async movemon(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("No active run.");
			if (state.battleRoomId) return this.errorReply("Can't organize your team during a battle.");

			const args = target.split(' ').map(s => s.trim());

			if (args[0] === 'cancel') {
				delete state.pendingMoveSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (args[0] === 'confirm') {
				if (state.pendingMoveSlot === undefined) return;
				const toSlot = parseInt(args[1]) - 1;
				const fromSlot = state.pendingMoveSlot;
				if (isNaN(toSlot) || toSlot < 0 || toSlot >= state.team.length) return this.errorReply("Invalid slot.");

				const temp = state.team[fromSlot];
				state.team[fromSlot] = state.team[toSlot];
				state.team[toSlot] = temp;

				delete state.pendingMoveSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (hasPendingActions(state)) return this.errorReply("Resolve pending choices first.");

			const fromSlot = parseInt(args[0]) - 1;
			if (isNaN(fromSlot) || fromSlot < 0 || fromSlot >= state.team.length) return this.errorReply("Invalid slot.");
			state.pendingMoveSlot = fromSlot;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async releasemon(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("No active run.");
			if (state.battleRoomId) return this.errorReply("Can't release Pokémon during a battle.");

			const args = target.split(' ').map(s => s.trim());

			if (args[0] === 'cancel') {
				delete state.pendingReleaseSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (args[0] === 'confirm') {
				if (state.pendingReleaseSlot === undefined) return;
				const slot = state.pendingReleaseSlot;
				if (slot < 0 || slot >= state.team.length) return this.errorReply("Invalid slot.");
				if (state.team.length <= 1) return this.errorReply("You cannot release your last Pokémon!");

				const mon = state.team[slot];
				const spName = Dex.species.get(toID(mon.species)).name;
				state.team.splice(slot, 1);

				state.notification = `You released <b>${spName}</b>.`;
				delete state.pendingReleaseSlot; delete state.pendingMoveSlot; delete state.pendingStatsSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (hasPendingActions(state)) return this.errorReply("Resolve pending choices first.");

			const slot = parseInt(args[0]) - 1;
			if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid slot.");
			if (state.team.length <= 1) return this.errorReply("You cannot release your last Pokémon!");
			state.pendingReleaseSlot = slot;
			setState(user.id, state);
			refreshGamePage(user);
		},

		async transferitem(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.battleRoomId) return;
			if (hasPendingActions(state)) return this.errorReply("Resolve pending choices first.");

			const parts = target.trim().split(' ');
			const fromSlot = parseInt(parts[0]) - 1;
			const toSlot = parseInt(parts[1]) - 1;

			if (isNaN(fromSlot) || isNaN(toSlot) || fromSlot < 0 || toSlot >= state.team.length) return this.errorReply("Invalid team slot.");

			const fromMon = state.team[fromSlot];
			const toMon = state.team[toSlot];
			if (!fromMon.heldItem) return this.errorReply("That Pokémon isn't holding anything.");

			const fromDexSpecies = Dex.species.get(toID(fromMon.species));
			const toDexSpecies = Dex.species.get(toID(toMon.species));

			if (fromMon.heldItem) {
				const dexOldItem = Dex.items.get(fromMon.heldItem);
				if (dexOldItem.forcedForme && fromDexSpecies.otherFormes?.includes(dexOldItem.forcedForme)) {
					fromMon.species = toID(fromDexSpecies.changesFrom ?? fromDexSpecies.baseSpecies);
				}
			}
			if (toMon.heldItem) {
				const dexOldItem = Dex.items.get(toMon.heldItem);
				if (dexOldItem.forcedForme && toDexSpecies.otherFormes?.includes(dexOldItem.forcedForme)) {
					toMon.species = toID(toDexSpecies.changesFrom ?? toDexSpecies.baseSpecies);
				}
			}

			const temp = toMon.heldItem;
			toMon.heldItem = fromMon.heldItem;
			if (temp) fromMon.heldItem = temp;
			else delete fromMon.heldItem;

			if (fromMon.heldItem) {
				const dexNewItem = Dex.items.get(fromMon.heldItem);
				if (dexNewItem.forcedForme && fromDexSpecies.otherFormes?.includes(dexNewItem.forcedForme)) {
					fromMon.species = toID(dexNewItem.forcedForme);
				}
			}
			if (toMon.heldItem) {
				const dexNewItem = Dex.items.get(toMon.heldItem);
				if (dexNewItem.forcedForme && toDexSpecies.otherFormes?.includes(dexNewItem.forcedForme)) {
					toMon.species = toID(dexNewItem.forcedForme);
				}
			}

			const fromName = Dex.species.get(toID(fromMon.species)).name;
			const toName = Dex.species.get(toID(toMon.species)).name;
			state.notification = `Swapped held items between ${fromName} and ${toName}!`;

			setState(user.id, state);
			refreshGamePage(user);
		},

		async unequip(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.battleRoomId) return;
			if (hasPendingActions(state)) return this.errorReply("Resolve pending choices first.");

			const slot = parseInt(target.trim()) - 1;
			if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid team slot.");

			const mon = state.team[slot];
			if (!mon.heldItem) return this.errorReply("That Pokémon isn't holding anything.");

			const dexOldItem = Dex.items.get(mon.heldItem);
			const dexSpecies = Dex.species.get(toID(mon.species));

			if (dexOldItem.forcedForme && dexSpecies.otherFormes?.includes(dexOldItem.forcedForme)) {
				mon.species = toID(dexSpecies.changesFrom ?? dexSpecies.baseSpecies);
			}

			delete mon.heldItem;
			state.notification = `Discarded ${dexOldItem.name} from ${dexSpecies.name}.`;

			setState(user.id, state);
			refreshGamePage(user);
		},

		async reroll(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'draft') return;
			if (hasPendingActions(state, true)) return this.errorReply("You must resolve your pending actions first.");

			const cost = getRerollCost(state.floor, state.rerollCount || 0);
			if ((state.money || 0) < cost) return this.errorReply(`Not enough money! Need $${cost}.`);

			state.money -= cost;
			state.rerollCount = (state.rerollCount || 0) + 1;
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			state.pendingRewardDraft = generateDraftOptions(state, config);

			setState(user.id, state);
			refreshGamePage(user);
		},

		async lock(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'draft') return;
			if (!state.keyItems?.['Lock Capsule']) return this.errorReply("You need the Lock Capsule to lock shop items.");

			const slot = parseInt(target.trim()) - 1;
			if (isNaN(slot) || slot < 0 || slot >= (state.pendingRewardDraft?.length || 0)) return this.errorReply("Invalid slot.");

			if (!state.lockedSlots) state.lockedSlots = [];
			state.lockedSlots[slot] = !state.lockedSlots[slot];

			setState(user.id, state);
			refreshGamePage(user);
		},

		async draft(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'draft' || !state.pendingRewardDraft) return;
			if (hasPendingActions(state, true)) return this.errorReply("You must resolve your pending actions first.");

			if (handleDraftAction(target, user, state, this)) {
				if (!state.pendingRewardDraft) delete state.lockedSlots;
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async buyshop(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.view !== 'draft') return;
			if (hasPendingActions(state, true)) return this.errorReply("You must resolve your pending actions first.");

			if (handleBuyShopAction(target, user, state, this)) {
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async resolve(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');

			const spaceIdx = target.indexOf(' ');
			const action = spaceIdx === -1 ? target.trim() : target.slice(0, spaceIdx).trim();
			const rest = spaceIdx === -1 ? '' : target.slice(spaceIdx + 1).trim();

			if (ActionResolvers[action]) {
				if (ActionResolvers[action](state, user, rest, this)) {
					setState(user.id, state);
					refreshGamePage(user);
				}
			} else {
				return this.errorReply("Unknown resolve action.");
			}
		},

		async choose(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');

			if (handleChooseAction(target, user, state, this)) {
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async catch(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state || state.gameOver) return this.errorReply("No active run.");
			if (!room?.battle) return this.errorReply("You must be in a battle to catch Pokémon.");

			handleCatchAction(target, room, user, state, this);
		},

		async prebattle(target, room, user) {
			await loadUser(user.id);
			if (!user.named) return this.errorReply("Login required.");
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("The run is over. Start a new run first.");

			clearStaleBattleRoom(state, user.id);
			if (hasPendingActions(state)) return this.errorReply("Resolve all pending choices before starting a battle.");
			if (!state.team.some(m => (m.currentHp ?? 100) > 0)) return this.errorReply("All your Pokémon have fainted! Buy a Revive from the shop before battling.");
			if (state.battleRoomId) return this.errorReply("You are already in a battle.");

			if (state.pendingTrainer && state.pendingTrainerKey) {
				state.view = 'trainer';
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

			if (config.hasTrainers && data.resolveTrainer) {
				const resolvedTrainer = data.resolveTrainer(state.floor, state, config);
				if (resolvedTrainer) {
					state.pendingTrainer = resolvedTrainer.name;
					state.pendingTrainerKey = resolvedTrainer.key;
					const trainerData = data.trainers?.[resolvedTrainer.key]?.[resolvedTrainer.name];

					if (trainerData?.spriteUrl || trainerData?.dialog) {
						state.view = 'trainer';
						setState(user.id, state);
						refreshGamePage(user);
						return;
					}
				}
			}

			setState(user.id, state);
			return this.parse('/pokerogue battle');
		},

		async battle(target, room, user) {
			await loadUser(user.id);
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("The run is over. Start a new run first.");

			clearStaleBattleRoom(state, user.id);
			if (hasPendingActions(state)) return this.errorReply("Resolve all pending choices before starting a battle.");
			if (!state.team.some(m => (m.currentHp ?? 100) > 0)) return this.errorReply("All your Pokémon have fainted! Buy a Revive from the shop before battling.");

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const isBossFloor = state.floor % config.bossInterval === 0;
			const runawayStacks = state.keyItems?.['Runaway Orb'] || 0;

			if (!isBossFloor && runawayStacks > 0) {
				const skipChance = runawayStacks * 0.10;
				if (Math.random() < skipChance) {
					state.notification = `<b>Your Runaway Orb triggered and you safely fled from the wild Pokémon!</b>`;

					for (const mon of state.team) {
						if (mon.activeBuffs) {
							for (const stat in mon.activeBuffs) {
								mon.activeBuffs[stat]--;
								if (mon.activeBuffs[stat] <= 0) delete mon.activeBuffs[stat];
							}
						}
					}

					if ((state.lureCharges ?? 0) > 0) state.lureCharges!--;

					const nextFloor = state.floor + 1;
					const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

					if (nextFloor % config.biomeRotationInterval === 1 && nextFloor > config.biomeRotationInterval) {
						if (config.lastBiome && !data.resolveBiome) {
							const range = parseFloorRange(config.lastBiome.floor);
							if (range && nextFloor >= range.start && nextFloor <= range.end) {
								state.currentBiome = config.lastBiome.biome;
							} else {
								state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
							}
						} else if (data.resolveBiome) {
							state.currentBiome = data.resolveBiome(nextFloor, state.currentBiome || config.startingBiome, config);
						} else {
							state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
						}
						state.notification += `<br><b>You entered the ${state.currentBiome} biome!</b>`;
					} else if (!state.currentBiome) {
						state.currentBiome = config.startingBiome;
					}

					state.floor = nextFloor;

					const { extraNotifs } = processFloorRewards(state, state.floor - 1, config, user.id);
					if (extraNotifs.length) {
						state.notification += '<br>' + extraNotifs.join('<br>');
					}

					state.timesRerolled = 0;
					delete state.lockedSlots;
					state.pendingRewardDraft = generateDraftOptions(state, config);
					state.rerollCount = 0;
					state.view = 'draft';

					setState(user.id, state);
					refreshGamePage(user);
					return;
				}
			}

			if (startBattle(user, state)) {
				state.view = 'main';
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		async help(target, room, user) {
			await loadUser(user.id);
			if (!this.runBroadcast()) return;
			const isStaff = user.can('lock');
			let html = `<b>PokéRogue - Player Commands:</b><br>` +
				`<code>/pokerogue start</code> - Open the game page.<br>` +
				`<code>/pokerogue battle</code> - Start floor battle.<br>` +
				`<code>/pokerogue status</code> - View run info.<br>` +
				`<code>/pokerogue view top</code> - Leaderboard.<br>` +
				`<code>/pokerogue quit</code> - Abandon run.<br>`;
			if (isStaff) {
				html += `<br><b>Staff Commands (Requires: Admin Only):</b><br>` +
					`<code>/pokerogue givemoney [user], [amount]</code> - Gives Money to a user.<br>` +
					`<code>/pokerogue removemoney [user], [amount]</code> - Removes Money from a user.<br>` +
					`<code>/pokerogue giveitem [user], [item], [amount]</code> - Gives a Pokéball or Key Item to a user.<br>` +
					`<code>/pokerogue givevoucher [user], [type], [amount]</code> - Gives Egg Vouchers to a user. Valid types: regular, plus, premium, gold.<br>` +
					`<code>/pokerogue setfloor [user], [floor]</code> - Sets the floor for a user's run.<br>` +
					`<code>/pokerogue healteam [user]</code> - Fully heals a user's team.<br>` +
					`<code>/pokerogue addmon [user], [pokemon], [level]</code> - Adds a Pokemon to a user's team.<br>` +
					`<code>/pokerogue removemon [user]</code> - Wipes a user's run data.<br>` +
					`<code>/pokerogue resetladder [user]</code> - resets only that user's highestFloor and best team.<br>` +
					`<code>/pokerogue resetladder all</code> - resets ladder fields for all users (confirmation required).`;
			}
			this.sendReplyBox(html);
		},

		...devCommands,
		'': 'help',
	},
};

export const pages: Chat.PageTable = {
	async pokerogue(args, user) {
		await loadUser(user.id);
		if (!user.named) return this.errorReply('Login required.');
		const state = getState(user.id);
		if (!state) return `<div class="pr-popup"><div class="pr-popup-header"><h2>PokéRogue</h2></div><div style="text-align:center;padding:16px"><button name="send" value="/pokerogue start" class="button">Start New Run</button></div></div>`;
		const v = state.view || 'main';
		this.title = `PokéRogue - ${v.toUpperCase()}`;

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
		const match = activeMatches.get(battle.roomid);
		if (!match) return;

		activeMatches.delete(battle.roomid);
		const botUser = Users.get(match.botUserId);
		if (botUser) destroyBotUser(botUser);

		const state = getState(match.userId);
		if (!state) return;

		const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
		const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

		const isBossFloor = match.floor % config.bossInterval === 0;
		const room = Rooms.get(battle.roomid);
		const logLines: string[] = room?.log?.log ?? [];

		const { consumedItems } = syncBattleOutcome(logLines, state);

		const battleLogMsgs: string[] = [];

		if (consumedItems.length) {
			battleLogMsgs.push(`<b>Consumed items:</b> ${consumedItems.join(', ')}`);
		}

		delete state.battleRoomId;

		if (toID(winner) === match.userId) {
			const isTrainerBattle = match.isTrainerBattle ?? false;
			const detailMsgs = processBattleExperience(logLines, state, match.floor, isBossFloor, isTrainerBattle, config);
			const prevFloor = state.floor;

			if (config.maxFloor && prevFloor >= config.maxFloor) {
				state.gameWon = true;
				state.lastRunFloor = prevFloor;
				if (prevFloor > (state.highestFloor ?? 0)) {
					state.highestFloor = prevFloor;
					state.recordTeam = state.team.map(m => ({ ...m }));
				}
				recordRunStats(match.userId, state.gameMode, prevFloor, state.team, true);

				setState(match.userId, state);
				const hUser = Users.get(match.userId);
				if (hUser) refreshGamePage(hUser);
				return;
			}

			const nextFloor = prevFloor + 1;
			if (nextFloor % config.biomeRotationInterval === 1 && nextFloor > config.biomeRotationInterval) {
				if (config.lastBiome && !data.resolveBiome) {
					const range = parseFloorRange(config.lastBiome.floor);
					if (range && nextFloor >= range.start && nextFloor <= range.end) {
						state.currentBiome = config.lastBiome.biome;
						battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
					} else {
						state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
						battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
					}
				} else if (data.resolveBiome) {
					state.currentBiome = data.resolveBiome(nextFloor, state.currentBiome || config.startingBiome, config);
					battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
				} else {
					state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
					battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
				}
			} else if (!state.currentBiome) {
				state.currentBiome = config.startingBiome;
			}

			const { extraNotifs } = processFloorRewards(state, prevFloor, config, match.userId);

			if (state.caughtPokemon) {
				const caughtMon = state.caughtPokemon;
				const spName = Dex.species.get(toID(caughtMon.species)).name;

				if (state.team.length < 6) {
					state.team.push(caughtMon);
					battleLogMsgs.push(`<b>Gotcha! ${spName} was caught and joined the team!</b>`);
				} else {
					state.pendingSwap = caughtMon;
					battleLogMsgs.push(`<b>Gotcha! ${spName} was caught! (Team full, swap pending)</b>`);
				}

				if (caughtMon.starterUnlocks && caughtMon.starterUnlocks.length > 0) {
					battleLogMsgs.push(...caughtMon.starterUnlocks);
				}

				delete state.caughtPokemon;
			}

			if (detailMsgs.length) battleLogMsgs.push(...detailMsgs);
			if (extraNotifs.length) battleLogMsgs.push(...extraNotifs);

			for (const mon of state.team) {
				if (mon.activeBuffs) {
					for (const stat in mon.activeBuffs) {
						mon.activeBuffs[stat]--;
						if (mon.activeBuffs[stat] <= 0) {
							delete mon.activeBuffs[stat];
						}
					}
				}
			}

			if ((state.lureCharges ?? 0) > 0) {
				state.lureCharges!--;
				if (state.lureCharges === 0) {
					battleLogMsgs.push(`<i>Your Lure effect has worn off.</i>`);
				} else {
					battleLogMsgs.push(`<i>Lure active for ${state.lureCharges} more battle(s).</i>`);
				}
			}

			const rewardMultiplier = isBossFloor ? 1.0 : 0.2;
			let moneyGained = getRewardMoney(prevFloor, rewardMultiplier);
			if (config.economy.moneyMultiplier !== undefined) {
				const mult = typeof config.economy.moneyMultiplier === 'function' ? config.economy.moneyMultiplier(prevFloor) : config.economy.moneyMultiplier;
				moneyGained = Math.floor(moneyGained * mult);
			}

			const amuletCoinStacks = state.keyItems?.['Amulet Coin'] || 0;
			if (amuletCoinStacks > 0) {
				moneyGained = Math.floor(moneyGained * (1 + 0.20 * amuletCoinStacks));
			}

			state.money = (state.money ?? 0) + moneyGained;
			battleLogMsgs.push(`<div style="color:#fac000; font-weight:bold;">Earned $${moneyGained}!</div>`);

			state.displayName = Users.get(match.userId)?.name || match.userId;
			state.timesRerolled = 0;

			delete state.lockedSlots;
			state.pendingRewardDraft = generateDraftOptions(state, config);

			state.rerollCount = 0;
			state.view = 'draft';
		} else {
			handleBattleLoss(state, match.floor, match.userId);
		}

		if (battleLogMsgs.length > 0 && room) {
			const infoboxHtml = `<div class="pr" style="background:transparent; border:none; min-height:0; max-width:100%; margin:4px 0;">` +
				`<div class="pr-card" style="margin: 0; padding: 10px 14px;">` +
				`<div class="pr-choice-heading" style="font-size: 14px; margin-bottom: 6px; text-align: center;">Floor ${match.floor} - Battle Report</div>` +
				`<div style="font-size: 12px; line-height: 1.55;">${battleLogMsgs.join('<br>')}</div>` +
				`</div></div>`;

			room.add(`|html|${infoboxHtml}`).update();
		}

		setState(match.userId, state);
		const hUser = Users.get(match.userId);
		if (hUser) refreshGamePage(hUser);
	},
};
