// Infrastructure: LocalStorage Repository Implementations
import type { PlayerState } from '../../domain/entities/Player';
import type { IPlayerRepository, ISaveRepository, GameSaveData } from '../../application/ports/repositories';

// LocalStorage Player Repository
export const LocalStoragePlayerRepository: IPlayerRepository = {
  async save(player: PlayerState): Promise<void> {
    localStorage.setItem('player', JSON.stringify(player));
  },

  async load(): Promise<PlayerState | null> {
    const data = localStorage.getItem('player');
    return data ? JSON.parse(data) : null;
  },

  async delete(): Promise<void> {
    localStorage.removeItem('player');
  }
};

// LocalStorage Save Repository
export const LocalStorageSaveRepository: ISaveRepository = {
  async save(saveData: GameSaveData): Promise<void> {
    localStorage.setItem('academyDatingSim', JSON.stringify(saveData));
  },

  async load(): Promise<GameSaveData | null> {
    const data = localStorage.getItem('academyDatingSim');
    return data ? JSON.parse(data) : null;
  },

  async exists(): Promise<boolean> {
    return localStorage.getItem('academyDatingSim') !== null;
  },

  async delete(): Promise<void> {
    localStorage.removeItem('academyDatingSim');
  }
};