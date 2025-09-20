// Infrastructure: JSON Data Repository Implementations
import type { CharacterState } from '../../domain/entities/Character';
import { CharacterEntity } from '../../domain/entities/Character';
import type { ICharacterRepository, IGameDataRepository } from '../../application/ports/repositories';
import type { GameEvent } from '../../domain/services/GameEngineService';

// Import JSON data
import charactersData from '../../data/characters.json';
import characterLoreData from '../../data/character-lore.json';
import eventsData from '../../data/events.json';
import itemsData from '../../data/items.json';
import locationsData from '../../data/locations.json';
import dialoguesData from '../../data/dialogues.json';

// Character Repository Implementation
export const JsonCharacterRepository: ICharacterRepository = {
  async findById(id: string): Promise<CharacterState | null> {
    const characterData = (charactersData as any)[id];
    const loreData = (characterLoreData as any)[id];
    
    if (!characterData) {
      return null;
    }

    // Merge character data with lore data
    const mergedData = {
      id,
      name: characterData.name,
      fullName: loreData?.fullName || characterData.name,
      age: loreData?.age || 18,
      role: characterData.role,
      sprite: characterData.sprite,
      background: loreData?.background || '',
      personality: loreData?.personality || '',
      specialSkills: loreData?.specialSkills || [],
      weakness: loreData?.weakness || '',
      dream: loreData?.dream || '',
      secretStory: loreData?.secretStory || '',
      relationships: loreData?.relationships || {},
      hobby: loreData?.hobby || [],
      favorite: loreData?.favorite || [],
      dislike: loreData?.dislike || [],
      birthday: loreData?.birthday || '',
      height: loreData?.height || '',
      bloodType: loreData?.bloodType || '',
      affectionStart: characterData.affectionStart || 0,
      maxAffection: characterData.maxAffection || 100,
      dialogues: characterData.dialogues || {}
    };

    return CharacterEntity.create(mergedData);
  },

  async findAll(): Promise<CharacterState[]> {
    const characterIds = Object.keys(charactersData);
    const characters = await Promise.all(
      characterIds.map(id => this.findById(id))
    );
    
    return characters.filter((char): char is CharacterState => char !== null);
  },

  async findByIds(ids: string[]): Promise<CharacterState[]> {
    const characters = await Promise.all(
      ids.map(id => this.findById(id))
    );
    
    return characters.filter((char): char is CharacterState => char !== null);
  }
};

// Game Data Repository Implementation
export const JsonGameDataRepository: IGameDataRepository = {
  async getEvents(): Promise<GameEvent[]> {
    return (eventsData as any).events || [];
  },

  async getItems(): Promise<Record<string, any>> {
    return (itemsData as any).items || {};
  },

  async getLocations(): Promise<Record<string, any>> {
    return (locationsData as any).locations || {};
  },

  async getDialogues(): Promise<Record<string, any>> {
    return dialoguesData as any || {};
  }
};