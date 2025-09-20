import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CardMatchGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { updateMoney, gainExperience } = useGameStore((state: any) => state.actions);

  const cardValues = ['❤️', '⭐', '🎮', '📚', '🎯', '💎', '🎨', '🎵'];
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted && timer > 0 && !gameOver) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      endGame();
    }
  }, [gameStarted, timer, gameOver]);

  const initializeGame = () => {
    const duplicatedValues = [...cardValues, ...cardValues];
    const shuffled = duplicatedValues.sort(() => Math.random() - 0.5);
    const newCards = shuffled.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false
    }));
    setCards(newCards);
    setSelectedCards([]);
    setMoves(0);
    setTimer(60);
    setGameOver(false);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (gameOver || selectedCards.length === 2) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setSelectedCards([...selectedCards, cardId]);

    if (selectedCards.length === 1) {
      setMoves(moves + 1);
      checkForMatch(selectedCards[0], cardId);
    }
  };

  const checkForMatch = (firstId: number, secondId: number) => {
    setTimeout(() => {
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        const newCards = cards.map(c =>
          c.id === firstId || c.id === secondId
            ? { ...c, isMatched: true }
            : c
        );
        setCards(newCards);

        // Check if all cards are matched
        if (newCards.every(c => c.isMatched)) {
          endGame();
        }
      } else {
        // No match, flip back
        const newCards = cards.map(c =>
          c.id === firstId || c.id === secondId
            ? { ...c, isFlipped: false }
            : c
        );
        setCards(newCards);
      }
      setSelectedCards([]);
    }, 1000);
  };

  const endGame = () => {
    setGameOver(true);
    const matchedPairs = cards.filter(c => c.isMatched).length / 2;
    const score = Math.max(0, (matchedPairs * 100) - (moves * 5) + timer);

    // Rewards
    const goldReward = Math.floor(score / 10);
    const expReward = Math.floor(score / 5);

    updateMoney(goldReward);
    gainExperience(expReward);

    onComplete(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-4">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎴 카드 매칭 게임
          </h2>

          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              <span className="text-gray-600">움직임: </span>
              <span className="text-purple-600">{moves}</span>
            </div>
            <div className="text-lg font-semibold">
              <span className="text-gray-600">시간: </span>
              <span className={`${timer < 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                {timer}초
              </span>
            </div>
            <div className="text-lg font-semibold">
              <span className="text-gray-600">매칭: </span>
              <span className="text-green-600">
                {cards.filter(c => c.isMatched).length / 2}/{cardValues.length}
              </span>
            </div>
          </div>

          {!gameStarted && !gameOver && (
            <div className="text-center mb-4 text-gray-600">
              카드를 클릭하여 게임을 시작하세요!
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-4">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={gameOver}
                className={`
                  aspect-square rounded-lg text-4xl font-bold transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-95'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 hover:scale-105'
                  }
                  ${card.isMatched ? 'opacity-60 cursor-default' : 'cursor-pointer hover:shadow-lg'}
                `}
              >
                {card.isFlipped || card.isMatched ? card.value : '?'}
              </button>
            ))}
          </div>

          {gameOver && (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">
                {cards.every(c => c.isMatched) ? '🎉 성공!' : '⏰ 시간 종료!'}
              </h3>
              <p className="text-lg mb-4">
                최종 점수: <span className="font-bold text-purple-600">{Math.max(0, (cards.filter(c => c.isMatched).length / 2 * 100) - (moves * 5) + timer)}</span>
              </p>
              <button
                onClick={initializeGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition"
              >
                다시 플레이
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardMatchGame;