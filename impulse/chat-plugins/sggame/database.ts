import { PG } from '../../pg';
import { type SGGameState, type UserSaveData, type GlobalStatEntry, type GameMode } from './types';

let initPromise: Promise<boolean> | null = null;

export const initDB = async (): Promise<boolean> => {
	if (!initPromise) {
		initPromise = PG.safeInit('SGGame', `
				CREATE TABLE IF NOT EXISTS sggame_user_profiles (
					userid TEXT PRIMARY KEY,
					"displayName" TEXT NOT NULL,
					"activeMode" TEXT NOT NULL,
					"shiniesUnlocked" INTEGER DEFAULT 0
				);
				CREATE TABLE IF NOT EXISTS sggame_runs (
					userid TEXT NOT NULL,
					"gameMode" TEXT NOT NULL,
					state TEXT NOT NULL,
					PRIMARY KEY (userid, "gameMode")
				);
				CREATE TABLE IF NOT EXISTS sggame_save_slots (
					userid TEXT NOT NULL,
					slot INTEGER NOT NULL,
					state TEXT NOT NULL,
					PRIMARY KEY (userid, slot)
				);
				CREATE TABLE IF NOT EXISTS sggame_stats (
					userid TEXT NOT NULL,
					"gameMode" TEXT NOT NULL,
					"highestFloor" INTEGER NOT NULL,
					"activeFloor" INTEGER NOT NULL,
					wins INTEGER NOT NULL,
					"recordTeam" TEXT NOT NULL,
					PRIMARY KEY (userid, "gameMode")
				);
				CREATE TABLE IF NOT EXISTS sggame_starters (
					userid TEXT NOT NULL,
					species TEXT NOT NULL,
					"unlockedNatures" TEXT NOT NULL,
					"unlockedAbilities" TEXT NOT NULL,
					"unlockedTeraTypes" TEXT NOT NULL,
					"selectedNature" TEXT NOT NULL,
					"selectedAbility" TEXT NOT NULL,
					"selectedTeraType" TEXT NOT NULL,
					shiny INTEGER NOT NULL,
					PRIMARY KEY (userid, species)
				);
				CREATE TABLE IF NOT EXISTS sggame_global_stats (
					id TEXT PRIMARY KEY,
					data TEXT NOT NULL
				);
			`);
	}
	return initPromise;
};

const getProfileTable = () => PG.getTable<any>('sggame_user_profiles', 'userid');
const getRunsTable = () => PG.getTable<any>('sggame_runs');
const getSaveSlotsTable = () => PG.getTable<any>('sggame_save_slots');
const getStatsTable = () => PG.getTable<any>('sggame_stats');
const getStartersTable = () => PG.getTable<any>('sggame_starters');
const getGlobalStatsTable = () => PG.getTable<any>('sggame_global_stats', 'id');

export let globalStats: Record<string, GlobalStatEntry> = (global as any).SGGameGlobalStats || {};
(global as any).SGGameGlobalStats = globalStats;
export const userCache: Record<string, UserSaveData> = (global as any).SGGameUserCache || {};
(global as any).SGGameUserCache = userCache;
const userSaveQueue: Map<string, Promise<void>> = (global as any).SGGameUserSaveQueue || new Map<string, Promise<void>>();
(global as any).SGGameUserSaveQueue = userSaveQueue;
const lastSavedState: Map<string, { starters: string, stats: string, saveSlots: string }> = (global as any).SGGameLastSavedState || new Map();
(global as any).SGGameLastSavedState = lastSavedState;

const userActivity: Map<string, number> = (global as any).SGGameUserActivity || new Map<string, number>();
(global as any).SGGameUserActivity = userActivity;
if ((global as any).SGGameCleanupInterval) clearInterval((global as any).SGGameCleanupInterval);
const cleanupInterval = setInterval(() => {
	(global as any).SGGameCleanupInterval = cleanupInterval;
	const now = Date.now();
	for (const [userid, lastActive] of userActivity.entries()) {
		if (now - lastActive > 30 * 60 * 1000) {
			if (userCache[userid]) {
				saveUserData(userid);
			}
			delete userCache[userid];
			userActivity.delete(userid);
			lastSavedState.delete(userid);
		}
	}
}, 5 * 60 * 1000);

export const destroy = async () => {
	clearInterval(cleanupInterval);
	await saveAllData();
};

let globalDataLoaded = false;

export function loadGlobalData() {
	if (globalDataLoaded) return Promise.resolve();
	return (async () => {
		await initDB();

		try {
			await PG.query(`ALTER TABLE sggame_user_profiles ADD COLUMN IF NOT EXISTS "shiniesUnlocked" INTEGER DEFAULT 0;`);
		} catch {}

		const globalRow = await getGlobalStatsTable().findById('stats');
		if (globalRow) {
			globalStats = JSON.parse(globalRow.data as string);
		} else {
			globalStats = {};
		}
		globalDataLoaded = true;
	})();
}

export function loadUser(userid: string): Promise<void> {
	userActivity.set(userid, Date.now());
	if (userCache[userid]) return Promise.resolve();

	return (async () => {
		if (userSaveQueue.has(userid)) {
			await userSaveQueue.get(userid);
			if (userCache[userid]) return;
		}

		await initDB();

		let userData: UserSaveData | undefined;

		const profileRow = await getProfileTable().findById(userid);
		if (profileRow) {
			userData = {
				displayName: profileRow.displayName as string,
				activeMode: profileRow.activeMode as GameMode,
				shiniesUnlocked: Number(profileRow.shiniesUnlocked) || 0,
				starters: {}, runs: {}, saveSlots: {}, stats: {},
			};

			const statRows = await getStatsTable().select({ userid });
			for (const row of statRows) {
				userData.stats![row.gameMode as GameMode] = {
					highestFloor: Number(row.highestFloor),
					activeFloor: Number(row.activeFloor),
					wins: Number(row.wins),
					recordTeam: JSON.parse(row.recordTeam as string),
				};
			}

			const runRows = await getRunsTable().select({ userid });
			for (const row of runRows) {
				userData.runs[row.gameMode as GameMode] = JSON.parse(row.state as string);
			}

			const slotRows = await getSaveSlotsTable().select({ userid });
			for (const row of slotRows) {
				userData.saveSlots[Number(row.slot)] = JSON.parse(row.state as string);
			}

			const starterRows = await getStartersTable().select({ userid });
			for (const row of starterRows) {
				userData.starters[row.species as string] = {
					species: row.species as string, level: 5, exp: 0, moves: [],
					unlockedNatures: JSON.parse(row.unlockedNatures as string),
					unlockedAbilities: JSON.parse(row.unlockedAbilities as string),
					unlockedTeraTypes: JSON.parse(row.unlockedTeraTypes as string),
					selectedNature: row.selectedNature as string,
					selectedAbility: row.selectedAbility as string,
					selectedTeraType: row.selectedTeraType as string,
					shiny: !!row.shiny,
				};
			}
		} else {
			userData = {
				displayName: userid, activeMode: 'classic',
				shiniesUnlocked: 0,
				starters: {}, runs: {}, saveSlots: {}, stats: {},
			};
		}
		Object.assign(userCache, { [userid]: userData });
	})();
}

export function saveGlobalStats(): Promise<void> | void {
	if (!globalDataLoaded) return;
	return getGlobalStatsTable().upsert({ id: 'stats', data: JSON.stringify(globalStats) }, ['id']).then(() => {});
}

export function getUserData(userid: string): UserSaveData {
	userActivity.set(userid, Date.now());
	if (!userCache[userid]) {
		throw new Error("Your data is not loaded. Please use a command first.");
	}
	if (!userCache[userid].stats) userCache[userid].stats = {};
	return userCache[userid];
}

export function saveUserData(userid: string): void {
	if (!userCache[userid]) return;
	userActivity.set(userid, Date.now());

	const u = userCache[userid];

	const displayName = u.displayName || userid;
	const activeMode = u.activeMode || 'classic';

	const runsStrMap: Record<string, string> = {};
	for (const mode in u.runs) runsStrMap[mode] = JSON.stringify(u.runs[mode]);

	const startersStr = JSON.stringify(u.starters || {});
	const statsStr = JSON.stringify(u.stats || {});
	const slotsStr = JSON.stringify(u.saveSlots || {});

	const statsMap: Record<string, any> = {};
	if (u.stats) {
		for (const mode in u.stats) statsMap[mode] = { ...u.stats[mode] };
	}

	const startersMap: Record<string, any> = {};
	if (u.starters) {
		for (const species in u.starters) startersMap[species] = { ...u.starters[species] };
	}

	const saveSlotsMap: Record<string, any> = {};
	if (u.saveSlots) {
		for (const slot in u.saveSlots) saveSlotsMap[slot] = u.saveSlots[slot];
	}


	const doSave = async () => {
		await initDB();
		let lastSaved = lastSavedState.get(userid);
		if (!lastSaved) lastSaved = { starters: '', stats: '', saveSlots: '' };

		await getProfileTable().upsert({
			userid,
			displayName,
			activeMode,
			shiniesUnlocked: u.shiniesUnlocked || 0,
		}, ['userid']);

		for (const mode in runsStrMap) {
			await getRunsTable().upsert({
				userid,
				gameMode: mode,
				state: runsStrMap[mode],
			}, ['userid', 'gameMode']);
		}

		const activeModes = Object.keys(runsStrMap);
		if (activeModes.length > 0) {
			const placeholders = activeModes.map((_, i) => `$${i + 2}`).join(',');
			await PG.query(
				`DELETE FROM sggame_runs WHERE userid = $1 AND "gameMode" NOT IN (${placeholders})`,
				[userid, ...activeModes]
			);
		} else {
			await getRunsTable().delete({ userid });
		}

		if (statsStr !== lastSaved.stats) {
			const stats = [];
			for (const mode in statsMap) {
				const s = statsMap[mode];
				stats.push({
					userid,
					gameMode: mode,
					highestFloor: s.highestFloor || 0,
					activeFloor: s.activeFloor || 0,
					wins: s.wins || 0,
					recordTeam: JSON.stringify(s.recordTeam || []),
				});
			}
			if (stats.length > 0) {
				for (const stat of stats) {
					await getStatsTable().upsert(stat, ['userid', 'gameMode']);
				}
			} else {
				await getStatsTable().delete({ userid });
			}
			lastSaved.stats = statsStr;
		}

		if (startersStr !== lastSaved.starters) {
			for (const species in startersMap) {
				const s = startersMap[species];
				await getStartersTable().upsert({
					userid,
					species,
					unlockedNatures: JSON.stringify(s.unlockedNatures || []),
					unlockedAbilities: JSON.stringify(s.unlockedAbilities || []),
					unlockedTeraTypes: JSON.stringify(s.unlockedTeraTypes || []),
					selectedNature: s.selectedNature || 'Hardy',
					selectedAbility: s.selectedAbility || '',
					selectedTeraType: s.selectedTeraType || 'Normal',
					shiny: s.shiny ? 1 : 0,
				}, ['userid', 'species']);
			}
			lastSaved.starters = startersStr;
		}

		if (slotsStr !== lastSaved.saveSlots) {
			const slots = [];
			for (const slot in saveSlotsMap) {
				slots.push({
					userid,
					slot: parseInt(slot),
					state: JSON.stringify(saveSlotsMap[slot]),
				});
			}
			await getSaveSlotsTable().delete({ userid });
			if (slots.length > 0) {
				await getSaveSlotsTable().insertMany(slots);
			}
			lastSaved.saveSlots = slotsStr;
		}
		if (userCache[userid]) {
			lastSavedState.set(userid, lastSaved);
		}
	};

	const currentPromise = userSaveQueue.get(userid) || Promise.resolve();
	const nextPromise = currentPromise.then(() => doSave()).catch(e => console.error("SGGame save error:", e));

	userSaveQueue.set(userid, nextPromise);

	void nextPromise.finally(() => {
		if (userSaveQueue.get(userid) === nextPromise) {
			userSaveQueue.delete(userid);
		}
	});
}

