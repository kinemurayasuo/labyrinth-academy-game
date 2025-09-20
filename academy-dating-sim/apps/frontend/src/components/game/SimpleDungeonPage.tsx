import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import dungeonsData from '../../data/dungeons.json';
import EnhancedBattleScreen from './EnhancedBattleScreen';

// Map tile types - FIXED: 2 is now the start position in the JSON
const TILE_EMPTY = 0;
const TILE_WALL = 1;
const TILE_START = 2;  // Start position
const TILE_TREASURE = 3;
const TILE_TRAP = 4;
const TILE_EXIT = 5;
const TILE_BOSS = 6;

const SimpleDungeonPage: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { updatePlayer, updateHpMp, addItem, updateMoney, gainExperience } = useGameStore((state: any) => state.actions);

  // Get current floor data
  const currentFloorIndex = (player.dungeonProgress?.currentFloor || 1) - 1;
  const currentFloor = dungeonsData.floors[currentFloorIndex] || dungeonsData.floors[0];

  // Battle state
  const [inBattle, setInBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<any>(null);

  // Find the start position in the map
  const findStartPosition = (layout: number[][]) => {
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        if (layout[y][x] === TILE_START) {
          return { x, y };
        }
      }
    }
    // Fallback to first empty tile
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        if (layout[y][x] === TILE_EMPTY) {
          return { x, y };
        }
      }
    }
    return { x: 1, y: 1 };
  };

  // Initialize map from floor data
  const [dungeonMap, setDungeonMap] = useState<number[][]>(() => {
    return currentFloor.layout.map(row => [...row]);
  });

  const [playerPos, setPlayerPos] = useState(() => {
    const savedPos = player.dungeonProgress?.position;
    if (savedPos && savedPos.x !== undefined && savedPos.y !== undefined) {
      // Check if saved position is valid
      if (dungeonMap[savedPos.y] && dungeonMap[savedPos.y][savedPos.x] !== TILE_WALL) {
        return savedPos;
      }
    }
    return findStartPosition(dungeonMap);
  });

  const [visitedTiles, setVisitedTiles] = useState<Set<string>>(() => {
    const startPos = playerPos;
    return new Set([`${startPos.x},${startPos.y}`]);
  });

  const [message, setMessage] = useState('던전에 입장했습니다!');
  const [openedTreasures, setOpenedTreasures] = useState<Set<string>>(new Set());
  const [defeatedEnemies, setDefeatedEnemies] = useState<Set<string>>(new Set());
  const [enemyPositions, setEnemyPositions] = useState<Map<string, any>>(new Map());

  // Initialize enemy positions on mount
  useEffect(() => {
    const enemyMap = new Map<string, any>();

    // Spawn enemies randomly on empty tiles
    if (currentFloor.enemies && currentFloor.enemies.length > 0) {
      const emptyTiles: {x: number, y: number}[] = [];

      for (let y = 0; y < dungeonMap.length; y++) {
        for (let x = 0; x < dungeonMap[y].length; x++) {
          if (dungeonMap[y][x] === TILE_EMPTY) {
            const pos = { x, y };
            // Don't spawn near start position
            const startPos = findStartPosition(dungeonMap);
            const distFromStart = Math.abs(pos.x - startPos.x) + Math.abs(pos.y - startPos.y);
            if (distFromStart > 2) {
              emptyTiles.push(pos);
            }
          }
        }
      }

      // Spawn 3-5 enemies randomly
      const enemyCount = Math.min(emptyTiles.length, 3 + Math.floor(Math.random() * 3));
      for (let i = 0; i < enemyCount; i++) {
        if (emptyTiles.length > 0) {
          const randomIndex = Math.floor(Math.random() * emptyTiles.length);
          const pos = emptyTiles[randomIndex];
          const enemyType = currentFloor.enemies[Math.floor(Math.random() * currentFloor.enemies.length)];
          enemyMap.set(`${pos.x},${pos.y}`, { ...enemyType });
          emptyTiles.splice(randomIndex, 1);
        }
      }
    }

    setEnemyPositions(enemyMap);
  }, [currentFloor]);

  // Sync player position with store
  useEffect(() => {
    updatePlayer({
      dungeonProgress: {
        ...player.dungeonProgress,
        position: playerPos
      }
    });
  }, [playerPos]);

  // Add visibility radius around player
  useEffect(() => {
    const newVisited = new Set(visitedTiles);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = playerPos.x + dx;
        const y = playerPos.y + dy;
        if (x >= 0 && y >= 0 && y < dungeonMap.length && x < dungeonMap[0].length) {
          newVisited.add(`${x},${y}`);
        }
      }
    }
    setVisitedTiles(newVisited);
  }, [playerPos]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check boundaries
    if (newX < 0 || newY < 0 || newY >= dungeonMap.length || newX >= dungeonMap[0].length) {
      setMessage('벽에 막혀있습니다!');
      return;
    }

    // Check if it's a wall
    const targetTile = dungeonMap[newY][newX];
    if (targetTile === TILE_WALL) {
      setMessage('벽에 막혀있습니다!');
      return;
    }

    // Move player
    setPlayerPos({ x: newX, y: newY });

    // Handle tile events
    handleTileEvent(newX, newY, targetTile);
  }, [playerPos, dungeonMap]);

  const handleTileEvent = (x: number, y: number, tileType: number) => {
    const tileKey = `${x},${y}`;

    // Check for enemy encounter first
    if (enemyPositions.has(tileKey) && !defeatedEnemies.has(tileKey)) {
      const enemy = enemyPositions.get(tileKey);
      setCurrentEnemy(enemy);
      setInBattle(true);
      setMessage(`${enemy.name}과(와) 조우했습니다!`);
      return;
    }

    switch (tileType) {
      case TILE_EMPTY:
      case TILE_START:
        setMessage('던전을 탐험 중입니다...');
        break;

      case TILE_TREASURE:
        if (!openedTreasures.has(tileKey)) {
          openTreasure(x, y);
        } else {
          setMessage('이미 열어본 보물상자입니다.');
        }
        break;

      case TILE_TRAP:
        triggerTrap();
        break;

      case TILE_EXIT:
        handleExit();
        break;

      case TILE_BOSS:
        if (!defeatedEnemies.has(tileKey)) {
          encounterBoss(x, y);
        } else {
          setMessage('보스는 이미 물리쳤습니다.');
        }
        break;
    }
  };

  const openTreasure = (x: number, y: number) => {
    const treasures = currentFloor.treasures || [
      { name: '소형 포션', effect: 'HP +20', value: 20 },
      { name: '금화', effect: 'Gold +50', value: 50 },
      { name: '마법 수정', effect: 'MP +10', value: 10 }
    ];

    const treasure = treasures[Math.floor(Math.random() * treasures.length)];
    setMessage(`보물상자를 열었습니다! ${treasure.name}을(를) 획득했습니다!`);

    if (treasure.effect.includes('HP')) {
      updateHpMp(Math.min(player.maxHp, player.hp + treasure.value), player.mp);
    } else if (treasure.effect.includes('MP')) {
      updateHpMp(player.hp, Math.min(player.maxMp, player.mp + treasure.value));
    } else if (treasure.effect.includes('Gold')) {
      updateMoney(treasure.value);
    }

    setOpenedTreasures(prev => new Set(prev).add(`${x},${y}`));
  };

  const triggerTrap = () => {
    const damage = Math.floor(Math.random() * 10) + 5;
    setMessage(`함정에 걸렸습니다! ${damage}의 데미지를 받았습니다!`);
    updateHpMp(Math.max(1, player.hp - damage), player.mp);
  };

  const handleExit = () => {
    if (currentFloorIndex < dungeonsData.floors.length - 1) {
      setMessage('다음 층으로 이동합니다!');
      updatePlayer({
        dungeonProgress: {
          ...player.dungeonProgress,
          currentFloor: currentFloorIndex + 2,
          position: { x: 1, y: 1 }
        }
      });
      // Reset for next floor
      setDungeonMap(dungeonsData.floors[currentFloorIndex + 1].layout);
      setPlayerPos(findStartPosition(dungeonsData.floors[currentFloorIndex + 1].layout));
      setVisitedTiles(new Set());
      setOpenedTreasures(new Set());
      setDefeatedEnemies(new Set());
    } else {
      setMessage('축하합니다! 던전을 클리어했습니다!');
      gainExperience(100);
      updateMoney(500);
      navigate('/game');
    }
  };

  const encounterBoss = (x: number, y: number) => {
    const boss = currentFloor.boss;
    if (!boss) {
      setMessage('보스가 없습니다.');
      return;
    }

    const tileKey = `${x},${y}`;
    setCurrentEnemy(boss);
    setInBattle(true);
    setMessage(`보스 ${boss.name}과(와) 전투를 시작합니다!`);
  };

  // Battle handlers
  const handleBattleVictory = () => {
    const enemyKey = `${playerPos.x},${playerPos.y}`;
    setDefeatedEnemies(prev => new Set([...prev, enemyKey]));
    setInBattle(false);
    setCurrentEnemy(null);
    setMessage('전투에서 승리했습니다!');
  };

  const handleBattleDefeat = () => {
    setInBattle(false);
    setCurrentEnemy(null);
    // Respawn at start position with some HP restored
    const startPos = findStartPosition(dungeonMap);
    setPlayerPos(startPos);
    updateHpMp(Math.floor(player.maxHp * 0.5), player.mp);
    setMessage('전투에서 패배했습니다. 시작 지점으로 돌아갑니다.');
  };

  const handleBattleFlee = () => {
    setInBattle(false);
    setCurrentEnemy(null);
    // Move player back one step randomly
    const directions = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 }
    ];

    for (const dir of directions) {
      const newX = playerPos.x + dir.dx;
      const newY = playerPos.y + dir.dy;
      if (newX >= 0 && newY >= 0 && newY < dungeonMap.length &&
          newX < dungeonMap[0].length && dungeonMap[newY][newX] !== TILE_WALL) {
        setPlayerPos({ x: newX, y: newY });
        break;
      }
    }
    setMessage('전투에서 도망쳤습니다.');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (inBattle) return; // Disable movement during battle

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, inBattle]);

  // Show battle screen if in battle
  if (inBattle && currentEnemy) {
    return (
      <EnhancedBattleScreen
        enemy={currentEnemy}
        onVictory={handleBattleVictory}
        onDefeat={handleBattleDefeat}
        onFlee={handleBattleFlee}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                던전 탐험 - {currentFloor.name}
              </h1>
              <p className="text-text-secondary">층: {currentFloor.id} | 위치: ({playerPos.x}, {playerPos.y})</p>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="btn-secondary px-6 py-3 rounded-xl font-semibold"
            >
              돌아가기
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dungeon Map */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="grid grid-cols-8 gap-1 mb-4">
                {dungeonMap.map((row, y) => (
                  row.map((tile, x) => {
                    const tileKey = `${x},${y}`;
                    const isVisible = visitedTiles.has(tileKey);
                    const isPlayer = x === playerPos.x && y === playerPos.y;
                    const hasEnemy = enemyPositions.has(tileKey) && !defeatedEnemies.has(tileKey);

                    return (
                      <div
                        key={tileKey}
                        className={`
                          aspect-square flex items-center justify-center rounded
                          ${!isVisible ? 'bg-gray-800' :
                            tile === TILE_WALL ? 'bg-gray-700' :
                            tile === TILE_START ? 'bg-green-800' :
                            tile === TILE_EXIT ? 'bg-yellow-800' :
                            tile === TILE_BOSS ? 'bg-red-900' :
                            'bg-gray-600'}
                          ${isPlayer ? 'ring-2 ring-primary animate-pulse' : ''}
                        `}
                      >
                        {isVisible && (
                          <>
                            {/* Render tile content */}
                            {isPlayer ? (
                              <div className="text-2xl">🧙</div>
                            ) : (
                              <div className="text-xl">
                                {tile === TILE_TREASURE && !openedTreasures.has(tileKey) && '📦'}
                                {tile === TILE_EXIT && '🚪'}
                                {tile === TILE_BOSS && !defeatedEnemies.has(tileKey) && '👹'}
                                {tile === TILE_TRAP && '⚠️'}
                                {hasEnemy && (
                                  <span className="animate-pulse">
                                    {enemyPositions.get(tileKey)?.icon || '👾'}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>

              {/* Controls */}
              <div className="glass-card p-4">
                <p className="text-text-secondary text-center mb-3">
                  방향키 또는 WASD로 이동
                </p>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  <div />
                  <button
                    onClick={() => movePlayer(0, -1)}
                    className="btn-primary p-3 rounded-lg"
                  >
                    ↑
                  </button>
                  <div />
                  <button
                    onClick={() => movePlayer(-1, 0)}
                    className="btn-primary p-3 rounded-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => movePlayer(0, 1)}
                    className="btn-primary p-3 rounded-lg"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => movePlayer(1, 0)}
                    className="btn-primary p-3 rounded-lg"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Player Stats */}
            <div className="glass-card p-4">
              <h3 className="text-xl font-bold text-text-primary mb-3">플레이어 상태</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">HP</span>
                    <span className="text-text-secondary">{player.hp}/{player.maxHp}</span>
                  </div>
                  <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                      style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">MP</span>
                    <span className="text-text-secondary">{player.mp}/{player.maxMp}</span>
                  </div>
                  <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                      style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-background-dark p-2 rounded">
                  <span className="text-yellow-400">레벨</span>
                  <span className="float-right text-text-primary">{player.level}</span>
                </div>
                <div className="bg-background-dark p-2 rounded">
                  <span className="text-green-400">골드</span>
                  <span className="float-right text-text-primary">{player.money}</span>
                </div>
              </div>
            </div>

            {/* Message Log */}
            <div className="glass-card p-4">
              <h3 className="text-xl font-bold text-text-primary mb-3">메시지</h3>
              <div className="bg-background-dark p-3 rounded-lg h-32 overflow-y-auto">
                <p className="text-text-secondary">{message}</p>
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-4">
              <h3 className="text-xl font-bold text-text-primary mb-3">범례</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧙</span>
                  <span className="text-text-secondary">플레이어</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👾</span>
                  <span className="text-text-secondary">몬스터</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <span className="text-text-secondary">보물상자</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚪</span>
                  <span className="text-text-secondary">출구</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👹</span>
                  <span className="text-text-secondary">보스</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-text-secondary">함정</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDungeonPage;