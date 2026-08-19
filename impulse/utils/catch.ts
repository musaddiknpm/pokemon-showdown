import { Dex, toID } from '../../sim/dex';
import { CATCH_RATES } from './data/catch-rates';

/**
 * Returns the catch rate multiplier for a given Pokéball type.
 * Only supports balls whose mechanics can be calculated purely from species base stats and typing.
 */
export function getBallBonus(ballType: string, speciesId?: string): number {
	const id = toID(ballType);
	let bonus = 1.0;

	// Base static modifiers
	if (id === 'greatball' || id === 'safariball' || id === 'sportball') bonus = 1.5;
	if (id === 'ultraball') bonus = 2.0;
	if (id === 'masterball' || id === 'parkball') bonus = 255.0;
	if (id === 'beastball') bonus = 0.1; 

	if (speciesId) {
		const sp = Dex.species.get(speciesId);

		// Net Ball: 3.5x for Water or Bug
		if (id === 'netball' && (sp.types.includes('Water') || sp.types.includes('Bug'))) {
			bonus = 3.5;
		}

		// Fast Ball: 4.0x if base speed >= 100
		if (id === 'fastball' && sp.baseStats.spe >= 100) {
			bonus = 4.0;
		}

		// Beast Ball: 5.0x for Ultra Beasts
		if (id === 'beastball' && sp.tags.includes('Ultra Beast')) {
			bonus = 5.0;
		}
		
		// Heavy ball: Modifies based on weight
		if (id === 'heavyball') {
			if (sp.weighthg >= 3000) bonus = 1.3;
			else if (sp.weighthg >= 2000) bonus = 1.2;
			else if (sp.weighthg < 1000) bonus = 0.8;
		}
	}

	return bonus;
}

/**
 * Returns the catch rate multiplier for a given status condition.
 */
export function getStatusBonus(statusId: string): number {
	const id = toID(statusId);
	if (['slp', 'frz'].includes(id)) return 2.5;
	if (['brn', 'psn', 'tox', 'par'].includes(id)) return 1.5;
	return 1.0;
}

/**
 * Calculates the number of times a Pokéball will shake (0 to 3) based on standard game catch formulas.
 * A return value of 3 indicates a successful catch.
 */
export function calculateCatchShakes(
	speciesId: string,
	currentHp: number,
	maxHp: number,
	statusId: string,
	ballType: string
): number {
	if (toID(ballType) === 'masterball' || toID(ballType) === 'parkball') return 3;

	const baseCatchRate = CATCH_RATES[toID(speciesId)] || 45;
	const hpPercent = currentHp / maxHp;
	
	const ballBonus = getBallBonus(ballType, speciesId);
	const statusBonus = getStatusBonus(statusId);
	
	const modifiedCatchRate = (1 - (2 / 3) * hpPercent) * baseCatchRate * ballBonus * statusBonus;
	const shakeProb = Math.min(65536, Math.floor(65536 * (modifiedCatchRate / 255) ** 0.1875));

	let shakes = 0;
	for (let i = 0; i < 3; i++) {
		if (Math.floor(Math.random() * 65536) < shakeProb) shakes++;
		else break;
	}

	return shakes;
}
