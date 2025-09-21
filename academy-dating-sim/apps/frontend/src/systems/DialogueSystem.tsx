import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useRomanceSystem } from './RomanceSystem';
import { useCharacterMemory } from './CharacterMemory';
import enhancedDialogues from '../data/enhanced-dialogues.json';

export interface DialogueChoice {
  id: string;
  text: string;
  requirements?: {
    charm?: number;
    intelligence?: number;
    strength?: number;
    affection?: number;
    flags?: string[];
  };
  outcomes: {
    affection: number;
    emotionalStateChanges?: Record<string, number>;
    statChanges?: Record<string, number>;
    flags?: string[];
    unlocks?: string[];
    nextDialogue?: string;
  };
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  emotion: string;
  choices: DialogueChoice[];
  triggerConditions?: {
    timeOfDay?: string;
    location?: string;
    relationshipStage?: string;
    flags?: string[];
    mood?: string;
    weather?: string;
  };
}

export interface DialogueTree {
  id: string;
  title: string;
  triggerConditions: {
    timeOfDay?: string;
    location?: string;
    relationshipStage?: string;
    flags?: string[];
    specialEvent?: string;
  };
  dialogueFlow: DialogueNode[];
}

// Dynamic dialogue generation system
export const useDynamicDialogue = () => {
  const { player } = useGameStore();
  const { getRelationshipStage } = useRomanceSystem();
  const {
    getCharacterEmotionalState,
    getCharacterMoodState,
    getCharacterDialogueModifier,
    getRecentMemories
  } = useCharacterMemory();

  const generateContextualDialogue = (
    characterId: string,
    baseDialogue: string,
    context?: {
      timeOfDay?: string;
      weather?: string;
      location?: string;
      recentMemory?: boolean;
    }
  ): string => {
    const emotionalState = getCharacterEmotionalState(characterId);
    const moodState = getCharacterMoodState(characterId);
    const relationshipStage = getRelationshipStage(characterId);
    const dialogueModifier = getCharacterDialogueModifier(characterId);

    let modifiedDialogue = baseDialogue;

    // Apply mood-based modifications
    const moodModifiers: Record<string, string> = {
      happy: '밝은 목소리로',
      sad: '조금 우울한 톤으로',
      angry: '약간 짜증스러운 목소리로',
      excited: '흥분된 목소리로',
      nervous: '긴장한 목소리로',
      romantic: '부드럽고 감미로운 목소리로',
      calm: '차분한 목소리로'
    };

    const moodPrefix = moodModifiers[moodState.currentMood];
    if (moodPrefix) {
      modifiedDialogue = `(${moodPrefix}) ${modifiedDialogue}`;
    }

    // Apply emotional state modifications
    if (emotionalState.love > 70) {
      modifiedDialogue += ' (사랑스러운 눈빛으로)';
    } else if (emotionalState.shyness > 70) {
      modifiedDialogue += ' (부끄러워하며)';
    } else if (emotionalState.jealousy > 50) {
      modifiedDialogue += ' (약간 질투하는 표정으로)';
    }

    // Add relationship-specific suffixes
    if (relationshipStage.status === 'lover') {
      if (Math.random() < 0.3) {
        modifiedDialogue += ' 여보.';
      }
    } else if (relationshipStage.status === 'close_friend') {
      if (Math.random() < 0.2) {
        modifiedDialogue += ' 친구야.';
      }
    }

    // Weather-based modifications
    if (context?.weather) {
      const weatherDialogues: Record<string, Record<string, string>> = {
        rainy: {
          sakura: ' 비가 와서 실내 훈련을 해야겠어요.',
          yuki: ' 비 소리가 마법 연구에 집중하게 해줘요.',
          luna: ' 비는... 제 마음을 차분하게 해줘요.'
        },
        sunny: {
          sakura: ' 날씨가 좋아서 야외 훈련하기 딱 좋네요!',
          yuki: ' 햇살이 따뜻해서 기분이 좋아요.',
          luna: ' 밝은 햇살... 조금 눈부시지만 괜찮아요.'
        }
      };

      const weatherAddition = weatherDialogues[context.weather]?.[characterId];
      if (weatherAddition) {
        modifiedDialogue += weatherAddition;
      }
    }

    // Memory-influenced dialogue
    if (context?.recentMemory) {
      const recentMemories = getRecentMemories(characterId, 1);
      if (recentMemories.length > 0) {
        const memory = recentMemories[0];
        if (memory.emotionalWeight > 15) {
          modifiedDialogue = `저번에 ${memory.title}가 생각나네요. ${modifiedDialogue}`;
        } else if (memory.emotionalWeight < -10) {
          modifiedDialogue = `저번 일은... 잊고 싶지만... ${modifiedDialogue}`;
        }
      }
    }

    return modifiedDialogue;
  };

  const selectContextualResponse = (
    characterId: string,
    category: string,
    subcategory?: string
  ): string => {
    const characterDialogues = (enhancedDialogues as any)[characterId];
    if (!characterDialogues) return "...";

    const responses = subcategory
      ? characterDialogues[category]?.[subcategory]
      : characterDialogues[category];

    if (!responses || !Array.isArray(responses)) return "...";

    // Select response based on emotional state
    const emotionalState = getCharacterEmotionalState(characterId);
    const moodState = getCharacterMoodState(characterId);

    // Weight responses based on current mood
    let selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    // Apply contextual modifications
    selectedResponse = generateContextualDialogue(characterId, selectedResponse, {
      timeOfDay: player.timeOfDay,
      location: player.location
    });

    return selectedResponse;
  };

  return {
    generateContextualDialogue,
    selectContextualResponse
  };
};

// Advanced dialogue system with branching and memory
export const useAdvancedDialogue = () => {
  const { player, actions } = useGameStore();
  const { updateRelationshipProgression } = useRomanceSystem();
  const {
    updateEmotionalState,
    addMemory,
    getCharacterEmotionalState,
    getCharacterMoodState
  } = useCharacterMemory();
  const { generateContextualDialogue } = useDynamicDialogue();

  const [currentDialogueTree, setCurrentDialogueTree] = useState<DialogueTree | null>(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{
    nodeId: string;
    choiceId?: string;
    timestamp: number;
  }>>([]);

  const checkChoiceRequirements = (choice: DialogueChoice): boolean => {
    if (!choice.requirements) return true;

    const { requirements } = choice;

    // Check stat requirements
    if (requirements.charm && player.stats.charm < requirements.charm) return false;
    if (requirements.intelligence && player.stats.intelligence < requirements.intelligence) return false;
    if (requirements.strength && player.stats.strength < requirements.strength) return false;

    // Check affection requirements
    if (requirements.affection) {
      const characterId = currentDialogueTree?.id.split('_')[0];
      if (characterId) {
        const affection = player.affection[characterId] || 0;
        if (affection < requirements.affection) return false;
      }
    }

    // Check flag requirements
    if (requirements.flags) {
      const hasAllFlags = requirements.flags.every(flag => player.flags[flag]);
      if (!hasAllFlags) return false;
    }

    return true;
  };

  const executeChoiceOutcomes = (characterId: string, choice: DialogueChoice) => {
    const { outcomes } = choice;

    // Apply affection change
    if (outcomes.affection) {
      updateRelationshipProgression(characterId, outcomes.affection);
    }

    // Apply emotional state changes
    if (outcomes.emotionalStateChanges) {
      updateEmotionalState(characterId, outcomes.emotionalStateChanges);
    }

    // Apply stat changes
    if (outcomes.statChanges) {
      actions.updateStats(outcomes.statChanges);
    }

    // Set flags
    if (outcomes.flags) {
      const newFlags = { ...player.flags };
      outcomes.flags.forEach(flag => {
        newFlags[flag] = true;
      });
      actions.updatePlayer({ flags: newFlags });
    }

    // Set unlocks
    if (outcomes.unlocks) {
      const newFlags = { ...player.flags };
      outcomes.unlocks.forEach(unlock => {
        newFlags[unlock] = true;
      });
      actions.updatePlayer({ flags: newFlags });
    }

    // Add memory of this interaction
    const currentNode = currentDialogueTree?.dialogueFlow[currentNodeIndex];
    if (currentNode) {
      addMemory({
        characterId,
        playerId: 'player',
        type: 'conversation',
        title: `${currentDialogueTree?.title || '대화'}`,
        description: `${currentNode.text} - "${choice.text}"를 선택했습니다.`,
        location: player.location,
        timeOfDay: player.timeOfDay,
        emotionalWeight: outcomes.affection || 0,
        tags: ['dialogue', currentNode.emotion],
        participants: [characterId, 'player'],
        context: {
          playerAction: choice.text,
          characterReaction: currentNode.text,
          playerStats: { ...player.stats },
          relationshipStage: 'current' // This would be filled with actual stage
        },
        consequences: {
          affectionChange: outcomes.affection || 0,
          trustChange: outcomes.emotionalStateChanges?.trust || 0,
          emotionalStateChanges: outcomes.emotionalStateChanges || {},
          flags: outcomes.flags || []
        }
      });
    }
  };

  const handleChoiceSelection = (characterId: string, choiceId: string) => {
    const currentNode = currentDialogueTree?.dialogueFlow[currentNodeIndex];
    if (!currentNode) return;

    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // Execute choice outcomes
    executeChoiceOutcomes(characterId, choice);

    // Add to dialogue history
    setDialogueHistory(prev => [...prev, {
      nodeId: currentNode.id,
      choiceId: choice.id,
      timestamp: Date.now()
    }]);

    // Navigate to next dialogue node
    if (choice.outcomes.nextDialogue) {
      const nextNodeIndex = currentDialogueTree?.dialogueFlow.findIndex(
        node => node.id === choice.outcomes.nextDialogue
      );
      if (nextNodeIndex !== undefined && nextNodeIndex >= 0) {
        setCurrentNodeIndex(nextNodeIndex);
      } else {
        // End dialogue
        setCurrentDialogueTree(null);
        setCurrentNodeIndex(0);
      }
    } else {
      // End dialogue
      setCurrentDialogueTree(null);
      setCurrentNodeIndex(0);
    }

    // Show outcome message
    const outcomeMessage = `호감도 ${choice.outcomes.affection > 0 ? '+' : ''}${choice.outcomes.affection}`;
    actions.updatePlayer({ gameMessage: outcomeMessage });
  };

  const startDialogueTree = (tree: DialogueTree) => {
    setCurrentDialogueTree(tree);
    setCurrentNodeIndex(0);
    setDialogueHistory([]);
  };

  const getCurrentDialogueNode = (): DialogueNode | null => {
    if (!currentDialogueTree || currentNodeIndex >= currentDialogueTree.dialogueFlow.length) {
      return null;
    }
    return currentDialogueTree.dialogueFlow[currentNodeIndex];
  };

  const getAvailableChoices = (characterId: string): DialogueChoice[] => {
    const currentNode = getCurrentDialogueNode();
    if (!currentNode) return [];

    return currentNode.choices.filter(choice => checkChoiceRequirements(choice));
  };

  return {
    currentDialogueTree,
    getCurrentDialogueNode,
    getAvailableChoices,
    handleChoiceSelection,
    startDialogueTree,
    dialogueHistory
  };
};

// Dialogue UI Component
export const DialogueInterface: React.FC<{
  characterId: string;
  onDialogueEnd?: () => void;
}> = ({ characterId, onDialogueEnd }) => {
  const {
    getCurrentDialogueNode,
    getAvailableChoices,
    handleChoiceSelection,
    currentDialogueTree
  } = useAdvancedDialogue();
  const { generateContextualDialogue } = useDynamicDialogue();

  const currentNode = getCurrentDialogueNode();
  const availableChoices = getAvailableChoices(characterId);

  const characterNames: Record<string, string> = {
    sakura: '사쿠라',
    yuki: '유키',
    luna: '루나',
    mystery: '???',
    akane: '아카네',
    hana: '하나',
    rin: '린',
    mei: '메이',
    sora: '소라'
  };

  const characterName = characterNames[characterId] || characterId;

  if (!currentNode || !currentDialogueTree) {
    return null;
  }

  const enhancedDialogue = generateContextualDialogue(characterId, currentNode.text, {
    timeOfDay: 'current',
    location: 'current'
  });

  const handleChoice = (choiceId: string) => {
    handleChoiceSelection(characterId, choiceId);

    // Check if dialogue ended
    const nextNode = getCurrentDialogueNode();
    if (!nextNode && onDialogueEnd) {
      onDialogueEnd();
    }
  };

  return (
    <div className="dialogue-interface fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="dialogue-box bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Character Header */}
        <div className="character-header bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div className="flex items-center space-x-3">
            <div className="character-avatar w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
              <span className="text-2xl">
                {characterId === 'sakura' ? '🗡️' :
                 characterId === 'yuki' ? '❄️' :
                 characterId === 'luna' ? '🌙' : '✨'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{characterName}</h3>
              <p className="text-sm opacity-90">
                {currentNode.emotion.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Dialogue Content */}
        <div className="dialogue-content p-6">
          <div className="character-dialogue bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {enhancedDialogue}
            </p>
          </div>

          {/* Dialogue Choices */}
          <div className="dialogue-choices space-y-3">
            <h4 className="font-semibold text-gray-700 mb-3">응답 선택:</h4>
            {availableChoices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full p-4 text-left bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="choice-text text-gray-800 font-medium mb-1">
                  {index + 1}. {choice.text}
                </div>

                {/* Choice Requirements */}
                {choice.requirements && (
                  <div className="choice-requirements text-xs text-gray-500 mb-1">
                    {choice.requirements.charm && `매력 ${choice.requirements.charm}+ 필요`}
                    {choice.requirements.intelligence && `지력 ${choice.requirements.intelligence}+ 필요`}
                    {choice.requirements.strength && `힘 ${choice.requirements.strength}+ 필요`}
                  </div>
                )}

                {/* Choice Preview */}
                <div className="choice-preview text-sm text-gray-600">
                  호감도 {choice.outcomes.affection > 0 ? '+' : ''}{choice.outcomes.affection}
                  {choice.outcomes.emotionalStateChanges && Object.keys(choice.outcomes.emotionalStateChanges).length > 0 && (
                    <span className="ml-2">
                      | 감정 변화: {Object.entries(choice.outcomes.emotionalStateChanges)
                        .map(([emotion, change]) => `${emotion} ${change > 0 ? '+' : ''}${change}`)
                        .join(', ')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dialogue Progress */}
        <div className="dialogue-footer bg-gray-100 p-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{currentDialogueTree.title}</span>
            <span>대화 진행 중...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick dialogue component for simple interactions
export const QuickDialogue: React.FC<{
  characterId: string;
  category: string;
  subcategory?: string;
  onClose?: () => void;
}> = ({ characterId, category, subcategory, onClose }) => {
  const { selectContextualResponse } = useDynamicDialogue();
  const [dialogue, setDialogue] = useState<string>('');

  useEffect(() => {
    const response = selectContextualResponse(characterId, category, subcategory);
    setDialogue(response);
  }, [characterId, category, subcategory]);

  const characterNames: Record<string, string> = {
    sakura: '사쿠라',
    yuki: '유키',
    luna: '루나',
    mystery: '???',
    akane: '아카네',
    hana: '하나',
    rin: '린',
    mei: '메이',
    sora: '소라'
  };

  const characterName = characterNames[characterId] || characterId;

  return (
    <div className="quick-dialogue bg-white border-2 border-purple-200 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">
          {characterId === 'sakura' ? '🗡️' :
           characterId === 'yuki' ? '❄️' :
           characterId === 'luna' ? '🌙' : '✨'}
        </span>
        <h4 className="font-bold text-purple-800">{characterName}</h4>
      </div>

      <p className="text-gray-800 mb-3 italic">"{dialogue}"</p>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          확인
        </button>
      )}
    </div>
  );
};

export default {
  useDynamicDialogue,
  useAdvancedDialogue,
  DialogueInterface,
  QuickDialogue
};