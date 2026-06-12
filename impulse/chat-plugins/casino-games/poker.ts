import { wrapCommands } from '../../impulse-utils';
import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';

const CASINO_ROOM = 'casino';
const LOBBY_TIMEOUT = 60 * 1000;
const TURN_TIMEOUT = 45 * 1000;

type Suit = '♠' | '♥' | '♣' | '♦';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
	suit: Suit;
	rank: Rank;
	value: number;
}

enum HandRank {
	HighCard, Pair, TwoPair, ThreeOfAKind, Straight, Flush, FullHouse, FourOfAKind, StraightFlush
}

const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
const RANKS: { rank: Rank, value: number }[] = [
	{ rank: '2', value: 2 }, { rank: '3', value: 3 }, { rank: '4', value: 4 },
	{ rank: '5', value: 5 }, { rank: '6', value: 6 }, { rank: '7', value: 7 },
	{ rank: '8', value: 8 }, { rank: '9', value: 9 }, { rank: '10', value: 10 },
	{ rank: 'J', value: 11 }, { rank: 'Q', value: 12 }, { rank: 'K', value: 13 },
	{ rank: 'A', value: 14 }
];

function createDeck(): Card[] {
	const deck: Card[] = [];
	for (const suit of SUITS) {
		for (const { rank, value } of RANKS) {
			deck.push({ suit, rank, value });
		}
	}
	// Shuffle
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
	
	// Special case A, 5, 4, 3, 2
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
	return 0; // Tie
}

function renderCard(card: Card | null): string {
	if (!card) return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;background:#eee;color:#333;">?</span>`;
	const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
	return `<span style="display:inline-block;border:1px solid #777;border-radius:4px;padding:2px 6px;margin:2px;color:${color};background:#fff;"><b>${card.rank}</b>${card.suit}</span>`;
}

function renderHand(hand: Card[], hide = false): string {
	return hand.map(c => renderCard(hide ? null : c)).join('');
}

interface PokerPlayer {
	id: string;
	name: string;
	hand: Card[];
	status: 'playing' | 'folded' | 'called';
	hasActed: boolean;
	roundContribution: number;
	totalContribution: number;
	payoutStr?: string;
}

interface PokerGame {
	roomid: string;
	uid: string;
	mode: 'casino' | 'texas';
	host: string;
	hostName: string;
	ante: number;
	state: 'lobby' | 'flop' | 'ended';
	players: PokerPlayer[];
	communityCards: Card[];
	dealerHand: Card[]; // Only for casino
	deck: Card[];
	
	// Texas specific
	currentBet: number;
	turnIndex: number;
	pot: number;
	timer: NodeJS.Timeout | null;
}

const activeGames = new Map<string, PokerGame>();

