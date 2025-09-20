import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface DungeonInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: number;
  recommendedLevel: number;
  rewards: string[];
  unlocked: boolean;
  theme: string;
  boss: string;
}

const DungeonSelection: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const [selectedDungeon, setSelectedDungeon] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dungeons: DungeonInfo[] = [
    {
      id: 'forest',
      name: '신비한 숲',
      description: '울창한 나무들과 신비로운 생물들이 사는 숲입니다.',
      icon: '🌳',
      difficulty: 1,
      recommendedLevel: 1,
      rewards: ['나무 재료', '숲의 정수', '초급 포션'],
      unlocked: true,
      theme: 'nature',
      boss: '숲의 수호자'
    },
    {
      id: 'crystal_cave',
      name: '수정 동굴',
      description: '빛나는 수정으로 가득한 지하 동굴입니다.',
      icon: '💎',
      difficulty: 2,
      recommendedLevel: 5,
      rewards: ['마법 수정', '광물', '중급 포션'],
      unlocked: player.level >= 3,
      theme: 'crystal',
      boss: '크리스탈 골렘'
    },
    {
      id: 'ancient_ruins',
      name: '고대 유적',
      description: '오래된 문명의 흔적이 남아있는 유적지입니다.',
      icon: '🏛️',
      difficulty: 3,
      recommendedLevel: 10,
      rewards: ['고대 유물', '마법 서적', '경험치 부스터'],
      unlocked: player.level >= 8,
      theme: 'ancient',
      boss: '고대의 수호신'
    },
    {
      id: 'ice_palace',
      name: '얼음 궁전',
      description: '영원한 겨울이 지배하는 얼어붙은 궁전입니다.',
      icon: '❄️',
      difficulty: 4,
      recommendedLevel: 15,
      rewards: ['얼음 조각', '서리 정수', '고급 장비'],
      unlocked: player.level >= 12,
      theme: 'ice',
      boss: '얼음 여왕'
    },
    {
      id: 'volcano',
      name: '화산 심장부',
      description: '용암이 끓어오르는 위험한 화산 내부입니다.',
      icon: '🌋',
      difficulty: 5,
      recommendedLevel: 20,
      rewards: ['용암석', '불의 정수', '전설 장비'],
      unlocked: player.level >= 18,
      theme: 'fire',
      boss: '화염 드래곤'
    },
    {
      id: 'shadow_realm',
      name: '그림자 차원',
      description: '어둠의 힘이 지배하는 다른 차원의 공간입니다.',
      icon: '🌑',
      difficulty: 6,
      recommendedLevel: 25,
      rewards: ['어둠의 조각', '그림자 정수', '신화 장비'],
      unlocked: player.level >= 22,
      theme: 'shadow',
      boss: '어둠의 군주'
    },
    {
      id: 'celestial_tower',
      name: '천상의 탑',
      description: '하늘 끝까지 솟아있는 신성한 탑입니다.',
      icon: '⭐',
      difficulty: 7,
      recommendedLevel: 30,
      rewards: ['천상의 조각', '신성한 정수', '궁극 장비'],
      unlocked: player.level >= 28,
      theme: 'celestial',
      boss: '천상의 수호자'
    }
  ];

  const handleDungeonSelect = (dungeonId: string) => {
    const dungeon = dungeons.find(d => d.id === dungeonId);
    if (dungeon && dungeon.unlocked) {
      setSelectedDungeon(dungeonId);
      setShowConfirmation(true);
    }
  };

  const handleEnterDungeon = () => {
    if (selectedDungeon) {
      // Store selected dungeon in game state
      useGameStore.setState((state: any) => ({
        player: {
          ...state.player,
          currentDungeon: selectedDungeon,
          dungeonProgress: {
            ...state.player.dungeonProgress,
            currentFloor: 1,
            position: { x: 1, y: 1 }
          }
        }
      }));
      navigate('/dungeon');
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(7 - difficulty);
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      'from-green-500 to-green-700',
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700',
      'from-yellow-500 to-yellow-700',
      'from-orange-500 to-orange-700',
      'from-red-500 to-red-700',
      'from-pink-500 to-pink-700'
    ];
    return colors[difficulty - 1] || colors[0];
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                ⚔️ 던전 선택
              </h1>
              <p className="text-text-secondary">
                도전할 던전을 선택하세요. 레벨에 맞는 던전을 선택하는 것이 좋습니다.
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

        {/* Player Status */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-text-primary">
                <span className="text-yellow-400">⭐</span> 레벨: {player.level}
              </div>
              <div className="text-text-primary">
                <span className="text-red-400">❤️</span> HP: {player.hp}/{player.maxHp}
              </div>
              <div className="text-text-primary">
                <span className="text-blue-400">💧</span> MP: {player.mp}/{player.maxMp}
              </div>
              <div className="text-text-primary">
                <span className="text-yellow-400">💰</span> 골드: {player.gold}
              </div>
            </div>
          </div>
        </div>

        {/* Dungeon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dungeons.map((dungeon) => (
            <div
              key={dungeon.id}
              className={`relative transform transition-all duration-300 ${
                dungeon.unlocked ? 'hover:scale-105' : ''
              }`}
            >
              <div
                onClick={() => handleDungeonSelect(dungeon.id)}
                className={`bg-black/50 backdrop-blur-md rounded-xl border-2 overflow-hidden cursor-pointer ${
                  dungeon.unlocked
                    ? 'border-border hover:border-primary hover:shadow-xl hover:shadow-primary/20'
                    : 'border-gray-700 opacity-60 cursor-not-allowed'
                } ${selectedDungeon === dungeon.id ? 'border-accent shadow-lg shadow-accent/30' : ''}`}
              >
                {/* Dungeon Header */}
                <div className={`p-4 bg-gradient-to-r ${getDifficultyColor(dungeon.difficulty)}`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{dungeon.icon}</div>
                    <h3 className="text-xl font-bold text-white">
                      {dungeon.unlocked ? dungeon.name : '???'}
                    </h3>
                  </div>
                </div>

                {/* Dungeon Body */}
                <div className="p-4">
                  {dungeon.unlocked ? (
                    <>
                      <p className="text-sm text-text-secondary mb-3">
                        {dungeon.description}
                      </p>

                      {/* Difficulty */}
                      <div className="mb-3">
                        <div className="text-xs text-text-secondary mb-1">난이도</div>
                        <div className="text-yellow-400">
                          {getDifficultyStars(dungeon.difficulty)}
                        </div>
                      </div>

                      {/* Recommended Level */}
                      <div className="mb-3">
                        <div className="text-xs text-text-secondary mb-1">권장 레벨</div>
                        <div className={`font-bold ${
                          player.level >= dungeon.recommendedLevel
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          Lv.{dungeon.recommendedLevel}+
                        </div>
                      </div>

                      {/* Boss */}
                      <div className="mb-3">
                        <div className="text-xs text-text-secondary mb-1">보스</div>
                        <div className="text-text-primary font-semibold">
                          {dungeon.boss}
                        </div>
                      </div>

                      {/* Rewards */}
                      <div>
                        <div className="text-xs text-text-secondary mb-1">주요 보상</div>
                        <div className="flex flex-wrap gap-1">
                          {dungeon.rewards.map((reward, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                            >
                              {reward}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-gray-400">
                        레벨 {dungeons.find(d => d.id === dungeon.id)?.recommendedLevel - 2}에 잠금 해제
                      </p>
                    </div>
                  )}
                </div>

                {/* Enter Button */}
                {dungeon.unlocked && (
                  <div className="px-4 pb-4">
                    <button
                      className={`w-full py-2 rounded-lg font-bold transition ${
                        selectedDungeon === dungeon.id
                          ? 'bg-accent text-background'
                          : 'bg-primary hover:bg-secondary text-white'
                      }`}
                    >
                      {selectedDungeon === dungeon.id ? '✓ 선택됨' : '입장하기'}
                    </button>
                  </div>
                )}
              </div>

              {/* Lock Overlay */}
              {!dungeon.unlocked && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🔒</div>
                    <div className="text-gray-300 font-bold">잠김</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && selectedDungeon && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl p-8 max-w-md w-full border border-border">
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                던전 입장 확인
              </h2>
              <p className="text-text-secondary mb-6">
                {dungeons.find(d => d.id === selectedDungeon)?.name}에 입장하시겠습니까?
                <br />
                <span className="text-yellow-400 text-sm">
                  ⚠️ 던전 내에서 패배 시 입구로 돌아갑니다.
                </span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleEnterDungeon}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-bold transition"
                >
                  입장하기
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedDungeon(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DungeonSelection;