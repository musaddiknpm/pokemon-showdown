/*
* Pokemon Showdown
* Casino Dice chat-plugin
* @author PrinceSky-Git
*/

import { ImpulseDB } from '../../impulse-db';
import { Economy } from '../../modules/economy';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

interface DiceGame {
	_id: string;
	creator: string;
	opponent: string | null;
	betAmount: number;
	creatorRoll: number | null;
	opponentRoll: number | null;
	winner: string | null;
	status: 'waiting' | 'completed';
	createdAt: Date;
	completedAt: Date | null;
	taxCollected?: number;
}

const DiceDB = ImpulseDB<DiceGame>('dicegames');
const activeGames = new Map<string, DiceGame>();
const HOUSE_FEE = 0.10;
const rollDice = (s = 6) => Math.floor(Math.random() * s) + 1;
const validateBet = (a: string) => {
	const amt = parseInt(a);
	if (isNaN(amt) || amt <= 0) return { valid: false, amount: 0, error: 'Invalid amount. Must be positive.' };
	if (amt < 10) return { valid: false, amount: 0, error: 'Minimum bet is 10.' };
	if (amt > 10000) return { valid: false, amount: 0, error: 'Maximum bet is 10000.' };
	return { valid: true, amount: amt };
};
const generateGameHTML = (g: DiceGame, id: string): string => {
	if (g.status === 'completed') {
		let result = 'Tie';
		let color = '#999';
		let taxLine = '';
		if (g.winner === g.creator) {
			result = `${Impulse.nameColor(g.creator, true, false)} Won`;
			color = '#2ecc71';
			taxLine = `<br>Tax Collected: ${Economy.formatMoney(g.taxCollected || 0)}`;
		} else if (g.winner === g.opponent) {
			result = `${Impulse.nameColor(g.opponent, true, false)} Won`;
			color = '#2ecc71';
			taxLine = `<br>Tax Collected: ${Economy.formatMoney(g.taxCollected || 0)}`;
		}
		return `<div class="infobox" style="text-align: center;"><strong>🎲 Dice Game Result</strong><br><br>${Impulse.nameColor(g.creator, false, false)} rolled <strong>${g.creatorRoll}</strong><br>${Impulse.nameColor(g.opponent, false, false)} rolled <strong>${g.opponentRoll}</strong><br><br><strong style="color: ${color};">${result}</strong><br>Bet: ${Economy.formatMoney(g.betAmount)}${taxLine}</div>`;
	}
	return `<div class="infobox" style="text-align: center;"><strong>🎲 Dice Game</strong><br><br>${Impulse.nameColor(g.creator, false, false)} started a game<br>Bet: <strong>${Economy.formatMoney(g.betAmount)}</strong><br><br>${g.opponent ? `${Impulse.nameColor(g.opponent, false, false)} joined!<br>Rolling...` : `<button class="button" name="send" value="/casinodice join ${id}">Join Game</button>`}</div>`;
};

