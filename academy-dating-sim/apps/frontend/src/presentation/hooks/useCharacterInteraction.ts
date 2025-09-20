// Presentation Layer: Character Interaction Hook
import { useState, useCallback } from 'react';
import type { PlayerState } from '../../domain/entities/Player';
import { PlayerEntity } from '../../domain/entities/Player';
import type { CharacterState } from '../../domain/entities/Character';
import { DI } from '../../infrastructure/di-container';

export interface CharacterInteractionState {
  selectedCharacter: CharacterState | null;
  currentDialogue: string | null;
  characterMood: string | null;
  availableActivities: Array<{ id: string; name: string; minAffection: number; type: string }>;
  isInteracting: boolean;
  error: string | null;
}

export const useCharacterInteraction = () => {
  const [state, setState] = useState<CharacterInteractionState>({
    selectedCharacter: null,
    currentDialogue: null,
    characterMood: null,
    availableActivities: [],
    isInteracting: false,
    error: null
  });

  const actions = {
    // Select a character for interaction
    selectCharacter: useCallback(async (characterId: string, playerState: PlayerState) => {
      setState(prev => ({ ...prev, isInteracting: true }));
      
      try {
        const characters = await DI.characterInteractionUseCase.getUnlockedCharacters([characterId]);
        const character = characters.find(c => c.id === characterId);
        
        if (!character) {
          throw new Error('Character not found');
        }

        const affectionLevel = PlayerEntity.getAffection(playerState, characterId);
        const mood = await DI.characterInteractionUseCase.getCharacterMood(characterId, affectionLevel);
        const activities = await DI.characterInteractionUseCase.getAvailableInteractions(characterId, affectionLevel);

        setState(prev => ({
          ...prev,
          selectedCharacter: character,
          characterMood: mood,
          availableActivities: activities,
          currentDialogue: null,
          isInteracting: false,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to select character',
          isInteracting: false
        }));
      }
    }, []),

    // Get dialogue from character
    getDialogue: useCallback(async (player: PlayerState, characterId: string) => {
      if (!state.selectedCharacter) return;

      try {
        const affectionLevel = PlayerEntity.getAffection(player, characterId);
        const dialogue = await DI.characterInteractionUseCase.getCharacterDialogue(
          characterId,
          affectionLevel
        );

        setState(prev => ({
          ...prev,
          currentDialogue: dialogue,
          error: null
        }));

        return dialogue;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to get dialogue'
        }));
        return null;
      }
    }, [state.selectedCharacter]),

    // Perform interaction with character
    interact: useCallback(async (player: PlayerState, interactionType: string) => {
      if (!state.selectedCharacter) return null;

      setState(prev => ({ ...prev, isInteracting: true }));

      try {
        const result = await DI.characterInteractionUseCase.interactWithCharacter(
          player,
          state.selectedCharacter.id,
          interactionType
        );

        // Update character mood after interaction
        const updatedCharacters = await DI.characterInteractionUseCase.getUnlockedCharacters([state.selectedCharacter.id]);
        const updatedCharacter = updatedCharacters.find(c => c.id === state.selectedCharacter!.id);
        
        if (updatedCharacter) {
          const newAffectionLevel = PlayerEntity.getAffection(result.player, state.selectedCharacter.id);
          const newMood = await DI.characterInteractionUseCase.getCharacterMood(state.selectedCharacter.id, newAffectionLevel);
          setState(prev => ({
            ...prev,
            selectedCharacter: updatedCharacter,
            characterMood: newMood,
            currentDialogue: result.message,
            isInteracting: false,
            error: null
          }));
        }

        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Interaction failed',
          isInteracting: false
        }));
        return null;
      }
    }, [state.selectedCharacter]),

    // Give gift to character
    giveGift: useCallback(async (player: PlayerState, itemId: string) => {
      if (!state.selectedCharacter) return null;

      setState(prev => ({ ...prev, isInteracting: true }));

      try {
        const result = await DI.characterInteractionUseCase.giveGiftToCharacter(
          player,
          state.selectedCharacter.id,
          itemId
        );

        // Update character state after gift
        const updatedCharacters = await DI.characterInteractionUseCase.getUnlockedCharacters([state.selectedCharacter.id]);
        const updatedCharacter = updatedCharacters.find(c => c.id === state.selectedCharacter!.id);
        
        if (updatedCharacter) {
          const newAffectionLevel = PlayerEntity.getAffection(result.player, state.selectedCharacter.id);
          const newMood = await DI.characterInteractionUseCase.getCharacterMood(state.selectedCharacter.id, newAffectionLevel);
          setState(prev => ({
            ...prev,
            selectedCharacter: updatedCharacter,
            characterMood: newMood,
            currentDialogue: result.message,
            isInteracting: false,
            error: null
          }));
        }

        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Gift giving failed',
          isInteracting: false
        }));
        return null;
      }
    }, [state.selectedCharacter]),

    // Clear current character selection
    clearSelection: useCallback(() => {
      setState({
        selectedCharacter: null,
        currentDialogue: null,
        characterMood: null,
        availableActivities: [],
        isInteracting: false,
        error: null
      });
    }, []),

    // Clear error
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, [])
  };

  return {
    state,
    actions,
    // Legacy compatibility getters
    selectedCharacter: state.selectedCharacter,
    currentDialogue: state.currentDialogue,
    characterMood: state.characterMood,
    availableActivities: state.availableActivities,
    isInteracting: state.isInteracting,
    error: state.error
  };
};