async function refundAll(game: PokerGame, message: string) {
	for (const p of game.players) {
		await updateBalance(p.id, p.totalContribution);
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="infobox" style="text-align:center;padding:12px 16px;">` +
			`<b>Poker Game Cancelled</b><hr>` +
			`${message}<br>All players have been refunded.` +
			`</div>`
		).update();
	}
}

function whisperCards(game: PokerGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	for (const p of game.players) {
		const user = Users.get(p.id);
		if (user && user.connected && p.hand.length > 0) {
			user.sendTo(room, `|uhtml|${game.uid}-cards|Your Hole Cards: ${renderHand(p.hand)}`);
		}
	}
}

function updateRoom(game: PokerGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	const modeName = game.mode === 'casino' ? "Casino Hold'em" : "Texas Hold'em";
	let html = `<div class="infobox" style="padding:12px 16px; text-align:center;">`;
	html += `<b>${modeName}</b> (Ante: <b>${game.ante}</b> ${CURRENCY_NAME})<br>Host: ${nameColor(game.hostName, true)}<hr>`;
	
	if (game.state === 'lobby') {
		html += `<b>Players in lobby:</b><br>`;
		if (game.players.length === 0) {
			html += `<i>No players yet</i><br>`;
		} else {
			for (const p of game.players) {
				html += `${nameColor(p.name, true)}<br>`;
			}
		}
		html += `<br>`;
		html += `<button class="button" name="send" value="/poker join" style="padding:6px 20px;margin-right:5px;">Join Game</button>`;
		html += `<button class="button" name="send" value="/poker deal" style="padding:6px 20px;margin-right:5px;">Deal (Host)</button>`;
		html += `<button class="button" name="send" value="/poker end" style="padding:6px 20px;">Cancel Game</button>`;
		html += `<br><br><small>This game will automatically start in 60 seconds.</small>`;
	} else {
		if (game.mode === 'casino') {
			html += `<b>Dealer's Hand:</b><br>`;
			html += renderHand(game.dealerHand, game.state !== 'ended') + `<br><br>`;
			html += `<b>Community Cards:</b><br>`;
			const displayComm = [...game.communityCards];
			while (displayComm.length < 5) displayComm.push(null as any);
			html += renderHand(displayComm, false) + `<br><br>`;
			
			for (const p of game.players) {
				html += `<div style="padding:4px;margin-bottom:4px;border:1px solid #ccc;border-radius:4px;">`;
				html += `<b>${nameColor(p.name, true)}:</b> `;
				if (p.status === 'folded') html += ` <span style="color:red;font-weight:bold;">[Folded]</span>`;
				else if (p.status === 'called') html += ` <span style="color:blue;font-weight:bold;">[Called]</span>`;
				
				if (game.state === 'ended' && p.payoutStr) html += ` &mdash; ${p.payoutStr}`;
				html += `<br>${renderHand(p.hand)}<br>`;
				
				if (game.state === 'flop' && p.status === 'playing') {
					html += `<br><button class="button" name="send" value="/poker call" style="margin-right:5px;padding:4px 12px;">Call (Bet ${game.ante * 2})</button>`;
					html += `<button class="button" name="send" value="/poker fold" style="padding:4px 12px;">Fold</button>`;
				}
				html += `</div>`;
			}
		} else {
			html += `<b>Pot:</b> ${game.pot} ${CURRENCY_NAME}<br><br>`;
			html += `<b>Community Cards:</b><br>`;
			const displayComm = [...game.communityCards];
			while (displayComm.length < 5 && game.state === 'flop') displayComm.push(null as any);
			html += renderHand(displayComm, false) + `<br><br>`;
			
			for (let i = 0; i < game.players.length; i++) {
				const p = game.players[i];
				const isTurn = game.state === 'flop' && game.turnIndex === i;
				
				if (isTurn) html += `<div style="border:2px solid #888;padding:4px;border-radius:4px;margin-bottom:4px;">`;
				else html += `<div style="padding:4px;margin-bottom:4px;border:2px solid transparent;">`;
				
				html += `<b>${nameColor(p.name, true)}:</b> `;
				if (p.status === 'folded') html += ` <span style="color:red;font-weight:bold;">[Folded]</span>`;
				else html += ` <span style="color:gray;">[In: ${p.roundContribution}]</span>`;
				
				if (game.state === 'ended') {
					if (p.payoutStr) html += ` &mdash; ${p.payoutStr}`;
					html += `<br>${renderHand(p.hand)}`;
				} else {
					html += `<br><i>Hole cards hidden</i>`;
				}
				
				if (isTurn) {
					const callAmount = game.currentBet - p.roundContribution;
					html += `<br><br>`;
					if (callAmount > 0) {
						html += `<button class="button" name="send" value="/poker call" style="margin-right:5px;padding:4px 12px;">Call (${callAmount})</button>`;
					} else {
						html += `<button class="button" name="send" value="/poker call" style="margin-right:5px;padding:4px 12px;">Check</button>`;
					}
					html += `<button class="button" name="send" value="/poker raise ${game.ante}" style="margin-right:5px;padding:4px 12px;">Raise (+${game.ante})</button>`;
					html += `<button class="button" name="send" value="/poker fold" style="padding:4px 12px;">Fold</button>`;
				}
				html += `</div>`;
			}
		}
	}
	html += `</div>`;
	
	if (game.state === 'lobby' && game.players.length === 1) {
		room.add(`|uhtml|${game.uid}|${html}`).update();
	} else {
		room.add(`|uhtmlchange|${game.uid}|${html}`).update();
	}
}

async function startDealing(game: PokerGame) {
	if (game.timer) {
		clearTimeout(game.timer);
		game.timer = null;
	}
	game.state = 'flop';
	game.deck = createDeck();
	
	// Deal hole cards
	for (const p of game.players) {
		p.hand.push(game.deck.pop()!, game.deck.pop()!);
	}
	
	if (game.mode === 'casino') {
		game.dealerHand.push(game.deck.pop()!, game.deck.pop()!);
	}
	
	// Flop
	game.communityCards.push(game.deck.pop()!, game.deck.pop()!, game.deck.pop()!);
	
	whisperCards(game);
	
	if (game.mode === 'texas') {
		game.turnIndex = 0;
		game.currentBet = 0;
		for (const p of game.players) {
			p.roundContribution = 0;
			p.hasActed = false;
		}
		setTexasTimer(game);
	}
	
	updateRoom(game);
}

function setTexasTimer(game: PokerGame) {
	if (game.timer) clearTimeout(game.timer);
	game.timer = setTimeout(() => {
		const p = game.players[game.turnIndex];
		if (p) {
			p.status = 'folded';
			void advanceTexasTurn(game);
		}
	}, TURN_TIMEOUT);
}

async function advanceTexasTurn(game: PokerGame) {
	const activePlayers = game.players.filter(p => p.status === 'playing');
	
	// Check if only 1 player remains
	if (activePlayers.length === 1) {
		await endTexasGame(game);
		return;
	}
	
	// Check if betting round is over
	const allMatched = activePlayers.every(p => p.hasActed && p.roundContribution === game.currentBet);
	if (allMatched) {
		await endTexasGame(game);
		return;
	}
	
	// Move to next active player
	do {
		game.turnIndex = (game.turnIndex + 1) % game.players.length;
	} while (game.players[game.turnIndex].status !== 'playing');
	
	setTexasTimer(game);
	updateRoom(game);
}

async function endTexasGame(game: PokerGame) {
	if (game.timer) clearTimeout(game.timer);
	game.state = 'ended';
	
	const activePlayers = game.players.filter(p => p.status === 'playing');
	
	if (activePlayers.length > 1) {
		// Deal turn and river
		game.communityCards.push(game.deck.pop()!, game.deck.pop()!);
	}
	
	let bestHand: ReturnType<typeof evaluateBest7> | null = null;
	let winners: PokerPlayer[] = [];
	
	if (activePlayers.length === 1) {
		winners = [activePlayers[0]];
		activePlayers[0].payoutStr = `<span style="color:green">Won <b>${game.pot}</b> (Others folded)</span>`;
	} else {
		for (const p of activePlayers) {
			const ev = evaluateBest7([...p.hand, ...game.communityCards]);
			p.payoutStr = `<span style="color:gray">${ev.name}</span>`;
			if (!bestHand) {
				bestHand = ev;
				winners = [p];
			} else {
				const cmp = compareHands(ev, bestHand);
				if (cmp > 0) {
					bestHand = ev;
					winners = [p];
				} else if (cmp === 0) {
					winners.push(p);
				}
			}
		}
	}
	
	const splitPot = Math.floor(game.pot / winners.length);
	for (const w of winners) {
		await updateBalance(w.id, splitPot);
		if (activePlayers.length > 1) {
			w.payoutStr = `<span style="color:green;font-weight:bold;">Won <b>${splitPot}</b> (${bestHand!.name})</span>`;
		}
	}
	
	for (const p of game.players) {
		if (p.status === 'folded') p.payoutStr = `<span style="color:red">Lost (Folded)</span>`;
		else if (!winners.includes(p)) p.payoutStr = `<span style="color:red">Lost</span>`;
	}
	
	activeGames.delete(game.roomid);
	updateRoom(game);
}

