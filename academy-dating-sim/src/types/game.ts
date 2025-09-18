export interface Player {
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: {
    intelligence: number;
    charm: number;
    stamina: number;
    strength: number;
    agility: number;
    luck: number;
  };
  inventory: string[];
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
  affection: Record<string, number>;
  location: string;
  day: number;
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  money: number;
  flags: Record<string, boolean>;
  dungeonProgress: {
    currentFloor: number;
    maxFloorReached: number;
    position: { x: number; y: number };
  };
}

export interface Character {
  id: string;
  name: string;
  role: string;
  affectionStart: number;
  affectionMax: number;
  likes: string[];
  dislikes: string[];
  baseText: string;
  dialogues: Record<string, string>;
  sprite: string;
  unlockCondition?: {
    day?: number;
    totalAffection?: number;
  };
}

export interface GameEvent {
  id: string;
  name: string;
  trigger: {
    location?: string;
    character?: string;
    minAffection?: number;
    minDay?: number;
    chance?: number;
    once?: boolean;
    totalAffection?: number;
  };
  description: string;
  choices: Choice[];
}

export interface Choice {
  text: string;
  condition?: {
    minIntelligence?: number;
    minCharm?: number;
    minStamina?: number;
    hasItem?: string;
  };
  effects: {
    affection?: Record<string, number>;
    stats?: Partial<Player['stats']>;
    item?: string;
    money?: number;
    text: string;
    flag?: string;
    unlockCharacter?: string;
  };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'gift' | 'consumable' | 'special' | 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  effect: {
    affection?: number;
    intelligence?: number;
    charm?: number;
    stamina?: number;
    strength?: number;
    agility?: number;
    luck?: number;
    hp?: number;
    mp?: number;
    experience?: number;
    unlockSecret?: boolean;
  };
  requirements?: {
    level?: number;
    stats?: Partial<Player['stats']>;
  };
  preferredBy?: string[];
  icon?: string;
  category?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
  characters: string[];
  sprite: string;
  unlockCondition?: {
    item?: string;
    flag?: string;
  };
}

export interface Activity {
  name: string;
  effect: Partial<Player['stats']>;
  time: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'any';
  special?: string;
}

export interface SaveData {
  player: Player;
  unlockedCharacters: string[];
  completedEvents: string[];
  timestamp: number;
  version: string;
}

export type EndingType = 'true' | 'good' | 'normal' | 'bad' | 'sakura' | 'yuki' | 'luna' | 'mystery' | 'solo';

export interface Ending {
  type: EndingType;
  title: string;
  description: string;
  condition: {
    minDay?: number;
    maxDay?: number;
    minAffection?: Record<string, number>;
    flags?: string[];
  };
}

export interface DungeonFloor {
  id: number;
  name: string;
  description: string;
  layout: number[][];
  enemies: Monster[];
  treasures: Treasure[];
  boss?: Monster;
  nextFloorRequirement?: {
    bossDefeated?: boolean;
    itemRequired?: string;
  };
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  agility: number;
  experience: number;
  drops: Drop[];
  sprite: string;
  description: string;
}

export interface Drop {
  itemId: string;
  chance: number;
  quantity: number;
}

export interface Treasure {
  id: string;
  position: { x: number; y: number };
  contents: Drop[];
  opened: boolean;
}

export interface CharacterImage {
  id: string;
  characterId: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
  svgData: string;
}

export interface AffinityEvent {
  id: string;
  characterId: string;
  minAffection: number;
  title: string;
  description: string;
  choices: AffinityChoice[];
  unlocked: boolean;
}

export interface AffinityChoice {
  text: string;
  effects: {
    affection?: number;
    stats?: Partial<Player['stats']>;
    items?: string[];
    flags?: string[];
    specialEvent?: string;
  };
  requirements?: {
    stats?: Partial<Player['stats']>;
    items?: string[];
    flags?: string[];
  };
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  gameProgress: {
    totalPlaytime: number;
    charactersUnlocked: string[];
    endingsUnlocked: EndingType[];
    achievements: string[];
  };
}

export interface HeroineData {
  id: string;
  name: string;
  affinity: number;
  level: string;
  eventsCompleted?: string[];
}

export interface GameState {
  playerName: string;
  currentDay: number;
  experience: number;
  hp?: number;
  maxHp?: number;
  mp?: number;
  maxMp?: number;
  stats: {
    intelligence: number;
    charm: number;
    stamina: number;
    strength?: number;
    agility?: number;
    luck?: number;
  };
  inventory: Item[];
  money: number;
  heroines: Record<string, HeroineData>;
}