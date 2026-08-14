import { PG } from '../../pg';
import { escapeHTML } from '../../../lib/utils';
import { getBalance, setBalance, CURRENCY_NAME } from './economy';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initEconomyDB } from './database';

interface ShopItem {
	description: string;
	cost: number;
}

interface LogEntry {
	user: string;
	item: string;
	timestamp: number;
}

interface GlobalShopRow {
	name: string;
	description: string;
	cost: number;
}

interface GlobalShopLogRow {
	id?: number;
	user_id: string;
	item: string;
	timestamp: number | string;
}

export async function getItems(): Promise<Record<string, ShopItem>> {
	await initEconomyDB();

	const rows = await PG.getTable<GlobalShopRow>('global_shop', 'name').select();
	const items: Record<string, ShopItem> = {};
	for (const row of rows) {
		items[row.name] = { description: row.description, cost: Number(row.cost) };
	}

	return items;
}

export async function getItem(name: string): Promise<ShopItem | null> {
	const items = await getItems();
	return items[name] || null;
}

export async function setItem(name: string, description: string, cost: number): Promise<void> {
	await initEconomyDB();
	await PG.getTable<GlobalShopRow>('global_shop', 'name').upsert({ name, description, cost }, ['name']);
}

export async function removeItem(name: string): Promise<void> {
	await initEconomyDB();
	await PG.getTable<GlobalShopRow>('global_shop', 'name').deleteById(name);
}

export async function addLog(user: string, item: string): Promise<void> {
	await initEconomyDB();
	await PG.getTable<GlobalShopLogRow>('global_shop_log', 'id').insert({ user_id: user, item, timestamp: Date.now() });
}

export async function getLogs(): Promise<LogEntry[]> {
	await initEconomyDB();
	const rows = await PG.getTable<GlobalShopLogRow>('global_shop_log', 'id').select({}, ['user_id', 'item', 'timestamp'], {
		limit: 100,
		orderBy: 'timestamp',
		order: 'DESC',
	});

	return rows.map(r => ({
		user: r.user_id,
		item: r.item,
		timestamp: Number(r.timestamp),
	}));
}

export async function cleanLogs(): Promise<void> {
	await initEconomyDB();
	const cutoff = Date.now() - (14 * 24 * 60 * 60 * 1000);
	await PG.getTable<GlobalShopLogRow>('global_shop_log', 'id').delete({ timestamp: { lt: cutoff } });
}

export const commands: Chat.ChatCommands = {
	shop: {
		async ''(target, room, user) {
			if (!this.runBroadcast()) return;

			const shopData = await getItems();
			const sorted = Object.entries(shopData).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox("The shop is currently empty.");

			const dataRows = sorted.map(([name, item]) => [
				`<b>${escapeHTML(name)}</b>`,
				escapeHTML(item.description),
				`<button class="button" name="send" value="/shop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			const html = Table(`${Config.serverName} Shop`, ["Item", "Description", "Buy"], dataRows);
			this.sendReply(`|html|${html}`);
		},

		async buy(target, room, user) {
			const itemName = target.trim();
			const item = await getItem(itemName);
			if (!item) throw new Chat.ErrorMessage(`The item "${itemName}" was not found.`);

			const bal = await getBalance(user.id);
			if (bal < item.cost) throw new Chat.ErrorMessage(`Insufficient ${CURRENCY_NAME}. (Cost: ${item.cost}, Balance: ${bal})`);

			await setBalance(user.id, bal - item.cost);
			await addLog(user.name, itemName);

			this.sendReplyBox(`You have purchased <b>${itemName}</b> for <b>${item.cost}</b> ${CURRENCY_NAME} from the shop.`);

			const staffRoom = Rooms.get('staff');
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox"><center>${nameColor(user.name, true)} has purchased <b>${itemName}</b> from the shop.</center></div>`).update();
			}
		},

		add: 'edit',
		async edit(target, room, user) {
			this.checkCan('bypassall');
			const [name, desc, costStr] = target.split(',').map(s => s.trim());
			const cost = parseInt(costStr);

			if (!name || !desc || isNaN(cost) || cost <= 0) throw new Chat.ErrorMessage("Usage: /shop add [name], [description], [cost]");

			await setItem(name, desc, cost);
			this.sendReplyBox(`The item <b>${name}</b> has been added or updated.`);
		},

		async remove(target, room, user) {
			this.checkCan('bypassall');
			const name = target.trim();
			const item = await getItem(name);
			if (!item) throw new Chat.ErrorMessage(`The item "${name}" was not found.`);

			await removeItem(name);
			this.sendReplyBox(`The item "${name}" has been removed from the shop.`);
		},

		async logs(target, room, user) {
			this.checkCan('bypassall');
			await cleanLogs();
			const logs = await getLogs();

			if (!logs.length) return this.sendReplyBox("No shop logs were found.");

			const dataRows = logs.map(log => [
				`<small>${new Date(log.timestamp).toLocaleDateString()}</small>`,
				`<b>${escapeHTML(log.user)}</b>`,
				escapeHTML(log.item),
			]);

			const tableHtml = Table("Shop Logs", ["Date", "User", "Item"], dataRows);
			this.sendReply(`|html|${tableHtml}`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Shop Commands</b></center><hr>` +
				`<b>/shop</b>: View all available items.<hr>` +
				`<b>/shop buy [item]</b>: Purchase an item.<hr>` +
				`<b>/shop add [name], [description], [cost]</b>: Add or edit an item. (&, ~)<hr>` +
				`<b>/shop remove [item]</b>: Delete an item. (&, ~)<hr>` +
				`<b>/shop logs</b>: View the purchase history. (&, ~)`
			);
		},
	},
};
