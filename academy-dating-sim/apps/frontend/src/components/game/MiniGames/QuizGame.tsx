import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

const QuizGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { updateStats, updateMoney, gainExperience } = useGameStore((state: any) => state.actions);

  const questions: Question[] = [
    {
      id: 1,
      question: "라비린스 아카데미의 설립 연도는?",
      options: ["1850년", "1900년", "1925년", "1950년"],
      correctAnswer: 2,
      category: "학원 역사"
    },
    {
      id: 2,
      question: "학생회장 레이나의 특기는?",
      options: ["검술", "마법", "리더십", "요리"],
      correctAnswer: 2,
      category: "캐릭터"
    },
    {
      id: 3,
      question: "던전의 최종 보스는?",
      options: ["고대 드래곤", "얼음 여왕", "화염 드래곤", "어둠의 마왕"],
      correctAnswer: 2,
      category: "게임"
    },
    {
      id: 4,
      question: "도서부원 유키가 가장 좋아하는 것은?",
      options: ["운동", "독서", "게임", "음악"],
      correctAnswer: 1,
      category: "캐릭터"
    },
    {
      id: 5,
      question: "아카데미에서 가장 인기 있는 동아리는?",
      options: ["검술부", "마법부", "예술부", "과학부"],
      correctAnswer: 0,
      category: "학원"
    }
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
  }, [timeLeft, showResult, gameOver]);

  const handleTimeout = () => {
    setShowResult(true);
    setTimeout(() => nextQuestion(), 2000);
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      const points = Math.max(50, 100 - (15 - timeLeft) * 5);
      setScore(score + points);
    }

    setTimeout(() => nextQuestion(), 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameOver(true);

    // Calculate rewards
    const goldReward = Math.floor(score / 20);
    const expReward = Math.floor(score / 10);
    const intelligenceBonus = Math.floor(score / 100);

    updateMoney(goldReward);
    gainExperience(expReward);
    if (intelligenceBonus > 0) {
      updateStats({ intelligence: intelligenceBonus });
    }

    onComplete(score);
  };

  const getAnswerButtonClass = (index: number) => {
    if (!showResult) {
      return "bg-white hover:bg-purple-50 border-2 border-purple-300 text-gray-800";
    }

    if (index === questions[currentQuestion].correctAnswer) {
      return "bg-green-500 text-white border-2 border-green-600";
    }

    if (selectedAnswer === index && index !== questions[currentQuestion].correctAnswer) {
      return "bg-red-500 text-white border-2 border-red-600";
    }

    return "bg-gray-200 text-gray-500 border-2 border-gray-300";
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-6">🎓 퀴즈 완료!</h2>
          <div className="text-center">
            <p className="text-6xl mb-4">
              {score >= 400 ? '🏆' : score >= 300 ? '🥈' : score >= 200 ? '🥉' : '📝'}
            </p>
            <p className="text-2xl font-bold mb-2">최종 점수</p>
            <p className="text-4xl font-bold text-purple-600 mb-6">{score}</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">획득 보상:</p>
              <p className="font-semibold">💰 {Math.floor(score / 20)} 골드</p>
              <p className="font-semibold">⭐ {Math.floor(score / 10)} 경험치</p>
              {Math.floor(score / 100) > 0 && (
                <p className="font-semibold">📚 지능 +{Math.floor(score / 100)}</p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition"
            >
              다시 도전하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-600">
              문제 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-semibold text-gray-600">
              점수: {score}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
              {questions[currentQuestion].category}
            </span>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
              ⏱️ {timeLeft}초
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {questions[currentQuestion].question}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={showResult}
                className={`
                  p-4 rounded-lg font-semibold text-left transition-all
                  ${getAnswerButtonClass(index)}
                  ${!showResult ? 'hover:scale-102 active:scale-98' : ''}
                `}
              >
                <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
                {showResult && index === questions[currentQuestion].correctAnswer && (
                  <span className="ml-2">✓</span>
                )}
                {showResult && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                  <span className="ml-2">✗</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className={`text-center font-bold text-lg ${
            selectedAnswer === questions[currentQuestion].correctAnswer
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {selectedAnswer === questions[currentQuestion].correctAnswer
              ? `정답! +${Math.max(50, 100 - (15 - timeLeft) * 5)} 점`
              : '틀렸습니다!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;