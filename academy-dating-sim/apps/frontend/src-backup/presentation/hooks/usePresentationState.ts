// Presentation Layer: State Management Bridge
import { useState, useEffect, useCallback } from 'react';
import { useCleanGameState } from './useCleanGameState';
import { useCharacterInteraction } from './useCharacterInteraction';

/**
 * Main presentation layer hook that bridges Clean Architecture with React components
 * This hook provides the same interface as the legacy useGameStore for compatibility
 */
export const usePresentationState = () => {
  const gameState = useCleanGameState();
  const characterInteraction = useCharacterInteraction();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the game state on first load
  useEffect(() => {
    if (!gameState.isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [gameState.isLoading, isInitialized]);

  // Legacy compatibility interface
  const legacyInterface = {
    // Game state getters (legacy compatibility)
    player: gameState.player,
    characters: gameState.characters,
    unlockedCharacters: gameState.unlockedCharacters,
    gameMessage: gameState.gameMessage,
    gameEnding: gameState.gameState.gameEnding,
    completedEvents: gameState.gameState.completedEvents,
    
    // Character interaction state
    selectedCharacter: characterInteraction.selectedCharacter,
    currentDialogue: characterInteraction.currentDialogue,
    characterMood: characterInteraction.characterMood,
    availableActivities: characterInteraction.availableActivities,
    
    // Loading and error states
    isLoading: gameState.isLoading || characterInteraction.isInteracting,
    error: gameState.error || characterInteraction.error,

    // Game management actions
    startNewGame: gameState.actions.startNewGame,
    saveGame: gameState.actions.saveGame,
    resetGame: gameState.actions.resetGame,
    setGameMessage: gameState.actions.setGameMessage,
    
    // Player update action (legacy compatibility)
    updatePlayer: gameState.actions.updatePlayer,
    
    // Character interaction actions
    selectCharacter: useCallback((characterId: string) => {
      if (gameState.player) {
        return characterInteraction.actions.selectCharacter(characterId, gameState.player);
      }
    }, [characterInteraction.actions, gameState.player]),
    
    interactWithCharacter: useCallback((interactionType: string) => {
      if (gameState.player) {
        return characterInteraction.actions.interact(gameState.player, interactionType);
      }
    }, [characterInteraction.actions, gameState.player]),
    
    giveGift: useCallback((itemId: string) => {
      if (gameState.player) {
        return characterInteraction.actions.giveGift(gameState.player, itemId);
      }
    }, [characterInteraction.actions, gameState.player]),
    
    getDialogue: useCallback((characterId: string) => {
      if (gameState.player) {
        return characterInteraction.actions.getDialogue(gameState.player, characterId);
      }
    }, [characterInteraction.actions, gameState.player]),
    
    // Clear actions
    clearCharacterSelection: characterInteraction.actions.clearSelection,
    clearError: useCallback(() => {
      gameState.actions.clearError();
      characterInteraction.actions.clearError();
    }, [gameState.actions, characterInteraction.actions]),

    // Additional state management methods for complex scenarios
    advanced: {
      // Direct access to Clean Architecture hooks for advanced usage
      gameState,
      characterInteraction,
      
      // Bulk operations
      refreshCharacterData: useCallback(async () => {
        if (gameState.player && characterInteraction.selectedCharacter) {
          await characterInteraction.actions.selectCharacter(
            characterInteraction.selectedCharacter.id,
            gameState.player
          );
        }
      }, [gameState.player, characterInteraction]),
      
      // Batch character interactions
      batchInteract: useCallback(async (interactions: Array<{
        characterId: string;
        interactionType: string;
      }>) => {
        if (!gameState.player) return;
        
        const results = [];
        for (const interaction of interactions) {
          const result = await gameState.actions.interactWithCharacter(
            interaction.characterId,
            interaction.interactionType
          );
          results.push(result);
        }
        return results;
      }, [gameState.player, gameState.actions])
    }
  };

  return {
    ...legacyInterface,
    isInitialized
  };
};