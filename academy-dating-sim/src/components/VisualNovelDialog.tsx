import React, { useState, useEffect } from 'react';
import type { Character, GameEvent } from '../types/game';

interface VisualNovelDialogProps {
  event: GameEvent;
  character?: Character;
  player: any;
  onChoice: (event: GameEvent, choiceIndex: number) => void;
  onClose: () => void;
}

const VisualNovelDialog: React.FC<VisualNovelDialogProps> = ({
  event,
  character,
  player,
  onChoice,
  onClose,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let index = 0;
    const text = event.description;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setShowChoices(true);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [event]);

  const handleSkip = () => {
    setDisplayedText(event.description);
    setIsTyping(false);
    setShowChoices(true);
  };

  const handleChoice = (choiceIndex: number) => {
    const choice = event.choices[choiceIndex];

    // Check if player meets requirements
    if (choice.condition) {
      if (choice.condition.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) {
        alert('지력이 부족합니다!');
        return;
      }
      if (choice.condition.minCharm && player.stats.charm < choice.condition.minCharm) {
        alert('매력이 부족합니다!');
        return;
      }
      if (choice.condition.minStamina && player.stats.stamina < choice.condition.minStamina) {
        alert('체력이 부족합니다!');
        return;
      }
    }

    onChoice(event, choiceIndex);
  };

  const getBackgroundImage = () => {
    // Map location to background image
    const locationBackgrounds: Record<string, string> = {
      classroom: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b',
      library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
      garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      dormitory: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
      cafeteria: 'https://images.unsplash.com/photo-1567521464027-f127ff144326',
      training_ground: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6'
    };

    return locationBackgrounds[event.trigger.location || 'classroom'] || locationBackgrounds.classroom;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          filter: 'brightness(0.7)'
        }}
      />

      {/* Character Display */}
      {character && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-[200px] z-10">
          <div className="relative">
            <div className="text-[200px] animate-pulse filter drop-shadow-2xl">
              {character.sprite}
            </div>
            {/* Character emotion indicator */}
            <div className="absolute top-0 right-0 text-2xl">
              💭
            </div>
          </div>
        </div>
      )}

      {/* Dialog Box */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-4xl p-6">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-t-2xl border border-white/20 shadow-2xl">
            {/* Character Name */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {character ? character.name : '이벤트'}
              </h3>
            </div>

            {/* Dialog Text */}
            <div className="p-6 min-h-[150px]">
              <p className="text-white text-lg leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">▼</span>}
              </p>
            </div>

            {/* Choices */}
            {showChoices && event.choices.length > 0 && (
              <div className="border-t border-white/10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(index)}
                      className="relative group"
                      disabled={
                        !!(choice.condition?.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) ||
                        !!(choice.condition?.minCharm && player.stats.charm < choice.condition.minCharm) ||
                        !!(choice.condition?.minStamina && player.stats.stamina < choice.condition.minStamina)
                      }
                    >
                      <div className={`
                        px-4 py-3 rounded-lg transition-all duration-200
                        ${choice.condition && (
                          (choice.condition.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) ||
                          (choice.condition.minCharm && player.stats.charm < choice.condition.minCharm) ||
                          (choice.condition.minStamina && player.stats.stamina < choice.condition.minStamina)
                        )
                          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/30 hover:border-purple-400/60 cursor-pointer transform hover:scale-105'
                        }
                      `}>
                        <span className="flex items-center gap-2">
                          <span className="text-purple-300">▶</span>
                          {choice.text}
                        </span>

                        {/* Requirement indicators */}
                        {choice.condition && (
                          <div className="text-xs mt-1 text-yellow-300">
                            {choice.condition.minIntelligence && `지력 ${choice.condition.minIntelligence}+ `}
                            {choice.condition.minCharm && `매력 ${choice.condition.minCharm}+ `}
                            {choice.condition.minStamina && `체력 ${choice.condition.minStamina}+ `}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between items-center px-6 py-3 border-t border-white/10">
              <div className="flex gap-2">
                {isTyping && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors"
                  >
                    Skip ▶▶
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Display */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-4 text-white z-20">
        <div className="text-sm space-y-1">
          <div>Day {player.day}</div>
          <div>💰 {player.money}</div>
          <div>❤️ HP: {player.hp}/{player.maxHp}</div>
          <div>💙 MP: {player.mp}/{player.maxMp}</div>
        </div>
      </div>
    </div>
  );
};

export default VisualNovelDialog;