import os
import re

# 1. Update sggame-core.ts
with open('impulse/chat-plugins/sggame/sggame-core.ts', 'r') as f:
    core = f.read()

# Add genAIPokemon and packAITeam to imports
core = core.replace('packTeam, genPokemon,', 'packTeam, genPokemon, genAIPokemon, packAITeam, type AIPokemonSet,')
core = core.replace("import { SGGameBattleResolver } from './battle';", "import { UtilityBattleResolver } from './utility-battle';")
core = core.replace("SGGameBattleResolver", "UtilityBattleResolver")

# Append buildBotTeam
build_bot_team = """

export function buildBotTeam(state: SGGameState, config: ModeConfig): { packedTeam: string, isTrainer: boolean, trainerName?: string, team: AIPokemonSet[], isDoubles?: boolean } {
	const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
	const floor = state.floor;
	const isBossFloor = floor % config.bossInterval === 0;

	let size = 1;
	if (!isBossFloor) {
		const hasLure = (state.lureCharges ?? 0) > 0;
		const doubleChance = hasLure ? 0.85 : 0.15;
		if (Math.random() < doubleChance) size = 2;
	}

	const luck = state.luck ?? 0;
	const trainerKey = state.pendingTrainerKey;
	const shinyCharms = state.keyItems?.['Shiny Charm'] || 0;
	const abilityCharms = state.keyItems?.['Ability Charm'] || 0;

	const result = genAIPokemon(
		size,
		floor,
		luck,
		state.pendingTrainer,
		trainerKey,
		state.currentBiome || config.startingBiome,
		config,
		data,
		shinyCharms,
		abilityCharms,
		state
	);

	return {
		packedTeam: packAITeam(result.team),
		isTrainer: result.isTrainer,
		trainerName: result.trainerName,
		team: result.team,
		isDoubles: result.isDoubles,
	};
}
"""
core += build_bot_team

with open('impulse/chat-plugins/sggame/sggame-core.ts', 'w') as f:
    f.write(core)


# 2. Update sggame.ts
with open('impulse/chat-plugins/sggame/sggame.ts', 'r') as f:
    sg = f.read()

sg = sg.replace("import { SGGameBattleResolver } from './battle';", "import { UtilityBattleResolver } from './utility-battle';\nimport { buildBotTeam } from './sggame-core';\nimport { packTeam } from './pokemon';\nimport { MODE_CONFIGS } from './config';")
sg = sg.replace("SGGameBattleResolver", "UtilityBattleResolver")

# Replace the start logic inside sggame.ts
old_start = r"if \(new UtilityBattleResolver\(user, state\)\.start\(\)\) \{"
new_start = """
			const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);
			if (!livingTeam.length) {
				user.popup("All your Pokémon have fainted!");
				return;
			}
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const isBoss = state.floor % config.bossInterval === 0;
			const botTeamData = buildBotTeam(state, config);
			const isDoubles = botTeamData.isDoubles ?? (!botTeamData.isTrainer && !isBoss && botTeamData.team.length > 1 && livingTeam.length > 1);
			const format = (isDoubles && config.doublesFormat) ? config.doublesFormat : config.baseFormat;
			let opponentTitle = botTeamData.isTrainer && botTeamData.trainerName ? botTeamData.trainerName : (botTeamData.isTrainer ? "Trainer" : "Wild Encounter");
			if (isBoss && !botTeamData.isTrainer) opponentTitle = `BOSS ${opponentTitle}`;
			const roomTitle = `SGGame Battle - Floor ${state.floor}: ${user.name} vs ${opponentTitle}`;

			const resolver = new UtilityBattleResolver(user);
			const battleRoom = resolver.start(botTeamData, format, roomTitle, packTeam(livingTeam), config, config.generation || 9, (room, turn) => {
				const activeConfig = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
				if (state.floor % activeConfig.bossInterval !== 0 && !botTeamData.isTrainer) {
					const inv = state.inventory || {};
					const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
						`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
						`<button name="send" value="/sggame catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
						`<button name="send" value="/sggame catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
						`</div>`;
					const playerUser = Users.get(user.id);
					if (playerUser) {
						if ((room as any).lastPanelTurn && (room as any).lastPanelTurn !== turn) playerUser.sendTo(room as any, `|uhtmlchange|catchpanel-${(room as any).lastPanelTurn}|`);
						if ((room as any).lastPanelTurn !== turn) {
							playerUser.sendTo(room as any, `|uhtml|catchpanel-${turn}|${catchHTML}`);
							(room as any).lastPanelTurn = turn;
						}
					}
				}
			}, state);

			if (battleRoom) {
				state.battleRoomId = battleRoom.roomid;"""
sg = re.sub(old_start, new_start, sg)
with open('impulse/chat-plugins/sggame/sggame.ts', 'w') as f:
    f.write(sg)

