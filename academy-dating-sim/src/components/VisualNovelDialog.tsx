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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={handleSkip}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          filter: 'blur(8px) brightness(0.7)'
        }}
      />

      {/* Character Display */}
      {character && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-full w-full flex items-end justify-center">
            <img src={character.image} alt={character.name} className="h-5/6 object-contain" />
        </div>
      )}

      {/* Dialog Box */}
      <div className="relative w-full max-w-4xl mx-auto mb-4 z-10">
        <div className="bg-background/80 backdrop-blur-md rounded-xl shadow-2xl border border-border">
            {character &&
                <div className="px-6 py-2 bg-primary/50 rounded-t-xl">
                    <h3 className="text-2xl font-bold text-text-primary">{character.name}</h3>
                </div>
            }
          <div className="p-6 min-h-[120px] text-xl text-text-primary leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>

          {showChoices && event.choices.length > 0 && (
            <div className="p-4 grid grid-cols-1 gap-3">
              {event.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(index)}
                  disabled={
                    !!(choice.condition?.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) ||
                    !!(choice.condition?.minCharm && player.stats.charm < choice.condition.minCharm) ||
                    !!(choice.condition?.minStamina && player.stats.stamina < choice.condition.minStamina)
                  }
                  className="w-full text-left p-4 rounded-lg bg-primary/20 hover:bg-primary/40 text-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {choice.text}
                  {choice.condition && (
                      <span className="text-xs text-yellow-400 ml-2">
                          (필요: 
                          {choice.condition.minIntelligence && ` 지력 ${choice.condition.minIntelligence}`}
                          {choice.condition.minCharm && ` 매력 ${choice.condition.minCharm}`}
                          {choice.condition.minStamina && ` 체력 ${choice.condition.minStamina}`})
                      </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualNovelDialog;
