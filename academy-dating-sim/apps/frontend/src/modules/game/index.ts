// 게임 모듈 - 공개 API
export { default as GameUI } from './components/GameUI';
export { default as BattleArena } from './components/BattleArena';
export { default as Inventory } from './components/Inventory';
export { default as ShoppingPage } from './components/ShoppingPage';
export { default as CraftingSystem } from './components/CraftingSystem';
export { default as FarmingSystem } from './components/FarmingSystem';
export { default as GuildSystem } from './components/GuildSystem';
export { default as HousingSystem } from './components/HousingSystem';
export { default as PetSystem } from './components/PetSystem';
export { default as SocialSystem } from './components/SocialSystem';
export { default as WeatherSystem } from './components/WeatherSystem';

// 미니게임들
export { default as CardMatchingGame } from './components/MiniGames/CardMatchingGame';
export { default as FishingGame } from './components/MiniGames/FishingGame';

// 게임 관련 타입들
export type {
  GameState,
  BattleState,
  InventoryItem,
  ShopItem,
  MiniGameResult
} from './types';