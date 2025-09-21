import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useRomanceSystem } from '../../systems/RomanceSystem';
import { useStoryEvents } from '../../systems/StoryEvents';
import { useCharacterMemory } from '../../systems/CharacterMemory';
import { useDynamicDialogue } from '../../systems/DialogueSystem';
import RomanceHub from '../RomanceHub';

// Enhanced character interaction component
export const EnhancedCharacterInteraction: React.FC<{
  characterId: string;
  onClose: () => void;
}> = ({ characterId, onClose }) => {
  const { player, actions } = useGameStore();
  const [showRomanceHub, setShowRomanceHub] = useState(false);
  const [interactionType, setInteractionType] = useState<'quick' | 'detailed'>('quick');

  const {
    getRelationshipStage,
    calculateRomanticTension,
    canConfess
  } = useRomanceSystem();

  const {
    checkForStoryEventTriggers
  } = useStoryEvents();

  const {
    getCharacterEmotionalState,
    getCharacterMoodState
  } = useCharacterMemory();

  const {
    selectContextualResponse
  } = useDynamicDialogue();

  const relationshipStage = getRelationshipStage(characterId);
  const romanticTension = calculateRomanticTension(characterId);
  const affection = player.affection[characterId] || 0;
  const emotionalState = getCharacterEmotionalState(characterId);
  const moodState = getCharacterMoodState(characterId);

  // Character name mapping
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

  const characterName = characterNames[characterId] || characterId;

  // Generate contextual greeting
  const [currentDialogue, setCurrentDialogue] = useState<string>('');

  useEffect(() => {
    const greeting = selectContextualResponse(characterId, 'greetings', player.timeOfDay);
    setCurrentDialogue(greeting);
  }, [characterId, player.timeOfDay]);

  // Quick interaction options
  const quickInteractions = [
    {
      id: 'chat',
      label: '대화하기',
      icon: '💬',
      description: '가벼운 대화를 나누기',
      affectionBoost: 3,
      action: () => {
        const response = selectContextualResponse(characterId, 'mood_dialogues', moodState.currentMood);
        setCurrentDialogue(response);
        actions.updateAffection(characterId, 3);
      }
    },
    {
      id: 'compliment',
      label: '칭찬하기',
      icon: '🌟',
      description: '상대방을 칭찬하기',
      affectionBoost: 5,
      requirements: { charm: 12 },
      action: () => {
        const response = selectContextualResponse(characterId, 'mood_dialogues', 'happy');
        setCurrentDialogue(response);
        actions.updateAffection(characterId, 5);
      }
    },
    {
      id: 'gift',
      label: '선물하기',
      icon: '🎁',
      description: '인벤토리에서 선물 주기',
      affectionBoost: 8,
      action: () => {
        // This would open gift selection interface
        const response = selectContextualResponse(characterId, 'activity_responses', 'gift');
        setCurrentDialogue(response);
      }
    },
    {
      id: 'date_invite',
      label: '데이트 신청',
      icon: '💕',
      description: '데이트를 신청하기',
      affectionBoost: 10,
      requirements: { relationshipStage: 'friend' },
      action: () => {
        setShowRomanceHub(true);
      }
    }
  ];

  // Filter available interactions based on requirements
  const availableInteractions = quickInteractions.filter(interaction => {
    if (interaction.requirements?.charm && player.stats.charm < interaction.requirements.charm) {
      return false;
    }
    if (interaction.requirements?.relationshipStage) {
      const stageOrder = ['stranger', 'acquaintance', 'friend', 'close_friend', 'romantic_interest', 'lover', 'soulmate'];
      const requiredIndex = stageOrder.indexOf(interaction.requirements.relationshipStage);
      const currentIndex = stageOrder.indexOf(relationshipStage.status);
      if (currentIndex < requiredIndex) return false;
    }
    return true;
  });

  const handleQuickInteraction = (interaction: any) => {
    interaction.action();

    // Add small memory
    // This would be handled by the memory system
    setTimeout(() => {
      setCurrentDialogue(selectContextualResponse(characterId, 'greetings', player.timeOfDay));
    }, 3000);
  };

  if (showRomanceHub) {
    return <RomanceHub characterId={characterId} onClose={() => setShowRomanceHub(false)} />;
  }

  return (
    <div className="enhanced-character-interaction fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="interaction-panel bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Character Header */}
        <div className="character-header bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="character-avatar w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                <span className="text-3xl">
                  {characterId === 'sakura' ? '🗡️' :
                   characterId === 'yuki' ? '❄️' :
                   characterId === 'luna' ? '🌙' : '✨'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{characterName}</h2>
                <p className="text-purple-100">{relationshipStage.name}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm">호감도: {affection}/100</span>
                  <span className="text-sm">텐션: {romanticTension}/100</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Mood Indicator */}
          <div className="mood-indicator mt-4 flex items-center space-x-2">
            <span className="text-sm">현재 기분:</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
              {moodState.currentMood === 'happy' ? '😊 행복' :
               moodState.currentMood === 'sad' ? '😢 슬픔' :
               moodState.currentMood === 'angry' ? '😠 화남' :
               moodState.currentMood === 'excited' ? '🤩 흥분' :
               moodState.currentMood === 'nervous' ? '😰 긴장' :
               moodState.currentMood === 'romantic' ? '😍 로맨틱' : '😌 평온'}
            </span>
          </div>
        </div>

        {/* Interaction Mode Toggle */}
        <div className="mode-toggle bg-gray-100 p-3 border-b">
          <div className="flex space-x-2">
            <button
              onClick={() => setInteractionType('quick')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                interactionType === 'quick'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              빠른 상호작용
            </button>
            <button
              onClick={() => setInteractionType('detailed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                interactionType === 'detailed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              자세한 상호작용
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area p-6">
          {/* Character Dialogue */}
          <div className="character-dialogue bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
            <p className="text-gray-800 italic">"{currentDialogue}"</p>
          </div>

          {interactionType === 'quick' ? (
            /* Quick Interactions */
            <div className="quick-interactions">
              <h3 className="font-semibold text-gray-700 mb-4">상호작용 선택:</h3>
              <div className="interaction-grid grid grid-cols-2 gap-3">
                {availableInteractions.map(interaction => (
                  <button
                    key={interaction.id}
                    onClick={() => handleQuickInteraction(interaction)}
                    className="interaction-btn bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg p-4 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{interaction.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-purple-800">{interaction.label}</div>
                        <div className="text-sm text-gray-600">{interaction.description}</div>
                        <div className="text-xs text-green-600 mt-1">호감도 +{interaction.affectionBoost}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Special Actions */}
              <div className="special-actions mt-6 space-y-3">
                {canConfess(characterId) && (
                  <button
                    onClick={() => setShowRomanceHub(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all"
                  >
                    💖 고백하기 (로맨틱 텐션이 충분합니다!)
                  </button>
                )}

                <button
                  onClick={() => setShowRomanceHub(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                >
                  🌟 더 깊은 상호작용 (로맨스 허브 열기)
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Interactions */
            <div className="detailed-interactions">
              <div className="interaction-categories space-y-4">
                <div className="category">
                  <h4 className="font-semibold text-purple-700 mb-2">대화 주제</h4>
                  <div className="topic-grid grid grid-cols-2 gap-2">
                    {['날씨', '취미', '학교', '꿈', '과거', '미래'].map(topic => (
                      <button
                        key={topic}
                        onClick={() => {
                          const response = selectContextualResponse(characterId, 'mood_dialogues', moodState.currentMood);
                          setCurrentDialogue(`${topic}에 대해: ${response}`);
                          actions.updateAffection(characterId, 2);
                        }}
                        className="topic-btn bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-3 rounded text-sm transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="category">
                  <h4 className="font-semibold text-purple-700 mb-2">활동 제안</h4>
                  <div className="activity-grid grid grid-cols-2 gap-2">
                    {['공부', '운동', '산책', '게임', '요리', '독서'].map(activity => (
                      <button
                        key={activity}
                        onClick={() => {
                          const response = selectContextualResponse(characterId, 'activity_responses', activity.toLowerCase());
                          setCurrentDialogue(response);
                          actions.updateAffection(characterId, 4);
                        }}
                        className="activity-btn bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded text-sm transition-colors"
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {relationshipStage.status !== 'stranger' && (
                  <div className="category">
                    <h4 className="font-semibold text-purple-700 mb-2">로맨틱 행동</h4>
                    <div className="romantic-grid grid grid-cols-2 gap-2">
                      {['칭찬하기', '관심 표현', '미소 짓기', '눈 마주치기'].map(action => (
                        <button
                          key={action}
                          onClick={() => {
                            const response = selectContextualResponse(characterId, 'mood_dialogues', 'love');
                            setCurrentDialogue(response);
                            actions.updateAffection(characterId, 6);
                          }}
                          className="romantic-btn bg-pink-100 hover:bg-pink-200 text-pink-800 py-2 px-3 rounded text-sm transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="progress-area bg-gray-50 p-4">
          <div className="progress-bars space-y-2">
            <div className="affection-progress">
              <div className="flex justify-between text-sm mb-1">
                <span>호감도</span>
                <span>{affection}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{width: `${affection}%`}}
                />
              </div>
            </div>

            <div className="tension-progress">
              <div className="flex justify-between text-sm mb-1">
                <span>로맨틱 텐션</span>
                <span>{romanticTension}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{width: `${romanticTension}%`}}
                />
              </div>
            </div>
          </div>

          {/* Relationship Stage Indicator */}
          <div className="relationship-stage mt-3 text-center">
            <span className="text-sm text-gray-600">관계 단계: </span>
            <span className="font-semibold text-purple-700">{relationshipStage.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced location interface with romance integration
export const EnhancedLocationInterface: React.FC<{
  location: string;
}> = ({ location }) => {
  const { player, metCharacters } = useGameStore();
  const [randomEncounter, setRandomEncounter] = useState<string | null>(null);

  const {
    checkForStoryEventTriggers
  } = useStoryEvents();

  // Check for random character encounters based on location and time
  useEffect(() => {
    if (Math.random() < 0.3 && metCharacters.length > 0) { // 30% chance
      const randomCharacter = metCharacters[Math.floor(Math.random() * metCharacters.length)];

      // Check if story event is triggered
      const storyEvent = checkForStoryEventTriggers(randomCharacter);
      if (storyEvent) {
        setRandomEncounter(randomCharacter);
      }
    }
  }, [location, player.timeOfDay]);

  const locationDescriptions: Record<string, string> = {
    classroom: '밝은 햇살이 들어오는 교실. 학생들의 웃음소리가 들린다.',
    library: '조용하고 평화로운 도서관. 책 냄새가 은은하게 퍼진다.',
    garden: '아름다운 꽃들이 피어있는 학교 정원. 로맨틱한 분위기가 물씬.',
    cafeteria: '맛있는 음식 냄새가 나는 카페테리아. 학생들이 즐겁게 대화중.',
    dormitory: '편안한 기숙사. 휴식을 취하기 좋은 곳이다.',
    training_ground: '넓은 훈련장. 운동하는 학생들을 볼 수 있다.'
  };

  const locationMood = location === 'garden' ? 'romantic' :
                     location === 'library' ? 'calm' :
                     location === 'training_ground' ? 'energetic' : 'neutral';

  return (
    <div className="enhanced-location bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg shadow-lg">
      <div className="location-info mb-4">
        <h3 className="text-xl font-bold text-purple-800 mb-2">{location}</h3>
        <p className="text-gray-700">{locationDescriptions[location]}</p>

        {/* Location mood indicator */}
        <div className="location-mood mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-600">분위기:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            locationMood === 'romantic' ? 'bg-pink-100 text-pink-800' :
            locationMood === 'calm' ? 'bg-blue-100 text-blue-800' :
            locationMood === 'energetic' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {locationMood === 'romantic' ? '💕 로맨틱' :
             locationMood === 'calm' ? '😌 평온' :
             locationMood === 'energetic' ? '⚡ 활기찬' : '😐 평범'}
          </span>
        </div>
      </div>

      {/* Characters present at location */}
      {metCharacters.length > 0 && (
        <div className="characters-present">
          <h4 className="font-semibold text-gray-700 mb-2">이곳에서 만날 수 있는 사람들:</h4>
          <div className="character-list flex flex-wrap gap-2">
            {metCharacters.slice(0, 3).map((characterId: string) => {
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

              return (
                <span
                  key={characterId}
                  className="character-tag bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                >
                  {characterNames[characterId] || characterId}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Random encounter notification */}
      {randomEncounter && (
        <div className="random-encounter mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✨</span>
            <span className="font-medium text-yellow-800">
              특별한 만남이 기다리고 있습니다!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  EnhancedCharacterInteraction,
  EnhancedLocationInterface
};