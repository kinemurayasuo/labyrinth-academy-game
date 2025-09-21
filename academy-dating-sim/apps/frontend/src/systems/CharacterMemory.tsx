import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

// Enhanced emotional states with depth
export interface EmotionalState {
  // Primary emotions (0-100)
  love: number;          // 사랑
  jealousy: number;      // 질투
  happiness: number;     // 행복
  sadness: number;       // 슬픔
  anger: number;         // 분노
  fear: number;          // 두려움
  excitement: number;    // 흥분
  embarrassment: number; // 당황/부끄러움
  longing: number;       // 그리움
  contentment: number;   // 만족감

  // Secondary emotional states
  trust: number;         // 신뢰
  shyness: number;       // 수줍음
  curiosity: number;     // 호기심
  gratitude: number;     // 감사
  worry: number;         // 걱정
  hope: number;          // 희망
  nostalgia: number;     // 그리움/추억
  pride: number;         // 자부심
  guilt: number;         // 죄책감
  relief: number;        // 안도감
}

export interface MoodState {
  currentMood: 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'nervous' | 'romantic' | 'melancholic' | 'playful' | 'serious';
  moodIntensity: number; // 0-100
  moodDuration: number;  // in minutes
  moodTrigger: string;   // what caused this mood
  moodHistory: Array<{
    mood: string;
    intensity: number;
    timestamp: number;
    trigger: string;
  }>;
}

export interface CharacterMemory {
  id: string;
  characterId: string;
  playerId: string;
  type: 'conversation' | 'gift' | 'activity' | 'date' | 'confession' | 'conflict' | 'milestone';
  title: string;
  description: string;
  location: string;
  timeOfDay: string;
  date: number;
  emotionalWeight: number; // -100 to 100 (negative for bad memories)
  tags: string[];
  participants: string[];
  context: {
    playerAction: string;
    characterReaction: string;
    playerStats: Record<string, number>;
    relationshipStage: string;
    weather?: string;
    season?: string;
  };
  consequences: {
    affectionChange: number;
    trustChange: number;
    emotionalStateChanges: Partial<EmotionalState>;
    flags: string[];
  };
  recallFrequency: number; // how often this memory is referenced
  lastRecalled: number;
  fadeLevel: number; // 0-100, how vivid the memory is
}

export interface MemoryCluster {
  id: string;
  name: string;
  theme: string;
  memories: string[]; // memory IDs
  overallSentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
  strength: number; // how strongly these memories are connected
}

// Default emotional state
const DEFAULT_EMOTIONAL_STATE: EmotionalState = {
  love: 0,
  jealousy: 0,
  happiness: 50,
  sadness: 20,
  anger: 10,
  fear: 15,
  excitement: 30,
  embarrassment: 25,
  longing: 10,
  contentment: 40,
  trust: 30,
  shyness: 40,
  curiosity: 35,
  gratitude: 25,
  worry: 30,
  hope: 45,
  nostalgia: 15,
  pride: 35,
  guilt: 10,
  relief: 30
};

// Character-specific emotional baselines
const CHARACTER_EMOTIONAL_BASELINES: Record<string, Partial<EmotionalState>> = {
  sakura: {
    happiness: 60,
    pride: 70,
    shyness: 30,
    excitement: 40,
    trust: 40,
    anger: 20
  },
  yuki: {
    happiness: 40,
    sadness: 30,
    shyness: 60,
    curiosity: 80,
    trust: 25,
    contentment: 30
  },
  luna: {
    happiness: 35,
    sadness: 40,
    longing: 60,
    nostalgia: 70,
    fear: 25,
    love: 10
  },
  mystery: {
    happiness: 30,
    sadness: 35,
    curiosity: 90,
    trust: 15,
    fear: 40,
    shyness: 50
  },
  akane: {
    happiness: 55,
    pride: 80,
    excitement: 50,
    trust: 60,
    worry: 40,
    contentment: 60
  },
  hana: {
    happiness: 80,
    contentment: 70,
    gratitude: 80,
    worry: 50,
    excitement: 45,
    trust: 70
  },
  rin: {
    happiness: 85,
    excitement: 80,
    pride: 50,
    trust: 60,
    curiosity: 60,
    contentment: 70
  },
  mei: {
    happiness: 45,
    sadness: 25,
    curiosity: 85,
    shyness: 70,
    contentment: 40,
    pride: 60
  },
  sora: {
    happiness: 50,
    curiosity: 95,
    excitement: 40,
    trust: 30,
    pride: 75,
    contentment: 45
  }
};

// Memory influence on character behavior
export const MEMORY_INFLUENCE_PATTERNS = {
  positive_memories_boost: {
    threshold: 3, // number of positive memories
    effects: {
      happiness: 15,
      trust: 10,
      contentment: 12,
      hope: 10
    }
  },
  negative_memories_burden: {
    threshold: 2, // number of negative memories
    effects: {
      sadness: 12,
      worry: 15,
      fear: 8,
      trust: -10
    }
  },
  romantic_memories_influence: {
    threshold: 2,
    effects: {
      love: 20,
      excitement: 15,
      shyness: 10,
      longing: 12
    }
  },
  conflict_memories_trauma: {
    threshold: 1,
    effects: {
      anger: 10,
      sadness: 8,
      trust: -15,
      fear: 12
    }
  }
};

// Hook for character memory and emotional system
export const useCharacterMemory = () => {
  const { player, actions } = useGameStore();

  const getCharacterEmotionalState = (characterId: string): EmotionalState => {
    const stored = player.characterStates?.[characterId]?.emotionalState;
    if (stored) return stored;

    // Create initial state based on character baseline
    const baseline = CHARACTER_EMOTIONAL_BASELINES[characterId] || {};
    return { ...DEFAULT_EMOTIONAL_STATE, ...baseline };
  };

  const getCharacterMoodState = (characterId: string): MoodState => {
    const stored = player.characterStates?.[characterId]?.moodState;
    if (stored) return stored;

    return {
      currentMood: 'calm',
      moodIntensity: 50,
      moodDuration: 30,
      moodTrigger: 'default',
      moodHistory: []
    };
  };

  const updateEmotionalState = (characterId: string, changes: Partial<EmotionalState>) => {
    const currentState = getCharacterEmotionalState(characterId);
    const newState = { ...currentState };

    // Apply changes with bounds checking
    Object.entries(changes).forEach(([emotion, change]) => {
      if (typeof change === 'number') {
        newState[emotion as keyof EmotionalState] = Math.max(0, Math.min(100,
          currentState[emotion as keyof EmotionalState] + change
        ));
      }
    });

    // Update character state
    actions.updateCharacterState(characterId, {
      emotionalState: newState
    });

    // Check for mood changes based on emotional state
    checkForMoodChange(characterId, newState);
  };

  const checkForMoodChange = (characterId: string, emotionalState: EmotionalState) => {
    const currentMood = getCharacterMoodState(characterId);
    let newMood = currentMood.currentMood;
    let newIntensity = currentMood.moodIntensity;
    let newTrigger = 'emotional_state_change';

    // Determine mood based on strongest emotions
    const emotions = Object.entries(emotionalState);
    const strongestEmotions = emotions
      .filter(([_, value]) => value > 60)
      .sort(([_, a], [__, b]) => b - a);

    if (strongestEmotions.length > 0) {
      const [dominantEmotion, intensity] = strongestEmotions[0];

      switch (dominantEmotion) {
        case 'happiness':
        case 'excitement':
        case 'contentment':
          newMood = intensity > 80 ? 'excited' : 'happy';
          break;
        case 'love':
        case 'longing':
          newMood = 'romantic';
          break;
        case 'sadness':
        case 'nostalgia':
          newMood = 'melancholic';
          break;
        case 'anger':
          newMood = 'angry';
          break;
        case 'fear':
        case 'worry':
          newMood = 'nervous';
          break;
        case 'embarrassment':
        case 'shyness':
          newMood = 'nervous';
          break;
        default:
          newMood = 'calm';
      }

      newIntensity = Math.min(100, intensity + 10);
    }

    // Update mood if it changed significantly
    if (newMood !== currentMood.currentMood || Math.abs(newIntensity - currentMood.moodIntensity) > 15) {
      updateMoodState(characterId, newMood, newIntensity, newTrigger);
    }
  };

  const updateMoodState = (
    characterId: string,
    mood: MoodState['currentMood'],
    intensity: number,
    trigger: string
  ) => {
    const currentMoodState = getCharacterMoodState(characterId);

    const newMoodState: MoodState = {
      currentMood: mood,
      moodIntensity: intensity,
      moodDuration: 60, // 1 hour default
      moodTrigger: trigger,
      moodHistory: [
        ...currentMoodState.moodHistory.slice(-10), // keep last 10 moods
        {
          mood: currentMoodState.currentMood,
          intensity: currentMoodState.moodIntensity,
          timestamp: Date.now(),
          trigger: currentMoodState.moodTrigger
        }
      ]
    };

    actions.updateCharacterState(characterId, {
      moodState: newMoodState
    });
  };

  const addMemory = (memory: Omit<CharacterMemory, 'id' | 'date' | 'lastRecalled' | 'recallFrequency' | 'fadeLevel'>): string => {
    const memoryId = `memory_${memory.characterId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullMemory: CharacterMemory = {
      ...memory,
      id: memoryId,
      date: Date.now(),
      lastRecalled: Date.now(),
      recallFrequency: 1,
      fadeLevel: 100
    };

    // Store memory
    const memories = player.flags[`${memory.characterId}_memories`] || [];
    actions.updatePlayer({
      flags: {
        ...player.flags,
        [`${memory.characterId}_memories`]: [...memories, fullMemory]
      }
    });

    // Apply emotional consequences
    if (memory.consequences.emotionalStateChanges) {
      updateEmotionalState(memory.characterId, memory.consequences.emotionalStateChanges);
    }

    // Update affection and trust
    if (memory.consequences.affectionChange) {
      actions.updateAffection(memory.characterId, memory.consequences.affectionChange);
    }

    if (memory.consequences.trustChange) {
      const currentState = getCharacterEmotionalState(memory.characterId);
      updateEmotionalState(memory.characterId, {
        trust: memory.consequences.trustChange
      });
    }

    return memoryId;
  };

  const getMemories = (characterId: string, type?: CharacterMemory['type']): CharacterMemory[] => {
    const memories = player.flags[`${characterId}_memories`] || [];

    if (type) {
      return memories.filter((memory: CharacterMemory) => memory.type === type);
    }

    return memories;
  };

  const getRecentMemories = (characterId: string, count: number = 5): CharacterMemory[] => {
    const memories = getMemories(characterId);
    return memories
      .sort((a: CharacterMemory, b: CharacterMemory) => b.date - a.date)
      .slice(0, count);
  };

  const getStrongestMemories = (characterId: string, count: number = 3): CharacterMemory[] => {
    const memories = getMemories(characterId);
    return memories
      .sort((a: CharacterMemory, b: CharacterMemory) => Math.abs(b.emotionalWeight) - Math.abs(a.emotionalWeight))
      .slice(0, count);
  };

  const recallMemory = (characterId: string, memoryId: string): CharacterMemory | null => {
    const memories = getMemories(characterId);
    const memory = memories.find((m: CharacterMemory) => m.id === memoryId);

    if (!memory) return null;

    // Update recall frequency and last recalled time
    const updatedMemory = {
      ...memory,
      recallFrequency: memory.recallFrequency + 1,
      lastRecalled: Date.now(),
      fadeLevel: Math.min(100, memory.fadeLevel + 5) // memories get stronger when recalled
    };

    // Update stored memory
    const updatedMemories = memories.map((m: CharacterMemory) =>
      m.id === memoryId ? updatedMemory : m
    );

    actions.updatePlayer({
      flags: {
        ...player.flags,
        [`${characterId}_memories`]: updatedMemories
      }
    });

    // Recalling memories can trigger emotional responses
    const emotionalImpact = Math.min(10, memory.emotionalWeight / 5);
    if (Math.abs(emotionalImpact) > 1) {
      const emotionalChange: Partial<EmotionalState> = {};

      if (memory.emotionalWeight > 0) {
        emotionalChange.happiness = emotionalImpact;
        emotionalChange.nostalgia = emotionalImpact / 2;
      } else {
        emotionalChange.sadness = Math.abs(emotionalImpact);
        emotionalChange.worry = Math.abs(emotionalImpact) / 2;
      }

      updateEmotionalState(characterId, emotionalChange);
    }

    return updatedMemory;
  };

  const fadeMemories = (characterId: string) => {
    const memories = getMemories(characterId);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const fadedMemories = memories.map((memory: CharacterMemory) => {
      const daysSinceLastRecall = (now - memory.lastRecalled) / oneDay;
      const fadeAmount = Math.max(0, daysSinceLastRecall * 2); // 2% fade per day
      const newFadeLevel = Math.max(10, memory.fadeLevel - fadeAmount);

      return {
        ...memory,
        fadeLevel: newFadeLevel
      };
    });

    actions.updatePlayer({
      flags: {
        ...player.flags,
        [`${characterId}_memories`]: fadedMemories
      }
    });
  };

  const analyzeMemoryPatterns = (characterId: string) => {
    const memories = getMemories(characterId);

    const patterns = {
      positiveMemories: memories.filter((m: CharacterMemory) => m.emotionalWeight > 0).length,
      negativeMemories: memories.filter((m: CharacterMemory) => m.emotionalWeight < 0).length,
      romanticMemories: memories.filter((m: CharacterMemory) => m.tags.includes('romantic')).length,
      conflictMemories: memories.filter((m: CharacterMemory) => m.type === 'conflict').length,
      overallSentiment: 0,
      dominantThemes: [] as string[]
    };

    // Calculate overall sentiment
    const totalWeight = memories.reduce((sum: number, m: CharacterMemory) => sum + m.emotionalWeight, 0);
    patterns.overallSentiment = totalWeight / Math.max(1, memories.length);

    // Find dominant themes
    const themeCounts: Record<string, number> = {};
    memories.forEach((memory: CharacterMemory) => {
      memory.tags.forEach(tag => {
        themeCounts[tag] = (themeCounts[tag] || 0) + 1;
      });
    });

    patterns.dominantThemes = Object.entries(themeCounts)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([theme, _]) => theme);

    return patterns;
  };

  const getCharacterDialogueModifier = (characterId: string): string => {
    const emotionalState = getCharacterEmotionalState(characterId);
    const moodState = getCharacterMoodState(characterId);
    const memoryPatterns = analyzeMemoryPatterns(characterId);

    // Generate dialogue modifier based on current state
    let modifier = '';

    // Mood-based modifiers
    switch (moodState.currentMood) {
      case 'happy':
        modifier += '밝고 즐거운 톤으로 ';
        break;
      case 'sad':
        modifier += '조금 우울한 톤으로 ';
        break;
      case 'romantic':
        modifier += '부드럽고 로맨틱한 톤으로 ';
        break;
      case 'nervous':
        modifier += '약간 긴장하고 어색한 톤으로 ';
        break;
      case 'excited':
        modifier += '흥분되고 활기찬 톤으로 ';
        break;
      case 'angry':
        modifier += '약간 화가 난 톤으로 ';
        break;
    }

    // Emotional state modifiers
    if (emotionalState.love > 70) {
      modifier += '사랑스러운 눈빛으로 ';
    } else if (emotionalState.shyness > 70) {
      modifier += '수줍어하며 ';
    } else if (emotionalState.trust > 80) {
      modifier += '신뢰하는 눈으로 ';
    }

    // Memory-based modifiers
    if (memoryPatterns.overallSentiment > 30) {
      modifier += '좋은 추억을 떠올리며 ';
    } else if (memoryPatterns.overallSentiment < -20) {
      modifier += '조심스럽게 ';
    }

    return modifier;
  };

  return {
    getCharacterEmotionalState,
    getCharacterMoodState,
    updateEmotionalState,
    updateMoodState,
    addMemory,
    getMemories,
    getRecentMemories,
    getStrongestMemories,
    recallMemory,
    fadeMemories,
    analyzeMemoryPatterns,
    getCharacterDialogueModifier
  };
};

// Emotional state display component
export const EmotionalStateDisplay: React.FC<{ characterId: string }> = ({ characterId }) => {
  const { getCharacterEmotionalState, getCharacterMoodState } = useCharacterMemory();

  const emotionalState = getCharacterEmotionalState(characterId);
  const moodState = getCharacterMoodState(characterId);

  const primaryEmotions = [
    { key: 'love', label: '사랑', value: emotionalState.love, color: 'text-red-600' },
    { key: 'happiness', label: '행복', value: emotionalState.happiness, color: 'text-yellow-600' },
    { key: 'trust', label: '신뢰', value: emotionalState.trust, color: 'text-blue-600' },
    { key: 'excitement', label: '흥분', value: emotionalState.excitement, color: 'text-orange-600' }
  ];

  const getMoodEmoji = (mood: string): string => {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      calm: '😌',
      nervous: '😰',
      romantic: '😍',
      melancholic: '😔',
      playful: '😄',
      serious: '😐'
    };
    return moodEmojis[mood] || '😐';
  };

  return (
    <div className="emotional-state bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-purple-800 mb-3">감정 상태</h3>

      {/* Current Mood */}
      <div className="current-mood bg-white p-3 rounded-lg shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-purple-700">현재 기분:</span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getMoodEmoji(moodState.currentMood)}</span>
            <span className="font-medium">{moodState.currentMood}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{width: `${moodState.moodIntensity}%`}}
            />
          </div>
          <span className="text-xs text-gray-600">강도: {moodState.moodIntensity}%</span>
        </div>
      </div>

      {/* Primary Emotions */}
      <div className="primary-emotions space-y-2">
        {primaryEmotions.map(emotion => (
          <div key={emotion.key} className="flex items-center justify-between">
            <span className={`font-medium ${emotion.color}`}>{emotion.label}:</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${emotion.color.replace('text-', 'bg-')}`}
                  style={{width: `${emotion.value}%`}}
                />
              </div>
              <span className="text-sm w-8 text-right">{emotion.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Memory display component
export const MemoryDisplay: React.FC<{ characterId: string }> = ({ characterId }) => {
  const { getRecentMemories, getStrongestMemories, recallMemory } = useCharacterMemory();
  const [selectedTab, setSelectedTab] = useState<'recent' | 'strongest'>('recent');

  const recentMemories = getRecentMemories(characterId, 5);
  const strongestMemories = getStrongestMemories(characterId, 3);

  const handleMemoryClick = (memoryId: string) => {
    recallMemory(characterId, memoryId);
  };

  const displayedMemories = selectedTab === 'recent' ? recentMemories : strongestMemories;

  const getMemoryTypeIcon = (type: CharacterMemory['type']): string => {
    const icons: Record<CharacterMemory['type'], string> = {
      conversation: '💬',
      gift: '🎁',
      activity: '🎯',
      date: '💕',
      confession: '💝',
      conflict: '⚡',
      milestone: '🌟'
    };
    return icons[type] || '📝';
  };

  return (
    <div className="memory-display bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-indigo-800 mb-3">추억</h3>

      {/* Tab Navigation */}
      <div className="tab-navigation flex space-x-2 mb-4">
        <button
          onClick={() => setSelectedTab('recent')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            selectedTab === 'recent'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          최근 추억
        </button>
        <button
          onClick={() => setSelectedTab('strongest')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            selectedTab === 'strongest'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          강한 추억
        </button>
      </div>

      {/* Memory List */}
      <div className="memory-list space-y-2 max-h-64 overflow-y-auto">
        {displayedMemories.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            아직 함께한 추억이 없습니다.
          </div>
        ) : (
          displayedMemories.map((memory: CharacterMemory) => (
            <div
              key={memory.id}
              onClick={() => handleMemoryClick(memory.id)}
              className="memory-item bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getMemoryTypeIcon(memory.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-indigo-800 text-sm truncate">
                    {memory.title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {memory.description}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(memory.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-medium ${
                        memory.emotionalWeight > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {memory.emotionalWeight > 0 ? '+' : ''}{memory.emotionalWeight}
                      </span>
                      <div className="w-8 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-indigo-500 h-1 rounded-full"
                          style={{width: `${memory.fadeLevel}%`}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default { useCharacterMemory, EmotionalStateDisplay, MemoryDisplay };