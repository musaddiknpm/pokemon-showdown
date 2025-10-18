/*
* Pokemon Showdown
* Custom Symbol chat-plugin
* @author PrinceSky-Git
*/

import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const STAFF_ROOM_ID = 'staff';

interface CustomSymbolDocument {
	_id: string;
	symbol: string;
	setBy: string;
	createdAt: Date;
	updatedAt: Date;
}

const CustomSymbolDB = ImpulseDB<CustomSymbolDocument>('customsymbols');

const logSymbolAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('customsymbollogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to custom symbol log:', err);
	}
};

const applyCustomSymbol = async (userid: string) => {
	const user = Users.get(userid);
	if (!user) return;

	const symbolDoc = await CustomSymbolDB.findOne({ _id: userid }, { projection: { symbol: 1 } });
	if (symbolDoc) {
		if (!(user as any).originalGroup) (user as any).originalGroup = user.tempGroup;
		(user as any).customSymbol = symbolDoc.symbol;
		user.updateIdentity();
	}
};

const removeCustomSymbol = async (userid: string) => {
	const user = Users.get(userid);
	if (!user) return;

	delete (user as any).customSymbol;
	if ((user as any).originalGroup) delete (user as any).originalGroup;
	user.updateIdentity();
};

const notifyUser = (userId: string, staffName: string, symbol: string, action: string) => {
	const user = Users.get(userId);
	if (user?.connected) {
		user.popup(`|html|${Impulse.nameColor(staffName, true, true)} ${action} your custom symbol to: <strong>${symbol}</strong><br /><center>Refresh to see changes.</center>`);
	}
};

const notifyStaff = (staffName: string, targetName: string, symbol: string, action: string) => {
	const room = Rooms.get(STAFF_ROOM_ID);
	if (room) {
		room.add(`|html|<div class="infobox">${Impulse.nameColor(staffName, true, true)} ${action} custom symbol for ${Impulse.nameColor(targetName, true, false)}: <strong>${symbol}</strong></div>`).update();
	}
};

export const commands: Chat.ChatCommands = {
	customsymbol: 'symbol',
	cs: 'symbol',
	symbol: {
		''(target, room, user) {
			this.parse('/symbolhelp');
		},

		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, symbol] = target.split(',').map(s => s.trim());
			if (!name || !symbol) return this.parse('/help symbol');

			const userId = toID(name);
			if (userId.length > 19) return this.errorReply('Usernames are not this long...');
			if (symbol.length !== 1) return this.errorReply('Symbol must be a single character.');

			if (await CustomSymbolDB.exists({ _id: userId })) {
				return this.errorReply('User already has symbol. Use /symbol update or /symbol delete.');
			}

			const now = new Date();
			await CustomSymbolDB.insertOne({ _id: userId, symbol, setBy: user.id, createdAt: now, updatedAt: now });

			await applyCustomSymbol(userId);
			await logSymbolAction('SET', user.name, userId, `Symbol: ${symbol}`);

			this.sendReply(`|raw|You have given ${Impulse.nameColor(name, true, false)} the custom symbol: ${symbol}`);
			notifyUser(userId, user.name, symbol, 'has set');
			notifyStaff(user.name, name, symbol, 'set');
		},

		async update(target, room, user) {
			this.checkCan('roomowner');
			const [name, symbol] = target.split(',').map(s => s.trim());
			if (!name || !symbol) return this.parse('/help symbol');

			const userId = toID(name);

			if (!await CustomSymbolDB.exists({ _id: userId })) {
				return this.errorReply('User does not have symbol. Use /symbol set.');
			}

			if (symbol.length !== 1) return this.errorReply('Symbol must be a single character.');

			await CustomSymbolDB.updateOne({ _id: userId }, { $set: { symbol, updatedAt: new Date() } });
			await applyCustomSymbol(userId);
			await logSymbolAction('UPDATE', user.name, userId, `New: ${symbol}`);

			this.sendReply(`|raw|You have updated ${Impulse.nameColor(name, true, false)}'s custom symbol to: ${symbol}`);
			notifyUser(userId, user.name, symbol, 'has updated');
			notifyStaff(user.name, name, symbol, 'updated');
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const userId = toID(target);

			if (!await CustomSymbolDB.exists({ _id: userId })) {
				return this.errorReply(`${target} does not have a custom symbol.`);
			}

			const symbolDoc = await CustomSymbolDB.findOne({ _id: userId }, { projection: { symbol: 1 } });
			await CustomSymbolDB.deleteOne({ _id: userId });
			await removeCustomSymbol(userId);

			const details = symbolDoc ? `Removed: ${symbolDoc.symbol}` : 'Symbol removed';
			await logSymbolAction('DELETE', user.name, userId, details);

			this.sendReply(`You removed ${target}'s custom symbol.`);

			const targetUser = Users.get(userId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|${Impulse.nameColor(user.name, true, true)} has removed your custom symbol.<br /><center>Refresh to see changes.</center>`);
			}

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} removed custom symbol for ${Impulse.nameColor(target, true, false)}.</div>`).update();
			}
		},

		async list(target, room, user) {
			this.checkCan('roomowner');

			const result = await CustomSymbolDB.findPaginated({}, { page: parseInt(target) || 1, limit: 20, sort: { _id: 1 } });

			if (result.total === 0) return this.sendReply('No custom symbols have been set.');

			const rows: string[][] = result.docs.map(doc => [
				doc._id,
				`<strong style="font-size: 16px;">${doc.symbol}</strong>`,
				Chat.escapeHTML(doc.setBy || 'Unknown'),
			]);

			let output = ImpulseUI.table({
				title: `Custom Symbols (Page ${result.page}/${result.totalPages})`,
				headers: ['User', 'Symbol', 'Set By'],
				rows,
			});

			if (result.totalPages > 1) {
				output += `<div class="pad"><center>`;
				if (result.hasPrev) output += `<button class="button" name="send" value="/symbol list ${result.page - 1}">Previous</button> `;
				if (result.hasNext) output += `<button class="button" name="send" value="/symbol list ${result.page + 1}">Next</button>`;
				output += `</center></div>`;
			}

			this.sendReply(`|raw|${output}`);
		},

		async count(target, room, user) {
			this.checkCan('roomowner');
			const total = await CustomSymbolDB.countDocuments({});
			this.sendReply(`There are currently ${total} custom symbol(s) set.`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('customsymbollogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (logs.length === 0) return this.sendReply('No custom symbol logs found.');

				let output = `<div class="ladder pad"><h2>Custom Symbol Logs (Last ${logs.length} entries)</h2><div style="max-height: 370px; overflow: auto; font-family: monospace; font-size: 11px;">`;

				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					output += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) output += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});

				this.sendReply(`|raw|${output}</div></div>`);
			} catch (err) {
				console.error('Error reading custom symbol logs:', err);
				return this.errorReply('Failed to read custom symbol logs.');
			}
		},

		async stats(target, room, user) {
			this.checkCan('roomowner');

			try {
				const total = await CustomSymbolDB.countDocuments({});
				const symbolDistribution = await CustomSymbolDB.aggregate([
					{ $group: { _id: '$symbol', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 10 },
				]);
				const topStaff = await ImpulseDB('customsymbollogs').aggregate([
					{ $match: { action: 'SET' } },
					{ $group: { _id: '$staff', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentSets = await ImpulseDB('customsymbollogs').countDocuments({ action: 'SET', timestamp: { $gte: sevenDaysAgo } });
				const recentUpdates = await ImpulseDB('customsymbollogs').countDocuments({ action: 'UPDATE', timestamp: { $gte: sevenDaysAgo } });
				const recentDeletes = await ImpulseDB('customsymbollogs').countDocuments({ action: 'DELETE', timestamp: { $gte: sevenDaysAgo } });

				let output = `<div class="ladder pad"><h2>Custom Symbol Statistics</h2><p><strong>Total:</strong> ${total}</p>`;

				if (symbolDistribution.length > 0) {
					output += `<p><strong>Popular Symbols:</strong></p><ul>`;
					symbolDistribution.forEach(sym => output += `<li><strong style="font-size: 18px;">${Chat.escapeHTML(sym._id)}</strong>: ${sym.count} user(s)</li>`);
					output += `</ul>`;
				}

				if (topStaff.length > 0) {
					output += `<p><strong>Top Staff:</strong></p><ul>`;
					topStaff.forEach(staff => output += `<li>${Chat.escapeHTML(staff._id)}: ${staff.count}</li>`);
					output += `</ul>`;
				}

				output += `<p><strong>Recent (7 Days):</strong></p><ul><li>Set: ${recentSets}</li><li>Updated: ${recentUpdates}</li><li>Deleted: ${recentDeletes}</li></ul></div>`;
				this.sendReply(`|raw|${output}`);
			} catch (err) {
				console.error('Error generating custom symbol stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},
	},

	symbolhelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<div><b><center>Custom Symbol Commands</center></b><br><ul>` +
			`<li><code>/symbol set [user], [symbol]</code> - Set custom symbol</li>` +
			`<li><code>/symbol update [user], [symbol]</code> - Update symbol</li>` +
			`<li><code>/symbol delete [user]</code> - Remove symbol</li>` +
			`<li><code>/symbol list [page]</code> - List symbols</li>` +
			`<li><code>/symbol count</code> - Total count</li>` +
			`<li><code>/symbol stats</code> - Statistics</li>` +
			`<li><code>/symbol logs [num]</code> - View logs (1-500)</li>` +
			`</ul><small>Requires &+. Aliases: /customsymbol, /cs</small></div>`
		);
	},
};

export const loginfilter: Chat.LoginFilter = user => {
	applyCustomSymbol(user.id);
};

const originalGetIdentity = Users.User.prototype.getIdentity;
Users.User.prototype.getIdentity = function (room: BasicRoom | null = null) {
	const customSymbol = (this as any).customSymbol;

	if (!customSymbol) return originalGetIdentity.call(this, room);

	const punishgroups = Config.punishgroups || { locked: null, muted: null };
	if (this.locked || this.namelocked) {
		return (punishgroups.locked?.symbol || '\u203d') + this.name;
	}

	if (room) {
		if (room.isMuted(this)) {
			return (punishgroups.muted?.symbol || '!') + this.name;
		}
		const roomGroup = room.auth.get(this);
		if (roomGroup === this.tempGroup || roomGroup === ' ') {
			return customSymbol + this.name;
		}
		return roomGroup + this.name;
	}

	if (this.semilocked) {
		return (punishgroups.muted?.symbol || '!') + this.name;
	}

	return customSymbol + this.name;
};
