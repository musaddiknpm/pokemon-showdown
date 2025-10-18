/*
* Pokemon Showdown
* Custom Colors
*/

import https from 'https';
import { FS } from '../../../lib';
import { ImpulseDB } from '../../impulse-db';
import { validateHexColor, clearColorCache, loadCustomColorsFromDB } from '../../modules/colors';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const STAFF_ROOM_ID = 'staff';

Impulse.reloadCSS = () => {
	const url = `https://play.pokemonshowdown.com/customcss.php?server=${Config.serverid || 'impulse'}`;
	const req = https.get(url, res => console.log(`CSS reload: ${res.statusCode}`));
	req.on('error', err => console.error(`Error reloading CSS: ${err.message}`));
	req.end();
};

const logColorAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('colorlogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to color log:', err);
	}
};

const generateCSS = (name: string, color: string): string => {
	const id = toID(name);
	return `[class$="chatmessage-${id}"] strong, [class$="chatmessage-${id} mine"] strong, [class$="chatmessage-${id} highlighted"] strong, [id$="-userlist-user-${id}"] strong em, [id$="-userlist-user-${id}"] strong, [id$="-userlist-user-${id}"] span { color: ${color} !important; }\n`;
};

const updateColor = async () => {
	try {
		const colorDocs = await ImpulseDB('customcolors').find({});
		let css = '/* COLORS START */\n';

		colorDocs.forEach(doc => {
			css += generateCSS(doc.userid, doc.color);
		});

		css += '/* COLORS END */\n';

		const fileContent = await FS('config/custom.css').readIfExists();
		const file = fileContent ? fileContent.split('\n') : [];

		const start = file.indexOf('/* COLORS START */');
		const end = file.indexOf('/* COLORS END */');
		if (start !== -1 && end !== -1) file.splice(start, (end - start) + 1);

		await FS('config/custom.css').writeUpdate(() => file.join('\n') + css);

		clearColorCache();
		await loadCustomColorsFromDB();
		Impulse.reloadCSS();
	} catch (e) {
		console.error('Error updating colors:', e);
	}
};

export const commands: Chat.ChatCommands = {
	customcolor: {
		''(target, room, user) {
			this.parse('/customcolorhelp');
		},

		async set(target: string, room: ChatRoom, user: User) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !color) return this.parse('/customcolorhelp');

			const targetId = toID(name);
			if (targetId.length > 19) return this.errorReply('Usernames are not this long...');

			if (!validateHexColor(color)) {
				return this.errorReply('Invalid hex format. Use #RGB or #RRGGBB.');
			}

			await ImpulseDB('customcolors').upsert(
				{ userid: targetId },
				{ $set: { userid: targetId, color, updatedBy: user.id, updatedAt: new Date() } }
			);

			await updateColor();
			await logColorAction('SET', user.name, targetId, `Color: ${color}`);

			this.sendReply(`|raw|You have given <b><font color="${color}">${Chat.escapeHTML(name)}</font></b> a custom color.`);

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} set custom color for ${Impulse.nameColor(name, true, false)} to ${color}.</div>`).update();
			}
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/customcolorhelp');

			const targetId = toID(target);
			const colorDoc = await ImpulseDB('customcolors').findOne({ userid: targetId });

			if (!colorDoc) return this.errorReply(`${target} does not have a custom color.`);

			await ImpulseDB('customcolors').deleteOne({ userid: targetId });
			await updateColor();
			await logColorAction('DELETE', user.name, targetId, `Removed: ${colorDoc.color}`);

			this.sendReply(`You removed ${target}'s custom color.`);

			const targetUser = Users.get(target);
			if (targetUser?.connected) {
				targetUser.popup(`${user.name} removed your custom color.`);
			}

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} removed custom color for ${Impulse.nameColor(target, true, false)}.</div>`).update();
			}
		},

		preview(target, room, user) {
			if (!this.runBroadcast()) return;
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !color) return this.parse('/customcolorhelp');

			if (!validateHexColor(color)) {
				return this.errorReply('Invalid hex format. Use #RGB or #RRGGBB.');
			}

			return this.sendReplyBox(`<b><font size="3" color="${color}">${Chat.escapeHTML(name)}</font></b>`);
		},

		async reload(target: string, room: ChatRoom, user: User) {
			this.checkCan('roomowner');
			await updateColor();
			await logColorAction('RELOAD', user.name, 'N/A', 'CSS reloaded');
			this.privateModAction(`(${user.name} has reloaded custom colours.)`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('colorlogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (logs.length === 0) return this.sendReply('No color logs found.');

				let output = `<div class="ladder pad"><h2>Color Logs (Last ${logs.length} entries)</h2><div style="max-height: 370px; overflow: auto; font-family: monospace; font-size: 11px;">`;

				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					output += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) output += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});

				this.sendReply(`|raw|${output}</div></div>`);
			} catch (err) {
				console.error('Error reading color logs:', err);
				return this.errorReply('Failed to read color logs.');
			}
		},

		async list(target, room, user) {
			this.checkCan('roomowner');

			try {
				const colorDocs = await ImpulseDB('customcolors').find({}, { sort: { userid: 1 } });

				if (colorDocs.length === 0) return this.sendReply('No custom colors are currently set.');

				const rows: string[][] = colorDocs.map(doc => [
					Chat.escapeHTML(doc.userid),
					`<code>${Chat.escapeHTML(doc.color)}</code>`,
					`<b><font color="${doc.color}">${Chat.escapeHTML(doc.userid)}</font></b>`,
				]);

				const output = ImpulseUI.scrollable(
					ImpulseUI.table({
						title: `Custom Colors (${colorDocs.length} users)`,
						headers: ['User', 'Color', 'Preview'],
						rows,
					}),
					'370px'
				);

				this.sendReply(`|raw|${output}`);
			} catch (err) {
				console.error('Error listing colors:', err);
				return this.errorReply('Failed to list custom colors.');
			}
		},
	},
	cc: 'customcolor',

	customcolorhelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<div><b><center>Custom Color Commands</center></b><br><ul>` +
			`<li><code>/cc set [user], [hex]</code> - Set color</li>` +
			`<li><code>/cc delete [user]</code> - Delete color</li>` +
			`<li><code>/cc reload</code> - Reload colors</li>` +
			`<li><code>/cc preview [user], [hex]</code> - Preview color</li>` +
			`<li><code>/cc list</code> - List all colors</li>` +
			`<li><code>/cc logs [num]</code> - View logs (1-500)</li>` +
			`</ul><small>Set/delete/reload require @+. Format: #RGB or #RRGGBB</small></div>`
		);
	},
	cchelp: 'customcolorhelp',
};
