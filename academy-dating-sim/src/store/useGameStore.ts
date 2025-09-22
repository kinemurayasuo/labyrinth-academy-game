import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  // Player info
  playerName: string;
  currentDay: number;
  currentPeriod: string;
  currentLocation: string;

  // Stats
  money: number;
  energy: number;
  maxEnergy: number;
  experience: number;
  level: number;

  // Character relationships
  relationships: Record<string, number>;
  unlockedCharacters: string[];

  // Inventory
  inventory: any[];

  // Achievements and progress
  achievements: any[];
  unlockedAchievements: string[];
  scenes: any[];
  unlockedScenes: string[];

  // Farming/Housing
  crops: any[];
  furniture: any[];
  pets: any[];

  // Guild
  guildRank: string;
  guildPoints: number;

  // Actions
  setPlayerName: (name: string) => void;
  advanceTime: () => void;
  changeLocation: (location: string) => void;
  updateRelationship: (character: string, points: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  addExperience: (amount: number) => void;
  unlockCharacter: (character: string) => void;
  unlockAchievement: (achievement: string) => void;
  unlockScene: (scene: string) => void;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  resetGame: () => void;
}

const initialState = {
  playerName: 'Player',
  currentDay: 1,
  currentPeriod: '아침',
  currentLocation: 'classroom',
  money: 1000,
  energy: 100,
  maxEnergy: 100,
  experience: 0,
  level: 1,
  relationships: {},
  unlockedCharacters: [],
  inventory: [],
  achievements: [],
  unlockedAchievements: [],
  scenes: [],
  unlockedScenes: [],
  crops: [],
  furniture: [],
  pets: [],
  guildRank: 'Bronze',
  guildPoints: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlayerName: (name) => set({ playerName: name }),

      advanceTime: () => set((state) => {
        const periods = ['아침', '점심', '저녁', '밤'];
        const currentIndex = periods.indexOf(state.currentPeriod);

        if (currentIndex === periods.length - 1) {
          return {
            currentPeriod: periods[0],
            currentDay: state.currentDay + 1,
            energy: state.maxEnergy,
          };
        } else {
          return {
            currentPeriod: periods[currentIndex + 1],
          };
        }
      }),

      changeLocation: (location) => set({ currentLocation: location }),

      updateRelationship: (character, points) => set((state) => ({
        relationships: {
          ...state.relationships,
          [character]: Math.max(0, Math.min(100, (state.relationships[character] || 0) + points)),
        },
      })),

      addMoney: (amount) => set((state) => ({ money: state.money + amount })),

      spendMoney: (amount) => {
        const state = get();
        if (state.money >= amount) {
          set({ money: state.money - amount });
          return true;
        }
        return false;
      },

      addEnergy: (amount) => set((state) => ({
        energy: Math.min(state.maxEnergy, state.energy + amount),
      })),

      useEnergy: (amount) => {
        const state = get();
        if (state.energy >= amount) {
          set({ energy: state.energy - amount });
          return true;
        }
        return false;
      },

      addExperience: (amount) => set((state) => {
        const newExp = state.experience + amount;
        const expForNextLevel = state.level * 100;

        if (newExp >= expForNextLevel) {
          return {
            experience: newExp - expForNextLevel,
            level: state.level + 1,
            maxEnergy: state.maxEnergy + 10,
            energy: state.maxEnergy + 10,
          };
        }

        return { experience: newExp };
      }),

      unlockCharacter: (character) => set((state) => ({
        unlockedCharacters: [...new Set([...state.unlockedCharacters, character])],
      })),

      unlockAchievement: (achievement) => set((state) => ({
        unlockedAchievements: [...new Set([...state.unlockedAchievements, achievement])],
      })),

      unlockScene: (scene) => set((state) => ({
        unlockedScenes: [...new Set([...state.unlockedScenes, scene])],
      })),

      addItem: (item) => set((state) => ({
        inventory: [...state.inventory, { ...item, id: Date.now().toString() }],
      })),

      removeItem: (itemId) => set((state) => ({
        inventory: state.inventory.filter((item) => item.id !== itemId),
      })),

      resetGame: () => set(initialState),
    }),
    {
      name: 'game-storage',
    }
  )
);