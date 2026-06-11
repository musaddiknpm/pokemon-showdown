import { wrapCommands } from '../../impulse-utils';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';

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

const DICE_UNICODE: Record<number, string> = {
	1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

const CASINO_ROOM = 'casino';
const AUTO_END_MS = 60 * 1000;

function dieChar(face: number): string {
	return DICE_UNICODE[face] ?? DICE_UNICODE[1];
}

async function expireGame(roomid: string): Promise<void> {
	const game = activeGames.get(roomid);
	if (!game || game.opponent) return;

	await updateBalance(game.host, game.bet);
	activeGames.delete(roomid);

	const room = Rooms.get(roomid);
	room?.add(
		`|uhtmlchange|${game.uid}|` +
		`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
		`<b>Dice Game Expired</b><hr>` +
		`No one joined in time. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.` +
		`</div>`
	).update();
}

export const commands: Chat.ChatCommands = wrapCommands({
	dice: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /dice start [coins]");

			if (activeGames.has(room.roomid)) return this.errorReply("A dice game is already running in this room.");

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

			const html =
				`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
				`<b>${nameColor(user.name, true)}</b> has started a game of dice for <b>${bet}</b> ${CURRENCY_NAME}` +
				`<br><br>` +
				`<span style="font-size:32px;">⚀ ⚂ ⚄</span>` +
				`<br><br>` +
				`<button class="button" name="send" value="/dice join" style="padding:6px 20px;font-size:13px;">Join The Game</button>` +
				`<br><br><small style="color:#888;">This game will expire in 60 seconds if no one joins.</small>` +
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

			room.add(`|uhtmlchange|${game.uid}|<div class="infobox" style="text-align:center;">The dice game was cancelled. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.</div>`).update();
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

			let resultLine: string;
			if (hostRoll > opponentRoll) {
				await updateBalance(game.host, totalPot);
				resultLine = `${nameColor(game.hostName, true)} wins <b>${totalPot}</b> ${CURRENCY_NAME}!`;
			} else if (opponentRoll > hostRoll) {
				await updateBalance(user.id, totalPot);
				resultLine = `${nameColor(user.name, true)} wins <b>${totalPot}</b> ${CURRENCY_NAME}!`;
			} else {
				await updateBalance(game.host, game.bet);
				await updateBalance(user.id, game.bet);
				resultLine = `It's a tie! Both players have been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.`;
			}

			const resultHtml =
				`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
				`<b>Dice Game Results</b><hr>` +
				`${nameColor(game.hostName, true)} has rolled <span style="font-size:36px;line-height:1;vertical-align:middle;">${dieChar(hostRoll)}</span>` +
				`<br>` +
				`${nameColor(user.name, true)} has rolled <span style="font-size:36px;line-height:1;vertical-align:middle;">${dieChar(opponentRoll)}</span>` +
				`<hr>${resultLine}` +
				`</div>`;

			activeGames.delete(room.roomid);
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
		}
	},
	dicehelp: 'dice help',
});
