
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
    purchaseItem: (itemId: string, price: number) => boolean;
    useItem: (itemId: string, targetCharacter?: string) => void;
    performActivity: (activityName: string, navigate?: (path: string) => void) => void;
    setCurrentEvent: (event: GameEvent | null) => void;
    checkForEvents: (locationId?: string) => void;
    checkEnding: () => void;
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  player: INITIAL_PLAYER,
  unlockedCharacters: ['sakura', 'yuki', 'luna'],
  completedEvents: [],
  currentEvent: null,
  gameMessage: '학원 생활이 시작됩니다!',
  gameEnding: null,
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
        unlockedCharacters: ['sakura', 'yuki', 'luna'],
        completedEvents: [],
        currentEvent: null,
        gameEnding: null,
        gameMessage: characterData ? `${freshPlayer.name}의 학원 생활이 시작됩니다!` : '새로운 게임을 시작합니다!',
      });
      localStorage.removeItem('academyDatingSim');
    },
    updateStats: (stats) => set(state => ({ player: { ...state.player, stats: { ...state.player.stats, ...stats } } })),
    updateHpMp: (hp, mp) => set(state => ({ player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + hp), mp: Math.min(state.player.maxMp, state.player.mp + mp) } })),
    updateAffection: (character, amount) => set(state => ({
        player: {
            ...state.player,
            affection: {
                ...state.player.affection,
                [character]: Math.max(0, Math.min(100, (state.player.affection[character] || 0) + amount)),
            }
        }
    })),
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
                        hp: Math.min(state.player.hp + 20, state.player.maxHp),
                        mp: Math.min(state.player.mp + 10, state.player.maxMp),
                    }
                };
            }
            return { player: { ...state.player, timeOfDay: TIME_PHASES[nextPhaseIndex] } };
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

        // Remove item from inventory
        const newInventory = [...player.inventory];
        newInventory.splice(itemIndex, 1);

        // Apply item effects based on itemId
        let newPlayer = { ...player, inventory: newInventory };
        let message = `${itemId}을(를) 사용했습니다.`;

        switch (itemId) {
            case 'healingPotion':
                newPlayer.hp = Math.min(newPlayer.hp + 50, newPlayer.maxHp);
                message = '체력 포션을 사용했습니다. HP +50';
                break;
            case 'manaPotion':
                newPlayer.mp = Math.min(newPlayer.mp + 30, newPlayer.maxMp);
                message = '마나 포션을 사용했습니다. MP +30';
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
        const { player } = get();
        const actions = get().actions;
        
        // Check if player has enough stamina
        if (player.stats.stamina < 10 && !['휴식하기', '쇼핑하기'].includes(activityName)) {
            set({ gameMessage: '체력이 부족합니다. 휴식을 취하세요.' });
            return;
        }

        let newPlayer = { ...player };
        let message = '';
        let shouldAdvanceTime = true;

        switch (activityName) {
            case '공부하기':
                newPlayer.stats.intelligence += 2;
                newPlayer.stats.stamina = Math.max(0, newPlayer.stats.stamina - 10);
                message = '열심히 공부했습니다. 지력 +2';
                break;
            case '운동하기':
                newPlayer.stats.strength += 2;
                newPlayer.stats.stamina = Math.max(0, newPlayer.stats.stamina - 10);
                message = '열심히 운동했습니다. 힘 +2';
                break;
            case '사교활동':
                newPlayer.stats.charm += 2;
                newPlayer.stats.stamina = Math.max(0, newPlayer.stats.stamina - 10);
                message = '사교활동을 했습니다. 매력 +2';
                break;
            case '휴식하기':
                newPlayer.hp = Math.min(newPlayer.hp + 20, newPlayer.maxHp);
                newPlayer.mp = Math.min(newPlayer.mp + 10, newPlayer.maxMp);
                newPlayer.stats.stamina = Math.min(newPlayer.stats.stamina + 20, 100);
                message = '휴식을 취했습니다. HP +20, MP +10, 체력 +20';
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

        set({ player: newPlayer, gameMessage: message });
        
        if (shouldAdvanceTime) {
            actions.advanceTime();
            actions.checkForEvents();
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
  },
}));
