/*
* Pokemon Showdown
* Custom Avatars chat-plugin
*/

import { FS } from '../../../lib';
import { ImpulseDB } from '../../impulse-db';
import { ImpulseUI } from '../../modules/table-ui-wrapper';

const AVATAR_PATH = 'config/avatars/';
const STAFF_ROOM_ID = 'staff';
const VALID_EXTENSIONS = ['.jpg', '.png', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FETCH_TIMEOUT = 10000;
const PNG_SIG = [0x89, 0x50, 0x4E, 0x47];
const JPG_SIG = [0xFF, 0xD8, 0xFF];
const GIF_SIG = [0x47, 0x49, 0x46];

const IMAGE_SIGS: { [key: string]: number[] } = {
	'.png': PNG_SIG,
	'.jpg': JPG_SIG,
	'.gif': GIF_SIG,
};

const getAvatarBaseUrl = () => Config.avatarUrl || 'https://impulse-server.fun/avatars/';

const logAvatarAction = async (action: string, staff: string, target: string, details?: string) => {
	try {
		await ImpulseDB('avatarlogs').insertOne({ action, staff, target, details: details || null, timestamp: new Date() });
	} catch (err) {
		console.error('Error writing to avatar log:', err);
	}
};

const isValidImage = (bytes: Uint8Array, ext: string): boolean => {
	const sig = IMAGE_SIGS[ext];
	if (!sig || bytes.length < sig.length) return false;
	return sig.every((byte, i) => bytes[i] === byte);
};

const getExtension = (filename: string): string => {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot === -1) return '';
	const questionMark = filename.indexOf('?', lastDot);
	const ext = questionMark !== -1 ? filename.slice(lastDot, questionMark) : filename.slice(lastDot);
	return ext.toLowerCase();
};

const deleteAllUserAvatarFiles = async (userId: string) => {
	for (const ext of VALID_EXTENSIONS) {
		try {
			await FS(AVATAR_PATH + userId + ext).unlinkIfExists();
		} catch (err) {
			console.error(`Error deleting avatar file ${userId}${ext}:`, err);
		}
	}
};

const downloadImage = async (imageUrl: string, name: string, ext: string): Promise<{ success: boolean; error?: string }> => {
	try {
		let url: URL;
		try {
			url = new URL(imageUrl);
		} catch {
			return { success: false, error: 'Invalid URL format' };
		}

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return { success: false, error: 'Only HTTP/HTTPS URLs are allowed' };
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

		let response;
		try {
			response = await fetch(imageUrl, { signal: controller.signal });
		} catch (err: any) {
			clearTimeout(timeout);
			return { success: false, error: err.name === 'AbortError' ? 'Request timed out' : 'Failed to fetch image' };
		}
		clearTimeout(timeout);

		if (!response.ok) return { success: false, error: `HTTP error ${response.status}` };

		const contentType = response.headers.get('content-type');
		if (!contentType?.startsWith('image/')) return { success: false, error: 'URL does not point to an image' };

		const contentLength = response.headers.get('content-length');
		if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
			return { success: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
		}

		const buffer = await response.arrayBuffer();
		if (buffer.byteLength > MAX_FILE_SIZE) {
			return { success: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
		}

		const uint8 = new Uint8Array(buffer);
		if (!isValidImage(uint8, ext)) return { success: false, error: 'File content does not match extension or is corrupted' };

		await FS(AVATAR_PATH).parentDir().mkdirp();
		await FS(AVATAR_PATH + name + ext).write(Buffer.from(buffer));
		return { success: true };
	} catch (err) {
		console.error('Error downloading avatar:', err instanceof Error ? err.message : err);
		return { success: false, error: 'An unexpected error occurred' };
	}
};

const saveAvatarMetadata = async (userId: string, filename: string, setBy: string, sourceUrl: string) => {
	await ImpulseDB('customavatars').upsert({ userid: userId }, {
		$set: { userid: userId, filename, setBy, sourceUrl, updatedAt: new Date() },
	});
};

const removeAvatarMetadata = async (userId: string) => {
	await ImpulseDB('customavatars').deleteOne({ userid: userId });
};

const displayAvatar = (filename: string) => {
	const url = `${getAvatarBaseUrl()}${filename}?v=${Date.now()}`;
	return `<img src='${url}' width='80' height='80'>`;
};

export const commands: Chat.ChatCommands = {
	customavatar: {
		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, avatarUrl] = target.split(',').map(s => s.trim());
			if (!name || !avatarUrl) return this.parse('/help customavatar');

			const userId = toID(name);
			if (!userId) return this.errorReply('Invalid username.');

			const processedUrl = /^https?:\/\//i.test(avatarUrl) ? avatarUrl : `https://${avatarUrl}`;
			const ext = getExtension(processedUrl);

			if (!VALID_EXTENSIONS.includes(ext)) {
				return this.errorReply('Image URL must end with .jpg, .png, or .gif extension.');
			}

			await deleteAllUserAvatarFiles(userId);
			this.sendReply('Downloading avatar...');

			const avatarFilename = userId + ext;
			const result = await downloadImage(processedUrl, userId, ext);

			if (!result.success) {
				await logAvatarAction('SET FAILED', user.name, userId, result.error);
				return this.errorReply(`Failed to download avatar: ${result.error}`);
			}

			if (!Users.Avatars.addPersonal(userId, avatarFilename)) {
				await FS(AVATAR_PATH + avatarFilename).unlinkIfExists();
				await logAvatarAction('SET FAILED', user.name, userId, 'Avatar system rejected');
				return this.errorReply('Failed to set avatar in the system. User may already have this avatar.');
			}

			Users.Avatars.save(true);
			await saveAvatarMetadata(userId, avatarFilename, user.id, processedUrl);
			await logAvatarAction('SET', user.name, userId, `Filename: ${avatarFilename}, URL: ${processedUrl}`);

			const avatar = displayAvatar(avatarFilename);
			this.sendReply(`|raw|${name}'s avatar was successfully set. Avatar:<p>${avatar}</p>`);

			const targetUser = Users.get(userId);
			if (targetUser) {
				targetUser.popup(`|html|${Impulse.nameColor(user.name, true, true)} set your custom avatar.<p>${avatar}</p><p>Use <code>/avatars</code> to see your custom avatars!</p>`);
				targetUser.avatar = avatarFilename;
			}

			const staffRoom = Rooms.get(STAFF_ROOM_ID);
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox"><center><strong>${Impulse.nameColor(user.name, true, true)} set custom avatar for ${Impulse.nameColor(userId, true, true)}:</strong><br>${avatar}</center></div>`).update();
			}
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const userId = toID(target);
			if (!userId) return this.errorReply('Invalid username.');

			const userAvatars = Users.Avatars.avatars[userId];
			if (!userAvatars?.allowed.length) return this.errorReply(`${target} does not have a custom avatar.`);

			const personalAvatar = userAvatars.allowed[0];
			if (!personalAvatar || personalAvatar.startsWith('#')) {
				return this.errorReply(`${target} does not have a personal avatar.`);
			}

			try {
				Users.Avatars.removeAllowed(userId, personalAvatar);
				Users.Avatars.save(true);
				await deleteAllUserAvatarFiles(userId);
				await removeAvatarMetadata(userId);
				await logAvatarAction('DELETE', user.name, userId, `Removed: ${personalAvatar}`);

				const targetUser = Users.get(userId);
				if (targetUser) {
					targetUser.popup(`|html|${Impulse.nameColor(user.name, true, true)} has deleted your custom avatar.`);
					targetUser.avatar = 1;
				}

				this.sendReply(`${target}'s avatar has been removed.`);

				const staffRoom = Rooms.get(STAFF_ROOM_ID);
				if (staffRoom) {
					staffRoom.add(`|html|<div class="infobox"><strong>${Impulse.nameColor(user.name, true, true)} deleted custom avatar for ${Impulse.nameColor(userId, true, true)}.</strong></div>`).update();
				}
			} catch (err) {
				console.error('Error deleting avatar:', err);
				await logAvatarAction('DELETE FAILED', user.name, userId, err instanceof Error ? err.message : 'Unknown error');
				return this.errorReply('An error occurred while deleting the avatar.');
			}
		},

		async list(target, room, user) {
			this.checkCan('roomowner');

			const page = parseInt(target) || 1;
			const result = await ImpulseDB('customavatars').findPaginated({}, { page, limit: 20, sort: { userid: 1 } });

			if (result.total === 0) return this.sendReply('No custom avatars have been set.');
			if (page < 1 || page > result.totalPages) {
				return this.errorReply(`Invalid page number. Please use a page between 1 and ${result.totalPages}.`);
			}

			const baseUrl = getAvatarBaseUrl();
			const rows: string[][] = result.docs.map(doc => [
				Impulse.nameColor(doc.userid, true, true),
				`<img src="${baseUrl}${doc.filename}" width="80" height="80">`,
				Chat.escapeHTML(doc.filename),
				Chat.escapeHTML(doc.setBy || 'Unknown'),
			]);

			let output = ImpulseUI.table({
				title: `Custom Avatars (Page ${page}/${result.totalPages})`,
				headers: ['User', 'Avatar', 'Filename', 'Set By'],
				rows,
			});

			if (result.totalPages > 1) {
				output += `<div class="pad"><center>`;
				if (result.hasPrev) output += `<button class="button" name="send" value="/customavatar list ${page - 1}">Previous</button> `;
				if (result.hasNext) output += `<button class="button" name="send" value="/customavatar list ${page + 1}">Next</button>`;
				output += `</center></div>`;
			}

			this.sendReply(`|raw|${output}`);
		},

		async count(target, room, user) {
			this.checkCan('roomowner');
			const count = await ImpulseDB('customavatars').countDocuments({});
			this.sendReply(`There are currently ${count} custom avatar(s) set.`);
		},

		async logs(target, room, user) {
			this.checkCan('roomowner');

			try {
				const numLines = Math.min(Math.max(parseInt(target) || 50, 1), 500);
				const logs = await ImpulseDB('avatarlogs').find({}, { sort: { timestamp: -1 }, limit: numLines });

				if (logs.length === 0) return this.sendReply('No avatar logs found.');

				let output = `<div class="ladder pad"><h2>Avatar Logs (Last ${logs.length} entries)</h2><div style="max-height: 370px; overflow: auto; font-family: monospace; font-size: 11px;">`;

				logs.forEach((log, i) => {
					const logLine = `[${log.timestamp.toISOString()}] ${log.action} | Staff: ${log.staff} | Target: ${log.target}${log.details ? ` | ${log.details}` : ''}`;
					output += `<div style="padding: 8px 0;">${Chat.escapeHTML(logLine)}</div>`;
					if (i < logs.length - 1) output += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 0;">`;
				});

				this.sendReply(`|raw|${output}</div></div>`);
			} catch (err) {
				console.error('Error reading avatar logs:', err);
				return this.errorReply('Failed to read avatar logs.');
			}
		},

		async stats(target, room, user) {
			this.checkCan('roomowner');

			try {
				const total = await ImpulseDB('customavatars').countDocuments({});
				const byExtension = await ImpulseDB('customavatars').aggregate([
					{ $group: { _id: { $substr: ['$filename', { $subtract: [{ $strLenCP: '$filename' }, 4] }, 4] }, count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
				]);
				const topStaff = await ImpulseDB('avatarlogs').aggregate([
					{ $match: { action: 'SET' } },
					{ $group: { _id: '$staff', count: { $sum: 1 } } },
					{ $sort: { count: -1 } },
					{ $limit: 5 },
				]);

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				const recentSets = await ImpulseDB('avatarlogs').countDocuments({
					action: 'SET',
					timestamp: { $gte: sevenDaysAgo },
				});
				const recentDeletes = await ImpulseDB('avatarlogs').countDocuments({
					action: 'DELETE',
					timestamp: { $gte: sevenDaysAgo },
				});

				let output = `<div class="ladder pad"><h2>Custom Avatar Statistics</h2><p><strong>Total:</strong> ${total}</p>`;

				if (byExtension.length > 0) {
					output += `<p><strong>By File Type:</strong></p><ul>`;
					byExtension.forEach(ext => output += `<li>${Chat.escapeHTML(ext._id)}: ${ext.count}</li>`);
					output += `</ul>`;
				}

				if (topStaff.length > 0) {
					output += `<p><strong>Most Active Staff:</strong></p><ul>`;
					topStaff.forEach(staff => output += `<li>${Chat.escapeHTML(staff._id)}: ${staff.count}</li>`);
					output += `</ul>`;
				}

				output += `<p><strong>Recent (7 Days):</strong></p><ul><li>Set: ${recentSets}</li><li>Deleted: ${recentDeletes}</li></ul></div>`;
				this.sendReply(`|raw|${output}`);
			} catch (err) {
				console.error('Error generating avatar stats:', err);
				return this.errorReply('Failed to generate statistics.');
			}
		},
	},
	ca: 'customavatar',

	customavatarhelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<div><b><center>Custom Avatar Commands</center></b><br><ul>` +
			`<li><code>/ca set [user], [url]</code> - Set avatar</li>` +
			`<li><code>/ca delete [user]</code> - Remove avatar</li>` +
			`<li><code>/ca list [page]</code> - List all avatars</li>` +
			`<li><code>/ca count</code> - Total count</li>` +
			`<li><code>/ca stats</code> - Statistics</li>` +
			`<li><code>/ca logs [num]</code> - View logs (1-500)</li>` +
			`</ul><small>Requires &+ permission. Max 5MB. Formats: JPG, PNG, GIF</small></div>`
		);
	},
	cahelp: 'customavatarhelp',
};
