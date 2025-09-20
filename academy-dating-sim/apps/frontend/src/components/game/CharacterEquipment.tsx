import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';

interface Equipment {
  weapon?: {
    id: string;
    name: string;
    attack: number;
    magic?: number;
    special?: string;
  };
  armor?: {
    id: string;
    name: string;
    defense: number;
    hp?: number;
  };
  accessory?: {
    id: string;
    name: string;
    effect: string;
    stats?: any;
  };
}

const CharacterEquipment: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore(state => state.player);
  const updatePlayer = useGameStore(state => state.actions.updatePlayer);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'equipment' | 'skills'>('stats');

  // Calculate total stats including equipment bonuses
  const calculateTotalStats = () => {
    const baseStats = { ...player.stats };
    let totalAttack = baseStats.strength;
    let totalDefense = 10;
    let totalMagic = baseStats.intelligence;
    let totalSpeed = baseStats.agility;

    // Add equipment bonuses
    if (player.equipment?.weapon) {
      const weapon = inventoryItems.find(item => item.id === player.equipment.weapon);
      if (weapon && weapon.stats) {
        totalAttack += weapon.stats.attack || 0;
        totalMagic += weapon.stats.magic || 0;
      }
    }

    if (player.equipment?.armor) {
      const armor = inventoryItems.find(item => item.id === player.equipment.armor);
      if (armor && armor.stats) {
        totalDefense += armor.stats.defense || 0;
      }
    }

    return {
      attack: totalAttack,
      defense: totalDefense,
      magic: totalMagic,
      speed: totalSpeed,
      hp: player.maxHp,
      mp: player.maxMp
    };
  };

  // Sample inventory items (weapons, armors, accessories)
  const inventoryItems = [
    {
      id: 'sword_01',
      name: '강철 검',
      type: 'weapon',
      stats: { attack: 10 },
      description: '기본적인 강철 검',
      icon: '⚔️'
    },
    {
      id: 'sword_02',
      name: '마법 검',
      type: 'weapon',
      stats: { attack: 15, magic: 5 },
      description: '마력이 깃든 검',
      icon: '🗡️'
    },
    {
      id: 'staff_01',
      name: '나무 지팡이',
      type: 'weapon',
      stats: { magic: 12, attack: 3 },
      description: '마법사용 지팡이',
      icon: '🪄'
    },
    {
      id: 'armor_01',
      name: '가죽 갑옷',
      type: 'armor',
      stats: { defense: 8 },
      description: '가벼운 가죽 갑옷',
      icon: '🎽'
    },
    {
      id: 'armor_02',
      name: '철 갑옷',
      type: 'armor',
      stats: { defense: 15, hp: 20 },
      description: '튼튼한 철 갑옷',
      icon: '🛡️'
    },
    {
      id: 'ring_01',
      name: '행운의 반지',
      type: 'accessory',
      stats: { luck: 5 },
      description: '행운을 증가시키는 반지',
      icon: '💍'
    },
    {
      id: 'amulet_01',
      name: '마나 부적',
      type: 'accessory',
      stats: { mp: 30 },
      description: 'MP를 증가시키는 부적',
      icon: '🔮'
    }
  ];

  const handleEquip = (item: any) => {
    const newEquipment = { ...player.equipment };

    if (item.type === 'weapon') {
      newEquipment.weapon = item.id;
    } else if (item.type === 'armor') {
      newEquipment.armor = item.id;
    } else if (item.type === 'accessory') {
      newEquipment.accessory = item.id;
    }

    updatePlayer({ equipment: newEquipment });
  };

  const handleUnequip = (slot: string) => {
    const newEquipment = { ...player.equipment };
    delete newEquipment[slot as keyof typeof newEquipment];
    updatePlayer({ equipment: newEquipment });
  };

  const totalStats = calculateTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">캐릭터 정보</h1>
              <p className="text-purple-200">{player.name} - Lv.{player.level}</p>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all"
            >
              게임으로 돌아가기
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/20 backdrop-blur rounded-t-xl p-4">
          <div className="flex gap-2">
            {(['stats', 'equipment', 'skills'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  selectedTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-black/30 text-purple-300 hover:bg-black/40'
                }`}
              >
                {tab === 'stats' && '📊 능력치'}
                {tab === 'equipment' && '⚔️ 장비'}
                {tab === 'skills' && '✨ 스킬'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-black/30 backdrop-blur rounded-b-xl rounded-tr-xl p-6">
          {selectedTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-purple-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-300">레벨</span>
                    <span className="text-white font-bold">{player.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">경험치</span>
                    <span className="text-white font-bold">{player.experience}/{player.level * 100}</span>
                  </div>
                  <div className="w-full bg-purple-950/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                      style={{ width: `${(player.experience / (player.level * 100)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">HP</span>
                    <span className="text-white font-bold">{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">MP</span>
                    <span className="text-white font-bold">{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">스테미나</span>
                    <span className="text-white font-bold">{player.stamina}/{player.maxStamina}</span>
                  </div>
                </div>
              </div>

              {/* Total Stats */}
              <div className="bg-blue-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">전투 능력치</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-red-400">⚔️ 공격력</span>
                    <span className="text-white font-bold">{totalStats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">🛡️ 방어력</span>
                    <span className="text-white font-bold">{totalStats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">✨ 마법력</span>
                    <span className="text-white font-bold">{totalStats.magic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">💨 속도</span>
                    <span className="text-white font-bold">{totalStats.speed}</span>
                  </div>
                </div>
              </div>

              {/* Base Stats */}
              <div className="bg-green-900/30 rounded-xl p-6 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">기본 스탯</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-blue-400 text-sm">🧠 지력</div>
                    <div className="text-white font-bold text-xl">{player.stats.intelligence}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-pink-400 text-sm">✨ 매력</div>
                    <div className="text-white font-bold text-xl">{player.stats.charm}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-red-400 text-sm">💪 힘</div>
                    <div className="text-white font-bold text-xl">{player.stats.strength}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-green-400 text-sm">🏃 민첩</div>
                    <div className="text-white font-bold text-xl">{player.stats.agility}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-yellow-400 text-sm">🍀 행운</div>
                    <div className="text-white font-bold text-xl">{player.stats.luck}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'equipment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currently Equipped */}
              <div className="bg-purple-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">장착 중인 장비</h3>
                <div className="space-y-4">
                  {/* Weapon Slot */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">무기</div>
                    {player.equipment?.weapon ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold">
                            {inventoryItems.find(i => i.id === player.equipment.weapon)?.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            공격력 +{inventoryItems.find(i => i.id === player.equipment.weapon)?.stats.attack}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnequip('weapon')}
                          className="text-red-400 hover:text-red-300"
                        >
                          해제
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">비어있음</div>
                    )}
                  </div>

                  {/* Armor Slot */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">방어구</div>
                    {player.equipment?.armor ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold">
                            {inventoryItems.find(i => i.id === player.equipment.armor)?.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            방어력 +{inventoryItems.find(i => i.id === player.equipment.armor)?.stats.defense}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnequip('armor')}
                          className="text-red-400 hover:text-red-300"
                        >
                          해제
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">비어있음</div>
                    )}
                  </div>

                  {/* Accessory Slot */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">장신구</div>
                    {player.equipment?.accessory ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold">
                            {inventoryItems.find(i => i.id === player.equipment.accessory)?.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            특수 효과
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnequip('accessory')}
                          className="text-red-400 hover:text-red-300"
                        >
                          해제
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">비어있음</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Equipment */}
              <div className="bg-blue-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">보유 장비</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {inventoryItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <div className="text-white font-semibold">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEquip(item)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all"
                        >
                          장착
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">습득한 스킬</h3>
                <div className="space-y-3">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⚔️</div>
                      <div>
                        <div className="text-white font-semibold">기본 공격</div>
                        <div className="text-xs text-gray-400">기본적인 물리 공격</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🛡️</div>
                      <div>
                        <div className="text-white font-semibold">방어</div>
                        <div className="text-xs text-gray-400">데미지를 절반으로 감소</div>
                      </div>
                    </div>
                  </div>
                  {player.level >= 5 && (
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🔥</div>
                        <div>
                          <div className="text-white font-semibold">파이어볼</div>
                          <div className="text-xs text-gray-400">마법 공격 (MP 10)</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {player.level >= 10 && (
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💚</div>
                        <div>
                          <div className="text-white font-semibold">힐링</div>
                          <div className="text-xs text-gray-400">HP 회복 (MP 15)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">스킬 포인트</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-yellow-400">사용 가능 포인트</span>
                    <span className="text-white font-bold">{Math.floor(player.level / 5)}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    레벨 5마다 스킬 포인트를 획득합니다
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Affection Summary */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mt-6">
          <h3 className="text-xl font-bold text-white mb-4">히로인 호감도</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {Object.entries(player.affection).map(([name, affection]) => (
              <div key={name} className="bg-purple-900/30 rounded-lg p-3 text-center">
                <div className="text-white font-semibold capitalize mb-1">{name}</div>
                <div className="text-2xl mb-1">
                  {affection >= 80 ? '💕' : affection >= 60 ? '💗' : affection >= 40 ? '💖' : affection >= 20 ? '💝' : '💛'}
                </div>
                <div className="text-pink-400 font-bold">{affection}%</div>
                <div className="w-full bg-purple-950/50 rounded-full h-1 mt-1">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full"
                    style={{ width: `${affection}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterEquipment;