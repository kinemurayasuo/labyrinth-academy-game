// Infrastructure: Dependency Injection Container
import { GameManagementUseCase, type GameManagementDependencies } from '../application/use-cases/GameManagementUseCase';
import { CharacterInteractionUseCase, type CharacterInteractionDependencies } from '../application/use-cases/CharacterInteractionUseCase';

// Repository implementations
import { LocalStoragePlayerRepository, LocalStorageSaveRepository } from './repositories/LocalStorageRepository';
import { JsonCharacterRepository, JsonGameDataRepository } from './repositories/JsonDataRepository';

// Create dependency injection container
export const createDependencyContainer = () => {
  // Repository instances
  const playerRepository = LocalStoragePlayerRepository;
  const characterRepository = JsonCharacterRepository;
  const gameDataRepository = JsonGameDataRepository;
  const saveRepository = LocalStorageSaveRepository;

  // Use case dependencies
  const gameManagementDependencies: GameManagementDependencies = {
    playerRepository,
    characterRepository,
    gameDataRepository,
    saveRepository
  };

  const characterInteractionDependencies: CharacterInteractionDependencies = {
    characterRepository
  };

  // Use case instances
  const gameManagementUseCase = GameManagementUseCase(gameManagementDependencies);
  const characterInteractionUseCase = CharacterInteractionUseCase(characterInteractionDependencies);

  return {
    // Repositories
    playerRepository,
    characterRepository,
    gameDataRepository,
    saveRepository,
    
    // Use Cases
    gameManagementUseCase,
    characterInteractionUseCase
  };
};

// Export singleton instance
export const DI = createDependencyContainer();

// Export type for the container
export type DIContainer = ReturnType<typeof createDependencyContainer>;