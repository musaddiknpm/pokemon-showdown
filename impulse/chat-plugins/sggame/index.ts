import { Database } from './database';
import { SGUtils } from './pokemon';
import { SGBattle } from './battle';
import { SGRenderer } from './render';
import { Utils } from '../../../lib';
import { UtilityBattleResolver } from '../../utils/battle';
import { calculateCatchShakes } from '../../utils/catch';
import { SGItems } from './items';
import { getLevelUpEvo } from '../../utils/evolutions';
import { expForLevel, getExpType } from '../../utils/exp';
import { getMovesLearnedBetween } from '../../utils/moves';

const WildEncounters = new Map<string, any>();
import { SGTimeouts } from './database';

function scheduleDismiss(user: User, room: Room | null, screen: string, context: any) {
	if (SGTimeouts.has(user.id)) clearTimeout(SGTimeouts.get(user.id)!);
	SGTimeouts.set(user.id, setTimeout(() => {
		const player = Database.load(user.id);
		if (player) {
			player.lastMessage = undefined;
			const msg = `|uhtmlchange|sggame|${SGRenderer.renderUI(player, screen, context)}`;
			if (room) user.sendTo(room, msg);
			else user.send(msg);
		}
	}, 3000));
}

export const commands: Chat.ChatCommands = {
	sg: 'sggame',
	sggame: {
		''(target, room, user) {
			let player = Database.load(user.id);
			if (!player) {
				player = Database.create(user.id);
			}
			
			if (player.introState === 0) {
				player.introState = 1;
				Database.save(user.id, player);
				return this.sendReply(`|uhtml|sggame|${SGRenderer.renderUI(player, 'intro')}`);
			} else if (player.introState === 1) {
				return this.sendReply(`|uhtml|sggame|${SGRenderer.renderUI(player, 'intro')}`);
			} else if (player.introState === 2) {
				return this.sendReply(`|uhtml|sggame|${SGRenderer.renderUI(player, 'pick_starter')}`);
			}
			
			this.sendReply(`|uhtml|sggame|${SGRenderer.renderUI(player, 'home')}`);
		},
		
		dismissmsg(target, room, user) {
			const player = Database.load(user.id);
			if (!player) return;
			const targetParts = target.split('|');
			const screen = targetParts[0] || 'home';
			let context = undefined;
			if (targetParts[1]) {
				try { context = JSON.parse(targetParts[1].replace(/&quot;/g, '"')); } catch (e) {}
			}
			player.lastMessage = undefined;
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, screen, context)}`);
		},
		
		home(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'home')}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'home', undefined);
		},
		
		pc(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			if (!player.pc) player.pc = [];
			
			const args = target.split(' ').map(x => x.trim());
			const action = args[0] || 'box';
			
			let context: any = { box: 0 };
			
			if (action === 'box') {
				context.box = parseInt(args[1]) || 0;
			} else if (action === 'select') {
				const source = args[1]; // 'party' or 'pc'
				const index = parseInt(args[2]);
				
				// Calculate which box this PC index is in
				if (source === 'pc' && !isNaN(index)) {
					context.box = Math.floor(index / 30);
				}
				context.selected = { source, index };
			} else if (action === 'release') {
				const source = args[1]; // 'party' or 'pc'
				const index = parseInt(args[2]);
				if (source === 'party') {
					if (player.party.length <= 1) {
						player.lastMessage = "You cannot release your last Pokemon!";
					} else 
					{
							player.lastMessage = `Released ${Dex.species.get(player.party[index].species).name}! Bye bye!`;
							player.party.splice(index, 1);
						}
				} else if (source === 'pc') {
					player.lastMessage = `Released ${Dex.species.get(player.pc[index].species).name}! Bye bye!`;
						player.pc.splice(index, 1);
					context.box = Math.floor(index / 30);
				}
				Database.save(user.id, player);
			} else if (action === 'deposit') {
				const index = parseInt(args[1]);
				if (player.party.length <= 1) {
						player.lastMessage = "You cannot deposit your last Pokemon!";
					} else 
				if (player.party[index]) {
					player.lastMessage = `Deposited ${Dex.species.get(player.party[index].species).name} in Box ${Math.floor(player.pc.length / 30) + 1}!`;
						player.pc.push(player.party[index]);
					player.party.splice(index, 1);
					Database.save(user.id, player);
				}
			} else if (action === 'withdraw') {
				const index = parseInt(args[1]);
				if (player.party.length >= 6) {
						player.lastMessage = "Your party is full!";
					} else 
				if (player.pc[index]) {
					player.lastMessage = `Withdrew ${Dex.species.get(player.pc[index].species).name}!`;
						player.party.push(player.pc[index]);
					player.pc.splice(index, 1);
					Database.save(user.id, player);
					context.box = Math.floor(index / 30);
				}
			}
			
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'pc', context)}`);
				if (player.lastMessage) scheduleDismiss(user, room, 'pc', context);
		},
		
		pickstarter(target, room, user) {
			let player = Database.load(user.id);
			if (!player || player.introState !== 1) return this.errorReply("You cannot do this right now.");
			
			player.introState = 2;
			Database.save(user.id, player);
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'pick_starter')}`);
		},
		
		starter(target, room, user) {
			let player = Database.load(user.id);
			if (!player || player.introState !== 2) return this.errorReply("You cannot do this right now.");
			
			const choice = toID(target);
			if (!['bulbasaur', 'charmander', 'squirtle'].includes(choice)) {
				return this.errorReply("Invalid starter choice.");
			}
			
			const starter = SGUtils.generateWild(choice, 5);
			player.party.push(starter);
			player.introState = 3;
			Database.save(user.id, player);
			
			player.lastMessage = `You chose ${Dex.species.get(choice).name}! Good luck on your adventure!`; Database.save(user.id, player);
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'home')}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'home', undefined);
		},
		
		party(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			const args = target.split(' ').map(x => x.trim());
			const action = args[0] || 'list';
			
			let context: any = {};
			
			if (action === 'select') {
				const index = parseInt(args[1]);
				if (!isNaN(index) && player.party[index]) {
					context.selected = index;
				}
			} else if (action === 'move') {
				// /sg party move [from] [to]
				const from = parseInt(args[1]);
				const to = parseInt(args[2]);
				
				if (!isNaN(from) && !isNaN(to) && player.party[from]) {
					const temp = player.party[from];
					player.party[from] = player.party[to];
					player.party[to] = temp;
					
					// Compact the array to remove holes if they moved to an empty slot
					player.party = player.party.filter(p => p !== undefined);
					
					Database.save(user.id, player);
					context.selected = Math.min(to, player.party.length - 1);
				} else if (!isNaN(from) && isNaN(to) && player.party[from]) {
					context.moving = from;
				}
			} else if (action === 'takeitem') {
				const targetIdx = parseInt(args[1]);
				if (!isNaN(targetIdx) && player.party[targetIdx]) {
					const p = player.party[targetIdx];
					if (p.item) {
						if (!player.bag[p.item]) player.bag[p.item] = 0;
						player.bag[p.item]++;
						const itemName = (Dex.items.get(p.item).exists ? Dex.items.get(p.item).name : (SGItems[p.item]?.name || p.item));
						p.item = undefined;
						
						player.lastMessage = `Took the ${itemName} from ${Dex.species.get(p.species).name}!`;
						Database.save(user.id, player);
					}
					context.selected = targetIdx;
				}
			}
			
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'party', context)}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'party', context);
		},
		
		bag(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			const args = target.split(' ').map(s => s.trim());
			const action = args[0] || 'view';
			let context: any = { category: 'Pokeballs' }; // default
			
			if (action === 'cat') {
				context.category = args.slice(1).join(' ') || 'Pokeballs';
			} else if (action === 'use') {
				const item = args[1];
				const targetIdx = parseInt(args[2]);
				const itemData = SGItems[item];
				
				if (!player.bag[item] || player.bag[item] <= 0) return this.errorReply("You don't have that item!");
				
				if (itemData && (itemData.category === 'Medicine' || itemData.category === 'TMs')) {
					if (isNaN(targetIdx)) {
						// Open party selection mode
						context.category = itemData.category;
						context.usingItem = item;
					} else {
						// Apply item
						const p = player.party[targetIdx];
						if (!p) return this.errorReply("Invalid Pokemon slot.");
						
						if (itemData.category === 'TMs') {
							const moveId = itemData.moveId;
							if (!moveId) return this.errorReply("This TM has no associated move.");
							// TMs are reusable in modern games, so we do NOT subtract from player.bag
							
							player.pendingMoves = player.pendingMoves || [];
							player.pendingMoves.push({ partyIndex: targetIdx, move: moveId });
							Database.save(user.id, player);
							
							return this.parse('/sg continue');
						}
						
						if (itemData.revive) {
							if (p.hp > 0) {
								this.errorReply(`${Dex.species.get(p.species).name} is not fainted!`);
								context.category = itemData.category;
								context.usingItem = item;
							} else {
								const healAmt = Math.floor(p.maxHp * ((itemData.healPct || 50) / 100));
								p.hp = healAmt;
								p.status = ''; // Fainted status is cleared
								player.bag[item]--;
								Database.save(user.id, player);
								context.category = itemData.category;
								player.lastMessage = `Revived ${Dex.species.get(p.species).name}!`; Database.save(user.id, player);
							}
						} else {
							if (p.hp <= 0) {
								this.errorReply(`${Dex.species.get(p.species).name} is fainted and cannot be healed by this item.`);
								context.category = itemData.category;
								context.usingItem = item;
							} else {
								let canCure = false;
								if (itemData.cureStatus && p.status) {
									if (itemData.cureStatus === true) canCure = true;
									else if (typeof itemData.cureStatus === 'string') canCure = (p.status === itemData.cureStatus);
									else if (Array.isArray(itemData.cureStatus)) canCure = itemData.cureStatus.includes(p.status);
								}
								
								const healsHp = !!itemData.healPct;
								const canHealHp = healsHp && p.hp < p.maxHp;
								
								if (!canHealHp && !canCure) {
									if (!healsHp) {
										this.errorReply(`It won't have any effect.`);
									} else {
										this.errorReply(`${Dex.species.get(p.species).name} is already at full health!`);
									}
									context.category = itemData.category;
									context.usingItem = item;
								} else {
									// Apply healing
									if (canHealHp && itemData.healPct) {
										const healAmt = Math.floor(p.maxHp * (itemData.healPct / 100));
										p.hp = Math.min(p.maxHp, p.hp + healAmt);
									}
									if (canCure) {
										p.status = '';
									}
									player.bag[item]--;
									Database.save(user.id, player);
									
									context.category = itemData.category;
									player.lastMessage = `Used ${(Dex.items.get(itemId).exists ? Dex.items.get(itemId).name : itemData.name)} on ${Dex.species.get(p.species).name}!`; Database.save(user.id, player);
								}
							}
						}
					}
				} else {
					context.category = itemData ? itemData.category : 'Pokeballs';
					this.errorReply(`You can't use a ${itemData?.name || item} right now!`);
				}
			} else if (action === 'give') {
				const item = args[1];
				const targetIdx = parseInt(args[2]);
				const itemData = SGItems[item];
				
				if (!player.bag[item] || player.bag[item] <= 0) return this.errorReply("You don't have that item!");
				
				if (itemData && itemData.category === 'Held Items') {
					if (isNaN(targetIdx)) {
						context.category = itemData.category;
						context.usingItem = item;
					} else {
						const p = player.party[targetIdx];
						if (!p) return this.errorReply("Invalid Pokemon slot.");
						
						if (p.item) {
							if (!player.bag[p.item]) player.bag[p.item] = 0;
							player.bag[p.item]++;
						}
						p.item = item;
								player.bag[item]--;
						
						context.category = itemData.category;
						player.lastMessage = `Gave ${(Dex.items.get(itemId).exists ? Dex.items.get(itemId).name : itemData.name)} to ${Dex.species.get(p.species).name}!`; 
						Database.save(user.id, player);
					}
				}
			}
			
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'bag', context)}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'bag', context);
		},
		
		heal(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			player.party.forEach(p => SGUtils.heal(p));
			Database.save(user.id, player);
			
			player.lastMessage = `Your Pokemon have been fully healed!`; Database.save(user.id, player);
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'home')}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'home', undefined);
		},
		
		wild(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			const speciesList = ['pidgey', 'rattata', 'caterpie', 'weedle', 'sentret', 'hoothoot'];
			const wildSpecies = Utils.randomElement(speciesList);
			const wildLevel = Math.floor(Math.random() * 4) + 2;
			
			const wildPoke = SGUtils.generateWild(wildSpecies, wildLevel);
			WildEncounters.set(user.id, wildPoke);
			
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'wild', { enemy: wildPoke })}`);
		},
		
		battle(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			const wildPoke = WildEncounters.get(user.id);
			if (!wildPoke) return this.errorReply("There is no wild Pokemon to battle!");
			
			WildEncounters.delete(user.id);
			
			const allFainted = player.party.every(p => p.hp <= 0);
			if (allFainted) return this.errorReply("Your party has no healthy Pokemon!");
			
			SGBattle.startWildEncounter(user, player, wildPoke, room?.roomid || '');
		},
		
		catch(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			const battleRoom = room;
			if (!battleRoom || !battleRoom.battle) return this.errorReply("You must use this in a battle room!");
			
			const match = UtilityBattleResolver.activeMatches.get(battleRoom.roomid);
			if (!match || match.userId !== user.id) return this.errorReply("This is not your battle!");
			if (!match.matchContext || match.matchContext.type !== 'wild') return this.errorReply("You can only catch wild Pokemon!");
			
			const wildPoke = match.matchContext.wildPoke;
			const ball = toID(target) || 'pokeball';
			
			if (!player.bag[ball] || player.bag[ball] <= 0) return this.errorReply(`You don't have any ${ball}s!`);
			
			player.bag[ball]--;
			Database.save(user.id, player);
			
			const turn = (battleRoom as any).lastCatchTurn || 1;
			battleRoom.add(`|uhtmlchange|catchmenu-${turn}|${SGBattle.renderCatchUI(player)}`);
			
			const state = UtilityBattleResolver.parseBattleState(battleRoom.log?.log || [], player.party);
			const enemyState = state.p2Active.values().next().value;
			if (!enemyState || enemyState.fainted) return this.errorReply("The wild Pokemon has fainted!");
			
			const shakes = calculateCatchShakes(wildPoke.species, enemyState.hp, enemyState.maxHp, enemyState.status, ball);
			const itemName = SGItems[ball]?.name || ball;
			
			battleRoom.add(`|c|~|${user.name} threw a ${itemName}!`);
			
			if (shakes === 3) {
				battleRoom.add(`|c|~|Gotcha! ${Dex.species.get(wildPoke.species).name} was caught!`);
				
				if (player.party.length < 6) {
					player.party.push(wildPoke);
				} else {
					if (!player.pc) player.pc = [];
					player.pc.push(wildPoke);
					battleRoom.add(`|c|~|${Dex.species.get(wildPoke.species).name} was sent to the PC!`);
				}
				
				Database.save(user.id, player);
				if (match.matchContext) { match.matchContext.caught = true; if (player.pc.includes(wildPoke)) match.matchContext.sentToPC = true; }
				
				// Manually emit EXP_GAIN for caught pokemon
				const log = battleRoom.log?.log || [];
				const p1Participants = new Set<string>();
				let p2SwitchIdx = 0;
				for (let i = log.length - 1; i >= 0; i--) {
					if (/^\|(?:switch|drag)\|p2[a-z]:/.test(log[i])) { p2SwitchIdx = i; break; }
				}
				for (let i = p2SwitchIdx; i >= 0; i--) {
					const m = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
					if (m) { p1Participants.add(toID(m[1])); break; }
				}
				for (let i = p2SwitchIdx; i < log.length; i++) {
					const m = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
					if (m) p1Participants.add(toID(m[1]));
				}
				const participantsStr = Array.from(p1Participants).join(',');
				battleRoom.add(`|-message|EXP_GAIN|${wildPoke.species}|${wildPoke.level}|${participantsStr}`);
				battleRoom.update();
				
				battleRoom.battle.forfeit(match.botUserId);
			} else {
				battleRoom.add(`|c|~|The Pokemon broke free! (Shakes: ${shakes})`);
				void battleRoom.battle.stream.write('>p1 pass');
			}
		},
		
		confirmreset(target, room, user) {
			let player = Database.load(user.id);
			if (!player) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'confirmreset')}`);
		},
		
		reset(target, room, user) {
			let player = Database.load(user.id);
			if (!player) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			player = Database.create(user.id);
			player.introState = 1;
			Database.save(user.id, player);
			
			player.lastMessage = `Your SpacialGaze progress has been completely reset.`; Database.save(user.id, player);
			this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'intro')}`);
			if (player.lastMessage) scheduleDismiss(user, room, 'intro', undefined);
		},
		continue(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			if (player.pendingEvolutions && player.pendingEvolutions.length > 0) {
				const ev = player.pendingEvolutions[0];
				this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'evolution', ev)}`);
				if (player.lastMessage) scheduleDismiss(user, room, 'evolution', ev);
			} else if (player.pendingMoves && player.pendingMoves.length > 0) {
				const pm = player.pendingMoves[0];
				this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'learnmove', pm)}`);
				if (player.lastMessage) scheduleDismiss(user, room, 'learnmove', pm);
			} else {
				this.parse('/sg home');
			}
		},
		
		evolve(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			if (!player.pendingEvolutions || player.pendingEvolutions.length === 0) {
				return this.parse('/sg continue');
			}
			
			const ev = player.pendingEvolutions.shift();
			const p = player.party[ev!.partyIndex];
			const action = toID(target);
			
			if (action === 'confirm') {
				const oldName = Dex.species.get(p.species).name.toUpperCase();
				p.species = ev!.evoSpecies;
				
				const newDex = Dex.species.get(p.species);
				const baseHp = newDex.baseStats.hp;
				const newMaxHp = Math.floor((2 * baseHp * p.level) / 100) + p.level + 10;
				const hpDiff = newMaxHp - p.maxHp;
				p.maxHp = newMaxHp;
				if (p.hp > 0) p.hp += hpDiff;
				
				const evoMoves = getMovesLearnedBetween(p.species, p.level, p.level, true);
				for (const move of evoMoves) {
					if (!p.moves.includes(move)) {
						if (p.moves.length < 4) {
							p.moves.push(move);
						} else {
							if (!player.pendingMoves) player.pendingMoves = [];
							player.pendingMoves.push({ partyIndex: ev!.partyIndex, move });
						}
					}
				}
				
				Database.save(user.id, player);
				
				this.sendReply(`|uhtmlchange|sggame|${SGRenderer.renderUI(player, 'evolved', { oldName, newName: newDex.name.toUpperCase(), species: p.species })}`);
			} else {
				Database.save(user.id, player);
				this.parse('/sg continue');
			}
		},
		
		learnmove(target, room, user) {
			const player = Database.load(user.id);
			if (!player || player.introState < 3) return this.errorReply("You haven't started your SpacialGaze adventure yet!");
			
			if (!player.pendingMoves || player.pendingMoves.length === 0) {
				return this.parse('/sg continue');
			}
			
			const pm = player.pendingMoves[0];
			const p = player.party[pm.partyIndex];
			const actionParts = target.split(',').map(s => s.trim());
			const action = toID(actionParts[0]);
			
			if (action === 'cancel') {
				player.pendingMoves.shift();
				Database.save(user.id, player);
				return this.parse('/sg continue');
			} else if (action === 'replace') {
				const slot = parseInt(actionParts[1]);
				if (!isNaN(slot) && slot >= 0 && slot < p.moves.length) {
					const oldMove = p.moves[slot];
					p.moves[slot] = pm.move;
					player.pendingMoves.shift();
					Database.save(user.id, player);
					player.lastMessage = `${Dex.species.get(p.species).name.toUpperCase()} forgot ${Dex.moves.get(oldMove).name} and learned ${Dex.moves.get(pm.move).name}!`; Database.save(user.id, player);
					return this.parse('/sg continue');
				}
			}
			return this.parse('/sg continue');
		},
	},
	sgdev: {
		giveitembag: 'additem',
		additem(target, room, user) {
			const [targetUser, itemId, amountStr] = target.split(',').map(s => s.trim());
			if (!targetUser || !itemId) return this.errorReply("Usage: /sgdev additem [user], [item], [amount]");
			
			const targetId = toID(targetUser);
			const player = Database.load(targetId);
			if (!player) return this.errorReply(`No save found for user ${targetUser}.`);
			
			const itemData = SGItems[itemId];
			if (!itemData) return this.errorReply(`Item '${itemId}' not found in SGItems.`);
			
			let amount = parseInt(amountStr) || 1;
			if (amount < 1) amount = 1;
			
			if (!player.bag) player.bag = {};
			if (!player.bag[itemId]) player.bag[itemId] = 0;
			
			player.bag[itemId] += amount;
			Database.save(targetId, player);
			
			this.sendReply(`Added ${amount} ${(Dex.items.get(itemId).exists ? Dex.items.get(itemId).name : itemData.name)} to ${targetUser}'s bag.`);
		},
		givemon: 'addmon',
		addmon(target, room, user) {
			const [targetUser, pokemonId, levelStr] = target.split(',').map(s => s.trim());
			if (!targetUser || !pokemonId) return this.errorReply("Usage: /sgdev addmon [user], [pokemon], [level]");
			
			const targetId = toID(targetUser);
			const player = Database.load(targetId);
			if (!player) return this.errorReply(`No save found for user ${targetUser}.`);
			
			const species = Dex.species.get(pokemonId);
			if (!species.exists) return this.errorReply(`Pokemon '${pokemonId}' not found.`);
			
			const level = parseInt(levelStr) || 5;
			if (level < 1 || level > 100) return this.errorReply("Level must be between 1 and 100.");
			
			const moves = getMovesLearnedBetween(species.id, 0, level).slice(-4);
			const newMon = {
				species: species.id,
				level: level,
				exp: expForLevel(level, getExpType(species.id)),
				hp: species.baseStats.hp, // Note: Should probably calc actual HP, but this is a dev command
				maxHp: species.baseStats.hp,
				status: '',
				moves: moves,
			};
			
			// Actually calc max hp properly
			const hpBase = species.baseStats.hp;
			newMon.maxHp = Math.floor(0.01 * (2 * hpBase + 31 + Math.floor(0.25 * 0)) * level) + level + 10;
			newMon.hp = newMon.maxHp;
			
			if (player.party.length < 6) {
				player.party.push(newMon);
				this.sendReply(`Added ${species.name} Lv${level} to ${targetUser}'s party.`);
			} else {
				if (!player.pc) player.pc = [];
				player.pc.push(newMon);
				this.sendReply(`Added ${species.name} Lv${level} to ${targetUser}'s PC.`);
			}
			
			Database.save(targetId, player);
		},
		
		giveexp(target, room, user) {
			const [idxStr, expStr] = target.split(',').map(s => s.trim());
			const player = Database.load(user.id);
			if (!player) return this.errorReply("No save found.");
			
			const targetIdx = parseInt(idxStr) - 1;
			if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= player.party.length) return this.errorReply("Invalid party index (use 1-6).");
			
			const expAmount = parseInt(expStr);
			if (isNaN(expAmount) || expAmount <= 0) return this.errorReply("Invalid EXP amount.");
			
			const p = player.party[targetIdx];
			const oldLevel = p.level;
			const pendingMovesOut: string[] = [];
			const msgs = SGUtils.giveExp(p, expAmount, pendingMovesOut);
			
			if (pendingMovesOut.length > 0) {
				if (!player.pendingMoves) player.pendingMoves = [];
				for (const move of pendingMovesOut) {
					player.pendingMoves.push({ partyIndex: targetIdx, move });
				}
				msgs.push(`(Move learning pending! Use /sg continue)`);
			}
			
			const leveledUp = p.level > oldLevel;
			if (leveledUp) {
				const evo = getLevelUpEvo(p.species);
				if (evo && p.level >= evo.evoLevel && p.item !== 'eviolite' && p.item !== 'everstone') {
					if (!player.pendingEvolutions) player.pendingEvolutions = [];
					player.pendingEvolutions.push({ partyIndex: targetIdx, evoSpecies: evo.evoTo });
					msgs.push(`(Evolution pending! Use /sg continue)`);
				}
			}
			
			Database.save(user.id, player);
			player.lastMessage = `${msgs.join(' ')}`; Database.save(user.id, player);
			return this.parse('/sg continue');
		},
		giveitem(target, room, user) {
			const [idxStr, item] = target.split(',').map(s => s.trim());
			const player = Database.load(user.id);
			if (!player) return this.errorReply("No save found.");
			
			const targetIdx = parseInt(idxStr) - 1;
			if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= player.party.length) return this.errorReply("Invalid party index (use 1-6).");
			
			player.party[targetIdx].item = toID(item);
			Database.save(user.id, player);
			player.lastMessage = `Gave ${player.party[targetIdx].species} a ${item}.`; Database.save(user.id, player);
			return this.parse('/sg party');
		},
	},
};

export const handlers: Chat.Handlers = {
	onBattleEnd(battle, winner, players) {
		const match = UtilityBattleResolver.activeMatches.get(battle.roomid);
		if (!match) return; // not a utility match
		
		UtilityBattleResolver.activeMatches.delete(battle.roomid);
		const botUser = Users.get(match.botUserId);
		if (botUser) UtilityBattleResolver.destroyBotUser(botUser);
		
		const player = Database.load(match.userId);
		if (!player) return; // player not found?
		
		const room = Rooms.get(battle.roomid);
		const logLines: string[] = room?.log?.log ?? [];
		require("fs").writeFileSync("last_battle_log.txt", logLines.join("\n"));
		
		const state = UtilityBattleResolver.parseBattleState(logLines, player.party);
		
		for (let i = 0; i < player.party.length; i++) {
			const hpPct = state.p1TeamHp[i];
			const status = state.p1TeamStatus[i];
			if (hpPct !== undefined) {
				if (state.p1FaintedIndices.has(i) || hpPct <= 0) {
					player.party[i].hp = 0;
				} else {
					player.party[i].hp = Math.max(1, Math.round(player.party[i].maxHp * (hpPct / 100)));
				}
			}
			if (status !== undefined) player.party[i].status = status;
		}
		
		// Parse EXP_GAIN messages from the EXP Gain Mod
		const battleReport: string[] = [];
		const leveledUpIndices = new Set<number>();
		const expMessages = logLines.filter(l => l.startsWith('|-message|EXP_GAIN|'));
		const pendingMoves = [];
		for (const expMsg of expMessages) {
			const parts = expMsg.split('|');
			const defeatedSpecies = parts[3];
			const defeatedLevel = parseInt(parts[4]) || 1;
			const participants = parts[5] ? parts[5].split(',') : [];
			
			const expGained = Math.floor((Dex.species.get(defeatedSpecies).baseStats.hp * defeatedLevel) / 5);
			
			for (let i = 0; i < player.party.length; i++) {
				const p = player.party[i];
				if (p.hp > 0) {
					const isParticipant = participants.includes(p.species);
					const hasExpAll = player.bag && player.bag['expall'];
					if (isParticipant || hasExpAll) {
						const actualExp = isParticipant ? expGained : Math.floor(expGained / 2);
						if (actualExp > 0) {
							const oldLevel = p.level;
							const pendingMovesOut: string[] = [];
							const msgs = SGUtils.giveExp(p, actualExp, pendingMovesOut);
							
							for (const move of pendingMovesOut) pendingMoves.push({ partyIndex: i, move });
							
							if (p.level > oldLevel) leveledUpIndices.add(i);
							if (!isParticipant && msgs.length > 0) {
								msgs[0] = msgs[0] + ' (Exp. All)';
							}
							battleReport.push(...msgs);
							if (room) {
								for (const msg of msgs) room.add(`|c|~|${msg}`);
							}
						}
					}
				}
			}
		}
		
		if (pendingMoves.length > 0) {
			player.pendingMoves = pendingMoves;
		}
		
		const pendingEvolutions = [];
		for (const idx of Array.from(leveledUpIndices)) {
			const p = player.party[idx];
			if (p.item === 'eviolite' || p.item === 'everstone') continue;
			const evo = getLevelUpEvo(p.species); // We pass default happiness of 70 inside getLevelUpEvo
			if (evo && p.level >= evo.evoLevel) {
				pendingEvolutions.push({ partyIndex: idx, evoSpecies: evo.evoTo });
			}
		}
		if (pendingEvolutions.length > 0) {
			player.pendingEvolutions = pendingEvolutions;
		}
		
		Database.save(player.userid, player);
		if (room) room.update();
		
		if (match.matchContext && match.matchContext.type === 'wild') {
			match.matchContext.battleReport = battleReport;
			const uobj = Users.get(match.userId);
			if (uobj) {
				let screen = 'defeat';
				if (match.matchContext.caught) {
					screen = 'caught';
				} else if (winner && toID(winner) === match.userId) {
					screen = 'victory';
				}
				
				const ui = SGRenderer.renderUI(player, screen, match.matchContext);
				const sRoom = Rooms.get(match.matchContext.sourceRoomId);
				if (sRoom) {
					uobj.sendTo(sRoom, `|uhtmlchange|sggame|${ui}`);
				} else {
					uobj.send(`|uhtmlchange|sggame|${ui}`);
				}
			}
		}
	}
};
