import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import CharacterEquipment from '../character/CharacterEquipment';
import charactersData from '../../data/characters.json';

const characters = charactersData as Record<string, any>;

const CharacterStatus: React.FC = () => {
  const navigate = useNavigate();
  const { player, gameDate } = useGameStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'relationships'>('stats');

  // Calculate total stats with equipment bonuses
  const calculateTotalStats = () => {
    // This would normally include equipment bonuses
    // For now, just return base stats
    return player.stats;
  };

  const totalStats = calculateTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-text-primary">📊 캐릭터 상태</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              ← 돌아가기
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-black/30 text-text-secondary hover:bg-black/40'
              }`}
            >
              📈 능력치 & 상태
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'equipment'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-black/30 text-text-secondary hover:bg-black/40'
              }`}
            >
              ⚔️ 장비
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'relationships'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-black/30 text-text-secondary hover:bg-black/40'
              }`}
            >
              💕 히로인 호감도
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'stats' && (
            <>
              {/* Basic Info */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span>👤</span>
                  기본 정보
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">이름</span>
                    <span className="font-bold text-text-primary">{player.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">레벨</span>
                    <span className="font-bold text-yellow-400">Lv.{player.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">클래스</span>
                    <span className="font-bold text-purple-400">{player.class || '학생'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">골드</span>
                    <span className="font-bold text-green-400">{player.money || 0}G</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">날짜</span>
                    <span className="font-bold text-text-primary">Day {player.day}</span>
                  </div>
                </div>
              </div>

              {/* HP/MP/Experience */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span>💪</span>
                  체력 & 경험치
                </h2>
                <div className="space-y-4">
                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-red-400">체력 (HP)</span>
                      <span className="text-red-400 font-bold">{player.hp}/{player.maxHp}</span>
                    </div>
                    <div className="bg-black/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* MP Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-400">마나 (MP)</span>
                      <span className="text-blue-400 font-bold">{player.mp}/{player.maxMp}</span>
                    </div>
                    <div className="bg-black/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                        style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stamina Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-yellow-400">스테미나</span>
                      <span className="text-yellow-400 font-bold">{player.stamina || 100}/100</span>
                    </div>
                    <div className="bg-black/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${(player.stamina || 100) / 100 * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Experience Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-green-400">경험치</span>
                      <span className="text-green-400 font-bold">
                        {player.experience}/{50 + player.level * 30}
                      </span>
                    </div>
                    <div className="bg-black/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                        style={{ width: `${(player.experience / (50 + player.level * 30)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  능력치
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span>💪</span> 힘
                    </span>
                    <span className="font-bold text-orange-400">{totalStats.strength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span>🏃</span> 민첩
                    </span>
                    <span className="font-bold text-blue-400">{totalStats.agility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span>🧠</span> 지력
                    </span>
                    <span className="font-bold text-purple-400">{totalStats.intelligence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span>✨</span> 매력
                    </span>
                    <span className="font-bold text-pink-400">{totalStats.charm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span>🍀</span> 행운
                    </span>
                    <span className="font-bold text-green-400">{totalStats.luck}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'equipment' && (
            <div className="lg:col-span-3">
              <CharacterEquipment />
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="lg:col-span-3">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <span>💕</span>
                  히로인 호감도
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(player.affection || {}).map(([characterId, affection]) => {
                    const character = characters[characterId];
                    if (!character) return null;

                    return (
                      <div key={characterId} className="bg-black/30 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">{character.sprite}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-text-primary">{character.name}</h3>
                            <p className="text-sm text-text-secondary">{character.role}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-pink-400">호감도</span>
                            <span className="text-sm font-bold text-pink-400">{affection}/100</span>
                          </div>
                          <div className="bg-black/50 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300"
                              style={{ width: `${Math.min(affection, 100)}%` }}
                            />
                          </div>
                          <div className="mt-2 text-center">
                            <span className="text-xs text-text-secondary">
                              {affection < 20 ? '낯선 사이' :
                               affection < 40 ? '아는 사이' :
                               affection < 60 ? '친한 사이' :
                               affection < 80 ? '매우 친한 사이' :
                               '연인 사이'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterStatus;