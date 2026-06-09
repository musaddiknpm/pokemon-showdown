import { type TrainerData, type TrainerMon } from '../../types';

export const EVS_PHYS_SWEEPER = { hp: 0, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 } as const;
export const EVS_SPEC_SWEEPER = { hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 } as const;

export const EVS_PHYS_WALLBREAKER = { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 } as const;
export const EVS_SPEC_WALLBREAKER = { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 } as const;

export const EVS_BULKY_PHYS_ATK = { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 } as const;
export const EVS_BULKY_SPEC_ATK = { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 } as const;

export const EVS_PHYS_WALL = { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 } as const;

export const EVS_SPEC_WALL = { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 } as const;

export const EVS_SPDEF_PIVOT = { hp: 248, atk: 0, def: 8, spa: 0, spd: 252, spe: 0 } as const;

export const EVS_MIXED_WALL = { hp: 252, atk: 0, def: 128, spa: 0, spd: 128, spe: 0 } as const;

export const EVS_TRICK_ROOM_SWEEPER = { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 } as const;
export const EVS_TRICK_ROOM_SPEC = { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 } as const;

export const EVS_SUPPORT_FAST = { hp: 252, atk: 0, def: 4, spa: 0, spd: 0, spe: 252 } as const;

export const EVS_SPEC_TANK = { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 } as const;

export const IVS_PERFECT = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } as const;

export const IVS_NO_ATK = { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 } as const;

export const IVS_TRICK_ROOM = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 0 } as const;

export const IVS_TRICK_ROOM_SPEC = { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 0 } as const;

