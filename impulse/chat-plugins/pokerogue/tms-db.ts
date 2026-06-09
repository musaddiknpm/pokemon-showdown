import { type ShopItem, type ItemRarityTier } from './items';

const TM_CONFIGS = {
	Common: { mult: 0.5, weight: 40 },
	Great: { mult: 1.0, weight: 20 },
	Ultra: { mult: 2.0, weight: 10 },
};

function buildTM(name: string, typeName: string, desc: string, tier: ItemRarityTier): ShopItem {
	const cfg = TM_CONFIGS[tier as keyof typeof TM_CONFIGS];
	return {
		name, icon: `TM ${typeName}`, type: "tm", category: "TMs", desc,
		moneyMultiplier: cfg.mult, tier,
		weight: cfg.weight, minWeight: cfg.weight, maxWeight: cfg.weight,
	};
}

export const TMS_DB: Record<string, ShopItem> = {};

const COMMON_TMS: [string, string, string, string][] = [
	['tm_facade', "TM Facade", "Normal", "Power doubles if the user is poisoned, burned, or paralyzed."],
	['tm_will_o_wisp', "TM Will-O-Wisp", "Fire", "Shoots a sinister flame to inflict a burn."],
	['tm_chilling_water', "TM Chilling Water", "Water", "An attack that lowers the target's Attack."],
	['tm_thunder_wave', "TM Thunder Wave", "Electric", "A weak jolt of electricity that paralyzes the target."],
	['tm_trailblaze', "TM Trailblaze", "Grass", "An attack that also raises the user's Speed."],
	['tm_icy_wind', "TM Icy Wind", "Ice", "Attacks with cold air. Lowers opposing Pokémon's Speed."],
	['tm_bulk_up', "TM Bulk Up", "Fighting", "Raises the user's Attack and Defense stats."],
	['tm_toxic_spikes', "TM Toxic Spikes", "Poison", "Lays poison spikes to poison grounded foes switching in."],
	['tm_bulldoze', "TM Bulldoze", "Ground", "Stomps the ground to attack. Lowers Speed of hit targets."],
	['tm_roost', "TM Roost", "Flying", "Heals up to 50% of maximum HP."],
	['tm_agility', "TM Agility", "Psychic", "Sharply raises the user's Speed stat."],
	['tm_pounce', "TM Pounce", "Bug", "An attack that lowers the target's Speed."],
	['tm_stealth_rock', "TM Stealth Rock", "Rock", "Lays pointed stones that hurt switching-in foes."],
	['tm_hex', "TM Hex", "Ghost", "Power doubles if the target has a status condition."],
	['tm_dragon_dance', "TM Dragon Dance", "Dragon", "Raises the user's Attack and Speed stats."],
	['tm_taunt', "TM Taunt", "Dark", "Forces the target to use only attacking moves for three turns."],
	['tm_iron_defense', "TM Iron Defense", "Steel", "Sharply raises the user's Defense stat."],
	['tm_charm', "TM Charm", "Fairy", "Sharply lowers the target's Attack stat."],
];

const GREAT_TMS: [string, string, string, string][] = [
	['tm_return', "TM Return", "Normal", "Power increases with the user's friendship."],
	['tm_flamethrower', "TM Flamethrower", "Fire", "May burn the target."],
	['tm_scald', "TM Scald", "Water", "Shoots boiling water. May burn the target."],
	['tm_thunderbolt', "TM Thunderbolt", "Electric", "May paralyze the target."],
	['tm_giga_drain', "TM Giga Drain", "Grass", "Restores HP equal to half the damage dealt."],
	['tm_ice_beam', "TM Ice Beam", "Ice", "May freeze the target."],
	['tm_drain_punch', "TM Drain Punch", "Fighting", "Restores HP equal to half the damage dealt."],
	['tm_sludge_bomb', "TM Sludge Bomb", "Poison", "May poison the target."],
	['tm_earth_power', "TM Earth Power", "Ground", "May lower the target's Sp. Def stat."],
	['tm_acrobatics', "TM Acrobatics", "Flying", "Damage doubles if the user holds no item."],
	['tm_psychic', "TM Psychic", "Psychic", "May lower the target's Sp. Def stat."],
	['tm_leech_life', "TM Leech Life", "Bug", "Restores HP equal to half the damage dealt."],
	['tm_rock_slide', "TM Rock Slide", "Rock", "May make opposing Pokémon flinch."],
	['tm_phantom_force', "TM Phantom Force", "Ghost", "Vanishes on turn 1, strikes on turn 2. Breaks through Protect."],
	['tm_dragon_claw', "TM Dragon Claw", "Dragon", "Slashes the target with huge, sharp claws."],
	['tm_knock_off', "TM Knock Off", "Dark", "Removes target's item. Does more damage if target holds an item."],
	['tm_flash_cannon', "TM Flash Cannon", "Steel", "May lower the target's Sp. Def stat."],
	['tm_dazzling_gleam', "TM Dazzling Gleam", "Fairy", "Damages opposing Pokémon by emitting a powerful flash."],
];

const ULTRA_TMS: [string, string, string, string][] = [
	['tm_boomburst', "TM Boomburst", "Normal", "Attacks everything around it with a terrible, destructive sound."],
	['tm_flare_blitz', "TM Flare Blitz", "Fire", "High power. The user takes recoil. May burn the target."],
	['tm_fire_blast', "TM Fire Blast", "Fire", "A powerful fiery blast. May burn the target."],
	['tm_hydro_pump', "TM Hydro Pump", "Water", "A powerful watery blast."],
	['tm_thunder', "TM Thunder", "Electric", "A massive lightning bolt. May paralyze the target."],
	['tm_leaf_storm', "TM Leaf Storm", "Grass", "High power, but harshly lowers the user's Sp. Atk."],
	['tm_wood_hammer', "TM Wood Hammer", "Grass", "High power. The user takes serious recoil damage."],
	['tm_blizzard', "TM Blizzard", "Ice", "A howling blizzard. May freeze the target."],
	['tm_triple_axel', "TM Triple Axel", "Ice", "A three-kick attack that gains power with each hit."],
	['tm_close_combat', "TM Close Combat", "Fighting", "High power, but lowers the user's Defense and Sp. Def."],
	['tm_focus_blast', "TM Focus Blast", "Fighting", "A high-powered fighting attack. May lower Sp. Def."],
	['tm_gunk_shot', "TM Gunk Shot", "Poison", "Shoots filthy garbage. May poison the target."],
	['tm_earthquake', "TM Earthquake", "Ground", "A powerful earthquake that damages all surrounding Pokémon."],
	['tm_high_horsepower', "TM High Horsepower", "Ground", "Fiercely attacks the target using its entire body."],
	['tm_brave_bird', "TM Brave Bird", "Flying", "High power. The user takes serious recoil damage."],
	['tm_hurricane', "TM Hurricane", "Flying", "Wraps the foe in a fierce wind. May confuse the target."],
	['tm_psystrike', "TM Psystrike", "Psychic", "Strikes the target with a peculiar pulse. Damage calculated using target's Defense."],
	['tm_megahorn', "TM Megahorn", "Bug", "Using its tough horn, the user rams into the target."],
	['tm_stone_edge', "TM Stone Edge", "Rock", "High critical-hit ratio."],
	['tm_shadow_ball', "TM Shadow Ball", "Ghost", "Hurls a shadowy blob. May lower Sp. Def."],
	['tm_draco_meteor', "TM Draco Meteor", "Dragon", "High power, but harshly lowers the user's Sp. Atk."],
	['tm_outrage', "TM Outrage", "Dragon", "Rampages for 2-3 turns, then becomes confused."],
	['tm_foul_play', "TM Foul Play", "Dark", "Uses the target's Attack stat to calculate damage."],
	['tm_steel_beam', "TM Steel Beam", "Steel", "The user takes damage equal to half its maximum HP."],
	['tm_moonblast', "TM Moonblast", "Fairy", "Attacks with the power of the moon. May lower Sp. Atk."],
];
const TM_TIERS = [
	{ tier: "Common", tms: COMMON_TMS },
	{ tier: "Great", tms: GREAT_TMS },
	{ tier: "Ultra", tms: ULTRA_TMS },
] as const;

for (const { tier, tms } of TM_TIERS) {
	for (const [id, name, type, desc] of tms) {
		TMS_DB[id] = buildTM(name, type, desc, tier);
	}
}
