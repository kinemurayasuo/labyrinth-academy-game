import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisualNovelChoice as VNChoice, ChoiceCondition } from '../../types/advanced-game';
import { Player } from '../../types/game';
import { RelationshipManager } from '../services/RelationshipManager';

interface VisualNovelChoiceProps {
  choices: VNChoice[];
  player: Player;
  relationshipManager: RelationshipManager;
  onSelect: (choiceId: string) => void;
  timedChoice?: boolean;
  defaultTimer?: number;
}

export const VisualNovelChoice: React.FC<VisualNovelChoiceProps> = ({
  choices,
  player,
  relationshipManager,
  onSelect,
  timedChoice = false,
  defaultTimer = 10
}) => {
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(defaultTimer);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [revealedChoices, setRevealedChoices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (timedChoice && timeRemaining > 0 && !selectedChoice) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timedChoice && timeRemaining === 0 && !selectedChoice) {
      const defaultChoice = choices.find(c => !c.hidden) || choices[0];
      handleChoice(defaultChoice.id);
    }
  }, [timeRemaining, timedChoice, selectedChoice, choices]);

  const checkCondition = (condition?: ChoiceCondition): boolean => {
    if (!condition) return true;

    if (condition.stats) {
      for (const [stat, value] of Object.entries(condition.stats)) {
        if ((player.stats as any)[stat] < value) return false;
      }
    }

    if (condition.affinity) {
      const relationship = relationshipManager.getRelationship(condition.affinity.characterId);
      if (!relationship || relationship.affinity < condition.affinity.min) return false;
    }

    if (condition.items) {
      for (const item of condition.items) {
        if (!player.inventory.includes(item)) return false;
      }
    }

    if (condition.flags) {
      for (const flag of condition.flags) {
        if (!player.flags[flag]) return false;
      }
    }

    return true;
  };

  const handleChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setTimeout(() => {
      onSelect(choiceId);
    }, 500);
  };

  const getChoiceStyle = (choice: VNChoice) => {
    const isAvailable = checkCondition(choice.condition);
    const isHovered = hoveredChoice === choice.id;
    const isSelected = selectedChoice === choice.id;

    let backgroundColor = 'rgba(30, 30, 40, 0.9)';
    let borderColor = '#4a5568';
    let textColor = '#ffffff';

    if (!isAvailable) {
      backgroundColor = 'rgba(50, 50, 60, 0.5)';
      borderColor = '#2d3748';
      textColor = '#718096';
    } else if (isSelected) {
      backgroundColor = 'rgba(99, 179, 237, 0.3)';
      borderColor = '#63b3ed';
    } else if (isHovered) {
      backgroundColor = 'rgba(49, 130, 206, 0.2)';
      borderColor = '#4299e1';
    }

    if (choice.color) {
      borderColor = choice.color;
    }

    return {
      backgroundColor,
      borderColor,
      color: textColor,
      borderWidth: '2px',
      borderStyle: 'solid',
      transition: 'all 0.3s ease'
    };
  };

  const renderPreview = (choice: VNChoice) => {
    if (!choice.preview || !revealedChoices.has(choice.id)) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 p-2 bg-gray-800 rounded text-sm"
      >
        {choice.preview.affectionChange && (
          <div className="flex gap-2 mb-1">
            {Object.entries(choice.preview.affectionChange).map(([char, change]) => (
              <span key={char} className={change > 0 ? 'text-green-400' : 'text-red-400'}>
                {char}: {change > 0 ? '+' : ''}{change}
              </span>
            ))}
          </div>
        )}
        {choice.preview.consequence && (
          <div className="text-gray-400 italic">{choice.preview.consequence}</div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="visual-novel-choices p-4">
      {timedChoice && (
        <div className="timer-bar mb-4">
          <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-blue-500 h-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / defaultTimer) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <div className="text-center text-sm mt-1 text-gray-400">
            {timeRemaining}s
          </div>
        </div>
      )}

      <AnimatePresence>
        <div className="choices-container space-y-3">
          {choices.map((choice, index) => {
            const isAvailable = checkCondition(choice.condition);
            const isRevealed = revealedChoices.has(choice.id);

            if (choice.hidden && !isRevealed) return null;

            return (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                className="choice-wrapper"
              >
                <motion.button
                  className="choice-button w-full text-left p-4 rounded-lg relative overflow-hidden"
                  style={getChoiceStyle(choice)}
                  whileHover={isAvailable ? { scale: 1.02 } : {}}
                  whileTap={isAvailable ? { scale: 0.98 } : {}}
                  onMouseEnter={() => {
                    if (isAvailable) {
                      setHoveredChoice(choice.id);
                      if (choice.preview) {
                        setRevealedChoices(prev => new Set(prev).add(choice.id));
                      }
                    }
                  }}
                  onMouseLeave={() => setHoveredChoice(null)}
                  onClick={() => isAvailable && handleChoice(choice.id)}
                  disabled={!isAvailable || selectedChoice !== null}
                >
                  <div className="flex items-center gap-3">
                    {choice.icon && (
                      <span className="text-2xl">{choice.icon}</span>
                    )}
                    <div className="flex-1">
                      <div className="choice-text text-base font-medium">
                        {choice.text}
                      </div>
                      {!isAvailable && choice.condition && (
                        <div className="mt-1 text-xs text-red-400">
                          {renderRequirements(choice.condition)}
                        </div>
                      )}
                    </div>
                    {choice.weight && (
                      <div className="choice-weight text-xs text-gray-500">
                        {Array(choice.weight).fill('♦').join('')}
                      </div>
                    )}
                  </div>

                  {selectedChoice === choice.id && (
                    <motion.div
                      className="absolute inset-0 bg-blue-500 opacity-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 10 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.button>

                {renderPreview(choice)}
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};

function renderRequirements(condition: ChoiceCondition): string {
  const reqs = [];

  if (condition.stats) {
    for (const [stat, value] of Object.entries(condition.stats)) {
      reqs.push(`${stat} ${value}+`);
    }
  }

  if (condition.affinity) {
    reqs.push(`호감도 ${condition.affinity.min}+`);
  }

  if (condition.items) {
    reqs.push(`아이템 필요`);
  }

  return `요구사항: ${reqs.join(', ')}`;
}