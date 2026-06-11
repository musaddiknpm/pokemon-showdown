import { wrapCommands } from '../../impulse-utils';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';

const CASINO_ROOM = 'casino';
const LOBBY_TIMEOUT = 60 * 1000;
const TURN_TIMEOUT = 30 * 1000;

type Suit = '♠' | '♥' | '♣' | '♦';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
	suit: Suit;
	rank: Rank;
	value: number;
}

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

const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

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

function renderCard(card: Card | null): string {
	if (!card) return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;background:#eee;color:#333;">?</span>`;
	const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
	return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;color:${color};background:#fff;"><b>${card.rank}</b>${card.suit}</span>`;
}

function renderHand(hand: Card[], hideFirst = false): string {
	return hand.map((c, i) => renderCard(hideFirst && i === 0 ? null : c)).join('');
}

async function refundAll(game: BlackjackGame, message: string) {
	for (const p of game.players) {
		await updateBalance(p.id, p.bet);
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
			`<b>Blackjack Game Cancelled</b><hr>` +
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
	updateRoom(game);
}

function updateRoom(game: BlackjackGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
	html += `<b>Blackjack</b> (Bet: <b>${game.bet}</b> ${CURRENCY_NAME})<hr>`;
	
	if (game.state === 'lobby') {
		html += `<b>Players in lobby:</b><br>`;
		for (const p of game.players) {
			html += `${nameColor(p.name, true)}<br>`;
		}
		html += `<br>`;
		html += `<button class="button" name="send" value="/bj join" style="padding:6px 20px;margin-right:5px;">Join Game</button>`;
		html += `<button class="button" name="send" value="/bj deal" style="padding:6px 20px;margin-right:5px;">Deal (Host)</button>`;
		html += `<button class="button" name="send" value="/bj end" style="padding:6px 20px;">Cancel Game (Host)</button>`;
		html += `<br><br><small>This game will automatically start in 60 seconds.</small>`;
	} else {
		const hideFirst = game.state === 'playing';
		const dealerVal = hideFirst ? '?' : calculateHandValue(game.dealerHand);
		html += `<b>Dealer's Hand:</b> <small>[${dealerVal}]</small><br>`;
		html += renderHand(game.dealerHand, hideFirst) + `<br><br>`;
		
		for (let i = 0; i < game.players.length; i++) {
			const p = game.players[i];
			const val = calculateHandValue(p.hand);
			let statusStr = ` <small>[${val}]</small>`;
			if (p.status === 'blackjack') statusStr += ' <span style="color:green;font-weight:bold;">[Blackjack]</span>';
			else if (p.status === 'busted') statusStr += ' <span style="color:red;font-weight:bold;">[Busted]</span>';
			else if (p.status === 'stood') statusStr += ` <span style="color:gray;font-weight:bold;">[Stood]</span>`;
			
			if (game.state === 'ended' && p.payoutStr) {
				statusStr += ` &mdash; ${p.payoutStr}`;
			}

			const isTurn = game.state === 'playing' && game.turnIndex === i;
			if (isTurn) html += `<div style="border:2px solid #888;padding:4px;border-radius:4px;margin-bottom:4px;">`;
			else html += `<div style="padding:4px;margin-bottom:4px;border:2px solid transparent;">`;
			
			html += `<b>${nameColor(p.name, true)}:</b>${statusStr}<br>`;
			html += renderHand(p.hand) + `<br>`;
			
			if (isTurn) {
				html += `<br><button class="button" name="send" value="/bj hit" style="margin-right:5px;padding:4px 12px;">Hit</button>`;
				html += `<button class="button" name="send" value="/bj stand" style="padding:4px 12px;">Stand</button>`;
			}
			html += `</div>`;
		}
	}
	html += `</div>`;
	
	if (game.state === 'lobby' && game.players.length === 1) {
		room.add(`|uhtml|${game.uid}|${html}`).update();
	} else {
		room.add(`|uhtmlchange|${game.uid}|${html}`).update();
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

export const commands: Chat.ChatCommands = wrapCommands({
	bj: 'blackjack',
	blackjack: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /bj start [coins]");

			if (activeGames.has(room.roomid)) return this.errorReply("A blackjack game is already running in this room.");

			const bal = await getBalance(user.id);
			if (bal < bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Balance: ${bal})`);

			await updateBalance(user.id, -bet);

			const uid = `bj-${room.roomid}-${Date.now()}`;
			
			const game: BlackjackGame = {
				roomid: room.roomid,
				uid,
				host: user.id,
				hostName: user.name,
				bet,
				state: 'lobby',
				players: [{
					id: user.id,
					name: user.name,
					hand: [],
					status: 'playing',
					bet
				}],
				dealerHand: [],
				turnIndex: 0,
				timer: null,
			};

			game.timer = setTimeout(() => {
				if (activeGames.has(room.roomid)) {
					const g = activeGames.get(room.roomid)!;
					if (g.state === 'lobby') void startDealing(g);
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			
			const roomObj = Rooms.get(game.roomid);
			if (roomObj) {
				let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
				html += `<b>Blackjack</b> (Bet: <b>${game.bet}</b> ${CURRENCY_NAME})<hr>`;
				html += `<b>Players in lobby:</b><br>`;
				html += `${nameColor(user.name, true)}<br>`;
				html += `<br>`;
				html += `<button class="button" name="send" value="/bj join" style="padding:6px 20px;margin-right:5px;">Join Game</button>`;
				html += `<button class="button" name="send" value="/bj deal" style="padding:6px 20px;margin-right:5px;">Deal (Host)</button>`;
				html += `<button class="button" name="send" value="/bj end" style="padding:6px 20px;">Cancel Game</button>`;
				html += `<br><br><small>This game will automatically start in 60 seconds.</small>`;
				html += `</div>`;
				roomObj.add(`|uhtml|${game.uid}|${html}`).update();
			}
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active blackjack game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");

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

			await refundAll(game, `Cancelled by ${user.name}.`);
		}
	}
});
