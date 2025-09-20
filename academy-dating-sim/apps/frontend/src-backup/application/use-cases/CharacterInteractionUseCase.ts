// Use Case: Character Interaction
import type { PlayerState } from '../../domain/entities/Player';
import { PlayerEntity } from '../../domain/entities/Player';
import type { CharacterState } from '../../domain/entities/Character';
import { CharacterEntity } from '../../domain/entities/Character';
import { GameEngineService } from '../../domain/services/GameEngineService';
import type { ICharacterRepository } from '../ports/repositories';

export interface CharacterInteractionDependencies {
  characterRepository: ICharacterRepository;
}

export const CharacterInteractionUseCase = (deps: CharacterInteractionDependencies) => ({
  // Get character by ID
  async getCharacter(characterId: string): Promise<CharacterState | null> {
    return await deps.characterRepository.findById(characterId);
  },

  // Get all unlocked characters
  async getUnlockedCharacters(characterIds: string[]): Promise<CharacterState[]> {
    return await deps.characterRepository.findByIds(characterIds);
  },

  // Interact with character
  async interactWithCharacter(
    player: PlayerState,
    characterId: string,
    interactionType: string
  ): Promise<{
    player: PlayerState;
    message: string;
    affectionChange: number;
    newAffectionLevel: number;
  }> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const result = GameEngineService.interactWithCharacter(player, character, interactionType);
    const newAffectionLevel = PlayerEntity.getAffection(result.player, characterId);

    return {
      ...result,
      newAffectionLevel
    };
  },

  // Get character dialogue based on affection
  async getCharacterDialogue(
    characterId: string,
    affectionLevel: number
  ): Promise<string> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return '...';
    }

    return CharacterEntity.getDialogue(character, affectionLevel);
  },

  // Get available interactions for character
  async getAvailableInteractions(
    characterId: string,
    affectionLevel: number
  ): Promise<Array<{
    id: string;
    name: string;
    minAffection: number;
    type: string;
  }>> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return [];
    }

    return CharacterEntity.getAvailableActivities(character, affectionLevel);
  },

  // Check if character's secret should be revealed
  async shouldRevealSecret(
    characterId: string,
    affectionLevel: number
  ): Promise<boolean> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return false;
    }

    return CharacterEntity.shouldRevealSecret(character, affectionLevel);
  },

  // Get character mood based on affection
  async getCharacterMood(
    characterId: string,
    affectionLevel: number
  ): Promise<string> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return 'neutral';
    }

    return CharacterEntity.getCharacterMood(character, affectionLevel);
  },

  // Get character relationships
  async getCharacterRelationships(
    characterId: string
  ): Promise<Record<string, string>> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return {};
    }

    return character.relationships;
  },

  // Use item on character (gift giving)
  async giveGiftToCharacter(
    player: PlayerState,
    characterId: string,
    itemId: string
  ): Promise<{
    player: PlayerState;
    success: boolean;
    message: string;
    affectionChange: number;
  }> {
    const character = await deps.characterRepository.findById(characterId);
    if (!character) {
      return {
        player,
        success: false,
        message: '캐릭터를 찾을 수 없습니다.',
        affectionChange: 0
      };
    }

    if (!PlayerEntity.hasItem(player, itemId)) {
      return {
        player,
        success: false,
        message: '아이템을 가지고 있지 않습니다.',
        affectionChange: 0
      };
    }

    // Remove item from inventory
    const { player: updatedPlayer, removed } = PlayerEntity.removeItem(player, itemId);
    if (!removed) {
      return {
        player,
        success: false,
        message: '아이템을 사용할 수 없습니다.',
        affectionChange: 0
      };
    }

    // Increase affection based on gift
    const affectionChange = 5; // Base gift affection bonus
    const finalPlayer = PlayerEntity.updateAffection(updatedPlayer, characterId, affectionChange);

    return {
      player: finalPlayer,
      success: true,
      message: `${character.name}이(가) 선물을 좋아합니다!`,
      affectionChange
    };
  }
});