/*
* Pokemon Showdown
* News chat-plugin
* @author PrinceSky-Git
* Integration:
* Now uses loginfilter instead of direct users.ts modification.
*/

import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

interface NewsEntry {
	_id?: any;
	title: string;
	postedBy: string;
	desc: string;
	postTime: string;
	timestamp: number;
}

Impulse.serverName = Config.serverName || 'Impulse';

const NewsDB = ImpulseDB<NewsEntry>('news');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const logNewsAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('newslogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to news log:', err);
	}
};

const formatDate = (date: Date = new Date()) => `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;

class NewsManager {
	static async generateNewsDisplay(): Promise<string[]> {
		const news = await NewsDB.find({}, { sort: { timestamp: -1 }, limit: 3, projection: { title: 1, desc: 1, postedBy: 1, postTime: 1 } });
		return news.map(entry =>
			`<center><strong>${entry.title}</strong></center><br>${entry.desc}<br><br><small>-<em> ${Impulse.nameColor(entry.postedBy, true, false)}</em> on ${entry.postTime}</small>`
		);
	}

	static async onUserConnect(user: User) {
		if (!await NewsDB.exists({})) return;
		const news = await this.generateNewsDisplay();
		if (news.length) {
			user.send(`|pm| ${Impulse.serverName} News|${user.getIdentity()}|/raw ${news.join('<hr>')}`);
		}
	}

	static async addNews(title: string, desc: string, user: User): Promise<string> {
		const newsEntry: NewsEntry = {
			title,
			postedBy: user.name,
			desc,
			postTime: formatDate(),
			timestamp: Date.now(),
		};
		await NewsDB.insertOne(newsEntry);
		return `Added: ${title}`;
	}

	static async deleteNews(title: string): Promise<string | null> {
		const result = await NewsDB.deleteOne({ title });
		return result.deletedCount === 0 ? `News "${title}" not found.` : `Deleted: ${title}`;
	}

	static async updateNews(title: string, newDesc: string): Promise<string | null> {
		const result = await NewsDB.updateOne({ title }, { $set: { desc: newDesc } });
		return result.matchedCount === 0 ? `News "${title}" not found.` : `Updated: ${title}`;
	}

	static async getNewsByTitle(title: string): Promise<NewsEntry | null> {
		return await NewsDB.findOne({ title });
	}

	static async deleteOldNews(daysOld = 90): Promise<number> {
		const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
		const result = await NewsDB.deleteMany({ timestamp: { $lt: cutoff } });
		return result.deletedCount || 0;
	}

	static async getNewsCount(): Promise<number> {
		return await NewsDB.countDocuments({});
	}
}

Impulse.NewsManager = NewsManager;

export const loginfilter = function(user: User, oldUser: User | null, userType: string) {
	void NewsManager.onUserConnect(user);
};

export const commands: Chat.ChatCommands = {
	servernews: {
		'': 'view',
		display: 'view',
		async view(target, room, user) {
			const news = await NewsManager.generateNewsDisplay();
			const output = news.length ?
				`<center><strong>Server News:</strong></center>${news.join('<hr>')}` :
				`<center><strong>Server News:</strong></center><center><em>No news.</em></center>`;

			if (this.broadcasting) {
				return this.sendReplyBox(`<div class="infobox-limited">${output}</div>`);
			}
			user.send(`|popup||wide||html|<div class="infobox">${output}</div>`);
		},

		async add(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/help servernewshelp');
			const [title, ...descParts] = target.split(',');
			if (!descParts.length) return this.errorReply("Usage: /servernews add [title], [desc]");

			const trimmedTitle = title.trim();
			const trimmedDesc = descParts.join(',').trim();

			if (await NewsDB.exists({ title: trimmedTitle })) {
				return this.errorReply(`"${trimmedTitle}" exists. Use /servernews update.`);
			}

			await NewsManager.addNews(trimmedTitle, trimmedDesc, user);
			const preview = trimmedDesc.substring(0, 100) + (trimmedDesc.length > 100 ? '...' : '');
			await logNewsAction('ADD', user.name, trimmedTitle, `Desc: ${preview}`);

			this.sendReply(`Added: "${trimmedTitle}"`);
		},

		async update(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/help servernewshelp');
			const [title, ...descParts] = target.split(',');
			if (!descParts.length) return this.errorReply("Usage: /servernews update [title], [new desc]");

			const trimmedTitle = title.trim();
			const newDesc = descParts.join(',').trim();

			const oldNews = await NewsManager.getNewsByTitle(trimmedTitle);
			const result = await NewsManager.updateNews(trimmedTitle, newDesc);
			if (result?.includes('not found')) return this.errorReply(result);

			const oldPreview = oldNews?.desc?.substring(0, 50) || 'N/A';
			const newPreview = newDesc.substring(0, 50);
			await logNewsAction('UPDATE', user.name, trimmedTitle, `Old: ${oldPreview}..., New: ${newPreview}...`);

			this.sendReply(`Updated: "${trimmedTitle}"`);
		},

		remove: 'delete',
		async delete(target, room, user) {
			this.checkCan('roomowner');
			if (!target) return this.parse('/help servernewshelp');

			const trimmedTitle = target.trim();
			const newsItem = await NewsManager.getNewsByTitle(trimmedTitle);
			const result = await NewsManager.deleteNews(trimmedTitle);

			if (result?.includes('not found')) return this.errorReply(result);

			const details = newsItem ? `By: ${newsItem.postedBy}, Date: ${newsItem.postTime}` : 'N/A';
			await logNewsAction('DELETE', user.name, trimmedTitle, details);

			this.sendReply(`Deleted: "${trimmedTitle}"`);
		},

		async count(target, room, user) {
			const count = await NewsManager.getNewsCount();
			this.sendReplyBox(`There ${count === 1 ? 'is' : 'are'} <strong>${count}</strong> news ${count === 1 ? 'item' : 'items'}.`);
		},

		async cleanup(target, room, user) {
			this.checkCan('bypassall');
			const days = Math.max(parseInt(target) || 90, 1);

			const deleted = await NewsManager.deleteOldNews(days);
			await logNewsAction('CLEANUP', user.name, `${deleted} items`, `Removed older than ${days} days`);

			this.sendReply(`Deleted ${deleted} news item(s) older than ${days} days.`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('newslogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (!logs.length) return this.sendReply('No logs found.');

				const rows = logs.map(log => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					return [Chat.escapeHTML(logLine)];
				});

				const tableHTML = ImpulseUI.contentTable({
					title: `News Logs (Last ${logs.length})`,
					rows,
				});

				const scrollable = ImpulseUI.scrollable(tableHTML, '370px');
				this.sendReply(`|raw|${scrollable}`);
			} catch (err) {
				console.error('Error reading news logs:', err);
				return this.errorReply('Failed to read logs.');
			}
		},

		async list(target, room, user) {
			const result = await NewsDB.findPaginated({}, { page: parseInt(target) || 1, limit: 10, sort: { timestamp: -1 } });

			if (result.total === 0) return this.sendReplyBox('No news.');

			const rows = result.docs.map(news => [
				`<strong>${Chat.escapeHTML(news.title)}</strong><br>${news.desc}<br><small>By ${Impulse.nameColor(news.postedBy, true, false)} on ${news.postTime}</small>`,
			]);

			const tableHTML = ImpulseUI.contentTable({
				title: `All News (Page ${result.page}/${result.totalPages})`,
				rows,
			});

			const pagination = ImpulseUI.pagination({
				commandString: '/servernews list',
				currentPage: result.page,
				totalPages: result.totalPages,
				totalResults: result.total,
				resultsPerPage: result.limit,
			});

			this.sendReply(`|raw|${tableHTML}${pagination}`);
		},

		async stats(target, room, user) {
			this.checkCan('roomowner');

			try {
				const total = await NewsDB.countDocuments({});
				const topContributors = await NewsDB.aggregate([
					{ $group: { _id: '$postedBy', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentAdds = await ImpulseDB('newslogs').countDocuments({ action: 'ADD', timestamp: { $gte: sevenDaysAgo } });
				const recentUpdates = await ImpulseDB('newslogs').countDocuments({ action: 'UPDATE', timestamp: { $gte: sevenDaysAgo } });
				const recentDeletes = await ImpulseDB('newslogs').countDocuments({ action: 'DELETE', timestamp: { $gte: sevenDaysAgo } });

				let rows: string[][] = [[`<strong>Total Items:</strong> ${total}`]];

				if (topContributors.length) {
					rows.push([`<strong>Top Contributors:</strong>`]);
					topContributors.forEach(c => rows.push([`${Impulse.nameColor(c._id, true, true)}: ${c.count}`]));
				}

				rows.push([`<strong>Recent (7 Days):</strong>`]);
				rows.push([`Added: ${recentAdds}`]);
				rows.push([`Updated: ${recentUpdates}`]);
				rows.push([`Deleted: ${recentDeletes}`]);

				const tableHTML = ImpulseUI.contentTable({
					title: 'News Statistics',
					rows,
				});

				this.sendReply(`|raw|${tableHTML}`);
			} catch (err) {
				console.error('Error generating stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},
	},
	svn: 'servernews',

	servernewshelp(target, room, user) {
		if (!this.runBroadcast()) return;

		const rows = [
			[`<code>/servernews view</code> - View news (latest 3)`],
			[`<code>/servernews list [page]</code> - List all`],
			[`<code>/servernews add [title], [desc]</code> - Add (&)`],
			[`<code>/servernews update [title], [desc]</code> - Update (&)`],
			[`<code>/servernews delete [title]</code> - Delete (&)`],
			[`<code>/servernews count</code> - Total count`],
			[`<code>/servernews stats</code> - Statistics (&)`],
			[`<code>/servernews cleanup [days]</code> - Cleanup (~)`],
			[`<code>/servernews logs [num]</code> - Logs (&)`],
			[`<small>Alias: /svn. Add/update/delete/stats/logs require &+</small>`],
		];

		const tableHTML = ImpulseUI.contentTable({
			title: 'Server News Commands',
			rows,
		});

		this.sendReplyBox(tableHTML);
	},
	svnhelp: 'servernewshelp',
};
