/*
* Pokemon Showdown
* Auto Tournaments Commands
* Allows Room Owners & Admins to set auto-tournaments.
* @author PrinceSky-Git
*/
import {ImpulseCollection} from '../../impulse-db';

const AUTOTOUR_COLLECTION = 'autotour_configs';

interface PerRoomAutotourConfig {
	roomid: string;
	formats: string[];
	types: string[];
	interval: number;
	autostart: number;
	autodq: number;
	playerCap: string;
	name: string;
	enabled: boolean;
	modifier?: string;
	_id?: any;
}

const ALL_TOUR_TYPES = [
	'elimination',
	'roundrobin',
];

const defaultRoomConfig: Omit<PerRoomAutotourConfig, 'roomid'> = {
	formats: [
    'gen9randombattle', 'gen9randomdoublesbattle',
    'gen9blackcanvasrandombattle', 'gen9monotyperandombattle',
    'gen9randombattlemayhem', 'gen9babyrandombattle',
    'gen9randombattle', 'gen8randomdoublesbattle',
    'gen7randombattle', 'gen6randombattle',
    'gen5randombattle', 'gen4randombattle',
    'gen3randombattle', 'gen2randombattle',
    'gen1randombattle', 'gen5pokebilitiesrandombattle'
  ],
	types: [...ALL_TOUR_TYPES],
	interval: 60,
	autostart: 5,
	autodq: 2,
	playerCap: '',
	name: '',
	enabled: false,
};

const autotourCollection = new ImpulseCollection<PerRoomAutotourConfig>(AUTOTOUR_COLLECTION);
let autotourConfig: Record<string, PerRoomAutotourConfig> = {};
let autotourIntervals: Record<string, NodeJS.Timeout> = {};
let lastTourTime: Record<string, number> = {};

async function saveConfig(roomid: string) {
	const config = autotourConfig[roomid];
	await autotourCollection.updateOne(
		{roomid},
		{$set: {...config, roomid}},
		{upsert: true}
	);
}

async function loadConfig() {
	const configs = await autotourCollection.find({});
	autotourConfig = {};
	for (const config of configs) {
		autotourConfig[config.roomid] = config;
	}
}
void loadConfig();

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pickTourTypeAndModifier(types: string[]): {type: string, modifier?: string} {
	const type = pickRandom(types);
	if (type === 'elimination') {
		if (Math.random() < 0.5) {
			return {type, modifier: '2'};
		}
	}
	return {type};
}

function startRoomAutotourScheduler(roomid: string) {
	stopRoomAutotourScheduler(roomid);
	const config = autotourConfig[roomid];
	if (!config?.enabled) return;
	const min = Math.max(1, config.interval);
	autotourIntervals[roomid] = setInterval(() => runAutotour(roomid), min * 60 * 1000);
}

function stopRoomAutotourScheduler(roomid: string) {
	if (autotourIntervals[roomid]) clearInterval(autotourIntervals[roomid]);
	delete autotourIntervals[roomid];
}

function runAutotour(roomid: string) {
	const config = autotourConfig[roomid];
	if (!config?.enabled) return;
	const room = Rooms.get(roomid);
	if (!room) {
		Monitor.warn(`[AutoTour] Could not find room: ${roomid}`);
		return;
	}
	if (room.game && room.game.gameid === 'tournament') {
		Monitor.notice(`[AutoTour] Tournament already running in ${roomid}, skipping creation.`);
		return;
	}
	const format = pickRandom(config.formats);
	const {type, modifier} = pickTourTypeAndModifier(config.types);

	try {
		const tour = global.Tournaments.createTournament(
			room,
			format,
			type,
			config.playerCap,
			false,
			modifier,
			config.name,
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
			let modinfo = '';
			if (type === 'elimination' && modifier === '2') {
				modinfo = ' (Double Elimination)';
			}
			//room.add(`[AutoTour] A new ${format} ${type}${modinfo} tournament has been created!`).update();
			tour.setAutoStartTimeout(config.autostart * 60 * 1000, {
				sendReply: (msg: string) => room.add(msg),
				modlog: () => {},
				privateModAction: () => {},
				errorReply: (msg: string) => room.add(msg),
				parse: () => {},
				checkCan: () => {},
				runBroadcast: () => true,
				requireRoom: () => room,
			});
			tour.setAutoDisqualifyTimeout(config.autodq * 60 * 1000, {
				sendReply: (msg: string) => room.add(msg),
				modlog: () => {},
				privateModAction: () => {},
				errorReply: (msg: string) => room.add(msg),
				parse: () => {},
				checkCan: () => {},
				runBroadcast: () => true,
				requireRoom: () => room,
			});
			lastTourTime[roomid] = Date.now();
		}
	} catch (err: any) {
		Monitor.warn(`[AutoTour] Failed to create tournament in ${roomid}: ${err.message}`);
	}
}

