import { Player } from '@academy-dating-sim/shared-types';

export class GameEngine {
  private player: Player | null = null;

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine(): void {
    console.log('Game Engine initialized');
  }

  public createPlayer(name: string): Player {
    this.player = {
      name,
      level: 1,
      experience: 0,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      stats: {
        intelligence: 10,
        charm: 10,
        stamina: 10,
        strength: 10,
        agility: 10,
        luck: 10,
      },
      inventory: [],
      equipment: {},
      affection: {},
      location: 'academy',
      day: 1,
      timeOfDay: 'morning',
      money: 1000,
      flags: {},
      dungeonProgress: {
        currentFloor: 1,
        maxFloorReached: 1,
        position: { x: 0, y: 0 },
      },
      achievements: [],
      achievementPoints: 0,
      statistics: {
        monstersDefeated: 0,
        treasuresFound: 0,
        quizStreak: 0,
        bestCardTime: 0,
        loginStreak: 1,
      },
      metHeroines: [],
      defeatedMonsterTypes: [],
      defeatedBosses: [],
      collectedItems: [],
      unlockedEndings: [],
      participatedEvents: [],
    };
    return this.player;
  }

  public getPlayer(): Player | null {
    return this.player;
  }

  public saveGame(): void {
    if (this.player) {
      localStorage.setItem('gameData', JSON.stringify(this.player));
    }
  }

  public loadGame(): Player | null {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
      this.player = JSON.parse(savedData);
      return this.player;
    }
    return null;
  }
}