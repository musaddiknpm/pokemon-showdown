# PokeRogue Trainer Configuration Guide

This guide covers everything you need to know about creating, configuring, and scaling custom AI Trainers for PokeRogue game modes. All configurations revolve around the `TrainerData` and `TrainerMon` interfaces.

---

## 1. The Basic Trainer Structure

Every trainer is defined by assigning a `TrainerData` object to a specific lookup key (usually their name or a specific floor number) inside your mode's `trainers.ts` configuration.

```typescript
'Youngster Joey': {
    teamSize: 3,
    spriteUrl: 'https:
    dialog: "My Rattata is in the top percentage of Rattata!",
    pool: ['rattata', 'sentret', 'zigzagoon']
}
```

---

## 2. Core Trainer Properties

Here are the fundamental properties available on the `TrainerData` object:

- **`teamSize`** *(number, required)*: The maximum number of Pokémon the trainer will generate for battle.
- **`spriteUrl`** *(string, optional)*: An absolute URL to the trainer's battle sprite.
- **`dialog`** *(string, optional)*: Text the trainer says before the battle starts.
- **`chance`** *(number, optional)*: A metadata value representing the weight/probability of this trainer being selected. **Note:** The engine does *not* automatically process this. You must manually implement logic in your `resolveTrainer` function to respect this value!
- **`doubles`** *(boolean, optional)*: If `true`, this trainer triggers a Double Battle.
- **`biome`** *(string | string[], optional)*: Limits this trainer so they can only appear when the player is in the specified biome(s).
- **`random`** *(boolean, optional)*: If set to `true`, the engine completely ignores all pools and simply generates completely random Pokémon for the trainer based on the floor level.

---

## 3. Defining Pokémon Pools

When generating a trainer's team, the engine needs to know which Pokémon to pick. You can provide these options using `pool` and `slotPools`. Both accept strings (species names) or `TrainerMon` objects (detailed below).

### The Global `pool`
The `pool` property acts as the general grab-bag for the trainer's team. The system shuffles this array and draws randomly until the `teamSize` is met.

```typescript
pool: ['pidgey', 'rattata', 'zubat']
```
**️ Important Pool Size Rule:** The engine draws from the global pool *without replacement* (it does not pick the same index twice). If your `teamSize` is 6, but your `pool` only contains 3 Pokémon, the trainer will only spawn with 3 Pokémon! If you want duplicate species, you must list the species multiple times in the array.

### Slot-Specific Generation (`slotPools`)
If you want granular control over the team composition, use `slotPools`. This allows you to designate a specific pool of Pokémon for an exact team slot (1-indexed). 

```typescript
teamSize: 6,
pool: ['rattata', 'sentret', 'bidoof'], 
slotPools: {
    1: ['pikachu', 'eevee'],                     
    2: ['charmander', 'bulbasaur', 'squirtle'],  
    3: ['pidgey', 'starly', 'taillow'],          
}
```

**How it resolves:** 
The engine loops through slots `1` to `teamSize`. If `slotPools[i]` exists, it draws from there. If not, it falls back to pulling unique picks from the global `pool`.

---

## 4. Forcing Competitive Stats (`TrainerMon` Objects)

Instead of passing simple species strings, you can pass a `TrainerMon` object. This allows you to explicitly enforce Items, IVs, EVs, Abilities, Natures, Genders, and Shininess.

```typescript
{
    species: 'snorlax',
    item: 'leftovers',
    ability: 'thickfat',
    nature: 'Adamant',
    gender: 'M',
    shiny: true,
    teraType: 'Normal',
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    moves: ['bodyslam', 'earthquake', 'crunch', 'rest']
}
```

### ️ Important Note About `.moves`
If you explicitly define `.moves`, the Pokémon will **always** have those moves, even if it levels up or evolves on a high floor. If you do **not** define `.moves`, the engine will dynamically auto-generate the best possible moveset appropriate for its current level!

###  Magic Ability Strings
Since your pools might have randomized species (e.g. `['bulbasaur', 'charmander']`), you might want to enforce a Hidden Ability without knowing which species gets picked. 

