import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM } from './shared';

interface DiceGame {
	host: string;
	hostName: string;
	opponent: string | null;
	bet: number;
	roomid: string;
	uid: string;
	timer: NodeJS.Timeout;
}

const activeGames = new Map<string, DiceGame>();

const AUTO_END_MS = 60 * 1000;

async function expireGame(roomid: string): Promise<void> {
	const game = activeGames.get(roomid);
	if (!game || game.opponent) return;

	await updateBalance(game.host, game.bet);
	activeGames.delete(roomid);
	activeCasinoGames.delete(roomid);

	const room = Rooms.get(roomid);
	room?.add(
		`|uhtmlchange|${game.uid}|` +
		`<div class="casino-board">` +
		`<div class="casino-header">Dice Game Expired</div><hr>` +
		`No one joined in time. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.` +
		`</div>`
	).update();
}

export const commands: Chat.ChatCommands = {
	dice: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /dice start [coins]");

			if (activeCasinoGames.has(room.roomid)) return this.errorReply(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const bal = await getBalance(user.id);
			if (bal < bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Balance: ${bal})`);

			await updateBalance(user.id, -bet);

			const uid = `dice-${room.roomid}-${Date.now()}`;
			const timer = setTimeout(() => void expireGame(room.roomid), AUTO_END_MS);

			activeGames.set(room.roomid, {
				host: user.id,
				hostName: user.name,
				opponent: null,
				bet,
				roomid: room.roomid,
				uid,
				timer,
			});
			activeCasinoGames.set(room.roomid, 'dice');

			const html =
				`<div class="casino-board">` +
				`<div class="casino-header">Dice Game <small>(Bet: <b>${bet}</b> ${CURRENCY_NAME})</small></div><hr>` +
				`<b>${nameColor(user.name, true)}</b> is looking for an opponent!` +
				`<br><br>` +
				`<span class="casino-dice">⚀</span> <span class="casino-dice">⚂</span> <span class="casino-dice">⚄</span>` +
				`<br><br>` +
				`<button class="button casino-btn" name="send" value="/dice join">Join The Game</button>` +
				`<br><br><small>This game will expire in 60 seconds if no one joins.</small>` +
				`</div>`;

			room.add(`|uhtml|${uid}|${html}`).update();
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active dice game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) return this.errorReply("Only the host or a room moderator can end the game.");

			if (game.opponent) return this.errorReply("The game is already in progress and cannot be ended.");

			clearTimeout(game.timer);
			await updateBalance(game.host, game.bet);
			activeGames.delete(room.roomid);
			activeCasinoGames.delete(room.roomid);

			room.add(`|uhtmlchange|${game.uid}|<div class="casino-board">The dice game was cancelled. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.</div>`).update();
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active dice game in this room.");
			if (user.id === game.host) return this.errorReply("You cannot join your own dice game.");
			if (game.opponent) return this.errorReply("This dice game already has two players.");

			const bal = await getBalance(user.id);
			if (bal < game.bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Cost: ${game.bet}, Balance: ${bal})`);

			clearTimeout(game.timer);
			await updateBalance(user.id, -game.bet);
			game.opponent = user.id;

			const hostRoll = Math.floor(Math.random() * 6) + 1;
			const opponentRoll = Math.floor(Math.random() * 6) + 1;
			const totalPot = game.bet * 2;

			let winHtml = `<b>${nameColor(game.hostName, true)}</b> rolled <b>${hostRoll}</b> | <b>${nameColor(user.name, true)}</b> rolled <b>${opponentRoll}</b><br>`;
			if (hostRoll > opponentRoll) {
				await updateBalance(game.host, game.bet * 2);
				winHtml += `<b>${nameColor(game.hostName, true)}</b> has won the Dice and <b>${game.bet * 2}</b> ${CURRENCY_NAME}!`;
			} else if (opponentRoll > hostRoll) {
				await updateBalance(user.id, game.bet * 2);
				winHtml += `<b>${nameColor(user.name, true)}</b> has won the Dice and <b>${game.bet * 2}</b> ${CURRENCY_NAME}!`;
			} else {
				await updateBalance(game.host, game.bet);
				await updateBalance(user.id, game.bet);
				winHtml += `The dice game ended in a tie.`;
			}

			const resultHtml = `<div class="infobox" style="padding: 8px 12px; text-align: center;">${winHtml}</div>`;

			activeGames.delete(room.roomid);
			activeCasinoGames.delete(room.roomid);
			room.add(`|uhtmlchange|${game.uid}|${resultHtml}`).update();
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Dice Commands</b></center><hr>` +
				`<b>/dice start [bet]</b>: Start a Dice game with the specified bet.<hr>` +
				`<b>/dice join</b>: Join the current Dice game.<hr>` +
				`<b>/dice end</b>: Cancel the game (Host/Moderator only).`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Dice Rules</b></center><hr>` +
				`Roll a 6-sided die against an opponent. Highest roll wins the entire pot!<br>` +
				`In the event of a tie, both players are refunded.`
			);
		}
	},
	dicehelp: 'dice help',
	dicerules: 'dice rules',
};
