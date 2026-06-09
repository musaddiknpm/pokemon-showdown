import { type BiomePool } from '../../types';

export const BIOME_TRANSITIONS: Record<string, { biome: string, weight: number }[]> = {
	'Town': [{ biome: 'Plains', weight: 1 }],
	'Plains': [{ biome: 'Metropolis', weight: 1 }, { biome: 'Grass', weight: 1 }, { biome: 'Lake', weight: 1 }],
	'Metropolis': [{ biome: 'Slum', weight: 1 }],
	'Slum': [{ biome: 'Construction Site', weight: 1 }],
	'Construction Site': [{ biome: 'Dojo', weight: 1 }, { biome: 'Power Plant', weight: 1 }],
	'Power Plant': [{ biome: 'Factory', weight: 1 }, { biome: 'Metropolis', weight: 1 }],
	'Factory': [{ biome: 'Laboratory', weight: 1 }, { biome: 'Power Plant', weight: 1 }],
	'Laboratory': [{ biome: 'Construction Site', weight: 1 }, { biome: 'Factory', weight: 1 }],
	'Dojo': [{ biome: 'Jungle', weight: 1 }, { biome: 'Construction Site', weight: 1 }],
	'Grass': [{ biome: 'Tall Grass', weight: 1 }, { biome: 'Swamp', weight: 1 }],
	'Swamp': [{ biome: 'Tall Grass', weight: 1 }, { biome: 'Graveyard', weight: 1 }],
	'Graveyard': [{ biome: 'Abyss', weight: 1 }],
	'Tall Grass': [{ biome: 'Forest', weight: 1 }, { biome: 'Cave', weight: 1 }],
	'Forest': [{ biome: 'Jungle', weight: 1 }, { biome: 'Meadow', weight: 1 }],
	'Jungle': [{ biome: 'Temple', weight: 1 }],
	'Meadow': [{ biome: 'Fairy Cave', weight: 1 }, { biome: 'Plains', weight: 1 }],
	'Fairy Cave': [{ biome: 'Ice Cave', weight: 1 }, { biome: 'Space', weight: 1 }],
	'Lake': [{ biome: 'Beach', weight: 1 }, { biome: 'Sea', weight: 1 }],
	'Beach': [{ biome: 'Island', weight: 1 }, { biome: 'Sea', weight: 1 }],
	'Island': [{ biome: 'Sea', weight: 1 }],
	'Sea': [{ biome: 'Seabed', weight: 1 }, { biome: 'Ice Cave', weight: 1 }],
	'Seabed': [{ biome: 'Cave', weight: 1 }, { biome: 'Volcano', weight: 1 }, { biome: 'Sea', weight: 1 }],
	'Cave': [{ biome: 'Badlands', weight: 1 }, { biome: 'Mountain', weight: 1 }],
	'Badlands': [{ biome: 'Desert', weight: 1 }, { biome: 'Mountain', weight: 1 }],
	'Desert': [{ biome: 'Ancient Ruins', weight: 1 }, { biome: 'Badlands', weight: 1 }],
	'Ancient Ruins': [{ biome: 'Space', weight: 1 }, { biome: 'Abyss', weight: 1 }],
	'Space': [{ biome: 'Fairy Cave', weight: 1 }, { biome: 'Ice Cave', weight: 1 }],
	'Abyss': [{ biome: 'Wasteland', weight: 1 }, { biome: 'Cave', weight: 1 }],
	'Wasteland': [{ biome: 'Ancient Ruins', weight: 1 }, { biome: 'Mountain', weight: 1 }],
	'Mountain': [{ biome: 'Volcano', weight: 1 }, { biome: 'Ice Cave', weight: 1 }, { biome: 'Wasteland', weight: 1 }],
	'Volcano': [{ biome: 'Beach', weight: 1 }, { biome: 'Mountain', weight: 1 }],
	'Ice Cave': [{ biome: 'Snowy Forest', weight: 1 }, { biome: 'Mountain', weight: 1 }],
	'Snowy Forest': [{ biome: 'Ice Cave', weight: 1 }, { biome: 'Lake', weight: 1 }],
};

