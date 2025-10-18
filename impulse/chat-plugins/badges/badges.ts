/*
* Pokemon Showdown
* Badges chat-plugin
* @author PrinceSky-Git
*/

import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';
import { ECONOMY_BADGES, ONTIME_BADGES } from './badges-config';

const STAFF_ROOM_ID = 'staff';

export interface BadgeDocument {
	_id: string;
	name: string;
	description: string;
	imageUrl: string;
	createdBy: string;
	createdAt: Date;
}

interface UserBadgesDocument {
	_id: string;
	badges: string[];
}

const BadgeDB = ImpulseDB<BadgeDocument>('badges');
const UserBadgesDB = ImpulseDB<UserBadgesDocument>('userbadges');

const logBadgeAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('badgelogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to badge log:', err);
	}
};

const displayBadge = (imageUrl: string, name: string, size = 16): string => 
	`<img src="${imageUrl}" height="${size}" width="${size}" alt="${name}" title="${name}" style="vertical-align: middle;">`;

const notifyBadgeEarned = (recipient: User, badge: BadgeDocument, message: string) => {
	recipient.popup(
		`|html|${message}<br />${displayBadge(badge.imageUrl, badge.description, 32)} <strong>${Chat.escapeHTML(badge.name)}</strong><br />Use <code>/badges user</code> to see all your badges.`
	);
};

declare global {
	namespace Impulse {
		namespace Badges {
			function give(userid: string, badgeId: string, notifier?: string, silent?: boolean): Promise<boolean>;
			function awardEconomyBadge(userid: string, newBadgeId: string, silent?: boolean): Promise<BadgeDocument | null>;
			function awardOntimeBadge(userid: string, newBadgeId: string, silent?: boolean): Promise<BadgeDocument | null>;
		}
	}
}

const Badges = {
	async give(userid: string, badgeId: string, notifier = 'The Server', silent = true): Promise<boolean> {
		const badge = await BadgeDB.findOne({ _id: badgeId });
		if (!badge) return false;

		await UserBadgesDB.updateOne({ _id: userid }, { $addToSet: { badges: badgeId } }, { upsert: true });

		if (!silent) {
			const recipient = Users.get(userid);
			if (recipient) {
				const notifierText = notifier === 'The Server' ? 'The server' : Impulse.nameColor(notifier, true);
				notifyBadgeEarned(recipient, badge, `You have received a badge from ${notifierText}!`);
			}
		}
		return true;
	},

	async awardEconomyBadge(userid: string, newBadgeId: string, silent = true): Promise<BadgeDocument | null> {
		const badge = await BadgeDB.findOne({ _id: newBadgeId });
		if (!badge) return null;

		const userBadgesDoc = await UserBadgesDB.findOne({ _id: userid });
		const newBadgeList = [...(userBadgesDoc?.badges ?? []).filter(b => !b.startsWith('economy')), newBadgeId];

		await UserBadgesDB.updateOne({ _id: userid }, { $set: { badges: newBadgeList } }, { upsert: true });

		if (!silent) {
			const recipient = Users.get(userid);
			if (recipient) {
				notifyBadgeEarned(recipient, badge, 'Your Economy Badge has been updated!');
			}
		}
		await logBadgeAction('ECONOMY_SWAP', 'Server', userid, `Awarded: ${newBadgeId}`);
		return badge;
	},

	async awardOntimeBadge(userid: string, newBadgeId: string, silent = true): Promise<BadgeDocument | null> {
		const badge = await BadgeDB.findOne({ _id: newBadgeId });
		if (!badge) return null;

		const userBadgesDoc = await UserBadgesDB.findOne({ _id: userid });
		const newBadgeList = [...(userBadgesDoc?.badges ?? []).filter(b => !b.startsWith('ontime')), newBadgeId];

		await UserBadgesDB.updateOne({ _id: userid }, { $set: { badges: newBadgeList } }, { upsert: true });

		if (!silent) {
			const recipient = Users.get(userid);
			if (recipient) {
				notifyBadgeEarned(recipient, badge, 'Your Ontime Badge has been updated!');
			}
		}
		await logBadgeAction('ONTIME_SWAP', 'Server', userid, `Awarded: ${newBadgeId}`);
		return badge;
	},
};

Impulse.Badges = Badges;

const initBadges = async (badgeConfigs: any[], type: string) => {
	let created = 0, skipped = 0;
	for (const config of badgeConfigs) {
		if (!await BadgeDB.exists({ _id: config.id })) {
			await BadgeDB.insertOne({
				_id: config.id,
				name: config.name,
				description: config.description,
				imageUrl: config.imageUrl,
				createdBy: 'system',
				createdAt: new Date(),
			});
			created++;
		} else {
			skipped++;
		}
	}
	return { created, skipped };
};

const renderBadgeGrid = (badges: BadgeDocument[], title: string, totalPages = 0, currentPage = 0) => {
	let buf = `<div class="infobox-limited"><div style="text-align:center"><h2>${title}${totalPages ? ` (Page ${currentPage}/${totalPages})` : ''}</h2></div><div class="badge-grid-container">`;
	badges.forEach(badge => {
		buf += `<button class="button badge-button" name="send" value="/badges info ${badge._id}"><img src="${badge.imageUrl}" alt="${Chat.escapeHTML(badge.name)}" title="${Chat.escapeHTML(badge.name)}"/></button>`;
	});
	buf += `</div>`;
	return buf;
};

export const commands: Chat.ChatCommands = {
	badges: {
		async create(target, room, user) {
			this.checkCan('roomowner');
			const [name, description, imageUrl] = target.split(',').map(p => p.trim());
			if (!name || !description || !imageUrl) return this.errorReply('Usage: /badges create [Name], [description], [image url]');

			const badgeId = toID(name);
			if (!badgeId) return this.errorReply("Invalid badge name.");

			if (await BadgeDB.exists({ _id: badgeId })) {
				return this.errorReply(`Badge ID '${badgeId}' already exists.`);
			}

			const newBadge: BadgeDocument = { _id: badgeId, name, description, imageUrl, createdBy: user.id, createdAt: new Date() };
			await BadgeDB.insertOne(newBadge);
			await logBadgeAction('CREATE', user.name, badgeId, `Name: ${name}`);

			this.sendReply(`Badge '${name}' (ID: ${badgeId}) created.`);

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			staffRoom?.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true)} created badge: ${displayBadge(imageUrl, name, 32)} (${name})</div>`).update();
		},

		async edit(target, room, user) {
			this.checkCan('roomowner');
			const [badgeId, field, ...valueParts] = target.split(',').map(p => p.trim());
			const value = valueParts.join(',').trim();

			if (!badgeId || !field || !value) return this.errorReply('Usage: /badges edit [id], [name|description|imageurl], [value]');

			const badge = await BadgeDB.findOne({ _id: toID(badgeId) });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			const fieldId = toID(field);
			if (!['name', 'description', 'imageurl'].includes(fieldId)) {
				return this.errorReply(`Edit 'name', 'description', or 'imageurl'.`);
			}

			const updateField = fieldId === 'imageurl' ? 'imageUrl' : fieldId;
			await BadgeDB.updateOne({ _id: badge._id }, { $set: { [updateField]: value } });
			await logBadgeAction('EDIT', user.name, badge._id, `Set ${updateField}`);

			const displayValue = fieldId === 'imageurl' ? displayBadge(value, value) : Chat.escapeHTML(value);
			this.sendReply(`|raw|Edited '${badge.name}' badge. New ${updateField}: ${displayValue}`);
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const badgeId = toID(target);
			if (!badgeId) return this.errorReply('Usage: /badges delete [id]');

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			await BadgeDB.deleteOne({ _id: badgeId });
			await UserBadgesDB.updateMany({}, { $pull: { badges: badgeId } });
			await logBadgeAction('DELETE', user.name, badgeId);

			this.sendReply(`Badge '${badge.name}' deleted and removed from all users.`);

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			staffRoom?.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true)} deleted badge: ${Chat.escapeHTML(badge.name)}</div>`).update();
		},

		async give(target, room, user) {
			this.checkCan('roomowner');
			const [targetUser, badgeIdRaw] = target.split(',').map(p => p.trim());
			if (!targetUser || !badgeIdRaw) return this.errorReply('Usage: /badges give [user], [id]');

			const targetId = toID(targetUser);
			const badgeId = toID(badgeIdRaw);
			if (!targetId || !badgeId) return this.errorReply("Invalid user or badge ID.");

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			const success = await Impulse.Badges.give(targetId, badgeId, user.id);
			if (success) {
				await logBadgeAction('GIVE', user.name, targetId, `Badge: ${badgeId}`);
				this.sendReply(`Gave '${badge.name}' to ${targetId}.`);
			} else {
				return this.errorReply(`Could not give badge.`);
			}
		},

		async massgive(target, room, user) {
			this.checkCan('roomowner');
			const [badgeIdRaw, ...users] = target.split(',').map(p => p.trim());
			const badgeId = toID(badgeIdRaw);

			if (!badgeId || !users.length) return this.errorReply('Usage: /badges massgive [id], [user1], [user2], ...');

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			let successCount = 0;
			for (const userId of users.map(toID).filter(Boolean)) {
				if (await Impulse.Badges.give(userId, badgeId, user.id)) successCount++;
			}

			await logBadgeAction('MASSGIVE', user.name, `${successCount} users`, `Badge: ${badgeId}`);
			this.sendReply(`Gave '${badge.name}' to ${successCount} users.`);
		},

		async take(target, room, user) {
			this.checkCan('roomowner');
			const [targetUser, badgeIdRaw] = target.split(',').map(p => p.trim());
			if (!targetUser || !badgeIdRaw) return this.errorReply('Usage: /badges take [user], [id]');

			const targetId = toID(targetUser);
			const badgeId = toID(badgeIdRaw);
			if (!targetId || !badgeId) return this.errorReply("Invalid user or badge ID.");

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			await UserBadgesDB.updateOne({ _id: targetId }, { $pull: { badges: badgeId } });
			await logBadgeAction('TAKE', user.name, targetId, `Badge: ${badgeId}`);
			this.sendReply(`Took '${badge.name}' from ${targetId}.`);
		},

		async list(target, room, user) {
			if (!this.runBroadcast()) return;

			const result = await BadgeDB.findPaginated({}, { page: parseInt(target) || 1, limit: 20, sort: { name: 1 } });
			if (result.total === 0) return this.sendReplyBox("No badges on this server.");

			let buf = renderBadgeGrid(result.docs, 'Badges List', result.totalPages, result.page);

			if (result.totalPages > 1) {
				buf += `<div style="text-align: center; padding: 10px;">`;
				if (result.hasPrev) buf += `<button class="button" name="send" value="/badges list ${result.page - 1}">Previous</button> `;
				if (result.hasNext) buf += `<button class="button" name="send" value="/badges list ${result.page + 1}">Next</button>`;
				buf += `</div>`;
			}
			buf += `</div>`;

			this.sendReply(`|raw|${buf}`);
		},

		async user(target, room, user) {
			if (!this.runBroadcast()) return;
			const targetId = (target) || user.name;

			const userBadges = await UserBadgesDB.findOne({ _id: toID(targetId) });
			if (!userBadges?.badges.length) {
				return this.sendReplyBox(`<username>${targetId}</username> has no badges.`);
			}

			const badgeData = await BadgeDB.find({ _id: { $in: userBadges.badges } });
			let buf = renderBadgeGrid(badgeData, `<username>${targetId}</username>'s Badges`);
			buf += `</div>`;

			this.sendReply(`|raw|${buf}`);
		},

		async info(target, room, user) {
			if (!this.runBroadcast()) return;
			const badgeId = toID(target);
			if (!badgeId) return this.parse('/help badges');

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			this.sendReplyBox(
				`<div style="display: flex; align-items: center;"><div style="flex-shrink: 0; padding-right: 8px;">${displayBadge(badge.imageUrl, badge.description, 32)}</div><div><div style="font-weight: bold; font-size: 11pt;">${Chat.escapeHTML(badge.name)}</div><div style="font-size: 9pt;">${Chat.escapeHTML(badge.description)}</div></div></div>`
			);
		},

		async stats(target, room, user) {
			if (!this.runBroadcast()) return;
			this.checkCan('roomowner');

			const totalBadges = await BadgeDB.countDocuments();
			const totalHolders = await UserBadgesDB.countDocuments({ badges: { $exists: true, $ne: [] } });

			const commonBadges = await UserBadgesDB.aggregate([
				{ $unwind: '$badges' },
				{ $group: { _id: '$badges', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 5 },
			]);
			const rareBadges = await UserBadgesDB.aggregate([
				{ $unwind: '$badges' },
				{ $group: { _id: '$badges', count: { $sum: 1 } } },
				{ $sort: { count: 1 } },
				{ $limit: 5 },
			]);

			const allIds = [...commonBadges.map(b => b._id), ...rareBadges.map(b => b._id)];
			const badgeNames = await BadgeDB.find({ _id: { $in: allIds } });
			const nameMap = new Map(badgeNames.map(b => [b._id, b.name]));

			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const recentGives = await ImpulseDB('badgelogs').countDocuments({ action: { $in: ['GIVE', 'MASSGIVE'] }, timestamp: { $gte: sevenDaysAgo } });
			const recentTakes = await ImpulseDB('badgelogs').countDocuments({ action: 'TAKE', timestamp: { $gte: sevenDaysAgo } });

			const summaryTable = ImpulseUI.table({
				title: 'Badge Statistics',
				headers: ['Metric', 'Value'],
				rows: [
					['Total Badges', totalBadges.toString()],
					['Users with Badges', totalHolders.toString()],
					['Given (7 days)', recentGives.toString()],
					['Taken (7 days)', recentTakes.toString()],
				],
			});

			const commonTable = ImpulseUI.table({
				title: 'Most Common',
				headers: ['Badge', 'Count'],
				rows: commonBadges.length ? commonBadges.map(b => [`${nameMap.get(b._id) ?? b._id}`, `${b.count}`]) : [['None', '']],
			});

			const rareTable = ImpulseUI.table({
				title: 'Rarest',
				headers: ['Badge', 'Count'],
				rows: rareBadges.length ? rareBadges.map(b => [`${nameMap.get(b._id) ?? b._id}`, `${b.count}`]) : [['None', '']],
			});

			this.sendReply(`|raw|${summaryTable}${commonTable}${rareTable}`);
		},

		async holders(target, room, user) {
			this.checkCan('roomowner');
			if (!this.runBroadcast()) return;
			const badgeId = toID(target);
			if (!badgeId) return this.errorReply("Specify a badge ID.");

			const badge = await BadgeDB.findOne({ _id: badgeId });
			if (!badge) return this.errorReply(`Badge '${badgeId}' not found.`);

			const usersWithBadge = await UserBadgesDB.find({ badges: badgeId });
			if (!usersWithBadge.length) return this.sendReply(`No one has '${badge.name}'.`);

			const holdersTable = ImpulseUI.table({
				title: `Users with '${badge.name}' (${usersWithBadge.length})`,
				headers: ['Username'],
				rows: usersWithBadge.map(u => [Impulse.nameColor(u._id, true, false)]),
			});

			this.sendReply(`|raw|${holdersTable}`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('badgelogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (!logs.length) return this.sendReply('No badge logs found.');

				let content = '<div style="font-family: monospace; font-size: 11px;">';
				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					content += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) content += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});
				content += '</div>';

				const output = ImpulseUI.page(`Badge Logs (Last ${logs.length})`, ImpulseUI.scrollable(content, '370px'));
				this.sendReply(`|raw|${output}`);
			} catch (err) {
				console.error('Error reading badge logs:', err);
				return this.errorReply('Failed to read badge logs.');
			}
		},

		async initeconomy(target, room, user) {
			this.checkCan('roomowner');
			const { created, skipped } = await initBadges(ECONOMY_BADGES, 'economy');
			this.sendReply(`Economy badges: ${created} created, ${skipped} existed.`);
		},

		async initontime(target, room, user) {
			this.checkCan('roomowner');
			const { created, skipped } = await initBadges(ONTIME_BADGES, 'ontime');
			this.sendReply(`Ontime badges: ${created} created, ${skipped} existed.`);
		},

		async deleteall(target, room, user) {
			this.checkCan('roomowner');
	
			const count = await BadgeDB.countDocuments();
			if (count === 0) return this.sendReply('No badges to delete.');
			
			await BadgeDB.deleteMany({});
			await UserBadgesDB.deleteMany({});
			await logBadgeAction('DELETEALL', user.name, 'all', `Deleted ${count} badges`);
	
			this.sendReply(`Deleted all ${count} badges from the database.`);
			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			staffRoom?.add(`|html|<div class="infobox">${Impulse.nameColor(user.name, true)} deleted all badges from the database.</div>`).update();
		},

		''(target, room, user) {
			return this.parse('/help badges');
		},
	},
	badge: 'badges',

	badgeshelp() {
		if (!this.runBroadcast()) return;

		const helpRows = [
			[`<code>/badges list [page]</code> - All badges`],
			[`<code>/badges user [name]</code> - User's badges`],
			[`<code>/badges info [id]</code> - Badge info`],
			[`<code>/badges create [Name], [desc], [img]</code> - Create (&)`],
			[`<code>/badges edit [id], [field], [value]</code> - Edit (&)`],
			[`<code>/badges delete [id]</code> - Delete (&)`],
			[`<code>/badges give [user], [id]</code> - Give (&)`],
			[`<code>/badges take [user], [id]</code> - Take (&)`],
			[`<code>/badges massgive [id], [user1], ...</code> - Bulk give (&)`],
			[`<code>/badges holders [id]</code> - Badge holders (&)`],
			[`<code>/badges stats</code> - Statistics (&)`],
			[`<code>/badges logs [num]</code> - Logs 1-500 (&)`],
			[`<code>/badges initeconomy</code> - Init economy badges (&)`],
			[`<code>/badges initontime</code> - Init ontime badges (&)`],
			[`<code>/badges deleteall</code> - Delete all badges from database (&)`],
		];

		const tableHTML = ImpulseUI.contentTable({
			title: 'Badge Commands',
			rows: helpRows,
		});

		this.sendReplyBox(tableHTML);
	},
	badgehelp: 'badgeshelp',
};
