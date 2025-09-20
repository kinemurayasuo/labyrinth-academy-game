// Use Case: Game Management (Functional approach)
import type { PlayerState } from '../../domain/entities/Player';
import { PlayerEntity } from '../../domain/entities/Player';
import type { CharacterState } from '../../domain/entities/Character';
import { GameEngineService } from '../../domain/services/GameEngineService';
import type { 
  IPlayerRepository, 
  ICharacterRepository, 
  IGameDataRepository, 
  ISaveRepository,
  GameSaveData 
} from '../ports/repositories';

export interface GameManagementDependencies {
  playerRepository: IPlayerRepository;
  characterRepository: ICharacterRepository;
  gameDataRepository: IGameDataRepository;
  saveRepository: ISaveRepository;
}

export const GameManagementUseCase = (deps: GameManagementDependencies) => ({
  // Start new game
  async startNewGame(playerName: string): Promise<{
    player: PlayerState;
    characters: CharacterState[];
    message: string;
  }> {
    // Create new player
    const player = PlayerEntity.create(playerName);
    
    // Load initial characters
    const characters = await deps.characterRepository.findByIds(['sakura', 'yuki', 'luna']);
    
    // Save initial state
    await deps.playerRepository.save(player);
    
    return {
      player,
      characters,
      message: `${playerName}의 학원 생활이 시작됩니다!`
    };
  },

  // Load existing game
  async loadGame(): Promise<{
    saveData: GameSaveData;
    characters: CharacterState[];
  } | null> {
    const saveData = await deps.saveRepository.load();
    if (!saveData) {
      return null;
    }

    const characters = await deps.characterRepository.findByIds(saveData.unlockedCharacters);
    
    return {
      saveData,
      characters
    };
  },

  // Save current game state
  async saveGame(
    player: PlayerState,
    unlockedCharacters: string[],
    completedEvents: string[],
    gameMessage: string,
    gameEnding: string | null
  ): Promise<void> {
    const saveData: GameSaveData = {
      player,
      unlockedCharacters,
      completedEvents,
      gameMessage,
      gameEnding,
      saveDate: new Date().toISOString(),
      version: '1.0.0'
    };

    await deps.saveRepository.save(saveData);
    await deps.playerRepository.save(player);
  },

  // Check if save exists
  async hasSavedGame(): Promise<boolean> {
    return await deps.saveRepository.exists();
  },

  // Reset game
  async resetGame(): Promise<void> {
    await deps.saveRepository.delete();
    await deps.playerRepository.delete();
  },

  // Get game ending
  async checkGameEnding(player: PlayerState): Promise<string | null> {
    return GameEngineService.checkEnding(player);
  }
});