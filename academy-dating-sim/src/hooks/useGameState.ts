import { useState, useEffect, useCallback } from 'react';
import type { Player, Character, GameEvent, Item, Location, SaveData, EndingType } from '../types/game';
import charactersData from '../data/characters.json';
import eventsData from '../data/events.json';
import itemsData from '../data/items.json';
import locationsData from '../data/locations.json';

// Type assertions for JSON data
const characters = charactersData as Record<string, Character>;
const events = eventsData as { events: GameEvent[] };
const items = itemsData as { items: Record<string, Item> };
const locations = locationsData as { locations: Record<string, Location> };

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
  affection: {
    sakura: 0,
    yuki: 0,
    luna: 0,
  },
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

export const useGameState = () => {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(['sakura', 'yuki', 'luna']);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [gameMessage, setGameMessage] = useState<string>('학원 생활이 시작됩니다!');
  const [gameEnding, setGameEnding] = useState<EndingType | null>(null);

  // Load saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('academyDatingSim');
    if (savedGame) {
      const saveData = JSON.parse(savedGame) as SaveData;
      setPlayer(saveData.player);
      setUnlockedCharacters(saveData.unlockedCharacters);
      setCompletedEvents(saveData.completedEvents);
    }
  }, []);

  // Save game
  const saveGame = useCallback(() => {
    const saveData: SaveData = {
      player,
      unlockedCharacters,
      completedEvents,
      timestamp: Date.now(),
      version: '1.0.0',
    };
    localStorage.setItem('academyDatingSim', JSON.stringify(saveData));
    setGameMessage('게임이 저장되었습니다!');
  }, [player, unlockedCharacters, completedEvents]);

  // Load game
  const loadGame = useCallback(() => {
    const savedGame = localStorage.getItem('academyDatingSim');
    if (savedGame) {
      const saveData = JSON.parse(savedGame) as SaveData;
      setPlayer(saveData.player);
      setUnlockedCharacters(saveData.unlockedCharacters);
      setCompletedEvents(saveData.completedEvents);
      setGameMessage('게임을 불러왔습니다!');
    } else {
      setGameMessage('저장된 게임이 없습니다.');
    }
  }, []);

  // Reset game
  const resetGame = useCallback((characterData?: any) => {
    // Create a fresh copy of INITIAL_PLAYER to ensure complete reset
    const freshPlayer: Player = {
      ...INITIAL_PLAYER,
      name: characterData?.playerName || INITIAL_PLAYER.name,
      stats: characterData?.startingStats || { ...INITIAL_PLAYER.stats },
      inventory: [],
      equipment: {},
      affection: {
        sakura: 0,
        yuki: 0,
        luna: 0,
      },
      flags: {},
      dungeonProgress: {
        currentFloor: 1,
        maxFloorReached: 1,
        position: { x: 0, y: 0 },
      },
    };

    setPlayer(freshPlayer);
    setUnlockedCharacters(['sakura', 'yuki', 'luna']);
    setCompletedEvents([]);
    setCurrentEvent(null);
    setGameEnding(null);
    setGameMessage(characterData ? `${freshPlayer.name}의 학원 생활이 시작됩니다!` : '새로운 게임을 시작합니다!');
    localStorage.removeItem('academyDatingSim');
  }, []);

  // Update player stats
  const updateStats = useCallback((stats: Partial<Player['stats']>) => {
    setPlayer(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...stats,
      },
    }));
  }, []);

  // Update affection
  const updateAffection = useCallback((character: string, amount: number) => {
    setPlayer(prev => {
      const newAffection = Math.max(0, Math.min(100, (prev.affection[character] || 0) + amount));
      return {
        ...prev,
        affection: {
          ...prev.affection,
          [character]: newAffection,
        },
      };
    });
  }, []);

  // Move to location
  const moveToLocation = useCallback((locationId: string) => {
    const location = locations.locations[locationId];
    if (!location) return;

    // Check unlock condition
    if (location.unlockCondition) {
      if (location.unlockCondition.item && !player.inventory.includes(location.unlockCondition.item)) {
        setGameMessage('이 장소는 아직 갈 수 없습니다.');
        return;
      }
    }

    setPlayer(prev => ({
      ...prev,
      location: locationId,
    }));
    setGameMessage(`${location.name}으로 이동했습니다.`);

    // Check for random events
    checkForEvents(locationId);
  }, [player.inventory]);

  // Advance time
  const advanceTime = useCallback(() => {
    setPlayer(prev => {
      const currentPhaseIndex = TIME_PHASES.indexOf(prev.timeOfDay);
      const nextPhaseIndex = currentPhaseIndex + 1;

      if (nextPhaseIndex >= TIME_PHASES.length) {
        // Next day
        const nextDay = prev.day + 1;

        if (nextDay > MAX_DAYS) {
          checkEnding();
          return prev;
        }

        return {
          ...prev,
          day: nextDay,
          timeOfDay: 'morning',
          hp: Math.min(prev.hp + 20, prev.maxHp), // Restore some HP
          mp: Math.min(prev.mp + 10, prev.maxMp), // Restore some MP
        };
      }

      return {
        ...prev,
        timeOfDay: TIME_PHASES[nextPhaseIndex],
      };
    });
  }, []);

  // Check for events
  const checkForEvents = useCallback((locationId?: string) => {
    const currentLocation = locationId || player.location;

    // Check story events
    const possibleEvents = events.events.filter(event => {
      // Check location
      if (event.trigger.location && event.trigger.location !== currentLocation) return false;

      // Check if already completed (if once)
      if (event.trigger.once && completedEvents.includes(event.id)) return false;

      // Check day requirement
      if (event.trigger.minDay && player.day < event.trigger.minDay) return false;

      // Check affection requirement
      if (event.trigger.character && event.trigger.minAffection) {
        const charAffection = player.affection[event.trigger.character] || 0;
        if (charAffection < event.trigger.minAffection) return false;
      }

      // Check total affection for mystery character
      if (event.trigger.totalAffection) {
        const totalAffection = Object.values(player.affection).reduce((sum, val) => sum + val, 0);
        if (totalAffection < event.trigger.totalAffection) return false;
      }

      // Chance check
      if (event.trigger.chance && Math.random() > event.trigger.chance) return false;

      return true;
    });

    if (possibleEvents.length > 0) {
      const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      setCurrentEvent(event);
    } else {
      // Check random events
      // Random events implementation would go here if needed
    }
  }, [player, completedEvents]);


  // Handle event choice
  const handleEventChoice = useCallback((event: GameEvent, choiceIndex: number) => {
    const choice = event.choices[choiceIndex];

    // Check conditions
    if (choice.condition) {
      if (choice.condition.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) {
        setGameMessage('지력이 부족합니다!');
        return;
      }
      if (choice.condition.minCharm && player.stats.charm < choice.condition.minCharm) {
        setGameMessage('매력이 부족합니다!');
        return;
      }
      if (choice.condition.minStamina && player.stats.stamina < choice.condition.minStamina) {
        setGameMessage('체력이 부족합니다!');
        return;
      }
    }

    // Apply effects
    if (choice.effects.affection) {
      Object.entries(choice.effects.affection).forEach(([char, amount]) => {
        updateAffection(char, amount);
      });
    }
    if (choice.effects.stats) {
      updateStats(choice.effects.stats);
    }
    if (choice.effects.item) {
      addItem(choice.effects.item);
    }
    if (choice.effects.money) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money + choice.effects.money!,
      }));
    }
    if (choice.effects.flag) {
      setPlayer(prev => ({
        ...prev,
        flags: {
          ...prev.flags,
          [choice.effects.flag!]: true,
        },
      }));
    }
    if (choice.effects.unlockCharacter) {
      setUnlockedCharacters(prev => [...prev, choice.effects.unlockCharacter!]);
    }

    setGameMessage(choice.effects.text);

    // Mark event as completed if it's a once-only event
    if (event.trigger.once) {
      setCompletedEvents(prev => [...prev, event.id]);
    }

    setCurrentEvent(null);
  }, [player]);

  // Add item to inventory
  const addItem = useCallback((itemId: string) => {
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, itemId],
    }));
  }, []);

  // Purchase item
  const purchaseItem = useCallback((itemId: string, price: number) => {
    if (player.money >= price) {
      setPlayer(prev => ({
        ...prev,
        inventory: [...prev.inventory, itemId],
        money: prev.money - price,
      }));
      return true;
    }
    return false;
  }, [player.money]);

  // Use item
  const useItem = useCallback((itemId: string, targetCharacter?: string) => {
    const item = items.items[itemId];
    if (!item) return;

    if (item.type === 'gift' && targetCharacter) {
      // Give gift
      const baseAffection = ('affection' in item.effect) ? item.effect.affection || 10 : 10;
      const bonus = item.preferredBy?.includes(targetCharacter) ? 5 : 0;
      updateAffection(targetCharacter, baseAffection + bonus);

      setGameMessage(`${targetCharacter}에게 ${item.name}을(를) 선물했습니다!`);
    } else if (item.type === 'consumable') {
      // Use consumable
      if ('intelligence' in item.effect && item.effect.intelligence) {
        updateStats({ intelligence: player.stats.intelligence + item.effect.intelligence });
      }
      if ('charm' in item.effect && item.effect.charm) {
        updateStats({ charm: player.stats.charm + item.effect.charm });
      }
      if ('stamina' in item.effect && item.effect.stamina) {
        updateStats({ stamina: player.stats.stamina + item.effect.stamina });
      }

      setGameMessage(`${item.name}을(를) 사용했습니다!`);
    }

    // Remove item from inventory
    setPlayer(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, index) =>
        index !== prev.inventory.indexOf(itemId)
      ),
    }));
  }, [player.stats]);

  // Check ending conditions
  const checkEnding = useCallback(() => {
    // Check for character-specific endings
    const maxAffection = Object.entries(player.affection).reduce((max, [char, value]) =>
      value > max.value ? { char, value } : max,
      { char: '', value: 0 }
    );

    if (maxAffection.value >= 80) {
      if (player.flags[`${maxAffection.char}_route`]) {
        setGameEnding(maxAffection.char as EndingType);
      } else {
        setGameEnding('good');
      }
    } else if (maxAffection.value >= 50) {
      setGameEnding('normal');
    } else {
      setGameEnding('solo');
    }
  }, [player]);

  // Perform activity
  const performActivity = useCallback((activityName: string, navigate?: (path: string) => void) => {
    const location = locations.locations[player.location];
    const activity = location?.activities.find(a => a.name === activityName);

    if (!activity) return;

    // Special handling for shopping - redirect to shopping page
    if (activityName === '쇼핑하기' && navigate) {
      setGameMessage('매점으로 이동합니다...');
      navigate('/shopping');
      return;
    }

    // Check time restriction
    if (activity.time !== 'any' && activity.time !== player.timeOfDay) {
      setGameMessage(`이 활동은 ${activity.time}에만 할 수 있습니다.`);
      return;
    }

    // Special handling for rest activity - restore stamina instead of consuming
    if (activityName === '휴식하기' || activityName === '휴식') {
      const restoredStamina = 10;
      const restoredHp = 20;
      const restoredMp = 10;

      const newStats = {
        ...player.stats,
        stamina: Math.min(player.stats.stamina + restoredStamina, 20) // Restore 10 stamina up to max of 20
      };

      setPlayer(prev => ({
        ...prev,
        stats: newStats,
        hp: Math.min(prev.hp + restoredHp, prev.maxHp),
        mp: Math.min(prev.mp + restoredMp, prev.maxMp)
      }));

      setGameMessage(`💤 휴식을 취했습니다! 체력 +${restoredStamina}, HP +${restoredHp}, MP +${restoredMp} 회복되었습니다.`);
      advanceTime();
      return;
    }

    // Check stamina for non-rest activities
    if (player.stats.stamina <= 0) {
      setGameMessage('체력이 부족합니다. 시간이 자동으로 진행되어 체력이 회복됩니다.');
      // Auto advance time and restore stamina
      setPlayer(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          stamina: Math.min(prev.stats.stamina + 5, 20)
        }
      }));
      advanceTime();
      return;
    }

    // Apply activity effects and consume stamina
    const newStats = {
      ...activity.effect,
      stamina: Math.max(player.stats.stamina - 2, 0) // Consume 2 stamina per activity
    };
    updateStats(newStats);
    setGameMessage(`${activityName}을(를) 했습니다.`);

    // Check if stamina is depleted after activity
    if (newStats.stamina <= 0) {
      setTimeout(() => {
        setGameMessage('체력이 고갈되어 자동으로 시간이 진행됩니다.');
        setPlayer(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            stamina: Math.min(prev.stats.stamina + 5, 20)
          }
        }));
        advanceTime();
      }, 1500);
    } else {
      // Advance time after activity
      advanceTime();
    }
  }, [player.location, player.timeOfDay, player.stats.stamina]);

  return {
    player,
    unlockedCharacters,
    completedEvents,
    currentEvent,
    gameMessage,
    gameEnding,
    characters: characters,
    locations: locations.locations,
    items: items.items,
    actions: {
      saveGame,
      loadGame,
      resetGame,
      updateStats,
      updateAffection,
      moveToLocation,
      advanceTime,
      handleEventChoice,
      useItem,
      performActivity,
      addItem,
      purchaseItem,
    },
  };
};