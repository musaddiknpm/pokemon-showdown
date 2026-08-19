import { escapeHTML } from '../../../lib/utils';
import { nameColor } from '../customization/custom-color';
import { type PokemonEntry, type SGGameState, type StatID, type StatTable } from './types';
import { getStarterCost } from './data/starter-data';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { SHOP_ITEMS, getRerollCost, getItemPrice, type ShopItem } from './items';
import { globalStats, getUserData } from './database';
import { expForLevel } from '../../utils/exp';
import { getLevelUpMoves, getAllLevelUpMoves, getEggMoves } from './pokemon';

export const PAGE_REFRESH_SECONDS = 20;

export const TYPE_COLORS: Record<string, string> = {
	Normal: '9fa19f', Fire: 'e62829', Water: '2980ef', Grass: '3fa129', Electric: 'fac000',
	Ice: '3dcef3', Fighting: 'ff8000', Poison: '9141cb', Ground: '915121', Flying: '81b9ef',
	Psychic: 'ef4179', Bug: '91a119', Rock: 'afa981', Ghost: '704170', Dragon: '5060e1',
	Dark: '624d4e', Steel: '60a1b8', Fairy: 'ef70ef',
};

export const BALL_MAP: Record<string, { srcSuffix: string, alt: string }> = {
	masterball: { srcSuffix: 'i1.png', alt: 'Master Ball' },
	ultraball: { srcSuffix: 'i2.png', alt: 'Ultra Ball' },
	greatball: { srcSuffix: 'i3.png', alt: 'Great Ball' },
	pokeball: { srcSuffix: 'i4.png', alt: 'Poké Ball' },
};

export const SPRITE_ID_OVERRIDES: { [id: string]: string } = {
	floetteeternal: 'floette',
	eternatuseternamax: 'eternatus',
	bloodmoonursaluna: 'ursaluna',
	ursalunabloodmoon: 'ursaluna',
};

export interface DialogConfig {
	title: string;
	spriteUrl?: string;
	dialog?: string;
	borderColor?: string;
	actionsHtml: string;
}

export function refreshGamePage(user: User): void {
	for (const conn of user.connections) {
		if (conn.openPages?.has('sggame')) {
			Chat.parse(`/join view-sggame`, null, user, conn);
		}
	}
}

export function itemURLFormat(item: string): string {
	return item.replace(/[^a-zA-Z0-9\s-]+/g, '').toLowerCase().replace(/ /g, '-');
}

export function typeColor(type: string): string {
	return TYPE_COLORS[type] ?? '68a090';
}

export function getContrastColor(hex: string): string {
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	const luma = 0.299 * r + 0.587 * g + 0.114 * b;
	return luma > 130 ? '333333' : 'ffffff';
}

export function getExpPercentage(mon: PokemonEntry): number {
	if (mon.level >= 9999) return 100;
	const expType = mon.expType ?? 'Medium Fast';
	const expAtCurrent = expForLevel(mon.level, expType);
	const expAtNext = expForLevel(mon.level + 1, expType);
	const range = expAtNext - expAtCurrent;
	return range > 0 ? Math.max(0, Math.min(100, Math.round(((mon.exp - expAtCurrent) / range) * 100))) : 0;
}

export function getSprite(species: string, size = 80, shiny = false, className = 'pr-mon-img'): string {
	const id = toID(species);
	const sp = Dex.species.get(id);
	const name = sp.name || species;
	const altName = escapeHTML(name);
	const rawId = (sp.exists ? (sp.spriteid || id) : id);
	const spriteId = SPRITE_ID_OVERRIDES[id] || SPRITE_ID_OVERRIDES[rawId] || rawId;
	const dir = shiny ? 'home-centered-shiny' : 'home-centered';
	const fallbackDir = shiny ? 'gen5-shiny' : 'gen5';
	const src = `https://play.pokemonshowdown.com/sprites/${dir}/${spriteId}.png`;
	const fallback = `https://play.pokemonshowdown.com/sprites/${fallbackDir}/${spriteId}.png`;
	const onerror = ` onerror="this.onerror=function(){this.style.display='none'};this.src='${fallback}'"`;
	return `<img src="${src}"${onerror} width="${size}" height="${size}" alt="${altName} sprite" class="${className}" style="width:${size}px;height:${size}px" />`;
}

export function getShopItemIcon(icon: string, size = 20): string {
	const file = SHOP_ICON_MAP[icon];
	const url = file ?
		SPRITE_BASE + file :
		`https://www.smogon.com/forums/media/minisprites/${itemURLFormat(icon)}.png`;
	return `<img src="${escapeHTML(url)}" width="${size}" height="${size}" class="pr-shop-icon">`;
}

export const SPRITE_BASE = 'https://raw.githubusercontent.com/Alliance-Sky/impulse-server/refs/heads/master/impulse/chat-plugins/sggame/sprites/';

export const SHOP_ICON_MAP: Record<string, string> = {
	'Lure': 'lure.png',
	'Super Lure': 'super-lure.png',
	'Max Lure': 'max-lure.png',
	'X Attack': 'x-items/x-attack.png',
	'X Defense': 'x-items/x-defense.png',
	'X Sp. Atk': 'x-items/x-sp-atk.png',
	'X Sp. Def': 'x-items/x-sp-def.png',
	'X Speed': 'x-items/x-speed.png',
	'Atk Mint': 'mints/lonely-mint.png',
	'Def Mint': 'mints/bold-mint.png',
	'SpAtk Mint': 'mints/modest-mint.png',
	'SpDef Mint': 'mints/calm-mint.png',
	'Spe Mint': 'mints/timid-mint.png',
	'Neutral Mint': 'mints/serious-mint.png',
	'TM Normal': 'tms/normal-tm.png',
	'TM Fire': 'tms/fire-tm.png',
	'TM Water': 'tms/water-tm.png',
	'TM Grass': 'tms/grass-tm.png',
	'TM Electric': 'tms/electric-tm.png',
	'TM Ice': 'tms/ice-tm.png',
	'TM Fighting': 'tms/fighting-tm.png',
	'TM Poison': 'tms/poison-tm.png',
	'TM Ground': 'tms/ground-tm.png',
	'TM Flying': 'tms/flying-tm.png',
	'TM Psychic': 'tms/psychic-tm.png',
	'TM Bug': 'tms/bug-tm.png',
	'TM Rock': 'tms/rock-tm.png',
	'TM Ghost': 'tms/ghost-tm.png',
	'TM Dragon': 'tms/dragon-tm.png',
	'TM Dark': 'tms/dark-tm.png',
	'TM Steel': 'tms/steel-tm.png',
	'TM Fairy': 'tms/fairy-tm.png',
};

export function getPokeballInfo(speciesId: string, ball?: string): { src: string, alt: string } {
	const BASE = 'https://raw.githubusercontent.com/smogon/sprites/master/src/minisprites/items/';
	if (ball && BALL_MAP[ball]) {
		return { src: BASE + BALL_MAP[ball].srcSuffix, alt: BALL_MAP[ball].alt };
	}
	const sp = Dex.species.get(toID(speciesId));
	if (sp.exists) {
		const bs = sp.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		const bst = bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe;
		if (bst >= 580) return { src: `${BASE}i2.png`, alt: 'Ultra Ball' };
		if (bst >= 480) return { src: `${BASE}i3.png`, alt: 'Great Ball' };
	}
	return { src: `${BASE}i4.png`, alt: 'Poké Ball' };
}

export function getSpriteWithBall(species: string, size = 80, ball?: string, shiny = false): string {
	const ballInfo = getPokeballInfo(species, ball);
	return `<div class="pr-sprite-wrap" style="width:${size}px;height:${size}px;flex-shrink:0;margin:0 auto;">` +
		getSprite(species, size, shiny) +
		`<img src="${ballInfo.src}" alt="${escapeHTML(ballInfo.alt)}" class="pr-pokeball-overlay" />` +
		`</div>`;
}

export function renderTypeBadge(types: string[], large = false): string {
	return types.map(t => {
		const color = typeColor(t);
		const textColor = getContrastColor(color);
		return `<span class="pr-type" style="background:#${color};color:#${textColor};font-size:${large ? '10px' : '9px'}">${t}</span>`;
	}).join('&nbsp;');
}

export function renderBaseStatsInline(bs: Record<string, number>): string {
	let buf = '';
	for (const [stat, val] of Object.entries(bs)) {
		buf += `<span>${stat.toUpperCase()} <b>${val}</b></span>`;
	}
	return buf;
}

export function renderProgressBarInner(pct: number, fillColorClass = 'pr-bar-fill', extraFillStyle = ''): string {
	return `<div class="pr-bar-track"><div class="${fillColorClass}" style="width:${pct}%;${extraFillStyle}"></div></div>`;
}

export function renderBtn(cmd: string | null, label: string, className = 'pr-btn', style = '', disabled = false): string {
	let buf = `<button`;
	if (cmd) buf += ` name="send" value="${cmd}"`;
	if (className) buf += ` class="${className}"`;
	if (style) buf += ` style="${style}"`;
	if (disabled) buf += ` disabled`;
	buf += `>${label}</button>`;
	return buf;
}

export function renderChoiceRow(spriteHtml: string, flexHtml: string, actionBtnHtml: string, extraStyle = ''): string {
	return `<div class="pr-choice-row" ${extraStyle ? `style="${extraStyle}"` : ''}>${spriteHtml}<div style="flex:1;min-width:0">${flexHtml}</div>${actionBtnHtml}</div>`;
}

export function renderCard(content: string, borderColor: string, extraStyle = ''): string {
	return `<div class="pr-card" style="width: 150px; padding: 12px; text-align:center; border: 2px solid ${borderColor}; border-radius: 8px; background: rgba(0,0,0,0.5); box-shadow: 0 0 8px ${borderColor}40; ${extraStyle}">${content}</div>`;
}

export function renderCharacterDialogView(config: DialogConfig): string {
	const border = config.borderColor || '#8ab4f8';
	let buf = `<div style="text-align:center; padding: 40px 10px;">`;
	buf += `<div style="font-size:16px; font-weight:bold; margin-bottom: 6px;">${escapeHTML(config.title)}</div>`;
	if (config.spriteUrl) {
		buf += `<div style="margin-bottom: 8px;">`;
		buf += `<img src="${escapeHTML(config.spriteUrl)}" alt="${escapeHTML(config.title)}" style="width: 96px; height: 96px; display: inline-block;">`;
		buf += `</div>`;
	}
	if (config.dialog) {
		buf += `<div style="background: rgba(0,0,0,0.3); padding: 10px 16px; border-radius: 8px; font-style: italic; max-width: 300px; margin: 0 auto 16px auto; border-left: 4px solid ${border}; font-size: 12px; line-height: 1.4; display: block;">`;
		buf += `"${escapeHTML(config.dialog)}"`;
		buf += `</div>`;
	}
	buf += `<div>${config.actionsHtml}</div>`;
	buf += `</div>`;
	return buf;
}

export function renderNotification(state: SGGameState): string {
	if (!state.notification) return '';
	return `<div class="pr-notification">` +
		`<div class="pr-notif-text">${state.notification}</div>` +
		`</div>`;
}

export function renderStatBar(state: SGGameState, cols2 = false, variant: 'main' | 'draft' = 'main'): string {
	const floorStat = cols2 ? '' : `<div class="pr-stat"><div class="pr-stat-label">Floor</div><div class="pr-stat-val">${state.floor}</div></div>`;
	const thirdStat = (variant === 'draft' || state.luckOverride !== undefined) ?
		`<div class="pr-stat"><div class="pr-stat-label">Luck</div><div class="pr-stat-val" style="${state.luckOverride ? 'color:gold;font-weight:bold;' : ''}">${state.luck ?? 0}</div></div>` :
		`<div class="pr-stat"><div class="pr-stat-label">Record</div><div class="pr-stat-val">Floor ${state.highestFloor ?? 1}</div></div>`;
	return `<div class="pr-statbar${cols2 ? ' cols2' : ''}">` + floorStat +
		`<div class="pr-stat"><div class="pr-stat-label">Money</div><div class="pr-stat-val">$${state.money ?? 0}</div></div>` +
		thirdStat +
		`</div>`;
}

export function renderHeader(view: string, hasGameOver: boolean): string {
	const titles: Record<string, string> = {
		main: 'PokéRogue', top: 'Ladder',
		resetconfirm: 'Reset run', trainer: 'Encounter!', welcome: 'Welcome',
		victory: 'Victory', stats: 'Pokémon Summary', save: 'Save Game', load: 'Load Game', draft: 'Reward Draft',
		gacha: 'Egg Gacha', incubator: 'Incubator',
	};

	let buf = `<div class="pr-header"><h2>${titles[view] ?? 'PokéRogue'}</h2>`;

	if (view === 'main' && !hasGameOver) {
		buf += `<div style="display:flex;flex-wrap:wrap;justify-content:flex-end;margin-left:auto;">`;
		buf += `${renderBtn('/sggame view gacha', 'Gacha', 'pr-btn primary', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/sggame view save', 'Save', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/sggame view load', 'Load', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/sggame view top', 'Ladder', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/sggame view resetconfirm', 'Reset', 'pr-btn danger', 'font-size:11px;padding:5px 10px')}`;
		buf += `</div>`;
	} else if (view === 'welcome') {
		buf += `<div style="display:flex;margin-left:auto">`;
		buf += `${renderBtn('/sggame view load', 'Load', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/sggame view gacha', 'Egg Gacha', 'pr-btn primary', 'font-size:11px;padding:5px 10px')}`;
		buf += `</div>`;
	} else if (view !== 'main' && view !== 'trainer' && view !== 'welcome') {
		buf += `<div style="display:flex;margin-left:auto;align-items:center;">`;

		const backTarget = hasGameOver ? '/sggame view welcome' : '/sggame view main';
		buf += renderBtn(backTarget, '← Back', 'pr-btn', 'font-size:11px;padding:5px 10px');

		if (view === 'gacha') {
			buf += `&nbsp;&nbsp;${renderBtn('/sggame view incubator', 'Incubator', 'pr-btn primary', 'font-size:11px;padding:5px 10px')}`;
		}

		buf += `</div>`;
	}
	return buf + `</div>`;
}

export function renderMoveList(moves: string[]): string {
	if (!moves.length) return '';
	const pills = moves.map(m => {
		const dexMove = Dex.moves.get(m);
		const moveName = dexMove.name || m;
		const moveType = dexMove.type || 'Normal';
		const color = typeColor(moveType);
		const textColor = getContrastColor(color);
		return `<span class="pr-move-pill" style="background:#${color};color:#${textColor}">${escapeHTML(moveName)}</span>`;
	}).join('');
	return `<div class="pr-move-list">${pills}</div>`;
}

export function renderHpBar(mon: PokemonEntry): string {
	const hpPct = mon.currentHp ?? 100;
	const color = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336';
	return `<div class="pr-bar-row">` +
		renderProgressBarInner(hpPct, 'pr-bar-fill', `background:${color}`) +
		`<span class="pr-bar-label">${hpPct}% HP</span>` +
		`</div>`;
}




function renderTeamTableRowStats(mon: PokemonEntry, spData: any, nature: string, ability: string, bs: any): string {
	let buf = '';
	if (mon.status) {
		buf += `<div style="font-size:9px;color:#ff9800;font-weight:500;margin-top:2px">${mon.status.toUpperCase()}</div>`;
	}
	if (nature) buf += `<div class="pr-ct-ability" style="margin-top:4px">Nature: <b>${escapeHTML(nature)}</b></div>`;
	if (ability) buf += `<div class="pr-ct-ability" style="margin-top:4px">Ability: <b>${escapeHTML(ability)}</b></div>`;
	buf += `<div class="pr-ct-stats" style="margin-top:4px">${renderBaseStatsInline(bs)}</div>`;
	return buf;
}

export function renderTeamTableRow(mon: PokemonEntry, actionButton?: string, genNumber = 9, statsButton?: string): string {
	const spData = Dex.species.get(toID(mon.species));
	const expNeeded = mon.level < 9999 ? expForLevel(mon.level + 1) - mon.exp : 0;

	const abilities = spData.abilities;
	const abilityId = mon.ability || abilities[0] || '';
	const ability = abilityId ? (Dex.abilities.get(abilityId).name || abilityId) : '';
	let nature = mon.nature;
	if (!nature) {
		const natures = Dex.natures.all().map(n => n.name);
		const natIdx = spData.id.length % natures.length;
		nature = natures[natIdx] ?? 'Hardy';
	}

	const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const moves: string[] = mon.moves?.length ? mon.moves : getLevelUpMoves(toID(mon.species), mon.level, genNumber);

	let buf = `<tr class="pr-team-row">`;

	buf += `<td class="pr-td-icon" style="vertical-align:top;padding-top:10px">`;
	buf += getSpriteWithBall(mon.species, 44, mon.ball, mon.shiny);
	if (statsButton) buf += statsButton;
	buf += `</td>`;

	buf += `<td class="pr-td-team-main">`;

	buf += `<div class="pr-td-name" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">`;
	buf += `${spData.name} &nbsp;&nbsp;&nbsp;<span class="pr-mon-lv">Lv. ${mon.level}</span></div>`;
	buf += `<div class="pr-types">${renderTypeBadge(spData.types ?? [])}</div>`;

	if (mon.heldItem) {
		const dexHeld = Dex.items.get(mon.heldItem);
		buf += `<div class="pr-item-tag">${escapeHTML(dexHeld.name || mon.heldItem)}</div>`;
	}

	buf += renderTeamTableRowStats(mon, spData, nature, ability, bs);

	if (moves.length) buf += renderMoveList(moves);

	const expPct = getExpPercentage(mon);
	buf += `<div class="pr-bars" style="margin-top:6px">${renderHpBar(mon)}<div class="pr-bar-row">`;
	buf += renderProgressBarInner(expPct, 'pr-expbar-fill');
	if (mon.level < 9999) {
		buf += `<span class="pr-bar-label" style="min-width:36px;font-size:8px">${expNeeded} to Lv</span>`;
	}
	buf += `</div></div></td>`;

	if (actionButton !== undefined) {
		buf += `<td class="pr-td-action" style="vertical-align:top;padding-top:10px">${actionButton}</td>`;
	}

	buf += `</tr>`;
	return buf;
}

function renderDraftPendingRewards(state: SGGameState, tierColors: Record<string, string>): string {
	let buf = `<div class="pr-table-container" style="margin-bottom: 16px;"><table class="pr-table" style="width:100%; border-collapse:collapse; font-size:11px; line-height:1.2;">`;
	buf += `<tbody>`;

	for (let i = 0; i < (state.pendingRewardDraft?.length || 0); i++) {
		const itemKey = state.pendingRewardDraft![i];
		const item = SHOP_ITEMS[itemKey];
		const rowColor = tierColors[item.tier] || '#b0b0b0';

		buf += `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;
		buf += `<td class="pr-td-icon" style="padding:4px; width:18px;">${getShopItemIcon(item.icon, 16)}</td>`;
		buf += `<td class="pr-td-name" style="padding:4px; font-weight:bold; color:${rowColor}; white-space:nowrap;">${escapeHTML(item.name)}</td>`;
		buf += `<td class="pr-td-desc" style="padding:4px; font-size:10px; text-align:left;">${escapeHTML(item.desc)}</td>`;
		buf += `<td class="pr-td-action" style="padding:4px; text-align:right;">`;
		buf += renderBtn(`/sggame draft ${i + 1}`, 'Take', 'pr-pick-btn', 'padding:2px 6px; font-size:10px; min-width:45px;');
		if (state.keyItems?.['Lock Capsule']) {
			buf += `&nbsp;&nbsp;`;
		}
		buf += `</td></tr>`;
	}

	buf += `</tbody></table></div>`;
	return buf;
}

function renderDraftShop(state: SGGameState, currentMoney: number): string {
	let buf = `<div class="pr-table-container"><table class="pr-table" style="width:100%; border-collapse:collapse; font-size:11px; line-height:1.2;">`;
	buf += `<tbody>`;

	const shopItems = Object.entries(SHOP_ITEMS)
		.filter(([, item]) => item.isShopItem && state.floor >= (item.minFloor || 1))
		.sort((a, b) => (a[1].minFloor || 1) - (b[1].minFloor || 1));

	for (const [key, item] of shopItems) {
		const price = getItemPrice(state.floor, item.moneyMultiplier);
		const canBuy = currentMoney >= price;

		buf += `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;
		buf += `<td class="pr-td-icon" style="padding:4px; width:18px;">${getShopItemIcon(item.icon, 16)}</td>`;
		buf += `<td class="pr-td-name" style="padding:4px; font-weight:500; white-space:nowrap;">${escapeHTML(item.name)}</td>`;
		buf += `<td class="pr-td-desc" style="padding:4px; font-size:10px; text-align:left;">${escapeHTML(item.desc)}</td>`;
		buf += `<td class="pr-td-cost" style="padding:4px; white-space:nowrap; color:#fac000;">$${price}</td>`;
		buf += `<td class="pr-td-action" style="padding:4px; text-align:right;">`;
		buf += renderBtn(canBuy ? `/sggame buyshop ${key}` : null, canBuy ? 'Buy' : 'Need $', 'pr-shop-buy', 'padding:2px 6px; font-size:10px; min-width:45px;', !canBuy);
		buf += `</td></tr>`;
	}

	buf += `</tbody></table></div>`;
	return buf;
}



function renderSelectedStarters(state: SGGameState): string {
	let buf = `<div class="pr-section-title">Selected Starters</div>`;
	buf += `<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:12px;"><tbody>`;

	const TEAM_COLS = 4;
	for (let i = 0; i < state.team.length; i += TEAM_COLS) {
		buf += `<tr>`;
		for (let j = i; j < i + TEAM_COLS; j++) {
			buf += `<td style="width:25%;text-align:center;padding:4px 2px;vertical-align:top;">`;
			if (j < state.team.length) {
				const mon = state.team[j];
				const cost = getStarterCost(mon.species);
				const spData = Dex.species.get(mon.species);

				buf += `<div style="font-size:9px;margin:2px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">`;
				buf += escapeHTML(spData.name);
				if (mon.shiny) buf += ` <span style="color:#fda085"></span>`;
				buf += `</div>`;
				buf += `<div style="font-size:9px; color:#fac000;">Cost: ${cost}</div>`;
				buf += getSprite(mon.species, 40, mon.shiny);
				buf += `<div style="margin-top:2px;">${renderBtn(`/sggame view stats ${j}`, 'Config', 'pr-btn', 'width:90%;padding:2px 0;font-size:10px;')}</div>`;
				buf += `<div style="margin-top:2px;">${renderBtn(`/sggame removestarter ${j}`, 'Remove', 'pr-btn danger', 'width:90%;padding:2px 0;font-size:10px;')}</div>`;
			}
			buf += `</td>`;
		}
		buf += `</tr>`;
	}
	buf += `</tbody></table>`;
	buf += `<div style="text-align:center;margin-bottom:12px;">${renderBtn('/sggame startrun', 'Start Run!', 'pr-btn primary', 'font-size:14px;padding:6px 12px;')}</div>`;
	return buf;
}

function renderStarterSearchForm(displaySearch: string): string {
	let buf = `<form data-submitsend="/sggame startersearch {data}" style="text-align:center;margin-bottom:12px">`;
	buf += `<input name="data" value="${escapeHTML(displaySearch)}" placeholder="Name, type, 'shiny', 'egg', 'cost+', 'cost-'" ` +
		`style="padding:5px 10px;border-radius:6px;border:1px solid rgba(150,150,150,0.4);background:rgba(0,0,0,0.2);color:inherit;font-size:12px;width:240px;" />`;
	buf += `&nbsp;&nbsp;<button type="submit" class="pr-btn" style="font-size:11px;padding:5px 10px;">Search</button>`;
	if (displaySearch) {
		buf += `&nbsp;&nbsp;` + renderBtn('/sggame startersearch', 'Clear', 'pr-btn', 'font-size:11px;padding:5px 10px');
	}
	buf += `</form>`;
	return buf;
}

function renderStarterPagination(currentPage: number, totalPages: number): string {
	if (totalPages <= 1) return '';
	let buf = `<div style="text-align:center; margin-bottom: 8px; margin-top: 12px;">`;
	buf += renderBtn(currentPage > 0 ? `/sggame starterpage ${currentPage - 1}` : null, '&#9664; Prev', 'pr-btn', 'font-size:10px;padding:3px 8px;', currentPage === 0);
	buf += `<span style="font-size:11px; margin: 0 12px;">Page <b>${currentPage + 1}</b> of ${totalPages}</span>`;
	buf += renderBtn(currentPage < totalPages - 1 ? `/sggame starterpage ${currentPage + 1}` : null, 'Next &#9654;', 'pr-btn', 'font-size:10px;padding:3px 8px;', currentPage >= totalPages - 1);
	buf += `</div>`;
	return buf;
}

function renderStarterGrid(paginated: string[], pending: string[], userData: any, state: SGGameState, currentCost: number, maxCost: number): string {
	let buf = `<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>`;
	const COLS = 4;
	for (let i = 0; i < paginated.length; i += COLS) {
		buf += `<tr>`;
		for (let j = i; j < i + COLS; j++) {
			buf += `<td style="width:25%;text-align:center;padding:4px 2px;vertical-align:top;">`;
			if (j < paginated.length) {
				const sid = toID(paginated[j]);
				const sp = Dex.species.get(sid);
				if (sp.exists) {
					const saved = userData.starters[sid];
					const isShiny = !!saved?.shiny;
					const originalIndex = pending.indexOf(paginated[j]);

					const cost = getStarterCost(sid);
					const isAlreadySelected = state.team?.some(m => toID(m.species) === sid);

					buf += `<div style="font-size:9px;margin:2px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">`;
					buf += escapeHTML(sp.name);
					if (isShiny) buf += ` <span style="color:#fda085"></span>`;
					buf += `</div>`;
					buf += `<div style="font-size:9px; color:#fac000;">Cost: ${cost}</div>`;
					buf += getSprite(sp.id, 40, isShiny);

					let selectBtn = '';
					if (isAlreadySelected) {
						selectBtn = `<button disabled class="pr-btn" style="width:90%;padding:2px 0;font-size:10px;opacity:0.5;">Selected</button>`;
					} else if (state.team && state.team.length >= 6) {
						selectBtn = `<button disabled class="pr-btn" style="width:90%;padding:2px 0;font-size:10px;opacity:0.5;">Team Full</button>`;
					} else if (currentCost + cost > maxCost) {
						selectBtn = `<button disabled class="pr-btn" style="width:90%;padding:2px 0;font-size:10px;opacity:0.5;">Cost Limit</button>`;
					} else {
						selectBtn = `<button name="send" value="/sggame choose ${originalIndex + 1}" class="pr-btn" style="width:90%;padding:2px 0;font-size:10px;">Select</button>`;
					}
					buf += selectBtn;
				}
			}
			buf += `</td>`;
		}
		buf += `</tr>`;
	}
	buf += `</tbody></table>`;
	return buf;
}

function filterPendingStarters(pending: string[], userData: any, search: string, filterEgg: boolean): string[] {
	return pending.filter(sid => {
		const sp = Dex.species.get(toID(sid));
		const saved = userData.starters[toID(sid)];
		if (filterEgg && (!saved?.unlockedEggMoves || saved.unlockedEggMoves.length === 0)) return false;
		if (search.length > 0) {
			if (search === 'shiny') return !!saved?.shiny;
			const types = (sp.types ?? []).map(t => t.toLowerCase());
			if (types.includes(search)) return true;
			return sp.name.toLowerCase().includes(search) || toID(sid).includes(search);
		}
		return true;
	});
}


export function renderPendingSwap(state: SGGameState): string {
	const sp = Dex.species.get(toID(state.pendingSwap!.species));
	let buf = `<h2 class="pr-choice-heading">Team is full!</h2><div style="text-align:center;margin-bottom:10px">`;
	buf += `${getSpriteWithBall(sp.id, 64, state.pendingSwap!.ball)}<div style="font-size:12px;color:#aaa;margin-top:6px"><b>Lv. ${state.pendingSwap!.level} ${sp.name}</b> wants to join. Replace a Pokémon:</div></div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const spName = Dex.species.get(toID(mon.species)).name;
		const flexHtml = `<span style="font-size:12px;font-weight:500">${spName}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}</span>`;
		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, renderBtn(`/sggame resolve swapmon ${i + 1}`, 'Replace', 'pr-pick-btn'), 'cursor:pointer');
	}

	buf += renderBtn('/sggame resolve swapmon skip', `Release ${sp.name}`, 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

export function renderPendingMoves(state: SGGameState): string {
	const pending = state.pendingMoves![0];
	const mon = state.team[pending.pokemonIndex];
	const sp = Dex.species.get(toID(mon.species));
	const newMove = Dex.moves.get(pending.move);
	const newMoveColor = '#' + typeColor(newMove.type || 'Normal');
	const newMoveCatIcon = newMove.category === 'Physical' ? '' : newMove.category === 'Special' ? '◆' : '●';
	const newMoveMaxPp = Math.floor((newMove.pp || 5) * (8 / 5));

	let buf = `<h2 class="pr-choice-heading">New move!</h2>`;
	buf += `<div style="text-align:center;margin-bottom:10px">${getSpriteWithBall(sp.id, 60, mon.ball)}`;
	buf += `<div style="font-size:12px;color:#aaa;margin-top:6px"><b>${sp.name}</b> wants to learn:</div></div>`;

	buf += `<div class="pr-sv-move" style="border-left:3px solid ${newMoveColor};margin-bottom:14px;background:rgba(138,180,248,0.08)">`;
	buf += `<div class="pr-sv-move-top">`;
	buf += `<b class="pr-sv-move-name" style="color:#c4a8ff">${escapeHTML(newMove.name)}</b>`;
	buf += `<span class="pr-type" style="background:${newMoveColor};color:#fff;font-size:9px">${newMove.type}</span>`;
	buf += `</div>`;
	buf += `<div class="pr-sv-move-meta">${newMoveCatIcon} ${newMove.category} &nbsp;·&nbsp; Pwr: <b>${newMove.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${newMove.accuracy === true ? '—' : (newMove.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${newMove.priority > 0 ? `+${newMove.priority}` : newMove.priority}</b> &nbsp;·&nbsp; PP: <b>${newMoveMaxPp}</b></div>`;
	if (newMove.shortDesc || newMove.desc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${escapeHTML(newMove.shortDesc || newMove.desc)}</div>`;
	buf += `</div>`;

	buf += `<div style="font-size:11px;color:#aaa;margin-bottom:6px">Choose a move to forget:</div>`;

	for (let i = 0; i < mon.moves.length; i++) {
		const oldMove = Dex.moves.get(mon.moves[i]);
		const maxPp = Math.floor((oldMove.pp || 5) * (8 / 5));
		const curPp = maxPp;
		const mColor = '#' + typeColor(oldMove.type || 'Normal');
		const catIcon = oldMove.category === 'Physical' ? '' : oldMove.category === 'Special' ? '◆' : '●';
		const moveDesc = oldMove.shortDesc || oldMove.desc || '';

		buf += `<div style="display:flex;align-items:stretch;gap:6px;margin-bottom:6px">`;
		buf += `<div class="pr-sv-move" style="border-left:3px solid ${mColor};flex:1;margin-bottom:0">`;
		buf += `<div class="pr-sv-move-top">`;
		buf += `<b class="pr-sv-move-name">${escapeHTML(oldMove.name)}</b>`;
		buf += `<span class="pr-type" style="background:${mColor};color:#fff;font-size:9px">${oldMove.type}</span>`;
		buf += `</div>`;
		buf += `<div class="pr-sv-move-meta">${catIcon} ${oldMove.category} &nbsp;·&nbsp; Pwr: <b>${oldMove.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${oldMove.accuracy === true ? '—' : (oldMove.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${oldMove.priority > 0 ? `+${oldMove.priority}` : oldMove.priority}</b> &nbsp;·&nbsp; PP: <b>${curPp}/${maxPp}</b></div>`;
		if (moveDesc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${escapeHTML(moveDesc)}</div>`;
		buf += `</div>`;
		buf += `<div style="display:flex;gap:8px;margin-left:auto">`;
		buf += renderBtn(`/sggame resolve learnmove ${i + 1}`, 'Forget', 'pr-pick-btn');
		buf += `</div>`;
		buf += `</div>`;
	}

	buf += renderBtn('/sggame resolve learnmove skip', 'Keep old moves', 'pr-btn', 'width:100%;padding:8px;margin-top:2px');
	return buf;
}

export function renderItemOptions(state: SGGameState): string {
	let buf = `<h2 class="pr-choice-heading">Choose an item!</h2><div class="pr-choice-grid">`;
	for (const itemName of state.itemOptions!) {
		const dexItem = Dex.items.get(itemName);
		const flexHtml = `<div style="display:flex;align-items:center;gap:8px">${getShopItemIcon(itemURLFormat(itemName), 24)}<span style="font-size:13px;font-weight:500">${escapeHTML(dexItem.name || itemName)}</span></div>`;
		buf += renderChoiceRow('', flexHtml, renderBtn(`/sggame resolve pickitem ${toID(itemName)}`, 'Pick', 'pr-pick-btn'), 'justify-content:space-between');
	}
	buf += renderBtn('/sggame resolve pickitem skip', 'Skip', 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function renderGiveItemChoices(state: SGGameState, pendingItemId: string, dexItem: any, actionVerb: string): string {
	let buf = `<div class="pr-choice-grid">`;
	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const dexSpecies = Dex.species.get(toID(mon.species));
		const spName = dexSpecies.name;

		let isCompatible = true;
		let reason = '';
		let isEvoAble = false;

		if (state.pendingItemIsEvo) {
			const evoList = dexSpecies.evos;
			if (evoList) {
				for (const newEvo of evoList) {
					const evoData = Dex.species.get(newEvo);
					const evoItemId = toID(evoData.evoItem);

					const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
					const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId === pendingItemId;
					const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && pendingItemId === 'linkingcord';

					if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution) {
						isEvoAble = true;
						break;
					}
				}
			}
			if (!isEvoAble) {
				isCompatible = false;
				reason = 'Incompatible';
			}
		} else if (state.pendingItemIsMega) {
			isCompatible = false;
			const megaItem = dexItem as ReturnType<typeof Dex.items.get> & { megaEvolves?: string };
			if (megaItem.megaEvolves && toID(megaItem.megaEvolves) === toID(mon.species)) {
				isCompatible = true;
			}
			if (!isCompatible) reason = 'Incompatible';
		} else if (state.pendingItemIsGmax) {
			isCompatible = !!Dex.species.get(toID(mon.species)).canGigantamax;
			if (!isCompatible) reason = 'Incompatible';
		}

		let flexHtml = `<span style="font-size:12px;font-weight:500">${spName}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}${reason ? ` <span style="color:#f87171">(${reason})</span>` : ''}</span>`;

		if (mon.heldItem) flexHtml += `<div style="font-size:9px;color:#8ab4f8">Holds: ${escapeHTML(Dex.items.get(mon.heldItem).name || mon.heldItem)}</div>`;

		if (isEvoAble || (state.pendingItemIsMega && isCompatible) || (state.pendingItemIsGmax && isCompatible)) {
			flexHtml += `<div style="font-size:10px;color:#4caf50;font-weight:bold;margin-top:2px;letter-spacing:0.5px;">ABLE!</div>`;
		}

		const btnHtml = isCompatible ? renderBtn(`/sggame resolve giveitem ${i + 1}`, actionVerb, 'pr-pick-btn') : '';
		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, btnHtml, isCompatible ? '' : 'opacity:.4;filter:grayscale(80%);');
	}
	return buf;
}

export function renderGiveItem(state: SGGameState): string {
	const dexItem = Dex.items.get(state.pendingItemName);
	const pendingItemId = toID(state.pendingItemName);

	let actionVerb = 'Give';
	if (state.pendingItemIsEvo) actionVerb = 'Evolve';
	if (state.pendingItemIsMega) actionVerb = 'Mega Evolve';
	if (state.pendingItemIsGmax) actionVerb = 'Gigantamax';

	let buf = `<h2 class="pr-choice-heading">${actionVerb} ${escapeHTML(dexItem.name || state.pendingItemName!)}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a Pokémon:</div>`;

	buf += renderGiveItemChoices(state, pendingItemId, dexItem, actionVerb);

	const cancelText = state.pendingDraftPick ? 'Cancel <small style="color:#888">(return to draft)</small>' : 'Cancel <small style="color:#888">(refund)</small>';
	buf += renderBtn('/sggame resolve giveitem skip', cancelText, 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function getVitaminEligibility(mon: PokemonEntry, hp: number, consumableItem: any): { disabled: boolean, reason: string } {
	const evStat = (consumableItem)?.evStat;
	if (!evStat) return { disabled: true, reason: 'invalid' };
	if (!mon.evs) mon.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	let totalEvs = 0;
	for (const val of Object.values(mon.evs as Record<string, number>)) totalEvs += val;
	const statEv = mon.evs[evStat as StatID] ?? 0;
	const disabled = hp <= 0 || totalEvs >= 508 || statEv >= 252;
	const reason = hp <= 0 ? 'fainted' : totalEvs >= 508 ? 'EVs full' : statEv >= 252 ? `${evStat} maxed` : '';
	return { disabled, reason };
}

function getTMEligibility(mon: PokemonEntry, hp: number, consumableItem: any, state: SGGameState): { disabled: boolean, reason: string } {
	const moveId = state.purchasedItem!.includes('_') ?
		state.purchasedItem!.substring(state.purchasedItem!.indexOf('_') + 1).replace(/[^a-z0-9]/g, '') :
		toID(consumableItem.name.replace(/^TM\d+\s*/i, ''));
	const moveData = Dex.moves.get(moveId);
	if (!moveData.exists) return { disabled: true, reason: 'invalid TM' };
	if (hp <= 0) return { disabled: true, reason: 'fainted' };
	if (mon.moves.includes(moveData.id)) return { disabled: true, reason: 'already knows' };
	let canLearn = false, spData = Dex.species.get(mon.species);
	while (spData && !canLearn) {
		const learnsetData = Dex.species.getLearnsetData(spData.id)?.learnset;
		if (learnsetData?.[moveData.id]) canLearn = true;
		if (spData.prevo) spData = Dex.species.get(spData.prevo);
		else if (spData.baseSpecies && toID(spData.baseSpecies) !== spData.id) spData = Dex.species.get(spData.baseSpecies);
		else break;
	}
	if (!canLearn) return { disabled: true, reason: 'incompatible' };
	return { disabled: false, reason: '' };
}

function getConsumableEligibility(mon: PokemonEntry, consumableType: string, hp: number, consumableItem: any, state: SGGameState): { disabled: boolean, reason: string } {
	let disabled = false, reason = '';
	switch (consumableType) {
	case 'healHP': return { disabled: hp >= 100 || hp <= 0, reason: hp <= 0 ? 'fainted' : hp >= 100 ? 'full HP' : '' };
	case 'revive': return { disabled: hp > 0, reason: hp > 0 ? 'not fainted' : '' };
	case 'cureStatus': return { disabled: !mon.status || hp <= 0, reason: hp <= 0 ? 'fainted' : !mon.status ? 'no status' : '' };
	case 'vitamin': return getVitaminEligibility(mon, hp, consumableItem);
	case 'tm': return getTMEligibility(mon, hp, consumableItem, state);
	case 'mint':
	case 'rareCandy':
		if (hp <= 0) { disabled = true; reason = 'fainted'; }
		break;
	case 'xItem':
		if (hp <= 0) { disabled = true; reason = 'fainted'; }
		const buffStat = consumableItem?.buffStat;
		if (buffStat && mon.activeBuffs?.[buffStat]) reason = `active: ${mon.activeBuffs[buffStat]} left`;
		break;
	}
	return { disabled, reason };
}

function renderConsumableChoices(state: SGGameState, consumableType: string, consumableItem: any): string {
	let buf = `<div class="pr-choice-grid">`;
	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const hp = mon.currentHp ?? 100;
		const { disabled, reason } = getConsumableEligibility(mon, consumableType, hp, consumableItem, state);

		let flexHtml = `<span style="font-size:12px;font-weight:500">${Dex.species.get(toID(mon.species)).name}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}${reason ? ` (${reason})` : ''}</span>`;
		if (mon.status) flexHtml += `<div style="font-size:9px;color:#ff9800">${mon.status.toUpperCase()}</div>`;
		if (hp < 100 && hp > 0) flexHtml += `<div style="font-size:9px;color:#aaa">${hp}% HP</div>`;

		if (consumableType === 'vitamin' && mon.evs) {
			const evStat = (consumableItem)?.evStat;
			const statLabel: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
			let totalEvs = 0;
			for (const val of Object.values(mon.evs as Record<string, number>)) totalEvs += val;
			flexHtml += `<div style="font-size:9px;">${statLabel[evStat] ?? evStat} EVs: ${mon.evs[evStat as StatID] ?? 0}/252 &nbsp;·&nbsp; Total: ${totalEvs}/508</div>`;
		}

		if ((consumableType === 'tm' || consumableType === 'mint') && !disabled) {
			flexHtml += `<div style="font-size:9px;color:#8ab4f8">Compatible!</div>`;
		}

		const btnHtml = disabled ? '' : renderBtn(`/sggame resolve useshopitem ${i + 1}`, 'Use', 'pr-pick-btn');
		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, btnHtml, disabled ? 'opacity:.45' : '');
	}
	return buf;
}

export function renderConsumable(state: SGGameState): string {
	const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
	const consumableItem = activeShop[state.purchasedItem!];
	const consumableType = state.pendingConsumableType!;

	let buf = `<h2 class="pr-choice-heading">Use ${escapeHTML(consumableItem?.name ?? state.purchasedItem!)}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a Pokémon:</div>`;

	buf += renderConsumableChoices(state, consumableType, consumableItem);

	const cancelText = state.pendingDraftPick ? 'Cancel <small style="color:#888">(return to draft)</small>' : 'Cancel <small style="color:#888">(refund)</small>';
	buf += renderBtn('/sggame resolve useshopitem skip', cancelText, 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

export function renderMoveMon(state: SGGameState): string {
	const fromIdx = state.pendingMoveSlot!;
	const mon = state.team[fromIdx];
	const spName = Dex.species.get(toID(mon.species)).name;

	let buf = `<h2 class="pr-choice-heading">Move ${spName}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a slot to swap with:</div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const targetMon = state.team[i];
		const disabled = i === fromIdx;
		const targetSpName = Dex.species.get(toID(targetMon.species)).name;
		const flexHtml = `<span style="font-size:12px;font-weight:500">${targetSpName}</span> <span style="font-size:10px;color:#888">Lv. ${targetMon.level}</span>`;
		const btnHtml = disabled ? '' : renderBtn(`/sggame movemon confirm ${i + 1}`, 'Swap', 'pr-pick-btn');
		buf += renderChoiceRow(getSpriteWithBall(targetMon.species, 40, targetMon.ball), flexHtml, btnHtml, disabled ? 'opacity:.45' : '');
	}

	buf += renderBtn('/sggame movemon cancel', 'Cancel', 'pr-btn', 'width:100%;padding:8px;margin-top:2px');
	return buf + `</div>`;
}

export function renderReleaseMon(state: SGGameState): string {
	const mon = state.team[state.pendingReleaseSlot!];
	const spName = Dex.species.get(toID(mon.species)).name;

	let buf = `<h2 class="pr-choice-heading" style="color:#ef4444">Release ${spName}?</h2>`;
	buf += `<div style="text-align:center;margin-bottom:10px">${getSpriteWithBall(mon.species, 64, mon.ball)}`;
	buf += `<div style="font-size:12px;color:#aaa;margin-top:6px">Are you sure you want to release <b>Lv. ${mon.level} ${spName}</b>?<br>This action cannot be undone!</div>`;

	if (mon.heldItem) {
		const itemName = Dex.items.get(mon.heldItem).name;
		buf += `<div style="font-size:11px;color:#ff9800;margin-top:6px;font-weight:500;">Warning: It is holding ${escapeHTML(itemName)} which will be permanently lost!</div>`;
	}

	buf += `</div><center>`;
	buf += renderBtn('/sggame releasemon confirm', 'Yes, release it', 'pr-btn danger', 'padding:10px 20px') + `&nbsp;&nbsp;&nbsp;`;
	buf += renderBtn('/sggame releasemon cancel', 'Cancel', 'pr-btn', 'padding:10px 20px') + `</center>`;

	return buf;
}




export interface StatsViewModel {
	mon: PokemonEntry;
	spData: ReturnType<typeof Dex.species.get>;
	showAbilityArrows: boolean;
	showNatureArrows: boolean;
	showTeraArrows: boolean;
	natureName: string;
	naturePlus: string | null;
	natureMinus: string | null;
	abilityName: string;
	abilityDesc: string;
	bs: Record<string, number>;
	ivs: StatTable;
	evs: StatTable;
	stats: Record<string, number>;
	maxStats: Record<string, number>;
	totalEvs: number;
	hpPct: number;
	hpColor: string;
	dateStr: string;
	heldItem: ReturnType<typeof Dex.items.get> | null;
	genderHtml: string;
	statusHtml: string;
	statKeys: StatID[];
	statLabels: Record<string, string>;
	statColors: Record<string, string>;
	tabNames: string[];
	prevTab: number;
	nextTab: number;
	teamNav: { isMe: boolean, slot: number, name: string }[];
}

function buildStatsModelBase(mon: PokemonEntry, spData: any, state: SGGameState, user: User) {
	let showAbilityArrows = false;
	let showNatureArrows = false;
	let showTeraArrows = false;

	if (state.isConfiguringStarter) {
		const userData = getUserData(user.id);
		let baseSpecies = toID(mon.species);
		while (true) {
			const sp = Dex.species.get(baseSpecies);
			if (!sp.prevo) break;
			baseSpecies = toID(sp.prevo);
		}
		const starterData = userData.starters[baseSpecies];
		if (starterData) {
			if ((starterData.unlockedAbilities?.length || 0) > 1) showAbilityArrows = true;
			if ((starterData.unlockedNatures?.length || 0) > 1) showNatureArrows = true;
			const hasTera = false;
			if (hasTera && (starterData.unlockedTeraTypes?.length || 0) > 1) showTeraArrows = true;
		}
	}
	return { showAbilityArrows, showNatureArrows, showTeraArrows };
}

function calculateStatsAndMax(mon: PokemonEntry, spData: any, naturePlus: string | null, natureMinus: string | null, state: SGGameState) {
	const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const ivs = mon.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
	const evs = mon.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const statKeys: StatID[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
	const stats: Record<string, number> = {}, maxStats: Record<string, number> = {};
	for (const stat of statKeys) {
		if (stat === 'hp') {
			stats.hp = Math.floor((2 * bs.hp + ivs.hp + Math.floor(evs[stat] / 4)) * mon.level / 100) + mon.level + 10;
		} else {
			let val = Math.floor((2 * bs[stat] + ivs[stat] + Math.floor(evs[stat] / 4)) * mon.level / 100) + 5;
			if (naturePlus === stat) val = Math.floor(val * 1.1);
			if (natureMinus === stat) val = Math.floor(val * 0.9);
			stats[stat] = val;
		}
	}
	if (spData.id === 'shedinja') stats.hp = 1;

	const maxStatLevel = MODE_CONFIGS[state.gameMode]?.maxLevel ?? 200;
	for (const stat of statKeys) {
		if (stat === 'hp') {
			maxStats.hp = spData.id === 'shedinja' ? 1 : Math.floor((2 * bs.hp + 31 + Math.floor(252 / 4)) * maxStatLevel / 100) + maxStatLevel + 10;
		} else {
			maxStats[stat] = Math.floor((Math.floor((2 * bs[stat] + 31 + Math.floor(252 / 4)) * maxStatLevel / 100) + 5) * 1.1);
		}
	}
	return { bs, ivs, evs, statKeys, stats, maxStats };
}

export function buildStatsViewModel(state: SGGameState, user: User, slot: number, activeTab: number): StatsViewModel {
	const mon = state.team[slot];
	const spData = Dex.species.get(toID(mon.species));
	const { showAbilityArrows, showNatureArrows, showTeraArrows } = buildStatsModelBase(mon, spData, state, user);

	const natureName = mon.nature || 'Hardy';
	const nature = Dex.natures.get(natureName) ?? Dex.natures.get('Hardy');
	const naturePlus = nature?.plus ?? null, natureMinus = nature?.minus ?? null;

	const abilities = spData.abilities;
	const rawAbility = mon.ability || abilities[0] || '';
	const abilityDex = rawAbility ? Dex.abilities.get(rawAbility) : null;
	const abilityName = abilityDex?.name || rawAbility || 'Unknown';
	const abilityDesc = abilityDex?.shortDesc || abilityDex?.desc || '';

	const { bs, ivs, evs, statKeys, stats, maxStats } = calculateStatsAndMax(mon, spData, naturePlus, natureMinus, state);
	const statLabels: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SPA', spd: 'SPD', spe: 'SPE' };
	const statColors: Record<string, string> = { hp: '#FF5959', atk: '#F5AC78', def: '#FAE078', spa: '#9DB7F5', spd: '#A7DB8D', spe: '#FA92B2' };

	const hpPct = mon.currentHp ?? 100;
	const hpColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336';
	const dateStr = mon.metDate ? new Date(mon.metDate).toLocaleDateString() : 'Unknown';
	const heldItem = mon.heldItem ? Dex.items.get(mon.heldItem) : null;

	let genderHtml = '';
	if (mon.gender === 'M') genderHtml = `<span style="color:#4f8ef7"></span>`;
	else if (mon.gender === 'F') genderHtml = `<span style="color:#f74f8e"></span>`;

	const statusColors: Record<string, string> = { brn: '#e8603c', psn: '#b563ce', tox: '#b563ce', par: '#d4b800', slp: '#7a7a7a', frz: '#6aaed6' };
	let statusHtml = '';
	if (mon.status) {
		const sc = statusColors[mon.status] || '#888';
		statusHtml = `<span style="font-size:9px;font-weight:700;background:${sc};color:#fff;padding:1px 5px;border-radius:3px;margin-left:3px">${mon.status.toUpperCase()}</span>`;
	}

	const tabNames = ['Info', 'Stats', 'Moves'];
	const prevTab = (activeTab - 1 + tabNames.length) % tabNames.length, nextTab = (activeTab + 1) % tabNames.length;
	const teamNav = state.team.map((m, i) => ({ isMe: i === slot, slot: i, name: Dex.species.get(toID(m.species)).name }));

	let totalEvs = 0;
	for (const val of Object.values(evs as Record<string, number>)) totalEvs += val;

	return {
		mon, spData, showAbilityArrows, showNatureArrows, showTeraArrows, natureName, naturePlus, natureMinus,
		abilityName, abilityDesc, bs, ivs, evs, stats, maxStats, totalEvs, hpPct, hpColor,
		dateStr, heldItem, genderHtml, statusHtml, statKeys, statLabels, statColors, tabNames, prevTab, nextTab, teamNav,
	};
}

function renderStatsTab0(vm: StatsViewModel, state: SGGameState, slot: number): string {
	let buf = `<div class="pr-sv-row"><span class="pr-sv-row-label">Ability</span><div class="pr-sv-row-val">`;
	if (vm.showAbilityArrows) {
		buf += `<b>${escapeHTML(vm.abilityName)}</b>&nbsp;&nbsp;&nbsp;${renderBtn(`/sggame cyclestarter ability next ${slot}`, 'Change', 'pr-btn', 'font-size:8px;padding:3px 6px')}`;
	} else {
		buf += `<b>${escapeHTML(vm.abilityName)}</b>`;
	}
	if (vm.abilityDesc) buf += `<div class="pr-sv-subdesc">${escapeHTML(vm.abilityDesc)}</div>`;
	buf += `</div></div>`;

	let natureSuffix = `<span class="pr-sv-subdesc"></span>`;
	if (vm.naturePlus && vm.natureMinus) {
		natureSuffix = ` <span style="color:#16a34a;font-size:10px;font-weight:600">▲${vm.statLabels[vm.naturePlus]}</span> <span style="color:#dc2626;font-size:10px;font-weight:600">▼${vm.statLabels[vm.natureMinus]}</span>`;
	}
	buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Nature</span><div class="pr-sv-row-val">`;
	if (vm.showNatureArrows) {
		buf += `<b>${escapeHTML(vm.natureName)}</b>&nbsp;&nbsp;${natureSuffix}&nbsp;&nbsp;&nbsp;${renderBtn(`/sggame cyclestarter nature next ${slot}`, 'Change', 'pr-btn', 'font-size:8px;padding:3px 6px')}`;
	} else {
		buf += `<b>${escapeHTML(vm.natureName)}</b>&nbsp;&nbsp;${natureSuffix}`;
	}
	buf += `</div></div>`;

	buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Item</span><div class="pr-sv-row-val">`;
	if (vm.heldItem) {
		buf += `<div style="display:flex; justify-content:space-between; align-items:center;"><div>${getShopItemIcon(vm.heldItem.name, 14)} <b>${escapeHTML(vm.heldItem.name)}</b>`;
		if (vm.heldItem.shortDesc) buf += `<div class="pr-sv-subdesc">${escapeHTML(vm.heldItem.shortDesc)}</div>`;
		buf += `</div>${renderBtn(`/sggame unequip ${slot + 1}`, 'Take Item', 'pr-shop-buy', 'padding:5px 10px; font-size:11px; margin-left: 10px; white-space:nowrap;')}</div>`;
	} else {
		buf += `<span style="color:#aaa">None</span>`;
	}
	buf += `</div></div>`;

	const hasTera = false;
	if (vm.mon.teraType && hasTera) {
		buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Tera</span><div class="pr-sv-row-val">`;
		if (vm.showTeraArrows) {
			buf += `${renderTypeBadge([vm.mon.teraType])}&nbsp;&nbsp;&nbsp;${renderBtn(`/sggame cyclestarter tera next ${slot}`, 'Change', 'pr-btn', 'font-size:8px;padding:3px 6px')}`;
		} else {
			buf += `${renderTypeBadge([vm.mon.teraType])}`;
		}
		buf += `</div></div>`;
	}

	buf += `<div class="pr-sv-divider"></div>`;

	const memo: [string, string][] = [
		['OT', escapeHTML(vm.mon.originalTrainer || 'Unknown')],
		['ID No.', vm.mon.otId || '??????'],
		['Met at', escapeHTML(vm.mon.metLocation || 'Unknown')],
		['Met Lv.', String(vm.mon.metLevel ?? '?')],
		['Date', vm.dateStr],
		['Ball', escapeHTML(vm.mon.ball ? vm.mon.ball.replace('ball', ' Ball').replace(/^./, c => c.toUpperCase()) : 'Poké Ball')],
	];
	for (const [label, val] of memo) {
		buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">${label}</span><div class="pr-sv-row-val">${val}</div></div>`;
	}
	return buf;
}

function renderStatsTab1(vm: StatsViewModel): string {
	let buf = `<div class="pr-sv-stat-row" style="font-size:9px;color:#888;margin-bottom:4px;font-weight:600"><span class="pr-sv-stat-label"></span><div class="pr-sv-bar-wrap"></div><span class="pr-sv-stat-val">Stat</span><span class="pr-sv-stat-iv">IV</span><span class="pr-sv-stat-iv">EV</span></div>`;

	for (const stat of vm.statKeys) {
		const iv = vm.ivs[stat] ?? 31;
		const ev = vm.evs[stat] ?? 0;
		const actual = vm.stats[stat] ?? 0;
		const barPct = Math.min(100, Math.round((actual / (vm.maxStats[stat] || 1)) * 100));
		const isPlus = vm.naturePlus === stat;
		const isMinus = vm.natureMinus === stat;
		const valStyle = isPlus ? 'color:#16a34a;font-weight:700' : isMinus ? 'color:#dc2626;font-weight:700' : '';
		const evStyle = ev > 0 ? 'color:#c4a8ff;font-weight:600' : 'color:#555';

		buf += `<div class="pr-sv-stat-row"><span class="pr-sv-stat-label">${vm.statLabels[stat]}</span>`;
		buf += `<div class="pr-sv-bar-wrap"><div class="pr-sv-bar" style="width:${barPct}%;background:${vm.statColors[stat]}"></div></div>`;
		buf += `<span class="pr-sv-stat-val"${valStyle ? ` style="${valStyle}"` : ''}>${actual}</span>`;
		buf += `<span class="pr-sv-stat-iv" title="IV: ${iv}/31">${iv}</span>`;
		buf += `<span class="pr-sv-stat-iv" style="${evStyle}" title="EV: ${ev}/252">${ev}</span></div>`;
	}

	buf += `<div class="pr-sv-bst">EVs <b style="color:#c4a8ff">${vm.totalEvs}</b><span style="color:#555">/508</span></div>`;
	return buf;
}

function renderStatsTab2(vm: StatsViewModel, state: SGGameState, slot: number, user: User): string {
	let buf = '';
	const moves = vm.mon.moves || [];
	let hasAltMoves = false;
	if (state.isConfiguringStarter) {
		let baseSpecies = toID(vm.mon.species);
		while (true) {
			const sp = Dex.species.get(baseSpecies);
			if (!sp.prevo) break;
			baseSpecies = toID(sp.prevo);
		}
		const starterData = getUserData(user.id).starters[baseSpecies];
		const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
		const allLevel = getAllLevelUpMoves(baseSpecies, vm.mon.level, config.generation || 9);
		const pool = new Set(allLevel);
		const validEggMoves = getEggMoves(baseSpecies, config.generation || 9);
		if (pool.size > moves.length) hasAltMoves = true;
	}

	for (let i = 0; i < 4; i++) {
		if (i < moves.length) {
			const move = Dex.moves.get(moves[i]);
			const maxPp = Math.floor((move.pp || 5) * (8 / 5));
			const mColor = '#' + typeColor(move.type);
			const catIcon = move.category === 'Physical' ? '' : move.category === 'Special' ? '◆' : '●';
			const moveDesc = move.shortDesc || move.desc || '';

			buf += `<div class="pr-sv-move" style="border-left:3px solid ${mColor}"><div class="pr-sv-move-top" style="display:flex;justify-content:space-between;align-items:flex-start;">`;
			buf += `<b class="pr-sv-move-name">${escapeHTML(move.name)}</b>`;
			buf += `<div style="text-align:right;">`;
			buf += `<span class="pr-type" style="background:${mColor};color:#fff;font-size:9px;display:inline-block;">${move.type}</span>`;
			if (state.isConfiguringStarter && hasAltMoves) {
				buf += `<br>${renderBtn(`/sggame cyclestarter move next ${slot} ${i}`, 'Change', 'pr-btn', 'font-size:8px;padding:2px 4px;margin-top:4px;')}`;
			}
			buf += `</div></div>`;
			buf += `<div class="pr-sv-move-meta">${catIcon} ${move.category} &nbsp;·&nbsp; Pwr: <b>${move.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${move.accuracy === true ? '—' : (move.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${move.priority > 0 ? `+${move.priority}` : move.priority}</b> &nbsp;·&nbsp; PP: <b>${maxPp}/${maxPp}</b></div>`;
			if (moveDesc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${escapeHTML(moveDesc)}</div>`;
			buf += `</div>`;
		} else {
			buf += `<div class="pr-sv-move pr-sv-move-empty" style="display:flex;justify-content:space-between;align-items:center;">`;
			buf += `<span>— empty —</span>`;
			if (state.isConfiguringStarter && hasAltMoves) {
				buf += renderBtn(`/sggame cyclestarter move next ${slot} ${i}`, 'Add Move', 'pr-btn', 'font-size:8px;padding:2px 4px;');
			}
			buf += `</div>`;
		}
	}
	return buf;
}

function renderStatsHeader(vm: StatsViewModel): string {
	let buf = `<div class="pr-sv-header">`;
	buf += `<div class="pr-sv-sprite-col">${getSprite(vm.mon.species, 80, vm.mon.shiny, 'pr-sv-sprite')}</div>&nbsp;&nbsp;`;
	buf += `<div class="pr-sv-info-col">`;
	buf += `<div class="pr-sv-name">${escapeHTML(vm.spData.name)} ${vm.genderHtml}${vm.mon.shiny ? ' <span class="pr-sv-shiny"></span>' : ''}&nbsp;&nbsp;<span class="pr-level-badge">Lv.${vm.mon.level}</span></div>`;
	buf += `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;">${renderTypeBadge(vm.spData.types ?? [])}</div>`;
	buf += `<div class="pr-sv-hp-row"><span class="pr-sv-hp-label">HP</span>`;
	buf += `<div class="pr-bar-track" style="flex:1"><div class="pr-bar-fill" style="width:${vm.hpPct}%;background:${vm.hpColor}"></div></div>`;
	buf += `<span class="pr-sv-hp-pct" style="color:${vm.hpColor}">${vm.hpPct}%</span>`;
	if (vm.statusHtml) buf += vm.statusHtml;
	buf += `</div></div></div>`;
	return buf;
}

export function renderStatsView(state: SGGameState, user: User): string {
	const slot = state.pendingStatsSlot, activeTab = state.statsTab ?? 0;
	if (slot === undefined || slot < 0 || slot >= state.team.length) return `<div class="pr-warning-box">Error loading stats.</div>`;

	const vm = buildStatsViewModel(state, user, slot, activeTab);
	let buf = `<div class="pr-sv-wrap">${renderStatsHeader(vm)}`;

	buf += `<div class="pr-sv-nav">${renderBtn(`/sggame statstab prev`, '&#9664;', 'pr-sv-arrow')}`;
	for (let i = 0; i < vm.tabNames.length; i++) buf += renderBtn(i === activeTab ? null : `/sggame statstab ${i}`, vm.tabNames[i], `pr-sv-dot${i === activeTab ? ' active' : ''}`);
	buf += `${renderBtn(`/sggame statstab next`, '&#9654;', 'pr-sv-arrow')}</div>`;

	buf += `<div class="pr-sv-tab">`;
	if (activeTab === 0) buf += renderStatsTab0(vm, state, slot);
	if (activeTab === 1) buf += renderStatsTab1(vm);
	if (activeTab === 2) buf += renderStatsTab2(vm, state, slot, user);
	buf += `</div>`;

	if (vm.teamNav.length > 1 && !state.isConfiguringStarter) {
		buf += `<div class="pr-sv-team-nav">`;
		for (const nav of vm.teamNav) {
			if (nav.isMe) buf += `<span class="pr-sv-team-pip active" title="${escapeHTML(nav.name)}"></span>`;
			else buf += `<button name="send" value="/sggame view stats ${nav.slot}" class="pr-sv-team-btn" title="${escapeHTML(nav.name)}"><span class="pr-sv-team-pip"></span></button>`;
		}
		buf += `</div>`;
	}
	buf += `</div>`;

	if (state.isConfiguringStarter) {
		const useNewStarterSelectionUI = (MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic']).useNewStarterSelectionUI !== false;
		if (useNewStarterSelectionUI) buf += `<div style="text-align:center;margin-bottom:8px">${renderBtn('/sggame view starterselect', 'Back to Selection', 'pr-btn primary', 'font-size:16px;padding:5px 10px')}</div>`;
		else buf += `<div style="text-align:center;margin-bottom:8px">${renderBtn('/sggame confirmstarter', 'Choose & Start', 'pr-btn primary', 'font-size:16px;padding:5px 10px')}</div>`;
	}
	return buf;
}

export function renderMainView(state: SGGameState, user: User): string {
	if (state.battleRoomId) {
		return `<div style="text-align:center;padding:18px 0;color:#fac000;font-weight:500">Battle in progress!</div>`;
	}

	let buf = renderStatBar(state);

	buf += `<div style="text-align:center;margin-bottom:8px">`;

	if (state.pendingRewardDraft?.length) {
		buf += renderBtn('/sggame view draft', 'Return to Draft', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
	} else {
		buf += renderBtn('/sggame prebattle', 'Start battle', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
	}

	buf += `</div>`;

	buf += `<div class="pr-section-title">Your team</div>`;
	buf += `<div class="pr-table-container"><table class="pr-table">`;
	buf += `<thead><tr><th colspan="2">Pokémon</th><th style="text-align:right">Action</th></tr></thead><tbody>`;

	const genNumber = MODE_CONFIGS[state.gameMode]?.generation || 9;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];

		const btnStyle = "display:block;width:100%;margin-bottom:4px;box-sizing:border-box;";
		let actionBtn = renderBtn(`/sggame movemon ${i + 1}`, 'Move', 'pr-shop-buy', btnStyle);

		if (state.team.length > 1) {
			actionBtn += renderBtn(`/sggame releasemon ${i + 1}`, 'Release', 'pr-shop-buy', "display:block;width:100%;box-sizing:border-box;");
		}

		const statsBtnStyle = "display:block;width:100%;margin-top:8px;box-sizing:border-box;text-align:center;padding:3px 0;";
		let statsBtn = renderBtn(`/sggame view stats ${i}`, 'Stats', 'pr-shop-buy', statsBtnStyle);

		if (mon.heldItem && state.team.length > 1) {
			statsBtn += `<details><summary class="pr-btn pr-shop-buy" style="${statsBtnStyle}list-style:none;cursor:pointer;">Transfer Item</summary><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">`;
			for (let j = 0; j < state.team.length; j++) {
				if (i !== j) statsBtn += renderBtn(`/sggame transferitem ${i + 1} ${j + 1}`, `${j + 1}`, 'pr-shop-buy', 'flex:1;padding:2px 0;font-size:10px;');
			}
			statsBtn += `</div></details>`;
		}

		buf += renderTeamTableRow(mon, actionBtn, genNumber, statsBtn);
	}

	buf += `</tbody></table></div>`;
	return buf;
}

function renderTopEntriesForEggsOrShinies(mode: string): string {
	const statKey = "shiniesUnlocked";
	const statName = mode === 'eggs' ? 'Eggs Hatched' : 'Shinies Unlocked';
	const customEntries = Object.entries(globalStats)
		.map(([userid, s]) => ({ userid, displayName: s.displayName, statValue: s.shiniesUnlocked || 0 }))
		.filter(data => data.statValue > 0)
		.sort((a, b) => b.statValue - a.statValue)
		.slice(0, 100);

	if (!customEntries.length) return `<div style="text-align:center;padding:16px;color:#888;font-size:13px">No records yet!</div>`;

	let buf = `<table class="pr-table" style="width:100%;border-collapse:collapse;">`;
	buf += `<thead><tr><th>Rank</th><th>Player</th><th>${statName}</th></tr></thead><tbody>`;

	let i = 0;
	for (const { userid, displayName, statValue } of customEntries) {
		buf += `<tr><td class="pr-td-desc" style="font-weight:500;white-space:nowrap;">#${i + 1}</td><td class="pr-td-name" style="white-space:nowrap;">${nameColor(displayName || userid, true, false)}</td>`;
		buf += `<td class="pr-td-desc" style="white-space:nowrap;text-align:center;">${statValue}</td></tr>`;
		i++;
	}
	return buf + `</tbody></table>`;
}

function renderTopEntriesForClassic(mode: string): string {
	const entries = Object.entries(globalStats)
		.map(([userid, s]) => {
			let statsForMode = s.stats?.[mode];
			if (!statsForMode && mode === 'classic') {
				statsForMode = {
					highestFloor: (s as any).highestFloor || 0,
					activeFloor: (s as any).highestFloor || 0,
					wins: 0,
					recordTeam: (s as any).recordTeam || [],
				};
			} else if (statsForMode && statsForMode.activeFloor === undefined) {
				statsForMode.activeFloor = statsForMode.highestFloor;
			}
			return { userid, displayName: s.displayName, statsForMode };
		})
		.filter(data => data.statsForMode && (data.statsForMode.activeFloor! > 0 || data.statsForMode.highestFloor > 0))
		.sort((a, b) => {
			if (b.statsForMode!.wins !== a.statsForMode!.wins) {
				return b.statsForMode!.wins - a.statsForMode!.wins;
			}
			if (b.statsForMode!.highestFloor !== a.statsForMode!.highestFloor) {
				return b.statsForMode!.highestFloor - a.statsForMode!.highestFloor;
			}
			return b.statsForMode!.activeFloor! - a.statsForMode!.activeFloor!;
		})
		.slice(0, 100);

	if (!entries.length) return `<div style="text-align:center;padding:16px;color:#888;font-size:13px">No records yet!</div>`;

	let buf = `<table class="pr-table" style="width:100%;border-collapse:collapse;">`;
	buf += `<thead><tr><th>Rank</th><th>Player</th><th>Wins</th><th>Highest Floor</th><th>Active Floor</th></tr></thead><tbody>`;

	let i = 0;
	for (const { userid, displayName, statsForMode } of entries) {
		buf += `<tr><td class="pr-td-desc" style="font-weight:500;white-space:nowrap;">#${i + 1}</td><td class="pr-td-name" style="white-space:nowrap;">${nameColor(displayName || userid, true, false)}</td>`;
		buf += `<td class="pr-td-desc" style="white-space:nowrap;text-align:center;">${statsForMode!.wins}</td>`;
		buf += `<td class="pr-td-desc" style="white-space:nowrap;text-align:center;">${statsForMode!.highestFloor}</td>`;
		buf += `<td class="pr-td-desc" style="white-space:nowrap;text-align:center;">${statsForMode!.activeFloor}</td></tr>`;
		i++;
	}

	return buf + `</tbody></table>`;
}




function renderSlotsTableHeader(): string {
	let buf = `<div class="pr-table-container"><table class="pr-table" style="width:100%;border-collapse:collapse;">`;
	buf += `<thead><tr>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Slot</th>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Mode</th>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Floor</th>`;
	buf += `<th style="padding:4px 6px;text-align:right;">Action</th>`;
	buf += `</tr></thead><tbody>`;
	return buf;
}

function renderSlotRow(i: number, slotData: any, action: 'save' | 'load'): string {
	let buf = `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;
	buf += `<td class="pr-td-name" style="padding:8px 6px;">Slot ${i}</td>`;
	if (slotData) {
		const mName = MODE_CONFIGS[slotData.gameMode]?.name || slotData.gameMode.charAt(0).toUpperCase() + slotData.gameMode.slice(1);
		buf += `<td class="pr-td-desc" style="padding:8px 6px;font-size:11px;">${mName}</td>`;
		buf += `<td class="pr-td-desc" style="padding:8px 6px;font-size:11px;">Floor ${slotData.floor}</td>`;
		buf += `<td class="pr-td-action" style="padding:8px 6px;text-align:right;">`;
		if (action === 'save') {
			buf += renderBtn(`/sggame saveslot ${i}`, 'Overwrite', 'pr-btn danger', 'padding:4px 8px;font-size:10px;');
		} else {
			buf += renderBtn(`/sggame loadslot ${i}`, 'Load', 'pr-pick-btn', 'padding:4px 8px;font-size:10px;');
		}
		buf += `</td>`;
	} else {
		buf += `<td class="pr-td-desc" style="padding:8px 6px;font-size:11px;color:#888;">Empty</td>`;
		buf += `<td class="pr-td-desc" style="padding:8px 6px;">-</td>`;
		buf += `<td class="pr-td-action" style="padding:8px 6px;text-align:right;">`;
		if (action === 'save') {
			buf += renderBtn(`/sggame saveslot ${i}`, 'Save', 'pr-btn primary', 'padding:4px 8px;font-size:10px;');
		} else {
			buf += `<span style="font-size:10px;color:#888;">-</span>`;
		}
		buf += `</td>`;
	}
	buf += `</tr>`;
	return buf;
}

export function renderSlotsView(user: User, action: 'save' | 'load'): string {
	const userData = getUserData(user.id);
	let buf = `<div class="pr-section-title">${action === 'save' ? 'Save & Quit' : 'Load Game'}</div>`;
	buf += `<div style="text-align:center;color:#aaa;font-size:12px;margin-bottom:14px;">`;
	buf += action === 'save' ?
		`Choose a slot to save and suspend your current run. <br><b style="color:#f87171">This will pause and remove your active run from play until you load it again.</b>` :
		`Choose a saved game to load. This will overwrite your current active run. <br><b style="color:#f87171">Loading a save slot permanently removes it.</b>`;
	buf += `</div>`;
	buf += renderSlotsTableHeader();
	for (let i = 1; i <= 3; i++) {
		buf += renderSlotRow(i, userData.saveSlots?.[i], action);
	}
	buf += `</tbody></table></div>`;
	buf += `<div style="text-align:center;margin-top:12px;">`;
	buf += renderBtn('/sggame view main', 'Cancel', 'pr-btn', 'padding:6px 12px;font-size:11px;');
	buf += `</div>`;
	return buf;
}

export function renderGamePage(state: SGGameState, user: User): string {
	const view = state.view || 'main';

	let buf = (state.battleRoomId || state.notification) ? `<meta http-equiv="refresh" content="${PAGE_REFRESH_SECONDS}">` : '';

	buf += `<div class="pr" style="min-height:100vh;padding-bottom:20px">`;

	const isEffectivelyGameOver = state.gameOver || (state.team.length === 0 && !state.isConfiguringStarter && (!state.pendingChoice || state.pendingChoice.length === 0));

	const isGameOverAccessibleView = view === 'welcome' || view === 'gacha' || view === 'incubator' || view === 'load';

	if (view === 'stats' && state.pendingStatsSlot !== undefined) return buf + renderHeader('stats', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderStatsView(state, user)}</div></div>`;
	if (view === 'save') return buf + renderHeader('save', !!isEffectivelyGameOver) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderSlotsView(user, 'save')}</div></div>`;
	if (view === 'load') return buf + renderHeader('load', !!isEffectivelyGameOver) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderSlotsView(user, 'load')}</div></div>`;

	let displayView = view;
	if (view === 'draft' && (state.pendingChoice?.length || state.pendingSwap || state.pendingMoves?.length || state.itemOptions?.length || state.pendingItemName || state.pendingConsumableType || state.pendingMoveSlot !== undefined || state.pendingReleaseSlot !== undefined)) {
		displayView = 'main';
	}
	if (state.gameWon) displayView = 'victory';

	buf += renderHeader(displayView, !!state.gameOver) + `<div style="padding:0 14px 14px">${renderNotification(state)}`;

	if (state.pendingSwap) return buf + renderPendingSwap(state) + `</div></div>`;
	if (state.pendingMoves?.length) return buf + renderPendingMoves(state) + `</div></div>`;
	if (state.itemOptions?.length) return buf + renderItemOptions(state) + `</div></div>`;
	if (state.pendingItemName) return buf + renderGiveItem(state) + `</div></div>`;
	if (state.pendingConsumableType && state.purchasedItem) return buf + renderConsumable(state) + `</div></div>`;
	if (state.pendingMoveSlot !== undefined) return buf + renderMoveMon(state) + `</div></div>`;
	if (state.pendingReleaseSlot !== undefined) return buf + renderReleaseMon(state) + `</div></div>`;


	return buf + renderMainView(state, user) + `</div></div>`;
}
export function renderWelcomeView(): string {
	return `
		<div style="text-align:center;padding:20px;">
			<h2>Welcome to SGGame</h2>
			<button name="send" value="/sggame newgame" class="button">Start Game</button>
		</div>
	`;
}
