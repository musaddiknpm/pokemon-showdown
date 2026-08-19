const fs = require('fs');
const file = 'impulse/chat-plugins/pokerogue/pokemon.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace getAllLevelUpMoves
code = code.replace(
/export function getAllLevelUpMoves\([\s\S]*?return viableMoves;\n\}/,
`export function getAllLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	const id = toID(speciesId);
	const gen = getValidGeneration(id, genNumber);

	const fullLearn = Dex.mod(\`gen\${gen}\`).species.getFullLearnset(id);
	const viableMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (viableMoves.has(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\\d)L(\\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= level) {
					viableMoves.add(move);
					break;
				}
			}
		}
	}

	if (!viableMoves.size) return ['tackle'];
	return Array.from(viableMoves);
}`
);

// Replace getEggMoves
code = code.replace(
/export function getEggMoves\([\s\S]*?return eggMoves;\n\}/,
`export function getEggMoves(speciesId: string, genNumber = 9): string[] {
	const id = toID(speciesId);
	const gen = getValidGeneration(id, genNumber);

	const fullLearn = Dex.mod(\`gen\${gen}\`).species.getFullLearnset(id);
	const eggMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (eggMoves.has(move)) continue;
			for (const src of learnset[move]) {
				if (src.startsWith(\`\${gen}E\`) || src.startsWith(\`E\`)) {
					eggMoves.add(move);
					break;
				}
			}
		}
	}
	return Array.from(eggMoves);
}`
);

// Replace getMovesLearnedBetween
code = code.replace(
/export function getMovesLearnedBetween\([\s\S]*?return uniqueLearned;\n\}/,
`export function getMovesLearnedBetween(speciesId: string, oldLevel: number, newLevel: number, isEvolution = false, genNumber = 9, randomizeMoves = false): string[] {
	const id = toID(speciesId);
	const gen = getValidGeneration(id, genNumber);

	const fullLearn = Dex.mod(\`gen\${gen}\`).species.getFullLearnset(id);
	let learned = new Set<string>();

	const regex = new RegExp(\`^\${gen}L(\\\\d+)$\`);
	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const [moveid, sources] of Object.entries(learnset)) {
			if (learned.has(moveid)) continue;
			for (const src of sources as string[]) {
				const match = regex.exec(src);
				if (match) {
					const learnLvl = parseInt(match[1]);
					if (learnLvl > oldLevel && learnLvl <= newLevel) learned.add(moveid);
					else if (isEvolution && learnLvl === 0) learned.add(moveid);
					break;
				}
			}
		}
	}

	let uniqueLearned = Array.from(learned);

	if (randomizeMoves) {
		const allMoves = Dex.moves.all().filter(m => !m.isNonstandard && !m.isZ && !m.isMax && m.id !== 'struggle');
		const randomMoves = new Set<string>();
		while (randomMoves.size < uniqueLearned.length) {
			randomMoves.add(Utils.randomElement(allMoves).id);
		}
		uniqueLearned = Array.from(randomMoves);
	}

	return uniqueLearned;
}`
);

// Replace collectViableMoves
code = code.replace(
/function collectViableMoves\([\s\S]*?return viableMoves\.length \? viableMoves : \['tackle'\];\n\}/,
`function collectViableMoves(speciesId: string, chosenLevel: number, genNumber: number, floor: number): string[] {
	const id = toID(speciesId);
	const gen = getValidGeneration(id, genNumber);
	const fullLearn = Dex.mod(\`gen\${gen}\`).species.getFullLearnset(id);
	const viableMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (viableMoves.has(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\\d)L(\\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= chosenLevel) {
					viableMoves.add(move);
					break;
				}
			}
		}
	}

	if (floor > 100) {
		for (const learnsetIndex of fullLearn) {
			const learnset = learnsetIndex.learnset;
			if (!learnset) continue;
			for (const move in learnset) {
				if (!viableMoves.has(move) && (learnset[move] as string[]).some((src: string) => src.startsWith(\`\${gen}E\`))) {
					viableMoves.add(move);
				}
			}
		}
	}

	return viableMoves.size ? Array.from(viableMoves) : ['tackle'];
}`
);

fs.writeFileSync(file, code);
