import { wrapCommands } from '../../impulse-utils';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';

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
	if (!card) return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;background:#eee;color:#333;">?</span>`;
	const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
	return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;color:${color};background:#fff;"><b>${card.rank}</b>${card.suit}</span>`;
}

function renderHand(hand: Card[]): string {
	return hand.map((c) => renderCard(c)).join('');
}

async function refundAll(game: BaccaratGame, message: string) {
	for (const p of game.players) {
		await updateBalance(p.id, p.bet);
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
			`<b>Baccarat Game Cancelled</b><hr>` +
			`${message}<br>All players have been refunded.` +
			`</div>`
		).update();
	}
}

function updateLobby(game: BaccaratGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
	html += `<b>Baccarat</b> (Bet: <b>${game.bet}</b> ${CURRENCY_NAME})<hr>`;
	html += `<b>Players in lobby:</b><br>`;
	
	if (game.players.length === 0) {
		html += `<i>No players yet</i><br>`;
	} else {
		for (const p of game.players) {
			const choiceStr = p.choice.charAt(0).toUpperCase() + p.choice.slice(1);
			html += `${nameColor(p.name, true)} - Bet: <b>${choiceStr}</b><br>`;
		}
	}
	
	html += `<br>`;
	html += `<button class="button" name="send" value="/bacc join player" style="padding:6px 20px;margin-right:5px;">Bet Player (2x)</button>`;
	html += `<button class="button" name="send" value="/bacc join banker" style="padding:6px 20px;margin-right:5px;">Bet Banker (2x)</button>`;
	html += `<button class="button" name="send" value="/bacc join tie" style="padding:6px 20px;margin-right:5px;">Bet Tie (9x)</button>`;
	html += `<br><br>`;
	html += `<button class="button" name="send" value="/bacc deal" style="padding:6px 20px;margin-right:5px;">Deal (Host)</button>`;
	html += `<button class="button" name="send" value="/bacc end" style="padding:6px 20px;">Cancel Game</button>`;
	html += `<br><br><small>This game will automatically expire in 60 seconds if not dealt.</small>`;
	html += `</div>`;
	
	room.add(`|uhtmlchange|${game.uid}|${html}`).update();
}

async function dealGame(game: BaccaratGame) {
	if (game.timer) {
		clearTimeout(game.timer);
		game.timer = null;
	}
	game.state = 'ended';
	activeGames.delete(game.roomid);
	
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
		resultStr = '<span style="color:blue">Player Wins!</span>';
	} else if (bankerVal > playerVal) {
		result = 'banker';
		resultStr = '<span style="color:red">Banker Wins!</span>';
	} else {
		result = 'tie';
		resultStr = '<span style="color:green">Tie!</span>';
	}
	
	let payoutHtml = '';
	for (const p of game.players) {
		if (p.choice === result) {
			if (result === 'tie') {
				const winAmount = p.bet * 9;
				await updateBalance(p.id, winAmount);
				payoutHtml += `${nameColor(p.name, true)} won <b>${winAmount}</b> ${CURRENCY_NAME} (Bet Tie)<br>`;
			} else {
				const winAmount = p.bet * 2;
				await updateBalance(p.id, winAmount);
				payoutHtml += `${nameColor(p.name, true)} won <b>${winAmount}</b> ${CURRENCY_NAME} (Bet ${p.choice === 'player' ? 'Player' : 'Banker'})<br>`;
			}
		} else if (result === 'tie' && (p.choice === 'player' || p.choice === 'banker')) {
			await updateBalance(p.id, p.bet);
			payoutHtml += `${nameColor(p.name, true)} pushed (Refunded <b>${p.bet}</b>)<br>`;
		} else {
			payoutHtml += `${nameColor(p.name, true)} lost (Bet ${p.choice.charAt(0).toUpperCase() + p.choice.slice(1)})<br>`;
		}
	}
	
	if (!payoutHtml) payoutHtml = '<i>No players bet on this round.</i>';
	
	let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
	html += `<b>Baccarat Results</b><hr>`;
	html += `<b>Player Hand:</b> <small>[${playerVal}]</small><br>`;
	html += renderHand(playerHand) + `<br><br>`;
	html += `<b>Banker Hand:</b> <small>[${bankerVal}]</small><br>`;
	html += renderHand(bankerHand) + `<br><br>`;
	html += `<b>Result: ${resultStr}</b><hr>`;
	html += payoutHtml;
	html += `</div>`;
	
	room.add(`|uhtmlchange|${game.uid}|${html}`).update();
}

export const commands: Chat.ChatCommands = wrapCommands({
	bacc: 'baccarat',
	baccarat: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /bacc start [coins]");

			if (activeGames.has(room.roomid)) return this.errorReply("A baccarat game is already running in this room.");

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
						void refundAll(g, 'Lobby timed out.');
						activeGames.delete(room.roomid);
					}
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			
			const roomObj = Rooms.get(game.roomid);
			if (roomObj) {
				let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
				html += `<b>Baccarat</b> (Bet: <b>${game.bet}</b> ${CURRENCY_NAME})<hr>`;
				html += `<b>Players in lobby:</b><br>`;
				html += `<i>No players yet</i><br>`;
				html += `<br>`;
				html += `<button class="button" name="send" value="/bacc join player" style="padding:6px 20px;margin-right:5px;">Bet Player (2x)</button>`;
				html += `<button class="button" name="send" value="/bacc join banker" style="padding:6px 20px;margin-right:5px;">Bet Banker (2x)</button>`;
				html += `<button class="button" name="send" value="/bacc join tie" style="padding:6px 20px;margin-right:5px;">Bet Tie (9x)</button>`;
				html += `<br><br>`;
				html += `<button class="button" name="send" value="/bacc deal" style="padding:6px 20px;margin-right:5px;">Deal (Host)</button>`;
				html += `<button class="button" name="send" value="/bacc end" style="padding:6px 20px;">Cancel Game</button>`;
				html += `<br><br><small>This game will automatically expire in 60 seconds if not dealt.</small>`;
				html += `</div>`;
				roomObj.add(`|uhtml|${game.uid}|${html}`).update();
			}
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active baccarat game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");

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
		}
	},
	baccarathelp: 'baccarat help',
	bacchelp: 'baccarat help',
});