function checkRoomOwner(context: any, room: ChatRoom | null): boolean {
	if (!room) {
		context.errorReply('Use this command in a room.');
		return false;
	}
	if (context.user.can('declare', null, room)) return true;
	if (room.auth && room.founder && context.user.id === toID(room.founder)) return true;
	context.errorReply('Only the Room Owner or a global Admin can use this command in this room.');
	return false;
}

export const commands: Chat.ChatCommands = {
	autotour: {
		async enable(target, room, user) {
			if (!checkRoomOwner(this, room)) return;
			const roomid = room!.roomid;
			if (!autotourConfig[roomid]) autotourConfig[roomid] = {roomid, ...defaultRoomConfig};
			autotourConfig[roomid].enabled = true;
			await saveConfig(roomid);
			startRoomAutotourScheduler(roomid);
			this.sendReply(`Autotour enabled for room ${roomid}.`);
		},
		async disable(target, room, user) {
			if (!checkRoomOwner(this, room)) return;
			const roomid = room!.roomid;
			if (!autotourConfig[roomid]) autotourConfig[roomid] = {roomid, ...defaultRoomConfig};
			autotourConfig[roomid].enabled = false;
			await saveConfig(roomid);
			stopRoomAutotourScheduler(roomid);
			this.sendReply(`Autotour disabled for room ${roomid}.`);
		},
		async set(target, room, user) {
			if (!checkRoomOwner(this, room)) return;
			const args = target.split(',').map(s => s.trim());
			const [key, ...rest] = args;
			const roomid = room!.roomid;
			if (!autotourConfig[roomid]) autotourConfig[roomid] = {roomid, ...defaultRoomConfig};
			const config = autotourConfig[roomid];
			switch (key) {
				case 'formats':
					config.formats = rest.map(toID).filter(Boolean);
					this.sendReply(`Formats for ${roomid} set to: ${config.formats.join(', ')}`);
					break;
				case 'addformat':
					for (const format of rest.map(toID).filter(Boolean)) {
						if (!config.formats.includes(format)) config.formats.push(format);
					}
					this.sendReply(`Added formats to ${roomid}: ${rest.join(', ')}`);
					break;
				case 'removeformat':
					for (const format of rest.map(toID).filter(Boolean)) {
						const i = config.formats.indexOf(format);
						if (i >= 0) config.formats.splice(i, 1);
					}
					this.sendReply(`Removed formats from ${roomid}: ${rest.join(', ')}`);
					break;
				case 'removeallformats':
					config.formats = ['gen9randombattle'];
					this.sendReply(`All formats removed except gen9randombattle for ${roomid}.`);
					break;
				case 'types':
					config.types = rest.map(toID).filter(type => ALL_TOUR_TYPES.includes(type));
					this.sendReply(`Types for ${roomid} set to: ${config.types.join(', ')}`);
					break;
				case 'addtype':
					for (const type of rest.map(toID).filter(type => ALL_TOUR_TYPES.includes(type))) {
						if (!config.types.includes(type)) config.types.push(type);
					}
					this.sendReply(`Added types to ${roomid}: ${rest.join(', ')}`);
					break;
				case 'removetype':
					for (const type of rest.map(toID).filter(type => ALL_TOUR_TYPES.includes(type))) {
						const i = config.types.indexOf(type);
						if (i >= 0) config.types.splice(i, 1);
					}
					this.sendReply(`Removed types from ${roomid}: ${rest.join(', ')}`);
					break;
				case 'removealltypes':
					config.types = ['elimination'];
					this.sendReply(`All types removed except elimination for ${roomid}.`);
					break;
				case 'interval':
					{
						const min = Number(rest[0]);
						if (!min || min < 1) return this.errorReply('Invalid interval.');
						config.interval = min;
						this.sendReply(`Interval for ${roomid} set to ${min} minutes.`);
					}
					break;
				case 'autostart':
					{
						const min = Number(rest[0]);
						if (!min || min < 0) return this.errorReply('Invalid autostart.');
						config.autostart = min;
						this.sendReply(`Autostart for ${roomid} set to ${min} minutes.`);
					}
					break;
				case 'autodq':
					{
						const min = Number(rest[0]);
						if (!min || min < 0) return this.errorReply('Invalid autodq.');
						config.autodq = min;
						this.sendReply(`Autodq for ${roomid} set to ${min} minutes.`);
					}
					break;
				case 'playercap':
					config.playerCap = rest[0] || '';
					this.sendReply(`Player cap for ${roomid} set to "${config.playerCap}".`);
					break;
				case 'name':
					config.name = rest.join(',') || '';
					this.sendReply(`Name for ${roomid} set to "${config.name}".`);
					break;
				default:
					return this.errorReply('Unknown option. Use formats, addformat, removeformat, removeallformats, types, addtype, removetype, removealltypes, interval, autostart, autodq, playercap, name.');
			}
			await saveConfig(roomid);
			if (config.enabled) startRoomAutotourScheduler(roomid);
		},
		show(target, room, user) {
			if (!checkRoomOwner(this, room)) return;
			const roomid = room!.roomid;
			const config = autotourConfig[roomid] || {roomid, ...defaultRoomConfig};
			this.sendReplyBox(
				`<b>Autotour settings for ${roomid}:</b><br>` +
				`<b>Enabled:</b> ${config.enabled ? 'Yes' : 'No'}<br>` +
				`<b>Formats:</b> ${config.formats.join(', ') || '(none)'}<br>` +
				`<b>Types:</b> ${config.types.join(', ') || '(none)'}<br>` +
				`<b>Defaults:</b><br>` +
				`- <b>Formats:</b> ${defaultRoomConfig.formats.join(', ')}<br>` +
				`- <b>Types:</b> ${defaultRoomConfig.types.join(', ')}`
			);
		},
		async status(target, room, user) {
			this.runBroadcast();
			const configs = await autotourCollection.find({});
			const out: string[] = [];
			for (const config of configs) {
				out.push(
					`<b>${config.roomid}:</b> enabled=${config.enabled} formats=${config.formats.join(', ')} types=${config.types.join(', ')} interval=${config.interval} autostart=${config.autostart} autodq=${config.autodq} playerCap="${config.playerCap}" name="${config.name}"`
				);
			}
			this.sendReplyBox(out.join('<br>') || 'No autotour configs set.');
		},
		nextrun(target, room, user) {
			this.runBroadcast();
			const roomid = target ? toID(target) : room?.roomid;
			if (!roomid) return this.errorReply('Specify a room.');
			const config = autotourConfig[roomid];
			if (!config?.enabled) return this.errorReply(`Autotour is not enabled in ${roomid}.`);
			const lastRun = lastTourTime[roomid] || Date.now();
			const nextRun = lastRun + (config.interval * 60 * 1000);
			const timeRemaining = Math.max(0, nextRun - Date.now());
			const minutes = Math.floor(timeRemaining / 60000);
			const seconds = Math.floor((timeRemaining % 60000) / 1000);
			this.sendReply(`Next tournament in ${roomid} will start in ${minutes}m ${seconds}s.`);
		},
		help(target, room, user) {
			this.runBroadcast();
			this.sendReplyBox(
				`<b>/autotour enable</b> - Enable autotour in this room.<br>` +
				`<b>/autotour disable</b> - Disable autotour in this room.<br>` +
				`<b>/autotour set [option],... </b> - Set per-room option (run in room):<br>` +
				`formats, addformat, removeformat, removeallformats, types, addtype, removetype, removealltypes, interval, autostart, autodq, playercap, name<br>` +
				`<b>/autotour show</b> - Show current and default autotour formats/types for this room.<br>` +
				`<b>/autotour status</b> - Show all autotour configs.<br>` +
				`<b>/autotour nextrun [room]</b> - Show time remaining until next tournament starts.<br><br>` +
				`<b>Examples:</b><br>` +
				`/autotour enable<br>` +
				`/autotour set formats, gen9randombattle, gen8randombattle<br>` +
				`/autotour set interval, 30<br>` +
				`/autotour set autostart, 3<br>` +
				`/autotour set types, elimination, roundrobin<br>` +
				`/autotour set playercap, 32<br>` +
				`/autotour set name, My Weekly Tour<br>` +
				`/autotour set removeallformats<br>` +
				`/autotour set removealltypes<br>` +
				`/autotour show<br>` +
				`/autotour nextrun<br>`
			);
		},
	},
};

void (async () => {
	await loadConfig();
	for (const roomid in autotourConfig) {
		if (autotourConfig[roomid]?.enabled) startRoomAutotourScheduler(roomid);
	}
})();
