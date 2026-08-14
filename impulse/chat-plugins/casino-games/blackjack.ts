import { Utils } from '../../../lib';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM, Suit, Rank, type Card, SUITS, RANKS, renderHand } from './shared';
import { RoomGame, RoomGamePlayer } from '../../../server/room-game';

const LOBBY_TIMEOUT = 60 * 1000;
const TURN_TIMEOUT = 15 * 1000;

class BlackjackPlayer extends RoomGamePlayer<BlackjackGame> {
	hand: Card[] = [];
	status: 'playing' | 'stood' | 'busted' | 'blackjack' = 'playing';
	bet: number;
	payoutStr?: string;

	constructor(user: User | string | null, game: BlackjackGame, num = 0) {
		super(user, game, num);
		this.bet = game.bet;
	}
}

function drawCard(): Card {
	const suit = Utils.randomElement(SUITS);
	const rank = Utils.randomElement(RANKS);
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

export class BlackjackGame extends RoomGame<BlackjackPlayer> {
	gameid = 'blackjack' as ID;
	uid: string;
	host: string;
	hostName: string;
	bet: number;
	state: 'lobby' | 'playing' | 'ended' = 'lobby';
	dealerHand: Card[] = [];
	turnIndex = 0;
	timer: NodeJS.Timeout | null = null;
	allowRenames = true;
	playerCap = 4;
	checkChat = true;

	constructor(room: Room, host: User, bet: number) {
		super(room);
		this.title = 'Blackjack';
		this.uid = `bj-${room.roomid}-${Date.now()}`;
		this.host = host.id;
		this.hostName = host.name;
		this.bet = bet;

		this.timer = setTimeout(() => {
			if (this.state === 'lobby') {
				if (this.players.length > 0) {
					void this.startDealing();
				} else {
					void this.refundAll('Lobby timed out.');
					this.destroy();
				}
			}
		}, LOBBY_TIMEOUT);

		activeCasinoGames.set(room.roomid, 'blackjack');
	}

	makePlayer(user: User | string | null, ...rest: unknown[]): BlackjackPlayer {
		const num = this.players.length ? this.players[this.players.length - 1].num : 1;
		return new BlackjackPlayer(user, this, num);
	}

	onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		super.onRename(user, oldUserid, isJoining, isForceRenamed);
		this.updateRoom();
	}

	forfeit(user: User | string) {
		const id = typeof user === 'string' ? toID(user) : user.id;
		const player = this.playerTable[id];
		if (!player) return;

		if (this.state === 'lobby') {
			void updateBalance(player.id, player.bet);
			this.removePlayer(player);
			this.updateRoom();
		} else if (this.state === 'playing') {
			if (player.status === 'playing') {
				player.status = 'stood';
				if (this.players[this.turnIndex] === player) {
					void this.nextTurn();
				} else {
					this.updateRoom();
				}
			}
		}
	}

	onConnect(user: User) {
		const html = this.getBoardHtml(user.id);
		user.sendTo(this.roomid, `|uhtml|${this.uid}|${html}`);
	}

	onLeave(user: User, oldUserid?: ID) {
		this.forfeit(user);
	}

	leaveGame(user: User) {
		this.forfeit(user);
	}

	joinGame(user: User) {
		void this.handleJoin(user);
	}

	async handleJoin(user: User) {
		if (this.state !== 'lobby') {
			user.sendTo(this.roomid, "|error|This game has already started.");
			return;
		}
		if (this.players.some(p => p.id === user.id)) {
			user.sendTo(this.roomid, "|error|You are already in this game.");
			return;
		}

		const bal = await getBalance(user.id);
		if (bal < this.bet) {
			user.sendTo(this.roomid, `|error|You don't have enough ${CURRENCY_NAME}. (Cost: ${this.bet}, Balance: ${bal})`);
			return;
		}

		await updateBalance(user.id, -this.bet);
		if (!this.addPlayer(user)) {
			await updateBalance(user.id, this.bet);
			user.sendTo(this.roomid, "|error|You could not join the game (it may be full or you are already in it).");
			return;
		}
		this.updateRoom();
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
				user.sendTo(this.roomid, "|error|You cannot deal without any players.");
				return;
			}
			void this.startDealing();
		} else if (action === 'hit') {
			if (this.state !== 'playing') {
				user.sendTo(this.roomid, "|error|There is no active blackjack game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}

			currentPlayer.hand.push(drawCard());
			const val = calculateHandValue(currentPlayer.hand);

			if (val > 21) {
				currentPlayer.status = 'busted';
				void this.nextTurn();
			} else if (val === 21) {
				currentPlayer.status = 'stood';
				void this.nextTurn();
			} else {
				if (this.timer) clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					currentPlayer.status = 'stood';
					void this.nextTurn();
				}, TURN_TIMEOUT);
				this.updateRoom();
			}
		} else if (action === 'stand') {
			if (this.state !== 'playing') {
				user.sendTo(this.roomid, "|error|There is no active blackjack game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}

			currentPlayer.status = 'stood';
			void this.nextTurn();
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
				`<div class="casino-header">Blackjack Game Cancelled</div><hr>` +
				`${Utils.escapeHTML(message)}<br>All players have been refunded.` +
				`</div>`
			).update();
		}
	}

	async nextTurn() {
		if (this.state !== 'playing') return;

		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}

		while (this.turnIndex < this.players.length) {
			const p = this.players[this.turnIndex];
			if (p.status === 'playing') {
				this.timer = setTimeout(() => {
					p.status = 'stood';
					void this.nextTurn();
				}, TURN_TIMEOUT);
				this.updateRoom();
				return;
			}
			this.turnIndex++;
		}

		await this.dealerTurn();
	}

	async dealerTurn() {
		this.state = 'ended';

		let allBusted = true;
		for (const p of this.players) {
			if (p.status !== 'busted') {
				allBusted = false;
				break;
			}
		}

		if (!allBusted) {
			let dealerVal = calculateHandValue(this.dealerHand);
			while (dealerVal < 17) {
				this.dealerHand.push(drawCard());
				dealerVal = calculateHandValue(this.dealerHand);
			}
		}

		const dealerVal = calculateHandValue(this.dealerHand);
		const dealerBusted = dealerVal > 21;

		for (const p of this.players) {
			if (p.status === 'busted') {
				p.payoutStr = `<span style="color:red">Lost (Bust)</span>`;
			} else if (p.status === 'blackjack') {
				if (this.dealerHand.length === 2 && dealerVal === 21) {
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

		this.updateRoom();
		this.destroy();
	}

	getBoardHtml(userId: string | null): string {
		let html = `<div class="casino-board">`;
		html += `<div class="casino-header">Blackjack <small>(Bet: <b>${this.bet}</b> ${CURRENCY_NAME})</small></div>`;
		html += `Host: ${nameColor(this.hostName, true)}<hr>`;

		if (this.state === 'lobby') {
			html += `<div class="casino-player-list">`;
			if (this.players.length === 0) {
				html += `<i>No players yet</i>`;
			} else {
				for (const p of this.players) {
					html += `<div class="casino-player-badge"><span class="casino-player-name">${nameColor(p.name, true)}</span>Waiting...</div>`;
				}
			}
			html += `</div><hr>`;
			html += `<div>`;
			if (this.players.length < 4 && (!userId || !this.players.some(p => p.id === userId))) {
				html += `<button class="button casino-btn" name="send" value="/joingame">Join Game</button> `;
			}
			if (userId === this.host) {
				html += `<button class="button casino-btn" name="send" value="/choose deal">Deal (Host)</button> `;
				html += `<button class="button casino-btn" name="send" value="/bj end">Cancel Game</button>`;
			}
			html += `</div>`;
			html += `<br><small>This game will automatically start in 60 seconds.</small>`;
		} else {
			const hideFirst = this.state === 'playing';
			const dealerVal = hideFirst ? '?' : calculateHandValue(this.dealerHand);

			if (this.state === 'ended') {
				html += `<div style="padding: 4px; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 6px;">`;
				html += `<b>Dealer's Hand:</b> <small>[${dealerVal}]</small> ${renderHand(this.dealerHand, hideFirst, true)}`;
				html += `</div>`;

				html += `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 8px;">`;
				for (const [i, p] of this.players.entries()) {
					const val = calculateHandValue(p.hand);
					let statusStr = `<small>[${val}]</small> `;
					if (p.status === 'blackjack') {
						statusStr += '<b style="color:#4CAF50;">BJ</b>';
					} else if (p.status === 'busted') {
						statusStr += '<b style="color:#F44336;">Bust</b>';
					} else if (p.status === 'stood') {
						statusStr += '<b style="color:#aaa;">Stood</b>';
					}

					html += `<div style="flex: 1 1 45%; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 4px; border-left: 2px solid #FFC107;">`;
					html += `<b>${nameColor(p.name, true)}</b>: ${statusStr} ${renderHand(p.hand, false, true)}`;
					if (p.payoutStr) html += ` <small>${p.payoutStr}</small>`;
					html += `</div>`;
				}
				html += `</div>`;

				const winners = [];
				for (const p of this.players) {
					if (p.payoutStr?.includes('Won')) {
						const amtMatch = /Won <b>(\d+)<\/b>/.exec(p.payoutStr);
						const amt = amtMatch ? amtMatch[1] : '0';
						winners.push({ name: p.name, amt });
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
					const playerNames = this.players.map(p => `<b>${nameColor(p.name, true)}</b>`).join(', ');
					if (playerNames) winHtml = `The Dealer won the Blackjack against ${playerNames}.`;
					else winHtml = `The Dealer won the Blackjack.`;
				}
				html += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${winHtml}</div>`;
			} else {
				html += `<b>Dealer's Hand:</b> <small>[${dealerVal}]</small><br>`;
				html += renderHand(this.dealerHand, hideFirst) + `<hr>`;

				html += `<div class="casino-player-list">`;
				for (const [i, p] of this.players.entries()) {
					const val = calculateHandValue(p.hand);
					let statusStr = `<small>[${val}]</small> `;
					let badgeClass = '';
					if (p.status === 'blackjack') {
						statusStr += '<b style="color:#4CAF50;">BJ</b>';
						badgeClass = 'active';
					} else if (p.status === 'busted') {
						statusStr += '<b style="color:#F44336;">Bust</b>';
						badgeClass = 'folded';
					} else if (p.status === 'stood') {
						statusStr += '<b style="color:#aaa;">Stood</b>';
						badgeClass = 'eliminated';
					} else {
						badgeClass = 'active';
					}

					const isTurn = this.state === 'playing' && this.turnIndex === i;
					if (isTurn) badgeClass = 'all-in';

					html += `<div class="casino-player-badge ${badgeClass}">`;
					html += `<span class="casino-player-name">${nameColor(p.name, true)}</span>`;
					html += `Status: ${statusStr}<br>`;
					html += `<div style="margin-top: 4px;">${renderHand(p.hand)}</div>`;

					if (isTurn && p.id === userId) {
						html += `<div style="margin-top: 6px; text-align: center;">`;
						html += `<button class="button casino-btn" name="send" value="/choose hit">Hit</button> `;
						html += `<button class="button casino-btn" name="send" value="/choose stand">Stand</button>`;
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

	updateRoom() {
		const room = this.room;
		if (!room) return;

		if (this.state === 'ended') {
			const html = this.getBoardHtml(null);
			room.add(`|uhtmlchange|${this.uid}|${html}`).update();
			return;
		}

		const boardHtml = this.getBoardHtml(null);

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
			u.sendTo(room, `|uhtmlchange|${this.uid}|${this.getBoardHtml(u.id)}`);
		}
	}

	async startDealing() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.state = 'playing';

		this.dealerHand.push(drawCard(), drawCard());
		for (const p of this.players) {
			p.hand.push(drawCard(), drawCard());
			const val = calculateHandValue(p.hand);
			if (val === 21) p.status = 'blackjack';
		}

		await this.nextTurn();
	}

	destroy() {
		if (this.timer) clearTimeout(this.timer);
		activeCasinoGames.delete(this.roomid);
		super.destroy();
	}
}

export const commands: Chat.ChatCommands = {
	bj: 'blackjack',
	blackjack: {
		start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) throw new Chat.ErrorMessage("Usage: /bj start [coins]");

			if (room.game) throw new Chat.ErrorMessage(`A ${room.game.title} game is already running in this room.`);
			if (activeCasinoGames.has(room.roomid)) throw new Chat.ErrorMessage(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const game = new BlackjackGame(room, user, bet);

			room.add(`|uhtml|${game.uid}|${game.getBoardHtml(null)}`).update();
			for (const id in room.users) {
				const u = room.users[id];
				u.sendTo(room, `|uhtmlchange|${game.uid}|${game.getBoardHtml(u.id)}`);
			}
		},

		end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");
			const game = room.getGame(BlackjackGame);
			if (!game) throw new Chat.ErrorMessage("There is no active blackjack game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) throw new Chat.ErrorMessage("Only the host or a room moderator can cancel the game.");

			if (game.state !== 'lobby') throw new Chat.ErrorMessage("The game is already in progress and cannot be cancelled.");

			void game.refundAll(`Cancelled by ${user.name}.`);
			game.destroy();
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Blackjack Commands</b></center><hr>` +
				`<b>/bj start [bet]</b>: Start a Blackjack game with the specified bet.<hr>` +
				`<b>/bj end</b>: Cancel the game. (Host, %, @, #, &, ~)<hr>` +
				`<i>Note: All other actions (joining, hitting, standing) are performed using the interactive buttons on the game board!</i>`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Blackjack Rules</b></center><hr>` +
				`Try to get your hand's value closer to 21 than the dealer's without going over (busting).<br>` +
				`Number cards are worth their face value, face cards are 10, and Aces can be 1 or 11.<br>` +
				`Beating the dealer pays 2x your bet, and getting a natural Blackjack pays 2.5x!`
			);
		},
	},
	blackjackhelp: 'blackjack help',
	bjhelp: 'blackjack help',
	blackjackrules: 'blackjack rules',
	bjrules: 'blackjack rules',
};
