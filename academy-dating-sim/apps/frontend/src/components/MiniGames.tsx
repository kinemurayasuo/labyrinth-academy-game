import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniGameProps {
  onComplete: (success: boolean, score: number) => void;
  onClose: () => void;
}

// 리듬 게임 컴포넌트
export const RhythmGame: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<Array<{ id: string; lane: number; position: number }>>([]);
  const [gameTime, setGameTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const lanes = ['A', 'S', 'D', 'F'];
  const noteSpeed = 5;

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 0) {
          setIsPlaying(false);
          onComplete(score > 500, score);
          return 0;
        }
        return prev - 0.1;
      });

      // 노트 생성
      if (Math.random() < 0.1) {
        const newNote = {
          id: Math.random().toString(36).substr(2, 9),
          lane: Math.floor(Math.random() * 4),
          position: 0
        };
        setNotes(prev => [...prev, newNote]);
      }

      // 노트 이동
      setNotes(prev =>
        prev
          .map(note => ({ ...note, position: note.position + noteSpeed }))
          .filter(note => note.position < 500)
      );
    }, 100);

    return () => clearInterval(gameInterval);
  }, [isPlaying, score, onComplete]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const keyLaneMap: Record<string, number> = { 'a': 0, 's': 1, 'd': 2, 'f': 3 };
    const lane = keyLaneMap[event.key.toLowerCase()];

    if (lane === undefined) return;

    const hitNote = notes.find(
      note => note.lane === lane && note.position > 400 && note.position < 480
    );

    if (hitNote) {
      const accuracy = Math.abs(440 - hitNote.position);
      let points = 0;

      if (accuracy < 10) {
        points = 100;
        setCombo(prev => prev + 1);
      } else if (accuracy < 20) {
        points = 50;
        setCombo(prev => prev + 1);
      } else {
        points = 25;
        setCombo(0);
      }

      setScore(prev => prev + points * (1 + combo * 0.1));
      setNotes(prev => prev.filter(note => note.id !== hitNote.id));
    } else {
      setCombo(0);
    }
  }, [notes, combo]);

  useEffect(() => {
    if (isPlaying) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isPlaying, handleKeyPress]);

  return (
    <div className="rhythm-game bg-gray-900 p-6 rounded-lg">
      <div className="game-header mb-4 flex justify-between">
        <div className="score text-white text-xl">Score: {Math.floor(score)}</div>
        <div className="combo text-yellow-400 text-xl">Combo: {combo}</div>
        <div className="time text-white text-xl">Time: {gameTime.toFixed(1)}s</div>
        <button onClick={onClose} className="text-white text-2xl">×</button>
      </div>

      {!isPlaying ? (
        <div className="start-screen text-center">
          <h2 className="text-3xl text-white mb-4">리듬 게임</h2>
          <p className="text-gray-300 mb-4">A, S, D, F 키를 사용하여 노트를 맞추세요!</p>
          <button
            onClick={() => setIsPlaying(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            시작하기
          </button>
        </div>
      ) : (
        <div className="game-area relative h-96 bg-gray-800 rounded">
          <div className="lanes flex h-full">
            {lanes.map((lane, index) => (
              <div key={lane} className="lane flex-1 border-x border-gray-600 relative">
                <div className="hit-zone absolute bottom-10 w-full h-12 bg-green-500 bg-opacity-20" />
                <div className="key-hint absolute bottom-2 w-full text-center text-white text-2xl">
                  {lane}
                </div>
                <AnimatePresence>
                  {notes
                    .filter(note => note.lane === index)
                    .map(note => (
                      <motion.div
                        key={note.id}
                        className="note w-12 h-12 bg-blue-500 rounded-full absolute left-1/2 transform -translate-x-1/2"
                        style={{ top: `${note.position}px` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                      />
                    ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 카드 매칭 게임
export const CardMatchingGame: React.FC<MiniGameProps> = ({ onComplete, onClose }) => {
  const [cards, setCards] = useState<Array<{ id: string; value: string; flipped: boolean; matched: boolean }>>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const cardValues = ['🌸', '📚', '✨', '🌙', '👑', '🍰', '🏃‍♀️', '🎨'];

  useEffect(() => {
    initializeCards();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameComplete) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameComplete]);

  const initializeCards = () => {
    const gameCards = cardValues
      .concat(cardValues)
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index.toString(),
        value,
        flipped: false,
        matched: false
      }));
    setCards(gameCards);
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched || selectedCards.length >= 2) return;

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    setSelectedCards([...selectedCards, cardId]);

    if (selectedCards.length === 1) {
      setMoves(prev => prev + 1);
      const firstCard = cards.find(c => c.id === selectedCards[0]);
      const secondCard = card;

      setTimeout(() => {
        if (firstCard && secondCard && firstCard.value === secondCard.value) {
          setCards(prev =>
            prev.map(c =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, matched: true }
                : c
            )
          );
        } else {
          setCards(prev =>
            prev.map(c =>
              c.id === firstCard?.id || c.id === secondCard?.id
                ? { ...c, flipped: false }
                : c
            )
          );
        }
        setSelectedCards([]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setGameComplete(true);
      const score = Math.max(1000 - moves * 10 - timeElapsed * 5, 0);
      onComplete(true, score);
    }
  }, [cards, moves, timeElapsed, onComplete]);

  return (
    <div className="card-matching-game bg-purple-900 p-6 rounded-lg">
      <div className="game-header mb-4 flex justify-between text-white">
        <div>Moves: {moves}</div>
        <div>Time: {timeElapsed}s</div>
        <button onClick={onClose} className="text-2xl">×</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className="card-container relative h-24 cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence>
              {card.flipped || card.matched ? (
                <motion.div
                  className="card-front absolute inset-0 bg-white rounded-lg flex items-center justify-center text-4xl"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 180 }}
                  style={{ opacity: card.matched ? 0.6 : 1 }}
                >
                  {card.value}
                </motion.div>
              ) : (
                <motion.div
                  className="card-back absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 180 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {gameComplete && (
        <div className="mt-4 text-center text-white">
          <h3 className="text-2xl mb-2">게임 완료!</h3>
          <p>이동 횟수: {moves} | 시간: {timeElapsed}초</p>
        </div>
      )}
    </div>
  );
};

// 퀴즈 게임
export const QuizGame: React.FC<MiniGameProps & { characterId?: string }> = ({
  onComplete,
  onClose,
  characterId
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: '사쿠라가 가장 좋아하는 것은?',
      options: ['독서', '훈련', '요리', '음악'],
      correct: 1,
      character: 'sakura'
    },
    {
      question: '유키의 취미는?',
      options: ['운동', '게임', '독서', '그림'],
      correct: 2,
      character: 'yuki'
    },
    {
      question: '루나의 가문은?',
      options: ['검술 가문', '상인 가문', '마법 가문', '귀족 가문'],
      correct: 2,
      character: 'luna'
    },
    {
      question: '아카네의 직책은?',
      options: ['부회장', '학생회장', '서기', '회계'],
      correct: 1,
      character: 'akane'
    },
    {
      question: '하나가 속한 동아리는?',
      options: ['미술부', '음악부', '요리부', '문학부'],
      correct: 2,
      character: 'hana'
    }
  ];

  const filteredQuestions = characterId
    ? questions.filter(q => q.character === characterId)
    : questions;

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1);
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === filteredQuestions[currentQuestion].correct) {
      setScore(prev => prev + 100 + timeLeft * 5);
    }

    setTimeout(() => {
      if (currentQuestion < filteredQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      } else {
        onComplete(score > 300, score);
      }
    }, 2000);
  };

  return (
    <div className="quiz-game bg-indigo-900 p-6 rounded-lg text-white">
      <div className="game-header mb-4 flex justify-between">
        <div>Question {currentQuestion + 1}/{filteredQuestions.length}</div>
        <div>Score: {score}</div>
        <div>Time: {timeLeft}s</div>
        <button onClick={onClose} className="text-2xl">×</button>
      </div>

      <div className="question-area">
        <h3 className="text-xl mb-4">{filteredQuestions[currentQuestion].question}</h3>
        <div className="options space-y-2">
          {filteredQuestions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-3 rounded-lg transition ${
                showResult
                  ? index === filteredQuestions[currentQuestion].correct
                    ? 'bg-green-600'
                    : index === selectedAnswer
                    ? 'bg-red-600'
                    : 'bg-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};