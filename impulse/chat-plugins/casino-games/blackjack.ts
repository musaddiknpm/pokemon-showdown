import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM, Suit, Rank, Card, SUITS, RANKS, renderHand } from './shared';

const LOBBY_TIMEOUT = 60 * 1000;
const TURN_TIMEOUT = 15 * 1000;



interface Player {
	id: string;
	name: string;
	hand: Card[];
	status: 'playing' | 'stood' | 'busted' | 'blackjack';
	bet: number;
	payoutStr?: string;
}

interface BlackjackGame {
	roomid: string;
	uid: string;
	host: string;
	hostName: string;
	bet: number;
	state: 'lobby' | 'playing' | 'ended';
	players: Player[];
	dealerHand: Card[];
	turnIndex: number;
	timer: NodeJS.Timeout | null;
}

const activeGames = new Map<string, BlackjackGame>();



function drawCard(): Card {
	const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
	const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
	let value = parseInt(rank);
	if (isNaN(value)) {
		value = rank === 'A' ? 11 : 10;
	}
	return { suit, rank, value };
}

function calculateHandValue(hand: Card[]): number {
	let total = 0;
	let aces = 0;
	for (const card of hand) {
		total += card.value;
		if (card.rank === 'A') aces++;
	}
	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	return total;
}



async function refundAll(game: BlackjackGame, message: string) {
	for (const p of game.players) {
		await updateBalance(p.id, p.bet);
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="casino-board">` +
			`<div class="casino-header">Blackjack Game Cancelled</div><hr>` +
			`${message}<br>All players have been refunded.` +
			`</div>`
		).update();
	}
}

async function nextTurn(game: BlackjackGame) {
	if (game.state !== 'playing') return;

	if (game.timer) {
		clearTimeout(game.timer);
		game.timer = null;
	}

	while (game.turnIndex < game.players.length) {
		const p = game.players[game.turnIndex];
		if (p.status === 'playing') {
			game.timer = setTimeout(() => {
				p.status = 'stood';
				void nextTurn(game);
			}, TURN_TIMEOUT);
			updateRoom(game);
			return;
		}
		game.turnIndex++;
	}

	await dealerTurn(game);
}

async function dealerTurn(game: BlackjackGame) {
	game.state = 'ended';

	let allBusted = true;
	for (const p of game.players) {
		if (p.status !== 'busted') {
			allBusted = false;
			break;
		}
	}

	if (!allBusted) {
		let dealerVal = calculateHandValue(game.dealerHand);
		while (dealerVal < 17) {
			game.dealerHand.push(drawCard());
			dealerVal = calculateHandValue(game.dealerHand);
		}
	}

	const dealerVal = calculateHandValue(game.dealerHand);
	const dealerBusted = dealerVal > 21;

	for (const p of game.players) {
		if (p.status === 'busted') {
			p.payoutStr = `<span style="color:red">Lost (Bust)</span>`;
		} else if (p.status === 'blackjack') {
			if (game.dealerHand.length === 2 && dealerVal === 21) {
				await updateBalance(p.id, p.bet);
				p.payoutStr = `<span style="color:gray">Push (Tie)</span>`;
			} else {
				const winAmount = Math.floor(p.bet * 2.5);
				await updateBalance(p.id, winAmount);
				p.payoutStr = `<span style="color:green">Won <b>${winAmount}</b> (Blackjack!)</span>`;
			}
		} else {
			const pVal = calculateHandValue(p.hand);
			if (dealerBusted) {
				const winAmount = p.bet * 2;
				await updateBalance(p.id, winAmount);
				p.payoutStr = `<span style="color:green">Won <b>${winAmount}</b> (Dealer bust)</span>`;
			} else {
				if (pVal > dealerVal) {
					const winAmount = p.bet * 2;
					await updateBalance(p.id, winAmount);
					p.payoutStr = `<span style="color:green">Won <b>${winAmount}</b></span>`;
				} else if (pVal === dealerVal) {
					await updateBalance(p.id, p.bet);
					p.payoutStr = `<span style="color:gray">Push (Tie)</span>`;
				} else {
					p.payoutStr = `<span style="color:red">Lost</span>`;
				}
			}
		}
	}

	activeGames.delete(game.roomid);
	activeCasinoGames.delete(game.roomid);
	updateRoom(game);
}

function getBoardHtml(game: BlackjackGame, userId: string | null): string {
	let html = `<div class="casino-board">`;
	html += `<div class="casino-header">Blackjack <small>(Bet: <b>${game.bet}</b> ${CURRENCY_NAME})</small></div>`;
	html += `Host: ${nameColor(game.hostName, true)}<hr>`;
	
	if (game.state === 'lobby') {
		html += `<div class="casino-player-list">`;
		if (game.players.length === 0) {
			html += `<i>No players yet</i>`;
		} else {
			for (const p of game.players) {
				html += `<div class="casino-player-badge"><span class="casino-player-name">${nameColor(p.name, true)}</span>Waiting...</div>`;
			}
		}
		html += `</div><hr>`;
		html += `<div>`;
		if (game.players.length < 4 && (!userId || !game.players.some(p => p.id === userId))) {
			html += `<button class="button casino-btn" name="send" value="/bj join">Join Game</button> `;
		}
		if (userId === game.host) {
			html += `<button class="button casino-btn" name="send" value="/bj deal">Deal (Host)</button> `;
			html += `<button class="button casino-btn" name="send" value="/bj end">Cancel Game</button>`;
		}
		html += `</div>`;
		html += `<br><small>This game will automatically start in 60 seconds.</small>`;
	} else {
		const hideFirst = game.state === 'playing';
		const dealerVal = hideFirst ? '?' : calculateHandValue(game.dealerHand);
		
		if (game.state === 'ended') {
			html += `<div style="padding: 4px; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 6px;">`;
			html += `<b>Dealer's Hand:</b> <small>[${dealerVal}]</small> ${renderHand(game.dealerHand, hideFirst, true)}`;
			html += `</div>`;
			
			html += `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 8px;">`;
			for (let i = 0; i < game.players.length; i++) {
				const p = game.players[i];
				const val = calculateHandValue(p.hand);
				let statusStr = `<small>[${val}]</small> `;
				if (p.status === 'blackjack') { statusStr += '<b style="color:#4CAF50;">BJ</b>'; }
				else if (p.status === 'busted') { statusStr += '<b style="color:#F44336;">Bust</b>'; }
				else if (p.status === 'stood') { statusStr += '<b style="color:#aaa;">Stood</b>'; }
				
				html += `<div style="flex: 1 1 45%; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 4px; border-left: 2px solid #FFC107;">`;
				html += `<b>${nameColor(p.name, true)}</b>: ${statusStr} ${renderHand(p.hand, false, true)}`;
				if (p.payoutStr) html += ` <small>${p.payoutStr}</small>`;
				html += `</div>`;
			}
			html += `</div>`;
			
			let winners = [];
			for (const p of game.players) {
				if (p.payoutStr && p.payoutStr.includes('Won')) {
					const amtMatch = p.payoutStr.match(/Won <b>(\d+)<\/b>/);
					const amt = amtMatch ? amtMatch[1] : '0';
					winners.push({ name: p.name, amt: amt });
				}
			}
			
			let winHtml = '';
			if (winners.length > 0) {
				if (winners.length === 1) {
					winHtml = `<b>${nameColor(winners[0].name, true)}</b> has won the Blackjack and <b>${winners[0].amt}</b> ${CURRENCY_NAME}!`;
				} else {
					const winnerStrs = winners.map(w => `<b>${nameColor(w.name, true)}</b> (won <b>${w.amt}</b> ${CURRENCY_NAME})`);
					winHtml = `${winnerStrs.join(', ')} have won the Blackjack!`;
				}
			} else {
				const playerNames = game.players.map(p => `<b>${nameColor(p.name, true)}</b>`).join(', ');
				if (playerNames) winHtml = `The Dealer won the Blackjack against ${playerNames}.`;
				else winHtml = `The Dealer won the Blackjack.`;
			}
			html += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${winHtml}</div>`;
			
		} else {
			html += `<b>Dealer's Hand:</b> <small>[${dealerVal}]</small><br>`;
			html += renderHand(game.dealerHand, hideFirst) + `<hr>`;
			
			html += `<div class="casino-player-list">`;
			for (let i = 0; i < game.players.length; i++) {
				const p = game.players[i];
				const val = calculateHandValue(p.hand);
				let statusStr = `<small>[${val}]</small> `;
				let badgeClass = '';
				if (p.status === 'blackjack') { statusStr += '<b style="color:#4CAF50;">BJ</b>'; badgeClass = 'active'; }
				else if (p.status === 'busted') { statusStr += '<b style="color:#F44336;">Bust</b>'; badgeClass = 'folded'; }
				else if (p.status === 'stood') { statusStr += '<b style="color:#aaa;">Stood</b>'; badgeClass = 'eliminated'; }
				else { badgeClass = 'active'; }
				
				const isTurn = game.state === 'playing' && game.turnIndex === i;
				if (isTurn) badgeClass = 'all-in';
				
				html += `<div class="casino-player-badge ${badgeClass}">`;
				html += `<span class="casino-player-name">${nameColor(p.name, true)}</span>`;
				html += `Status: ${statusStr}<br>`;
				html += `<div style="margin-top: 4px;">${renderHand(p.hand)}</div>`;
				
				if (isTurn && p.id === userId) {
					html += `<div style="margin-top: 6px; text-align: center;">`;
					html += `<button class="button casino-btn" name="send" value="/bj hit">Hit</button> `;
					html += `<button class="button casino-btn" name="send" value="/bj stand">Stand</button>`;
					html += `<div style="margin-top: 4px;"><small style="color:#FFC107;">You have 15 seconds to act.</small></div>`;
					html += `</div>`;
				}
				
				html += `</div>`;
			}
			html += `</div>`;
		}
	}
	html += `</div>`;
	return html;
}

