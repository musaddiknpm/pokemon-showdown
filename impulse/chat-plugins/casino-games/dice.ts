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
}

const activeGames = new Map<string, DiceGame>();

const DICE_DOTS: Record<number, [number, number][]> = {
	1: [[20, 20]],
	2: [[28, 12], [12, 28]],
	3: [[28, 12], [20, 20], [12, 28]],
	4: [[12, 12], [28, 12], [12, 28], [28, 28]],
	5: [[12, 12], [28, 12], [20, 20], [12, 28], [28, 28]],
	6: [[12, 12], [12, 20], [12, 28], [28, 12], [28, 20], [28, 28]],
};

function dieSVG(face: number, size = 44): string {
	const dots = (DICE_DOTS[face] ?? DICE_DOTS[1])
		.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#333"/>`)
		.join('');
	return (
		`<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="margin:0 4px;vertical-align:middle;">` +
		`<rect x="1" y="1" width="38" height="38" rx="6" ry="6" fill="white" stroke="#666" stroke-width="2"/>` +
		`${dots}` +
		`</svg>`
	);
}

export const commands: Chat.ChatCommands = wrapCommands({
	dice: {
		async start(target, room, user) {
			if (!room || room.battle) return this.errorReply("This command must be used in a chat room.");

			const bet = parseInt(target.trim());
			if (isNaN(bet) || bet <= 0) return this.errorReply("Usage: /dice start [coins]");

			if (activeGames.has(room.roomid)) return this.errorReply("A dice game is already running in this room.");

			const bal = await getBalance(user.id);
			if (bal < bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Balance: ${bal})`);

			await updateBalance(user.id, -bet);

			const uid = `dice-${room.roomid}-${Date.now()}`;
			activeGames.set(room.roomid, {
				host: user.id,
				hostName: user.name,
				opponent: null,
				bet,
				roomid: room.roomid,
				uid,
			});

			const html =
				`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
				`<b>${nameColor(user.name, true)}</b> has started a game of dice for <b>${bet}</b> ${CURRENCY_NAME}` +
				`<br><br>` +
				`${dieSVG(2)}${dieSVG(5)}${dieSVG(3)}` +
				`<br><br>` +
				`<button class="button" name="send" value="/dice join" style="padding:6px 20px;font-size:13px;">Join The Game</button>` +
				`</div>`;

			room.add(`|uhtml|${uid}|${html}`).update();
		},

		async end(target, room, user) {
			if (!room || room.battle) return this.errorReply("This command must be used in a chat room.");

			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active dice game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) return this.errorReply("Only the host or a room moderator can end the game.");

			if (game.opponent) return this.errorReply("The game is already in progress and cannot be ended.");

			await updateBalance(game.host, game.bet);
			activeGames.delete(room.roomid);

			room.add(`|uhtmlchange|${game.uid}|<div class="infobox" style="text-align:center;">The dice game was cancelled. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.</div>`).update();
		},

		async join(target, room, user) {
			if (!room || room.battle) return this.errorReply("This command must be used in a chat room.");

			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active dice game in this room.");
			if (user.id === game.host) return this.errorReply("You cannot join your own dice game.");
			if (game.opponent) return this.errorReply("This dice game already has two players.");

			const bal = await getBalance(user.id);
			if (bal < game.bet) return this.errorReply(`You don't have enough ${CURRENCY_NAME}. (Cost: ${game.bet}, Balance: ${bal})`);

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
				`${nameColor(game.hostName, true)}: ${dieSVG(hostRoll, 36)} <b>${hostRoll}</b>` +
				`&nbsp;&nbsp;&nbsp;` +
				`${nameColor(user.name, true)}: ${dieSVG(opponentRoll, 36)} <b>${opponentRoll}</b>` +
				`<hr>${resultLine}` +
				`</div>`;

			activeGames.delete(room.roomid);
			room.add(`|uhtmlchange|${game.uid}|${resultHtml}`).update();
		},
	},
});
