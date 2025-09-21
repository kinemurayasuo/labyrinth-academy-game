import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../../store/useGameStore';

interface PuzzlePiece {
  id: number;
  currentPos: number;
  correctPos: number;
  isCorrect: boolean;
}

interface PuzzleLevel {
  id: string;
  name: string;
  image: string;
  gridSize: number;
  timeLimit: number;
  difficulty: number;
  rewards: {
    exp: number;
    money: number;
    item?: string;
  };
}

const PuzzleGame: React.FC = () => {
  const { updateStats, addItem, gainExperience, addGold } = useGameStore((state: any) => state.actions);

  const [selectedLevel, setSelectedLevel] = useState<PuzzleLevel | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'failed'>('menu');
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);

  // Puzzle levels
  const puzzleLevels: PuzzleLevel[] = [
    {
      id: 'sakura_portrait',
      name: '사쿠라의 초상화',
      image: '🌸',
      gridSize: 3,
      timeLimit: 180,
      difficulty: 1,
      rewards: { exp: 50, money: 30, item: 'puzzlePiece' }
    },
    {
      id: 'school_emblem',
      name: '학원 엠블럼',
      image: '🏫',
      gridSize: 4,
      timeLimit: 240,
      difficulty: 2,
      rewards: { exp: 100, money: 50 }
    },
    {
      id: 'magical_artifact',
      name: '마법의 유물',
      image: '💎',
      gridSize: 5,
      timeLimit: 300,
      difficulty: 3,
      rewards: { exp: 150, money: 75, item: 'magicGem' }
    },
    {
      id: 'heroines_group',
      name: '히로인들의 추억',
      image: '👥',
      gridSize: 6,
      timeLimit: 360,
      difficulty: 4,
      rewards: { exp: 200, money: 100, item: 'memoryAlbum' }
    }
  ];

  // Initialize puzzle
  const initializePuzzle = (level: PuzzleLevel) => {
    const totalPieces = level.gridSize * level.gridSize;
    const newPieces: PuzzlePiece[] = [];

    // Create pieces
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        currentPos: i,
        correctPos: i,
        isCorrect: true
      });
    }

    // Shuffle pieces (ensure it's solvable)
    let shuffled = [...newPieces];
    for (let i = 0; i < totalPieces * 10; i++) {
      const emptyPos = shuffled.findIndex(p => p.id === totalPieces - 1);
      const possibleMoves = getPossibleMoves(emptyPos, level.gridSize);
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        swapPieces(shuffled, emptyPos, randomMove);
      }
    }

    // Update positions and check if correct
    shuffled = shuffled.map((piece, index) => ({
      ...piece,
      currentPos: index,
      isCorrect: index === piece.correctPos
    }));

    setPieces(shuffled);
  };

  // Get possible moves for empty space
  const getPossibleMoves = (emptyPos: number, gridSize: number): number[] => {
    const moves: number[] = [];
    const row = Math.floor(emptyPos / gridSize);
    const col = emptyPos % gridSize;

    // Up
    if (row > 0) moves.push(emptyPos - gridSize);
    // Down
    if (row < gridSize - 1) moves.push(emptyPos + gridSize);
    // Left
    if (col > 0) moves.push(emptyPos - 1);
    // Right
    if (col < gridSize - 1) moves.push(emptyPos + 1);

    return moves;
  };

  // Swap two pieces
  const swapPieces = (piecesArray: PuzzlePiece[], pos1: number, pos2: number) => {
    const temp = piecesArray[pos1];
    piecesArray[pos1] = piecesArray[pos2];
    piecesArray[pos2] = temp;
  };

  // Handle piece click
  const handlePieceClick = (clickedPos: number) => {
    if (gameState !== 'playing' || !selectedLevel) return;

    const emptyPiece = pieces.find(p => p.id === selectedLevel.gridSize * selectedLevel.gridSize - 1);
    if (!emptyPiece) return;

    const emptyPos = emptyPiece.currentPos;
    const possibleMoves = getPossibleMoves(emptyPos, selectedLevel.gridSize);

    if (possibleMoves.includes(clickedPos)) {
      const newPieces = [...pieces];
      const clickedPiece = newPieces[clickedPos];
      const emptyPieceIndex = newPieces.findIndex(p => p.id === emptyPiece.id);

      // Swap positions
      newPieces[clickedPos] = emptyPiece;
      newPieces[emptyPieceIndex] = clickedPiece;

      // Update current positions and check if correct
      const updatedPieces = newPieces.map((piece, index) => ({
        ...piece,
        currentPos: index,
        isCorrect: piece.correctPos === index
      }));

      setPieces(updatedPieces);
      setMoveCount(prev => prev + 1);

      // Check if puzzle is solved
      if (updatedPieces.every(p => p.isCorrect)) {
        completePuzzle();
      }
    }
  };

  // Start game
  const startGame = (level: PuzzleLevel) => {
    setSelectedLevel(level);
    setGameState('playing');
    setMoveCount(0);
    setTimeLeft(level.timeLimit);
    setHintsUsed(0);
    setShowHint(false);
    initializePuzzle(level);
  };

  // Complete puzzle
  const completePuzzle = () => {
    if (!selectedLevel) return;

    setGameState('completed');

    // Calculate score
    const timeBonus = Math.max(0, timeLeft * 10);
    const moveBonus = Math.max(0, (100 - moveCount) * 5);
    const hintPenalty = hintsUsed * 50;
    const finalScore = Math.max(0, 1000 + timeBonus + moveBonus - hintPenalty);

    setScore(finalScore);

    // Award rewards
    gainExperience(selectedLevel.rewards.exp);
    addGold(selectedLevel.rewards.money);
    if (selectedLevel.rewards.item) {
      addItem(selectedLevel.rewards.item);
    }

    // Bonus rewards for perfect play
    if (hintsUsed === 0 && moveCount < selectedLevel.gridSize * selectedLevel.gridSize * 3) {
      updateStats({ intelligence: 2 });
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('failed');
    }
  }, [gameState, timeLeft]);

  // Render puzzle piece
  const renderPiece = (piece: PuzzlePiece, index: number) => {
    if (!selectedLevel) return null;

    const isEmpty = piece.id === selectedLevel.gridSize * selectedLevel.gridSize - 1;
    const row = Math.floor(piece.correctPos / selectedLevel.gridSize);
    const col = piece.correctPos % selectedLevel.gridSize;

    // Color based on position for visual puzzle
    const hue = (row * selectedLevel.gridSize + col) * (360 / (selectedLevel.gridSize * selectedLevel.gridSize));

    return (
      <button
        key={piece.id}
        onClick={() => handlePieceClick(index)}
        className={`
          aspect-square rounded-lg transition-all duration-200
          ${isEmpty ? 'bg-gray-800 cursor-default' : 'hover:scale-105 cursor-pointer'}
          ${piece.isCorrect && !isEmpty ? 'ring-2 ring-green-500' : ''}
          ${showHint && !piece.isCorrect && !isEmpty ? 'animate-pulse' : ''}
        `}
        style={{
          backgroundColor: isEmpty ? undefined : `hsl(${hue}, 70%, 50%)`,
          opacity: isEmpty ? 0.3 : 1
        }}
      >
        {!isEmpty && (
          <div className="flex items-center justify-center h-full">
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              {piece.id + 1}
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 mb-4 border border-purple-500">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🧩 퍼즐 게임
            </h1>
            {gameState === 'playing' && (
              <div className="flex gap-4 text-white">
                <div>이동: {moveCount}</div>
                <div>시간: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <div>힌트: {hintsUsed}/3</div>
              </div>
            )}
          </div>
        </div>

        {/* Game States */}
        {gameState === 'menu' && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-6">퍼즐 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {puzzleLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => startGame(level)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-4xl mb-2">{level.image}</div>
                      <div className="text-xl font-bold text-white">{level.name}</div>
                      <div className="text-sm text-gray-300 mt-1">
                        {level.gridSize}x{level.gridSize} 퍼즐
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400">
                        {'⭐'.repeat(level.difficulty)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.floor(level.timeLimit / 60)}분
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-sm text-gray-300">
                      보상: {level.rewards.exp} EXP, {level.rewards.money} Gold
                      {level.rewards.item && `, ${level.rewards.item}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 bg-blue-900/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-2">게임 방법</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 빈 공간 주변의 조각을 클릭하여 이동</li>
                <li>• 모든 조각을 올바른 위치에 배치</li>
                <li>• 시간 내에 완성하면 보너스 점수</li>
                <li>• 힌트는 3번까지 사용 가능 (점수 감점)</li>
              </ul>
            </div>
          </div>
        )}

        {gameState === 'playing' && selectedLevel && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-purple-500">
            {/* Puzzle Grid */}
            <div
              className="grid gap-2 mb-6 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${selectedLevel.gridSize}, 1fr)`,
                maxWidth: `${selectedLevel.gridSize * 100}px`
              }}
            >
              {pieces.map((piece, index) => renderPiece(piece, index))}
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  if (hintsUsed < 3) {
                    setShowHint(true);
                    setHintsUsed(prev => prev + 1);
                    setTimeout(() => setShowHint(false), 3000);
                  }
                }}
                disabled={hintsUsed >= 3}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition"
              >
                💡 힌트 ({3 - hintsUsed}/3)
              </button>
              <button
                onClick={() => initializePuzzle(selectedLevel)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
              >
                🔄 섞기
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
              >
                ✖ 포기
              </button>
            </div>
          </div>
        )}

        {gameState === 'completed' && selectedLevel && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-purple-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">퍼즐 완성!</h2>

              <div className="bg-purple-900/50 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-yellow-400 mb-4">
                  점수: {score}
                </div>
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div>
                    <div className="text-gray-400">이동 횟수</div>
                    <div className="text-xl font-bold">{moveCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">남은 시간</div>
                    <div className="text-xl font-bold">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">힌트 사용</div>
                    <div className="text-xl font-bold">{hintsUsed}/3</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/50 rounded-lg p-4 mb-6">
                <div className="text-lg text-white">획득 보상</div>
                <div className="text-sm text-gray-300 mt-2">
                  {selectedLevel.rewards.exp} EXP | {selectedLevel.rewards.money} Gold
                  {selectedLevel.rewards.item && ` | ${selectedLevel.rewards.item}`}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => startGame(selectedLevel)}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  다시 하기
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                >
                  메뉴로
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-purple-500">
            <div className="text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-white mb-4">시간 초과!</h2>
              <p className="text-gray-300 mb-6">
                제한 시간 내에 퍼즐을 완성하지 못했습니다.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => selectedLevel && startGame(selectedLevel)}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  다시 도전
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                >
                  메뉴로
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame;