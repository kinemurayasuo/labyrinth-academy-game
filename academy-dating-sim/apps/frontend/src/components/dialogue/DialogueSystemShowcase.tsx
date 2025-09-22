import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExtendedDialogue from './ExtendedDialogue';
import DeepConversation from './DeepConversation';

interface DialogueSystemShowcaseProps {
  onFeatureSelect?: (feature: string) => void;
}

export const DialogueSystemShowcase: React.FC<DialogueSystemShowcaseProps> = ({
  onFeatureSelect
}) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<'sakura' | 'yuki' | 'luna'>('sakura');

  const features = [
    {
      id: 'extended_dialogue',
      title: '확장된 대화 시스템',
      description: '기존 1-2문장에서 3-5문단으로 확장된 풍부한 대화',
      icon: '💬',
      highlights: [
        '자동 타이핑 효과로 몰입감 증대',
        '캐릭터 표정 변화 및 애니메이션',
        '대화 기록 시스템',
        '감정 상태 표시',
        '선택지별 호감도 변화 미리보기'
      ]
    },
    {
      id: 'conversation_templates',
      title: '상황별 대화 템플릿',
      description: '다양한 상황에 맞는 자연스러운 대화 패턴',
      icon: '📝',
      highlights: [
        '아침 인사 (5+ 교환)',
        '점심 대화 (8+ 교환)',
        '공부 세션 (10+ 교환)',
        '데이트 대화 (15+ 교환)',
        '고백 장면 (20+ 교환)',
        '갈등 해결 (12+ 교환)'
      ]
    },
    {
      id: 'deep_conversation',
      title: '깊은 대화 시스템',
      description: '주제별 심화 대화로 캐릭터와의 깊은 유대감 형성',
      icon: '💫',
      highlights: [
        '8가지 대화 주제 (추억, 꿈, 철학 등)',
        '호감도별 잠금 해제',
        '선택 유형별 반응 (지지적, 호기심, 로맨틱 등)',
        '기억 생성 및 관계 발전',
        '캐릭터별 특별 주제 해금'
      ]
    },
    {
      id: 'enhanced_stories',
      title: '확장된 스토리 이벤트',
      description: '기존 짧은 이벤트를 15-30분 길이의 서사로 확장',
      icon: '📚',
      highlights: [
        '다단계 내러티브 구조',
        '감정적 클라이맥스',
        '캐릭터별 특수 이벤트',
        '선택에 따른 다중 엔딩',
        '기억 생성 및 관계 변화',
        '특별 장면 및 효과'
      ]
    },
    {
      id: 'character_styles',
      title: '캐릭터별 대화 스타일',
      description: '각 캐릭터만의 독특한 말투와 성격 반영',
      icon: '🎭',
      highlights: [
        '사쿠라: 직설적이지만 내면 연약',
        '유키: 분석적이면서 순수한',
        '루나: 고풍스럽고 신비로운',
        '감정 상태별 말투 변화',
        '관계 발전에 따른 언어 변화',
        '상황별 어조 조절'
      ]
    }
  ];

  const characterData = {
    sakura: {
      name: '키리시마 사쿠라',
      image: '/images/characters/sakura.png',
      personalityData: {
        openness: 0.6,
        introversion: 0.4,
        emotional_depth: 0.8,
        trust_level: 0.7
      },
      sampleDialogue: {
        lines: [
          {
            speaker: 'character',
            text: '오늘 아침 훈련은 정말 힘들었어. 새로운 검술을 익히려고 하는데 쉽지 않네.',
            emotion: 'thoughtful'
          },
          {
            speaker: 'character',
            text: '그런데... 너와 함께 연습하니까 힘든 줄도 모르겠어. 신기해.',
            emotion: 'shy'
          }
        ],
        choices: [
          {
            text: '함께라서 나도 더 힘이 나는 것 같아.',
            affectionChange: 8,
            response: '정말? 나만 그런 게 아니었구나... 다행이야.'
          },
          {
            text: '새로운 검술이라니, 어떤 건데?',
            affectionChange: 5,
            response: '아, 그건... 우리 가문의 비전 중 하나야. 언젠가 보여줄게.'
          }
        ]
      }
    },
    yuki: {
      name: '유키노시타 유키',
      image: '/images/characters/yuki.png',
      personalityData: {
        openness: 0.8,
        introversion: 0.3,
        emotional_depth: 0.6,
        trust_level: 0.5
      },
      sampleDialogue: {
        lines: [
          {
            speaker: 'character',
            text: '오늘 마법 실험이 정말 잘 됐어요! 새로운 얼음 마법을 만들어냈거든요.',
            emotion: 'excited'
          },
          {
            speaker: 'character',
            text: '당신이 옆에서 응원해주니까 집중도 더 잘 되고... 정말 고마워요.',
            emotion: 'grateful'
          }
        ],
        choices: [
          {
            text: '당신의 마법은 정말 아름다워요.',
            affectionChange: 10,
            response: '아름답다고요? 그런 말 처음 들어봐요... 기뻐요!'
          },
          {
            text: '새로운 마법을 보여줄 수 있어요?',
            affectionChange: 7,
            response: '물론이죠! 특별히 당신에게만 보여드릴게요.'
          }
        ]
      }
    },
    luna: {
      name: '루나 크림슨',
      image: '/images/characters/luna.png',
      personalityData: {
        openness: 0.7,
        introversion: 0.8,
        emotional_depth: 0.9,
        trust_level: 0.4
      },
      sampleDialogue: {
        lines: [
          {
            speaker: 'character',
            text: '500년을 살아오며 수많은 인간들을 봤지만... 너는 정말 특별해.',
            emotion: 'mysterious'
          },
          {
            speaker: 'character',
            text: '이런 감정을 느끼는 것도 오랜만이야. 네가 내 마음에 무슨 마법을 건 건 아니겠지?',
            emotion: 'playful'
          }
        ],
        choices: [
          {
            text: '당신도 저에게는 특별한 존재예요.',
            affectionChange: 12,
            response: '그런 말을... 진심인가? 500년 만에 느끼는 이 떨림은 뭘까.'
          },
          {
            text: '500년의 이야기가 궁금해요.',
            affectionChange: 6,
            response: '긴 이야기지. 언젠가... 모든 걸 들려줄게.'
          }
        ]
      }
    }
  };

  const renderFeatureDemo = (featureId: string) => {
    switch (featureId) {
      case 'extended_dialogue':
        return (
          <ExtendedDialogue
            characterName={characterData[selectedCharacter].name}
            characterImage={characterData[selectedCharacter].image}
            dialogueLines={characterData[selectedCharacter].sampleDialogue.lines}
            choices={characterData[selectedCharacter].sampleDialogue.choices}
            onChoiceSelect={(choice) => console.log('Choice selected:', choice)}
            autoAdvance={false}
            typingSpeed={30}
            showHistory={true}
          />
        );

      case 'deep_conversation':
        return (
          <DeepConversation
            characterName={characterData[selectedCharacter].name}
            characterAffection={50}
            characterPersonality={characterData[selectedCharacter].personalityData}
            onAffectionChange={(change) => console.log('Affection change:', change)}
            onTopicUnlock={(topics) => console.log('Topics unlocked:', topics)}
            onMemoryCreate={(memory) => console.log('Memory created:', memory)}
            unlockedTopics={['childhood_memories', 'future_dreams']}
          />
        );

      default:
        return (
          <div className="demo-placeholder">
            <h3>{features.find(f => f.id === featureId)?.title}</h3>
            <p>이 기능의 데모는 곧 준비될 예정입니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="dialogue-showcase">
      <div className="showcase-header">
        <h1>🎭 확장된 대화 시스템 쇼케이스</h1>
        <p>Academy Dating Sim의 혁신적인 대화 시스템을 체험해보세요</p>
      </div>

      {!activeDemo && (
        <motion.div
          className="features-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => {
                setActiveDemo(feature.id);
                onFeatureSelect?.(feature.id);
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul className="feature-highlights">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
              <button className="demo-button">
                데모 체험하기 →
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {activeDemo && (
          <motion.div
            className="demo-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="demo-header">
              <button
                className="back-button"
                onClick={() => setActiveDemo(null)}
              >
                ← 돌아가기
              </button>

              <div className="character-selector">
                <label>캐릭터 선택:</label>
                {Object.entries(characterData).map(([key, char]) => (
                  <button
                    key={key}
                    className={`character-btn ${selectedCharacter === key ? 'active' : ''}`}
                    onClick={() => setSelectedCharacter(key as any)}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="demo-content">
              {renderFeatureDemo(activeDemo)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="showcase-footer">
        <h2>🌟 주요 개선사항</h2>
        <div className="improvements-grid">
          <div className="improvement-card">
            <h3>📏 길이 확장</h3>
            <p>기존 1-2문장 → 3-5문단의 풍부한 대화</p>
          </div>
          <div className="improvement-card">
            <h3>🎬 몰입감</h3>
            <p>타이핑 효과, 애니메이션, 표정 변화</p>
          </div>
          <div className="improvement-card">
            <h3>🧠 지능형</h3>
            <p>상황별 적응, 관계 발전 반영</p>
          </div>
          <div className="improvement-card">
            <h3>💎 개성</h3>
            <p>캐릭터별 고유한 말투와 반응</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dialogue-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Noto Sans KR', sans-serif;
        }

        .showcase-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .showcase-header h1 {
          font-size: 2.5em;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .showcase-header p {
          font-size: 1.2em;
          color: #7f8c8d;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }

        .feature-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card:hover {
          border-color: #3498db;
          box-shadow: 0 10px 30px rgba(52, 152, 219, 0.2);
        }

        .feature-icon {
          font-size: 3em;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 1.4em;
        }

        .feature-card p {
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .feature-highlights {
          text-align: left;
          margin-bottom: 25px;
          padding-left: 0;
          list-style: none;
        }

        .feature-highlights li {
          color: #34495e;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .feature-highlights li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #27ae60;
          font-weight: bold;
        }

        .demo-button {
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 25px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .demo-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }

        .demo-container {
          background: #f8fafc;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 50px;
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .back-button {
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #5a6268;
        }

        .character-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .character-selector label {
          font-weight: bold;
          color: #2c3e50;
        }

        .character-btn {
          background: #e9ecef;
          border: 2px solid #dee2e6;
          border-radius: 15px;
          padding: 8px 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .character-btn:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .character-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .demo-content {
          background: white;
          border-radius: 15px;
          padding: 20px;
          min-height: 400px;
        }

        .demo-placeholder {
          text-align: center;
          padding: 50px;
          color: #6c757d;
        }

        .showcase-footer {
          text-align: center;
          margin-top: 50px;
        }

        .showcase-footer h2 {
          color: #2c3e50;
          margin-bottom: 30px;
        }

        .improvements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .improvement-card {
          background: linear-gradient(145deg, #ffffff, #f1f3f4);
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 25px;
          text-align: center;
        }

        .improvement-card h3 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .improvement-card p {
          color: #7f8c8d;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }

          .demo-header {
            flex-direction: column;
            align-items: stretch;
          }

          .character-selector {
            justify-content: center;
          }

          .improvements-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DialogueSystemShowcase;