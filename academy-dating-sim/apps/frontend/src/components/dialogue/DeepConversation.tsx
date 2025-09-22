import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  requiredAffection: number;
  category: 'personal' | 'dreams' | 'memories' | 'philosophy' | 'feelings' | 'future';
  icon: string;
  isUnlocked: boolean;
}

interface ConversationExchange {
  speaker: 'character' | 'player' | 'both';
  characterText?: string;
  playerOptions?: {
    text: string;
    type: 'supportive' | 'curious' | 'philosophical' | 'romantic' | 'empathetic';
    affectionChange: number;
    response: string;
    unlocksTopics?: string[];
  }[];
  emotion?: string;
  backgroundMusic?: string;
  specialEffect?: string;
}

interface ConversationFlow {
  [topicId: string]: {
    title: string;
    setting: string;
    mood: string;
    exchanges: ConversationExchange[];
    conclusion: {
      text: string;
      affectionBonus: number;
      unlocksTopics?: string[];
      memoryCreated?: {
        title: string;
        description: string;
        significance: 'minor' | 'major' | 'pivotal';
      };
    };
  };
}

interface DeepConversationProps {
  characterName: string;
  characterAffection: number;
  characterPersonality: {
    openness: number;
    introversion: number;
    emotional_depth: number;
    trust_level: number;
  };
  onAffectionChange: (change: number) => void;
  onTopicUnlock: (topicIds: string[]) => void;
  onMemoryCreate: (memory: any) => void;
  unlockedTopics: string[];
}

export const DeepConversation: React.FC<DeepConversationProps> = ({
  characterName,
  characterAffection,
  characterPersonality,
  onAffectionChange,
  onTopicUnlock,
  onMemoryCreate,
  unlockedTopics = []
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [availableTopics, setAvailableTopics] = useState<ConversationTopic[]>([]);
  const [isInConversation, setIsInConversation] = useState(false);
  const [conversationMood, setConversationMood] = useState<'light' | 'serious' | 'intimate' | 'philosophical'>('light');

  // Initialize available topics based on affection and unlocked topics
  useEffect(() => {
    const baseTopics: ConversationTopic[] = [
      {
        id: 'childhood_memories',
        title: '어린 시절 추억',
        description: '어릴 때의 소중한 기억들을 나누어보세요',
        requiredAffection: 20,
        category: 'memories',
        icon: '🧸',
        isUnlocked: characterAffection >= 20
      },
      {
        id: 'future_dreams',
        title: '미래의 꿈',
        description: '앞으로의 꿈과 목표에 대해 이야기해보세요',
        requiredAffection: 30,
        category: 'dreams',
        icon: '⭐',
        isUnlocked: characterAffection >= 30
      },
      {
        id: 'deepest_fears',
        title: '내면의 두려움',
        description: '가장 깊은 두려움과 걱정들을 털어놓아보세요',
        requiredAffection: 50,
        category: 'personal',
        icon: '🌙',
        isUnlocked: characterAffection >= 50
      },
      {
        id: 'life_philosophy',
        title: '인생 철학',
        description: '삶에 대한 철학과 가치관을 공유해보세요',
        requiredAffection: 40,
        category: 'philosophy',
        icon: '📚',
        isUnlocked: characterAffection >= 40
      },
      {
        id: 'first_love',
        title: '첫사랑 이야기',
        description: '과거의 사랑과 현재의 감정에 대해 솔직하게 이야기해보세요',
        requiredAffection: 60,
        category: 'feelings',
        icon: '💕',
        isUnlocked: characterAffection >= 60
      },
      {
        id: 'perfect_day',
        title: '완벽한 하루',
        description: '함께 보내고 싶은 이상적인 하루를 상상해보세요',
        requiredAffection: 35,
        category: 'future',
        icon: '🌈',
        isUnlocked: characterAffection >= 35
      },
      {
        id: 'family_stories',
        title: '가족 이야기',
        description: '가족에 대한 특별한 기억과 관계를 나누어보세요',
        requiredAffection: 45,
        category: 'personal',
        icon: '👨‍👩‍👧‍👦',
        isUnlocked: characterAffection >= 45
      },
      {
        id: 'secret_talent',
        title: '숨겨진 재능',
        description: '아무도 모르는 특별한 재능이나 취미를 공개해보세요',
        requiredAffection: 25,
        category: 'personal',
        icon: '🎭',
        isUnlocked: characterAffection >= 25
      }
    ];

    // Add unlocked special topics
    const specialTopics = unlockedTopics.map(topicId => {
      const specialTopicData: { [key: string]: ConversationTopic } = {
        'tragic_past': {
          id: 'tragic_past',
          title: '아픈 과거',
          description: '지나간 상처와 그것을 극복한 이야기',
          requiredAffection: 70,
          category: 'personal',
          icon: '💔',
          isUnlocked: true
        },
        'future_together': {
          id: 'future_together',
          title: '함께할 미래',
          description: '두 사람이 함께 그려갈 미래에 대한 진지한 대화',
          requiredAffection: 80,
          category: 'future',
          icon: '💍',
          isUnlocked: true
        },
        'eternal_promise': {
          id: 'eternal_promise',
          title: '영원한 약속',
          description: '서로에게 하고 싶은 가장 소중한 약속',
          requiredAffection: 90,
          category: 'feelings',
          icon: '🌟',
          isUnlocked: true
        }
      };

      return specialTopicData[topicId];
    }).filter(Boolean);

    setAvailableTopics([...baseTopics, ...specialTopics]);
  }, [characterAffection, unlockedTopics]);

  // Conversation flows for each topic
  const conversationFlows: ConversationFlow = {
    childhood_memories: {
      title: '어린 시절의 소중한 기억',
      setting: '조용한 카페 한 켠, 따뜻한 차 한 잔과 함께',
      mood: 'nostalgic',
      exchanges: [
        {
          speaker: 'character',
          characterText: `어릴 때 이야기... 사실 별로 하지 않는 이야기인데. 당신이라면 들려줄 수 있을 것 같아. 가장 기억에 남는 어린 시절 추억이 뭐야? 나는... 할머니와 함께 보낸 여름 방학이 가장 그리워. 시골 할머니 댁에서 보낸 그 시간들 말이야.`,
          emotion: 'nostalgic'
        },
        {
          speaker: 'player',
          playerOptions: [
            {
              text: '할머니와의 추억이 특별했나 봐요. 어떤 일들을 함께 하셨어요?',
              type: 'curious',
              affectionChange: 5,
              response: '할머니는... 정말 특별한 분이셨어. 매일 아침 일찍 일어나서 텃밭에서 채소를 따 오시고, 그걸로 맛있는 반찬을 만들어주셨지. 나는 할머니 옆에서 작은 물뿌리개로 꽃에 물을 주는 게 일이었어. 그때는 몰랐는데, 그게 얼마나 소중한 시간이었는지...'
            },
            {
              text: '저도 그런 따뜻한 추억이 있어요. 서로의 어린 시절을 나누어봐요.',
              type: 'empathetic',
              affectionChange: 8,
              response: '정말? 당신의 어린 시절도 궁금해. 그런 따뜻한 기억들이 지금의 우리를 만든 것 같아. 어른이 되어서도 그때의 순수함을 잃지 않았으면 좋겠어.'
            },
            {
              text: '그런 추억이 있어서 지금의 당신이 이렇게 따뜻한 거군요.',
              type: 'supportive',
              affectionChange: 7,
              response: '그렇게 말해주니까... 고마워. 할머니가 항상 말씀하셨어. "마음이 따뜻한 사람이 되거라"고. 당신을 만나보니, 할머니가 말씀하신 그런 사람이 정말 존재한다는 걸 알게 됐어.'
            }
          ]
        },
        {
          speaker: 'character',
          characterText: `그런데... 할머니는 내가 중학교 때 돌아가셨어. 마지막에 병원에서 만날 때, 할머니가 내 손을 꼭 잡고 말씀하셨어. "네가 행복하면 할머니도 행복하다"고. 그때부터 나는... 진짜 행복이 뭔지 생각하게 됐어. 지금 당신과 있으면서, 할머니가 말씀하신 그 행복을 조금은 알 것 같아.`,
          emotion: 'emotional'
        }
      ],
      conclusion: {
        text: '이런 깊은 이야기를 나눌 수 있어서 정말 좋아. 당신과 함께라면 새로운 소중한 추억들을 많이 만들 수 있을 것 같아.',
        affectionBonus: 10,
        unlocksTopics: ['family_stories'],
        memoryCreated: {
          title: '할머니와의 추억 이야기',
          description: `${characterName}의 소중한 어린 시절 추억을 들었다. 할머니와의 따뜻한 기억들이 지금의 그들을 만들었다는 것을 알게 되었다.`,
          significance: 'major'
        }
      }
    },

    future_dreams: {
      title: '꿈꾸는 미래의 모습',
      setting: '학교 옥상, 별이 쏟아지는 밤하늘 아래',
      mood: 'hopeful',
      exchanges: [
        {
          speaker: 'character',
          characterText: `별을 보고 있으니까 문득 생각이 나네. 어릴 때는 별을 보며 무엇이든 될 수 있을 것 같았는데... 지금은 현실적인 걱정들이 더 많아졌어. 그래도 여전히 꿈은 있어. 5년 후, 10년 후... 내가 어떤 모습일지 상상해볼 때가 있거든.`,
          emotion: 'thoughtful'
        },
        {
          speaker: 'player',
          playerOptions: [
            {
              text: '어떤 꿈을 꾸고 계세요? 들려주세요.',
              type: 'curious',
              affectionChange: 6,
              response: '나는... 사람들에게 도움이 되는 일을 하고 싶어. 구체적으로는 아직 정하지 못했지만, 누군가의 상처를 치유해주거나, 희망을 줄 수 있는 그런 일 말이야. 그리고... 소중한 사람과 함께 평범하지만 행복한 일상을 보내고 싶어.'
            },
            {
              text: '현실적인 걱정이 많으시겠지만, 꿈을 포기하지 마세요.',
              type: 'supportive',
              affectionChange: 8,
              response: '고마워... 가끔 현실의 벽 앞에서 좌절할 때가 있는데, 이렇게 응원해주는 사람이 있다는 게 큰 힘이 돼. 당신도 나를 위해 꿈을 응원해주는 사람이 되어줄래?'
            },
            {
              text: '저도 함께 그 꿈을 이뤄나가고 싶어요.',
              type: 'romantic',
              affectionChange: 12,
              response: '정말... 정말 그렇게 말해줄 거야? 혼자서는 불가능해 보였던 일들도 당신과 함께라면 할 수 있을 것 같아. 우리의 미래를 함께 그려나가자.',
              unlocksTopics: ['future_together']
            }
          ]
        },
        {
          speaker: 'character',
          characterText: `사실... 가장 큰 꿈은 이거야. 매일 아침 일어나서 "오늘도 행복한 하루가 될 것 같다"고 생각할 수 있는 삶. 거창한 성공이나 명예가 아니라, 평범한 일상 속에서 진짜 행복을 찾는 것. 그리고 그 행복을 사랑하는 사람과 나누는 것... 당신과 함께라면 그런 꿈이 현실이 될 수 있을까?`,
          emotion: 'hopeful'
        }
      ],
      conclusion: {
        text: '당신과 이야기하니까 꿈이 더 선명해지는 것 같아. 함께 노력하면 분명 이룰 수 있을 거야.',
        affectionBonus: 8,
        unlocksTopics: ['perfect_day'],
        memoryCreated: {
          title: '별 아래 나눈 꿈 이야기',
          description: `밤하늘 아래서 ${characterName}와 미래의 꿈에 대해 깊이 있는 대화를 나누었다. 그들의 진정한 바람을 알게 되었다.`,
          significance: 'major'
        }
      }
    },

    deepest_fears: {
      title: '마음 깊은 곳의 두려움',
      setting: '조용한 방, 촛불 하나만 켜진 은밀한 분위기',
      mood: 'intimate',
      exchanges: [
        {
          speaker: 'character',
          characterText: `이런 이야기... 아무에게나 하지 않아. 하지만 당신이라면... 들어줄 수 있을 것 같아. 사실 나에게는 깊은 두려움이 있어. 겉으로는 괜찮은 척하지만, 밤에 혼자 있을 때면 그 두려움이 몰려와. 혹시... 들어도 될까?`,
          emotion: 'vulnerable'
        },
        {
          speaker: 'player',
          playerOptions: [
            {
              text: '물론이에요. 어떤 이야기든 들어드릴게요.',
              type: 'supportive',
              affectionChange: 10,
              response: '고마워... 정말 고마워. 나는... 버림받는 게 제일 무서워. 어릴 때부터 그랬어. 내가 실수하면, 내가 부족하면 사람들이 떠나갈까 봐. 그래서 항상 완벽해야 한다는 강박이 있었어.'
            },
            {
              text: '힘들었겠어요. 혼자 그 무게를 감당하느라...',
              type: 'empathetic',
              affectionChange: 12,
              response: '어떻게... 어떻게 그걸 알아줄 수 있지? 정말 힘들었어. 누구에게도 말할 수 없었던 무게를... 당신이 이해해준다니 믿기지 않아.'
            },
            {
              text: '당신은 이미 충분히 소중한 존재예요.',
              type: 'romantic',
              affectionChange: 15,
              response: '그런 말을... 그렇게 확신에 차서 말해줄 수 있는 거야? 나도... 나도 그렇게 믿고 싶어. 당신과 있으면 그런 두려움이 조금씩 사라지는 것 같아.',
              unlocksTopics: ['eternal_promise']
            }
          ]
        },
        {
          speaker: 'character',
          characterText: `가장 무서운 건... 당신마저 나를 떠날까 봐 하는 생각이야. 이렇게 솔직한 내 모습을 보고 실망할까 봐. 완벽하지 않은 나를 받아들일 수 있을까 하는 두려움. 하지만 더 이상 가면을 쓰고 있고 싶지 않아. 진짜 나를 보여주고 싶어.`,
          emotion: 'desperate'
        }
      ],
      conclusion: {
        text: '이런 깊은 얘기를 들어줘서 고마워. 당신과 있으면 두려움보다 용기가 더 커지는 것 같아.',
        affectionBonus: 15,
        unlocksTopics: ['tragic_past'],
        memoryCreated: {
          title: '가장 깊은 두려움을 나눈 밤',
          description: `${characterName}가 가장 깊숙한 두려움을 털어놓았다. 그들의 진정한 모습을 받아들였고, 더 깊은 신뢰를 쌓았다.`,
          significance: 'pivotal'
        }
      }
    }
  };

  const handleTopicSelect = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentExchangeIndex(0);
    setIsInConversation(true);
    setConversationHistory([]);

    // Set mood based on topic
    const topic = availableTopics.find(t => t.id === topicId);
    if (topic) {
      switch (topic.category) {
        case 'personal':
          setConversationMood('intimate');
          break;
        case 'philosophy':
          setConversationMood('philosophical');
          break;
        case 'memories':
          setConversationMood('light');
          break;
        default:
          setConversationMood('serious');
      }
    }
  }, [availableTopics]);

  const handlePlayerChoice = useCallback((choice: any) => {
    // Add player choice to history
    setConversationHistory(prev => [...prev, {
      speaker: 'player',
      text: choice.text,
      type: choice.type
    }]);

    // Add character response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'character',
      text: choice.response,
      affectionChange: choice.affectionChange
    }]);

    // Update affection
    onAffectionChange(choice.affectionChange);

    // Unlock new topics if applicable
    if (choice.unlocksTopics) {
      onTopicUnlock(choice.unlocksTopics);
    }

    // Advance to next exchange
    setCurrentExchangeIndex(prev => prev + 1);
  }, [onAffectionChange, onTopicUnlock]);

  const handleConversationComplete = useCallback(() => {
    if (selectedTopic && conversationFlows[selectedTopic]) {
      const conclusion = conversationFlows[selectedTopic].conclusion;

      // Apply conclusion effects
      onAffectionChange(conclusion.affectionBonus);

      if (conclusion.unlocksTopics) {
        onTopicUnlock(conclusion.unlocksTopics);
      }

      if (conclusion.memoryCreated) {
        onMemoryCreate(conclusion.memoryCreated);
      }

      // Add conclusion to history
      setConversationHistory(prev => [...prev, {
        speaker: 'conclusion',
        text: conclusion.text
      }]);
    }

    setIsInConversation(false);
    setSelectedTopic(null);
  }, [selectedTopic, onAffectionChange, onTopicUnlock, onMemoryCreate]);

  return (
    <div className="deep-conversation">
      <AnimatePresence>
        {!isInConversation ? (
          <motion.div
            className="topic-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="conversation-header">
              <h2>💫 깊은 대화</h2>
              <p>마음을 열고 진솔한 이야기를 나누어보세요</p>
            </div>

            <div className="topics-grid">
              {availableTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className={`topic-card ${!topic.isUnlocked ? 'locked' : ''} ${topic.category}`}
                  whileHover={topic.isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={topic.isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => topic.isUnlocked && handleTopicSelect(topic.id)}
                >
                  <div className="topic-icon">{topic.icon}</div>
                  <div className="topic-info">
                    <h3>{topic.title}</h3>
                    <p>{topic.description}</p>
                    {!topic.isUnlocked && (
                      <div className="unlock-requirement">
                        호감도 {topic.requiredAffection} 필요
                      </div>
                    )}
                  </div>
                  <div className={`topic-category ${topic.category}`}>
                    {getCategoryName(topic.category)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="conversation-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedTopic && conversationFlows[selectedTopic] && (
              <ConversationRenderer
                flow={conversationFlows[selectedTopic]}
                currentExchangeIndex={currentExchangeIndex}
                characterName={characterName}
                onPlayerChoice={handlePlayerChoice}
                onComplete={handleConversationComplete}
                conversationHistory={conversationHistory}
                mood={conversationMood}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .deep-conversation {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Noto Sans KR', sans-serif;
        }

        .conversation-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .conversation-header h2 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .conversation-header p {
          color: #7f8c8d;
          font-size: 14px;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .topic-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .topic-card:not(.locked):hover {
          border-color: #3498db;
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
        }

        .topic-card.locked {
          opacity: 0.6;
          background: linear-gradient(145deg, #f7f7f7, #ececec);
          cursor: not-allowed;
        }

        .topic-card.personal {
          border-left: 5px solid #e74c3c;
        }

        .topic-card.dreams {
          border-left: 5px solid #f39c12;
        }

        .topic-card.memories {
          border-left: 5px solid #9b59b6;
        }

        .topic-card.philosophy {
          border-left: 5px solid #34495e;
        }

        .topic-card.feelings {
          border-left: 5px solid #e91e63;
        }

        .topic-card.future {
          border-left: 5px solid #00bcd4;
        }

        .topic-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .topic-info h3 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 18px;
        }

        .topic-info p {
          color: #7f8c8d;
          font-size: 14px;
          line-height: 1.6;
        }

        .unlock-requirement {
          background: #ffeaa7;
          color: #d63031;
          padding: 5px 10px;
          border-radius: 10px;
          font-size: 12px;
          margin-top: 10px;
          display: inline-block;
        }

        .topic-category {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 5px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: bold;
          color: white;
        }

        .topic-category.personal { background: #e74c3c; }
        .topic-category.dreams { background: #f39c12; }
        .topic-category.memories { background: #9b59b6; }
        .topic-category.philosophy { background: #34495e; }
        .topic-category.feelings { background: #e91e63; }
        .topic-category.future { background: #00bcd4; }

        @media (max-width: 768px) {
          .topics-grid {
            grid-template-columns: 1fr;
          }

          .topic-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

const ConversationRenderer: React.FC<{
  flow: any;
  currentExchangeIndex: number;
  characterName: string;
  onPlayerChoice: (choice: any) => void;
  onComplete: () => void;
  conversationHistory: any[];
  mood: string;
}> = ({ flow, currentExchangeIndex, characterName, onPlayerChoice, onComplete, conversationHistory, mood }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (currentExchangeIndex < flow.exchanges.length) {
      const exchange = flow.exchanges[currentExchangeIndex];
      if (exchange.speaker === 'character') {
        setIsTyping(true);
        typeText(exchange.characterText || '', () => setIsTyping(false));
      }
    } else {
      onComplete();
    }
  }, [currentExchangeIndex, flow.exchanges, onComplete]);

  const typeText = useCallback((text: string, callback: () => void) => {
    setCurrentText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setCurrentText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        callback();
      }
    }, 50);
  }, []);

  const currentExchange = flow.exchanges[currentExchangeIndex];

  return (
    <div className={`conversation-renderer mood-${mood}`}>
      <div className="conversation-setting">
        <p>{flow.setting}</p>
      </div>

      <div className="current-exchange">
        {currentExchange?.speaker === 'character' && (
          <div className="character-message">
            <div className="speaker-name">{characterName}</div>
            <div className="message-text">
              {currentText}
              {isTyping && <span className="cursor">▌</span>}
            </div>
          </div>
        )}

        {currentExchange?.speaker === 'player' && !isTyping && (
          <div className="player-choices">
            <div className="choices-prompt">어떻게 대답하시겠어요?</div>
            {currentExchange.playerOptions?.map((option, index) => (
              <motion.button
                key={index}
                className={`choice-option ${option.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onPlayerChoice(option)}
              >
                <span className="choice-text">{option.text}</span>
                <span className={`choice-type ${option.type}`}>
                  {getChoiceTypeLabel(option.type)}
                </span>
                <span className="affection-indicator">
                  {option.affectionChange > 0 ? '+' : ''}{option.affectionChange}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .conversation-renderer {
          max-width: 700px;
          margin: 0 auto;
          padding: 30px;
          border-radius: 20px;
          min-height: 400px;
        }

        .mood-light {
          background: linear-gradient(145deg, #fff5f5, #fffaf0);
        }

        .mood-serious {
          background: linear-gradient(145deg, #f8fafc, #edf2f7);
        }

        .mood-intimate {
          background: linear-gradient(145deg, #fdf2f8, #f3e8ff);
        }

        .mood-philosophical {
          background: linear-gradient(145deg, #f7fafc, #edf2f7);
        }

        .conversation-setting {
          text-align: center;
          font-style: italic;
          color: #6b7280;
          margin-bottom: 30px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
        }

        .character-message {
          margin-bottom: 30px;
        }

        .speaker-name {
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
        }

        .message-text {
          background: white;
          padding: 20px;
          border-radius: 15px;
          border-left: 4px solid #3b82f6;
          line-height: 1.8;
          font-size: 16px;
          color: #1f2937;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .cursor {
          color: #3b82f6;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .choices-prompt {
          text-align: center;
          color: #6b7280;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .choice-option {
          display: block;
          width: 100%;
          text-align: left;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .choice-option:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .choice-text {
          display: block;
          color: #1f2937;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .choice-type {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
          color: white;
          font-weight: bold;
        }

        .choice-type.supportive { background: #10b981; }
        .choice-type.curious { background: #f59e0b; }
        .choice-type.philosophical { background: #6366f1; }
        .choice-type.romantic { background: #ec4899; }
        .choice-type.empathetic { background: #8b5cf6; }

        .affection-indicator {
          position: absolute;
          top: 10px;
          right: 15px;
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

function getCategoryName(category: string): string {
  const categoryNames: { [key: string]: string } = {
    personal: '개인적',
    dreams: '꿈과 목표',
    memories: '추억',
    philosophy: '철학',
    feelings: '감정',
    future: '미래'
  };
  return categoryNames[category] || category;
}

function getChoiceTypeLabel(type: string): string {
  const typeLabels: { [key: string]: string } = {
    supportive: '지지적',
    curious: '호기심',
    philosophical: '철학적',
    romantic: '로맨틱',
    empathetic: '공감적'
  };
  return typeLabels[type] || type;
}

export default DeepConversation;