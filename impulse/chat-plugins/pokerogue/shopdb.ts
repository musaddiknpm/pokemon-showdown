import { type ShopItem, type ItemRarityTier } from './items';
import { type PokeRogueState } from './types';

const getEvoItemWeight = (state: PokeRogueState) => Math.min(8, Math.max(1, Math.floor(state.floor / 15)));

const getDamagedCount = (state: PokeRogueState) => state.team.filter(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100).length;
const getFaintedCount = (state: PokeRogueState) => state.team.filter(m => (m.currentHp ?? 100) <= 0).length;
const getStatusCount = (state: PokeRogueState) => state.team.filter(m => m.status).length;

const getPotionWeight = (state: PokeRogueState) => state.floor > 50 ? 0 : Math.min(24, 12 + (getDamagedCount(state) * 4));
const getSuperPotionWeight = (state: PokeRogueState) => state.floor > 100 ? 0 : Math.min(24, 12 + (getDamagedCount(state) * 4));
const getReviveWeight = (state: PokeRogueState) => Math.min(16, 4 + (getFaintedCount(state) * 4));
const getFullHealWeight = (state: PokeRogueState) => Math.min(16, 8 + (getStatusCount(state) * 4));
const getFullRestoreWeight = (state: PokeRogueState) => {
	const needsHelpCount = state.team.filter(m => m.status || ((m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100)).length;
	return Math.min(16, 8 + (needsHelpCount * 4));
};

const X_ITEMS_DATA: [string, string, string, string, ItemRarityTier][] = [
	['xattack', "X Attack", "atk", "Raises Attack by 10% for 5 battles.", "Common"],
	['xdefense', "X Defense", "def", "Raises Defense by 10% for 5 battles.", "Common"],
	['xspatk', "X Sp. Atk", "spa", "Raises Sp. Atk by 10% for 5 battles.", "Common"],
	['xspdef', "X Sp. Def", "spd", "Raises Sp. Def by 10% for 5 battles.", "Common"],
	['xspeed', "X Speed", "spe", "Raises Speed by 10% for 5 battles.", "Common"],
];

const generatedXItems: Record<string, ShopItem> = {};
for (const [id, name, stat, desc, tier] of X_ITEMS_DATA) {
	generatedXItems[id] = {
		name, icon: name, type: "xItem", category: "Buffs",
		desc, moneyMultiplier: 1.0, tier, buffStat: stat, maxStack: 1,
		weight: 4, minWeight: 4, maxWeight: 4,
	};
}

const NATURES = [
	{ name: "Lonely", stat: "Atk Mint" }, { name: "Adamant", stat: "Atk Mint" }, { name: "Naughty", stat: "Atk Mint" }, { name: "Brave", stat: "Atk Mint" },
	{ name: "Bold", stat: "Def Mint" }, { name: "Impish", stat: "Def Mint" }, { name: "Lax", stat: "Def Mint" }, { name: "Relaxed", stat: "Def Mint" },
	{ name: "Modest", stat: "SpAtk Mint" }, { name: "Mild", stat: "SpAtk Mint" }, { name: "Rash", stat: "SpAtk Mint" }, { name: "Quiet", stat: "SpAtk Mint" },
	{ name: "Calm", stat: "SpDef Mint" }, { name: "Gentle", stat: "SpDef Mint" }, { name: "Careful", stat: "SpDef Mint" }, { name: "Sassy", stat: "SpDef Mint" },
	{ name: "Timid", stat: "Spe Mint" }, { name: "Hasty", stat: "Spe Mint" }, { name: "Jolly", stat: "Spe Mint" }, { name: "Naive", stat: "Spe Mint" },
	{ name: "Serious", stat: "Neutral Mint" },
];

const generatedMints: Record<string, ShopItem> = {};
for (const mint of NATURES) {
	const id = toID(mint.name + "Mint");
	generatedMints[id] = {
		name: `${mint.name} Mint`, icon: mint.stat, type: "mint", category: "Mints",
		desc: `Changes a Pokémon's stats to match the ${mint.name} nature.`,
		moneyMultiplier: 1.0, tier: "Ultra", weight: 4, minWeight: 0, maxWeight: 4,
	};
}

const MEGA_STONES = [
	"Abomasite", "Absolite", "Aerodactylite", "Aggronite", "Alakazite", "Altarianite",
	"Ampharosite", "Audinite", "Banettite", "Beedrillite", "Blastoisinite", "Blazikenite",
	"Cameruptite", "Charizardite X", "Charizardite Y", "Diancite", "Galladite", "Garchompite",
	"Gardevoirite", "Gengarite", "Glalitite", "Gyaradosite", "Heracronite", "Houndoominite",
	"Kangaskhanite", "Latiasite", "Latiosite", "Lopunnite", "Lucarionite", "Manectite",
	"Mawilite", "Medichamite", "Metagrossite", "Mewtwonite X", "Mewtwonite Y", "Pidgeotite",
	"Pinsirite", "Sablenite", "Salamencite", "Sceptilite", "Scizorite", "Sharpedonite",
	"Slowbronite", "Steelixite", "Swampertite", "Tyranitarite", "Venusaurite",
];

const generatedMegaStones: Record<string, ShopItem> = {};
for (const stone of MEGA_STONES) {
	const id = stone.toLowerCase().replace(/[^a-z0-9]/g, '');
	generatedMegaStones[id] = {
		name: stone, icon: stone, type: "megaStone", category: "Mega Stones",
		desc: `A mysterious stone that allows certain Pokémon to Mega Evolve.`,
		moneyMultiplier: 1.0, tier: "Rogue", weight: 4, minWeight: 4, maxWeight: 4,
	};
}

const VITAMINS_DATA: [string, string, string, string][] = [
	['hpup', 'HP Up', 'hp', 'HP'],
	['protein', 'Protein', 'atk', 'Attack'],
	['iron', 'Iron', 'def', 'Defense'],
	['calcium', 'Calcium', 'spa', 'Sp. Atk'],
	['zinc', 'Zinc', 'spd', 'Sp. Def'],
	['carbos', 'Carbos', 'spe', 'Speed'],
];

const generatedVitamins: Record<string, ShopItem> = {};
for (const [id, name, stat, statName] of VITAMINS_DATA) {
	generatedVitamins[id] = {
		name, icon: name, type: "vitamin", category: "Vitamins",
		desc: `Raises the ${statName} EVs of a Pokémon by 20. Max 252 per stat, 508 total.`,
		moneyMultiplier: 1.0, tier: "Ultra", evStat: stat, evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	};
}

const DESC_STONE = "A peculiar stone that can make certain species of Pokémon evolve.";
const DESC_APPLE = "A peculiar apple that can make certain species of Pokémon evolve.";
const DESC_TEAPOT = "A peculiar teapot that can make certain species of Pokémon evolve.";
const DESC_TEACUP = "A peculiar teacup that can make certain species of Pokémon evolve.";
const DESC_ARMOR = "A peculiar armor that can make certain species of Pokémon evolve.";
const DESC_SCROLL = "A peculiar scroll that can make certain species of Pokémon evolve.";
const DESC_SWEET = "A sweet that evolves certain Pokémon.";

const EVO_ITEMS_DATA: [string, string, string][] = [
	['linkingcord', "Linking Cord", "A string exuding a mysterious energy. Evolves certain Pokémon without trading."],
	['firestone', "Fire Stone", DESC_STONE], ['waterstone', "Water Stone", DESC_STONE],
	['thunderstone', "Thunder Stone", DESC_STONE], ['leafstone', "Leaf Stone", DESC_STONE],
	['moonstone', "Moon Stone", DESC_STONE], ['sunstone', "Sun Stone", DESC_STONE],
	['shinystone', "Shiny Stone", DESC_STONE], ['duskstone', "Dusk Stone", DESC_STONE],
	['dawnstone', "Dawn Stone", DESC_STONE], ['icestone', "Ice Stone", DESC_STONE],
	['ovalstone', "Oval Stone", DESC_STONE],
	['kingsrock', "King's Rock", "A rock that may make a Pokémon flinch. Evolves certain Pokémon."],
	['dragonscale', "Dragon Scale", "A very tough and inflexible scale. Evolves certain Pokémon."],
	['upgrade', "Up-Grade", "A transparent device filled with all sorts of data. Evolves certain Pokémon."],
	['dubiousdisc', "Dubious Disc", "A transparent device overflowing with dubious data. Evolves certain Pokémon."],
	['protector', "Protector", "A protective item of some sort. Evolves certain Pokémon."],
	['electirizer', "Electirizer", "A box packed with a tremendous amount of electric energy. Evolves certain Pokémon."],
	['magmarizer', "Magmarizer", "A box packed with a tremendous amount of magma energy. Evolves certain Pokémon."],
	['reapercloth', "Reaper Cloth", "A cloth imbued with horrifying spiritual energy. Evolves certain Pokémon."],
	['prismscale', "Prism Scale", "A mysterious scale that evolves certain Pokémon."],
	['whippeddream', "Whipped Dream", "A soft and sweet treat. Evolves certain Pokémon."],
	['sachet', "Sachet", "A sachet filled with fragrant perfumes. Evolves certain Pokémon."],
	['razorclaw', "Razor Claw", "A sharply hooked claw. Evolves certain Pokémon."],
	['razorfang', "Razor Fang", "A sharply hooked fang. Evolves certain Pokémon."],
	['sweetapple', "Sweet Apple", DESC_APPLE], ['tartapple', "Tart Apple", DESC_APPLE], ['syrupyapple', "Syrupy Apple", DESC_APPLE],
	['crackedpot', "Cracked Pot", DESC_TEAPOT], ['chippedpot', "Chipped Pot", DESC_TEAPOT],
	['unremarkableteacup', "Unremarkable Teacup", DESC_TEACUP], ['masterpieceteacup', "Masterpiece Teacup", DESC_TEACUP],
	['auspiciousarmor', "Auspicious Armor", DESC_ARMOR], ['maliciousarmor', "Malicious Armor", DESC_ARMOR],
	['scrollofdarkness', "Scroll of Darkness", DESC_SCROLL], ['scrollofwaters', "Scroll of Waters", DESC_SCROLL],
	['peatblock', "Peat Block", "A block of muddy material. Evolves certain Pokémon."],
	['blackaugurite', "Black Augurite", "A glossy black stone. Evolves certain Pokémon."],
	['galaricacuff', "Galarica Cuff", "A cuff made from woven Galarica Twigs. Evolves certain Pokémon."],
	['galaricawreath', "Galarica Wreath", "A wreath made from woven Galarica Twigs. Evolves certain Pokémon."],
	['leaderscrest', "Leader's Crest", "A shard of what appears to be an old crest. Evolves certain Pokémon."],
	['gimmighoulcoin', "Gimmighoul Coin", "A coin left behind by a Gimmighoul. Evolves certain Pokémon."],
	['metalalloy', "Metal Alloy", "A peculiar metal that can make certain species of Pokémon evolve."],
	['deepseascale', "Deep Sea Scale", "A scale that shines a pale pink. Evolves certain Pokémon."],
	['deepseatooth', "Deep Sea Tooth", "A fang that gleams a sharp silver. Evolves certain Pokémon."],
	['strawberrysweet', "Strawberry Sweet", DESC_SWEET], ['lovesweet', "Love Sweet", DESC_SWEET],
	['berrysweet', "Berry Sweet", DESC_SWEET], ['cloversweet', "Clover Sweet", DESC_SWEET],
	['flowersweet', "Flower Sweet", DESC_SWEET], ['starsweet', "Star Sweet", DESC_SWEET],
	['ribbonsweet', "Ribbon Sweet", DESC_SWEET],
];

const generatedEvoItems: Record<string, ShopItem> = {};
for (const [id, name, desc] of EVO_ITEMS_DATA) {
	generatedEvoItems[id] = {
		name, icon: name, type: "evolveItem", category: "Evolution Items",
		desc, moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	};
}

const STACKABLE_ITEMS_DATA: [string, string, string][] = [
	['silkscarf', "Silk Scarf", "Normal"], ['blackbelt', "Black Belt", "Fighting"],
	['sharpbeak', "Sharp Beak", "Flying"], ['poisonbarb', "Poison Barb", "Poison"],
	['softsand', "Soft Sand", "Ground"], ['hardstone', "Hard Stone", "Rock"],
	['silverpowder', "Silver Powder", "Bug"], ['spelltag', "Spell Tag", "Ghost"],
	['metalcoat', "Metal Coat", "Steel"], ['charcoal', "Charcoal", "Fire"],
	['mysticwater', "Mystic Water", "Water"], ['miracleseed', "Miracle Seed", "Grass"],
	['magnet', "Magnet", "Electric"], ['twistedspoon', "Twisted Spoon", "Psychic"],
	['nevermeltice', "Never-Melt Ice", "Ice"], ['dragonfang', "Dragon Fang", "Dragon"],
	['blackglasses', "Black Glasses", "Dark"], ['fairyfeather', "Fairy Feather", "Fairy"],
];

const generatedStackableItems: Record<string, ShopItem> = {};
for (const [id, name, type] of STACKABLE_ITEMS_DATA) {
	generatedStackableItems[id] = {
		name, icon: name, type: "stackableItem", category: "Held Items",
		desc: `Boosts the power of ${type}-type moves by 20%. Stacks additively.`,
		moneyMultiplier: 3.0, tier: "Ultra", maxStack: 99, weight: 4, minWeight: 4, maxWeight: 4,
	};
}

const HELD_ITEMS_DATA: [string, string, ItemRarityTier, number, number, string][] = [
	['sitrusberry', 'Sitrus Berry', 'Common', 4, 1.0, 'Restores 1/4 max HP when at 1/2 max HP or less. Single use.'],
	['lumberry', 'Lum Berry', 'Common', 4, 1.0, 'Cures any status condition. Single use.'],
	['oranberry', 'Oran Berry', 'Common', 4, 0.5, 'Restores 10 HP when at 1/2 max HP or less. Single use.'],
	['leppaberry', 'Leppa Berry', 'Common', 4, 1.0, 'Restores 10 PP to a depleted move. Single use.'],
	['rockyhelmet', 'Rocky Helmet', 'Great', 4, 2.0, 'If holder is hit by a contact move, the attacker loses 1/6 of its max HP.'],
	['focusband', 'Focus Band', 'Great', 4, 2.0, 'Holder has a 10% chance to survive an attack that would knock it out.'],
	['quickclaw', 'Quick Claw', 'Great', 4, 2.0, 'Holder has a 20% chance to move first in its priority bracket.'],
	['leftovers', 'Leftovers', 'Ultra', 4, 3.0, 'Restores 1/16 of max HP at the end of each turn.'],
	['blacksludge', 'Black Sludge', 'Ultra', 4, 3.0, 'Restores 1/16 max HP per turn if held by a Poison type; loses 1/8 if not.'],
	['shellbell', 'Shell Bell', 'Ultra', 4, 3.0, 'Restores HP equal to 1/8 of the damage dealt to an opponent.'],
	['scopelens', 'Scope Lens', 'Ultra', 4, 3.0, 'Increases the holder\'s critical hit ratio by 1 stage.'],
	['heavydutyboots', 'Heavy-Duty Boots', 'Ultra', 4, 3.0, 'Protects the holder from all entry hazards.'],
	['expertbelt', 'Expert Belt', 'Ultra', 4, 3.0, 'Super-effective attacks are 20% stronger.'],
	['muscleband', 'Muscle Band', 'Ultra', 4, 3.0, 'Physical attacks have 10% more power.'],
	['wiseglasses', 'Wise Glasses', 'Ultra', 4, 3.0, 'Special attacks have 10% more power.'],
	['lightclay', 'Light Clay', 'Ultra', 4, 3.0, 'Reflect and Light Screen last for 8 turns instead of 5.'],
	['whiteherb', 'White Herb', 'Ultra', 4, 3.0, 'Restores lowered stat stages to normal. Single use.'],
	['lifeorb', 'Life Orb', 'Rogue', 4, 5.0, 'Boosts move power by 30%, but holder takes 10% max HP damage each attack.'],
	['choiceband', 'Choice Band', 'Rogue', 4, 5.0, 'Boosts Attack by 50%, but locks the holder into the first move used.'],
	['choicespecs', 'Choice Specs', 'Rogue', 4, 5.0, 'Boosts Sp. Atk by 50%, but locks the holder into the first move used.'],
	['choicescarf', 'Choice Scarf', 'Rogue', 4, 5.0, 'Boosts Speed by 50%, but locks the holder into the first move used.'],
	['assaultvest', 'Assault Vest', 'Rogue', 4, 5.0, 'Boosts Sp. Def by 50%, but prevents the use of status moves.'],
	['focussash', 'Focus Sash', 'Rogue', 4, 5.0, 'Survives a fatal hit from full HP with 1 HP. Single use.'],
	['weaknesspolicy', 'Weakness Policy', 'Rogue', 4, 5.0, 'Attack and Sp. Atk sharply increase if hit by a super-effective move. Single use.'],
	['souldew', 'Soul Dew', 'Master', 2, 10.0, 'Boosts the power of Psychic and Dragon-type moves by 20% for Latias and Latios.'],
	['lightball', 'Light Ball', 'Master', 2, 10.0, 'Doubles the Attack and Sp. Atk of Pikachu.'],
	['thickclub', 'Thick Club', 'Master', 2, 10.0, 'Doubles the Attack of Cubone and Marowak.'],
	['redorb', 'Red Orb', 'Master', 2, 10.0, 'Triggers Primal Reversion for Groudon.'],
	['blueorb', 'Blue Orb', 'Master', 2, 10.0, 'Triggers Primal Reversion for Kyogre.'],
];

const generatedHeldItems: Record<string, ShopItem> = {};
for (const [id, name, tier, weight, moneyMult, desc] of HELD_ITEMS_DATA) {
	generatedHeldItems[id] = {
		name, icon: name, type: "item", category: "Held Items",
		desc, moneyMultiplier: moneyMult, tier, weight, minWeight: weight, maxWeight: weight,
	};
}

export const SHOP_DB: Record<string, ShopItem> = {
	...generatedMegaStones,
	...generatedMints,
	...generatedVitamins,
	...generatedEvoItems,
	...generatedStackableItems,
	...generatedHeldItems,
	...generatedXItems,

	megabracelet: {
		name: "Mega Bracelet", icon: "Mega Bracelet", type: "key", category: "Key Items",
		desc: "A cuff that enables Pokémon to Mega Evolve. Unlocks Mega Stones in the item pool.",
		moneyMultiplier: 0, tier: "Rogue", maxStack: 1, weight: 4, minWeight: 4, maxWeight: 4,
		weightFunc: state => {
			if ((state.keyItems?.['Mega Bracelet'] || 0) >= 1) return 0;
			if (state.floor <= 50) return 4;
			if (state.floor <= 100) return 8;
			if (state.floor <= 150) return 12;
			return 16;
		},
	},
	lockcapsule: {
		name: "Lock Capsule", icon: "Ability Capsule", type: "key", category: "Key Items",
		desc: "Allows you to lock shop items in place, preserving their rarity during rerolls.",
		moneyMultiplier: 0, tier: "Ultra", maxStack: 1, weight: 12, minWeight: 12, maxWeight: 12,
		weightFunc: state => {
			if ((state.keyItems?.['Lock Capsule'] || 0) >= 1) return 0;
			return 12;
		},
	},
	dynamaxband: {
		name: "Dynamax Band", icon: "Dynamax Band", type: "key", category: "Key Items",
		desc: "A glowing band that enables certain Pokémon to Gigantamax. Unlocks Max Mushrooms in the item pool.",
		moneyMultiplier: 0, tier: "Rogue", maxStack: 1, weight: 4, minWeight: 4, maxWeight: 4,
		weightFunc: state => {
			if ((state.keyItems?.['Dynamax Band'] || 0) >= 1) return 0;
			if (state.floor <= 50) return 4;
			if (state.floor <= 100) return 8;
			if (state.floor <= 150) return 12;
			return 16;
		},
	},
	maxmushroom: {
		name: "Max Mushroom", icon: "Max Mushroom", type: "gmaxMushroom", category: "Form Change",
		desc: "A peculiar mushroom that can make certain species of Pokémon Gigantamax.",
		moneyMultiplier: 1.0, tier: "Rogue", weight: 4, minWeight: 4, maxWeight: 4,
	},
	candyjar: {
		name: "Candy Jar", icon: "Candy Jar", type: "key", category: "Key Items",
		desc: "Increases the number of levels added by Rare Candy and Rarer Candy items by 1. Stacks up to 99 times.",
		moneyMultiplier: 2.0, tier: "Ultra", maxStack: 99, weight: 5, minWeight: 5, maxWeight: 5,
		weightFunc: state => (state.keyItems?.['Candy Jar'] || 0) >= 99 ? 0 : 5,
	},
	expall: {
		name: "Exp. All", icon: "Exp Share", type: "key", category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.",
		moneyMultiplier: 2.0, tier: "Ultra", maxStack: 5, weight: 4, minWeight: 0, maxWeight: 4,
		weightFunc: state => (state.keyItems?.['Exp. All'] || 0) >= 5 ? 0 : 4,
	},
	expcharm: {
		name: "Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.",
		moneyMultiplier: 1.5, tier: "Great", maxStack: 99, weight: 8, minWeight: 0, maxWeight: 8,
		weightFunc: state => (state.keyItems?.['Exp. Charm'] || 0) >= 99 ? 0 : 8,
	},
	superexpcharm: {
		name: "Super Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 60%. Stacks up to 30 times.",
		moneyMultiplier: 2.5, tier: "Ultra", maxStack: 30, weight: 8, minWeight: 8, maxWeight: 8,
		weightFunc: state => (state.keyItems?.['Super Exp. Charm'] || 0) >= 30 ? 0 : 8,
	},
	shinycharm: {
		name: "Shiny Charm", icon: "Shiny Charm", type: "key", category: "Key Items",
		desc: "Greatly increases the chance of finding Shiny Pokémon. (Max 4)",
		moneyMultiplier: 0, tier: "Master", maxStack: 4, weight: 2, minWeight: 2, maxWeight: 2,
		weightFunc: state => (state.keyItems?.['Shiny Charm'] || 0) >= 4 ? 0 : 2,
	},
	runawayorb: {
		name: "Runaway Orb", icon: "Smoke Ball", type: "key", category: "Key Items",
		desc: "Grants a 10% chance to automatically skip non-boss battles. Stacks up to 10 times for 100% chance.",
		moneyMultiplier: 2.0, tier: "Ultra", maxStack: 10, weight: 6, minWeight: 0, maxWeight: 6,
		weightFunc: state => (state.gameMode === 'endless' && (state.keyItems?.['Runaway Orb'] || 0) < 10) ? 6 : 0,
	},
	abilitycharm: {
		name: "Ability Charm", icon: "Ability Charm", type: "key", category: "Key Items",
		desc: "Increases the chance of wild Pokémon having their Hidden Ability. (Max 4)",
		moneyMultiplier: 0, tier: "Rogue", maxStack: 4, weight: 4, minWeight: 4, maxWeight: 4,
		weightFunc: state => (state.keyItems?.['Ability Charm'] || 0) >= 4 ? 0 : 4,
	},
	amuletcoin: {
		name: "Amulet Coin", icon: "Amulet Coin", type: "key", category: "Key Items",
		desc: "Increases the amount of money gained from battles by 20%. Stacks up to 5 times.",
		moneyMultiplier: 1.0, tier: "Great", maxStack: 5, weight: 4, minWeight: 0, maxWeight: 4,
		weightFunc: state => (state.keyItems?.['Amulet Coin'] || 0) >= 5 ? 0 : 4,
	},
	goldenball: {
		name: "Golden Ball", icon: "Relic Gold", type: "key", category: "Key Items",
		desc: "Increases the number of item choices in the reward draft by 1. Stacks up to 3 times.",
		moneyMultiplier: 0, tier: "Rogue", maxStack: 3, weight: 3, minWeight: 0, maxWeight: 3,
		weightFunc: state => (state.keyItems?.['Golden Ball'] || 0) >= 3 ? 0 : 3,
	},

	pokeball: {
		name: "Poke Ball", icon: "Poke Ball", type: "pokeball", category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.",
		moneyMultiplier: 0.2, tier: "Common", maxStack: 99, weight: 40, minWeight: 5, maxWeight: 40,
		weightFunc: state => Math.max(5, 40 - Math.floor(state.floor / 10)),
	},
	greatball: {
		name: "Great Ball", icon: "Great Ball", type: "pokeball", category: "Pokéballs",
		desc: "A good ball with a higher catch rate.",
		moneyMultiplier: 0.6, tier: "Great", maxStack: 99, weight: 30, minWeight: 5, maxWeight: 30,
		weightFunc: state => Math.max(5, 30 - Math.floor(state.floor / 15)),
	},
	ultraball: {
		name: "Ultra Ball", icon: "Ultra Ball", type: "pokeball", category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.",
		moneyMultiplier: 1.5, tier: "Rogue", maxStack: 99, weight: 20, minWeight: 5, maxWeight: 20,
		weightFunc: state => Math.min(40, 20 + Math.floor(state.floor / 10)),
	},
	masterball: {
		name: "Master Ball", icon: "Master Ball", type: "pokeball", category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.",
		moneyMultiplier: 10.0, tier: "Master", maxStack: 99, weight: 1, minWeight: 1, maxWeight: 1,
	},

	potion: {
		name: "Potion", icon: "Potion", type: "healHP", category: "Medicine", desc: "Restores 20 HP or 10% HP, whichever is higher.",
		moneyMultiplier: 0.2, tier: "Common", isShopItem: true, minFloor: 1, healAmount: 20, healPercent: 10,
		weight: 12, minWeight: 0, maxWeight: 24, weightFunc: getPotionWeight,
	},
	superpotion: {
		name: "Super Potion", icon: "Super Potion", type: "healHP", category: "Medicine", desc: "Restores 50 HP or 25% HP, whichever is higher.",
		moneyMultiplier: 0.45, tier: "Great", isShopItem: true, minFloor: 21, healAmount: 50, healPercent: 25,
		weight: 12, minWeight: 0, maxWeight: 24, weightFunc: getSuperPotionWeight,
	},
	hyperpotion: {
		name: "Hyper Potion", icon: "Hyper Potion", type: "healHP", category: "Medicine", desc: "Restores 200 HP or 50% HP, whichever is higher.",
		moneyMultiplier: 0.8, tier: "Ultra", isShopItem: true, minFloor: 81, healAmount: 200, healPercent: 50,
		weight: 12, minWeight: 0, maxWeight: 24, weightFunc: getPotionWeight,
	},
	maxpotion: {
		name: "Max Potion", icon: "Max Potion", type: "healHP", category: "Medicine", desc: "Restores 100% HP.",
		moneyMultiplier: 1.5, tier: "Rogue", isShopItem: true, minFloor: 111, isMax: true,
		weight: 12, minWeight: 0, maxWeight: 24, weightFunc: getPotionWeight,
	},
	revive: {
		name: "Revive", icon: "Revive", type: "revive", category: "Medicine", desc: "Revives one Pokémon and restores 50% HP.",
		moneyMultiplier: 2.0, tier: "Great", isShopItem: true, minFloor: 1, reviveAmount: 50,
		weight: 4, minWeight: 0, maxWeight: 16, weightFunc: getReviveWeight,
	},
	maxrevive: {
		name: "Max Revive", icon: "Max Revive", type: "revive", category: "Medicine", desc: "Revives one Pokémon and restores 100% HP.",
		moneyMultiplier: 2.75, tier: "Rogue", isShopItem: true, minFloor: 81, isMax: true,
		weight: 4, minWeight: 0, maxWeight: 16, weightFunc: getReviveWeight,
	},
	fullheal: {
		name: "Full Heal", icon: "Full Heal", type: "cureStatus", category: "Medicine", desc: "Heals any status ailment for one Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", isShopItem: true,
		weight: 8, minWeight: 0, maxWeight: 16, weightFunc: getFullHealWeight,
	},
	fullrestore: {
		name: "Full Restore", icon: "Full Restore", type: "healHP", category: "Medicine", desc: "Fully restores HP for one Pokémon and heals any status ailment.",
		moneyMultiplier: 2.25, tier: "Rogue", isShopItem: true, minFloor: 141, isMax: true, curesStatus: true,
		weight: 8, minWeight: 0, maxWeight: 16, weightFunc: getFullRestoreWeight,
	},
	sacredash: {
		name: "Sacred Ash", icon: "Sacred Ash", type: "itemPack", category: "Medicine", desc: "Revives all fainted Pokémon, fully restoring HP.",
		moneyMultiplier: 10.0, tier: "Master", isShopItem: true, minFloor: 171, weight: 1, minWeight: 0, maxWeight: 2,
	},
	memorymushroom: {
		name: "Memory Mushroom", icon: "Big Mushroom", type: "item", category: "Medicine", desc: "Recall one Pokémon's forgotten move.",
		moneyMultiplier: 4.0, tier: "Ultra", isShopItem: true, minFloor: 1, weight: 4, minWeight: 0, maxWeight: 8,
	},

	rarecandy: {
		name: "Rare Candy", icon: "Rare Candy", type: "rareCandy", category: "Level Up",
		desc: "Increases a Pokémon's level by 1. Bypasses the level cap. Stacks with Candy Jar.",
		moneyMultiplier: 1.0, tier: "Common", weight: 2, minWeight: 2, maxWeight: 2,
	},
	rarercandy: {
		name: "Rarer Candy", icon: "Rare Candy", type: "itemPack", category: "Level Up",
		desc: "Increases the entire party's level by 1. Bypasses the level cap. Stacks with Candy Jar.",
		moneyMultiplier: 3.0, tier: "Ultra", weight: 4, minWeight: 4, maxWeight: 4,
	},
	lure: {
		name: "Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 5 floors.",
		moneyMultiplier: 0, tier: "Great", weight: 3, minWeight: 3, maxWeight: 3,
	},
	superlure: {
		name: "Super Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 10 floors.",
		moneyMultiplier: 0, tier: "Ultra", weight: 3, minWeight: 3, maxWeight: 3,
	},
	maxlure: {
		name: "Max Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 25 floors.",
		moneyMultiplier: 0, tier: "Rogue", weight: 1, minWeight: 1, maxWeight: 1,
	},

	nugget: {
		name: "Nugget", icon: "Nugget", type: "itemPack", category: "Money",
		desc: "A nugget of purest gold. Gives a large amount of money.",
		moneyMultiplier: 5, tier: "Great", weight: 4, minWeight: 4, maxWeight: 4,
	},
	bignugget: {
		name: "Big Nugget", icon: "Big Nugget", type: "itemPack", category: "Money",
		desc: "A big nugget of purest gold. Gives a huge amount of money.",
		moneyMultiplier: 10, tier: "Ultra", weight: 4, minWeight: 4, maxWeight: 4,
	},
	relicgold: {
		name: "Relic Gold", icon: "Relic Gold", type: "itemPack", category: "Money",
		desc: "A gold coin used by an ancient civilization. Gives a massive amount of money.",
		moneyMultiplier: 20, tier: "Master", weight: 1, minWeight: 1, maxWeight: 1,
	},
};
