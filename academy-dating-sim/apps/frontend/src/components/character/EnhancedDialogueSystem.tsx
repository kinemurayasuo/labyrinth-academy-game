import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import enhancedDialogues from '../../data/enhanced-dialogues.json';
import charactersData from '../../data/characters.json';

interface DialogueContext {
  characterId: string;
  timeOfDay: string;
  weather?: string;
  location?: string;
  affection: number;
  mood?: string;
  lastInteraction?: string;
  specialEvent?: string;
  playerStats?: any;
}

interface DialogueOption {
  text: string;
  response: string;
  affectionChange: number;
  moodChange?: string;
  unlockCondition?: {
    minAffection?: number;
    minStat?: { stat: string; value: number };
    item?: string;
  };
}

interface DialogueHistory {
  characterId: string;
  dialogue: string;
  response?: string;
  timestamp: Date;
  affectionChange?: number;
}

const EnhancedDialogueSystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const currentWeather = useGameStore((state: any) => state.currentWeather);
  const { updateAffection, advanceTime, addItem, updateStats } = useGameStore((state: any) => state.actions);

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [dialogueOptions, setDialogueOptions] = useState<DialogueOption[]>([]);
  const [characterMood, setCharacterMood] = useState<string>('neutral');
  const [dialogueHistory, setDialogueHistory] = useState<DialogueHistory[]>([]);
  const [showEmotionEffect, setShowEmotionEffect] = useState<string | null>(null);
  const [relationshipLevel, setRelationshipLevel] = useState<string>('');
  const [specialInteraction, setSpecialInteraction] = useState<boolean>(false);

  const characters = charactersData as Record<string, any>;

  // Get character mood based on various factors
  const calculateCharacterMood = useCallback((characterId: string): string => {
    const affection = player.affection[characterId] || 0;
    const lastGift = dialogueHistory.filter(h => h.characterId === characterId && h.dialogue.includes('선물')).slice(-1)[0];
    const recentInteractions = dialogueHistory.filter(
      h => h.characterId === characterId &&
      new Date().getTime() - new Date(h.timestamp).getTime() < 86400000 // Last 24 hours
    );

    // Mood calculation logic
    if (affection >= 80) return 'love';
    if (affection >= 60 && recentInteractions.length > 3) return 'happy';
    if (lastGift && new Date().getTime() - new Date(lastGift.timestamp).getTime() < 3600000) return 'shy';
    if (recentInteractions.length === 0) return 'sad';
    if (affection >= 40) return 'happy';
    if (affection < 20) return 'neutral';

    return 'neutral';
  }, [player.affection, dialogueHistory]);

  // Get contextual dialogue based on situation
  const getContextualDialogue = useCallback((context: DialogueContext): string => {
    const characterDialogues = (enhancedDialogues as any)[context.characterId];
    if (!characterDialogues) return '...';

    let possibleDialogues: string[] = [];

    // Priority 1: Special events
    if (context.specialEvent && characterDialogues.special_events?.[context.specialEvent]) {
      return characterDialogues.special_events[context.specialEvent];
    }

    // Priority 2: Mood-based dialogues
    if (context.mood && characterDialogues.mood_dialogues?.[context.mood]) {
      possibleDialogues = [...characterDialogues.mood_dialogues[context.mood]];
    }

    // Priority 3: Time-based greetings
    if (characterDialogues.greetings?.[context.timeOfDay]) {
      possibleDialogues = [...possibleDialogues, ...characterDialogues.greetings[context.timeOfDay]];
    }

    // Priority 4: Weather reactions (common)
    if (context.weather && (enhancedDialogues as any).common?.weather_reactions?.[context.weather]) {
      possibleDialogues = [...possibleDialogues, ...(enhancedDialogues as any).common.weather_reactions[context.weather]];
    }

    // Priority 5: Relationship milestones
    const milestones = (enhancedDialogues as any).common?.relationship_milestones;
    if (milestones) {
      const affectionKeys = Object.keys(milestones).map(Number).sort((a, b) => b - a);
      for (const key of affectionKeys) {
        if (context.affection >= key) {
          possibleDialogues.push(milestones[key]);
          break;
        }
      }
    }

    // If no contextual dialogue found, use a random greeting
    if (possibleDialogues.length === 0) {
      const allGreetings = Object.values(characterDialogues.greetings || {}).flat();
      possibleDialogues = allGreetings as string[];
    }

    // Return random dialogue from possibilities
    return possibleDialogues[Math.floor(Math.random() * possibleDialogues.length)] || '...';
  }, []);

  // Generate dialogue options based on context
  const generateDialogueOptions = useCallback((characterId: string, affection: number): DialogueOption[] => {
    const options: DialogueOption[] = [];

    // Basic options always available
    options.push({
      text: '안녕, 잘 지냈어?',
      response: '응, 덕분에 잘 지냈어.',
      affectionChange: 1
    });

    options.push({
      text: '오늘 기분 어때?',
      response: '너를 보니 좋아졌어.',
      affectionChange: 2
    });

    // Affection-based options
    if (affection >= 20) {
      options.push({
        text: '같이 산책할래?',
        response: '좋아, 같이 가자.',
        affectionChange: 3,
        unlockCondition: { minAffection: 20 }
      });
    }

    if (affection >= 40) {
      options.push({
        text: '오늘 예뻐 보이네.',
        response: '어머, 갑자기 왜 그래?',
        affectionChange: 5,
        moodChange: 'shy',
        unlockCondition: { minAffection: 40 }
      });
    }

    if (affection >= 60) {
      options.push({
        text: '데이트하자!',
        response: '그래, 어디로 갈까?',
        affectionChange: 7,
        moodChange: 'happy',
        unlockCondition: { minAffection: 60 }
      });
    }

    if (affection >= 80) {
      options.push({
        text: '사랑해',
        response: '나도... 사랑해.',
        affectionChange: 10,
        moodChange: 'love',
        unlockCondition: { minAffection: 80 }
      });
    }

    // Item-based options
    if (player.inventory?.includes('flower')) {
      options.push({
        text: '🌹 꽃을 선물하기',
        response: '와, 정말 예쁘다! 고마워!',
        affectionChange: 8,
        moodChange: 'happy',
        unlockCondition: { item: 'flower' }
      });
    }

    if (player.inventory?.includes('chocolate')) {
      options.push({
        text: '🍫 초콜릿 선물하기',
        response: '내가 좋아하는 초콜릿이야! 어떻게 알았어?',
        affectionChange: 10,
        moodChange: 'love',
        unlockCondition: { item: 'chocolate' }
      });
    }

    // Stat-based options
    if (player.stats?.charm >= 30) {
      options.push({
        text: '(매력) 윙크하기',
        response: '어머, 언제 이렇게 매력적이 됐어?',
        affectionChange: 6,
        moodChange: 'shy',
        unlockCondition: { minStat: { stat: 'charm', value: 30 } }
      });
    }

    if (player.stats?.intelligence >= 30) {
      options.push({
        text: '(지능) 시 낭독하기',
        response: '와... 정말 로맨틱해.',
        affectionChange: 7,
        moodChange: 'happy',
        unlockCondition: { minStat: { stat: 'intelligence', value: 30 } }
      });
    }

    return options;
  }, [player]);

  // Handle dialogue selection
  const handleDialogueOption = useCallback((option: DialogueOption) => {
    if (!selectedCharacter) return;

    // Check unlock conditions
    if (option.unlockCondition) {
      if (option.unlockCondition.minAffection &&
          (player.affection[selectedCharacter] || 0) < option.unlockCondition.minAffection) {
        setCurrentDialogue('(아직 친밀도가 부족합니다)');
        return;
      }

      if (option.unlockCondition.minStat) {
        const stat = player.stats[option.unlockCondition.minStat.stat];
        if (stat < option.unlockCondition.minStat.value) {
          setCurrentDialogue(`(${option.unlockCondition.minStat.stat}이(가) 부족합니다)`);
          return;
        }
      }

      if (option.unlockCondition.item && !player.inventory?.includes(option.unlockCondition.item)) {
        setCurrentDialogue('(필요한 아이템이 없습니다)');
        return;
      }
    }

    // Apply effects
    updateAffection(selectedCharacter, option.affectionChange);

    if (option.moodChange) {
      setCharacterMood(option.moodChange);
      setShowEmotionEffect(option.moodChange);
      setTimeout(() => setShowEmotionEffect(null), 2000);
    }

    // Remove used item
    if (option.unlockCondition?.item) {
      // Remove item from inventory (would need to implement removeItem in store)
    }

    // Save to history
    const historyEntry: DialogueHistory = {
      characterId: selectedCharacter,
      dialogue: option.text,
      response: option.response,
      timestamp: new Date(),
      affectionChange: option.affectionChange
    };
    setDialogueHistory(prev => [...prev, historyEntry]);

    // Show response
    setCurrentDialogue(option.response);

    // Check for special interactions
    const currentAffection = (player.affection[selectedCharacter] || 0) + option.affectionChange;
    checkSpecialInteractions(selectedCharacter, currentAffection);

    advanceTime();
  }, [selectedCharacter, player, updateAffection, advanceTime]);

  // Check for special interactions based on affection levels
  const checkSpecialInteractions = useCallback((characterId: string, affection: number) => {
    const milestones = [10, 25, 50, 75, 90, 100];
    const previousAffection = player.affection[characterId] || 0;

    for (const milestone of milestones) {
      if (previousAffection < milestone && affection >= milestone) {
        setSpecialInteraction(true);
        setCurrentDialogue((enhancedDialogues as any).common.relationship_milestones[milestone]);

        // Special rewards at milestones
        if (milestone === 50) {
          addItem(`${characterId}_photo`);
        } else if (milestone === 100) {
          addItem(`${characterId}_ring`);
          updateStats({ charm: 10, luck: 10 });
        }

        break;
      }
    }
  }, [player.affection, addItem, updateStats]);

  // Get relationship level text
  const getRelationshipLevel = useCallback((affection: number): string => {
    if (affection >= 100) return '💕 연인';
    if (affection >= 90) return '💖 서로 좋아함';
    if (affection >= 75) return '💗 호감';
    if (affection >= 50) return '💓 친한 친구';
    if (affection >= 25) return '💙 친구';
    if (affection >= 10) return '🤍 아는 사이';
    return '🩶 처음 만남';
  }, []);

  // Initialize character interaction
  const startInteraction = useCallback((characterId: string) => {
    setSelectedCharacter(characterId);

    const context: DialogueContext = {
      characterId,
      timeOfDay: player.timeOfDay,
      weather: currentWeather,
      location: player.location,
      affection: player.affection[characterId] || 0,
      mood: calculateCharacterMood(characterId),
      playerStats: player.stats
    };

    const dialogue = getContextualDialogue(context);
    setCurrentDialogue(dialogue);
    setCharacterMood(context.mood || 'neutral');
    setRelationshipLevel(getRelationshipLevel(context.affection));
    setDialogueOptions(generateDialogueOptions(characterId, context.affection));
  }, [player, currentWeather, calculateCharacterMood, getContextualDialogue, getRelationshipLevel, generateDialogueOptions]);

  // Emotion effect display
  const EmotionEffect: React.FC<{ emotion: string }> = ({ emotion }) => {
    const emotionIcons: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      shy: '😳',
      love: '💕',
      neutral: '😐'
    };

    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl animate-bounce">
        {emotionIcons[emotion]}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900 via-purple-900 to-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-pink-500">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              💬 대화 시스템
            </h1>
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              🏠 돌아가기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Selection */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-pink-500">
              <h2 className="text-xl font-bold text-white mb-4">캐릭터 선택</h2>
              <div className="space-y-2">
                {Object.entries(characters).map(([id, character]) => {
                  const affection = player.affection[id] || 0;
                  const isUnlocked = player.unlockedCharacters?.includes(id);

                  if (!isUnlocked) return null;

                  return (
                    <button
                      key={id}
                      onClick={() => startInteraction(id)}
                      className={`w-full p-3 rounded-lg transition ${
                        selectedCharacter === id
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{character.icon}</span>
                          <span className="font-bold">{character.name}</span>
                        </div>
                        <div className="text-sm">
                          <div className="text-pink-300">❤️ {affection}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dialogue History */}
            <div className="mt-6 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
              <h2 className="text-xl font-bold text-purple-400 mb-4">대화 기록</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dialogueHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="text-sm bg-purple-900/30 rounded p-2">
                    <div className="text-gray-400 text-xs">
                      {characters[entry.characterId]?.name} - {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-white">{entry.dialogue}</div>
                    {entry.affectionChange && (
                      <div className="text-pink-300 text-xs">호감도 +{entry.affectionChange}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dialogue Interface */}
          <div className="lg:col-span-2">
            {selectedCharacter ? (
              <div className="bg-gradient-to-br from-pink-800/50 to-purple-800/50 backdrop-blur-md rounded-lg p-6 border border-pink-400">
                {/* Character Info */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="text-6xl">{characters[selectedCharacter].icon}</div>
                      {showEmotionEffect && <EmotionEffect emotion={showEmotionEffect} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{characters[selectedCharacter].name}</h2>
                      <div className="text-sm text-gray-300">{characters[selectedCharacter].title}</div>
                      <div className="text-sm text-pink-300 mt-1">{relationshipLevel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-pink-400">❤️ {player.affection[selectedCharacter] || 0}/100</div>
                    <div className="text-sm text-gray-400">기분: {characterMood}</div>
                  </div>
                </div>

                {/* Dialogue Box */}
                <div className="bg-black/30 rounded-lg p-6 mb-6 min-h-[150px]">
                  <p className="text-lg text-white leading-relaxed">
                    {currentDialogue}
                  </p>
                  {specialInteraction && (
                    <div className="mt-4 p-3 bg-yellow-500/20 rounded border border-yellow-500">
                      <span className="text-yellow-300 font-bold">✨ 특별한 순간!</span>
                    </div>
                  )}
                </div>

                {/* Dialogue Options */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white mb-2">선택지</h3>
                  {dialogueOptions.map((option, index) => {
                    const isLocked = option.unlockCondition && (
                      (option.unlockCondition.minAffection && (player.affection[selectedCharacter] || 0) < option.unlockCondition.minAffection) ||
                      (option.unlockCondition.minStat && player.stats[option.unlockCondition.minStat.stat] < option.unlockCondition.minStat.value) ||
                      (option.unlockCondition.item && !player.inventory?.includes(option.unlockCondition.item))
                    );

                    return (
                      <button
                        key={index}
                        onClick={() => !isLocked && handleDialogueOption(option)}
                        className={`w-full p-3 rounded-lg text-left transition ${
                          isLocked
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                        }`}
                        disabled={isLocked}
                      >
                        <div className="flex justify-between items-center">
                          <span>{option.text}</span>
                          <div className="text-sm">
                            {option.unlockCondition && (
                              <span className="text-xs">
                                {option.unlockCondition.minAffection && `❤️ ${option.unlockCondition.minAffection}`}
                                {option.unlockCondition.minStat && `📊 ${option.unlockCondition.minStat.stat} ${option.unlockCondition.minStat.value}`}
                                {option.unlockCondition.item && `🎁 ${option.unlockCondition.item}`}
                              </span>
                            )}
                            <span className="ml-2 text-pink-300">+{option.affectionChange}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-12 border border-pink-500 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-white mb-2">캐릭터를 선택하세요</h2>
                <p className="text-gray-400">
                  대화하고 싶은 캐릭터를 선택하면 상황에 맞는 대화가 시작됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDialogueSystem;