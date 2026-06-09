# Teams

Pokémon Showdown uses three team formats:

1. **Export format** - for humans to read/write
2. **JSON format** - for computers to read/write
3. **Packed format** - compressed, for sending/saving/logging

Teams sent over a text format, such as the console command `/utm` or the command-line `./pokemon-showdown validate-team`, will usually use packed format. In addition, backups will automatically switch to packed format if you have enough teams.

Variables storing teams inside PS's codebase will generally be stored in JSON format. Because we use TypeScript, this will be pretty obvious; the type will be `PokemonSet[]` (for JSON format) rather than `string` (for packed format).

Export format is basically only used by the client, to show users.

> **Impulse Mod Extensions:** This server features a custom mechanics mod that allows Pokémon to optionally start battles with a specific HP percentage, a major status condition, custom Base Stat (BST) percentage boosts, and HP multipliers (HPX). These custom properties are fully supported across all three team formats.

---

## Export Format

Export format looks like this:

```
Articuno @ Leftovers  
Ability: Pressure  
EVs: 252 HP / 252 SpA / 4 SpD  
Modest Nature  
IVs: 30 SpA / 30 SpD  
- Ice Beam  
- Hurricane  
- Substitute  
- Roost  

Ludicolo @ Life Orb  
Ability: Swift Swim  
EVs: 4 HP / 252 SpA / 252 Spe  
Modest Nature  
- Surf  
- Giga Drain  
- Ice Beam  
- Rain Dance  
```

**Custom Impulse Mod Sets:**
When utilizing the custom server mechanics, you can add `HP`, `Status`, `BST`, and `HPX` lines directly into the export format:

```
Raid Boss (Snorlax) @ Figy Berry
Ability: Gluttony
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
HP: 50%
Status: brn
BST: 50, 50, 0, 0, 0
HPX: 10
- Curse
- Body Slam
- Earthquake
- Rest
```

### The Nickname Hack

Because public clients strictly validate teambuilder inputs and strip out unrecognized lines, users connecting from `play.pokemonshowdown.com` must use the **Nickname Hack** to pass custom stats to the server. These are written as bracketed tags inside a nickname (which supports up to 100 characters).

During validation, the server intercepts these tags, applies the stats, and cleans up the nickname:

| Tag | Description |
|-----|-------------|
| `[H:XX]` | Starting HP percentage (0–100) |
| `[S:xxx]` | Starting status (e.g., `brn`, `par`, `slp`, `frz`, `psn`, `tox`) |
| `[BST: a,b,c,d,e]` | Percentage boosts for Atk, Def, SpA, SpD, Spe |
| `[HPX: XX]` | Max HP multiplier |

**Example:**

```
Raid Boss [H:50] [S:brn] [BST: 50,50,0,0,0] [HPX: 10] (Snorlax) @ Figy Berry
```

---

## JSON Format

JSON format looks like this:

```json
[
  {
    "name": "",
    "species": "Articuno",
    "gender": "",
    "item": "Leftovers",
    "ability": "Pressure",
    "evs": {"hp": 252, "atk": 0, "def": 0, "spa": 252, "spd": 4, "spe": 0},
    "nature": "Modest",
    "ivs": {"hp": 31, "atk": 31, "def": 31, "spa": 30, "spd": 30, "spe": 31},
    "moves": ["Ice Beam", "Hurricane", "Substitute", "Roost"]
  },
  {
    "name": "Raid Boss",
    "species": "Snorlax",
    "gender": "M",
    "item": "Figy Berry",
    "ability": "Gluttony",
    "evs": {"hp": 252, "atk": 0, "def": 252, "spa": 0, "spd": 4, "spe": 0},
    "nature": "Impish",
    "moves": ["Curse", "Body Slam", "Earthquake", "Rest"],
    "hp": 50,
    "status": "brn",
    "bstBoosts": {"atk": 50, "def": 50, "spa": 0, "spd": 0, "spe": 0},
    "hpMultiplier": 10
  }
]
```

---

## Packed Format

Packed format looks like this:

```
Articuno||leftovers|pressure|icebeam,hurricane,substitute,roost|Modest|252,,,252,4,||,,,30,30,|||]Ludicolo||lifeorb|swiftswim|surf,gigadrain,icebeam,raindance|Modest|4,,,252,,252|||||]Raid Boss|Snorlax|figyberry|gluttony|curse,bodyslam,earthquake,rest|Impish|252,,252,,4,|M||||,,,,,,50,brn,50:50:0:0:0,10
```

*(Line breaks added for readability — this is all one line normally.)*

The format is a list of Pokémon delimited by `]`, where every Pokémon is:

```
NICKNAME|SPECIES|ITEM|ABILITY|MOVES|NATURE|EVS|GENDER|IVS|SHINY|LEVEL|HAPPINESS,HIDDENPOWERTYPE,POKEBALL,GIGANTAMAX,DYNAMAXLEVEL,TERATYPE,HP,STATUS,BSTBOOSTS,HPMULTIPLIER
```

| Field | Notes |
|-------|-------|
| `SPECIES` | Left blank if identical to `NICKNAME` |
| `ABILITY` | `0`, `1`, or `H` for the ability from the corresponding slot; or an ability string for Hackmons etc. |
| `MOVES` | Comma-separated list of move IDs |
| `NATURE` | Left blank means Serious, except in Gen 1–2, where it means no Nature |
| `EVS` / `IVS` | Comma-separated in order: HP, Atk, Def, SpA, SpD, Spe. Blank EVs = 0, blank IVs = 31. If all are blank, commas can be omitted. |
| `EVS` | Represent AVs in Pokémon Let's Go and Stat Points in Pokémon Champions |
| `IVS` | Represent DVs in Gen 1–2 (divided by 2, rounded down; default 31 → 15 DVs). Post-hyper-training; pre-hyper-training IVs are in `HIDDENPOWERTYPE` |
| `SHINY` | `S` for shiny, blank for non-shiny |
| `LEVEL` | Left blank for level 100 |
| `HAPPINESS` | Left blank for 255 |
| `HIDDENPOWERTYPE` | Left blank if not Hyper Trained, if Hyper Training doesn't affect IVs, or if represented by a move |
| `POKEBALL` | Left blank for a regular Poké Ball |
| `GIGANTAMAX` | `G` for Gmax, blank otherwise |
| `DYNAMAXLEVEL` | Left blank for 10 |
| `TERATYPE` | Left blank to default to the Pokémon's first type |
| `HP` *(Impulse Mod)* | Left blank for 100% |
| `STATUS` *(Impulse Mod)* | Left blank for no status |
| `BSTBOOSTS` *(Impulse Mod)* | Formatted as `atk:def:spa:spd:spe`. Left blank if unmodified |
| `HPMULTIPLIER` *(Impulse Mod)* | Left blank for 1× |

> If all trailing comma-separated fields in the misc section are blank, the commas will be left off.

---

## Converting Between Formats

| Function | Description |
|----------|-------------|
| `Teams.unpack(packedTeam: string): PokemonSet[]` | Converts a packed team to a JSON team |
| `Teams.pack(team: PokemonSet[]): string` | Converts a JSON team to a packed team |
| `Teams.import(exportedTeam: string): PokemonSet[]` | Converts a team in any string format (JSON, exported, or packed) to a JSON team |
| `Teams.export(team: PokemonSet[]): string` | Converts a JSON team to an export team |
| `Teams.exportSet(set: PokemonSet): string` | Converts a JSON set to export format |

To convert from export to packed (or vice versa), round-trip through `PokemonSet`:

```js
Teams.export(Teams.unpack(packedTeam))
```

**Example:**

```js
const {Teams} = require('pokemon-showdown');

console.log(JSON.stringify(Teams.unpack(
  `Articuno||leftovers|pressure|icebeam,hurricane,substitute,roost|Modest|252,,,252,4,||,,,30,30,|||]Ludicolo||lifeorb|swiftswim|surf,gigadrain,icebeam,raindance|Modest|4,,,252,,252|||||]`
)));

// will log the team to console in JSON format
```

---

## Random Team Generator

```
Teams.generate(format: Format | string, options?: {seed: number[4]}): PokemonSet[]
```

Generates a team for a random format.

---

## Team Validator

The team validator is separate from the simulator.

In JavaScript, it's available directly as a function:

```js
const {Teams, TeamValidator} = require('pokemon-showdown');

const validator = new TeamValidator('gen6nu');

const output = validator.validateTeam(
  Teams.unpack(
    `Articuno||leftovers|pressure|icebeam,hurricane,substitute,roost|Modest|252,,,252,4,||,,,30,30,|||]Ludicolo||lifeorb|swiftswim|surf,gigadrain,icebeam,raindance|Modest|4,,,252,,252|||||]`
  )
);
```

`output` will be an array of problems if the team is not legal, or `null` if it is legal.

---

## Command-Line API

If you're not using JavaScript, all of these APIs (conversion, generating random teams, validating teams) are available via the command-line API: [COMMANDLINE.md](../COMMANDLINE.md).

They use standard IO, so any programming language supporting fork/exec should be able to call into them.
