import { SHOP_DB } from './shopdb';
import { TMS_DB } from './tms-db';
import { type PokemonEntry, type PokeRogueState, type ModeConfig } from './types';
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
	'stackableItem' |
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
	weightFunc?: (state: PokeRogueState) => number;
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

export const SHOP_ITEMS: Record<string, ShopItem> = { ...SHOP_DB, ...TMS_DB };

export function genItem(quantity: number, extraArg?: PokemonSet[] | string): string[] {
	let all = Dex.items.all().filter(s => (s.isGem || s.itemUser || s.zMove) || !s.isNonstandard);
	all = all.filter(i => {
		if (!i.itemUser) return i.zMove || Object.values(i).some(v => typeof v === 'function');
		const getForms = (sp: string) => {
			const ds = Dex.species.get(sp);
			return [ds.name, ...(ds.otherFormes || [])];
		};
		const pokes = typeof extraArg === 'string' ? [extraArg] : (extraArg?.map(p => p.species) || []);
		const valid = new Set(pokes.flatMap(getForms));
		return i.itemUser.some(v => valid.has(v));
	});

	for (let i = all.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[all[i], all[j]] = [all[j], all[i]];
	}
	return all.slice(0, quantity).map(i => i.name);
}

export function calculatePartyLuck(team: PokemonEntry[]): number {
	let luck = 0;
	for (const mon of team) {
		if (mon.shiny) luck += 2;
	}
	return luck;
}

export function getTierWeight(tier: ItemRarityTier, state: PokeRogueState): number {
	const config = TIER_WEIGHTS[tier];
	let w = config.weight;

	if (config.minWeight !== undefined && w < config.minWeight) w = config.minWeight;
	if (config.maxWeight !== undefined && w > config.maxWeight) w = config.maxWeight;

	return w;
}

export function getItemWeight(item: ShopItem, state: PokeRogueState): number {
	let w = item.weight ?? 1;

	if (item.weightFunc) {
		w = item.weightFunc(state);
	}

	if (w <= 0) return 0;

	if (item.type === 'tm' || item.type === 'item' || item.type === 'stackableItem') {
		w = Math.max(1, Math.floor(w * 0.5));
	}

	if (item.minWeight !== undefined && w < item.minWeight) w = item.minWeight;
	if (item.maxWeight !== undefined && w > item.maxWeight) w = item.maxWeight;

	return w;
}

