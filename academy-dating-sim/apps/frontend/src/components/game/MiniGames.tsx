import React, { useState, useEffect } from 'react';
import type { Player } from '../../types/game';

interface MiniGamesProps {
  player: Player;
  onGameComplete: (results: GameResults) => void;
  onClose: () => void;
}

interface GameResults {
  experience: number;
  stats: Partial<Player['stats']>;
  money: number;
  message: string;
}

type GameType = 'quiz' | 'rhythm' | 'fighting' | 'memory';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MiniGames: React.FC<MiniGamesProps> = ({
  onGameComplete,
  onClose
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<GameResults | null>(null);

  // Quiz Game Questions
  const quizQuestions: QuizQuestion[] = [
    {
      question: "라비린스 아카데미의 교훈은?",
      options: ["지혜와 용기", "사랑과 평화", "힘과 명예", "진실과 정의"],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: "마법학부에서 가장 중요한 능력은?",
      options: ["체력", "지력", "매력", "행운"],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: "검술부의 수련 시간은?",
      options: ["오전 6시", "오후 3시", "오후 5시", "저녁 7시"],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: "고급 마법 주문을 사용하려면 최소 지력이?",
      options: ["15", "20", "25", "30"],
      correct: 2,
      difficulty: 'hard'
    },
    {
      question: "학원의 창립 연도는?",
      options: ["1850년", "1900년", "1920년", "1950년"],
      correct: 1,
      difficulty: 'hard'
    }
  ];

  // Quiz Game Component
  const QuizGame: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [questions] = useState(
      quizQuestions.sort(() => Math.random() - 0.5).slice(0, 5)
    );

    useEffect(() => {
      if (timeLeft > 0 && selectedAnswer === null) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        handleAnswer(-1);
      }
    }, [timeLeft, selectedAnswer]);

    const handleAnswer = (answer: number) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);

      if (answer === questions[currentQuestion].correct) {
        setScore(score + 1);
      }

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setTimeLeft(30);
        } else {
          finishQuizGame();
        }
      }, 1500);
    };

    const finishQuizGame = () => {
      const percentage = (score / questions.length) * 100;
      let intelligenceGain = Math.floor(score * 2);
      let experienceGain = score * 20;
      let moneyGain = score * 50;

      if (percentage >= 80) {
        intelligenceGain += 3;
        experienceGain += 50;
        moneyGain += 200;
      }

      setGameResult({
        experience: experienceGain,
        stats: { intelligence: intelligenceGain },
        money: moneyGain,
        message: `${score}/${questions.length} 정답! ${percentage >= 80 ? '완벽해요!' : percentage >= 60 ? '잘했어요!' : '더 공부하세요!'}`
      });
    };

    const currentQ = questions[currentQuestion];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-white">
            문제 {currentQuestion + 1}/{questions.length}
          </div>
          <div className="text-lg font-bold text-yellow-300">
            ⏰ {timeLeft}초
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-lg">
          <h3 className="text-xl text-white mb-4">{currentQ.question}</h3>
          <div className="grid gap-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedAnswer === null
                    ? 'bg-purple-700/30 hover:bg-purple-600/40 text-white'
                    : selectedAnswer === index
                    ? index === currentQ.correct
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : index === currentQ.correct
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600/30 text-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-purple-300">
          현재 점수: {score}점
        </div>
      </div>
    );
  };

  // Rhythm Game Component
  const RhythmGame: React.FC = () => {
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [targets, setTargets] = useState<{ id: number; lane: number; time: number }[]>([]);
    const [nextId, setNextId] = useState(0);

    useEffect(() => {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        finishRhythmGame();
      }
    }, [timeLeft]);

    useEffect(() => {
      const spawnInterval = setInterval(() => {
        if (timeLeft > 0) {
          setTargets(prev => [...prev, {
            id: nextId,
            lane: Math.floor(Math.random() * 4),
            time: Date.now()
          }]);
          setNextId(prev => prev + 1);
        }
      }, 800);

      return () => clearInterval(spawnInterval);
    }, [timeLeft, nextId]);

    const hitTarget = (lane: number) => {
      const now = Date.now();
      const hitWindow = 500; // ms

      const target = targets.find(t =>
        t.lane === lane &&
        Math.abs(now - t.time - 2000) < hitWindow
      );

      if (target) {
        setTargets(prev => prev.filter(t => t.id !== target.id));
        setScore(prev => prev + (10 + combo));
        setCombo(prev => prev + 1);
      } else {
        setCombo(0);
      }
    };

    const finishRhythmGame = () => {
      const charmGain = Math.floor(score / 50);
      const experienceGain = score;
      const moneyGain = Math.floor(score / 10);

      setGameResult({
        experience: experienceGain,
        stats: { charm: charmGain },
        money: moneyGain,
        message: `${score}점! ${combo > 20 ? '환상적인 리듬감!' : combo > 10 ? '좋은 리듬감!' : '더 연습하세요!'}`
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-white">점수: {score}</div>
          <div className="text-lg font-bold text-yellow-300">콤보: {combo}</div>
          <div className="text-lg font-bold text-red-300">⏰ {timeLeft}초</div>
        </div>

        <div className="relative bg-black/50 p-4 rounded-lg h-64">
          <div className="grid grid-cols-4 gap-2 h-full">
            {[0, 1, 2, 3].map(lane => (
              <button
                key={lane}
                onClick={() => hitTarget(lane)}
                className="bg-purple-700/30 hover:bg-purple-600/40 rounded-lg border-2 border-purple-500/50
                         flex items-end justify-center pb-4 relative overflow-hidden"
              >
                {targets
                  .filter(t => t.lane === lane)
                  .map(target => {
                    const progress = Math.min((Date.now() - target.time) / 2000, 1);
                    return (
                      <div
                        key={target.id}
                        className="absolute w-8 h-8 bg-pink-500 rounded-full animate-pulse"
                        style={{
                          bottom: `${4 + progress * 80}%`,
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      />
                    );
                  })}
                <span className="text-white text-2xl">♪</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-purple-300">
          키를 눌러 떨어지는 음표를 맞추세요!
        </div>
      </div>
    );
  };

  // Fighting Game Component
  const FightingGame: React.FC = () => {
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [round, setRound] = useState(1);
    const [maxRounds] = useState(3);
    const [wins, setWins] = useState(0);
    const [lastAction, setLastAction] = useState('');

    const performAction = (action: 'attack' | 'defend' | 'special') => {
      const enemyAction = ['attack', 'defend', 'special'][Math.floor(Math.random() * 3)] as 'attack' | 'defend' | 'special';

      let playerDamage = 0;
      let enemyDamage = 0;
      let actionText = '';

      // Calculate damage based on actions
      if (action === 'attack' && enemyAction !== 'defend') {
        enemyDamage = 25 + Math.floor(Math.random() * 10);
        actionText = '공격 성공!';
      } else if (action === 'special' && enemyAction !== 'defend') {
        enemyDamage = 40 + Math.floor(Math.random() * 10);
        actionText = '필살기 적중!';
      } else if (action === 'defend') {
        actionText = '방어 성공!';
      }

      if (enemyAction === 'attack' && action !== 'defend') {
        playerDamage = 20 + Math.floor(Math.random() * 10);
        actionText += ' 적의 공격을 받았습니다!';
      } else if (enemyAction === 'special' && action !== 'defend') {
        playerDamage = 35 + Math.floor(Math.random() * 10);
        actionText += ' 적의 필살기를 받았습니다!';
      }

      setLastAction(actionText);
      setPlayerHp(prev => Math.max(0, prev - playerDamage));
      setEnemyHp(prev => Math.max(0, prev - enemyDamage));

      setTimeout(() => {
        if (enemyHp - enemyDamage <= 0) {
          // Player wins round
          setWins(prev => prev + 1);
          if (round < maxRounds) {
            setRound(prev => prev + 1);
            setPlayerHp(100);
            setEnemyHp(100);
          } else {
            finishFightingGame(wins + 1);
          }
        } else if (playerHp - playerDamage <= 0) {
          // Player loses round
          if (round < maxRounds) {
            setRound(prev => prev + 1);
            setPlayerHp(100);
            setEnemyHp(100);
          } else {
            finishFightingGame(wins);
          }
        }
      }, 1000);
    };

    const finishFightingGame = (finalWins: number) => {
      const strengthGain = finalWins * 3;
      const experienceGain = finalWins * 30;
      const moneyGain = finalWins * 100;

      setGameResult({
        experience: experienceGain,
        stats: { strength: strengthGain },
        money: moneyGain,
        message: `${finalWins}/${maxRounds} 승리! ${finalWins === maxRounds ? '완벽한 승리!' : finalWins >= 2 ? '훌륭해요!' : '더 강해지세요!'}`
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-2">라운드 {round}/{maxRounds}</div>
          <div className="text-purple-300">승리: {wins}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-green-300 font-bold mb-2">플레이어</div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
            <div className="text-white">{playerHp}/100</div>
          </div>

          <div className="text-center">
            <div className="text-red-300 font-bold mb-2">적</div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div
                className="bg-red-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${enemyHp}%` }}
              />
            </div>
            <div className="text-white">{enemyHp}/100</div>
          </div>
        </div>

        {lastAction && (
          <div className="bg-black/30 p-3 rounded-lg text-center text-white">
            {lastAction}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => performAction('attack')}
            className="bg-red-700/30 hover:bg-red-600/40 text-white p-3 rounded-lg font-bold"
          >
            ⚔️ 공격
          </button>
          <button
            onClick={() => performAction('defend')}
            className="bg-blue-700/30 hover:bg-blue-600/40 text-white p-3 rounded-lg font-bold"
          >
            🛡️ 방어
          </button>
          <button
            onClick={() => performAction('special')}
            className="bg-purple-700/30 hover:bg-purple-600/40 text-white p-3 rounded-lg font-bold"
          >
            ⚡ 필살기
          </button>
        </div>
      </div>
    );
  };

  // Memory Game Component
  const MemoryGame: React.FC = () => {
    const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);

    const symbols = ['🌸', '⚔️', '📚', '✨', '💖', '🌙', '⭐', '🔮'];

    useEffect(() => {
      // Initialize cards
      const shuffledCards = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
          id: index,
          symbol,
          flipped: false,
          matched: false
        }));
      setCards(shuffledCards);
    }, []);

    useEffect(() => {
      if (timeLeft > 0 && matches < 8) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0 || matches === 8) {
        finishMemoryGame();
      }
    }, [timeLeft, matches]);

    const flipCard = (id: number) => {
      if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

      const newCards = [...cards];
      newCards[id].flipped = true;
      setCards(newCards);

      const newFlipped = [...flippedCards, id];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
        setMoves(prev => prev + 1);
        const [first, second] = newFlipped;

        if (cards[first].symbol === cards[second].symbol) {
          // Match found
          setTimeout(() => {
            const matchedCards = [...cards];
            matchedCards[first].matched = true;
            matchedCards[second].matched = true;
            setCards(matchedCards);
            setMatches(prev => prev + 1);
            setFlippedCards([]);
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            const resetCards = [...cards];
            resetCards[first].flipped = false;
            resetCards[second].flipped = false;
            setCards(resetCards);
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    const finishMemoryGame = () => {
      const luckGain = Math.max(8 - Math.floor(moves / 5), 1);
      const experienceGain = matches * 15;
      const moneyGain = matches * 20;

      setGameResult({
        experience: experienceGain,
        stats: { luck: luckGain },
        money: moneyGain,
        message: `${matches}/8 짝 맞추기! ${matches === 8 ? '완벽!' : matches >= 6 ? '훌륭해요!' : '더 집중하세요!'}`
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-white">이동: {moves}</div>
          <div className="text-white">매치: {matches}/8</div>
          <div className="text-yellow-300">⏰ {timeLeft}초</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              className={`aspect-square text-3xl rounded-lg transition-all duration-300 ${
                card.flipped || card.matched
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-700/30 hover:bg-purple-600/40 text-transparent'
              }`}
            >
              {card.flipped || card.matched ? card.symbol : '?'}
            </button>
          ))}
        </div>

        <div className="text-center text-purple-300">
          같은 그림의 카드를 찾아보세요!
        </div>
      </div>
    );
  };

  const startGame = (gameType: GameType) => {
    setSelectedGame(gameType);
    setIsPlaying(true);
    setGameResult(null);
  };

  const handleGameComplete = () => {
    if (gameResult) {
      onGameComplete(gameResult);
    }
  };

  if (gameResult) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-4">게임 완료!</h3>
          <p className="text-purple-200 text-lg mb-6">{gameResult.message}</p>

          <div className="space-y-2 mb-6 text-white">
            <div>경험치: +{gameResult.experience}</div>
            {Object.entries(gameResult.stats).map(([stat, value]) => (
              <div key={stat}>
                {stat === 'intelligence' && `지력: +${value}`}
                {stat === 'charm' && `매력: +${value}`}
                {stat === 'strength' && `힘: +${value}`}
                {stat === 'luck' && `행운: +${value}`}
              </div>
            ))}
            <div>돈: +{gameResult.money}원</div>
          </div>

          <button
            onClick={handleGameComplete}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                     text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  if (isPlaying && selectedGame) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-purple-500/30 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {selectedGame === 'quiz' && '📚 퀴즈 게임'}
              {selectedGame === 'rhythm' && '🎵 리듬 게임'}
              {selectedGame === 'fighting' && '⚔️ 격투 게임'}
              {selectedGame === 'memory' && '🧠 기억력 게임'}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {selectedGame === 'quiz' && <QuizGame />}
            {selectedGame === 'rhythm' && <RhythmGame />}
            {selectedGame === 'fighting' && <FightingGame />}
            {selectedGame === 'memory' && <MemoryGame />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-2xl max-w-4xl w-full">
        <div className="p-6 border-b border-purple-500/30 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">🎮 미니 게임</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Game */}
          <div className="bg-blue-700/20 p-6 rounded-xl border border-blue-500/30">
            <div className="text-4xl mb-4 text-center">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">퀴즈 게임</h3>
            <p className="text-blue-200 mb-4">학원에 관한 문제를 풀어보세요!</p>
            <ul className="text-sm text-blue-300 mb-4 space-y-1">
              <li>• 지력 증가</li>
              <li>• 경험치 획득</li>
              <li>• 정답에 따른 보상</li>
            </ul>
            <button
              onClick={() => startGame('quiz')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              게임 시작
            </button>
          </div>

          {/* Rhythm Game */}
          <div className="bg-pink-700/20 p-6 rounded-xl border border-pink-500/30">
            <div className="text-4xl mb-4 text-center">🎵</div>
            <h3 className="text-xl font-bold text-white mb-2">리듬 게임</h3>
            <p className="text-pink-200 mb-4">음표에 맞춰 리듬을 맞춰보세요!</p>
            <ul className="text-sm text-pink-300 mb-4 space-y-1">
              <li>• 매력 증가</li>
              <li>• 콤보에 따른 보너스</li>
              <li>• 리듬감 향상</li>
            </ul>
            <button
              onClick={() => startGame('rhythm')}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              게임 시작
            </button>
          </div>

          {/* Fighting Game */}
          <div className="bg-red-700/20 p-6 rounded-xl border border-red-500/30">
            <div className="text-4xl mb-4 text-center">⚔️</div>
            <h3 className="text-xl font-bold text-white mb-2">격투 게임</h3>
            <p className="text-red-200 mb-4">적과 싸워 전투 실력을 키우세요!</p>
            <ul className="text-sm text-red-300 mb-4 space-y-1">
              <li>• 힘 증가</li>
              <li>• 전투 경험 획득</li>
              <li>• 승리에 따른 보상</li>
            </ul>
            <button
              onClick={() => startGame('fighting')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              게임 시작
            </button>
          </div>

          {/* Memory Game */}
          <div className="bg-yellow-700/20 p-6 rounded-xl border border-yellow-500/30">
            <div className="text-4xl mb-4 text-center">🧠</div>
            <h3 className="text-xl font-bold text-white mb-2">기억력 게임</h3>
            <p className="text-yellow-200 mb-4">카드를 뒤집어 같은 그림을 찾으세요!</p>
            <ul className="text-sm text-yellow-300 mb-4 space-y-1">
              <li>• 행운 증가</li>
              <li>• 집중력 향상</li>
              <li>• 기억력 훈련</li>
            </ul>
            <button
              onClick={() => startGame('memory')}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              게임 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGames;