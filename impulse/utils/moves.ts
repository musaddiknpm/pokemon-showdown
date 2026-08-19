import { Utils } from '../../lib';

export function canLearnTM(speciesId: string, moveId: string): boolean {
	let canLearn = false;
	let spData = Dex.species.get(speciesId);

	while (spData && !canLearn) {
		const learnsetData = Dex.species.getLearnsetData(spData.id)?.learnset;
		if (learnsetData?.[moveId]) canLearn = true;

		if (spData.prevo) {
			spData = Dex.species.get(spData.prevo);
		} else if (spData.baseSpecies && toID(spData.baseSpecies) !== spData.id) {
			spData = Dex.species.get(spData.baseSpecies);
		} else {
			break;
		}
	}
	return canLearn;
}

export function getAllLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const viableMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (viableMoves.has(move)) continue;
			for (const src of learnset[move]) {
				const match = /^(\d)L(\d+)$/.exec(src);
				if (match && parseInt(match[1]) === gen && parseInt(match[2]) <= level) {
					viableMoves.add(move);
					break;
				}
			}
		}
	}

	if (!viableMoves.size) return ['tackle'];
	return Array.from(viableMoves);
}

export function getLevelUpMoves(speciesId: string, level: number, genNumber = 9): string[] {
	return getAllLevelUpMoves(speciesId, level, genNumber).slice(-4);
}

export function getEggMoves(speciesId: string, genNumber = 9): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const eggMoves = new Set<string>();

	for (const learnsetIndex of fullLearn) {
		const learnset = learnsetIndex.learnset;
		if (!learnset) continue;
		for (const move in learnset) {
			if (eggMoves.has(move)) continue;
			for (const src of learnset[move]) {
				if (src.startsWith(`${gen}E`) || src.startsWith(`E`)) {
					eggMoves.add(move);
					break;
				}
			}
		}
	}
	return Array.from(eggMoves);
}

export function getMovesLearnedBetween(speciesId: string, oldLevel: number, newLevel: number, isEvolution = false, genNumber = 9, randomizeMoves = false): string[] {
	const id = toID(speciesId);
	let gen = genNumber;
	while (gen > 1) {
		if (Dex.mod(`gen${gen}`).species.get(id).isNonstandard) { gen--; continue; }
		break;
	}

	const fullLearn = Dex.mod(`gen${gen}`).species.getFullLearnset(id);
	const learned = new Set<string>();

	const regex = new RegExp(`^${gen}L(\\d+)$`);
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
}

