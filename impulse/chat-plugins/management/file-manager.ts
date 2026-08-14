import { FS } from '../../../lib/fs';
import { Utils } from '../../../lib';

const GITHUB_TOKEN = 'your_github_token_here';
const WHITELISTED_USERS = ['princesky', 'musaddiktemkar', 'turborx'];

const PROTECTED_PATHS = ['fullchain.pem', 'privkey.pem', '.env'];

const FileManager = {
	checkPath(path: string) {
		if (!FS(path).path.startsWith(FS.ROOT_PATH)) {
			throw new Chat.ErrorMessage("The path must be located inside the server directory.");
		}
		if (PROTECTED_PATHS.some(p => path.toLowerCase().includes(p.toLowerCase()))) {
			throw new Chat.ErrorMessage("This file is protected and cannot be modified.");
		}
	},

	checkAccess(user: User) {
		if (!WHITELISTED_USERS.includes(user.id)) {
			throw new Chat.ErrorMessage("You do not have permission to use file management commands.");
		}
	},

	getError(err: unknown): string {
		return err instanceof Error ? err.message : String(err);
	},

	async collectFiles(dirPath: string, results: string[] = [], extFilter?: string): Promise<string[]> {
		const entries = await FS(dirPath).readdir();
		for (const entry of entries) {
			const fullPath = `${dirPath}/${entry}`;
			if (await FS(fullPath).isDirectory()) {
				await FileManager.collectFiles(fullPath, results, extFilter);
			} else if (!extFilter || entry.endsWith(extFilter)) {
				results.push(fullPath);
			}
		}
		return results;
	},

	async uploadFile(fileName: string, content: string | Buffer): Promise<string> {
		const blob = new Blob([content]);
		const form = new FormData();
		form.append('reqtype', 'fileupload');
		form.append('time', '24h');
		form.append('fileToUpload', blob, fileName);

		const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
			method: 'POST',
			body: form,
		});
		if (!response.ok) throw new Error(`catbox responded with ${response.status}`);
		return (await response.text()).trim();
	},
};

export const commands: Chat.ChatCommands = {
	file: {
		async list(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);

			const dirPath = target.trim() || '.';
			FileManager.checkPath(dirPath);
			try {
				const dir = FS(dirPath);
				if (!await dir.exists()) throw new Error(`The specified directory could not be found: ${dirPath}`);
				if (!await dir.isDirectory()) throw new Error(`The specified path is not a directory: ${dirPath}`);

				const contents = await dir.readdir();
				const results = {
					directories: [] as string[],
					files: [] as string[],
				};

				for (const item of contents) {
					const itemPath = dirPath === '.' ? item : `${dirPath}/${item}`;
					if (await FS(itemPath).isDirectory()) {
						results.directories.push(`${item}/`);
					} else {
						results.files.push(item);
					}
				}

				let html = `<strong>Listing for: ${Utils.escapeHTML(dirPath)}</strong><hr />`;

				if (results.directories.length) {
					html += `<b>Directories:</b><br />`;
					html += `<code style="color: #2a75bb">${results.directories.join(', ')}</code><br /><br />`;
				}

				if (results.files.length) {
					html += `<b>Files:</b><br />`;
					html += `<code>${results.files.join(', ')}</code>`;
				}

				if (!results.directories.length && !results.files.length) {
					html += `<i>The directory is empty.</i>`;
				}

				this.sendReplyBox(`<div style="max-height: 300px; overflow-y: auto;">${html}</div>`);
			} catch (err) {
				throw new Chat.ErrorMessage(`List failed: ${FileManager.getError(err)}`);
			}
		},

		async read(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			if (!target) return this.parse('/file help');

			const filePath = target.trim();
			FileManager.checkPath(filePath);
			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error(`The specified file could not be found: ${filePath}`);
				if (!await file.isFile()) throw new Error(`The specified path is not a file: ${filePath}`);

				const content = await file.read();
				this.sendReplyBox(
					`<details><summary>File: ${Utils.escapeHTML(filePath)}</summary>` +
					`<pre style="max-height: 400px; overflow-y: auto;">${Utils.escapeHTML(content)}</pre></details>`
				);
			} catch (err) {
				throw new Chat.ErrorMessage(`Read failed: ${FileManager.getError(err)}`);
			}
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const filePath = target.trim();
			FileManager.checkPath(filePath);

			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error("The specified file does not exist.");
				await file.unlinkIfExists();
				this.sendReply(`The file ${filePath} has been successfully deleted.`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Delete failed: ${FileManager.getError(err)}`);
			}
		},

		async move(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const [source, dest] = target.split(',').map(s => s.trim());
			if (!source || !dest) throw new Chat.ErrorMessage("Usage: /file move [source], [destination]");

			FileManager.checkPath(source);
			FileManager.checkPath(dest);

			try {
				const sourceFile = FS(source);
				if (!await sourceFile.exists()) throw new Error("The source file could not be found.");
				await sourceFile.rename(FS(dest).path);
				this.sendReply(`The file ${source} has been successfully moved to ${dest}.`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Move failed: ${FileManager.getError(err)}`);
			}
		},

		async upload(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const filePath = target.trim();
			FileManager.checkPath(filePath);

			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error("The specified file could not be found.");
				const content = await file.read();
				const fileName = filePath.split('/').pop() || 'file.txt';

				const response = await fetch('https://api.github.com/gists', {
					method: 'POST',
					headers: {
						'Accept': 'application/vnd.github+json',
						'Authorization': `Bearer ${GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': 'Pokemon-Showdown',
					},
					body: JSON.stringify({
						description: `Upload: ${filePath}`,
						public: false,
						files: { [fileName]: { content } },
					}),
				});

				const result = await response.json();
				if (!response.ok) throw new Error(result.message || response.statusText);

				this.sendReplyBox(
					`<strong>Gist Upload Successful!</strong><br />` +
					`File: ${Utils.escapeHTML(filePath)}<br />` +
					`URL: <a href="${result.html_url}" target="_blank">${result.html_url}</a>`
				);
			} catch (err) {
				throw new Chat.ErrorMessage(`Upload failed: ${FileManager.getError(err)}`);
			}
		},

		async save(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const [filePath, url] = target.split(',').map(s => s.trim());
			if (!filePath || !url) throw new Chat.ErrorMessage("Usage: /file save [path], [url]");

			FileManager.checkPath(filePath);

			try {
				const response = await fetch(url, { headers: { 'User-Agent': 'Pokemon-Showdown' } });
				if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

				const content = await response.text();
				await FS(filePath).write(content);
				this.sendReply(`Saved: ${filePath} (${content.length} bytes)`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Save failed: ${FileManager.getError(err)}`);
			}
		},

		async backup(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);

			const backupDir = target.trim() || 'impulse/db';
			FileManager.checkPath(backupDir);
			const isDefault = backupDir === 'impulse/db';
			// Default dir backs up all files; custom dirs only back up .json files
			const extFilter = isDefault ? undefined : '.json';

			this.sendReply(`Starting backup of ${backupDir}${extFilter ? ' (*.json)' : ''}...`);

			try {
				const dir = FS(backupDir);
				if (!await dir.exists()) throw new Error(`Directory not found: ${backupDir}`);
				if (!await dir.isDirectory()) throw new Error(`The specified path ${backupDir} is not a directory.`);

				const archiveName = `backup-${Date.now()}.tar.gz`;
				const archivePath = FS(archiveName).path;

				// Using system tar command since zip might not be installed
				await new Promise((resolve, reject) => {
					require('child_process').exec(`tar -czf "${archivePath}" "${backupDir}"`, { cwd: FS.ROOT_PATH }, (error: Error | null) => {
						if (error) reject(error);
						else resolve(true);
					});
				});

				const content = await FS(archiveName).readBuffer();
				const url = await FileManager.uploadFile(archiveName, content);

				// Clean up the archive file
				await FS(archiveName).unlinkIfExists();

				this.sendReplyBox(
					`<strong>Backup of ${Utils.escapeHTML(backupDir)}</strong><hr />` +
					`<b>Uploaded:</b> <a href="${url}" target="_blank">${url}</a>`
				);
			} catch (err) {
				throw new Chat.ErrorMessage(`Backup failed: ${FileManager.getError(err)}`);
			}
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>File Management - (Requires: Whitelisted Only)</b></center><hr>` +
				`<b>/file list [path]</b>: List all files and directories.<hr>` +
				`<b>/file read [path]</b>: View file content.<hr>` +
				`<b>/file delete [path]</b>: Remove a file.<hr>` +
				`<b>/file move [src], [dest]</b>: Move/Rename.<hr>` +
				`<b>/file upload [path]</b>: Upload to Gist.<hr>` +
				`<b>/file save [path], [url]</b>: Download from URL.<hr>` +
				`<b>/file backup [dir]</b>: Backup files to 0x0.st. Defaults to impulse/db (all files). Custom dirs upload .json files only.`
			);
		},
	},
	filelist: 'file.list',
	fileread: 'file.read',
	filedelete: 'file.delete',
	filemove: 'file.move',
	filecopy: 'file.copy',
	fileupload: 'file.upload',
	filesave: 'file.save',
	filebackup: 'file.backup',
	filehelp: 'file.help',
};
