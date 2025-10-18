/*
* Pokemon Showdown
* Custom Icons chat-plugin
*/

import { FS } from '../../../lib';
import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const STAFF_ROOM_ID = 'staff';
const DEFAULT_ICON_SIZE = 24;
const MIN_SIZE = 1;
const MAX_SIZE = 100;

interface IconDocument {
	_id: string;
	url: string;
	size: number;
	setBy: string;
	createdAt: Date;
	updatedAt: Date;
}

const IconsDB = ImpulseDB<IconDocument>('usericons');
const cacheBuster = () => `?v=${Date.now()}`;

const logIconAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('iconlogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to icon log:', err);
	}
};

const validateSize = (sizeStr: string | undefined): { valid: boolean; size: number; error?: string } => {
	if (!sizeStr) return { valid: true, size: DEFAULT_ICON_SIZE };
	const size = parseInt(sizeStr);
	if (isNaN(size) || size < MIN_SIZE || size > MAX_SIZE) {
		return { valid: false, size: 0, error: `Invalid size. Use 1-${MAX_SIZE} pixels.` };
	}
	return { valid: true, size };
};

const updateIcons = async () => {
	try {
		const iconDocs = await IconsDB.find({}, { projection: { _id: 1, url: 1, size: 1 } });
		let css = '/* ICONS START */\n';
		const bust = cacheBuster();

		iconDocs.forEach(doc => {
			const size = doc.size || DEFAULT_ICON_SIZE;
			css += `[id$="-userlist-user-${doc._id}"] { background: url("${doc.url}${bust}") right no-repeat !important; background-size: ${size}px!important;}\n`;
		});

		css += '/* ICONS END */\n';

		const file = FS('config/custom.css').readIfExistsSync().split('\n');
		const start = file.indexOf('/* ICONS START */');
		const end = file.indexOf('/* ICONS END */');

		if (start !== -1 && end !== -1) file.splice(start, (end - start) + 1);
		await FS('config/custom.css').writeUpdate(() => file.join('\n') + css);
		Impulse.reloadCSS();
	} catch (err) {
		console.error('Error updating icons:', err);
	}
};

const displayIcon = (url: string, size: number = DEFAULT_ICON_SIZE) => 
	`<img src="${url}${cacheBuster()}" width="32" height="32">`;

const notifyUser = (userId: string, staffName: string, message: string, icon?: string) => {
	const user = Users.get(userId);
	if (user?.connected) {
		user.popup(`|html|${Impulse.nameColor(staffName, true, true)} ${message}${icon ? `: ${icon}` : ''}<br /><center>Refresh if you don't see it.</center>`);
	}
};

const notifyStaff = (staffName: string, targetName: string, action: string, icon?: string) => {
	const room = Rooms.get(STAFF_ROOM_ID);
	if (room) {
		room.add(`|html|<div class="infobox">${Impulse.nameColor(staffName, true, true)} ${action} ${Impulse.nameColor(targetName, true, false)}${icon ? `: ${icon}` : ''}</div>`).update();
	}
};

