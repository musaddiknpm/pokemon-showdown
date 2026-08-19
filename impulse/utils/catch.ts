import { toID } from '../../sim/dex';
import { CATCH_RATES } from './data/catch-rates';

/**
 * Returns the catch rate multiplier for a given Pokéball type.
 */
export function getBallBonus(ballType: string): number {
	const id = toID(ballType);
	if (id === 'greatball') return 1.5;
	if (id === 'ultraball') return 2.0;
	if (id === 'masterball') return 255.0; // Effectively guaranteed
	return 1.0;
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
	if (toID(ballType) === 'masterball') return 3;

	const baseCatchRate = CATCH_RATES[toID(speciesId)] || 45;
	const hpPercent = currentHp / maxHp;
	
	const modifiedCatchRate = (1 - (2 / 3) * hpPercent) * baseCatchRate * getBallBonus(ballType) * getStatusBonus(statusId);
	const shakeProb = Math.min(65536, Math.floor(65536 * (modifiedCatchRate / 255) ** 0.1875));

	let shakes = 0;
	for (let i = 0; i < 3; i++) {
		if (Math.floor(Math.random() * 65536) < shakeProb) shakes++;
		else break;
	}

	return shakes;
}
