// Domain Entity: Player (Functional approach for Vite compatibility)

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export interface PlayerStatsData {
  intelligence: number;
  charm: number;
  stamina: number;
  strength: number;
  agility: number;
  luck: number;
}

export interface PlayerState {
  id: string;
  name: string;
  level: number;
  experience: number;
  stats: PlayerStatsData;
  inventory: string[];
  affection: Record<string, number>;
  location: string;
  day: number;
  timeOfDay: TimeOfDay;
  money: number;
  flags: Record<string, boolean>;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

// Player factory and business logic functions
export const PlayerEntity = {
  create(name: string): PlayerState {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      level: 1,
      experience: 0,
      stats: {
        intelligence: 10,
        charm: 10,
        stamina: 10,
        strength: 10,
        agility: 10,
        luck: 10
      },
      inventory: [],
      affection: {},
      location: 'classroom',
      day: 1,
      timeOfDay: 'morning',
      money: 1000,
      flags: {},
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50
    };
  },

  updateStats(player: PlayerState, newStats: Partial<PlayerStatsData>): PlayerState {
    return {
      ...player,
      stats: {
        ...player.stats,
        ...newStats
      }
    };
  },

  addExperience(player: PlayerState, amount: number): { player: PlayerState; leveledUp: boolean } {
    const newExperience = player.experience + amount;
    const requiredExp = player.level * 100;
    
    if (newExperience >= requiredExp) {
      const newLevel = player.level + 1;
      const remainingExp = newExperience - requiredExp;
      
      return {
        player: {
          ...player,
          level: newLevel,
          experience: remainingExp,
          maxHp: player.maxHp + 10,
          maxMp: player.maxMp + 5,
          hp: player.maxHp + 10, // Full heal on level up
          mp: player.maxMp + 5
        },
        leveledUp: true
      };
    }
    
    return {
      player: { ...player, experience: newExperience },
      leveledUp: false
    };
  },

  updateAffection(player: PlayerState, characterId: string, amount: number): PlayerState {
    const current = player.affection[characterId] || 0;
    const newValue = Math.max(0, Math.min(100, current + amount));
    
    return {
      ...player,
      affection: {
        ...player.affection,
        [characterId]: newValue
      }
    };
  },

  getAffection(player: PlayerState, characterId: string): number {
    return player.affection[characterId] || 0;
  },

  addItem(player: PlayerState, itemId: string): PlayerState {
    if (player.inventory.includes(itemId)) {
      return player; // Already has item
    }
    
    return {
      ...player,
      inventory: [...player.inventory, itemId]
    };
  },

  removeItem(player: PlayerState, itemId: string): { player: PlayerState; removed: boolean } {
    const index = player.inventory.indexOf(itemId);
    if (index === -1) {
      return { player, removed: false };
    }
    
    const newInventory = [...player.inventory];
    newInventory.splice(index, 1);
    
    return {
      player: { ...player, inventory: newInventory },
      removed: true
    };
  },

  hasItem(player: PlayerState, itemId: string): boolean {
    return player.inventory.includes(itemId);
  },

  updateHpMp(player: PlayerState, hpChange: number, mpChange: number): PlayerState {
    return {
      ...player,
      hp: Math.max(0, Math.min(player.maxHp, player.hp + hpChange)),
      mp: Math.max(0, Math.min(player.maxMp, player.mp + mpChange))
    };
  },

  spendMoney(player: PlayerState, amount: number): { player: PlayerState; success: boolean } {
    if (player.money < amount) {
      return { player, success: false };
    }
    
    return {
      player: { ...player, money: player.money - amount },
      success: true
    };
  },

  earnMoney(player: PlayerState, amount: number): PlayerState {
    return {
      ...player,
      money: player.money + amount
    };
  },

  moveToLocation(player: PlayerState, locationId: string): PlayerState {
    return {
      ...player,
      location: locationId
    };
  },

  advanceTime(player: PlayerState): { player: PlayerState; dayAdvanced: boolean } {
    const timePhases: TimeOfDay[] = ['morning', 'noon', 'afternoon', 'evening', 'night'];
    const currentIndex = timePhases.indexOf(player.timeOfDay);
    
    if (currentIndex === timePhases.length - 1) {
      // New day
      return {
        player: {
          ...player,
          day: player.day + 1,
          timeOfDay: 'morning',
          hp: Math.min(player.maxHp, player.hp + 20), // Restore HP
          mp: Math.min(player.maxMp, player.mp + 10)  // Restore MP
        },
        dayAdvanced: true
      };
    } else {
      return {
        player: {
          ...player,
          timeOfDay: timePhases[currentIndex + 1]
        },
        dayAdvanced: false
      };
    }
  },

  setFlag(player: PlayerState, flagId: string, value: boolean = true): PlayerState {
    return {
      ...player,
      flags: {
        ...player.flags,
        [flagId]: value
      }
    };
  },

  hasFlag(player: PlayerState, flagId: string): boolean {
    return player.flags[flagId] || false;
  },

  // Validation
  isValid(player: PlayerState): boolean {
    return (
      player.name.length > 0 &&
      player.level > 0 &&
      player.hp >= 0 &&
      player.mp >= 0 &&
      player.money >= 0 &&
      Object.values(player.stats).every(stat => stat >= 0)
    );
  }
};