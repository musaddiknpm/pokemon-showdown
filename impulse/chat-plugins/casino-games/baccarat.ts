import { wrapCommands } from '../../impulse-utils';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames } from './shared';

const CASINO_ROOM = 'casino';
const LOBBY_TIMEOUT = 60 * 1000;

type Suit = '♠' | '♥' | '♣' | '♦';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type Choice = 'player' | 'banker' | 'tie';

interface Card {
	suit: Suit;
	rank: Rank;
	value: number;
}

interface Player {
	id: string;
	name: string;
	choice: Choice;
	bet: number;
}

interface BaccaratGame {
	roomid: string;
	uid: string;
	host: string;
	hostName: string;
	bet: number;
	state: 'lobby' | 'ended';
	players: Player[];
	timer: NodeJS.Timeout | null;
}

const activeGames = new Map<string, BaccaratGame>();

const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function drawCard(): Card {
	const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
	const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
	let value = parseInt(rank);
	if (isNaN(value)) {
		value = rank === 'A' ? 1 : 0;
	}
	return { suit, rank, value };
}

function calculateHandValue(hand: Card[]): number {
	let total = 0;
	for (const card of hand) {
		total += card.value;
	}
	return total % 10;
}

function renderCard(card: Card | null): string {
	if (!card) return `<span class="casino-card hidden">?</span>`;
	const colorClass = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
	return `<span class="casino-card ${colorClass}">${card.rank}${card.suit}</span>`;
}

function renderHand(hand: Card[], compact = false): string {
	let html = '';
	for (const card of hand) {
		const color = (card.suit === '♥' || card.suit === '♦') ? '#F44336' : '#2C3E50';
		const size = compact ? '12px' : '16px';
		const padding = compact ? '1px 3px' : '2px 5px';
		html += `<span style="display:inline-block; border:1px solid #ccc; border-radius:3px; padding:${padding}; margin-right:2px; background:#fff; color:${color}; font-weight:bold; font-size:${size}; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">${card.rank}<span style="font-family: Arial, sans-serif; margin-left:1px;">${card.suit}</span></span>`;
	}
	return html;
}

