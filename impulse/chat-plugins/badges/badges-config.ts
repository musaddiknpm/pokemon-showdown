/*
* Pokemon Showdown
* Badges config
* @author PrinceSky-Git
*/

import { getEconomyUser } from '../../modules/economy';
import { ImpulseDB } from '../../impulse-db';

interface EconomyBadgeConfig {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	threshold: number;
}

interface OntimeBadgeConfig {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	thresholdHours: number;
}

const BASE_URL = 'https://raw.githubusercontent.com/musaddiknpm/pokemon-showdown/refs/heads/master/impulse/chat-plugins/badges/images';

export const ECONOMY_BADGES: EconomyBadgeConfig[] = [
	{ id: 'economynewbie', name: 'Penny Pincher', description: 'Earned 10k PokéBucks', imageUrl: `${BASE_URL}/economy/pennypincher.png`, threshold: 10000 },
	{ id: 'economybronze', name: 'Bronze Trader', description: 'Accumulated 25k PokéBucks', imageUrl: `${BASE_URL}/economy/bronzetrader.png`, threshold: 25000 },
	{ id: 'economysilver', name: 'Silver Mogul', description: 'Reached 50k PokéBucks', imageUrl: `${BASE_URL}/economy/silvermogul.png`, threshold: 50000 },
	{ id: 'economygold', name: 'Gold Tycoon', description: 'Amassed 100k PokéBucks', imageUrl: `${BASE_URL}/economy/goldtycoon.png`, threshold: 100000 },
	{ id: 'economyplatinum', name: 'Platinum Magnate', description: 'Achieved 500k PokéBucks', imageUrl: `${BASE_URL}/economy/platinummagnet.png`, threshold: 500000 },
	{ id: 'economydiamond', name: 'Diamond Elite', description: 'Conquered 1M PokéBucks', imageUrl: `${BASE_URL}/economy/diamondelite.png`, threshold: 1000000 },
	{ id: 'economycosmic', name: 'Cosmic Collector', description: 'Conquered 5M PokèBucks', imageUrl: `${BASE_URL}/economy/cosmiccollector.png`, threshold: 5000000 },
];

export const ONTIME_BADGES: OntimeBadgeConfig[] = [
	{ id: 'ontime1day', name: '1 Day Online', description: 'Spent 24 hours online', imageUrl: `${BASE_URL}/ontime/1day.png`, thresholdHours: 24 },
	{ id: 'ontime7days', name: '7 Days Online', description: 'Spent 168 hours online', imageUrl: `${BASE_URL}/ontime/7days.png`, thresholdHours: 168 },
	{ id: 'ontime14days', name: '14 Days Online', description: 'Spent 336 hours online', imageUrl: `${BASE_URL}/ontime/14days.png`, thresholdHours: 336 },
	{ id: 'ontime1month', name: '1 Month Online', description: 'Spent 720 hours online', imageUrl: `${BASE_URL}/ontime/1month.png`, thresholdHours: 720 },
	{ id: 'ontime3months', name: '3 Months Online', description: 'Spent 2160 hours online', imageUrl: `${BASE_URL}/ontime/3months.png`, thresholdHours: 2160 },
	{ id: 'ontime6months', name: '6 Months Online', description: 'Spent 4320 hours online', imageUrl: `${BASE_URL}/ontime/6months.png`, thresholdHours: 4320 },
	{ id: 'ontime12months', name: '12 Months Online', description: 'Spent 8640 hours online', imageUrl: `${BASE_URL}/ontime/12months.png`, thresholdHours: 8640 },
];

const findHighestBadge = <T extends { threshold?: number; thresholdHours?: number }>(badges: T[], value: number, field: 'threshold' | 'thresholdHours'): T | null => {
	let highest: T | null = null;
	for (const badge of badges) {
		const threshold = badge[field] as number;
		if (value >= threshold && (!highest || threshold > (highest[field] as number))) {
			highest = badge;
		}
	}
	return highest;
};

export const checkAndAwardEconomyBadge = async (userid: string) => {
	const user = await getEconomyUser(userid);
	const badge = findHighestBadge(ECONOMY_BADGES, user.netWorth, 'threshold');
	if (badge) {
		await Impulse.Badges.awardEconomyBadge(userid, badge.id);
	}
};

export const checkAndAwardOntimeBadge = async (userid: string) => {
	const ontimeDoc = await ImpulseDB<{ _id: string, ontime: number }>('ontime').findOne({ _id: userid });
	const totalOntimeMs = ontimeDoc?.ontime || 0;

	const targetUser = Users.get(userid);
	const currentSessionTime = targetUser?.connected && targetUser.lastConnected ? Date.now() - targetUser.lastConnected : 0;
	const totalHours = (totalOntimeMs + currentSessionTime) / (1000 * 60 * 60);

	const badge = findHighestBadge(ONTIME_BADGES, totalHours, 'thresholdHours');
	if (badge) {
		await Impulse.Badges.awardOntimeBadge(userid, badge.id);
	}
};
