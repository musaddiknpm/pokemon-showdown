export const activeCasinoGames = new Map<string, string>();
export const CASINO_ROOM = 'casino';

export type Suit = '♠' | '♥' | '♣' | '♦';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
	suit: Suit;
	rank: Rank;
	value: number;
}

export const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function renderHand(hand: Card[], hiddenFirst = false, compact = false): string {
	let html = '';
	for (let i = 0; i < hand.length; i++) {
		const card = hand[i];
		const size = compact ? '12px' : '16px';
		const padding = compact ? '1px 3px' : '2px 5px';
		if (!card || (i === 0 && hiddenFirst)) {
			html += `<span style="display:inline-block; border:1px solid #777; border-radius:3px; padding:${padding}; margin-right:2px; background:repeating-linear-gradient(45deg, #222, #222 5px, #444 5px, #444 10px); color:transparent; font-weight:bold; font-size:${size}; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">?</span>`;
			continue;
		}
		const color = (card.suit === '♥' || card.suit === '♦') ? '#F44336' : '#2C3E50';
		html += `<span style="display:inline-block; border:1px solid #ccc; border-radius:3px; padding:${padding}; margin-right:2px; background:#fff; color:${color}; font-weight:bold; font-size:${size}; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">${card.rank}<span style="font-family: Arial, sans-serif; margin-left:1px;">${card.suit}</span></span>`;
	}
	return html;
}
