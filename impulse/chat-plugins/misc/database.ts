import { PG } from '../../pg';

let initPromise: Promise<boolean> | null = null;

export const initMiscDB = async (): Promise<boolean> => {
	if (!initPromise) {
		initPromise = PG.safeInit('Misc', `
				CREATE TABLE IF NOT EXISTS seen_users (
					user_id TEXT PRIMARY KEY,
					username TEXT NOT NULL,
					last_seen BIGINT NOT NULL,
					action TEXT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS ontime (
					user_id TEXT PRIMARY KEY,
					total_time BIGINT NOT NULL,
					is_blocked INTEGER DEFAULT 0
				);
				CREATE TABLE IF NOT EXISTS news (
					id TEXT PRIMARY KEY,
					title TEXT NOT NULL,
					description TEXT NOT NULL,
					posted_by TEXT NOT NULL,
					post_time TEXT NOT NULL,
					timestamp BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS news_blocked (
					user_id TEXT PRIMARY KEY
				);
				CREATE TABLE IF NOT EXISTS emoticons (
					name TEXT PRIMARY KEY,
					url TEXT NOT NULL,
					added_by TEXT NOT NULL,
					added_at BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS emoticon_settings (
					id INTEGER PRIMARY KEY CHECK (id = 1),
					emote_size INTEGER NOT NULL
				);
				CREATE TABLE IF NOT EXISTS emoticon_ignores (
					user_id TEXT PRIMARY KEY
				);
				CREATE TABLE IF NOT EXISTS auto_tours (
					room_id TEXT PRIMARY KEY,
					enabled INTEGER DEFAULT 0,
					formats TEXT NOT NULL,
					types TEXT NOT NULL,
					interval INTEGER NOT NULL,
					autostart INTEGER NOT NULL,
					autodq INTEGER NOT NULL,
					player_cap TEXT NOT NULL,
					last_tour_time BIGINT NOT NULL
				);
				CREATE TABLE IF NOT EXISTS api_cache (
					id TEXT PRIMARY KEY,
					data TEXT NOT NULL,
					timestamp BIGINT NOT NULL
				);
			`);
	}
	return initPromise;
};