export function rollRarity(luck: number, state: PokeRogueState): ItemRarityTier {
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

export function weightedItemPick(items: [string, ShopItem][], state: PokeRogueState): [string, ShopItem] | undefined {
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

function hasCompatibleEvoTarget(partySpecies: Set<string>, itemKey: string): boolean {
	for (const species of partySpecies) {
		const evos = Dex.species.get(species).evos;
		if (!evos) continue;

		for (const evoTarget of evos) {
			const evoData = Dex.species.get(evoTarget);
			if (toID(evoData.evoItem) === itemKey || (itemKey === 'linkingcord' && evoData.evoType === 'trade' && !evoData.evoItem)) {
				return true;
			}
		}
	}
	return false;
}

function hasCompatibleMegaTarget(team: PokemonEntry[], itemKey: string): boolean {
	for (const mon of team) {
		const speciesId = toID(mon.species);
		const dexItem = Dex.items.get(itemKey) as ReturnType<typeof Dex.items.get> & { megaEvolves?: string };
		if (dexItem.megaEvolves && toID(dexItem.megaEvolves) === speciesId) {
			return true;
		}
	}
	return false;
}

function hasCompatibleGmaxTarget(team: PokemonEntry[]): boolean {
	for (const mon of team) {
		const dexSpecies = Dex.species.get(toID(mon.species));
		if (dexSpecies.canGigantamax) {
			return true;
		}
	}
	return false;
}

function hasCompatibleTMTarget(team: PokemonEntry[], itemKey: string, item: ShopItem): boolean {
	const moveId = itemKey.includes('_') ?
		itemKey.substring(itemKey.indexOf('_') + 1).replace(/[^a-z0-9]/g, '') :
		toID(item.name.replace(/^TM\d+\s*/i, ''));
	const moveData = Dex.moves.get(moveId);

	if (!moveData.exists) return false;
	for (const mon of team) {
		if (mon.moves.includes(moveData.id)) continue;
		if (canLearnTM(mon.species, moveData.id)) return true;
	}
	return false;
}

function isItemValidForDraft(
	key: string,
	item: ShopItem,
	state: PokeRogueState,
	targetTier: ItemRarityTier,
	pickedKeys: Set<string>,
	tmsInDraft: number,
	heldItemsInDraft: number,
	needsHeal: boolean,
	needsRevive: boolean,
	needsCure: boolean,
	partySpecies: Set<string>
): boolean {
	if (pickedKeys.has(key)) return false;
	if (item.tier !== targetTier) return false;

	if (item.type === 'key') {
		const currentAmount = state.keyItems?.[item.name] || 0;
		if (currentAmount >= (item.maxStack ?? 1)) return false;
	}

	if (item.type === 'pokeball') {
		const currentAmount = state.inventory?.[key] || 0;
		if (currentAmount >= (item.maxStack ?? 99)) return false;
	}

	if (item.type === 'healHP' && !needsHeal) return false;
	if (item.type === 'revive' && !needsRevive) return false;
	if (item.type === 'cureStatus' && !needsCure) return false;
	if (key === 'sacredash' && !needsRevive) return false;

	if (item.type === 'evolveItem') {
		if (!hasCompatibleEvoTarget(partySpecies, key)) return false;
	}

	if (item.type === 'megaStone') {
		if (!state.keyItems?.['Mega Bracelet']) return false;
		if (!hasCompatibleMegaTarget(state.team, key)) return false;
	}

	if (item.type === 'gmaxMushroom') {
		if (!state.keyItems?.['Dynamax Band']) return false;
		if (!hasCompatibleGmaxTarget(state.team)) return false;
	}

	if (item.type === 'tm') {
		if (tmsInDraft >= 1) return false;
		if (!hasCompatibleTMTarget(state.team, key, item)) return false;
	}

	if (item.type === 'item' || item.type === 'stackableItem') {
		if (heldItemsInDraft >= 1) return false;

		const dexItem = Dex.items.get(key);
		if (dexItem.itemUser) {
			let hasCompatibleUser = false;
			const targetUsers = dexItem.itemUser.map(toID);

			for (const species of partySpecies) {
				const spData = Dex.species.get(species);
				if (targetUsers.includes(spData.id) || (spData.baseSpecies && targetUsers.includes(toID(spData.baseSpecies)))) {
					hasCompatibleUser = true;
					break;
				}
			}
			if (!hasCompatibleUser) return false;
		}
	}

	return true;
}

export function generateDraftOptions(state: PokeRogueState, config?: ModeConfig): string[] {
	const luck = calculatePartyLuck(state.team);
	state.luck = luck;

	const draft: string[] = [];

	const partySpecies = new Set(state.team.map(m => toID(m.species)));

	const needsHeal = state.team.some(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100);
	const needsRevive = state.team.some(m => (m.currentHp ?? 100) <= 0);
	const needsCure = state.team.some(m => m.status);

	const baseCount = config?.economy?.draftChoicesCount ?? 3;
	const maxCount = config?.economy?.maxDraftChoicesCount ?? Math.max(4, baseCount);
	const goldenBallStacks = state.keyItems?.['Golden Ball'] || 0;

	let extraOptions = 0;
	for (let i = 0; i < luck; i++) {
		if (Math.random() < 0.25) extraOptions++;
	}

	const effectiveBase = baseCount + goldenBallStacks;
	const effectiveMax = maxCount + goldenBallStacks;
	const draftCount = Math.min(effectiveMax, effectiveBase + extraOptions);

	const pickedKeys = new Set<string>();

	let tmsInDraft = 0;
	let heldItemsInDraft = 0;

	if (state.lockedSlots) {
		state.lockedSlots = state.lockedSlots.slice(0, draftCount);
	}

	for (let i = 0; i < draftCount; i++) {
		let targetTier: ItemRarityTier;
		const isLocked = state.lockedSlots?.[i];
		if (isLocked && state.pendingRewardDraft?.[i]) {
			targetTier = SHOP_ITEMS[state.pendingRewardDraft[i]].tier;
		} else {
			targetTier = rollRarity(luck, state);
		}

		const validItems = Object.entries(SHOP_ITEMS).filter(([key, item]) => {
			return isItemValidForDraft(
				key, item, state, targetTier, pickedKeys, tmsInDraft, heldItemsInDraft,
				needsHeal, needsRevive, needsCure, partySpecies
			);
		});

		if (validItems.length === 0) {
			const anyUnpicked = Object.entries(SHOP_ITEMS).filter(([key, item]) => {
				if (pickedKeys.has(key)) return false;
				if (item.type === 'tm' && tmsInDraft >= 1) return false;
				if ((item.type === 'item' || item.type === 'stackableItem') && heldItemsInDraft >= 1) return false;
				if (getItemWeight(item, state) <= 0) return false;
				return true;
			});

			const randomFallback = weightedItemPick(anyUnpicked, state);
			if (randomFallback) {
				draft.push(randomFallback[0]);
				pickedKeys.add(randomFallback[0]);
				if (randomFallback[1].type === 'tm') tmsInDraft++;
				if (randomFallback[1].type === 'item' || randomFallback[1].type === 'stackableItem') heldItemsInDraft++;
			}
		} else {
			const randomValid = weightedItemPick(validItems, state);
			if (randomValid) {
				draft.push(randomValid[0]);
				pickedKeys.add(randomValid[0]);
				if (randomValid[1].type === 'tm') tmsInDraft++;
				if (randomValid[1].type === 'item' || randomValid[1].type === 'stackableItem') heldItemsInDraft++;
			}
		}
	}
	return draft;
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
