/*
* Pokemon Showdown
* Symbol Colors chat-plugin
*/

import { FS } from '../../../lib';
import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const STAFF_ROOM_ID = 'staff';
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/;

interface SymbolColorDocument {
	_id: string;
	color: string;
	setBy: string;
	createdAt: Date;
	updatedAt: Date;
}

const SymbolColorsDB = ImpulseDB<SymbolColorDocument>('symbolcolors');

const logSymbolColorAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('symbolcolorlogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to symbol color log:', err);
	}
};

const isValidColor = (color: string): boolean => HEX_REGEX.test(color);

const updateSymbolColors = async () => {
	try {
		const symbolColorDocs = await SymbolColorsDB.find({});
		let css = '/* SYMBOLCOLORS START */\n';

		symbolColorDocs.forEach(doc => {
			const selector = `[id$="-userlist-user-${doc._id}"] button > em.group`;
			const chatSelector = `[class$="chatmessage-${doc._id}"] strong small, .groupsymbol`;
			css += `${selector} { color: ${doc.color}; }\n${chatSelector} { color: ${doc.color}; }\n`;
		});

		css += '/* SYMBOLCOLORS END */\n';

		const file = FS('config/custom.css').readIfExistsSync().split('\n');
		const start = file.indexOf('/* SYMBOLCOLORS START */');
		const end = file.indexOf('/* SYMBOLCOLORS END */');

		if (start !== -1 && end !== -1) file.splice(start, (end - start) + 1);
		await FS('config/custom.css').writeUpdate(() => file.join('\n') + css);
		Impulse.reloadCSS();
	} catch (err) {
		console.error('Error updating symbol colors:', err);
	}
};

const colorPreview = (color: string) => `<span style="color: ${color}; font-size: 24px;">■</span>`;

const notifyUser = (userId: string, staffName: string, color: string, action: string) => {
	const user = Users.get(userId);
	if (user?.connected) {
		user.popup(`|html|${Impulse.nameColor(staffName, true, true)} ${action} your symbol color to <span style="color: ${color}; font-weight: bold;">${color}</span><br /><center>Refresh if you don't see it.</center>`);
	}
};

const notifyStaff = (staffName: string, targetName: string, color: string, action: string) => {
	const room = Rooms.get(STAFF_ROOM_ID);
	if (room) {
		room.add(`|html|<div class="infobox">${Impulse.nameColor(staffName, true, true)} ${action} symbol color for ${Impulse.nameColor(targetName, true, false)}: <span style="color: ${color}">■ ${color}</span></div>`).update();
	}
};

