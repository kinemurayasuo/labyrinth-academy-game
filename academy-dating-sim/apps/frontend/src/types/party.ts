// Party System Types
export interface PartyMember {
  characterId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
    defense: number;
    charm: number;
  };
  equipment: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  skills: Skill[];
  position: PartyPosition;
  role: PartyRole;
  affection?: number; // For heroines
  isHeroine: boolean;
  portrait: string;
  status: StatusEffect[];
}

export type PartyPosition = 0 | 1 | 2 | 3; // 4 party slots
export type PartyRole = 'tank' | 'healer' | 'dps' | 'support';

export interface PartyFormation {
  frontRow: [PartyPosition, PartyPosition]; // 2 slots in front
  backRow: [PartyPosition, PartyPosition];  // 2 slots in back
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  stats: Partial<PartyMember['stats']>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Skill {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  mpCost: number;
  damage?: number;
  healing?: number;
  effect?: StatusEffect;
  targetType: 'single' | 'all' | 'party' | 'self';
  cooldown: number;
  currentCooldown: number;
  description: string;
  icon: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  duration: number;
  effect: {
    stat?: keyof PartyMember['stats'];
    value?: number;
    percentChange?: number;
  };
  icon: string;
}

export interface PartyState {
  members: (PartyMember | null)[]; // 4 slots, null if empty
  formation: PartyFormation;
  leader: PartyPosition; // Party leader position
  activeInDungeon: boolean;
  totalBattles: number;
  synergy: number; // 0-100, affects combo attacks
}

export interface HeroinePartyData {
  characterId: string;
  name: string;
  unlocked: boolean;
  recruitmentRequirements: {
    minAffection: number;
    storyProgress?: string[];
    playerLevel?: number;
  };
  baseStats: PartyMember['stats'];
  startingLevel: number;
  role: PartyRole;
  specialSkills: Skill[];
  awakeningLevel: number; // 0-5, unlocks new abilities
}