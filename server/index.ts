/**
 * Main file
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This is the main Pokemon Showdown app, and the file that the
 * `pokemon-showdown` script runs if you start Pokemon Showdown normally.
 *
 * This file sets up our SockJS server, which handles communication
 * between users and your server, and also sets up globals. You can
 * see details in their corresponding files, but here's an overview:
 *
 * Users - from users.ts
 *
 *   Most of the communication with users happens in users.ts, we just
 *   forward messages between the sockets.js and users.ts.
 *
 *   It exports the global tables `Users.users` and `Users.connections`.
 *
 * Rooms - from rooms.ts
 *
 *   Every chat room and battle is a room, and what they do is done in
 *   rooms.ts. There's also a global room which every user is in, and
 *   handles miscellaneous things like welcoming the user.
 *
 *   It exports the global table `Rooms.rooms`.
 *
 * Dex - from sim/dex.ts
 *
 *   Handles getting data about Pokemon, items, etc.
 *
 * Ladders - from ladders.ts and ladders-remote.ts
 *
 *   Handles Elo rating tracking for players.
 *
 * Chat - from chat.ts
 *
 *   Handles chat and parses chat commands like /me and /ban
 *
 * Sockets - from sockets.js
 *
 *   Used to abstract out network connections. sockets.js handles
 *   the actual server and connection set-up.
 *
 * @license MIT
 */
try {
	require('source-map-support').install();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
}
// NOTE: This file intentionally doesn't use too many modern JavaScript
// features, so that it doesn't crash old versions of Node.js, so we
// can successfully print the "We require Node.js 22+" message.

// I've gotten enough reports by people who don't use the launch
// script that this is worth repeating here
try {
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	fetch;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	throw new Error("We require Node.js version 22 or later; you're using " + process.version);
}

try {
	require.resolve('ts-chacha20');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	throw new Error("Dependencies are unmet; run `npm ci` before launching Pokemon Showdown again.");
}

// Note that `import` declarations are run before any other code
import { Repl } from '../lib';
import * as ConfigLoader from './config-loader';
import { Sockets } from './sockets';
import { ImpulseDB } from '../impulse/impulse-db';

function cleanupStale() {
	return Repl.cleanup();
}

function setupGlobals() {
	const { Monitor } = require('./monitor');
	global.Monitor = Monitor;
	global.__version = { head: '' };
	void Monitor.version().then((hash: any) => {
		global.__version.tree = hash;
	});

	// Make Impulse namespace global
	global.Impulse = {};

	const { Dex } = require('../sim/dex');
	global.Dex = Dex;
	global.toID = Dex.toID;

	const { Rooms } = require('./rooms');
	global.Rooms = Rooms;
	// We initialize the global room here because roomlogs.ts needs the Rooms global
	Rooms.global = new Rooms.GlobalRoomState();

	const { Teams } = require('../sim/teams');
	global.Teams = Teams;

	const { LoginServer } = require('./loginserver');
	global.LoginServer = LoginServer;

	const { Ladders } = require('./ladders');
	global.Ladders = Ladders;

	const { Chat } = require('./chat');
	global.Chat = Chat;

	const { Users } = require('./users');
	global.Users = Users;

	const { Punishments } = require('./punishments');
	global.Punishments = Punishments;

	const Verifier = require('./verifier');
	global.Verifier = Verifier;

	const { Tournaments } = require('./tournaments');
	global.Tournaments = Tournaments;

	const { IPTools } = require('./ip-tools');
	global.IPTools = IPTools;
	void IPTools.loadHostsAndRanges();

	const TeamValidatorAsync = require('./team-validator-async');
	global.TeamValidatorAsync = TeamValidatorAsync;

	global.Sockets = Sockets;
	Sockets.start(Config.subprocessescache);
}

/*
* Initialise ImpulseDB
*/
async function initializeDatabase() {
	if (!Config.impulsedb?.uri) {
		Monitor.warn('ImpulseDB: MongoDB URI not configured. Database features disabled.');
		return false;
	}
	try {
		await ImpulseDB.init({
			uri: Config.impulsedb.uri,
			dbName: Config.impulsedb.dbName || 'impulse',
			options: {
				maxPoolSize: Config.impulsedb.maxPoolSize || 100,
				minPoolSize: Config.impulsedb.minPoolSize || 5,
			},
		});
		Monitor.notice('ImpulseDB: Successfully connected to MongoDB');
		return true;
	} catch (err: any) {
		Monitor.crashlog(err, 'ImpulseDB initialization failed');
		return false;
	}
}
/*
* Initialisation Ends
*/

/*export const readyPromise = cleanupStale().then(() => {
	setupGlobals();
}).then(() => {
	if (Config.usesqlite) {
		require('./modlog').start(Config.subprocessescache);
	}*/
export const readyPromise = cleanupStale().then(() => {
	setupGlobals();
}).then(() => {
	return initializeDatabase();
}).then((dbReady) => {
	if (dbReady) {
		Monitor.notice('ImpulseDB: Database ready');
	}
	if (Config.usesqlite) {
		require('./modlog').start(Config.subprocessescache);
	}

	Rooms.global.start(Config.subprocessescache);
	Verifier.start(Config.subprocessescache);
	TeamValidatorAsync.start(Config.subprocessescache);
	Chat.start(Config.subprocessescache);

	/*********************************************************
	 * Monitor config file and display diagnostics
	 *********************************************************/

	if (Config.watchconfig) {
		ConfigLoader.watch();
	}

	ConfigLoader.flushLog();

	/*********************************************************
	 * On error continue - enabled by default
	 *********************************************************/

	if (Config.crashguard) {
		// graceful crash - allow current battles to finish before restarting
		process.on('uncaughtException', (err: Error) => {
			Monitor.crashlog(err, 'The main process');
		});

		process.on('unhandledRejection', err => {
			// TODO:
			// - Compability with https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
			// - Crashlogger API for reporting rejections vs exceptions
			Monitor.crashlog(err as any, 'A main process Promise');
		});
	}

	/*********************************************************
	 * Start up the REPL server
	 *********************************************************/

	Repl.startGlobal('app');

	/*********************************************************
	 * Fully initialized, run startup hook
	 *********************************************************/

	if (Config.startuphook) {
		process.nextTick(Config.startuphook);
	}

	/*
	* ImpulseDB Graceful Shutdown
	*/
	process.on('SIGTERM', async () => {
		Monitor.notice('Received SIGTERM, shutting down gracefully...');
		try {
			await ImpulseDB.close();
			Monitor.notice('ImpulseDB: Connection closed');
		} catch (err: any) {
			Monitor.warn('ImpulseDB: Error closing: ' + err.message);
		}
		process.exit(0);
	});

	process.on('SIGINT', async () => {
		Monitor.notice('Received SIGINT, shutting down gracefully...');
		try {
			await ImpulseDB.close();
			Monitor.notice('ImpulseDB: Connection closed');
		} catch (err: any) {
			Monitor.warn('ImpulseDB: Error closing: ' + err.message);
		}
		process.exit(0);
	});

	/*
	* Graceful Shutdown Ends
	*/

	// === Begin: Automatically create and start random-format random-type tournament every 1 hour in Lobby ===

	const TOUR_ROOM_ID = 'lobby';
	const TOUR_FORMATS = ['gen9randombattle', 'gen8randombattle', 'gen7randombattle',
								'gen9monotyperandombattle', 'gen9babyrandombattle', 'gen9randomdoublesbattle'];
	const TOUR_TYPES = ['elimination', 'roundrobin'];
	const TOUR_PLAYER_CAP = '';
	const TOUR_NAME = '';
	const AUTOSTART_TIMER = 5 * 60 * 1000; // 5 minutes in ms
	const AUTODQ_TIMER = 2 * 60 * 1000; // 2 minutes in ms

	function pickRandom<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function startHourlyTournament() {
		const room = Rooms.get(TOUR_ROOM_ID);
		if (!room) {
			Monitor.warn(`[AutoTour] Could not find room: ${TOUR_ROOM_ID}`);
			return;
		}
		if (room.game && room.game.gameid === 'tournament') {
			Monitor.notice(`[AutoTour] Tournament already running in ${TOUR_ROOM_ID}, skipping creation.`);
			return;
		}
		const format = pickRandom(TOUR_FORMATS);
		const type = pickRandom(TOUR_TYPES);
		try {
			const tour = global.Tournaments.createTournament(
				room,
				format,
				type,
				TOUR_PLAYER_CAP,
				false,
				undefined,
				TOUR_NAME,
				{
					sendReply: (msg: string) => room.add(msg),
					modlog: () => {},
					privateModAction: () => {},
					errorReply: (msg: string) => room.add(msg),
					parse: () => {},
					checkCan: () => {},
					runBroadcast: () => true,
					requireRoom: () => room,
				}
			);
			if (tour) {
				room.add(`[AutoTour] A new ${format} ${type} tournament has been created!`).update();
				tour.setAutoStartTimeout(AUTOSTART_TIMER, {
					sendReply: (msg: string) => room.add(msg),
					modlog: () => {},
					privateModAction: () => {},
					errorReply: (msg: string) => room.add(msg),
					parse: () => {},
					checkCan: () => {},
					runBroadcast: () => true,
					requireRoom: () => room,
				});
				tour.setAutoDisqualifyTimeout(AUTODQ_TIMER, {
					sendReply: (msg: string) => room.add(msg),
					modlog: () => {},
					privateModAction: () => {},
					errorReply: (msg: string) => room.add(msg),
					parse: () => {},
					checkCan: () => {},
					runBroadcast: () => true,
					requireRoom: () => room,
				});
			}
		} catch (err: any) {
			Monitor.warn(`[AutoTour] Failed to create tournament: ${err.message}`);
		}
	}

	setTimeout(() => {
		startHourlyTournament();
		setInterval(startHourlyTournament, 10 * 60 * 1000);
	}, 30 * 1000);

	// === End: Automatically create and start random-format random-type tournament every 1 hour in Lobby ===

	if (Config.ofemain) {
		// Create a heapdump if the process runs out of memory.
		global.nodeOomHeapdump = (require as any)('node-oom-heapdump')({
			addTimestamp: true,
		});
	}
});
