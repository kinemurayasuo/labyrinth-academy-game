// Application Ports - Repository Interfaces (Dependency Inversion)

import type { PlayerState } from '../../domain/entities/Player';
import type { CharacterState } from '../../domain/entities/Character';
import type { GameEvent } from '../../domain/services/GameEngineService';

// Player Repository Interface
export interface IPlayerRepository {
  save(player: PlayerState): Promise<void>;
  load(): Promise<PlayerState | null>;
  delete(): Promise<void>;
}

// Character Repository Interface
export interface ICharacterRepository {
  findById(id: string): Promise<CharacterState | null>;
  findAll(): Promise<CharacterState[]>;
  findByIds(ids: string[]): Promise<CharacterState[]>;
}

// Game Data Repository Interface
export interface IGameDataRepository {
  getEvents(): Promise<GameEvent[]>;
  getItems(): Promise<Record<string, any>>;
  getLocations(): Promise<Record<string, any>>;
  getDialogues(): Promise<Record<string, any>>;
}

// Save/Load Repository Interface
export interface ISaveRepository {
  save(saveData: GameSaveData): Promise<void>;
  load(): Promise<GameSaveData | null>;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
}

// Game Save Data structure
export interface GameSaveData {
  player: PlayerState;
  unlockedCharacters: string[];
  completedEvents: string[];
  gameMessage: string;
  gameEnding: string | null;
  saveDate: string;
  version: string;
}