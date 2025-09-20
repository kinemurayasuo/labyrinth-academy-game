import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CardMatchingGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const cardValues = ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍀'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...cardValues, ...cardValues]
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlippedCards;
      
      if (cards[firstCard].value === cards[secondCard].value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstCard || card.id === secondCard
              ? { ...card, isMatched: true }
              : card
          ));
          setFlippedCards([]);
          setScore(score + 10);
          
          // Check if game is completed
          const updatedCards = cards.map(card => 
            card.id === firstCard || card.id === secondCard
              ? { ...card, isMatched: true }
              : card
          );
          if (updatedCards.every(card => card.isMatched)) {
            setGameCompleted(true);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🃏 카드 매칭 게임
          </h1>

          {/* Game Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-sm text-gray-300">점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{moves}</div>
              <div className="text-sm text-gray-300">이동 횟수</div>
            </div>
          </div>

          {gameCompleted && (
            <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-6 text-center">
              <h2 className="text-xl font-bold text-green-400 mb-2">🎉 게임 완료!</h2>
              <p className="text-green-200">
                {moves}번의 이동으로 {score}점을 획득했습니다!
              </p>
            </div>
          )}

          {/* Game Board */}
          <div className="grid grid-cols-4 gap-4 mb-6 max-w-md mx-auto">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square bg-white/10 rounded-lg border-2 border-white/20 
                  flex items-center justify-center text-3xl cursor-pointer
                  transition-all duration-300 hover:scale-105
                  ${flippedCards.includes(card.id) || card.isMatched 
                    ? 'bg-white/20 border-yellow-400' 
                    : 'hover:bg-white/15'}
                  ${card.isMatched ? 'opacity-50' : ''}
                `}
              >
                {(flippedCards.includes(card.id) || card.isMatched) ? card.value : '❓'}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="text-center space-y-4">
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
            >
              새 게임
            </button>
            
            <div className="text-gray-300 text-sm">
              카드를 클릭하여 같은 그림을 찾으세요!
            </div>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardMatchingGame;