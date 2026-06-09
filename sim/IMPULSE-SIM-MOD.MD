# Impulse Server: Custom HP, Status & Base Stats Mod

Welcome to the Impulse Server! This server features a custom mechanics mod that allows Pokémon to optionally start battles with a specific HP percentage, a major status condition, and/or custom Base Stat (BST) percentage boosts.

This is perfect for creating custom scenarios, testing specific mechanics (like Guts or Blaze), or building unique challenge modes and Raid Bosses.

## How It Works

Because we use the official public Pokémon Showdown client (`play.pokemonshowdown.com`) to connect to our custom server, we have to bypass the client's strict teambuilder validation. If you try to type custom stats normally, your browser might delete it before it reaches our server!

To get around this, we use the **Nickname Hack**. You can encode your custom HP, Status conditions, and Stat Boosts directly into your Pokémon's nickname using special bracket tags. When the battle starts, our server intercepts these tags, applies the stats, and magically cleans up the nickname so your opponent never sees the brackets.

* (Note: Nicknames can now be up to 100 characters long to accommodate multiple tags!)*

- --

## TEAMBUILDER LIMIT WARNING
The standard "Nickname" box in the Showdown teambuilder limits you to 18 characters. **You cannot type long tags directly into the nickname box.**
To use multiple tags (like `[BST: 50,50,50,50,50] [HPX: 10]`), you **MUST** click the **"Import/Export"** button at the top of your team and paste your sets in as text!

- --

## Formatting Syntax

Add the following tags to your Pokémon's nickname in the Teambuilder:

| Tag | Description |
|---|---|
| `[H:XX]` | Sets starting HP %. Replace `XX` with a number between `0` and `100`. |
| `[S:xxx]` | Sets starting Status Condition. Replace `xxx` with a valid 3-letter code (see below). |
| `[BST: a,b,c,d,e]` | Increases Base Stats by a percentage. Formatted as `Atk, Def, SpA, SpD, Spe`. Example: `[BST: 10,0,-10,50,0]` increases Atk by 10%, lowers SpA by 10%, increases SpD by 50%, and leaves others untouched. |
| `[HPX: XX]` | Multiplies the Pokémon's calculated Max HP by this integer. Example: `[HPX: 10]` gives the Pokémon 10x normal HP. |

### Status Codes

| Code | Status |
|---|---|
| `brn` | Burn |
| `par` | Paralyze |
| `slp` | Sleep |
| `frz` | Freeze |
| `psn` | Poison |
| `tox` | Badly Poisoned |

> **Important:** To use these tags in the public teambuilder, you *must* use the Parentheses format so the client knows it's a nickname:
> ```
> Nickname [H:XX] [S:xxx] [BST: a,b,c,d,e] [HPX: XX] (Species) @ Item
> ```
> Alternatively, if you are importing a text file directly, you can use the standard export format by adding `HP: XX%`, `Status: xxx`, `BST: a, b, c, d, e` and `HPX: XX` on their own individual lines within the Pokémon's set.

- --

## Examples

### 1. Custom HP and Status (With a Nickname)

Name your Charizard "Smaug", start at 20% HP, and be Burned:

```text
Smaug [H:20] [S:brn] (Charizard) @ Heavy-Duty Boots
Ability: Blaze
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Flamethrower
- Air Slash
- Roost
- Defog

```

> In-battle result: Sent out as Smaug with 20% HP and the Burn status.

- --

### 2. Custom HP Only (No Nickname)

Start a standard Gholdengo at 1% HP without a custom nickname:

```text
Gholdengo [H:1] (Gholdengo) @ Choice Scarf
Ability: Good as Gold
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Make It Rain
- Shadow Ball
- Trick
- Recover

```

> In-battle result: Sent out as Gholdengo with 1% HP.

- --

### 3. Starting Fainted (0% HP)

A Pokémon at 0% HP starts the battle completely fainted. It will be pushed to the back of your party and cannot be selected as your active lead during Team Preview.

```text
Zamazenta [H:0] (Zamazenta) @ Leftovers
Ability: Dauntless Shield
EVs: 252 HP / 4 Def / 252 Spe
Jolly Nature
- Iron Defense
- Body Press
- Heavy Slam
- Roar

```

> In-battle result: Starts the battle fainted in your party.

- --

### 4. The Raid Boss (Custom Base Stats)

Give a standard Snorlax +50% Base Attack and Defense, making it a terrifying physical wall:

```text
Raid Boss [BST: 50,50,0,0,0] (Snorlax) @ Figy Berry
Ability: Gluttony
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Curse
- Body Slam
- Earthquake
- Rest

```

> In-battle result: Sent out as Raid Boss. Its Base Attack and Base Defense are increased by 50%. These boosts will seamlessly re-apply if the Pokémon transforms, Mega Evolves, or changes forms mid-battle!

- --

### 5. The Raid Boss (HPX)

```text
Raid Boss [HPX: 10] (Snorlax) @ Figy Berry
Ability: Gluttony
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Curse
- Body Slam
- Earthquake
- Rest

```

> in-battle result: If Snorlax normally has 500 HP, [HPX: 10] sets its Max HP to 5,000. If you combined it with [H: 50], it would start the battle at 2,500 HP!

- --

## Engine Features

This mod is fully integrated into the core battle engine:

* **Turn Zero Activation** — Abilities like Blaze or Guts will activate immediately on turn one based on your starting HP/Status.
* **Accurate Status Tracking** — Starting with `[S:tox]` begins the toxic counter at 0 and increments normally. Starting with `[S:slp]` randomizes sleep turns just like a mid-battle Hypnosis.
* **Dynamic Form Changes** — Custom BST percentages natively apply to Mega Evolutions, Primal Reversions, and other form changes automatically.
* **100% Optional** — Standard teams copy-pasted from Smogon work perfectly with 100% HP, no status, and unmodified base stats.

- --

## Known Limitations

* You cannot legitimately nickname a Pokémon `[H:50]`, `[S:brn]`, `[BST: 10,10,10,10,10]` or `[HPX: 10]` without triggering the hack — the server will always intercept those tags.
* **Volatile statuses** (Confusion, Taunt, Leech Seed, etc.) are **not supported**. Only the major status conditions listed above will work.
