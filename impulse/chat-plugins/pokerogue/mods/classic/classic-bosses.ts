import { type TrainerMon } from '../../types';

export const CLASSIC_BOSSES: Record<string, Record<string, { pool: TrainerMon[] }>> = {
	'200': {
		'Eternatus': {
			pool: [
				{ species: 'eternatus' },
			],
		},
	},

};
