import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { Utils, Net } from '../../../lib';
import { initMiscDB } from './database';

const CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days

interface AniListCacheRow {
	id: string;
	data: string;
	timestamp: number | string;
}

const getCacheTable = () => PG.getTable<AniListCacheRow>('anilist_cache', 'id');

async function fetchAniList(query: string, type: 'ANIME' | 'MANGA') {
	const cacheId = `${type.toLowerCase()}:${query.toLowerCase()}`;
	
	let cached = null;
	if (PG.isReady) {
		await initMiscDB();
		cached = await getCacheTable().findById(cacheId);
	}
	
	if (cached && (Date.now() - Number(cached.timestamp)) < CACHE_TIME) {
		return JSON.parse(cached.data);
	}

	const graphqlQuery = `
	query ($search: String, $type: MediaType) {
		Page(page: 1, perPage: 1) {
			media(search: $search, type: $type, sort: [POPULARITY_DESC, SEARCH_MATCH]) {
				id
				title {
					romaji
					english
				}
				coverImage {
					large
				}
				bannerImage
				description
				averageScore
				status
				genres
				isAdult
				format
				episodes
				chapters
				season
				seasonYear
				studios(isMain: true) {
					nodes {
						name
					}
				}
			}
		}
	}
	`;

	const variables = { search: query, type };

	try {
		const response = await Net('https://graphql.anilist.co').post({
			body: JSON.stringify({
				query: graphqlQuery,
				variables,
			}),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});

		const json = JSON.parse(response);
		
		if (json.errors) {
			return null;
		}

		const data = json.data?.Page?.media?.[0];
		if (!data) return null;

		if (data && PG.isReady) {
			await getCacheTable().upsert({
				id: cacheId,
				data: JSON.stringify(data),
				timestamp: Date.now(),
			}, ['id']);
		}

		return data;
	} catch (e) {
		return null;
	}
}

function generateDisplay(data: any, type: string) {
	const title = data.title.english || data.title.romaji || 'Unknown Title';
	
	const bgUrl = data.bannerImage || data.coverImage?.large || 'https://wallpapercave.com/wp/wp8695829.png';
	const bgStyle = `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${Utils.escapeHTML(bgUrl)}') center/cover no-repeat; padding: 8px; border-radius: 4px; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;`;

	const iconCell = data.coverImage?.large ?
		`<td width="100" valign="top"><img src="${Utils.escapeHTML(data.coverImage.large)}" width="90" height="130" style="border-radius: 4px;" /></td><td width="8"></td>` :
		'';

	const scoreStr = data.averageScore ? `${data.averageScore}/100` : 'N/A';
	const statusStr = data.status ? data.status.replace(/_/g, ' ') : 'N/A';
	const genresStr = data.genres?.length ? data.genres.join(', ') : 'N/A';

	const formatStr = data.format ? data.format.replace(/_/g, ' ') : 'N/A';
	let lengthStr = '';
	if (data.episodes) lengthStr = ` (${data.episodes} Episodes)`;
	else if (data.chapters) lengthStr = ` (${data.chapters} Chapters)`;

	const releaseStr = (data.season && data.seasonYear) ? `${data.season} ${data.seasonYear}` : (data.seasonYear ? `${data.seasonYear}` : '');
	const studioStr = data.studios?.nodes?.[0]?.name ? data.studios.nodes[0].name : '';

	let additionalInfo = `<b>Format:</b> ${formatStr}${lengthStr}<br />`;
	if (releaseStr) additionalInfo += `<b>Release:</b> ${releaseStr}<br />`;
	if (studioStr) additionalInfo += `<b>Studio:</b> ${studioStr}<br />`;

	let desc = data.description || 'No description available.';
	// Convert <br> tags from AniList to newlines
	desc = desc.replace(/<br\s*\/?>/gi, '\n');
	// Strip all other HTML tags (like <i>, <b>, etc. that might be malformed)
	desc = desc.replace(/<[^>]*>?/gm, '');
	// Escape HTML to prevent any remaining `<` or `>` from breaking the layout
	desc = Utils.escapeHTML(desc);
	// Convert newlines back to <br /> for display
	desc = desc.replace(/\n/g, '<br />');

	return `<div style="${bgStyle}">` +
		`<center><b><big><big>${Utils.escapeHTML(title)}</big></big></b><br />` +
		`<span style="font-size: 10pt; color: white;">${Utils.escapeHTML(genresStr)}</span></center>` +
		`<hr style="border-color: rgba(255, 255, 255, 0.4);" />` +
		`<table cellpadding="2" cellspacing="0" border="0" width="100%"><tr>` +
		iconCell +
		`<td valign="top" style="color: white;">` +
		`<b>Score:</b> ${scoreStr}<br />` +
		`<b>Status:</b> ${statusStr}<br />` +
		`${additionalInfo}<br />` +
		`<div style="max-height: 90px; overflow-y: auto; padding-right: 5px;">${desc}</div>` +
		`</td></tr></table>` +
		`</div>`;
}

export const commands: Chat.ChatCommands = wrapCommands({
	async anime(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help anime');
		
		const targetQuery = target.trim();

		const data = await fetchAniList(targetQuery, 'ANIME');
		if (!data) {
			return this.sendReplyBox(
				`Anime "<strong>${Utils.escapeHTML(targetQuery)}</strong>" not found on AniList.<br />` +
				`<span style="font-size: 10px; color: #888;">Note: AniList's search can be strict. If you are searching for a specific season (like "Season 3"), try searching by its official subtitle or arc name (e.g. "Swordsmith Village Arc") or its Japanese Romaji title.</span>`
			);
		}
		
		if (data.isAdult) {
			return this.sendReplyBox(`<div class="message-error">This anime contains 18+ content and cannot be displayed.</div>`);
		}

		this.sendReplyBox(generateDisplay(data, 'anime'));
	},
	animehelp: [`/anime [name] - Search for information about an anime.`],

	async manga(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help manga');
		
		const targetQuery = target.trim();

		const data = await fetchAniList(targetQuery, 'MANGA');
		if (!data) {
			return this.sendReplyBox(
				`Manga "<strong>${Utils.escapeHTML(targetQuery)}</strong>" not found on AniList.<br />` +
				`<span style="font-size: 10px; color: #888;">Note: AniList's search can be strict. Try searching by its official English subtitle or Japanese Romaji title.</span>`
			);
		}

		if (data.isAdult) {
			return this.sendReplyBox(`<div class="message-error">This manga contains 18+ content and cannot be displayed.</div>`);
		}

		this.sendReplyBox(generateDisplay(data, 'manga'));
	},
	mangahelp: [`/manga [name] - Search for information about a manga.`],
});
