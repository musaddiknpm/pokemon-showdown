import { type ShopItem } from './items';

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

export type GameMode = string;

export type StatID = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export type StatTable = Record<StatID, number>;

export type PokeRogueView =
	| 'main' | 'top' | 'guide' | 'resetconfirm' | 'welcome' | 'stats' | 'save' | 'load' |
	'starterselect' | 'draft' | 'gacha' | 'incubator' | 'trainer' | 'victory';

export type RarityTier =
	| 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Ultra Rare' |
	'Boss' | 'Boss Rare' | 'Boss Super Rare' | 'Boss Ultra Rare';

export interface BiomeEntry {
	species: string;
	weight: number;
}

export interface TrainerMon {
	species: string;
	moves?: string[];
	ivs?: StatTable;
	evs?: StatTable;
	ability?: string;
	teraType?: string;
	item?: string;
	shiny?: boolean;
	nature?: string;
	gender?: 'M' | 'F' | 'N';
}

export interface TrainerData {
	teamSize: number;
	pool?: (string | TrainerMon)[];
	slotPools?: Record<number, (string | TrainerMon)[]>;
	memoryId?: string;
	random?: boolean;
	chance?: number;
	spriteUrl?: string;
	dialog?: string;
	doubles?: boolean;
	biome?: string | string[];
}

export type BiomePool = Partial<Record<RarityTier, BiomeEntry[]>>;

export interface MilestoneReward {
	floor: number;
	interval: boolean;
	itemType: 'keyItem' | 'inventory' | 'voucher';
	itemName: string;
	amount: number;
}

export interface ModeConfig {
	name?: string;
	biomeRotationInterval: number;
	bossInterval: number;
	hasTrainers?: boolean;
	progression?: boolean;
	randomizeMoves?: boolean;
	randomizeAbilities?: boolean;
	startingBiome: string;
	starterLevel?: number;
	maxStarterCost?: number;
	generation: number;
	baseFormat: string;
	doublesFormat?: string;
	milestoneRewards?: MilestoneReward[];

	levelScalingFn?: (floor: number) => { cap: number, min: number, max: number, bossLevel?: number };

	poolFilterFn?: (pool: BiomeEntry[], floor: number, isBoss: boolean) => BiomeEntry[];

	emptyPoolFallbackFn?: (floor: number, rarity: string, isBoss: boolean, biomes: Record<string, BiomePool>) => BiomeEntry[];

	economy: {
		startingMoney: number,
		startingKeyItems?: Record<string, number>,
		startingInventory?: Record<string, number>,
		draftChoicesCount?: number,
		maxDraftChoicesCount?: number,
		moneyMultiplier?: number | ((floor: number) => number),
		expMultiplier?: number | ((floor: number) => number),
	};

	mechanicUnlocks?: {
		terastallize?: number,
		mega?: number,
		dynamax?: number,
	};

	maxFloor?: number;
	maxLevel?: number;

	victoryConfig?: {
		name?: string,
		spriteUrl?: string,
		dialog?: string,
	};

	lastBiome?: {
		biome: string,
		floor: string,
	};
}

export interface BiomeTransition {
	biome: string;
	weight: number;
}

export interface ModeData {
	biomes: Record<string, BiomePool>;
	transitions: Record<string, BiomeTransition[]>;
	trainers: Record<string, Record<string, TrainerData>>;
	starters: string[];
	useNewStarterSelectionUI?: boolean;
	excludedBiomes?: string[];

	shop?: Record<string, ShopItem>;

	resolveBiome?: (floor: number, currentBiome: string, config: ModeConfig) => string;

	resolveTrainer?: (floor: number, state: PokeRogueState, config: ModeConfig) => { key: string, name: string } | null;

	resolveBoss?: (floor: number, currentBiome: string, config: ModeConfig) => TrainerMon[] | null;
}

export interface PokemonEntry {
	species: string;
	level: number;
	exp: number;
	expType?: string;
	heldItem?: string;
	moves: string[];
	currentHp?: number;
	status?: StatusCondition;
	ball?: string;
	nature?: string;
	evs?: StatTable;
	ability?: string;
	ivs?: StatTable;
	teraType?: string;
	gender?: 'M' | 'F' | 'N';
	shiny?: boolean;
	happiness?: number;
	nickname?: string;
	originalTrainer?: string;
	otId?: string;
	metLocation?: string;
	metLevel?: number;
	metDate?: number;
	marks?: string[];

	starterUnlocks?: string[];
	unlockedNatures?: string[];
	unlockedAbilities?: string[];
	unlockedTeraTypes?: string[];
	unlockedEggMoves?: string[];
	selectedNature?: string;
	selectedAbility?: string;
	selectedTeraType?: string;
	selectedMoves?: string[];

	activeBuffs?: Record<string, number>;
	stackedItems?: Record<string, number>;

	eggTier?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface PokeRogueState {
	view?: PokeRogueView;
	starterSearch?: string;
	gameWon?: boolean;
	floor: number;
	gameMode: GameMode;
	currentBiome?: string;
	team: PokemonEntry[];

	money: number;
	pendingRewardDraft?: string[];
	lockedSlots?: boolean[];
	rerollCount?: number;
	luck?: number;
	starterPage?: number;

	timesRerolled: number;
	rotationalShop: string[];
	keyItems: Record<string, number>;
	inventory?: Record<string, number>;
	lureCharges?: number;
	caughtPokemon?: PokemonEntry;
	pendingChoice?: string[];
	pendingChoiceType?: 'starter' | 'add';
	pendingSwap?: PokemonEntry;
	pendingMoves?: { pokemonIndex: number, move: string, speciesName: string }[];
	purchasedItem?: string;
	pendingConsumableType?: 'healHP' | 'revive' | 'cureStatus' | 'vitamin' | 'tm' | 'evolveItem' | 'mint' | 'rareCandy' | 'xItem';
	pendingItemName?: string;
	pendingItemIsEvo?: boolean;
	pendingItemIsMega?: boolean;
	pendingItemIsGmax?: boolean;
	pendingItemIsStackable?: boolean;
	isRotationalItem?: boolean;
	moveToLearn?: string;
	pokemonForTM?: number;
	moveForgotten?: string;
	itemOptions?: string[];
	battleRoomId?: string;
	streaksWon?: number;
	highestFloor?: number;
	displayName?: string;
	recordTeam?: PokemonEntry[];
	gameOver?: boolean;
	lastRunFloor?: number;
	lastRunStreaks?: number;
	lastTrainerFloor?: number;
	notification?: string;
	pendingChoiceFloor?: number;
	pendingMoveSlot?: number;
	pendingReleaseSlot?: number;
	pendingTrainer?: string;
	firstGymLeaderWave?: number;
	pendingTrainerKey?: string;

	pendingDraftPick?: boolean;

	pendingStatsSlot?: number;
	statsTab?: number;
	lastThrowTime?: number;
	isConfiguringStarter?: boolean;

	hatchedEggs?: PokemonEntry[];
	topMode?: string;
	trainerMemories?: Record<string, string[]>;
}

export interface ModeStats {
	highestFloor: number;
	activeFloor?: number;
	wins: number;
	recordTeam: PokemonEntry[];
}

export interface GlobalStatEntry {
	displayName: string;
	stats?: Record<string, ModeStats>;
}

export interface EggData {
	species: string;
	wavesRemaining: number;
	bannerType: 'shiny' | 'eggmove' | 'generic';
	tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
	shiny: boolean;
	hiddenAbility: boolean;
}

export interface UserSaveData {
	displayName: string;
	activeMode: GameMode;
	starters: Record<string, PokemonEntry>;
	runs: Partial<Record<GameMode, PokeRogueState>>;
	saveSlots: Partial<Record<number, PokeRogueState>>;
	vouchers?: Record<string, number>;
	eggs?: EggData[];
	stats?: Record<string, ModeStats>;
}
