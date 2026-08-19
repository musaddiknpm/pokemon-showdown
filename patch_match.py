import os

with open('impulse/chat-plugins/sggame/utility-battle.ts', 'r') as f:
    code = f.read()

code = code.replace("onTurn?: (room: AnyObject, turn: number) => void;", "onTurn?: (room: AnyObject, turn: number) => void;\n\tisTrainerBattle?: boolean;\n\tfloor?: number;")
code = code.replace("isDoubles: botTeamData.isDoubles,", "isDoubles: botTeamData.isDoubles,\n\t\t\tisTrainerBattle: botTeamData.isTrainer,")

with open('impulse/chat-plugins/sggame/utility-battle.ts', 'w') as f:
    f.write(code)