export const commands: Chat.ChatCommands = {
	symbolcolor: {
		async set(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(s => s.trim());
			if (!name || !color) return this.parse('/help symbolcolor');

			const userId = toID(name);
			if (userId.length > 19) return this.errorReply('Usernames are not this long...');

			if (!isValidColor(color)) {
				return this.errorReply('Invalid color. Use hex format: #FF5733 or #F73');
			}

			if (await SymbolColorsDB.exists({ _id: userId })) {
				return this.errorReply('User already has symbol color. Remove with /symbolcolor delete.');
			}

			const now = new Date();
			await SymbolColorsDB.insertOne({ _id: userId, color, setBy: user.id, createdAt: now, updatedAt: now });

			await updateSymbolColors();
			await logSymbolColorAction('SET', user.name, userId, `Color: ${color}`);

			this.sendReply(`|raw|You have given ${Impulse.nameColor(name, true, false)} a symbol color: <span style="color: ${color}">■</span>`);
			notifyUser(userId, user.name, color, 'has set');
			notifyStaff(user.name, name, color, 'set');
		},

		async update(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(s => s.trim());
			if (!name || !color) return this.parse('/help symbolcolor');

			const userId = toID(name);

			if (!isValidColor(color)) {
				return this.errorReply('Invalid color. Use hex format: #FF5733 or #F73');
			}

			const oldColor = await SymbolColorsDB.findOne({ _id: userId }, { projection: { color: 1 } });
			if (!oldColor) {
				return this.errorReply('User does not have symbol color. Use /symbolcolor set.');
			}

			await SymbolColorsDB.updateOne({ _id: userId }, { $set: { color, updatedAt: new Date() } });
			await updateSymbolColors();
			await logSymbolColorAction('UPDATE', user.name, userId, `Old: ${oldColor.color}, New: ${color}`);

			this.sendReply(`|raw|You have updated ${Impulse.nameColor(name, true, false)}'s symbol color to: <span style="color: ${color}">■</span>`);
			notifyUser(userId, user.name, color, 'has updated');
			notifyStaff(user.name, name, color, 'updated');
		},

		async delete(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');
			const userId = toID(target);

			const symbolColor = await SymbolColorsDB.findOne({ _id: userId }, { projection: { color: 1 } });
			if (!symbolColor) {
				return this.errorReply(`${target} does not have a symbol color.`);
			}

			await SymbolColorsDB.deleteOne({ _id: userId });
			await updateSymbolColors();
			await logSymbolColorAction('DELETE', user.name, userId, `Removed: ${symbolColor.color}`);

			this.sendReply(`You removed ${target}'s symbol color.`);

			const targetUser = Users.get(userId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|${Impulse.nameColor(user.name, true, true)} has removed your symbol color.`);
			}

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} removed symbol color for ${Impulse.nameColor(target, true, false)}.</div>`).update();
			}
		},

		async list(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');
			const result = await SymbolColorsDB.findPaginated({}, { page: parseInt(target) || 1, limit: 20, sort: { _id: 1 } });

			if (result.total === 0) return this.sendReply('No custom symbol colors have been set.');

			const rows: string[][] = result.docs.map(sc => [
				sc._id,
				sc.color,
				colorPreview(sc.color),
				Chat.escapeHTML(sc.setBy || 'Unknown'),
			]);

			let output = ImpulseUI.table({
				title: `Custom Symbol Colors (Page ${result.page}/${result.totalPages})`,
				headers: ['User', 'Color', 'Preview', 'Set By'],
				rows,
			});

			if (result.totalPages > 1) {
				output += `<div class="pad"><center>`;
				if (result.hasPrev) output += `<button class="button" name="send" value="/symbolcolor list ${result.page - 1}">Previous</button> `;
				if (result.hasNext) output += `<button class="button" name="send" value="/symbolcolor list ${result.page + 1}">Next</button>`;
				output += `</center></div>`;
			}

			this.sendReply(`|raw|${output}`);
		},

		async setmany(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');

			const entries = target.split(',').map(s => s.trim()).filter(Boolean);
			if (entries.length === 0) return this.errorReply('Format: /symbolcolor setmany user1:#FF5733, user2:#00FF00');

			const documents: SymbolColorDocument[] = [];
			const now = new Date();

			for (const entry of entries) {
				const [name, color] = entry.split(':').map(s => s.trim());
				if (!name || !color || userId.length > 19 || !isValidColor(color)) continue;

				const userId = toID(name);
				documents.push({ _id: userId, color, setBy: user.id, createdAt: now, updatedAt: now });
			}

			if (documents.length === 0) return this.errorReply('No valid symbol colors to set.');

			try {
				const result = await SymbolColorsDB.insertMany(documents, { ordered: false });
				await updateSymbolColors();

				const userList = documents.map(d => d._id).join(', ');
				await logSymbolColorAction('SETMANY', user.name, `${result.insertedCount} users`, `Users: ${userList}`);

				this.sendReply(`|raw|Successfully set ${result.insertedCount} custom symbol color(s).`);

				const staffRoom = Rooms.get(STAFF_ROOM_ID);
				if (staffRoom) {
					staffRoom.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} bulk set ${result.insertedCount} symbol colors.</div>`).update();
				}
			} catch (err: any) {
				if (err.code === 11000 && err.result?.insertedCount) {
					await updateSymbolColors();
					const userList = documents.map(d => d._id).join(', ');
					await logSymbolColorAction('SETMANY PARTIAL', user.name, `${err.result.insertedCount} users`, `Some duplicates skipped`);
					this.sendReply(`|raw|Set ${err.result.insertedCount} symbol color(s). Some users already had colors.`);
				} else {
					await logSymbolColorAction('SETMANY FAILED', user.name, `${documents.length} users`, `Error: ${err.message || err}`);
					this.errorReply(`Error setting symbol colors: ${err.message || err}`);
				}
			}
		},

		async count(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');
			const total = await SymbolColorsDB.countDocuments({});
			this.sendReply(`There are currently ${total} custom symbol color(s) set.`);
		},

		async logs(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('symbolcolorlogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (logs.length === 0) return this.sendReply('No symbol color logs found.');

				let output = `<div class="ladder pad"><h2>Symbol Color Logs (Last ${logs.length} entries)</h2><div style="max-height: 370px; overflow: auto; font-family: monospace; font-size: 11px;">`;

				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					output += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) output += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});

				this.sendReply(`|raw|${output}</div></div>`);
			} catch (err) {
				console.error('Error reading symbol color logs:', err);
				return this.errorReply('Failed to read symbol color logs.');
			}
		},

		async stats(this: CommandContext, target: string, room: Room, user: User) {
			this.checkCan('roomowner');

			try {
				const total = await SymbolColorsDB.countDocuments({});
				const colorDistribution = await SymbolColorsDB.aggregate([
					{ $group: { _id: '$color', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 10 },
				]);
				const topStaff = await ImpulseDB('symbolcolorlogs').aggregate([
					{ $match: { action: 'SET' } },
					{ $group: { _id: '$staff', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentSets = await ImpulseDB('symbolcolorlogs').countDocuments({ action: 'SET', timestamp: { $gte: sevenDaysAgo } });
				const recentUpdates = await ImpulseDB('symbolcolorlogs').countDocuments({ action: 'UPDATE', timestamp: { $gte: sevenDaysAgo } });
				const recentDeletes = await ImpulseDB('symbolcolorlogs').countDocuments({ action: 'DELETE', timestamp: { $gte: sevenDaysAgo } });

				let output = `<div class="ladder pad"><h2>Custom Symbol Color Statistics</h2><p><strong>Total:</strong> ${total}</p>`;

				if (colorDistribution.length > 0) {
					output += `<p><strong>Popular Colors:</strong></p><ul>`;
					colorDistribution.forEach(color => output += `<li>${colorPreview(color._id)} ${color._id}: ${color.count} user(s)</li>`);
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
				console.error('Error generating symbol color stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},

		''(target, room, user) {
			this.parse('/symbolcolorhelp');
		},
	},
	sc: 'symbolcolor',

	symbolcolorhelp(target: string, room: ChatRoom | null, user: User) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<b>Custom Symbol Color Commands:</b><br><ul>` +
			`<li><code>/sc set [user], [hex]</code> - Set symbol color</li>` +
			`<li><code>/sc update [user], [hex]</code> - Update color</li>` +
			`<li><code>/sc delete [user]</code> - Remove color</li>` +
			`<li><code>/sc setmany [user:#color, ...]</code> - Bulk set</li>` +
			`<li><code>/sc list [page]</code> - List colors</li>` +
			`<li><code>/sc count</code> - Total count</li>` +
			`<li><code>/sc stats</code> - Statistics</li>` +
			`<li><code>/sc logs [num]</code> - View logs (1-500)</li>` +
			`</ul><small>Requires &+. Format: #FF5733 or #F73</small>`
		);
	},
	schelp: 'symbolcolorhelp',
};
