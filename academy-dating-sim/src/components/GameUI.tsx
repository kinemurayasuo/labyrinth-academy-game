import React from 'react';
import type { Player, Character, Location } from '../types/game';
import StatusBar from './StatusBar';
import LocationView from './LocationView';
import CharacterInteraction from './CharacterInteraction';
import EventDialog from './EventDialog';
import Inventory from './Inventory';
import HeroineCharacterCards from './HeroineCharacterCards';
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
  const [showInventory, setShowInventory] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<'location' | 'characters'>('location');
  const [showDungeonEntry, setShowDungeonEntry] = React.useState(false);
  const [showCharacterCards, setShowCharacterCards] = React.useState(false);
  const [showHeroineEvents, setShowHeroineEvents] = React.useState(false);
  const [selectedHeroine, setSelectedHeroine] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Academy Dating Simulator
            </h1>
            <div className="flex gap-2">
              <button
                onClick={onSaveGame}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                💾 저장
              </button>
              <button
                onClick={onLoadGame}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                📂 불러오기
              </button>
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                🎒 인벤토리
              </button>
              <button
                onClick={() => setShowDungeonEntry(!showDungeonEntry)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition animate-pulse"
              >
                ⚔️ 던전 입장
              </button>
              <button
                onClick={() => setShowCharacterCards(!showCharacterCards)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                👥 캐릭터 카드
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar player={player} />

        {/* Game Message */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p className="font-medium">{gameMessage}</p>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Location/Characters */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedTab('location')}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedTab === 'location'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  📍 현재 장소
                </button>
                <button
                  onClick={() => setSelectedTab('characters')}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedTab === 'characters'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
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

          {/* Right Panel - Navigation & Time */}
          <div className="space-y-4">
            {/* Location Navigation */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3">🗺️ 이동하기</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(locations).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => onMoveLocation(loc.id)}
                    disabled={player.location === loc.id}
                    className={`p-3 rounded-lg transition text-sm ${
                      player.location === loc.id
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500'
                    }`}
                  >
                    {loc.sprite} {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Control */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3">⏰ 시간</h3>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  Day {player.day} - {getTimeEmoji(player.timeOfDay)} {getTimeKorean(player.timeOfDay)}
                </div>
                <button
                  onClick={onAdvanceTime}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition"
                >
                  ⏭️ 시간 진행
                </button>
              </div>
            </div>

            {/* Character Affection */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3">💕 호감도</h3>
              <div className="space-y-2">
                {Object.entries(player.affection).map(([charId, affection]) => {
                  const character = characters[charId];
                  if (!character || !unlockedCharacters.includes(charId)) return null;

                  return (
                    <div key={charId} className="flex items-center gap-2">
                      <span className="text-2xl">{character.sprite}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{character.name}</span>
                          <span>{affection}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-400 to-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${affection}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Dialog */}
        {currentEvent && (
          <EventDialog
            event={currentEvent}
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
          <Inventory
            player={player}
            items={{}}
            characters={characters}
            unlockedCharacters={unlockedCharacters}
            onUseItem={onUseItem}
            onClose={() => setShowInventory(false)}
          />
        )}

        {/* Dungeon Entry Modal */}
        {showDungeonEntry && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-red-900 rounded-lg p-6 max-w-md w-full border border-red-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  ⚔️ 던전 입장
                </h2>
                <button
                  onClick={() => setShowDungeonEntry(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-white">
                <p className="text-gray-300">
                  위험한 던전에 입장하시겠습니까? 몬스터와의 전투가 있을 수 있습니다.
                </p>

                <div className="bg-red-800/30 p-3 rounded border border-red-600/50">
                  <div className="text-sm text-red-300 mb-2">현재 상태:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>체력: {player.hp}/{player.maxHp}</div>
                    <div>마나: {player.mp}/{player.maxMp}</div>
                    <div>레벨: {player.level}</div>
                    <div>층수: {player.dungeonProgress.currentFloor}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDungeonEntry(false);
                      // Navigate to dungeon - this would be handled by parent component
                      console.log('Entering dungeon...');
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition"
                  >
                    입장하기
                  </button>
                  <button
                    onClick={() => setShowDungeonEntry(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Character Cards Modal */}
        {showCharacterCards && (
          <HeroineCharacterCards
            characters={characters}
            player={player}
            unlockedCharacters={unlockedCharacters}
            onClose={() => setShowCharacterCards(false)}
            onInteract={(characterId) => {
              setShowCharacterCards(false);
              setSelectedHeroine(characterId);
              setShowHeroineEvents(true);
            }}
          />
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