import { updateBalance, CONFIG } from './chat-plugins/economy/economy';
import type { TournamentPlayer } from '../server/tournaments';

export function rewardTournamentWinners(rawResults: TournamentPlayer[][], totalPlayers: number, room: Room) {
	if (totalPlayers < 4) return;
	if (!['lobby', 'tournaments'].includes(room.roomid)) return;

	const winners = rawResults[0];
	const runnerUps = rawResults[1];

	// Base rewards + dynamic bonus based on player count
	const winnerReward = 4 + totalPlayers;
	const runnerUpReward = 2 + Math.floor(totalPlayers / 2);

	const messages: string[] = [];

	if (winners) {
		for (const winner of winners) {
			void updateBalance(winner.id, winnerReward);
			messages.push(`<b>${winner.name}</b> has earned <b>${winnerReward}</b> ${CONFIG.CURRENCY} for winning the tournament!`);
		}
	}
	if (runnerUps) {
		for (const runnerUp of runnerUps) {
			void updateBalance(runnerUp.id, runnerUpReward);
			messages.push(`<b>${runnerUp.name}</b> has earned <b>${runnerUpReward}</b> ${CONFIG.CURRENCY} for placing runner-up!`);
		}
	}

	if (messages.length > 0) {
		room.add(`|html|<div class="infobox">${messages.join('<br />')}</div>`);
		room.update();
	}
}
