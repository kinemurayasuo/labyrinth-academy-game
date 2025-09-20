// Game related types
export interface PlayerStats {
  intelligence: number;
  charm: number;
  athletics: number;
  creativity: number;
}

export interface PlayerData {
  name: string;
  level: number;
  stats: PlayerStats;
  experience: number;
  avatar?: string;
}

export interface CharacterRelation {
  affection: number;
  friendship: number;
  rivalry: number;
}

export interface GameProgress {
  currentChapter: number;
  completedTutorial: boolean;
  unlockedFeatures: string[];
}

export interface GameEvent {
  id: string;
  requirements?: Record<string, number>;
  conditions?: Record<string, any>;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  autoSave: boolean;
  soundVolume: number;
  musicVolume: number;
  textSpeed?: number;
  skipUnread?: boolean;
}

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  language: string;
  timezone: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// JWT types
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Game save types
export interface GameSaveData {
  id?: string;
  saveName: string;
  playerData: PlayerData;
  gameProgress: GameProgress;
  currentLocation?: string;
  currentDay: number;
  currentTime: string;
  unlockedCharacters: string[];
  characterRelations: Record<string, CharacterRelation>;
  completedEvents: string[];
  availableEvents: GameEvent[];
  gameSettings: GameSettings;
  playtimeMinutes: number;
  isAutoSave: boolean;
  saveDate?: string;
  gameVersion?: string;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'story' | 'character' | 'stats' | 'collection' | 'special';
  requirements: Record<string, any>;
  reward?: {
    type: 'xp' | 'item' | 'unlock';
    value: any;
  };
}

export interface UserAchievementProgress {
  achievementId: string;
  progress: Record<string, any>;
  isCompleted: boolean;
  completedAt?: string;
  unlockedAt: string;
}

// Analytics types
export interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  gameState?: Record<string, any>;
  sessionId?: string;
}

export interface CharacterAnalytics {
  characterId: string;
  totalInteractions: number;
  averageAffection: number;
  routeCompletions: number;
  choiceStats: Record<string, number>;
}

// Session types
export interface UserSessionData {
  sessionStart: string;
  sessionEnd?: string;
  deviceInfo: Record<string, any>;
  gameVersion?: string;
  actionsCount: number;
  eventsCompleted: number;
}

// Express middleware types
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role?: string;
  };
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// OAuth types
export interface OAuthProfile {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  provider: 'google' | 'discord' | 'kakao';
}

// Character data types (from game files)
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  personality: string[];
  interests: string[];
  stats: {
    intelligence: number;
    charm: number;
    athletics: number;
    creativity: number;
  };
  relationships: {
    [characterId: string]: {
      type: 'friend' | 'rival' | 'neutral';
      description: string;
    };
  };
}

// Event data types
export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  type: 'story' | 'character' | 'training' | 'special';
  requirements: {
    stats?: Partial<PlayerStats>;
    characters?: string[];
    events?: string[];
    day?: number;
    time?: string;
    location?: string;
  };
  rewards: {
    stats?: Partial<PlayerStats>;
    affection?: Record<string, number>;
    items?: string[];
    experience?: number;
  };
  choices: {
    id: string;
    text: string;
    requirements?: Record<string, any>;
    effects: Record<string, any>;
  }[];
}