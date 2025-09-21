
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
  participatedEvents: [],
  characterStates: {} // Issue #33: Track character emotional states
};

const TIME_PHASES = ['morning', 'noon', 'afternoon', 'evening', 'night'] as const;
const MAX_DAYS = 30;

// Issue #31: Gift preference system
const characterGiftPreferences: Record<string, {
  loves: string[];
  likes: string[];
  neutral: string[];
  dislikes: string[];
  hates: string[];
  specialReactions: Record<string, string>;
}> = {
  sakura: {
    loves: ['flower', 'trainingGear', 'jewelryBox'],
    likes: ['chocolateBox', 'lunchbox', 'energyDrink'],
    neutral: ['book', 'studyGuide', 'mirror'],
    dislikes: ['charm', 'mysteryKey'],
    hates: ['manaPotion'],
    specialReactions: {
      flower: '벚꽃...? 내 이름과 같네. 특별한 의미가 있는 거야?',
      trainingGear: '훈련 장비라니! 정말 고마워, 더 강해질게!',
      chocolateBox: '달콤한 초콜릿... 훈련 후에 먹으면 기운이 날 것 같아.'
    }
  },
  yuki: {
    loves: ['book', 'charm', 'mysteryKey', 'studyGuide'],
    likes: ['chocolateBox', 'mirror', 'manaPotion'],
    neutral: ['flower', 'lunchbox', 'energyDrink'],
    dislikes: ['trainingGear'],
    hates: ['healingPotion'],
    specialReactions: {
      book: '희귀한 책! 마법 연구에 도움이 될 것 같아!',
      mysteryKey: '수수께끼의 열쇠... 무엇을 열 수 있을까?',
      studyGuide: '공부 가이드야? 마법 이론 정리에 좋겠어.'
    }
  },
  luna: {
    loves: ['mirror', 'jewelryBox', 'mysteryKey'],
    likes: ['flower', 'chocolateBox', 'charm'],
    neutral: ['book', 'studyGuide', 'lunchbox'],
    dislikes: ['trainingGear', 'energyDrink'],
    hates: ['healingPotion', 'manaPotion'],
    specialReactions: {
      mirror: '마법 거울... 정말 아름답네. 고마워.',
      mysteryKey: '신비로운 열쇠... 비밀스러워서 좋아.',
      jewelryBox: '보석함이야? 달빛처럼 반짝이네!'
    }
  },
  mystery: {
    loves: ['mysteryKey', 'charm', 'jewelryBox'],
    likes: ['book', 'mirror', 'manaPotion'],
    neutral: ['flower', 'chocolateBox', 'studyGuide'],
    dislikes: ['lunchbox', 'energyDrink'],
    hates: ['trainingGear', 'healingPotion'],
    specialReactions: {
      mysteryKey: '...이 열쇠는... 특별해. 고마워.',
      charm: '마법 부적... 흥미로운 마력이 감지돼.',
      book: '...지식은 언제나 소중해.'
    }
  }
};

const calculateGiftReaction = (characterId: string, itemId: string): { affectionChange: number; reactionMessage: string } => {
  const preferences = characterGiftPreferences[characterId];
  if (!preferences) {
    return { affectionChange: 5, reactionMessage: '고마워.' };
  }

  // Check for special reactions first
  if (preferences.specialReactions[itemId]) {
    return { affectionChange: 15, reactionMessage: preferences.specialReactions[itemId] };
  }

  // Check preference levels
  if (preferences.loves.includes(itemId)) {
    return { affectionChange: 20, reactionMessage: '우와! 정말 좋아하는 거야! 어떻게 알았어?' };
  }
  if (preferences.likes.includes(itemId)) {
    return { affectionChange: 10, reactionMessage: '고마워! 마음에 들어!' };
  }
  if (preferences.dislikes.includes(itemId)) {
    return { affectionChange: -5, reactionMessage: '음... 고맙긴 한데...' };
  }
  if (preferences.hates.includes(itemId)) {
    return { affectionChange: -10, reactionMessage: '이건... 별로야...' };
  }

  // Neutral/default reaction
  return { affectionChange: 5, reactionMessage: '고마워. 소중히 할게.' };
};

// Issue #33: Generate random character states based on meeting conditions
interface CharacterState {
  calmness: number;    // 침착함 (0-100)
  stress: number;      // 스트레스 (0-100)
  excitement: number;  // 흥분도 (0-100)
  trust: number;       // 신뢰도 (0-100)
  energy: number;      // 활력 (0-100)
  meetingContext: string;
}

const generateRandomCharacterState = (characterId: string, meetingLocation: string): CharacterState => {
  const baseState = {
    calmness: 50,
    stress: 30,
    excitement: 40,
    trust: 30,
    energy: 70,
    meetingContext: meetingLocation
  };

  // Character-specific base modifications
  const characterModifiers: Record<string, Partial<CharacterState>> = {
    sakura: { calmness: 60, stress: 25, excitement: 45, energy: 80 },
    yuki: { calmness: 80, stress: 20, excitement: 30, energy: 60 },
    luna: { calmness: 70, stress: 35, excitement: 25, energy: 50 },
    mystery: { calmness: 90, stress: 10, excitement: 20, energy: 40 },
    akane: { calmness: 30, stress: 50, excitement: 70, energy: 90 },
    hana: { calmness: 75, stress: 20, excitement: 40, energy: 65 },
    rin: { calmness: 85, stress: 15, excitement: 35, energy: 55 },
    mei: { calmness: 40, stress: 30, excitement: 60, energy: 85 },
    sora: { calmness: 95, stress: 10, excitement: 15, energy: 45 }
  };

  // Location-based modifications
  const locationModifiers: Record<string, Partial<CharacterState>> = {
    dungeon: {
      calmness: -20,      // 던전에서 만나면 침착함 감소
      stress: +25,        // 스트레스 증가
      excitement: +15,    // 흥분도 증가
      trust: -10,         // 신뢰도 약간 감소
      energy: -15         // 에너지 감소
    },
    library: {
      calmness: +15,      // 도서관에서는 침착함 증가
      stress: -10,        // 스트레스 감소
      excitement: -5,     // 흥분도 감소
      trust: +10,         // 신뢰도 증가
      energy: +5          // 에너지 약간 증가
    },
    classroom: {
      calmness: +5,       // 교실에서는 평상시
      stress: -5,
      excitement: 0,
      trust: +5,
      energy: 0
    },
    cafeteria: {
      calmness: +10,      // 카페테리아는 편안함
      stress: -15,
      excitement: +10,
      trust: +15,
      energy: +10
    },
    garden: {
      calmness: +20,      // 정원은 매우 평화로움
      stress: -20,
      excitement: +5,
      trust: +10,
      energy: +15
    },
    dormitory: {
      calmness: +25,      // 기숙사는 가장 편안함
      stress: -25,
      excitement: -10,
      trust: +20,
      energy: +5
    }
  };

  // Apply base character modifiers
  const characterMod = characterModifiers[characterId] || {};
  const locationMod = locationModifiers[meetingLocation] || {};

  // Add random variation (±10)
  const randomVariation = () => Math.floor(Math.random() * 21) - 10;

  const finalState: CharacterState = {
    calmness: Math.max(0, Math.min(100, baseState.calmness + (characterMod.calmness || 0) + (locationMod.calmness || 0) + randomVariation())),
    stress: Math.max(0, Math.min(100, baseState.stress + (characterMod.stress || 0) + (locationMod.stress || 0) + randomVariation())),
    excitement: Math.max(0, Math.min(100, baseState.excitement + (characterMod.excitement || 0) + (locationMod.excitement || 0) + randomVariation())),
    trust: Math.max(0, Math.min(100, baseState.trust + (characterMod.trust || 0) + (locationMod.trust || 0) + randomVariation())),
    energy: Math.max(0, Math.min(100, baseState.energy + (characterMod.energy || 0) + (locationMod.energy || 0) + randomVariation())),
    meetingContext: meetingLocation
  };

  return finalState;
};

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
    markCharacterAsMet: (characterId: string, meetingLocation?: string) => void;
    updateCharacterState: (characterId: string, stateChanges: Partial<CharacterState>) => void;
    triggerRandomHeroineInteraction: () => void;
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

        // Issue #28: Random heroine interactions
        const randomChance = Math.random();
        if (randomChance < 0.3) { // 30% chance for random heroine interaction
            get().actions.triggerRandomHeroineInteraction();
        }
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

        // Issue #30: Enhanced item usage restrictions
        // Check if item can be used based on current state and type
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
            case 'energyDrink':
                if (player.hp >= player.maxHp && player.stamina >= player.maxStamina) {
                    set({ gameMessage: 'HP와 스태미나가 이미 최대입니다. 에너지 드링크를 사용할 수 없습니다.' });
                    return;
                }
                break;
            case 'statBooster':
                // Prevent overuse of stat boosters
                if (player.level < 5) {
                    set({ gameMessage: '레벨이 낮아 능력치 강화제를 사용할 수 없습니다. (레벨 5 이상 필요)' });
                    return;
                }
                break;
            case 'lunchbox':
                if (player.stamina >= player.maxStamina) {
                    set({ gameMessage: '스태미나가 이미 최대입니다. 도시락을 먹을 수 없습니다.' });
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
                const manaAmount = Math.min(40, newPlayer.maxMp - newPlayer.mp);
                newPlayer.mp = Math.min(newPlayer.mp + 40, newPlayer.maxMp);
                message = `마나 포션을 사용했습니다. MP +${manaAmount}`;
                break;
            case 'energyDrink':
                const hpGain = Math.min(20, newPlayer.maxHp - newPlayer.hp);
                const staminaGain = Math.min(3, newPlayer.maxStamina - newPlayer.stamina);
                newPlayer.hp = Math.min(newPlayer.hp + 20, newPlayer.maxHp);
                newPlayer.stamina = Math.min(newPlayer.stamina + 3, newPlayer.maxStamina);
                message = `에너지 드링크를 마셨습니다. HP +${hpGain}, 스태미나 +${staminaGain}`;
                break;
            case 'studyGuide':
                newPlayer.stats.intelligence += 5;
                message = '공부 가이드를 사용했습니다. 지력 +5';
                get().actions.gainExperience(20);
                break;
            case 'mirror':
                newPlayer.stats.charm += 3;
                message = '마법 거울을 사용했습니다. 매력 +3';
                break;
            case 'lunchbox':
                const lunchStaminaGain = Math.min(2, newPlayer.maxStamina - newPlayer.stamina);
                newPlayer.stamina = Math.min(newPlayer.stamina + 2, newPlayer.maxStamina);
                if (targetCharacter) {
                    newPlayer.affection = {
                        ...newPlayer.affection,
                        [targetCharacter]: Math.min((newPlayer.affection[targetCharacter] || 0) + 8, 100)
                    };
                    message = `${targetCharacter}에게 도시락을 선물했습니다. 호감도 +8, 스태미나 +${lunchStaminaGain}`;
                } else {
                    message = `도시락을 먹었습니다. 스태미나 +${lunchStaminaGain}`;
                }
                break;
            case 'experienceScroll':
                get().actions.gainExperience(100);
                message = '경험치 두루마리를 사용했습니다. 경험치 +100';
                break;
            case 'statBooster':
                newPlayer.stats.intelligence += 3;
                newPlayer.stats.charm += 3;
                newPlayer.stats.strength += 3;
                newPlayer.stats.agility += 3;
                newPlayer.stats.luck += 3;
                newPlayer.stamina = Math.min(newPlayer.stamina + 3, newPlayer.maxStamina);
                message = '능력치 강화제를 사용했습니다. 모든 능력치 +3, 스태미나 +3';
                break;
            default:
                // Issue #31: Enhanced gift preference system with character reactions
                if (targetCharacter) {
                    // Character preference system for gift reactions
                    const { affectionChange, reactionMessage } = calculateGiftReaction(targetCharacter, itemId);

                    newPlayer.affection = {
                        ...newPlayer.affection,
                        [targetCharacter]: Math.min((newPlayer.affection[targetCharacter] || 0) + affectionChange, 100)
                    };
                    message = `${targetCharacter}: "${reactionMessage}" (호감도 ${affectionChange > 0 ? '+' : ''}${affectionChange})`;
                } else {
                    message = `${itemId}을(를) 사용했습니다.`;
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

        // Issue #28: Trigger random heroine interaction after activities
        const randomChance = Math.random();
        if (randomChance < 0.2 && mainActivities.includes(activityName)) { // 20% chance after main activities
            setTimeout(() => {
                get().actions.triggerRandomHeroineInteraction();
            }, 1000);
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
    markCharacterAsMet: (characterId: string, meetingLocation?: string) => {
      const { metCharacters, player } = get();
      if (!metCharacters.includes(characterId)) {
        // Issue #33: Random initial character states based on meeting conditions
        const initialState = generateRandomCharacterState(characterId, meetingLocation || player.location);

        set({
          metCharacters: [...metCharacters, characterId],
          player: {
            ...player,
            characterStates: {
              ...player.characterStates,
              [characterId]: initialState
            }
          }
        });
      }
    },
    updateCharacterState: (characterId: string, stateChanges: Partial<CharacterState>) => {
      const { player } = get();
      const currentState = player.characterStates?.[characterId];

      if (currentState) {
        const newState = { ...currentState, ...stateChanges };
        // Ensure values stay within 0-100 range
        Object.keys(newState).forEach(key => {
          if (typeof newState[key as keyof CharacterState] === 'number') {
            newState[key as keyof CharacterState] = Math.max(0, Math.min(100, newState[key as keyof CharacterState] as number));
          }
        });

        set({
          player: {
            ...player,
            characterStates: {
              ...player.characterStates,
              [characterId]: newState
            }
          }
        });
      }
    },
    triggerRandomHeroineInteraction: () => {
      // Issue #28: Random heroine interactions
      const { player, metCharacters } = get();
      if (!metCharacters || metCharacters.length === 0) return;

      // Select a random heroine from met characters
      const randomHeroineId = metCharacters[Math.floor(Math.random() * metCharacters.length)];

      // Get heroine name
      const heroineNames: Record<string, string> = {
        sakura: '사쿠라',
        yuki: '유키',
        luna: '루나',
        mystery: '???',
        akane: '아카네',
        hana: '하나',
        rin: '린',
        mei: '메이',
        sora: '소라'
      };
      const randomHeroine = heroineNames[randomHeroineId] || randomHeroineId;

      // Different interaction types based on location and time
      const interactionTypes = [
        {
          type: 'greeting',
          messages: [
            `${randomHeroine}와(과) 복도에서 마주쳤습니다!`,
            `${randomHeroine}가 당신에게 손을 흔들며 인사합니다.`,
            `${randomHeroine}와(과) 눈이 마주쳤습니다.`
          ],
          affectionChange: 2
        },
        {
          type: 'help',
          messages: [
            `${randomHeroine}가 책을 떨어뜨렸습니다. 도와주시겠습니까?`,
            `${randomHeroine}가 길을 물어봅니다.`,
            `${randomHeroine}가 무언가 도움을 청합니다.`
          ],
          affectionChange: 5
        },
        {
          type: 'casual',
          messages: [
            `${randomHeroine}와(과) 잠시 대화를 나눕니다.`,
            `${randomHeroine}가 오늘 날씨에 대해 이야기합니다.`,
            `${randomHeroine}와(과) 최근 수업에 대해 이야기합니다.`
          ],
          affectionChange: 3
        }
      ];

      // Select random interaction type
      const interaction = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const message = interaction.messages[Math.floor(Math.random() * interaction.messages.length)];

      // Update affection
      const currentAffection = player.affection[randomHeroineId] || 0;
      if (currentAffection < 100) {
        get().actions.updateAffection(randomHeroineId, interaction.affectionChange);
      }

      // Create a random interaction event
      const randomEvent: GameEvent = {
        id: `random_${randomHeroineId}_${Date.now()}`,
        name: `Random Interaction with ${randomHeroine}`,
        description: message,
        trigger: {
          character: randomHeroineId,
          random: true
        },
        choices: [
          {
            text: '친절하게 대답하기',
            effects: {
              affection: { [randomHeroineId]: 3 }
            },
            response: `${randomHeroine}가 밝게 웃습니다.`
          },
          {
            text: '간단히 인사만 하기',
            effects: {
              affection: { [randomHeroineId]: 1 }
            },
            response: `${randomHeroine}가 고개를 끄덕입니다.`
          },
          {
            text: '무시하고 지나가기',
            effects: {
              affection: { [randomHeroineId]: -2 }
            },
            response: `${randomHeroine}가 실망한 표정을 짓습니다.`
          }
        ]
      };

      // Set the event to trigger
      set({
        currentEvent: randomEvent,
        gameMessage: message
      });
    },
  },
}));
