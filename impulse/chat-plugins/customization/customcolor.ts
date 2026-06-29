import { FS } from '../../lib';
import { Utils } from '../../lib/utils';
import { Chat } from '../chat';

const CUSTOM_COLORS_FILE = 'config/chat-plugins/customcolors.json';
const CUSTOM_CSS_FILE = 'config/custom.css';

let customColors: { [userid: string]: string } = {};

try {
	const data = JSON.parse(FS(CUSTOM_COLORS_FILE).readIfExistsSync() || "{}");
	if (typeof data === 'object') customColors = data;
} catch (e: any) {
	if (e.code !== 'ENOENT') throw e;
}

function saveCustomColors() {
	FS(CUSTOM_COLORS_FILE).writeUpdate(() => JSON.stringify(customColors));
	updateCustomCSS();
}

function updateCustomCSS() {
	const GROUP_SYMBOLS = ['~', '&', '#', '★', '@', '%', '*', '☆', '+', '^', ' ', '!', '‽', 'v', 'x', '¢', '?', '-'];
	
	let cssRules = [];
	for (const [userid, color] of Object.entries(customColors)) {
		let selectors = GROUP_SYMBOLS.map(symbol => `[data-name="${symbol}${userid}" i]`).join(', ');
		// Additionally add exact match for client logic that might not use data-name with group, just in case
		selectors += `, [data-name="${userid}" i], .chatmessage-${userid} strong, .chatmessage-${userid} span.username`;
		cssRules.push(`${selectors} { color: ${color} !important; }`);
		// Keep group symbols grey
		cssRules.push(`.chatmessage-${userid} strong small, button[data-name="${userid}" i] small { color: #888 !important; }`);
	}
	
	const generatedCSS = cssRules.join('\n');
	const startMarker = '/* CUSTOM COLORS START */';
	const endMarker = '/* CUSTOM COLORS END */';
	const cssBlock = `${startMarker}\n${generatedCSS}\n${endMarker}`;
	
	let customCss = FS(CUSTOM_CSS_FILE).readIfExistsSync() || '';
	
	if (customCss.includes(startMarker) && customCss.includes(endMarker)) {
		const regex = new RegExp(`${Utils.escapeRegex(startMarker)}[\\s\\S]*?${Utils.escapeRegex(endMarker)}`);
		customCss = customCss.replace(regex, cssBlock);
	} else {
		if (customCss) customCss += '\n\n';
		customCss += cssBlock;
	}
	
	FS(CUSTOM_CSS_FILE).writeSync(customCss);
}

// Run on load
updateCustomCSS();

export const commands: Chat.ChatCommands = {
	customcolor: {
		set(target, room, user) {
			this.checkCan('bypassall');
			const parts = target.split(',').map(p => p.trim());
			if (parts.length < 2) {
				return this.errorReply("Usage: /customcolor set [username], [hexcode]");
			}
			
			const targetUser = toID(parts[0]);
			if (!targetUser) return this.errorReply("You must specify a valid username.");
			if (targetUser.length > 18) return this.errorReply("Usernames cannot be longer than 18 characters.");
			
			const color = parts.slice(1).join(',').trim();
			// Basic hex color validation
			if (!/^#[0-9a-fA-F]{3,6}$/.test(color)) {
				return this.errorReply("Invalid hex color code. It should start with # and be followed by 3 to 6 hexadecimal characters.");
			}
			
			customColors[targetUser] = color;
			saveCustomColors();
			
			this.sendReplyBox(`Username color for <b>${targetUser}</b> has been set to <span style="color:${color}"><b>${color}</b></span>.`);
		},
		
		delete: 'remove',
		remove(target, room, user) {
			this.checkCan('bypassall');
			
			const targetUser = toID(target);
			if (!targetUser) return this.errorReply("Usage: /customcolor delete [username]");
			
			if (!customColors[targetUser]) {
				return this.errorReply(`User "${targetUser}" does not have a custom color set.`);
			}
			
			delete customColors[targetUser];
			saveCustomColors();
			
			this.sendReplyBox(`Custom color for <b>${targetUser}</b> has been removed.`);
		},
		
		list(target, room, user) {
			this.checkCan('bypassall');
			
			const keys = Object.keys(customColors).sort();
			if (!keys.length) {
				return this.sendReplyBox("No custom username colors have been set.");
			}
			
			let html = `<b>Custom Username Colors (${keys.length}):</b><br /><ul>`;
			for (const userid of keys) {
				const color = customColors[userid];
				html += `<li><b>${userid}</b>: <span style="color:${color}"><b>${color}</b></span></li>`;
			}
			html += `</ul>`;
			
			this.sendReplyBox(html);
		},
		
		'': 'help',
		help(target, room, user) {
			this.parse('/help customcolor');
		},
	},
	
	customcolorhelp: [
		`/customcolor set [username], [hexcode] - Sets a custom username color for the user. Requires: ~`,
		`/customcolor delete [username] - Removes a custom username color from the user. Requires: ~`,
		`/customcolor list - Lists all configured custom username colors. Requires: ~`,
	],
};
