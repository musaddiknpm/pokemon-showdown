import { PG } from '../../pg';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initEconomyDB } from './database';

export const CONFIG = {
	CURRENCY: 'coins',
	STARTING_BALANCE: 0,
	DAILY_MIN: 10,
	DAILY_MAX: 10,
	DAILY_COOLDOWN: 24 * 60 * 60 * 1000,
};

export const CURRENCY_NAME = CONFIG.CURRENCY;

export const initEconomy = async (): Promise<void> => {};
interface EconomyRow {
	user_id: string;
	balance: number;
	last_claim: number | string;
}

export const getBalance = async (userid: string): Promise<number> => {
	await initEconomyDB();
	const row = await PG.getTable<EconomyRow>('economy', 'user_id').findById(userid, ['balance']);
	return row ? Number(row.balance) : CONFIG.STARTING_BALANCE;
};

export const setBalance = async (userid: string, amount: number): Promise<void> => {
	const newBal = Math.max(0, amount);
	await initEconomyDB();

	await PG.getTable<EconomyRow>('economy', 'user_id').upsert(
		{ user_id: userid, balance: newBal, last_claim: 0 },
		['user_id'],
		'balance'
	);
};

export const updateBalance = async (userid: string, delta: number): Promise<void> => {
	await initEconomyDB();

	// Kept raw SQL: PGTable.update() cannot handle relative mathematical assignment logic.
	await PG.query(`
		INSERT INTO economy (user_id, balance, last_claim)
		VALUES ($1, GREATEST(0, $2), 0)
		ON CONFLICT (user_id) DO UPDATE
			SET balance = GREATEST(0, economy.balance + $3)
	`, [userid, delta, delta]);
};

export function notify(user: User | string, message: string): void {
	const target = typeof user === 'string' ? Users.get(user) : user;
	if (target?.connected) target.popup(`|html|${message}`);
}

export async function setDaily(userid: string, timestamp: number): Promise<void> {
	await initEconomyDB();
	// Passing only user_id and last_claim ensures the balance column is gracefully ignored on update
	await PG.getTable<EconomyRow>('economy', 'user_id').upsert({ user_id: userid, last_claim: timestamp }, ['user_id']);
}

export async function getLastClaim(userid: string): Promise<number> {
	await initEconomyDB();
	const row = await PG.getTable<EconomyRow>('economy', 'user_id').findById(userid, ['last_claim']);
	return row ? Number(row.last_claim) : 0;
}

void initEconomy().catch(err => Monitor.warn(`Economy PG init failed: ${(err as Error).message}`));

export const commands: Chat.ChatCommands = {
	bal: 'balance',
	atm: 'balance',
	async balance(target, room, user) {
		if (!this.runBroadcast()) return;
		const targetId = toID(target) || user.id;
		const balance = await getBalance(targetId);
		this.sendReplyBox(`${nameColor(targetId, true)} has <b>${balance}</b> ${CONFIG.CURRENCY}.`);
	},

	async claimdaily(target, room, user) {
		const now = Date.now();
		const lastDaily = await getLastClaim(user.id);
		const remaining = (lastDaily + CONFIG.DAILY_COOLDOWN) - now;

		if (remaining > 0) {
			const timeParts = Chat.toDurationString(remaining, { precision: 1 });
			throw new Chat.ErrorMessage(`You've already claimed your daily ${CONFIG.CURRENCY}. Please wait ${timeParts}.`);
		}

		const reward = Math.floor(Math.random() * (CONFIG.DAILY_MAX - CONFIG.DAILY_MIN + 1)) + CONFIG.DAILY_MIN;
		await setDaily(user.id, now);
		await updateBalance(user.id, reward);

		const newBal = await getBalance(user.id);
		this.sendReplyBox(`You received <b>${reward}</b> daily ${CONFIG.CURRENCY}! Your new balance: <b>${newBal}</b>.`);
	},

	async transfer(target, room, user) {
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Usage: /transfer [user], [amount]");
		if (targetId === user.id) throw new Chat.ErrorMessage("You cannot transfer to yourself.");

		const senderBal = await getBalance(user.id);
		if (senderBal < amount) throw new Chat.ErrorMessage(`You don't have enough ${CONFIG.CURRENCY}.`);

		await updateBalance(user.id, -amount);
		await updateBalance(targetId, amount);

		this.sendReplyBox(`Sent <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);
		notify(targetId, `${nameColor(user.name, true)} sent you <b>${amount}</b> ${CONFIG.CURRENCY}.`);
	},

	async givemoney(target, room, user) {
		this.checkCan('bypassall');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Usage: /givemoney [user], [amount]");

		await updateBalance(targetId, amount);
		this.sendReplyBox(`Gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.</div>`).update();
		notify(targetId, `You received <b>${amount}</b> ${CONFIG.CURRENCY} from staff.`);
	},

	async takemoney(target, room, user) {
		this.checkCan('bypassall');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Usage: /takemoney [user], [amount]");

		await updateBalance(targetId, -amount);
		this.sendReplyBox(`Took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.</div>`).update();
		notify(targetId, `Staff took <b>${amount}</b> ${CONFIG.CURRENCY} from your balance.`);
	},

	richu: 'richestusers',
	async richestusers(target, room, user) {
		if (!this.runBroadcast()) return;
		await initEconomyDB();

		const rows = await PG.getTable<EconomyRow>('economy', 'user_id').select({}, ['user_id', 'balance'], {
			limit: 50,
			orderBy: 'balance',
			order: 'DESC',
		});

		if (!rows.length) return this.sendReplyBox("No economy data found.");

		const dataRows = rows.map((row, i) => [
			`${i + 1}`,
			nameColor(row.user_id, true),
			`${row.balance}`,
		]);

		const html = Table("Richest Users", ["Rank", "User", CONFIG.CURRENCY], dataRows);
		this.sendReply(`|html|${html}`);
	},

	ecohelp() {
		this.runBroadcast();
		this.sendReplyBox(
			`<center><b>Economy Commands</b></center><hr>` +
			`<b>/bal [user]</b>: Check balance.<hr>` +
			`<b>/claimdaily</b>: Claim 1-5 ${CONFIG.CURRENCY} every 24h.<hr>` +
			`<b>/transfer [user], [amt]</b>: Send ${CONFIG.CURRENCY}.<hr>` +
			`<b>/richu</b>: See leaderboard.<hr>` +
			`<b>/givemoney/takemoney [user], [amt]</b>: Staff only.`
		);
	},
};
