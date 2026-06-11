import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { Utils } from '../../../lib';
import { getBalance, setBalance, CURRENCY_NAME, initEconomy } from './economy';
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

const getShopTable = () => PG.getTable<GlobalShopRow>('global_shop', 'name');
const getLogTable = () => PG.getTable<GlobalShopLogRow>('global_shop_log', 'id');

let shopCache: Record<string, ShopItem> | null = null;

const GlobalShopManager = {
	async getItems(): Promise<Record<string, ShopItem>> {
		if (shopCache) return shopCache;
		await initEconomyDB();
		
		const rows = await getShopTable().select();
		const items: Record<string, ShopItem> = {};
		for (const row of rows) {
			items[row.name] = { description: row.description, cost: Number(row.cost) };
		}
		
		shopCache = items;
		return shopCache;
	},
	async getItem(name: string): Promise<ShopItem | null> {
		if (shopCache) return shopCache[name] || null;
		const items = await this.getItems();
		return items[name] || null;
	},
	async setItem(name: string, description: string, cost: number): Promise<void> {
		if (shopCache) shopCache[name] = { description, cost };
		await initEconomyDB();
		await getShopTable().upsert({ name, description, cost }, ['name']);
	},
	async removeItem(name: string): Promise<void> {
		if (shopCache) delete shopCache[name];
		await initEconomyDB();
		await getShopTable().deleteById(name);
	},
	async addLog(user: string, item: string): Promise<void> {
		await initEconomyDB();
		await getLogTable().insert({ user_id: user, item, timestamp: Date.now() });
	},
	async getLogs(): Promise<LogEntry[]> {
		await initEconomyDB();
		const rows = await getLogTable().select({}, ['user_id', 'item', 'timestamp'], { 
			limit: 100, 
			orderBy: 'timestamp', 
			order: 'DESC' 
		});
		
		return rows.map(r => ({
			user: r.user_id, 
			item: r.item, 
			timestamp: Number(r.timestamp)
		}));
	},
	async cleanLogs(): Promise<void> {
		await initEconomyDB();
		// Kept raw SQL: PGTable.delete() evaluates with strict equality or 'IN', not '<' inequalities.
		const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
		await PG.execute('DELETE FROM global_shop_log WHERE timestamp < $1', [cutoff]);
	},
};

export const commands: Chat.ChatCommands = wrapCommands({
	shop: {
		async ''(target, room, user) {
			if (!this.runBroadcast()) return;

			const shopData = await GlobalShopManager.getItems();
			const sorted = Object.entries(shopData).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox("The shop is currently empty.");

			const dataRows = sorted.map(([name, item]) => [
				`<b>${Utils.escapeHTML(name)}</b>`,
				Utils.escapeHTML(item.description),
				`<button class="button" name="send" value="/shop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			const html = Table("Global Shop", ["Item", "Description", "Cost"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		async buy(target, room, user) {
			const itemName = target.trim();
			const item = await GlobalShopManager.getItem(itemName);
			if (!item) return this.errorReply(`Item "${itemName}" not found.`);

			const bal = await getBalance(user.id);
			if (bal < item.cost) return this.errorReply(`Insufficient ${CURRENCY_NAME}. (Cost: ${item.cost}, Bal: ${bal})`);

			await setBalance(user.id, bal - item.cost);
			await GlobalShopManager.addLog(user.name, itemName);

			this.sendReplyBox(`Purchased <b>${itemName}</b> for <b>${item.cost}</b> ${CURRENCY_NAME}.`);

			const staffRoom = Rooms.get('staff');
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${nameColor(user.name, true)} bought <b>${itemName}</b>.</div>`).update();
			}
		},

		add: 'edit',
		async edit(target, room, user) {
			this.checkCan('bypassall');
			const [name, desc, costStr] = target.split(',').map(s => s.trim());
			const cost = parseInt(costStr);

			if (!name || !desc || isNaN(cost) || cost <= 0) return this.errorReply("Usage: /shop add [name], [desc], [cost]");

			await GlobalShopManager.setItem(name, desc, cost);
			this.sendReplyBox(`Item <b>${name}</b> has been added/updated.`);
		},

		async remove(target, room, user) {
			this.checkCan('bypassall');
			const name = target.trim();
			const item = await GlobalShopManager.getItem(name);
			if (!item) return this.errorReply(`Item "${name}" not found.`);

			await GlobalShopManager.removeItem(name);
			this.sendReplyBox(`Item "${name}" removed from the global shop.`);
		},

		async logs(target, room, user) {
			this.checkCan('bypassall');
			await GlobalShopManager.cleanLogs();
			const logs = await GlobalShopManager.getLogs();
			
			if (!logs.length) return this.sendReplyBox("No shop logs found.");

			let html = `<div class="infobox" style="max-height: 200px; overflow-y: auto;"><strong>Global Shop Logs</strong><hr />`;
			for (const log of logs) {
				const date = new Date(log.timestamp).toLocaleDateString();
				html += `<small>[${date}]</small> <b>${Utils.escapeHTML(log.user)}</b> bought <b>${log.item}</b><br />`;
			}
			html += `</div>`;
			this.sendReplyBox(html);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Global Shop Commands</b></center><hr>` +
				`<b>/shop</b>: View all items.<hr>` +
				`<b>/shop buy [item]</b>: Purchase an item.<hr>` +
				`<b>/shop add [name], [desc], [cost]</b>: Add/Edit item. (~)<hr>` +
				`<b>/shop remove [item]</b>: Delete an item. (~)<hr>` +
				`<b>/shop logs</b>: View purchase history. (~)`
			);
		},
	},
	shophelp: 'shop help',
});
