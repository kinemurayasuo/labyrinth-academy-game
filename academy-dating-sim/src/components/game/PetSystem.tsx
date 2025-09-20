import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Pet {
  id: string;
  name: string;
  species: string;
  icon: string;
  level: number;
  exp: number;
  maxExp: number;
  happiness: number;
  hunger: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    intelligence: number;
  };
  skills: string[];
  evolution?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PetFood {
  id: string;
  name: string;
  icon: string;
  hungerRestore: number;
  happinessBonus: number;
  cost: number;
}

const PetSystem: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetShop, setShowPetShop] = useState(false);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedTab, setSelectedTab] = useState<'care' | 'train' | 'battle' | 'evolve'>('care');

  const availablePets: Pet[] = [
    {
      id: 'cat_1',
      name: '루비',
      species: '마법 고양이',
      icon: '🐱',
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 80,
      stats: { attack: 10, defense: 8, speed: 15, intelligence: 12 },
      skills: ['할퀴기', '민첩'],
      rarity: 'common'
    },
    {
      id: 'dog_1',
      name: '맥스',
      species: '충성 강아지',
      icon: '🐕',
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 70,
      stats: { attack: 12, defense: 10, speed: 10, intelligence: 8 },
      skills: ['물기', '충성심'],
      rarity: 'common'
    },
    {
      id: 'dragon_1',
      name: '스파크',
      species: '아기 드래곤',
      icon: '🐉',
      level: 1,
      exp: 0,
      maxExp: 150,
      happiness: 80,
      hunger: 60,
      stats: { attack: 20, defense: 15, speed: 12, intelligence: 18 },
      skills: ['화염 숨결', '비행'],
      evolution: 'adult_dragon',
      rarity: 'legendary'
    },
    {
      id: 'fox_1',
      name: '미스티',
      species: '구미호',
      icon: '🦊',
      level: 1,
      exp: 0,
      maxExp: 120,
      happiness: 90,
      hunger: 75,
      stats: { attack: 15, defense: 12, speed: 18, intelligence: 20 },
      skills: ['환영', '마법'],
      rarity: 'epic'
    },
    {
      id: 'bird_1',
      name: '스카이',
      species: '불사조',
      icon: '🦅',
      level: 1,
      exp: 0,
      maxExp: 130,
      happiness: 85,
      hunger: 65,
      stats: { attack: 18, defense: 10, speed: 25, intelligence: 15 },
      skills: ['급강하', '재생'],
      rarity: 'epic'
    },
    {
      id: 'rabbit_1',
      name: '모찌',
      species: '달토끼',
      icon: '🐰',
      level: 1,
      exp: 0,
      maxExp: 90,
      happiness: 95,
      hunger: 85,
      stats: { attack: 8, defense: 6, speed: 20, intelligence: 10 },
      skills: ['점프', '행운'],
      rarity: 'rare'
    }
  ];

  const petFoods: PetFood[] = [
    { id: 'basic_food', name: '기본 사료', icon: '🥫', hungerRestore: 20, happinessBonus: 5, cost: 100 },
    { id: 'premium_food', name: '프리미엄 사료', icon: '🍖', hungerRestore: 40, happinessBonus: 15, cost: 500 },
    { id: 'treat', name: '특별 간식', icon: '🍪', hungerRestore: 10, happinessBonus: 30, cost: 300 },
    { id: 'magic_food', name: '마법 사료', icon: '✨', hungerRestore: 50, happinessBonus: 25, cost: 1000 }
  ];

  const trainingActivities = [
    { id: 'attack_training', name: '공격 훈련', stat: 'attack', cost: 500, expGain: 20, icon: '⚔️' },
    { id: 'defense_training', name: '방어 훈련', stat: 'defense', cost: 500, expGain: 20, icon: '🛡️' },
    { id: 'speed_training', name: '속도 훈련', stat: 'speed', cost: 500, expGain: 20, icon: '💨' },
    { id: 'intelligence_training', name: '지능 훈련', stat: 'intelligence', cost: 500, expGain: 20, icon: '🧠' }
  ];

  useEffect(() => {
    // 시간이 지남에 따라 펫 상태 변화
    const interval = setInterval(() => {
      setMyPets(prev => prev.map(pet => ({
        ...pet,
        hunger: Math.max(0, pet.hunger - 1),
        happiness: Math.max(0, pet.happiness - 0.5)
      })));
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, []);

  const adoptPet = (pet: Pet) => {
    const cost = pet.rarity === 'legendary' ? 10000 : pet.rarity === 'epic' ? 5000 : pet.rarity === 'rare' ? 2000 : 1000;

    if ((player.gold || 0) < cost) {
      alert(`${cost} 골드가 필요합니다!`);
      return;
    }

    const newPet = { ...pet, id: `${pet.id}_${Date.now()}` };
    setMyPets([...myPets, newPet]);
    updatePlayer({ gold: (player.gold || 0) - cost });
    soundManager.playSuccessSound();
    alert(`${pet.name}을(를) 입양했습니다!`);
    setShowPetShop(false);
  };

  const feedPet = (pet: Pet, food: PetFood) => {
    if ((player.gold || 0) < food.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    const updatedPets = myPets.map(p => {
      if (p.id === pet.id) {
        return {
          ...p,
          hunger: Math.min(100, p.hunger + food.hungerRestore),
          happiness: Math.min(100, p.happiness + food.happinessBonus)
        };
      }
      return p;
    });

    setMyPets(updatedPets);
    updatePlayer({ gold: (player.gold || 0) - food.cost });
    soundManager.playSuccessSound();
  };

  const trainPet = (pet: Pet, activity: any) => {
    if ((player.gold || 0) < activity.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    const updatedPets = myPets.map(p => {
      if (p.id === pet.id) {
        const newExp = p.exp + activity.expGain;
        const levelUp = newExp >= p.maxExp;

        return {
          ...p,
          exp: levelUp ? newExp - p.maxExp : newExp,
          level: levelUp ? p.level + 1 : p.level,
          maxExp: levelUp ? p.maxExp * 1.5 : p.maxExp,
          stats: {
            ...p.stats,
            [activity.stat]: p.stats[activity.stat as keyof typeof p.stats] + (levelUp ? 5 : 2)
          }
        };
      }
      return p;
    });

    setMyPets(updatedPets);
    updatePlayer({ gold: (player.gold || 0) - activity.cost });
    soundManager.playSuccessSound();
  };

  const evolvePet = (pet: Pet) => {
    if (!pet.evolution || pet.level < 10) {
      alert('레벨 10 이상이어야 진화할 수 있습니다!');
      return;
    }

    const evolvedPet = {
      ...pet,
      species: '성체 ' + pet.species,
      icon: '🐲',
      stats: {
        attack: pet.stats.attack * 2,
        defense: pet.stats.defense * 2,
        speed: pet.stats.speed * 1.5,
        intelligence: pet.stats.intelligence * 2
      },
      skills: [...pet.skills, '진화의 힘'],
      evolution: undefined
    };

    const updatedPets = myPets.map(p => p.id === pet.id ? evolvedPet : p);
    setMyPets(updatedPets);
    soundManager.playLevelUpSound();
    alert(`${pet.name}이(가) 진화했습니다!`);
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🐾 펫 시스템</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPetShop(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                🏪 펫 상점
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* My Pets */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">나의 펫</h2>
          {myPets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-white/70">아직 펫이 없습니다. 펫 상점에서 입양해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPets.map(pet => (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`bg-gradient-to-br ${getRarityColor(pet.rarity)} p-0.5 rounded-xl cursor-pointer hover:scale-105 transition-all`}
                >
                  <div className="bg-black/80 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{pet.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{pet.name}</div>
                        <div className="text-sm text-white/70">{pet.species}</div>
                        <div className="text-xs text-yellow-400">Lv.{pet.level}</div>
                      </div>
                    </div>

                    {/* Status Bars */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-white/80 mb-1">
                          <span>행복도</span>
                          <span>{Math.floor(pet.happiness)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-400 to-red-400 h-full rounded-full"
                            style={{ width: `${pet.happiness}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-white/80 mb-1">
                          <span>배고픔</span>
                          <span>{Math.floor(pet.hunger)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full"
                            style={{ width: `${pet.hunger}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Pet Details */}
        {selectedPet && (
          <div className="bg-black/30 backdrop-blur rounded-xl p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="text-8xl">{selectedPet.icon}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">{selectedPet.name}</h3>
                <p className="text-white/70">{selectedPet.species}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-yellow-400">Lv.{selectedPet.level}</span>
                  <span className="text-blue-400">EXP: {selectedPet.exp}/{selectedPet.maxExp}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-white/10 rounded p-2">
                    <span className="text-white/60 text-sm">공격력</span>
                    <div className="text-white font-bold">⚔️ {selectedPet.stats.attack}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <span className="text-white/60 text-sm">방어력</span>
                    <div className="text-white font-bold">🛡️ {selectedPet.stats.defense}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <span className="text-white/60 text-sm">속도</span>
                    <div className="text-white font-bold">💨 {selectedPet.stats.speed}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <span className="text-white/60 text-sm">지능</span>
                    <div className="text-white font-bold">🧠 {selectedPet.stats.intelligence}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(['care', 'train', 'battle', 'evolve'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedTab === tab
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tab === 'care' && '🍽️ 돌보기'}
                  {tab === 'train' && '💪 훈련'}
                  {tab === 'battle' && '⚔️ 전투'}
                  {tab === 'evolve' && '✨ 진화'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 rounded-xl p-4">
              {selectedTab === 'care' && (
                <div className="grid grid-cols-2 gap-3">
                  {petFoods.map(food => (
                    <button
                      key={food.id}
                      onClick={() => feedPet(selectedPet, food)}
                      className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{food.icon}</div>
                        <div>
                          <div className="font-bold text-white">{food.name}</div>
                          <div className="text-xs text-white/60">
                            배고픔 +{food.hungerRestore} | 행복 +{food.happinessBonus}
                          </div>
                          <div className="text-sm text-yellow-400">{food.cost} G</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTab === 'train' && (
                <div className="grid grid-cols-2 gap-3">
                  {trainingActivities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => trainPet(selectedPet, activity)}
                      className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{activity.icon}</div>
                        <div>
                          <div className="font-bold text-white">{activity.name}</div>
                          <div className="text-xs text-white/60">+{activity.expGain} EXP</div>
                          <div className="text-sm text-yellow-400">{activity.cost} G</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTab === 'battle' && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🚧</div>
                  <p className="text-white/70">펫 배틀 시스템 준비 중...</p>
                </div>
              )}

              {selectedTab === 'evolve' && (
                <div className="text-center py-8">
                  {selectedPet.evolution ? (
                    <div>
                      <div className="text-6xl mb-4">✨</div>
                      <p className="text-white mb-4">레벨 10에 진화 가능합니다!</p>
                      <button
                        onClick={() => evolvePet(selectedPet)}
                        disabled={selectedPet.level < 10}
                        className={`px-6 py-3 rounded-lg font-bold ${
                          selectedPet.level >= 10
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        진화시키기
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-4">🎯</div>
                      <p className="text-white/70">이 펫은 최종 진화 상태입니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pet Shop Modal */}
        {showPetShop && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">🏪 펫 상점</h3>
                <button
                  onClick={() => setShowPetShop(false)}
                  className="text-white hover:text-red-400 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePets.map(pet => {
                  const cost = pet.rarity === 'legendary' ? 10000 : pet.rarity === 'epic' ? 5000 : pet.rarity === 'rare' ? 2000 : 1000;

                  return (
                    <div key={pet.id} className={`bg-gradient-to-br ${getRarityColor(pet.rarity)} p-0.5 rounded-xl`}>
                      <div className="bg-black/80 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-5xl">{pet.icon}</div>
                          <div className="flex-1">
                            <div className="font-bold text-white">{pet.name}</div>
                            <div className="text-sm text-white/70">{pet.species}</div>
                            <div className="text-xs text-yellow-400 uppercase">{pet.rarity}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pet.skills.map(skill => (
                                <span key={skill} className="bg-white/20 px-2 py-1 rounded text-xs text-white">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-yellow-400 font-bold">{cost} G</span>
                              <button
                                onClick={() => adoptPet(pet)}
                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                              >
                                입양하기
                              </button>
                            </div>
                          </div>
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
  );
};

export default PetSystem;