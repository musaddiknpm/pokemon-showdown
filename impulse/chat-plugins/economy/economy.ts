import { PG } from '../../pg';
import { escapeHTML } from '../../../lib/utils';
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

export interface EconomyLogEntry {
	user: string;
	target: string;
	action: string;
	amount: number;
	timestamp: number;
}

interface EconomyLogRow {
	id?: number;
	user_id: string;
	target_id: string;
	action: string;
	amount: number;
	timestamp: number | string;
}

export const ACTION_LABELS: Record<string, string> = {
	transfer: 'Transfer',
	givemoney: 'Staff Give',
	takemoney: 'Staff Take',
};

export async function addEconomyLog(user: string, target: string, action: string, amount: number): Promise<void> {
	await initEconomyDB();
	await PG.getTable<EconomyLogRow>('economy_log', 'id').insert({
		user_id: user,
		target_id: target,
		action,
		amount,
		timestamp: Date.now(),
	});
}

export async function getEconomyLogs(userid?: string): Promise<EconomyLogEntry[]> {
	await initEconomyDB();
	let rows: EconomyLogRow[];
	if (userid) {
		const result = await PG.query<EconomyLogRow>(`
			SELECT user_id, target_id, action, amount, timestamp
			FROM economy_log
			WHERE user_id = $1 OR target_id = $1
			ORDER BY timestamp DESC
			LIMIT 100
		`, [userid]);
		rows = result.rows;
	} else {
		rows = await PG.getTable<EconomyLogRow>('economy_log', 'id').select(
			{},
			['user_id', 'target_id', 'action', 'amount', 'timestamp'],
			{
				limit: 100,
				orderBy: 'timestamp',
				order: 'DESC',
			}
		);
	}

	return rows.map(r => ({
		user: r.user_id,
		target: r.target_id,
		action: r.action,
		amount: Number(r.amount),
		timestamp: Number(r.timestamp),
	}));
}

export async function cleanEconomyLogs(): Promise<void> {
	await initEconomyDB();
	const cutoff = Date.now() - (14 * 24 * 60 * 60 * 1000);
	await PG.getTable<EconomyLogRow>('economy_log', 'id').delete({ timestamp: { lt: cutoff } });
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
		this.sendReplyBox(`${nameColor(targetId, true)} has a balance of <b>${balance}</b> ${CONFIG.CURRENCY}.`);
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

		if (!rows.length) return this.sendReplyBox("No economy data was found.");

		const dataRows = rows.map((row, i) => [
			`${i + 1}`,
			nameColor(row.user_id, true),
			`${row.balance}`,
		]);

		const currencyCapitalized = CONFIG.CURRENCY.charAt(0).toUpperCase() + CONFIG.CURRENCY.slice(1);
		const html = Table("Richest Users", ["Rank", "User", currencyCapitalized], dataRows);

		this.sendReply(`|html|${html}`);
	},

	economy: {
		async claimdaily(target, room, user) {
			const now = Date.now();
			const lastDaily = await getLastClaim(user.id);
			const remaining = (lastDaily + CONFIG.DAILY_COOLDOWN) - now;

			if (remaining > 0) {
				const timeParts = Chat.toDurationString(remaining, { precision: 1 });
				throw new Chat.ErrorMessage(`You have already claimed your daily ${CONFIG.CURRENCY}. Please wait ${timeParts}.`);
			}

			const reward = Math.floor(Math.random() * (CONFIG.DAILY_MAX - CONFIG.DAILY_MIN + 1)) + CONFIG.DAILY_MIN;
			await setDaily(user.id, now);
			await updateBalance(user.id, reward);

			const newBal = await getBalance(user.id);
			this.sendReplyBox(`You have received your daily reward of <b>${reward}</b> ${CONFIG.CURRENCY}! Your new balance is <b>${newBal}</b>.`);
		},

		async transfer(target, room, user) {
			const [targetName, amountStr] = target.split(',').map(s => s.trim());
			const amount = parseInt(amountStr);
			const targetId = toID(targetName);

			if (!targetId || isNaN(amount) || amount <= 0) throw new Chat.ErrorMessage("Usage: /economy transfer [user], [amount]");
			if (targetId === user.id) throw new Chat.ErrorMessage(`You cannot transfer ${CONFIG.CURRENCY} to yourself.`);

			const senderBal = await getBalance(user.id);
			if (senderBal < amount) throw new Chat.ErrorMessage(`You do not have enough ${CONFIG.CURRENCY}.`);

			await updateBalance(user.id, -amount);
			await updateBalance(targetId, amount);
			await addEconomyLog(user.id, targetId, 'transfer', amount);

			this.sendReplyBox(`You have successfully sent <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);
			notify(targetId, `${nameColor(user.name, true)} has sent you <b>${amount}</b> ${CONFIG.CURRENCY}.`);
		},

		async givemoney(target, room, user) {
			this.checkCan('bypassall');
			const [targetName, amountStr] = target.split(',').map(s => s.trim());
			const amount = parseInt(amountStr);
			const targetId = toID(targetName);

			if (!targetId || isNaN(amount) || amount <= 0) {
				throw new Chat.ErrorMessage("Usage: /economy givemoney [user], [amount]");
			}

			await updateBalance(targetId, amount);
			await addEconomyLog(user.id, targetId, 'givemoney', amount);
			this.sendReplyBox(`You have given <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);

			Rooms.get('staff')?.add(`|html|<div class="infobox">${nameColor(user.name, true)} has given <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.</div>`).update();
			notify(targetId, `You have received <b>${amount}</b> ${CONFIG.CURRENCY} from the server staff.`);
		},

		async takemoney(target, room, user) {
			this.checkCan('bypassall');
			const [targetName, amountStr] = target.split(',').map(s => s.trim());
			const amount = parseInt(amountStr);
			const targetId = toID(targetName);

			if (!targetId || isNaN(amount) || amount <= 0) {
				throw new Chat.ErrorMessage("Usage: /economy takemoney [user], [amount]");
			}

			await updateBalance(targetId, -amount);
			await addEconomyLog(user.id, targetId, 'takemoney', amount);
			this.sendReplyBox(`You have taken <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.`);

			Rooms.get('staff')?.add(`|html|<div class="infobox">${nameColor(user.name, true)} has taken <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.</div>`).update();
			notify(targetId, `The server staff has taken <b>${amount}</b> ${CONFIG.CURRENCY} from your balance.`);
		},

		async logs(target, room, user) {
			const targetId = toID(target);
			let filterId: string | undefined;

			if (targetId) {
				if (targetId !== user.id) {
					this.checkCan('bypassall');
				}
				filterId = targetId;
			} else {
				if (!user.can('bypassall')) {
					filterId = user.id;
				}
			}

			await cleanEconomyLogs();
			const logs = await getEconomyLogs(filterId);

			if (!logs.length) {
				return this.sendReplyBox(filterId ? `No economy logs found for ${filterId}.` : "No economy logs were found.");
			}

			const dataRows = logs.map(log => [
				`<small>${new Date(log.timestamp).toLocaleDateString()}</small>`,
				ACTION_LABELS[log.action] || escapeHTML(log.action),
				nameColor(log.user, true),
				nameColor(log.target, true),
				`<b>${log.amount}</b> ${CONFIG.CURRENCY}`,
			]);

			const tableTitle = filterId ? `Economy Logs: ${filterId}` : "Economy Logs";
			const tableHtml = Table(tableTitle, ["Date", "Action", "From", "To", "Amount"], dataRows);
			this.sendReply(`|html|${tableHtml}`);
		},

		help() {
			this.runBroadcast();
			const dailyAmountStr = CONFIG.DAILY_MIN === CONFIG.DAILY_MAX ?
				`${CONFIG.DAILY_MIN}` :
				`${CONFIG.DAILY_MIN}-${CONFIG.DAILY_MAX}`;

			this.sendReplyBox(
				`<center><b>Economy Commands</b></center><hr>` +
				`<b>/bal [user]</b>: Check a user's balance.<hr>` +
				`<b>/economy claimdaily</b>: Claim ${dailyAmountStr} ${CONFIG.CURRENCY} every 24 hours.<hr>` +
				`<b>/economy transfer [user], [amount]</b>: Send ${CONFIG.CURRENCY} to another user.<hr>` +
				`<b>/richu</b>: View the richest users leaderboard.<hr>` +
				`<b>/economy givemoney</b> | <b>/economy takemoney [user], [amount]</b>: Add or remove a user's ${CONFIG.CURRENCY}. (&, ~)<hr>` +
				`<b>/economy logs [user]</b>: View economy transaction logs.`
			);
		},
	},
};
