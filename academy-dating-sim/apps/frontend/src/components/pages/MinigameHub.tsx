import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface MinigameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  difficulty: number;
  rewards: string;
  unlocked: boolean;
  requiredLevel?: number;
  dailyLimit?: number;
  playsToday?: number;
  highScore?: number;
}

const MinigameHub: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const [selectedGame, setSelectedGame] = useState<MinigameInfo | null>(null);

  // Minigames list
  const minigames: MinigameInfo[] = [
    {
      id: 'card_matching',
      name: '카드 매칭',
      description: '같은 카드를 찾아 매칭하는 기억력 게임입니다. 히로인들의 카드를 모아보세요!',
      icon: '🎴',
      route: '/card-matching',
      difficulty: 2,
      rewards: 'EXP +50, Gold +30, 카드 수집',
      unlocked: true,
      dailyLimit: 5,
      playsToday: player.statistics?.cardMatchingPlays || 0,
      highScore: player.statistics?.cardMatchingHighScore || 0
    },
    {
      id: 'quiz',
      name: '퀴즈 챌린지',
      description: '학원과 히로인들에 관한 퀴즈를 풀어보세요. 지식이 곧 힘입니다!',
      icon: '❓',
      route: '/quiz',
      difficulty: 3,
      rewards: 'EXP +75, Intelligence +2, 특별 아이템',
      unlocked: true,
      dailyLimit: 3,
      playsToday: player.statistics?.quizPlays || 0,
      highScore: player.statistics?.quizHighScore || 0
    },
    {
      id: 'fishing',
      name: '낚시',
      description: '평화로운 호수에서 낚시를 즐기며 희귀한 물고기를 잡아보세요.',
      icon: '🎣',
      route: '/fishing',
      difficulty: 1,
      rewards: '물고기 아이템, Gold, 요리 재료',
      unlocked: true,
      dailyLimit: 10,
      playsToday: player.statistics?.fishingPlays || 0
    },
    {
      id: 'rhythm',
      name: '리듬 게임',
      description: '음악에 맞춰 노트를 연주하세요. 히로인들의 테마곡이 준비되어 있습니다!',
      icon: '🎵',
      route: '/rhythm',
      difficulty: 4,
      rewards: 'EXP +100, Agility +3, 음악 아이템',
      unlocked: player.level >= 5,
      requiredLevel: 5,
      dailyLimit: 5,
      playsToday: player.statistics?.rhythmPlays || 0,
      highScore: player.statistics?.rhythmHighScore || 0
    },
    {
      id: 'puzzle',
      name: '퍼즐',
      description: '조각을 맞춰 그림을 완성하세요. 완성하면 특별한 보상이!',
      icon: '🧩',
      route: '/puzzle',
      difficulty: 3,
      rewards: 'EXP +80, Intelligence +2, 퍼즐 조각',
      unlocked: player.level >= 3,
      requiredLevel: 3,
      dailyLimit: 5,
      playsToday: player.statistics?.puzzlePlays || 0
    },
    {
      id: 'farming',
      name: '농장 관리',
      description: '작물을 재배하고 수확하여 수익을 얻으세요. 특별한 작물도 키울 수 있습니다!',
      icon: '🌾',
      route: '/farming',
      difficulty: 2,
      rewards: '작물, Gold, 요리 재료',
      unlocked: player.level >= 7,
      requiredLevel: 7
    }
  ];

  // Weekly tournament info
  const tournaments = [
    {
      id: 'rhythm_tournament',
      name: '리듬 마스터 토너먼트',
      game: 'rhythm',
      endDate: '3일 후',
      prize: '특별 의상, 1000 Gold',
      participants: 234,
      yourRank: 45
    },
    {
      id: 'quiz_tournament',
      name: '지식왕 선발대회',
      game: 'quiz',
      endDate: '5일 후',
      prize: '희귀 책, 500 Gold',
      participants: 156,
      yourRank: 12
    }
  ];

  // Daily challenges
  const dailyChallenges = [
    {
      id: 'daily_card',
      name: '카드 매칭 10연승',
      game: 'card_matching',
      progress: 3,
      target: 10,
      reward: 'EXP +200'
    },
    {
      id: 'daily_fish',
      name: '희귀 물고기 3마리 낚기',
      game: 'fishing',
      progress: 1,
      target: 3,
      reward: '낚싯대 업그레이드'
    },
    {
      id: 'daily_combo',
      name: '리듬 게임 100 콤보',
      game: 'rhythm',
      progress: 0,
      target: 100,
      reward: '음악 노트 x5'
    }
  ];

  const handlePlayGame = (game: MinigameInfo) => {
    if (!game.unlocked) {
      alert(`레벨 ${game.requiredLevel}부터 플레이 가능합니다!`);
      return;
    }

    if (game.dailyLimit && game.playsToday && game.playsToday >= game.dailyLimit) {
      alert(`오늘의 플레이 횟수를 모두 사용했습니다! (${game.playsToday}/${game.dailyLimit})`);
      return;
    }

    navigate(game.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent mb-2">
                🎮 미니게임 광장
              </h1>
              <p className="text-text-secondary">
                다양한 미니게임을 즐기고 보상을 획득하세요!
              </p>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              🏠 돌아가기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Games Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Games */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-bold text-white mb-4">🎯 미니게임</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {minigames.map(game => (
                  <div
                    key={game.id}
                    className={`bg-gradient-to-br ${
                      game.unlocked
                        ? 'from-purple-800 to-blue-800 hover:from-purple-700 hover:to-blue-700'
                        : 'from-gray-800 to-gray-700'
                    } rounded-lg p-4 transition-all ${
                      game.unlocked ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-60'
                    }`}
                    onClick={() => game.unlocked && setSelectedGame(game)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{game.icon}</div>
                      <div className="text-yellow-400 text-sm">
                        {'⭐'.repeat(game.difficulty)}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
                    <p className="text-xs text-gray-300 mb-3">{game.description}</p>

                    {!game.unlocked && game.requiredLevel && (
                      <div className="text-red-400 text-sm mb-2">
                        🔒 Lv.{game.requiredLevel} 필요
                      </div>
                    )}

                    {game.dailyLimit && (
                      <div className="text-xs text-gray-400 mb-2">
                        오늘 플레이: {game.playsToday || 0}/{game.dailyLimit}
                      </div>
                    )}

                    {game.highScore !== undefined && game.highScore > 0 && (
                      <div className="text-xs text-yellow-300">
                        최고 점수: {game.highScore}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game);
                      }}
                      disabled={!game.unlocked}
                      className={`w-full mt-3 py-2 rounded font-bold transition ${
                        game.unlocked
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {game.unlocked ? '플레이' : '잠김'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-yellow-500">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">⚡ 일일 도전</h2>
              <div className="space-y-3">
                {dailyChallenges.map(challenge => (
                  <div key={challenge.id} className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white">{challenge.name}</h3>
                        <p className="text-xs text-gray-400">
                          {minigames.find(g => g.id === challenge.game)?.name}
                        </p>
                      </div>
                      <div className="text-xs text-yellow-400">
                        보상: {challenge.reward}
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {challenge.progress}/{challenge.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Tournaments */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-bold text-green-400 mb-4">🏆 주간 토너먼트</h2>
              <div className="space-y-3">
                {tournaments.map(tournament => (
                  <div key={tournament.id} className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                    <h3 className="font-bold text-white mb-1">{tournament.name}</h3>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>종료: {tournament.endDate}</div>
                      <div>참가자: {tournament.participants}명</div>
                      <div className="text-green-400">현재 순위: {tournament.yourRank}위</div>
                    </div>
                    <div className="mt-2 text-xs text-yellow-300">
                      🎁 {tournament.prize}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Stats */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-blue-500">
              <h2 className="text-xl font-bold text-blue-400 mb-4">📊 내 통계</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white">
                  <span className="text-gray-400">총 플레이 시간</span>
                  <span>{player.statistics?.totalMinigameTime || 0}분</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-400">오늘 획득 EXP</span>
                  <span className="text-yellow-400">+{player.statistics?.todayMinigameExp || 0}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-400">오늘 획득 Gold</span>
                  <span className="text-yellow-400">+{player.statistics?.todayMinigameGold || 0}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-400">연속 플레이</span>
                  <span className="text-green-400">{player.statistics?.minigameStreak || 0}일</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600/30">
              <h3 className="text-sm font-bold text-purple-300 mb-2">💡 팁</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• 매일 미니게임을 플레이하면 연속 보너스를 받을 수 있어요!</li>
                <li>• 토너먼트에 참가하여 특별한 보상을 획득하세요</li>
                <li>• 일일 도전을 완료하면 추가 경험치를 얻을 수 있습니다</li>
                <li>• 높은 점수를 기록하면 히로인들의 호감도가 상승합니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selected Game Detail Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full border border-purple-500">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedGame.icon}</div>
                <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
              </div>

              <p className="text-gray-300 mb-4">{selectedGame.description}</p>

              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">난이도</span>
                    <span className="text-yellow-400">{'⭐'.repeat(selectedGame.difficulty)}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span className="text-gray-400">보상</span>
                    <span className="text-green-400 text-xs">{selectedGame.rewards}</span>
                  </div>
                  {selectedGame.dailyLimit && (
                    <div className="flex justify-between text-white">
                      <span className="text-gray-400">오늘 플레이</span>
                      <span>{selectedGame.playsToday || 0}/{selectedGame.dailyLimit}</span>
                    </div>
                  )}
                  {selectedGame.highScore !== undefined && (
                    <div className="flex justify-between text-white">
                      <span className="text-gray-400">최고 점수</span>
                      <span className="text-yellow-300">{selectedGame.highScore}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handlePlayGame(selectedGame)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold transition"
                >
                  게임 시작
                </button>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinigameHub;