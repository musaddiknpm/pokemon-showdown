import { FS } from '../../../lib';
import { SGPlayer } from './types';
import { SGItems } from './items';

const DIR = 'config/sggame';
FS(DIR).mkdirpSync();

export const SGTimeouts = new Map<string, NodeJS.Timeout>();

export const Database = {
	load(userid: string): SGPlayer | null {
		// If they run a command, cancel any pending auto-clears so we don't mess up their new screen
		if (SGTimeouts.has(userid)) {
			clearTimeout(SGTimeouts.get(userid)!);
			SGTimeouts.delete(userid);
		}
		try {
			const data = FS(`${DIR}/${userid}.json`).readSync();
			const player = JSON.parse(data) as SGPlayer;
			if (player.introState === undefined) {
				player.introState = player.party.length > 0 ? 3 : 0;
			}
			if (player.bag && player.bag['expall'] === undefined) {
				player.bag['expall'] = 1;
			}
			
			// Enforce max item quantities
			if (player.bag) {
				for (const item in player.bag) {
					const itemData = SGItems[item];
					if (itemData) {
						if (itemData.category === 'Key Items' || itemData.category === 'Held Items' || itemData.category === 'TMs') {
							if (player.bag[item] > 1) player.bag[item] = 1;
						} else {
							if (player.bag[item] > 99) player.bag[item] = 99;
						}
					}
				}
			}
			
			// Extract lastMessage and clear it from DB so it only shows once
			if (player.lastMessage) {
				const msg = player.lastMessage;
				player.lastMessage = undefined;
				Database.save(userid, player); // Clear from disk
				player.lastMessage = msg; // Keep in memory for this render cycle
			}
			
			return player;
		} catch (e) {
			return null;
		}
	},
	save(userid: string, player: SGPlayer) {
		FS(`${DIR}/${userid}.json`).writeSync(JSON.stringify(player, null, 2));
	},
	create(userid: string): SGPlayer {
		const player: SGPlayer = {
			userid,
			party: [],
			pc: [],
			bag: {
				pokeball: 5,
				potion: 5,
				expall: 1,
			},
			location: 'Route 1',
			introState: 0,
		};
		this.save(userid, player);
		return player;
	}
};
