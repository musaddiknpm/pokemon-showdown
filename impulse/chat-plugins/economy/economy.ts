import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initEconomyDB } from './database';

export const CONFIG = {
	CURRENCY: 'coins',
	STARTING_BALANCE: 0,
	DAILY_MIN: 1,
	DAILY_MAX: 5,
	DAILY_COOLDOWN: 24 * 60 * 60 * 1000,
};

export const CURRENCY_NAME = CONFIG.CURRENCY;

export const initEconomy = async (): Promise<void> => {};
const balanceCache = new Map<string, number>();

interface EconomyRow {
	user_id: string;
	balance: number;
	last_claim: number | string;
}

const getEcoTable = () => PG.getTable<EconomyRow>('economy', 'user_id');

export const getBalance = async (userid: string): Promise<number> => {
	const cached = balanceCache.get(userid);
	if (cached !== undefined) return cached;
	
	await initEconomyDB();
	const row = await getEcoTable().findById(userid, ['balance']);
	const balance = row ? Number(row.balance) : CONFIG.STARTING_BALANCE;
	
	balanceCache.set(userid, balance);
	return balance;
};

export const setBalance = async (userid: string, amount: number): Promise<void> => {
	const newBal = Math.max(0, amount);
	await initEconomyDB();
	
	const row = await getEcoTable().upsert(
		{ user_id: userid, balance: newBal, last_claim: 0 },
		['user_id'],
		'balance'
	);
	
	if (row) {
		balanceCache.set(userid, Number(row.balance));
	}
};

export const updateBalance = async (userid: string, delta: number): Promise<void> => {
	await initEconomyDB();
	
	// Kept raw SQL: PGTable.update() cannot handle relative mathematical assignment logic.
	const res = await PG.query<{ balance: number }>(`
		INSERT INTO economy (user_id, balance, last_claim)
		VALUES ($1, GREATEST(0, $2), 0)
		ON CONFLICT (user_id) DO UPDATE
			SET balance = GREATEST(0, economy.balance + $3)
		RETURNING balance
	`, [userid, delta, delta]);
	
	if (res.rows.length > 0) {
		balanceCache.set(userid, Number(res.rows[0].balance));
	}
};

const EconomyManager = {
	notify(user: User | string, message: string): void {
		const target = typeof user === 'string' ? Users.get(user) : user;
		if (target?.connected) target.popup(`|html|${message}`);
	},

	async setDaily(userid: string, timestamp: number): Promise<void> {
		await initEconomyDB();
		// Passing only user_id and last_claim ensures the balance column is gracefully ignored on update
		await getEcoTable().upsert({ user_id: userid, last_claim: timestamp }, ['user_id']);
	},

	async getLastClaim(userid: string): Promise<number> {
		await initEconomyDB();
		const row = await getEcoTable().findById(userid, ['last_claim']);
		return row ? Number(row.last_claim) : 0;
	},
};

void initEconomy().catch(err => Monitor.crashlog(err, 'Economy PG init failed'));

export const commands: Chat.ChatCommands = wrapCommands({
	bal: 'balance',
	atm: 'balance',
	async balance(target, room, user) {
		if (!this.runBroadcast()) return;
		const targetId = toID(target) || user.id;
		const balance = await getBalance(targetId);
		this.sendReplyBox(`${nameColor(targetId, true)} has <b>${balance}</b> ${CONFIG.CURRENCY}.`);
	},

	async daily(target, room, user) {
		const now = Date.now();
		const lastDaily = await EconomyManager.getLastClaim(user.id);
		const remaining = (lastDaily + CONFIG.DAILY_COOLDOWN) - now;

		if (remaining > 0) {
			const timeParts = Chat.toDurationString(remaining, { precision: true });
			return this.errorReply(`You've already claimed your daily ${CONFIG.CURRENCY}. Please wait ${timeParts}.`);
		}

		const reward = Math.floor(Math.random() * (CONFIG.DAILY_MAX - CONFIG.DAILY_MIN + 1)) + CONFIG.DAILY_MIN;
		await EconomyManager.setDaily(user.id, now);
		await updateBalance(user.id, reward);

		const newBal = await getBalance(user.id);
		this.sendReply(`You received <b>${reward}</b> daily ${CONFIG.CURRENCY}! Your new balance: <b>${newBal}</b>.`);
	},

	async transfer(target, room, user) {
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /transfer [user], [amount]");
		if (targetId === user.id) return this.errorReply("You cannot transfer to yourself.");

		const senderBal = await getBalance(user.id);
		if (senderBal < amount) return this.errorReply(`You don't have enough ${CONFIG.CURRENCY}.`);

		await updateBalance(user.id, -amount);
		await updateBalance(targetId, amount);

		this.sendReply(`Sent <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);
		EconomyManager.notify(targetId, `${nameColor(user.name, true)} sent you <b>${amount}</b> ${CONFIG.CURRENCY}.`);
	},

	async givemoney(target, room, user) {
		this.checkCan('bypassall');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /givemoney [user], [amount]");

		await updateBalance(targetId, amount);
		this.sendReply(`Gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.</div>`).update();
		EconomyManager.notify(targetId, `You received <b>${amount}</b> ${CONFIG.CURRENCY} from staff.`);
	},

	async takemoney(target, room, user) {
		this.checkCan('bypassall');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /takemoney [user], [amount]");

		await updateBalance(targetId, -amount);
		this.sendReply(`Took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.</div>`).update();
		EconomyManager.notify(targetId, `Staff took <b>${amount}</b> ${CONFIG.CURRENCY} from your balance.`);
	},

	richu: 'richestusers',
	async richestusers(target, room, user) {
		if (!this.runBroadcast()) return;
		await initEconomyDB();

		const rows = await getEcoTable().select({}, ['user_id', 'balance'], { 
			limit: 50, 
			orderBy: 'balance', 
			order: 'DESC' 
		});

		if (!rows.length) return this.sendReplyBox("No economy data found.");

		const dataRows = rows.map((row, i) => [
			`${i + 1}`,
			nameColor(row.user_id, true),
			`${row.balance}`,
		]);

		const html = Table("Richest Users", ["Rank", "User", CONFIG.CURRENCY], dataRows);
		this.sendReply(`|raw|${html}`);
	},

	ecohelp() {
		this.runBroadcast();
		this.sendReplyBox(
			`<center><b>Economy Commands</b></center><hr>` +
			`<b>/bal [user]</b>: Check balance.<hr>` +
			`<b>/daily</b>: Claim 1-5 ${CONFIG.CURRENCY} every 24h.<hr>` +
			`<b>/transfer [user], [amt]</b>: Send ${CONFIG.CURRENCY}.<hr>` +
			`<b>/richu</b>: See leaderboard.<hr>` +
			`<b>/givemoney/takemoney [user], [amt]</b>: Staff only.`
		);
	},
});
