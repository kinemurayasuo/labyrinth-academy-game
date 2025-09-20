import { EnhancedSaveData, GameStatistics } from '../types/advanced-game';
import { Player } from '../types/game';
import { RelationshipManager } from './RelationshipManager';

export class SaveManager {
  private static readonly SAVE_KEY_PREFIX = 'academy_save_';
  private static readonly AUTO_SAVE_KEY = 'academy_auto_save';
  private static readonly QUICK_SAVE_KEY = 'academy_quick_save';
  private static readonly MAX_SAVE_SLOTS = 20;
  private static readonly MAX_AUTO_SAVES = 3;

  private autoSaveInterval: number | null = null;
  private currentAutoSaveSlot = 0;

  constructor() {
    this.initializeSaveSlots();
  }

  private initializeSaveSlots() {
    const existingSaves = this.getAllSaves();
    if (existingSaves.length === 0) {
      for (let i = 1; i <= SaveManager.MAX_SAVE_SLOTS; i++) {
        localStorage.setItem(`${SaveManager.SAVE_KEY_PREFIX}${i}_empty`, 'true');
      }
    }
  }

  async save(
    slot: number,
    name: string,
    player: Player,
    relationshipManager: RelationshipManager,
    gameData: any
  ): Promise<boolean> {
    try {
      const saveData: EnhancedSaveData = {
        slot,
        name,
        player,
        relationships: relationshipManager.getAllRelationships(),
        unlockedCGs: gameData.unlockedCGs || [],
        completedEvents: gameData.completedEvents || [],
        gameTime: gameData.gameTime || 0,
        realTime: new Date(),
        version: '2.0.0',
        thumbnail: await this.generateThumbnail(),
        chapter: gameData.chapter || 1,
        route: gameData.route,
        statistics: this.generateStatistics(player, gameData)
      };

      const key = `${SaveManager.SAVE_KEY_PREFIX}${slot}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      localStorage.removeItem(`${key}_empty`);

      this.createBackup(saveData);

      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  async load(slot: number): Promise<EnhancedSaveData | null> {
    try {
      const key = `${SaveManager.SAVE_KEY_PREFIX}${slot}`;
      const data = localStorage.getItem(key);

      if (!data) return null;

      const saveData: EnhancedSaveData = JSON.parse(data);

      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data');
      }

      return saveData;
    } catch (error) {
      console.error('Load failed:', error);
      return this.attemptRecovery(slot);
    }
  }

  async quickSave(
    player: Player,
    relationshipManager: RelationshipManager,
    gameData: any
  ): Promise<boolean> {
    try {
      const saveData: EnhancedSaveData = {
        slot: -1,
        name: 'Quick Save',
        player,
        relationships: relationshipManager.getAllRelationships(),
        unlockedCGs: gameData.unlockedCGs || [],
        completedEvents: gameData.completedEvents || [],
        gameTime: gameData.gameTime || 0,
        realTime: new Date(),
        version: '2.0.0',
        thumbnail: await this.generateThumbnail(),
        chapter: gameData.chapter || 1,
        route: gameData.route,
        statistics: this.generateStatistics(player, gameData)
      };

      localStorage.setItem(SaveManager.QUICK_SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Quick save failed:', error);
      return false;
    }
  }

  async quickLoad(): Promise<EnhancedSaveData | null> {
    try {
      const data = localStorage.getItem(SaveManager.QUICK_SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Quick load failed:', error);
      return null;
    }
  }

  startAutoSave(
    intervalMinutes: number,
    player: Player,
    relationshipManager: RelationshipManager,
    gameData: any
  ) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = window.setInterval(async () => {
      await this.autoSave(player, relationshipManager, gameData);
    }, intervalMinutes * 60 * 1000);

    this.autoSave(player, relationshipManager, gameData);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private async autoSave(
    player: Player,
    relationshipManager: RelationshipManager,
    gameData: any
  ): Promise<boolean> {
    try {
      this.currentAutoSaveSlot = (this.currentAutoSaveSlot % SaveManager.MAX_AUTO_SAVES) + 1;

      const saveData: EnhancedSaveData = {
        slot: -100 - this.currentAutoSaveSlot,
        name: `Auto Save ${this.currentAutoSaveSlot}`,
        player,
        relationships: relationshipManager.getAllRelationships(),
        unlockedCGs: gameData.unlockedCGs || [],
        completedEvents: gameData.completedEvents || [],
        gameTime: gameData.gameTime || 0,
        realTime: new Date(),
        version: '2.0.0',
        thumbnail: await this.generateThumbnail(),
        chapter: gameData.chapter || 1,
        route: gameData.route,
        statistics: this.generateStatistics(player, gameData)
      };

      const key = `${SaveManager.AUTO_SAVE_KEY}_${this.currentAutoSaveSlot}`;
      localStorage.setItem(key, JSON.stringify(saveData));

      return true;
    } catch (error) {
      console.error('Auto save failed:', error);
      return false;
    }
  }

  deleteSave(slot: number): boolean {
    try {
      const key = `${SaveManager.SAVE_KEY_PREFIX}${slot}`;
      localStorage.removeItem(key);
      localStorage.setItem(`${key}_empty`, 'true');
      return true;
    } catch (error) {
      console.error('Delete save failed:', error);
      return false;
    }
  }

  getAllSaves(): EnhancedSaveData[] {
    const saves: EnhancedSaveData[] = [];

    for (let i = 1; i <= SaveManager.MAX_SAVE_SLOTS; i++) {
      const key = `${SaveManager.SAVE_KEY_PREFIX}${i}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          saves.push(JSON.parse(data));
        } catch (error) {
          console.error(`Failed to parse save ${i}:`, error);
        }
      }
    }

    for (let i = 1; i <= SaveManager.MAX_AUTO_SAVES; i++) {
      const key = `${SaveManager.AUTO_SAVE_KEY}_${i}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          saves.push(JSON.parse(data));
        } catch (error) {
          console.error(`Failed to parse auto save ${i}:`, error);
        }
      }
    }

    const quickSaveData = localStorage.getItem(SaveManager.QUICK_SAVE_KEY);
    if (quickSaveData) {
      try {
        saves.push(JSON.parse(quickSaveData));
      } catch (error) {
        console.error('Failed to parse quick save:', error);
      }
    }

    return saves.sort((a, b) =>
      new Date(b.realTime).getTime() - new Date(a.realTime).getTime()
    );
  }

  exportSave(slot: number): string | null {
    const saveData = this.load(slot);
    if (!saveData) return null;

    const exportData = {
      saveData,
      exportDate: new Date().toISOString(),
      gameVersion: '2.0.0'
    };

    return btoa(JSON.stringify(exportData));
  }

  importSave(encodedData: string, targetSlot?: number): boolean {
    try {
      const exportData = JSON.parse(atob(encodedData));
      const saveData = exportData.saveData as EnhancedSaveData;

      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data');
      }

      const slot = targetSlot || saveData.slot;
      const key = `${SaveManager.SAVE_KEY_PREFIX}${slot}`;

      saveData.slot = slot;
      localStorage.setItem(key, JSON.stringify(saveData));
      localStorage.removeItem(`${key}_empty`);

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  private validateSaveData(data: EnhancedSaveData): boolean {
    return !!(
      data &&
      data.player &&
      data.relationships &&
      data.version &&
      data.realTime
    );
  }

  private async generateThumbnail(): Promise<string> {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="%23${Math.floor(Math.random()*16777215).toString(16)}"/><text x="80" y="45" text-anchor="middle" fill="white" font-size="20">Save</text></svg>`;
  }

  private generateStatistics(player: Player, gameData: any): GameStatistics {
    return {
      totalPlayTime: gameData.gameTime || 0,
      choicesMade: gameData.choicesMade || 0,
      eventsCompleted: gameData.completedEvents?.length || 0,
      endingsUnlocked: gameData.endingsUnlocked || [],
      cgsUnlocked: gameData.unlockedCGs?.length || 0,
      maxAffinity: gameData.maxAffinity || {},
      giftsGiven: gameData.giftsGiven || 0,
      moneyEarned: gameData.moneyEarned || 0,
      moneySpent: gameData.moneySpent || 0,
      battlesWon: gameData.battlesWon || 0,
      questsCompleted: gameData.questsCompleted || 0
    };
  }

  private createBackup(saveData: EnhancedSaveData) {
    const backupKey = `${SaveManager.SAVE_KEY_PREFIX}backup_${saveData.slot}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(saveData));

    const allBackupKeys = Object.keys(localStorage).filter(key =>
      key.startsWith(`${SaveManager.SAVE_KEY_PREFIX}backup_`)
    );

    if (allBackupKeys.length > 10) {
      const sortedKeys = allBackupKeys.sort();
      localStorage.removeItem(sortedKeys[0]);
    }
  }

  private attemptRecovery(slot: number): EnhancedSaveData | null {
    const backupKeys = Object.keys(localStorage).filter(key =>
      key.startsWith(`${SaveManager.SAVE_KEY_PREFIX}backup_${slot}_`)
    );

    if (backupKeys.length === 0) return null;

    const latestBackup = backupKeys.sort().pop();
    if (!latestBackup) return null;

    try {
      const data = localStorage.getItem(latestBackup);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Recovery failed:', error);
      return null;
    }
  }

  getSaveInfo(slot: number): { exists: boolean; name?: string; date?: Date; thumbnail?: string } {
    const key = `${SaveManager.SAVE_KEY_PREFIX}${slot}`;
    const data = localStorage.getItem(key);

    if (!data) {
      return { exists: false };
    }

    try {
      const saveData: EnhancedSaveData = JSON.parse(data);
      return {
        exists: true,
        name: saveData.name,
        date: new Date(saveData.realTime),
        thumbnail: saveData.thumbnail
      };
    } catch (error) {
      return { exists: false };
    }
  }
}