
import { create } from 'zustand';
import type { Player, GameEvent, EndingType, SaveData } from '../types/game';
import charactersData from '../data/characters.json';
import eventsData from '../data/events.json';

const characters = charactersData as Record<string, any>;
const events = eventsData as { events: GameEvent[] };

const initialAffection = Object.keys(characters).reduce((acc, charId) => {
  acc[charId] = characters[charId].affectionStart || 0;
  return acc;
}, {} as Record<string, number>);

const INITIAL_PLAYER: Player = {
  name: '주인공',
  level: 1,
  experience: 0,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  stamina: 100,
  maxStamina: 100,
  stats: {
    intelligence: 10,
    charm: 10,
    strength: 10,
    agility: 10,
    luck: 10,
  },
  inventory: [],
  equipment: {},
  affection: initialAffection,
  location: 'classroom',
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
    bestCardTime: Infinity,
    loginStreak: 1
  },
  metHeroines: [],
  defeatedMonsterTypes: [],
  defeatedBosses: [],
  collectedItems: [],
  unlockedEndings: [],
  participatedEvents: []
};

const TIME_PHASES = ['morning', 'noon', 'afternoon', 'evening', 'night'] as const;
const MAX_DAYS = 30;

interface GameState {
  player: Player;
  unlockedCharacters: string[];
  completedEvents: string[];
  currentEvent: GameEvent | null;
  gameMessage: string;
  gameEnding: EndingType | null;
  gameDate: { year: number; month: number; day: number };
  lastActivity: string | null;
  dailyActivitiesCount: number;
  metCharacters: string[];
  actions: {
    loadInitialGame: () => void;
    saveGame: () => void;
    loadGame: () => void;
    resetGame: (characterData?: any) => void;
    updateStats: (stats: Partial<Player['stats']>) => void;
    updateHpMp: (hp: number, mp: number) => void;
    updateAffection: (character: string, amount: number) => void;
    moveToLocation: (locationId: string) => void;
    advanceTime: () => void;
    handleEventChoice: (event: GameEvent, choiceIndex: number) => void;
    addItem: (itemId: string) => void;
    buyItem: (itemId: string) => void;
    sellItem: (itemId: string, sellPrice: number) => boolean;
    updateMoney: (amount: number) => void;
    purchaseItem: (itemId: string, price: number) => boolean;
    useItem: (itemId: string, targetCharacter?: string) => void;
    performActivity: (activityName: string, navigate?: (path: string) => void) => void;
    setCurrentEvent: (event: GameEvent | null) => void;
    checkForEvents: (locationId?: string) => void;
    checkEnding: () => void;
    updatePlayer: (updates: Partial<Player>) => void;
    goToNextFloor: () => void;
    gainExperience: (amount: number) => void;
    addGold: (amount: number) => void;
    clearLastActivity: () => void;
    markCharacterAsMet: (characterId: string) => void;
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  player: INITIAL_PLAYER,
  unlockedCharacters: ['sakura', 'yuki', 'luna', 'mystery', 'akane', 'hana', 'rin', 'mei', 'sora'],
  completedEvents: [],
  currentEvent: null,
  gameMessage: '학원 생활이 시작됩니다!',
  gameEnding: null,
  gameDate: { year: 2024, month: 4, day: 1 },
  lastActivity: null,
  dailyActivitiesCount: 0,
  metCharacters: [],
  actions: {
    loadInitialGame: () => {
        const savedGame = localStorage.getItem('academyDatingSim');
        if (savedGame) {
          const saveData = JSON.parse(savedGame) as SaveData;
          set({
            player: saveData.player,
            unlockedCharacters: saveData.unlockedCharacters,
            completedEvents: saveData.completedEvents,
          });
        }
    },
    saveGame: () => {
      const { player, unlockedCharacters, completedEvents } = get();
      const saveData: SaveData = {
        player,
        unlockedCharacters,
        completedEvents,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      localStorage.setItem('academyDatingSim', JSON.stringify(saveData));
      set({ gameMessage: '게임이 저장되었습니다!' });
    },
    loadGame: () => {
      const savedGame = localStorage.getItem('academyDatingSim');
      if (savedGame) {
        const saveData = JSON.parse(savedGame) as SaveData;
        set({
          player: saveData.player,
          unlockedCharacters: saveData.unlockedCharacters,
          completedEvents: saveData.completedEvents,
          gameMessage: '게임을 불러왔습니다!',
        });
      } else {
        set({ gameMessage: '저장된 게임이 없습니다.' });
      }
    },
    resetGame: (characterData?: any) => {
      const freshPlayer: Player = {
        ...INITIAL_PLAYER,
        name: characterData?.playerName || INITIAL_PLAYER.name,
        stats: characterData?.startingStats || { ...INITIAL_PLAYER.stats },
        affection: Object.keys(characters).reduce((acc, charId) => {
            acc[charId] = characters[charId].affectionStart || 0;
            return acc;
        }, {} as Record<string, number>),
      };
      set({
        player: freshPlayer,
        unlockedCharacters: ['sakura', 'yuki', 'luna', 'mystery', 'akane', 'hana', 'rin', 'mei', 'sora'],
        completedEvents: [],
        currentEvent: null,
        gameEnding: null,
        gameMessage: characterData ? `${freshPlayer.name}의 학원 생활이 시작됩니다!` : '새로운 게임을 시작합니다!',
        lastActivity: null,
      });
      localStorage.removeItem('academyDatingSim');
    },
    updateStats: (stats) => set(state => ({ player: { ...state.player, stats: { ...state.player.stats, ...stats } } })),
    updateHpMp: (hp, mp) => set(state => ({ player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + hp), mp: Math.min(state.player.maxMp, state.player.mp + mp) } })),
    updateAffection: (character, amount) => {
        set(state => ({
            player: {
                ...state.player,
                affection: {
                    ...state.player.affection,
                    [character]: Math.max(0, Math.min(100, (state.player.affection[character] || 0) + amount)),
                }
            }
        }));
        // Give experience when gaining affection
        if (amount > 0) {
            get().actions.gainExperience(amount * 2);
        }
    },
    moveToLocation: (locationId) => {
        set(state => ({ player: { ...state.player, location: locationId } }));
        get().actions.checkForEvents(locationId);
    },
    advanceTime: () => {
        set(state => {
            const currentPhaseIndex = TIME_PHASES.indexOf(state.player.timeOfDay);
            const nextPhaseIndex = currentPhaseIndex + 1;

            if (nextPhaseIndex >= TIME_PHASES.length) {
                const nextDay = state.player.day + 1;
                if (nextDay > MAX_DAYS) {
                    get().actions.checkEnding();
                    return {};
                }
                return {
                    player: {
                        ...state.player,
                        day: nextDay,
                        timeOfDay: 'morning',
                        location: 'dormitory',  // Force return to dormitory at new day
                        hp: Math.min(state.player.hp + 20, state.player.maxHp),
                        mp: Math.min(state.player.mp + 10, state.player.maxMp),
                        stamina: state.player.maxStamina  // Reset stamina to max for new day
                    },
                    dailyActivitiesCount: 0,  // Reset activity count for new day
                    gameMessage: '새로운 날이 밝았습니다. 기숙사에서 일어났습니다.'
                };
            }

            // Force return to dormitory at night time
            const newTimeOfDay = TIME_PHASES[nextPhaseIndex];
            const shouldReturnToDorm = newTimeOfDay === 'night' && state.player.location !== 'dormitory';

            return {
                player: {
                    ...state.player,
                    timeOfDay: newTimeOfDay,
                    location: shouldReturnToDorm ? 'dormitory' : state.player.location
                },
                gameMessage: shouldReturnToDorm
                    ? '밤이 되어 기숙사로 돌아왔습니다.'
                    : state.gameMessage
            };
        });
    },
    checkForEvents: (locationId?: string) => {
        const { player, completedEvents } = get();
        const currentLocation = locationId || player.location;

        const possibleEvents = events.events.filter(event => {
            if (event.trigger.location && event.trigger.location !== currentLocation) return false;
            if (event.trigger.once && completedEvents.includes(event.id)) return false;
            if (event.trigger.minDay && player.day < event.trigger.minDay) return false;
            if (event.trigger.character && event.trigger.minAffection) {
                if ((player.affection[event.trigger.character] || 0) < event.trigger.minAffection) return false;
            }
            if (event.trigger.totalAffection) {
                const totalAffection = Object.values(player.affection).reduce((sum, val) => sum + val, 0);
                if (totalAffection < event.trigger.totalAffection) return false;
            }
            if (event.trigger.chance && Math.random() > event.trigger.chance) return false;
            return true;
        });

        if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            set({ currentEvent: event });
        }
    },
    handleEventChoice: (event, choiceIndex) => {
        const choice = event.choices[choiceIndex];
        const { player, actions } = get();

        // Condition checks (simplified for brevity)
        if (choice.condition?.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) {
            set({ gameMessage: '지력이 부족합니다!' });
            return;
        }

        // Effects
        if (choice.effects.affection) {
            Object.entries(choice.effects.affection).forEach(([char, amount]) => actions.updateAffection(char, amount));
        }
        if (choice.effects.stats) {
            actions.updateStats(choice.effects.stats);
        }
        if (choice.effects.item) {
            actions.addItem(choice.effects.item);
        }
        if (choice.effects.money) {
            set(state => ({ player: { ...state.player, money: state.player.money + choice.effects.money! } }));
        }
        if (choice.effects.flag) {
            set(state => ({ player: { ...state.player, flags: { ...state.player.flags, [choice.effects.flag!]: true } } }));
        }
        if (choice.effects.unlockCharacter) {
            set(state => ({ unlockedCharacters: [...state.unlockedCharacters, choice.effects.unlockCharacter!] }));
        }

        set({ gameMessage: choice.effects.text });

        if (event.trigger.once) {
            set(state => ({ completedEvents: [...state.completedEvents, event.id] }));
        }
        set({ currentEvent: null });
    },
    addItem: (itemId) => set(state => ({ player: { ...state.player, inventory: [...state.player.inventory, itemId] } })),
    buyItem: (itemId: string) => {
        get().actions.addItem(itemId);
    },
    updateMoney: (amount: number) => {
        set(state => ({
            player: {
                ...state.player,
                money: state.player.money + amount
            }
        }));
    },
    sellItem: (itemId: string, sellPrice: number) => {
        const { player } = get();
        const itemIndex = player.inventory.indexOf(itemId);
        
        if (itemIndex > -1) {
            const newInventory = [...player.inventory];
            newInventory.splice(itemIndex, 1);
            set(state => ({
                player: {
                    ...state.player,
                    inventory: newInventory,
                    money: state.player.money + sellPrice
                }
            }));
            set({ gameMessage: `${itemId}을(를) 판매했습니다.` });
            return true;
        }
        set({ gameMessage: '판매할 아이템이 없습니다.' });
        return false;
    },
    purchaseItem: (itemId, price) => {
        const { player } = get();
        if (player.money >= price) {
            set(state => ({
                player: {
                    ...state.player,
                    inventory: [...state.player.inventory, itemId],
                    money: state.player.money - price,
                }
            }));
            return true;
        }
        return false;
    },
    useItem: (itemId, targetCharacter) => {
        const { player } = get();
        const itemIndex = player.inventory.indexOf(itemId);

        if (itemIndex === -1) {
            set({ gameMessage: '아이템을 찾을 수 없습니다.' });
            return;
        }

        // Check if item can be used based on current state
        switch (itemId) {
            case 'healingPotion':
                if (player.hp >= player.maxHp) {
                    set({ gameMessage: 'HP가 이미 최대입니다. 포션을 사용할 수 없습니다.' });
                    return;
                }
                break;
            case 'manaPotion':
                if (player.mp >= player.maxMp) {
                    set({ gameMessage: 'MP가 이미 최대입니다. 포션을 사용할 수 없습니다.' });
                    return;
                }
                break;
        }

        // Remove item from inventory
        const newInventory = [...player.inventory];
        newInventory.splice(itemIndex, 1);

        // Apply item effects based on itemId
        let newPlayer = { ...player, inventory: newInventory };
        let message = `${itemId}을(를) 사용했습니다.`;

        switch (itemId) {
            case 'healingPotion':
                const healAmount = Math.min(50, newPlayer.maxHp - newPlayer.hp);
                newPlayer.hp = Math.min(newPlayer.hp + 50, newPlayer.maxHp);
                message = `체력 포션을 사용했습니다. HP +${healAmount}`;
                break;
            case 'manaPotion':
                const manaAmount = Math.min(30, newPlayer.maxMp - newPlayer.mp);
                newPlayer.mp = Math.min(newPlayer.mp + 30, newPlayer.maxMp);
                message = `마나 포션을 사용했습니다. MP +${manaAmount}`;
                break;
            case 'energyDrink':
                newPlayer.stats.stamina += 2;
                message = '에너지 드링크를 마셨습니다. 체력 +2';
                break;
            default:
                // For gift items, increase affection with target character
                if (targetCharacter) {
                    const affectionBonus = itemId.includes('flower') ? 10 : 5;
                    newPlayer.affection = {
                        ...newPlayer.affection,
                        [targetCharacter]: Math.min((newPlayer.affection[targetCharacter] || 0) + affectionBonus, 100)
                    };
                    message = `${targetCharacter}에게 ${itemId}을(를) 선물했습니다. 호감도 +${affectionBonus}`;
                }
                break;
        }

        set({ player: newPlayer, gameMessage: message });
    },
    performActivity: (activityName, navigate) => {
        const { player, dailyActivitiesCount } = get();
        const actions = get().actions;

        // Check if already did 2 activities today (except rest and character interaction)
        if (dailyActivitiesCount >= 2 && !['휴식하기', '캐릭터 상호작용', '쇼핑하기', '던전 탐험'].includes(activityName)) {
            set({ gameMessage: '오늘은 더 이상 활동할 수 없습니다. 휴식하거나 다음 날로 넘어가세요.' });
            return;
        }

        // Define stamina costs for activities
        const staminaCosts: Record<string, number> = {
            '공부하기': 20,
            '운동하기': 30,
            '사교활동': 15,
            '아르바이트': 25,
            '명상하기': 10,
            '요리하기': 15,
            '독서하기': 10,
            '달리기': 25,
            '게임하기': 5,
            '음악감상': 5,
            '휴식하기': 0,
            '쇼핑하기': 5,
            '던전 탐험': 30
        };

        const staminaCost = staminaCosts[activityName] || 10;

        // Check if player has enough stamina
        if (player.stamina < staminaCost && activityName !== '휴식하기') {
            set({ gameMessage: `스테미나가 부족합니다. (필요: ${staminaCost}, 현재: ${player.stamina})` });
            return;
        }

        let newPlayer = { ...player };
        let message = '';
        let shouldAdvanceTime = true;

        // Consume stamina for all activities except rest
        if (activityName !== '휴식하기') {
            newPlayer.stamina = Math.max(0, newPlayer.stamina - staminaCost);
        }

        switch (activityName) {
            case '공부하기':
                newPlayer.stats.intelligence += 2;
                message = '열심히 공부했습니다. 지력 +2';
                actions.gainExperience(15);
                break;
            case '운동하기':
                newPlayer.stats.strength += 3;
                newPlayer.stats.agility += 1;
                message = '열심히 운동했습니다. 힘 +3, 민첩 +1';
                actions.gainExperience(20);
                break;
            case '사교활동':
                newPlayer.stats.charm += 2;
                newPlayer.stats.luck += 1;
                message = '사교활동을 했습니다. 매력 +2, 행운 +1';
                actions.gainExperience(15);
                break;
            case '아르바이트':
                newPlayer.money += 500;
                newPlayer.stats.strength += 1;
                message = '아르바이트를 했습니다. 500원 획득, 힘 +1';
                actions.gainExperience(10);
                break;
            case '명상하기':
                newPlayer.mp = Math.min(newPlayer.mp + 20, newPlayer.maxMp);
                newPlayer.stats.intelligence += 1;
                message = '명상을 했습니다. MP +20, 지력 +1';
                actions.gainExperience(10);
                break;
            case '요리하기':
                newPlayer.stats.charm += 1;
                newPlayer.stats.agility += 1;
                message = '요리를 했습니다. 매력 +1, 민첩 +1';
                actions.gainExperience(10);
                break;
            case '독서하기':
                newPlayer.stats.intelligence += 3;
                message = '책을 읽었습니다. 지력 +3';
                actions.gainExperience(12);
                break;
            case '달리기':
                newPlayer.stats.agility += 3;
                newPlayer.maxStamina = Math.min(newPlayer.maxStamina + 2, 200);
                message = '달리기를 했습니다. 민첩 +3, 최대 스테미나 +2';
                actions.gainExperience(15);
                break;
            case '게임하기':
                newPlayer.stats.luck += 2;
                message = '게임을 즐겼습니다. 행운 +2';
                actions.gainExperience(5);
                break;
            case '음악감상':
                newPlayer.stats.charm += 1;
                newPlayer.hp = Math.min(newPlayer.hp + 10, newPlayer.maxHp);
                message = '음악을 감상했습니다. 매력 +1, HP +10';
                actions.gainExperience(5);
                break;
            case '휴식하기':
                newPlayer.hp = Math.min(newPlayer.hp + 20, newPlayer.maxHp);
                newPlayer.mp = Math.min(newPlayer.mp + 10, newPlayer.maxMp);
                newPlayer.stamina = Math.min(newPlayer.stamina + 40, newPlayer.maxStamina);
                message = '휴식을 취했습니다. HP +20, MP +10, 스테미나 +40';
                break;
            case '쇼핑하기':
                if (navigate) {
                    set({ gameMessage: '매점으로 이동합니다...' });
                    navigate('/shopping');
                    return;
                }
                message = '쇼핑을 했습니다.';
                shouldAdvanceTime = false;
                break;
            case '던전 탐험':
                if (navigate) {
                    set({ gameMessage: '던전으로 이동합니다...' });
                    navigate('/dungeon');
                    return;
                }
                message = '던전 탐험을 준비합니다.';
                shouldAdvanceTime = false;
                break;
            default:
                message = `${activityName}을(를) 했습니다.`;
                break;
        }

        // Increase activity count if it's a main activity
        let newActivityCount = dailyActivitiesCount;
        const mainActivities = ['공부하기', '운동하기', '사교활동', '아르바이트', '명상하기', '요리하기', '독서하기', '달리기', '게임하기', '음악감상'];
        if (mainActivities.includes(activityName)) {
            newActivityCount++;
        }

        // Issue #27: Force return to dormitory after 2 activities
        let forcedToDormitory = false;
        if (newActivityCount >= 2 && player.location !== 'dormitory' && mainActivities.includes(activityName)) {
            newPlayer.location = 'dormitory';
            message += ' 오늘의 활동이 끝났습니다. 기숙사로 돌아왔습니다.';
            forcedToDormitory = true;
        }

        set({
            player: newPlayer,
            gameMessage: message,
            lastActivity: activityName,
            dailyActivitiesCount: newActivityCount
        });

        if (shouldAdvanceTime) {
            actions.advanceTime();
            actions.checkForEvents();
        }

        // Navigate to dormitory if forced
        if (forcedToDormitory && navigate) {
            setTimeout(() => {
                set({ gameMessage: '기숙사에서 휴식하거나 일기를 쓸 수 있습니다.' });
            }, 2000);
        }
    },
    checkEnding: () => {
        const { player } = get();
        const maxAffection = Object.entries(player.affection).reduce((max, [char, value]) =>
            value > max.value ? { char, value } : max, { char: '', value: 0 }
        );

        if (maxAffection.value >= 80) {
            if (player.flags[`${maxAffection.char}_route`]) {
                set({ gameEnding: maxAffection.char as EndingType });
            } else {
                set({ gameEnding: 'good' });
            }
        } else if (maxAffection.value >= 50) {
            set({ gameEnding: 'normal' });
        } else {
            set({ gameEnding: 'solo' });
        }
    },
    setCurrentEvent: (event) => set({ currentEvent: event }),
    updatePlayer: (updates) => set((state) => ({
      player: { ...state.player, ...updates }
    })),
    goToNextFloor: () => set((state) => {
      const nextFloor = state.player.dungeonProgress.currentFloor + 1;
      return {
        player: {
          ...state.player,
          dungeonProgress: {
            ...state.player.dungeonProgress,
            currentFloor: nextFloor,
            maxFloorReached: Math.max(state.player.dungeonProgress.maxFloorReached, nextFloor),
            position: { x: 1, y: 1 }, // Reset position for the new floor
          },
        },
      };
    }),
    gainExperience: (amount: number) => set((state) => {
      let newExperience = state.player.experience + amount;
      let newLevel = state.player.level;
      let levelsGained = 0;
      const initialLevel = state.player.level;

      // Check for level up (progressive exp requirement: 50 + level * 30)
      // This makes early levels faster and more rewarding
      while (newExperience >= (50 + newLevel * 30)) {
        newExperience -= (50 + newLevel * 30);
        newLevel++;
        levelsGained++;
      }

      const newPlayer = {
        ...state.player,
        experience: newExperience,
        level: newLevel,
      };

      // If leveled up, increase max stats and restore HP/MP
      if (levelsGained > 0) {
        // Calculate stat bonuses for all levels gained
        newPlayer.maxHp = 100 + (newLevel - 1) * 15; // More HP per level
        newPlayer.maxMp = 50 + (newLevel - 1) * 8;   // More MP per level
        newPlayer.hp = newPlayer.maxHp;  // Restore HP on level up
        newPlayer.mp = newPlayer.maxMp;  // Restore MP on level up

        // Bonus stats on level up (multiplied by levels gained)
        newPlayer.stats = {
          ...newPlayer.stats,
          intelligence: newPlayer.stats.intelligence + levelsGained * 2, // +2 per level
          charm: newPlayer.stats.charm + levelsGained * 2,
          strength: newPlayer.stats.strength + levelsGained * 2,
          agility: newPlayer.stats.agility + levelsGained * 2,
          luck: newPlayer.stats.luck + levelsGained
        };
        newPlayer.maxStamina = Math.min(newPlayer.maxStamina + (levelsGained * 10), 200);
        newPlayer.stamina = newPlayer.maxStamina; // Restore stamina on level up

        // Store statistics about leveling
        if (newPlayer.statistics) {
          newPlayer.statistics = {
            ...newPlayer.statistics,
            totalLevelsGained: (newPlayer.statistics.totalLevelsGained || 0) + levelsGained
          };
        }
      }

      // Create appropriate message based on levels gained
      let message = '';
      if (levelsGained > 1) {
        message = `🎉 대량 레벨업! Lv.${initialLevel} → Lv.${newLevel} (${levelsGained}레벨 상승!) HP/MP 완전 회복! 모든 능력치 +${levelsGained * 2}`;
      } else if (levelsGained === 1) {
        message = `✨ 레벨업! Lv.${newLevel}이 되었습니다! HP/MP가 회복되었습니다. 모든 능력치 +2`;
      } else {
        const expNeeded = (50 + newLevel * 30) - newExperience;
        message = `경험치를 ${amount} 획득했습니다. (${newExperience}/${50 + newLevel * 30}) 다음 레벨까지 ${expNeeded}`;
      }

      return {
        player: newPlayer,
        gameMessage: message
      };
    }),
    addGold: (amount: number) => set((state) => ({
      player: {
        ...state.player,
        money: state.player.money + amount,
      }
    })),
    clearLastActivity: () => set({ lastActivity: null }),
    markCharacterAsMet: (characterId: string) => {
      const { metCharacters } = get();
      if (!metCharacters.includes(characterId)) {
        set({ metCharacters: [...metCharacters, characterId] });
      }
    },
  },
}));
