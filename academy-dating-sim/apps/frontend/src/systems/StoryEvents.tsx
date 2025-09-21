import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useRomanceSystem } from './RomanceSystem';
import storiesData from '../data/stories.json';

export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  choices: StoryChoice[];
  unlockCondition?: string;
  isConfessionEvent?: boolean;
  requiredAffection?: number;
  triggerConditions?: {
    timeOfDay?: string;
    location?: string;
    flags?: string[];
    characterState?: Record<string, number>;
  };
}

export interface StoryChoice {
  text: string;
  outcomes: {
    affection: number;
    relationshipChange: string;
    unlocks?: string[];
    characterStateChange?: Record<string, number>;
  };
}

export interface StoryArc {
  id: string;
  title: string;
  requiredAffection: number;
  events: StoryEvent[];
  isCompleted?: boolean;
  currentEventIndex?: number;
}

export interface CharacterStory {
  characterBackstory: {
    origin: string;
    personality: string;
    deepestFear: string;
    trueDream: string;
    darkSecret: string;
    familyHistory: string;
  };
  storyArcs: StoryArc[];
}

// Special meeting events based on location and time
export const SPECIAL_MEETING_EVENTS: Record<string, StoryEvent[]> = {
  morning: [
    {
      id: 'morning_garden_encounter',
      title: '아침 정원에서의 만남',
      description: '이른 아침 정원을 산책하다가 꽃을 돌보고 있는 {character}를 만난다.',
      choices: [
        {
          text: '꽃들이 아름답네요. 함께 감상해도 될까요?',
          outcomes: {
            affection: 8,
            relationshipChange: '자연을 사랑하는 동반자',
            characterStateChange: { calmness: 15, trust: 10 }
          }
        },
        {
          text: '일찍 일어나시는군요. 부지런하시네요.',
          outcomes: {
            affection: 5,
            relationshipChange: '감탄하는 사람',
            characterStateChange: { excitement: 10 }
          }
        }
      ]
    },
    {
      id: 'morning_library_encounter',
      title: '아침 도서관에서의 만남',
      description: '조용한 아침 도서관에서 책을 읽고 있는 {character}를 발견한다.',
      choices: [
        {
          text: '무슨 책을 읽고 계시나요?',
          outcomes: {
            affection: 6,
            relationshipChange: '지적 호기심을 가진 사람',
            characterStateChange: { trust: 10, excitement: 5 }
          }
        },
        {
          text: '조용히 옆자리에 앉아 함께 독서한다',
          outcomes: {
            affection: 10,
            relationshipChange: '조용한 동반자',
            characterStateChange: { calmness: 20 }
          }
        }
      ]
    }
  ],
  evening: [
    {
      id: 'evening_rooftop_encounter',
      title: '저녁 옥상에서의 만남',
      description: '석양이 지는 옥상에서 혼자 생각에 잠긴 {character}를 만난다.',
      choices: [
        {
          text: '무슨 생각을 하고 계시나요?',
          outcomes: {
            affection: 8,
            relationshipChange: '마음을 열어주는 사람',
            characterStateChange: { trust: 15, excitement: 10 }
          }
        },
        {
          text: '저녁노을이 아름답네요. 함께 감상해요.',
          outcomes: {
            affection: 12,
            relationshipChange: '로맨틱한 순간을 공유하는 사람',
            characterStateChange: { calmness: 10, excitement: 15 }
          }
        }
      ]
    }
  ],
  night: [
    {
      id: 'night_mysterious_encounter',
      title: '밤의 신비로운 만남',
      description: '깊은 밤, 달빛 아래에서 신비로운 분위기의 {character}를 만난다.',
      choices: [
        {
          text: '밤이 당신에게 어울리는군요.',
          outcomes: {
            affection: 10,
            relationshipChange: '신비로움을 이해하는 사람',
            characterStateChange: { trust: 12, excitement: 18 }
          }
        },
        {
          text: '혹시 잠이 안 오시나요?',
          outcomes: {
            affection: 6,
            relationshipChange: '걱정해주는 사람',
            characterStateChange: { trust: 8, calmness: -5 }
          }
        }
      ]
    }
  ]
};

// Seasonal romantic events
export const SEASONAL_EVENTS: Record<string, StoryEvent[]> = {
  spring: [
    {
      id: 'cherry_blossom_festival',
      title: '벚꽃 축제',
      description: '학교에서 열리는 벚꽃 축제에서 {character}와 함께 시간을 보낸다.',
      choices: [
        {
          text: '함께 벚꽃구경을 하자고 제안한다',
          outcomes: {
            affection: 15,
            relationshipChange: '벚꽃 축제의 동반자',
            unlocks: ['spring_romance_memory'],
            characterStateChange: { excitement: 20, calmness: 15 }
          }
        },
        {
          text: '벚꽃처럼 아름답다고 말한다',
          outcomes: {
            affection: 18,
            relationshipChange: '시적인 감성을 가진 사람',
            characterStateChange: { excitement: 25, trust: 10 }
          }
        }
      ]
    }
  ],
  summer: [
    {
      id: 'summer_festival',
      title: '여름 축제',
      description: '여름밤 축제에서 유카타를 입은 {character}와 만난다.',
      choices: [
        {
          text: '유카타가 정말 잘 어울리네요',
          outcomes: {
            affection: 12,
            relationshipChange: '미적 감각을 인정해주는 사람',
            characterStateChange: { excitement: 15, trust: 8 }
          }
        },
        {
          text: '함께 불꽃놀이를 보자고 제안한다',
          outcomes: {
            affection: 20,
            relationshipChange: '여름밤의 로맨스',
            unlocks: ['fireworks_memory'],
            characterStateChange: { excitement: 30, calmness: 10 }
          }
        }
      ]
    }
  ],
  autumn: [
    {
      id: 'autumn_leaves',
      title: '단풍잎과 함께',
      description: '가을 단풍이 물든 길을 {character}와 함께 걷는다.',
      choices: [
        {
          text: '가을이 당신을 더 아름답게 만드는군요',
          outcomes: {
            affection: 14,
            relationshipChange: '계절의 아름다움을 함께 느끼는 사람',
            characterStateChange: { excitement: 18, calmness: 12 }
          }
        },
        {
          text: '단풍잎을 주워서 선물한다',
          outcomes: {
            affection: 16,
            relationshipChange: '소소한 선물을 주는 사람',
            unlocks: ['autumn_leaf_memory'],
            characterStateChange: { trust: 15, excitement: 20 }
          }
        }
      ]
    }
  ],
  winter: [
    {
      id: 'winter_snow',
      title: '첫눈과 함께',
      description: '올해 첫눈이 내리는 날, {character}와 함께 눈을 맞는다.',
      choices: [
        {
          text: '첫눈에 소원을 빌어요',
          outcomes: {
            affection: 15,
            relationshipChange: '로맨틱한 믿음을 공유하는 사람',
            unlocks: ['first_snow_wish'],
            characterStateChange: { excitement: 22, trust: 12 }
          }
        },
        {
          text: '추우니까 가까이 와도 될까요?',
          outcomes: {
            affection: 18,
            relationshipChange: '자연스러운 스킨십을 하는 사이',
            characterStateChange: { excitement: 25, trust: 15 }
          }
        }
      ]
    }
  ]
};

// Hook for managing story events
export const useStoryEvents = () => {
  const { player, actions } = useGameStore();
  const { addRomanceMemory, updateRelationshipProgression } = useRomanceSystem();

  const getCharacterStory = (characterId: string): CharacterStory | null => {
    const stories = storiesData as Record<string, CharacterStory>;
    return stories[characterId] || null;
  };

  const getAvailableStoryEvents = (characterId: string): StoryEvent[] => {
    const story = getCharacterStory(characterId);
    if (!story) return [];

    const currentAffection = player.affection[characterId] || 0;
    const playerFlags = player.flags || {};

    const availableEvents: StoryEvent[] = [];

    for (const arc of story.storyArcs) {
      if (currentAffection >= arc.requiredAffection) {
        for (const event of arc.events) {
          // Check if event is already completed
          if (playerFlags[`${characterId}_${event.id}_completed`]) continue;

          // Check unlock conditions
          if (event.unlockCondition && !playerFlags[event.unlockCondition]) continue;

          // Check if affection requirement is met
          if (event.requiredAffection && currentAffection < event.requiredAffection) continue;

          availableEvents.push(event);
        }
      }
    }

    return availableEvents;
  };

  const triggerRandomMeetingEvent = (characterId: string, timeOfDay: string, location: string): StoryEvent | null => {
    const meetingEvents = SPECIAL_MEETING_EVENTS[timeOfDay] || [];
    const locationSpecificEvents = meetingEvents.filter(event =>
      !event.triggerConditions?.location || event.triggerConditions.location === location
    );

    if (locationSpecificEvents.length === 0) return null;

    const randomEvent = locationSpecificEvents[Math.floor(Math.random() * locationSpecificEvents.length)];

    // Replace {character} placeholder with actual character name
    const characterNames: Record<string, string> = {
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

    const processedEvent: StoryEvent = {
      ...randomEvent,
      description: randomEvent.description.replace('{character}', characterNames[characterId] || characterId)
    };

    return processedEvent;
  };

  const triggerSeasonalEvent = (characterId: string, season: string): StoryEvent | null => {
    const seasonalEvents = SEASONAL_EVENTS[season] || [];
    if (seasonalEvents.length === 0) return null;

    const randomEvent = seasonalEvents[Math.floor(Math.random() * seasonalEvents.length)];

    const characterNames: Record<string, string> = {
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

    const processedEvent: StoryEvent = {
      ...randomEvent,
      description: randomEvent.description.replace('{character}', characterNames[characterId] || characterId)
    };

    return processedEvent;
  };

  const handleEventChoice = (characterId: string, event: StoryEvent, choiceIndex: number) => {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    // Apply affection change
    updateRelationshipProgression(characterId, choice.outcomes.affection);

    // Update character state
    if (choice.outcomes.characterStateChange) {
      actions.updateCharacterState(characterId, choice.outcomes.characterStateChange);
    }

    // Add unlocks
    if (choice.outcomes.unlocks) {
      const newFlags = { ...player.flags };
      choice.outcomes.unlocks.forEach(unlock => {
        newFlags[unlock] = true;
      });
      actions.updatePlayer({ flags: newFlags });
    }

    // Mark event as completed
    actions.updatePlayer({
      flags: {
        ...player.flags,
        [`${characterId}_${event.id}_completed`]: true
      }
    });

    // Add memory
    addRomanceMemory(characterId, {
      characterId,
      title: event.title,
      description: `${event.description} - ${choice.text}를 선택했습니다.`,
      type: event.isConfessionEvent ? 'confession' : 'special_event',
      emotionalWeight: Math.max(5, choice.outcomes.affection)
    });

    // Show outcome message
    const outcomeMessage = `${choice.outcomes.relationshipChange} - ${choice.outcomes.affection > 0 ? '+' : ''}${choice.outcomes.affection} 호감도`;
    actions.updatePlayer({ gameMessage: outcomeMessage });
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  const checkForStoryEventTriggers = (characterId: string) => {
    const currentTime = player.timeOfDay;
    const currentLocation = player.location;
    const currentSeason = getCurrentSeason();

    // 30% chance for random meeting event
    if (Math.random() < 0.3) {
      const meetingEvent = triggerRandomMeetingEvent(characterId, currentTime, currentLocation);
      if (meetingEvent) {
        return meetingEvent;
      }
    }

    // 20% chance for seasonal event
    if (Math.random() < 0.2) {
      const seasonalEvent = triggerSeasonalEvent(characterId, currentSeason);
      if (seasonalEvent) {
        return seasonalEvent;
      }
    }

    // Check for main story events
    const availableEvents = getAvailableStoryEvents(characterId);
    if (availableEvents.length > 0) {
      // Prioritize confession events
      const confessionEvents = availableEvents.filter(e => e.isConfessionEvent);
      if (confessionEvents.length > 0) {
        return confessionEvents[0];
      }

      // Otherwise return first available event
      return availableEvents[0];
    }

    return null;
  };

  return {
    getCharacterStory,
    getAvailableStoryEvents,
    triggerRandomMeetingEvent,
    triggerSeasonalEvent,
    handleEventChoice,
    checkForStoryEventTriggers,
    getCurrentSeason
  };
};

// Story Event Display Component
export const StoryEventDisplay: React.FC<{
  event: StoryEvent;
  characterId: string;
  onChoiceSelect: (choiceIndex: number) => void;
}> = ({ event, characterId, onChoiceSelect }) => {
  return (
    <div className="story-event bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-800 mb-3">{event.title}</h2>

      <div className="story-description bg-white p-4 rounded-lg shadow-inner mb-6">
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </div>

      <div className="choices space-y-3">
        <h3 className="text-lg font-semibold text-purple-700 mb-3">선택지:</h3>
        {event.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onChoiceSelect(index)}
            className="w-full p-4 text-left bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="choice-text text-gray-800 font-medium mb-1">
              {choice.text}
            </div>
            <div className="choice-preview text-sm text-gray-600">
              호감도 {choice.outcomes.affection > 0 ? '+' : ''}{choice.outcomes.affection} | {choice.outcomes.relationshipChange}
            </div>
          </button>
        ))}
      </div>

      {event.isConfessionEvent && (
        <div className="confession-notice mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-800 font-semibold text-center">💕 고백 이벤트입니다! 신중히 선택하세요.</p>
        </div>
      )}
    </div>
  );
};

// Character Backstory Display Component
export const CharacterBackstoryDisplay: React.FC<{ characterId: string }> = ({ characterId }) => {
  const { getCharacterStory } = useStoryEvents();
  const story = getCharacterStory(characterId);

  if (!story) return null;

  const { characterBackstory } = story;

  return (
    <div className="backstory-display bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-indigo-800 mb-4">캐릭터 배경</h3>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-indigo-700 mb-2">출생과 성장</h4>
          <p className="text-gray-700 text-sm">{characterBackstory.origin}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-indigo-700 mb-2">성격</h4>
          <p className="text-gray-700 text-sm">{characterBackstory.personality}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-indigo-700 mb-2">진정한 꿈</h4>
          <p className="text-gray-700 text-sm">{characterBackstory.trueDream}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-indigo-700 mb-2">가문의 역사</h4>
          <p className="text-gray-700 text-sm">{characterBackstory.familyHistory}</p>
        </div>
      </div>
    </div>
  );
};

export default { useStoryEvents, StoryEventDisplay, CharacterBackstoryDisplay };