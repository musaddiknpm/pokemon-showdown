import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM } from './shared';
import { SimpleRoomGame } from '../../../server/room-game';

const AUTO_END_MS = 60 * 1000;

export class DiceGame extends SimpleRoomGame {
	gameid = 'dice' as ID;
	uid: string;
	host: string;
	hostName: string;
	bet: number;
	timer: NodeJS.Timeout | null = null;
	allowRenames = true;
	playerCap = 2;
	checkChat = true;

	constructor(room: Room, host: User, bet: number) {
		super(room);
		this.title = 'Dice';
		this.uid = `dice-${room.roomid}-${Date.now()}`;
		this.host = host.id;
		this.hostName = host.name;
		this.bet = bet;

		this.timer = setTimeout(() => void this.expireGame(), AUTO_END_MS);

		activeCasinoGames.set(room.roomid, 'dice');
	}

	async expireGame(): Promise<void> {
		if (!this.timer) return;
		if (this.players.length >= 2) return;

		await updateBalance(this.host, this.bet);

		if (this.room) {
			this.room.add(
				`|uhtmlchange|${this.uid}|` +
				`<div class="casino-board">` +
				`<div class="casino-header">Dice Game Expired</div><hr>` +
				`No one joined in time. <b>${nameColor(this.hostName, true)}</b> has been refunded <b>${this.bet}</b> ${CURRENCY_NAME}.` +
				`</div>`
			).update();
		}
		this.destroy();
	}

	forfeit(user: User | string) {
		const id = typeof user === 'string' ? toID(user) : user.id;
		if (this.host === id) {
			void this.expireGame();
		}
	}

	onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		super.onRename(user, oldUserid, isJoining, isForceRenamed);
		if (this.host === oldUserid) {
			this.host = user.id;
			this.hostName = user.name;
		}
		this.runBroadcast();
	}

	onConnect(user: User) {
		const html = `<div class="casino-board">` +
			`<div class="casino-header">Dice Game</div><hr>` +
			`<b>${nameColor(this.hostName, true)}</b> is hosting a dice game for <b>${this.bet}</b> ${CURRENCY_NAME}.` +
			`<br><br>` +
			`<span class="casino-dice">⚀</span> <span class="casino-dice">⚂</span> <span class="casino-dice">⚄</span>` +
			`<br><br>` +
			`<button class="button casino-btn" name="send" value="/joingame">Join The Game</button>` +
			`<br><br><small>This game will expire in 60 seconds if no one joins.</small>` +
			`</div>`;
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
		if (this.players.length >= 2) {
			user.sendTo(this.roomid, "|error|This dice game already has two players.");
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

		const hostRoll = Math.floor(Math.random() * 6) + 1;
		const opponentRoll = Math.floor(Math.random() * 6) + 1;
		const p2 = this.players[1];
		let resultHtml = `<b>${nameColor(this.hostName, true)}</b> rolled a <b>${hostRoll}</b>.<br>`;
		resultHtml += `<b>${nameColor(p2.name, true)}</b> rolled a <b>${opponentRoll}</b>.<br><br>`;

		if (hostRoll > opponentRoll) {
			const winnings = this.bet * 2;
			await updateBalance(this.host, winnings);
			resultHtml += `<b>${nameColor(this.hostName, true)}</b> won <b>${winnings}</b> ${CURRENCY_NAME}!`;
		} else if (opponentRoll > hostRoll) {
			const winnings = this.bet * 2;
			await updateBalance(p2.id, winnings);
			resultHtml += `<b>${nameColor(p2.name, true)}</b> won <b>${winnings}</b> ${CURRENCY_NAME}!`;
		} else {
			await updateBalance(this.host, this.bet);
			await updateBalance(p2.id, this.bet);
			resultHtml += `It's a tie! Both players were refunded <b>${this.bet}</b> ${CURRENCY_NAME}.`;
		}

		const html = `<div class="casino-board">` +
			`<div class="casino-header">Dice Game Resolved</div><hr>` +
			resultHtml +
			`</div>`;

		this.room?.add(`|uhtmlchange|${this.uid}|${html}`).update();
		this.destroy();
	}

	destroy() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		activeCasinoGames.delete(this.roomid);
		super.destroy();
	}
}

export const commands: Chat.ChatCommands = {
	dice: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) throw new Chat.ErrorMessage("Usage: /dice start [coins]");

			if (room.game) throw new Chat.ErrorMessage(`A ${room.game.title} game is already running in this room.`);
			if (activeCasinoGames.has(room.roomid)) throw new Chat.ErrorMessage(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const bal = await getBalance(user.id);
			if (bal < bet) throw new Chat.ErrorMessage(`You don't have enough ${CURRENCY_NAME}. (Balance: ${bal})`);

			await updateBalance(user.id, -bet);

			const game = new DiceGame(room, user, bet);
			game.addPlayer(user); // Host becomes player 1

			const html =
				`<div class="casino-board">` +
				`<div class="casino-header">Dice Game <small>(Bet: <b>${bet}</b> ${CURRENCY_NAME})</small></div><hr>` +
				`<b>${nameColor(user.name, true)}</b> is looking for an opponent!` +
				`<br><br>` +
				`<span class="casino-dice">⚀</span> <span class="casino-dice">⚂</span> <span class="casino-dice">⚄</span>` +
				`<br><br>` +
				`<button class="button casino-btn" name="send" value="/joingame">Join The Game</button>` +
				`<br><br><small>This game will expire in 60 seconds if no one joins.</small>` +
				`</div>`;

			room.add(`|uhtml|${game.uid}|${html}`).update();
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");

			const game = room.getGame(DiceGame);
			if (!game) throw new Chat.ErrorMessage("No active dice game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) throw new Chat.ErrorMessage("Only the host or a room moderator can end the game.");

			if (game.players.length >= 2) throw new Chat.ErrorMessage("The game is already in progress and cannot be ended.");

			await updateBalance(game.host, game.bet);

			room.add(`|uhtmlchange|${game.uid}|<div class="casino-board">The dice game was cancelled. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.</div>`).update();
			game.destroy();
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Dice Commands</b></center><hr>` +
				`<b>/dice start [bet]</b>: Start a Dice game with the specified bet.<hr>` +
				`<b>/dice end</b>: Cancel the game (Host/Moderator only).<hr>` +
				`<i>Note: Joining is performed using the interactive button on the game board!</i>`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Dice Rules</b></center><hr>` +
				`Roll a 6-sided die against an opponent. Highest roll wins the entire pot!<br>` +
				`In the event of a tie, both players are refunded.`
			);
		},
	},
	dicehelp: 'dice help',
	dicerules: 'dice rules',
};