You can use **Magic Strings** in the `ability` field:
- `ability: 'Hidden'` (Forces the Pokémon's Hidden Ability)
- `ability: '0'` (Forces the primary standard ability)
- `ability: '1'` (Forces the secondary standard ability)

*(If the chosen species doesn't have the specified slot, it gracefully falls back to ability `'0'`.)*

---

## 5. Cross-Encounter Memory (`memoryId`)

You can create recurring characters (like Rivals) whose starter choices are actively remembered across multiple encounters! 

By simply adding a `memoryId` string to a trainer, the engine will secretly track the species generated for them and force those exact same species to reappear in future battles sharing the same `memoryId`.

### The Memory Scaling Logic
When the engine saves a Pokémon to memory, **it strips away all moves and custom configurations**, saving only the raw base species (e.g., `"squirtle"`). 

*(Note: Memory is strictly tied to the player's current run. If the player loses and starts a new run, the memory is completely wiped and the Rival will generate a completely new random starter from the pool.)*

Because only the raw string is recalled in future battles, the engine automatically passes it back through `applyBossEvolutions` and scales its IVs, EVs, Items, and Moves natively based on the new, higher floor level.

### Overriding Recalled Memory (Injecting Competitive Stats)
If you want to inject custom competitive stats (like perfect IVs and a Leftovers) into a recalled Pokémon during a late-game encounter, simply define a `TrainerMon` in `slotPools` for that memory slot!

```typescript

rival3: {
    teamSize: 6,
    memoryId: "rivalTeam", 
    slotPools: {
        
        
        1: [
            { 
                species: 'any', 
                item: 'Leftovers', 
                ability: 'Hidden',
                ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } 
            }
        ]
    }
}
```

---

## 7. Enabling Trainers in a Game Mode

For trainers to actually spawn in a custom game mode, you must explicitly enable them and define the logic for when they appear. This requires updating your mode's `ModeConfig` and `ModeData` files.

### Step 1: Update `ModeConfig`
In your `config.ts` or `mode-config.ts`, you must set `hasTrainers: true`.

```typescript
export const MY_MODE_CONFIG: ModeConfig = {
    name: 'My Custom Mode',
    hasTrainers: true, 
    
};
```

### Step 2: Implement `resolveTrainer` in `ModeData`
In your `data.ts`, you must provide the actual `trainers` object (where you defined the data) and implement the `resolveTrainer` function. This function runs at the start of every floor. If it returns an object, a trainer battle starts; if it returns `null`, a wild battle occurs.

```typescript
import { type ModeData } from '../../types';
import { MY_TRAINERS } from './trainers';

export const MY_MODE_DATA: ModeData = {
    trainers: MY_TRAINERS, 

    resolveTrainer(floor, state, config) {
        
        if (floor === 5 || floor === 25 || floor === 55) {
            return {
                key: 'rivalEncounter', 
                name: `Rival Battle ${floor}`, 
            };
        }

        
        const isBossFloor = floor % config.bossInterval === 0;
        if (!isBossFloor && Math.random() < 0.1) {
            
            const validTrainers = Object.keys(MY_TRAINERS['standard']).filter(t => {
                const tr = MY_TRAINERS['standard'][t];
                if (!tr.biome) return true;
                if (Array.isArray(tr.biome)) return tr.biome.includes(state.currentBiome!);
                return tr.biome === state.currentBiome;
            });

            if (validTrainers.length > 0) {
                
                return {
                    key: 'standard',
                    name: validTrainers[Math.floor(Math.random() * validTrainers.length)],
                };
            }
        }

        
        return null;
    },

    
};
```

---

## 8. Complete Examples

### Example A: The Gym Leader (With an Ace)
```typescript
'Gym Leader Brock': {
    teamSize: 3,
    dialog: "I believe in rock hard defense!",
    pool: ['geodude', 'rhyhorn', 'sudowoodo'],
    slotPools: {
        3: [
            { species: 'onix', item: 'sitrusberry', ability: 'sturdy', ivs: { hp: 31, def: 31 } }
        ] 
    }
}
```

### Example B: The Multi-Encounter Rival
```typescript

'Rival Battle 1': {
    teamSize: 2,
    memoryId: 'playerRival',
    slotPools: {
        1: ['bulbasaur', 'charmander', 'squirtle'], 
        2: ['pidgey', 'starly'] 
    }
}


'Rival Battle 2': {
    teamSize: 4,
    memoryId: 'playerRival', 
    pool: ['pikachu', 'growlithe', 'magikarp', 'abra'], 
    slotPools: {
        1: [
            { species: 'any', item: 'sitrusberry', ability: 'Hidden' } 
        ] 
    }
}
```
