/*
* Pokemon Showdown
* Economy chat-plugin
* @author PrinceSky-Git
*/

import { Economy } from '../../modules/economy';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const validateAmount = (amountStr: string): { valid: boolean; amount: number; error?: string } => {
	const amount = parseInt(amountStr);
	if (isNaN(amount) || amount <= 0) {
		return { valid: false, amount: 0, error: 'Invalid amount. Must be positive.' };
	}
	return { valid: true, amount };
};

const notifyUser = (userId: string, staffName: string, message: string) => {
	const userObj = Users.get(userId);
	if (userObj?.connected) {
		userObj.send(`|pm|${Users.get(staffName)?.getIdentity()}|${userObj.getIdentity()}|${message}`);
	}
};

export const commands: Chat.ChatCommands = {
	economy: {
		async transfer(target, room, user) {
			if (!target) return this.parse('/help economy');

			const [targetUser, amountStr] = target.split(',').map(p => p.trim());
			if (!targetUser || !amountStr) return this.errorReply('Usage: /economy transfer [user], [amount]');

			const amountCheck = validateAmount(amountStr);
			if (!amountCheck.valid) return this.errorReply(amountCheck.error);

			const targetId = toID(targetUser);
			if (targetId === user.id) return this.errorReply('Cannot transfer to yourself.');

			const result = await Economy.transferMoney(user.id, targetId, amountCheck.amount, 'User transfer');
			if (!result.success) return this.errorReply(result.error || 'Transfer failed.');

			this.sendReply(`Transferred ${Economy.formatMoney(amountCheck.amount)} to ${targetUser}. Balance: ${Economy.formatMoney(result.fromBalance)}`);
			notifyUser(targetId, user.name, `You received ${Economy.formatMoney(amountCheck.amount)} from ${user.name}. Balance: ${Economy.formatMoney(result.toBalance)}`);
		},

		async ladder(target, room, user) {
			if (!this.runBroadcast()) return;
			const result = await Economy.getLeaderboard(parseInt(target) || 1, 10);
			if (result.total === 0) return this.sendReplyBox('No economy data.');

			const rows = result.docs.map((ecoUser, idx) => [
				`<strong>#${(result.page - 1) * result.limit + idx + 1}</strong>`,
				Impulse.nameColor(ecoUser._id, true, false),
				Economy.formatMoney(ecoUser.netWorth),
			]);

			const tableHTML = ImpulseUI.contentTable({
				title: `Economy Leaderboard`,
				header: ['Rank', 'User', 'Net Worth'],
				rows,
			});

			const pagination = ImpulseUI.pagination({
				commandString: '/economy ladder',
				currentPage: result.page,
				totalPages: result.totalPages,
				totalResults: result.total,
				resultsPerPage: result.limit,
			});

			this.sendReply(`|raw|${tableHTML}${pagination}`);
		},

		async history(target, room, user) {
			if (!this.runBroadcast()) return;
			const limit = Math.min(Math.max(parseInt(target) || 10, 1), 50);
			const transactions = await Economy.getTransactionHistory(user.id, limit);

			if (!transactions.length) return this.sendReplyBox('No history found.');

			const rows = transactions.map(txn => {
				const isReceiver = txn.to === user.id;
				const party = isReceiver ? txn.from : txn.to;
				const arrow = isReceiver ? '←' : '→';
				const color = isReceiver ? 'green' : 'red';
				const sign = isReceiver ? '+' : '-';

				return [
					`<span style="color: ${color}">${sign}${Economy.formatMoney(txn.amount)}</span>`,
					`${arrow} ${party === 'system' ? 'System' : Impulse.nameColor(party, true, false)}`,
					txn.type,
					txn.reason || '-',
					new Date(txn.timestamp).toLocaleString(),
				];
			});

			const tableHTML = ImpulseUI.contentTable({
				title: `Transaction History (Last ${transactions.length})`,
				header: ['Amount', 'Party', 'Type', 'Reason', 'Date'],
				rows,
			});

			this.sendReply(`|raw|${tableHTML}`);
		},

		async deposit(target, room, user) {
			if (!target) return this.parse('/help economy');

			const amountCheck = validateAmount(target);
			if (!amountCheck.valid) return this.errorReply(amountCheck.error);

			const result = await Economy.depositToBank(user.id, amountCheck.amount);
			if (!result.success) return this.errorReply(result.error || 'Deposit failed.');

			const ecoUser = await Economy.getUser(user.id);
			this.sendReply(`Deposited ${Economy.formatMoney(amountCheck.amount)}. Bank: ${Economy.formatMoney(ecoUser.bank)}`);
		},

		async withdraw(target, room, user) {
			if (!target) return this.parse('/help economy');

			const amountCheck = validateAmount(target);
			if (!amountCheck.valid) return this.errorReply(amountCheck.error);

			const result = await Economy.withdrawFromBank(user.id, amountCheck.amount);
			if (!result.success) return this.errorReply(result.error || 'Withdrawal failed.');

			const ecoUser = await Economy.getUser(user.id);
			this.sendReply(`Withdrew ${Economy.formatMoney(amountCheck.amount)}. Balance: ${Economy.formatMoney(ecoUser.balance)}`);
		},

		async stats(target, room, user) {
			if (!this.runBroadcast()) return;
			this.checkCan('roomowner');

			const stats = await Economy.getStats();

			let rows: string[][] = [
				[`<strong>Total Users:</strong> ${stats.totalUsers}`],
				[`<strong>Circulation:</strong> ${Economy.formatMoney(stats.totalMoney.totalBalance)}`],
				[`<strong>In Banks:</strong> ${Economy.formatMoney(stats.totalMoney.totalBank)}`],
				[`<strong>Net Worth:</strong> ${Economy.formatMoney(stats.totalMoney.totalNetWorth)}`],
				[`<strong>Transactions:</strong> ${stats.totalTransactions}`],
			];

			if (stats.richestUsers.length) {
				rows.push([`<strong>Top 5 Richest:</strong>`]);
				stats.richestUsers.slice(0, 5).forEach((richUser, i) => {
					rows.push([`${i + 1}. ${Impulse.nameColor(richUser._id, true, false)}: ${Economy.formatMoney(richUser.netWorth)}`]);
				});
			}

			if (stats.recentTransactions.length) {
				rows.push([`<strong>Recent Transactions:</strong>`]);
				stats.recentTransactions.forEach(txn => {
					const from = txn.from === 'system' ? 'System' : txn.from;
					const to = txn.to === 'system' ? 'System' : txn.to;
					rows.push([`${from} → ${to}: ${Economy.formatMoney(txn.amount)} (${txn.type})`]);
				});
			}

			const tableHTML = ImpulseUI.contentTable({
				title: 'Economy Statistics',
				rows,
			});

			this.sendReply(`|raw|${tableHTML}`);
		},

		async give(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/help economy');

			const [targetUser, amountStr, ...reasonParts] = target.split(',').map(p => p.trim());
			if (!targetUser || !amountStr) return this.errorReply('Usage: /economy give [user], [amount], [reason]');

			const amountCheck = validateAmount(amountStr);
			if (!amountCheck.valid) return this.errorReply(amountCheck.error);

			const targetId = toID(targetUser);
			const reason = reasonParts.join(',') || 'Staff reward';

			await Economy.updateBalance(targetId, amountCheck.amount);
			await Economy.logTransaction({
				from: 'system',
				to: targetId,
				amount: amountCheck.amount,
				type: 'give',
				reason,
				timestamp: new Date(),
			});

			this.sendReply(`Gave ${Economy.formatMoney(amountCheck.amount)} to ${targetUser}. Reason: ${reason}`);
			notifyUser(targetId, user.name, `You received ${Economy.formatMoney(amountCheck.amount)} from staff. Reason: ${reason}`);
		},

		async take(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/help economy');

			const [targetUser, amountStr, ...reasonParts] = target.split(',').map(p => p.trim());
			if (!targetUser || !amountStr) return this.errorReply('Usage: /economy take [user], [amount], [reason]');

			const amountCheck = validateAmount(amountStr);
			if (!amountCheck.valid) return this.errorReply(amountCheck.error);

			const targetId = toID(targetUser);
			const reason = reasonParts.join(',') || 'Staff penalty';

			const ecoUser = await Economy.getUser(targetId);
			if (ecoUser.balance < amountCheck.amount) {
				return this.errorReply('Insufficient balance.');
			}

			await Economy.updateBalance(targetId, -amountCheck.amount);
			await Economy.logTransaction({
				from: targetId,
				to: 'system',
				amount: amountCheck.amount,
				type: 'take',
				reason,
				timestamp: new Date(),
			});

			this.sendReply(`Took ${Economy.formatMoney(amountCheck.amount)} from ${targetUser}. Reason: ${reason}`);
			notifyUser(targetId, user.name, `${Economy.formatMoney(amountCheck.amount)} removed from account by staff. Reason: ${reason}`);
		},

		async reset(target, room, user) {
			this.checkCan('bypassall');
			if (!target) return this.parse('/help economy');

			const targetId = toID(target.trim());
			await Economy.resetUser(targetId);

			this.sendReply(`Reset economy for ${target}.`);
		},

		async deleteall(target, room, user) {
			this.checkCan('bypassall');	
			const ecoUserCount = await Economy.EconomyDB.countDocuments();
			const transactionCount = await Economy.TransactionDB.countDocuments();
			
			await Economy.EconomyDB.deleteMany({});
			await Economy.TransactionDB.deleteMany({});
			
			this.sendReply(`Deleted all economy data: ${ecoUserCount} users and ${transactionCount} transactions.`);
		},
	},
	eco: 'economy',

	async balance(target, room, user) {
		if (!this.runBroadcast()) return;
		const userid = toID(target?.trim() || user.name);
		const ecoUser = await Economy.getUser(userid);

		const info = [
			`<strong>Economy Profile for ${target || user.name}</strong><br>`,
			`Balance: ${Economy.formatMoney(ecoUser.balance)}<br>`,
			`Bank: ${Economy.formatMoney(ecoUser.bank)}<br>`,
			`Net Worth: ${Economy.formatMoney(ecoUser.netWorth)}<br>`,
			`Transactions: ${ecoUser.transactions}`,
		].join('');

		this.sendReply(`|html|<div class="infobox">${info}</div>`);
	},
	bal: 'balance',
	atm: 'balance',
	money: 'balance',

	economyhelp(target, room, user) {
		if (!this.runBroadcast()) return;

		const rows = [
			[`<code>/balance [user]</code> - View balance`],
			[`<code>/economy transfer [user], [amount]</code> - Transfer money`],
			[`<code>/economy deposit [amount]</code> - Deposit to bank`],
			[`<code>/economy withdraw [amount]</code> - Withdraw from bank`],
			[`<code>/economy ladder [page]</code> - Top richest users`],
			[`<code>/economy history [limit]</code> - Your history (max 50)`],
			[`<code>/economy stats</code> - Statistics (&)`],
			[`<code>/economy give [user], [amount], [reason]</code> - Give money (&)`],
			[`<code>/economy take [user], [amount], [reason]</code> - Take money (&)`],
			[`<code>/economy reset [user]</code> - Reset user's balance (~)`],
			[`<code>/economy deleteall</code> - Reset everyone's balance and transactions (~)`],
			[`<small>Currency: ${Economy.CURRENCY.name} (${Economy.CURRENCY.symbol})</small>`],
		];

		const tableHTML = ImpulseUI.contentTable({
			title: 'Economy Commands',
			rows,
		});

		this.sendReplyBox(tableHTML);
	},
	ecohelp: 'economyhelp',
};
