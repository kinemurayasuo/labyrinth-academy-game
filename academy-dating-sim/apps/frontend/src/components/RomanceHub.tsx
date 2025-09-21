import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { RomanceSystem, useRomanceSystem } from '../systems/RomanceSystem';
import { useStoryEvents, StoryEventDisplay, CharacterBackstoryDisplay } from '../systems/StoryEvents';
import {
  useDateSystem,
  DatePlanningInterface,
  DateExecutionInterface,
  DateResultsDisplay,
  DatePlan,
  DateResults
} from '../systems/DateLocations';
import {
  useCharacterMemory,
  EmotionalStateDisplay,
  MemoryDisplay
} from '../systems/CharacterMemory';
import {
  useAdvancedDialogue,
  DialogueInterface,
  QuickDialogue
} from '../systems/DialogueSystem';

interface RomanceHubProps {
  characterId: string;
  onClose: () => void;
}

export const RomanceHub: React.FC<RomanceHubProps> = ({ characterId, onClose }) => {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'dialogue' | 'story' | 'dating' | 'memory'>('overview');
  const [showStoryEvent, setShowStoryEvent] = useState(false);
  const [currentStoryEvent, setCurrentStoryEvent] = useState<any>(null);
  const [showDatePlanning, setShowDatePlanning] = useState(false);
  const [showDateExecution, setShowDateExecution] = useState(false);
  const [currentDatePlan, setCurrentDatePlan] = useState<DatePlan | null>(null);
  const [dateResults, setDateResults] = useState<DateResults | null>(null);
  const [showQuickDialogue, setShowQuickDialogue] = useState(false);
  const [quickDialogueCategory, setQuickDialogueCategory] = useState<string>('greetings');

  // Hooks
  const {
    getRelationshipStage,
    calculateRomanticTension,
    canConfess,
    triggerJealousy,
    addRomanceMemory
  } = useRomanceSystem();

  const {
    checkForStoryEventTriggers,
    handleEventChoice,
    getCurrentSeason
  } = useStoryEvents();

  const {
    planDate,
    executeDate,
    getDateSuggestions,
    getDateHistory
  } = useDateSystem();

  const {
    getCharacterEmotionalState,
    getCharacterMoodState,
    getRecentMemories,
    getStrongestMemories
  } = useCharacterMemory();

  const {
    currentDialogueTree,
    getCurrentDialogueNode,
    startDialogueTree
  } = useAdvancedDialogue();

  // Character data
  const relationshipStage = getRelationshipStage(characterId);
  const romanticTension = calculateRomanticTension(characterId);
  const affection = player.affection[characterId] || 0;
  const emotionalState = getCharacterEmotionalState(characterId);
  const moodState = getCharacterMoodState(characterId);
  const recentMemories = getRecentMemories(characterId, 3);
  const strongestMemories = getStrongestMemories(characterId, 3);
  const dateHistory = getDateHistory(characterId);
  const dateSuggestions = getDateSuggestions(characterId);

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

  // Check for triggered story events
  useEffect(() => {
    const storyEvent = checkForStoryEventTriggers(characterId);
    if (storyEvent && !showStoryEvent) {
      setCurrentStoryEvent(storyEvent);
      setShowStoryEvent(true);
    }
  }, [characterId, checkForStoryEventTriggers]);

  // Handle story event choice
  const handleStoryEventChoice = (choiceIndex: number) => {
    if (currentStoryEvent) {
      handleEventChoice(characterId, currentStoryEvent, choiceIndex);
      setShowStoryEvent(false);
      setCurrentStoryEvent(null);
    }
  };

  // Handle date planning
  const handleDatePlanned = (datePlan: DatePlan) => {
    setCurrentDatePlan(datePlan);
    setShowDatePlanning(false);
    setShowDateExecution(true);
  };

  // Handle date completion
  const handleDateComplete = (results: DateResults) => {
    setDateResults(results);
    setShowDateExecution(false);
    setCurrentDatePlan(null);

    // Add memory of the date
    addRomanceMemory(characterId, {
      characterId,
      title: `데이트: ${results.overallSuccess ? '성공' : '아쉬움'}`,
      description: `총 호감도 +${results.totalAffectionGained}, 로맨틱 텐션 +${results.totalRomanticTensionGained}`,
      type: 'date',
      emotionalWeight: results.totalAffectionGained
    });
  };

  // Handle confession attempt
  const handleConfessionAttempt = () => {
    if (canConfess(characterId)) {
      // Create confession story event
      const confessionEvent = {
        id: `confession_${characterId}`,
        title: `${characterName}에게 고백하기`,
        description: `용기를 내어 ${characterName}에게 마음을 전해보세요.`,
        choices: [
          {
            text: '사랑한다고 고백한다',
            outcomes: {
              affection: 20,
              relationshipChange: '연인이 되다',
              unlocks: ['confession_accepted']
            }
          },
          {
            text: '조심스럽게 마음을 표현한다',
            outcomes: {
              affection: 12,
              relationshipChange: '더 가까워지다',
              unlocks: ['gentle_confession']
            }
          },
          {
            text: '아직은 때가 아닌 것 같다',
            outcomes: {
              affection: 0,
              relationshipChange: '현상 유지',
              unlocks: ['confession_delayed']
            }
          }
        ],
        isConfessionEvent: true
      };

      setCurrentStoryEvent(confessionEvent);
      setShowStoryEvent(true);
    }
  };

  // Quick interaction functions
  const handleQuickInteraction = (category: string, subcategory?: string) => {
    setQuickDialogueCategory(category);
    setShowQuickDialogue(true);

    // Small affection boost for interactions
    const affectionBoost = Math.floor(Math.random() * 3) + 1;
    // This would be handled by the game store's updateAffection method
  };

  const TabButton: React.FC<{ tab: string; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeTab === tab
          ? 'bg-purple-600 text-white shadow-md'
          : 'bg-white text-purple-600 hover:bg-purple-50'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="romance-hub fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="romance-container bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="header bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="character-avatar w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                <span className="text-3xl">
                  {characterId === 'sakura' ? '🗡️' :
                   characterId === 'yuki' ? '❄️' :
                   characterId === 'luna' ? '🌙' :
                   characterId === 'mystery' ? '🌟' :
                   characterId === 'akane' ? '👑' :
                   characterId === 'hana' ? '🌸' :
                   characterId === 'rin' ? '🏃‍♀️' :
                   characterId === 'mei' ? '🎨' :
                   characterId === 'sora' ? '🔬' : '✨'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{characterName}</h1>
                <p className="text-purple-100">{relationshipStage.name} • {relationshipStage.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats grid grid-cols-3 gap-4 mt-4">
            <div className="stat-card bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{affection}</div>
              <div className="text-sm">호감도</div>
            </div>
            <div className="stat-card bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{romanticTension}</div>
              <div className="text-sm">로맨틱 텐션</div>
            </div>
            <div className="stat-card bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{recentMemories.length}</div>
              <div className="text-sm">추억</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation bg-gray-100 p-4 border-b">
          <div className="flex space-x-2 overflow-x-auto">
            <TabButton tab="overview" label="개요" icon="📊" />
            <TabButton tab="dialogue" label="대화" icon="💬" />
            <TabButton tab="story" label="스토리" icon="📖" />
            <TabButton tab="dating" label="데이트" icon="💕" />
            <TabButton tab="memory" label="추억" icon="🎭" />
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area p-6 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
          {activeTab === 'overview' && (
            <div className="overview-tab grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Romance System Display */}
              <div className="romance-overview">
                <RomanceSystem characterId={characterId} />
              </div>

              {/* Emotional State */}
              <div className="emotional-overview">
                <EmotionalStateDisplay characterId={characterId} />
              </div>

              {/* Quick Actions */}
              <div className="quick-actions bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-lg shadow-lg col-span-full">
                <h3 className="text-lg font-bold text-purple-800 mb-4">빠른 상호작용</h3>
                <div className="action-grid grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleQuickInteraction('greetings', player.timeOfDay)}
                    className="action-btn bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-lg p-3 transition-all"
                  >
                    <div className="text-2xl mb-1">👋</div>
                    <div className="text-sm font-medium">인사하기</div>
                  </button>

                  <button
                    onClick={() => setShowDatePlanning(true)}
                    disabled={dateSuggestions.length === 0}
                    className="action-btn bg-white hover:bg-pink-50 border-2 border-pink-200 rounded-lg p-3 transition-all disabled:opacity-50"
                  >
                    <div className="text-2xl mb-1">💝</div>
                    <div className="text-sm font-medium">데이트 계획</div>
                  </button>

                  {canConfess(characterId) && (
                    <button
                      onClick={handleConfessionAttempt}
                      className="action-btn bg-white hover:bg-red-50 border-2 border-red-200 rounded-lg p-3 transition-all"
                    >
                      <div className="text-2xl mb-1">💖</div>
                      <div className="text-sm font-medium">고백하기</div>
                    </button>
                  )}

                  <button
                    onClick={() => handleQuickInteraction('mood_dialogues', moodState.currentMood)}
                    className="action-btn bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg p-3 transition-all"
                  >
                    <div className="text-2xl mb-1">🎭</div>
                    <div className="text-sm font-medium">기분 살피기</div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity bg-gray-50 p-4 rounded-lg col-span-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">최근 활동</h3>
                {recentMemories.length > 0 ? (
                  <div className="space-y-2">
                    {recentMemories.slice(0, 3).map((memory: any) => (
                      <div key={memory.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                        <span className="text-xl">
                          {memory.type === 'date' ? '💕' :
                           memory.type === 'conversation' ? '💬' :
                           memory.type === 'gift' ? '🎁' : '✨'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{memory.title}</div>
                          <div className="text-xs text-gray-600">{new Date(memory.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-sm font-medium ${memory.emotionalWeight > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {memory.emotionalWeight > 0 ? '+' : ''}{memory.emotionalWeight}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    아직 함께한 추억이 없습니다. 상호작용을 시작해보세요!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dialogue' && (
            <div className="dialogue-tab">
              <div className="dialogue-options grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => handleQuickInteraction('greetings', player.timeOfDay)}
                  className="dialogue-option bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">👋</div>
                  <div className="font-semibold text-purple-800">인사</div>
                  <div className="text-sm text-gray-600">시간대별 인사 나누기</div>
                </button>

                <button
                  onClick={() => handleQuickInteraction('mood_dialogues', moodState.currentMood)}
                  className="dialogue-option bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🎭</div>
                  <div className="font-semibold text-blue-800">기분 대화</div>
                  <div className="text-sm text-gray-600">현재 기분에 맞는 대화</div>
                </button>

                <button
                  onClick={() => handleQuickInteraction('activity_responses', 'study')}
                  className="dialogue-option bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-semibold text-green-800">활동 대화</div>
                  <div className="text-sm text-gray-600">함께할 활동에 대해 이야기</div>
                </button>

                <button
                  onClick={() => handleQuickInteraction('weather_reactions', getCurrentSeason())}
                  className="dialogue-option bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🌤️</div>
                  <div className="font-semibold text-orange-800">날씨 대화</div>
                  <div className="text-sm text-gray-600">날씨와 계절에 대한 대화</div>
                </button>

                {relationshipStage.status !== 'stranger' && (
                  <button
                    onClick={() => handleQuickInteraction('relationship_milestones', affection.toString())}
                    className="dialogue-option bg-gradient-to-br from-pink-100 to-red-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-2">💝</div>
                    <div className="font-semibold text-red-800">관계 대화</div>
                    <div className="text-sm text-gray-600">관계에 대한 깊은 대화</div>
                  </button>
                )}

                {emotionalState.love > 50 && (
                  <button
                    onClick={() => handleQuickInteraction('mood_dialogues', 'love')}
                    className="dialogue-option bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-2">💕</div>
                    <div className="font-semibold text-red-800">사랑 대화</div>
                    <div className="text-sm text-gray-600">사랑에 대한 이야기</div>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'story' && (
            <div className="story-tab">
              <CharacterBackstoryDisplay characterId={characterId} />
            </div>
          )}

          {activeTab === 'dating' && (
            <div className="dating-tab space-y-6">
              {/* Date Suggestions */}
              <div className="date-suggestions">
                <h3 className="text-xl font-bold text-purple-800 mb-4">데이트 제안</h3>
                {dateSuggestions.length > 0 ? (
                  <div className="suggestions-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dateSuggestions.slice(0, 4).map(({ location, activities }) => (
                      <div key={location.id} className="suggestion-card bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-lg shadow">
                        <h4 className="font-bold text-purple-800 mb-2">{location.name}</h4>
                        <p className="text-sm text-gray-700 mb-3">{location.description}</p>
                        <div className="activities mb-3">
                          <div className="text-sm font-medium text-purple-700">이용 가능한 활동:</div>
                          <div className="text-xs text-gray-600">
                            {activities.slice(0, 3).map(act => act.name).join(', ')}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-600">{location.costPerHour}원/시간</span>
                          <button
                            onClick={() => setShowDatePlanning(true)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                          >
                            계획하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    아직 데이트할 수 있는 관계가 아닙니다. 더 친해져 보세요!
                  </div>
                )}
              </div>

              {/* Date History */}
              <div className="date-history">
                <h3 className="text-xl font-bold text-purple-800 mb-4">데이트 기록</h3>
                {dateHistory.length > 0 ? (
                  <div className="history-list space-y-3">
                    {dateHistory.slice(-5).map((date: DatePlan) => (
                      <div key={date.id} className="history-item bg-white p-4 rounded-lg shadow border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-purple-800">
                              {dateSuggestions.find(s => s.location.id === date.locationId)?.location.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(date.plannedDate).toLocaleDateString()} • {date.activities.length}개 활동
                            </div>
                            {date.results && (
                              <div className="text-sm text-green-600 mt-1">
                                호감도 +{date.results.totalAffectionGained} | 로맨틱 텐션 +{date.results.totalRomanticTensionGained}
                              </div>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            date.results?.overallSuccess
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {date.results?.overallSuccess ? '성공' : '아쉬움'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    아직 데이트 기록이 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="memory-tab grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MemoryDisplay characterId={characterId} />

              <div className="memory-analysis bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-indigo-800 mb-4">추억 분석</h3>

                <div className="analysis-stats space-y-3">
                  <div className="stat-item flex justify-between">
                    <span className="text-indigo-700">총 추억 수:</span>
                    <span className="font-bold">{recentMemories.length + strongestMemories.length}</span>
                  </div>

                  <div className="stat-item flex justify-between">
                    <span className="text-indigo-700">긍정적 추억:</span>
                    <span className="font-bold text-green-600">
                      {[...recentMemories, ...strongestMemories].filter((m: any) => m.emotionalWeight > 0).length}
                    </span>
                  </div>

                  <div className="stat-item flex justify-between">
                    <span className="text-indigo-700">부정적 추억:</span>
                    <span className="font-bold text-red-600">
                      {[...recentMemories, ...strongestMemories].filter((m: any) => m.emotionalWeight < 0).length}
                    </span>
                  </div>

                  <div className="stat-item flex justify-between">
                    <span className="text-indigo-700">가장 강한 추억:</span>
                    <span className="font-bold">
                      {strongestMemories[0] ? Math.abs(strongestMemories[0].emotionalWeight) : 0}
                    </span>
                  </div>
                </div>

                <div className="memory-types mt-4">
                  <h4 className="font-semibold text-indigo-700 mb-2">추억 유형별 분포:</h4>
                  <div className="type-list space-y-1">
                    {['conversation', 'date', 'gift', 'activity'].map(type => {
                      const count = [...recentMemories, ...strongestMemories].filter((m: any) => m.type === type).length;
                      return (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type}:</span>
                          <span>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      {showStoryEvent && currentStoryEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <StoryEventDisplay
            event={currentStoryEvent}
            characterId={characterId}
            onChoiceSelect={handleStoryEventChoice}
          />
        </div>
      )}

      {showDatePlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setShowDatePlanning(false)}
              className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 z-10"
            >
              ✕
            </button>
            <DatePlanningInterface
              characterId={characterId}
              onDatePlanned={handleDatePlanned}
            />
          </div>
        </div>
      )}

      {showDateExecution && currentDatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <DateExecutionInterface
            datePlan={currentDatePlan}
            onDateComplete={handleDateComplete}
          />
        </div>
      )}

      {dateResults && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-2xl w-full mx-4">
            <button
              onClick={() => setDateResults(null)}
              className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 z-10"
            >
              ✕
            </button>
            <DateResultsDisplay
              results={dateResults}
              characterId={characterId}
            />
          </div>
        </div>
      )}

      {showQuickDialogue && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <QuickDialogue
            characterId={characterId}
            category={quickDialogueCategory}
            onClose={() => setShowQuickDialogue(false)}
          />
        </div>
      )}

      {currentDialogueTree && (
        <DialogueInterface
          characterId={characterId}
          onDialogueEnd={() => {
            // Handle dialogue end
          }}
        />
      )}
    </div>
  );
};

export default RomanceHub;