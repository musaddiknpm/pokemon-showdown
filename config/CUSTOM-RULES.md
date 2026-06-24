# Custom rules

Pokémon Showdown formats have a custom banlist syntax that allows format authors to describe what Pokémon, items, moves, and abilities are usable in their format.

## Basic syntax

Bans are just a `-` followed by the thing you want to ban.

`- item: Metronome` - ban an item with an ambiguous name

### Species group bans

`- OU` or `- DUU` - ban a tier

`- CAP` or `- Mega` or `- Gigantamax` - ban a pokemon category

`- Mythical` - ban all Mythical Pokémon (such as Mew, Celebi)

`- Restricted Legendary` - ban all Restricted Legendary Pokémon (such as Zekrom, Eternatus)

### Move group bans

`- Physical` - ban Physical moves

`- Special` - ban Special moves

`- Status` - ban Status moves

`- Contact` - ban contact moves

`- Sound` - ban sound moves

`- Powder` - ban powder moves

`- Fist` - ban moves that are boosted by Iron Fist

`- Pulse` - ban moves that are boosted by Mega Launcher

`- Bite` - ban moves that are boosted by Strong Jaw

`- Ballistic` - ban moves that are blocked by Bulletproof

`- Bypass Protect` - ban moves that bypass Protect, Detect, etc

`- Nonreflectable` - ban moves that bypass Magic Coat and Magic Bounce

`- Nonmirror` - ban moves that can't be copied by Mirror Move

`- Nonsnatchable` - ban moves that can't be copied by Snatch

`- Bypass Substitute` - ban moves that bypass Substitute

### Numeric bans

`- BST > 600` - ban all pokemon with BST above 600

`- HP > 250` - ban species with base HP (not actual max HP) above 250, i.e. Blissey

`- Base Power = 100` - ban all moves with base power exactly 100

`- Height >= 2` - ban all pokemon with height at least 2 meters

`- Weight < 5` - ban all pokemon with weight under 5 kg

### Generic group bans

`- LGPE` - ban things only available Let's Go Pikachu/Eevee

`- Past` - ban things that only appear in a past generation (such as Berserk Gene in Gen 5, spiky-eared Pichu in Gen 5, or Unown in Gen 8)

`- Future` - ban things that will appear in a future generation

`- Unobtainable` - ban all things that will never be obtainable (such as Florges-Eternal)

`- Unreleased` - ban all things that will probably be released eventually (Venusaur in Gen 8)

`- all items` - ban all items

`- no item` - force every pokemon to hold an item (ban empty item slots)
