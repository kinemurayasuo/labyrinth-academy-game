import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameState, HeroineData } from '../types/game';

interface MyPageProps {
  gameState: GameState;
  onUpdateProfile?: (data: any) => void;
}

const MyPage: React.FC<MyPageProps> = ({ gameState, onUpdateProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'achievements' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(gameState.playerName || '플레이어');
  const [bio, setBio] = useState('미궁 학원의 학생입니다.');

  // Calculate player level based on total experience
  const calculateLevel = () => {
    const exp = gameState.experience || 0;
    return Math.floor(exp / 100) + 1;
  };

  const level = calculateLevel();
  const currentExp = gameState.experience % 100;
  const expToNextLevel = 100;

  // Calculate total play time
  const totalPlayDays = gameState.currentDay || 1;
  const totalEvents = Object.values(gameState.heroines).reduce((sum, h: HeroineData) => sum + (h.eventsCompleted?.length || 0), 0);

  // Achievement data
  const achievements = [
    { id: 'first_love', name: '첫사랑', description: '첫 번째 호감도 이벤트 달성', completed: totalEvents > 0, icon: '💕' },
    { id: 'dungeon_master', name: '던전 마스터', description: '던전 10층 클리어', completed: false, icon: '⚔️' },
    { id: 'scholar', name: '우등생', description: '지능 스탯 50 달성', completed: gameState.stats.intelligence >= 50, icon: '📚' },
    { id: 'charmer', name: '인기인', description: '매력 스탯 50 달성', completed: gameState.stats.charm >= 50, icon: '✨' },
    { id: 'athlete', name: '운동선수', description: '체력 스탯 50 달성', completed: gameState.stats.stamina >= 50, icon: '💪' },
    { id: 'collector', name: '수집가', description: '아이템 50개 수집', completed: gameState.inventory.length >= 50, icon: '🎁' },
    { id: 'socialite', name: '인싸', description: '모든 히로인과 친구 달성', completed: Object.values(gameState.heroines).every((h: HeroineData) => h.affinity >= 50), icon: '👥' },
    { id: 'rich', name: '부자', description: '1000 골드 보유', completed: gameState.money >= 1000, icon: '💰' },
  ];

  const completedAchievements = achievements.filter(a => a.completed).length;
  const achievementProgress = (completedAchievements / achievements.length) * 100;

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ nickname, bio });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            마이 페이지
          </h1>
          <button
            onClick={() => navigate('/game')}
            className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-all"
          >
            게임으로 돌아가기
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-5xl">
                👤
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full px-2 py-1 text-xs text-white">
                Lv.{level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="text-3xl font-bold bg-white/10 rounded-lg px-4 py-2 text-white w-full"
                    placeholder="닉네임"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-white/10 rounded-lg px-4 py-2 text-gray-300 w-full"
                    rows={3}
                    placeholder="자기소개"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-bold text-white">{nickname}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg text-sm transition-all"
                    >
                      프로필 편집
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">{bio}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-purple-600/30 rounded-lg px-3 py-1">
                      <span className="text-purple-300">Day</span>
                      <span className="text-white font-bold ml-2">{totalPlayDays}</span>
                    </div>
                    <div className="bg-blue-600/30 rounded-lg px-3 py-1">
                      <span className="text-blue-300">EXP</span>
                      <span className="text-white font-bold ml-2">{currentExp}/{expToNextLevel}</span>
                    </div>
                    <div className="bg-yellow-600/30 rounded-lg px-3 py-1">
                      <span className="text-yellow-300">Gold</span>
                      <span className="text-white font-bold ml-2">{gameState.money}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-purple-300 mb-2">빠른 통계</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">총 이벤트</span>
                  <span className="text-white font-semibold">{totalEvents}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">아이템</span>
                  <span className="text-white font-semibold">{gameState.inventory.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">업적</span>
                  <span className="text-white font-semibold">{completedAchievements}/{achievements.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white'
                : 'bg-black/30 text-gray-300 hover:bg-black/50'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white'
                : 'bg-black/30 text-gray-300 hover:bg-black/50'
            }`}
          >
            능력치
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'bg-purple-600 text-white'
                : 'bg-black/30 text-gray-300 hover:bg-black/50'
            }`}
          >
            업적
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'bg-black/30 text-gray-300 hover:bg-black/50'
            }`}
          >
            설정
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">플레이어 정보</h3>

              {/* Experience Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-300">경험치</span>
                  <span className="text-white">{currentExp}/{expToNextLevel} XP</span>
                </div>
                <div className="bg-black/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                    style={{ width: `${(currentExp / expToNextLevel) * 100}%` }}
                  />
                </div>
              </div>

              {/* Heroine Relationships */}
              <div>
                <h4 className="text-xl font-bold text-white mb-4">히로인 관계</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(gameState.heroines).map(([id, heroine]: [string, HeroineData]) => (
                    <div key={id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{heroine.id === 'sakura' ? '🌸' : heroine.id === 'yuki' ? '❄️' : heroine.id === 'luna' ? '🌙' : '❓'}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{heroine.name}</div>
                          <div className="text-sm text-gray-400">호감도: {heroine.affinity}</div>
                          <div className="bg-black/50 rounded-full h-2 mt-1 overflow-hidden">
                            <div
                              className="bg-pink-500 h-full transition-all"
                              style={{ width: `${heroine.affinity}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Play Statistics */}
              <div>
                <h4 className="text-xl font-bold text-white mb-4">플레이 통계</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-gray-400 text-sm">플레이 일수</div>
                    <div className="text-white font-bold text-xl">{totalPlayDays}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">💕</div>
                    <div className="text-gray-400 text-sm">완료 이벤트</div>
                    <div className="text-white font-bold text-xl">{totalEvents}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎁</div>
                    <div className="text-gray-400 text-sm">보유 아이템</div>
                    <div className="text-white font-bold text-xl">{gameState.inventory.length}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-gray-400 text-sm">보유 골드</div>
                    <div className="text-white font-bold text-xl">{gameState.money}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">능력치</h3>

              {/* HP and MP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-red-400 font-semibold">HP (체력)</span>
                    <span className="text-white">{gameState.hp || 100}/{gameState.maxHp || 100}</span>
                  </div>
                  <div className="bg-black/50 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${((gameState.hp || 100) / (gameState.maxHp || 100)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">❤️</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-400 font-semibold">MP (마나)</span>
                    <span className="text-white">{gameState.mp || 50}/{gameState.maxMp || 50}</span>
                  </div>
                  <div className="bg-black/50 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${((gameState.mp || 50) / (gameState.maxMp || 50)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">💧</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <div className="text-white font-semibold">지능</div>
                      <div className="text-3xl font-bold text-blue-400">{gameState.stats.intelligence}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.intelligence, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-lg p-4 border border-pink-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="text-white font-semibold">매력</div>
                      <div className="text-3xl font-bold text-pink-400">{gameState.stats.charm}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-pink-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.charm, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <div className="text-white font-semibold">체력</div>
                      <div className="text-3xl font-bold text-green-400">{gameState.stats.stamina}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.stamina, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚔️</span>
                    <div>
                      <div className="text-white font-semibold">힘</div>
                      <div className="text-3xl font-bold text-red-400">{gameState.stats.strength || 10}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.strength || 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-white font-semibold">민첩</div>
                      <div className="text-3xl font-bold text-yellow-400">{gameState.stats.agility || 10}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.agility || 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🍀</span>
                    <div>
                      <div className="text-white font-semibold">행운</div>
                      <div className="text-3xl font-bold text-purple-400">{gameState.stats.luck || 10}</div>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all"
                      style={{ width: `${Math.min(gameState.stats.luck || 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Stats */}
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <div className="text-gray-400 mb-2">총 능력치</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {gameState.stats.intelligence + gameState.stats.charm + gameState.stats.stamina +
                   (gameState.stats.strength || 10) + (gameState.stats.agility || 10) + (gameState.stats.luck || 10)}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">업적</h3>
                <div className="text-purple-300">
                  달성률: {achievementProgress.toFixed(0)}%
                </div>
              </div>

              <div className="bg-black/50 rounded-full h-4 overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${achievementProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-lg p-4 border transition-all ${
                      achievement.completed
                        ? 'bg-purple-600/20 border-purple-500/50'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white">{achievement.name}</div>
                          {achievement.completed && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">완료</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{achievement.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">설정</h3>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">게임 설정</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">자동 저장</span>
                      <button className="bg-purple-600 rounded-full w-12 h-6 relative">
                        <div className="absolute right-1 top-1 bg-white rounded-full w-4 h-4"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">알림 표시</span>
                      <button className="bg-purple-600 rounded-full w-12 h-6 relative">
                        <div className="absolute right-1 top-1 bg-white rounded-full w-4 h-4"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">효과음</span>
                      <button className="bg-gray-600 rounded-full w-12 h-6 relative">
                        <div className="absolute left-1 top-1 bg-white rounded-full w-4 h-4"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">계정 관리</h4>
                  <div className="space-y-3">
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                      데이터 백업
                    </button>
                    <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all">
                      데이터 복원
                    </button>
                    <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all">
                      데이터 초기화
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">게임 정보</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>버전: 1.0.0</div>
                    <div>개발: Labyrinth Academy Team</div>
                    <div>최종 업데이트: 2024.01.19</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;