export const BIOMES: Record<string, BiomePool> = {
	'Town': {
		'Common': [
			{ species: 'caterpie', weight: 10 }, { species: 'weedle', weight: 10 },
			{ species: 'pidgey', weight: 10 }, { species: 'rattata', weight: 10 },
			{ species: 'spearow', weight: 10 }, { species: 'sentret', weight: 10 },
			{ species: 'hoothoot', weight: 10 }, { species: 'ledyba', weight: 10 },
			{ species: 'spinarak', weight: 10 }, { species: 'hoppip', weight: 10 },
			{ species: 'sunkern', weight: 10 }, { species: 'poochyena', weight: 10 },
			{ species: 'zigzagoon', weight: 10 }, { species: 'wurmple', weight: 10 },
			{ species: 'silcoon', weight: 10 }, { species: 'cascoon', weight: 10 },
			{ species: 'taillow', weight: 10 }, { species: 'starly', weight: 10 },
			{ species: 'bidoof', weight: 10 }, { species: 'patrat', weight: 10 },
			{ species: 'lillipup', weight: 10 }, { species: 'purrloin', weight: 10 },
			{ species: 'pidove', weight: 10 }, { species: 'cottonee', weight: 10 },
			{ species: 'fletchling', weight: 10 }, { species: 'scatterbug', weight: 10 },
			{ species: 'yungoos', weight: 10 }, { species: 'skwovet', weight: 10 },
			{ species: 'blipbug', weight: 10 }, { species: 'wooloo', weight: 10 },
			{ species: 'lechonk', weight: 10 },
		],
		'Uncommon': [
			{ species: 'ekans', weight: 10 }, { species: 'nidoranf', weight: 10 },
			{ species: 'nidoranm', weight: 10 }, { species: 'oddish', weight: 10 },
			{ species: 'paras', weight: 10 }, { species: 'venonat', weight: 10 },
			{ species: 'meowth', weight: 10 }, { species: 'bellsprout', weight: 10 },
			{ species: 'lotad', weight: 10 }, { species: 'seedot', weight: 10 },
			{ species: 'shroomish', weight: 10 }, { species: 'whismur', weight: 10 },
			{ species: 'skitty', weight: 10 }, { species: 'kricketot', weight: 10 },
			{ species: 'combee', weight: 10 }, { species: 'cherubi', weight: 10 },
			{ species: 'venipede', weight: 10 }, { species: 'minccino', weight: 10 },
			{ species: 'pawmi', weight: 10 }, { species: 'fidough', weight: 10 },
		],
		'Rare': [
			{ species: 'abra', weight: 10 }, { species: 'cleffa', weight: 10 },
			{ species: 'igglybuff', weight: 10 }, { species: 'surskit', weight: 10 },
			{ species: 'happiny', weight: 10 }, { species: 'rookidee', weight: 10 },
			{ species: 'tandemaus', weight: 10 },
		],
		'Super Rare': [
			{ species: 'eevee', weight: 10 }, { species: 'pichu', weight: 10 },
			{ species: 'togepi', weight: 10 }, { species: 'ralts', weight: 10 },
			{ species: 'nincada', weight: 10 }, { species: 'riolu', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'munchlax', weight: 10 },
			{ species: 'zorua', weight: 10 },
		],
		'Boss': [
			{ species: 'eevee', weight: 10 }, { species: 'pichu', weight: 10 },
			{ species: 'togepi', weight: 10 }, { species: 'ralts', weight: 10 },
			{ species: 'nincada', weight: 10 }, { species: 'riolu', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'munchlax', weight: 10 },
			{ species: 'zorua', weight: 10 },
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Plains': {
		'Common': [
			{ species: 'sentret', weight: 10 }, { species: 'yungoos', weight: 10 },
			{ species: 'skwovet', weight: 10 }, { species: 'zigzagoon', weight: 10 },
			{ species: 'bidoof', weight: 10 }, { species: 'lechonk', weight: 10 },
			{ species: 'zubat', weight: 10 }, { species: 'meowth', weight: 10 },
			{ species: 'poochyena', weight: 10 },
		],
		'Uncommon': [
			{ species: 'doduo', weight: 10 }, { species: 'starly', weight: 10 },
			{ species: 'pidove', weight: 10 }, { species: 'rockruff', weight: 10 },
			{ species: 'pawmi', weight: 10 }, { species: 'mankey', weight: 10 },
			{ species: 'nickit', weight: 10 }, { species: 'pidgey', weight: 10 },
			{ species: 'spearow', weight: 10 }, { species: 'pikachu', weight: 10 },
			{ species: 'fletchling', weight: 10 },
		],
		'Rare': [
			{ species: 'abra', weight: 10 }, { species: 'buneary', weight: 10 },
			{ species: 'rookidee', weight: 10 }, { species: 'shinx', weight: 10 },
			{ species: 'taurospaldea', weight: 10 },
		],
		'Super Rare': [
			{ species: 'farfetchd', weight: 10 }, { species: 'lickitung', weight: 10 },
			{ species: 'chansey', weight: 10 }, { species: 'eevee', weight: 10 },
			{ species: 'snorlax', weight: 10 }, { species: 'dunsparce', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'latias', weight: 10 },
			{ species: 'latios', weight: 10 },
		],
		'Boss': [
			{ species: 'dodrio', weight: 10 }, { species: 'furret', weight: 10 },
			{ species: 'gumshoos', weight: 10 }, { species: 'greedent', weight: 10 },
			{ species: 'persian', weight: 10 }, { species: 'mightyena', weight: 10 },
			{ species: 'linoone', weight: 10 }, { species: 'bibarel', weight: 10 },
			{ species: 'lopunny', weight: 10 }, { species: 'oinkologne', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'farfetchd', weight: 10 }, { species: 'snorlax', weight: 10 },
			{ species: 'lickilicky', weight: 10 }, { species: 'dudunsparce', weight: 10 },
			{ species: 'pawmot', weight: 10 }, { species: 'taurospaldea', weight: 10 },
			{ species: 'lycanroc', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'latias', weight: 10 }, { species: 'latios', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Grass': {
		'Common': [
			{ species: 'hoppip', weight: 10 }, { species: 'silcoon', weight: 10 },
			{ species: 'cascoon', weight: 10 }, { species: 'shroomish', weight: 10 },
			{ species: 'venipede', weight: 10 }, { species: 'cottonee', weight: 10 },
			{ species: 'petilil', weight: 10 },
		],
		'Uncommon': [
			{ species: 'sunkern', weight: 10 }, { species: 'combee', weight: 10 },
			{ species: 'seedot', weight: 10 }, { species: 'miltank', weight: 10 },
			{ species: 'cherubi', weight: 10 }, { species: 'foongus', weight: 10 },
		],
		'Rare': [
			{ species: 'bulbasaur', weight: 10 }, { species: 'growlithe', weight: 10 },
			{ species: 'turtwig', weight: 10 }, { species: 'bonsly', weight: 10 },
			{ species: 'noibat', weight: 10 },
		],
		'Super Rare': [],
		'Ultra Rare': [{ species: 'virizion', weight: 10 }],
		'Boss': [
			{ species: 'jumpluff', weight: 10 }, { species: 'vespiquen', weight: 10 },
			{ species: 'noivern', weight: 10 }, { species: 'miltank', weight: 10 },
			{ species: 'scolipede', weight: 10 }, { species: 'whimsicott', weight: 10 },
			{ species: 'lilligant', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'venusaur', weight: 10 }, { species: 'arcanine', weight: 10 },
			{ species: 'sudowoodo', weight: 10 }, { species: 'torterra', weight: 10 },
		],
		'Boss Super Rare': [{ species: 'virizion', weight: 10 }],
		'Boss Ultra Rare': [],
	},
	'Tall Grass': {
		'Common': [
			{ species: 'nidoranf', weight: 10 }, { species: 'nidoranm', weight: 10 },
			{ species: 'bounsweet', weight: 10 }, { species: 'oddish', weight: 10 },
			{ species: 'spinarak', weight: 10 }, { species: 'kricketot', weight: 10 },
			{ species: 'paras', weight: 10 }, { species: 'fomantis', weight: 10 },
			{ species: 'nymble', weight: 10 }, { species: 'scatterbug', weight: 10 },
		],
		'Uncommon': [
			{ species: 'vulpix', weight: 10 }, { species: 'venonat', weight: 10 },
			{ species: 'nincada', weight: 10 }, { species: 'zangoose', weight: 10 },
			{ species: 'seviper', weight: 10 },
		],
		'Rare': [
			{ species: 'pinsir', weight: 10 }, { species: 'chikorita', weight: 10 },
			{ species: 'girafarig', weight: 10 }, { species: 'kecleon', weight: 10 },
			{ species: 'tropius', weight: 10 }, { species: 'audino', weight: 10 },
			{ species: 'pawniard', weight: 10 },
		],
		'Super Rare': [
			{ species: 'scyther', weight: 10 }, { species: 'shedinja', weight: 10 },
		],
		'Ultra Rare': [],
		'Boss': [
			{ species: 'nidoqueen', weight: 10 }, { species: 'nidoking', weight: 10 },
			{ species: 'tsareena', weight: 10 }, { species: 'vileplume', weight: 10 },
			{ species: 'ariados', weight: 10 }, { species: 'kricketune', weight: 10 },
			{ species: 'ninjask', weight: 10 }, { species: 'zangoose', weight: 10 },
			{ species: 'seviper', weight: 10 }, { species: 'kecleon', weight: 10 },
			{ species: 'lurantis', weight: 10 }, { species: 'lokix', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'bellossom', weight: 10 }, { species: 'scyther', weight: 10 },
			{ species: 'pinsir', weight: 10 }, { species: 'meganium', weight: 10 },
			{ species: 'farigiraf', weight: 10 }, { species: 'kingambit', weight: 10 },
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Metropolis': {
		'Common': [
			{ species: 'rattata', weight: 10 }, { species: 'zigzagoon', weight: 10 },
			{ species: 'patrat', weight: 10 }, { species: 'lillipup', weight: 10 },
			{ species: 'yamper', weight: 10 }, { species: 'houndour', weight: 10 },
		],
		'Uncommon': [
			{ species: 'pikachu', weight: 10 }, { species: 'glameow', weight: 10 },
			{ species: 'furfrou', weight: 10 }, { species: 'fidough', weight: 10 },
			{ species: 'squawkabilly', weight: 10 }, { species: 'indeedee', weight: 10 },
			{ species: 'espurr', weight: 10 },
		],
		'Rare': [
			{ species: 'smeargle', weight: 10 }, { species: 'castform', weight: 10 },
			{ species: 'varoom', weight: 10 }, { species: 'tandemaus', weight: 10 },
			{ species: 'morpeko', weight: 10 },
		],
		'Super Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'eevee', weight: 10 },
		],
		'Ultra Rare': [],
		'Boss': [
			{ species: 'boltund', weight: 10 }, { species: 'meowstic', weight: 10 },
			{ species: 'castform', weight: 10 }, { species: 'stoutland', weight: 10 },
			{ species: 'furfrou', weight: 10 }, { species: 'dachsbun', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'maushold', weight: 10 }, { species: 'revavroom', weight: 10 },
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Forest': {
		'Common': [
			{ species: 'butterfree', weight: 10 }, { species: 'beedrill', weight: 10 },
			{ species: 'bellsprout', weight: 10 }, { species: 'combee', weight: 10 },
			{ species: 'petilil', weight: 10 }, { species: 'deerling', weight: 10 },
			{ species: 'vivillon', weight: 10 }, { species: 'venonat', weight: 10 },
			{ species: 'spinarak', weight: 10 }, { species: 'pineco', weight: 10 },
			{ species: 'seedot', weight: 10 }, { species: 'shroomish', weight: 10 },
			{ species: 'venipede', weight: 10 }, { species: 'tarountula', weight: 10 },
			{ species: 'nymble', weight: 10 }, { species: 'shroodle', weight: 10 },
			{ species: 'beautifly', weight: 10 }, { species: 'dustox', weight: 10 },
		],
		'Uncommon': [
			{ species: 'roselia', weight: 10 }, { species: 'mothim', weight: 10 },
			{ species: 'sewaddle', weight: 10 }, { species: 'dottler', weight: 10 },
			{ species: 'hoothoot', weight: 10 }, { species: 'rockruff', weight: 10 },
			{ species: 'ekans', weight: 10 }, { species: 'teddiursa', weight: 10 },
			{ species: 'burmy', weight: 10 }, { species: 'pansage', weight: 10 },
		],
		'Rare': [
			{ species: 'exeggcute', weight: 10 }, { species: 'stantler', weight: 10 },
			{ species: 'scyther', weight: 10 }, { species: 'heracross', weight: 10 },
			{ species: 'treecko', weight: 10 }, { species: 'tropius', weight: 10 },
			{ species: 'karrablast', weight: 10 }, { species: 'shelmet', weight: 10 },
			{ species: 'chespin', weight: 10 }, { species: 'rowlet', weight: 10 },
			{ species: 'squawkabilly', weight: 10 }, { species: 'toedscool', weight: 10 },
		],
		'Super Rare': [
			{ species: 'durant', weight: 10 }, { species: 'bloodmoonursaluna', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'kartana', weight: 10 }, { species: 'wochien', weight: 10 },
		],
		'Boss': [
			{ species: 'victreebel', weight: 10 }, { species: 'mothim', weight: 10 },
			{ species: 'vespiquen', weight: 10 }, { species: 'lilligant', weight: 10 },
			{ species: 'sawsbuck', weight: 10 }, { species: 'beautifly', weight: 10 },
			{ species: 'ariados', weight: 10 }, { species: 'forretress', weight: 10 },
			{ species: 'shiftry', weight: 10 }, { species: 'breloom', weight: 10 },
			{ species: 'scolipede', weight: 10 }, { species: 'orbeetle', weight: 10 },
			{ species: 'venomoth', weight: 10 }, { species: 'noctowl', weight: 10 },
			{ species: 'dustox', weight: 10 }, { species: 'wormadam', weight: 10 },
			{ species: 'simisage', weight: 10 }, { species: 'spidops', weight: 10 },
			{ species: 'lokix', weight: 10 }, { species: 'grafaiai', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'stantler', weight: 10 }, { species: 'heracross', weight: 10 },
			{ species: 'sceptile', weight: 10 }, { species: 'escavalier', weight: 10 },
			{ species: 'accelgor', weight: 10 }, { species: 'durant', weight: 10 },
			{ species: 'chesnaught', weight: 10 }, { species: 'decidueye', weight: 10 },
			{ species: 'toedscruel', weight: 10 }, { species: 'lycanroc', weight: 10 },
			{ species: 'bloodmoonursaluna', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'kartana', weight: 10 }, { species: 'wochien', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'calyrex', weight: 10 }],
	},
	'Sea': {
		'Common': [
			{ species: 'tentacool', weight: 10 }, { species: 'wailmer', weight: 10 },
			{ species: 'slowpoke', weight: 10 }, { species: 'wingull', weight: 10 },
			{ species: 'cramorant', weight: 10 }, { species: 'finizen', weight: 10 },
			{ species: 'finneon', weight: 10 }, { species: 'inkay', weight: 10 },
		],
		'Uncommon': [
			{ species: 'poliwag', weight: 10 }, { species: 'horsea', weight: 10 },
			{ species: 'goldeen', weight: 10 }, { species: 'magikarp', weight: 10 },
			{ species: 'buizel', weight: 10 }, { species: 'panpour', weight: 10 },
			{ species: 'wattrel', weight: 10 }, { species: 'staryu', weight: 10 },
			{ species: 'shellder', weight: 10 }, { species: 'chinchou', weight: 10 },
			{ species: 'carvanha', weight: 10 },
		],
		'Rare': [
			{ species: 'lapras', weight: 10 }, { species: 'piplup', weight: 10 },
			{ species: 'popplio', weight: 10 },
		],
		'Super Rare': [
			{ species: 'kingdra', weight: 10 }, { species: 'tirtouga', weight: 10 },
		],
		'Ultra Rare': [],
		'Boss': [
			{ species: 'pelipper', weight: 10 }, { species: 'cramorant', weight: 10 },
			{ species: 'palafin', weight: 10 }, { species: 'sharpedo', weight: 10 },
			{ species: 'malamar', weight: 10 }, { species: 'lumineon', weight: 10 },
			{ species: 'tentacruel', weight: 10 }, { species: 'floatzel', weight: 10 },
			{ species: 'simipour', weight: 10 }, { species: 'kilowattrel', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'gyarados', weight: 10 }, { species: 'kingdra', weight: 10 },
			{ species: 'empoleon', weight: 10 }, { species: 'primarina', weight: 10 },
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [{ species: 'lugia', weight: 10 }],
	},
	'Swamp': {
		'Common': [
			{ species: 'poliwag', weight: 10 }, { species: 'gulpin', weight: 10 },
			{ species: 'shellos', weight: 10 }, { species: 'tympole', weight: 10 },
			{ species: 'wooper', weight: 10 }, { species: 'lotad', weight: 10 },
			{ species: 'ekans', weight: 10 }, { species: 'wooperpaldea', weight: 10 },
		],
		'Uncommon': [
			{ species: 'psyduck', weight: 10 }, { species: 'barboach', weight: 10 },
			{ species: 'skorupi', weight: 10 }, { species: 'stunfisk', weight: 10 },
			{ species: 'mareanie', weight: 10 }, { species: 'croagunk', weight: 10 },
		],
		'Rare': [
			{ species: 'totodile', weight: 10 }, { species: 'mudkip', weight: 10 },
		],
		'Super Rare': [
			{ species: 'slowpokegalar', weight: 10 }, { species: 'sliggoohisui', weight: 10 },
			{ species: 'politoed', weight: 10 }, { species: 'stunfiskgalar', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'azelf', weight: 10 }, { species: 'poipole', weight: 10 },
		],
		'Boss': [
			{ species: 'quagsire', weight: 10 }, { species: 'ludicolo', weight: 10 },
			{ species: 'arbok', weight: 10 }, { species: 'clodsire', weight: 10 },
			{ species: 'poliwrath', weight: 10 }, { species: 'swalot', weight: 10 },
			{ species: 'whiscash', weight: 10 }, { species: 'gastrodon', weight: 10 },
			{ species: 'seismitoad', weight: 10 }, { species: 'stunfisk', weight: 10 },
			{ species: 'toxapex', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'slowbrogalar', weight: 10 }, { species: 'slowkinggalar', weight: 10 },
			{ species: 'goodrahisui', weight: 10 }, { species: 'feraligatr', weight: 10 },
			{ species: 'politoed', weight: 10 }, { species: 'swampert', weight: 10 },
			{ species: 'stunfiskgalar', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'azelf', weight: 10 }, { species: 'poipole', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Beach': {
		'Common': [
			{ species: 'krabby', weight: 10 }, { species: 'corphish', weight: 10 },
			{ species: 'dwebble', weight: 10 }, { species: 'binacle', weight: 10 },
			{ species: 'mareanie', weight: 10 }, { species: 'wiglett', weight: 10 },
			{ species: 'staryu', weight: 10 }, { species: 'shellder', weight: 10 },
		],
		'Uncommon': [
			{ species: 'burmy', weight: 10 }, { species: 'clauncher', weight: 10 },
			{ species: 'sandygast', weight: 10 },
		],
		'Rare': [
			{ species: 'quaxly', weight: 10 }, { species: 'tatsugiri', weight: 10 },
		],
		'Super Rare': [{ species: 'tirtouga', weight: 10 }],
		'Ultra Rare': [
			{ species: 'cresselia', weight: 10 }, { species: 'keldeo', weight: 10 },
			{ species: 'tapufini', weight: 10 },
		],
		'Boss': [
			{ species: 'starmie', weight: 10 }, { species: 'cloyster', weight: 10 },
			{ species: 'kingler', weight: 10 }, { species: 'crawdaunt', weight: 10 },
			{ species: 'wormadam', weight: 10 }, { species: 'crustle', weight: 10 },
			{ species: 'barbaracle', weight: 10 }, { species: 'clawitzer', weight: 10 },
			{ species: 'toxapex', weight: 10 }, { species: 'palossand', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'carracosta', weight: 10 }, { species: 'quaquaval', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'cresselia', weight: 10 }, { species: 'keldeo', weight: 10 },
			{ species: 'tapufini', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Lake': {
		'Common': [
			{ species: 'psyduck', weight: 10 }, { species: 'goldeen', weight: 10 },
			{ species: 'wooper', weight: 10 }, { species: 'surskit', weight: 10 },
			{ species: 'chewtle', weight: 10 }, { species: 'lotad', weight: 10 },
			{ species: 'ducklett', weight: 10 }, { species: 'marill', weight: 10 },
		],
		'Uncommon': [
			{ species: 'slowpoke', weight: 10 }, { species: 'magikarp', weight: 10 },
			{ species: 'wishiwashi', weight: 10 }, { species: 'dewpider', weight: 10 },
		],
		'Rare': [
			{ species: 'squirtle', weight: 10 }, { species: 'oshawott', weight: 10 },
			{ species: 'froakie', weight: 10 }, { species: 'sobble', weight: 10 },
			{ species: 'flamigo', weight: 10 },
		],
		'Super Rare': [
			{ species: 'vaporeon', weight: 10 }, { species: 'slowking', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'suicune', weight: 10 }, { species: 'mesprit', weight: 10 },
		],
		'Boss': [
			{ species: 'swanna', weight: 10 }, { species: 'araquanid', weight: 10 },
			{ species: 'azumarill', weight: 10 }, { species: 'golduck', weight: 10 },
			{ species: 'slowbro', weight: 10 }, { species: 'seaking', weight: 10 },
			{ species: 'masquerain', weight: 10 }, { species: 'wishiwashi', weight: 10 },
			{ species: 'drednaw', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'blastoise', weight: 10 }, { species: 'gyarados', weight: 10 },
			{ species: 'vaporeon', weight: 10 }, { species: 'slowking', weight: 10 },
			{ species: 'samurott', weight: 10 }, { species: 'greninja', weight: 10 },
			{ species: 'inteleon', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'suicune', weight: 10 }, { species: 'mesprit', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Seabed': {
		'Common': [
			{ species: 'chinchou', weight: 10 }, { species: 'remoraid', weight: 10 },
			{ species: 'clamperl', weight: 10 }, { species: 'basculin', weight: 10 },
			{ species: 'frillish', weight: 10 }, { species: 'arrokuda', weight: 10 },
			{ species: 'veluza', weight: 10 },
		],
		'Uncommon': [
			{ species: 'tentacool', weight: 10 }, { species: 'shellder', weight: 10 },
			{ species: 'wailmer', weight: 10 }, { species: 'luvdisc', weight: 10 },
			{ species: 'shellos', weight: 10 }, { species: 'skrelp', weight: 10 },
			{ species: 'pincurchin', weight: 10 }, { species: 'dondozo', weight: 10 },
		],
		'Rare': [
			{ species: 'qwilfish', weight: 10 }, { species: 'corsola', weight: 10 },
			{ species: 'octillery', weight: 10 }, { species: 'feebas', weight: 10 },
			{ species: 'mantyke', weight: 10 }, { species: 'alomomola', weight: 10 },
			{ species: 'tynamo', weight: 10 }, { species: 'dhelmise', weight: 10 },
		],
		'Super Rare': [
			{ species: 'omanyte', weight: 10 }, { species: 'kabuto', weight: 10 },
			{ species: 'relicanth', weight: 10 }, { species: 'pyukumuku', weight: 10 },
			{ species: 'corsolagalar', weight: 10 }, { species: 'arctovish', weight: 10 },
			{ species: 'qwilfishhisui', weight: 10 },
		],
		'Ultra Rare': [{ species: 'nihilego', weight: 10 }],
		'Boss': [
			{ species: 'lanturn', weight: 10 }, { species: 'qwilfish', weight: 10 },
			{ species: 'corsola', weight: 10 }, { species: 'octillery', weight: 10 },
			{ species: 'mantine', weight: 10 }, { species: 'wailord', weight: 10 },
			{ species: 'huntail', weight: 10 }, { species: 'gorebyss', weight: 10 },
			{ species: 'luvdisc', weight: 10 }, { species: 'jellicent', weight: 10 },
			{ species: 'alomomola', weight: 10 }, { species: 'dragalge', weight: 10 },
			{ species: 'barraskewda', weight: 10 }, { species: 'dondozo', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'omastar', weight: 10 }, { species: 'kabutops', weight: 10 },
			{ species: 'milotic', weight: 10 }, { species: 'relicanth', weight: 10 },
			{ species: 'eelektross', weight: 10 }, { species: 'pyukumuku', weight: 10 },
			{ species: 'dhelmise', weight: 10 }, { species: 'cursola', weight: 10 },
			{ species: 'arctovish', weight: 10 }, { species: 'basculegion', weight: 10 },
			{ species: 'overqwil', weight: 10 },
		],
		'Boss Super Rare': [{ species: 'nihilego', weight: 10 }],
		'Boss Ultra Rare': [{ species: 'kyogre', weight: 10 }],
	},
	'Mountain': {
		'Common': [
			{ species: 'pidgey', weight: 10 }, { species: 'spearow', weight: 10 },
			{ species: 'skiddo', weight: 10 }, { species: 'taillow', weight: 10 },
			{ species: 'swablu', weight: 10 }, { species: 'starly', weight: 10 },
			{ species: 'pidove', weight: 10 }, { species: 'fletchling', weight: 10 },
			{ species: 'rhyhorn', weight: 10 }, { species: 'aron', weight: 10 },
			{ species: 'roggenrola', weight: 10 },
		],
		'Uncommon': [
			{ species: 'machop', weight: 10 }, { species: 'geodude', weight: 10 },
			{ species: 'natu', weight: 10 }, { species: 'slugma', weight: 10 },
			{ species: 'rufflet', weight: 10 }, { species: 'rookidee', weight: 10 },
			{ species: 'flittle', weight: 10 }, { species: 'bombirdier', weight: 10 },
			{ species: 'vullaby', weight: 10 }, { species: 'murkrow', weight: 10 },
		],
		'Rare': [
			{ species: 'skarmory', weight: 10 }, { species: 'torchic', weight: 10 },
			{ species: 'spoink', weight: 10 }, { species: 'hawlucha', weight: 10 },
			{ species: 'nacli', weight: 10 },
		],
		'Super Rare': [
			{ species: 'larvitar', weight: 10 }, { species: 'cranidos', weight: 10 },
			{ species: 'shieldon', weight: 10 }, { species: 'gible', weight: 10 },
			{ species: 'archeops', weight: 10 }, { species: 'axew', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'tornadus', weight: 10 }, { species: 'tinglu', weight: 10 },
			{ species: 'ogerpon', weight: 10 },
		],
		'Boss': [
			{ species: 'swellow', weight: 10 }, { species: 'altaria', weight: 10 },
			{ species: 'staraptor', weight: 10 }, { species: 'unfezant', weight: 10 },
			{ species: 'braviary', weight: 10 }, { species: 'talonflame', weight: 10 },
			{ species: 'corviknight', weight: 10 }, { species: 'espathra', weight: 10 },
			{ species: 'mandibuzz', weight: 10 }, { species: 'pidgeot', weight: 10 },
			{ species: 'fearow', weight: 10 }, { species: 'skarmory', weight: 10 },
			{ species: 'aggron', weight: 10 }, { species: 'gogoat', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'braviaryhisui', weight: 10 }, { species: 'blaziken', weight: 10 },
			{ species: 'rampardos', weight: 10 }, { species: 'bastiodon', weight: 10 },
			{ species: 'hawlucha', weight: 10 }, { species: 'garganacl', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'tornadus', weight: 10 }, { species: 'tinglu', weight: 10 },
			{ species: 'ogerpon', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'hooh', weight: 10 }],
	},
	'Badlands': {
		'Common': [
			{ species: 'diglett', weight: 10 }, { species: 'geodude', weight: 10 },
			{ species: 'rhyhorn', weight: 10 }, { species: 'drilbur', weight: 10 },
			{ species: 'mudbray', weight: 10 }, { species: 'phanpy', weight: 10 },
			{ species: 'cubone', weight: 10 },
		],
		'Uncommon': [
			{ species: 'sandshrew', weight: 10 }, { species: 'numel', weight: 10 },
			{ species: 'roggenrola', weight: 10 }, { species: 'cufant', weight: 10 },
			{ species: 'sizzlipede', weight: 10 }, { species: 'capsakid', weight: 10 },
		],
		'Rare': [
			{ species: 'onix', weight: 10 }, { species: 'gligar', weight: 10 },
			{ species: 'klawf', weight: 10 }, { species: 'poltchageist', weight: 10 },
		],
		'Super Rare': [],
		'Ultra Rare': [
			{ species: 'landorus', weight: 10 }, { species: 'okidogi', weight: 10 },
		],
		'Boss': [
			{ species: 'donphan', weight: 10 }, { species: 'centiskorch', weight: 10 },
			{ species: 'scovillain', weight: 10 }, { species: 'marowak', weight: 10 },
			{ species: 'dugtrio', weight: 10 }, { species: 'golem', weight: 10 },
			{ species: 'rhyperior', weight: 10 }, { species: 'gliscor', weight: 10 },
			{ species: 'excadrill', weight: 10 }, { species: 'mudsdale', weight: 10 },
			{ species: 'copperajah', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'steelix', weight: 10 }, { species: 'sinistcha', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'landorus', weight: 10 }, { species: 'okidogi', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'groudon', weight: 10 }],
	},
	'Cave': {
		'Common': [
			{ species: 'zubat', weight: 10 }, { species: 'paras', weight: 10 },
			{ species: 'teddiursa', weight: 10 }, { species: 'whismur', weight: 10 },
			{ species: 'roggenrola', weight: 10 }, { species: 'woobat', weight: 10 },
			{ species: 'bunnelby', weight: 10 },
		],
		'Uncommon': [
			{ species: 'geodude', weight: 10 }, { species: 'makuhita', weight: 10 },
			{ species: 'nosepass', weight: 10 }, { species: 'noibat', weight: 10 },
			{ species: 'wimpod', weight: 10 }, { species: 'rockruff', weight: 10 },
		],
		'Rare': [
			{ species: 'onix', weight: 10 }, { species: 'ferroseed', weight: 10 },
			{ species: 'carbink', weight: 10 }, { species: 'nacli', weight: 10 },
			{ species: 'glimmet', weight: 10 },
		],
		'Super Rare': [{ species: 'shuckle', weight: 10 }],
		'Ultra Rare': [{ species: 'uxie', weight: 10 }],
		'Boss': [
			{ species: 'parasect', weight: 10 }, { species: 'onix', weight: 10 },
			{ species: 'crobat', weight: 10 }, { species: 'ursaring', weight: 10 },
			{ species: 'exploud', weight: 10 }, { species: 'probopass', weight: 10 },
			{ species: 'gigalith', weight: 10 }, { species: 'swoobat', weight: 10 },
			{ species: 'diggersby', weight: 10 }, { species: 'noivern', weight: 10 },
			{ species: 'golisopod', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'shuckle', weight: 10 }, { species: 'ferrothorn', weight: 10 },
			{ species: 'garganacl', weight: 10 }, { species: 'glimmora', weight: 10 },
			{ species: 'lycanroc', weight: 10 },
		],
		'Boss Super Rare': [{ species: 'uxie', weight: 10 }],
		'Boss Ultra Rare': [{ species: 'terapagos', weight: 10 }],
	},
	'Desert': {
		'Common': [
			{ species: 'sandshrew', weight: 10 }, { species: 'skorupi', weight: 10 },
			{ species: 'silicobra', weight: 10 }, { species: 'bramblin', weight: 10 },
			{ species: 'rellor', weight: 10 }, { species: 'trapinch', weight: 10 },
			{ species: 'helioptile', weight: 10 }, { species: 'cacnea', weight: 10 },
		],
		'Uncommon': [
			{ species: 'numel', weight: 10 }, { species: 'hippopotas', weight: 10 },
			{ species: 'sandile', weight: 10 }, { species: 'orthworm', weight: 10 },
			{ species: 'maractus', weight: 10 }, { species: 'gligar', weight: 10 },
			{ species: 'yamask', weight: 10 },
		],
		'Rare': [
			{ species: 'doduo', weight: 10 }, { species: 'darumaka', weight: 10 },
			{ species: 'sigilyph', weight: 10 }, { species: 'stonjourner', weight: 10 },
		],
		'Super Rare': [
			{ species: 'lileep', weight: 10 }, { species: 'anorith', weight: 10 },
			{ species: 'gible', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'regirock', weight: 10 }, { species: 'tapubulu', weight: 10 },
			{ species: 'pheromosa', weight: 10 },
		],
		'Boss': [
			{ species: 'maractus', weight: 10 }, { species: 'heliolisk', weight: 10 },
			{ species: 'flygon', weight: 10 }, { species: 'gliscor', weight: 10 },
			{ species: 'cacturne', weight: 10 }, { species: 'cofagrigus', weight: 10 },
			{ species: 'sandslash', weight: 10 }, { species: 'hippowdon', weight: 10 },
			{ species: 'drapion', weight: 10 }, { species: 'krookodile', weight: 10 },
			{ species: 'darmanitan', weight: 10 }, { species: 'sandaconda', weight: 10 },
			{ species: 'brambleghast', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'dodrio', weight: 10 }, { species: 'cradily', weight: 10 },
			{ species: 'armaldo', weight: 10 }, { species: 'garchomp', weight: 10 },
			{ species: 'sigilyph', weight: 10 }, { species: 'stonjourner', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'regirock', weight: 10 }, { species: 'tapubulu', weight: 10 },
			{ species: 'pheromosa', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Ice Cave': {
		'Common': [
			{ species: 'seel', weight: 10 }, { species: 'swinub', weight: 10 },
			{ species: 'snorunt', weight: 10 }, { species: 'vanillite', weight: 10 },
			{ species: 'cubchoo', weight: 10 }, { species: 'bergmite', weight: 10 },
			{ species: 'crabrawler', weight: 10 }, { species: 'snom', weight: 10 },
		],
		'Uncommon': [
			{ species: 'slowking', weight: 10 }, { species: 'sneasel', weight: 10 },
			{ species: 'smoochum', weight: 10 }, { species: 'spheal', weight: 10 },
			{ species: 'eiscue', weight: 10 }, { species: 'cetoddle', weight: 10 },
		],
		'Rare': [
			{ species: 'lapras', weight: 10 }, { species: 'delibird', weight: 10 },
			{ species: 'cryogonal', weight: 10 },
		],
		'Super Rare': [{ species: 'amaura', weight: 10 }],
		'Ultra Rare': [
			{ species: 'articuno', weight: 10 }, { species: 'regice', weight: 10 },
		],
		'Boss': [
			{ species: 'dewgong', weight: 10 }, { species: 'glalie', weight: 10 },
			{ species: 'walrein', weight: 10 }, { species: 'weavile', weight: 10 },
			{ species: 'mamoswine', weight: 10 }, { species: 'froslass', weight: 10 },
			{ species: 'vanilluxe', weight: 10 }, { species: 'beartic', weight: 10 },
			{ species: 'cryogonal', weight: 10 }, { species: 'avalugg', weight: 10 },
			{ species: 'crabominable', weight: 10 }, { species: 'cetitan', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'jynx', weight: 10 }, { species: 'lapras', weight: 10 },
			{ species: 'glaceon', weight: 10 }, { species: 'aurorus', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'articuno', weight: 10 }, { species: 'regice', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'kyurem', weight: 10 }],
	},
	'Meadow': {
		'Common': [
			{ species: 'blitzle', weight: 10 }, { species: 'flabebe', weight: 10 },
			{ species: 'cutiefly', weight: 10 }, { species: 'gossifleur', weight: 10 },
			{ species: 'wooloo', weight: 10 }, { species: 'ledyba', weight: 10 },
			{ species: 'roselia', weight: 10 }, { species: 'cottonee', weight: 10 },
			{ species: 'minccino', weight: 10 },
		],
		'Uncommon': [
			{ species: 'ponyta', weight: 10 }, { species: 'snubbull', weight: 10 },
			{ species: 'skitty', weight: 10 }, { species: 'bouffalant', weight: 10 },
			{ species: 'smoliv', weight: 10 }, { species: 'jigglypuff', weight: 10 },
			{ species: 'mareep', weight: 10 }, { species: 'ralts', weight: 10 },
			{ species: 'glameow', weight: 10 }, { species: 'oricorio', weight: 10 },
		],
		'Rare': [
			{ species: 'tauros', weight: 10 }, { species: 'eevee', weight: 10 },
			{ species: 'miltank', weight: 10 }, { species: 'spinda', weight: 10 },
			{ species: 'applin', weight: 10 }, { species: 'sprigatito', weight: 10 },
			{ species: 'volbeat', weight: 10 }, { species: 'illumise', weight: 10 },
		],
		'Super Rare': [
			{ species: 'chansey', weight: 10 }, { species: 'sylveon', weight: 10 },
		],
		'Ultra Rare': [{ species: 'meloetta', weight: 10 }],
		'Boss': [
			{ species: 'ledian', weight: 10 }, { species: 'granbull', weight: 10 },
			{ species: 'delcatty', weight: 10 }, { species: 'roserade', weight: 10 },
			{ species: 'cinccino', weight: 10 }, { species: 'bouffalant', weight: 10 },
			{ species: 'arboliva', weight: 10 }, { species: 'tauros', weight: 10 },
			{ species: 'miltank', weight: 10 }, { species: 'gardevoir', weight: 10 },
			{ species: 'purugly', weight: 10 }, { species: 'zebstrika', weight: 10 },
			{ species: 'florges', weight: 10 }, { species: 'ribombee', weight: 10 },
			{ species: 'dubwool', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'lilliganthisui', weight: 10 }, { species: 'blissey', weight: 10 },
			{ species: 'sylveon', weight: 10 }, { species: 'flapple', weight: 10 },
			{ species: 'appletun', weight: 10 }, { species: 'meowscarada', weight: 10 },
			{ species: 'hydrapple', weight: 10 },
		],
		'Boss Super Rare': [{ species: 'meloetta', weight: 10 }],
		'Boss Ultra Rare': [{ species: 'shaymin', weight: 10 }],
	},
	'Power Plant': {
		'Common': [
			{ species: 'pikachu', weight: 10 }, { species: 'voltorb', weight: 10 },
			{ species: 'electrike', weight: 10 }, { species: 'shinx', weight: 10 },
			{ species: 'dedenne', weight: 10 }, { species: 'grubbin', weight: 10 },
			{ species: 'pawmi', weight: 10 }, { species: 'tadbulb', weight: 10 },
		],
		'Uncommon': [
			{ species: 'magnemite', weight: 10 }, { species: 'electabuzz', weight: 10 },
			{ species: 'plusle', weight: 10 }, { species: 'minun', weight: 10 },
			{ species: 'pachirisu', weight: 10 }, { species: 'emolga', weight: 10 },
			{ species: 'togedemaru', weight: 10 },
		],
		'Rare': [
			{ species: 'mareep', weight: 10 }, { species: 'rotom', weight: 10 },
		],
		'Super Rare': [
			{ species: 'jolteon', weight: 10 }, { species: 'voltorbhisui', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'raikou', weight: 10 }, { species: 'thundurus', weight: 10 },
			{ species: 'xurkitree', weight: 10 }, { species: 'zeraora', weight: 10 },
			{ species: 'regieleki', weight: 10 },
		],
		'Boss': [
			{ species: 'raichu', weight: 10 }, { species: 'manectric', weight: 10 },
			{ species: 'luxray', weight: 10 }, { species: 'magnezone', weight: 10 },
			{ species: 'electivire', weight: 10 }, { species: 'dedenne', weight: 10 },
			{ species: 'vikavolt', weight: 10 }, { species: 'togedemaru', weight: 10 },
			{ species: 'pawmot', weight: 10 }, { species: 'bellibolt', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'jolteon', weight: 10 }, { species: 'ampharos', weight: 10 },
			{ species: 'electrodehisui', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'zapdos', weight: 10 }, { species: 'raikou', weight: 10 },
			{ species: 'thundurus', weight: 10 }, { species: 'xurkitree', weight: 10 },
			{ species: 'zeraora', weight: 10 }, { species: 'regieleki', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'zekrom', weight: 10 }],
	},
	'Volcano': {
		'Common': [
			{ species: 'vulpix', weight: 10 }, { species: 'growlithe', weight: 10 },
			{ species: 'ponyta', weight: 10 }, { species: 'slugma', weight: 10 },
			{ species: 'numel', weight: 10 }, { species: 'spoink', weight: 10 },
			{ species: 'swablu', weight: 10 }, { species: 'rolycoly', weight: 10 },
			{ species: 'poochyena', weight: 10 },
		],
		'Uncommon': [
			{ species: 'magmar', weight: 10 }, { species: 'meditite', weight: 10 },
			{ species: 'torkoal', weight: 10 }, { species: 'pansear', weight: 10 },
			{ species: 'heatmor', weight: 10 }, { species: 'salandit', weight: 10 },
			{ species: 'turtonator', weight: 10 }, { species: 'diglettalola', weight: 10 },
		],
		'Rare': [
			{ species: 'charmander', weight: 10 }, { species: 'cyndaquil', weight: 10 },
			{ species: 'chimchar', weight: 10 }, { species: 'tepig', weight: 10 },
			{ species: 'fennekin', weight: 10 }, { species: 'litten', weight: 10 },
			{ species: 'scorbunny', weight: 10 }, { species: 'charcadet', weight: 10 },
		],
		'Super Rare': [
			{ species: 'flareon', weight: 10 }, { species: 'larvesta', weight: 10 },
			{ species: 'growlithehisui', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'entei', weight: 10 }, { species: 'heatran', weight: 10 },
			{ species: 'volcanion', weight: 10 }, { species: 'chiyu', weight: 10 },
		],
		'Boss': [
			{ species: 'ninetales', weight: 10 }, { species: 'arcanine', weight: 10 },
			{ species: 'rapidash', weight: 10 }, { species: 'magcargo', weight: 10 },
			{ species: 'camerupt', weight: 10 }, { species: 'torkoal', weight: 10 },
			{ species: 'magmortar', weight: 10 }, { species: 'simisear', weight: 10 },
			{ species: 'heatmor', weight: 10 }, { species: 'salazzle', weight: 10 },
			{ species: 'turtonator', weight: 10 }, { species: 'coalossal', weight: 10 },
			{ species: 'dugtrioalola', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'charizard', weight: 10 }, { species: 'flareon', weight: 10 },
			{ species: 'typhlosion', weight: 10 }, { species: 'infernape', weight: 10 },
			{ species: 'emboar', weight: 10 }, { species: 'volcarona', weight: 10 },
			{ species: 'delphox', weight: 10 }, { species: 'incineroar', weight: 10 },
			{ species: 'cinderace', weight: 10 }, { species: 'armarouge', weight: 10 },
			{ species: 'arcaninehisui', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'moltres', weight: 10 }, { species: 'entei', weight: 10 },
			{ species: 'heatran', weight: 10 }, { species: 'volcanion', weight: 10 },
			{ species: 'chiyu', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'reshiram', weight: 10 }],
	},
	'Graveyard': {
		'Common': [
			{ species: 'gastly', weight: 10 }, { species: 'shuppet', weight: 10 },
			{ species: 'duskull', weight: 10 }, { species: 'drifloon', weight: 10 },
			{ species: 'litwick', weight: 10 }, { species: 'phantump', weight: 10 },
			{ species: 'pumpkaboo', weight: 10 }, { species: 'greavard', weight: 10 },
		],
		'Uncommon': [
			{ species: 'misdreavus', weight: 10 }, { species: 'sableye', weight: 10 },
			{ species: 'yamask', weight: 10 }, { species: 'sinistea', weight: 10 },
			{ species: 'indeedee', weight: 10 }, { species: 'fluttermane', weight: 10 },
		],
		'Rare': [
			{ species: 'spiritomb', weight: 10 }, { species: 'golett', weight: 10 },
			{ species: 'honedge', weight: 10 }, { species: 'mimikyu', weight: 10 },
		],
		'Super Rare': [
			{ species: 'runerigus', weight: 10 }, { species: 'ceruledge', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'marshadow', weight: 10 }, { species: 'spectrier', weight: 10 },
		],
		'Boss': [
			{ species: 'gengar', weight: 10 }, { species: 'banette', weight: 10 },
			{ species: 'dusknoir', weight: 10 }, { species: 'drifblim', weight: 10 },
			{ species: 'chandelure', weight: 10 }, { species: 'trevenant', weight: 10 },
			{ species: 'gourgeist', weight: 10 }, { species: 'houndstone', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'mismagius', weight: 10 }, { species: 'golurk', weight: 10 },
			{ species: 'aegislash', weight: 10 }, { species: 'mimikyu', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'marshadow', weight: 10 }, { species: 'spectrier', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'giratina', weight: 10 }],
	},
	'Dojo': {
		'Common': [
			{ species: 'mankey', weight: 10 }, { species: 'machop', weight: 10 },
			{ species: 'makuhita', weight: 10 }, { species: 'meditite', weight: 10 },
			{ species: 'croagunk', weight: 10 }, { species: 'mienfoo', weight: 10 },
			{ species: 'crabrawler', weight: 10 }, { species: 'passimian', weight: 10 },
		],
		'Uncommon': [
			{ species: 'tyrogue', weight: 10 }, { species: 'riolu', weight: 10 },
			{ species: 'stufful', weight: 10 }, { species: 'falinks', weight: 10 },
		],
		'Rare': [
			{ species: 'scraggy', weight: 10 }, { species: 'hawlucha', weight: 10 },
			{ species: 'pancham', weight: 10 },
		],
		'Super Rare': [
			{ species: 'gallade', weight: 10 }, { species: 'pangoro', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'terrakion', weight: 10 }, { species: 'buzzwole', weight: 10 },
		],
		'Boss': [
			{ species: 'primeape', weight: 10 }, { species: 'machamp', weight: 10 },
			{ species: 'hariyama', weight: 10 }, { species: 'medicham', weight: 10 },
			{ species: 'toxicroak', weight: 10 }, { species: 'mienshao', weight: 10 },
			{ species: 'crabominable', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'lucario', weight: 10 }, { species: 'bewear', weight: 10 },
			{ species: 'pangoro', weight: 10 }, { species: 'annihilape', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'terrakion', weight: 10 }, { species: 'buzzwole', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'kubfu', weight: 10 }],
	},
	'Factory': {
		'Common': [
			{ species: 'klink', weight: 10 }, { species: 'bronzor', weight: 10 },
			{ species: 'magnemite', weight: 10 }, { species: 'voltorb', weight: 10 },
			{ species: 'grimer', weight: 10 }, { species: 'koffing', weight: 10 },
			{ species: 'varoom', weight: 10 },
		],
		'Uncommon': [
			{ species: 'geodude', weight: 10 }, { species: 'porygon', weight: 10 },
			{ species: 'trubbish', weight: 10 }, { species: 'pawniard', weight: 10 },
		],
		'Rare': [
			{ species: 'solrock', weight: 10 }, { species: 'lunatone', weight: 10 },
			{ species: 'golett', weight: 10 }, { species: 'duraludon', weight: 10 },
		],
		'Super Rare': [
			{ species: 'porygon2', weight: 10 }, { species: 'rotom', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'genesect', weight: 10 }, { species: 'magearna', weight: 10 },
		],
		'Boss': [
			{ species: 'klinklang', weight: 10 }, { species: 'bronzong', weight: 10 },
			{ species: 'magnezone', weight: 10 }, { species: 'electrode', weight: 10 },
			{ species: 'muk', weight: 10 }, { species: 'weezing', weight: 10 },
			{ species: 'garbodor', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'porygonz', weight: 10 }, { species: 'bisharp', weight: 10 },
			{ species: 'golurk', weight: 10 }, { species: 'revavroom', weight: 10 },
			{ species: 'archaludon', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'genesect', weight: 10 }, { species: 'magearna', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'mewtwo', weight: 10 }],
	},
	'Ancient Ruins': {
		'Common': [
			{ species: 'natu', weight: 10 }, { species: 'sigilyph', weight: 10 },
			{ species: 'yamask', weight: 10 }, { species: 'elgyem', weight: 10 },
			{ species: 'inkay', weight: 10 }, { species: 'carbink', weight: 10 },
			{ species: 'tinkatink', weight: 10 },
		],
		'Uncommon': [
			{ species: 'spoink', weight: 10 }, { species: 'mimejr', weight: 10 },
			{ species: 'baltoy', weight: 10 }, { species: 'archen', weight: 10 },
			{ species: 'golett', weight: 10 },
		],
		'Rare': [
			{ species: 'unown', weight: 10 }, { species: 'solrock', weight: 10 },
			{ species: 'lunatone', weight: 10 }, { species: 'gimmighoul', weight: 10 },
		],
		'Super Rare': [
			{ species: 'claydol', weight: 10 }, { species: 'cofagrigus', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'registeel', weight: 10 }, { species: 'jirachi', weight: 10 },
			{ species: 'palkia', weight: 10 },
		],
		'Boss': [
			{ species: 'xatu', weight: 10 }, { species: 'cofagrigus', weight: 10 },
			{ species: 'beheeyem', weight: 10 }, { species: 'malamar', weight: 10 },
			{ species: 'diancie', weight: 10 }, { species: 'tinkaton', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'claydol', weight: 10 }, { species: 'archeops', weight: 10 },
			{ species: 'golurk', weight: 10 }, { species: 'gholdengo', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'registeel', weight: 10 }, { species: 'jirachi', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'regigigas', weight: 10 }],
	},
	'Wasteland': {
		'Common': [
			{ species: 'vibrava', weight: 10 }, { species: 'flygon', weight: 10 },
			{ species: 'swablu', weight: 10 }, { species: 'altaria', weight: 10 },
			{ species: 'axew', weight: 10 }, { species: 'fraxure', weight: 10 },
			{ species: 'haxorus', weight: 10 }, { species: 'deino', weight: 10 },
		],
		'Uncommon': [
			{ species: 'goomy', weight: 10 }, { species: 'sliggoo', weight: 10 },
			{ species: 'goodra', weight: 10 }, { species: 'jangmoo', weight: 10 },
			{ species: 'hakamoo', weight: 10 }, { species: 'kommoo', weight: 10 },
		],
		'Rare': [
			{ species: 'larvitar', weight: 10 }, { species: 'pupitar', weight: 10 },
			{ species: 'tyranitar', weight: 10 }, { species: 'bagon', weight: 10 },
			{ species: 'shelgon', weight: 10 }, { species: 'salamence', weight: 10 },
			{ species: 'gible', weight: 10 }, { species: 'gabite', weight: 10 },
			{ species: 'garchomp', weight: 10 },
		],
		'Super Rare': [
			{ species: 'zweilous', weight: 10 }, { species: 'hydreigon', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'zygarde', weight: 10 }, { species: 'rayquaza', weight: 10 },
		],
		'Boss': [
			{ species: 'flygon', weight: 10 }, { species: 'altaria', weight: 10 },
			{ species: 'haxorus', weight: 10 }, { species: 'goodra', weight: 10 },
			{ species: 'kommoo', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'tyranitar', weight: 10 }, { species: 'salamence', weight: 10 },
			{ species: 'garchomp', weight: 10 }, { species: 'hydreigon', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'zygarde', weight: 10 }, { species: 'rayquaza', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'eternatus', weight: 10 }],
	},
	'Abyss': {
		'Common': [
			{ species: 'murkrow', weight: 10 }, { species: 'houndour', weight: 10 },
			{ species: 'houndoom', weight: 10 }, { species: 'sableye', weight: 10 },
			{ species: 'purrloin', weight: 10 }, { species: 'liepard', weight: 10 },
			{ species: 'pawniard', weight: 10 }, { species: 'bisharp', weight: 10 },
			{ species: 'nickit', weight: 10 }, { species: 'thievul', weight: 10 },
			{ species: 'impidimp', weight: 10 }, { species: 'morgrem', weight: 10 },
			{ species: 'grimmsnarl', weight: 10 }, { species: 'maschiff', weight: 10 },
			{ species: 'mabosstiff', weight: 10 },
		],
		'Uncommon': [
			{ species: 'absol', weight: 10 }, { species: 'zorua', weight: 10 },
			{ species: 'deino', weight: 10 }, { species: 'zweilous', weight: 10 },
			{ species: 'kingambit', weight: 10 },
		],
		'Rare': [
			{ species: 'spiritomb', weight: 10 }, { species: 'umbreon', weight: 10 },
		],
		'Super Rare': [
			{ species: 'zoroark', weight: 10 }, { species: 'hydreigon', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'darkrai', weight: 10 }, { species: 'moltresgalar', weight: 10 },
		],
		'Boss': [
			{ species: 'houndoom', weight: 10 }, { species: 'sableye', weight: 10 },
			{ species: 'absol', weight: 10 }, { species: 'grimmsnarl', weight: 10 },
			{ species: 'mabosstiff', weight: 10 }, { species: 'kingambit', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'moltres', weight: 10 }, { species: 'zoroark', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'darkrai', weight: 10 }, { species: 'moltresgalar', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'yveltal', weight: 10 }],
	},
	'Space': {
		'Common': [
			{ species: 'clefairy', weight: 10 }, { species: 'jigglypuff', weight: 10 },
			{ species: 'lunatone', weight: 10 }, { species: 'solrock', weight: 10 },
			{ species: 'bronzor', weight: 10 }, { species: 'elgyem', weight: 10 },
			{ species: 'minior', weight: 10 },
		],
		'Uncommon': [
			{ species: 'staryu', weight: 10 }, { species: 'baltoy', weight: 10 },
			{ species: 'chingling', weight: 10 }, { species: 'munna', weight: 10 },
			{ species: 'dedenne', weight: 10 },
		],
		'Rare': [
			{ species: 'clefable', weight: 10 }, { species: 'natu', weight: 10 },
			{ species: 'snorunt', weight: 10 }, { species: 'froslass', weight: 10 },
		],
		'Super Rare': [
			{ species: 'jirachi', weight: 10 }, { species: 'beheeyem', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'deoxys', weight: 10 }, { species: 'celesteela', weight: 10 },
		],
		'Boss': [
			{ species: 'clefable', weight: 10 }, { species: 'claydol', weight: 10 },
			{ species: 'beheeyem', weight: 10 }, { species: 'bronzong', weight: 10 },
			{ species: 'minior', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'jirachi', weight: 10 }, { species: 'togekiss', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'deoxys', weight: 10 }, { species: 'celesteela', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'rayquaza', weight: 10 }],
	},
	'Construction Site': {
		'Common': [
			{ species: 'machop', weight: 10 }, { species: 'machoke', weight: 10 },
			{ species: 'magnemite', weight: 10 }, { species: 'magneton', weight: 10 },
			{ species: 'drilbur', weight: 10 }, { species: 'excadrill', weight: 10 },
			{ species: 'timburr', weight: 10 }, { species: 'gurdurr', weight: 10 },
		],
		'Uncommon': [
			{ species: 'grimer', weight: 10 }, { species: 'muk', weight: 10 },
			{ species: 'koffing', weight: 10 }, { species: 'weezing', weight: 10 },
			{ species: 'rhyhorn', weight: 10 }, { species: 'rhydon', weight: 10 },
			{ species: 'scraggy', weight: 10 }, { species: 'scrafty', weight: 10 },
		],
		'Rare': [
			{ species: 'onix', weight: 10 }, { species: 'hitmonlee', weight: 10 },
			{ species: 'hitmonchan', weight: 10 }, { species: 'duraludon', weight: 10 },
			{ species: 'meowthgalar', weight: 10 }, { species: 'perrserker', weight: 10 },
		],
		'Super Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'hitmontop', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'cobalion', weight: 10 }, { species: 'stakataka', weight: 10 },
		],
		'Boss': [
			{ species: 'machamp', weight: 10 }, { species: 'conkeldurr', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'perrserker', weight: 10 }, { species: 'archaludon', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'cobalion', weight: 10 }, { species: 'stakataka', weight: 10 },
		],
		'Boss Ultra Rare': [],
	},
	'Jungle': {
		'Common': [
			{ species: 'paras', weight: 10 }, { species: 'exeggcute', weight: 10 },
			{ species: 'tropius', weight: 10 }, { species: 'aipom', weight: 10 },
			{ species: 'mankey', weight: 10 }, { species: 'pansage', weight: 10 },
			{ species: 'sewaddle', weight: 10 }, { species: 'bounsweet', weight: 10 },
			{ species: 'fomantis', weight: 10 }, { species: 'toedscool', weight: 10 },
		],
		'Uncommon': [
			{ species: 'scyther', weight: 10 }, { species: 'heracross', weight: 10 },
			{ species: 'tangela', weight: 10 }, { species: 'pinsir', weight: 10 },
			{ species: 'shroomish', weight: 10 }, { species: 'breloom', weight: 10 },
		],
		'Rare': [
			{ species: 'chikorita', weight: 10 }, { species: 'treecko', weight: 10 },
			{ species: 'turtwig', weight: 10 }, { species: 'rowlet', weight: 10 },
			{ species: 'grookey', weight: 10 }, { species: 'sprigatito', weight: 10 },
		],
		'Super Rare': [
			{ species: 'durant', weight: 10 }, { species: 'komala', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'wochien', weight: 10 }, { species: 'tapukoko', weight: 10 },
		],
		'Boss': [
			{ species: 'exeggutor', weight: 10 }, { species: 'breloom', weight: 10 },
			{ species: 'vespiquen', weight: 10 }, { species: 'lurantis', weight: 10 },
			{ species: 'tsareena', weight: 10 }, { species: 'toedscruel', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'scizor', weight: 10 }, { species: 'heracross', weight: 10 },
			{ species: 'meganium', weight: 10 }, { species: 'sceptile', weight: 10 },
			{ species: 'torterra', weight: 10 }, { species: 'rillaboom', weight: 10 },
			{ species: 'meowscarada', weight: 10 }, { species: 'kleavor', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'wochien', weight: 10 }, { species: 'tapukoko', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'mew', weight: 10 }],
	},
	'Fairy Cave': {
		'Common': [
			{ species: 'clefairy', weight: 10 }, { species: 'togepi', weight: 10 },
			{ species: 'snubbull', weight: 10 }, { species: 'ralts', weight: 10 },
			{ species: 'marill', weight: 10 }, { species: 'mawile', weight: 10 },
			{ species: 'cottonee', weight: 10 }, { species: 'flabebe', weight: 10 },
			{ species: 'sylveon', weight: 10 }, { species: 'carbink', weight: 10 },
		],
		'Uncommon': [
			{ species: 'mimejr', weight: 10 }, { species: 'togekiss', weight: 10 },
			{ species: 'morganite', weight: 10 }, { species: 'ribombee', weight: 10 },
			{ species: 'comfey', weight: 10 }, { species: 'hatenna', weight: 10 },
		],
		'Rare': [
			{ species: 'igglybuff', weight: 10 }, { species: 'snubbull', weight: 10 },
			{ species: 'azumarill', weight: 10 }, { species: 'gardevoir', weight: 10 },
		],
		'Super Rare': [
			{ species: 'togekiss', weight: 10 }, { species: 'florges', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'xerneas', weight: 10 }, { species: 'terapagos', weight: 10 },
		],
		'Boss': [
			{ species: 'clefable', weight: 10 }, { species: 'wigglytuff', weight: 10 },
			{ species: 'granbull', weight: 10 }, { species: 'gardevoir', weight: 10 },
			{ species: 'togekiss', weight: 10 }, { species: 'diancie', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'sylveon', weight: 10 }, { species: 'florges', weight: 10 },
			{ species: 'grimmsnarl', weight: 10 }, { species: 'hatterene', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'xerneas', weight: 10 }, { species: 'terapagos', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'zacian', weight: 10 }],
	},
	'Temple': {
		'Common': [
			{ species: 'gastly', weight: 10 }, { species: 'natu', weight: 10 },
			{ species: 'baltoy', weight: 10 }, { species: 'yamask', weight: 10 },
			{ species: 'elgyem', weight: 10 }, { species: 'litwick', weight: 10 },
			{ species: 'inkay', weight: 10 }, { species: 'sinistea', weight: 10 },
		],
		'Uncommon': [
			{ species: 'slowpoke', weight: 10 }, { species: 'sigilyph', weight: 10 },
			{ species: 'woobat', weight: 10 }, { species: 'golett', weight: 10 },
			{ species: 'pumpkaboo', weight: 10 },
		],
		'Rare': [
			{ species: 'xatu', weight: 10 }, { species: 'claydol', weight: 10 },
			{ species: 'cofagrigus', weight: 10 }, { species: 'runerigus', weight: 10 },
		],
		'Super Rare': [
			{ species: 'beheeyem', weight: 10 }, { species: 'golurk', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'hoopa', weight: 10 }, { species: 'tapulele', weight: 10 },
		],
		'Boss': [
			{ species: 'gengar', weight: 10 }, { species: 'xatu', weight: 10 },
			{ species: 'claydol', weight: 10 }, { species: 'cofagrigus', weight: 10 },
			{ species: 'beheeyem', weight: 10 }, { species: 'chandelure', weight: 10 },
			{ species: 'malamar', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'golurk', weight: 10 }, { species: 'aegislash', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'hoopa', weight: 10 }, { species: 'tapulele', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'necrozma', weight: 10 }],
	},
	'Slum': {
		'Common': [
			{ species: 'rattata', weight: 10 }, { species: 'grimer', weight: 10 },
			{ species: 'koffing', weight: 10 }, { species: 'trubbish', weight: 10 },
			{ species: 'zigzagoon', weight: 10 }, { species: 'nickit', weight: 10 },
			{ species: 'impidimp', weight: 10 }, { species: 'maschiff', weight: 10 },
		],
		'Uncommon': [
			{ species: 'meowth', weight: 10 }, { species: 'corphish', weight: 10 },
			{ species: 'pawniard', weight: 10 }, { species: 'morpeko', weight: 10 },
			{ species: 'zigzagoongalar', weight: 10 },
		],
		'Rare': [
			{ species: 'scrafty', weight: 10 }, { species: 'incineroar', weight: 10 },
			{ species: 'obstagoon', weight: 10 },
		],
		'Super Rare': [
			{ species: 'toxicroak', weight: 10 }, { species: 'ditto', weight: 10 },
		],
		'Ultra Rare': [],
		'Boss': [
			{ species: 'raticate', weight: 10 }, { species: 'muk', weight: 10 },
			{ species: 'weezing', weight: 10 }, { species: 'garbodor', weight: 10 },
			{ species: 'liepard', weight: 10 }, { species: 'thievul', weight: 10 },
			{ species: 'grimmsnarl', weight: 10 }, { species: 'mabosstiff', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'persian', weight: 10 }, { species: 'obstagoon', weight: 10 },
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Snowy Forest': {
		'Common': [
			{ species: 'snover', weight: 10 }, { species: 'swinub', weight: 10 },
			{ species: 'cubchoo', weight: 10 }, { species: 'bergmite', weight: 10 },
			{ species: 'delibird', weight: 10 }, { species: 'snom', weight: 10 },
			{ species: 'cetoddle', weight: 10 },
		],
		'Uncommon': [
			{ species: 'sneasel', weight: 10 }, { species: 'stantler', weight: 10 },
			{ species: 'piloswine', weight: 10 }, { species: 'froslass', weight: 10 },
			{ species: 'zoruahisui', weight: 10 },
		],
		'Rare': [
			{ species: 'lapras', weight: 10 }, { species: 'absol', weight: 10 },
			{ species: 'cryogonal', weight: 10 }, { species: 'frosmoth', weight: 10 },
		],
		'Super Rare': [
			{ species: 'glaceon', weight: 10 }, { species: 'zoroarkhisui', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'calyrex', weight: 10 }, { species: 'enamorus', weight: 10 },
		],
		'Boss': [
			{ species: 'abomasnow', weight: 10 }, { species: 'mamoswine', weight: 10 },
			{ species: 'beartic', weight: 10 }, { species: 'frosmoth', weight: 10 },
			{ species: 'cetitan', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'wyrdeer', weight: 10 }, { species: 'weavile', weight: 10 },
			{ species: 'lapras', weight: 10 }, { species: 'glaceon', weight: 10 },
			{ species: 'zoroarkhisui', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'calyrex', weight: 10 }, { species: 'enamorus', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'articuno', weight: 10 }],
	},
	'Island': {
		'Common': [
			{ species: 'exeggcute', weight: 10 }, { species: 'rattataalola', weight: 10 },
			{ species: 'sandshrewalola', weight: 10 }, { species: 'vulpixalola', weight: 10 },
			{ species: 'cutiefly', weight: 10 }, { species: 'comfey', weight: 10 },
			{ species: 'crabrawler', weight: 10 }, { species: 'bruxish', weight: 10 },
		],
		'Uncommon': [
			{ species: 'meowthalola', weight: 10 }, { species: 'oricorio', weight: 10 },
			{ species: 'wishiwashi', weight: 10 }, { species: 'turtonator', weight: 10 },
			{ species: 'togedemaru', weight: 10 },
		],
		'Rare': [
			{ species: 'diglettalola', weight: 10 }, { species: 'geodudealola', weight: 10 },
			{ species: 'grimeralola', weight: 10 }, { species: 'stufful', weight: 10 },
		],
		'Super Rare': [
			{ species: 'exeggutoralola', weight: 10 }, { species: 'komala', weight: 10 },
		],
		'Ultra Rare': [
			{ species: 'solgaleo', weight: 10 }, { species: 'victini', weight: 10 },
		],
		'Boss': [
			{ species: 'exeggutoralola', weight: 10 }, { species: 'ribombee', weight: 10 },
			{ species: 'comfey', weight: 10 }, { species: 'crabominable', weight: 10 },
			{ species: 'bruxish', weight: 10 },
		],
		'Boss Rare': [
			{ species: 'bewear', weight: 10 }, { species: 'ninetalesalola', weight: 10 },
			{ species: 'mukalola', weight: 10 }, { species: 'golemalola', weight: 10 },
		],
		'Boss Super Rare': [
			{ species: 'solgaleo', weight: 10 }, { species: 'victini', weight: 10 },
		],
		'Boss Ultra Rare': [{ species: 'tapubulu', weight: 10 }],
	},
	'Laboratory': {
		'Common': [
			{ species: 'magnemite', weight: 10 }, { species: 'magneton', weight: 10 },
			{ species: 'grimer', weight: 10 }, { species: 'muk', weight: 10 },
			{ species: 'voltorb', weight: 10 }, { species: 'electrode', weight: 10 },
			{ species: 'bronzor', weight: 10 }, { species: 'bronzong', weight: 10 },
			{ species: 'klink', weight: 10 }, { species: 'klang', weight: 10 },
			{ species: 'klinklang', weight: 10 },
		],
		'Uncommon': [
			{ species: 'solosis', weight: 10 }, { species: 'duosion', weight: 10 },
			{ species: 'reuniclus', weight: 10 },
		],
		'Rare': [
			{ species: 'ditto', weight: 10 }, { species: 'porygon', weight: 10 },
			{ species: 'porygon2', weight: 10 }, { species: 'rotom', weight: 10 },
			{ species: 'typenull', weight: 10 }, { species: 'castform', weight: 10 },
		],
		'Super Rare': [],
		'Ultra Rare': [{ species: 'mewtwo', weight: 10 }],
		'Boss': [
			{ species: 'muk', weight: 10 }, { species: 'electrode', weight: 10 },
			{ species: 'bronzong', weight: 10 }, { species: 'magnezone', weight: 10 },
			{ species: 'porygonz', weight: 10 }, { species: 'reuniclus', weight: 10 },
			{ species: 'klinklang', weight: 10 }, { species: 'rotom', weight: 10 },
		],
		'Boss Rare': [{ species: 'silvally', weight: 10 }],
		'Boss Super Rare': [{ species: 'zygarde', weight: 10 }],
		'Boss Ultra Rare': [{ species: 'mewtwo', weight: 10 }],
	},
	'End': {
		'Common': [
			{ species: 'great_tusk', weight: 10 }, { species: 'scream_tail', weight: 10 },
			{ species: 'brute_bonnet', weight: 10 }, { species: 'flutter_mane', weight: 10 },
			{ species: 'slither_wing', weight: 10 }, { species: 'sandy_shocks', weight: 10 },
			{ species: 'iron_treads', weight: 10 }, { species: 'iron_bundle', weight: 10 },
			{ species: 'iron_hands', weight: 10 }, { species: 'iron_jugulis', weight: 10 },
			{ species: 'iron_moth', weight: 10 }, { species: 'iron_thorns', weight: 10 },
		],
		'Uncommon': [
			{ species: 'roaring_moon', weight: 10 }, { species: 'iron_valiant', weight: 10 },
		],
		'Rare': [
			{ species: 'walking_wake', weight: 10 }, { species: 'iron_leaves', weight: 10 },
			{ species: 'gouging_fire', weight: 10 }, { species: 'iron_boulder', weight: 10 },
			{ species: 'raging_bolt', weight: 10 }, { species: 'iron_crown', weight: 10 },
		],
		'Super Rare': [
			{ species: 'eternatus', weight: 10 },
		],
		'Ultra Rare': [],
		'Boss': [],
		'Boss Rare': [],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
};
