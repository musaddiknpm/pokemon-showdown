import { PG } from '../../pg';

let initPromise: Promise<void> | null = null;

export const initEconomyDB = async (): Promise<void> => {
	if (!initPromise) {
		initPromise = (async () => {
			await PG.query(`
				CREATE TABLE IF NOT EXISTS economy (
					user_id TEXT PRIMARY KEY,
					balance INTEGER DEFAULT 0,
					last_claim BIGINT DEFAULT 0
				);
				CREATE TABLE IF NOT EXISTS global_shop (
					name TEXT PRIMARY KEY,
					description TEXT NOT NULL,
					cost INTEGER NOT NULL
				);
				CREATE TABLE IF NOT EXISTS global_shop_log (
					id SERIAL PRIMARY KEY,
					user_id TEXT NOT NULL,
					item TEXT NOT NULL,
					timestamp BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS room_shop (
					room_id TEXT PRIMARY KEY,
					enabled INTEGER DEFAULT 0,
					bank TEXT
				);
				CREATE TABLE IF NOT EXISTS room_shop_item (
					room_id TEXT NOT NULL,
					name TEXT NOT NULL,
					description TEXT NOT NULL,
					cost INTEGER NOT NULL,
					PRIMARY KEY (room_id, name),
					FOREIGN KEY (room_id) REFERENCES room_shop(room_id) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS room_shop_log (
					id SERIAL PRIMARY KEY,
					room_id TEXT NOT NULL,
					user_id TEXT NOT NULL,
					item TEXT NOT NULL,
					timestamp BIGINT NOT NULL
				);
			`);
		})();
	}
	return initPromise;
};
