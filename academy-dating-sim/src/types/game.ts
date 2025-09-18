export interface Player {
  name: string;
  stats: {
    intelligence: number;
    charm: number;
    stamina: number;
  };
  inventory: string[];
  affection: Record<string, number>;
  location: string;
  day: number;
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  money: number;
  flags: Record<string, boolean>;
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
  type: 'gift' | 'consumable' | 'special';
  effect: {
    affection?: number;
    intelligence?: number;
    charm?: number;
    stamina?: number;
    unlockSecret?: boolean;
  };
  preferredBy?: string[];
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