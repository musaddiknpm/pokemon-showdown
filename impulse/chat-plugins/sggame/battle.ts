import { SGPlayer, SGPokemon } from './types';
import { Database } from './database';
import { UtilityBattleResolver } from '../../utils/battle';
import { packTeam, packAITeam, PackablePokemon, PackableAISet } from '../../utils/packers';
import { calcSVExp } from '../../utils/exp';
import { SGUtils } from './pokemon';

export const SGBattle = {
		renderCatchUI(p: SGPlayer): string {
			let catchHTML = `<div style="text-align: center; margin-top: 5px;">`;
			const balls = [
				{ id: 'pokeball', name: 'Poké Ball', img: 'https://i.ibb.co/LdXWzyFm/pokeball.png' },
				{ id: 'greatball', name: 'Great Ball', img: 'https://i.ibb.co/mVjYKGpP/greatball.png' },
				{ id: 'ultraball', name: 'Ultra Ball', img: 'https://i.ibb.co/n8YrGSZq/ultraball.png' },
				{ id: 'masterball', name: 'Master Ball', img: 'https://i.ibb.co/C36ByMDw/masterball.png' }
			];
			for (const ball of balls) {
				const count = p.bag[ball.id] || 0;
				const disabled = count > 0 ? '' : 'disabled';
				const opacity = count > 0 ? '1' : '0.4';
				const cursor = count > 0 ? 'pointer' : 'not-allowed';
				
				catchHTML += `<button name="send" value="/sg catch ${ball.id}" style="background: transparent; border: 1px solid #aaa; border-radius: 4px; cursor: ${cursor}; opacity: ${opacity}; margin: 0 4px; padding: 4px; vertical-align: middle;" ${disabled}>`;
				catchHTML += `<img src="${ball.img}" alt="${ball.name}" style="width: 32px; height: 32px; display: block;" />`;
				catchHTML += `</button>`;
			}
			catchHTML += `</div>`;
			return catchHTML;
		},
	
	startWildEncounter(user: User, player: SGPlayer, wildPoke: SGPokemon, sourceRoomId: string) {
		const resolver = new UtilityBattleResolver(user);
		
		const playerTeam: PackablePokemon[] = player.party.map(p => ({
			species: p.species,
			level: p.level,
			currentHp: Math.ceil((p.hp / p.maxHp) * 100),
			moves: p.moves,
			status: p.status,
			heldItem: p.item || '',
			nature: 'Hardy',
			ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
			evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0},
		}));
		const packedPlayerTeam = packTeam(playerTeam);
		
		const botSet: PackableAISet = {
			species: wildPoke.species,
			name: Dex.species.get(wildPoke.species).name,
			level: wildPoke.level,
			ability: Dex.species.get(wildPoke.species).abilities[0],
			nature: 'Hardy',
			ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
			evs: {hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84},
			item: '',
			shiny: false,
			teraType: '',
			moves: wildPoke.moves,
			gender: 'M'
		};
		const packedBotTeam = packAITeam([botSet]);
		
		const roomTitle = `Wild ${Dex.species.get(wildPoke.species).name}`;
		
		const room = resolver.start(
			{
				packedTeam: packedBotTeam,
				isTrainer: false,
				trainerName: 'Wild Encounter',
				team: [botSet],
			},
			'gen9sggamesingles', // or whatever format
			roomTitle,
			packedPlayerTeam,
			{ maxDepth: 1 }, // basic AI
			9,
			(battleRoom: any, turn: number) => {
				const curPlayer = Database.load(user.id);
				if (curPlayer) {
					// Clear the old panel
					if (battleRoom.lastCatchTurn) {
						battleRoom.add(`|uhtmlchange|catchmenu-${battleRoom.lastCatchTurn}|`);
					}
					// Draw the new panel
					battleRoom.add(`|uhtml|catchmenu-${turn}|${this.renderCatchUI(curPlayer)}`);
					battleRoom.update();
					battleRoom.lastCatchTurn = turn;
				}
			},
			{ type: 'wild', wildPoke, sourceRoomId } // context
		);
		
		if (room) {
			room.lastCatchTurn = 1;
			room.add(`|uhtml|catchmenu-1|${this.renderCatchUI(player)}`);
			room.update();
		}
	}
};
