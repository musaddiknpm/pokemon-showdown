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

			room.add(`|uhtml|${uid}|<div class="infobox"><b>${nameColor(user.name, true)}</b> started a dice game for <b>${bet}</b> ${CURRENCY_NAME}! Use <code>/dice join</code> to play.</div>`).update();
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

			room.add(`|uhtmlchange|${game.uid}|<div class="infobox">The dice game was cancelled. <b>${nameColor(game.hostName, true)}</b> has been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.</div>`).update();
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

			let resultHtml = `<div class="infobox">`;
			resultHtml += `<center><b>Dice Game Results</b></center><hr>`;
			resultHtml += `${nameColor(game.hostName, true)}: rolled <b>${hostRoll}</b><br>`;
			resultHtml += `${nameColor(user.name, true)}: rolled <b>${opponentRoll}</b><br><hr>`;

			const totalPot = game.bet * 2;

			if (hostRoll > opponentRoll) {
				await updateBalance(game.host, totalPot);
				resultHtml += `${nameColor(game.hostName, true)} wins <b>${totalPot}</b> ${CURRENCY_NAME}!`;
			} else if (opponentRoll > hostRoll) {
				await updateBalance(user.id, totalPot);
				resultHtml += `${nameColor(user.name, true)} wins <b>${totalPot}</b> ${CURRENCY_NAME}!`;
			} else {
				await updateBalance(game.host, game.bet);
				await updateBalance(user.id, game.bet);
				resultHtml += `It's a tie! Both players have been refunded <b>${game.bet}</b> ${CURRENCY_NAME}.`;
			}

			resultHtml += `</div>`;

			activeGames.delete(room.roomid);
			room.add(`|uhtmlchange|${game.uid}|${resultHtml}`).update();
		},
	},
});
