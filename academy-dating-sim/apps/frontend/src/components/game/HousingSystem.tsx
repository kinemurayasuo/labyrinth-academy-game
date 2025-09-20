import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Furniture {
  id: string;
  name: string;
  icon: string;
  category: 'bed' | 'chair' | 'table' | 'decoration' | 'storage' | 'special';
  cost: number;
  comfort: number;
  style: number;
  position?: { x: number; y: number };
}

interface Room {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large' | 'mansion';
  furniture: Furniture[];
  wallpaper: string;
  flooring: string;
  comfort: number;
  style: number;
  maxFurniture: number;
}

const HousingSystem: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [myRoom, setMyRoom] = useState<Room>({
    id: 'starter_room',
    name: '기본 방',
    size: 'small',
    furniture: [],
    wallpaper: 'basic',
    flooring: 'wood',
    comfort: 0,
    style: 0,
    maxFurniture: 10
  });

  const [selectedTab, setSelectedTab] = useState<'room' | 'furniture' | 'customize' | 'upgrade'>('room');
  const [placingFurniture, setPlacingFurniture] = useState<Furniture | null>(null);

  const furnitureShop: Furniture[] = [
    // Beds
    { id: 'basic_bed', name: '기본 침대', icon: '🛏️', category: 'bed', cost: 500, comfort: 10, style: 5 },
    { id: 'luxury_bed', name: '고급 침대', icon: '🛏️', category: 'bed', cost: 2000, comfort: 30, style: 20 },
    { id: 'royal_bed', name: '왕실 침대', icon: '👑', category: 'bed', cost: 10000, comfort: 100, style: 80 },

    // Chairs
    { id: 'wooden_chair', name: '나무 의자', icon: '🪑', category: 'chair', cost: 200, comfort: 5, style: 3 },
    { id: 'gaming_chair', name: '게이밍 체어', icon: '💺', category: 'chair', cost: 1500, comfort: 25, style: 15 },
    { id: 'throne', name: '왕좌', icon: '🪑', category: 'chair', cost: 8000, comfort: 50, style: 70 },

    // Tables
    { id: 'study_desk', name: '책상', icon: '🪵', category: 'table', cost: 300, comfort: 5, style: 5 },
    { id: 'dining_table', name: '식탁', icon: '🍽️', category: 'table', cost: 800, comfort: 10, style: 10 },
    { id: 'magic_table', name: '마법 테이블', icon: '✨', category: 'table', cost: 5000, comfort: 20, style: 50 },

    // Decorations
    { id: 'plant', name: '화분', icon: '🪴', category: 'decoration', cost: 100, comfort: 3, style: 5 },
    { id: 'painting', name: '그림', icon: '🖼️', category: 'decoration', cost: 500, comfort: 5, style: 15 },
    { id: 'chandelier', name: '샹들리에', icon: '💎', category: 'decoration', cost: 3000, comfort: 15, style: 40 },
    { id: 'aquarium', name: '수족관', icon: '🐠', category: 'decoration', cost: 1200, comfort: 20, style: 25 },
    { id: 'fireplace', name: '벽난로', icon: '🔥', category: 'decoration', cost: 2500, comfort: 35, style: 30 },

    // Storage
    { id: 'bookshelf', name: '책장', icon: '📚', category: 'storage', cost: 600, comfort: 8, style: 12 },
    { id: 'wardrobe', name: '옷장', icon: '🚪', category: 'storage', cost: 900, comfort: 10, style: 10 },
    { id: 'treasure_chest', name: '보물상자', icon: '💰', category: 'storage', cost: 4000, comfort: 5, style: 35 },

    // Special
    { id: 'piano', name: '피아노', icon: '🎹', category: 'special', cost: 7000, comfort: 40, style: 60 },
    { id: 'telescope', name: '망원경', icon: '🔭', category: 'special', cost: 3500, comfort: 15, style: 30 },
    { id: 'gaming_setup', name: '게이밍 셋업', icon: '🎮', category: 'special', cost: 10000, comfort: 60, style: 45 },
    { id: 'magic_crystal', name: '마법 크리스탈', icon: '🔮', category: 'special', cost: 15000, comfort: 50, style: 100 }
  ];

  const wallpapers = [
    { id: 'basic', name: '기본 벽지', cost: 0, style: 0, icon: '⬜' },
    { id: 'floral', name: '꽃무늬 벽지', cost: 500, style: 10, icon: '🌸' },
    { id: 'starry', name: '별무늬 벽지', cost: 1000, style: 20, icon: '⭐' },
    { id: 'royal', name: '왕실 벽지', cost: 3000, style: 50, icon: '👑' },
    { id: 'magical', name: '마법 벽지', cost: 5000, style: 80, icon: '✨' }
  ];

  const floorings = [
    { id: 'wood', name: '나무 바닥', cost: 0, style: 5, icon: '🟫' },
    { id: 'carpet', name: '카펫', cost: 800, style: 15, icon: '🟥' },
    { id: 'marble', name: '대리석', cost: 2000, style: 35, icon: '⬜' },
    { id: 'crystal', name: '크리스탈 바닥', cost: 6000, style: 70, icon: '💎' }
  ];

  const roomUpgrades = [
    { size: 'medium', name: '중형 방', cost: 5000, maxFurniture: 20 },
    { size: 'large', name: '대형 방', cost: 15000, maxFurniture: 35 },
    { size: 'mansion', name: '맨션', cost: 50000, maxFurniture: 50 }
  ];

  const buyFurniture = (furniture: Furniture) => {
    if ((player.gold || 0) < furniture.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    if (myRoom.furniture.length >= myRoom.maxFurniture) {
      alert('방에 더 이상 가구를 놓을 수 없습니다!');
      return;
    }

    const newFurniture = { ...furniture, position: { x: 50, y: 50 } };
    setMyRoom(prev => ({
      ...prev,
      furniture: [...prev.furniture, newFurniture],
      comfort: prev.comfort + furniture.comfort,
      style: prev.style + furniture.style
    }));

    updatePlayer({ gold: (player.gold || 0) - furniture.cost });
    soundManager.playSuccessSound();
  };

  const sellFurniture = (furnitureId: string) => {
    const furniture = myRoom.furniture.find(f => f.id === furnitureId);
    if (!furniture) return;

    const sellPrice = Math.floor(furniture.cost * 0.5);
    setMyRoom(prev => ({
      ...prev,
      furniture: prev.furniture.filter(f => f.id !== furnitureId),
      comfort: prev.comfort - furniture.comfort,
      style: prev.style - furniture.style
    }));

    updatePlayer({ gold: (player.gold || 0) + sellPrice });
    soundManager.playCoinSound();
  };

  const changeWallpaper = (wallpaperId: string) => {
    const wallpaper = wallpapers.find(w => w.id === wallpaperId);
    if (!wallpaper) return;

    if ((player.gold || 0) < wallpaper.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    setMyRoom(prev => ({
      ...prev,
      wallpaper: wallpaperId,
      style: prev.style + wallpaper.style
    }));

    updatePlayer({ gold: (player.gold || 0) - wallpaper.cost });
    soundManager.playSuccessSound();
  };

  const changeFlooring = (flooringId: string) => {
    const flooring = floorings.find(f => f.id === flooringId);
    if (!flooring) return;

    if ((player.gold || 0) < flooring.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    setMyRoom(prev => ({
      ...prev,
      flooring: flooringId,
      style: prev.style + flooring.style
    }));

    updatePlayer({ gold: (player.gold || 0) - flooring.cost });
    soundManager.playSuccessSound();
  };

  const upgradeRoom = (size: string) => {
    const upgrade = roomUpgrades.find(u => u.size === size);
    if (!upgrade) return;

    if ((player.gold || 0) < upgrade.cost) {
      alert('골드가 부족합니다!');
      return;
    }

    setMyRoom(prev => ({
      ...prev,
      size: size as any,
      maxFurniture: upgrade.maxFurniture
    }));

    updatePlayer({ gold: (player.gold || 0) - upgrade.cost });
    soundManager.playLevelUpSound();
  };

  const getRoomBonus = () => {
    const comfortBonus = Math.floor(myRoom.comfort / 10);
    const styleBonus = Math.floor(myRoom.style / 10);

    return {
      happiness: comfortBonus * 2,
      charm: styleBonus,
      dailyGold: (comfortBonus + styleBonus) * 10
    };
  };

  const bonus = getRoomBonus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🏠 마이 하우스</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Room Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">편안함</div>
              <div className="text-xl font-bold text-white">😌 {myRoom.comfort}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">스타일</div>
              <div className="text-xl font-bold text-white">✨ {myRoom.style}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">가구</div>
              <div className="text-xl font-bold text-white">🪑 {myRoom.furniture.length}/{myRoom.maxFurniture}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-sm text-white/70">크기</div>
              <div className="text-xl font-bold text-white">📐 {myRoom.size}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            {(['room', 'furniture', 'customize', 'upgrade'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab === 'room' && '🏠 내 방'}
                {tab === 'furniture' && '🪑 가구 상점'}
                {tab === 'customize' && '🎨 꾸미기'}
                {tab === 'upgrade' && '⬆️ 업그레이드'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6">
          {selectedTab === 'room' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">내 방</h2>

              {/* Room View */}
              <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl h-64 mb-4 relative overflow-hidden">
                {myRoom.furniture.map((furniture, idx) => (
                  <div
                    key={idx}
                    className="absolute text-4xl cursor-pointer hover:scale-110 transition-all"
                    style={{
                      left: `${furniture.position?.x || 50}%`,
                      top: `${furniture.position?.y || 50}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => sellFurniture(furniture.id)}
                    title={`${furniture.name} (클릭시 판매)`}
                  >
                    {furniture.icon}
                  </div>
                ))}
                {myRoom.furniture.length === 0 && (
                  <div className="flex items-center justify-center h-full text-white/50">
                    가구를 구매하여 방을 꾸며보세요!
                  </div>
                )}
              </div>

              {/* Room Bonuses */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">🎁 방 보너스</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-pink-400">행복 +{bonus.happiness}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400">매력 +{bonus.charm}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400">일일 골드 +{bonus.dailyGold}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'furniture' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">가구 상점</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {furnitureShop.map(furniture => (
                  <div key={furniture.id} className="bg-white/10 rounded-lg p-4">
                    <div className="text-3xl text-center mb-2">{furniture.icon}</div>
                    <div className="text-sm font-bold text-white">{furniture.name}</div>
                    <div className="text-xs text-white/70">{furniture.category}</div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-blue-400">편안함 +{furniture.comfort}</span>
                      <span className="text-purple-400">스타일 +{furniture.style}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-yellow-400 font-bold">{furniture.cost} G</span>
                      <button
                        onClick={() => buyFurniture(furniture)}
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded text-sm font-bold hover:shadow-lg transition-all"
                      >
                        구매
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'customize' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">방 꾸미기</h2>

              {/* Wallpaper */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">벽지</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {wallpapers.map(wallpaper => (
                    <button
                      key={wallpaper.id}
                      onClick={() => changeWallpaper(wallpaper.id)}
                      className={`p-3 rounded-lg transition-all ${
                        myRoom.wallpaper === wallpaper.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{wallpaper.icon}</div>
                      <div className="text-xs">{wallpaper.name}</div>
                      <div className="text-xs">{wallpaper.cost} G</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flooring */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">바닥재</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {floorings.map(flooring => (
                    <button
                      key={flooring.id}
                      onClick={() => changeFlooring(flooring.id)}
                      className={`p-3 rounded-lg transition-all ${
                        myRoom.flooring === flooring.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{flooring.icon}</div>
                      <div className="text-xs">{flooring.name}</div>
                      <div className="text-xs">{flooring.cost} G</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'upgrade' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">방 업그레이드</h2>
              <div className="grid gap-4">
                {roomUpgrades.map(upgrade => (
                  <div
                    key={upgrade.size}
                    className={`bg-white/10 rounded-lg p-4 ${
                      myRoom.size === upgrade.size ? 'border-2 border-green-400' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-white">{upgrade.name}</div>
                        <div className="text-sm text-white/70">최대 가구: {upgrade.maxFurniture}개</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-xl">{upgrade.cost} G</div>
                        {myRoom.size !== upgrade.size && (
                          <button
                            onClick={() => upgradeRoom(upgrade.size)}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            업그레이드
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HousingSystem;