// Presentation Layer: Clean Architecture Game Hook
import { useState, useEffect, useCallback } from 'react';
import type { PlayerState } from '../../domain/entities/Player';
import type { CharacterState } from '../../domain/entities/Character';
import { DI } from '../../infrastructure/di-container';

export interface GameState {
  player: PlayerState | null;
  characters: CharacterState[];
  unlockedCharacters: string[];
  completedEvents: string[];
  gameMessage: string;
  gameEnding: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCleanGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    characters: [],
    unlockedCharacters: ['sakura', 'yuki', 'luna'],
    completedEvents: [],
    gameMessage: '학원 생활이 시작됩니다!',
    gameEnding: null,
    isLoading: false,
    error: null
  });

  // Load initial game data
  useEffect(() => {
    const loadInitialData = async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Check for existing save
        const hasExistingSave = await DI.gameManagementUseCase.hasSavedGame();
        
        if (hasExistingSave) {
          const saveData = await DI.gameManagementUseCase.loadGame();
          if (saveData) {
            setGameState(prev => ({
              ...prev,
              player: saveData.saveData.player,
              characters: saveData.characters,
              unlockedCharacters: saveData.saveData.unlockedCharacters,
              completedEvents: saveData.saveData.completedEvents,
              gameMessage: saveData.saveData.gameMessage,
              gameEnding: saveData.saveData.gameEnding,
              isLoading: false
            }));
            return;
          }
        }

        // Load default characters
        const characters = await DI.characterInteractionUseCase.getUnlockedCharacters(['sakura', 'yuki', 'luna']);
        setGameState(prev => ({
          ...prev,
          characters,
          isLoading: false
        }));

      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false
        }));
      }
    };

    loadInitialData();
  }, []);

  // Game actions
  const actions = {
    // Start new game
    startNewGame: useCallback(async (playerName: string) => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const result = await DI.gameManagementUseCase.startNewGame(playerName);
        setGameState(prev => ({
          ...prev,
          player: result.player,
          characters: result.characters,
          gameMessage: result.message,
          unlockedCharacters: ['sakura', 'yuki', 'luna'],
          completedEvents: [],
          gameEnding: null,
          isLoading: false
        }));
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to start new game',
          isLoading: false
        }));
      }
    }, []),

    // Save game
    saveGame: useCallback(async () => {
      if (!gameState.player) return;
      
      try {
        await DI.gameManagementUseCase.saveGame(
          gameState.player,
          gameState.unlockedCharacters,
          gameState.completedEvents,
          gameState.gameMessage,
          gameState.gameEnding
        );
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to save game'
        }));
      }
    }, [gameState]),

    // Reset game
    resetGame: useCallback(async () => {
      try {
        await DI.gameManagementUseCase.resetGame();
        setGameState({
          player: null,
          characters: [],
          unlockedCharacters: ['sakura', 'yuki', 'luna'],
          completedEvents: [],
          gameMessage: '학원 생활이 시작됩니다!',
          gameEnding: null,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to reset game'
        }));
      }
    }, []),

    // Character interaction
    interactWithCharacter: useCallback(async (characterId: string, interactionType: string) => {
      if (!gameState.player) return;

      try {
        const result = await DI.characterInteractionUseCase.interactWithCharacter(
          gameState.player,
          characterId,
          interactionType
        );

        setGameState(prev => ({
          ...prev,
          player: result.player,
          gameMessage: result.message
        }));

        return result;
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Interaction failed'
        }));
        return null;
      }
    }, [gameState.player]),

    // Give gift to character
    giveGift: useCallback(async (characterId: string, itemId: string) => {
      if (!gameState.player) return;

      try {
        const result = await DI.characterInteractionUseCase.giveGiftToCharacter(
          gameState.player,
          characterId,
          itemId
        );

        setGameState(prev => ({
          ...prev,
          player: result.player,
          gameMessage: result.message
        }));

        return result;
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Gift giving failed'
        }));
        return null;
      }
    }, [gameState.player]),

    // Update player directly (for legacy compatibility)
    updatePlayer: useCallback((updater: (player: PlayerState) => PlayerState) => {
      setGameState(prev => ({
        ...prev,
        player: prev.player ? updater(prev.player) : null
      }));
    }, []),

    // Set game message
    setGameMessage: useCallback((message: string) => {
      setGameState(prev => ({ ...prev, gameMessage: message }));
    }, []),

    // Clear error
    clearError: useCallback(() => {
      setGameState(prev => ({ ...prev, error: null }));
    }, [])
  };

  return {
    gameState,
    actions,
    // Legacy compatibility getters
    player: gameState.player,
    characters: gameState.characters,
    unlockedCharacters: gameState.unlockedCharacters,
    gameMessage: gameState.gameMessage,
    isLoading: gameState.isLoading,
    error: gameState.error
  };
};