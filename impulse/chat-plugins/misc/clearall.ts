const ClearManager = {
	resetRoomUsers(room: Room) {
		const userIds = Object.keys(room.users) as ID[];

		for (const userId of userIds) {
			const u = Users.get(userId);
			if (!u) continue;
			for (const conn of u.connections) {
				u.leaveRoom(room, conn);
			}
		}

		setTimeout(() => {
			for (const userId of userIds) {
				const u = Users.get(userId);
				if (!u?.connected) continue;
				for (const conn of u.connections) {
					u.joinRoom(room, conn);
				}
			}
		}, 1000);
	},

	execute(rooms: Room[]): { cleared: string[], failed: string[] } {
		const cleared: string[] = [];
		const failed: string[] = [];

		for (const room of rooms) {
			if (!room || room.battle) continue;

			if (room.game?.gameid === 'tournament') {
				failed.push(room.id);
				continue;
			}

			if (Array.isArray(room.log?.log)) {
				room.log.log.length = 0;
			}

			this.resetRoomUsers(room);
			cleared.push(room.id);
		}

		return { cleared, failed };
	},
};

export const commands: Chat.ChatCommands = {
	clearall: {
		''(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roommod', null, room);
			if (room.battle) throw new Chat.ErrorMessage("Cannot use clearall in battle rooms.");

			const result = ClearManager.execute([room]);

			if (result.failed.length) {
				throw new Chat.ErrorMessage(`Could not clear ${room.id} because a tournament is currently running.`);
			}

			this.modlog('CLEARALL');
			this.privateModAction(`(${user.name} cleared the room chat.)`);
		},

		global(target, room, user) {
			this.checkCan('roomowner');

			const chatRooms = Rooms.global.chatRooms.filter(r => r && !r.battle);
			const result = ClearManager.execute(chatRooms);

			if (result.cleared.length) {
				this.addGlobalModAction(`${user.name} cleared the chat for all public rooms.`);
				this.sendReply(`Cleared: ${result.cleared.join(', ')}`);
			}

			if (result.failed.length) {
				throw new Chat.ErrorMessage(`Failed to clear (Tournament running): ${result.failed.join(', ')}`);
			}
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Clearall Commands</b></center><hr>` +
				`<b>/clearall</b>: Clears chat in the current room. Requires: % # & ~ <hr>` +
				`<b>/clearall global</b>: Clears chat in all non-battle rooms. Requires: & ~`
			);
		},
	},
	globalclearall: 'clearall.global',
	clearallhelp: 'clearall.help',
};
