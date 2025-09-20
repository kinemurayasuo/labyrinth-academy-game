import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  icon: string;
  level: number;
  maxLevel: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseStats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    speed?: number;
  };
  enhancedStats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    speed?: number;
  };
  enhancementCost: number;
  successRate: number;
}

interface EnhancementMaterial {
  id: string;
  name: string;
  icon: string;
  successBonus: number;
  protectItem: boolean;
  quantity: number;
}

const ItemEnhancement: React.FC = () => {
  const { player } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<EnhancementMaterial[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<{
    success: boolean;
    newLevel?: number;
    destroyed?: boolean;
  } | null>(null);

  const playerItems: Item[] = [
    {
      id: '1',
      name: '초보자의 검',
      type: 'weapon',
      icon: '⚔️',
      level: 0,
      maxLevel: 15,
      rarity: 'common',
      baseStats: { attack: 10 },
      enhancedStats: { attack: 10 },
      enhancementCost: 100,
      successRate: 95
    },
    {
      id: '2',
      name: '강철 갑옷',
      type: 'armor',
      icon: '🛡️',
      level: 3,
      maxLevel: 15,
      rarity: 'rare',
      baseStats: { defense: 15, hp: 50 },
      enhancedStats: { defense: 20, hp: 65 },
      enhancementCost: 200,
      successRate: 80
    },
    {
      id: '3',
      name: '마법의 반지',
      type: 'accessory',
      icon: '💍',
      level: 5,
      maxLevel: 20,
      rarity: 'epic',
      baseStats: { mp: 30, speed: 5 },
      enhancedStats: { mp: 45, speed: 8 },
      enhancementCost: 500,
      successRate: 65
    },
    {
      id: '4',
      name: '용의 검',
      type: 'weapon',
      icon: '🗡️',
      level: 7,
      maxLevel: 25,
      rarity: 'legendary',
      baseStats: { attack: 50, speed: 10 },
      enhancedStats: { attack: 85, speed: 17 },
      enhancementCost: 1000,
      successRate: 45
    },
    {
      id: '5',
      name: '빛의 목걸이',
      type: 'accessory',
      icon: '📿',
      level: 1,
      maxLevel: 15,
      rarity: 'rare',
      baseStats: { hp: 30, mp: 20 },
      enhancedStats: { hp: 35, mp: 23 },
      enhancementCost: 150,
      successRate: 88
    }
  ];

  const enhancementMaterials: EnhancementMaterial[] = [
    {
      id: 'blessing',
      name: '축복의 주문서',
      icon: '📜',
      successBonus: 10,
      protectItem: false,
      quantity: 5
    },
    {
      id: 'protection',
      name: '보호의 주문서',
      icon: '🛡️',
      successBonus: 0,
      protectItem: true,
      quantity: 3
    },
    {
      id: 'lucky',
      name: '행운의 돌',
      icon: '🍀',
      successBonus: 20,
      protectItem: false,
      quantity: 2
    },
    {
      id: 'master',
      name: '장인의 망치',
      icon: '🔨',
      successBonus: 30,
      protectItem: true,
      quantity: 1
    }
  ];

  const calculateSuccessRate = () => {
    if (!selectedItem) return 0;

    let baseRate = selectedItem.successRate - (selectedItem.level * 5);
    baseRate = Math.max(10, baseRate); // Minimum 10% success rate

    const materialBonus = selectedMaterials.reduce((acc, mat) => acc + mat.successBonus, 0);
    return Math.min(100, baseRate + materialBonus);
  };

  const calculateCost = () => {
    if (!selectedItem) return 0;
    return selectedItem.enhancementCost * (selectedItem.level + 1);
  };

  const performEnhancement = () => {
    if (!selectedItem || enhancing) return;

    setEnhancing(true);
    setEnhancementResult(null);

    setTimeout(() => {
      const successRate = calculateSuccessRate();
      const random = Math.random() * 100;
      const success = random < successRate;

      if (success) {
        // Enhancement successful
        const newLevel = selectedItem.level + 1;
        const statIncrease = Math.floor((newLevel / 3) + 1);

        setSelectedItem({
          ...selectedItem,
          level: newLevel,
          enhancedStats: {
            attack: selectedItem.baseStats.attack
              ? selectedItem.baseStats.attack + (statIncrease * 3)
              : undefined,
            defense: selectedItem.baseStats.defense
              ? selectedItem.baseStats.defense + (statIncrease * 2)
              : undefined,
            hp: selectedItem.baseStats.hp
              ? selectedItem.baseStats.hp + (statIncrease * 10)
              : undefined,
            mp: selectedItem.baseStats.mp
              ? selectedItem.baseStats.mp + (statIncrease * 5)
              : undefined,
            speed: selectedItem.baseStats.speed
              ? selectedItem.baseStats.speed + statIncrease
              : undefined
          }
        });

        setEnhancementResult({
          success: true,
          newLevel: newLevel
        });
      } else {
        // Enhancement failed
        const hasProtection = selectedMaterials.some(mat => mat.protectItem);

        if (!hasProtection && selectedItem.level >= 10) {
          // Item destroyed
          setEnhancementResult({
            success: false,
            destroyed: true
          });
          setSelectedItem(null);
        } else if (!hasProtection && selectedItem.level >= 5) {
          // Level decreased
          setSelectedItem({
            ...selectedItem,
            level: Math.max(0, selectedItem.level - 1)
          });
          setEnhancementResult({
            success: false,
            newLevel: Math.max(0, selectedItem.level - 1)
          });
        } else {
          // Just failed, no penalty
          setEnhancementResult({
            success: false
          });
        }
      }

      setEnhancing(false);
      setSelectedMaterials([]);
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-white">🔨 아이템 강화</h1>
          <div className="mt-2 text-white/70">
            아이템을 강화하여 더 강력하게 만드세요! 높은 강화 단계일수록 실패 위험이 증가합니다.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Inventory */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4">보유 아이템</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {playerItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-all text-left ${
                    selectedItem?.id === item.id ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <div className={`font-bold ${getRarityTextColor(item.rarity)}`}>
                          {item.name} {item.level > 0 && `+${item.level}`}
                        </div>
                        <div className="text-xs text-white/60">
                          {item.type === 'weapon' ? '무기' : item.type === 'armor' ? '방어구' : '액세서리'}
                        </div>
                      </div>
                    </div>
                    {item.level === item.maxLevel && (
                      <div className="text-xs text-yellow-400 font-bold">MAX</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhancement Panel */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4">강화 정보</h2>
            {selectedItem ? (
              <div className="space-y-4">
                {/* Selected Item Display */}
                <div className={`bg-gradient-to-r ${getRarityColor(selectedItem.rarity)} p-4 rounded-lg`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedItem.icon}</div>
                    <div className="text-xl font-bold text-white">
                      {selectedItem.name} +{selectedItem.level}
                    </div>
                    <div className="text-white/80">
                      {selectedItem.level} / {selectedItem.maxLevel}
                    </div>
                  </div>
                </div>

                {/* Current Stats */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm font-bold text-white mb-2">현재 능력치</div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(selectedItem.enhancedStats).map(([stat, value]) => (
                      value && (
                        <div key={stat} className="flex justify-between text-white/80">
                          <span>{stat === 'attack' ? '공격력' : stat === 'defense' ? '방어력' : stat.toUpperCase()}</span>
                          <span className="text-green-400">+{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Next Level Preview */}
                {selectedItem.level < selectedItem.maxLevel && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm font-bold text-white mb-2">강화 시 (+{selectedItem.level + 1})</div>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedItem.enhancedStats).map(([stat, value]) => {
                        if (!value) return null;
                        const increase = Math.floor(((selectedItem.level + 1) / 3) + 1) *
                          (stat === 'attack' ? 3 : stat === 'defense' ? 2 : stat === 'hp' ? 10 : stat === 'mp' ? 5 : 1);
                        return (
                          <div key={stat} className="flex justify-between text-white/80">
                            <span>{stat === 'attack' ? '공격력' : stat === 'defense' ? '방어력' : stat.toUpperCase()}</span>
                            <span className="text-yellow-400">+{value + increase - value} (총 {value + increase - value})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Enhancement Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>성공 확률</span>
                    <span className={`font-bold ${calculateSuccessRate() >= 70 ? 'text-green-400' : calculateSuccessRate() >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {calculateSuccessRate()}%
                    </span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>강화 비용</span>
                    <span className="text-yellow-400">{calculateCost()} G</span>
                  </div>
                  {selectedItem.level >= 5 && (
                    <div className="text-xs text-red-400">
                      ⚠️ 실패 시 {selectedItem.level >= 10 ? '아이템이 파괴될 수 있습니다' : '강화 레벨이 하락할 수 있습니다'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 py-8">
                강화할 아이템을 선택하세요
              </div>
            )}
          </div>

          {/* Materials & Enhancement */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4">강화 재료</h2>
            <div className="space-y-2 mb-4">
              {enhancementMaterials.map(material => (
                <div
                  key={material.id}
                  className="bg-white/10 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{material.icon}</div>
                    <div>
                      <div className="text-white font-bold text-sm">{material.name}</div>
                      <div className="text-xs text-white/60">
                        {material.successBonus > 0 && `성공률 +${material.successBonus}%`}
                        {material.protectItem && '아이템 보호'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm">x{material.quantity}</span>
                    {material.quantity > 0 && (
                      <button
                        onClick={() => {
                          if (!selectedMaterials.find(m => m.id === material.id)) {
                            setSelectedMaterials([...selectedMaterials, material]);
                          } else {
                            setSelectedMaterials(selectedMaterials.filter(m => m.id !== material.id));
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                          selectedMaterials.find(m => m.id === material.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 text-white/70 hover:bg-white/30'
                        }`}
                      >
                        {selectedMaterials.find(m => m.id === material.id) ? '사용중' : '사용'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Materials */}
            {selectedMaterials.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <div className="text-sm font-bold text-white mb-2">사용할 재료</div>
                <div className="flex gap-2 flex-wrap">
                  {selectedMaterials.map(mat => (
                    <div key={mat.id} className="bg-white/20 rounded px-2 py-1 text-xs text-white flex items-center gap-1">
                      <span>{mat.icon}</span>
                      <span>{mat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhancement Button */}
            {selectedItem && selectedItem.level < selectedItem.maxLevel && (
              <button
                onClick={performEnhancement}
                disabled={enhancing || (player.gold || 0) < calculateCost()}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                  enhancing
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : (player.gold || 0) < calculateCost()
                    ? 'bg-red-600/50 text-red-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105'
                }`}
              >
                {enhancing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin">⚙️</div>
                    강화 중...
                  </div>
                ) : (player.gold || 0) < calculateCost() ? (
                  '골드 부족'
                ) : (
                  '강화 시작'
                )}
              </button>
            )}

            {/* Enhancement Result */}
            {enhancementResult && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                enhancementResult.success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <div className="text-3xl mb-2">
                  {enhancementResult.success ? '✨' : enhancementResult.destroyed ? '💔' : '❌'}
                </div>
                <div className="text-white font-bold">
                  {enhancementResult.success
                    ? `강화 성공! (+${enhancementResult.newLevel})`
                    : enhancementResult.destroyed
                    ? '아이템이 파괴되었습니다...'
                    : enhancementResult.newLevel !== undefined
                    ? `강화 실패... (+${enhancementResult.newLevel})`
                    : '강화 실패'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEnhancement;