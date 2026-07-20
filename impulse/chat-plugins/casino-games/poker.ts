import { getBalance, updateBalance, CURRENCY_NAME } from '../economy/economy';
import { nameColor } from '../customization/custom-color';
import { activeCasinoGames, CASINO_ROOM, Suit, Rank, Card, SUITS, renderHand } from './shared';

const LOBBY_TIMEOUT = 120 * 1000;
const TURN_TIMEOUT = 15 * 1000;



enum HandRank {
	HighCard, Pair, TwoPair, ThreeOfAKind, Straight, Flush, FullHouse, FourOfAKind, StraightFlush
}


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



interface PokerPlayer {
	id: string;
	name: string;
	isAI?: boolean;
	hand: Card[];
	status: 'playing' | 'folded' | 'all-in' | 'eliminated';
	chips: number;
	roundContribution: number;
	handContribution: number;
	hasActed: boolean;
	eval?: ReturnType<typeof evaluateBest7>;
	payoutStr?: string;
}

interface PokerGame {
	roomid: string;
	uid: string;
	host: string;
	hostName: string;
	entryFee: number;
	isTestMode?: boolean;
	state: 'lobby' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended';
	players: PokerPlayer[];
	communityCards: Card[];
	deck: Card[];
	pot: number;
	currentBet: number;
	turnIndex: number;
	dealerIndex: number;
	blinds: { small: number, big: number };
	handsPlayed: number;
	timer: NodeJS.Timeout | null;
	displayInit?: boolean;
	lastShowdownLog?: string;
}

const activeGames = new Map<string, PokerGame>();

async function refundAll(game: PokerGame, message: string) {
	if (!game.isTestMode) {
		for (const p of game.players) {
			if (!p.isAI) await updateBalance(p.id, game.entryFee);
		}
	}
	const room = Rooms.get(game.roomid);
	if (room) {
		room.add(
			`|uhtmlchange|${game.uid}|` +
			`<div class="casino-board">` +
			`<div class="casino-header">Poker Tournament Cancelled</div><hr>` +
			`${message}<br>All players have been refunded their entry fee.` +
			`</div>`
		).update();
	}
}

function whisperCards(game: PokerGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	for (const p of game.players) {
		if (p.isAI) continue;
		const user = Users.get(p.id);
		if (user && user.connected && p.hand.length > 0) {
			user.sendTo(room, `|uhtml|${game.uid}-cards|Your Hole Cards: ${renderHand(p.hand)}`);
		}
	}
}

function getBoardHtml(game: PokerGame, userId: string | null): string {
	let html = `<div class="casino-board">`;
	html += `<div class="casino-header">Texas Hold'em ${game.isTestMode ? "<small>(Test AI Mode)</small>" : ""} <small>(Entry: <b>${game.isTestMode ? 'Free' : game.entryFee + ' ' + CURRENCY_NAME}</b>)</small></div>`;
	html += `Host: ${nameColor(game.hostName, true)}<hr>`;
	
	if (game.state === 'lobby') {
		html += `<div class="casino-player-list">`;
		if (game.players.length === 0) {
			html += `<i>No players yet</i>`;
		} else {
			for (const p of game.players) {
				html += `<div class="casino-player-badge active"><span class="casino-player-name">${nameColor(p.name, true)}</span>Joined</div>`;
			}
		}
		html += `</div><hr>`;
		html += `<div>`;
		if (game.players.length < 4 && (!userId || !game.players.some(p => p.id === userId))) {
			html += `<button class="button casino-btn" name="send" value="/poker join">Join Game</button> `;
		}
		if (userId === game.host) {
			html += `<button class="button casino-btn" name="send" value="/poker deal">Start Tournament (Host)</button> `;
			html += `<button class="button casino-btn" name="send" value="/poker end">Cancel Game</button>`;
		}
		html += `</div>`;
	} else {
		html += `<b>Pot:</b> ${game.pot} Chips | <b>Blinds:</b> ${game.blinds.small}/${game.blinds.big}<br><br>`;
		
		if (game.lastShowdownLog && (game.state === 'showdown' || game.state === 'ended')) {
			html += `<div style="background: rgba(255,255,255,0.1); border-radius:4px; padding:8px; margin-bottom:8px;"><b>Previous Showdown:</b><br>${game.lastShowdownLog}</div>`;
		}
		
		const isCompact = game.state === 'showdown' || game.state === 'ended';
		
		html += `<b>Community Cards:</b><br>`;
		const displayComm = [...game.communityCards];
		while (displayComm.length < 5 && game.state !== 'ended' && game.state !== 'lobby') displayComm.push(null as any);
		html += renderHand(displayComm, false, isCompact) + `<hr>`;
		
		if (isCompact) {
			html += `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 8px;">`;
			for (let i = 0; i < game.players.length; i++) {
				const p = game.players[i];
				
				let statusStr = '';
				if (p.status === 'eliminated') statusStr = '<b>Eliminated</b>';
				else if (p.status === 'folded') statusStr = '<b>Folded</b>';
				else if (p.status === 'all-in') statusStr = '<b>All-In</b>';
				else statusStr = `Chips: <b>${p.chips}</b>`;
				
				let pTitle = `<b>${nameColor(p.name, true)}</b>`;
				if (i === game.dealerIndex) pTitle += ` <b style="color: #FFC107;">(D)</b>`;
				
				html += `<div style="flex: 1 1 45%; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 4px; border-left: 2px solid ${p.status === 'folded' || p.status === 'eliminated' ? '#888' : '#FFC107'};">`;
				html += `${pTitle}: ${statusStr}`;
				
				if (p.payoutStr) html += ` <small>${p.payoutStr}</small>`;
				
				if (p.status !== 'folded' && p.status !== 'eliminated') {
					html += ` <div style="display:inline-block; margin-left:4px;">${renderHand(p.hand, false, true)}</div>`;
				}
				html += `</div>`;
			}
			html += `</div>`;
			
			if (game.state === 'ended') {
				const winner = game.players.find(p => p.status !== 'eliminated');
				if (winner) {
					let winHtml = '';
					if (!game.isTestMode && !winner.isAI) {
						const totalCoins = game.players.length * game.entryFee;
						winHtml = `<b>${nameColor(winner.name, true)}</b> has won the Poker tournament and won <b>${totalCoins}</b> ${CURRENCY_NAME}!`;
					} else {
						winHtml = `<b>${nameColor(winner.name, true)}</b> has won the Poker tournament!`;
					}
					html += `<div style="text-align: center; font-size: 1.1em; color: #FFC107;">${winHtml}</div>`;
				}
			}
		} else {
			html += `<div class="casino-player-list">`;
			for (let i = 0; i < game.players.length; i++) {
				const p = game.players[i];
				const isTurn = (game.state === 'preflop' || game.state === 'flop' || game.state === 'turn' || game.state === 'river') && game.turnIndex === i;
				
				let badgeClass = 'active';
				if (p.status === 'eliminated') badgeClass = 'eliminated';
				else if (p.status === 'folded') badgeClass = 'folded';
				else if (p.status === 'all-in') badgeClass = 'all-in';
				
				if (isTurn) badgeClass = 'all-in';
				
				html += `<div class="casino-player-badge ${badgeClass}">`;
				
				let pTitle = `<span class="casino-player-name">${nameColor(p.name, true)}`;
				if (i === game.dealerIndex) pTitle += ` <b style="color: #FFC107;">(D)</b>`;
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
					const callAmount = game.currentBet - p.roundContribution;
					html += `<div style="margin-top: 6px; text-align: center;">`;
					
					if (callAmount > 0) {
						if (p.chips <= callAmount) {
							html += `<button class="button casino-btn" name="send" value="/poker allin">All-In (${p.chips})</button>`;
						} else {
							html += `<button class="button casino-btn" name="send" value="/poker call">Call (${callAmount})</button> `;
							let minRaise = game.blinds.big;
							html += `<button class="button casino-btn" name="send" value="/poker raise ${minRaise}">Raise (+${minRaise})</button> `;
							html += `<button class="button casino-btn" name="send" value="/poker raise ${game.pot}">Pot (+${game.pot})</button> `;
							html += `<button class="button casino-btn" name="send" value="/poker allin">All-In</button>`;
						}
					} else {
						html += `<button class="button casino-btn" name="send" value="/poker call">Check</button> `;
						let minRaise = game.blinds.big;
						html += `<button class="button casino-btn" name="send" value="/poker raise ${minRaise}">Bet (+${minRaise})</button> `;
						html += `<button class="button casino-btn" name="send" value="/poker raise ${game.pot}">Pot (+${game.pot})</button> `;
						html += `<button class="button casino-btn" name="send" value="/poker allin">All-In</button>`;
					}
					html += ` <button class="button casino-btn" name="send" value="/poker fold">Fold</button>`;
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

function updateRoom(game: PokerGame) {
	const room = Rooms.get(game.roomid);
	if (!room) return;
	
	if (game.state === 'ended') {
		const html = getBoardHtml(game, null);
		room.add(`|uhtmlchange|${game.uid}|${html}`).update();
		return;
	}

	const boardHtml = getBoardHtml(game, null);
	
	if (room.log && room.log.log) {
		const originalStart = `|uhtml|${game.uid}|`;
		for (let i = 0; i < room.log.log.length; i++) {
			if (room.log.log[i].startsWith(originalStart)) {
				room.log.log[i] = `${originalStart}${boardHtml}`;
				break;
			}
		}
	}
	
	if (!game.displayInit) {
		room.add(`|uhtml|${game.uid}|${boardHtml}`).update();
		game.displayInit = true;
	} else {
		for (const id in room.users) {
			const u = room.users[id];
			u.sendTo(room, `|uhtmlchange|${game.uid}|${getBoardHtml(game, u.id)}`);
		}
	}
}

function aiMakeMove(game: PokerGame, aiPlayer: PokerPlayer) {
	if (['ended', 'showdown', 'lobby'].includes(game.state)) return;
	if (game.players[game.turnIndex] !== aiPlayer) return;
	
	const callAmount = game.currentBet - aiPlayer.roundContribution;
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
				game.pot += totalNeeded;
				aiPlayer.status = 'all-in';
				if (aiPlayer.roundContribution > game.currentBet) {
					game.currentBet = aiPlayer.roundContribution;
					for (const pl of game.players) {
						if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
					}
				}
			} else {
				aiPlayer.chips -= callAmount;
				aiPlayer.roundContribution += callAmount;
				aiPlayer.handContribution += callAmount;
				game.pot += callAmount;
			}
		}
		aiPlayer.hasActed = true;
	} else if (action === 'raise') {
		const minRaise = game.blinds.big;
		const totalNeeded = callAmount + minRaise;
		
		if (aiPlayer.chips <= totalNeeded) {
			const totalNeededAllin = aiPlayer.chips;
			aiPlayer.chips = 0;
			aiPlayer.roundContribution += totalNeededAllin;
			aiPlayer.handContribution += totalNeededAllin;
			game.pot += totalNeededAllin;
			aiPlayer.status = 'all-in';
			if (aiPlayer.roundContribution > game.currentBet) {
				game.currentBet = aiPlayer.roundContribution;
				for (const pl of game.players) {
					if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
				}
			}
		} else {
			aiPlayer.chips -= totalNeeded;
			aiPlayer.roundContribution += totalNeeded;
			aiPlayer.handContribution += totalNeeded;
			game.pot += totalNeeded;
			game.currentBet += minRaise;
			for (const pl of game.players) {
				if (pl !== aiPlayer && pl.status === 'playing') pl.hasActed = false;
			}
		}
		aiPlayer.hasActed = true;
	}
	
	advanceTurn(game);
}

function triggerNextTurn(game: PokerGame) {
	const currentPlayer = game.players[game.turnIndex];
	if (currentPlayer && currentPlayer.status === 'playing' && currentPlayer.isAI) {
		updateRoom(game);
		setTimeout(() => aiMakeMove(game, currentPlayer), 2000);
	} else {
		setTurnTimer(game);
		updateRoom(game);
	}
}

function startNextHand(game: PokerGame) {
	if (game.timer) clearTimeout(game.timer);
	
	for (const p of game.players) {
		if (p.chips === 0 && p.status !== 'eliminated') {
			p.status = 'eliminated';
		}
	}
	
	const active = game.players.filter(p => p.status !== 'eliminated');
	if (active.length === 1) {
		const winner = active[0];
		game.state = 'ended';
		
		if (!game.isTestMode && !winner.isAI) {
			const totalCoins = game.players.length * game.entryFee;
			void updateBalance(winner.id, totalCoins);
			winner.payoutStr = `<span style="color:green;font-weight:bold">Tournament Winner! (${totalCoins} ${CURRENCY_NAME})</span>`;
		} else {
			winner.payoutStr = `<span style="color:green;font-weight:bold">Tournament Winner! (Test Mode)</span>`;
		}
		
		updateRoom(game);
		activeGames.delete(game.roomid);
		activeCasinoGames.delete(game.roomid);
		return;
	} else if (active.length === 0) {
		game.state = 'ended';
		updateRoom(game);
		activeGames.delete(game.roomid);
		activeCasinoGames.delete(game.roomid);
		return;
	}
	
	game.handsPlayed++;
	if (game.handsPlayed > 1 && game.handsPlayed % 5 === 0) {
		game.blinds.small *= 2;
		game.blinds.big *= 2;
	}
	
	game.deck = createDeck();
	game.communityCards = [];
	game.pot = 0;
	game.currentBet = 0;
	game.lastShowdownLog = undefined;
	
	for (const p of game.players) {
		p.hand = [];
		p.roundContribution = 0;
		p.handContribution = 0;
		p.hasActed = false;
		p.eval = undefined;
		p.payoutStr = undefined;
		if (p.status !== 'eliminated') p.status = 'playing';
	}
	
	do {
		game.dealerIndex = (game.dealerIndex + 1) % game.players.length;
	} while (game.players[game.dealerIndex].status === 'eliminated');
	
	let sbIndex = game.dealerIndex;
	let bbIndex = game.dealerIndex;
	
	if (active.length > 2) {
		do { sbIndex = (sbIndex + 1) % game.players.length; } while (game.players[sbIndex].status === 'eliminated');
		bbIndex = sbIndex;
		do { bbIndex = (bbIndex + 1) % game.players.length; } while (game.players[bbIndex].status === 'eliminated');
	} else {
		sbIndex = game.dealerIndex;
		bbIndex = (sbIndex + 1) % game.players.length;
		while (game.players[bbIndex].status === 'eliminated') {
			bbIndex = (bbIndex + 1) % game.players.length;
		}
	}
	
	const sbAmount = Math.min(game.blinds.small, game.players[sbIndex].chips);
	game.players[sbIndex].chips -= sbAmount;
	game.players[sbIndex].roundContribution = sbAmount;
	game.players[sbIndex].handContribution = sbAmount;
	game.pot += sbAmount;
	if (game.players[sbIndex].chips === 0) game.players[sbIndex].status = 'all-in';
	
	const bbAmount = Math.min(game.blinds.big, game.players[bbIndex].chips);
	game.players[bbIndex].chips -= bbAmount;
	game.players[bbIndex].roundContribution = bbAmount;
	game.players[bbIndex].handContribution = bbAmount;
	game.pot += bbAmount;
	if (game.players[bbIndex].chips === 0) game.players[bbIndex].status = 'all-in';
	
	game.currentBet = game.blinds.big;
	
	for (const p of game.players) {
		if (p.status !== 'eliminated') {
			p.hand.push(game.deck.pop()!, game.deck.pop()!);
		}
	}
	whisperCards(game);
	
	game.state = 'preflop';
	
	game.turnIndex = bbIndex;
	do {
		game.turnIndex = (game.turnIndex + 1) % game.players.length;
	} while (game.players[game.turnIndex].status === 'eliminated');
	
	const ableToAct = game.players.filter(p => p.status === 'playing' && p.chips > 0);
	if (ableToAct.length <= 1 && ableToAct.every(p => p.roundContribution >= game.currentBet)) {
		setTimeout(() => nextPhase(game), 2000);
		updateRoom(game);
		return;
	}
	
	triggerNextTurn(game);
}

function setTurnTimer(game: PokerGame) {
	if (game.timer) clearTimeout(game.timer);
	game.timer = setTimeout(() => {
		const p = game.players[game.turnIndex];
		if (p && p.status === 'playing') {
			const callAmount = game.currentBet - p.roundContribution;
			if (callAmount === 0) {
				p.hasActed = true;
			} else {
				p.status = 'folded';
				p.hasActed = true;
			}
			void advanceTurn(game);
		}
	}, TURN_TIMEOUT);
}

function advanceTurn(game: PokerGame) {
	const nonFolded = game.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
	
	if (nonFolded.length === 1) {
		const winner = nonFolded[0];
		winner.chips += game.pot;
		game.state = 'showdown';
		winner.payoutStr = `<span style="color:green">Won ${game.pot} (Others folded)</span>`;
		game.lastShowdownLog = `${nameColor(winner.name, true)} won ${game.pot} chips (Others folded)`;
		updateRoom(game);
		setTimeout(() => startNextHand(game), 5000);
		return;
	}
	
	const ableToAct = game.players.filter(p => p.status === 'playing' && p.chips > 0);
	const roundOver = ableToAct.every(p => p.hasActed && p.roundContribution === game.currentBet);
	
	if (roundOver || ableToAct.length === 0) {
		nextPhase(game);
		return;
	}
	
	do {
		game.turnIndex = (game.turnIndex + 1) % game.players.length;
	} while (game.players[game.turnIndex].status !== 'playing' || game.players[game.turnIndex].chips === 0);
	
	triggerNextTurn(game);
}

function nextPhase(game: PokerGame) {
	if (game.state === 'preflop') {
		game.state = 'flop';
		game.communityCards.push(game.deck.pop()!, game.deck.pop()!, game.deck.pop()!);
	} else if (game.state === 'flop') {
		game.state = 'turn';
		game.communityCards.push(game.deck.pop()!);
	} else if (game.state === 'turn') {
		game.state = 'river';
		game.communityCards.push(game.deck.pop()!);
	} else if (game.state === 'river') {
		doShowdown(game);
		return;
	}
	
	game.currentBet = 0;
	for (const p of game.players) {
		p.roundContribution = 0;
		if (p.status === 'playing' && p.chips > 0) p.hasActed = false;
	}
	
	const ableToAct = game.players.filter(p => p.status === 'playing' && p.chips > 0);
	if (ableToAct.length <= 1) {
		setTimeout(() => nextPhase(game), 2000);
		updateRoom(game);
		return;
	}
	
	game.turnIndex = game.dealerIndex;
	do {
		game.turnIndex = (game.turnIndex + 1) % game.players.length;
	} while (game.players[game.turnIndex].status !== 'playing' || game.players[game.turnIndex].chips === 0);
	
	triggerNextTurn(game);
}

function buildPots(players: PokerPlayer[]) {
	const pots = [];
	const pList = players.filter(p => p.handContribution > 0).sort((a, b) => a.handContribution - b.handContribution);
	
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

function doShowdown(game: PokerGame) {
	game.state = 'showdown';
	if (game.timer) clearTimeout(game.timer);
	
	const pots = buildPots(game.players);
	const displayLines = [];
	
	for (let i = 0; i < pots.length; i++) {
		const pot = pots[i];
		if (pot.eligible.length === 0) continue;
		
		let bestHand: any = null;
		let winners: PokerPlayer[] = [];
		
		for (const p of pot.eligible) {
			if (!p.eval) p.eval = evaluateBest7([...p.hand, ...game.communityCards]);
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
			displayLines.push(`Pot ${i+1} (${pot.size} chips): Won by ${winNames} (${bestHand.name})`);
		}
	}
	
	game.lastShowdownLog = displayLines.join('<br>');
	updateRoom(game);
	
	setTimeout(() => startNextHand(game), 8000);
}

export const commands: Chat.ChatCommands = {
	poker: {
		async start(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			if (activeCasinoGames.has(room.roomid)) return this.errorReply(`A ${activeCasinoGames.get(room.roomid)} game is already running in this room.`);
			
			const parts = target.trim().split(' ');
			let isTestMode = false;
			let entryFee = 0;
			
			if (parts[0] && parts[0].toLowerCase() === 'ai') {
				isTestMode = true;
			} else {
				entryFee = parseInt(parts[0]);
				if (isNaN(entryFee) || entryFee <= 0) {
					return this.errorReply("Usage: /poker start [entryFee] OR /poker start ai");
				}
			}
			
			const uid = `poker-${room.roomid}-${Date.now()}`;
			const game: PokerGame = {
				roomid: room.roomid,
				uid,
				host: user.id,
				hostName: user.name,
				entryFee,
				isTestMode,
				state: 'lobby',
				players: [],
				communityCards: [],
				deck: [],
				pot: 0,
				currentBet: 0,
				turnIndex: 0,
				dealerIndex: 0,
				blinds: { small: 10, big: 20 },
				handsPlayed: 0,
				timer: null,
			};
			
			game.timer = setTimeout(() => {
				if (activeGames.has(room.roomid)) {
					const g = activeGames.get(room.roomid)!;
					if (g.state === 'lobby') {
						if (g.isTestMode) {
							const requiredAIs = Math.max(3, 4 - g.players.length);
							let aiCount = 1;
							while (g.players.length < 4 && aiCount <= requiredAIs) {
								g.players.push({
									id: `ai${aiCount}`,
									name: `AI Bot ${aiCount}`,
									isAI: true,
									hand: [],
									status: 'playing',
									chips: 1000,
									roundContribution: 0,
									handContribution: 0,
									hasActed: false,
								});
								aiCount++;
							}
						}
						
						if (g.players.length >= 2) {
							g.dealerIndex = Math.floor(Math.random() * g.players.length);
							startNextHand(g);
						} else {
							void refundAll(g, 'Lobby timed out due to not enough players.');
							activeGames.delete(room.roomid);
							activeCasinoGames.delete(room.roomid);
						}
					}
				}
			}, LOBBY_TIMEOUT);

			activeGames.set(room.roomid, game);
			activeCasinoGames.set(room.roomid, 'poker');
			updateRoom(game);
		},

		async join(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game) return this.errorReply("No active poker game in this room.");
			if (game.state !== 'lobby') return this.errorReply("This game has already started.");
			if (game.players.length >= 4) return this.errorReply("The game is full (max 4 players).");
			if (game.players.some(p => p.id === user.id)) return this.errorReply("You are already in this game.");

			if (!game.isTestMode) {
				const bal = await getBalance(user.id);
				if (bal < game.entryFee) {
					return this.errorReply(`You don't have enough ${CURRENCY_NAME} to play. (Requires ${game.entryFee})`);
				}
				await updateBalance(user.id, -game.entryFee);
			}

			game.players.push({
				id: user.id,
				name: user.name,
				isAI: false,
				hand: [],
				status: 'playing',
				chips: 1000,
				roundContribution: 0,
				handContribution: 0,
				hasActed: false,
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
			
			if (game.timer) clearTimeout(game.timer);
			if (game.isTestMode) {
				const requiredAIs = Math.max(3, 4 - game.players.length); // Ensure there's enough action
				let aiCount = 1;
				while (game.players.length < 4 && aiCount <= requiredAIs) {
					game.players.push({
						id: `ai${aiCount}`,
						name: `AI Bot ${aiCount}`,
						isAI: true,
						hand: [],
						status: 'playing',
						chips: 1000,
						roundContribution: 0,
						handContribution: 0,
						hasActed: false,
					});
					aiCount++;
				}
			}

			if (game.players.length < 2) {
				// Restart the timer if we failed to start
				game.timer = setTimeout(() => {
					if (activeGames.has(room.roomid)) {
						const g = activeGames.get(room.roomid)!;
						if (g.state === 'lobby') {
							void refundAll(g, 'Lobby timed out due to not enough players.');
							activeGames.delete(room.roomid);
							activeCasinoGames.delete(room.roomid);
						}
					}
				}, LOBBY_TIMEOUT);
				return this.errorReply("Need at least 2 players to start.");
			}

			game.dealerIndex = Math.floor(Math.random() * game.players.length);
			startNextHand(game);
		},

		async call(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || ['lobby', 'showdown', 'ended'].includes(game.state)) return this.errorReply("There is no active poker game waiting for moves.");
			
			const p = game.players[game.turnIndex];
			if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
			
			const callAmount = game.currentBet - p.roundContribution;
			if (callAmount > 0) {
				if (p.chips <= callAmount) {
					return this.parse('/poker allin');
				}
				p.chips -= callAmount;
				p.roundContribution += callAmount;
				p.handContribution += callAmount;
				game.pot += callAmount;
			}
			
			p.hasActed = true;
			advanceTurn(game);
		},

		async allin(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || ['lobby', 'showdown', 'ended'].includes(game.state)) return this.errorReply("There is no active poker game waiting for moves.");
			
			const p = game.players[game.turnIndex];
			if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
			
			const totalNeeded = p.chips;
			if (totalNeeded === 0) return this.errorReply("You have no chips left.");
			
			p.chips = 0;
			p.roundContribution += totalNeeded;
			p.handContribution += totalNeeded;
			game.pot += totalNeeded;
			p.status = 'all-in';
			p.hasActed = true;
			
			if (p.roundContribution > game.currentBet) {
				game.currentBet = p.roundContribution;
				for (const pl of game.players) {
					if (pl !== p && pl.status === 'playing') pl.hasActed = false;
				}
			}
			
			advanceTurn(game);
		},

		async fold(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || ['lobby', 'showdown', 'ended'].includes(game.state)) return this.errorReply("There is no active poker game waiting for moves.");
			
			const p = game.players[game.turnIndex];
			if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
			
			p.status = 'folded';
			p.hasActed = true;
			advanceTurn(game);
		},

		async raise(target, room, user) {
			if (!room || room.battle || room.roomid !== CASINO_ROOM) return this.errorReply("This command can only be used in the Casino room.");
			const game = activeGames.get(room.roomid);
			if (!game || ['lobby', 'showdown', 'ended'].includes(game.state)) return this.errorReply("There is no active poker game waiting for moves.");
			
			const p = game.players[game.turnIndex];
			if (!p || p.id !== user.id) return this.errorReply("It's not your turn.");
			
			const raiseAmount = parseInt(target);
			if (isNaN(raiseAmount) || raiseAmount < game.blinds.big) return this.errorReply(`Usage: /poker raise [amount]. Amount must be at least the big blind (${game.blinds.big}).`);
			
			const callAmount = game.currentBet - p.roundContribution;
			const totalNeeded = callAmount + raiseAmount;
			
			if (p.chips <= totalNeeded) return this.errorReply(`You don't have enough chips. Use /poker allin instead.`);
			
			p.chips -= totalNeeded;
			p.roundContribution += totalNeeded;
			p.handContribution += totalNeeded;
			game.pot += totalNeeded;
			game.currentBet += raiseAmount;
			
			p.hasActed = true;
			for (const pl of game.players) {
				if (pl !== p && pl.status === 'playing') pl.hasActed = false;
			}
			
			advanceTurn(game);
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
			activeCasinoGames.delete(room.roomid);
			await refundAll(game, `Cancelled by ${user.name}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Poker Tournament Commands</b></center><hr>` +
				`<b>/poker start [entryFee]</b>: Start a Texas Hold'em Sit & Go Tournament.<br>` +
				`<b>/poker start ai</b>: Start a free test mode tournament against AI bots.<br>` +
				`<b>/poker join</b>: Join the current game.<br>` +
				`<b>/poker deal</b>: Deal the cards and start the tournament (Host only).<br>` +
				`<b>/poker call</b>: Match the current bet or check.<br>` +
				`<b>/poker raise [amount]</b>: Increase the bet by [amount] above the current bet.<br>` +
				`<b>/poker allin</b>: Go all-in with all your remaining chips.<br>` +
				`<b>/poker fold</b>: Fold your hand.<br>` +
				`<b>/poker end</b>: Cancel the game (Host only).`
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
		}
	},
	pokerhelp: 'poker help',
	pokerrules: 'poker rules',
};
