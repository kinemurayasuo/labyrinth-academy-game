import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface SeasonalEvent {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  icon: string;
  description: string;
  startDay: number;
  duration: number;
  activities: EventActivity[];
  specialRewards: EventReward[];
  requiredLevel?: number;
  requiredAffection?: { character: string; amount: number };
  backgroundImage?: string;
  musicTheme?: string;
}

interface EventActivity {
  id: string;
  name: string;
  icon: string;
  description: string;
  stamina: number;
  rewards: {
    exp?: number;
    money?: number;
    items?: string[];
    affection?: { character: string; amount: number }[];
  };
  dialogues?: string[];
  minigame?: string;
  successRate?: number;
}

interface EventReward {
  id: string;
  name: string;
  icon: string;
  type: 'item' | 'title' | 'skin' | 'memory';
  requirement: {
    participations?: number;
    score?: number;
    character?: string;
    affection?: number;
  };
}

interface EventProgress {
  eventId: string;
  participations: number;
  completedActivities: string[];
  earnedRewards: string[];
  specialMoments: string[];
  totalScore: number;
}

const SeasonalEvents: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const gameDate = useGameStore((state: any) => state.gameDate);
  const { updateAffection, gainExperience, addGold, addItem, advanceTime, updateStats } = useGameStore((state: any) => state.actions);

  const [currentSeason, setCurrentSeason] = useState<string>('spring');
  const [activeEvent, setActiveEvent] = useState<SeasonalEvent | null>(null);
  const [eventProgress, setEventProgress] = useState<Record<string, EventProgress>>({});
  const [selectedActivity, setSelectedActivity] = useState<EventActivity | null>(null);
  const [showEventResult, setShowEventResult] = useState<boolean>(false);
  const [eventResult, setEventResult] = useState<any>(null);
  const [unlockedMemories, setUnlockedMemories] = useState<string[]>([]);

  // Seasonal Events Database
  const seasonalEvents: SeasonalEvent[] = [
    // Spring Events
    {
      id: 'sakura_festival',
      name: '🌸 벚꽃 축제',
      season: 'spring',
      icon: '🌸',
      description: '학원 전체가 분홍빛으로 물드는 봄의 축제! 벚꽃 아래에서 특별한 추억을 만들어보세요.',
      startDay: 5,
      duration: 3,
      activities: [
        {
          id: 'hanami',
          name: '벚꽃 구경',
          icon: '🌸',
          description: '벚꽃 나무 아래서 도시락을 먹으며 즐거운 시간을 보냅니다.',
          stamina: 10,
          rewards: {
            exp: 50,
            affection: [
              { character: 'sakura', amount: 10 },
              { character: 'hana', amount: 8 }
            ]
          },
          dialogues: [
            '벚꽃이 정말 아름답네요!',
            '이 순간이 영원했으면 좋겠어요.',
            '내년에도 함께 보러 와요!'
          ]
        },
        {
          id: 'photo_contest',
          name: '사진 콘테스트',
          icon: '📸',
          description: '벚꽃을 배경으로 최고의 사진을 찍어보세요!',
          stamina: 15,
          rewards: {
            exp: 75,
            money: 200,
            items: ['sakura_photo']
          },
          minigame: 'photo_snap',
          successRate: 70
        },
        {
          id: 'spring_confession',
          name: '봄의 고백',
          icon: '💕',
          description: '벚꽃 나무 아래에서 마음을 전하세요.',
          stamina: 20,
          rewards: {
            affection: [{ character: 'any', amount: 20 }],
            items: ['confession_letter']
          },
          requiredAffection: { character: 'any', amount: 60 }
        },
        {
          id: 'food_stall',
          name: '축제 음식',
          icon: '🍡',
          description: '다양한 축제 음식을 즐겨보세요.',
          stamina: 5,
          rewards: {
            exp: 30,
            money: -50,
            affection: [{ character: 'mei', amount: 10 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'sakura_crown',
          name: '벚꽃 왕관',
          icon: '👑',
          type: 'item',
          requirement: { participations: 5 }
        },
        {
          id: 'spring_memory',
          name: '봄의 추억',
          icon: '🌸',
          type: 'memory',
          requirement: { character: 'sakura', affection: 80 }
        }
      ]
    },
    {
      id: 'spring_sports',
      name: '🏃 봄 체육대회',
      season: 'spring',
      icon: '🏃',
      description: '학급 대항 체육대회! 우승을 위해 힘을 합쳐보세요.',
      startDay: 15,
      duration: 2,
      activities: [
        {
          id: 'relay_race',
          name: '계주 경기',
          icon: '🏃',
          description: '팀워크가 중요한 계주 경기',
          stamina: 25,
          rewards: {
            exp: 100,
            money: 300,
            affection: [{ character: 'akane', amount: 15 }]
          },
          minigame: 'running',
          successRate: 60
        },
        {
          id: 'tug_of_war',
          name: '줄다리기',
          icon: '🪢',
          description: '힘을 합쳐 상대팀을 이기세요!',
          stamina: 20,
          rewards: {
            exp: 80,
            items: ['victory_flag']
          }
        },
        {
          id: 'cheering',
          name: '응원하기',
          icon: '📣',
          description: '친구들을 열심히 응원합니다.',
          stamina: 10,
          rewards: {
            exp: 40,
            affection: [{ character: 'all', amount: 5 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'champion_medal',
          name: '챔피언 메달',
          icon: '🥇',
          type: 'item',
          requirement: { score: 500 }
        }
      ]
    },

    // Summer Events
    {
      id: 'summer_festival',
      name: '🎆 여름 축제',
      season: 'summer',
      icon: '🎆',
      description: '불꽃놀이와 함께하는 낭만적인 여름밤! 유카타를 입고 축제를 즐겨보세요.',
      startDay: 35,
      duration: 3,
      activities: [
        {
          id: 'fireworks',
          name: '불꽃놀이 관람',
          icon: '🎆',
          description: '아름다운 불꽃놀이를 함께 봅니다.',
          stamina: 10,
          rewards: {
            exp: 60,
            affection: [{ character: 'yuki', amount: 12 }]
          },
          dialogues: [
            '불꽃이 정말 예쁘네요!',
            '이 순간을 잊지 못할 거예요.',
            '내년에도 함께 와요.'
          ]
        },
        {
          id: 'goldfish_scooping',
          name: '금붕어 잡기',
          icon: '🐠',
          description: '전통 게임인 금붕어 잡기에 도전!',
          stamina: 15,
          rewards: {
            exp: 50,
            items: ['goldfish'],
            money: -30
          },
          minigame: 'scooping',
          successRate: 40
        },
        {
          id: 'yukata_date',
          name: '유카타 데이트',
          icon: '👘',
          description: '유카타를 입고 축제를 둘러봅니다.',
          stamina: 20,
          rewards: {
            affection: [{ character: 'luna', amount: 15 }],
            items: ['yukata_photo']
          },
          requiredAffection: { character: 'any', amount: 50 }
        },
        {
          id: 'shaved_ice',
          name: '빙수 먹기',
          icon: '🍧',
          description: '시원한 빙수로 더위를 날려보세요.',
          stamina: 5,
          rewards: {
            exp: 25,
            money: -20,
            affection: [{ character: 'mei', amount: 8 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'festival_mask',
          name: '축제 가면',
          icon: '🎭',
          type: 'item',
          requirement: { participations: 4 }
        },
        {
          id: 'summer_night_memory',
          name: '여름밤의 추억',
          icon: '🌙',
          type: 'memory',
          requirement: { character: 'yuki', affection: 75 }
        }
      ]
    },
    {
      id: 'beach_trip',
      name: '🏖️ 해변 여행',
      season: 'summer',
      icon: '🏖️',
      description: '학급 전체가 함께 떠나는 해변 여행! 파도와 모래사장에서 즐거운 시간을 보내세요.',
      startDay: 45,
      duration: 2,
      activities: [
        {
          id: 'swimming',
          name: '수영하기',
          icon: '🏊',
          description: '시원한 바다에서 수영을 즐깁니다.',
          stamina: 20,
          rewards: {
            exp: 70,
            affection: [{ character: 'akane', amount: 10 }]
          }
        },
        {
          id: 'sandcastle',
          name: '모래성 만들기',
          icon: '🏰',
          description: '멋진 모래성을 만들어보세요.',
          stamina: 15,
          rewards: {
            exp: 60,
            items: ['sandcastle_trophy'],
            affection: [{ character: 'hana', amount: 10 }]
          },
          minigame: 'building'
        },
        {
          id: 'beach_volleyball',
          name: '비치발리볼',
          icon: '🏐',
          description: '모래사장에서 발리볼 경기!',
          stamina: 25,
          rewards: {
            exp: 90,
            money: 150,
            affection: [{ character: 'sakura', amount: 12 }]
          }
        },
        {
          id: 'sunset_walk',
          name: '석양 산책',
          icon: '🌅',
          description: '해변을 따라 로맨틱한 산책',
          stamina: 10,
          rewards: {
            affection: [{ character: 'any', amount: 18 }],
            items: ['sunset_photo']
          },
          requiredAffection: { character: 'any', amount: 65 }
        }
      ],
      specialRewards: [
        {
          id: 'summer_swimsuit',
          name: '여름 수영복',
          icon: '👙',
          type: 'skin',
          requirement: { participations: 6 }
        }
      ]
    },

    // Autumn Events
    {
      id: 'harvest_festival',
      name: '🍂 수확제',
      season: 'autumn',
      icon: '🍂',
      description: '풍성한 수확을 축하하는 가을 축제! 맛있는 음식과 함께 즐거운 시간을 보내세요.',
      startDay: 65,
      duration: 3,
      activities: [
        {
          id: 'harvest_crops',
          name: '작물 수확',
          icon: '🌾',
          description: '가을 작물을 수확합니다.',
          stamina: 15,
          rewards: {
            exp: 65,
            items: ['autumn_crops'],
            money: 100
          }
        },
        {
          id: 'cooking_contest',
          name: '요리 대회',
          icon: '👨‍🍳',
          description: '수확한 재료로 요리 대회에 참가!',
          stamina: 20,
          rewards: {
            exp: 85,
            money: 250,
            affection: [{ character: 'mei', amount: 20 }]
          },
          minigame: 'cooking'
        },
        {
          id: 'autumn_leaves',
          name: '단풍 구경',
          icon: '🍁',
          description: '아름다운 단풍을 구경합니다.',
          stamina: 10,
          rewards: {
            exp: 45,
            affection: [{ character: 'sora', amount: 12 }]
          }
        },
        {
          id: 'harvest_dance',
          name: '수확 춤',
          icon: '💃',
          description: '전통 수확 춤을 춥니다.',
          stamina: 15,
          rewards: {
            exp: 70,
            affection: [{ character: 'all', amount: 8 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'harvest_crown',
          name: '수확의 왕관',
          icon: '👑',
          type: 'item',
          requirement: { score: 400 }
        }
      ]
    },
    {
      id: 'halloween',
      name: '🎃 할로윈 파티',
      season: 'autumn',
      icon: '🎃',
      description: '으스스하고 재미있는 할로윈 파티! 코스튬을 입고 즐거운 시간을 보내세요.',
      startDay: 75,
      duration: 2,
      activities: [
        {
          id: 'costume_party',
          name: '코스튬 파티',
          icon: '👻',
          description: '멋진 코스튬을 입고 파티에 참가!',
          stamina: 15,
          rewards: {
            exp: 80,
            items: ['halloween_costume'],
            affection: [{ character: 'rin', amount: 15 }]
          }
        },
        {
          id: 'trick_or_treat',
          name: '트릭 오어 트릿',
          icon: '🍬',
          description: '사탕을 모으러 다닙니다.',
          stamina: 20,
          rewards: {
            exp: 60,
            items: ['candy_bag'],
            money: 80
          }
        },
        {
          id: 'haunted_house',
          name: '귀신의 집',
          icon: '🏚️',
          description: '무서운 귀신의 집 탐험!',
          stamina: 25,
          rewards: {
            exp: 100,
            affection: [{ character: 'luna', amount: 18 }],
            items: ['courage_badge']
          },
          successRate: 50
        },
        {
          id: 'pumpkin_carving',
          name: '호박 조각',
          icon: '🎃',
          description: '호박을 조각해 잭오랜턴을 만듭니다.',
          stamina: 10,
          rewards: {
            exp: 50,
            items: ['jack_o_lantern']
          }
        }
      ],
      specialRewards: [
        {
          id: 'vampire_cape',
          name: '뱀파이어 망토',
          icon: '🦇',
          type: 'skin',
          requirement: { participations: 5 }
        }
      ]
    },

    // Winter Events
    {
      id: 'christmas',
      name: '🎄 크리스마스',
      season: 'winter',
      icon: '🎄',
      description: '로맨틱한 화이트 크리스마스! 특별한 사람과 함께 보내세요.',
      startDay: 85,
      duration: 3,
      activities: [
        {
          id: 'christmas_date',
          name: '크리스마스 데이트',
          icon: '🎅',
          description: '특별한 크리스마스 데이트',
          stamina: 20,
          rewards: {
            affection: [{ character: 'any', amount: 25 }],
            items: ['christmas_gift']
          },
          requiredAffection: { character: 'any', amount: 70 }
        },
        {
          id: 'gift_exchange',
          name: '선물 교환',
          icon: '🎁',
          description: '친구들과 선물을 교환합니다.',
          stamina: 10,
          rewards: {
            exp: 60,
            items: ['mystery_gift'],
            affection: [{ character: 'all', amount: 10 }]
          }
        },
        {
          id: 'christmas_tree',
          name: '트리 꾸미기',
          icon: '🎄',
          description: '크리스마스 트리를 꾸밉니다.',
          stamina: 15,
          rewards: {
            exp: 70,
            affection: [{ character: 'hana', amount: 12 }]
          }
        },
        {
          id: 'carol_singing',
          name: '캐럴 부르기',
          icon: '🎵',
          description: '다함께 캐럴을 부릅니다.',
          stamina: 10,
          rewards: {
            exp: 50,
            affection: [{ character: 'all', amount: 6 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'santa_hat',
          name: '산타 모자',
          icon: '🎅',
          type: 'item',
          requirement: { participations: 4 }
        },
        {
          id: 'white_christmas_memory',
          name: '화이트 크리스마스',
          icon: '❄️',
          type: 'memory',
          requirement: { character: 'any', affection: 90 }
        }
      ]
    },
    {
      id: 'new_year',
      name: '🎍 신년 행사',
      season: 'winter',
      icon: '🎍',
      description: '새해를 맞이하는 특별한 행사! 소원을 빌고 새로운 시작을 준비하세요.',
      startDay: 95,
      duration: 2,
      activities: [
        {
          id: 'shrine_visit',
          name: '신사 참배',
          icon: '⛩️',
          description: '새해 소원을 빌러 신사에 갑니다.',
          stamina: 15,
          rewards: {
            exp: 75,
            items: ['fortune_charm'],
            affection: [{ character: 'sakura', amount: 14 }]
          }
        },
        {
          id: 'mochi_making',
          name: '떡 만들기',
          icon: '🍡',
          description: '전통 떡을 만듭니다.',
          stamina: 20,
          rewards: {
            exp: 65,
            items: ['mochi'],
            affection: [{ character: 'mei', amount: 12 }]
          }
        },
        {
          id: 'sunrise_viewing',
          name: '일출 보기',
          icon: '🌅',
          description: '새해 첫 일출을 봅니다.',
          stamina: 10,
          rewards: {
            exp: 80,
            affection: [{ character: 'any', amount: 20 }],
            items: ['sunrise_photo']
          },
          requiredAffection: { character: 'any', amount: 60 }
        },
        {
          id: 'fortune_telling',
          name: '운세 보기',
          icon: '🔮',
          description: '새해 운세를 봅니다.',
          stamina: 5,
          rewards: {
            exp: 30,
            items: ['fortune_paper']
          }
        }
      ],
      specialRewards: [
        {
          id: 'kimono',
          name: '전통 기모노',
          icon: '👘',
          type: 'skin',
          requirement: { participations: 4 }
        }
      ]
    },
    {
      id: 'snow_festival',
      name: '❄️ 눈 축제',
      season: 'winter',
      icon: '❄️',
      description: '하얀 눈으로 뒤덮인 겨울 축제! 눈사람을 만들고 썰매를 타며 즐거운 시간을 보내세요.',
      startDay: 105,
      duration: 3,
      activities: [
        {
          id: 'snowman_building',
          name: '눈사람 만들기',
          icon: '⛄',
          description: '큰 눈사람을 만들어보세요!',
          stamina: 15,
          rewards: {
            exp: 60,
            items: ['snowman_trophy'],
            affection: [{ character: 'yuki', amount: 20 }]
          },
          minigame: 'snowman'
        },
        {
          id: 'snowball_fight',
          name: '눈싸움',
          icon: '❄️',
          description: '신나는 눈싸움!',
          stamina: 20,
          rewards: {
            exp: 70,
            affection: [{ character: 'akane', amount: 14 }]
          }
        },
        {
          id: 'ice_skating',
          name: '아이스 스케이팅',
          icon: '⛸️',
          description: '얼음 위에서 스케이팅을 즐깁니다.',
          stamina: 18,
          rewards: {
            exp: 80,
            affection: [{ character: 'luna', amount: 16 }]
          },
          requiredLevel: 10
        },
        {
          id: 'hot_chocolate',
          name: '핫초코 마시기',
          icon: '☕',
          description: '따뜻한 핫초코로 몸을 녹입니다.',
          stamina: 5,
          rewards: {
            exp: 25,
            money: -30,
            affection: [{ character: 'all', amount: 4 }]
          }
        }
      ],
      specialRewards: [
        {
          id: 'snow_queen_crown',
          name: '눈의 여왕 왕관',
          icon: '👑',
          type: 'item',
          requirement: { score: 500 }
        },
        {
          id: 'winter_love_memory',
          name: '겨울 사랑',
          icon: '💙',
          type: 'memory',
          requirement: { character: 'yuki', affection: 85 }
        }
      ]
    }
  ];

  // Get current season based on game date
  const getCurrentSeason = useCallback((): string => {
    const day = player.day;
    if (day <= 30) return 'spring';
    if (day <= 60) return 'summer';
    if (day <= 90) return 'autumn';
    return 'winter';
  }, [player.day]);

  // Check for active events
  const checkActiveEvents = useCallback(() => {
    const season = getCurrentSeason();
    const day = player.day;

    const active = seasonalEvents.find(event => {
      return event.season === season &&
             day >= event.startDay &&
             day < event.startDay + event.duration;
    });

    setActiveEvent(active || null);
  }, [player.day, getCurrentSeason]);

  // Participate in activity
  const participateInActivity = useCallback((activity: EventActivity) => {
    if (!activeEvent) return;

    // Check stamina
    if (player.stamina < activity.stamina) {
      setEventResult({ success: false, message: '스태미나가 부족합니다!' });
      setShowEventResult(true);
      return;
    }

    // Check requirements
    if (activity.requiredAffection) {
      const hasRequiredAffection = Object.values(player.affection).some(
        (affection: any) => affection >= activity.requiredAffection!.amount
      );
      if (!hasRequiredAffection) {
        setEventResult({ success: false, message: '호감도가 부족합니다!' });
        setShowEventResult(true);
        return;
      }
    }

    // Success check
    const success = !activity.successRate || Math.random() * 100 < activity.successRate;

    if (success) {
      // Apply rewards
      if (activity.rewards.exp) gainExperience(activity.rewards.exp);
      if (activity.rewards.money) addGold(activity.rewards.money);
      if (activity.rewards.items) {
        activity.rewards.items.forEach(item => addItem(item));
      }
      if (activity.rewards.affection) {
        activity.rewards.affection.forEach(aff => {
          if (aff.character === 'all') {
            Object.keys(player.affection).forEach(char =>
              updateAffection(char, aff.amount)
            );
          } else if (aff.character === 'any') {
            // Give to highest affection character
            const topChar = Object.entries(player.affection)
              .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
            updateAffection(topChar, aff.amount);
          } else {
            updateAffection(aff.character, aff.amount);
          }
        });
      }

      // Update progress
      const progress = eventProgress[activeEvent.id] || {
        eventId: activeEvent.id,
        participations: 0,
        completedActivities: [],
        earnedRewards: [],
        specialMoments: [],
        totalScore: 0
      };

      progress.participations++;
      if (!progress.completedActivities.includes(activity.id)) {
        progress.completedActivities.push(activity.id);
      }
      progress.totalScore += activity.rewards.exp || 0;

      setEventProgress(prev => ({
        ...prev,
        [activeEvent.id]: progress
      }));

      // Check for special rewards
      checkSpecialRewards(activeEvent, progress);

      setEventResult({
        success: true,
        message: '활동을 성공적으로 완료했습니다!',
        rewards: activity.rewards
      });
    } else {
      setEventResult({
        success: false,
        message: '활동에 실패했습니다. 다시 시도해보세요!'
      });
    }

    // Consume stamina
    updateStats({ stamina: -activity.stamina });
    advanceTime();
    setShowEventResult(true);
  }, [activeEvent, player, eventProgress, gainExperience, addGold, addItem, updateAffection, updateStats, advanceTime]);

  // Check and award special rewards
  const checkSpecialRewards = useCallback((event: SeasonalEvent, progress: EventProgress) => {
    event.specialRewards.forEach(reward => {
      if (progress.earnedRewards.includes(reward.id)) return;

      let earned = false;

      if (reward.requirement.participations &&
          progress.participations >= reward.requirement.participations) {
        earned = true;
      }

      if (reward.requirement.score &&
          progress.totalScore >= reward.requirement.score) {
        earned = true;
      }

      if (reward.requirement.character && reward.requirement.affection) {
        const affection = player.affection[reward.requirement.character] || 0;
        if (affection >= reward.requirement.affection) {
          earned = true;
        }
      }

      if (earned) {
        progress.earnedRewards.push(reward.id);

        if (reward.type === 'item') {
          addItem(reward.id);
        } else if (reward.type === 'memory') {
          setUnlockedMemories(prev => [...prev, reward.id]);
        }

        setEventResult(prev => ({
          ...prev,
          specialReward: reward
        }));
      }
    });
  }, [player.affection, addItem]);

  // Initialize
  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
    checkActiveEvents();
  }, [getCurrentSeason, checkActiveEvents]);

  // Season backgrounds
  const getSeasonBackground = (): string => {
    switch (currentSeason) {
      case 'spring': return 'from-pink-400 via-pink-300 to-blue-300';
      case 'summer': return 'from-blue-400 via-cyan-300 to-yellow-300';
      case 'autumn': return 'from-orange-400 via-red-400 to-yellow-500';
      case 'winter': return 'from-blue-200 via-gray-200 to-white';
      default: return 'from-purple-400 to-pink-400';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getSeasonBackground()} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {currentSeason === 'spring' && '🌸 봄'}
                {currentSeason === 'summer' && '☀️ 여름'}
                {currentSeason === 'autumn' && '🍂 가을'}
                {currentSeason === 'winter' && '❄️ 겨울'} 이벤트
              </h1>
              <p className="text-gray-600">
                계절마다 펼쳐지는 특별한 이벤트를 즐겨보세요!
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

        {activeEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Main Info */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-6xl">{activeEvent.icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{activeEvent.name}</h2>
                    <p className="text-gray-600 mt-2">{activeEvent.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>📅 Day {player.day} / {activeEvent.startDay + activeEvent.duration - 1}</span>
                      <span>⏱️ {activeEvent.startDay + activeEvent.duration - player.day}일 남음</span>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <h3 className="text-xl font-bold text-gray-700 mb-4">🎯 이벤트 활동</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEvent.activities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-all hover:scale-[1.02] text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{activity.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{activity.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">💪 {activity.stamina}</span>
                            <span className="text-green-600">
                              {activity.rewards.exp && `EXP +${activity.rewards.exp}`}
                              {activity.rewards.money && ` 💰 ${activity.rewards.money > 0 ? '+' : ''}${activity.rewards.money}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Activity Detail */}
              {selectedActivity && (
                <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">
                    {selectedActivity.icon} {selectedActivity.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{selectedActivity.description}</p>

                  {/* Requirements */}
                  {selectedActivity.requiredAffection && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                      <span className="text-yellow-800">
                        ⚠️ 요구사항: 호감도 {selectedActivity.requiredAffection.amount} 이상
                      </span>
                    </div>
                  )}

                  {/* Rewards Detail */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-green-800 mb-2">보상</h4>
                    <div className="space-y-1 text-sm text-green-700">
                      {selectedActivity.rewards.exp && <div>• 경험치 +{selectedActivity.rewards.exp}</div>}
                      {selectedActivity.rewards.money && <div>• 골드 {selectedActivity.rewards.money > 0 ? '+' : ''}{selectedActivity.rewards.money}</div>}
                      {selectedActivity.rewards.items && (
                        <div>• 아이템: {selectedActivity.rewards.items.join(', ')}</div>
                      )}
                      {selectedActivity.rewards.affection && (
                        <div>
                          • 호감도: {selectedActivity.rewards.affection.map(aff =>
                            `${aff.character} +${aff.amount}`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => participateInActivity(selectedActivity)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold transition"
                  >
                    참여하기 (스태미나 {selectedActivity.stamina})
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Progress */}
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">📊 이벤트 진행도</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>참여 횟수</span>
                      <span>{eventProgress[activeEvent.id]?.participations || 0}회</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((eventProgress[activeEvent.id]?.participations || 0) / 10) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>완료 활동: {eventProgress[activeEvent.id]?.completedActivities?.length || 0}/{activeEvent.activities.length}</div>
                    <div>총 점수: {eventProgress[activeEvent.id]?.totalScore || 0}</div>
                  </div>
                </div>
              </div>

              {/* Special Rewards */}
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">🏆 특별 보상</h3>
                <div className="space-y-3">
                  {activeEvent.specialRewards.map(reward => {
                    const earned = eventProgress[activeEvent.id]?.earnedRewards?.includes(reward.id);
                    return (
                      <div
                        key={reward.id}
                        className={`p-3 rounded-lg border ${
                          earned
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{reward.icon}</span>
                          <div className="flex-1">
                            <div className="font-bold text-sm text-gray-700">
                              {reward.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reward.requirement.participations && `참여 ${reward.requirement.participations}회`}
                              {reward.requirement.score && `점수 ${reward.requirement.score}`}
                              {reward.requirement.affection && `호감도 ${reward.requirement.affection}`}
                            </div>
                          </div>
                          {earned && <span className="text-green-500">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unlocked Memories */}
              {unlockedMemories.length > 0 && (
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-3">💝 특별한 추억</h3>
                  <div className="space-y-2">
                    {unlockedMemories.map(memory => (
                      <div key={memory} className="text-sm text-purple-700">
                        • {memory}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // No Active Event
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">현재 진행 중인 이벤트가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              다음 이벤트를 기다려주세요!
            </p>

            {/* Upcoming Events */}
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-gray-700 mb-4">예정된 이벤트</h3>
              <div className="space-y-3">
                {seasonalEvents
                  .filter(event => event.season === currentSeason && event.startDay > player.day)
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{event.icon}</span>
                        <div className="text-left">
                          <div className="font-bold text-gray-700">{event.name}</div>
                          <div className="text-sm text-gray-500">Day {event.startDay}부터</div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600">
                        {event.startDay - player.day}일 후
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Event Result Modal */}
        {showEventResult && eventResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {eventResult.success ? '🎉' : '😅'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {eventResult.success ? '성공!' : '실패'}
                </h3>
                <p className="text-gray-600 mb-4">{eventResult.message}</p>

                {eventResult.rewards && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-green-700">
                      {eventResult.rewards.exp && <div>경험치 +{eventResult.rewards.exp}</div>}
                      {eventResult.rewards.money && <div>골드 +{eventResult.rewards.money}</div>}
                      {eventResult.rewards.items && <div>아이템 획득!</div>}
                    </div>
                  </div>
                )}

                {eventResult.specialReward && (
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <div className="text-purple-700">
                      <div className="font-bold">🏆 특별 보상 획득!</div>
                      <div>{eventResult.specialReward.icon} {eventResult.specialReward.name}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowEventResult(false);
                    setEventResult(null);
                    setSelectedActivity(null);
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalEvents;