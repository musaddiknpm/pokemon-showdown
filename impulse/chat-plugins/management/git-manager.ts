import { FS, Utils } from '../../../lib';
import { exec } from 'child_process';

const GITHUB_TOKEN = 'your_github_token_here';
const WHITELISTED_USERS = ['princesky', 'musaddiktemkar'];

const GitManager = {
	async findRoot(startPath: string): Promise<string | null> {
		let currentPath = FS(startPath);
		while (true) {
			if (await FS(`${currentPath.path}/.git`).exists()) return currentPath.path;
			const parentPath = currentPath.parentDir();
			if (parentPath.path === currentPath.path) return null;
			currentPath = parentPath;
		}
	},

	execute(command: string, gitRoot: string): Promise<string> {
		return new Promise((resolve, reject) => {
			exec(command, {
				cwd: gitRoot,
				encoding: 'utf8',
				timeout: 30000,
			}, (error, stdout, stderr) => {
				if (error) {
					reject(new Chat.ErrorMessage(`${command} failed: ${error.message}\n${stderr}`));
				} else {
					// Git often uses stderr for status info even on success
					resolve(stdout || stderr || 'Command executed successfully.');
				}
			});
		});
	},

	render(title: string, output: string) {
		return `<details><summary><strong>${title}</strong></summary><pre style="white-space: pre-wrap;">${Utils.escapeHTML(output)}</pre></details>`;
	},
};

export const commands: Chat.ChatCommands = {
	git: {
		async add(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");
			if (!target) return this.errorReply("Specify files to add (e.g., '.', 'filename.ts').");

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			const cmd = `sudo git add ${target}`;
			const output = await GitManager.execute(cmd, gitRoot);
			this.sendReplyBox(GitManager.render(cmd, output));
		},

		async commit(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");
			if (!target) return this.errorReply("You must provide a commit message.");

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			// Escaping message for shell safety
			const message = target.replace(/"/g, '\\"');
			const cmd = `sudo git commit -m "${message}"`;
			const output = await GitManager.execute(cmd, gitRoot);
			this.sendReplyBox(GitManager.render(cmd, output));
		},

		async stash(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			const args = target.split(' ').map(s => s.trim()).filter(Boolean);
			const subCommand = args[0]?.toLowerCase();
			const subcommands = ['list', 'show', 'drop', 'pop', 'apply', 'branch', 'clear', 'create', 'store', 'push'];

			let cmd = 'sudo git stash';
			if (subcommands.includes(subCommand)) {
				cmd = `sudo git stash ${target}`;
			} else {
				const identifier = `impulse-stash-${Date.now()}`;
				cmd = `sudo git stash push -u -m "${identifier}" ${target}`;
			}

			const output = await GitManager.execute(cmd, gitRoot);
			this.sendReplyBox(GitManager.render(cmd, output));
		},

		async checkout(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");
			if (!target) return this.parse('/git help');

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			const cmd = `sudo git checkout ${target}`;
			const output = await GitManager.execute(cmd, gitRoot);
			this.sendReplyBox(GitManager.render(cmd, output));
		},

		async pull(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			const output = await GitManager.execute('sudo git pull', gitRoot);
			this.sendReplyBox(GitManager.render('Git Pull', output));
		},

		async status(target, room, user) {
			this.checkCan('bypassall');
			if (!WHITELISTED_USERS.includes(user.id)) return this.errorReply("Access denied.");

			const gitRoot = await GitManager.findRoot(FS.ROOT_PATH);
			if (!gitRoot) throw new Chat.ErrorMessage("Git root not found.");

			const output = await GitManager.execute('sudo git status', gitRoot);
			this.sendReplyBox(GitManager.render('Git Status', output));
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Git Workflow Commands - (Requires: Whitelisted Only)</b></center><hr>` +
				`<b>/git add [files]</b>: Stage changes for commit.<hr>` +
				`<b>/git commit [message]</b>: Commit staged changes.<hr>` +
				`<b>/git pull</b>: Pull latest changes.<hr>` +
				`<b>/git status</b>: Check repository status.<hr>` +
				`<b>/git checkout [target]</b>: Switch branches or restore files.<hr>` +
				`<b>/git stash [options]</b>: Manage stashes (list, pop, apply).`
			);
		},
	},
	gitadd: 'git.add',
	gitcommit: 'git.commit',
	gitpull: 'git.pull',
	gitstatus: 'git.status',
	gitstash: 'git.stash',
	gitcheckout: 'git.checkout',
	githelp: 'git.help',
};
