import os
import re

with open('impulse/chat-plugins/sggame/battle.ts', 'r') as f:
    battle = f.read()

# We will just write a new battle.ts and move the rogue-like stuff to sggame-core.ts