export const TRAINERS: Record<string, Record<string, TrainerData>> = {

	'Floor_5': {
		'Youngster Joey': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster-gen4.png',
			dialog: "My Rattata is in the top percentage of Rattatas!",
			pool: ['rattata', 'pidgey'],
		},
		'Lass Sally': {
			teamSize: 2,
			random: true,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lass-gen4.png',
			dialog: "Are you looking at my cute Pokémon?",
		},
	},
	'Floor_8': {
		'Rival Finn': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "Let's see how much stronger you've gotten!",
			pool: ['charmander', 'starly'],
		},
	},
	'Floor_25': {
		'Rival Finn': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "I've been catching new Pokémon too!",
			pool: ['charmeleon', 'ivysaur', 'staravia'],
		},
	},
	'Floor_35': {
		'Team Rocket Grunt': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rocketgrunt.png',
			dialog: "We're Team Rocket! Hand over your Pokémon!",
			pool: ['zubat', 'koffing', 'rattata', 'ekans', 'sandshrew'],
		},
		'Team Magma Grunt': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/magmagrunt.png',
			dialog: "The land must be expanded for humanity!",
			pool: ['poochyena', 'numel', 'baltoy'],
		},
		'Team Aqua Grunt': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/aquagrunt.png',
			dialog: "The sea is the source of all life!",
			pool: ['poochyena', 'carvanha', 'wailmer'],
		},
	},
	'Floor_55': {
		'Rival Finn': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "My team is really coming together!",
			pool: ['charizard', 'venusaur', 'staraptor'],
		},
	},
	'Floor_62': {
		'Team Galactic Grunt': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/galacticgrunt.png',
			dialog: "For a world without spirit!",
			pool: ['glameow', 'stunky', 'golbat', 'croagunk'],
		},
		'Team Plasma Grunt': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/plasmagrunt.png',
			dialog: "Liberate the Pokémon!",
			pool: ['patrat', 'purrloin', 'trubbish', 'sandile'],
		},
	},
	'Floor_66': {
		'Team Rocket Admin Archer': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/archer.png',
			dialog: "I will not let a child ruin our plans!",
			pool: ['crobat', 'weezing', 'houndoom', 'muk', 'rhydon', 'persian'],
		},
		'Team Magma Admin Tabitha': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tabitha.png',
			dialog: "Hehehe! You're in for a scorched-earth battle!",
			pool: ['camerupt', 'mightyena', 'weezing', 'golbat'],
		},
		'Team Aqua Admin Shelly': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/shelly.png',
			dialog: "You're just a little ripple in our ocean!",
			pool: ['sharpedo', 'mightyena', 'muk', 'crobat'],
		},
		'Team Flare Admin': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/flareadmin.png',
			dialog: "Only the beautiful shall survive!",
			pool: ['manectric', 'houndoom', 'pyroar', 'weavile'],
		},
	},
	'Floor_95': {
		'Rival Finn': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "Get ready to see my partner's true power!",
			pool: [
				{
					species: 'charizard', teraType: 'Fire', ability: 'Blaze', item: 'charcoal',
					ivs: IVS_PERFECT, evs: EVS_SPEC_SWEEPER,
					moves: ['flamethrower', 'air-slash', 'dragon-pulse', 'roost'],
				},
				{
					species: 'venusaur', teraType: 'Grass', ability: 'Overgrow', item: 'black-sludge',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['giga-drain', 'sludge-bomb', 'synthesis', 'sleep-powder'],
				},
				'staraptor', 'garchomp',
			],
		},
	},
	'Floor_115': {
		'Boss Giovanni': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
			dialog: "You dare stand in the way of Team Rocket?",
			pool: [
				{
					species: 'persian', ability: 'Technician', item: 'life-orb', teraType: 'Normal',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['fake-out', 'swift', 'power-gem', 'nasty-plot'],
				},
				{
					species: 'nidoking', ability: 'Sheer Force', item: 'choice-specs', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['earth-power', 'sludge-wave', 'ice-beam', 'thunderbolt'],
				},
				{
					species: 'rhyperior', ability: 'Solid Rock', item: 'assault-vest', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['earthquake', 'stone-edge', 'rock-blast', 'megahorn'],
				},
				{
					species: 'dugtrio', ability: 'Arena Trap', item: 'focus-sash', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'stone-edge', 'sucker-punch', 'memento'],
				},
				{
					species: 'marowak', ability: 'Rock Head', item: 'thick-club', teraType: 'Ground',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['bonemerang', 'fire-punch', 'thunder-punch', 'swords-dance'],
				},
				{
					species: 'kangaskhan', item: 'kangaskhanite', ability: 'Scrappy', teraType: 'Normal',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['return', 'earthquake', 'sucker-punch', 'power-up-punch'],
				},
			],
		},
		'Boss Maxie': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/maxie.png',
			dialog: "The land shall expand! Witness the primal power!",
			pool: [
				{
					species: 'mightyena', ability: 'Moxie', item: 'choice-scarf', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['crunch', 'play-rough', 'fire-fang', 'sucker-punch'],
				},
				{
					species: 'crobat', ability: 'Infiltrator', item: 'black-sludge', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'cross-poison', 'u-turn', 'roost'],
				},
				{
					species: 'weezing', ability: 'Levitate', item: 'black-sludge', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_PHYS_WALL,
					moves: ['sludge-bomb', 'will-o-wisp', 'pain-split', 'toxic'],
				},
				{
					species: 'claydol', ability: 'Levitate', item: 'leftovers', teraType: 'Ground',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['earth-power', 'psyshock', 'stealth-rock', 'rapid-spin'],
				},
				{
					species: 'camerupt', ability: 'Solid Rock', item: 'leftovers', teraType: 'Fire',
					ivs: IVS_TRICK_ROOM_SPEC, evs: EVS_TRICK_ROOM_SPEC,
					moves: ['eruption', 'earth-power', 'ancient-power', 'yawn'],
				},
				{
					species: 'camerupt', item: 'cameruptite', ability: 'Solid Rock', teraType: 'Fire',
					ivs: IVS_TRICK_ROOM_SPEC, evs: EVS_TRICK_ROOM_SPEC,
					moves: ['eruption', 'earth-power', 'ancient-power', 'stealth-rock'],
				},
			],
		},
		'Boss Archie': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/archie.png',
			dialog: "The sea will swallow all! Scuttle your hopes!",
			pool: [
				{
					species: 'mightyena', ability: 'Moxie', item: 'choice-scarf', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['crunch', 'play-rough', 'fire-fang', 'sucker-punch'],
				},
				{
					species: 'crobat', ability: 'Infiltrator', item: 'black-sludge', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'cross-poison', 'u-turn', 'roost'],
				},
				{
					species: 'muk', ability: 'Poison-Touch', item: 'black-sludge', teraType: 'Poison',
					ivs: IVS_PERFECT, evs: EVS_SPDEF_PIVOT,
					moves: ['gunk-shot', 'knock-off', 'curse', 'recover'],
				},
				{
					species: 'wailord', ability: 'Water-Veil', item: 'leftovers', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['surf', 'ice-beam', 'amnesia', 'rest'],
				},
				{
					species: 'sharpedo', ability: 'Speed Boost', item: 'life-orb', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'ice-fang', 'protect'],
				},
				{
					species: 'sharpedo', item: 'sharpedonite', ability: 'Speed Boost', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'ice-fang', 'protect'],
				},
			],
		},
		'Boss Cyrus': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cyrus.png',
			dialog: "I will remake this world into a silent, perfect void.",
			pool: [
				{
					species: 'weavile', ability: 'Pressure', item: 'choice-band', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['knock-off', 'icicle-crash', 'night-slash', 'ice-shard'],
				},
				{
					species: 'honchkrow', ability: 'Moxie', item: 'life-orb', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'sucker-punch', 'night-slash', 'pursuit'],
				},
				{
					species: 'crobat', ability: 'Infiltrator', item: 'black-sludge', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'cross-poison', 'u-turn', 'roost'],
				},
				{
					species: 'gyarados', ability: 'Moxie', item: 'lum-berry', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'magnezone', ability: 'Magnet Pull', item: 'choice-specs', teraType: 'Electric',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['thunderbolt', 'flash-cannon', 'volt-switch', 'thunder-wave'],
				},
				{
					species: 'houndoom', ability: 'Flash Fire', item: 'life-orb', teraType: 'Dark',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'dark-pulse', 'nasty-plot', 'will-o-wisp'],
				},
			],
		},
		'Boss Ghetsis': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ghetsis.png',
			dialog: "I alone shall rule this world as its savior!",
			pool: [
				{
					species: 'cofagrigus', ability: 'Mummy', item: 'leftovers', teraType: 'Ghost',
					ivs: IVS_NO_ATK, evs: EVS_PHYS_WALL,
					moves: ['shadow-ball', 'toxic', 'will-o-wisp', 'pain-split'],
				},
				{
					species: 'eelektross', ability: 'Levitate', item: 'assault-vest', teraType: 'Electric',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['wild-charge', 'drain-punch', 'crunch', 'flamethrower'],
				},
				{
					species: 'seismitoad', ability: 'Water Absorb', item: 'leftovers', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['scald', 'earthquake', 'stealth-rock', 'toxic'],
				},
				{
					species: 'bisharp', ability: 'Defiant', item: 'air-balloon', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['knock-off', 'iron-head', 'sucker-punch', 'swords-dance'],
				},
				{
					species: 'bouffalant', ability: 'Reckless', item: 'choice-band', teraType: 'Normal',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['head-charge', 'earthquake', 'megahorn', 'superpower'],
				},
				{
					species: 'hydreigon', ability: 'Levitate', item: 'choice-specs', teraType: 'Dragon',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'dark-pulse', 'flash-cannon', 'fire-blast'],
				},
			],
		},
		'Boss Lysandre': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lysandre.png',
			dialog: "To make the world beautiful again, it must be purged!",
			pool: [
				{
					species: 'mienshao', ability: 'Reckless', item: 'life-orb', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['high-jump-kick', 'u-turn', 'knock-off', 'fake-out'],
				},
				{
					species: 'honchkrow', ability: 'Moxie', item: 'life-orb', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'sucker-punch', 'night-slash', 'heat-wave'],
				},
				{
					species: 'pyroar', ability: 'Unnerve', item: 'choice-specs', teraType: 'Fire',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'hyper-voice', 'dark-pulse', 'will-o-wisp'],
				},
				{
					species: 'gyarados', item: 'gyaradosite', ability: 'Moxie', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
			],
		},
	},
	'Floor_145': {
		'Rival Finn': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "I've found a new partner that will blow you away!",
			pool: [
				{
					species: 'charizard', teraType: 'Fire', ability: 'Blaze', item: 'charcoal',
					ivs: IVS_PERFECT, evs: EVS_SPEC_SWEEPER,
					moves: ['flamethrower', 'air-slash', 'dragon-pulse', 'roost'],
				},
				{
					species: 'venusaur', teraType: 'Grass', ability: 'Chlorophyll', item: 'black-sludge',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['giga-drain', 'sludge-bomb', 'synthesis', 'sleep-powder'],
				},
				'staraptor', 'lucario', 'garchomp', 'rayquaza',
			],
		},
	},
	'Floor_165': {
		'Boss Giovanni (Rematch)': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
			dialog: "Behold the ultimate power!",
			pool: [
				{
					species: 'tyranitar', ability: 'Sand Stream', item: 'choice-scarf', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['stone-edge', 'crunch', 'earthquake', 'superpower'],
				},
				{
					species: 'hippowdon', ability: 'Sand Stream', item: 'leftovers', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['earthquake', 'stealth-rock', 'slack-off', 'whirlwind'],
				},
				{
					species: 'excadrill', ability: 'Sand Rush', item: 'life-orb', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'iron-head', 'rock-slide', 'swords-dance'],
				},
				{
					species: 'gastrodon', ability: 'Storm Drain', item: 'leftovers', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPDEF_PIVOT,
					moves: ['scald', 'earth-power', 'recover', 'toxic'],
				},
				{
					species: 'kangaskhan', item: 'kangaskhanite', ability: 'Scrappy', teraType: 'Normal',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['return', 'earthquake', 'sucker-punch', 'power-up-punch'],
				},
				{
					species: 'mewtwo', ability: 'Pressure', item: 'life-orb', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psystrike', 'ice-beam', 'thunderbolt', 'aura-sphere'],
				},
			],
		},
	},
	'Floor_182': {
		'Elite Four Lorelei': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lorelei.png',
			dialog: "No one can best me when it comes to icy Pokémon! Freeze solid!",
			pool: [
				{
					species: 'dewgong', ability: 'Thick Fat', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['surf', 'ice-beam', 'toxic', 'rest'],
				},
				{
					species: 'slowbro', ability: 'Regenerator', item: 'leftovers', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_PHYS_WALL,
					moves: ['scald', 'psyshock', 'slack-off', 'thunder-wave'],
				},
				{
					species: 'jynx', ability: 'Dry Skin', item: 'focus-sash', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['blizzard', 'psychic', 'nasty-plot', 'lovely-kiss'],
				},
				{
					species: 'cloyster', ability: 'Skill Link', item: 'white-herb', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['shell-smash', 'icicle-spear', 'rock-blast', 'surf'],
				},
				{
					species: 'lapras', teraType: 'Ice', ability: 'Water Absorb', item: 'assault-vest',
					ivs: IVS_PERFECT, evs: EVS_SPDEF_PIVOT,
					moves: ['freeze-dry', 'surf', 'ice-shard', 'thunder-wave'],
				},
			],
		},
		'Elite Four Sidney': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/sidney.png',
			dialog: "I like that look you're giving me. I'll take you on anytime!",
			pool: [
				{
					species: 'mightyena', ability: 'Moxie', item: 'choice-scarf', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['crunch', 'play-rough', 'fire-fang', 'sucker-punch'],
				},
				{
					species: 'shiftry', ability: 'Pickpocket', item: 'life-orb', teraType: 'Grass',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['leaf-blade', 'knock-off', 'sucker-punch', 'swords-dance'],
				},
				{
					species: 'cacturne', ability: 'Water Absorb', item: 'focus-sash', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['needle-arm', 'sucker-punch', 'swords-dance', 'destiny-bond'],
				},
				{
					species: 'sharpedo', ability: 'Speed Boost', item: 'life-orb', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'ice-fang', 'protect'],
				},
				{
					species: 'absol', item: 'absolite', ability: 'Super Luck', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['knock-off', 'play-rough', 'sucker-punch', 'swords-dance'],
				},
			],
		},
		'Elite Four Aaron': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/aaron.png',
			dialog: "My bug Pokémon are the toughest around. Prepare to be stung!",
			pool: [
				{
					species: 'yanmega', ability: 'Speed Boost', item: 'focus-sash', teraType: 'Bug',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['bug-buzz', 'air-slash', 'protect', 'ancient-power'],
				},
				{
					species: 'heracross', ability: 'Moxie', item: 'choice-scarf', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['close-combat', 'megahorn', 'knock-off', 'rock-blast'],
				},
				{
					species: 'vespiquen', ability: 'Pressure', item: 'leftovers', teraType: 'Bug',
					ivs: IVS_NO_ATK, evs: EVS_PHYS_WALL,
					moves: ['attack-order', 'toxic', 'defend-order', 'heal-order'],
				},
				{
					species: 'beautifly', ability: 'Swarm', item: 'choice-specs', teraType: 'Bug',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['bug-buzz', 'psychic', 'shadow-ball', 'morning-sun'],
				},
				{
					species: 'drapion', teraType: 'Bug', ability: 'Sniper', item: 'choice-scarf',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['cross-poison', 'knock-off', 'earthquake', 'night-slash'],
				},
			],
		},
		'Elite Four Shauntal': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/shauntal.png',
			dialog: "Excuse me. You're a fascinating Trainer. May I use you as a subject for my novel?",
			pool: [
				{
					species: 'cofagrigus', ability: 'Mummy', item: 'leftovers', teraType: 'Ghost',
					ivs: IVS_NO_ATK, evs: EVS_PHYS_WALL,
					moves: ['shadow-ball', 'will-o-wisp', 'pain-split', 'toxic'],
				},
				{
					species: 'jellicent', ability: 'Water Absorb', item: 'leftovers', teraType: 'Ghost',
					ivs: IVS_NO_ATK, evs: EVS_SPDEF_PIVOT,
					moves: ['scald', 'shadow-ball', 'recover', 'will-o-wisp'],
				},
				{
					species: 'golurk', ability: 'No Guard', item: 'choice-band', teraType: 'Ghost',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['dynamic-punch', 'shadow-punch', 'earthquake', 'ice-punch'],
				},
				{
					species: 'froslass', ability: 'Cursed Body', item: 'focus-sash', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SUPPORT_FAST,
					moves: ['shadow-ball', 'blizzard', 'spikes', 'destiny-bond'],
				},
				{
					species: 'chandelure', teraType: 'Ghost', ability: 'Flash Fire', item: 'choice-specs',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['shadow-ball', 'flamethrower', 'energy-ball', 'trick'],
				},
			],
		},
		'Elite Four Malva': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/malva.png',
			dialog: "I'll make you feel the heat of my burning ambition!",
			pool: [
				{
					species: 'torkoal', ability: 'Drought', item: 'leftovers', teraType: 'Fire',
					ivs: IVS_TRICK_ROOM_SPEC, evs: EVS_SPEC_TANK,
					moves: ['eruption', 'earth-power', 'stealth-rock', 'yawn'],
				},
				{
					species: 'chandelure', ability: 'Flash Fire', item: 'choice-specs', teraType: 'Fire',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'shadow-ball', 'energy-ball', 'trick'],
				},
				{
					species: 'talonflame', ability: 'Gale Wings', item: 'choice-band', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'flare-blitz', 'u-turn', 'roost'],
				},
				{
					species: 'pyroar', ability: 'Unnerve', item: 'choice-specs', teraType: 'Fire',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'hyper-voice', 'dark-pulse', 'will-o-wisp'],
				},
				{
					species: 'houndoom', item: 'houndoominite', ability: 'Flash Fire', teraType: 'Dark',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'dark-pulse', 'nasty-plot', 'will-o-wisp'],
				},
			],
		},
	},
	'Floor_184': {
		'Elite Four Bruno': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png',
			dialog: "We will grind you down with our superior power! Urrgh!",
			pool: [
				{
					species: 'hitmontop', ability: 'Technician', item: 'life-orb', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['mach-punch', 'bullet-punch', 'rapid-spin', 'close-combat'],
				},
				{
					species: 'hitmonlee', ability: 'Reckless', item: 'choice-scarf', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['high-jump-kick', 'knock-off', 'sucker-punch', 'blaze-kick'],
				},
				{
					species: 'hitmonchan', ability: 'Iron Fist', item: 'choice-band', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['mach-punch', 'thunder-punch', 'ice-punch', 'fire-punch'],
				},
				{
					species: 'steelix', ability: 'Sturdy', item: 'leftovers', teraType: 'Steel',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['earthquake', 'iron-tail', 'stealth-rock', 'toxic'],
				},
				{
					species: 'machamp', teraType: 'Fighting', ability: 'No Guard', item: 'assault-vest',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['dynamic-punch', 'knock-off', 'bullet-punch', 'stone-edge'],
				},
			],
		},
		'Elite Four Phoebe': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/phoebe.png',
			dialog: "I trained hard at Mt. Pyre to hone my skills. Here I come!",
			pool: [
				{
					species: 'dusclops', ability: 'Pressure', item: 'eviolite', teraType: 'Ghost',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['shadow-punch', 'will-o-wisp', 'pain-split', 'toxic'],
				},
				{
					species: 'banette', ability: 'Cursed Body', item: 'life-orb', teraType: 'Ghost',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['shadow-claw', 'knock-off', 'destiny-bond', 'trick-room'],
				},
				{
					species: 'sableye', ability: 'Prankster', item: 'leftovers', teraType: 'Dark',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['will-o-wisp', 'recover', 'knock-off', 'foul-play'],
				},
				{
					species: 'banette', ability: 'Frisk', item: 'choice-band', teraType: 'Ghost',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['shadow-claw', 'knock-off', 'thunder-punch', 'sucker-punch'],
				},
				{
					species: 'dusknoir', teraType: 'Ghost', ability: 'Pressure', item: 'assault-vest',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['shadow-punch', 'earthquake', 'brick-break', 'ice-punch'],
				},
			],
		},
		'Elite Four Bertha': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bertha.png',
			dialog: "Hohoho! Come on, child. Show this old lady what you've got!",
			pool: [
				{
					species: 'quagsire', ability: 'Unaware', item: 'leftovers', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['scald', 'earthquake', 'toxic', 'recover'],
				},
				{
					species: 'sudowoodo', ability: 'Sturdy', item: 'custap-berry', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['wood-hammer', 'stone-edge', 'sucker-punch', 'stealth-rock'],
				},
				{
					species: 'golem', ability: 'Sturdy', item: 'choice-band', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'stone-edge', 'sucker-punch', 'explosion'],
				},
				{
					species: 'whiscash', ability: 'Anticipation', item: 'leftovers', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['earthquake', 'waterfall', 'dragon-dance', 'rest'],
				},
				{
					species: 'hippowdon', teraType: 'Ground', ability: 'Sand Stream', item: 'leftovers',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['earthquake', 'slack-off', 'stealth-rock', 'whirlwind'],
				},
			],
		},
		'Elite Four Marshal': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/marshal.png',
			dialog: "I aspire to be the greatest battler of all! Face my fighting spirit!",
			pool: [
				{
					species: 'throh', ability: 'Guts', item: 'flame-orb', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['storm-throw', 'earthquake', 'knock-off', 'bulk-up'],
				},
				{
					species: 'sawk', ability: 'Sturdy', item: 'choice-scarf', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['close-combat', 'earthquake', 'ice-punch', 'knock-off'],
				},
				{
					species: 'mienshao', ability: 'Reckless', item: 'life-orb', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['high-jump-kick', 'u-turn', 'knock-off', 'fake-out'],
				},
				{
					species: 'conkeldurr', ability: 'Guts', item: 'flame-orb', teraType: 'Fighting',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['drain-punch', 'mach-punch', 'knock-off', 'ice-punch'],
				},
				{
					species: 'lucario', teraType: 'Fighting', ability: 'Inner Focus', item: 'life-orb',
					ivs: IVS_PERFECT, evs: EVS_SPEC_SWEEPER,
					moves: ['aura-sphere', 'nasty-plot', 'flash-cannon', 'vacuum-wave'],
				},
			],
		},
		'Elite Four Poppy': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/poppy.png',
			dialog: "I'm gonna give it my all! Don't go easy on me just 'cos I'm small!",
			pool: [
				{
					species: 'copperajah', ability: 'Sheer Force', item: 'assault-vest', teraType: 'Steel',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['heavy-slam', 'earthquake', 'ice-punch', 'play-rough'],
				},
				{
					species: 'corviknight', ability: 'Pressure', item: 'leftovers', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['brave-bird', 'iron-head', 'roost', 'bulk-up'],
				},
				{
					species: 'bronzong', ability: 'Levitate', item: 'leftovers', teraType: 'Steel',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['gyro-ball', 'stealth-rock', 'trick-room', 'hypnosis'],
				},
				{
					species: 'magnezone', ability: 'Magnet Pull', item: 'choice-specs', teraType: 'Electric',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['thunderbolt', 'flash-cannon', 'volt-switch', 'thunder-wave'],
				},
				{
					species: 'tinkaton', teraType: 'Steel', ability: 'Mold Breaker', item: 'choice-band',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['gigaton-hammer', 'play-rough', 'knock-off', 'ice-punch'],
				},
			],
		},
	},
	'Floor_186': {
		'Elite Four Agatha': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/agatha.png',
			dialog: "Pokémon are for battling! I'll show you how a real Trainer does it!",
			pool: [
				{
					species: 'gengar', ability: 'Cursed Body', item: 'choice-scarf', teraType: 'Ghost',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['shadow-ball', 'sludge-wave', 'trick', 'dazzling-gleam'],
				},
				{
					species: 'golbat', ability: 'Inner Focus', item: 'eviolite', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['brave-bird', 'cross-poison', 'roost', 'toxic'],
				},
				{
					species: 'arbok', ability: 'Intimidate', item: 'black-sludge', teraType: 'Poison',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['gunk-shot', 'earthquake', 'sucker-punch', 'coil'],
				},
				{
					species: 'crobat', ability: 'Infiltrator', item: 'black-sludge', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'cross-poison', 'u-turn', 'roost'],
				},
				{
					species: 'gengar', teraType: 'Ghost', ability: 'Cursed Body', item: 'focus-sash',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['shadow-ball', 'sludge-wave', 'nasty-plot', 'destiny-bond'],
				},
			],
		},
		'Elite Four Glacia': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/glacia.png',
			dialog: "I have come from afar to find truly challenging Trainers. Let me see your strength!",
			pool: [
				{
					species: 'glalie', ability: 'Moody', item: 'choice-scarf', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['freeze-dry', 'explosion', 'crunch', 'earthquake'],
				},
				{
					species: 'froslass', ability: 'Cursed Body', item: 'focus-sash', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SUPPORT_FAST,
					moves: ['shadow-ball', 'blizzard', 'spikes', 'destiny-bond'],
				},
				{
					species: 'walrein', ability: 'Ice Body', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_SPEC_WALL,
					moves: ['surf', 'blizzard', 'toxic', 'protect'],
				},
				{
					species: 'glalie', ability: 'Refrigerate', item: 'life-orb', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['freeze-dry', 'shadow-ball', 'crunch', 'ice-shard'],
				},
				{
					species: 'froslass', teraType: 'Ice', ability: 'Cursed Body', item: 'wide-lens',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['shadow-ball', 'blizzard', 'nasty-plot', 'destiny-bond'],
				},
			],
		},
		'Elite Four Flint': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/flint.png',
			dialog: "Hm! You've got the look of a tough Trainer. Let's see if you can handle my burning passion!",
			pool: [
				{
					species: 'rapidash', ability: 'Flash Fire', item: 'choice-band', teraType: 'Fire',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['flare-blitz', 'wild-charge', 'drill-run', 'morning-sun'],
				},
				{
					species: 'magmortar', ability: 'Vital Spirit', item: 'choice-specs', teraType: 'Fire',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'thunderbolt', 'focus-blast', 'psychic'],
				},
				{
					species: 'flareon', ability: 'Flash Fire', item: 'choice-band', teraType: 'Fire',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['flare-blitz', 'superpower', 'quick-attack', 'will-o-wisp'],
				},
				{
					species: 'houndoom', ability: 'Flash Fire', item: 'life-orb', teraType: 'Dark',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'dark-pulse', 'nasty-plot', 'will-o-wisp'],
				},
				{
					species: 'infernape', teraType: 'Fire', ability: 'Iron Fist', item: 'life-orb',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['flare-blitz', 'close-combat', 'u-turn', 'thunder-punch'],
				},
			],
		},
		'Elite Four Grimsley': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/grimsley.png',
			dialog: "When one loses, they lose everything. When one wins, they win everything. That's the way I battle!",
			pool: [
				{
					species: 'liepard', ability: 'Prankster', item: 'lagging-tail', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_SUPPORT_FAST,
					moves: ['thunder-wave', 'assist', 'nasty-plot', 'encore'],
				},
				{
					species: 'scrafty', ability: 'Moxie', item: 'lum-berry', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['crunch', 'high-jump-kick', 'dragon-dance', 'ice-punch'],
				},
				{
					species: 'krookodile', ability: 'Moxie', item: 'choice-scarf', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'knock-off', 'stone-edge', 'pursuit'],
				},
				{
					species: 'bisharp', ability: 'Defiant', item: 'air-balloon', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['knock-off', 'iron-head', 'sucker-punch', 'swords-dance'],
				},
				{
					species: 'tyranitar', teraType: 'Dark', ability: 'Sand Stream', item: 'choice-band',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['stone-edge', 'crunch', 'earthquake', 'ice-punch'],
				},
			],
		},
	},
	'Floor_188': {
		'Elite Four Lance': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
			dialog: "I am the world's greatest dragon master! Tremble before my dragons!",
			pool: [
				{
					species: 'gyarados', ability: 'Intimidate', item: 'lum-berry', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'dragonair', ability: 'Shed Skin', item: 'eviolite', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['dragon-tail', 'thunder-wave', 'aqua-tail', 'extremespeed'],
				},
				{
					species: 'aerodactyl', ability: 'Rock Head', item: 'choice-band', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['stone-edge', 'head-smash', 'earthquake', 'fire-fang'],
				},
				{
					species: 'dragonite', ability: 'Multiscale', item: 'lum-berry', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'extremespeed', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'dragonite', teraType: 'Dragon', ability: 'Multiscale', item: 'choice-band',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'extremespeed', 'fire-punch', 'aqua-tail'],
				},
			],
		},
		'Elite Four Drake': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/drake.png',
			dialog: "My dragons and I have overcome many hardships. Can you weather our storm?",
			pool: [
				{
					species: 'shelgon', ability: 'Rock Head', item: 'eviolite', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['dragon-claw', 'brick-break', 'protect', 'dragon-dance'],
				},
				{
					species: 'altaria', ability: 'Natural Cure', item: 'leftovers', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['dragon-claw', 'cotton-guard', 'roost', 'heal-bell'],
				},
				{
					species: 'flygon', ability: 'Levitate', item: 'choice-scarf', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'outrage', 'u-turn', 'fire-blast'],
				},
				{
					species: 'salamence', ability: 'Moxie', item: 'choice-band', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'earthquake', 'aqua-tail', 'fire-fang'],
				},
				{
					species: 'salamence', item: 'salamencite', ability: 'Intimidate', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['double-edge', 'earthquake', 'dragon-claw', 'dragon-dance'],
				},
			],
		},
		'Elite Four Lucian': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucian.png',
			dialog: "I've been looking forward to this. Let's see if your mind is as sharp as mine.",
			pool: [
				{
					species: 'mrmime', ability: 'Filter', item: 'leftovers', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psychic', 'shadow-ball', 'thunderbolt', 'nasty-plot'],
				},
				{
					species: 'girafarig', ability: 'Inner Focus', item: 'choice-specs', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psychic', 'shadow-ball', 'thunderbolt', 'nasty-plot'],
				},
				{
					species: 'medicham', ability: 'Pure Power', item: 'choice-scarf', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['high-jump-kick', 'zen-headbutt', 'ice-punch', 'thunder-punch'],
				},
				{
					species: 'alakazam', ability: 'Magic Guard', item: 'life-orb', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psychic', 'shadow-ball', 'focus-blast', 'nasty-plot'],
				},
				{
					species: 'bronzong', teraType: 'Psychic', ability: 'Levitate', item: 'leftovers',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['gyro-ball', 'trick-room', 'stealth-rock', 'hypnosis'],
				},
			],
		},
		'Elite Four Hassel': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hassel.png',
			dialog: "I shall paint this battle into a magnificent masterpiece. En garde!",
			pool: [
				{
					species: 'noivern', ability: 'Frisk', item: 'choice-specs', teraType: 'Dragon',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'air-slash', 'flamethrower', 'u-turn'],
				},
				{
					species: 'haxorus', ability: 'Mold Breaker', item: 'choice-scarf', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'dragon-claw', 'earthquake', 'poison-jab'],
				},
				{
					species: 'dragalge', ability: 'Adaptability', item: 'choice-specs', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'sludge-wave', 'focus-blast', 'thunderbolt'],
				},
				{
					species: 'flapple', ability: 'Hustle', item: 'choice-band', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['grav-apple', 'dragon-rush', 'u-turn', 'sucker-punch'],
				},
				{
					species: 'baxcalibur', teraType: 'Dragon', ability: 'Thermal Exchange', item: 'loaded-dice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['glaive-rush', 'icicle-spear', 'ice-shard', 'dragon-dance'],
				},
			],
		},
	},
	'Floor_190': {
		'Champion Blue': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blue.png',
			dialog: "Heh! I'm the Pokémon League Champion! There's nothing you can do!",
			pool: [
				{
					species: 'pidgeot', ability: 'No Guard', item: 'choice-specs', teraType: 'Flying',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['hurricane', 'heat-wave', 'u-turn', 'roost'],
				},
				{
					species: 'alakazam', ability: 'Magic Guard', item: 'life-orb', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psychic', 'shadow-ball', 'focus-blast', 'nasty-plot'],
				},
				{
					species: 'rhydon', ability: 'Solid Rock', item: 'eviolite', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['earthquake', 'stone-edge', 'stealth-rock', 'megahorn'],
				},
				{
					species: 'exeggutor', ability: 'Chlorophyll', item: 'choice-specs', teraType: 'Grass',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['leaf-storm', 'psychic', 'sleep-powder', 'explosion'],
				},
				{
					species: 'gyarados', ability: 'Moxie', item: 'lum-berry', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'charizard', item: 'charizarditex', teraType: 'Dragon', ability: 'Blaze',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'flare-blitz', 'earthquake', 'dragon-dance'],
				},
			],
		},
		'Champion Cynthia': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
			dialog: "I, Cynthia, accept your challenge! There are no weak Pokémon — only weak Trainers!",
			pool: [
				{
					species: 'spiritomb', ability: 'Pressure', item: 'leftovers', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['shadow-ball', 'foul-play', 'will-o-wisp', 'pain-split'],
				},
				{
					species: 'roserade', ability: 'Natural Cure', item: 'focus-sash', teraType: 'Grass',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['leaf-storm', 'sludge-bomb', 'spikes', 'synthesis'],
				},
				{
					species: 'gastrodon', ability: 'Storm Drain', item: 'leftovers', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPDEF_PIVOT,
					moves: ['scald', 'earth-power', 'recover', 'toxic'],
				},
				{
					species: 'lucario', ability: 'Inner Focus', item: 'life-orb', teraType: 'Steel',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['aura-sphere', 'nasty-plot', 'flash-cannon', 'vacuum-wave'],
				},
				{
					species: 'milotic', ability: 'Marvel Scale', item: 'flame-orb', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['scald', 'recover', 'dragon-tail', 'toxic'],
				},
				{
					species: 'garchomp', item: 'garchompite', ability: 'Rough Skin', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'outrage', 'poison-jab', 'swords-dance'],
				},
			],
		},
		'Champion Steven': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
			dialog: "I, Steven, am the Pokémon League Champion. I shall see if you are worthy!",
			pool: [
				{
					species: 'skarmory', ability: 'Sturdy', item: 'leftovers', teraType: 'Steel',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['brave-bird', 'stealth-rock', 'whirlwind', 'roost'],
				},
				{
					species: 'claydol', ability: 'Levitate', item: 'leftovers', teraType: 'Ground',
					ivs: IVS_NO_ATK, evs: EVS_MIXED_WALL,
					moves: ['earth-power', 'psyshock', 'rapid-spin', 'toxic'],
				},
				{
					species: 'aggron', ability: 'Sturdy', item: 'assault-vest', teraType: 'Steel',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['heavy-slam', 'earthquake', 'ice-punch', 'thunder-punch'],
				},
				{
					species: 'cradily', ability: 'Storm Drain', item: 'leftovers', teraType: 'Rock',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['giga-drain', 'stealth-rock', 'toxic', 'recover'],
				},
				{
					species: 'armaldo', ability: 'Swift Swim', item: 'choice-band', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['x-scissor', 'stone-edge', 'aqua-jet', 'swords-dance'],
				},
				{
					species: 'metagross', item: 'metagrossite', ability: 'Clear Body', teraType: 'Steel',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['meteor-mash', 'earthquake', 'zen-headbutt', 'ice-punch'],
				},
			],
		},
		'Champion Leon': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/leon.png',
			dialog: "I'm the greatest Trainer in all of Galar! I won't lose — not even once!",
			pool: [
				{
					species: 'aegislash', ability: 'Stance Change', item: 'leftovers', teraType: 'Ghost',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['shadow-ball', 'flash-cannon', 'king-s-shield', 'sacred-sword'],
				},
				{
					species: 'dragapult', ability: 'Infiltrator', item: 'choice-specs', teraType: 'Dragon',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'shadow-ball', 'thunderbolt', 'u-turn'],
				},
				{
					species: 'haxorus', ability: 'Mold Breaker', item: 'choice-scarf', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'dragon-claw', 'earthquake', 'iron-head'],
				},
				{
					species: 'seismitoad', ability: 'Water Absorb', item: 'leftovers', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['scald', 'earthquake', 'stealth-rock', 'toxic'],
				},
				{
					species: 'mr-rime', ability: 'Ice Body', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['ice-beam', 'psychic', 'trick-room', 'nasty-plot'],
				},
				{
					species: 'charizard', teraType: 'Fire', ability: 'Blaze', item: 'life-orb',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'air-slash', 'dragon-pulse', 'nasty-plot'],
				},
			],
		},
		'Champion Geeta': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/geeta.png',
			dialog: "As chairwoman of the Pokémon League, I must personally test your strength!",
			pool: [
				{
					species: 'espathra', ability: 'Speed Boost', item: 'leftovers', teraType: 'Psychic',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['psychic', 'dazzling-gleam', 'calm-mind', 'roost'],
				},
				{
					species: 'gogoat', ability: 'Sap Sipper', item: 'leftovers', teraType: 'Grass',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['horn-leech', 'earthquake', 'milk-drink', 'bulk-up'],
				},
				{
					species: 'veluza', ability: 'Sharpness', item: 'choice-band', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['aqua-cutter', 'psycho-cut', 'fillet-away', 'ice-punch'],
				},
				{
					species: 'avalugg', ability: 'Sturdy', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['avalanche', 'rapid-spin', 'stealth-rock', 'recover'],
				},
				{
					species: 'kingambit', ability: 'Defiant', item: 'air-balloon', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['kowtow-cleave', 'iron-head', 'sucker-punch', 'swords-dance'],
				},
				{
					species: 'glimmora', teraType: 'Rock', ability: 'Toxic Debris', item: 'focus-sash',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['power-gem', 'earth-power', 'sludge-wave', 'stealth-rock'],
				},
			],
		},
	},
	'Floor_195': {
		'Rival Finn (Final)': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "This is it. Let's go!",
			pool: [
				{
					species: 'charizard', teraType: 'Fire', ability: 'Blaze', item: 'charcoal',
					ivs: IVS_PERFECT, evs: EVS_SPEC_SWEEPER,
					moves: ['fire-blast', 'air-slash', 'dragon-pulse', 'nasty-plot'],
				},
				{
					species: 'venusaur', teraType: 'Grass', ability: 'Chlorophyll', item: 'black-sludge',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['giga-drain', 'sludge-bomb', 'synthesis', 'sleep-powder'],
				},
				{
					species: 'staraptor', ability: 'Reckless', item: 'choice-band', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['brave-bird', 'close-combat', 'double-edge', 'u-turn'],
				},
				{
					species: 'lucario', ability: 'Justified', item: 'life-orb', teraType: 'Fighting',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['close-combat', 'extreme-speed', 'bullet-punch', 'swords-dance'],
				},
				{
					species: 'garchomp', ability: 'Rough Skin', item: 'rocky-helmet', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'dragon-claw', 'poison-jab', 'swords-dance'],
				},
				{
					species: 'rayquaza', item: 'meteorite', ability: 'Air Lock', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['dragon-ascent', 'v-create', 'dragon-claw', 'dragon-dance'],
				},
			],
		},
	},
	'Floor_200': {
		'Eternatus': {
			teamSize: 1,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/unknown.png',
			dialog: "...",
			pool: [
				{
					species: 'eternatus', ability: 'Pressure', item: 'leftovers', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['eternabeam', 'dynamax-cannon', 'sludge-bomb', 'fire-blast'],
				},
			],
		},
	},

	'GYM_tier_1': {

		'Gym Leader Brock': { teamSize: 3, pool: ['geodude', 'onix'] },
		'Gym Leader Misty': { teamSize: 3, pool: ['staryu', 'starmie', 'psyduck'] },
		'Gym Leader Lt. Surge': { teamSize: 3, pool: ['pikachu', 'raichu', 'voltorb'] },
		'Gym Leader Erika': { teamSize: 3, pool: ['tangela', 'weepinbell', 'vileplume'] },
		'Gym Leader Koga': { teamSize: 3, pool: ['koffing', 'muk', 'weezing'] },
		'Gym Leader Sabrina': { teamSize: 3, pool: ['abra', 'kadabra', 'mr-mime'] },
		'Gym Leader Blaine': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png', dialog: "My fiery Pokémon will burn you to a crisp!", pool: ['growlithe', 'ponyta', 'arcanine'] },

		'Gym Leader Falkner': { teamSize: 3, pool: ['pidgey', 'pidgeotto', 'spearow'] },
		'Gym Leader Bugsy': { teamSize: 3, pool: ['caterpie', 'metapod', 'scyther'] },
		'Gym Leader Whitney': { teamSize: 3, pool: ['clefairy', 'miltank'] },
		'Gym Leader Morty': { teamSize: 3, pool: ['gastly', 'haunter', 'gengar'] },
		'Gym Leader Chuck': { teamSize: 3, pool: ['primeape', 'machoke', 'poliwrath'] },
		'Gym Leader Jasmine': { teamSize: 3, pool: ['magnemite', 'steelix'] },
		'Gym Leader Pryce': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/pryce.png', dialog: "I have trained for 50 years, preparing for this day!", pool: ['seel', 'dewgong', 'piloswine'] },

		'Gym Leader Roxanne': { teamSize: 3, pool: ['geodude', 'nosepass'] },
		'Gym Leader Brawly': { teamSize: 3, pool: ['machop', 'makuhita', 'mankey'] },
		'Gym Leader Wattson': { teamSize: 3, pool: ['magnemite', 'voltorb', 'electrike'] },
		'Gym Leader Flannery': { teamSize: 3, pool: ['slugma', 'numel', 'torkoal'] },
		'Gym Leader Norman': { teamSize: 3, pool: ['spinda', 'vigoroth', 'slaking'] },
		'Gym Leader Winona': { teamSize: 3, pool: ['swablu', 'beautifly', 'skarmory'] },
		'Gym Leader Tate & Liza': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png', dialog: "We don't need to talk to know what the other is thinking!", pool: ['solrock', 'lunatone', 'claydol'] },

		'Gym Leader Roark': { teamSize: 3, pool: ['geodude', 'onix', 'cranidos'] },
		'Gym Leader Gardenia': { teamSize: 3, pool: ['cherubi', 'turtwig', 'roserade'] },
		'Gym Leader Fantina': { teamSize: 3, pool: ['misdreavus', 'haunter', 'drifblim'] },
		'Gym Leader Maylene': { teamSize: 3, pool: ['meditite', 'machoke', 'lucario'] },
		'Gym Leader Byron': { teamSize: 3, pool: ['bronzor', 'steelix', 'bastiodon'] },
		'Gym Leader Candice': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/candice.png', dialog: "You want to challenge me? That gets me fired up — or should I say, iced up!", pool: ['snover', 'sneasel', 'piloswine'] },

		'Gym Leader Cilan': { teamSize: 3, pool: ['pansage', 'lillipup', 'pidove'] },
		'Gym Leader Lenora': { teamSize: 3, pool: ['herdier', 'watchog', 'audino'] },
		'Gym Leader Burgh': { teamSize: 3, pool: ['whirlipede', 'dwebble', 'sewaddle'] },
		'Gym Leader Elesa': { teamSize: 3, pool: ['emolga', 'zebstrika'] },
		'Gym Leader Clay': { teamSize: 3, pool: ['krokorok', 'palpitoad', 'excadrill'] },
		'Gym Leader Skyla': { teamSize: 3, pool: ['swoobat', 'unfezant', 'swanna'] },
		'Gym Leader Brycen': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brycen.png', dialog: "I have honed my icy skills through years of training. Face me!", pool: ['vanillish', 'beartic', 'cryogonal'] },

		'Gym Leader Viola': { teamSize: 3, pool: ['surskit', 'vivillon', 'masquerain'] },
		'Gym Leader Grant': { teamSize: 3, pool: ['amaura', 'tyrunt', 'onix'] },
		'Gym Leader Korrina': { teamSize: 3, pool: ['mienfoo', 'machoke', 'lucario'] },
		'Gym Leader Ramos': { teamSize: 3, pool: ['jumpluff', 'weepinbell', 'gogoat'] },
		'Gym Leader Clemont': { teamSize: 3, pool: ['emolga', 'magneton', 'heliolisk'] },
		'Gym Leader Valerie': { teamSize: 3, pool: ['mawile', 'mr-mime', 'sylveon'] },
		'Gym Leader Olympia': { teamSize: 3, pool: ['sigilyph', 'slowking', 'meowstic'] },
		'Gym Leader Wulfric': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wulfric.png', dialog: "My ice-cold Pokémon will give you a chilly reception!", pool: ['bergmite', 'snover', 'avalugg'] },

		'Trial Captain Ilima': { teamSize: 3, pool: ['yungoos', 'smeargle', 'gumshoos'] },
		'Kahuna Hala': { teamSize: 3, pool: ['mankey', 'makuhita', 'crabrawler'] },
		'Trial Captain Lana': { teamSize: 3, pool: ['wishiwashi', 'chinchou', 'araquanid'] },
		'Trial Captain Kiawe': { teamSize: 3, pool: ['marowak', 'arcanine', 'salazzle'] },
		'Trial Captain Mallow': { teamSize: 3, pool: ['bounsweet', 'tsareena', 'shiinotic'] },
		'Kahuna Olivia': { teamSize: 3, pool: ['nosepass', 'lycanroc', 'boldore'] },
		'Trial Captain Sophocles': { teamSize: 3, pool: ['charjabug', 'togedemaru', 'vikavolt'] },
		'Trial Captain Acerola': { teamSize: 3, pool: ['shuppet', 'drifblim', 'mimikyu'] },
		'Kahuna Nanu': { teamSize: 3, pool: ['alolan-persian', 'sableye', 'krokorok'] },
		'Trial Captain Mina': { teamSize: 3, pool: ['ribombee', 'granbull', 'wigglytuff'] },
		'Kahuna Hapu': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hapu.png', dialog: "I am Hapu, kahuna of Poni Island. I shall show you what real power looks like!", pool: ['mudbray', 'gastrodon', 'flygon'] },

		'Gym Leader Milo': { teamSize: 3, pool: ['gossifleur', 'eldegoss', 'applin'] },
		'Gym Leader Nessa': { teamSize: 3, pool: ['goldeen', 'arrokuda', 'drednaw'] },
		'Gym Leader Kabu': { teamSize: 3, pool: ['sizzlipede', 'vulpix', 'ninetales'] },
		'Gym Leader Bea': { teamSize: 3, pool: ['machop', 'pangoro', 'sirfetchd'] },
		'Gym Leader Allister': { teamSize: 3, pool: ['yamask', 'mimikyu', 'cursola'] },
		'Gym Leader Opal': { teamSize: 3, pool: ['galarian-weezing', 'togekiss', 'mawile'] },
		'Gym Leader Gordie': { teamSize: 3, pool: ['barbaracle', 'stonjourner', 'coalossal'] },
		'Gym Leader Melony': { teamSize: 3, pool: ['frosmoth', 'eiscue', 'lapras'] },
		'Gym Leader Piers': { teamSize: 3, pool: ['scrafty', 'malamar', 'obstagoon'] },
		'Gym Leader Marnie': { teamSize: 3, pool: ['morpeko', 'liepard', 'toxicroak'] },
		'Gym Leader Raihan': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/raihan.png', dialog: "I'm the strongest Gym Leader in Galar — and I'll prove it to you!", pool: ['flygon', 'gigalith', 'sandaconda'] },

		'Gym Leader Katy': { teamSize: 3, pool: ['teddiursa', 'nymble', 'lokix'] },
		'Gym Leader Brassius': { teamSize: 3, pool: ['petilil', 'smoliv', 'sudowoodo'] },
		'Gym Leader Iono': { teamSize: 3, pool: ['wattrel', 'bellibolt', 'mismagius'] },
		'Gym Leader Kofu': { teamSize: 3, pool: ['veluza', 'wugtrio', 'crabominable'] },
		'Gym Leader Larry': { teamSize: 3, pool: ['komala', 'starly', 'staraptor'] },
		'Gym Leader Ryme': { teamSize: 3, pool: ['banette', 'mimikyu', 'houndstone'] },
		'Gym Leader Tulip': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tulip.png', dialog: "My Pokémon will make you beautiful — beautifully defeated!", pool: ['girafarig', 'farigiraf', 'gardevoir'] },
	},

	'GYM_tier_3': {

		'Gym Leader Brock': { teamSize: 4, pool: ['geodude', 'graveler', 'onix', 'rhyhorn'] },
		'Gym Leader Misty': { teamSize: 4, pool: ['staryu', 'starmie', 'psyduck', 'golduck'] },
		'Gym Leader Lt. Surge': { teamSize: 4, pool: ['pikachu', 'raichu', 'voltorb', 'electrode'] },
		'Gym Leader Erika': { teamSize: 4, pool: ['victreebel', 'tangela', 'vileplume', 'jumpluff'] },
		'Gym Leader Koga': { teamSize: 4, pool: ['weezing', 'muk', 'venomoth', 'ariados'] },
		'Gym Leader Sabrina': { teamSize: 4, pool: ['kadabra', 'alakazam', 'mr-mime', 'espeon'] },
		'Gym Leader Blaine': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png', dialog: "My fiery Pokémon will burn you to a crisp!", pool: ['arcanine', 'rapidash', 'ninetales', 'magmar'] },

		'Gym Leader Falkner': { teamSize: 4, pool: ['pidgeotto', 'pidgeot', 'hoothoot', 'noctowl'] },
		'Gym Leader Bugsy': { teamSize: 4, pool: ['scyther', 'beedrill', 'butterfree', 'heracross'] },
		'Gym Leader Whitney': { teamSize: 4, pool: ['miltank', 'clefable', 'wigglytuff', 'blissey'] },
		'Gym Leader Morty': { teamSize: 4, pool: ['haunter', 'gengar', 'misdreavus', 'drifblim'] },
		'Gym Leader Chuck': { teamSize: 4, pool: ['primeape', 'poliwrath', 'machamp', 'heracross'] },
		'Gym Leader Jasmine': { teamSize: 4, pool: ['magneton', 'skarmory', 'steelix', 'forretress'] },
		'Gym Leader Pryce': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/pryce.png', dialog: "I have trained for 50 years, preparing for this day!", pool: ['dewgong', 'piloswine', 'lapras', 'cloyster'] },

		'Gym Leader Roxanne': { teamSize: 4, pool: ['graveler', 'nosepass', 'golem', 'lunatone'] },
		'Gym Leader Brawly': { teamSize: 4, pool: ['hariyama', 'medicham', 'machamp', 'breloom'] },
		'Gym Leader Wattson': { teamSize: 4, pool: ['magneton', 'electrode', 'manectric', 'raichu'] },
		'Gym Leader Flannery': { teamSize: 4, pool: ['torkoal', 'camerupt', 'arcanine', 'rapidash'] },
		'Gym Leader Norman': { teamSize: 4, pool: ['slaking', 'vigoroth', 'spinda', 'zangoose'] },
		'Gym Leader Winona': { teamSize: 4, pool: ['pelipper', 'skarmory', 'altaria', 'swellow'] },
		'Gym Leader Tate & Liza': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png', dialog: "We don't need to talk to know what the other is thinking!", pool: ['solrock', 'lunatone', 'claydol', 'xatu'] },

		'Gym Leader Roark': { teamSize: 4, pool: ['rampardos', 'golem', 'onix', 'aerodactyl'] },
		'Gym Leader Gardenia': { teamSize: 4, pool: ['roserade', 'cherrim', 'torterra', 'leafeon'] },
		'Gym Leader Fantina': { teamSize: 4, pool: ['drifblim', 'mismagius', 'gengar', 'chandelure'] },
		'Gym Leader Maylene': { teamSize: 4, pool: ['lucario', 'machamp', 'medicham', 'infernape'] },
		'Gym Leader Wake': { teamSize: 4, pool: ['gyarados', 'quagsire', 'floatzel', 'pelipper'] },
		'Gym Leader Byron': { teamSize: 4, pool: ['steelix', 'bastiodon', 'magnezone', 'probopass'] },
		'Gym Leader Candice': { teamSize: 4, pool: ['froslass', 'mamoswine', 'glaceon', 'abomasnow'] },
		'Gym Leader Volkner': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/volkner.png', dialog: "I've been waiting for a Trainer who can make me feel alive again. Let's go!", pool: ['raichu', 'luxray', 'electivire', 'magnezone'] },

		'Gym Leader Cilan': { teamSize: 4, pool: ['simisage', 'lilligant', 'leavanny', 'ferrothorn'] },
		'Gym Leader Lenora': { teamSize: 4, pool: ['stoutland', 'watchog', 'cinccino', 'audino'] },
		'Gym Leader Burgh': { teamSize: 4, pool: ['leavanny', 'whirlipede', 'crustle', 'escavalier'] },
		'Gym Leader Elesa': { teamSize: 4, pool: ['emolga', 'zebstrika', 'jolteon', 'eelektross'] },
		'Gym Leader Clay': { teamSize: 4, pool: ['excadrill', 'krokorok', 'palpitoad', 'sandslash'] },
		'Gym Leader Skyla': { teamSize: 4, pool: ['swoobat', 'unfezant', 'swanna', 'sigilyph'] },
		'Gym Leader Brycen': { teamSize: 4, pool: ['cryogonal', 'beartic', 'vanilluxe', 'weavile'] },
		'Gym Leader Drayden': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/drayden.png', dialog: "My dragons are forged through strict discipline. Can you handle their fury?", pool: ['druddigon', 'flygon', 'haxorus', 'altaria'] },

		'Gym Leader Viola': { teamSize: 4, pool: ['vivillon', 'masquerain', 'scizor', 'yanmega'] },
		'Gym Leader Grant': { teamSize: 4, pool: ['tyrunt', 'amaura', 'aerodactyl', 'golem'] },
		'Gym Leader Korrina': { teamSize: 4, pool: ['lucario', 'machamp', 'pangoro', 'hawlucha'] },
		'Gym Leader Ramos': { teamSize: 4, pool: ['jumpluff', 'gogoat', 'victreebel', 'leafeon'] },
		'Gym Leader Clemont': { teamSize: 4, pool: ['emolga', 'magneton', 'heliolisk', 'luxray'] },
		'Gym Leader Valerie': { teamSize: 4, pool: ['sylveon', 'togekiss', 'gardevoir', 'mawile'] },
		'Gym Leader Olympia': { teamSize: 4, pool: ['slowking', 'meowstic', 'gothitelle', 'sigilyph'] },
		'Gym Leader Wulfric': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wulfric.png', dialog: "My ice-cold Pokémon will give you a chilly reception!", pool: ['avalugg', 'abomasnow', 'mamoswine', 'froslass'] },

		'Kahuna Hala': { teamSize: 4, pool: ['hariyama', 'crabominable', 'poliwrath', 'bewear'] },
		'Kahuna Olivia': { teamSize: 4, pool: ['lycanroc', 'probopass', 'carbink', 'golem'] },
		'Kahuna Nanu': { teamSize: 4, pool: ['alolan-persian', 'krookodile', 'alolan-muk', 'sableye'] },
		'Kahuna Hapu': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hapu.png', dialog: "I am Hapu, kahuna of Poni Island. I shall show you what real power looks like!", pool: ['mudsdale', 'gastrodon', 'dugtrio', 'flygon'] },

		'Gym Leader Milo': { teamSize: 4, pool: ['eldegoss', 'tsareena', 'ferrothorn', 'appletun'] },
		'Gym Leader Nessa': { teamSize: 4, pool: ['drednaw', 'pelipper', 'lanturn', 'barraskewda'] },
		'Gym Leader Kabu': { teamSize: 4, pool: ['ninetales', 'centiskorch', 'arcanine', 'torkoal'] },
		'Gym Leader Bea': { teamSize: 4, pool: ['sirfetchd', 'pangoro', 'machamp', 'falinks'] },
		'Gym Leader Allister': { teamSize: 4, pool: ['cursola', 'mimikyu', 'dusknoir', 'gengar'] },
		'Gym Leader Opal': { teamSize: 4, pool: ['togekiss', 'galarian-weezing', 'sylveon', 'clefable'] },
		'Gym Leader Gordie': { teamSize: 4, pool: ['coalossal', 'stonjourner', 'rhyperior', 'tyranitar'] },
		'Gym Leader Melony': { teamSize: 4, pool: ['lapras', 'frosmoth', 'glaceon', 'eiscue'] },
		'Gym Leader Piers': { teamSize: 4, pool: ['obstagoon', 'scrafty', 'malamar', 'crawdaunt'] },
		'Gym Leader Raihan': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/raihan.png', dialog: "I'm the strongest Gym Leader in Galar — and I'll prove it to you!", pool: ['flygon', 'gigalith', 'sandaconda', 'duraludon'] },

		'Gym Leader Katy': { teamSize: 4, pool: ['lokix', 'heracross', 'ursaring', 'crustle'] },
		'Gym Leader Brassius': { teamSize: 4, pool: ['sudowoodo', 'lilligant', 'leafeon', 'breloom'] },
		'Gym Leader Iono': { teamSize: 4, pool: ['bellibolt', 'mismagius', 'electrode', 'luxray'] },
		'Gym Leader Kofu': { teamSize: 4, pool: ['crabominable', 'basculegion', 'gastrodon', 'dondozo'] },
		'Gym Leader Larry': { teamSize: 4, pool: ['dudunsparce', 'staraptor', 'komala', 'flamigo'] },
		'Gym Leader Ryme': { teamSize: 4, pool: ['houndstone', 'toxtricity', 'mimikyu', 'gengar'] },
		'Gym Leader Tulip': { teamSize: 4, pool: ['farigiraf', 'gardevoir', 'florges', 'espathra'] },
		'Gym Leader Grusha': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/grusha.png', dialog: "My ice-type Pokémon are as cool as I am. Let's see if you can keep up!", pool: ['cetitan', 'weavile', 'froslass', 'glaceon'] },
	},

	'GYM_tier_5': {
		'Gym Leader Giovanni': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
			dialog: "You dare challenge the boss of Team Rocket?! You will regret this!",
			pool: [
				{
					species: 'dugtrio', ability: 'Arena Trap', item: 'focus-sash', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'stone-edge', 'sucker-punch', 'memento'],
				},
				{
					species: 'nidoqueen', ability: 'Sheer Force', item: 'life-orb', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['earth-power', 'sludge-wave', 'ice-beam', 'thunderbolt'],
				},
				{
					species: 'nidoking', ability: 'Sheer Force', item: 'choice-specs', teraType: 'Poison',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['earth-power', 'sludge-wave', 'ice-beam', 'thunderbolt'],
				},
				{
					species: 'rhyperior', ability: 'Solid Rock', item: 'assault-vest', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['earthquake', 'stone-edge', 'rock-blast', 'megahorn'],
				},
				{
					species: 'hippowdon', ability: 'Sand Stream', item: 'leftovers', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['earthquake', 'slack-off', 'stealth-rock', 'whirlwind'],
				},
				{
					species: 'marowak', teraType: 'Ground', ability: 'Rock Head', item: 'thick-club',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['bonemerang', 'fire-punch', 'thunder-punch', 'swords-dance'],
				},
			],
		},
		'Gym Leader Clair': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/clair.png',
			dialog: "I am the world's best dragon master — and I shall prove it!",
			pool: [
				{
					species: 'dragonair', ability: 'Shed Skin', item: 'eviolite', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['dragon-tail', 'thunder-wave', 'aqua-tail', 'extremespeed'],
				},
				{
					species: 'gyarados', ability: 'Moxie', item: 'lum-berry', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'charizard', ability: 'Blaze', item: 'choice-scarf', teraType: 'Fire',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['flare-blitz', 'outrage', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'aerodactyl', ability: 'Rock Head', item: 'choice-band', teraType: 'Rock',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['stone-edge', 'head-smash', 'earthquake', 'fire-fang'],
				},
				{
					species: 'kingdra', ability: 'Sniper', item: 'choice-specs', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'surf', 'ice-beam', 'focus-energy'],
				},
				{
					species: 'dragonite', teraType: 'Dragon', ability: 'Multiscale', item: 'lum-berry',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'extremespeed', 'earthquake', 'dragon-dance'],
				},
			],
		},
		'Gym Leader Wallace': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wallace.png',
			dialog: "I shall show you the grace and power of water — prepare to be overwhelmed!",
			pool: [
				{
					species: 'whiscash', ability: 'Anticipation', item: 'leftovers', teraType: 'Water',
					ivs: IVS_PERFECT, evs: EVS_MIXED_WALL,
					moves: ['earthquake', 'waterfall', 'dragon-dance', 'rest'],
				},
				{
					species: 'tentacruel', ability: 'Rain Dish', item: 'black-sludge', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPDEF_PIVOT,
					moves: ['scald', 'toxic-spikes', 'rapid-spin', 'toxic'],
				},
				{
					species: 'ludicolo', ability: 'Swift Swim', item: 'life-orb', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['surf', 'energy-ball', 'ice-beam', 'rain-dance'],
				},
				{
					species: 'gyarados', ability: 'Moxie', item: 'lum-berry', teraType: 'Flying',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['waterfall', 'crunch', 'earthquake', 'dragon-dance'],
				},
				{
					species: 'starmie', ability: 'Analytic', item: 'choice-specs', teraType: 'Water',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['surf', 'ice-beam', 'thunderbolt', 'psychic'],
				},
				{
					species: 'milotic', teraType: 'Water', ability: 'Marvel Scale', item: 'flame-orb',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['scald', 'recover', 'dragon-tail', 'toxic'],
				},
			],
		},
		'Gym Leader Volkner': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/volkner.png',
			dialog: "I've been waiting for a Trainer who can make me feel alive again. Let's go!",
			pool: [
				{
					species: 'jolteon', ability: 'Volt Absorb', item: 'choice-specs', teraType: 'Electric',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['thunderbolt', 'shadow-ball', 'volt-switch', 'hyper-voice'],
				},
				{
					species: 'raichu', ability: 'Lightning Rod', item: 'life-orb', teraType: 'Electric',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['thunderbolt', 'focus-blast', 'nasty-plot', 'volt-switch'],
				},
				{
					species: 'luxray', ability: 'Intimidate', item: 'choice-band', teraType: 'Electric',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['wild-charge', 'crunch', 'ice-fang', 'superpower'],
				},
				{
					species: 'electivire', ability: 'Motor Drive', item: 'expert-belt', teraType: 'Electric',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['wild-charge', 'ice-punch', 'fire-punch', 'earthquake'],
				},
				{
					species: 'magnezone', ability: 'Magnet Pull', item: 'choice-specs', teraType: 'Electric',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['thunderbolt', 'flash-cannon', 'volt-switch', 'thunder-wave'],
				},
				{
					species: 'luxray', teraType: 'Electric', ability: 'Guts', item: 'flame-orb',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['wild-charge', 'facade', 'crunch', 'ice-fang'],
				},
			],
		},
		'Gym Leader Drayden': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/drayden.png',
			dialog: "My dragons are forged through strict discipline. Can you handle their fury?",
			pool: [
				{
					species: 'druddigon', ability: 'Rough Skin', item: 'rocky-helmet', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['outrage', 'sucker-punch', 'stealth-rock', 'glare'],
				},
				{
					species: 'flygon', ability: 'Levitate', item: 'choice-scarf', teraType: 'Ground',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['earthquake', 'outrage', 'u-turn', 'fire-blast'],
				},
				{
					species: 'altaria', ability: 'Natural Cure', item: 'leftovers', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['dragon-claw', 'cotton-guard', 'roost', 'heal-bell'],
				},
				{
					species: 'hydreigon', ability: 'Levitate', item: 'choice-specs', teraType: 'Dragon',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['draco-meteor', 'dark-pulse', 'flash-cannon', 'fire-blast'],
				},
				{
					species: 'haxorus', ability: 'Mold Breaker', item: 'choice-band', teraType: 'Dragon',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'earthquake', 'poison-jab', 'brick-break'],
				},
				{
					species: 'haxorus', teraType: 'Dragon', ability: 'Mold Breaker', item: 'lum-berry',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['outrage', 'earthquake', 'poison-jab', 'swords-dance'],
				},
			],
		},
		'Gym Leader Wulfric': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wulfric.png',
			dialog: "My ice-cold Pokémon will give you a chilly reception!",
			pool: [
				{
					species: 'abomasnow', ability: 'Snow Warning', item: 'choice-band', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['wood-hammer', 'ice-shard', 'earthquake', 'avalanche'],
				},
				{
					species: 'cryogonal', ability: 'Levitate', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_WALL,
					moves: ['freeze-dry', 'rapid-spin', 'recover', 'toxic'],
				},
				{
					species: 'avalugg', ability: 'Sturdy', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_WALL,
					moves: ['avalanche', 'rapid-spin', 'stealth-rock', 'recover'],
				},
				{
					species: 'mamoswine', ability: 'Thick Fat', item: 'choice-band', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['icicle-crash', 'earthquake', 'ice-shard', 'superpower'],
				},
				{
					species: 'glaceon', ability: 'Ice Body', item: 'choice-specs', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['blizzard', 'shadow-ball', 'hyper-voice', 'frost-breath'],
				},
				{
					species: 'avalugg', teraType: 'Ice', ability: 'Sturdy', item: 'custap-berry',
					ivs: IVS_TRICK_ROOM, evs: EVS_TRICK_ROOM_SWEEPER,
					moves: ['avalanche', 'body-press', 'stealth-rock', 'rapid-spin'],
				},
			],
		},
		'Gym Leader Grusha': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/grusha.png',
			dialog: "My ice-type Pokémon are as cool as I am. Let's see if you can keep up!",
			pool: [
				{
					species: 'frosmoth', ability: 'Ice Scales', item: 'leftovers', teraType: 'Ice',
					ivs: IVS_NO_ATK, evs: EVS_SPEC_SWEEPER,
					moves: ['blizzard', 'bug-buzz', 'quiver-dance', 'roost'],
				},
				{
					species: 'beartic', ability: 'Swift Swim', item: 'choice-band', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['icicle-crash', 'superpower', 'aqua-jet', 'close-combat'],
				},
				{
					species: 'cetitan', ability: 'Thick Fat', item: 'assault-vest', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_BULKY_PHYS_ATK,
					moves: ['icicle-crash', 'earthquake', 'ice-shard', 'superpower'],
				},
				{
					species: 'weavile', ability: 'Pressure', item: 'choice-band', teraType: 'Dark',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['knock-off', 'icicle-crash', 'night-slash', 'ice-shard'],
				},
				{
					species: 'mamoswine', ability: 'Thick Fat', item: 'choice-scarf', teraType: 'Ice',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['icicle-crash', 'earthquake', 'ice-shard', 'superpower'],
				},
				{
					species: 'altaria', teraType: 'Ice', ability: 'Natural Cure', item: 'altarianite',
					ivs: IVS_PERFECT, evs: EVS_PHYS_SWEEPER,
					moves: ['return', 'earthquake', 'dragon-dance', 'roost'],
				},
			],
		},
	},

	'STANDARD_early': {
		'Bug Catcher Rick': {
			biome: ['Forest', 'Meadow', 'Tall Grass', 'Grass'],
			chance: 30, teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png', dialog: "My bug Pokémon are gonna wrap you up tight!", pool: ['caterpie', 'weedle', 'venonat', 'paras', 'spinarak', 'ledyba', 'wurmple', 'silcoon', 'cascoon', 'surskit', 'kricketot', 'burmy', 'sewaddle', 'venipede', 'scatterbug'] },
		'Hiker David': {
			biome: ['Cave', 'Mountain', 'Volcano', 'Badlands'],
			chance: 20, teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hiker.png', dialog: "I've climbed every mountain — now I'll climb over you!", pool: ['geodude', 'machop', 'zubat', 'makuhita', 'aron', 'nosepass', 'roggenrola', 'timburr', 'drilbur', 'bunnelby', 'rockruff', 'rolycoly', 'nacli'] },
		'Lass Sally': {
			chance: 15, teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lass.png', dialog: "Hehe, don't underestimate me just because I look cute!", pool: ['jigglypuff', 'clefairy', 'marill', 'skitty', 'snubbull', 'igglybuff', 'togepi', 'munchlax', 'happiny', 'cottonee', 'flabebe', 'sylveon', 'fidough'] },
		'Youngster Jake': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster.png', dialog: "I just got my first Pokémon and I'm ready to battle!", pool: ['rattata', 'pidgey', 'sentret', 'zigzagoon', 'poochyena', 'bidoof', 'patrat', 'bunnelby', 'yungoos', 'skwovet'] },
		'Camper Tom': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/camper.png', dialog: "Nothing like a good battle in the great outdoors!", pool: ['nidoran-m', 'ekans', 'sandshrew', 'growlithe', 'psyduck', 'horsea', 'staryu', 'krabby', 'barboach', 'buizel'] },
		'Picnicker Lisa': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/picnicker.png', dialog: "We're taking a break from our picnic to battle you!", pool: ['nidoran-f', 'oddish', 'bellsprout', 'vulpix', 'meowth', 'happiny', 'pachirisu', 'cherubi', 'buneary', 'minccino'] },
		'Fisherman Wade': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/fisherman.png', dialog: "I hooked myself a challenger! You won't get away!", pool: ['magikarp', 'poliwag', 'tentacool', 'horsea', 'goldeen', 'shellder', 'remoraid', 'barboach', 'finneon', 'basculin', 'wishiwashi', 'arrokuda', 'bruxish'] },
		'Bird Keeper Rudy': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/birdkeeper.png', dialog: "My birds will swoop down and take you out!", pool: ['pidgey', 'spearow', 'hoothoot', 'taillow', 'starly', 'pidove', 'fletchling', 'rookidee', 'squawkabilly'] },
		'Twins Amy & May': {
			chance: 10, teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/twins.png', dialog: "Two against one? No, two Trainers, one battle!", pool: ['plusle', 'minun', 'volbeat', 'illumise', 'pachirisu', 'marill', 'pikachu', 'dedenne', 'togedemaru'] },
		'Preschooler Mia': { teamSize: 1, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/preschooler.png', dialog: "I wanna battle! My Pokémon is my bestest friend!", pool: ['lillipup', 'patrat', 'purrloin', 'pidove', 'tepig', 'oshawott', 'snivy', 'fennekin', 'chespin', 'froakie', 'rowlet', 'litten', 'popplio', 'grookey', 'scorbunny', 'sobble', 'sprigatito', 'fuecoco', 'quaxly'] },
		'School Kid Jack': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/schoolkid.png', dialog: "I studied all the type matchups — I've got this in the bag!", pool: ['magnemite', 'voltorb', 'exeggcute', 'oddish', 'drowzee', 'slowpoke', 'abra', 'natu', 'ralts', 'spoink', 'chingling', 'munna', 'elgyem'] },
		'Rich Boy Winston': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/richboy.png', dialog: "Money can buy the finest Pokémon — and they'll crush you!", pool: ['meowth', 'persian', 'growlithe', 'vulpix', 'eevee', 'snorunt', 'seel', 'snorlax', 'munchlax', 'indeedee'] },
		'Lady Sarah': { teamSize: 2, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lady.png', dialog: "Only the finest Pokémon for someone of my status!", pool: ['clefairy', 'snubbull', 'smoochum', 'togekiss', 'gardevoir', 'sylveon', 'comfey', 'alcremie'] },
	},
	'STANDARD_mid': {
		'Ace Trainer Chase': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainer.png', dialog: "I've trained relentlessly for this moment. Don't hold back!", pool: ['staraptor', 'luxray', 'gastrodon', 'rapidash', 'roselia', 'floatzel', 'lucario', 'garchomp', 'togekiss', 'gallade', 'magnezone', 'leafeon', 'glaceon', 'umbreon', 'espeon'] },
		'Black Belt Kenji': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blackbelt.png', dialog: "I have mastered the fighting arts. Your defeat is certain!", pool: ['machamp', 'hitmonlee', 'hitmonchan', 'primeape', 'poliwrath', 'hariyama', 'heracross', 'medicham', 'toxicroak', 'mienshao', 'pangoro', 'hawlucha', 'passimian', 'falinks', 'annihilape'] },
		'Scientist Albert': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/scientist.png', dialog: "According to my calculations, your probability of winning is negligible!", pool: ['magneton', 'porygon2', 'muk', 'weezing', 'electrode', 'raichu', 'starmie', 'kadabra', 'hypno', 'grimer', 'voltorb', 'beheeyem', 'magnezone', 'toxtricity', 'pawmot'] },
		'Swimmer Tina': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/swimmer.png', dialog: "I spend all day in the water — and so will you when I'm done!", pool: ['tentacruel', 'starmie', 'vaporeon', 'poliwrath', 'seaking', 'dewgong', 'kingler', 'corsola', 'lanturn', 'pelipper', 'floatzel', 'lumineon', 'simipour', 'barbaracle', 'wishiwashi', 'bruxish', 'araquanid'] },
		'Psychic Phoebe': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/psychic.png', dialog: "I already foresee your defeat. Shall we confirm it?", pool: ['kadabra', 'slowbro', 'hypno', 'jynx', 'exeggutor', 'xatu', 'espeon', 'girafarig', 'gardevoir', 'grumpig', 'claydol', 'chingling', 'gothitelle', 'reuniclus', 'meowstic', 'oranguru', 'hatterene', 'rabsca', 'farigiraf'] },
		'Pokémon Ranger Kyle': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/pokemonranger.png', dialog: "As a Ranger it's my duty to protect Pokémon — and to test challengers!", pool: ['arcanine', 'manectric', 'raichu', 'golem', 'steelix', 'mightyena', 'linoone', 'flygon', 'walrein', 'shiftry', 'camerupt', 'swellow', 'wailord', 'breloom', 'whiscash'] },
		'Cooltrainer Rex': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainer.png', dialog: "Only the coolest Trainers make it to this level. Prepare yourself!", pool: ['alakazam', 'gengar', 'machamp', 'golem', 'rhydon', 'clefable', 'kangaskhan', 'lapras', 'snorlax', 'tauros', 'starmie', 'exeggutor', 'dragonite', 'aerodactyl'] },
		'Cooltrainer Fran': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainerf.png', dialog: "Style and strength — I have both. Can you keep up?", pool: ['ninetales', 'wigglytuff', 'vileplume', 'parasect', 'poliwrath', 'slowbro', 'arcanine', 'rapidash', 'raichu', 'mrmime', 'jynx', 'electabuzz', 'magmar', 'scyther'] },
		'Beauty Nina': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/beauty.png', dialog: "My Pokémon are as beautiful as they are powerful!", pool: ['milotic', 'gardevoir', 'togekiss', 'ninetales', 'lopunny', 'delcatty', 'liligant', 'florges', 'sylveon', 'aromatisse', 'comfey', 'primarina', 'alcremie', 'dachsbun'] },
		'Gentleman Alfred': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/gentleman.png', dialog: "A battle with a refined Trainer such as myself is quite the privilege.", pool: ['persian', 'clefable', 'breloom', 'snorlax', 'dragonite', 'gardevoir', 'togekiss', 'umbreon', 'espeon', 'furfrou', 'meowstic', 'pyroar'] },
		'Dragon Tamer Drake': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/dragontamer.png', dialog: "Only a true Dragon Tamer can control beasts like mine — face them!", pool: ['dragonair', 'seadra', 'horsea', 'dratini', 'altaria', 'flygon', 'shelgon', 'vibrava', 'swablu', 'noibat', 'sliggoo', 'fraxure', 'zweilous'] },
		'Hex Maniac Celeste': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hexmaniac.png', dialog: "Hehehe... my spirits have been waiting for a soul like yours...", pool: ['misdreavus', 'shuppet', 'duskull', 'sableye', 'haunter', 'drifblim', 'spiritomb', 'cofagrigus', 'jellicent', 'litwick', 'lampent', 'pumpkaboo', 'phantump', 'mimikyu'] },
		'Guitarist Josh': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/guitarist.png', dialog: "Get ready to hear the loudest battle of your life!", pool: ['jigglypuff', 'loudred', 'exploud', 'whismur', 'electrode', 'magnemite', 'toxtricity', 'rillaboom', 'obstagoon', 'noivern'] },
		'Biker Rex': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/biker.png', dialog: "You picked the wrong biker to mess with, kid!", pool: ['weezing', 'koffing', 'grimer', 'muk', 'scyther', 'magmar', 'electabuzz', 'pinsir', 'hitmonchan', 'hitmonlee', 'machoke', 'jynx'] },
		'Sailor Cid': { teamSize: 3, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/sailor.png', dialog: "I've sailed every sea and battled every storm. You're nothing!", pool: ['poliwrath', 'machamp', 'dewgong', 'tentacruel', 'slowbro', 'seel', 'shellder', 'cloyster', 'lapras', 'kingler', 'seaking', 'gyarados'] },
	},
	'STANDARD_late': {
		'Veteran Harold': { teamSize: 5, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/veteran.png', dialog: "I've been battling since before you were born. Show some respect!", pool: ['snorlax', 'lapras', 'dragonite', 'arcanine', 'gyarados', 'aerodactyl', 'kangaskhan', 'tauros', 'starmie', 'exeggutor', 'slowbro', 'machamp', 'golem', 'alakazam', 'gengar'] },
		'Ace Trainer Lara': { teamSize: 5, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainerf.png', dialog: "I've dedicated everything to becoming the best. Let's see where you stand!", pool: ['garchomp', 'lucario', 'milotic', 'togekiss', 'roserade', 'gallade', 'electivire', 'magmortar', 'leafeon', 'glaceon', 'mamoswine', 'rhyperior', 'tangrowth', 'porygon-z', 'magnezone'] },
		'Dragon Tamer Lance (Fan)': { teamSize: 5, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/dragontamer.png', dialog: "The Lance of the Elite Four is my idol — and my dragons will match his!", pool: ['dragonite', 'salamence', 'flygon', 'haxorus', 'hydreigon', 'dragonair', 'altaria', 'goodra', 'kommo-o', 'dragapult', 'roaring-moon', 'iron-jugulis', 'cyclizar'] },
		'Pokémon Master Felix': {
			chance: 5, teamSize: 6, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainer.png', dialog: "To be a Pokémon Master means never losing. I intend to keep that record!", pool: ['metagross', 'tyranitar', 'salamence', 'garchomp', 'dragonite', 'hydreigon', 'goodra', 'kommo-o', 'dragapult', 'volcarona', 'toxapex', 'ferrothorn', 'clefable', 'heatran', 'landorus'] },
		'Socialite Elena': { teamSize: 5, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lady.png', dialog: "Darling, my Pokémon are as exquisite as my taste. Prepare to be overwhelmed!", pool: ['gardevoir', 'togekiss', 'sylveon', 'florges', 'primarina', 'ninetales', 'aromatisse', 'alcremie', 'dachsbun', 'hattrene', 'milotic', 'froslass', 'mismagius'] },
		'Pokémon Ranger Sophia': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/pokemonrangerf.png', dialog: "Rangers never back down from a challenge — especially to protect what we love!", pool: ['arcanine', 'steelix', 'flygon', 'talonflame', 'braviary', 'lycanroc', 'bewear', 'stufful', 'mudsdale', 'drampa', 'tsareena', 'lurantis', 'salazzle'] },
		'Battle Girl Maya': { teamSize: 4, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/battlegirl.png', dialog: "I train every day to push my limits. Come on, let's go!", pool: ['lucario', 'mienshao', 'hawlucha', 'medicham', 'toxicroak', 'conkeldurr', 'infernape', 'heracross', 'machamp', 'gallade', 'sirfetchd', 'falinks', 'annihilape'] },
		'Veteran Trainer Mina': { teamSize: 6, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/veteranf.png', dialog: "Decades of experience have made me formidable. Don't take me lightly!", pool: ['blissey', 'steelix', 'snorlax', 'lapras', 'dragonite', 'gyarados', 'clefable', 'kangaskhan', 'tauros', 'aerodactyl', 'arcanine', 'vaporeon', 'jolteon', 'flareon'] },
		'Pokémon Professor Elm': { teamSize: 5, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/elm.png', dialog: "My research on Pokémon breeding has led to some very powerful teams!", pool: ['ampharos', 'espeon', 'umbreon', 'steelix', 'feraligatr', 'meganium', 'typhlosion', 'azumarill', 'politoed', 'slowking', 'heracross', 'togekiss', 'blissey', 'scizor', 'kingdra'] },
		'Collector Warren': { teamSize: 6, spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/collector.png', dialog: "I've spent a fortune collecting rare Pokémon — let me show you my prized collection!", pool: ['kangaskhan', 'scyther', 'pinsir', 'tauros', 'lapras', 'snorlax', 'aerodactyl', 'heracross', 'miltank', 'shuckle', 'steelix', 'umbreon', 'espeon', 'blissey'] },
	},
};
