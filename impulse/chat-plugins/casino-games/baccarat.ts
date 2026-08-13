import { Utils } from '../../../lib';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM, Suit, Rank, type Card, SUITS, RANKS, renderHand } from './shared';
import { RoomGame, RoomGamePlayer } from '../../../server/room-game';

const LOBBY_TIMEOUT = 60 * 1000;

type Choice = 'player' | 'banker' | 'tie';

class BaccaratPlayer extends RoomGamePlayer<BaccaratGame> {
	choice: Choice;
	bet: number;

	constructor(user: User | string | null, game: BaccaratGame, num: number, choice: Choice) {
		super(user, game, num);
		this.choice = choice;
		this.bet = game.bet;
	}
}

function drawCard(): Card {
	const suit = Utils.randomElement(SUITS);
	const rank = Utils.randomElement(RANKS);
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

export class BaccaratGame extends RoomGame<BaccaratPlayer> {
	gameid = 'baccarat' as ID;
	uid: string;
	host: string;
	hostName: string;
	bet: number;
	state: 'lobby' | 'ended' = 'lobby';
	timer: NodeJS.Timeout | null = null;
	allowRenames = true;
	playerCap = 4;
	checkChat = true;

	constructor(room: Room, host: User, bet: number) {
		super(room);
		this.title = 'Baccarat';
		this.uid = `bac-${room.roomid}-${Date.now()}`;
		this.host = host.id;
		this.hostName = host.name;
		this.bet = bet;

		this.timer = setTimeout(() => {
			if (this.state === 'lobby') {
				if (this.players.length > 0) {
					void this.dealGame();
				} else {
					void this.refundAll('Lobby timed out.');
					this.destroy();
				}
			}
		}, LOBBY_TIMEOUT);

		activeCasinoGames.set(room.roomid, 'baccarat');
	}

	makePlayer(user: User | string | null, ...rest: unknown[]): BaccaratPlayer {
		const choice = rest[0] as Choice;
		const num = this.players.length ? this.players[this.players.length - 1].num : 1;
		return new BaccaratPlayer(user, this, num, choice);
	}

	onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		super.onRename(user, oldUserid, isJoining, isForceRenamed);
		this.updateLobby();
	}

	forfeit(user: User | string) {
		if (this.state !== 'lobby') return;
		const id = typeof user === 'string' ? toID(user) : user.id;
		const player = this.playerTable[id];
		if (!player) return;

		void updateBalance(player.id, player.bet);
		this.removePlayer(player);
		this.updateLobby();
	}

	onConnect(user: User) {
		const html = this.getLobbyHtml(user.id);
		user.sendTo(this.roomid, `|uhtml|${this.uid}|${html}`);
	}

	onLeave(user: User, oldUserid?: ID) {
		this.forfeit(user);
	}

	leaveGame(user: User) {
		this.forfeit(user);
	}

	joinGame(user: User, text?: string) {
		void this.handleJoin(user, text);
	}

	async handleJoin(user: User, text?: string) {
		if (this.state !== 'lobby') {
			user.sendTo(this.roomid, "|error|This game has already started.");
			return;
		}
		if (this.players.some(p => p.id === user.id)) {
			user.sendTo(this.roomid, "|error|You are already in this game.");
			return;
		}

		const choice = (text || '').trim().toLowerCase() as Choice;
		if (!['player', 'banker', 'tie'].includes(choice)) {
			user.sendTo(this.roomid, "|error|Choice must be player, banker, or tie.");
			return;
		}

		const bal = await getBalance(user.id);
		if (bal < this.bet) {
			user.sendTo(this.roomid, `|error|You don't have enough ${CURRENCY_NAME}. (Cost: ${this.bet}, Balance: ${bal})`);
			return;
		}

		await updateBalance(user.id, -this.bet);
		const player = this.addPlayer(user, choice);
		if (!player) {
			await updateBalance(user.id, this.bet);
			user.sendTo(this.roomid, "|error|You could not join the game (it may be full or you are already in it).");
			return;
		}
		this.updateLobby();
	}

	choose(user: User, text: string) {
		const action = text.trim().toLowerCase();
		if (action === 'deal') {
			const isHost = typeof user === 'string' ? user === this.host : user.id === this.host;
			if (!isHost) {
				user.sendTo(this.roomid, "|error|Only the host can start dealing.");
				return;
			}
			if (this.state !== 'lobby') {
				user.sendTo(this.roomid, "|error|This game has already started.");
				return;
			}
			if (this.players.length === 0) {
				user.sendTo(this.roomid, "|error|Cannot deal without any players.");
				return;
			}
			void this.dealGame();
		}
	}

	async refundAll(message: string) {
		for (const p of this.players) {
			await updateBalance(p.id, p.bet);
		}
		if (this.room) {
			this.room.add(
				`|uhtmlchange|${this.uid}|` +
				`<div class="casino-board">` +
				`<div class="casino-header">Baccarat Game Cancelled</div><hr>` +
				`${Utils.escapeHTML(message)}<br>All players have been refunded.` +
				`</div>`
			).update();
		}
	}

	getLobbyHtml(userId: string | null): string {
		let html = `<div class="casino-board">`;
		html += `<div class="casino-header">Baccarat <small>(Bet: <b>${this.bet}</b> ${CURRENCY_NAME})</small></div>`;
		html += `Host: ${nameColor(this.hostName, true)}<hr>`;

		html += `<div class="casino-player-list">`;
		if (this.players.length === 0) {
			html += `<i>No players yet</i>`;
		} else {
			for (const p of this.players) {
				const choiceStr = p.choice.charAt(0).toUpperCase() + p.choice.slice(1);
				html += `<div class="casino-player-badge active"><span class="casino-player-name">${nameColor(p.name, true)}</span>Bet: <b>${choiceStr}</b></div>`;
			}
		}
		html += `</div>`;

		let hasControls = false;
		let controlsHtml = `<div>`;
		if (this.players.length < 4 && (!userId || !this.players.some(p => p.id === userId))) {
			hasControls = true;
			controlsHtml += `<button class="button casino-btn" name="send" value="/joingame player">Bet Player (2x)</button> `;
			controlsHtml += `<button class="button casino-btn" name="send" value="/joingame banker">Bet Banker (2x)</button> `;
			controlsHtml += `<button class="button casino-btn" name="send" value="/joingame tie">Bet Tie (9x)</button>`;
		}
		controlsHtml += `</div>`;

		if (userId === this.host) {
			hasControls = true;
			controlsHtml += `<div style="margin-top: 8px;">`;
			controlsHtml += `<button class="button casino-btn" name="send" value="/choose deal">Deal (Host)</button> `;
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

	updateLobby() {
		const room = this.room;
		if (!room) return;

		const boardHtml = this.getLobbyHtml(null);

		if (room.log?.log) {
			const originalStart = `|uhtml|${this.uid}|`;
			for (let i = 0; i < room.log.log.length; i++) {
				if (room.log.log[i].startsWith(originalStart)) {
					room.log.log[i] = `${originalStart}${boardHtml}`;
					break;
				}
			}
		}

		for (const id in room.users) {
			const u = room.users[id];
			u.sendTo(room, `|uhtmlchange|${this.uid}|${this.getLobbyHtml(u.id)}`);
		}
	}

	async dealGame() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.state = 'ended';

		const room = this.room;
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

		const winners: { name: string, amount: number }[] = [];
		for (const p of this.players) {
			if (p.choice === result) {
				if (result === 'tie') {
					const winAmount = p.bet * 9;
					await updateBalance(p.id, winAmount);
					winners.push({ name: p.name, amount: winAmount });
				} else {
					const winAmount = p.bet * 2;
					await updateBalance(p.id, winAmount);
					winners.push({ name: p.name, amount: winAmount });
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
		for (const p of this.players) {
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
				summaryHtml = `<b>${nameColor(winners[0].name, true)}</b> has won the Baccarat and <b>${winners[0].amount}</b> ${CURRENCY_NAME}!`;
			} else {
				const winnerStrs = winners.map(w => `<b>${nameColor(w.name, true)}</b> (won <b>${w.amount}</b> ${CURRENCY_NAME})`);
				summaryHtml = `${winnerStrs.join(', ')} have won the Baccarat!`;
			}
		} else {
			const playerNames = this.players.map(p => `<b>${nameColor(p.name, true)}</b>`).join(', ');
			if (playerNames) {
				summaryHtml = `The Dealer won the Baccarat against ${playerNames}.`;
			} else {
				summaryHtml = `The Dealer won the Baccarat.`;
			}
		}

		winHtml += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${summaryHtml}</div>`;
		winHtml += `</div>`;

		room.add(`|uhtmlchange|${this.uid}|${winHtml}`).update();
		this.destroy();
	}

	destroy() {
		if (this.timer) clearTimeout(this.timer);
		activeCasinoGames.delete(this.roomid);
		super.destroy();
	}
}

export const commands: Chat.ChatCommands = {
	bacc: 'baccarat',
	baccarat: {
		start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) throw new Chat.ErrorMessage("Usage: /bacc start [coins]");

			if (room.game) throw new Chat.ErrorMessage(`A ${room.game.title} game is already running in this room.`);
			if (activeCasinoGames.has(room.roomid)) throw new Chat.ErrorMessage(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const game = new BaccaratGame(room, user, bet);

			room.add(`|uhtml|${game.uid}|${game.getLobbyHtml(null)}`).update();
			for (const id in room.users) {
				const u = room.users[id];
				u.sendTo(room, `|uhtmlchange|${game.uid}|${game.getLobbyHtml(u.id)}`);
			}
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");
			const game = room.getGame(BaccaratGame);
			if (!game) throw new Chat.ErrorMessage("No active baccarat game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) throw new Chat.ErrorMessage("Only the host or a room moderator can cancel the game.");

			if (game.state !== 'lobby') throw new Chat.ErrorMessage("The game is already in progress and cannot be cancelled.");

			await game.refundAll(`Cancelled by ${user.name}.`);
			game.destroy();
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Baccarat Commands</b></center><hr>` +
				`<b>/bacc start [bet]</b>: Start a Baccarat game with the specified bet.<hr>` +
				`<b>/bacc end</b>: Cancel the game (Host/Moderator only).<hr>` +
				`<i>Note: All other actions (joining, dealing) are performed using the interactive buttons on the game board!</i>`
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
		},
	},
	baccarathelp: 'baccarat help',
	bacchelp: 'baccarat help',
	baccaratrules: 'baccarat rules',
	baccrules: 'baccarat rules',
};
