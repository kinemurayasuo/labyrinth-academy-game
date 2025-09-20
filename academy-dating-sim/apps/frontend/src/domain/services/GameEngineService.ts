// Domain Service: Game Engine
import type { PlayerState, PlayerStatsData } from '../entities/Player';
import { PlayerEntity } from '../entities/Player';
import type { CharacterState } from '../entities/Character';
import { CharacterEntity } from '../entities/Character';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  trigger: {
    location?: string;
    minDay?: number;
    maxDay?: number;
    once?: boolean;
    requiredFlags?: string[];
    minAffection?: Record<string, number>;
  };
  choices: GameEventChoice[];
}

export interface GameEventChoice {
  text: string;
  condition?: {
    minIntelligence?: number;
    minCharm?: number;
    minStamina?: number;
    requiredFlags?: string[];
  };
  effects: {
    text: string;
    affection?: Record<string, number>;
    stats?: Partial<PlayerStatsData>;
    money?: number;
    item?: string;
    flag?: string;
    unlockCharacter?: string;
  };
}

export interface ActivityResult {
  message: string;
  player: PlayerState;
  shouldAdvanceTime: boolean;
  events?: GameEvent[];
}

export const GameEngineService = {
  // Core game loop logic
  performActivity(
    player: PlayerState,
    activityName: string,
    characters: Record<string, CharacterState>
  ): ActivityResult {
    let newPlayer = { ...player };
    let message = '';
    let shouldAdvanceTime = true;

    // Check stamina requirements
    if (newPlayer.stats.stamina < 10 && !['휴식하기', '쇼핑하기'].includes(activityName)) {
      return {
        message: '체력이 부족합니다. 휴식을 취하세요.',
        player,
        shouldAdvanceTime: false
      };
    }

    switch (activityName) {
      case '공부하기':
        newPlayer = PlayerEntity.updateStats(newPlayer, {
          intelligence: newPlayer.stats.intelligence + 2,
          stamina: Math.max(0, newPlayer.stats.stamina - 10)
        });
        message = '열심히 공부했습니다. 지력 +2';
        break;

      case '운동하기':
        newPlayer = PlayerEntity.updateStats(newPlayer, {
          strength: newPlayer.stats.strength + 2,
          stamina: Math.max(0, newPlayer.stats.stamina - 10)
        });
        message = '열심히 운동했습니다. 근력 +2';
        break;

      case '휴식하기':
        newPlayer = PlayerEntity.updateStats(newPlayer, {
          stamina: Math.min(100, newPlayer.stats.stamina + 20)
        });
        newPlayer = PlayerEntity.updateHpMp(newPlayer, 10, 5);
        message = '충분히 휴식했습니다. 체력 회복!';
        break;

      case '매력 연마':
        newPlayer = PlayerEntity.updateStats(newPlayer, {
          charm: newPlayer.stats.charm + 2,
          stamina: Math.max(0, newPlayer.stats.stamina - 10)
        });
        message = '매력을 연마했습니다. 매력 +2';
        break;

      default:
        message = `${activityName}을(를) 했습니다.`;
        break;
    }

    return {
      message,
      player: newPlayer,
      shouldAdvanceTime
    };
  },

  // Event system
  checkForEvents(
    player: PlayerState,
    events: GameEvent[],
    completedEvents: string[],
    locationId?: string
  ): GameEvent | null {
    const currentLocation = locationId || player.location;

    const possibleEvents = events.filter(event => {
      // Location check
      if (event.trigger.location && event.trigger.location !== currentLocation) {
        return false;
      }

      // One-time event check
      if (event.trigger.once && completedEvents.includes(event.id)) {
        return false;
      }

      // Day requirements
      if (event.trigger.minDay && player.day < event.trigger.minDay) {
        return false;
      }
      if (event.trigger.maxDay && player.day > event.trigger.maxDay) {
        return false;
      }

      // Flag requirements
      if (event.trigger.requiredFlags) {
        for (const flag of event.trigger.requiredFlags) {
          if (!PlayerEntity.hasFlag(player, flag)) {
            return false;
          }
        }
      }

      // Affection requirements
      if (event.trigger.minAffection) {
        for (const [charId, minAff] of Object.entries(event.trigger.minAffection)) {
          if (PlayerEntity.getAffection(player, charId) < minAff) {
            return false;
          }
        }
      }

      return true;
    });

    if (possibleEvents.length === 0) {
      return null;
    }

    // Return random event from possible events
    return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
  },

  // Handle event choice
  handleEventChoice(
    player: PlayerState,
    event: GameEvent,
    choiceIndex: number
  ): { player: PlayerState; message: string; success: boolean } {
    const choice = event.choices[choiceIndex];
    
    if (!choice) {
      return { player, message: '잘못된 선택입니다.', success: false };
    }

    // Check conditions
    if (choice.condition) {
      if (choice.condition.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) {
        return { player, message: '지력이 부족합니다!', success: false };
      }
      if (choice.condition.minCharm && player.stats.charm < choice.condition.minCharm) {
        return { player, message: '매력이 부족합니다!', success: false };
      }
      if (choice.condition.minStamina && player.stats.stamina < choice.condition.minStamina) {
        return { player, message: '체력이 부족합니다!', success: false };
      }
      if (choice.condition.requiredFlags) {
        for (const flag of choice.condition.requiredFlags) {
          if (!PlayerEntity.hasFlag(player, flag)) {
            return { player, message: '조건을 만족하지 않습니다!', success: false };
          }
        }
      }
    }

    let newPlayer = { ...player };

    // Apply effects
    if (choice.effects.affection) {
      for (const [charId, amount] of Object.entries(choice.effects.affection)) {
        newPlayer = PlayerEntity.updateAffection(newPlayer, charId, amount);
      }
    }

    if (choice.effects.stats) {
      newPlayer = PlayerEntity.updateStats(newPlayer, choice.effects.stats);
    }

    if (choice.effects.money) {
      newPlayer = PlayerEntity.earnMoney(newPlayer, choice.effects.money);
    }

    if (choice.effects.item) {
      newPlayer = PlayerEntity.addItem(newPlayer, choice.effects.item);
    }

    if (choice.effects.flag) {
      newPlayer = PlayerEntity.setFlag(newPlayer, choice.effects.flag);
    }

    return {
      player: newPlayer,
      message: choice.effects.text,
      success: true
    };
  },

  // Ending logic
  checkEnding(player: PlayerState): EndingType | null {
    const MAX_DAYS = 30;
    
    if (player.day > MAX_DAYS) {
      const maxAffection = Object.entries(player.affection).reduce(
        (max, [char, value]) => value > max.value ? { char, value } : max,
        { char: '', value: 0 }
      );

      if (maxAffection.value >= 80) {
        if (PlayerEntity.hasFlag(player, `${maxAffection.char}_route`)) {
          return maxAffection.char as EndingType;
        } else {
          return 'good';
        }
      } else if (maxAffection.value >= 50) {
        return 'normal';
      } else {
        return 'solo';
      }
    }

    return null;
  },

  // Character interaction logic
  interactWithCharacter(
    player: PlayerState,
    character: CharacterState,
    interactionType: string
  ): { player: PlayerState; message: string; affectionChange: number } {
    const currentAffection = PlayerEntity.getAffection(player, character.id);
    let affectionChange = 0;
    let message = '';

    switch (interactionType) {
      case 'talk':
        affectionChange = 1;
        message = CharacterEntity.getDialogue(character, currentAffection);
        break;
      
      case 'compliment':
        affectionChange = 2;
        message = `${character.name}이(가) 기뻐하고 있습니다!`;
        break;
      
      case 'gift':
        affectionChange = 5;
        message = `${character.name}이(가) 선물을 좋아합니다!`;
        break;
      
      default:
        message = `${character.name}와(과) 시간을 보냈습니다.`;
        affectionChange = 1;
    }

    const newPlayer = PlayerEntity.updateAffection(player, character.id, affectionChange);

    return {
      player: newPlayer,
      message,
      affectionChange
    };
  }
};

// Supporting types
export type EndingType = 'true' | 'good' | 'normal' | 'solo' | 'sakura' | 'yuki' | 'luna' | 'mystery';