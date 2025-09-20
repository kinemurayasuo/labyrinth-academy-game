import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import heroinesData from '../../data/characters.json';
import itemsData from '../../data/items.json';

interface CollectionItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity?: string;
  category: string;
}

const Collection: React.FC = () => {
  const { player } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('heroines');

  // 수집 데이터 초기화
  const collectionData = {
    heroines: player.metHeroines || [],
    monsters: player.defeatedMonsterTypes || [],
    items: player.collectedItems || [],
    endings: player.unlockedEndings || []
  };

  const categories = [
    { id: 'heroines', name: '히로인', icon: '💕' },
    { id: 'monsters', name: '몬스터', icon: '👾' },
    { id: 'items', name: '아이템', icon: '📦' },
    { id: 'endings', name: '엔딩', icon: '🎭' }
  ];

  // 히로인 컬렉션
  const heroineCollection = Object.entries(heroinesData).map(([id, heroine]: [string, any]) => ({
    id: id,
    name: heroine.name,
    description: heroine.role || '',
    icon: heroine.sprite || '👤',
    category: 'heroines',
    unlocked: collectionData.heroines.includes(id),
    affection: player.affection?.[id] || 0
  }));

  // 몬스터 컬렉션
  const monsterCollection = [
    { id: 'slime', name: '슬라임', description: '끈적끈적한 몬스터', icon: '🟢' },
    { id: 'goblin', name: '고블린', description: '작고 교활한 몬스터', icon: '👺' },
    { id: 'skeleton', name: '스켈레톤', description: '언데드 전사', icon: '💀' },
    { id: 'orc', name: '오크', description: '거대한 전사', icon: '👹' },
    { id: 'ghost', name: '유령', description: '영혼 몬스터', icon: '👻' },
    { id: 'vampire', name: '뱀파이어', description: '피를 빨아먹는 언데드', icon: '🧛' },
    { id: 'ice_golem', name: '얼음 골렘', description: '얼음으로 된 거인', icon: '🧊' },
    { id: 'frost_spirit', name: '서리 정령', description: '차가운 정령', icon: '❄️' },
    { id: 'lava_serpent', name: '용암 뱀', description: '불타는 뱀', icon: '🔥' },
    { id: 'flame_elemental', name: '화염 정령', description: '불의 정령', icon: '🔥' },
    { id: 'dark_knight', name: '다크 나이트', description: '타락한 기사 (보스)', icon: '⚔️' },
    { id: 'lich_king', name: '리치 킹', description: '언데드의 왕 (보스)', icon: '👑' },
    { id: 'ice_queen', name: '얼음 여왕', description: '얼음의 지배자 (보스)', icon: '👸' },
    { id: 'fire_dragon', name: '화염 드래곤', description: '불의 용 (보스)', icon: '🐉' }
  ].map(monster => ({
    ...monster,
    category: 'monsters',
    unlocked: collectionData.monsters.includes(monster.id)
  }));

  // 아이템 컬렉션
  const itemCollection = [
    { id: 'health_potion', name: '체력 포션', description: 'HP를 회복한다', icon: '🧪', rarity: 'common' },
    { id: 'mana_potion', name: '마나 포션', description: 'MP를 회복한다', icon: '💙', rarity: 'common' },
    { id: 'sword', name: '검', description: '기본적인 무기', icon: '⚔️', rarity: 'common' },
    { id: 'shield', name: '방패', description: '방어구', icon: '🛡️', rarity: 'common' },
    { id: 'magic_staff', name: '마법 지팡이', description: '마법 공격력 증가', icon: '🔮', rarity: 'rare' },
    { id: 'dragon_scale', name: '드래곤 비늘', description: '전설의 재료', icon: '🐉', rarity: 'legendary' },
    { id: 'phoenix_feather', name: '피닉스 깃털', description: '부활의 힘', icon: '🪶', rarity: 'legendary' },
    { id: 'crystal_heart', name: '크리스탈 하트', description: '순수한 마력의 결정', icon: '💎', rarity: 'epic' },
    { id: 'ancient_tome', name: '고대의 서', description: '잊혀진 지식', icon: '📚', rarity: 'epic' },
    { id: 'golden_apple', name: '황금 사과', description: '신의 과실', icon: '🍎', rarity: 'legendary' }
  ].map(item => ({
    ...item,
    category: 'items',
    unlocked: collectionData.items.includes(item.id)
  }));

  // 엔딩 컬렉션
  const endingCollection = [
    { id: 'true_end_luna', name: '루나 트루 엔딩', description: '루나와의 진정한 사랑', icon: '🌙' },
    { id: 'true_end_sakura', name: '사쿠라 트루 엔딩', description: '사쿠라와의 진정한 사랑', icon: '🌸' },
    { id: 'true_end_ice', name: '아이스 트루 엔딩', description: '아이스와의 진정한 사랑', icon: '❄️' },
    { id: 'true_end_rose', name: '로즈 트루 엔딩', description: '로즈와의 진정한 사랑', icon: '🌹' },
    { id: 'true_end_star', name: '스타 트루 엔딩', description: '스타와의 진정한 사랑', icon: '⭐' },
    { id: 'harem_ending', name: '하렘 엔딩', description: '모두와 함께하는 미래', icon: '👑' },
    { id: 'normal_ending', name: '노멀 엔딩', description: '평범한 학원 생활', icon: '🎓' },
    { id: 'bad_ending', name: '배드 엔딩', description: '슬픈 결말', icon: '💔' },
    { id: 'secret_ending', name: '시크릿 엔딩', description: '숨겨진 진실', icon: '🔐' },
    { id: 'legend_ending', name: '전설 엔딩', description: '전설이 되다', icon: '🏆' }
  ].map(ending => ({
    ...ending,
    category: 'endings',
    unlocked: collectionData.endings.includes(ending.id)
  }));

  const getCollectionItems = () => {
    switch (selectedCategory) {
      case 'heroines':
        return heroineCollection;
      case 'monsters':
        return monsterCollection;
      case 'items':
        return itemCollection;
      case 'endings':
        return endingCollection;
      default:
        return [];
    }
  };

  const collectionItems = getCollectionItems();
  const unlockedCount = collectionItems.filter(item => item.unlocked).length;
  const completionRate = Math.floor((unlockedCount / collectionItems.length) * 100);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-orange-400 to-red-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-indigo-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">📚 도감</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white/10 rounded-lg p-4 text-white">
            <div className="flex justify-between items-center mb-2">
              <span>수집률</span>
              <span className="font-bold">{unlockedCount} / {collectionItems.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-center mt-2 text-xl font-bold">{completionRate}%</div>
          </div>
        </div>

        {/* Category Tabs */}
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

        {/* Collection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collectionItems.map((item: any) => (
            <div
              key={item.id}
              className={`relative rounded-xl p-4 transition-all ${
                item.unlocked
                  ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30'
                  : 'bg-black/30 border-2 border-white/5'
              }`}
            >
              {/* Rarity Badge */}
              {item.rarity && item.unlocked && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(item.rarity)}`}>
                  {item.rarity.toUpperCase()}
                </div>
              )}

              {/* Icon */}
              <div className={`text-5xl text-center mb-3 ${item.unlocked ? '' : 'grayscale opacity-30'}`}>
                {item.unlocked ? item.icon : '❓'}
              </div>

              {/* Name */}
              <h3 className={`font-bold text-center ${item.unlocked ? 'text-white' : 'text-white/30'}`}>
                {item.unlocked ? item.name : '???'}
              </h3>

              {/* Description */}
              {item.unlocked && (
                <p className="text-xs text-white/70 text-center mt-2">
                  {item.description}
                </p>
              )}

              {/* Heroine Affection */}
              {item.category === 'heroines' && item.unlocked && (
                <div className="mt-3">
                  <div className="text-xs text-white/60 mb-1">호감도</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-400 to-red-400 h-full rounded-full"
                      style={{ width: `${Math.min(item.affection, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-white/80 mt-1">
                    {item.affection}/100
                  </div>
                </div>
              )}

              {/* Lock Icon for Locked Items */}
              {!item.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl opacity-20">🔒</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {collectionItems.length === 0 && (
          <div className="bg-black/30 backdrop-blur rounded-xl p-8 text-center text-white">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">아직 수집한 항목이 없습니다.</p>
            <p className="text-white/70 mt-2">게임을 플레이하며 다양한 컬렉션을 모아보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;