export const commands: Chat.ChatCommands = wrapCommands({
	poker: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			if (activeGames.has(room.roomid)) return this.errorReply("A poker game is already running in this room.");
			
			const parts = target.split(' ');
			const mode = parts[0]?.toLowerCase();
			const ante = parseInt(parts[1]);
			
			if (!['casino', 'texas'].includes(mode) || isNaN(ante) || ante <= 0) {
				return this.errorReply("Usage: /poker start [casino|texas] [ante]");
			}
			
			const uid = `poker-${room.roomid}-${Date.now()}`;
			const game: PokerGame = {
				roomid: room.roomid,
				uid,
				mode: mode as 'casino' | 'texas',
				host: user.id,
				hostName: user.name,
				ante,
				state: 'lobby',
				players: [],
				communityCards: [],
				dealerHand: [],
				deck: [],
				currentBet: 0,
				turnIndex: 0,
				pot: 0,
				timer: null,
			};
			
			game.timer = setTimeout(() => {
				if (activeGames.has(room.roomid)) {
					const g = activeGames.get(room.roomid)!;
					if (g.state === 'lobby') {
						if (g.players.length > 0) {
							void startDealing(g);
						} else {
							void refundAll(g, 'Lobby timed out.');
							activeGames.delete(room.roomid);
						}
					}
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			updateRoom(game);
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active poker game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");

			const bal = await getBalance(user.id);
			if (bal < game.ante * (game.mode === 'casino' ? 3 : 1)) {
				const required = game.mode === 'casino' ? game.ante * 3 : game.ante;
				return this.errorReply(`You don't have enough ${CURRENCY_NAME} to play. (Requires ${required} to cover potential bets, Balance: ${bal})`);
			}

			await updateBalance(user.id, -game.ante);
			game.pot += game.ante;
			game.players.push({
				id: user.id,
				name: user.name,
				hand: [],
				status: 'playing',
				hasActed: false,
				roundContribution: 0,
				totalContribution: game.ante,
			});

			updateRoom(game);
		},

		async deal(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active poker game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			
			const isHost = typeof user === 'string' ? user === game.host : user.id === game.host;
			if (!isHost) return this.errorReply("Only the host can start dealing.");
			if (game.players.length === 0) return this.errorReply("Cannot deal without any players.");

			void startDealing(game);
		},

		async call(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || game.state !== 'flop') return this.errorReply("There is no active poker game waiting for moves.");
			
			if (game.mode === 'casino') {
				const p = game.players.find(p => p.id === user.id);
				if (!p || p.status !== 'playing') return this.errorReply("You are not active in this game.");
				
				const callBet = game.ante * 2;
				const bal = await getBalance(user.id);
				if (bal < callBet) return this.errorReply(`You don't have enough ${CURRENCY_NAME} to call. (${callBet} required)`);
				
				await updateBalance(user.id, -callBet);
				p.totalContribution += callBet;
				p.status = 'called';
				
				const allActed = game.players.every(pl => pl.status !== 'playing');
				if (allActed) {
					game.state = 'ended';
					game.communityCards.push(game.deck.pop()!, game.deck.pop()!);
					
					const dealerEv = evaluateBest7([...game.dealerHand, ...game.communityCards]);
					const dealerQualifies = dealerEv.rank > HandRank.Pair || (dealerEv.rank === HandRank.Pair && dealerEv.tiebreaker[0] >= 4);
					
					for (const pl of game.players) {
						if (pl.status === 'folded') {
							pl.payoutStr = `<span style="color:red">Lost (Folded)</span>`;
							continue;
						}
						
						const plEv = evaluateBest7([...pl.hand, ...game.communityCards]);
						const cmp = compareHands(plEv, dealerEv);
						
						if (!dealerQualifies) {
							// Dealer doesn't qualify
							const winAmount = game.ante * 2 + game.ante * 2; 
							await updateBalance(pl.id, winAmount);
							pl.payoutStr = `<span style="color:green">Won <b>${game.ante}</b> (Dealer didn't qualify)</span>`;
						} else {
							if (cmp > 0) {
								const winAmount = pl.totalContribution * 2;
								await updateBalance(pl.id, winAmount);
								pl.payoutStr = `<span style="color:green">Won <b>${pl.totalContribution}</b> (${plEv.name})</span>`;
							} else if (cmp === 0) {
								await updateBalance(pl.id, pl.totalContribution);
								pl.payoutStr = `<span style="color:gray">Push (Tie: ${plEv.name})</span>`;
							} else {
								pl.payoutStr = `<span style="color:red">Lost (${plEv.name})</span>`;
							}
						}
					}
					activeGames.delete(room.roomid);
				}
				updateRoom(game);
			} else {
				const p = game.players[game.turnIndex];
				if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
				
				const callAmount = game.currentBet - p.roundContribution;
				if (callAmount > 0) {
					const bal = await getBalance(user.id);
					if (bal < callAmount) return this.errorReply(`You don't have enough to call (${callAmount}).`);
					await updateBalance(user.id, -callAmount);
					p.roundContribution += callAmount;
					p.totalContribution += callAmount;
					game.pot += callAmount;
				}
				
				p.hasActed = true;
				void advanceTexasTurn(game);
			}
		},

		async fold(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || game.state !== 'flop') return this.errorReply("There is no active poker game waiting for moves.");
			
			if (game.mode === 'casino') {
				const p = game.players.find(p => p.id === user.id);
				if (!p || p.status !== 'playing') return this.errorReply("You are not active in this game.");
				
				p.status = 'folded';
				const allActed = game.players.every(pl => pl.status !== 'playing');
				if (allActed) {
					game.state = 'ended';
					game.communityCards.push(game.deck.pop()!, game.deck.pop()!);
					for (const pl of game.players) {
						if (pl.status === 'folded') pl.payoutStr = `<span style="color:red">Lost (Folded)</span>`;
					}
					activeGames.delete(room.roomid);
				}
				updateRoom(game);
			} else {
				const p = game.players[game.turnIndex];
				if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
				
				p.status = 'folded';
				p.hasActed = true;
				void advanceTexasTurn(game);
			}
		},

		async raise(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || game.state !== 'flop') return this.errorReply("There is no active poker game waiting for moves.");
			
			if (game.mode === 'casino') return this.errorReply("You cannot raise in Casino Hold'em.");
			
			const p = game.players[game.turnIndex];
			if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
			
			const raiseAmount = parseInt(target);
			if (isNaN(raiseAmount) || raiseAmount <= 0) return this.errorReply("Usage: /poker raise [amount]");
			
			const callAmount = game.currentBet - p.roundContribution;
			const totalNeeded = callAmount + raiseAmount;
			
			const bal = await getBalance(user.id);
			if (bal < totalNeeded) return this.errorReply(`You don't have enough to raise by ${raiseAmount} (Need ${totalNeeded} total to call and raise).`);
			
			await updateBalance(user.id, -totalNeeded);
			p.roundContribution += totalNeeded;
			p.totalContribution += totalNeeded;
			game.pot += totalNeeded;
			game.currentBet += raiseAmount;
			
			p.hasActed = true;
			for (const pl of game.players) {
				if (pl !== p && pl.status === 'playing') pl.hasActed = false;
			}
			
			void advanceTexasTurn(game);
		},

		async end(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active poker game in this room.");
			
			const canEnd = user.id === game.host || user.can('roommod', null, room);
			if (!canEnd) return this.errorReply("Only the host or a room moderator can cancel the game.");
			if (game.state !== 'lobby') return this.errorReply("The game is already in progress and cannot be cancelled.");

			if (game.timer) clearTimeout(game.timer);
			activeGames.delete(room.roomid);
			await refundAll(game, `Cancelled by ${user.name}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Poker Commands</b></center><hr>` +
				`<b>/poker start casino [ante]</b>: Play Casino Hold'em against the dealer.<br>` +
				`<b>/poker start texas [ante]</b>: Play Texas Hold'em against other players.<hr>` +
				`<b>/poker join</b>: Join the current game.<br>` +
				`<b>/poker deal</b>: Deal the cards (Host only).<br>` +
				`<b>/poker call</b>: Match the current bet.<br>` +
				`<b>/poker raise [amount]</b>: Increase the bet (Texas only).<br>` +
				`<b>/poker fold</b>: Fold your hand.<br>` +
				`<b>/poker end</b>: Cancel the game (Host only).`
			);
		}
	},
	pokerhelp: 'poker help',
});
