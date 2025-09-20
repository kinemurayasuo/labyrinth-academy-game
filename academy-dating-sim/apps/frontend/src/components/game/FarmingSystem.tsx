import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Crop {
  id: string;
  name: string;
  icon: string;
  seedCost: number;
  growthTime: number; // in seconds
  sellPrice: number;
  waterNeeded: number;
  stage: 'seed' | 'sprout' | 'growing' | 'mature' | 'dead';
}

interface FarmPlot {
  id: number;
  crop: Crop | null;
  plantedAt: number | null;
  wateredTimes: number;
  lastWateredAt: number | null;
  isUnlocked: boolean;
}

const FarmingSystem: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>(() => {
    const plots: FarmPlot[] = [];
    for (let i = 0; i < 12; i++) {
      plots.push({
        id: i,
        crop: null,
        plantedAt: null,
        wateredTimes: 0,
        lastWateredAt: null,
        isUnlocked: i < 4 // 처음엔 4개만 해금
      });
    }
    return plots;
  });

  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const cropTypes = [
    { id: 'wheat', name: '밀', icon: '🌾', seedCost: 50, growthTime: 60, sellPrice: 150, waterNeeded: 2 },
    { id: 'carrot', name: '당근', icon: '🥕', seedCost: 100, growthTime: 120, sellPrice: 350, waterNeeded: 3 },
    { id: 'tomato', name: '토마토', icon: '🍅', seedCost: 150, growthTime: 180, sellPrice: 500, waterNeeded: 4 },
    { id: 'corn', name: '옥수수', icon: '🌽', seedCost: 200, growthTime: 240, sellPrice: 700, waterNeeded: 5 },
    { id: 'pumpkin', name: '호박', icon: '🎃', seedCost: 300, growthTime: 300, sellPrice: 1000, waterNeeded: 6 },
    { id: 'watermelon', name: '수박', icon: '🍉', seedCost: 400, growthTime: 360, sellPrice: 1500, waterNeeded: 7 },
    { id: 'strawberry', name: '딸기', icon: '🍓', seedCost: 500, growthTime: 150, sellPrice: 800, waterNeeded: 4 },
    { id: 'grapes', name: '포도', icon: '🍇', seedCost: 600, growthTime: 400, sellPrice: 2000, waterNeeded: 8 },
    { id: 'apple', name: '사과', icon: '🍎', seedCost: 800, growthTime: 600, sellPrice: 3000, waterNeeded: 10 },
    { id: 'golden_apple', name: '황금사과', icon: '✨', seedCost: 5000, growthTime: 1200, sellPrice: 20000, waterNeeded: 20 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      updateCropStages();
    }, 1000);

    return () => clearInterval(interval);
  }, [farmPlots]);

  const updateCropStages = () => {
    setFarmPlots(prev => prev.map(plot => {
      if (!plot.crop || !plot.plantedAt) return plot;

      const elapsedTime = (Date.now() - plot.plantedAt) / 1000;
      const growthProgress = elapsedTime / plot.crop.growthTime;
      const timeSinceWatered = plot.lastWateredAt ? (Date.now() - plot.lastWateredAt) / 1000 : Infinity;

      let newStage = plot.crop.stage;

      // 물을 너무 오래 안 줬으면 죽음
      if (timeSinceWatered > 120 && plot.crop.stage !== 'dead') {
        newStage = 'dead';
      } else if (growthProgress >= 1 && plot.wateredTimes >= plot.crop.waterNeeded) {
        newStage = 'mature';
      } else if (growthProgress >= 0.66) {
        newStage = 'growing';
      } else if (growthProgress >= 0.33) {
        newStage = 'sprout';
      }

      return {
        ...plot,
        crop: { ...plot.crop, stage: newStage }
      };
    }));
  };

  const plantSeed = (plotId: number) => {
    if (!selectedSeed) {
      alert('먼저 씨앗을 선택해주세요!');
      return;
    }

    const cropType = cropTypes.find(c => c.id === selectedSeed);
    if (!cropType) return;

    if ((player.gold || 0) < cropType.seedCost) {
      alert('골드가 부족합니다!');
      return;
    }

    const newCrop: Crop = {
      ...cropType,
      stage: 'seed'
    };

    setFarmPlots(prev => prev.map(plot => {
      if (plot.id === plotId) {
        return {
          ...plot,
          crop: newCrop,
          plantedAt: Date.now(),
          wateredTimes: 0,
          lastWateredAt: null
        };
      }
      return plot;
    }));

    updatePlayer({ gold: (player.gold || 0) - cropType.seedCost });
    soundManager.playSuccessSound();
  };

  const waterPlot = (plotId: number) => {
    const plot = farmPlots.find(p => p.id === plotId);
    if (!plot || !plot.crop) return;

    if (plot.crop.stage === 'dead') {
      alert('죽은 작물은 물을 줄 수 없습니다!');
      return;
    }

    if (plot.crop.stage === 'mature') {
      alert('다 자란 작물입니다!');
      return;
    }

    const timeSinceWatered = plot.lastWateredAt ? (Date.now() - plot.lastWateredAt) / 1000 : Infinity;
    if (timeSinceWatered < 30) {
      alert('너무 자주 물을 주면 안됩니다! 30초 후에 다시 시도하세요.');
      return;
    }

    setFarmPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          wateredTimes: p.wateredTimes + 1,
          lastWateredAt: Date.now()
        };
      }
      return p;
    }));

    soundManager.playSuccessSound();
  };

  const harvestCrop = (plotId: number) => {
    const plot = farmPlots.find(p => p.id === plotId);
    if (!plot || !plot.crop) return;

    if (plot.crop.stage !== 'mature') {
      alert('아직 수확할 수 없습니다!');
      return;
    }

    const reward = plot.crop.sellPrice;
    updatePlayer({
      gold: (player.gold || 0) + reward,
      experience: player.experience + Math.floor(reward / 10)
    });

    setFarmPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          crop: null,
          plantedAt: null,
          wateredTimes: 0,
          lastWateredAt: null
        };
      }
      return p;
    }));

    soundManager.playSuccessSound();
    alert(`${plot.crop.name}을(를) 수확했습니다! +${reward} 골드`);
  };

  const removeCrop = (plotId: number) => {
    setFarmPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          crop: null,
          plantedAt: null,
          wateredTimes: 0,
          lastWateredAt: null
        };
      }
      return p;
    }));
  };

  const unlockPlot = (plotId: number) => {
    const cost = 1000 * (plotId - 2); // 점점 비싸짐

    if ((player.gold || 0) < cost) {
      alert(`${cost} 골드가 필요합니다!`);
      return;
    }

    setFarmPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, isUnlocked: true };
      }
      return p;
    }));

    updatePlayer({ gold: (player.gold || 0) - cost });
    soundManager.playSuccessSound();
  };

  const getCropStageIcon = (plot: FarmPlot) => {
    if (!plot.crop) return '🟫';

    switch (plot.crop.stage) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'growing': return '🌾';
      case 'mature': return plot.crop.icon;
      case 'dead': return '💀';
      default: return '🟫';
    }
  };

  const getGrowthProgress = (plot: FarmPlot) => {
    if (!plot.crop || !plot.plantedAt) return 0;
    const elapsed = (currentTime - plot.plantedAt) / 1000;
    return Math.min(100, (elapsed / plot.crop.growthTime) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 via-green-600 to-yellow-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🌾 농장</h1>
            <div className="flex items-center gap-4">
              <div className="text-white">
                <span className="text-yellow-400">💰</span> {player.gold || 0} G
              </div>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* Seed Selection */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🌰 씨앗 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {cropTypes.map(crop => (
              <button
                key={crop.id}
                onClick={() => setSelectedSeed(crop.id)}
                className={`p-3 rounded-lg transition-all ${
                  selectedSeed === crop.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-2xl mb-1">{crop.icon}</div>
                <div className="text-sm font-bold">{crop.name}</div>
                <div className="text-xs">씨: {crop.seedCost}G</div>
                <div className="text-xs">판매: {crop.sellPrice}G</div>
                <div className="text-xs opacity-70">{crop.growthTime}초</div>
              </button>
            ))}
          </div>
        </div>

        {/* Farm Plots */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🌻 농장 밭</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {farmPlots.map(plot => (
              <div
                key={plot.id}
                className={`relative aspect-square rounded-lg p-4 ${
                  plot.isUnlocked
                    ? 'bg-gradient-to-b from-amber-700 to-amber-900'
                    : 'bg-gray-800'
                }`}
              >
                {plot.isUnlocked ? (
                  <>
                    {/* Crop Icon */}
                    <div className="text-5xl text-center mb-2">
                      {getCropStageIcon(plot)}
                    </div>

                    {/* Crop Info */}
                    {plot.crop && (
                      <div className="text-center">
                        <div className="text-xs text-white font-bold">{plot.crop.name}</div>

                        {/* Growth Progress */}
                        {plot.crop.stage !== 'dead' && plot.crop.stage !== 'mature' && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full"
                                style={{ width: `${getGrowthProgress(plot)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Water Status */}
                        {plot.crop.stage !== 'dead' && plot.crop.stage !== 'mature' && (
                          <div className="text-xs text-blue-300 mt-1">
                            💧 {plot.wateredTimes}/{plot.crop.waterNeeded}
                          </div>
                        )}

                        {/* Status */}
                        {plot.crop.stage === 'mature' && (
                          <div className="text-xs text-green-400 font-bold mt-1">수확 가능!</div>
                        )}
                        {plot.crop.stage === 'dead' && (
                          <div className="text-xs text-red-400 font-bold mt-1">죽음</div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      {!plot.crop && (
                        <button
                          onClick={() => plantSeed(plot.id)}
                          className="flex-1 py-1 px-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          심기
                        </button>
                      )}
                      {plot.crop && plot.crop.stage !== 'mature' && plot.crop.stage !== 'dead' && (
                        <button
                          onClick={() => waterPlot(plot.id)}
                          className="flex-1 py-1 px-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          물주기
                        </button>
                      )}
                      {plot.crop && plot.crop.stage === 'mature' && (
                        <button
                          onClick={() => harvestCrop(plot.id)}
                          className="flex-1 py-1 px-2 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        >
                          수확
                        </button>
                      )}
                      {plot.crop && plot.crop.stage === 'dead' && (
                        <button
                          onClick={() => removeCrop(plot.id)}
                          className="flex-1 py-1 px-2 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          제거
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <button
                      onClick={() => unlockPlot(plot.id)}
                      className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                    >
                      해금 ({1000 * (plot.id - 2)}G)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-white/10 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">🌟 팁</h3>
            <ul className="text-sm text-white/80 space-y-1">
              <li>• 작물은 정기적으로 물을 줘야 합니다 (30초마다)</li>
              <li>• 물을 2분 이상 안 주면 작물이 죽습니다</li>
              <li>• 각 작물마다 필요한 물 횟수가 다릅니다</li>
              <li>• 황금사과는 특별한 보상을 줍니다!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmingSystem;