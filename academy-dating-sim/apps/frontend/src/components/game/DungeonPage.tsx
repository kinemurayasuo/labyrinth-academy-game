import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import type { Monster } from '../../types/game';
import DungeonMap from './DungeonMap';
import Battle from './Battle';
import Inventory from './Inventory';
import dungeonsData from '../../data/dungeons.json';
import { DungeonGenerator, DungeonFloor } from '../../utils/dungeonGenerator';

// Type assertions for JSON data
const dungeonFloors = dungeonsData.floors as any[];

const DungeonPage: React.FC = () => {
  const navigate = useNavigate();

  // Use Zustand store
  const player = useGameStore((state: any) => state.player);
  const { updateHpMp, advanceTime, addItem, goToNextFloor } = useGameStore((state: any) => state.actions);

  const [currentFloor, setCurrentFloor] = useState<any>(null);
  const [randomizedFloor, setRandomizedFloor] = useState<DungeonFloor | null>(null);
  const [isInBattle, setIsInBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Monster | null>(null);
  const [gameMessage, setGameMessage] = useState('던전에 입장했습니다!');
  const [showInventory, setShowInventory] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });

  // Generate random dungeon on mount or floor change
  useEffect(() => {
    const floorId = player.dungeonProgress?.currentFloor || 1;
    const floorData = dungeonFloors.find(floor => floor.id === floorId) || dungeonFloors[0];

    // Generate random dungeon
    const generator = new DungeonGenerator(15, 15, floorId, floorData.theme || 'forest');
    const generatedFloor = generator.generateFloor();

    setCurrentFloor(floorData);
    setRandomizedFloor(generatedFloor);
    setPlayerPosition(generatedFloor.startPosition);
    setGameMessage(`던전 ${floorId}층에 입장했습니다!`);
  }, [player.dungeonProgress?.currentFloor]);

  // Use randomized layout if available
  const getLayoutCell = (x: number, y: number) => {
    if (randomizedFloor) {
      return randomizedFloor.layout[y]?.[x] ?? 1;
    }
    return currentFloor?.layout?.[y]?.[x] ?? 1;
  };

  const handleExitDungeon = () => {
    navigate('/game');
  };

  const handlePlayerMove = (newX: number, newY: number) => {
    // Check bounds
    if (newX < 0 || newY < 0 || newY >= currentFloor.layout.length || newX >= currentFloor.layout[0].length) {
      return;
    }

    // Check if it's a wall
    if (getLayoutCell(newX, newY) === 1) {
      return;
    }

    // Update local position state
    setPlayerPosition({ x: newX, y: newY });

    // Update player position in store
    useGameStore.setState((state: any) => ({
      player: {
        ...state.player,
        dungeonProgress: {
          ...state.player.dungeonProgress,
          position: { x: newX, y: newY }
        }
      }
    }));

    // Check cell type for special encounters
    const cellType = getLayoutCell(newX, newY);

    // Monster encounter on specific cells or random chance
    if (cellType === 5 || (cellType === 0 && Math.random() < 0.2)) {
      const enemyList = currentFloor.enemies || [];
      const randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)] || {
        id: 'slime',
        name: '슬라임',
        hp: 30,
        maxHp: 30,
        attack: 10,
        defense: 5,
        agility: 8,
        experience: 15,
        gold: 10,
        sprite: '🟢'
      };

      const enemy: Monster = {
        ...randomEnemy,
        hp: randomEnemy.hp || randomEnemy.maxHp,
        gold: randomEnemy.gold || Math.floor(Math.random() * 50) + 20
      };

      setCurrentEnemy(enemy);
      setGameMessage(`${enemy.name}이(가) 나타났습니다!`);
      setIsInBattle(true);
    } else if (cellType === 6 && currentFloor.boss) {
      // Boss encounter
      const boss: Monster = {
        ...currentFloor.boss,
        hp: currentFloor.boss.hp || currentFloor.boss.maxHp,
        gold: currentFloor.boss.gold || 200
      };
      setCurrentEnemy(boss);
      setGameMessage(`보스 ${boss.name}이(가) 나타났습니다!`);
      setIsInBattle(true);
    } else {
      setGameMessage('던전을 탐험 중입니다...');
    }
  };

  const handleCellInteract = (x: number, y: number) => {
    const cell = getLayoutCell(x, y);

    switch (cell) {
      case 3: // treasure
        const treasure = currentFloor.treasures?.find((t: any) => t.position.x === x && t.position.y === y);
        if (treasure) {
          let foundItems = [];
          treasure.contents.forEach((content: any) => {
            if (Math.random() < content.chance) {
              for (let i = 0; i < content.quantity; i++) {
                addItem(content.itemId);
              }
              foundItems.push(`${content.itemId} x${content.quantity}`);
            }
          });

          if (foundItems.length > 0) {
            setGameMessage(`보물 상자를 열어 ${foundItems.join(', ')}을(를) 획득했습니다!`);
          } else {
            setGameMessage('보물 상자가 비어있었습니다.');
          }
          // Note: In a real game, we'd mark this chest as opened.
        } else {
          setGameMessage('보물 상자를 발견했지만, 지금은 열 수 없는 것 같습니다.');
        }
        break;
      case 4: // stairs
        const nextFloorExists = dungeonFloors.some(floor => floor.id === currentFloor.id + 1);
        if (nextFloorExists) {
          setGameMessage('다음 층으로 이동합니다.');
          goToNextFloor();
        } else {
          setGameMessage('더 이상 내려갈 곳이 없습니다. 여기가 마지막 층입니다.');
        }
        break;
      case 2: // trap
        setGameMessage('함정에 걸렸습니다! 체력이 감소했습니다.');
        updateHpMp(-15, 0);
        break;
      default:
        setGameMessage('특별한 것이 없습니다.');
    }
  };

  const handleBattleVictory = (rewards: { exp: number; gold: number; items: string[] }) => {
    setIsInBattle(false);
    setCurrentEnemy(null);
    setGameMessage(`승리! 경험치 +${rewards.exp}, 골드 +${rewards.gold}를 획득했습니다!`);

    // Mark cell as cleared if it was a monster spawn point
    const cellType = getLayoutCell(playerPosition.x, playerPosition.y);
    if ((cellType === 5 || cellType === 6) && randomizedFloor) {
      randomizedFloor.layout[playerPosition.y][playerPosition.x] = 0;
    }
  };

  const handleBattleDefeat = () => {
    setIsInBattle(false);
    setCurrentEnemy(null);
    setGameMessage('패배했습니다... 던전 입구로 돌아갑니다.');

    // Reset player position to start
    const startPos = { x: 1, y: 1 };
    setPlayerPosition(startPos);
    useGameStore.setState((state: any) => ({
      player: {
        ...state.player,
        dungeonProgress: {
          ...state.player.dungeonProgress,
          position: startPos
        }
      }
    }));
  };

  const handleFlee = () => {
    setIsInBattle(false);
    setCurrentEnemy(null);
    setGameMessage('전투에서 도망쳤습니다.');
  };

  // Show battle screen if in battle
  if (isInBattle && currentEnemy) {
    return (
      <Battle
        enemy={currentEnemy}
        onVictory={handleBattleVictory}
        onDefeat={handleBattleDefeat}
        onFlee={handleFlee}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 text-text-primary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 border border-border">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-primary bg-clip-text text-transparent">
              ⚔️ 던전 탐험
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleExitDungeon}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                🚪 던전 나가기
              </button>
            </div>
          </div>
        </div>

        {/* Player Status in Dungeon */}
        <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-text-primary">
            <div className="flex items-center gap-2">
              <span className="text-red-400">❤️</span>
              <span>체력: {player.hp}/{player.maxHp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">💧</span>
              <span>마나: {player.mp}/{player.maxMp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐</span>
              <span>레벨: {player.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🏢</span>
              <span>층수: {player.dungeonProgress.currentFloor}</span>
            </div>
          </div>
        </div>

        {/* Game Message */}
        <div className="bg-black/20 border-l-4 border-accent text-accent p-4 mb-4 rounded">
          <p className="font-medium">{gameMessage}</p>
        </div>

        {/* Main Dungeon Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Dungeon Map */}
          <div className="lg:col-span-3">
            <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-4 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">🗺️ 던전 지도</h3>
              {randomizedFloor && (
              <DungeonMap
                player={{
                  ...player,
                  dungeonProgress: {
                    ...player.dungeonProgress,
                    position: playerPosition
                  }
                }}
                currentFloor={{
                  ...currentFloor,
                  layout: randomizedFloor.layout
                }}
                onMovePlayer={handlePlayerMove}
                onInteract={handleCellInteract}
              />
              )}
            </div>
          </div>

          {/* Dungeon Controls */}
          <div className="space-y-4">
            {/* Movement Controls */}
            <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-4 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">🎮 조작</h3>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button
                  onClick={() => handlePlayerMove(playerPosition.x, playerPosition.y - 1)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  ↑
                </button>
                <div></div>
                <button
                  onClick={() => handlePlayerMove(playerPosition.x - 1, playerPosition.y)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  ←
                </button>
                <button
                  onClick={() => handleCellInteract(playerPosition.x, playerPosition.y)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
                >
                  조사
                </button>
                <button
                  onClick={() => handlePlayerMove(playerPosition.x + 1, playerPosition.y)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  →
                </button>
                <div></div>
                <button
                  onClick={() => handlePlayerMove(playerPosition.x, playerPosition.y + 1)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  ↓
                </button>
                <div></div>
              </div>
            </div>

            {/* Dungeon Actions */}
            <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-4 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">⚡ 행동</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setGameMessage('주변을 살펴보았습니다.')}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  🔍 주변 조사
                </button>
                <button
                  onClick={() => {
                    updateHpMp(20, 10);
                    advanceTime();
                    setGameMessage('휴식을 취해 체력과 마나를 회복했습니다.');
                  }}
                  className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  💤 휴식
                </button>
                <button
                  onClick={() => setShowInventory(true)}
                  className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  🎒 인벤토리
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-4 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">📋 범례</h3>
              <div className="space-y-1 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded"></span>
                  <span>플레이어</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-800 rounded"></span>
                  <span>벽</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-200 rounded"></span>
                  <span>통로</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                  <span>보물</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded"></span>
                  <span>계단</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded"></span>
                  <span>몬스터</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {showInventory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-primary">🎒 인벤토리</h2>
              <button
                onClick={() => setShowInventory(false)}
                className="text-text-secondary hover:text-text-primary text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Inventory
                onClose={() => setShowInventory(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DungeonPage;