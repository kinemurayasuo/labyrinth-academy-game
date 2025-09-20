// Presentation Layer - Clean Architecture Implementation
// This layer handles UI concerns and adapts Clean Architecture to React

// Main hooks exports
export * from './hooks';

// Component adapters for migration
export * from './adapters/ComponentAdapter';

// Re-export for easy migration from old structure
export { usePresentationState as useGameStore } from './hooks/usePresentationState';