export const commands: Chat.ChatCommands = {
	usericon: 'icon',
	ic: 'icon',
	icon: {
		''(target, room, user) {
			this.parse('/iconhelp');
		},

		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, imageUrl, sizeStr] = target.split(',').map(s => s.trim());
			if (!name || !imageUrl) return this.parse('/help icon');

			const userId = toID(name);
			if (userId.length > 19) return this.errorReply('Usernames are not this long...');

			if (await IconsDB.exists({ _id: userId })) {
				return this.errorReply('User already has icon. Remove with /icon delete [user].');
			}

			const sizeCheck = validateSize(sizeStr);
			if (!sizeCheck.valid) return this.errorReply(sizeCheck.error);

			const now = new Date();
			await IconsDB.insertOne({
				_id: userId,
				url: imageUrl,
				size: sizeCheck.size,
				setBy: user.id,
				createdAt: now,
				updatedAt: now,
			});

			await updateIcons();
			await logIconAction('SET', user.name, userId, `URL: ${imageUrl}, Size: ${sizeCheck.size}px`);

			const sizeDisplay = sizeCheck.size !== DEFAULT_ICON_SIZE ? ` (${sizeCheck.size}px)` : '';
			this.sendReply(`|raw|You have given ${Impulse.nameColor(name, true, false)} an icon${sizeDisplay}.`);

			const icon = displayIcon(imageUrl, sizeCheck.size);
			notifyUser(userId, user.name, `has set your userlist icon${sizeDisplay}`, icon);
			notifyStaff(user.name, name, `set icon for`, icon);
		},

		async update(target, room, user) {
			this.checkCan('roomowner');
			const [name, imageUrl, sizeStr] = target.split(',').map(s => s.trim());
			if (!name) return this.parse('/help icon');

			const userId = toID(name);
			if (!await IconsDB.exists({ _id: userId })) {
				return this.errorReply('User does not have icon. Use /icon set.');
			}

			const updateFields: any = { updatedAt: new Date() };
			const logDetails: string[] = [];

			if (imageUrl) {
				updateFields.url = imageUrl;
				logDetails.push(`URL: ${imageUrl}`);
			}
			if (sizeStr) {
				const sizeCheck = validateSize(sizeStr);
				if (!sizeCheck.valid) return this.errorReply(sizeCheck.error);
				updateFields.size = sizeCheck.size;
				logDetails.push(`Size: ${sizeCheck.size}px`);
			}

			await IconsDB.updateOne({ _id: userId }, { $set: updateFields });
			await updateIcons();
			await logIconAction('UPDATE', user.name, userId, logDetails.join(', '));

			const updatedIcon = await IconsDB.findOne({ _id: userId }, { projection: { url: 1, size: 1 } });
			const size = updatedIcon?.size || DEFAULT_ICON_SIZE;
			const url = updatedIcon?.url || imageUrl;
			const sizeDisplay = size !== DEFAULT_ICON_SIZE ? ` (${size}px)` : '';

			this.sendReply(`|raw|You have updated ${Impulse.nameColor(name, true, false)}'s icon${sizeDisplay}.`);

			const icon = url ? displayIcon(url, size) : '';
			notifyUser(userId, user.name, `has updated your userlist icon${sizeDisplay}`, icon);
			notifyStaff(user.name, name, `updated icon for`, icon);
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const userId = toID(target);

			if (!await IconsDB.exists({ _id: userId })) {
				return this.errorReply(`${target} does not have an icon.`);
			}

			const icon = await IconsDB.findOne({ _id: userId }, { projection: { url: 1, size: 1 } });
			await IconsDB.deleteOne({ _id: userId });
			await updateIcons();

			const details = icon ? `Removed: ${icon.url} (${icon.size || DEFAULT_ICON_SIZE}px)` : 'Icon removed';
			await logIconAction('DELETE', user.name, userId, details);

			this.sendReply(`You removed ${target}'s icon.`);
			notifyUser(userId, user.name, 'has removed your userlist icon.');
			notifyStaff(user.name, target, 'removed icon for');
		},

		async list(target, room, user) {
			this.checkCan('roomowner');

			const result = await IconsDB.findPaginated({}, { page: parseInt(target) || 1, limit: 20, sort: { _id: 1 } });

			if (result.total === 0) return this.sendReply('No custom icons have been set.');

			const rows: string[][] = result.docs.map(icon => [
				icon._id,
				`<img src="${icon.url}" width="32" height="32">`,
				`${icon.size || DEFAULT_ICON_SIZE}px`,
				Chat.escapeHTML(icon.setBy || 'Unknown'),
			]);

			let output = ImpulseUI.table({
				title: `Custom Icons (Page ${result.page}/${result.totalPages})`,
				headers: ['User', 'Icon', 'Size', 'Set By'],
				rows,
			});

			if (result.totalPages > 1) {
				output += `<div class="pad"><center>`;
				if (result.hasPrev) output += `<button class="button" name="send" value="/icon list ${result.page - 1}">Previous</button> `;
				if (result.hasNext) output += `<button class="button" name="send" value="/icon list ${result.page + 1}">Next</button>`;
				output += `</center></div>`;
			}

			this.sendReply(`|raw|${output}`);
		},

		async setmany(target, room, user) {
			this.checkCan('roomowner');

			const entries = target.split(',').map(s => s.trim()).filter(Boolean);
			if (entries.length === 0) return this.errorReply('Format: /icon setmany user1:url1:size1, user2:url2:size2');

			const documents: IconDocument[] = [];
			const now = new Date();

			for (const entry of entries) {
				const [name, url, sizeStr] = entry.split(':').map(s => s.trim());
				if (!name || !url) continue;

				const userId = toID(name);
				if (userId.length > 19) continue;

				const sizeCheck = validateSize(sizeStr);
				if (!sizeCheck.valid) continue;

				documents.push({
					_id: userId,
					url,
					size: sizeCheck.size,
					setBy: user.id,
					createdAt: now,
					updatedAt: now,
				});
			}

			if (documents.length === 0) return this.errorReply('No valid icons to set.');

			try {
				await IconsDB.insertMany(documents);
				await updateIcons();

				const userList = documents.map(d => d._id).join(', ');
				await logIconAction('SETMANY', user.name, `${documents.length} users`, `Users: ${userList}`);

				this.sendReply(`|raw|Successfully set ${documents.length} custom icon(s).`);
				notifyStaff(user.name, '', `bulk set ${documents.length} custom icons`);
			} catch (err) {
				await logIconAction('SETMANY FAILED', user.name, `${documents.length} users`, `Error: ${err}`);
				this.errorReply(`Error setting icons: ${err}`);
			}
		},

		async count(target, room, user) {
			this.checkCan('roomowner');
			const total = await IconsDB.countDocuments({});
			this.sendReply(`There are currently ${total} custom icon(s) set.`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('iconlogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (logs.length === 0) return this.sendReply('No icon logs found.');

				let output = `<div class="ladder pad"><h2>Icon Logs (Last ${logs.length} entries)</h2><div style="max-height: 370px; overflow: auto; font-family: monospace; font-size: 11px;">`;

				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					output += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) output += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});

				this.sendReply(`|raw|${output}</div></div>`);
			} catch (err) {
				console.error('Error reading icon logs:', err);
				return this.errorReply('Failed to read icon logs.');
			}
		},

		async stats(target, room, user) {
			this.checkCan('roomowner');

			try {
				const total = await IconsDB.countDocuments({});
				const sizeRanges = await IconsDB.aggregate([
					{ $bucket: { groupBy: '$size', boundaries: [0, 24, 32, 48, 64, 101], default: 'Other', output: { count: { $sum: 1 } } } },
				]);
				const topStaff = await ImpulseDB('iconlogs').aggregate([
					{ $match: { action: 'SET' } },
					{ $group: { _id: '$staff', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentSets = await ImpulseDB('iconlogs').countDocuments({ action: 'SET', timestamp: { $gte: sevenDaysAgo } });
				const recentDeletes = await ImpulseDB('iconlogs').countDocuments({ action: 'DELETE', timestamp: { $gte: sevenDaysAgo } });
				const recentUpdates = await ImpulseDB('iconlogs').countDocuments({ action: 'UPDATE', timestamp: { $gte: sevenDaysAgo } });

				let output = `<div class="ladder pad"><h2>Custom Icon Statistics</h2><p><strong>Total:</strong> ${total}</p>`;

				if (sizeRanges.length > 0) {
					output += `<p><strong>By Size:</strong></p><ul>`;
					sizeRanges.forEach(range => {
						const label = typeof range._id === 'number' ? `${range._id}px+` : range._id;
						output += `<li>${label}: ${range.count}</li>`;
					});
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
				console.error('Error generating icon stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},
	},

	iconhelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<div><b><center>Custom Icon Commands</center></b><br><ul>` +
			`<li><code>/icon set [user], [url], [size]</code> - Set icon (${DEFAULT_ICON_SIZE}-${MAX_SIZE}px)</li>` +
			`<li><code>/icon update [user], [url], [size]</code> - Update icon</li>` +
			`<li><code>/icon delete [user]</code> - Remove icon</li>` +
			`<li><code>/icon setmany [user:url:size, ...]</code> - Bulk set icons</li>` +
			`<li><code>/icon list [page]</code> - List icons</li>` +
			`<li><code>/icon count</code> - Total count</li>` +
			`<li><code>/icon stats</code> - Statistics</li>` +
			`<li><code>/icon logs [num]</code> - View logs (1-500)</li>` +
			`</ul><small>Requires &+ permission. Aliases: /usericon, /ic</small></div>`
		);
	},
	ichelp: 'iconhelp',
};
