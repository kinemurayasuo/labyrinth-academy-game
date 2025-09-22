import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueChoice {
  text: string;
  affectionChange: number;
  response: string;
}

interface DialogueLine {
  speaker?: 'character' | 'narrator' | 'player';
  text: string;
  emotion?: string;
  expression?: string;
  pause?: number; // milliseconds to pause before next line
}

interface ExtendedDialogueProps {
  characterName: string;
  characterImage?: string;
  dialogueLines: (string | DialogueLine)[];
  choices?: DialogueChoice[];
  onChoiceSelect?: (choice: DialogueChoice, index: number) => void;
  onDialogueComplete?: () => void;
  autoAdvance?: boolean;
  typingSpeed?: number; // characters per second
  showHistory?: boolean;
  characterExpressions?: { [emotion: string]: string };
}

interface DialogueHistoryItem {
  speaker: string;
  text: string;
  timestamp: Date;
}

export const ExtendedDialogue: React.FC<ExtendedDialogueProps> = ({
  characterName,
  characterImage,
  dialogueLines,
  choices = [],
  onChoiceSelect,
  onDialogueComplete,
  autoAdvance = false,
  typingSpeed = 50,
  showHistory = false,
  characterExpressions = {}
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueHistoryItem[]>([]);
  const [currentExpression, setCurrentExpression] = useState('normal');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentLine = useCallback(() => {
    if (currentLineIndex >= dialogueLines.length) return null;

    const line = dialogueLines[currentLineIndex];
    if (typeof line === 'string') {
      return { text: line, speaker: 'narrator' };
    }
    return line;
  }, [dialogueLines, currentLineIndex]);

  const startTyping = useCallback((text: string, onComplete?: () => void) => {
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(prev => prev + text[charIndex]);
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, 1000 / typingSpeed);

    typingIntervalRef.current = interval;
  }, [typingSpeed]);

  const skipTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const currentLine = getCurrentLine();
    if (currentLine) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    }
  }, [getCurrentLine]);

  const advanceDialogue = useCallback(() => {
    const currentLine = getCurrentLine();
    if (currentLine) {
      // Add to history
      setDialogueHistory(prev => [...prev, {
        speaker: currentLine.speaker || 'narrator',
        text: currentLine.text,
        timestamp: new Date()
      }]);

      // Update expression if specified
      if (currentLine.expression) {
        setCurrentExpression(currentLine.expression);
      } else if (currentLine.emotion && characterExpressions[currentLine.emotion]) {
        setCurrentExpression(currentLine.emotion);
      }
    }

    if (currentLineIndex < dialogueLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else if (choices.length > 0) {
      setShowChoices(true);
    } else {
      onDialogueComplete?.();
    }
  }, [currentLineIndex, dialogueLines.length, choices.length, getCurrentLine, characterExpressions, onDialogueComplete]);

  const handleChoiceSelect = useCallback((choice: DialogueChoice, index: number) => {
    setShowChoices(false);

    // Add player choice to history
    setDialogueHistory(prev => [...prev, {
      speaker: 'player',
      text: choice.text,
      timestamp: new Date()
    }]);

    // Add character response to history
    if (choice.response) {
      setDialogueHistory(prev => [...prev, {
        speaker: characterName,
        text: choice.response,
        timestamp: new Date()
      }]);
    }

    onChoiceSelect?.(choice, index);
  }, [characterName, onChoiceSelect]);

  useEffect(() => {
    const currentLine = getCurrentLine();
    if (currentLine) {
      const onTypingComplete = () => {
        if (autoAdvance && !showChoices) {
          const pauseTime = currentLine.pause || 2000;
          autoAdvanceTimeoutRef.current = setTimeout(advanceDialogue, pauseTime);
        }
      };

      startTyping(currentLine.text, onTypingComplete);
    }

    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [currentLineIndex, getCurrentLine, startTyping, autoAdvance, showChoices, advanceDialogue]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const currentLine = getCurrentLine();
  if (!currentLine) return null;

  return (
    <div className="extended-dialogue">
      {/* Character Portrait */}
      <motion.div
        className="character-portrait"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {characterImage && (
          <img
            src={characterExpressions[currentExpression] || characterImage}
            alt={characterName}
            className="character-image"
          />
        )}
        <div className="character-name">{characterName}</div>
      </motion.div>

      {/* Dialogue Box */}
      <motion.div
        className="dialogue-box"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="dialogue-content">
          <div className="speaker-indicator">
            {currentLine.speaker === 'narrator' ? '내레이션' :
             currentLine.speaker === 'player' ? '플레이어' : characterName}
          </div>

          <div
            className={`dialogue-text ${currentLine.speaker || 'narrator'}`}
            onClick={isTyping ? skipTyping : advanceDialogue}
          >
            {displayedText}
            {isTyping && <span className="typing-cursor">▌</span>}
          </div>

          {currentLine.emotion && (
            <div className="emotion-indicator">
              <span className={`emotion-icon ${currentLine.emotion}`}>
                {getEmotionIcon(currentLine.emotion)}
              </span>
            </div>
          )}
        </div>

        {!isTyping && !autoAdvance && !showChoices && (
          <motion.div
            className="continue-indicator"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            클릭하여 계속 →
          </motion.div>
        )}
      </motion.div>

      {/* Choices */}
      <AnimatePresence>
        {showChoices && (
          <motion.div
            className="choices-container"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {choices.map((choice, index) => (
              <motion.button
                key={index}
                className="choice-button"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05, backgroundColor: '#f0f8ff' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoiceSelect(choice, index)}
              >
                <span className="choice-text">{choice.text}</span>
                {choice.affectionChange !== 0 && (
                  <span className={`affection-change ${choice.affectionChange > 0 ? 'positive' : 'negative'}`}>
                    {choice.affectionChange > 0 ? '+' : ''}{choice.affectionChange}
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      {showHistory && (
        <>
          <button
            className="history-toggle"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
          >
            📜 대화 기록
          </button>

          <AnimatePresence>
            {showHistoryPanel && (
              <motion.div
                className="history-panel"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="history-header">
                  <h3>대화 기록</h3>
                  <button onClick={() => setShowHistoryPanel(false)}>✕</button>
                </div>
                <div className="history-content">
                  {dialogueHistory.map((item, index) => (
                    <div key={index} className={`history-item ${item.speaker}`}>
                      <div className="history-speaker">{item.speaker}</div>
                      <div className="history-text">{item.text}</div>
                      <div className="history-time">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Controls */}
      <div className="dialogue-controls">
        <button
          className="control-button"
          onClick={skipTyping}
          disabled={!isTyping}
        >
          ⏩ 스킵
        </button>

        <button
          className="control-button"
          onClick={() => setShowHistoryPanel(true)}
        >
          📜 기록
        </button>

        <div className="progress-indicator">
          {currentLineIndex + 1} / {dialogueLines.length}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .extended-dialogue {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Noto Sans KR', sans-serif;
        }

        .character-portrait {
          text-align: center;
          margin-bottom: 20px;
        }

        .character-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .character-name {
          margin-top: 10px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .dialogue-box {
          background: linear-gradient(145deg, #ffffff, #f0f8ff);
          border: 2px solid #e1e8ed;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          position: relative;
          margin-bottom: 20px;
        }

        .speaker-indicator {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .dialogue-text {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
          cursor: pointer;
          min-height: 60px;
          user-select: none;
        }

        .dialogue-text.narrator {
          font-style: italic;
          color: #555;
        }

        .dialogue-text.character {
          color: #2c3e50;
        }

        .typing-cursor {
          animation: blink 1s infinite;
          color: #3498db;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .emotion-indicator {
          position: absolute;
          top: 15px;
          right: 20px;
        }

        .emotion-icon {
          font-size: 24px;
          opacity: 0.7;
        }

        .continue-indicator {
          text-align: right;
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }

        .choices-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .choice-button {
          background: linear-gradient(145deg, #fff, #f8fbff);
          border: 2px solid #e1e8ed;
          border-radius: 15px;
          padding: 15px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .choice-button:hover {
          border-color: #3498db;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
        }

        .choice-text {
          flex: 1;
          color: #333;
        }

        .affection-change {
          font-size: 12px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .affection-change.positive {
          background: #e8f5e8;
          color: #27ae60;
        }

        .affection-change.negative {
          background: #ffeaea;
          color: #e74c3c;
        }

        .history-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 12px;
          z-index: 1000;
        }

        .history-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-right: 2px solid #e1e8ed;
          z-index: 999;
          overflow-y: auto;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e1e8ed;
        }

        .history-content {
          padding: 20px;
        }

        .history-item {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(240, 248, 255, 0.5);
        }

        .history-speaker {
          font-size: 12px;
          font-weight: bold;
          color: #666;
        }

        .history-text {
          font-size: 14px;
          margin: 5px 0;
          color: #333;
        }

        .history-time {
          font-size: 10px;
          color: #999;
        }

        .dialogue-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }

        .control-button {
          background: #f8f9fa;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .control-button:hover:not(:disabled) {
          background: #e9ecef;
        }

        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress-indicator {
          font-size: 12px;
          color: #666;
        }

        @media (max-width: 768px) {
          .extended-dialogue {
            padding: 10px;
          }

          .dialogue-box {
            padding: 20px;
          }

          .history-panel {
            width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

function getEmotionIcon(emotion: string): string {
  const emotionIcons: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    shy: '😳',
    love: '😍',
    thoughtful: '🤔',
    nervous: '😰',
    excited: '🤗',
    confused: '😕',
    determined: '😤',
    peaceful: '😌'
  };

  return emotionIcons[emotion] || '😐';
}

export default ExtendedDialogue;