import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player, Character, Location } from '../types/game';
import StatusBar from './StatusBar';
import LocationView from './LocationView';
import CharacterInteraction from './CharacterInteraction';
import VisualNovelDialog from './VisualNovelDialog';
import Inventory from './Inventory';
import HeroineEvents from './HeroineEvents';

interface GameUIProps {
  player: Player;
  characters: Record<string, Character>;
  locations: Record<string, Location>;
  unlockedCharacters: string[];
  currentLocation: Location;
  gameMessage: string;
  currentEvent: any;
  onMoveLocation: (locationId: string) => void;
  onPerformActivity: (activity: string) => void;
  onAdvanceTime: () => void;
  onHandleEventChoice: (event: any, choiceIndex: number) => void;
  onTalkToCharacter: (characterId: string) => void;
  onUseItem: (itemId: string, targetCharacter?: string) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  player,
  characters,
  locations,
  unlockedCharacters,
  currentLocation,
  gameMessage,
  currentEvent,
  onMoveLocation,
  onPerformActivity,
  onAdvanceTime,
  onHandleEventChoice,
  onTalkToCharacter: _onTalkToCharacter,
  onUseItem,
  onSaveGame,
  onLoadGame,
}) => {
  const navigate = useNavigate();
  const [showInventory, setShowInventory] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<'location' | 'characters'>('location');
  const [showHeroineEvents, setShowHeroineEvents] = React.useState(false);
  const [selectedHeroine, setSelectedHeroine] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                🎓
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Academy Dating Simulator
                </h1>
                <p className="text-gray-600 text-sm">라비린스 아카데미에 오신 것을 환영합니다</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/characters')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                👥 캐릭터
              </button>
              <button
                onClick={() => navigate('/dungeon')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ⚔️ 던전
              </button>
              <div className="border-l border-gray-300 mx-2 h-10"></div>
              <button
                onClick={onSaveGame}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                💾 저장
              </button>
              <button
                onClick={onLoadGame}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                📂 불러오기
              </button>
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🎒 인벤토리
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar player={player} />

        {/* Game Message */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm">
              💭
            </div>
            <p className="font-medium text-amber-800 flex-1">{gameMessage}</p>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Location/Characters */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Tab Navigation */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedTab('location')}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    selectedTab === 'location'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                  }`}
                >
                  📍 현재 장소
                </button>
                <button
                  onClick={() => setSelectedTab('characters')}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    selectedTab === 'characters'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                  }`}
                >
                  👥 캐릭터
                </button>
              </div>

              {/* Tab Content */}
              {selectedTab === 'location' ? (
                <LocationView
                  currentLocation={currentLocation}
                  player={player}
                  onPerformActivity={onPerformActivity}
                  onMoveToLocation={onMoveLocation}
                  availableLocations={locations}
                />
              ) : (
                <CharacterInteraction
                  characters={characters}
                  unlockedCharacters={unlockedCharacters}
                  player={player}
                  items={{}}
                  onUseItem={onUseItem}
                  onUpdateAffection={(character: string, amount: number) => {
                    // Handle affection update here
                    console.log(`Updating affection for ${character} by ${amount}`);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Time & Stats */}
          <div className="space-y-6">
            {/* Time Control */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm">
                  ⏰
                </div>
                <h3 className="text-lg font-bold text-gray-800">시간</h3>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    Day {player.day}
                  </div>
                  <div className="text-lg text-gray-600">
                    {getTimeEmoji(player.timeOfDay)} {getTimeKorean(player.timeOfDay)}
                  </div>
                </div>
                <button
                  onClick={onAdvanceTime}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  ⏭️ 시간 진행
                </button>
              </div>
            </div>

            {/* Character Affection */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm">
                  💕
                </div>
                <h3 className="text-lg font-bold text-gray-800">호감도</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(player.affection).map(([charId, affection]) => {
                  const character = characters[charId];
                  if (!character || !unlockedCharacters.includes(charId)) return null;

                  return (
                    <div key={charId} className="bg-gradient-to-r from-pink-25 to-rose-25 rounded-xl p-3 border border-pink-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{character.sprite}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800">{character.name}</span>
                            <span className="text-sm font-bold text-pink-600">{affection}/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-400 to-rose-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${affection}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Novel Style Event Dialog */}
        {currentEvent && (
          <VisualNovelDialog
            event={currentEvent}
            character={currentEvent.trigger.character ? characters[currentEvent.trigger.character] : undefined}
            player={player}
            onChoice={onHandleEventChoice}
            onClose={() => {
              // Handle closing event dialog
              console.log('Closing event dialog');
            }}
          />
        )}

        {/* Inventory Modal */}
        {showInventory && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">🎒 인벤토리</h2>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <Inventory
                  player={player}
                  characters={characters}
                  unlockedCharacters={unlockedCharacters}
                  onUseItem={onUseItem}
                  onClose={() => setShowInventory(false)}
                />
              </div>
            </div>
          </div>
        )}



        {/* Heroine Events Modal */}
        {showHeroineEvents && selectedHeroine && characters[selectedHeroine] && (
          <HeroineEvents
            character={characters[selectedHeroine]}
            player={player}
            onEventComplete={(effects) => {
              // Handle event effects
              if (effects.affection) {
                Object.entries(effects.affection).forEach(([charId, amount]) => {
                  // This would update affection through parent component
                  console.log(`Updating affection for ${charId} by ${amount}`);
                });
              }
              if (effects.stats) {
                // Handle stat updates
                console.log('Updating stats:', effects.stats);
              }
              if (effects.money) {
                // Handle money changes
                console.log('Money change:', effects.money);
              }
              if (effects.item) {
                // Handle item addition
                console.log('Adding item:', effects.item);
              }

              setShowHeroineEvents(false);
              setSelectedHeroine(null);
            }}
            onClose={() => {
              setShowHeroineEvents(false);
              setSelectedHeroine(null);
            }}
          />
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