function updateRoom(game: BlackjackGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	if (game.state === 'ended') {
		const html = getBoardHtml(game, null);
		room.add(`|uhtmlchange|${game.uid}|${html}`).update();
		return;
	}

	const boardHtml = getBoardHtml(game, null);
	
	if (room.log && room.log.log) {
		const originalStart = `|uhtml|${game.uid}|`;
		for (let i = 0; i < room.log.log.length; i++) {
			if (room.log.log[i].startsWith(originalStart)) {
				room.log.log[i] = `${originalStart}${boardHtml}`;
				break;
			}
		}
	}
	
	for (const id in room.users) {
		const u = room.users[id];
		u.sendTo(room, `|uhtmlchange|${game.uid}|${getBoardHtml(game, u.id)}`);
	}
}

async function startDealing(game: BlackjackGame) {
	if (game.timer) {
		clearTimeout(game.timer);
		game.timer = null;
	}
	game.state = 'playing';

	game.dealerHand.push(drawCard(), drawCard());
	for (const p of game.players) {
		p.hand.push(drawCard(), drawCard());
		const val = calculateHandValue(p.hand);
		if (val === 21) p.status = 'blackjack';
	}

	await nextTurn(game);
}

export const commands: Chat.ChatCommands = {
	bj: 'blackjack',
	blackjack: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /bj start [coins]");

			if (activeCasinoGames.has(room.roomid)) return this.errorReply(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			// Host no longer auto-joins, so balance check is deferred to join command

			const uid = `bj-${room.roomid}-${Date.now()}`;
			
			const game: BlackjackGame = {
				roomid: room.roomid,
				uid,
				host: user.id,
				hostName: user.name,
				bet,
				state: 'lobby',
				players: [],
				dealerHand: [],
				turnIndex: 0,
				timer: null,
			};

			game.timer = setTimeout(() => {
				if (activeGames.has(room.roomid)) {
					const g = activeGames.get(room.roomid)!;
					if (g.state === 'lobby') {
						if (g.players.length > 0) {
							void startDealing(g);
						} else {
							void refundAll(g, 'Lobby timed out.');
							activeGames.delete(room.roomid);
							activeCasinoGames.delete(room.roomid);
						}
					}
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			activeCasinoGames.set(room.roomid, 'blackjack');
			
			const roomObj = Rooms.get(game.roomid);
			if (roomObj) {
				roomObj.add(`|uhtml|${game.uid}|${getBoardHtml(game, null)}`).update();
				for (const id in roomObj.users) {
					const u = roomObj.users[id];
					u.sendTo(roomObj, `|uhtmlchange|${game.uid}|${getBoardHtml(game, u.id)}`);
				}
			}
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active blackjack game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");
			if (game.players.length >= 4) return this.errorReply("This game is full (max 4 players).");

			const bal = await getBalance(user.id);
			if (bal < game.bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Cost: ${game.bet}, Balance: ${bal})`);

			await updateBalance(user.id, -game.bet);
			game.players.push({
				id: user.id,
				name: user.name,
				hand: [],
				status: 'playing',
				bet: game.bet
			});

			updateRoom(game);
		},

		async deal(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active blackjack game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			
			const isHost = typeof user === 'string' ? user === game.host : user.id === game.host;
			if (!isHost) return this.errorReply("Only the host can start dealing.");

			if (game.players.length === 0) return this.errorReply("Cannot deal without any players.");

			void startDealing(game);
		},

		async hit(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || game.state !== 'playing') return this.errorReply("There is no active blackjack game waiting for moves.");
			
			const currentPlayer = game.players[game.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) return this.errorReply("It's not your turn.");

			currentPlayer.hand.push(drawCard());
			const val = calculateHandValue(currentPlayer.hand);
			
			if (val > 21) {
				currentPlayer.status = 'busted';
				await nextTurn(game);
			} else if (val === 21) {
				currentPlayer.status = 'stood';
				await nextTurn(game);
			} else {
				if (game.timer) clearTimeout(game.timer);
				game.timer = setTimeout(() => {
					currentPlayer.status = 'stood';
					void nextTurn(game);
				}, TURN_TIMEOUT);
				updateRoom(game);
			}
		},

		async stand(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || game.state !== 'playing') return this.errorReply("There is no active blackjack game waiting for moves.");
			
			const currentPlayer = game.players[game.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) return this.errorReply("It's not your turn.");

			currentPlayer.status = 'stood';
			await nextTurn(game);
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active blackjack game in this room.");
			
			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) return this.errorReply("Only the host or a room moderator can cancel the game.");

			if (game.state !== 'lobby') return this.errorReply("The game is already in progress and cannot be cancelled.");

			if (game.timer) clearTimeout(game.timer);
			activeGames.delete(room.roomid);
			activeCasinoGames.delete(room.roomid);

			await refundAll(game, `Cancelled by ${user.name}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Blackjack Commands</b></center><hr>` +
				`<b>/bj start [bet]</b>: Start a Blackjack game with the specified bet.<hr>` +
				`<b>/bj join</b>: Join the current Blackjack game.<hr>` +
				`<b>/bj deal</b>: Deal the cards and start playing (Host only).<hr>` +
				`<b>/bj hit</b>: Draw another card.<hr>` +
				`<b>/bj stand</b>: End your turn.<hr>` +
				`<b>/bj end</b>: Cancel the game (Host/Moderator only).`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Blackjack Rules</b></center><hr>` +
				`Try to get your hand's value closer to 21 than the dealer's without going over (busting).<br>` +
				`Number cards are face value, face cards are 10, and Aces can be 1 or 11.<br>` +
				`Beating the dealer pays 2x your bet, and getting a natural Blackjack pays 2.5x!`
			);
		}
	},
	blackjackhelp: 'blackjack help',
	bjhelp: 'blackjack help',
	blackjackrules: 'blackjack rules',
	bjrules: 'blackjack rules',
};
