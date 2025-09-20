// 캐릭터 모듈 - 공개 API
export { default as CharacterCard } from './components/CharacterCard';
export { default as CharacterCardPage } from './components/CharacterCardPage';
export { default as CharacterCreation } from './components/CharacterCreation';
export { default as CharacterInteraction } from './components/CharacterInteraction';
export { default as CharacterManagement } from './components/CharacterManagement';
export { default as CharacterPortrait } from './components/CharacterPortrait';
export { default as HeroineCharacterCards } from './components/HeroineCharacterCards';
export { default as HeroineProfiles } from './components/HeroineProfiles';

// 캐릭터 관련 타입들
export type {
  Character,
  CharacterStats,
  Relationship,
  InteractionResult
} from './types';