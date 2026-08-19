import { Utils } from '../../lib';

export const EVO_TYPE_FALLBACK_LEVEL: Partial<Record<string, number>> = {
	trade: 36, useItem: 36, levelFriendship: 20,
	levelMove: 30, levelExtra: 20, levelHold: 30,
};

/**
 * Checks if a Pokémon is eligible to evolve upon leveling up and returns the target species ID.
 */
export function getLevelUpEvo(speciesId: string, currentHappiness = 70): { evoTo: string, evoLevel: number } | null {
	const species = Dex.species.get(toID(speciesId));
	if (!species.exists || !species.evos.length) return null;
	const validEvos: { evoTo: string, evoLevel: number }[] = [];
	for (const evoName of species.evos) {
		const evo = Dex.species.get(toID(evoName));
		if (evo.evoType === 'other') continue;
		if (evo.evoType === 'levelFriendship') {
			if (currentHappiness >= 160) validEvos.push({ evoTo: toID(evoName), evoLevel: 1 });
			continue;
		}
		const fallback = evo.evoType ? (EVO_TYPE_FALLBACK_LEVEL[evo.evoType] ?? 36) : 36;
		const evoLevel = evo.evoLevel ?? fallback;
		if (evoLevel > 0) validEvos.push({ evoTo: toID(evoName), evoLevel });
	}
	if (!validEvos.length) return null;
	return Utils.randomElement(validEvos);
}

/**
 * Retrieves the Mega Evolution species ID for a given Pokémon if it holds the correct Mega Stone.
 */
export function getMegaEvolution(speciesId: string, itemId: string): string | null {
	const dexItem = Dex.items.get(toID(itemId)) as ReturnType<typeof Dex.items.get> & { megaEvolves?: string, megaStone?: string };
	if (dexItem.megaEvolves && toID(dexItem.megaEvolves) === toID(speciesId)) {
		return dexItem.megaStone || null;
	}
	return null;
}

/**
 * Checks if a Pokémon can evolve by using a specific evolution stone/item and returns the target species ID.
 */
export function getItemEvolution(speciesId: string, itemId: string): string | null {
	const dexSpecies = Dex.species.get(toID(speciesId));
	if (!dexSpecies.evos) return null;
	const pendingItemId = toID(itemId);

	const validEvos = [];

	for (const newEvo of dexSpecies.evos) {
		const evoData = Dex.species.get(newEvo);
		const evoItemId = toID(evoData.evoItem);

		const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
		const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId && (evoItemId === pendingItemId || pendingItemId === 'tradestone');
		const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && (pendingItemId === 'linkingcord' || pendingItemId === 'tradestone');

		if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution) {
			validEvos.push(evoData.id);
		}
	}

	if (validEvos.length === 0) return null;
	return Utils.randomElement(validEvos);
}

