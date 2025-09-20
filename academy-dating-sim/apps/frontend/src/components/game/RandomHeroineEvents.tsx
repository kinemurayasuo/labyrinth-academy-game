import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface HeroineEvent {
  id: string;
  heroine: string;
  title: string;
  description: string;
  icon: string;
  location: string;
  timeOfDay: string;
  probability: number;
  choices: Array<{
    text: string;
    affectionChange: number;
    response: string;
    consequence?: string;
  }>;
}

const RandomHeroineEvents: React.FC = () => {
  const player = useGameStore(state => state.player);
  const updateAffection = useGameStore(state => state.actions.updateAffection);
  const advanceTime = useGameStore(state => state.actions.advanceTime);
  const [currentEvent, setCurrentEvent] = useState<HeroineEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [eventResponse, setEventResponse] = useState<string>('');

  const randomEvents: HeroineEvent[] = [
    {
      id: 'sakura_morning_1',
      heroine: 'sakura',
      title: '사쿠라와의 우연한 만남',
      description: '복도에서 사쿠라와 부딪혔다! 책들이 바닥에 떨어졌다.',
      icon: '🌸',
      location: 'classroom',
      timeOfDay: 'morning',
      probability: 0.3,
      choices: [
        {
          text: '미안해! 내가 주울게! (도와준다)',
          affectionChange: 5,
          response: '사쿠라: "아... 고마워. 조심해야 하는건 나인데..." (얼굴이 빨개진다)',
          consequence: '사쿠라가 당신에게 호감을 느낀다.'
        },
        {
          text: '앞을 보고 다녀! (차갑게)',
          affectionChange: -3,
          response: '사쿠라: "뭐야! 네가 먼저 부딪쳤잖아!" (화난 표정)',
          consequence: '사쿠라가 당신에게 실망했다.'
        },
        {
          text: '괜찮아? 다치지 않았어? (걱정하며)',
          affectionChange: 8,
          response: '사쿠라: "어... 난 괜찮아. 네가 나를 걱정해주다니... 의외네." (수줍은 미소)',
          consequence: '사쿠라의 마음이 흔들린다!'
        }
      ]
    },
    {
      id: 'yuki_afternoon_1',
      heroine: 'yuki',
      title: '유키의 검술 연습',
      description: '운동장에서 유키가 혼자 검술 연습을 하고 있다.',
      icon: '❄️',
      location: 'gym',
      timeOfDay: 'afternoon',
      probability: 0.25,
      choices: [
        {
          text: '멋있어! 나도 가르쳐줄래?',
          affectionChange: 6,
          response: '유키: "흥... 따라올 수 있을까? 좋아, 특별히 가르쳐주지." (작은 미소)',
          consequence: '유키와 함께 훈련하며 가까워진다.'
        },
        {
          text: '조용히 지켜본다',
          affectionChange: 2,
          response: '유키가 당신을 발견하고 살짝 고개를 끄덕인다.',
          consequence: '유키가 당신의 존재를 인식했다.'
        },
        {
          text: '물 좀 마실래? (물병을 건넨다)',
          affectionChange: 7,
          response: '유키: "...고마워. 네가 이런 세심한 사람인 줄 몰랐네." (부드러운 표정)',
          consequence: '유키가 당신의 배려에 감동받았다.'
        }
      ]
    },
    {
      id: 'haruka_noon_1',
      heroine: 'haruka',
      title: '하루카의 도시락',
      description: '점심시간, 하루카가 혼자 도시락을 먹고 있다.',
      icon: '🌻',
      location: 'cafeteria',
      timeOfDay: 'noon',
      probability: 0.35,
      choices: [
        {
          text: '같이 먹어도 될까?',
          affectionChange: 4,
          response: '하루카: "응! 좋아! 같이 먹으면 더 맛있지!" (밝은 미소)',
          consequence: '하루카와 즐거운 점심시간을 보낸다.'
        },
        {
          text: '맛있어 보인다! 한 입만!',
          affectionChange: 6,
          response: '하루카: "히히, 좋아! 내가 직접 만든거야! 어때?" (자랑스러운 표정)',
          consequence: '하루카의 요리 실력에 감탄한다.'
        },
        {
          text: '내 도시락도 나눠줄게!',
          affectionChange: 8,
          response: '하루카: "와! 정말? 우리 도시락 교환하자! 재밌겠다!" (기뻐하며)',
          consequence: '하루카와 특별한 추억을 만든다.'
        }
      ]
    },
    {
      id: 'miku_evening_1',
      heroine: 'miku',
      title: '미쿠의 노래',
      description: '음악실에서 아름다운 노랫소리가 들린다.',
      icon: '🎵',
      location: 'classroom',
      timeOfDay: 'evening',
      probability: 0.3,
      choices: [
        {
          text: '조용히 들어가서 듣는다',
          affectionChange: 5,
          response: '미쿠: "어머, 들었어? 부끄럽네..." (수줍은 미소)',
          consequence: '미쿠의 노래에 감동받았다.'
        },
        {
          text: '박수를 치며 들어간다',
          affectionChange: 7,
          response: '미쿠: "고마워! 누군가 들어주니까 더 기분이 좋네!" (환한 미소)',
          consequence: '미쿠가 당신의 응원에 기뻐한다.'
        },
        {
          text: '같이 노래해도 될까?',
          affectionChange: 10,
          response: '미쿠: "정말? 좋아! 우리 듀엣하자!" (신나는 표정)',
          consequence: '미쿠와 특별한 시간을 보낸다!'
        }
      ]
    },
    {
      id: 'luna_night_1',
      heroine: 'luna',
      title: '루나의 점성술',
      description: '옥상에서 루나가 별을 보고 있다.',
      icon: '🌙',
      location: 'dormitory',
      timeOfDay: 'night',
      probability: 0.25,
      choices: [
        {
          text: '별이 정말 예쁘네',
          affectionChange: 4,
          response: '루나: "그렇지? 오늘 별자리가 특별한 의미를 가지고 있어." (신비로운 미소)',
          consequence: '루나와 별을 보며 시간을 보낸다.'
        },
        {
          text: '내 운세도 봐줄래?',
          affectionChange: 6,
          response: '루나: "좋아... 너와 나의 운명이 연결되어 있네." (의미심장한 눈빛)',
          consequence: '루나가 특별한 운명을 예언한다.'
        },
        {
          text: '같이 있어도 될까?',
          affectionChange: 8,
          response: '루나: "...응. 너와 함께라면 별이 더 밝게 빛나는 것 같아." (부드러운 표정)',
          consequence: '루나와 로맨틱한 시간을 보낸다.'
        }
      ]
    },
    {
      id: 'rina_morning_2',
      heroine: 'rina',
      title: '리나의 아침 훈련',
      description: '리나가 아침 일찍 훈련을 하고 있다.',
      icon: '🗡️',
      location: 'gym',
      timeOfDay: 'morning',
      probability: 0.28,
      choices: [
        {
          text: '대단하네! 매일 하는거야?',
          affectionChange: 5,
          response: '리나: "당연하지! 강해지려면 노력해야 해!" (자신감 넘치는 표정)',
          consequence: '리나의 열정에 감동받는다.'
        },
        {
          text: '나도 함께 훈련해도 될까?',
          affectionChange: 8,
          response: '리나: "오! 근성있네! 좋아, 특훈 시작이다!" (즐거운 표정)',
          consequence: '리나와 함께 훈련하며 친해진다.'
        },
        {
          text: '무리하지 마, 걱정돼',
          affectionChange: 7,
          response: '리나: "어... 걱정해주는거야? 고마워..." (놀라며 얼굴이 빨개진다)',
          consequence: '리나가 당신의 관심에 설렌다.'
        }
      ]
    },
    {
      id: 'ayumi_library_1',
      heroine: 'ayumi',
      title: '아유미와 도서관',
      description: '도서관에서 아유미가 높은 책장의 책을 꺼내려 하고 있다.',
      icon: '📚',
      location: 'library',
      timeOfDay: 'afternoon',
      probability: 0.32,
      choices: [
        {
          text: '내가 꺼내줄게! (도와준다)',
          affectionChange: 6,
          response: '아유미: "고마워... 키가 큰 건 부럽네." (수줍은 미소)',
          consequence: '아유미가 당신의 도움에 고마워한다.'
        },
        {
          text: '무슨 책 찾고 있어?',
          affectionChange: 5,
          response: '아유미: "고대 마법에 관한 책이야. 관심있어?" (기대하는 눈빛)',
          consequence: '아유미와 학문적 대화를 나눈다.'
        },
        {
          text: '같이 공부할래?',
          affectionChange: 9,
          response: '아유미: "정말? 좋아! 같이 공부하면 더 재미있을 것 같아!" (기쁜 표정)',
          consequence: '아유미와 특별한 스터디 시간을 갖는다.'
        }
      ]
    }
  ];

  // Check for random events when time advances
  useEffect(() => {
    const checkForRandomEvent = () => {
      // Only trigger events with certain probability and conditions
      if (Math.random() < 0.2) { // 20% chance on each time change
        const availableEvents = randomEvents.filter(event => {
          // Check if heroine has been met (affection > 0)
          if ((player.affection[event.heroine] || 0) <= 0) return false;

          // Check location and time
          if (event.location !== player.location) return false;
          if (event.timeOfDay !== player.timeOfDay) return false;

          // Random probability check
          return Math.random() < event.probability;
        });

        if (availableEvents.length > 0) {
          const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
          setCurrentEvent(selectedEvent);
          setShowEvent(true);
          setEventResponse('');
        }
      }
    };

    // Check when component mounts and player location/time changes
    checkForRandomEvent();
  }, [player.location, player.timeOfDay, player.day]);

  const handleChoice = (choice: any) => {
    if (!currentEvent) return;

    // Apply affection change
    updateAffection(currentEvent.heroine, choice.affectionChange);

    // Show response
    setEventResponse(choice.response);

    // Close event after delay
    setTimeout(() => {
      setShowEvent(false);
      setCurrentEvent(null);
      setEventResponse('');
      // Advance time after event
      advanceTime();
    }, 3000);
  };

  if (!showEvent || !currentEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 rounded-xl p-6 max-w-2xl w-full">
        {/* Event Header */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-3">{currentEvent.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentEvent.title}
          </h2>
          <p className="text-gray-200">{currentEvent.description}</p>
        </div>

        {/* Show response or choices */}
        {eventResponse ? (
          <div className="bg-black/30 rounded-lg p-6 text-center">
            <p className="text-lg text-white mb-2">{eventResponse}</p>
            <div className="text-sm text-gray-300 mt-4">
              잠시 후 계속됩니다...
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-300 mb-4 text-center">
              어떻게 행동하시겠습니까?
            </p>
            {currentEvent.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white transition-all hover:scale-[1.02] text-left"
              >
                <div className="font-semibold mb-1">{choice.text}</div>
                <div className="text-xs opacity-80">
                  {choice.affectionChange > 0 && `호감도 +${choice.affectionChange}`}
                  {choice.affectionChange < 0 && `호감도 ${choice.affectionChange}`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomHeroineEvents;