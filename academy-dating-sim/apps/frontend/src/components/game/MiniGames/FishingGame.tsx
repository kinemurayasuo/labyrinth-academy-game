import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import soundManager from '../../../utils/soundManager';

interface Fish {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  size: number;
  value: number;
  difficulty: number;
}

const FishingGame: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [isFishing, setIsFishing] = useState(false);
  const [hasFish, setHasFish] = useState(false);
  const [currentFish, setCurrentFish] = useState<Fish | null>(null);
  const [fishingPower, setFishingPower] = useState(50);
  const [isReeling, setIsReeling] = useState(false);
  const [fishPosition, setFishPosition] = useState(50);
  const [caughtFishes, setCaughtFishes] = useState<Fish[]>([]);
  const [baitType, setBaitType] = useState<'basic' | 'premium' | 'special'>('basic');
  const [fishingRod, setFishingRod] = useState<'wooden' | 'iron' | 'golden'>('wooden');
  const powerBarRef = useRef<HTMLDivElement>(null);

  const fishes: Fish[] = [
    // Common
    { id: 'minnow', name: '피라미', icon: '🐟', rarity: 'common', size: 5, value: 50, difficulty: 10 },
    { id: 'carp', name: '잉어', icon: '🐠', rarity: 'common', size: 15, value: 100, difficulty: 20 },
    { id: 'bass', name: '배스', icon: '🐟', rarity: 'common', size: 20, value: 150, difficulty: 25 },

    // Rare
    { id: 'salmon', name: '연어', icon: '🍣', rarity: 'rare', size: 30, value: 300, difficulty: 40 },
    { id: 'tuna', name: '참치', icon: '🐟', rarity: 'rare', size: 40, value: 500, difficulty: 50 },
    { id: 'eel', name: '장어', icon: '🐍', rarity: 'rare', size: 25, value: 400, difficulty: 45 },

    // Epic
    { id: 'swordfish', name: '황새치', icon: '⚔️', rarity: 'epic', size: 60, value: 1000, difficulty: 70 },
    { id: 'shark', name: '상어', icon: '🦈', rarity: 'epic', size: 80, value: 1500, difficulty: 80 },
    { id: 'octopus', name: '문어', icon: '🐙', rarity: 'epic', size: 35, value: 800, difficulty: 60 },

    // Legendary
    { id: 'golden_fish', name: '황금 물고기', icon: '🏆', rarity: 'legendary', size: 50, value: 5000, difficulty: 90 },
    { id: 'dragon_fish', name: '용왕의 물고기', icon: '🐉', rarity: 'legendary', size: 100, value: 10000, difficulty: 95 },
    { id: 'mermaid_tear', name: '인어의 눈물', icon: '💎', rarity: 'legendary', size: 1, value: 20000, difficulty: 100 }
  ];

  const baits = {
    basic: { name: '기본 미끼', cost: 10, bonus: 0, icon: '🪱' },
    premium: { name: '고급 미끼', cost: 50, bonus: 20, icon: '🦐' },
    special: { name: '특수 미끼', cost: 200, bonus: 50, icon: '✨' }
  };

  const rods = {
    wooden: { name: '나무 낚싯대', power: 1, cost: 0, icon: '🎣' },
    iron: { name: '철제 낚싯대', power: 1.5, cost: 1000, icon: '🔧' },
    golden: { name: '황금 낚싯대', power: 2, cost: 5000, icon: '⭐' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isFishing && !hasFish) {
      // 물고기가 미끼를 물 확률
      const baitBonus = baits[baitType].bonus;
      const fishChance = 20 + baitBonus;

      interval = setInterval(() => {
        if (Math.random() * 100 < fishChance) {
          const fish = selectRandomFish();
          setCurrentFish(fish);
          setHasFish(true);
          soundManager.playNotificationSound();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isFishing, hasFish, baitType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isReeling && currentFish) {
      interval = setInterval(() => {
        // 물고기가 저항
        const resistance = currentFish.difficulty / 100;
        const rodPower = rods[fishingRod].power;

        setFishPosition(prev => {
          const newPos = prev + (Math.random() - 0.5) * resistance * 20;
          return Math.max(0, Math.min(100, newPos));
        });

        setFishingPower(prev => {
          const drain = resistance * 2;
          const newPower = prev - drain;

          if (newPower <= 0) {
            // 실패
            setIsReeling(false);
            setHasFish(false);
            setCurrentFish(null);
            setFishingPower(50);
            alert('물고기가 도망갔습니다!');
            return 50;
          }

          return newPower;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isReeling, currentFish, fishingRod]);

  const selectRandomFish = (): Fish => {
    const rand = Math.random() * 100;
    let fishPool: Fish[];

    if (baitType === 'special') {
      if (rand < 10) fishPool = fishes.filter(f => f.rarity === 'legendary');
      else if (rand < 30) fishPool = fishes.filter(f => f.rarity === 'epic');
      else if (rand < 60) fishPool = fishes.filter(f => f.rarity === 'rare');
      else fishPool = fishes.filter(f => f.rarity === 'common');
    } else if (baitType === 'premium') {
      if (rand < 5) fishPool = fishes.filter(f => f.rarity === 'legendary');
      else if (rand < 20) fishPool = fishes.filter(f => f.rarity === 'epic');
      else if (rand < 50) fishPool = fishes.filter(f => f.rarity === 'rare');
      else fishPool = fishes.filter(f => f.rarity === 'common');
    } else {
      if (rand < 1) fishPool = fishes.filter(f => f.rarity === 'legendary');
      else if (rand < 10) fishPool = fishes.filter(f => f.rarity === 'epic');
      else if (rand < 30) fishPool = fishes.filter(f => f.rarity === 'rare');
      else fishPool = fishes.filter(f => f.rarity === 'common');
    }

    return fishPool[Math.floor(Math.random() * fishPool.length)];
  };

  const startFishing = () => {
    const baitCost = baits[baitType].cost;

    if ((player.gold || 0) < baitCost) {
      alert('미끼를 살 골드가 부족합니다!');
      return;
    }

    updatePlayer({ gold: (player.gold || 0) - baitCost });
    setIsFishing(true);
    setHasFish(false);
    setFishingPower(50);
  };

  const stopFishing = () => {
    setIsFishing(false);
    setHasFish(false);
    setCurrentFish(null);
    setIsReeling(false);
    setFishingPower(50);
  };

  const startReeling = () => {
    if (!hasFish || !currentFish) return;
    setIsReeling(true);
  };

  const pullFish = () => {
    if (!isReeling || !currentFish) return;

    const rodPower = rods[fishingRod].power;
    const pullStrength = 10 * rodPower;

    setFishingPower(prev => Math.min(100, prev + pullStrength));

    if (fishingPower > 80 && Math.abs(fishPosition - 50) < 20) {
      // 성공!
      catchFish(currentFish);
    }
  };

  const catchFish = (fish: Fish) => {
    setCaughtFishes([...caughtFishes, fish]);
    updatePlayer({
      gold: (player.gold || 0) + fish.value,
      experience: player.experience + fish.size * 10
    });

    soundManager.playSuccessSound();
    alert(`${fish.name}을(를) 잡았습니다! +${fish.value} 골드`);

    setIsReeling(false);
    setHasFish(false);
    setCurrentFish(null);
    setFishingPower(50);
    setIsFishing(false);
  };

  const buyRod = (rodType: 'iron' | 'golden') => {
    const rod = rods[rodType];

    if ((player.gold || 0) < rod.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    updatePlayer({ gold: (player.gold || 0) - rod.cost });
    setFishingRod(rodType);
    soundManager.playSuccessSound();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-orange-400 to-red-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-indigo-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🎣 낚시터</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>
        </div>

        {/* Fishing Area */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="relative h-64 bg-gradient-to-b from-cyan-600/50 to-blue-800/50 rounded-xl overflow-hidden mb-4">
            {/* Water Animation */}
            <div className="absolute inset-0">
              <div className="wave wave1"></div>
              <div className="wave wave2"></div>
            </div>

            {/* Fishing Line */}
            {isFishing && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="w-0.5 h-48 bg-white/50"></div>
                <div className="text-2xl transform -translate-x-1/2">
                  {hasFish ? '❗' : '🪝'}
                </div>
              </div>
            )}

            {/* Fish Indicator */}
            {hasFish && currentFish && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="text-4xl animate-pulse">{currentFish.icon}</div>
              </div>
            )}
          </div>

          {/* Reeling Minigame */}
          {isReeling && currentFish && (
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <div className="mb-2 text-white font-bold">
                {currentFish.name}을(를) 낚는 중!
              </div>

              {/* Power Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>파워</span>
                  <span>{Math.floor(fishingPower)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fishingPower > 80 ? 'bg-green-500' : fishingPower > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${fishingPower}%` }}
                  />
                </div>
              </div>

              {/* Fish Position */}
              <div className="mb-3">
                <div className="text-sm text-white/80 mb-1">물고기 위치</div>
                <div className="w-full bg-gray-700 rounded-full h-4 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-full bg-green-500/30"></div>
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 text-2xl"
                    style={{ left: `${fishPosition}%` }}
                  >
                    🐟
                  </div>
                </div>
              </div>

              <button
                onClick={pullFish}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                당기기! (연타)
              </button>
            </div>
          )}

          {/* Controls */}
          {!isFishing ? (
            <div className="space-y-4">
              {/* Bait Selection */}
              <div>
                <h3 className="text-white font-bold mb-2">미끼 선택</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(baits) as Array<keyof typeof baits>).map(bait => (
                    <button
                      key={bait}
                      onClick={() => setBaitType(bait)}
                      className={`p-3 rounded-lg transition-all ${
                        baitType === bait
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{baits[bait].icon}</div>
                      <div className="text-sm">{baits[bait].name}</div>
                      <div className="text-xs opacity-80">{baits[bait].cost} G</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startFishing}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-xl hover:shadow-lg transition-all"
              >
                🎣 낚시 시작
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hasFish && !isReeling && (
                <button
                  onClick={startReeling}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold text-xl hover:shadow-lg transition-all animate-pulse"
                >
                  ❗ 낚아채기!
                </button>
              )}

              <button
                onClick={stopFishing}
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all"
              >
                그만두기
              </button>
            </div>
          )}
        </div>

        {/* Equipment Shop */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">🛍️ 장비 상점</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`bg-white/10 rounded-lg p-4 ${fishingRod === 'iron' ? 'border-2 border-green-400' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔧</div>
                <div className="flex-1">
                  <div className="font-bold text-white">철제 낚싯대</div>
                  <div className="text-sm text-white/70">파워 +50%</div>
                  <div className="text-yellow-400">1,000 G</div>
                </div>
                {fishingRod !== 'iron' && fishingRod !== 'golden' && (
                  <button
                    onClick={() => buyRod('iron')}
                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold"
                  >
                    구매
                  </button>
                )}
              </div>
            </div>

            <div className={`bg-white/10 rounded-lg p-4 ${fishingRod === 'golden' ? 'border-2 border-yellow-400' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">⭐</div>
                <div className="flex-1">
                  <div className="font-bold text-white">황금 낚싯대</div>
                  <div className="text-sm text-white/70">파워 +100%</div>
                  <div className="text-yellow-400">5,000 G</div>
                </div>
                {fishingRod !== 'golden' && (
                  <button
                    onClick={() => buyRod('golden')}
                    className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold"
                  >
                    구매
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Caught Fishes */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 오늘의 어획</h3>
          {caughtFishes.length === 0 ? (
            <p className="text-white/70 text-center py-4">아직 잡은 물고기가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {caughtFishes.map((fish, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${getRarityColor(fish.rarity)} p-0.5 rounded-lg`}
                >
                  <div className="bg-black/80 rounded-lg p-3 text-center">
                    <div className="text-3xl mb-1">{fish.icon}</div>
                    <div className="text-sm font-bold text-white">{fish.name}</div>
                    <div className="text-xs text-yellow-400">{fish.size}cm</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <div className="text-white/80">총 수익</div>
            <div className="text-2xl font-bold text-yellow-400">
              {caughtFishes.reduce((sum, fish) => sum + fish.value, 0)} G
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wave {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: wave 3s linear infinite;
        }

        .wave1 {
          animation-delay: 0s;
        }

        .wave2 {
          animation-delay: 1.5s;
        }

        @keyframes wave {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FishingGame;