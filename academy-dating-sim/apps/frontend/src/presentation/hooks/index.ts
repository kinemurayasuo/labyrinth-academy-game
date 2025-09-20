// Presentation Layer Hooks - Clean Architecture Export
export { useCleanGameState } from './useCleanGameState';
export { useCharacterInteraction } from './useCharacterInteraction';
export { usePresentationState } from './usePresentationState';

// Type exports for presentation layer
export type { GameState } from './useCleanGameState';
export type { CharacterInteractionState } from './useCharacterInteraction';

// Main export - this is what components should use
export { usePresentationState as useGameState } from './usePresentationState';