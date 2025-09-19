import { useState } from 'react';
import { Button } from '../ui/button';

interface DialogueBoxProps {
  characterName: string;
  text: string;
  isComplete: boolean;
  onNext: () => void;
  choices?: Array<{
    text: string;
    action: () => void;
  }>;
}

export function DialogueBox({ characterName, text, isComplete, onNext, choices }: DialogueBoxProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-white/95 to-pink-50/95 backdrop-blur-sm border border-pink-200 rounded-3xl shadow-2xl shadow-pink-200/50">
      {/* Character name bar */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 inline-block ml-6 -mt-2 rounded-2xl shadow-lg">
        <span className="text-sm font-medium flex items-center gap-2">
          💖 {characterName}
        </span>
      </div>
      
      {/* Dialogue content */}
      <div className="p-6 pt-4">
        <div className="text-purple-800 min-h-20 flex items-center">
          <p className="text-base leading-relaxed">{text}</p>
        </div>
        
        {/* Choices or next button */}
        {choices && choices.length > 0 ? (
          <div className="flex flex-col gap-3 mt-4">
            {choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-purple-800 hover:from-pink-200 hover:to-purple-200 rounded-2xl shadow-md"
                onClick={choice.action}
              >
                ✨ {choice.text}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-end mt-4">
            {isComplete && (
              <Button
                onClick={onNext}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl shadow-lg"
              >
                다음 💫
              </Button>
            )}
          </div>
        )}
        
        {/* Click to continue hint */}
        {isComplete && (!choices || choices.length === 0) && (
          <div className="absolute bottom-3 right-6 text-purple-400 text-xs animate-bounce flex items-center gap-1">
            <span>✨</span>
            클릭하여 계속
            <span>✨</span>
          </div>
        )}
      </div>
    </div>
  );
}