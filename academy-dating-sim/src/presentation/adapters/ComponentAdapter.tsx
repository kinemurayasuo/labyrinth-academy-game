// Component Adapter: Bridge between Clean Architecture and existing React components
import React from 'react';
import { usePresentationState } from '../hooks/usePresentationState';

/**
 * Higher-Order Component that provides Clean Architecture state management
 * to existing components without requiring changes to component code
 */
export function withCleanArchitecture<T extends object>(
  WrappedComponent: React.ComponentType<T & { gameState: any }>
) {
  const WithCleanArchitectureComponent = (props: T) => {
    const gameState = usePresentationState();
    
    return (
      <WrappedComponent 
        {...props} 
        gameState={gameState}
      />
    );
  };

  WithCleanArchitectureComponent.displayName = 
    `withCleanArchitecture(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithCleanArchitectureComponent;
}

/**
 * Hook-based adapter for components that prefer hooks over HOCs
 */
export const useGameStoreAdapter = () => {
  const presentationState = usePresentationState();
  
  // Map the presentation state to match the old useGameStore interface
  return {
    // Direct state access
    ...presentationState,
    
    // Legacy method mappings
    setPlayer: presentationState.updatePlayer,
    addCharacter: (_characterId: string) => {
      // This would typically be handled by unlocking characters
      console.warn('addCharacter is deprecated, use character unlocking through game events');
    },
    
    // Enhanced methods that weren't in the original store
    getCharacterAffection: (characterId: string) => {
      if (presentationState.player) {
        return presentationState.player.affection[characterId] || 0;
      }
      return 0;
    },
    
    getPlayerStats: () => {
      if (presentationState.player) {
        return presentationState.player.stats;
      }
      return { charm: 0, intelligence: 0, fitness: 0, creativity: 0 };
    },
    
    // Game progression helpers
    isCharacterUnlocked: (characterId: string) => {
      return presentationState.unlockedCharacters.includes(characterId);
    },
    
    hasCompletedEvent: (eventId: string) => {
      return presentationState.completedEvents.includes(eventId);
    }
  };
};

/**
 * Context Provider for Clean Architecture state
 * Use this at the app root if you want to avoid prop drilling
 */
const CleanArchitectureContext = React.createContext<ReturnType<typeof usePresentationState> | null>(null);

export const CleanArchitectureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gameState = usePresentationState();
  
  return (
    <CleanArchitectureContext.Provider value={gameState}>
      {children}
    </CleanArchitectureContext.Provider>
  );
};

export const useCleanArchitectureContext = () => {
  const context = React.useContext(CleanArchitectureContext);
  if (!context) {
    throw new Error('useCleanArchitectureContext must be used within a CleanArchitectureProvider');
  }
  return context;
};