async function refundAll(game: BaccaratGame, message: string) {
	for (const p of game.players) {
		await updateBalance(p.id, p.bet);
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="casino-board">` +
			`<div class="casino-header">Baccarat Game Cancelled</div><hr>` +
			`${message}<br>All players have been refunded.` +
			`</div>`
		).update();
	}
}

function getLobbyHtml(game: BaccaratGame, userId: string | null): string {
	let html = `<div class="casino-board">`;
	html += `<div class="casino-header">Baccarat <small>(Bet: <b>${game.bet}</b> ${CURRENCY_NAME})</small></div>`;
	html += `Host: ${nameColor(game.hostName, true)}<hr>`;
	
	html += `<div class="casino-player-list">`;
	if (game.players.length === 0) {
		html += `<i>No players yet</i>`;
	} else {
		for (const p of game.players) {
			const choiceStr = p.choice.charAt(0).toUpperCase() + p.choice.slice(1);
			html += `<div class="casino-player-badge active"><span class="casino-player-name">${nameColor(p.name, true)}</span>Bet: <b>${choiceStr}</b></div>`;
		}
	}
	html += `</div>`;
	
	let hasControls = false;
	let controlsHtml = `<div>`;
	if (game.players.length < 4 && (!userId || !game.players.some(p => p.id === userId))) {
		hasControls = true;
		controlsHtml += `<button class="button casino-btn" name="send" value="/bacc join player">Bet Player (2x)</button> `;
		controlsHtml += `<button class="button casino-btn" name="send" value="/bacc join banker">Bet Banker (2x)</button> `;
		controlsHtml += `<button class="button casino-btn" name="send" value="/bacc join tie">Bet Tie (9x)</button>`;
	}
	controlsHtml += `</div>`;
	
	if (userId === game.host) {
		hasControls = true;
		controlsHtml += `<div style="margin-top: 8px;">`;
		controlsHtml += `<button class="button casino-btn" name="send" value="/bacc deal">Deal (Host)</button> `;
		controlsHtml += `<button class="button casino-btn" name="send" value="/bacc end">Cancel Game</button>`;
		controlsHtml += `</div>`;
	}
	
	if (hasControls) {
		html += `<hr>${controlsHtml}`;
	}
	
	html += `<br><small>This game will automatically start in 60 seconds.</small>`;
	html += `</div>`;
	return html;
}

function updateLobby(game: BaccaratGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	const boardHtml = getLobbyHtml(game, null);
	
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
		u.sendTo(room, `|uhtmlchange|${game.uid}|${getLobbyHtml(game, u.id)}`);
	}
}

async function dealGame(game: BaccaratGame) {
	if (game.timer) {
		clearTimeout(game.timer);
		game.timer = null;
	}
	game.state = 'ended';
	activeGames.delete(game.roomid);
	activeCasinoGames.delete(game.roomid);
	
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	const playerHand = [drawCard(), drawCard()];
	const bankerHand = [drawCard(), drawCard()];
	
	let playerVal = calculateHandValue(playerHand);
	let bankerVal = calculateHandValue(bankerHand);
	
	if (playerVal < 8 && bankerVal < 8) {
		let playerDrew = false;
		let playerThirdCardVal = -1;
		
		if (playerVal <= 5) {
			const thirdCard = drawCard();
			playerHand.push(thirdCard);
			playerThirdCardVal = thirdCard.value;
			playerVal = calculateHandValue(playerHand);
			playerDrew = true;
		}
		
		if (!playerDrew) {
			if (bankerVal <= 5) {
				bankerHand.push(drawCard());
				bankerVal = calculateHandValue(bankerHand);
			}
		} else {
			let bankerDraws = false;
			if (bankerVal <= 2) bankerDraws = true;
			else if (bankerVal === 3 && playerThirdCardVal !== 8) bankerDraws = true;
			else if (bankerVal === 4 && playerThirdCardVal >= 2 && playerThirdCardVal <= 7) bankerDraws = true;
			else if (bankerVal === 5 && playerThirdCardVal >= 4 && playerThirdCardVal <= 7) bankerDraws = true;
			else if (bankerVal === 6 && (playerThirdCardVal === 6 || playerThirdCardVal === 7)) bankerDraws = true;
			
			if (bankerDraws) {
				bankerHand.push(drawCard());
				bankerVal = calculateHandValue(bankerHand);
			}
		}
	}
	
	let result: Choice;
	let resultStr = '';
	if (playerVal > bankerVal) {
		result = 'player';
		resultStr = '<span style="color:#4CAF50">Player Wins!</span>';
	} else if (bankerVal > playerVal) {
		result = 'banker';
		resultStr = '<span style="color:#F44336">Banker Wins!</span>';
	} else {
		result = 'tie';
		resultStr = '<span style="color:#FFEB3B">Tie!</span>';
	}
	
	let winners: {name: string, amount: number}[] = [];
	for (const p of game.players) {
		if (p.choice === result) {
			if (result === 'tie') {
				const winAmount = p.bet * 9;
				await updateBalance(p.id, winAmount);
				winners.push({name: p.name, amount: winAmount});
			} else {
				const winAmount = p.bet * 2;
				await updateBalance(p.id, winAmount);
				winners.push({name: p.name, amount: winAmount});
			}
		} else if (result === 'tie' && (p.choice === 'player' || p.choice === 'banker')) {
			await updateBalance(p.id, p.bet);
		}
	}
	
	let winHtml = `<div class="casino-board ended">`;
	winHtml += `<div class="casino-header">Baccarat Results</div>`;

	winHtml += `<div style="display:flex; gap:8px; margin-bottom: 8px;">`;
	
	winHtml += `<div style="flex: 1; padding: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; text-align: center;">`;
	winHtml += `<b>Player Hand</b> <small>[${playerVal}]</small><br>`;
	winHtml += `<div style="margin-top:4px;">${renderHand(playerHand, true)}</div>`;
	winHtml += `</div>`;
	
	winHtml += `<div style="flex: 1; padding: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; text-align: center;">`;
	winHtml += `<b>Banker Hand</b> <small>[${bankerVal}]</small><br>`;
	winHtml += `<div style="margin-top:4px;">${renderHand(bankerHand, true)}</div>`;
	winHtml += `</div>`;
	
	winHtml += `</div>`;

	winHtml += `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 8px;">`;
	for (const p of game.players) {
		winHtml += `<div style="flex: 1 1 45%; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 4px; border-left: 2px solid #FFC107;">`;
		winHtml += `<b>${nameColor(p.name, true)}</b>: Bet ${p.bet} on <b>${p.choice.charAt(0).toUpperCase() + p.choice.slice(1)}</b>`;
		
		let payoutStr = '';
		const w = winners.find(winner => winner.name === p.name);
		if (w) {
			payoutStr = `<b style="color:#4CAF50;">Won ${w.amount}</b>`;
		} else {
			payoutStr = `<b style="color:#F44336;">Lost</b>`;
		}
		winHtml += ` <small>${payoutStr}</small>`;
		winHtml += `</div>`;
	}
	winHtml += `</div>`;

	let summaryHtml = '';
	if (winners.length > 0) {
		if (winners.length === 1) {
			summaryHtml = `<b>${nameColor(winners[0].name, true)}</b> has won the Baccarat game and won <b>${winners[0].amount}</b> ${CURRENCY_NAME}!`;
		} else {
			const winnerStrs = winners.map(w => `<b>${nameColor(w.name, true)}</b> (won <b>${w.amount}</b> ${CURRENCY_NAME})`);
			summaryHtml = `${winnerStrs.join(', ')} have won the Baccarat game!`;
		}
	} else {
		const playerNames = game.players.map(p => `<b>${nameColor(p.name, true)}</b>`).join(', ');
		if (playerNames) {
			summaryHtml = `The Dealer won the Baccarat game against ${playerNames}.`;
		} else {
			summaryHtml = `The Dealer won the Baccarat game.`;
		}
	}
	
	winHtml += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${summaryHtml}</div>`;
	winHtml += `</div>`;

	room.add(`|uhtmlchange|${game.uid}|${winHtml}`).update();
}

export const commands: Chat.ChatCommands = wrapCommands({
	bacc: 'baccarat',
	baccarat: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /bacc start [coins]");

			if (activeCasinoGames.has(room.roomid)) return this.errorReply(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const uid = `bac-${room.roomid}-${Date.now()}`;
			
			const game: BaccaratGame = {
				roomid: room.roomid,
				uid,
				host: user.id,
				hostName: user.name,
				bet,
				state: 'lobby',
				players: [],
				timer: null,
			};

			game.timer = setTimeout(() => {
				if (activeGames.has(room.roomid)) {
					const g = activeGames.get(room.roomid)!;
					if (g.state === 'lobby') {
						if (g.players.length > 0) {
							void dealGame(g);
						} else {
							void refundAll(g, 'Lobby timed out.');
							activeGames.delete(room.roomid);
							activeCasinoGames.delete(room.roomid);
						}
					}
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			activeCasinoGames.set(room.roomid, 'baccarat');
			
			const roomObj = Rooms.get(game.roomid);
			if (roomObj) {
				roomObj.add(`|uhtml|${game.uid}|${getLobbyHtml(game, null)}`).update();
				for (const id in roomObj.users) {
					const u = roomObj.users[id];
					u.sendTo(roomObj, `|uhtmlchange|${game.uid}|${getLobbyHtml(game, u.id)}`);
				}
			}
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active baccarat game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");
			if (game.players.length >= 4) return this.errorReply("This game is full (max 4 players).");

			const choice = target.trim().toLowerCase();
			if (!['player', 'banker', 'tie'].includes(choice)) return this.errorReply("Choice must be player, banker, or tie.");

			const bal = await getBalance(user.id);
			if (bal < game.bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Cost: ${game.bet}, Balance: ${bal})`);

			await updateBalance(user.id, -game.bet);
			game.players.push({
				id: user.id,
				name: user.name,
				choice: choice as Choice,
				bet: game.bet
			});

			updateLobby(game);
		},

		async deal(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active baccarat game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			
			const isHost = typeof user === 'string' ? user === game.host : user.id === game.host;
			if (!isHost) return this.errorReply("Only the host can deal the cards.");
			
			if (game.players.length === 0) return this.errorReply("Cannot deal without any players.");

			void dealGame(game);
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active baccarat game in this room.");
			
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
				`<center><b>Baccarat Commands</b></center><hr>` +
				`<b>/bacc start [bet]</b>: Start a Baccarat game with the specified bet.<hr>` +
				`<b>/bacc join [player|banker|tie]</b>: Join the current Baccarat game.<hr>` +
				`<b>/bacc deal</b>: Deal the cards (Host only).<hr>` +
				`<b>/bacc end</b>: Cancel the game (Host/Moderator only).`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Baccarat Rules</b></center><hr>` +
				`Bet on which hand (Player or Banker) will be closest to 9.<br>` +
				`Number cards are face value, Aces are 1, and 10/face cards are 0.<br>` +
				`Hand values only use the last digit of the sum (e.g., 15 is 5).<br>` +
				`Winning Player or Banker bets pay 2x, and a Tie bet pays 9x! In the event of a Tie, Player and Banker bets push (refund).`
			);
		}
	},
	baccarathelp: 'baccarat help',
	bacchelp: 'baccarat help',
	baccaratrules: 'baccarat rules',
	baccrules: 'baccarat rules',
});
