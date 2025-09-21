import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../../store/useGameStore';

interface Note {
  id: number;
  lane: number;
  time: number;
  hit: boolean;
  type: 'normal' | 'long' | 'special';
}

interface Song {
  id: string;
  name: string;
  artist: string;
  difficulty: number;
  bpm: number;
  duration: number;
  notes: Note[];
  perfectScore: number;
}

const RhythmGame: React.FC = () => {
  const player = useGameStore((state: any) => state.player);
  const { updateStats, addItem, updateAffection } = useGameStore((state: any) => state.actions);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'results'>('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [perfectHits, setPerfectHits] = useState(0);
  const [greatHits, setGreatHits] = useState(0);
  const [goodHits, setGoodHits] = useState(0);
  const [missedNotes, setMissedNotes] = useState(0);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [hitEffects, setHitEffects] = useState<{id: number; type: string; lane: number}[]>([]);

  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Songs database
  const songs: Song[] = [
    {
      id: 'sakura_theme',
      name: '벚꽃의 검무',
      artist: '사쿠라',
      difficulty: 3,
      bpm: 128,
      duration: 120,
      notes: generateNotes(120, 128, 3),
      perfectScore: 10000
    },
    {
      id: 'yuki_theme',
      name: '얼음 마법의 멜로디',
      artist: '유키',
      difficulty: 2,
      bpm: 100,
      duration: 90,
      notes: generateNotes(90, 100, 2),
      perfectScore: 7500
    },
    {
      id: 'luna_theme',
      name: '달빛 소나타',
      artist: '루나',
      difficulty: 4,
      bpm: 140,
      duration: 150,
      notes: generateNotes(150, 140, 4),
      perfectScore: 15000
    },
    {
      id: 'school_festival',
      name: '학원 축제',
      artist: 'Various',
      difficulty: 1,
      bpm: 120,
      duration: 60,
      notes: generateNotes(60, 120, 1),
      perfectScore: 5000
    }
  ];

  // Generate notes based on song parameters
  function generateNotes(duration: number, bpm: number, difficulty: number): Note[] {
    const notes: Note[] = [];
    const beatInterval = 60000 / bpm; // milliseconds per beat
    const noteFrequency = difficulty * 0.5; // notes per beat
    let noteId = 0;

    for (let time = 2000; time < duration * 1000; time += beatInterval / noteFrequency) {
      const lane = Math.floor(Math.random() * 4);
      const type = Math.random() < 0.1 ? 'special' : Math.random() < 0.2 ? 'long' : 'normal';

      notes.push({
        id: noteId++,
        lane,
        time,
        hit: false,
        type
      });

      // Add simultaneous notes for higher difficulty
      if (difficulty > 2 && Math.random() < (difficulty - 2) * 0.1) {
        const extraLane = (lane + Math.floor(Math.random() * 3) + 1) % 4;
        notes.push({
          id: noteId++,
          lane: extraLane,
          time,
          hit: false,
          type: 'normal'
        });
      }
    }

    return notes;
  }

  // Handle key press
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const laneKeys = ['d', 'f', 'j', 'k'];
    const lane = laneKeys.indexOf(e.key.toLowerCase());

    if (lane === -1) return;

    // Check for notes in the hit zone
    const hitWindow = 150; // milliseconds
    const perfectWindow = 50;
    const greatWindow = 100;

    const notesToCheck = activeNotes.filter(note =>
      note.lane === lane &&
      !note.hit &&
      Math.abs(note.time - currentTime) < hitWindow
    );

    if (notesToCheck.length > 0) {
      const closestNote = notesToCheck.reduce((prev, curr) =>
        Math.abs(curr.time - currentTime) < Math.abs(prev.time - currentTime) ? curr : prev
      );

      const timeDiff = Math.abs(closestNote.time - currentTime);
      closestNote.hit = true;

      let hitType = 'miss';
      let points = 0;

      if (timeDiff < perfectWindow) {
        hitType = 'perfect';
        points = 100;
        setPerfectHits(prev => prev + 1);
      } else if (timeDiff < greatWindow) {
        hitType = 'great';
        points = 75;
        setGreatHits(prev => prev + 1);
      } else {
        hitType = 'good';
        points = 50;
        setGoodHits(prev => prev + 1);
      }

      // Special note bonus
      if (closestNote.type === 'special') {
        points *= 2;
      }

      // Combo multiplier
      const comboMultiplier = Math.min(1 + combo * 0.01, 2);
      points = Math.floor(points * comboMultiplier);

      setScore(prev => prev + points);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });

      // Add hit effect
      setHitEffects(prev => [...prev, {
        id: closestNote.id,
        type: hitType,
        lane
      }]);

      // Remove effect after animation
      setTimeout(() => {
        setHitEffects(prev => prev.filter(effect => effect.id !== closestNote.id));
      }, 500);
    }
  }, [activeNotes, currentTime, combo, gameState]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' || !selectedSong) return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    setCurrentTime(elapsed);

    // Update active notes
    const noteWindow = 3000; // Show notes 3 seconds before
    const newActiveNotes = selectedSong.notes.filter(note =>
      note.time >= elapsed - 200 &&
      note.time <= elapsed + noteWindow
    );
    setActiveNotes(newActiveNotes);

    // Check for missed notes
    const missedNow = newActiveNotes.filter(note =>
      !note.hit && note.time < elapsed - 150
    );

    if (missedNow.length > 0) {
      setMissedNotes(prev => prev + missedNow.length);
      setCombo(0);
      missedNow.forEach(note => note.hit = true);
    }

    // Calculate accuracy
    const totalNotes = perfectHits + greatHits + goodHits + missedNotes;
    if (totalNotes > 0) {
      const acc = ((perfectHits * 100 + greatHits * 75 + goodHits * 50) / (totalNotes * 100)) * 100;
      setAccuracy(Math.round(acc));
    }

    // Check if song is finished
    if (elapsed >= selectedSong.duration * 1000) {
      endGame();
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, selectedSong, perfectHits, greatHits, goodHits, missedNotes]);

  // Start game
  const startGame = (song: Song) => {
    setSelectedSong(song);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAccuracy(100);
    setPerfectHits(0);
    setGreatHits(0);
    setGoodHits(0);
    setMissedNotes(0);
    setActiveNotes([]);
    setCurrentTime(0);
    startTimeRef.current = Date.now();

    // Reset all notes
    song.notes.forEach(note => note.hit = false);
  };

  // End game
  const endGame = () => {
    setGameState('results');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Calculate rewards
    if (selectedSong && score > 0) {
      const scoreRatio = score / selectedSong.perfectScore;
      let rank = 'F';
      let rewards = { exp: 10, money: 5 };

      if (scoreRatio >= 0.95) {
        rank = 'S';
        rewards = { exp: 100, money: 50 };
      } else if (scoreRatio >= 0.85) {
        rank = 'A';
        rewards = { exp: 75, money: 35 };
      } else if (scoreRatio >= 0.75) {
        rank = 'B';
        rewards = { exp: 50, money: 25 };
      } else if (scoreRatio >= 0.60) {
        rank = 'C';
        rewards = { exp: 30, money: 15 };
      } else if (scoreRatio >= 0.40) {
        rank = 'D';
        rewards = { exp: 20, money: 10 };
      }

      // Update player stats
      updateStats({ agility: Math.floor(scoreRatio * 5) });

      // Special rewards for perfect play
      if (accuracy === 100 && missedNotes === 0) {
        addItem('musicNote');
        updateAffection(selectedSong.artist, 10);
      }
    }
  };

  // Setup event listeners
  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyPress);
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, handleKeyPress, gameLoop]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 mb-4 border border-purple-500">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              🎵 리듬 게임
            </h1>
            {gameState === 'playing' && (
              <div className="flex gap-6 text-white">
                <div>점수: {score}</div>
                <div>콤보: {combo}x</div>
                <div>정확도: {accuracy}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Game States */}
        {gameState === 'menu' && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-6">곡 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs.map(song => (
                <button
                  key={song.id}
                  onClick={() => startGame(song)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg p-6 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="text-xl font-bold text-white">{song.name}</div>
                  <div className="text-sm text-gray-300">by {song.artist}</div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-yellow-400">
                      {'⭐'.repeat(song.difficulty)}{'☆'.repeat(5 - song.difficulty)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 bg-purple-900/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-2">조작법</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-purple-800 rounded p-2 text-white">
                  <div className="font-bold">D</div>
                  <div className="text-xs">Lane 1</div>
                </div>
                <div className="bg-purple-800 rounded p-2 text-white">
                  <div className="font-bold">F</div>
                  <div className="text-xs">Lane 2</div>
                </div>
                <div className="bg-purple-800 rounded p-2 text-white">
                  <div className="font-bold">J</div>
                  <div className="text-xs">Lane 3</div>
                </div>
                <div className="bg-purple-800 rounded p-2 text-white">
                  <div className="font-bold">K</div>
                  <div className="text-xs">Lane 4</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'playing' && selectedSong && (
          <div className="relative bg-black/70 backdrop-blur-md rounded-lg border border-purple-500 overflow-hidden" style={{ height: '600px' }}>
            {/* Game Area */}
            <div className="absolute inset-0" ref={gameRef}>
              {/* Lanes */}
              <div className="absolute inset-0 flex">
                {[0, 1, 2, 3].map(lane => (
                  <div key={lane} className="flex-1 border-x border-purple-500/30 relative">
                    {/* Hit Zone */}
                    <div className="absolute bottom-20 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                    {/* Notes */}
                    {activeNotes
                      .filter(note => note.lane === lane && !note.hit)
                      .map(note => {
                        const progress = (note.time - currentTime) / 3000;
                        const top = (1 - progress) * 100;

                        return (
                          <div
                            key={note.id}
                            className={`absolute left-2 right-2 h-8 rounded transition-all ${
                              note.type === 'special' ? 'bg-yellow-500' :
                              note.type === 'long' ? 'bg-blue-500' :
                              'bg-purple-500'
                            }`}
                            style={{
                              top: `${top}%`,
                              transform: 'translateY(-50%)'
                            }}
                          />
                        );
                      })}

                    {/* Hit Effects */}
                    {hitEffects
                      .filter(effect => effect.lane === lane)
                      .map(effect => (
                        <div
                          key={effect.id}
                          className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-ping"
                        >
                          <div className={`text-2xl font-bold ${
                            effect.type === 'perfect' ? 'text-yellow-400' :
                            effect.type === 'great' ? 'text-green-400' :
                            effect.type === 'good' ? 'text-blue-400' :
                            'text-red-400'
                          }`}>
                            {effect.type === 'perfect' ? 'PERFECT!' :
                             effect.type === 'great' ? 'GREAT!' :
                             effect.type === 'good' ? 'GOOD' :
                             'MISS'}
                          </div>
                        </div>
                      ))}

                    {/* Lane Key */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-purple-400">
                        {['D', 'F', 'J', 'K'][lane]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-black/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(currentTime / (selectedSong.duration * 1000)) * 100}%` }}
                />
              </div>
            </div>

            {/* Pause Button */}
            <button
              onClick={() => setGameState('paused')}
              className="absolute top-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              ⏸ 일시정지
            </button>
          </div>
        )}

        {gameState === 'results' && selectedSong && (
          <div className="bg-black/50 backdrop-blur-md rounded-lg p-8 border border-purple-500">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">결과</h2>

            <div className="bg-purple-900/50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {score >= selectedSong.perfectScore * 0.95 ? 'S' :
                   score >= selectedSong.perfectScore * 0.85 ? 'A' :
                   score >= selectedSong.perfectScore * 0.75 ? 'B' :
                   score >= selectedSong.perfectScore * 0.60 ? 'C' :
                   score >= selectedSong.perfectScore * 0.40 ? 'D' : 'F'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-white">
                <div>
                  <div className="text-gray-400">최종 점수</div>
                  <div className="text-2xl font-bold">{score}</div>
                </div>
                <div>
                  <div className="text-gray-400">최대 콤보</div>
                  <div className="text-2xl font-bold">{maxCombo}x</div>
                </div>
                <div>
                  <div className="text-gray-400">정확도</div>
                  <div className="text-2xl font-bold">{accuracy}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Perfect/Great/Good/Miss</div>
                  <div className="text-lg font-bold">
                    {perfectHits}/{greatHits}/{goodHits}/{missedNotes}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startGame(selectedSong)}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
              >
                다시 하기
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
              >
                곡 선택으로
              </button>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-purple-900 rounded-lg p-8 border border-purple-500">
              <h2 className="text-2xl font-bold text-white mb-6">일시정지</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  계속하기
                </button>
                <button
                  onClick={() => {
                    setGameState('menu');
                    if (animationRef.current) {
                      cancelAnimationFrame(animationRef.current);
                    }
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                >
                  그만두기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RhythmGame;