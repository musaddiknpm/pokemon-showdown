import { FS } from '../../../lib/fs';
import { escapeHTML } from '../../../lib/utils';

const CONFIG = {
	DATA_FILE: 'impulse/db/message-colors.json',
	HEX_REGEX: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
};

const VALID_COLOR_NAMES = new Set([
	'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
	'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
	'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
	'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
	'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
	'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
	'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
	'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred',
	'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
	'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
	'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
	'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
	'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
	'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
	'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
	'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
	'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
	'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue',
	'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
	'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
]);

let colorCache: Record<string, string> = {};

function saveData() {
	FS(CONFIG.DATA_FILE).writeUpdate(() => JSON.stringify(colorCache, null, 2));
}

function normalizeColor(input: string): string | null {
	const trimmed = input.trim();
	if (CONFIG.HEX_REGEX.test(trimmed)) return trimmed.toLowerCase();

	const lower = trimmed.toLowerCase();
	if (VALID_COLOR_NAMES.has(lower)) return lower;

	return null;
}

async function init() {
	const raw = await FS(CONFIG.DATA_FILE).readIfExists();
	colorCache = raw ? JSON.parse(raw) : {};
}

init().catch(err => {
	Monitor.crashlog(err, 'Chat Message Color FS init failed');
});

export const chatfilter: Chat.ChatFilter = (message, user, room) => {
	const color = colorCache[user.id];
	if (!color) return message;

	if (message.startsWith('/html ')) {
		return `/html <span style="color:${escapeHTML(color)}">${message.slice(6)}</span>`;
	}

	const formatted = Chat.formatText(message, true);
	return `/html <span style="color:${escapeHTML(color)}">${formatted}</span>`;
};
// Negative priority so this runs after other filters (e.g. emoticons), wrapping their final HTML output too.
chatfilter.priority = -1;

export const commands: Chat.ChatCommands = {
	chatmessagecolor: {
		set(target, room, user) {
			const color = target.trim();
			if (!color) return this.parse('/chatmessagecolor help');

			const normalized = normalizeColor(color);
			if (!normalized) throw new Chat.ErrorMessage("That color is invalid. Please use a hex code (e.g., #RRGGBB) or a valid CSS color name.");

			colorCache[user.id] = normalized;
			saveData();

			this.sendReply(`Your chat message color has been set to ${normalized}.`);
		},

		delete(target, room, user) {
			if (!colorCache[user.id]) throw new Chat.ErrorMessage("You don't currently have a chat message color set.");
			delete colorCache[user.id];
			saveData();

			this.sendReply("Your chat message color has been successfully removed.");
		},

		view(target, room, user) {
			if (!this.runBroadcast()) return;
			const targetId = target.trim() ? toID(target) : user.id;
			const color = colorCache[targetId];
			if (!color) throw new Chat.ErrorMessage(targetId === user.id ? "You don't currently have a chat message color set." : "That user doesn't currently have a chat message color set.");

			this.sendReplyBox(`<span style="color:${escapeHTML(color)}">${escapeHTML(targetId)}</span>'s chat message color is <b>${escapeHTML(color)}</b>.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Chat Message Color Commands</b></center><hr>` +
				`<b>/chatmessagecolor set [color]</b>: Sets your chat message color using a hex code or CSS color name.<hr>` +
				`<b>/chatmessagecolor delete</b>: Removes your chat message color.<hr>` +
				`<b>/chatmessagecolor view [user]</b>: Views your own or another user's chat message color.`
			);
		},
	},
};
