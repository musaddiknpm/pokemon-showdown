import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM, Suit, type Rank, type Card, SUITS, renderHand } from './shared';
import { Utils } from '../../../lib';
import { RoomGame, RoomGamePlayer } from '../../../server/room-game';

const LOBBY_TIMEOUT = 120 * 1000;
const TURN_TIMEOUT = 15 * 1000;

const HandRank = {
	HighCard: 0, Pair: 1, TwoPair: 2, ThreeOfAKind: 3, Straight: 4, Flush: 5, FullHouse: 6, FourOfAKind: 7, StraightFlush: 8,
} as const;

const RANKS: { rank: Rank, value: number }[] = [
	{ rank: '2', value: 2 }, { rank: '3', value: 3 }, { rank: '4', value: 4 },
	{ rank: '5', value: 5 }, { rank: '6', value: 6 }, { rank: '7', value: 7 },
	{ rank: '8', value: 8 }, { rank: '9', value: 9 }, { rank: '10', value: 10 },
	{ rank: 'J', value: 11 }, { rank: 'Q', value: 12 }, { rank: 'K', value: 13 },
	{ rank: 'A', value: 14 },
];

function createDeck(): Card[] {
	const deck: Card[] = [];
	for (const suit of SUITS) {
		for (const { rank, value } of RANKS) {
			deck.push({ suit, rank, value });
		}
	}
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
}

function getCombinations(arr: Card[], k: number): Card[][] {
	if (k === 1) return arr.map(c => [c]);
	const combos: Card[][] = [];
	for (let i = 0; i <= arr.length - k; i++) {
		const head = arr.slice(i, i + 1);
		const tailCombos = getCombinations(arr.slice(i + 1), k - 1);
		for (const tail of tailCombos) {
			combos.push([...head, ...tail]);
		}
	}
	return combos;
}

function evaluate5(cards: Card[]) {
	const sorted = [...cards].sort((a, b) => b.value - a.value);
	const values = sorted.map(c => c.value);
	const suits = sorted.map(c => c.suit);

	const isFlush = suits.every(s => s === suits[0]);
	let isStraight = values.every((v, i) => i === 0 || v === values[i - 1] - 1);

	if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
		isStraight = true;
		values.push(values.shift()!);
	}

	const counts: Record<number, number> = {};
	for (const v of values) counts[v] = (counts[v] || 0) + 1;
	const countArr = Object.entries(counts).map(([v, c]) => ({ v: Number(v), c })).sort((a, b) => b.c - a.c || b.v - a.v);

	const tiebreaker = countArr.map(x => x.v);

	if (isStraight && isFlush) return { rank: HandRank.StraightFlush, tiebreaker, name: "Straight Flush" };
	if (countArr[0].c === 4) return { rank: HandRank.FourOfAKind, tiebreaker, name: "Four of a Kind" };
	if (countArr[0].c === 3 && countArr[1].c === 2) return { rank: HandRank.FullHouse, tiebreaker, name: "Full House" };
	if (isFlush) return { rank: HandRank.Flush, tiebreaker, name: "Flush" };
	if (isStraight) return { rank: HandRank.Straight, tiebreaker, name: "Straight" };
	if (countArr[0].c === 3) return { rank: HandRank.ThreeOfAKind, tiebreaker, name: "Three of a Kind" };
	if (countArr[0].c === 2 && countArr[1].c === 2) return { rank: HandRank.TwoPair, tiebreaker, name: "Two Pair" };
	if (countArr[0].c === 2) return { rank: HandRank.Pair, tiebreaker, name: "Pair" };
	return { rank: HandRank.HighCard, tiebreaker, name: "High Card" };
}

function evaluateBest7(cards: Card[]) {
	if (cards.length < 5) return { rank: HandRank.HighCard, tiebreaker: [], name: "Incomplete" };
	const combos = getCombinations(cards, 5);
	let best = evaluate5(combos[0]);
	for (let i = 1; i < combos.length; i++) {
		const ev = evaluate5(combos[i]);
		if (ev.rank > best.rank) {
			best = ev;
		} else if (ev.rank === best.rank) {
			for (let j = 0; j < ev.tiebreaker.length; j++) {
				if (ev.tiebreaker[j] > best.tiebreaker[j]) {
					best = ev;
					break;
				} else if (ev.tiebreaker[j] < best.tiebreaker[j]) {
					break;
				}
			}
		}
	}
	return best;
}

function compareHands(handA: ReturnType<typeof evaluateBest7>, handB: ReturnType<typeof evaluateBest7>): number {
	if (handA.rank > handB.rank) return 1;
	if (handA.rank < handB.rank) return -1;
	for (let i = 0; i < handA.tiebreaker.length; i++) {
		if (handA.tiebreaker[i] > handB.tiebreaker[i]) return 1;
		if (handA.tiebreaker[i] < handB.tiebreaker[i]) return -1;
	}
	return 0;
}

class PokerPlayer extends RoomGamePlayer<PokerGame> {
	isAI: boolean;
	hand: Card[] = [];
	status: 'playing' | 'folded' | 'all-in' | 'eliminated' = 'playing';
	chips = 1000;
	roundContribution = 0;
	handContribution = 0;
	hasActed = false;
	eval?: ReturnType<typeof evaluateBest7>;
	payoutStr?: string;

	constructor(user: User | string | null, game: PokerGame, num: number, isAI: boolean) {
		super(user, game, num);
		this.isAI = isAI;
	}
}

export class PokerGame extends RoomGame<PokerPlayer> {
	gameid = 'poker' as ID;
	uid: string;
	host: string;
	hostName: string;
	entryFee: number;
	isTestMode: boolean;
	state: 'lobby' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended' = 'lobby';
	communityCards: Card[] = [];
	deck: Card[] = [];
	pot = 0;
	currentBet = 0;
	turnIndex = 0;
	dealerIndex = 0;
	blinds: { small: number, big: number } = { small: 10, big: 20 };
	handsPlayed = 0;
	timer: NodeJS.Timeout | null = null;
	displayInit = false;
	lastShowdownLog?: string;
	allowRenames = true;
	playerCap = 4;
	checkChat = true;

	constructor(room: Room, host: User, entryFee: number, isTestMode = false) {
		super(room);
		this.title = 'Poker';
		this.uid = `poker-${room.roomid}-${Date.now()}`;
		this.host = host.id;
		this.hostName = host.name;
		this.entryFee = entryFee;
		this.isTestMode = isTestMode;

		this.timer = setTimeout(() => {
			if (this.state === 'lobby') {
				if (this.isTestMode) {
					const requiredAIs = Math.max(3, 4 - this.players.length);
					let aiCount = 1;
					while (this.players.length < 4 && aiCount <= requiredAIs) {
						this.addPlayer(`AI Bot ${aiCount}`, true);
						aiCount++;
					}
				}

				if (this.players.length >= 2) {
					this.dealerIndex = Math.floor(Math.random() * this.players.length);
					this.startNextHand();
				} else {
					void this.refundAll('Lobby timed out due to not enough players.');
					this.destroy();
				}
			}
		}, LOBBY_TIMEOUT);

		activeCasinoGames.set(room.roomid, 'poker');
	}

	makePlayer(user: User | string | null, ...rest: unknown[]): PokerPlayer {
		const num = this.players.length ? this.players[this.players.length - 1].num : 1;
		const isAI = !!rest[0];
		return new PokerPlayer(user, this, num, isAI);
	}

	onRename(user: User, oldUserid: ID, isJoining: boolean, isForceRenamed: boolean) {
		super.onRename(user, oldUserid, isJoining, isForceRenamed);
		this.updateRoom();
	}

	forfeit(user: User | string) {
		const id = typeof user === 'string' ? toID(user) : user.id;
		const player = this.playerTable[id];
		if (!player) return;

		if (this.state === 'lobby') {
			if (!this.isTestMode) void updateBalance(player.id, this.entryFee);
			this.removePlayer(player);
			this.updateRoom();
		} else {
			if (player.status === 'playing' || player.status === 'all-in') {
				player.status = 'folded';
				if (this.players[this.turnIndex] === player) {
					player.hasActed = true;
					this.advanceTurn();
				} else {
					this.updateRoom();
				}
			}
		}
	}

	onConnect(user: User) {
		const html = this.getBoardHtml(user.id);
		user.sendTo(this.roomid, `|uhtml|${this.uid}|${html}`);
	}

	onLeave(user: User, oldUserid?: ID) {
		this.forfeit(user);
	}

	leaveGame(user: User) {
		this.forfeit(user);
	}

	joinGame(user: User) {
		void this.handleJoin(user);
	}

	async handleJoin(user: User) {
		if (this.state !== 'lobby') {
			user.sendTo(this.roomid, "|error|This game has already started.");
			return;
		}
		if (this.players.some(p => p.id === user.id)) {
			user.sendTo(this.roomid, "|error|You are already in this game.");
			return;
		}

		if (!this.isTestMode) {
			const bal = await getBalance(user.id);
			if (bal < this.entryFee) {
				user.sendTo(this.roomid, `|error|You don't have enough ${CURRENCY_NAME} to play. (Requires ${this.entryFee})`);
				return;
			}
			await updateBalance(user.id, -this.entryFee);
		}

		if (!this.addPlayer(user)) {
			if (!this.isTestMode) await updateBalance(user.id, this.entryFee);
			user.sendTo(this.roomid, "|error|You could not join the game (it may be full or you are already in it).");
			return;
		}
		this.updateRoom();
	}

	choose(user: User, text: string) {
		const actionParts = text.trim().toLowerCase().split(' ');
		const action = actionParts[0];

		if (action === 'deal') {
			const isHost = typeof user === 'string' ? user === this.host : user.id === this.host;
			if (!isHost) {
				user.sendTo(this.roomid, "|error|Only the host can start the tournament.");
				return;
			}
			if (this.state !== 'lobby') {
				user.sendTo(this.roomid, "|error|This game has already started.");
				return;
			}
			if (this.players.length < 2) {
				user.sendTo(this.roomid, "|error|You cannot start without at least 2 players.");
				return;
			}
			this.startNextHand();
		} else if (action === 'call') {
			if (['lobby', 'showdown', 'ended'].includes(this.state)) {
				user.sendTo(this.roomid, "|error|There is no active poker game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}

			const callAmount = this.currentBet - currentPlayer.roundContribution;
			if (callAmount > 0) {
				if (currentPlayer.chips <= callAmount) {
					user.sendTo(this.roomid, "|error|You must use 'allin' instead.");
					return;
				}
				currentPlayer.chips -= callAmount;
				currentPlayer.roundContribution += callAmount;
				currentPlayer.handContribution += callAmount;
				this.pot += callAmount;
			}
			currentPlayer.hasActed = true;
			this.advanceTurn();
		} else if (action === 'allin') {
			if (['lobby', 'showdown', 'ended'].includes(this.state)) {
				user.sendTo(this.roomid, "|error|There is no active poker game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}

			const totalNeeded = currentPlayer.chips;
			currentPlayer.chips = 0;
			currentPlayer.roundContribution += totalNeeded;
			currentPlayer.handContribution += totalNeeded;
			this.pot += totalNeeded;
			currentPlayer.status = 'all-in';

			if (currentPlayer.roundContribution > this.currentBet) {
				this.currentBet = currentPlayer.roundContribution;
				for (const pl of this.players) {
					if (pl !== currentPlayer && pl.status === 'playing') pl.hasActed = false;
				}
			}
			currentPlayer.hasActed = true;
			this.advanceTurn();
		} else if (action === 'fold') {
			if (['lobby', 'showdown', 'ended'].includes(this.state)) {
				user.sendTo(this.roomid, "|error|There is no active poker game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}
			currentPlayer.status = 'folded';
			currentPlayer.hasActed = true;
			this.advanceTurn();
		} else if (action === 'raise') {
			if (['lobby', 'showdown', 'ended'].includes(this.state)) {
				user.sendTo(this.roomid, "|error|There is no active poker game waiting for moves.");
				return;
			}
			const currentPlayer = this.players[this.turnIndex];
			if (!currentPlayer || currentPlayer.id !== user.id) {
				user.sendTo(this.roomid, "|error|It's not your turn.");
				return;
			}

			const raiseAmount = parseInt(actionParts[1]);
			if (isNaN(raiseAmount) || raiseAmount <= 0) {
				user.sendTo(this.roomid, "|error|This is an invalid raise amount.");
				return;
			}

			const callAmount = this.currentBet - currentPlayer.roundContribution;
			const totalNeeded = callAmount + raiseAmount;

			if (currentPlayer.chips <= totalNeeded) {
				user.sendTo(this.roomid, "|error|You don't have enough chips. Use 'allin' instead.");
				return;
			}

			currentPlayer.chips -= totalNeeded;
			currentPlayer.roundContribution += totalNeeded;
			currentPlayer.handContribution += totalNeeded;
			this.pot += totalNeeded;
			this.currentBet += raiseAmount;

			for (const pl of this.players) {
				if (pl !== currentPlayer && pl.status === 'playing') pl.hasActed = false;
			}

			currentPlayer.hasActed = true;
			this.advanceTurn();
		}
	}

	async refundAll(message: string) {
		if (!this.isTestMode) {
			for (const p of this.players) {
				if (!p.isAI) await updateBalance(p.id, this.entryFee);
			}
		}
		const room = this.room;
		if (room) {
			room.add(
				`|uhtmlchange|${this.uid}|` +
				`<div class="casino-board">` +
				`<div class="casino-header">Poker Tournament Cancelled</div><hr>` +
				`${Utils.escapeHTML(message)}<br>All players have been refunded their entry fee.` +
				`</div>`
			).update();
		}
	}

	whisperCards() {
		const room = this.room;
		if (!room) return;
		for (const p of this.players) {
			if (p.isAI) continue;
			const user = Users.get(p.id);
			if (user && user.connected && p.hand.length > 0) {
				user.sendTo(room, `|uhtml|${this.uid}-cards|Your Hole Cards: ${renderHand(p.hand)}`);
			}
		}
	}

	getBoardHtml(userId: string | null): string {
		let html = `<div class="casino-board">`;
		html += `<div class="casino-header">Texas Hold'em ${this.isTestMode ? "<small>(Test AI Mode)</small>" : ""} <small>(Entry: <b>${this.isTestMode ? 'Free' : `${this.entryFee} ${CURRENCY_NAME}`}</b>)</small></div>`;
		html += `Host: ${nameColor(this.hostName, true)}<hr>`;

		if (this.state === 'lobby') {
			html += `<div class="casino-player-list">`;
			if (this.players.length === 0) {
				html += `<i>No players yet</i>`;
			} else {
				for (const p of this.players) {
					html += `<div class="casino-player-badge active"><span class="casino-player-name">${nameColor(p.name, true)}</span>Joined</div>`;
				}
			}
			html += `</div><hr>`;
			html += `<div>`;
			if (this.players.length < 4 && (!userId || !this.players.some(p => p.id === userId))) {
				html += `<button class="button casino-btn" name="send" value="/joingame">Join Game</button> `;
			}
			if (userId === this.host) {
				html += `<button class="button casino-btn" name="send" value="/choose deal">Start Tournament (Host)</button> `;
				html += `<button class="button casino-btn" name="send" value="/poker end">Cancel Game</button>`;
			}
			html += `</div>`;
		} else {
			html += `<b>Pot:</b> ${this.pot} Chips | <b>Blinds:</b> ${this.blinds.small}/${this.blinds.big}<br><br>`;

			if (this.lastShowdownLog && (this.state === 'showdown' || this.state === 'ended')) {
				html += `<div style="background: rgba(255,255,255,0.1); border-radius:4px; padding:8px; margin-bottom:8px;"><b>Previous Showdown:</b><br>${this.lastShowdownLog}</div>`;
			}

			const isCompact = this.state === 'showdown' || this.state === 'ended';

			html += `<b>Community Cards:</b><br>`;
			const displayComm = [...this.communityCards];
			while (displayComm.length < 5 && this.state !== 'ended' && this.state !== 'lobby') displayComm.push(null as any);
			html += renderHand(displayComm, false, isCompact) + `<hr>`;

			if (isCompact) {
				html += `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 8px;">`;
				for (let i = 0; i < this.players.length; i++) {
					const p = this.players[i];

					let statusStr = '';
					if (p.status === 'eliminated') statusStr = '<b>Eliminated</b>';
					else if (p.status === 'folded') statusStr = '<b>Folded</b>';
					else if (p.status === 'all-in') statusStr = '<b>All-In</b>';
					else statusStr = `Chips: <b>${p.chips}</b>`;

					let pTitle = `<b>${nameColor(p.name, true)}</b>`;
					if (i === this.dealerIndex) pTitle += ` <b style="color: #FFC107;">(D)</b>`;

					html += `<div style="flex: 1 1 45%; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 4px; border-left: 2px solid ${p.status === 'folded' || p.status === 'eliminated' ? '#888' : '#FFC107'};">`;
					html += `${pTitle}: ${statusStr}`;

					if (p.payoutStr) html += ` <small>${p.payoutStr}</small>`;

					if (p.status !== 'folded' && p.status !== 'eliminated') {
						html += ` <div style="display:inline-block; margin-left:4px;">${renderHand(p.hand, false, true)}</div>`;
					}
					html += `</div>`;
				}
				html += `</div>`;

				if (this.state === 'ended') {
					const winner = this.players.find(p => p.status !== 'eliminated');
					if (winner) {
						let winHtml = '';
						if (!this.isTestMode && !winner.isAI) {
							const totalCoins = this.players.length * this.entryFee;
							winHtml = `<b>${nameColor(winner.name, true)}</b> has won the Poker tournament and won <b>${totalCoins}</b> ${CURRENCY_NAME}!`;
						} else {
							winHtml = `<b>${nameColor(winner.name, true)}</b> has won the Poker tournament!`;
						}
						html += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${winHtml}</div>`;
					}
				}
			} else {
				html += `<div class="casino-player-list">`;
				for (let i = 0; i < this.players.length; i++) {
					const p = this.players[i];
					const isTurn = (this.state === 'preflop' || this.state === 'flop' || this.state === 'turn' || this.state === 'river') && this.turnIndex === i;

					let badgeClass = 'active';
					if (p.status === 'eliminated') badgeClass = 'eliminated';
					else if (p.status === 'folded') badgeClass = 'folded';
					else if (p.status === 'all-in') badgeClass = 'all-in';

					if (isTurn) badgeClass = 'all-in';

					html += `<div class="casino-player-badge ${badgeClass}">`;

					let pTitle = `<span class="casino-player-name">${nameColor(p.name, true)}`;
					if (i === this.dealerIndex) pTitle += ` <b style="color: #FFC107;">(D)</b>`;
					pTitle += `</span>`;

					html += pTitle;

					if (p.status === 'eliminated') html += `<b>Eliminated</b>`;
					else if (p.status === 'folded') html += `<b>Folded</b>`;
					else if (p.status === 'all-in') html += `<b>All-In</b> (In: ${p.handContribution})`;
					else html += `Chips: <b>${p.chips}</b> (In: ${p.handContribution})`;

					if (p.payoutStr) html += `<br>${p.payoutStr}`;

					if (p.status === 'playing' || p.status === 'all-in') {
						html += `<div style="margin-top:4px;"><i>Cards hidden</i></div>`;
					}

					if (isTurn && !p.isAI && userId === p.id) {
						const callAmount = this.currentBet - p.roundContribution;
						html += `<div style="margin-top: 6px; text-align: center;">`;

						if (callAmount > 0) {
							if (p.chips <= callAmount) {
								html += `<button class="button casino-btn" name="send" value="/choose allin">All-In (${p.chips})</button>`;
							} else {
								html += `<button class="button casino-btn" name="send" value="/choose call">Call (${callAmount})</button> `;
								const minRaise = this.blinds.big;
								html += `<button class="button casino-btn" name="send" value="/choose raise ${minRaise}">Raise (+${minRaise})</button> `;
								html += `<button class="button casino-btn" name="send" value="/choose raise ${this.pot}">Pot (+${this.pot})</button> `;
								html += `<button class="button casino-btn" name="send" value="/choose allin">All-In</button>`;
							}
						} else {
							html += `<button class="button casino-btn" name="send" value="/choose call">Check</button> `;
							const minRaise = this.blinds.big;
							html += `<button class="button casino-btn" name="send" value="/choose raise ${minRaise}">Bet (+${minRaise})</button> `;
							html += `<button class="button casino-btn" name="send" value="/choose raise ${this.pot}">Pot (+${this.pot})</button> `;
							html += `<button class="button casino-btn" name="send" value="/choose allin">All-In</button>`;
						}
						html += ` <button class="button casino-btn" name="send" value="/choose fold">Fold</button>`;
						html += `<div style="margin-top: 4px;"><small style="color:#FFC107;">You have 15 seconds to act.</small></div>`;
						html += `</div>`;
					}

					html += `</div>`;
				}
				html += `</div>`;
			}
		}
		html += `</div>`;
		return html;
	}

	updateRoom() {
		const room = this.room;
		if (!room) return;

		if (this.state === 'ended') {
			const html = this.getBoardHtml(null);
			room.add(`|uhtmlchange|${this.uid}|${html}`).update();
			return;
		}

		const boardHtml = this.getBoardHtml(null);

		if (room.log?.log) {
			const originalStart = `|uhtml|${this.uid}|`;
			for (let i = 0; i < room.log.log.length; i++) {
				if (room.log.log[i].startsWith(originalStart)) {
					room.log.log[i] = `${originalStart}${boardHtml}`;
					break;
				}
			}
		}

		if (!this.displayInit) {
			room.add(`|uhtml|${this.uid}|${boardHtml}`).update();
			this.displayInit = true;
		} else {
			for (const id in room.users) {
				const u = room.users[id];
				u.sendTo(room, `|uhtmlchange|${this.uid}|${this.getBoardHtml(u.id)}`);
			}
		}
	}

	aiMakeMove(aiPlayer: PokerPlayer) {
		if (['ended', 'showdown', 'lobby'].includes(this.state)) return;
		if (this.players[this.turnIndex] !== aiPlayer) return;

		const callAmount = this.currentBet - aiPlayer.roundContribution;
		const rand = Math.random();
		let action = 'call';

		if (callAmount > 0) {
			if (rand < 0.15) action = 'fold';
			else if (rand < 0.85) action = 'call';
			else action = 'raise';
		} else {
			if (rand < 0.8) action = 'check';
			else action = 'raise';
		}

		if (action === 'fold') {
			aiPlayer.status = 'folded';
			aiPlayer.hasActed = true;
		} else if (action === 'call' || action === 'check') {
			if (callAmount > 0) {
				if (aiPlayer.chips <= callAmount) {
					const totalNeeded = aiPlayer.chips;
					aiPlayer.chips = 0;
					aiPlayer.roundContribution += totalNeeded;
					aiPlayer.handContribution += totalNeeded;
					this.pot += totalNeeded;
					aiPlayer.status = 'all-in';
					if (aiPlayer.roundContribution > this.currentBet) {
						this.currentBet = aiPlayer.roundContribution;
						for (const pl of this.players) {
							if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
						}
					}
				} else {
					aiPlayer.chips -= callAmount;
					aiPlayer.roundContribution += callAmount;
					aiPlayer.handContribution += callAmount;
					this.pot += callAmount;
				}
			}
			aiPlayer.hasActed = true;
		} else if (action === 'raise') {
			const minRaise = this.blinds.big;
			const totalNeeded = callAmount + minRaise;

			if (aiPlayer.chips <= totalNeeded) {
				const totalNeededAllin = aiPlayer.chips;
				aiPlayer.chips = 0;
				aiPlayer.roundContribution += totalNeededAllin;
				aiPlayer.handContribution += totalNeededAllin;
				this.pot += totalNeededAllin;
				aiPlayer.status = 'all-in';
				if (aiPlayer.roundContribution > this.currentBet) {
					this.currentBet = aiPlayer.roundContribution;
					for (const pl of this.players) {
						if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
					}
				}
			} else {
				aiPlayer.chips -= totalNeeded;
				aiPlayer.roundContribution += totalNeeded;
				aiPlayer.handContribution += totalNeeded;
				this.pot += totalNeeded;
				this.currentBet += minRaise;
				for (const pl of this.players) {
					if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
				}
			}
			aiPlayer.hasActed = true;
		}

		this.advanceTurn();
	}

	triggerNextTurn() {
		const currentPlayer = this.players[this.turnIndex];
		if (currentPlayer && currentPlayer.status === 'playing' && currentPlayer.isAI) {
			this.updateRoom();
			setTimeout(() => this.aiMakeMove(currentPlayer), 2000);
		} else {
			this.setTurnTimer();
			this.updateRoom();
		}
	}

	startNextHand() {
		if (this.timer) clearTimeout(this.timer);

		for (const p of this.players) {
			if (p.chips === 0 && p.status !== 'eliminated') {
				p.status = 'eliminated';
			}
		}

		const active = this.players.filter(p => p.status !== 'eliminated');
		if (active.length === 1) {
			const winner = active[0];
			this.state = 'ended';

			if (!this.isTestMode && !winner.isAI) {
				const totalCoins = this.players.length * this.entryFee;
				void updateBalance(winner.id, totalCoins);
				winner.payoutStr = `<span style="color:green;font-weight:bold">Tournament Winner! (${totalCoins} ${CURRENCY_NAME})</span>`;
			} else {
				winner.payoutStr = `<span style="color:green;font-weight:bold">Tournament Winner! (Test Mode)</span>`;
			}

			this.updateRoom();
			this.destroy();
			return;
		} else if (active.length === 0) {
			this.state = 'ended';
			this.updateRoom();
			this.destroy();
			return;
		}

		this.handsPlayed++;
		if (this.handsPlayed > 1 && this.handsPlayed % 5 === 0) {
			this.blinds.small *= 2;
			this.blinds.big *= 2;
		}

		this.deck = createDeck();
		this.communityCards = [];
		this.pot = 0;
		this.currentBet = 0;
		this.lastShowdownLog = undefined;

		for (const p of this.players) {
			p.hand = [];
			p.roundContribution = 0;
			p.handContribution = 0;
			p.hasActed = false;
			p.eval = undefined;
			p.payoutStr = undefined;
			if (p.status !== 'eliminated') p.status = 'playing';
		}

		do {
			this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
		} while (this.players[this.dealerIndex].status === 'eliminated');

		let sbIndex = this.dealerIndex;
		let bbIndex = this.dealerIndex;

		if (active.length > 2) {
			do { sbIndex = (sbIndex + 1) % this.players.length; } while (this.players[sbIndex].status === 'eliminated');
			bbIndex = sbIndex;
			do { bbIndex = (bbIndex + 1) % this.players.length; } while (this.players[bbIndex].status === 'eliminated');
		} else {
			sbIndex = this.dealerIndex;
			bbIndex = (sbIndex + 1) % this.players.length;
			while (this.players[bbIndex].status === 'eliminated') {
				bbIndex = (bbIndex + 1) % this.players.length;
			}
		}

		const sbAmount = Math.min(this.blinds.small, this.players[sbIndex].chips);
		this.players[sbIndex].chips -= sbAmount;
		this.players[sbIndex].roundContribution = sbAmount;
		this.players[sbIndex].handContribution = sbAmount;
		this.pot += sbAmount;
		if (this.players[sbIndex].chips === 0) this.players[sbIndex].status = 'all-in';

		const bbAmount = Math.min(this.blinds.big, this.players[bbIndex].chips);
		this.players[bbIndex].chips -= bbAmount;
		this.players[bbIndex].roundContribution = bbAmount;
		this.players[bbIndex].handContribution = bbAmount;
		this.pot += bbAmount;
		if (this.players[bbIndex].chips === 0) this.players[bbIndex].status = 'all-in';

		this.currentBet = this.blinds.big;

		for (const p of this.players) {
			if (p.status !== 'eliminated') {
				p.hand.push(this.deck.pop()!, this.deck.pop()!);
			}
		}
		this.whisperCards();

		this.state = 'preflop';

		this.turnIndex = bbIndex;
		do {
			this.turnIndex = (this.turnIndex + 1) % this.players.length;
		} while (this.players[this.turnIndex].status === 'eliminated');

		const ableToAct = this.players.filter(p => p.status === 'playing' && p.chips > 0);
		if (ableToAct.length <= 1 && ableToAct.every(p => p.roundContribution >= this.currentBet)) {
			setTimeout(() => this.nextPhase(), 2000);
			this.updateRoom();
			return;
		}

		this.triggerNextTurn();
	}

	setTurnTimer() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			const p = this.players[this.turnIndex];
			if (p && p.status === 'playing') {
				const callAmount = this.currentBet - p.roundContribution;
				if (callAmount === 0) {
					p.hasActed = true;
				} else {
					p.status = 'folded';
					p.hasActed = true;
				}
				void this.advanceTurn();
			}
		}, TURN_TIMEOUT);
	}

	advanceTurn() {
		const nonFolded = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');

		if (nonFolded.length === 1) {
			const winner = nonFolded[0];
			winner.chips += this.pot;
			this.state = 'showdown';
			winner.payoutStr = `<span style="color:green">Won ${this.pot} (Others folded)</span>`;
			this.lastShowdownLog = `${nameColor(winner.name, true)} won ${this.pot} chips (Others folded)`;
			this.updateRoom();
			setTimeout(() => this.startNextHand(), 5000);
			return;
		}

		const ableToAct = this.players.filter(p => p.status === 'playing' && p.chips > 0);
		const roundOver = ableToAct.every(p => p.hasActed && p.roundContribution === this.currentBet);

		if (roundOver || ableToAct.length === 0) {
			this.nextPhase();
			return;
		}

		do {
			this.turnIndex = (this.turnIndex + 1) % this.players.length;
		} while (this.players[this.turnIndex].status !== 'playing' || this.players[this.turnIndex].chips === 0);

		this.triggerNextTurn();
	}

	nextPhase() {
		if (this.state === 'preflop') {
			this.state = 'flop';
			this.communityCards.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!);
		} else if (this.state === 'flop') {
			this.state = 'turn';
			this.communityCards.push(this.deck.pop()!);
		} else if (this.state === 'turn') {
			this.state = 'river';
			this.communityCards.push(this.deck.pop()!);
		} else if (this.state === 'river') {
			this.doShowdown();
			return;
		}

		this.currentBet = 0;
		for (const p of this.players) {
			p.roundContribution = 0;
			if (p.status === 'playing' && p.chips > 0) p.hasActed = false;
		}

		const ableToAct = this.players.filter(p => p.status === 'playing' && p.chips > 0);
		if (ableToAct.length <= 1) {
			setTimeout(() => this.nextPhase(), 2000);
			this.updateRoom();
			return;
		}

		this.turnIndex = this.dealerIndex;
		do {
			this.turnIndex = (this.turnIndex + 1) % this.players.length;
		} while (this.players[this.turnIndex].status !== 'playing' || this.players[this.turnIndex].chips === 0);

		this.triggerNextTurn();
	}

	buildPots() {
		const pots = [];
		const pList = this.players.filter(p => p.handContribution > 0).sort((a, b) => a.handContribution - b.handContribution);

		let previousContribution = 0;
		for (let i = 0; i < pList.length; i++) {
			const p = pList[i];
			const amount = p.handContribution - previousContribution;
			if (amount > 0) {
				let potSize = 0;
				const eligiblePlayers = [];
				for (let j = i; j < pList.length; j++) {
					potSize += amount;
					if (pList[j].status !== 'folded' && pList[j].status !== 'eliminated') {
						eligiblePlayers.push(pList[j]);
					}
				}
				pots.push({ size: potSize, eligible: eligiblePlayers });
				previousContribution = p.handContribution;
			}
		}
		return pots;
	}

	doShowdown() {
		this.state = 'showdown';
		if (this.timer) clearTimeout(this.timer);

		const pots = this.buildPots();
		const displayLines = [];

		for (let i = 0; i < pots.length; i++) {
			const pot = pots[i];
			if (pot.eligible.length === 0) continue;

			let bestHand: ReturnType<typeof evaluateBest7> | null = null;
			let winners: PokerPlayer[] = [];

			for (const p of pot.eligible) {
				if (!p.eval) p.eval = evaluateBest7([...p.hand, ...this.communityCards]);
				if (!bestHand) {
					bestHand = p.eval;
					winners = [p];
				} else {
					const cmp = compareHands(p.eval, bestHand);
					if (cmp > 0) {
						bestHand = p.eval;
						winners = [p];
					} else if (cmp === 0) {
						winners.push(p);
					}
				}
			}

			if (winners.length > 0) {
				const split = Math.floor(pot.size / winners.length);
				for (const w of winners) {
					w.chips += split;
					w.payoutStr = `<span style="color:green">Won ${split} (${bestHand.name})</span>`;
				}
				const winNames = winners.map(w => nameColor(w.name, true)).join(', ');
				displayLines.push(`Pot ${i + 1} (${pot.size} chips): Won by ${winNames} (${bestHand.name})`);
			}
		}

		this.lastShowdownLog = displayLines.join('<br>');
		this.updateRoom();

		setTimeout(() => this.startNextHand(), 8000);
	}

	destroy() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		activeCasinoGames.delete(this.roomid);
		super.destroy();
	}
}

export const commands: Chat.ChatCommands = {
	poker: {
		start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");
			if (room.game) throw new Chat.ErrorMessage(`A ${room.game.title} game is already running in this room.`);
			if (activeCasinoGames.has(room.roomid)) throw new Chat.ErrorMessage(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);

			const parts = target.trim().split(' ');
			let isTestMode = false;
			let entryFee = 0;

			if (parts[0] && parts[0].toLowerCase() === 'ai') {
				isTestMode = true;
			} else {
				entryFee = parseInt(parts[0]);
				if (isNaN(entryFee) || entryFee <= 0) {
					throw new Chat.ErrorMessage("Usage: /poker start [entryFee] OR /poker start ai");
				}
			}

			const game = new PokerGame(room, user, entryFee, isTestMode);
			game.updateRoom();
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");
			const game = room.getGame(PokerGame);
			if (!game) throw new Chat.ErrorMessage("There is no active poker game in this room.");
			if (game.state !== 'lobby') throw new Chat.ErrorMessage("This game has already started.");
			if (game.players.some(p => p.id === user.id)) throw new Chat.ErrorMessage("You are already in this game.");

			if (!game.isTestMode) {
				const bal = await getBalance(user.id);
				if (bal < game.entryFee) {
					throw new Chat.ErrorMessage(`You don't have enough ${CURRENCY_NAME} to play. (Requires ${game.entryFee})`);
				}
				await updateBalance(user.id, -game.entryFee);
			}

			if (!game.addPlayer(user)) {
				if (!game.isTestMode) await updateBalance(user.id, game.entryFee);
				throw new Chat.ErrorMessage("You could not join the game (it may be full or you are already in it).");
			}
			game.updateRoom();
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) throw new Chat.ErrorMessage("This command can only be used in the Casino room.");
			const game = room.getGame(PokerGame);
			if (!game) throw new Chat.ErrorMessage("There is no active poker game in this room.");

			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) throw new Chat.ErrorMessage("Only the host or a room moderator can cancel the game.");
			if (game.state !== 'lobby') throw new Chat.ErrorMessage("The game is already in progress and cannot be cancelled.");

			await game.refundAll(`Cancelled by ${user.name}.`);
			game.destroy();
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Poker Commands</b></center><hr>` +
				`<b>/poker start [entryFee]</b>: Start a Poker tournament with the given entry fee.<hr>` +
				`<b>/poker start ai</b>: Start a Poker tournament in AI testing mode.<hr>` +
				`<b>/poker end</b>: Cancel the tournament (Host/Moderator only).<hr>` +
				`<i>Note: All other actions (joining, dealing, folding, raising) are performed using the interactive buttons on the game board!</i>`
			);
		},

		rules() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Texas Hold'em Poker Rules</b></center><hr>` +
				`<b>Objective:</b> Win chips by having the best 5-card hand or forcing others to fold.<br><br>` +
				`<b>Gameplay:</b><br>` +
				`- Everyone starts with 1000 chips.<br>` +
				`- You receive 2 private hole cards. 5 community cards are dealt face-up over 4 betting rounds (Pre-flop, Flop, Turn, River).<br>` +
				`- Use any combination of your 2 hole cards and the 5 community cards to make the best 5-card hand.<br><br>` +
				`<b>Actions:</b><br>` +
				`- <b>Check/Call:</b> Match the current bet to stay in the hand.<br>` +
				`- <b>Raise:</b> Increase the bet. Others must match it or fold.<br>` +
				`- <b>Fold:</b> Surrender your cards and any bets you've made.<br>` +
				`- <b>All-In:</b> Bet all your remaining chips. If you have fewer chips than the current bet, you create a "Side Pot".<br><br>` +
				`<b>Tournament:</b><br>` +
				`- Blinds start at 10/20 and double every 5 hands.<br>` +
				`- Lose all your chips and you're eliminated. Last player standing wins the entire entry fee pool!`
			);
		},
	},
	pokerhelp: 'poker help',
	pokerrules: 'poker rules',
};
