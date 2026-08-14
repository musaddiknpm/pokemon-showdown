import { Utils } from '../../../lib';
import { PG } from '../../pg';

import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { initMiscDB } from './database';

interface PerRoomAutotourConfig {
	roomid: RoomID;
	formats: string[];
	types: string[];
	interval: number;
	autostart: number;
	autodq: number;
	playerCap: string;
	enabled: boolean;
	lastTourTime: number;
}

interface AutoTourRow {
	room_id: string;
	enabled: number;
	formats: string;
	types: string;
	interval: number;
	autostart: number;
	autodq: number;
	player_cap: string;
	last_tour_time: number | string;
}

interface MockCommandContext {
	sendReply: (m: string) => void;
	errorReply: (m: string) => void;
	user: User;
	room: Room;
	modlog: () => void;
	parse: () => void;
}

const getTourTable = () => PG.getTable<AutoTourRow>('auto_tours', 'room_id');

const ALL_TOUR_TYPES = ['elimination', 'roundrobin'];

const DEFAULTS: Omit<PerRoomAutotourConfig, 'roomid'> = {
	formats: ['gen9randombattle'],
	types: [...ALL_TOUR_TYPES],
	interval: 60,
	autostart: 5,
	autodq: 2,
	playerCap: '',
	enabled: false,
	lastTourTime: 0,
};

let tourConfigs: Record<string, PerRoomAutotourConfig> = {};
let globalScheduler: NodeJS.Timeout | null = null;

const AutotourManager = {
	async init() {
		const ok = await initMiscDB();
		if (!ok) return;
		const rows = await getTourTable().select();
		tourConfigs = {};

		for (const row of rows) {
			tourConfigs[row.room_id] = {
				roomid: row.room_id as RoomID,
				enabled: row.enabled === 1,
				formats: row.formats.split(','),
				types: row.types.split(','),
				interval: Number(row.interval),
				autostart: Number(row.autostart),
				autodq: Number(row.autodq),
				playerCap: row.player_cap,
				lastTourTime: Number(row.last_tour_time),
			};
		}

		if (!globalScheduler) {
			globalScheduler = setInterval(() => this.tick(), 30 * 1000);
		}
	},

	async saveConfig(roomid: RoomID) {
		const config = this.getConfig(roomid);
		await initMiscDB();

		await getTourTable().upsert({
			room_id: config.roomid,
			enabled: config.enabled ? 1 : 0,
			formats: config.formats.join(','),
			types: config.types.join(','),
			interval: config.interval,
			autostart: config.autostart,
			autodq: config.autodq,
			player_cap: config.playerCap,
			last_tour_time: config.lastTourTime,
		}, ['room_id']);
	},

	getConfig(roomid: RoomID): PerRoomAutotourConfig {
		if (!tourConfigs[roomid]) tourConfigs[roomid] = { roomid, ...DEFAULTS };
		return tourConfigs[roomid];
	},

	tick() {
		for (const roomid in tourConfigs) {
			const config = tourConfigs[roomid];
			if (!config.enabled) continue;

			const room = Rooms.get(roomid);
			if (!room || room.game?.gameid === 'tournament') continue;

			const intervalMs = Math.max(1, config.interval) * 60 * 1000;
			if (Date.now() >= config.lastTourTime + intervalMs) {
				this.execute(roomid as RoomID);
			}
		}
	},

	execute(roomid: RoomID) {
		const config = this.getConfig(roomid);
		const room = Rooms.get(roomid);
		if (!config.enabled || !room || room.game?.gameid === 'tournament') return;

		const format = Utils.randomElement(config.formats);
		const type = Utils.randomElement(config.types);
		const modifier = (type === 'elimination' && Math.random() < 0.2) ? '2' : undefined;

		const mockContext: MockCommandContext = {
			sendReply: (m: string) => room.add(m).update(),
			errorReply: (m: string) => room.add(`|error|${m}`).update(),
			user: { id: 'autotour', name: 'Autotour' } as User,
			room,
			modlog: () => {},
			parse: () => {},
		};

		try {
			const tour = Tournaments.createTournament(room, format, type, config.playerCap || undefined, false, modifier, undefined, mockContext as unknown as Chat.CommandContext);
			if (tour) {
				if (config.autostart > 0) tour.setAutoStartTimeout(config.autostart * 60 * 1000, mockContext as unknown as Chat.CommandContext);
				if (config.autodq > 0) tour.setAutoDisqualifyTimeout(config.autodq * 60 * 1000, mockContext as unknown as Chat.CommandContext);
				config.lastTourTime = Date.now();
				void this.saveConfig(roomid);
			}
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			room.add(`|error|[Autotour] Failed: ${errorMessage}`).update();
		}
	},
};

void AutotourManager.init().catch(err => {
	Monitor.warn(`Autotours PG init failed: ${(err as Error).message}`);
});

export const commands: Chat.ChatCommands = {
	at: 'autotour',
	autotour: {
		async enable(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			this.checkCan('declare', null, room);
			config.enabled = true;
			await AutotourManager.saveConfig(roomid);
			this.sendReply(`Autotours enabled for ${roomid}.`);
		},

		async disable(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			this.checkCan('declare', null, room);
			config.enabled = false;
			await AutotourManager.saveConfig(roomid);
			this.sendReply(`Autotours disabled for ${roomid}.`);
		},

		async interval(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			this.checkCan('declare', null, room);
			const val = parseInt(target);
			if (isNaN(val) || val < 1) throw new Chat.ErrorMessage("The interval must be at least 1 minute.");
			config.interval = val;
			await AutotourManager.saveConfig(roomid);
			this.sendReply(`The tournament interval has been set to ${val} minutes.`);
		},

		async formats(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			this.checkCan('declare', null, room);
			const formats = target.split(',').map(f => toID(f)).filter(Boolean);
			if (!formats.length) throw new Chat.ErrorMessage("Usage: /at formats [format1], [format2]");
			config.formats = formats;
			await AutotourManager.saveConfig(roomid);
			this.sendReply("The rotation formats have been updated.");
		},

		show(target, room) {
			const roomid = this.requireRoom().roomid;
			this.checkCan('declare', null, room);
			const config = AutotourManager.getConfig(roomid);
			const dataRows = [
				[`<b>Enabled:</b>`, config.enabled ? 'Yes' : 'No'],
				[`<b>Formats:</b>`, config.formats.join(', ')],
				[`<b>Interval:</b>`, `${config.interval} min`],
				[`<b>Auto-Start/DQ:</b>`, `${config.autostart}m / ${config.autodq}m`],
			];
			const html = Table(`Autotour: ${roomid}`, ["Setting", "Value"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		next(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			if (!config.enabled) throw new Chat.ErrorMessage("Autotours are not enabled for this room.");
			const next = (config.lastTourTime + (config.interval * 60000)) - Date.now();
			const remaining = next > 0 ? Math.floor(next / 60000) : 0;
			this.sendReply(`The next tournament in ${roomid} is scheduled for ~${remaining} minute(s) from now.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Autotour Commands</b></center><hr>` +
				`<b>/at enable/disable</b>: Toggle autotours.<hr>` +
				`<b>/at formats [f1], [f2]</b>: Set format rotation.<hr>` +
				`<b>/at interval [min]</b>: Set time between tours.<hr>` +
				`<b>/at show</b>: View current config.<hr>` +
				`<b>/at next</b>: Time until next tour.`
			);
		},
	},
};

export const destroy = () => {
	if (globalScheduler) {
		clearInterval(globalScheduler);
		globalScheduler = null;
	}
};
