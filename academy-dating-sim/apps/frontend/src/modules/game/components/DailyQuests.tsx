import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: string;
    target: number;
    current: number;
  };
  reward: {
    gold?: number;
    exp?: number;
    items?: string[];
    achievementPoints?: number;
  };
  completed: boolean;
  claimed: boolean;
}

const DailyQuests: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [showRewardPopup, setShowRewardPopup] = useState<Quest | null>(null);

  // 일일 퀘스트 목록
  const dailyQuestTemplates = [
    {
      id: 'daily_talk',
      title: '친목 도모',
      description: '히로인과 3번 대화하기',
      icon: '💬',
      requirement: { type: 'talk', target: 3 },
      reward: { gold: 500, exp: 100 }
    },
    {
      id: 'daily_battle',
      title: '전투 훈련',
      description: '몬스터 5마리 처치',
      icon: '⚔️',
      requirement: { type: 'battle', target: 5 },
      reward: { gold: 800, exp: 150 }
    },
    {
      id: 'daily_dungeon',
      title: '던전 탐험',
      description: '던전 1층 클리어',
      icon: '🏰',
      requirement: { type: 'dungeon', target: 1 },
      reward: { gold: 1000, exp: 200 }
    },
    {
      id: 'daily_shop',
      title: '쇼핑',
      description: '상점에서 아이템 구매',
      icon: '🛍️',
      requirement: { type: 'shop', target: 1 },
      reward: { gold: 300, exp: 50 }
    },
    {
      id: 'daily_minigame',
      title: '미니게임 마스터',
      description: '미니게임 2회 플레이',
      icon: '🎮',
      requirement: { type: 'minigame', target: 2 },
      reward: { gold: 600, exp: 120 }
    }
  ];

  // 주간 퀘스트 목록
  const weeklyQuestTemplates = [
    {
      id: 'weekly_affection',
      title: '인기스타',
      description: '총 호감도 50 올리기',
      icon: '❤️',
      requirement: { type: 'affection', target: 50 },
      reward: { gold: 5000, exp: 1000, achievementPoints: 10 }
    },
    {
      id: 'weekly_monster',
      title: '몬스터 헌터',
      description: '몬스터 50마리 처치',
      icon: '👾',
      requirement: { type: 'monster', target: 50 },
      reward: { gold: 8000, exp: 1500, items: ['rare_weapon'] }
    },
    {
      id: 'weekly_level',
      title: '성장의 증거',
      description: '레벨 5 올리기',
      icon: '⭐',
      requirement: { type: 'level', target: 5 },
      reward: { gold: 10000, exp: 2000, achievementPoints: 20 }
    }
  ];

  // 특별 퀘스트 목록
  const specialQuestTemplates = [
    {
      id: 'special_boss',
      title: '보스 레이드',
      description: '보스 몬스터 처치',
      icon: '🐉',
      requirement: { type: 'boss', target: 1 },
      reward: { gold: 20000, exp: 5000, items: ['legendary_item'] }
    },
    {
      id: 'special_perfect',
      title: '완벽한 하루',
      description: '모든 일일 퀘스트 완료',
      icon: '🏆',
      requirement: { type: 'all_daily', target: 5 },
      reward: { gold: 15000, achievementPoints: 50 }
    }
  ];

  // 퀘스트 초기화
  useEffect(() => {
    const today = new Date().toDateString();
    const lastQuestDate = localStorage.getItem('lastQuestDate');

    if (lastQuestDate !== today) {
      // 새로운 일일 퀘스트 생성
      const newDailyQuests = dailyQuestTemplates.map(template => ({
        ...template,
        type: 'daily' as const,
        requirement: { ...template.requirement, current: 0 },
        completed: false,
        claimed: false
      }));

      // 주간 퀘스트 확인 (월요일마다 리셋)
      const dayOfWeek = new Date().getDay();
      const weeklyQuests = dayOfWeek === 1 ? weeklyQuestTemplates.map(template => ({
        ...template,
        type: 'weekly' as const,
        requirement: { ...template.requirement, current: 0 },
        completed: false,
        claimed: false
      })) : getStoredQuests('weekly');

      // 특별 퀘스트
      const specialQuests = specialQuestTemplates.map(template => ({
        ...template,
        type: 'special' as const,
        requirement: { ...template.requirement, current: 0 },
        completed: false,
        claimed: false
      }));

      const allQuests = [...newDailyQuests, ...weeklyQuests, ...specialQuests];
      setQuests(allQuests);
      localStorage.setItem('lastQuestDate', today);
      localStorage.setItem('dailyQuests', JSON.stringify(allQuests));
    } else {
      // 저장된 퀘스트 불러오기
      const savedQuests = localStorage.getItem('dailyQuests');
      if (savedQuests) {
        setQuests(JSON.parse(savedQuests));
      }
    }
  }, []);

  const getStoredQuests = (type: string): Quest[] => {
    const saved = localStorage.getItem('dailyQuests');
    if (saved) {
      const allQuests = JSON.parse(saved);
      return allQuests.filter((q: Quest) => q.type === type);
    }
    return [];
  };

  // 퀘스트 진행도 업데이트
  const updateQuestProgress = (type: string, amount: number = 1) => {
    const updatedQuests = quests.map(quest => {
      if (quest.requirement.type === type && !quest.completed) {
        const newCurrent = Math.min(quest.requirement.current + amount, quest.requirement.target);
        const completed = newCurrent >= quest.requirement.target;

        if (completed && !quest.completed) {
          soundManager.playSuccessSound();
        }

        return {
          ...quest,
          requirement: { ...quest.requirement, current: newCurrent },
          completed
        };
      }
      return quest;
    });

    setQuests(updatedQuests);
    localStorage.setItem('dailyQuests', JSON.stringify(updatedQuests));
  };

  // 보상 수령
  const claimReward = (quest: Quest) => {
    if (!quest.completed || quest.claimed) return;

    // 보상 지급
    const rewards = quest.reward;
    let newPlayerData: any = { ...player };

    if (rewards.gold) {
      newPlayerData.gold = player.gold + rewards.gold;
    }
    if (rewards.exp) {
      newPlayerData.experience = player.experience + rewards.exp;
    }
    if (rewards.achievementPoints) {
      newPlayerData.achievementPoints = (player.achievementPoints || 0) + rewards.achievementPoints;
    }

    updatePlayer(newPlayerData);

    // 퀘스트 상태 업데이트
    const updatedQuests = quests.map(q =>
      q.id === quest.id ? { ...q, claimed: true } : q
    );
    setQuests(updatedQuests);
    localStorage.setItem('dailyQuests', JSON.stringify(updatedQuests));

    // 보상 팝업 표시
    setShowRewardPopup(quest);
    soundManager.playCoinSound();

    setTimeout(() => {
      setShowRewardPopup(null);
    }, 2000);
  };

  const filteredQuests = quests.filter(q => q.type === selectedTab);
  const completedCount = filteredQuests.filter(q => q.completed).length;
  const totalCount = filteredQuests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900 p-4">
      {/* Reward Popup */}
      {showRewardPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg shadow-2xl">
            <div className="font-bold text-lg mb-2">보상 획득!</div>
            <div className="flex items-center gap-3">
              {showRewardPopup.reward.gold && (
                <div className="flex items-center gap-1">
                  <span>💰</span>
                  <span>+{showRewardPopup.reward.gold}</span>
                </div>
              )}
              {showRewardPopup.reward.exp && (
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>+{showRewardPopup.reward.exp} EXP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">📋 일일 퀘스트</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>오늘의 진행도</span>
              <span>{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-full rounded-full transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            {(['daily', 'weekly', 'special'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all flex-1 ${
                  selectedTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab === 'daily' && '일일'}
                {tab === 'weekly' && '주간'}
                {tab === 'special' && '특별'}
              </button>
            ))}
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {filteredQuests.map(quest => (
            <div
              key={quest.id}
              className={`bg-black/30 backdrop-blur rounded-xl p-4 transition-all ${
                quest.completed ? 'border-2 border-green-400/50' : 'border-2 border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`text-4xl ${quest.completed ? '' : 'opacity-50'}`}>
                  {quest.icon}
                </div>

                {/* Quest Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${quest.completed ? 'text-green-400' : 'text-white'}`}>
                      {quest.title}
                    </h3>
                    {quest.completed && !quest.claimed && (
                      <span className="bg-green-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                        완료!
                      </span>
                    )}
                    {quest.claimed && (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        수령 완료
                      </span>
                    )}
                  </div>

                  <p className="text-white/70 text-sm mt-1">{quest.description}</p>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-white/60 mb-1">
                      <span>진행도</span>
                      <span>{quest.requirement.current} / {quest.requirement.target}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quest.completed
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                        }`}
                        style={{ width: `${(quest.requirement.current / quest.requirement.target) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-white/60">보상:</span>
                    {quest.reward.gold && (
                      <span className="text-yellow-400">💰 {quest.reward.gold}</span>
                    )}
                    {quest.reward.exp && (
                      <span className="text-blue-400">⭐ {quest.reward.exp} EXP</span>
                    )}
                    {quest.reward.achievementPoints && (
                      <span className="text-purple-400">🏆 {quest.reward.achievementPoints}P</span>
                    )}
                  </div>
                </div>

                {/* Claim Button */}
                {quest.completed && !quest.claimed && (
                  <button
                    onClick={() => claimReward(quest)}
                    className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all animate-pulse"
                  >
                    수령
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuests.length === 0 && (
          <div className="bg-black/30 backdrop-blur rounded-xl p-8 text-center text-white">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">현재 진행 중인 퀘스트가 없습니다.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: translateX(-50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) scale(1.1);
          }
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DailyQuests;