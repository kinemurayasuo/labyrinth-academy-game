import type { Character, Player, GameEvent } from './game';

// 호감도 레벨 시스템
export const AffinityLevel = {
  STRANGER: 'stranger',
  ACQUAINTANCE: 'acquaintance',
  FRIEND: 'friend',
  CLOSE_FRIEND: 'close_friend',
  ROMANTIC_INTEREST: 'romantic_interest',
  LOVER: 'lover',
  SOULMATE: 'soulmate'
} as const;

export type AffinityLevel = typeof AffinityLevel[keyof typeof AffinityLevel];

// 호감도 임계값
export const AFFINITY_THRESHOLDS = {
  [AffinityLevel.STRANGER]: 0,
  [AffinityLevel.ACQUAINTANCE]: 10,
  [AffinityLevel.FRIEND]: 25,
  [AffinityLevel.CLOSE_FRIEND]: 45,
  [AffinityLevel.ROMANTIC_INTEREST]: 65,
  [AffinityLevel.LOVER]: 85,
  [AffinityLevel.SOULMATE]: 100
} as const;

// 관계 상태
export interface RelationshipState {
  characterId: string;
  affinity: number;
  level: AffinityLevel;
  unlockedEvents: string[];
  completedEvents: string[];
  gifts: { itemId: string; date: number; reaction: 'love' | 'like' | 'neutral' | 'dislike' }[];
  memories: Memory[];
  flags: Record<string, boolean>;
  route: 'normal' | 'romance' | 'friendship' | 'rival' | 'special';
  jealousyLevel: number;
  trustLevel: number;
}

// 추억 시스템
export interface Memory {
  id: string;
  type: 'date' | 'event' | 'gift' | 'conversation' | 'special';
  date: number;
  location: string;
  description: string;
  affectionChange: number;
  cg?: string;
  voiceLine?: string;
}

// CG 갤러리
export interface CGGalleryEntry {
  id: string;
  characterId: string;
  title: string;
  description: string;
  imageUrl: string;
  unlocked: boolean;
  viewCount: number;
  unlockCondition: {
    event?: string;
    affinity?: number;
    route?: string;
  };
}

// 고급 이벤트 시스템
export interface AdvancedGameEvent extends GameEvent {
  type: 'main' | 'side' | 'random' | 'date' | 'ending';
  priority: number;
  repeatable: boolean;
  chain?: string[];
  branches?: EventBranch[];
  rewards?: EventReward[];
  voiceLines?: VoiceLine[];
  animations?: Animation[];
  bgm?: string;
  cg?: string[];
}

export interface EventBranch {
  id: string;
  condition: EventCondition;
  nextEvent: string;
  description: string;
}

export interface EventCondition {
  affinity?: { characterId: string; min?: number; max?: number };
  stats?: Partial<Player['stats']>;
  items?: string[];
  flags?: string[];
  day?: { min?: number; max?: number };
  route?: string;
  previousChoice?: string;
}

export interface EventReward {
  type: 'item' | 'money' | 'exp' | 'stat' | 'cg' | 'achievement';
  value: any;
  probability?: number;
}

// 음성 시스템
export interface VoiceLine {
  characterId: string;
  emotion: 'normal' | 'happy' | 'sad' | 'angry' | 'shy' | 'love' | 'surprised';
  text: string;
  audioUrl?: string;
  duration: number;
}

// 애니메이션 시스템
export interface Animation {
  type: 'character' | 'background' | 'effect' | 'transition';
  name: string;
  duration: number;
  timing: 'start' | 'middle' | 'end';
  parameters?: Record<string, any>;
}

// 향상된 캐릭터 시스템
export interface EnhancedCharacter extends Character {
  personality: PersonalityTraits;
  schedule: CharacterSchedule;
  relationships: Record<string, RelationType>;
  specialEvents: string[];
  endings: CharacterEnding[];
  voiceActor?: string;
  theme: {
    color: string;
    bgm: string;
    font?: string;
  };
  stats: CharacterStats;
  dateSpots: string[];
  giftPreferences: GiftPreference[];
}

export interface PersonalityTraits {
  type: 'tsundere' | 'yandere' | 'kuudere' | 'dandere' | 'genki' | 'ojou' | 'tomboy';
  traits: string[];
  alignment: 'lawful' | 'neutral' | 'chaotic';
  temperament: 'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic';
}

export interface CharacterSchedule {
  [key: string]: {
    morning: { location: string; activity: string; availability: boolean };
    noon: { location: string; activity: string; availability: boolean };
    afternoon: { location: string; activity: string; availability: boolean };
    evening: { location: string; activity: string; availability: boolean };
    night: { location: string; activity: string; availability: boolean };
  };
}

export interface RelationType {
  type: 'friend' | 'rival' | 'sibling' | 'mentor' | 'student' | 'colleague';
  affinity: number;
  description: string;
}

export interface CharacterEnding {
  id: string;
  type: 'good' | 'true' | 'bad' | 'friendship' | 'special';
  requirements: {
    affinity: number;
    events: string[];
    flags?: string[];
    stats?: Partial<Player['stats']>;
  };
  cg: string;
  epilogue: string;
}

export interface CharacterStats {
  intelligence: number;
  charm: number;
  athletics: number;
  arts: number;
  social: number;
  mystery: number;
}

export interface GiftPreference {
  itemId: string;
  reaction: 'love' | 'like' | 'neutral' | 'dislike' | 'hate';
  affectionBonus: number;
  specialDialogue?: string;
}

// 세이브 시스템 개선
export interface EnhancedSaveData {
  slot: number;
  name: string;
  player: Player;
  relationships: RelationshipState[];
  unlockedCGs: string[];
  completedEvents: string[];
  gameTime: number;
  realTime: Date;
  version: string;
  thumbnail?: string;
  chapter: number;
  route?: string;
  statistics: GameStatistics;
}

export interface GameStatistics {
  totalPlayTime: number;
  choicesMade: number;
  eventsCompleted: number;
  endingsUnlocked: string[];
  cgsUnlocked: number;
  maxAffinity: Record<string, number>;
  giftsGiven: number;
  moneyEarned: number;
  moneySpent: number;
  battlesWon: number;
  questsCompleted: number;
}

// 미연시 스타일 선택지 시스템
export interface VisualNovelChoice {
  id: string;
  text: string;
  icon?: string;
  color?: string;
  voicePreview?: string;
  preview?: {
    affectionChange?: Record<string, number>;
    consequence?: string;
  };
  condition?: ChoiceCondition;
  timer?: number;
  hidden?: boolean;
  weight?: number;
}

export interface ChoiceCondition {
  stats?: Partial<Player['stats']>;
  affinity?: { characterId: string; min: number };
  items?: string[];
  flags?: string[];
  route?: string;
  personality?: string[];
}

// 날짜 시스템
export interface DateEvent {
  id: string;
  characterId: string;
  location: string;
  name: string;
  description: string;
  requirements: {
    affinity: number;
    money?: number;
    items?: string[];
    weather?: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
  };
  activities: DateActivity[];
  success: {
    affectionGain: number;
    memory: Memory;
    unlocks?: string[];
  };
  failure: {
    affectionLoss: number;
    consequence?: string;
  };
}

export interface DateActivity {
  name: string;
  description: string;
  cost?: number;
  choices: VisualNovelChoice[];
  outcomes: {
    perfect: { affection: number; text: string };
    good: { affection: number; text: string };
    normal: { affection: number; text: string };
    bad: { affection: number; text: string };
  };
}

// 퀘스트 시스템
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'character' | 'daily' | 'hidden';
  giver?: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number;
  prerequisites?: {
    quests?: string[];
    level?: number;
    affinity?: { characterId: string; min: number };
  };
  status: 'locked' | 'available' | 'active' | 'completed' | 'failed';
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'talk' | 'collect' | 'defeat' | 'reach' | 'achieve';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'item' | 'money' | 'exp' | 'affinity' | 'unlock';
  value: any;
  characterId?: string;
}

// 감정 시스템
export interface EmotionState {
  characterId: string;
  current: EmotionType;
  intensity: number;
  triggers: EmotionTrigger[];
  duration: number;
}

export type EmotionType = 'happy' | 'sad' | 'angry' | 'shy' | 'jealous' | 'love' | 'neutral' | 'surprised' | 'disappointed';

export interface EmotionTrigger {
  event: string;
  change: number;
  reason: string;
}

// 라이벌 시스템
export interface Rival {
  characterId: string;
  targetHeroine: string;
  affinity: number;
  aggressiveness: number;
  events: string[];
  defeated: boolean;
}

// 분기 시스템
export interface StoryBranch {
  id: string;
  name: string;
  description: string;
  entryPoint: string;
  availableCharacters: string[];
  exclusiveEvents: string[];
  endings: string[];
  bgm: string;
  theme: 'romance' | 'mystery' | 'comedy' | 'drama' | 'action';
}