import os
import shutil

os.makedirs('impulse/utils', exist_ok=True)

# Read utility-battle.ts
with open('impulse/chat-plugins/sggame/utility-battle.ts', 'r') as f:
    battle = f.read()

# Fix import
battle = battle.replace("'../../../lib/streams'", "'../../lib/streams'")

# Write to new location
with open('impulse/utils/battle.ts', 'w') as f:
    f.write(battle)

# Remove old
os.remove('impulse/chat-plugins/sggame/utility-battle.ts')


# Read ai.ts
with open('impulse/chat-plugins/sggame/ai.ts', 'r') as f:
    ai = f.read()

# Fix import
ai = ai.replace("'../../../lib'", "'../../lib'")

# Write to new location
with open('impulse/utils/ai.ts', 'w') as f:
    f.write(ai)

# Remove old
os.remove('impulse/chat-plugins/sggame/ai.ts')


# Update sggame-core.ts
with open('impulse/chat-plugins/sggame/sggame-core.ts', 'r') as f:
    core = f.read()

core = core.replace("import { UtilityBattleResolver } from './utility-battle';", "import { UtilityBattleResolver } from '../../utils/battle';")
with open('impulse/chat-plugins/sggame/sggame-core.ts', 'w') as f:
    f.write(core)

# Update sggame.ts
with open('impulse/chat-plugins/sggame/sggame.ts', 'r') as f:
    sg = f.read()

sg = sg.replace("import { UtilityBattleResolver } from './utility-battle';", "import { UtilityBattleResolver } from '../../utils/battle';")
with open('impulse/chat-plugins/sggame/sggame.ts', 'w') as f:
    f.write(sg)

