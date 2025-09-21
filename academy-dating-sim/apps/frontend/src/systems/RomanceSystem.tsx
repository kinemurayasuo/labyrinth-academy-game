import React from 'react';
import { useGameStore } from '../store/useGameStore';

export interface RelationshipStage {
  name: string;
  minAffection: number;
  maxAffection: number;
  status: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'romantic_interest' | 'lover' | 'soulmate';
  description: string;
  unlockedFeatures: string[];
  romanticTension: number; // 0-100
  intimacyLevel: number; // 0-100
}

export interface RomanceState {
  characterId: string;
  relationshipStage: RelationshipStage;
  romanticTension: number;
  intimacyLevel: number;
  datesCompleted: number;
  firstMeetingCompleted: boolean;
  confessionAvailable: boolean;
  confessionAccepted: boolean;
  jealousyLevel: number; // From spending time with other heroines
  lastInteractionDate: number;
  specialMemories: string[];
  relationshipMilestones: string[];
}

export interface DateLocation {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'special';
  requiredRelationshipStage: string;
  romanticValue: number;
  costPerHour: number;
  availableActivities: DateActivity[];
  mood: 'casual' | 'romantic' | 'intimate' | 'adventurous';
  description: string;
}

export interface DateActivity {
  id: string;
  name: string;
  duration: number; // in minutes
  romanticBonus: number;
  intimacyBonus: number;
  requiredStats?: {
    charm?: number;
    intelligence?: number;
    strength?: number;
  };
  dialogue: string[];
  outcomes: {
    success: {
      affectionChange: number;
      romanticTensionChange: number;
      message: string;
    };
    failure: {
      affectionChange: number;
      romanticTensionChange: number;
      message: string;
    };
  };
}

export interface RomanceMemory {
  id: string;
  characterId: string;
  title: string;
  description: string;
  date: number;
  type: 'first_meeting' | 'date' | 'confession' | 'special_event' | 'milestone';
  emotionalWeight: number; // How much this memory affects the relationship
  image?: string;
}

// Romance Progression System Configuration
export const RELATIONSHIP_STAGES: RelationshipStage[] = [
  {
    name: '낯선 사이',
    minAffection: 0,
    maxAffection: 9,
    status: 'stranger',
    description: '서로를 잘 모르는 상태. 첫 만남의 설렘이 있을 수 있습니다.',
    unlockedFeatures: ['basic_interaction', 'gift_giving'],
    romanticTension: 0,
    intimacyLevel: 0
  },
  {
    name: '아는 사이',
    minAffection: 10,
    maxAffection: 24,
    status: 'acquaintance',
    description: '서로의 존재를 인정하고 가끔 대화를 나누는 사이.',
    unlockedFeatures: ['casual_conversation', 'study_together', 'walking_together'],
    romanticTension: 10,
    intimacyLevel: 5
  },
  {
    name: '친구',
    minAffection: 25,
    maxAffection: 44,
    status: 'friend',
    description: '편안하게 대화하고 함께 시간을 보내는 친한 친구 사이.',
    unlockedFeatures: ['casual_dates', 'personal_stories', 'lunch_together'],
    romanticTension: 25,
    intimacyLevel: 15
  },
  {
    name: '가까운 친구',
    minAffection: 45,
    maxAffection: 64,
    status: 'close_friend',
    description: '깊은 신뢰와 이해가 있는 가까운 친구. 로맨틱한 감정이 싹트기 시작합니다.',
    unlockedFeatures: ['romantic_dates', 'deep_conversations', 'hand_holding', 'special_gifts'],
    romanticTension: 50,
    intimacyLevel: 35
  },
  {
    name: '연인 후보',
    minAffection: 65,
    maxAffection: 79,
    status: 'romantic_interest',
    description: '서로에게 특별한 감정을 느끼는 사이. 고백을 고려할 수 있습니다.',
    unlockedFeatures: ['confession', 'intimate_dates', 'romantic_gestures', 'jealousy_events'],
    romanticTension: 75,
    intimacyLevel: 55
  },
  {
    name: '연인',
    minAffection: 80,
    maxAffection: 94,
    status: 'lover',
    description: '서로 사랑을 확인한 연인 사이. 깊은 유대감을 공유합니다.',
    unlockedFeatures: ['couple_activities', 'intimate_moments', 'future_planning', 'exclusive_dating'],
    romanticTension: 90,
    intimacyLevel: 80
  },
  {
    name: '운명의 상대',
    minAffection: 95,
    maxAffection: 100,
    status: 'soulmate',
    description: '영혼이 통하는 완벽한 운명의 상대. 최고의 사랑을 나누는 사이.',
    unlockedFeatures: ['true_love_events', 'engagement', 'soulmate_bond', 'eternal_promise'],
    romanticTension: 100,
    intimacyLevel: 100
  }
];

export const DATE_LOCATIONS: DateLocation[] = [
  {
    id: 'school_cafe',
    name: '학교 카페',
    type: 'indoor',
    requiredRelationshipStage: 'acquaintance',
    romanticValue: 30,
    costPerHour: 15,
    availableActivities: ['coffee_chat', 'study_date', 'dessert_sharing'],
    mood: 'casual',
    description: '편안한 분위기의 학교 카페. 가벼운 대화와 함께 시간을 보내기 좋습니다.'
  },
  {
    id: 'school_garden',
    name: '학교 정원',
    type: 'outdoor',
    requiredRelationshipStage: 'friend',
    romanticValue: 60,
    costPerHour: 0,
    availableActivities: ['flower_viewing', 'romantic_walk', 'bench_talk'],
    mood: 'romantic',
    description: '아름다운 꽃들이 피어있는 학교 정원. 로맨틱한 분위기가 물씬 풍깁니다.'
  },
  {
    id: 'city_park',
    name: '도시 공원',
    type: 'outdoor',
    requiredRelationshipStage: 'close_friend',
    romanticValue: 70,
    costPerHour: 5,
    availableActivities: ['picnic', 'boat_ride', 'sunset_watching'],
    mood: 'romantic',
    description: '넓은 호수가 있는 아름다운 도시 공원. 피크닉과 산책을 즐기기 좋습니다.'
  },
  {
    id: 'movie_theater',
    name: '영화관',
    type: 'indoor',
    requiredRelationshipStage: 'friend',
    romanticValue: 50,
    costPerHour: 25,
    availableActivities: ['movie_watching', 'popcorn_sharing', 'hand_holding'],
    mood: 'intimate',
    description: '어둠 속에서 함께 영화를 보며 자연스럽게 가까워질 수 있는 곳입니다.'
  },
  {
    id: 'rooftop_restaurant',
    name: '옥상 레스토랑',
    type: 'special',
    requiredRelationshipStage: 'romantic_interest',
    romanticValue: 90,
    costPerHour: 50,
    availableActivities: ['candlelight_dinner', 'city_view', 'stargazing'],
    mood: 'romantic',
    description: '도시의 야경이 한눈에 내려다보이는 로맨틱한 옥상 레스토랑입니다.'
  },
  {
    id: 'amusement_park',
    name: '놀이공원',
    type: 'outdoor',
    requiredRelationshipStage: 'close_friend',
    romanticValue: 80,
    costPerHour: 35,
    availableActivities: ['roller_coaster', 'ferris_wheel', 'game_booth'],
    mood: 'adventurous',
    description: '스릴 넘치는 놀이기구와 함께 즐거운 시간을 보낼 수 있는 놀이공원입니다.'
  },
  {
    id: 'beach',
    name: '해변',
    type: 'special',
    requiredRelationshipStage: 'romantic_interest',
    romanticValue: 95,
    costPerHour: 20,
    availableActivities: ['beach_walk', 'sunrise_watching', 'sand_castle'],
    mood: 'romantic',
    description: '파도 소리와 함께하는 로맨틱한 해변. 일출과 일몰이 아름답습니다.'
  }
];

// Romance System Hook
export const useRomanceSystem = () => {
  const { player, actions } = useGameStore();

  const getRelationshipStage = (characterId: string): RelationshipStage => {
    const affection = player.affection[characterId] || 0;
    return RELATIONSHIP_STAGES.find(stage =>
      affection >= stage.minAffection && affection <= stage.maxAffection
    ) || RELATIONSHIP_STAGES[0];
  };

  const calculateRomanticTension = (characterId: string): number => {
    const affection = player.affection[characterId] || 0;
    const stage = getRelationshipStage(characterId);
    const baseRomanticTension = stage.romanticTension;

    // Factors that affect romantic tension
    const characterState = player.characterStates?.[characterId];
    const recentInteraction = characterState ? 1.2 : 1.0;
    const jealousyFactor = player.flags[`${characterId}_jealous`] ? 0.8 : 1.0;

    return Math.min(100, Math.round(baseRomanticTension * recentInteraction * jealousyFactor));
  };

  const canConfess = (characterId: string): boolean => {
    const stage = getRelationshipStage(characterId);
    const romanticTension = calculateRomanticTension(characterId);
    return stage.status === 'romantic_interest' && romanticTension >= 70;
  };

  const triggerJealousy = (targetCharacterId: string, otherCharacterId: string) => {
    const targetAffection = player.affection[targetCharacterId] || 0;
    if (targetAffection >= 45) { // Only if close friend or higher
      const jealousyAmount = Math.max(5, Math.floor(targetAffection / 10));
      actions.updateAffection(targetCharacterId, -jealousyAmount);
      actions.updatePlayer({
        flags: {
          ...player.flags,
          [`${targetCharacterId}_jealous`]: true
        }
      });

      // Set jealousy cooldown
      setTimeout(() => {
        actions.updatePlayer({
          flags: {
            ...player.flags,
            [`${targetCharacterId}_jealous`]: false
          }
        });
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
  };

  const getAvailableDateLocations = (characterId: string): DateLocation[] => {
    const stage = getRelationshipStage(characterId);
    return DATE_LOCATIONS.filter(location => {
      const requiredStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.status === location.requiredRelationshipStage);
      const currentStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.status === stage.status);
      return currentStageIndex >= requiredStageIndex;
    });
  };

  const calculateDateSuccess = (characterId: string, activityId: string): boolean => {
    const playerStats = player.stats;
    const characterState = player.characterStates?.[characterId];
    const activity = DATE_LOCATIONS
      .flatMap(loc => loc.availableActivities)
      .find(act => typeof act === 'object' && act.id === activityId);

    if (!activity || typeof activity === 'string') return true;

    // Check stat requirements
    if (activity.requiredStats) {
      if (activity.requiredStats.charm && playerStats.charm < activity.requiredStats.charm) return false;
      if (activity.requiredStats.intelligence && playerStats.intelligence < activity.requiredStats.intelligence) return false;
      if (activity.requiredStats.strength && playerStats.strength < activity.requiredStats.strength) return false;
    }

    // Factor in character state
    const stateModifier = characterState ?
      (characterState.calmness + characterState.trust + characterState.energy) / 300 : 0.5;

    // Base success rate with state modifier
    const successRate = Math.min(0.9, 0.6 + stateModifier * 0.3);

    return Math.random() < successRate;
  };

  const addRomanceMemory = (characterId: string, memory: Omit<RomanceMemory, 'id' | 'date'>) => {
    const newMemory: RomanceMemory = {
      ...memory,
      id: `memory_${characterId}_${Date.now()}`,
      date: Date.now()
    };

    const currentMemories = player.flags[`${characterId}_memories`] || [];
    actions.updatePlayer({
      flags: {
        ...player.flags,
        [`${characterId}_memories`]: [...currentMemories, newMemory]
      }
    });
  };

  const getRomanceMemories = (characterId: string): RomanceMemory[] => {
    return player.flags[`${characterId}_memories`] || [];
  };

  const updateRelationshipProgression = (characterId: string, affectionChange: number) => {
    const oldStage = getRelationshipStage(characterId);
    actions.updateAffection(characterId, affectionChange);

    // Check for stage progression
    const newStage = getRelationshipStage(characterId);
    if (newStage.status !== oldStage.status) {
      // Trigger stage progression event
      const progressionMessage = `${characterId}와의 관계가 '${newStage.name}' 단계로 발전했습니다!`;
      actions.updatePlayer({ gameMessage: progressionMessage });

      // Add milestone memory
      addRomanceMemory(characterId, {
        characterId,
        title: `관계 발전: ${newStage.name}`,
        description: `${characterId}와의 관계가 새로운 단계로 발전했습니다.`,
        type: 'milestone',
        emotionalWeight: 10
      });

      // Unlock new features
      actions.updatePlayer({
        flags: {
          ...player.flags,
          [`${characterId}_stage_${newStage.status}`]: true
        }
      });
    }
  };

  return {
    getRelationshipStage,
    calculateRomanticTension,
    canConfess,
    triggerJealousy,
    getAvailableDateLocations,
    calculateDateSuccess,
    addRomanceMemory,
    getRomanceMemories,
    updateRelationshipProgression,
    RELATIONSHIP_STAGES,
    DATE_LOCATIONS
  };
};

// Romance System Component
export const RomanceSystem: React.FC<{ characterId: string }> = ({ characterId }) => {
  const { player } = useGameStore();
  const {
    getRelationshipStage,
    calculateRomanticTension,
    canConfess,
    getRomanceMemories
  } = useRomanceSystem();

  const stage = getRelationshipStage(characterId);
  const romanticTension = calculateRomanticTension(characterId);
  const affection = player.affection[characterId] || 0;
  const memories = getRomanceMemories(characterId);

  return (
    <div className="romance-system p-4 bg-pink-50 rounded-lg">
      <h3 className="text-lg font-bold text-pink-800 mb-3">연애 상태</h3>

      <div className="relationship-info mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">관계 단계:</span>
          <span className="text-pink-600 font-bold">{stage.name}</span>
        </div>

        <div className="mb-2">
          <span className="font-semibold">호감도:</span>
          <div className="w-full bg-gray-200 rounded-full h-2 ml-2 inline-block align-middle" style={{width: '200px'}}>
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-500"
              style={{width: `${affection}%`}}
            />
          </div>
          <span className="ml-2 text-sm">{affection}/100</span>
        </div>

        <div className="mb-2">
          <span className="font-semibold">로맨틱 텐션:</span>
          <div className="w-full bg-gray-200 rounded-full h-2 ml-2 inline-block align-middle" style={{width: '200px'}}>
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{width: `${romanticTension}%`}}
            />
          </div>
          <span className="ml-2 text-sm">{romanticTension}/100</span>
        </div>
      </div>

      <div className="stage-description mb-4">
        <p className="text-sm text-gray-700 italic">{stage.description}</p>
      </div>

      <div className="unlocked-features mb-4">
        <h4 className="font-semibold text-sm mb-2">이용 가능한 기능:</h4>
        <div className="flex flex-wrap gap-1">
          {stage.unlockedFeatures.map(feature => (
            <span
              key={feature}
              className="px-2 py-1 bg-pink-200 text-pink-800 text-xs rounded-full"
            >
              {feature.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {canConfess(characterId) && (
        <div className="confession-available p-3 bg-red-100 border border-red-300 rounded-lg mb-4">
          <p className="text-red-800 font-semibold">💕 고백할 수 있습니다!</p>
          <p className="text-sm text-red-600">로맨틱 텐션이 충분히 높아졌습니다.</p>
        </div>
      )}

      {memories.length > 0 && (
        <div className="memories">
          <h4 className="font-semibold text-sm mb-2">소중한 추억들:</h4>
          <div className="max-h-32 overflow-y-auto">
            {memories.slice(-3).map(memory => (
              <div key={memory.id} className="mb-1 p-2 bg-white rounded border">
                <div className="font-semibold text-xs text-pink-600">{memory.title}</div>
                <div className="text-xs text-gray-600">{memory.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RomanceSystem;