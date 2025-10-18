/*
* Pokemon Showdown
* Economy Module
* @author PrinceSky-Git
*/
import { ImpulseDB } from '../impulse-db';
import { checkAndAwardEconomyBadge } from '../chat-plugins/badges/badges-config';

export interface EconomyUser {
	_id: string;
	balance: number;
	bank: number;
	netWorth: number;
	transactions: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Transaction {
	_id?: any;
	from: string;
	to: string;
	amount: number;
	type: 'transfer' | 'give' | 'take' | 'shop' | 'reward';
	reason?: string;
	timestamp: Date;
}

const EconomyDB = ImpulseDB<EconomyUser>('economy');
const TransactionsDB = ImpulseDB<Transaction>('transactions');

export const CURRENCY = { name: 'PokéBucks', symbol: '$' };

export const ECONOMY_CONFIG = {
	startingBalance: 100,
	maxBalance: 1000000000,
	maxTransfer: 100000,
	bankInterestRate: 0.01,
};

export const getEconomyUser = async (userid: string): Promise<EconomyUser> => {
	let user = await EconomyDB.findOne({ _id: userid });
	if (!user) {
		const now = new Date();
		user = {
			_id: userid,
			balance: ECONOMY_CONFIG.startingBalance,
			bank: 0,
			netWorth: ECONOMY_CONFIG.startingBalance,
			transactions: 0,
			createdAt: now,
			updatedAt: now,
		};
		await EconomyDB.insertOne(user);
	}
	return user;
};

export const updateBalance = async (userid: string, amount: number, updateBank = false): Promise<EconomyUser> => {
	const user = await getEconomyUser(userid);
	const newBalance = updateBank ? user.balance : user.balance + amount;
	const newBank = updateBank ? user.bank + amount : user.bank;
	const newNetWorth = newBalance + newBank;

	await EconomyDB.updateOne({ _id: userid }, {
		$set: { balance: newBalance, bank: newBank, netWorth: newNetWorth, updatedAt: new Date() }
	});

	await checkAndAwardEconomyBadge(userid);

	return { ...user, balance: newBalance, bank: newBank, netWorth: newNetWorth, updatedAt: new Date() };
};

export const transferMoney = async (from: string, to: string, amount: number, reason?: string): Promise<{ success: boolean; error?: string; fromBalance?: number; toBalance?: number }> => {
	if (amount <= 0) return { success: false, error: 'Amount must be positive' };
	if (amount > ECONOMY_CONFIG.maxTransfer) return { success: false, error: `Max transfer: ${formatMoney(ECONOMY_CONFIG.maxTransfer)}` };

	const fromUser = await getEconomyUser(from);
	if (fromUser.balance < amount) return { success: false, error: 'Insufficient balance' };

	await updateBalance(from, -amount);
	const updatedTo = await updateBalance(to, amount);

	await logTransaction({ from, to, amount, type: 'transfer', reason, timestamp: new Date() });
	await EconomyDB.updateOne({ _id: from }, { $inc: { transactions: 1 } });
	await EconomyDB.updateOne({ _id: to }, { $inc: { transactions: 1 } });

	const updatedFrom = await getEconomyUser(from);
	return { success: true, fromBalance: updatedFrom.balance, toBalance: updatedTo.balance };
};

export const logTransaction = (txn: Transaction): Promise<void> => TransactionsDB.insertOne(txn);

export const getTransactionHistory = (userid: string, limit = 10): Promise<Transaction[]> => 
	TransactionsDB.find({ $or: [{ from: userid }, { to: userid }] }, { sort: { timestamp: -1 }, limit });

export const formatMoney = (amount: number | undefined | null): string => 
	`${CURRENCY.symbol}${(amount ?? 0).toLocaleString()}`;

export const formatCooldown = (ms: number): string => {
	const h = Math.floor(ms / (60 * 60 * 1000));
	const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
	const s = Math.floor((ms % (60 * 1000)) / 1000);

	const parts: string[] = [];
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	if (s > 0) parts.push(`${s}s`);

	return parts.length ? parts.join(' ') : '0s';
};

export const getEconomyStats = async () => {
	const totalUsers = await EconomyDB.countDocuments({});
	const [totalMoneyResult] = await EconomyDB.aggregate([
		{ $group: { _id: null, totalBalance: { $sum: '$balance' }, totalBank: { $sum: '$bank' }, totalNetWorth: { $sum: '$netWorth' } } }
	]);

	const richestUsers = await EconomyDB.find({}, { sort: { netWorth: -1 }, limit: 10 });
	const totalTransactions = await TransactionsDB.countDocuments({});
	const recentTransactions = await TransactionsDB.find({}, { sort: { timestamp: -1 }, limit: 5 });

	return {
		totalUsers,
		totalMoney: totalMoneyResult || { totalBalance: 0, totalBank: 0, totalNetWorth: 0 },
		richestUsers,
		totalTransactions,
		recentTransactions,
	};
};

export const getLeaderboard = (page = 1, limit = 10) => 
	EconomyDB.findPaginated({}, { page, limit, sort: { netWorth: -1 } });

export const depositToBank = async (userid: string, amount: number): Promise<{ success: boolean; error?: string }> => {
	if (amount <= 0) return { success: false, error: 'Amount must be positive' };

	const user = await getEconomyUser(userid);
	if (user.balance < amount) return { success: false, error: 'Insufficient balance' };

	await updateBalance(userid, -amount, false);
	await updateBalance(userid, amount, true);

	return { success: true };
};

export const withdrawFromBank = async (userid: string, amount: number): Promise<{ success: boolean; error?: string }> => {
	if (amount <= 0) return { success: false, error: 'Amount must be positive' };

	const user = await getEconomyUser(userid);
	if (user.bank < amount) return { success: false, error: 'Insufficient bank balance' };

	await updateBalance(userid, -amount, true);
	await updateBalance(userid, amount, false);

	return { success: true };
};

export const resetUser = async (userid: string): Promise<void> => {
	await EconomyDB.deleteOne({ _id: userid });
	await TransactionsDB.deleteMany({ $or: [{ from: userid }, { to: userid }] });
};

export const getTotalEconomy = async (): Promise<number> => {
	const [result] = await EconomyDB.aggregate([{ $group: { _id: null, total: { $sum: '$netWorth' } } }]);
	return result?.total || 0;
};

export const Economy = {
	getUser: getEconomyUser,
	updateBalance,
	transferMoney,
	logTransaction,
	getTransactionHistory,
	formatMoney,
	formatCooldown,
	getStats: getEconomyStats,
	getLeaderboard,
	depositToBank,
	withdrawFromBank,
	resetUser,
	getTotalEconomy,
	CURRENCY,
	CONFIG: ECONOMY_CONFIG,
};
