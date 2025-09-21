// Romance and Messaging System Types

export interface Message {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'choice' | 'gift' | 'invitation' | 'confession';
  attachments?: MessageAttachment[];
  choices?: MessageChoice[];
  affectionChange?: number;
}

export interface MessageAttachment {
  type: 'image' | 'item' | 'location';
  id: string;
  name: string;
  preview?: string;
}

export interface MessageChoice {
  id: string;
  text: string;
  affectionChange: number;
  nextMessageId?: string;
  flags?: string[]; // Story flags to set
}

export interface ConversationThread {
  characterId: string;
  messages: Message[];
  lastActivity: number;
  unreadCount: number;
  relationshipStage: RelationshipStage;
  isTyping?: boolean;
  mood: CharacterMood;
}

export type RelationshipStage =
  | 'stranger'      // 0-10 affection
  | 'acquaintance'  // 11-25 affection
  | 'friend'        // 26-50 affection
  | 'closeFriend'   // 51-75 affection
  | 'romantic'      // 76-90 affection
  | 'lover';        // 91+ affection

export type CharacterMood =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'shy'
  | 'flirty';

export interface RomanceEvent {
  id: string;
  characterId: string;
  title: string;
  description: string;
  type: 'date' | 'confession' | 'special' | 'story' | 'random';
  requirements: {
    minAffection: number;
    maxAffection?: number;
    storyFlags?: string[];
    items?: string[];
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  rewards: {
    affectionBonus: number;
    items?: string[];
    unlocksFlags?: string[];
    unlocksEvents?: string[];
  };
  dialogue: DialogueNode[];
  completed: boolean;
  repeatable: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  emotion: CharacterMood;
  choices?: DialogueChoice[];
  next?: string;
  effects?: {
    affectionChange?: number;
    moodChange?: CharacterMood;
    flagsToSet?: string[];
  };
}

export interface DialogueChoice {
  id: string;
  text: string;
  requirements?: {
    minStats?: Partial<PlayerStats>;
    flags?: string[];
  };
  nextNodeId: string;
  effects?: {
    affectionChange?: number;
    moodChange?: CharacterMood;
    flagsToSet?: string[];
  };
}

export interface PlayerStats {
  charm: number;
  intelligence: number;
  strength: number;
  agility: number;
}

export interface CharacterProfile {
  id: string;
  name: string;
  title: string;
  age: number;
  birthday: string;
  bloodType: string;
  height: string;
  likes: string[];
  dislikes: string[];
  hobbies: string[];
  favoriteGifts: string[];
  hatedGifts: string[];
  personalityTraits: string[];
  backstory: string;
  currentMood: CharacterMood;
  currentLocation: string;
  schedule: DailySchedule[];
  unlockedInfo: {
    basicInfo: boolean;      // Name, age, etc. (0+ affection)
    personality: boolean;    // Personality traits (20+ affection)
    preferences: boolean;    // Likes/dislikes (40+ affection)
    backstory: boolean;      // Full backstory (60+ affection)
    secrets: boolean;        // Hidden info (80+ affection)
  };
}

export interface DailySchedule {
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  location: string;
  activity: string;
  interruptible: boolean;
}

export interface RomanceProgress {
  characterId: string;
  affection: number;
  relationshipStage: RelationshipStage;
  storyFlags: Set<string>;
  completedEvents: string[];
  memories: RomanceMemory[];
  firstMeetingDate: number;
  confessionDate?: number;
  currentRoute: 'friendship' | 'romance' | 'rival';
  routeLocked: boolean;
}

export interface RomanceMemory {
  id: string;
  eventId: string;
  date: number;
  title: string;
  description: string;
  image?: string;
  affectionGained: number;
  special: boolean;
}