export async function saveAllData(): Promise<void> {
	if (!globalDataLoaded) return;
	const promises: Promise<void>[] = [];
	const gPromise = saveGlobalStats();
	if (gPromise) promises.push(gPromise);

	for (const userid in userCache) {
		saveUserData(userid);
		if (userSaveQueue.has(userid)) {
			promises.push(userSaveQueue.get(userid)!);
		}
	}
	await Promise.all(promises);
}

export function getState(userid: string): SGGameState | null {
	const user = getUserData(userid);

	if (user.activeMode && user.runs[user.activeMode]) {
		return user.runs[user.activeMode]!;
	}

	const existingMode = Object.keys(user.runs)[0] as GameMode | undefined;
	if (existingMode) {
		user.activeMode = existingMode;
		return user.runs[existingMode]!;
	}
	return null;
}

export function setState(userid: string, state: SGGameState): void {
	const user = getUserData(userid);
	user.activeMode = state.gameMode;
	user.runs[state.gameMode] = state;
	saveUserData(userid);
}

export function deleteState(userid: string): void {
	const user = getUserData(userid);
	if (user.activeMode) {
		delete user.runs[user.activeMode];
		saveUserData(userid);
	}
}

export function setActiveMode(userid: string, mode: GameMode): void {
	const user = getUserData(userid);
	user.activeMode = mode;
	saveUserData(userid);
}

export function recordRunStats(userid: string, mode: GameMode, floor: number, team: import('./types').PokemonEntry[], isWin = false): void {
	const userData = getUserData(userid);
	if (!userData.stats) userData.stats = {};
	if (!userData.stats[mode]) userData.stats[mode] = { highestFloor: 0, activeFloor: 0, wins: 0, recordTeam: [] };

	let updated = false;

	if (floor !== userData.stats[mode].activeFloor) {
		userData.stats[mode].activeFloor = floor;
		updated = true;
	}

	if (floor > userData.stats[mode].highestFloor) {
		userData.stats[mode].highestFloor = floor;
		userData.stats[mode].recordTeam = team.map(m => ({ ...m }));
		updated = true;
	}

	if (isWin) {
		userData.stats[mode].wins++;
		updated = true;
	}

	if (updated) {
		saveUserData(userid);

		if (!globalStats[userid]) {
			globalStats[userid] = { displayName: userData.displayName, stats: {} };
		}
		if (!globalStats[userid].stats) globalStats[userid].stats = {};

		globalStats[userid].stats[mode] = { ...userData.stats[mode] };
		globalStats[userid].displayName = userData.displayName;
		void saveGlobalStats();
	}
}

void loadGlobalData();

export function incrementAccountStat(userid: string, stat: 'shiniesUnlocked', amount = 1) {
	const userData = getUserData(userid);
	if (!userData[stat]) userData[stat] = 0;
	userData[stat] += amount;
	saveUserData(userid);

	if (!globalStats[userid]) {
		globalStats[userid] = { displayName: userData.displayName, stats: {} };
	}
	if (!globalStats[userid][stat]) globalStats[userid][stat] = 0;
	globalStats[userid][stat] += amount;
	globalStats[userid].displayName = userData.displayName;
	void saveGlobalStats();
}
