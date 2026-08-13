import { PG } from '../../pg';
import { Utils } from '../../../lib';
import { Net } from '../../../lib/net';
import { initMiscDB } from './database';

const CACHE_TIME = 5 * 24 * 60 * 60 * 1000; // 5 days

interface ApiCacheRow {
	id: string;
	data: string;
	timestamp: number | string;
}

const getCacheTable = () => PG.getTable<ApiCacheRow>('api_cache', 'id');

async function getCached(cacheId: string) {
	await initMiscDB();
	const cached = await getCacheTable().findById(cacheId);
	if (cached && (Date.now() - Number(cached.timestamp)) < CACHE_TIME) {
		return JSON.parse(cached.data);
	}
	return null;
}

async function saveCache<T>(cacheId: string, data: T) {
	await initMiscDB();
	await getCacheTable().upsert({
		id: cacheId,
		data: JSON.stringify(data),
		timestamp: Date.now(),
	}, ['id']);
}

interface UrbanDictionaryResult {
	word?: string;
	definition?: string;
}

async function fetchUrbanDictionary(query: string) {
	const cacheId = `ud:${query.toLowerCase()}`;

	const cached = await getCached(cacheId);
	if (cached) return cached as UrbanDictionaryResult;

	try {
		const response = await Net(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`).get();
		const json = JSON.parse(response);

		if (!json.list?.length) {
			return null;
		}

		const data: UrbanDictionaryResult = json.list[0];

		if (data) await saveCache(cacheId, data);

		return data;
	} catch (e) {
		return null;
	}
}

export const commands: Chat.ChatCommands = {
	async ud(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help ud');

		const targetQuery = target.trim();

		const data = await fetchUrbanDictionary(targetQuery);
		if (!data) {
			return this.sendReplyBox(`No definition found for "<strong>${Utils.escapeHTML(targetQuery)}</strong>" on Urban Dictionary.`);
		}

		const word = data.word || targetQuery;
		let definition = data.definition || 'No definition available.';

		definition = definition.replace(/\[|\]/g, '');

		definition = Utils.escapeHTML(definition).replace(/\r\n/g, '<br />').replace(/\n/g, '<br />');

		this.sendReplyBox(`<div style="max-height: 250px; overflow: auto;"><b>${Utils.escapeHTML(word)}:</b><br />${definition}</div>`);
	},
	udhelp: [`/ud [word] - Search for the definition of a word on Urban Dictionary.`],
};
