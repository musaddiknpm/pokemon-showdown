export const Rulesets: {[k: string]: FormatData} = {
	sggameexptracker: {
		effectType: 'Rule',
		name: 'SGGame EXP Tracker',
		desc: 'Tracks participation natively and outputs exact EXP yields on faint for SGGame engine.',

		onStart() {
			if (!(this as any).p1Participants) {
				(this as any).p1Participants = new Set<string>();
			}
		},

		onSwitchIn(pokemon) {
			if (pokemon.side.id === 'p1') {
				if (!(this as any).p1Participants) {
					(this as any).p1Participants = new Set<string>();
				}
				(this as any).p1Participants.add(pokemon.species.id);
			}
		},

		onFaint(pokemon) {
			if (pokemon.side.id === 'p2') {
				const participants = Array.from((this as any).p1Participants || []).join(',');
				const species = pokemon.species.id;
				const level = pokemon.level;
				
				this.add('-message', `EXP_GAIN|${species}|${level}|${participants}`);
				
				if ((this as any).p1Participants) {
					(this as any).p1Participants.clear();
				}
			}
		},
	},
};
