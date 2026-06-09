import { PG } from './pg';
import { Chat } from '../server/chat';

export const Table = (title: string, headerRow: string[], dataRows: string[][]): string => {
	let output = `<div class="themed-table-container" style="max-width: 100%; max-height: 380px; overflow-y: auto;">`;
	output += `<h3 class="themed-table-title">${title}</h3>`;
	output += `<table class="themed-table" style="width: 100%; border-collapse: collapse;">`;
	output += `<tr class="themed-table-header">`;
	headerRow.forEach(header => { output += `<th>${header}</th>`; });
	output += `</tr>`;
	dataRows.forEach(row => {
		output += `<tr class="themed-table-row">`;
		row.forEach(cell => { output += `<td>${cell}</td>`; });
		output += `</tr>`;
	});
	output += `</table></div>`;
	return output;
};

export function wrapCommands<T extends Chat.ChatCommands>(commands: T): T {
	const wrapped = {} as T;
	for (const key in commands) {
		const cmd = commands[key];
		if (typeof cmd === 'string') {
			wrapped[key] = cmd;
		} else if (typeof cmd === 'function') {
			const fn = cmd as Chat.ChatHandler;
			const wrapper: Chat.ChatHandler = function (this: any, ...args) {
				if (!PG.isReady) {
					return this.popupReply(`|html|The PostgreSQL server is currently offline. This command has been temporarily disabled.`);
				}
				return fn.apply(this, args);
			};
			wrapper.toString = () => fn.toString();
			wrapped[key] = wrapper as T[typeof key];
		} else if (typeof cmd === 'object' && cmd !== null) {
			wrapped[key] = wrapCommands(cmd as Chat.ChatCommands) as T[typeof key];
		} else {
			wrapped[key] = cmd;
		}
	}
	return wrapped;
}
