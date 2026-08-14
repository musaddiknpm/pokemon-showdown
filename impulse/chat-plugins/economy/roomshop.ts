import { PG } from '../../pg';
import { escapeHTML } from '../../../lib/utils';
import { toID } from '../../../sim/dex';
import { getBalance, setBalance, CURRENCY_NAME } from './economy';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';
import { initEconomyDB } from './database';

interface ShopItem {
	description: string;
	cost: number;
}

interface ShopConfig {
	enabled: boolean;
	bank: string | null;
	items: Record<string, ShopItem>;
}

interface LogEntry {
	user: string;
	item: string;
	timestamp: number;
}

interface RoomShopRow {
	room_id: string;
	enabled: number;
	bank: string | null;
}

interface RoomShopItemRow {
	room_id: string;
	name: string;
	description: string;
	cost: number;
}

interface RoomShopLogRow {
	id?: number;
	room_id: string;
	user_id: string;
	item: string;
	timestamp: number | string;
}

export async function getRoomData(roomid: string): Promise<ShopConfig> {
	await initEconomyDB();

	let configRow = await PG.getTable<RoomShopRow>('room_shop', 'room_id').findById(roomid);

	if (!configRow) {
		try {
			configRow = await PG.getTable<RoomShopRow>('room_shop', 'room_id').insert({ room_id: roomid, enabled: 0, bank: null });
		} catch {
			// Handle potential race condition if another process created it concurrently
			configRow = await PG.getTable<RoomShopRow>('room_shop', 'room_id').findById(roomid);
		}
	}

	const enabled = configRow?.enabled === 1;
	const bank = configRow?.bank || null;

	const itemRows = await PG.getTable<RoomShopItemRow>('room_shop_item', 'room_id').select({ room_id: roomid });
	const items: Record<string, ShopItem> = {};
	for (const row of itemRows) {
		items[row.name] = { description: row.description, cost: Number(row.cost) };
	}

	return { enabled, bank, items };
}

export async function setRoomConfig(roomid: string, enabled: boolean, bank: string | null): Promise<void> {
	await initEconomyDB();
	await PG.getTable<RoomShopRow>('room_shop', 'room_id').upsert(
		{ room_id: roomid, enabled: enabled ? 1 : 0, bank },
		['room_id']
	);
}

export async function setRoomItem(roomid: string, name: string, description: string, cost: number): Promise<void> {
	await initEconomyDB();
	await PG.getTable<RoomShopItemRow>('room_shop_item', 'room_id').upsert(
		{ room_id: roomid, name, description, cost },
		['room_id', 'name']
	);
}

export async function removeRoomItem(roomid: string, name: string): Promise<void> {
	await initEconomyDB();
	await PG.getTable<RoomShopItemRow>('room_shop_item', 'room_id').delete({ room_id: roomid, name });
}

export async function addLog(roomid: string, user: string, item: string): Promise<void> {
	await initEconomyDB();
	await PG.getTable<RoomShopLogRow>('room_shop_log', 'id').insert({
		room_id: roomid,
		user_id: user,
		item,
		timestamp: Date.now(),
	});
}

