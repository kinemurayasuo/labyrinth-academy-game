import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface StoryEvent {
  id: string;
  requiredAffection: number;
  title: string;
  description: string;
  dialogue: string[];
  choices?: {
    text: string;
    affectionChange: number;
    response: string;
  }[];
  rewards?: {
    exp?: number;
    gold?: number;
    items?: string[];
  };
  completed?: boolean;
}

interface HeroineStory {
  heroineId: string;
  name: string;
  sprite: string;
  currentChapter: number;
  chapters: {
    id: number;
    title: string;
    requiredAffection: number;
    events: StoryEvent[];
  }[];
}

const HeroineStorylines: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const updateAffection = useGameStore((state: any) => state.actions.updateAffection);
  const addExperience = useGameStore((state: any) => state.actions.addExperience);
  const addGold = useGameStore((state: any) => state.actions.addGold);

  const [selectedHeroine, setSelectedHeroine] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<StoryEvent | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [completedEvents, setCompletedEvents] = useState<Record<string, string[]>>({});
  const [showEventComplete, setShowEventComplete] = useState(false);

  // Define storylines for each heroine
  const heroineStories: HeroineStory[] = [
    {
      heroineId: 'sakura',
      name: '사쿠라',
      sprite: '🗡️',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '첫 만남',
          requiredAffection: 0,
          events: [
            {
              id: 'sakura-1-1',
              requiredAffection: 0,
              title: '검술부의 에이스',
              description: '처음으로 사쿠라를 만나다',
              dialogue: [
                '(검술부 도장에서 혼자 연습 중인 사쿠라를 발견한다)',
                '사쿠라: "...누구지? 도장에 허락 없이 들어오다니."',
                '당신: "아, 미안. 구경하다가..."',
                '사쿠라: "흥, 검술에 관심이 있는 건가?"'
              ],
              choices: [
                {
                  text: '검술을 배우고 싶어',
                  affectionChange: 5,
                  response: '사쿠라: "진심이라면... 가르쳐줄 수도 있지."'
                },
                {
                  text: '그냥 지나가다가',
                  affectionChange: 0,
                  response: '사쿠라: "그래... 방해하지 말고 가라."'
                }
              ],
              rewards: { exp: 10 }
            },
            {
              id: 'sakura-1-2',
              requiredAffection: 10,
              title: '첫 훈련',
              description: '사쿠라와 함께 검술 훈련을 시작하다',
              dialogue: [
                '사쿠라: "자, 기본 자세부터 시작하자."',
                '(사쿠라가 당신의 자세를 교정해준다)',
                '사쿠라: "생각보다 센스가 있네..."',
                '당신: "정말? 고마워!"',
                '사쿠라: "...칭찬한 게 아니야. 아직 멀었어."'
              ],
              rewards: { exp: 15, gold: 50 }
            }
          ]
        },
        {
          id: 2,
          title: '깊어지는 인연',
          requiredAffection: 30,
          events: [
            {
              id: 'sakura-2-1',
              requiredAffection: 30,
              title: '사쿠라의 비밀',
              description: '사쿠라가 검술을 하는 진짜 이유를 알게 되다',
              dialogue: [
                '사쿠라: "너... 왜 그렇게 열심히 하는 거야?"',
                '당신: "너와 더 가까워지고 싶어서."',
                '사쿠라: "...!"',
                '(사쿠라의 얼굴이 붉어진다)',
                '사쿠라: "사실... 나도 검술을 하는 이유가 있어."',
                '사쿠라: "누군가를 지키고 싶어서야..."'
              ],
              choices: [
                {
                  text: '내가 너를 지켜줄게',
                  affectionChange: 10,
                  response: '사쿠라: "바보... 하지만 고마워."'
                },
                {
                  text: '함께 강해지자',
                  affectionChange: 8,
                  response: '사쿠라: "...그래. 함께라면 할 수 있을 거야."'
                }
              ],
              rewards: { exp: 25, gold: 100 }
            }
          ]
        },
        {
          id: 3,
          title: '진실된 마음',
          requiredAffection: 60,
          events: [
            {
              id: 'sakura-3-1',
              requiredAffection: 60,
              title: '고백',
              description: '서로의 마음을 확인하다',
              dialogue: [
                '(벚꽃이 흩날리는 교정에서)',
                '사쿠라: "있잖아... 할 말이 있어."',
                '사쿠라: "처음엔 그저 성가신 녀석이라고 생각했는데..."',
                '사쿠라: "이제는... 네가 없으면 안 될 것 같아."',
                '사쿠라: "나... 널 좋아해."'
              ],
              choices: [
                {
                  text: '나도 사랑해',
                  affectionChange: 20,
                  response: '사쿠라: "정말? 나... 정말 행복해!"'
                },
                {
                  text: '(키스한다)',
                  affectionChange: 25,
                  response: '사쿠라: "...! (얼굴이 새빨개진다)"'
                }
              ],
              rewards: { exp: 50, gold: 200 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'yuki',
      name: '유키',
      sprite: '📚',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '도서관의 만남',
          requiredAffection: 0,
          events: [
            {
              id: 'yuki-1-1',
              requiredAffection: 0,
              title: '조용한 도서관',
              description: '도서관에서 유키를 처음 만나다',
              dialogue: [
                '(도서관에서 책을 읽고 있는 소녀를 발견한다)',
                '유키: "아... 안녕하세요..."',
                '(수줍게 인사하는 유키)',
                '당신: "뭘 읽고 있어?"',
                '유키: "고대 마법에 관한 책이에요... 관심 있으세요?"'
              ],
              choices: [
                {
                  text: '흥미로워 보이네',
                  affectionChange: 5,
                  response: '유키: "정말요? 같이 읽어볼래요?"'
                },
                {
                  text: '어려워 보이는데',
                  affectionChange: 2,
                  response: '유키: "처음엔 다 그래요... 천천히 배우면 돼요."'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        },
        {
          id: 2,
          title: '책 속의 세계',
          requiredAffection: 25,
          events: [
            {
              id: 'yuki-2-1',
              requiredAffection: 25,
              title: '특별한 책',
              description: '유키가 좋아하는 특별한 책을 보여주다',
              dialogue: [
                '유키: "이 책... 보여드리고 싶었어요."',
                '(낡고 오래된 책을 조심스럽게 꺼낸다)',
                '유키: "어렸을 때부터 가장 좋아하던 책이에요."',
                '유키: "이 책을 읽으면서... 외로움을 달랬거든요."',
                '유키: "이제는 당신과 함께 읽고 싶어요."'
              ],
              choices: [
                {
                  text: '영광이야',
                  affectionChange: 8,
                  response: '유키: "정말 기뻐요... 함께 읽어요."'
                },
                {
                  text: '더 이상 외롭지 않을 거야',
                  affectionChange: 12,
                  response: '유키: "...고마워요. 정말 고마워요."'
                }
              ],
              rewards: { exp: 20, gold: 80 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'luna',
      name: '루나',
      sprite: '✨',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '마법의 시작',
          requiredAffection: 0,
          events: [
            {
              id: 'luna-1-1',
              requiredAffection: 0,
              title: '빛나는 마법',
              description: '마법학부 수석 루나를 만나다',
              dialogue: [
                '(마법 연습장에서 화려한 마법을 선보이는 루나)',
                '루나: "오! 새로운 친구네? 안녕!"',
                '당신: "와... 대단한 마법이야!"',
                '루나: "헤헤, 이건 아무것도 아니야!"',
                '루나: "너도 마법을 배우고 싶어?"'
              ],
              choices: [
                {
                  text: '가르쳐줄래?',
                  affectionChange: 5,
                  response: '루나: "당연하지! 재미있을 거야!"'
                },
                {
                  text: '난 마법 재능이 없어',
                  affectionChange: 3,
                  response: '루나: "누구나 마법을 할 수 있어! 믿어봐!"'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'haruka',
      name: '하루카',
      sprite: '🌻',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '밝은 미소',
          requiredAffection: 0,
          events: [
            {
              id: 'haruka-1-1',
              requiredAffection: 0,
              title: '해바라기 같은 소녀',
              description: '활발한 하루카와의 첫 만남',
              dialogue: [
                '(복도에서 밝게 웃으며 다가오는 소녀)',
                '하루카: "안녕! 새로운 학생이지?"',
                '하루카: "나는 하루카! 잘 부탁해!"',
                '당신: "응, 나는..."',
                '하루카: "학교 안내해줄까? 재미있는 곳 많아!"'
              ],
              choices: [
                {
                  text: '고마워, 부탁할게!',
                  affectionChange: 5,
                  response: '하루카: "좋아! 가자가자!"'
                },
                {
                  text: '혼자 둘러볼게',
                  affectionChange: 1,
                  response: '하루카: "그래도 도움이 필요하면 언제든 불러!"'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'miku',
      name: '미쿠',
      sprite: '🎵',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '노래하는 천사',
          requiredAffection: 0,
          events: [
            {
              id: 'miku-1-1',
              requiredAffection: 0,
              title: '음악실의 목소리',
              description: '아름다운 목소리의 주인공을 만나다',
              dialogue: [
                '(음악실에서 들려오는 아름다운 노랫소리)',
                '(조용히 들어가니 한 소녀가 노래하고 있다)',
                '미쿠: "어머! 누군가 듣고 있었어?"',
                '당신: "미안, 너무 아름다워서..."',
                '미쿠: "고마워... 부끄럽네."'
              ],
              choices: [
                {
                  text: '더 들려줄래?',
                  affectionChange: 5,
                  response: '미쿠: "정말? 좋아! 특별히 불러줄게!"'
                },
                {
                  text: '방해해서 미안',
                  affectionChange: 2,
                  response: '미쿠: "괜찮아. 누군가 들어주니 기뻐."'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'rina',
      name: '리나',
      sprite: '⚔️',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '전사의 혼',
          requiredAffection: 0,
          events: [
            {
              id: 'rina-1-1',
              requiredAffection: 0,
              title: '훈련장의 전사',
              description: '열정적인 리나를 만나다',
              dialogue: [
                '(훈련장에서 격렬하게 훈련 중인 소녀)',
                '리나: "하! 얍! 후..."',
                '당신: "대단한 실력이네!"',
                '리나: "오! 구경하고 있었어? 나는 리나!"',
                '리나: "매일 훈련하지 않으면 약해져!"'
              ],
              choices: [
                {
                  text: '나도 강해지고 싶어',
                  affectionChange: 6,
                  response: '리나: "좋은 마음가짐이야! 함께 훈련하자!"'
                },
                {
                  text: '힘들어 보이는데',
                  affectionChange: 2,
                  response: '리나: "힘든 만큼 강해지는 거야!"'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        }
      ]
    },
    {
      heroineId: 'ayumi',
      name: '아유미',
      sprite: '🔮',
      currentChapter: 1,
      chapters: [
        {
          id: 1,
          title: '신비한 점술사',
          requiredAffection: 0,
          events: [
            {
              id: 'ayumi-1-1',
              requiredAffection: 0,
              title: '운명의 카드',
              description: '점술사 아유미와 만나다',
              dialogue: [
                '(점술 동아리 방에서 타로 카드를 보고 있는 소녀)',
                '아유미: "...당신이 올 줄 알았어요."',
                '당신: "어떻게 알았어?"',
                '아유미: "카드가 알려줬어요. 특별한 인연이 시작될 거라고..."',
                '아유미: "당신의 운명을 봐드릴까요?"'
              ],
              choices: [
                {
                  text: '부탁해',
                  affectionChange: 5,
                  response: '아유미: "흥미로운 운명이네요... 사랑이 기다리고 있어요."'
                },
                {
                  text: '운명은 스스로 만드는 거야',
                  affectionChange: 4,
                  response: '아유미: "멋진 생각이에요. 그것도 하나의 운명이죠."'
                }
              ],
              rewards: { exp: 10 }
            }
          ]
        }
      ]
    }
  ];

  // Load completed events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedStoryEvents');
    if (saved) {
      setCompletedEvents(JSON.parse(saved));
    }
  }, []);

  // Save completed events
  const saveCompletedEvents = (events: Record<string, string[]>) => {
    localStorage.setItem('completedStoryEvents', JSON.stringify(events));
    setCompletedEvents(events);
  };

  // Handle dialogue progression
  const handleNextDialogue = () => {
    if (!currentEvent) return;

    if (dialogueIndex < currentEvent.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else if (currentEvent.choices && currentEvent.choices.length > 0) {
      // Show choices after all dialogue
    } else {
      completeEvent();
    }
  };

  // Handle choice selection
  const handleChoice = (choice: any) => {
    if (!currentEvent || !selectedHeroine) return;

    // Apply affection change
    updateAffection(selectedHeroine, choice.affectionChange);

    // Show response
    alert(choice.response);

    completeEvent();
  };

  // Complete current event
  const completeEvent = () => {
    if (!currentEvent || !selectedHeroine) return;

    // Mark event as completed
    const heroineEvents = completedEvents[selectedHeroine] || [];
    if (!heroineEvents.includes(currentEvent.id)) {
      const newCompleted = {
        ...completedEvents,
        [selectedHeroine]: [...heroineEvents, currentEvent.id]
      };
      saveCompletedEvents(newCompleted);
    }

    // Give rewards
    if (currentEvent.rewards) {
      if (currentEvent.rewards.exp) {
        addExperience(currentEvent.rewards.exp);
      }
      if (currentEvent.rewards.gold) {
        addGold(currentEvent.rewards.gold);
      }
    }

    setShowEventComplete(true);
    setTimeout(() => {
      setCurrentEvent(null);
      setDialogueIndex(0);
      setShowEventComplete(false);
    }, 2000);
  };

  // Get available events for a heroine
  const getAvailableEvents = (heroineId: string) => {
    const story = heroineStories.find(s => s.heroineId === heroineId);
    if (!story) return [];

    const affection = player.affection[heroineId] || 0;
    const completed = completedEvents[heroineId] || [];
    const available = [];

    for (const chapter of story.chapters) {
      if (affection >= chapter.requiredAffection) {
        for (const event of chapter.events) {
          if (affection >= event.requiredAffection && !completed.includes(event.id)) {
            available.push(event);
          }
        }
      }
    }

    return available;
  };

  // Get progress for a heroine
  const getProgress = (heroineId: string) => {
    const story = heroineStories.find(s => s.heroineId === heroineId);
    if (!story) return { completed: 0, total: 0 };

    const completed = completedEvents[heroineId]?.length || 0;
    const total = story.chapters.reduce((sum, ch) => sum + ch.events.length, 0);

    return { completed, total };
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
                💕 히로인 스토리
              </h1>
              <p className="text-text-secondary">
                각 히로인과의 특별한 이야기를 경험하세요
              </p>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              🏠 돌아가기
            </button>
          </div>
        </div>

        {/* Heroine Selection */}
        {!currentEvent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {heroineStories.map(story => {
              const affection = player.affection[story.heroineId] || 0;
              const available = getAvailableEvents(story.heroineId);
              const progress = getProgress(story.heroineId);
              const isLocked = affection <= 0;

              return (
                <div
                  key={story.heroineId}
                  onClick={() => !isLocked && setSelectedHeroine(story.heroineId)}
                  className={`bg-black/50 backdrop-blur-md rounded-lg p-6 border-2 transition-all ${
                    isLocked
                      ? 'border-gray-700 opacity-60 cursor-not-allowed'
                      : 'border-border hover:border-primary cursor-pointer hover:scale-105'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{isLocked ? '🔒' : story.sprite}</div>
                    <h3 className="text-xl font-bold text-text-primary">
                      {isLocked ? '???' : story.name}
                    </h3>
                  </div>

                  {!isLocked && (
                    <>
                      <div className="mb-4">
                        <div className="text-sm text-text-secondary mb-1">호감도</div>
                        <div className="bg-black/50 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full"
                            style={{ width: `${Math.min(affection, 100)}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-text-primary mt-1">
                          {affection}/100
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-text-secondary mb-1">스토리 진행도</div>
                        <div className="text-center text-text-primary">
                          {progress.completed}/{progress.total} 완료
                        </div>
                      </div>

                      {available.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-accent font-bold">
                            🎭 새로운 스토리 {available.length}개
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Story Events List */}
        {selectedHeroine && !currentEvent && (
          <div className="mt-6">
            <button
              onClick={() => setSelectedHeroine(null)}
              className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              ← 뒤로
            </button>

            <div className="grid grid-cols-1 gap-4">
              {getAvailableEvents(selectedHeroine).map(event => (
                <div
                  key={event.id}
                  onClick={() => {
                    setCurrentEvent(event);
                    setDialogueIndex(0);
                  }}
                  className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-border hover:border-primary cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {event.title}
                  </h3>
                  <p className="text-text-secondary">
                    {event.description}
                  </p>
                  {event.rewards && (
                    <div className="mt-3 flex gap-4 text-sm">
                      {event.rewards.exp && (
                        <span className="text-yellow-400">
                          ⭐ EXP +{event.rewards.exp}
                        </span>
                      )}
                      {event.rewards.gold && (
                        <span className="text-yellow-400">
                          💰 Gold +{event.rewards.gold}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {getAvailableEvents(selectedHeroine).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-secondary">
                    현재 진행 가능한 스토리가 없습니다.
                    <br />
                    호감도를 더 올려보세요!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Story Event Display */}
        {currentEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 rounded-xl p-8 max-w-3xl w-full">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {currentEvent.title}
              </h2>

              <div className="bg-black/30 rounded-lg p-6 mb-6 min-h-[200px]">
                <p className="text-lg text-white leading-relaxed">
                  {currentEvent.dialogue[dialogueIndex]}
                </p>
              </div>

              {/* Choices or Continue */}
              {dialogueIndex === currentEvent.dialogue.length - 1 && currentEvent.choices ? (
                <div className="space-y-3">
                  {currentEvent.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white transition-all hover:scale-[1.02]"
                    >
                      {choice.text}
                      {choice.affectionChange > 0 && (
                        <span className="ml-2 text-sm opacity-80">
                          (호감도 +{choice.affectionChange})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={handleNextDialogue}
                  className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white font-bold transition-all"
                >
                  {dialogueIndex < currentEvent.dialogue.length - 1 ? '다음 ▶' : '완료'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Event Complete Notification */}
        {showEventComplete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 pointer-events-none">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-8 animate-bounce">
              <h2 className="text-3xl font-bold text-white text-center">
                ✨ 스토리 완료! ✨
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroineStorylines;