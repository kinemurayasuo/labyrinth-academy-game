import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'story' | 'combat' | 'social' | 'exploration' | 'collection' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimedReward: boolean;
  reward: {
    exp?: number;
    money?: number;
    items?: string[];
    stats?: Record<string, number>;
    title?: string;
    skin?: string;
    points: number;
  };
  condition: {
    type: string;
    target?: string;
    value: number;
  };
  hiddenUntilProgress?: number;
  dateCompleted?: string;
}

interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  achievements: Achievement[];
}

const AchievementRewards: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { updateStats, addItem, gainExperience, addGold, updatePlayer } = useGameStore((state: any) => state.actions);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [playerRank, setPlayerRank] = useState('');
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  // Achievement definitions
  const achievementList: Achievement[] = [
    // Story Achievements
    {
      id: 'first_meeting',
      name: '운명적인 만남',
      description: '첫 히로인과 만나다',
      icon: '💝',
      category: 'story',
      tier: 'bronze',
      progress: player.metHeroines?.length || 0,
      maxProgress: 1,
      completed: (player.metHeroines?.length || 0) >= 1,
      claimedReward: false,
      reward: { exp: 50, points: 10 },
      condition: { type: 'meet_heroine', value: 1 }
    },
    {
      id: 'all_heroines_met',
      name: '모두와의 인연',
      description: '모든 히로인과 만나다',
      icon: '👥',
      category: 'story',
      tier: 'gold',
      progress: player.metHeroines?.length || 0,
      maxProgress: 9,
      completed: (player.metHeroines?.length || 0) >= 9,
      claimedReward: false,
      reward: { exp: 500, money: 1000, title: '인기왕', points: 100 },
      condition: { type: 'meet_heroine', value: 9 }
    },
    {
      id: 'true_love',
      name: '진정한 사랑',
      description: '한 명의 히로인과 최대 호감도 달성',
      icon: '💖',
      category: 'story',
      tier: 'platinum',
      progress: Math.max(...Object.values(player.affection || {})),
      maxProgress: 100,
      completed: Math.max(...Object.values(player.affection || {})) >= 100,
      claimedReward: false,
      reward: { exp: 1000, items: ['loveRing'], title: '연인', points: 200 },
      condition: { type: 'max_affection', value: 100 }
    },
    {
      id: 'harem_master',
      name: '하렘 마스터',
      description: '5명의 히로인과 호감도 80 이상',
      icon: '👑',
      category: 'story',
      tier: 'diamond',
      progress: Object.values(player.affection || {}).filter((a: any) => a >= 80).length,
      maxProgress: 5,
      completed: Object.values(player.affection || {}).filter((a: any) => a >= 80).length >= 5,
      claimedReward: false,
      reward: { exp: 2000, money: 5000, title: '하렘왕', skin: 'golden_uniform', points: 500 },
      condition: { type: 'multiple_affection', value: 5 },
      hiddenUntilProgress: 3
    },

    // Combat Achievements
    {
      id: 'first_victory',
      name: '첫 승리',
      description: '전투에서 처음으로 승리',
      icon: '⚔️',
      category: 'combat',
      tier: 'bronze',
      progress: player.statistics?.monstersDefeated || 0,
      maxProgress: 1,
      completed: (player.statistics?.monstersDefeated || 0) >= 1,
      claimedReward: false,
      reward: { exp: 30, money: 50, points: 10 },
      condition: { type: 'defeat_monster', value: 1 }
    },
    {
      id: 'monster_hunter',
      name: '몬스터 헌터',
      description: '100마리의 몬스터 처치',
      icon: '🗡️',
      category: 'combat',
      tier: 'silver',
      progress: player.statistics?.monstersDefeated || 0,
      maxProgress: 100,
      completed: (player.statistics?.monstersDefeated || 0) >= 100,
      claimedReward: false,
      reward: { exp: 300, items: ['hunterBadge'], points: 50 },
      condition: { type: 'defeat_monster', value: 100 }
    },
    {
      id: 'boss_slayer',
      name: '보스 슬레이어',
      description: '10명의 보스 몬스터 처치',
      icon: '🏆',
      category: 'combat',
      tier: 'gold',
      progress: player.defeatedBosses?.length || 0,
      maxProgress: 10,
      completed: (player.defeatedBosses?.length || 0) >= 10,
      claimedReward: false,
      reward: { exp: 800, items: ['legendaryWeapon'], title: '용사', points: 100 },
      condition: { type: 'defeat_boss', value: 10 }
    },
    {
      id: 'undefeated',
      name: '불패의 전사',
      description: '전투에서 50연승',
      icon: '🛡️',
      category: 'combat',
      tier: 'platinum',
      progress: player.statistics?.winStreak || 0,
      maxProgress: 50,
      completed: (player.statistics?.winStreak || 0) >= 50,
      claimedReward: false,
      reward: { exp: 1500, stats: { strength: 10, defense: 10 }, title: '불패', points: 200 },
      condition: { type: 'win_streak', value: 50 }
    },

    // Social Achievements
    {
      id: 'popular',
      name: '인기인',
      description: '총 호감도 300 달성',
      icon: '🌟',
      category: 'social',
      tier: 'silver',
      progress: Object.values(player.affection || {}).reduce((a: number, b: any) => a + b, 0),
      maxProgress: 300,
      completed: Object.values(player.affection || {}).reduce((a: number, b: any) => a + b, 0) >= 300,
      claimedReward: false,
      reward: { exp: 200, stats: { charm: 5 }, points: 50 },
      condition: { type: 'total_affection', value: 300 }
    },
    {
      id: 'gift_giver',
      name: '선물의 달인',
      description: '50개의 선물 전달',
      icon: '🎁',
      category: 'social',
      tier: 'silver',
      progress: player.statistics?.giftsGiven || 0,
      maxProgress: 50,
      completed: (player.statistics?.giftsGiven || 0) >= 50,
      claimedReward: false,
      reward: { exp: 250, money: 500, points: 50 },
      condition: { type: 'give_gifts', value: 50 }
    },
    {
      id: 'club_president',
      name: '동아리 회장',
      description: '3개 동아리 가입',
      icon: '🎓',
      category: 'social',
      tier: 'gold',
      progress: player.joinedClubs?.length || 0,
      maxProgress: 3,
      completed: (player.joinedClubs?.length || 0) >= 3,
      claimedReward: false,
      reward: { exp: 400, stats: { intelligence: 5, charm: 3 }, points: 100 },
      condition: { type: 'join_clubs', value: 3 }
    },

    // Exploration Achievements
    {
      id: 'explorer',
      name: '탐험가',
      description: '모든 지역 방문',
      icon: '🗺️',
      category: 'exploration',
      tier: 'silver',
      progress: player.visitedLocations?.length || 0,
      maxProgress: 15,
      completed: (player.visitedLocations?.length || 0) >= 15,
      claimedReward: false,
      reward: { exp: 300, items: ['explorerMap'], points: 50 },
      condition: { type: 'visit_locations', value: 15 }
    },
    {
      id: 'dungeon_master',
      name: '던전 마스터',
      description: '던전 최하층 도달',
      icon: '🏰',
      category: 'exploration',
      tier: 'gold',
      progress: player.dungeonProgress?.maxFloorReached || 1,
      maxProgress: 50,
      completed: (player.dungeonProgress?.maxFloorReached || 1) >= 50,
      claimedReward: false,
      reward: { exp: 1000, items: ['dungeonKey'], title: '던전 정복자', points: 100 },
      condition: { type: 'dungeon_floor', value: 50 }
    },
    {
      id: 'treasure_hunter',
      name: '보물 사냥꾼',
      description: '30개의 보물 상자 발견',
      icon: '💎',
      category: 'exploration',
      tier: 'silver',
      progress: player.statistics?.treasuresFound || 0,
      maxProgress: 30,
      completed: (player.statistics?.treasuresFound || 0) >= 30,
      claimedReward: false,
      reward: { exp: 400, money: 1000, points: 50 },
      condition: { type: 'find_treasure', value: 30 }
    },

    // Collection Achievements
    {
      id: 'collector',
      name: '수집가',
      description: '50종류의 아이템 수집',
      icon: '📦',
      category: 'collection',
      tier: 'silver',
      progress: player.collectedItems?.length || 0,
      maxProgress: 50,
      completed: (player.collectedItems?.length || 0) >= 50,
      claimedReward: false,
      reward: { exp: 350, items: ['collectorBadge'], points: 50 },
      condition: { type: 'collect_items', value: 50 }
    },
    {
      id: 'fashion_master',
      name: '패션 마스터',
      description: '10개의 의상 수집',
      icon: '👗',
      category: 'collection',
      tier: 'gold',
      progress: player.collectedOutfits?.length || 0,
      maxProgress: 10,
      completed: (player.collectedOutfits?.length || 0) >= 10,
      claimedReward: false,
      reward: { exp: 500, skin: 'designer_outfit', points: 100 },
      condition: { type: 'collect_outfits', value: 10 }
    },
    {
      id: 'card_master',
      name: '카드 마스터',
      description: '모든 히로인 카드 수집',
      icon: '🎴',
      category: 'collection',
      tier: 'platinum',
      progress: player.collectedCards?.length || 0,
      maxProgress: 45,
      completed: (player.collectedCards?.length || 0) >= 45,
      claimedReward: false,
      reward: { exp: 1200, items: ['goldenCard'], title: '카드 마스터', points: 200 },
      condition: { type: 'collect_cards', value: 45 }
    },

    // Special Achievements
    {
      id: 'perfect_day',
      name: '완벽한 하루',
      description: '하루에 모든 활동 완료',
      icon: '⭐',
      category: 'special',
      tier: 'gold',
      progress: player.statistics?.perfectDays || 0,
      maxProgress: 1,
      completed: (player.statistics?.perfectDays || 0) >= 1,
      claimedReward: false,
      reward: { exp: 600, stats: { luck: 10 }, points: 100 },
      condition: { type: 'perfect_day', value: 1 }
    },
    {
      id: 'minigame_champion',
      name: '미니게임 챔피언',
      description: '모든 미니게임에서 최고 점수 달성',
      icon: '🎮',
      category: 'special',
      tier: 'platinum',
      progress: player.statistics?.minigameHighScores || 0,
      maxProgress: 6,
      completed: (player.statistics?.minigameHighScores || 0) >= 6,
      claimedReward: false,
      reward: { exp: 1500, money: 2000, title: '게임 마스터', points: 200 },
      condition: { type: 'minigame_master', value: 6 }
    },
    {
      id: 'true_ending',
      name: '진엔딩',
      description: '진정한 엔딩 달성',
      icon: '🌈',
      category: 'special',
      tier: 'diamond',
      progress: player.unlockedEndings?.includes('true') ? 1 : 0,
      maxProgress: 1,
      completed: player.unlockedEndings?.includes('true') || false,
      claimedReward: false,
      reward: { exp: 5000, items: ['infinityGem'], title: '전설', skin: 'legendary_outfit', points: 500 },
      condition: { type: 'true_ending', value: 1 },
      hiddenUntilProgress: 1
    },
    {
      id: 'all_endings',
      name: '모든 이야기',
      description: '모든 엔딩 확인',
      icon: '📚',
      category: 'special',
      tier: 'diamond',
      progress: player.unlockedEndings?.length || 0,
      maxProgress: 10,
      completed: (player.unlockedEndings?.length || 0) >= 10,
      claimedReward: false,
      reward: { exp: 3000, items: ['memoryBook'], title: '이야기꾼', points: 500 },
      condition: { type: 'all_endings', value: 10 },
      hiddenUntilProgress: 5
    },
    {
      id: 'speedrun',
      name: '스피드런',
      description: '15일 안에 엔딩 달성',
      icon: '⚡',
      category: 'special',
      tier: 'platinum',
      progress: player.speedrunDays || 999,
      maxProgress: 15,
      completed: (player.speedrunDays || 999) <= 15,
      claimedReward: false,
      reward: { exp: 2000, stats: { agility: 20 }, title: '번개', points: 200 },
      condition: { type: 'speedrun', value: 15 }
    }
  ];

  // Achievement categories
  const categories: AchievementCategory[] = [
    { id: 'all', name: '전체', icon: '🏅', color: 'gray', achievements: achievementList },
    { id: 'story', name: '스토리', icon: '📖', color: 'purple', achievements: achievementList.filter(a => a.category === 'story') },
    { id: 'combat', name: '전투', icon: '⚔️', color: 'red', achievements: achievementList.filter(a => a.category === 'combat') },
    { id: 'social', name: '사교', icon: '💬', color: 'pink', achievements: achievementList.filter(a => a.category === 'social') },
    { id: 'exploration', name: '탐험', icon: '🗺️', color: 'blue', achievements: achievementList.filter(a => a.category === 'exploration') },
    { id: 'collection', name: '수집', icon: '📦', color: 'yellow', achievements: achievementList.filter(a => a.category === 'collection') },
    { id: 'special', name: '특별', icon: '🌟', color: 'orange', achievements: achievementList.filter(a => a.category === 'special') }
  ];

  // Calculate player rank based on total points
  const calculateRank = (points: number): string => {
    if (points >= 5000) return '전설';
    if (points >= 3000) return '마스터';
    if (points >= 2000) return '다이아몬드';
    if (points >= 1000) return '플래티넘';
    if (points >= 500) return '골드';
    if (points >= 200) return '실버';
    if (points >= 50) return '브론즈';
    return '초보자';
  };

  // Get tier color
  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'from-orange-600 to-orange-400';
      case 'silver': return 'from-gray-400 to-gray-300';
      case 'gold': return 'from-yellow-500 to-yellow-400';
      case 'platinum': return 'from-blue-400 to-blue-300';
      case 'diamond': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  // Claim achievement reward
  const claimReward = (achievement: Achievement) => {
    if (!achievement.completed || achievement.claimedReward) return;

    setShowRewardAnimation(true);

    // Apply rewards
    const rewards = achievement.reward;
    if (rewards.exp) gainExperience(rewards.exp);
    if (rewards.money) addGold(rewards.money);
    if (rewards.items) rewards.items.forEach(item => addItem(item));
    if (rewards.stats) updateStats(rewards.stats);
    if (rewards.title) {
      updatePlayer({ currentTitle: rewards.title });
    }
    if (rewards.skin) {
      updatePlayer({ unlockedSkins: [...(player.unlockedSkins || []), rewards.skin] });
    }

    // Mark as claimed
    const updatedAchievements = achievements.map(a =>
      a.id === achievement.id ? { ...a, claimedReward: true } : a
    );
    setAchievements(updatedAchievements);

    // Update total points
    setTotalPoints(prev => prev + rewards.points);

    setTimeout(() => {
      setShowRewardAnimation(false);
      setSelectedAchievement(null);
    }, 2000);
  };

  // Check for newly unlocked achievements
  useEffect(() => {
    const newUnlocks: string[] = [];
    achievementList.forEach(achievement => {
      if (achievement.completed && !player.achievements?.includes(achievement.id)) {
        newUnlocks.push(achievement.id);
      }
    });
    setNewlyUnlocked(newUnlocks);
    setAchievements(achievementList);

    // Calculate total points
    const points = achievementList
      .filter(a => a.completed && a.claimedReward)
      .reduce((sum, a) => sum + a.reward.points, 0);
    setTotalPoints(player.achievementPoints || points);
    setPlayerRank(calculateRank(player.achievementPoints || points));
  }, [player]);

  // Filter achievements
  const getFilteredAchievements = () => {
    const category = categories.find(c => c.id === selectedCategory);
    let filtered = category?.achievements || [];

    // Apply completion filter
    if (filter === 'completed') {
      filtered = filtered.filter(a => a.completed);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(a => !a.completed);
    }

    // Hide hidden achievements until progress
    filtered = filtered.filter(a => {
      if (a.hiddenUntilProgress) {
        return a.progress >= a.hiddenUntilProgress;
      }
      return true;
    });

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                🏆 업적 & 보상
              </h1>
              <p className="text-text-secondary">
                도전 과제를 완료하고 특별한 보상을 획득하세요!
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

        {/* Player Stats */}
        <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-purple-400">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm text-gray-300">총 포인트</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{playerRank}</div>
              <div className="text-sm text-gray-300">현재 등급</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {achievements.filter(a => a.completed).length}/{achievements.length}
              </div>
              <div className="text-sm text-gray-300">완료된 업적</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-gray-300">완성도</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 mb-6 border border-purple-500">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.icon} {category.name}
                <span className="ml-2 text-xs">
                  ({category.achievements.filter(a => a.completed).length}/{category.achievements.length})
                </span>
              </button>
            ))}
          </div>

          {/* Filter Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              완료
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`px-3 py-1 rounded text-sm ${filter === 'incomplete' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              미완료
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredAchievements().map(achievement => (
            <div
              key={achievement.id}
              className={`bg-gradient-to-br ${
                achievement.completed ? 'from-green-900/50 to-blue-900/50' : 'from-gray-900/50 to-gray-800/50'
              } backdrop-blur-md rounded-lg p-4 border ${
                achievement.completed ? 'border-green-500' : 'border-gray-600'
              } ${newlyUnlocked.includes(achievement.id) ? 'animate-pulse ring-2 ring-yellow-400' : ''}
              hover:scale-[1.02] transition-all cursor-pointer`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              {/* Achievement Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{achievement.icon}</div>
                <div className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`}>
                  {achievement.tier.toUpperCase()}
                </div>
              </div>

              {/* Achievement Info */}
              <h3 className="text-lg font-bold text-white mb-1">{achievement.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>진행도</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      achievement.completed ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Reward Info */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  +{achievement.reward.points} pts
                </div>
                {achievement.completed && !achievement.claimedReward && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      claimReward(achievement);
                    }}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded font-bold animate-bounce"
                  >
                    보상 받기
                  </button>
                )}
                {achievement.completed && achievement.claimedReward && (
                  <span className="text-xs text-green-400">✓ 수령 완료</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className={`bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full border-2 ${
              selectedAchievement.completed ? 'border-green-500' : 'border-gray-500'
            }`}>
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedAchievement.icon}</div>
                <h2 className="text-2xl font-bold text-white">{selectedAchievement.name}</h2>
                <div className={`inline-block px-3 py-1 rounded text-sm font-bold bg-gradient-to-r ${
                  getTierColor(selectedAchievement.tier)
                } text-white mt-2`}>
                  {selectedAchievement.tier.toUpperCase()}
                </div>
              </div>

              <p className="text-gray-300 mb-4">{selectedAchievement.description}</p>

              {/* Progress */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-white mb-2">
                  <span>진행도</span>
                  <span className="font-bold">
                    {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      selectedAchievement.completed
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (selectedAchievement.progress / selectedAchievement.maxProgress) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <h3 className="text-lg font-bold text-white mb-2">보상</h3>
                <div className="space-y-1 text-sm">
                  {selectedAchievement.reward.exp && (
                    <div className="text-yellow-300">• 경험치 +{selectedAchievement.reward.exp}</div>
                  )}
                  {selectedAchievement.reward.money && (
                    <div className="text-green-300">• 골드 +{selectedAchievement.reward.money}</div>
                  )}
                  {selectedAchievement.reward.items && (
                    <div className="text-blue-300">
                      • 아이템: {selectedAchievement.reward.items.join(', ')}
                    </div>
                  )}
                  {selectedAchievement.reward.stats && (
                    <div className="text-purple-300">
                      • 스탯 보너스: {Object.entries(selectedAchievement.reward.stats)
                        .map(([stat, value]) => `${stat} +${value}`)
                        .join(', ')}
                    </div>
                  )}
                  {selectedAchievement.reward.title && (
                    <div className="text-pink-300">• 칭호: {selectedAchievement.reward.title}</div>
                  )}
                  {selectedAchievement.reward.skin && (
                    <div className="text-orange-300">• 스킨: {selectedAchievement.reward.skin}</div>
                  )}
                  <div className="text-white font-bold">• 업적 포인트 +{selectedAchievement.reward.points}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedAchievement.completed && !selectedAchievement.claimedReward ? (
                  <button
                    onClick={() => claimReward(selectedAchievement)}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg font-bold transition animate-pulse"
                  >
                    보상 받기
                  </button>
                ) : selectedAchievement.completed ? (
                  <div className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold text-center">
                    ✓ 수령 완료
                  </div>
                ) : (
                  <div className="flex-1 py-3 bg-gray-600 text-gray-400 rounded-lg font-bold text-center">
                    미완료
                  </div>
                )}
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reward Animation */}
        {showRewardAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementRewards;