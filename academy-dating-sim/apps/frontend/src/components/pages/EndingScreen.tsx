import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { EndingType } from '../../types/game';

interface EndingScreenProps {
  onRestart?: () => void;
  onMainMenu?: () => void;
}

interface EndingData {
  title: string;
  description: string;
  background: string;
  emoji: string;
  message: string;
  achievement?: string;
}

const EndingScreen: React.FC<EndingScreenProps> = ({
  onRestart,
  onMainMenu,
}) => {
  const { player, gameEnding } = useGameStore();
  
  const endingType = gameEnding;
  
  if (!endingType) {
    return <div>엔딩을 로드하는 중...</div>;
  }
  const [showStats, setShowStats] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const getEndingData = (type: EndingType): EndingData => {
    switch (type) {
      case 'true':
        return {
          title: '진실한 사랑',
          description: '모든 비밀을 해결하고 진정한 사랑을 찾았습니다. 당신의 선택이 만들어낸 완벽한 결말입니다.',
          background: 'from-yellow-400 via-pink-500 to-purple-600',
          emoji: '👑',
          message: '축하합니다! 최고의 엔딩을 달성했습니다!',
          achievement: '🏆 True Ending Master',
        };

      case 'good':
        return {
          title: '행복한 결말',
          description: '좋은 관계를 유지하며 행복한 학원 생활을 마쳤습니다. 앞으로도 좋은 추억이 계속될 것 같습니다.',
          background: 'from-pink-400 via-purple-500 to-blue-500',
          emoji: '😊',
          message: '훌륭한 선택이었습니다!',
          achievement: '🌟 Happy Life',
        };

      case 'sakura':
        return {
          title: '사쿠라와 함께',
          description: '활발하고 밝은 사쿠라와 특별한 관계를 쌓았습니다. 그녀의 웃음이 당신의 학원 생활을 더욱 빛나게 했습니다.',
          background: 'from-pink-300 via-pink-500 to-rose-600',
          emoji: '🌸',
          message: '사쿠라: "앞으로도 함께 행복하게 지내요!"',
          achievement: '🌸 Cherry Blossom Love',
        };

      case 'yuki':
        return {
          title: '유키와의 약속',
          description: '차가워 보이지만 따뜻한 마음을 가진 유키와 깊은 유대감을 형성했습니다. 그녀만의 특별한 온기를 느낄 수 있었습니다.',
          background: 'from-blue-300 via-cyan-500 to-blue-700',
          emoji: '❄️',
          message: '유키: "당신과 함께한 시간이 정말 소중했어요..."',
          achievement: '❄️ Winter Romance',
        };

      case 'luna':
        return {
          title: '루나의 비밀',
          description: '신비로운 루나와 함께 특별한 모험을 했습니다. 그녀의 신비로운 세계에 발을 들여놓게 되었습니다.',
          background: 'from-purple-400 via-indigo-500 to-purple-700',
          emoji: '🌙',
          message: '루나: "이제 당신도 내 세계의 일부예요..."',
          achievement: '🌙 Moonlight Mystery',
        };

      case 'mystery':
        return {
          title: '숨겨진 진실',
          description: '모든 미스터리를 해결하고 숨겨진 캐릭터의 정체를 밝혀냈습니다. 예상치 못한 놀라운 진실이 기다리고 있었습니다.',
          background: 'from-gray-400 via-purple-500 to-black',
          emoji: '❓',
          message: '???: "결국 모든 것을 알아내셨군요..."',
          achievement: '🔍 Truth Seeker',
        };

      case 'normal':
        return {
          title: '평범한 결말',
          description: '무난하게 학원 생활을 마쳤습니다. 특별한 로맨스는 없었지만, 나름대로 의미 있는 시간이었습니다.',
          background: 'from-gray-400 via-purple-400 to-gray-500',
          emoji: '📚',
          message: '평범하지만 의미 있는 학원 생활이었습니다.',
          achievement: '📖 Student Life',
        };

      case 'bad':
        return {
          title: '아쉬운 결말',
          description: '좀 더 노력했다면 더 좋은 결과를 얻을 수 있었을 텐데... 하지만 이것도 하나의 경험입니다.',
          background: 'from-red-400 via-orange-500 to-red-600',
          emoji: '😔',
          message: '다음에는 더 좋은 선택을 해보세요!',
          achievement: '💔 Learning Experience',
        };

      case 'solo':
        return {
          title: '홀로서기',
          description: '연애보다는 자신의 성장에 집중했습니다. 때로는 혼자만의 시간이 가장 소중한 법입니다.',
          background: 'from-blue-400 via-teal-500 to-green-500',
          emoji: '🚶‍♂️',
          message: '자신만의 길을 걸어가는 것도 훌륭한 선택입니다.',
          achievement: '🎯 Self Growth',
        };

      default:
        return {
          title: '새로운 시작',
          description: '학원 생활이 끝났습니다. 어떤 결말이든 새로운 시작의 기회입니다.',
          background: 'from-purple-400 via-pink-500 to-purple-600',
          emoji: '✨',
          message: '새로운 모험이 기다리고 있습니다!',
        };
    }
  };

  const endingData = getEndingData(endingType);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const getStatsSummary = () => {
    const totalAffection = Object.values(player.affection).reduce((sum, val) => sum + val, 0);
    const maxAffection = Object.entries(player.affection).reduce((max, [char, value]) =>
      value > max.value ? { char, value } : max,
      { char: '', value: 0 }
    );

    return {
      totalAffection,
      maxAffection,
      totalStats: player.stats.intelligence + player.stats.charm + player.stats.stamina,
      inventoryCount: player.inventory.length,
      moneyEarned: player.money,
    };
  };

  const stats = getStatsSummary();

  const getGrade = () => {
    if (endingType === 'true') return { grade: 'S+', color: 'text-yellow-400' };
    if (endingType === 'good' || ['sakura', 'yuki', 'luna', 'mystery'].includes(endingType)) {
      return { grade: 'A', color: 'text-pink-400' };
    }
    if (endingType === 'normal') return { grade: 'B', color: 'text-blue-400' };
    if (endingType === 'solo') return { grade: 'C', color: 'text-green-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const grade = getGrade();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${endingData.background} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {endingData.emoji}
          </div>
        ))}
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Main Content */}
        <div className="text-center">
          {/* Title Animation */}
          <div className={`transition-all duration-1000 ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-8xl mb-6 animate-bounce">{endingData.emoji}</div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {endingData.title}
            </h1>
            <div className={`text-2xl font-bold mb-8 ${grade.color}`}>
              GRADE: {grade.grade}
            </div>
          </div>

          {/* Description Animation */}
          <div className={`transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
              <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
                {endingData.description}
              </p>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-yellow-200 font-medium italic">
                  "{endingData.message}"
                </p>
              </div>
            </div>
          </div>

          {/* Achievement */}
          {endingData.achievement && (
            <div className={`transition-all duration-1000 delay-1000 ${animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-8 backdrop-blur-sm">
                <div className="text-yellow-300 font-bold text-lg">
                  🏆 업적 달성: {endingData.achievement}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`transition-all duration-1000 delay-1500 ${animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-blue-600/80 hover:bg-blue-500/80 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <span>📊</span>
                {showStats ? '통계 숨기기' : '통계 보기'}
              </button>

              <button
                onClick={onRestart}
                className="bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <span>🔄</span>
                다시 시작
              </button>

              <button
                onClick={onMainMenu}
                className="bg-purple-600/80 hover:bg-purple-500/80 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <span>🏠</span>
                메인 메뉴
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          {showStats && (
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-6">최종 통계</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Stats */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-3">기본 능력치</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300">🧠 지력</span>
                      <span className="text-white font-medium">{player.stats.intelligence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-300">✨ 매력</span>
                      <span className="text-white font-medium">{player.stats.charm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">💪 체력</span>
                      <span className="text-white font-medium">{player.stats.stamina}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-white/20 pt-2">
                      <span className="text-yellow-300">합계</span>
                      <span className="text-white">{stats.totalStats}</span>
                    </div>
                  </div>
                </div>

                {/* Affection Stats */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-3">호감도</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(player.affection).map(([char, value]) => (
                      <div key={char} className="flex justify-between">
                        <span className="text-purple-300 capitalize">{char}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t border-white/20 pt-2">
                      <span className="text-yellow-300">총합</span>
                      <span className="text-white">{stats.totalAffection}</span>
                    </div>
                    <div className="text-xs text-purple-300 mt-2">
                      최고: {stats.maxAffection.char} ({stats.maxAffection.value})
                    </div>
                  </div>
                </div>

                {/* Game Progress */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-3">게임 진행</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300">📅 최종 일차</span>
                      <span className="text-white font-medium">{player.day}/30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">💰 최종 소지금</span>
                      <span className="text-white font-medium">{stats.moneyEarned.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-300">🎒 아이템 수</span>
                      <span className="text-white font-medium">{stats.inventoryCount}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(-5px) rotate(-5deg); }
          75% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EndingScreen;