import { PG } from '../../pg';
import { wrapCommands } from '../../impulse-utils';
import { Utils, Net } from '../../../lib';
import { initMiscDB } from './database';

const CACHE_TIME = 5 * 24 * 60 * 60 * 1000; // 5 days

interface ApiCacheRow {
	id: string;
	data: string;
	timestamp: number | string;
}

const getCacheTable = () => PG.getTable<ApiCacheRow>('api_cache', 'id');

async function getCached(cacheId: string) {
	if (!PG.isReady) return null;
	await initMiscDB();
	const cached = await getCacheTable().findById(cacheId);
	if (cached && (Date.now() - Number(cached.timestamp)) < CACHE_TIME) {
		return JSON.parse(cached.data);
	}
	return null;
}

async function saveCache(cacheId: string, data: any) {
	if (!PG.isReady) return;
	await initMiscDB();
	await getCacheTable().upsert({
		id: cacheId,
		data: JSON.stringify(data),
		timestamp: Date.now(),
	}, ['id']);
}
async function fetchAniList(query: string, type: 'ANIME' | 'MANGA') {
	const cacheId = `${type.toLowerCase()}:${query.toLowerCase()}`;
	
	const cached = await getCached(cacheId);
	if (cached) return cached;

	const graphqlQuery = `
	query ($search: String, $type: MediaType) {
		Page(page: 1, perPage: 1) {
			media(search: $search, type: $type, sort: [POPULARITY_DESC, SEARCH_MATCH]) {
				id
				title {
					romaji
					english
				}
				siteUrl
				externalLinks {
					url
					site
					type
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

		if (data) await saveCache(cacheId, data);

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

	let linksHtml = '';
	
	const streamingLinks = (data.externalLinks || [])
		.filter((link: any) => link.type === 'STREAMING')
		.slice(0, 3);
	
	if (streamingLinks.length) {
		const label = type === 'anime' ? 'Watch' : 'Read';
		const streamHtml = streamingLinks.map((link: any) => `<a href="${Utils.escapeHTML(link.url)}" style="color: #6ee7b7;" target="_blank">${Utils.escapeHTML(link.site)}</a>`).join(', ');
		linksHtml += `<b>${label}:</b> ${streamHtml}<br />`;
	}

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
		`${additionalInfo}` +
		`${linksHtml}` +
		`<br />` +
		`<div style="max-height: 90px; overflow-y: auto; padding-right: 5px;">${desc}</div>` +
		`</td></tr></table>` +
		`</div>`;
}

async function fetchGame(query: string) {
	const cacheId = `game:${query.toLowerCase()}`;
	
	const cached = await getCached(cacheId);
	if (cached) return cached;

	if (!Config.rawgApiKey) {
		return null;
	}

	try {
		const searchResponse = await Net(`https://api.rawg.io/api/games?key=${Config.rawgApiKey}&search=${encodeURIComponent(query)}&page_size=1`).get();
		const searchData = JSON.parse(searchResponse);
		
		if (!searchData.results || !searchData.results.length) {
			return null;
		}

		const gameId = searchData.results[0].id;

		const detailsResponse = await Net(`https://api.rawg.io/api/games/${gameId}?key=${Config.rawgApiKey}`).get();
		const gameData = JSON.parse(detailsResponse);

		if (gameData) await saveCache(cacheId, gameData);

		return gameData;
	} catch (e) {
		return null;
	}
}

function generateGameDisplay(data: any) {
	const title = data.name || 'Unknown Title';
	
	const bgUrl = data.background_image || data.background_image_additional || 'https://wallpapercave.com/wp/wp8695829.png';
	const bgStyle = `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${Utils.escapeHTML(bgUrl)}') center/cover no-repeat; padding: 8px; border-radius: 4px; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;`;

	const iconCell = data.background_image ?
		`<td width="100" valign="top"><img src="${Utils.escapeHTML(data.background_image)}" width="90" height="130" style="border-radius: 4px; object-fit: cover;" /></td><td width="8"></td>` :
		'';

	const scoreStr = data.metacritic ? `${data.metacritic}/100` : (data.rating ? `${data.rating}/5` : 'N/A');
	const releaseStr = data.released || 'N/A';
	const genresStr = data.genres?.length ? data.genres.map((g: any) => g.name).join(', ') : 'N/A';
	const platformsStr = data.platforms?.length ? data.platforms.map((p: any) => p.platform.name).join(', ') : 'N/A';
	
	const developers = data.developers?.length ? data.developers.map((d: any) => d.name).join(', ') : '';
	const publishers = data.publishers?.length ? data.publishers.map((p: any) => p.name).join(', ') : '';
	const devPubStr = developers ? (publishers && developers !== publishers ? `${developers} / ${publishers}` : developers) : publishers;

	let additionalInfo = `<b>Release:</b> ${releaseStr}<br />`;
	additionalInfo += `<b>Platforms:</b> ${platformsStr}<br />`;
	if (devPubStr) additionalInfo += `<b>Developer/Publisher:</b> ${devPubStr}<br />`;

	let linksHtml = '';
	if (data.website) {
		linksHtml += `<b>Website:</b> <a href="${Utils.escapeHTML(data.website)}" style="color: #6ee7b7;" target="_blank">Link</a><br />`;
	}

	const storeLinks = (data.stores || [])
		.filter((s: any) => s.url && s.store && s.store.name)
		.slice(0, 3);
	
	if (storeLinks.length) {
		const storeHtml = storeLinks.map((s: any) => `<a href="${Utils.escapeHTML(s.url)}" style="color: #6ee7b7;" target="_blank">${Utils.escapeHTML(s.store.name)}</a>`).join(', ');
		linksHtml += `<b>Buy/Play:</b> ${storeHtml}<br />`;
	}

	let desc = data.description_raw || 'No description available.';
	desc = Utils.escapeHTML(desc);
	desc = desc.replace(/\n/g, '<br />');

	return `<div style="${bgStyle}">` +
		`<center><b><big><big>${Utils.escapeHTML(title)}</big></big></b><br />` +
		`<span style="font-size: 10pt; color: white;">${Utils.escapeHTML(genresStr)}</span></center>` +
		`<hr style="border-color: rgba(255, 255, 255, 0.4);" />` +
		`<table cellpadding="2" cellspacing="0" border="0" width="100%"><tr>` +
		iconCell +
		`<td valign="top" style="color: white;">` +
		`<b>Metacritic/Rating:</b> ${scoreStr}<br />` +
		`${additionalInfo}` +
		`${linksHtml}` +
		`<br />` +
		`<div style="max-height: 90px; overflow-y: auto; padding-right: 5px;">${desc}</div>` +
		`</td></tr></table>` +
		`</div>`;
}

async function fetchSong(query: string) {
	const cacheId = `song:${query.toLowerCase()}`;
	
	const cached = await getCached(cacheId);
	if (cached) return cached;

	try {
		const response = await Net(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`).get();
		const data = JSON.parse(response);
		
		if (!data.results || !data.results.length) {
			return null;
		}

		const songData = data.results[0];

		if (songData) await saveCache(cacheId, songData);

		return songData;
	} catch (e) {
		return null;
	}
}

function generateSongDisplay(data: any) {
	const title = data.trackName || 'Unknown Title';
	const artist = data.artistName || 'Unknown Artist';
	const album = data.collectionName || 'Unknown Album';
	
	const bgUrl = data.artworkUrl100 ? data.artworkUrl100.replace('100x100bb', '600x600bb').replace('100x100', '600x600') : 'https://wallpapercave.com/wp/wp8695829.png';
	const bgStyle = `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${Utils.escapeHTML(bgUrl)}') center/cover no-repeat; padding: 8px; border-radius: 4px; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;`;

	const iconCell = data.artworkUrl100 ?
		`<td width="100" valign="top"><img src="${Utils.escapeHTML(data.artworkUrl100.replace('100x100bb', '130x130bb').replace('100x100', '130x130'))}" width="130" height="130" style="border-radius: 4px; object-fit: cover;" /></td><td width="8"></td>` :
		'';

	const releaseStr = data.releaseDate ? new Date(data.releaseDate).getFullYear() : 'N/A';
	const genreStr = data.primaryGenreName || 'N/A';

	let additionalInfo = `<b>Artist:</b> ${Utils.escapeHTML(artist)}<br />`;
	additionalInfo += `<b>Album:</b> ${Utils.escapeHTML(album)}<br />`;
	additionalInfo += `<b>Release:</b> ${releaseStr}<br />`;

	let linksHtml = '';
	if (data.trackViewUrl) {
		linksHtml += `<b>Listen:</b> <a href="${Utils.escapeHTML(data.trackViewUrl)}" style="color: #6ee7b7;" target="_blank">Apple Music</a><br />`;
	}

	let audioPlayer = '';
	if (data.previewUrl) {
		audioPlayer = `<audio src="${Utils.escapeHTML(data.previewUrl)}" controls style="width: 100%; margin-top: 10px;"></audio>`;
	} else {
		audioPlayer = `<div style="margin-top: 10px;"><i>No audio preview available.</i></div>`;
	}

	return `<div style="${bgStyle}">` +
		`<center><b><big><big>${Utils.escapeHTML(title)}</big></big></b><br />` +
		`<span style="font-size: 10pt; color: white;">${Utils.escapeHTML(genreStr)}</span></center>` +
		`<hr style="border-color: rgba(255, 255, 255, 0.4);" />` +
		`<table cellpadding="2" cellspacing="0" border="0" width="100%"><tr>` +
		iconCell +
		`<td valign="top" style="color: white;">` +
		`${additionalInfo}` +
		`${linksHtml}` +
		audioPlayer +
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

	async game(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help game');
		
		const targetQuery = target.trim();

		const data = await fetchGame(targetQuery);
		if (!data) {
			if (!Config.rawgApiKey) {
				return this.sendReplyBox(`<div class="message-error">The game database API key is not configured.</div>`);
			}
			return this.sendReplyBox(
				`Game "<strong>${Utils.escapeHTML(targetQuery)}</strong>" not found on RAWG.<br />` +
				`<span style="font-size: 10px; color: #888;">Note: Try searching by its exact official name.</span>`
			);
		}

		if (data.esrb_rating && data.esrb_rating.slug === 'adults-only') {
			return this.sendReplyBox(`<div class="message-error">This game contains 18+ content and cannot be displayed.</div>`);
		}

		this.sendReplyBox(generateGameDisplay(data));
	},
	gamehelp: [`/game [name] - Search for information about a game.`],

	async song(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help song');
		
		const targetQuery = target.trim();

		const data = await fetchSong(targetQuery);
		if (!data) {
			return this.sendReplyBox(
				`Song "<strong>${Utils.escapeHTML(targetQuery)}</strong>" not found.<br />` +
				`<span style="font-size: 10px; color: #888;">Note: Try including the artist name for better results (e.g., "Song Name Artist").</span>`
			);
		}

		if (data.trackExplicitness === 'explicit') {
			return this.sendReplyBox(`<div class="message-error">This song is marked as explicit and cannot be displayed.</div>`);
		}

		this.sendReplyBox(generateSongDisplay(data));
	},
	songhelp: [`/song [name] - Search for information and a preview of a song.`],

	mediahelp(target, room, user) {
		if (!this.runBroadcast()) return;
		return this.sendReplyBox(
			`<b>Media Commands:</b><br />` +
			`<code>/anime [name]</code> - Search for information about an anime.<br />` +
			`<code>/manga [name]</code> - Search for information about a manga.<br />` +
			`<code>/game [name]</code> - Search for information about a game.<br />` +
			`<code>/song [name]</code> - Search for information and a preview of a song.`
		);
	},
});