export async function getLogs(roomid: string): Promise<LogEntry[]> {
	await initEconomyDB();
	const rows = await PG.getTable<RoomShopLogRow>('room_shop_log', 'id').select({ room_id: roomid }, ['user_id', 'item', 'timestamp'], {
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

export async function cleanLogs(roomid: string): Promise<void> {
	await initEconomyDB();
	const cutoff = Date.now() - (14 * 24 * 60 * 60 * 1000);
	await PG.getTable<RoomShopLogRow>('room_shop_log', 'id').delete({ room_id: roomid, timestamp: { lt: cutoff } });
}

export const commands: Chat.ChatCommands = {
	roomshop: {
		async ''(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			const data = await getRoomData(room.roomid);
			if (!data.enabled) throw new Chat.ErrorMessage("The shop is not enabled for this room.");

			if (!this.runBroadcast()) return;

			const sorted = Object.entries(data.items).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox("The room shop is currently empty.");

			const dataRows = sorted.map(([name, item]) => [
				`<b>${escapeHTML(name)}</b>`,
				escapeHTML(item.description),
				`<button class="button" name="send" value="/roomshop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			const html = Table(`${room.title} Shop`, ["Item", "Description", "Buy"], dataRows);
			this.sendReply(`|html|${html}`);
		},

		async buy(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			const data = await getRoomData(room.roomid);
			const itemName = target.trim();

			if (!data.enabled) throw new Chat.ErrorMessage("The room shop is disabled.");
			if (!data.bank) throw new Chat.ErrorMessage("No bank has been set for this room.");

			const item = data.items[itemName];
			if (!item) throw new Chat.ErrorMessage(`The item "${itemName}" was not found.`);

			const bal = await getBalance(user.id);
			if (bal < item.cost) throw new Chat.ErrorMessage(`Insufficient ${CURRENCY_NAME}. (Cost: ${item.cost}, Balance: ${bal})`);

			if (user.id !== data.bank) {
				const bankBal = await getBalance(data.bank);
				await setBalance(user.id, bal - item.cost);
				await setBalance(data.bank, bankBal + item.cost);
			}

			await addLog(room.roomid, user.name, itemName);

			this.sendReplyBox(`You have purchased <b>${itemName}</b> for <b>${item.cost}</b> ${CURRENCY_NAME} from the room shop.`);
			this.add(`|html|<div class="infobox"><center>${nameColor(user.name, true)} has purchased <b>${itemName}</b> from the room shop.</center></div>`);
		},

		async bank(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			this.checkCan('roommod', null, room);
			const targetId = toID(target);
			if (!targetId) throw new Chat.ErrorMessage("Usage: /roomshop bank [user]");

			const data = await getRoomData(room.roomid);
			await setRoomConfig(room.roomid, data.enabled, targetId);

			this.sendReplyBox(`The room bank has been set to: ${nameColor(targetId, true)}`);
		},

		async showbank(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			const data = await getRoomData(room.roomid);
			if (!data.bank) return this.sendReplyBox("No bank has been set for this room.");
			this.sendReplyBox(`The current bank for this room is: ${nameColor(data.bank, true)}`);
		},

		add: 'edit',
		async edit(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			this.checkCan('roommod', null, room);
			const [name, desc, costStr] = target.split(',').map(s => s.trim());
			const cost = parseInt(costStr);

			if (!name || !desc || isNaN(cost) || cost <= 0) throw new Chat.ErrorMessage("Usage: /roomshop add [name], [description], [cost]");

			const data = await getRoomData(room.roomid);
			if (!data.enabled) throw new Chat.ErrorMessage("The room shop is not enabled.");

			await setRoomItem(room.roomid, name, desc, cost);
			this.sendReplyBox(`The item <b>${name}</b> has been added/updated.`);
		},

		async remove(target, room, user) {
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			this.checkCan('roommod', null, room);
			const data = await getRoomData(room.roomid);
			const name = target.trim();

			if (!data.items[name]) throw new Chat.ErrorMessage(`The item "${name}" was not found.`);

			await removeRoomItem(room.roomid, name);
			this.sendReplyBox(`The item "${name}" has been removed.`);
		},

		async enable(target, room, user) {
			this.checkCan('bypassall');
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			const data = await getRoomData(room.roomid);

			await setRoomConfig(room.roomid, true, data.bank);
			this.sendReplyBox("The room shop has been enabled.");
		},

		async disable(target, room, user) {
			this.checkCan('bypassall');
			if (!room || room.battle) throw new Chat.ErrorMessage("This command must be used in a chat room.");
			const data = await getRoomData(room.roomid);

			await setRoomConfig(room.roomid, false, data.bank);
			this.sendReplyBox("The room shop has been disabled.");
		},

		async logs(target, room, user) {
			let targetRoom = room;
			const targetRoomId = toID(target);

			if (targetRoomId) {
				const foundRoom = Rooms.get(targetRoomId);
				if (foundRoom) {
					targetRoom = foundRoom;
				}
			}

			const targetId = targetRoom ? targetRoom.roomid : targetRoomId;
			if (!targetId) {
				throw new Chat.ErrorMessage("This command must be used in a chat room, or specify a room ID: /roomshop logs [room]");
			}

			if (targetRoom) {
				this.checkCan('roommod', null, targetRoom);
			} else {
				this.checkCan('bypassall');
			}

			await cleanLogs(targetId);
			const logs = await getLogs(targetId);

			const roomTitle = targetRoom ? targetRoom.title : targetRoomId;
			if (!logs.length) return this.sendReplyBox(`No shop logs were found for ${roomTitle}.`);

			const dataRows = logs.map(log => [
				`<small>${new Date(log.timestamp).toLocaleDateString()}</small>`,
				`<b>${escapeHTML(log.user)}</b>`,
				escapeHTML(log.item),
			]);

			const tableHtml = Table(`Room Shop Logs: ${roomTitle}`, ["Date", "User", "Item"], dataRows);

			this.sendReply(`|html|${tableHtml}`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Room Shop Commands</b></center><hr>` +
				`<b>/roomshop</b>: View the available items.<hr>` +
				`<b>/roomshop buy [item]</b>: Purchase an item.<hr>` +
				`<b>/roomshop showbank</b>: See who receives the spent currency.<hr>` +
				`<b>/roomshop bank [user]</b>: Set the room bank. (#, &, ~)<hr>` +
				`<b>/roomshop add [name], [description], [cost]</b>: Add or update an item. (#, &, ~)<hr>` +
				`<b>/roomshop remove [item]</b>: Remove an item. (#, &, ~)<hr>` +
				`<b>/roomshop logs [room]</b>: View the purchase logs. (#, &, ~)<hr>` +
				`<b>/roomshop enable/disable</b>: Enable or disable the room shop for the current room. (&, ~)`
			);
		},
	},
};