export const commands: Chat.ChatCommands = {
	casinodice: {
		async start(target, room, user) {
			if (!target) return this.parse('/help casinodice');
			const b = validateBet(target.trim());
			if (!b.valid) return this.errorReply(b.error);
			const ue = await Economy.getUser(user.id);
			if (ue.balance < b.amount) return this.errorReply('Insufficient balance for this bet.');
			await Economy.updateBalance(user.id, -b.amount);
			const gid = `dice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const g: DiceGame = { _id: gid, creator: user.id, opponent: null, betAmount: b.amount, creatorRoll: null, opponentRoll: null, winner: null, status: 'waiting', createdAt: new Date(), completedAt: null, taxCollected: 0 };
			activeGames.set(gid, g);
			room.add(`|uhtml|${gid}|${generateGameHTML(g, gid)}`).update();
		},

		async join(target, room, user) {
			const gid = target.trim();
			const g = activeGames.get(gid);
			if (!g) return this.errorReply('Game not found.');
			if (g.status === 'completed') return this.errorReply('Game already completed.');
			if (g.creator === user.id) return this.errorReply('You cannot join your own game.');
			if (g.opponent) return this.errorReply('Game already has an opponent.');
			const je = await Economy.getUser(user.id);
			if (je.balance < g.betAmount) return this.errorReply('Insufficient balance for this bet.');
			await Economy.updateBalance(user.id, -g.betAmount);
			g.opponent = user.id;
			g.creatorRoll = rollDice();
			g.opponentRoll = rollDice();
			if (g.creatorRoll > g.opponentRoll) g.winner = g.creator;
			else if (g.opponentRoll > g.creatorRoll) g.winner = g.opponent;
			g.status = 'completed';
			g.completedAt = new Date();
			
			// Calculate tax before updating HTML
			if (g.winner) {
				const fee = Math.floor(g.betAmount * HOUSE_FEE);
				g.taxCollected = fee;
			} else {
				g.taxCollected = 0;
			}
			
			room.add(`|uhtmlchange|${gid}|${generateGameHTML(g, gid)}`).update();
			activeGames.delete(gid);
			// Handle payouts in background
			(async () => {
				if (g.winner) {
					const l = g.winner === g.creator ? g.opponent : g.creator;
					const winnings = g.betAmount * 2;
					const fee = Math.floor(winnings * HOUSE_FEE);
					await Economy.updateBalance(g.winner, winnings - fee);
				} else {
					await Economy.updateBalance(g.creator, g.betAmount);
					await Economy.updateBalance(g.opponent, g.betAmount);
				}
				await DiceDB.insertOne(g);
			})();
		},

		async end(target, room, user) {
			const gid = target.trim();
			const g = activeGames.get(gid);
			if (!g) return this.errorReply('Game not found.');
			if (g.creator !== user.id) return this.errorReply('Only the creator can end this game.');
			if (g.status === 'completed') return this.errorReply('Game already completed.');
			if (g.opponent) return this.errorReply('Cannot end game once opponent has joined.');
			activeGames.delete(gid);
			this.sendReply(`Game cancelled. Bet amount refunded: ${Economy.formatMoney(g.betAmount)}`);
		},

		async ladder(target, room, user) {
			const page = parseInt(target?.split('page:')[1] || '1') || 1;
			const resultsPerPage = 10;
			
			try {
				const games = await DiceDB.find({ status: 'completed', winner: { $ne: null } });
				
				const earnings: Record<string, number> = {};
				
				games.forEach((game: DiceGame) => {
					if (game.winner) {
						const winnings = game.betAmount * 2;
						const fee = Math.floor(winnings * HOUSE_FEE);
						const netWinnings = winnings - fee;
						earnings[game.winner] = (earnings[game.winner] || 0) + netWinnings;
					}
				});
				
				const sorted = Object.entries(earnings)
					.sort((a, b) => b[1] - a[1])
					.slice((page - 1) * resultsPerPage, page * resultsPerPage);
				
				const totalPages = Math.ceil(Object.keys(earnings).length / resultsPerPage);
				
				const rows = sorted.map(([userId, amount], index) => [
					`${(page - 1) * resultsPerPage + index + 1}`,
					Impulse.nameColor(userId, false, false),
					Economy.formatMoney(amount),
				]);
				
				const output = ImpulseUI.contentTable({
					title: '🎲 Casino Dice Ladder',
					rows: rows.length ? rows : [['No data yet', '', '']],
				});
				
				const pagination = ImpulseUI.pagination({
					commandString: '/casinodice ladder',
					currentPage: page,
					totalPages: Math.max(1, totalPages),
					totalResults: Object.keys(earnings).length,
					resultsPerPage,
				});
				
				this.sendReplyBox(output + pagination);
			} catch (e) {
				this.errorReply('Error fetching ladder data.');
				console.error(e);
			}
		},

		''(target, room, user) {
			return this.parse('/help casinodice');
		},
	},
	
	casinodicehelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(ImpulseUI.contentTable({ title: 'Casino Dice Commands', rows: [[`<code>/casinodice start [amount]</code> - Start a dice game`], [`<code>/casinodice join [id]</code> - Join a game`], [`<code>/casinodice end [id]</code> - End your game`], [`<code>/casinodice ladder</code> - View earnings ladder`], [`<small>Minimum bet: 10 | Maximum bet: 10000</small>`]] }));
	},

	cdice: 'casinodice',
	cdicehelp: 'casinodicehelp',
};
