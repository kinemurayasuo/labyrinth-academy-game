import React, { useState, useEffect } from 'react';
import type { Character, Player } from '../types/game';

interface HeroineEventsProps {
  character: Character;
  player: Player;
  onEventComplete: (effects: any) => void;
  onClose: () => void;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  type: 'random' | 'gift' | 'study' | 'date' | 'holiday' | 'confession';
  minAffection: number;
  choices: EventChoice[];
  backgroundImage?: string;
}

interface EventChoice {
  text: string;
  condition?: {
    minIntelligence?: number;
    minCharm?: number;
    minStamina?: number;
    hasItem?: string;
    minMoney?: number;
  };
  effects: {
    affection?: number;
    stats?: Partial<Player['stats']>;
    item?: string;
    money?: number;
    text: string;
  };
}

const HeroineEvents: React.FC<HeroineEventsProps> = ({
  character,
  player,
  onEventComplete,
  onClose
}) => {
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [eventResult, setEventResult] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const affectionLevel = player.affection[character.id] || character.affectionStart;

  const getAvailableEvents = (): EventData[] => {
    const baseEvents: EventData[] = [
      // Random Encounters
      {
        id: 'library_encounter',
        title: '도서관에서의 우연한 만남',
        description: `도서관에서 ${character.name}을(를) 우연히 마주쳤습니다. 그녀는 책을 읽고 있는 중입니다.`,
        type: 'random',
        minAffection: 0,
        choices: [
          {
            text: '조용히 옆에 앉아서 함께 읽기',
            condition: { minIntelligence: 15 },
            effects: {
              affection: 8,
              stats: { intelligence: 2 },
              text: `${character.name}이(가) 미소를 지으며 당신을 환영합니다. 함께 조용한 시간을 보냈습니다.`
            }
          },
          {
            text: '말을 걸어 대화하기',
            condition: { minCharm: 12 },
            effects: {
              affection: 5,
              stats: { charm: 1 },
              text: `즐거운 대화를 나누었습니다. ${character.name}이(가) 당신의 이야기에 관심을 보입니다.`
            }
          },
          {
            text: '그냥 지나가기',
            effects: {
              affection: -2,
              text: `${character.name}이(가) 당신을 봤지만, 인사하지 않고 지나갔습니다.`
            }
          }
        ]
      },

      // Gift Events
      {
        id: 'gift_giving',
        title: '선물하기',
        description: `${character.name}에게 특별한 선물을 주고 싶습니다. 어떤 선물을 할까요?`,
        type: 'gift',
        minAffection: 10,
        choices: [
          {
            text: '꽃다발 선물하기',
            condition: { hasItem: 'flower' },
            effects: {
              affection: character.likes.includes('꽃') ? 15 : 10,
              text: character.likes.includes('꽃')
                ? `${character.name}이(가) 꽃다발을 보고 매우 기뻐합니다!`
                : `${character.name}이(가) 선물에 감사해합니다.`
            }
          },
          {
            text: '초콜릿 선물하기',
            condition: { hasItem: 'chocolateBox' },
            effects: {
              affection: 12,
              text: `${character.name}이(가) 달콤한 초콜릿을 받고 행복해합니다.`
            }
          },
          {
            text: '직접 만든 도시락 주기',
            condition: { hasItem: 'lunchbox' },
            effects: {
              affection: 18,
              stats: { charm: 2 },
              text: `${character.name}이(가) 정성스러운 도시락에 감동받았습니다!`
            }
          },
          {
            text: '돈으로 비싼 선물 사주기',
            condition: { minMoney: 1000 },
            effects: {
              affection: 8,
              money: -1000,
              text: `비싼 선물이지만 ${character.name}은(는) 진심이 더 중요하다고 말합니다.`
            }
          }
        ]
      },

      // Study Events
      {
        id: 'study_together',
        title: '함께 공부하기',
        description: `${character.name}과(와) 함께 공부할 기회가 생겼습니다. 어떻게 하시겠습니까?`,
        type: 'study',
        minAffection: 20,
        choices: [
          {
            text: '열심히 공부에 집중하기',
            condition: { minIntelligence: 20 },
            effects: {
              affection: 10,
              stats: { intelligence: 3 },
              text: `${character.name}이(가) 당신의 열정에 감명받았습니다. 함께 많은 것을 배웠습니다.`
            }
          },
          {
            text: '그녀를 도와주기',
            condition: { minIntelligence: 15 },
            effects: {
              affection: 15,
              stats: { intelligence: 1, charm: 2 },
              text: `${character.name}이(가) 당신의 도움에 고마워합니다. 더 가까워진 느낌입니다.`
            }
          },
          {
            text: '장난치며 분위기 띄우기',
            condition: { minCharm: 18 },
            effects: {
              affection: 8,
              stats: { charm: 2 },
              text: `즐거운 시간을 보냈지만 공부는 별로 하지 못했습니다.`
            }
          }
        ]
      },

      // Date Events
      {
        id: 'cafe_date',
        title: '카페 데이트',
        description: `${character.name}과(와) 학교 근처 카페에서 만났습니다. 로맨틱한 분위기입니다.`,
        type: 'date',
        minAffection: 40,
        choices: [
          {
            text: '그녀가 좋아하는 음료 주문해주기',
            condition: { minMoney: 200, minCharm: 15 },
            effects: {
              affection: 12,
              money: -200,
              stats: { charm: 1 },
              text: `${character.name}이(가) 당신의 배려에 감동받았습니다.`
            }
          },
          {
            text: '깊은 대화 나누기',
            condition: { minIntelligence: 25 },
            effects: {
              affection: 15,
              stats: { intelligence: 1, charm: 2 },
              text: `의미 있는 대화를 나누며 서로를 더 깊이 알게 되었습니다.`
            }
          },
          {
            text: '재미있는 농담하기',
            condition: { minCharm: 20 },
            effects: {
              affection: 10,
              stats: { charm: 2 },
              text: `${character.name}이(가) 당신의 유머에 웃음을 터뜨립니다.`
            }
          },
          {
            text: '조용히 함께 시간 보내기',
            effects: {
              affection: 8,
              text: `편안하고 평화로운 시간을 함께 보냈습니다.`
            }
          }
        ]
      },

      // Holiday Events
      {
        id: 'valentine_event',
        title: '발렌타인 데이',
        description: `발렌타인 데이입니다. ${character.name}이(가) 당신에게 뭔가 전하고 싶어하는 것 같습니다.`,
        type: 'holiday',
        minAffection: 50,
        choices: [
          {
            text: '먼저 초콜릿 선물하기',
            condition: { hasItem: 'chocolateBox' },
            effects: {
              affection: 20,
              text: `${character.name}이(가) 깜짝 놀라며 기뻐합니다. 그녀도 당신을 위해 준비한 것이 있다고 합니다.`
            }
          },
          {
            text: '그녀의 선물을 기다리기',
            effects: {
              affection: 15,
              item: 'chocolateBox',
              text: `${character.name}이(가) 수줍게 수제 초콜릿을 건네줍니다.`
            }
          },
          {
            text: '특별한 데이트 제안하기',
            condition: { minCharm: 25, minMoney: 500 },
            effects: {
              affection: 25,
              money: -500,
              stats: { charm: 3 },
              text: `로맨틱한 데이트 제안에 ${character.name}이(가) 감동받았습니다.`
            }
          }
        ]
      },

      // Confession Events
      {
        id: 'confession_event',
        title: '고백의 순간',
        description: `${character.name}과(와) 둘만의 시간을 보내고 있습니다. 마음을 전할 절호의 기회인 것 같습니다.`,
        type: 'confession',
        minAffection: 70,
        choices: [
          {
            text: '진심으로 고백하기',
            condition: { minCharm: 30 },
            effects: {
              affection: affectionLevel >= 80 ? 30 : 15,
              text: affectionLevel >= 80
                ? `${character.name}이(가) 눈물을 글썽이며 당신의 마음을 받아줍니다.`
                : `${character.name}이(가) 당신의 진심을 느끼지만 아직 시간이 필요하다고 합니다.`
            }
          },
          {
            text: '로맨틱하게 고백하기',
            condition: { minCharm: 35, hasItem: 'flower' },
            effects: {
              affection: affectionLevel >= 75 ? 35 : 20,
              text: affectionLevel >= 75
                ? `완벽한 고백에 ${character.name}이(가) "네"라고 대답합니다!`
                : `${character.name}이(가) 감동받았지만 아직 조금 더 시간이 필요하다고 합니다.`
            }
          },
          {
            text: '마음을 더 키운 후에 하기',
            effects: {
              affection: 5,
              text: `아직 때가 아닌 것 같습니다. 더 가까워진 후에 마음을 전하기로 했습니다.`
            }
          }
        ]
      }
    ];

    return baseEvents.filter(event => affectionLevel >= event.minAffection);
  };

  const getRandomEvent = (): EventData => {
    const availableEvents = getAvailableEvents();
    return availableEvents[Math.floor(Math.random() * availableEvents.length)];
  };

  const handleChoiceSelect = (choice: EventChoice) => {
    // Check conditions
    if (choice.condition) {
      const { minIntelligence, minCharm, minStamina, hasItem, minMoney } = choice.condition;

      if (minIntelligence && player.stats.intelligence < minIntelligence) {
        setEventResult(`지력이 부족합니다. (필요: ${minIntelligence}, 현재: ${player.stats.intelligence})`);
        setShowResult(true);
        return;
      }

      if (minCharm && player.stats.charm < minCharm) {
        setEventResult(`매력이 부족합니다. (필요: ${minCharm}, 현재: ${player.stats.charm})`);
        setShowResult(true);
        return;
      }

      if (minStamina && player.stats.stamina < minStamina) {
        setEventResult(`체력이 부족합니다. (필요: ${minStamina}, 현재: ${player.stats.stamina})`);
        setShowResult(true);
        return;
      }

      if (hasItem && !player.inventory.includes(hasItem)) {
        setEventResult(`필요한 아이템이 없습니다: ${hasItem}`);
        setShowResult(true);
        return;
      }

      if (minMoney && player.money < minMoney) {
        setEventResult(`돈이 부족합니다. (필요: ${minMoney}원, 현재: ${player.money}원)`);
        setShowResult(true);
        return;
      }
    }

    // Apply effects
    const effects = {
      affection: choice.effects.affection ? { [character.id]: choice.effects.affection } : {},
      stats: choice.effects.stats || {},
      money: choice.effects.money || 0,
      item: choice.effects.item
    };

    setEventResult(choice.effects.text);
    setShowResult(true);

    setTimeout(() => {
      onEventComplete(effects);
    }, 3000);
  };

  useEffect(() => {
    if (!currentEvent) {
      setCurrentEvent(getRandomEvent());
    }
  }, []);

  if (!currentEvent) {
    return null;
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{character.sprite}</div>
          <h3 className="text-2xl font-bold text-white mb-4">결과</h3>
          <p className="text-purple-200 text-lg leading-relaxed mb-6">
            {eventResult}
          </p>
          <div className="w-full bg-purple-500/20 rounded-full h-2 mb-4">
            <div className="bg-purple-400 h-2 rounded-full w-0 animate-pulse"></div>
          </div>
          <p className="text-sm text-purple-300">잠시 후 계속됩니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Event Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{character.sprite}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentEvent.title}</h2>
                <p className="text-purple-300">와(과) 함께하는 {character.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <p className="text-white leading-relaxed">
              {currentEvent.description}
            </p>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {currentEvent.choices.map((choice, index) => {
              const canSelect = !choice.condition || (
                (!choice.condition.minIntelligence || player.stats.intelligence >= choice.condition.minIntelligence) &&
                (!choice.condition.minCharm || player.stats.charm >= choice.condition.minCharm) &&
                (!choice.condition.minStamina || player.stats.stamina >= choice.condition.minStamina) &&
                (!choice.condition.hasItem || player.inventory.includes(choice.condition.hasItem)) &&
                (!choice.condition.minMoney || player.money >= choice.condition.minMoney)
              );

              return (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={!canSelect}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                    canSelect
                      ? 'bg-purple-700/30 hover:bg-purple-600/40 text-white border border-purple-500/30 hover:border-purple-400/50'
                      : 'bg-gray-700/30 text-gray-400 border border-gray-600/30 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{choice.text}</span>
                    {choice.condition && (
                      <div className="text-xs ml-4 opacity-70">
                        {choice.condition.minIntelligence && `지력 ${choice.condition.minIntelligence}+`}
                        {choice.condition.minCharm && `매력 ${choice.condition.minCharm}+`}
                        {choice.condition.minStamina && `체력 ${choice.condition.minStamina}+`}
                        {choice.condition.hasItem && `${choice.condition.hasItem} 필요`}
                        {choice.condition.minMoney && `${choice.condition.minMoney}원 필요`}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Event Info */}
          <div className="mt-6 flex items-center justify-between text-sm text-purple-300">
            <span>이벤트 타입: {currentEvent.type}</span>
            <span>필요 호감도: {currentEvent.minAffection}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroineEvents;