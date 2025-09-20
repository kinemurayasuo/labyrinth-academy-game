import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import achievementsData from '../../data/achievements.json';
import soundManager from '../../utils/soundManager';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  condition: {
    type: string;
    value: number | string | boolean;
  };
}

const Achievements: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    player.achievements || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'romance', name: '로맨스', icon: '💕' },
    { id: 'combat', name: '전투', icon: '⚔️' },
    { id: 'exploration', name: '탐험', icon: '🗺️' },
    { id: 'wealth', name: '재산', icon: '💰' },
    { id: 'minigame', name: '미니게임', icon: '🎮' },
    { id: 'growth', name: '성장', icon: '⭐' },
    { id: 'dedication', name: '헌신', icon: '📅' },
    { id: 'special', name: '특별', icon: '🏆' }
  ];

  const checkAchievement = (achievement: Achievement): boolean => {
    if (unlockedAchievements.includes(achievement.id)) return true;

    switch (achievement.condition.type) {
      case 'affection':
        return Object.values(player.affection || {}).some(
          value => value >= (achievement.condition.value as number)
        );

      case 'all_affection':
        return Object.values(player.affection || {}).every(
          value => value >= (achievement.condition.value as number)
        );

      case 'max_affection':
        return Object.values(player.affection || {}).some(
          value => value >= (achievement.condition.value as number)
        );

      case 'monsters_defeated':
        return (player.statistics?.monstersDefeated || 0) >= (achievement.condition.value as number);

      case 'boss_defeated':
        return player.defeatedBosses?.includes(achievement.condition.value as string) || false;

      case 'dungeon_clear':
        return (player.dungeonProgress?.floor || 1) >= (achievement.condition.value as number);

      case 'treasures_found':
        return (player.statistics?.treasuresFound || 0) >= (achievement.condition.value as number);

      case 'gold':
        return player.gold >= (achievement.condition.value as number);

      case 'level':
        return player.level >= (achievement.condition.value as number);

      case 'all_stats':
        return player.strength >= (achievement.condition.value as number) &&
               player.intelligence >= (achievement.condition.value as number) &&
               player.charm >= (achievement.condition.value as number) &&
               player.luck >= (achievement.condition.value as number);

      case 'quiz_streak':
        return (player.statistics?.quizStreak || 0) >= (achievement.condition.value as number);

      case 'card_time':
        return (player.statistics?.bestCardTime || Infinity) <= (achievement.condition.value as number);

      case 'login_streak':
        return (player.statistics?.loginStreak || 0) >= (achievement.condition.value as number);

      case 'play_time':
        if (achievement.condition.value === 'midnight') {
          const hour = new Date().getHours();
          return hour >= 0 && hour < 6;
        }
        return false;

      case 'all_achievements':
        return unlockedAchievements.length >= achievementsData.achievements.length - 1;

      default:
        return false;
    }
  };

  const unlockAchievement = (achievement: Achievement) => {
    if (!unlockedAchievements.includes(achievement.id)) {
      const newUnlocked = [...unlockedAchievements, achievement.id];
      setUnlockedAchievements(newUnlocked);

      updatePlayer({
        achievements: newUnlocked,
        achievementPoints: (player.achievementPoints || 0) + achievement.points
      });

      soundManager.playSuccessSound();
      setShowNotification(achievement);

      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    }
  };

  useEffect(() => {
    achievementsData.achievements.forEach(achievement => {
      if (checkAchievement(achievement as Achievement)) {
        unlockAchievement(achievement as Achievement);
      }
    });
  }, [player]);

  const filteredAchievements = achievementsData.achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const totalPoints = achievementsData.achievements.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = achievementsData.achievements
    .filter(a => unlockedAchievements.includes(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  const completionRate = Math.floor((unlockedAchievements.length / achievementsData.achievements.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4">
      {/* Achievement Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{showNotification.icon}</div>
              <div>
                <div className="font-bold">업적 달성!</div>
                <div className="text-lg">{showNotification.name}</div>
                <div className="text-sm opacity-90">+{showNotification.points} 포인트</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">🏆 업적</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">달성률</div>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-full rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">획득 포인트</div>
              <div className="text-2xl font-bold">{earnedPoints} / {totalPoints}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm opacity-80">달성 업적</div>
              <div className="text-2xl font-bold">{unlockedAchievements.length} / {achievementsData.achievements.length}</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`relative rounded-xl p-4 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50'
                    : 'bg-black/30 border-2 border-white/10'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full">
                      ✓ 달성
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${isUnlocked ? '' : 'opacity-30 grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isUnlocked ? 'text-yellow-300' : 'text-white/70'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mt-1 ${isUnlocked ? 'text-white/90' : 'text-white/50'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm ${isUnlocked ? 'text-yellow-300' : 'text-white/40'}`}>
                        +{achievement.points} 포인트
                      </span>
                    </div>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Achievements;