import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import type { Monster } from '../types/game';
import DungeonMap from './DungeonMap';
import BattleScreen from './BattleScreen';
import Inventory from './Inventory';
import dungeonsData from '../data/dungeons.json';

// Type assertions for JSON data
const dungeonFloors = dungeonsData.floors as any[];

const DungeonPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use Zustand store
  const player = useGameStore((state: any) => state.player);
  const { updateHpMp, advanceTime, addItem } = useGameStore((state: any) => state.actions);
  
  // Get current dungeon floor
  const getCurrentDungeonFloor = () => {
    return dungeonFloors.find(floor => floor.id === player.dungeonProgress.currentFloor) || dungeonFloors[0];
  };
  
  const currentFloor = getCurrentDungeonFloor();
  const [isInBattle, setIsInBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Monster | null>(null);
  const [gameMessage, setGameMessage] = useState('던전에 입장했습니다!');
  const [showInventory, setShowInventory] = useState(false);

  const handleExitDungeon = () => {
    navigate('/game');
  };

  const handlePlayerMove = (newX: number, newY: number) => {
    // Check bounds
    if (newX < 0 || newY < 0 || newY >= currentFloor.layout.length || newX >= currentFloor.layout[0].length) {
      return;
    }
    
    // Check if it's a wall
    if (currentFloor.layout[newY][newX] === 1) {
      return;
    }
    
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

    // Check for random encounters
    if (Math.random() < 0.3) {
      const enemy: Monster = {
        id: 'dungeon_monster',
        name: '던전 몬스터',
        hp: 50 + Math.floor(Math.random() * 30),
        maxHp: 80,
        attack: 15 + Math.floor(Math.random() * 10),
        defense: 5 + Math.floor(Math.random() * 5),
        agility: 10,
        experience: 20,
        drops: [],
        sprite: '👾',
        description: '던전의 어둠 속에서 나타난 몬스터'
      };
      setCurrentEnemy(enemy);
      setGameMessage('몬스터가 나타났습니다!');
      setIsInBattle(true);
    } else {
      setGameMessage('던전을 탐험 중입니다...');
    }
  };

  const handleCellInteract = (x: number, y: number) => {
    const cell = currentFloor.layout[y][x];

    switch (cell) {
      case 3: // treasure
        setGameMessage('보물 상자를 발견했습니다!');
        addItem('random_item');
        break;
      case 4: // stairs
        setGameMessage('다음 층으로 가는 계단을 발견했습니다!');
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
  };

  const handleBattleDefeat = () => {
    setIsInBattle(false);
    setCurrentEnemy(null);
    setGameMessage('패배했습니다... 던전 입구로 돌아갑니다.');
    // Reset player position
  };

  const handleFlee = () => {
    setIsInBattle(false);
    setCurrentEnemy(null);
    setGameMessage('전투에서 도망쳤습니다.');
  };

  // Show battle screen if in battle
  if (isInBattle && currentEnemy) {
    return (
      <BattleScreen
        player={player}
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
              <DungeonMap
                player={player}
                currentFloor={currentFloor}
                onMovePlayer={handlePlayerMove}
                onInteract={handleCellInteract}
              />
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
                  onClick={() => handlePlayerMove(player.dungeonProgress.position.x, player.dungeonProgress.position.y - 1)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  ↑
                </button>
                <div></div>
                <button
                  onClick={() => handlePlayerMove(player.dungeonProgress.position.x - 1, player.dungeonProgress.position.y)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  ←
                </button>
                <button
                  onClick={() => handleCellInteract(player.dungeonProgress.position.x, player.dungeonProgress.position.y)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
                >
                  조사
                </button>
                <button
                  onClick={() => handlePlayerMove(player.dungeonProgress.position.x + 1, player.dungeonProgress.position.y)}
                  className="p-2 bg-primary hover:bg-secondary text-white rounded transition"
                >
                  →
                </button>
                <div></div>
                <button
                  onClick={() => handlePlayerMove(player.dungeonProgress.position.x, player.dungeonProgress.position.y + 1)}
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

        {/* Battle Interface (if in battle) */}
        {isInBattle && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-background backdrop-blur-md rounded-lg p-6 max-w-md w-full border border-border">
              <h3 className="text-2xl font-bold text-text-primary mb-4">⚔️ 전투</h3>
              <p className="text-text-secondary mb-4">몬스터와 조우했습니다!</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsInBattle(false);
                    setGameMessage('전투에서 승리했습니다!');
                  }}
                  className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded transition"
                >
                  공격
                </button>
                <button
                  onClick={() => {
                    setIsInBattle(false);
                    setGameMessage('전투에서 도망쳤습니다.');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition"
                >
                  도망
                </button>
              </div>
            </div>
          </div>
        )}
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