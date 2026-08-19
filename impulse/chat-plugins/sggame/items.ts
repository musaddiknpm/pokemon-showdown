
import { TMS_DB } from './data/tms-data';
import { type PokemonEntry, type SGGameState, type ModeConfig } from './types';
import { canLearnTM } from './pokemon';

export type ItemType =
	| 'pokeball' |
	'healHP' |
	'key' |
	'revive' |
	'cureStatus' |
	'itemPack' |
	'item' |
	'evolveItem' |
	'megaStone' |
	'vitamin' |
	'tm' |
	'mint' |
	'rareCandy' |
	'gmaxMushroom' |
	'xItem';

export type ItemRarityTier = 'Common' | 'Great' | 'Ultra' | 'Rogue' | 'Master';

export interface ShopItem {
	name: string;
	icon: string;
	type: ItemType;
	category: string;
	desc: string;
	moneyMultiplier: number;
	tier: ItemRarityTier;
	weight?: number;
	minWeight?: number;
	maxWeight?: number;
	weightFunc?: (state: SGGameState) => number;
	evGain?: number;
	isShopItem?: boolean;
	minFloor?: number;
	healAmount?: number;
	healPercent?: number;
	curesStatus?: boolean;
	reviveAmount?: number;
	isMax?: boolean;
	evStat?: string;
	maxStack?: number;
	buffStat?: string;
}

export interface TierConfig {
	weight: number;
	minWeight?: number;
	maxWeight?: number;
}

export const TIER_WEIGHTS: Record<ItemRarityTier, TierConfig> = {
	'Common': { weight: 7500 },
	'Great': { weight: 1904 },
	'Ultra': { weight: 469 },
	'Rogue': { weight: 117 },
	'Master': { weight: 10 },
};

export const SHOP_ITEMS: Record<string, ShopItem> = {
	"tradestone": { name: "Trade Stone", icon: "sun-stone", type: "evolveItem", category: "Evolution", desc: "Evolves any Pokémon that normally requires a specific Evolution Stone or Trade Item.", moneyMultiplier: 10, tier: "Ultra" }, ...TMS_DB };

export function calculatePartyLuck(team: PokemonEntry[], state: SGGameState): number {
	if (state.luckOverride !== undefined) return state.luckOverride;
	let luck = 0;
	for (const mon of team) {
		if (mon.shiny) luck += 2;
	}
	return luck;
}

export function getTierWeight(tier: ItemRarityTier, state: SGGameState): number {
	const config = TIER_WEIGHTS[tier];
	let w = config.weight;

	if (config.minWeight !== undefined && w < config.minWeight) w = config.minWeight;
	if (config.maxWeight !== undefined && w > config.maxWeight) w = config.maxWeight;

	return w;
}

export function getItemWeight(item: ShopItem, state: SGGameState): number {
	let w = item.weight ?? 1;

	if (item.weightFunc) {
		w = item.weightFunc(state);
	}

	if (w <= 0) return 0;

	if (item.type === 'tm' || item.type === 'item') {
		w = Math.max(1, Math.floor(w * 0.5));
	}

	if (item.minWeight !== undefined && w < item.minWeight) w = item.minWeight;
	if (item.maxWeight !== undefined && w > item.maxWeight) w = item.maxWeight;

	return w;
}

export function rollRarity(luck: number, state: SGGameState): ItemRarityTier {
	const tiers: ItemRarityTier[] = ['Common', 'Great', 'Ultra', 'Rogue', 'Master'];
	const weights = tiers.map(t => getTierWeight(t, state));
	let totalWeight = 0;
	for (const val of weights) totalWeight += val;
	let roll = Math.random() * totalWeight;
	let currentTier = 0;

	for (let i = 0; i < weights.length; i++) {
		roll -= weights[i];
		if (roll <= 0) {
			currentTier = i;
			break;
		}
	}

	while (currentTier < tiers.length - 1) {
		if (Math.floor(Math.random() * 64) < luck) {
			currentTier++;
		} else {
			break;
		}
	}

	return tiers[currentTier];
}

export function weightedItemPick(items: [string, ShopItem][], state: SGGameState): [string, ShopItem] | undefined {
	if (items.length === 0) return undefined;
	let totalWeight = 0;
	for (const [, item] of items) totalWeight += getItemWeight(item, state);
	let roll = Math.random() * totalWeight;

	for (const itemPair of items) {
		roll -= getItemWeight(itemPair[1], state);
		if (roll <= 0) return itemPair;
	}

	return items[items.length - 1];
}

export function getWaveSet(wave: number): number {
	return Math.ceil(wave / 10) - 1;
}

export function getBaseMoneyReward(wave: number): number {
	const waveSet = getWaveSet(wave);
	return (10 * wave + 175) ** (1 + 0.005 * waveSet);
}

export function getRewardMoney(wave: number, multiplier: number): number {
	return Math.floor((getBaseMoneyReward(wave) * multiplier) / 10) * 10;
}

export function getItemPrice(wave: number, multiplier: number): number {
	return Math.floor(getBaseMoneyReward(wave) / 10) * 10 * multiplier;
}

export function getRerollCost(wave: number, rerollCount: number): number {
	const base = 250 * Math.ceil(Math.max(1, wave) / 10);
	return base * 2 ** rerollCount;
}
