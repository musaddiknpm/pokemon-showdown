import { getLevelUpMoves } from './moves';

export interface PackablePokemon {
	species: string;
	level: number;
	ability?: string;
	nature?: string;
	moves?: string[];
	evs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	ivs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	gender?: string;
	shiny?: boolean;
	heldItem?: string;
	happiness?: number;
	ball?: string;
	teraType?: string;
	currentHp?: number;
	status?: string;
	activeBuffs?: Record<string, number>;
}

export interface PackableAISet {
	species: string;
	name: string;
	level: number;
	ability: string;
	nature: string;
	ivs: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	evs: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	item: string;
	shiny: boolean;
	teraType: string;
	moves: string[];
	gender: string;
}

export function packPokemon(mon: PackablePokemon): string {
	const sp = Dex.species.get(toID(mon.species));
	const name = sp.exists ? sp.name : mon.species;
	const ability = mon.ability || sp.abilities[0] || '';
	const nature = mon.nature || 'Hardy';
	if (!mon.moves) mon.moves = getLevelUpMoves(toID(mon.species), mon.level);

	const evs = mon.evs ? `${mon.evs.hp},${mon.evs.atk},${mon.evs.def},${mon.evs.spa},${mon.evs.spd},${mon.evs.spe}` : '';
	const ivs = mon.ivs ? `${mon.ivs.hp},${mon.ivs.atk},${mon.ivs.def},${mon.ivs.spa},${mon.ivs.spd},${mon.ivs.spe}` : '';
	const gender = mon.gender || 'M';
	const shiny = mon.shiny ? 'S' : '';
	const item = mon.heldItem ?? '';
	const moves = mon.moves.join(',');

	let base = `${name}||${item}|${ability}|${moves}|${nature}|${evs}|${gender}|${ivs}|${shiny}|${mon.level}|`;

	const atkBoost = mon.activeBuffs?.atk ? 10 : 0;
	const defBoost = mon.activeBuffs?.def ? 10 : 0;
	const spaBoost = mon.activeBuffs?.spa ? 10 : 0;
	const spdBoost = mon.activeBuffs?.spd ? 10 : 0;
	const speBoost = mon.activeBuffs?.spe ? 10 : 0;
	const bstBoostsStr = (atkBoost || defBoost || spaBoost || spdBoost || speBoost) ?
		`${atkBoost}:${defBoost}:${spaBoost}:${spdBoost}:${speBoost}` : '';

	const misc = [
		mon.happiness !== undefined && mon.happiness !== 255 ? mon.happiness.toString() : '',
		'', mon.ball || '', '', '', mon.teraType || '',
		mon.currentHp !== undefined && mon.currentHp !== 100 ? mon.currentHp.toString() : '',
		mon.status || '', bstBoostsStr, '',
	];

	while (misc.length > 0 && misc[misc.length - 1] === '') misc.pop();
	if (misc.length > 0) base += misc.join(',');
	return base;
}

export function packAIPokemon(set: PackableAISet): string {
	const sp = Dex.species.get(toID(set.species));
	const name = sp.exists ? sp.name : set.species;
	const ivStr = `${set.ivs.hp},${set.ivs.atk},${set.ivs.def},${set.ivs.spa},${set.ivs.spd},${set.ivs.spe}`;
	const evStr = `${set.evs.hp},${set.evs.atk},${set.evs.def},${set.evs.spa},${set.evs.spd},${set.evs.spe}`;
	const movesStr = set.moves.map(m => Dex.moves.get(m).name || m).join(',');
	const shinyStr = set.shiny ? 'S' : '';

	let base = `${name}||${set.item}|${set.ability}|${movesStr}|${set.nature}|${evStr}|${set.gender}|${ivStr}|${shinyStr}|${set.level}|`;

	const misc = ['', '', '', '', '', set.teraType || ''];
	while (misc.length > 0 && misc[misc.length - 1] === '') misc.pop();
	if (misc.length > 0) base += misc.join(',');
	return base;
}

/**
 * Packs an array of generic PackablePokemon objects into a Pokémon Showdown team string,
 * encoding custom metadata like HP, Status, and Active Buffs.
 */
export function packTeam(mons: PackablePokemon[]): string {
	return mons.map(m => packPokemon(m)).join(']');
}

/**
 * Packs an array of AI-specific Pokémon sets into a Pokémon Showdown team string.
 */
export function packAITeam(sets: PackableAISet[]): string {
	return sets.map(s => packAIPokemon(s)).join(']');
}
