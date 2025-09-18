import React, { useState } from 'react';
import type { Player, DungeonFloor } from '../types/game';
import MonsterPortrait from './MonsterPortrait';

interface DungeonMapProps {
  player: Player;
  currentFloor: DungeonFloor;
  onMovePlayer: (newX: number, newY: number) => void;
  onInteract: (x: number, y: number) => void;
}

const DungeonMap: React.FC<DungeonMapProps> = ({
  player,
  currentFloor,
  onMovePlayer,
  onInteract,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);

  const getCellContent = (x: number, y: number, cellType: number) => {
    const isPlayerHere = player.dungeonProgress.position.x === x && player.dungeonProgress.position.y === y;

    if (isPlayerHere) {
      return (
        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
          P
        </div>
      );
    }

    switch (cellType) {
      case 0: // Empty space
        return (
          <div className="w-full h-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer" />
        );
      case 1: // Wall
        return (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-600 rounded-sm" />
          </div>
        );
      case 2: // Start point
        return (
          <div className="w-full h-full bg-green-400 flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        );
      case 3: // Stairs
        return (
          <div className="w-full h-full bg-yellow-400 flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition-colors">
            <span className="text-yellow-800 text-xs font-bold">↑</span>
          </div>
        );
      case 4: // Treasure
        const treasure = currentFloor.treasures.find(t => t.position.x === x && t.position.y === y);
        return (
          <div className={`w-full h-full ${treasure?.opened ? 'bg-brown-300' : 'bg-yellow-600'} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}>
            <span className="text-yellow-100 text-xs">
              {treasure?.opened ? '📦' : '💰'}
            </span>
          </div>
        );
      case 5: // Enemy spawn
        return (
          <div className="w-full h-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors">
            <span className="text-white text-xs">👹</span>
          </div>
        );
      case 6: // Boss room
        return (
          <div className="w-full h-full bg-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
            <span className="text-white text-xs font-bold">👑</span>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-300" />
        );
    }
  };

  const handleCellClick = (x: number, y: number, cellType: number) => {
    if (cellType === 1) return; // Can't move to walls

    const currentX = player.dungeonProgress.position.x;
    const currentY = player.dungeonProgress.position.y;

    // Check if the clicked cell is adjacent to current position
    const isAdjacent = Math.abs(x - currentX) <= 1 && Math.abs(y - currentY) <= 1 &&
                       (Math.abs(x - currentX) + Math.abs(y - currentY)) === 1;

    if (isAdjacent || (x === currentX && y === currentY)) {
      if (x === currentX && y === currentY) {
        // Interact with current cell
        onInteract(x, y);
      } else {
        // Move to adjacent cell
        onMovePlayer(x, y);
      }
      setSelectedCell({ x, y });
    }
  };

  const getCellDescription = (cellType: number, x: number, y: number) => {
    switch (cellType) {
      case 0: return '빈 공간';
      case 1: return '벽';
      case 2: return '시작 지점';
      case 3: return '다음 층으로 가는 계단';
      case 4:
        const treasure = currentFloor.treasures.find(t => t.position.x === x && t.position.y === y);
        return treasure?.opened ? '빈 상자' : '보물 상자';
      case 5: return '몬스터 출현 지점';
      case 6: return '보스 방';
      default: return '알 수 없는 지역';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6 rounded-lg shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {currentFloor.name} (층 {currentFloor.id})
        </h3>
        <div className="text-sm text-purple-200">
          위치: ({player.dungeonProgress.position.x}, {player.dungeonProgress.position.y})
        </div>
      </div>

      <p className="text-purple-200 text-sm mb-4">{currentFloor.description}</p>

      {/* Map Grid */}
      <div className="bg-black/30 p-4 rounded-lg mb-4">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${currentFloor.layout[0].length}, 1fr)`,
            maxWidth: '400px'
          }}
        >
          {currentFloor.layout.map((row, y) =>
            row.map((cellType, x) => (
              <div
                key={`${x}-${y}`}
                className={`
                  w-8 h-8 border border-gray-600 relative
                  ${selectedCell?.x === x && selectedCell?.y === y ? 'ring-2 ring-blue-400' : ''}
                `}
                onClick={() => handleCellClick(x, y, cellType)}
                title={getCellDescription(cellType, x, y)}
              >
                {getCellContent(x, y, cellType)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>플레이어</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800"></div>
          <span>벽</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 flex items-center justify-center text-white text-xs">💰</div>
          <span>보물</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 flex items-center justify-center text-white text-xs">👹</div>
          <span>몬스터</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 flex items-center justify-center text-yellow-800 text-xs">↑</div>
          <span>계단</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 flex items-center justify-center text-white text-xs">👑</div>
          <span>보스</span>
        </div>
      </div>

      {/* Floor Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enemies */}
        <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
          <h4 className="font-bold text-red-200 mb-2">등장 몬스터</h4>
          <div className="space-y-2">
            {currentFloor.enemies.map((enemy) => (
              <div key={enemy.id} className="flex items-center gap-2">
                <MonsterPortrait monsterId={enemy.sprite} size="small" />
                <div>
                  <div className="text-sm text-red-200">{enemy.name}</div>
                  <div className="text-xs text-red-300">HP: {enemy.hp} | 공격: {enemy.attack}</div>
                </div>
              </div>
            ))}
            {currentFloor.boss && (
              <div className="border-t border-red-500/30 pt-2 mt-2">
                <div className="flex items-center gap-2">
                  <MonsterPortrait monsterId={currentFloor.boss.sprite} size="small" />
                  <div>
                    <div className="text-sm text-yellow-200 font-bold">{currentFloor.boss.name} (보스)</div>
                    <div className="text-xs text-yellow-300">HP: {currentFloor.boss.hp} | 공격: {currentFloor.boss.attack}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Treasures */}
        <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
          <h4 className="font-bold text-yellow-200 mb-2">보물 상자</h4>
          <div className="space-y-1">
            {currentFloor.treasures.map((treasure) => (
              <div key={treasure.id} className="text-sm">
                <span className={treasure.opened ? 'text-gray-400 line-through' : 'text-yellow-200'}>
                  위치: ({treasure.position.x}, {treasure.position.y})
                </span>
                {treasure.opened && <span className="text-green-300 ml-2">✓ 개봉함</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 text-center">
        <p className="text-purple-200 text-sm">
          인접한 칸을 클릭하여 이동하거나, 현재 위치를 클릭하여 상호작용하세요.
        </p>
      </div>
    </div>
  );
};

export default DungeonMap;