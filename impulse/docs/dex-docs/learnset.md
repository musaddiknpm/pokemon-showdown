# Working with Learnsets in the Dex API

If you're working with Pokémon learnsets in Pokémon Showdown, you'll be using the `Dex` API. This guide breaks down how learnsets are structured, how to extract exactly what you need, and the nuances of dealing with older generations.

## The Basics

The `Dex` API is split across a few core modules in the `sim/` directory. Since `Dex` acts as a global singleton in this environment, you won't usually need to import these files directly, but it helps to know where things live:

- **`sim/dex.ts`**: The main entry point for the `Dex` object.
- **`sim/dex-species.ts`**: Manages Pokémon species and learnset objects. Crucially, this is where `Dex.species.getFullLearnset()` lives, which handles traversing a Pokémon's evolutionary tree to gather all the moves it can inherit.
- **`sim/dex-moves.ts`**: Handles move data, which you'll use to convert raw IDs into formatted names via `Dex.moves.get(id)`.

## How Learnset Data is Structured

When you ask for a Pokémon's learnset using `Dex.species.getFullLearnset(pokemonId)`, you don't get a simple list of moves. Instead, you get an array of `Learnset` objects. 

Why an array? Because Pokémon inherit moves from their pre-evolutions. For example, Raichu's array will include its own learnset, plus Pikachu's, and Pichu's.

Inside each of these `Learnset` objects is a dictionary called `learnset`. The keys are move IDs, and the values are arrays of strings called "MoveSources" that tell you exactly how and when that move was learned.

### Decoding MoveSources

A MoveSource string looks something like `"9L1"`, `"8M"`, or `"3T"`. Here is how to read them:

1. **Generation:** The first character (1-9) tells you the generation.
2. **Method:** The second character tells you how the move was learned:
   - `L`: Level-up
   - `M`: TM/HM/TR
   - `T`: Tutor
   - `E`: Egg Move
   - `S`: Event
   - `V`: Virtual Console transfer
3. **Details:** Any extra characters give you more context. For level-up moves (`L`), this is the level the Pokémon learns the move.

---

## Extracting Moves (Examples)

Here are a few common ways you might want to extract level-up moves, depending on what you're trying to build.

### 1. Getting Every Historical Level-Up Move

If you want every level-up move a Pokémon has *ever* learned across all generations and pre-evolutions, you just need to loop through the sources and filter out duplicates. Using a `Set` is the easiest and most performant way to handle the deduplication.

```javascript
/**
 * Returns a sorted array of every unique level-up move a Pokémon has ever learned.
 */
function getUniqueLevelUpMoves(pokemonName) {
    const fullLearnsets = Dex.species.getFullLearnset(pokemonName);
    const levelUpMoveIds = new Set();

    for (const { learnset } of fullLearnsets) {
        if (!learnset) continue;
        
        for (const moveId in learnset) {
            const sources = learnset[moveId];
            
            // Check if any of the source strings start with a generation number followed by 'L'
            const isLevelUp = sources.some(source => source.charAt(1) === 'L');
            
            if (isLevelUp) {
                levelUpMoveIds.add(moveId);
            }
        }
    }

    return Array.from(levelUpMoveIds)
        .map(moveId => Dex.moves.get(moveId).name)
        .sort();
}
```

### 2. Auto-Fallback (Finding the Latest Generation)

Because the learnset database contains data from all generations, if a Pokémon isn't available in the current generation (like Patrat in Gen 8 and 9), it will still have its historical data (Gen 5, 6, and 7) intact.

If you specifically want the moves from the *latest generation the Pokémon was actually available in*, you can group the moves by generation and pick the highest one.

```javascript
/**
 * Returns level-up moves from the latest generation a Pokémon was available in.
 */
function getLatestLevelUpMoves(pokemonName) {
    const fullLearnsets = Dex.species.getFullLearnset(pokemonName);
    
    // Group move IDs by generation
    const levelUpMovesByGen = new Map();

    for (const { learnset } of fullLearnsets) {
        if (!learnset) continue;
        
        for (const moveId in learnset) {
            for (const source of learnset[moveId]) {
                if (source.charAt(1) === 'L') {
                    const gen = parseInt(source.charAt(0), 10);
                    
                    if (!levelUpMovesByGen.has(gen)) {
                        levelUpMovesByGen.set(gen, new Set());
                    }
                    levelUpMovesByGen.get(gen).add(moveId);
                }
            }
        }
    }

    if (levelUpMovesByGen.size === 0) return [];

    // Find the highest generation key
    const latestGen = Math.max(...levelUpMovesByGen.keys());

    return Array.from(levelUpMovesByGen.get(latestGen))
        .map(moveId => Dex.moves.get(moveId).name)
        .sort();
}
```

### 3. The Robust Approach: True Generation-Aware Fallback

While the previous example works for finding the highest generation of *available* moves, it still queries the default Gen 9 evolution tree (`Dex.species`). This can cause subtle bugs. If you query the Gen 9 tree for an older generation's moves, you might inadvertently pull in pre-evolutions that didn't exist yet!

To do this perfectly, you should find the valid generation first, and then explicitly tell the `Dex` API to load the format for that specific generation using `Dex.mod(...)`.

```javascript
/**
 * The most accurate way to retrieve level-up moves for a Pokémon using 
 * generation-aware auto-fallback. It automatically handles deduplication 
 * and correctly truncates invalid pre-evolutions.
 */
function getAccurateLatestLevelUpMoves(pokemonName, baseGen = 9) {
    const id = Dex.toID(pokemonName);
    
    // 1. Find the highest valid generation where the Pokémon actually exists
    let gen = baseGen;
    while (gen > 1) {
        // If a Pokémon is marked 'isNonstandard' (e.g., 'Past'), it's not in this gen
        if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) {
            gen--;
            continue;
        }
        break;
    }

    // 2. Query that specific generation's mod so the evolution tree is accurate
    const fullLearnsets = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
    
    // 3. Filter duplicates
    const uniqueMoves = new Set();

    for (const { learnset } of fullLearnsets) {
        if (!learnset) continue;
        
        for (const moveId in learnset) {
            // Minor optimization: Skip if we already found this move
            if (uniqueMoves.has(moveId)) continue;
            
            for (const source of learnset[moveId]) {
                // Check if it's a level-up move from our exact generation
                const match = /^(\d)L(\d+)$/.exec(source);
                if (match && parseInt(match[1]) === gen) {
                    uniqueMoves.add(moveId);
                    break;
                }
            }
        }
    }

    return Array.from(uniqueMoves)
        .map(moveId => Dex.moves.get(moveId).name)
        .sort();
}
```

---

## Under the Hood: How `Dex.mod()` Affects Learnsets

Normally, querying `Dex.species.getFullLearnset()` accesses the default, current-generation (Gen 9) definitions. However, if you're building something that relies on past generations, you should get into the habit of using `Dex.mod(generation).species.getFullLearnset(pokemonName)` (for example, `Dex.mod('gen3')`).

Here is why it matters:

While the underlying `learnset` dictionary (the raw list of move IDs and source strings) is actually a shared global object across all generations to save memory, the **hierarchy of pre-evolutions is strictly generation-aware**.

When Pokémon Showdown compiles a Pokémon's full learnset, it traverses its pre-evolutions. If a pre-evolution was introduced in a *later* generation than the mod you are querying, `Dex.mod()` will intelligently truncate the hierarchy to prevent you from inheriting invalid moves.

**Take Roselia in Gen 3 as an example:**
* Its pre-evolution, Budew, was introduced later in **Gen 4**.
* If you query the default `Dex.species.getFullLearnset('roselia')`, the API gives you an array containing both `[Roselia, Budew]`.
* But if you query `Dex.mod('gen3').species.getFullLearnset('roselia')`, the API knows Budew doesn't exist yet, and correctly returns just `[Roselia]`.

*(Fun fact: There is a hardcoded exception for Gen 2 pre-evolutions in Gen 1, like Pichu. The API intentionally allows you to traverse them in Gen 1 to support the old Time Capsule tradeback mechanic!)*
---

## Handling Forms, Regionals, and Megas

Pokémon is full of alternate forms, regional variants, and temporary transformations. Fortunately, `Dex.species.getFullLearnset()` handles almost all of this complexity automatically.

Here is how the API resolves different types of forms under the hood:

### 1. Forms Without Unique Learnsets
If an alternate form doesn't have a distinct movepool (like `Gastrodon-East` or `Ogerpon-Wellspring`), the API detects that the form lacks explicit learnset data. It immediately skips the alternate form and fetches the base species' learnset instead.
* `getFullLearnset('ogerponwellspring')` returns `['Ogerpon']`

### 2. Forms With Unique Learnsets
If an alternate form has a distinct movepool explicitly defined in the data (like `Rotom-Wash` getting Hydro Pump, or `Wormadam-Sandy` getting Earth Power), the API includes both the alternate form's learnset *and* inherits its base species' learnset.
* `getFullLearnset('rotomwash')` returns `['Rotom-Wash', 'Rotom']`
* `getFullLearnset('wormadamsandy')` returns `['Wormadam-Sandy', 'Burmy']`

### 3. Regional Base Forms
Regional base forms (like Galarian Meowth) are treated as completely distinct species. Their `prevo` chain is completely blank, meaning they do *not* inherit from their original counterparts.
* `getFullLearnset('meowthgalar')` returns `['Meowth-Galar']`

### 4. Regional Evolutions
When checking a regional evolution, the API simply follows the `prevo` chain defined in the database.
* `Perrserker` evolves from Galarian Meowth, so it inherits exclusively from that variant.
  * `getFullLearnset('perrserker')` returns `['Perrserker', 'Meowth-Galar']`
* `Raichu-Alola` evolves from a standard Pikachu (since there is no Alolan Pikachu), so it correctly inherits standard Pikachu moves!
  * `getFullLearnset('raichualola')` returns `['Raichu-Alola', 'Pikachu', 'Pichu']`

### 5. Mega Evolutions & Gigantamax Forms
Megas and Gmax/Dynamax forms are treated mechanically as strictly in-battle transformations; they do not learn unique moves or level up on their own. Because of this, they fall into the **"Forms Without Unique Learnsets"** category. If you query one, the API automatically strips the suffix and returns the learnset of its base form.
* `getFullLearnset('charizardmegax')` returns `['Charizard', 'Charmeleon', 'Charmander']`
* `getFullLearnset('pikachugmax')` returns `['Pikachu', 'Pichu']`

*(Note: Absolutely none of the Mega or Gmax forms in the Pokémon Showdown database have their own learnsets. The API handles them seamlessly, meaning your extraction code will work flawlessly even if you accidentally pass it `charizardmegay`!)*
