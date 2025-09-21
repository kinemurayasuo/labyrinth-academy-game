import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import StatusBar from '../ui/StatusBar';
import LocationView from './LocationView';
import CharacterInteraction from '../character/CharacterInteraction';
import VisualNovelDialog from '../ui/VisualNovelDialog';
import Inventory from './Inventory';
import HeroineEvents from '../character/HeroineEvents';
import dialogueData from '../../data/dialogues.json';
import charactersData from '../../data/characters.json';
import locationsData from '../../data/locations.json';

// Type assertions for JSON data
const characters = charactersData as Record<string, any>;
const locations = locationsData as { locations: Record<string, any> };

const GameUI: React.FC = () => {
  const navigate = useNavigate();

  // Use Zustand store
  const player = useGameStore((state: any) => state.player);
  const unlockedCharacters = useGameStore((state: any) => state.unlockedCharacters);
  const currentEvent = useGameStore((state: any) => state.currentEvent);
  const gameMessage = useGameStore((state: any) => state.gameMessage);
  const dailyActivitiesCount = useGameStore((state: any) => state.dailyActivitiesCount || 0);
  const metCharacters = useGameStore((state: any) => state.metCharacters || []);
  const {
    saveGame,
    loadGame,
    performActivity,
    moveToLocation,
    advanceTime,
    handleEventChoice,
    updateAffection
  } = useGameStore((state: any) => state.actions);

  // Memoize current location to prevent unnecessary recalculations
  const currentLocation = useMemo(() => locations.locations[player.location], [player.location]);

  // Component state
  const [showInventory, setShowInventory] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<'location' | 'characters'>('location');
  const [showHeroineEvents, setShowHeroineEvents] = React.useState(false);
  const [selectedHeroine, setSelectedHeroine] = React.useState<string | null>(null);
  const [showCharacterDialog, setShowCharacterDialog] = React.useState(false);
  const [dialogCharacter, setDialogCharacter] = React.useState<string | null>(null);
  const [currentDialogueIndex, setCurrentDialogueIndex] = React.useState(0);
  const [currentConversation, setCurrentConversation] = React.useState<any>(null);
  const [showChoices, setShowChoices] = React.useState(false);
  const [dialogueText, setDialogueText] = React.useState<string[]>([]);

  const handleCharacterInteraction = useCallback((characterId: string) => {
    const character = characters[characterId];
    if (!character) return;

    // Check if this is the first meeting
    if (!metCharacters.includes(characterId)) {
      // Navigate to initial meeting scene
      navigate(`/character-meeting?character=${characterId}&location=${player.location}`);
      return;
    }

    // Get appropriate conversation based on affection
    const affection = player.affection[characterId] || 0;
    const conversations = (dialogueData as any)[characterId]?.conversations || [];

    // Find the best matching conversation
    let bestConversation = conversations[0];
    for (const conv of conversations) {
      if (conv.requiredAffection <= affection) {
        bestConversation = conv;
      } else {
        break;
      }
    }

    if (bestConversation) {
      setCurrentConversation(bestConversation);
      setDialogueText(bestConversation.dialogue);
      setCurrentDialogueIndex(0);
      setShowChoices(false);
    }

    setDialogCharacter(characterId);
    setShowCharacterDialog(true);
  }, [player.affection]);

  const handleDialogueNext = useCallback(() => {
    if (!currentConversation) {
        setShowCharacterDialog(false);
        setDialogCharacter(null);
        return;
    }

    if (showChoices) {
        // Already showing choices
        return;
    }

    if (currentDialogueIndex < dialogueText.length - 1) {
        // More dialogue to show
        setCurrentDialogueIndex(prev => prev + 1);
    } else if (currentConversation.choices && currentConversation.choices.length > 0) {
        // Show choices at the end
        setShowChoices(true);
    } else {
        // End of conversation without choices
        if (currentConversation.effects?.affection && dialogCharacter) {
            updateAffection(dialogCharacter, currentConversation.effects.affection);
        }
        setShowCharacterDialog(false);
        setDialogCharacter(null);
        setCurrentDialogueIndex(0);
        setCurrentConversation(null);
        setDialogueText([]);
    }
  }, [currentConversation, currentDialogueIndex, dialogueText, showChoices, dialogCharacter, updateAffection]);

  const handleChoice = useCallback((choice: any) => {
    if (choice.effects?.affection && dialogCharacter) {
        updateAffection(dialogCharacter, choice.effects.affection);
    }

    // Set the response dialogue
    if (choice.response) {
        setCurrentConversation(null);
        setDialogueText([choice.response]);
        setCurrentDialogueIndex(0);
        setShowChoices(false);
    } else {
        setShowCharacterDialog(false);
        setDialogCharacter(null);
        setCurrentDialogueIndex(0);
        setCurrentConversation(null);
        setDialogueText([]);
    }
  }, [dialogCharacter, updateAffection]);

  const handleHeroineClick = useCallback((heroineId: string) => {
    navigate('/heroines');
  }, [navigate]);

  // Check if activities are limited (2 per day)
  const canPerformActivity = dailyActivitiesCount < 2;
  const isEvening = player.timeOfDay === 'evening' || player.timeOfDay === 'night';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-text-primary">Labyrinth Academy</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => navigate('/game-menu')}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="게임 메뉴 열기"
                role="button"
              >
                📋 메뉴
              </button>
              <button
                onClick={() => navigate('/heroines')}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="히로인 갤러리"
                role="button"
              >
                💕 히로인 갤러리
              </button>
              <button
                onClick={() => navigate('/dungeon-selection')}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="던전 탐험"
                role="button"
              >
                ⚔️ 던전
              </button>
              <button
                onClick={() => navigate('/quests')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="일일 퀘스트"
                role="button"
              >
                📋 퀘스트
              </button>
              <button
                onClick={() => navigate('/shopping')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="쇼핑"
                role="button"
              >
                🏪 쇼핑
              </button>
              <button
                onClick={() => navigate('/pets')}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="펫 시스템"
                role="button"
              >
                🐾 펫
              </button>
              <button
                onClick={() => navigate('/diary')}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="일기장"
                role="button"
              >
                📖 일기장
              </button>
              <button
                onClick={() => navigate('/heroine-stories')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="히로인 스토리"
                role="button"
              >
                💕 스토리
              </button>
              <div className="border-l border-border mx-2 h-10" aria-hidden="true"></div>
              <button
                onClick={() => navigate('/save-load')}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label="저장 시스템"
                role="button"
              >
                💾 저장/불러오기
              </button>
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                aria-label={showInventory ? "인벤토리 닫기" : "인벤토리 열기"}
                aria-expanded={showInventory}
                role="button"
              >
                🎒 인벤토리
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Game Message */}
        <div className="bg-black/20 border border-border rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
              💭
            </div>
            <p className="font-medium text-text-primary flex-1">{gameMessage}</p>
          </div>
        </div>

        {/* Daily Activity Counter */}
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-2xl">⏳</span>
              <div>
                <p className="font-bold text-yellow-300">오늘의 활동</p>
                <p className="text-sm text-yellow-200">
                  {dailyActivitiesCount}/2 활동 완료
                  {dailyActivitiesCount >= 2 && " - 더 이상 활동할 수 없습니다"}
                </p>
              </div>
            </div>
            <div className="text-yellow-400">
              {isEvening ? "저녁 시간입니다. 휴식하세요." : "활동 가능"}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className={`grid grid-cols-1 ${showInventory ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-6`}>
          {/* Left & Middle Panel Wrapper */}
          <div className={`${showInventory ? 'lg:col-span-3' : 'lg:col-span-3'} grid grid-cols-1 lg:grid-cols-3 gap-6`}>
            {/* Left Panel - Location/Characters */}
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                {/* Tab Navigation */}
                <div className="flex gap-3 mb-6" role="tablist" aria-label="게임 콘텐츠 탭">
                  <button
                    onClick={() => setSelectedTab('location')}
                    disabled={!canPerformActivity && player.location !== 'dormitory'}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                      selectedTab === 'location'
                        ? 'bg-black/50 backdrop-blur-md text-text-primary shadow-lg transform scale-105 border border-primary/50'
                        : !canPerformActivity && player.location !== 'dormitory'
                        ? 'bg-black/30 backdrop-blur-md text-gray-500 opacity-50 cursor-not-allowed border border-border'
                        : 'bg-black/30 backdrop-blur-md hover:bg-black/40 text-text-secondary hover:scale-105 border border-border'
                    }`}
                    role="tab"
                    aria-selected={selectedTab === 'location'}
                    aria-controls="location-panel"
                    tabIndex={selectedTab === 'location' ? 0 : -1}
                  >
                    📍 현재 장소
                  </button>
                  <button
                    onClick={() => setSelectedTab('characters')}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                      selectedTab === 'characters'
                        ? 'bg-black/50 backdrop-blur-md text-text-primary shadow-lg transform scale-105 border border-primary/50'
                        : 'bg-black/30 backdrop-blur-md hover:bg-black/40 text-text-secondary hover:scale-105 border border-border'
                    }`}
                    role="tab"
                    aria-selected={selectedTab === 'characters'}
                    aria-controls="characters-panel"
                    tabIndex={selectedTab === 'characters' ? 0 : -1}
                  >
                    👥 캐릭터
                  </button>
                </div>

                {/* Tab Content */}
                <div
                  id={selectedTab === 'location' ? 'location-panel' : 'characters-panel'}
                  role="tabpanel"
                  aria-labelledby={selectedTab === 'location' ? 'location-tab' : 'characters-tab'}
                >
                  {selectedTab === 'location' ? (
                    <LocationView
                      currentLocation={currentLocation}
                      player={player}
                      onPerformActivity={(activity: string) => performActivity(activity, navigate)}
                      onMoveToLocation={(locationId: string) => {
                        // Only allow moving to dormitory if activities are done
                        if (!canPerformActivity && locationId !== 'dormitory') {
                          return;
                        }
                        moveToLocation(locationId);
                      }}
                      availableLocations={locations.locations}
                      characters={characters}
                      onInteractCharacter={handleCharacterInteraction}
                      canPerformActivity={canPerformActivity}
                    />
                  ) : (
                    <CharacterInteraction
                      characters={characters}
                      items={{}}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Time & Stats (Affection section removed) */}
            <div className="space-y-6">
              {/* Time Control */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    ⏰
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">시간</h3>
                </div>
                <div className="text-center">
                  <div className="bg-black/20 rounded-xl p-4 mb-4">
                    <div className="text-2xl font-bold text-text-primary mb-1">
                      Day {player.day}
                    </div>
                    <div className="text-lg text-text-secondary">
                      {getTimeEmoji(player.timeOfDay)} {getTimeKorean(player.timeOfDay)}
                    </div>
                  </div>
                  <button
                    onClick={advanceTime}
                    className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                    aria-label="게임 시간을 다음 시간대로 진행"
                    role="button"
                  >
                    ⏭️ 시간 진행
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm">
                    📊
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">플레이어 상태</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">레벨</span>
                    <span className="font-bold text-yellow-400">Lv.{player.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">골드</span>
                    <span className="font-bold text-green-400">{player.money}G</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">체력</span>
                    <span className="font-bold text-red-400">{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">마나</span>
                    <span className="font-bold text-blue-400">{player.mp}/{player.maxMp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Panel */}
          {showInventory && (
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border h-full">
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
                  <h2 id="inventory-title" className="text-2xl font-bold text-text-primary">🎒 인벤토리</h2>
                  <button
                    onClick={() => setShowInventory(false)}
                    className="text-text-secondary hover:text-text-primary text-2xl"
                    aria-label="인벤토리 창 닫기"
                    role="button"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <Inventory onClose={() => setShowInventory(false)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Novel Style Event Dialog */}
        {currentEvent && (
          <VisualNovelDialog
            event={currentEvent}
            character={currentEvent.trigger.character ? characters[currentEvent.trigger.character] : undefined}
            player={player}
            onChoice={handleEventChoice}
            onClose={() => {
              // Handle closing event dialog
              console.log('Closing event dialog');
            }}
          />
        )}

        {/* Character Dialog Modal */}
        {showCharacterDialog && dialogCharacter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="max-w-4xl w-full mx-4 bg-background/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="text-6xl">{characters[dialogCharacter]?.sprite || '👤'}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      {characters[dialogCharacter]?.name || 'Unknown'}
                    </h2>
                    <div className="text-text-secondary">
                      {characters[dialogCharacter]?.role || ''}
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-6 mb-6 min-h-[150px]">
                  <p className="text-lg text-text-primary leading-relaxed">
                    {dialogueText[currentDialogueIndex] || '...'}
                  </p>
                </div>

                {showChoices && currentConversation?.choices && (
                  <div className="space-y-3 mb-6">
                    {currentConversation.choices.map((choice: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        className="w-full text-left bg-primary/20 hover:bg-primary/30 border border-primary/30 p-4 rounded-lg transition-all duration-200"
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                )}

                {!showChoices && currentConversation && (
                  <button
                    onClick={handleDialogueNext}
                    className="bg-primary hover:bg-secondary px-6 py-2 rounded-full text-white font-medium transition-all duration-200"
                  >
                    {currentDialogueIndex < dialogueText.length - 1 ? '다음' :
                     currentConversation?.choices ? '선택지 보기' : '대화 종료'}
                  </button>
                )}
                {!currentConversation && (
                  <button
                    onClick={() => {
                      setShowCharacterDialog(false);
                      setDialogCharacter(null);
                      setCurrentDialogueIndex(0);
                      setDialogueText([]);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-full text-white font-medium transition-all duration-200"
                  >
                    닫기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getTimeEmoji = (time: string) => {
  const emojis: Record<string, string> = {
    morning: '🌅',
    noon: '☀️',
    afternoon: '🌤️',
    evening: '🌆',
    night: '🌙',
  };
  return emojis[time] || '⏰';
};

const getTimeKorean = (time: string) => {
  const korean: Record<string, string> = {
    morning: '아침',
    noon: '점심',
    afternoon: '오후',
    evening: '저녁',
    night: '밤',
  };
  return korean[time] || time;
};

export default GameUI;