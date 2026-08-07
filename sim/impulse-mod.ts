import { toID } from './dex';

export const ImpulseMod = {
	// teams.ts helpers
	packCustomData(set: any): string {
		let buf = '';
		if (set.bstBoosts) {
			buf += `,${set.bstBoosts.atk}:${set.bstBoosts.def}:${set.bstBoosts.spa}:${set.bstBoosts.spd}:${set.bstBoosts.spe}`;
		} else {
			buf += `,`;
		}
		if (set.hpMultiplier) {
			buf += `,${set.hpMultiplier}`;
		} else {
			buf += `,`;
		}
		return buf;
	},

	unpackCustomData(set: any, misc: string[]) {
		if (misc[6]) set.hp = Number(misc[6]);
		if (misc[7]) set.status = misc[7];
		if (misc[8]) {
			const bstParts = misc[8].split(':');
			set.bstBoosts = {
				atk: Number(bstParts[0]),
				def: Number(bstParts[1]),
				spa: Number(bstParts[2]),
				spd: Number(bstParts[3]),
				spe: Number(bstParts[4]),
			};
		}
		if (misc[9]) {
			set.hpMultiplier = Number(misc[9]);
		}
	},

	exportCustomData(set: any): string {
		let out = '';
		if (set.hp !== undefined && set.hp !== 100) {
			out += `HP: ${set.hp}%  \n`;
		}
		if (set.status) {
			out += `Status: ${set.status}  \n`;
		}
		if (set.bstBoosts) {
			out += `BST: ${set.bstBoosts.atk}, ${set.bstBoosts.def}, ${set.bstBoosts.spa}, ${set.bstBoosts.spd}, ${set.bstBoosts.spe}  \n`;
		}
		if (set.hpMultiplier) {
			out += `HPX: ${set.hpMultiplier}  \n`;
		}
		return out;
	},

	parseCustomData(set: any, line: string, aggressive: boolean, toID: (s: string) => string): boolean {
		if (line.startsWith('HP: ')) {
			line = line.slice(4).replace('%', '');
			set.hp = parseInt(line);
			return true;
		} else if (line.startsWith('Status: ')) {
			line = line.slice(8).trim();
			set.status = aggressive ? toID(line) : line;
			return true;
		} else if (line.startsWith('BST: ')) {
			line = line.slice(5).trim();
			const bstParts = line.split(',');
			set.bstBoosts = {
				atk: parseInt(bstParts[0]),
				def: parseInt(bstParts[1]),
				spa: parseInt(bstParts[2]),
				spd: parseInt(bstParts[3]),
				spe: parseInt(bstParts[4]),
			};
			return true;
		} else if (line.startsWith('HPX: ')) {
			line = line.slice(5).trim();
			set.hpMultiplier = parseInt(line);			
			return true;
		}
		return false;
	},

	sanitizeCustomData(set: any, aggressive: boolean, sanitize: (s: string) => string, toID: (s: string) => string) {
		if (set.status) set.status = aggressive ? toID(set.status) : sanitize(set.status);
		if (set.hp !== undefined) set.hp = Number(set.hp);
	},

	// pokemon.ts helpers
	applyCustomHPAndStatus(pokemon: any) {
		if (pokemon.set.hp !== undefined) {
			if (pokemon.set.hp <= 0) {
				pokemon.hp = 0;
				pokemon.fainted = true;
			} else {
				pokemon.hp = Math.max(1, Math.floor(pokemon.maxhp * (pokemon.set.hp / 100)));
			}
		} else {
			pokemon.hp = pokemon.maxhp;
		}

		if (pokemon.set.status && !pokemon.fainted) {
			const startingStatus = pokemon.battle.dex.conditions.get(pokemon.set.status);
			if (startingStatus.exists) {
				pokemon.status = startingStatus.id;
				pokemon.statusState = pokemon.battle.initEffectState({ id: startingStatus.id, target: pokemon });
				
				if (pokemon.status === 'slp') {
					pokemon.statusState.time = pokemon.battle.random(2, 5); 
				} else if (pokemon.status === 'tox') {
					pokemon.statusState.stage = 0; 
				}
			}
		}
	},

	applyCustomBSTBoosts(baseStats: any, set: any): any {
		const bstBoosts = set.bstBoosts;
		if (bstBoosts) {
			return {
				hp: baseStats.hp,
				atk: Math.max(1, Math.floor(baseStats.atk * (1 + (bstBoosts.atk / 100)))),
				def: Math.max(1, Math.floor(baseStats.def * (1 + (bstBoosts.def / 100)))),
				spa: Math.max(1, Math.floor(baseStats.spa * (1 + (bstBoosts.spa / 100)))),
				spd: Math.max(1, Math.floor(baseStats.spd * (1 + (bstBoosts.spd / 100)))),
				spe: Math.max(1, Math.floor(baseStats.spe * (1 + (bstBoosts.spe / 100)))),
			};
		}
		return baseStats;
	},

	applyCustomHPX(stats: any, set: any) {
		if (set.hpMultiplier) {
			stats.hp = Math.floor(stats.hp * set.hpMultiplier);
		}
	},

	applyCustomHPXValue(baseMaxHp: number, set: any): number {
		if (set.hpMultiplier) {
			return Math.floor(baseMaxHp * set.hpMultiplier);
		}
		return baseMaxHp;
	},

	getCustomHealthPercentage(ratio: number): string {
		let percentage = Math.ceil(ratio * 100);
		if ((percentage === 100) && (ratio < 1.0)) {
			percentage = 99;
		}
		return '' + percentage + '/100';
	},

	// side.ts helpers
	isPokeRogueBypass(formatId: string): boolean {
		return formatId.includes('pokerogue');
	},
	
	parseTeamPositions(data: string, pokemonLength: number, pickedTeamSize: number): number[] {
		let isBracketed = false;
		let teamData = data;
		if (data?.startsWith('[') && data.endsWith(']')) {
			isBracketed = true;
			teamData = data.slice(1, -1).trim();
		}
		let positions = teamData ?
			teamData.split(isBracketed || teamData.includes(',') || pokemonLength >= 10 ? ',' : '')
				.map((datum: string) => parseInt(datum) - 1) :
			Array.from({length: pokemonLength}, (_, i) => i);
			
		if (!isBracketed) positions.splice(pickedTeamSize);
		return positions;
	},
	
	// team-validator.ts helpers
	checkIfAlive(set: any, livingPokemonCount: number): number {
		if (set.hp === undefined || set.hp > 0) {
			return livingPokemonCount + 1;
		}
		return livingPokemonCount;
	},

	checkAllFainted(livingPokemonCount: number, problems: string[]) {
		if (livingPokemonCount === 0) {
			problems.push(`Your team must have at least one Pokémon that isn't starting fainted (0% HP).`);
		}
	},

	validateCustomHPAndStatus(set: any, name: string, problems: string[], dex: any) {
		if (set.hp !== undefined) {
			if (isNaN(set.hp) || set.hp < 0 || set.hp > 100) {
				problems.push(`${name} has an invalid starting HP percentage (${set.hp}%). It must be between 0 and 100.`);
			}
		}

		if (set.status) {
			const status = dex.conditions.get(set.status);
			if (!status.exists || !['psn', 'tox', 'brn', 'par', 'slp', 'frz'].includes(status.id)) {
				problems.push(`${name} has an invalid starting status condition (${set.status}).`);
			} else {
				set.status = status.name;
			}
		}
	},

	parseNicknameHack(set: any) {
		if (set.name) {
			const hpMatch = set.name.match(/\[H:\s*(\d+)\s*\]/i);
			if (hpMatch) {
				set.hp = parseInt(hpMatch[1]);
				set.name = set.name.replace(hpMatch[0], '').trim();
			}
			
			const statusMatch = set.name.match(/\[S:\s*([a-z]+)\s*\]/i);
			if (statusMatch) {
				set.status = statusMatch[1].toLowerCase();
				set.name = set.name.replace(statusMatch[0], '').trim();
			}

			const bstMatch = set.name.match(/\[BST:\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\]/i);
			if (bstMatch) {
				set.bstBoosts = {
					atk: parseInt(bstMatch[1]),
					def: parseInt(bstMatch[2]),
					spa: parseInt(bstMatch[3]),
					spd: parseInt(bstMatch[4]),
					spe: parseInt(bstMatch[5])
				};
				set.name = set.name.replace(bstMatch[0], '').trim();
			}

			const hpxMatch = set.name.match(/\[HPX:\s*(\d+)\s*\]/i);
			if (hpxMatch) {
				set.hpMultiplier = Math.max(1, parseInt(hpxMatch[1]));
				set.name = set.name.replace(hpxMatch[0], '').trim();
			}
		}
	},

	getNicknameLengthError(species: string, name: string): string[] {
		return [
			`${species}'s nickname "${name}" is too long.`,
			`(It's ${name.length} characters long, but should be 100 or less. ` +
			`Some characters, like emojis, may count as more than one.)`
		];
	}
};
