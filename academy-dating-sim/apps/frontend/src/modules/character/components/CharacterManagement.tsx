import React, { useState } from 'react';
import type { Player, Character, Item } from '../types/game';
import CharacterPortrait from './CharacterPortrait';

interface CharacterManagementProps {
  player: Player;
  characters: Record<string, Character>;
  items: Record<string, Item>;
  unlockedCharacters: string[];
  onEquipItem: (itemId: string, slot: string) => void;
  onUnequipItem: (slot: string) => void;
  onClose: () => void;
}

const CharacterManagement: React.FC<CharacterManagementProps> = ({
  player,
  characters,
  items,
  unlockedCharacters,
  onEquipItem: _onEquipItem,
  onUnequipItem,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<'player' | 'heroines'>('player');

  const getEquippedItem = (slot: string) => {
    const itemId = player.equipment[slot as keyof typeof player.equipment];
    return itemId ? items[itemId] : null;
  };

  const getStatDisplay = (statName: string, baseValue: number) => {
    let bonusValue = 0;

    // Calculate equipment bonuses
    Object.values(player.equipment).forEach(itemId => {
      if (itemId && items[itemId]) {
        const item = items[itemId];
        if (item.effect && statName in item.effect) {
          const effectValue = item.effect[statName as keyof typeof item.effect];
          if (typeof effectValue === 'number') {
            bonusValue += effectValue;
          }
        }
      }
    });

    const totalValue = baseValue + bonusValue;

    return (
      <div className="flex items-center gap-2">
        <span className={bonusValue > 0 ? 'text-green-400' : 'text-white'}>
          {totalValue}
        </span>
        {bonusValue > 0 && (
          <span className="text-green-400 text-sm">
            (+{bonusValue})
          </span>
        )}
      </div>
    );
  };

  const getAffinityLevel = (affection: number) => {
    if (affection >= 80) return { level: '연인', color: 'text-pink-400', bg: 'bg-pink-500/20' };
    if (affection >= 60) return { level: '친밀', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (affection >= 40) return { level: '친구', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (affection >= 20) return { level: '지인', color: 'text-green-400', bg: 'bg-green-500/20' };
    return { level: '모름', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-200">캐릭터 관리</h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSelectedTab('player')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedTab === 'player'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-800/40 text-purple-300 hover:bg-purple-700/40'
              }`}
            >
              주인공
            </button>
            <button
              onClick={() => setSelectedTab('heroines')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedTab === 'heroines'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-800/40 text-purple-300 hover:bg-purple-700/40'
              }`}
            >
              히로인들
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedTab === 'player' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Stats */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-purple-800/30 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <CharacterPortrait characterId="hero" size="large" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-200">{player.name}</h3>
                      <div className="text-purple-300">레벨 {player.level}</div>
                      <div className="text-purple-400 text-sm">경험치: {player.experience}/100</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-purple-950/50 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${player.experience % 100}%` }}
                    />
                  </div>

                  {/* HP/MP */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-red-300 mb-1">체력</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-red-950/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                          />
                        </div>
                        <span className="text-red-200 text-sm">{player.hp}/{player.maxHp}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-300 mb-1">마나</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-blue-950/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                            style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                          />
                        </div>
                        <span className="text-blue-200 text-sm">{player.mp}/{player.maxMp}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-purple-800/30 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-200 mb-3">능력치</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-blue-300">🧠 지력</span>
                      {getStatDisplay('intelligence', player.stats.intelligence)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-300">✨ 매력</span>
                      {getStatDisplay('charm', player.stats.charm)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">🏃 체력</span>
                      {getStatDisplay('stamina', player.stats.stamina)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-300">💪 힘</span>
                      {getStatDisplay('strength', player.stats.strength)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300">🏃‍♂️ 민첩</span>
                      {getStatDisplay('agility', player.stats.agility)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-300">🍀 행운</span>
                      {getStatDisplay('luck', player.stats.luck)}
                    </div>
                  </div>
                </div>

                {/* Dungeon Progress */}
                <div className="bg-purple-800/30 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-200 mb-3">던전 진행도</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-300">현재 층</span>
                      <span className="text-white">{player.dungeonProgress.currentFloor}층</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">최고 층</span>
                      <span className="text-white">{player.dungeonProgress.maxFloorReached}층</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">현재 위치</span>
                      <span className="text-white">
                        ({player.dungeonProgress.position.x}, {player.dungeonProgress.position.y})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-6">
                <div className="bg-purple-800/30 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-200 mb-4">장비</h4>

                  {/* Equipment Slots */}
                  <div className="space-y-4">
                    {['weapon', 'armor', 'accessory'].map((slot) => {
                      const equippedItem = getEquippedItem(slot);
                      const slotNames = {
                        weapon: '무기',
                        armor: '방어구',
                        accessory: '장신구'
                      };

                      return (
                        <div key={slot} className="border border-purple-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-300 font-medium">
                              {slotNames[slot as keyof typeof slotNames]}
                            </span>
                            {equippedItem && (
                              <button
                                onClick={() => onUnequipItem(slot)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                해제
                              </button>
                            )}
                          </div>

                          {equippedItem ? (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{equippedItem.icon}</span>
                              <div className="flex-1">
                                <div className="text-white font-medium">{equippedItem.name}</div>
                                <div className="text-purple-300 text-sm">{equippedItem.description}</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {Object.entries(equippedItem.effect).map(([stat, value]) => (
                                    <span key={stat} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                      +{value} {stat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center py-2">
                              장비 없음
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Game Progress */}
                <div className="bg-purple-800/30 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-200 mb-3">게임 진행도</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-300">게임 일수</span>
                      <span className="text-white">{player.day}일</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">소지금</span>
                      <span className="text-yellow-300">{player.money.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">인벤토리</span>
                      <span className="text-white">{player.inventory.length}개 아이템</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Heroines Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedCharacters.map((characterId) => {
                const character = characters[characterId];
                const affection = player.affection[characterId] || 0;
                const affinityInfo = getAffinityLevel(affection);

                if (!character || characterId === 'hero') return null;

                return (
                  <div key={characterId} className="bg-purple-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CharacterPortrait
                        characterId={characterId}
                        emotion={affection >= 80 ? 'love' : affection >= 60 ? 'happy' : 'neutral'}
                        size="medium"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{character.name}</h4>
                        <div className="text-purple-300 text-sm">{character.role}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${affinityInfo.bg} ${affinityInfo.color}`}>
                          {affinityInfo.level}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Affection Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-300">호감도</span>
                          <span className="text-purple-200">{affection}/100</span>
                        </div>
                        <div className="w-full bg-purple-950/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${affection}%` }}
                          />
                        </div>
                      </div>

                      {/* Character Info */}
                      <div className="text-sm text-purple-200">
                        {character.baseText}
                      </div>

                      {/* Likes/Dislikes */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-green-300 text-sm">좋아하는 것:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.likes.map((like) => (
                              <span key={like} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                {like}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-red-300 text-sm">싫어하는 것:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.dislikes.map((dislike) => (
                              <span key={dislike} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                {dislike}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Dialogue */}
                      <div className="bg-purple-900/40 p-3 rounded border border-purple-500/30">
                        <div className="text-xs text-purple-400 mb-1">최근 대화:</div>
                        <div className="text-sm text-purple-200 italic">
                          "{Object.entries(character.dialogues)
                            .reverse()
                            .find(([threshold]) => affection >= parseInt(threshold))?.[1] || character.dialogues['0']}"
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterManagement;