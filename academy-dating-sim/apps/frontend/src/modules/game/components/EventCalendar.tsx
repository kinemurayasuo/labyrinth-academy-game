import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface GameEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'festival' | 'competition' | 'special' | 'seasonal';
  date: number;
  month: number;
  duration: number;
  rewards: {
    gold?: number;
    exp?: number;
    items?: string[];
    affection?: { [key: string]: number };
  };
  requirements?: {
    level?: number;
    affection?: { [key: string]: number };
  };
  participated?: boolean;
}

const EventCalendar: React.FC = () => {
  const { player, gameDate, updatePlayer } = useGameStore();
  const [selectedMonth, setSelectedMonth] = useState(gameDate.month);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [participatedEvents, setParticipatedEvents] = useState<string[]>(
    player.participatedEvents || []
  );

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const events: GameEvent[] = [
    // 봄 이벤트 (3-5월)
    {
      id: 'cherry_blossom',
      name: '벚꽃 축제',
      description: '봄의 시작을 알리는 벚꽃 축제! 히로인과 함께 벚꽃을 구경하세요.',
      icon: '🌸',
      type: 'festival',
      date: 15,
      month: 4,
      duration: 3,
      rewards: {
        affection: { sakura: 20, luna: 10, ice: 10, rose: 10, star: 10 }
      }
    },
    {
      id: 'spring_sports',
      name: '봄 체육대회',
      description: '학원 전체가 참가하는 체육대회! 우승하면 큰 보상이!',
      icon: '🏃',
      type: 'competition',
      date: 25,
      month: 5,
      duration: 2,
      rewards: {
        gold: 5000,
        exp: 1000,
        items: ['trophy']
      },
      requirements: {
        level: 10
      }
    },

    // 여름 이벤트 (6-8월)
    {
      id: 'summer_festival',
      name: '여름 축제',
      description: '불꽃놀이와 함께하는 여름 축제! 유카타를 입고 참가하세요.',
      icon: '🎆',
      type: 'festival',
      date: 20,
      month: 7,
      duration: 3,
      rewards: {
        affection: { luna: 15, sakura: 15, ice: 15, rose: 15, star: 15 }
      }
    },
    {
      id: 'beach_event',
      name: '해변 이벤트',
      description: '모두 함께 해변으로! 수영복 이벤트도 있어요.',
      icon: '🏖️',
      type: 'special',
      date: 10,
      month: 8,
      duration: 7,
      rewards: {
        gold: 3000,
        affection: { ice: 20, rose: 20 }
      }
    },

    // 가을 이벤트 (9-11월)
    {
      id: 'harvest_festival',
      name: '수확 축제',
      description: '가을 수확을 축하하는 축제. 맛있는 음식이 가득!',
      icon: '🍂',
      type: 'festival',
      date: 15,
      month: 10,
      duration: 3,
      rewards: {
        gold: 4000,
        items: ['harvest_basket']
      }
    },
    {
      id: 'halloween',
      name: '할로윈 파티',
      description: '으스스한 할로윈 파티! 코스튬 대회도 열립니다.',
      icon: '🎃',
      type: 'special',
      date: 31,
      month: 10,
      duration: 1,
      rewards: {
        exp: 2000,
        items: ['halloween_costume'],
        affection: { star: 25 }
      }
    },
    {
      id: 'culture_festival',
      name: '문화제',
      description: '학원 최대 행사인 문화제! 각 반이 준비한 행사를 즐기세요.',
      icon: '🎭',
      type: 'festival',
      date: 20,
      month: 11,
      duration: 5,
      rewards: {
        gold: 10000,
        exp: 3000,
        affection: { luna: 20, sakura: 20, ice: 20, rose: 20, star: 20 }
      },
      requirements: {
        level: 15
      }
    },

    // 겨울 이벤트 (12-2월)
    {
      id: 'christmas',
      name: '크리스마스',
      description: '로맨틱한 크리스마스! 특별한 선물을 준비하세요.',
      icon: '🎄',
      type: 'special',
      date: 24,
      month: 12,
      duration: 2,
      rewards: {
        items: ['christmas_gift'],
        affection: { luna: 30, sakura: 30, ice: 30, rose: 30, star: 30 }
      }
    },
    {
      id: 'new_year',
      name: '신년 축제',
      description: '새해를 맞이하는 축제! 신사 참배와 함께.',
      icon: '🎍',
      type: 'seasonal',
      date: 1,
      month: 1,
      duration: 3,
      rewards: {
        gold: 8888,
        exp: 2000,
        items: ['lucky_charm']
      }
    },
    {
      id: 'valentines',
      name: '발렌타인 데이',
      description: '사랑을 고백하는 날! 초콜릿을 주고받으세요.',
      icon: '💝',
      type: 'special',
      date: 14,
      month: 2,
      duration: 1,
      rewards: {
        affection: { luna: 50, sakura: 50, ice: 50, rose: 50, star: 50 },
        items: ['chocolate']
      },
      requirements: {
        affection: { luna: 30 }
      }
    },

    // 특별 이벤트
    {
      id: 'midterm_exam',
      name: '중간고사',
      description: '학업 성취도를 평가하는 중간고사. 좋은 성적을 받으면 보상이!',
      icon: '📝',
      type: 'competition',
      date: 15,
      month: 6,
      duration: 3,
      rewards: {
        gold: 3000,
        exp: 1500,
        items: ['study_guide']
      },
      requirements: {
        level: 5
      }
    },
    {
      id: 'final_exam',
      name: '기말고사',
      description: '한 학기를 마무리하는 기말고사. 최고 성적을 목표로!',
      icon: '📚',
      type: 'competition',
      date: 15,
      month: 12,
      duration: 3,
      rewards: {
        gold: 5000,
        exp: 2500,
        items: ['diploma']
      },
      requirements: {
        level: 20
      }
    }
  ];

  // 현재 월의 이벤트 가져오기
  const getMonthEvents = (month: number) => {
    return events.filter(event => event.month === month);
  };

  // 이벤트 참가
  const participateInEvent = (event: GameEvent) => {
    // 요구사항 확인
    if (event.requirements) {
      if (event.requirements.level && player.level < event.requirements.level) {
        alert(`레벨 ${event.requirements.level} 이상이어야 참가할 수 있습니다.`);
        return;
      }
      if (event.requirements.affection) {
        for (const [heroine, required] of Object.entries(event.requirements.affection)) {
          if ((player.affection?.[heroine] || 0) < required) {
            alert(`${heroine}의 호감도가 ${required} 이상이어야 참가할 수 있습니다.`);
            return;
          }
        }
      }
    }

    // 이미 참가했는지 확인
    if (participatedEvents.includes(event.id)) {
      alert('이미 참가한 이벤트입니다!');
      return;
    }

    // 보상 지급
    let newPlayerData: any = { ...player };

    if (event.rewards.gold) {
      newPlayerData.gold = player.gold + event.rewards.gold;
    }
    if (event.rewards.exp) {
      newPlayerData.experience = player.experience + event.rewards.exp;
    }
    if (event.rewards.affection) {
      newPlayerData.affection = { ...player.affection };
      for (const [heroine, amount] of Object.entries(event.rewards.affection)) {
        newPlayerData.affection[heroine] = (newPlayerData.affection[heroine] || 0) + amount;
      }
    }
    if (event.rewards.items) {
      newPlayerData.inventory = [
        ...(player.inventory || []),
        ...event.rewards.items.map(item => ({ id: item, quantity: 1 }))
      ];
    }

    // 참가 이벤트 기록
    const newParticipated = [...participatedEvents, event.id];
    setParticipatedEvents(newParticipated);
    newPlayerData.participatedEvents = newParticipated;

    updatePlayer(newPlayerData);
    soundManager.playSuccessSound();
    alert(`${event.name}에 참가했습니다! 보상을 획득했습니다.`);
    setSelectedEvent(null);
  };

  // 달력 생성
  const generateCalendar = () => {
    const firstDay = new Date(gameDate.year, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(gameDate.year, selectedMonth, 0).getDate();
    const calendar = [];

    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    // 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(i);
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const monthEvents = getMonthEvents(selectedMonth);

  const getEventForDay = (day: number | null) => {
    if (!day) return null;
    return monthEvents.find(event =>
      day >= event.date && day < event.date + event.duration
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">📅 이벤트 캘린더</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Current Date */}
          <div className="bg-white/10 rounded-lg p-3 text-white">
            <div className="text-sm opacity-80">현재 날짜</div>
            <div className="text-xl font-bold">
              {gameDate.year}년 {gameDate.month}월 {gameDate.day}일
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => setSelectedMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              ◀
            </button>
            <h2 className="text-2xl font-bold">{months[selectedMonth - 1]}</h2>
            <button
              onClick={() => setSelectedMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur rounded-xl p-6">
            <div className="grid grid-cols-7 gap-2 text-white mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-center font-bold text-sm opacity-80">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendar.map((day, index) => {
                const event = getEventForDay(day);
                const isToday = day === gameDate.day && selectedMonth === gameDate.month;

                return (
                  <div
                    key={index}
                    onClick={() => event && setSelectedEvent(event)}
                    className={`
                      aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                      ${day ? 'bg-white/10 hover:bg-white/20 cursor-pointer' : ''}
                      ${isToday ? 'ring-2 ring-yellow-400' : ''}
                      ${event ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' : ''}
                      transition-all
                    `}
                  >
                    {day && (
                      <>
                        <div className={`text-white ${isToday ? 'font-bold' : ''}`}>
                          {day}
                        </div>
                        {event && (
                          <div className="text-2xl mt-1">{event.icon}</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event List */}
          <div className="bg-black/30 backdrop-blur rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">이달의 이벤트</h3>
            <div className="space-y-3">
              {monthEvents.map(event => {
                const hasParticipated = participatedEvents.includes(event.id);

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`
                      bg-white/10 rounded-lg p-3 cursor-pointer transition-all
                      ${hasParticipated ? 'opacity-50' : 'hover:bg-white/20'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{event.name}</div>
                        <div className="text-xs text-white/70">
                          {event.month}월 {event.date}일 ({event.duration}일간)
                        </div>
                        {hasParticipated && (
                          <div className="text-xs text-green-400 mt-1">✓ 참가 완료</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {monthEvents.length === 0 && (
                <div className="text-white/50 text-center py-4">
                  이달은 이벤트가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-md w-full border-2 border-white/20">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{selectedEvent.icon}</div>
                <h2 className="text-2xl font-bold text-white">{selectedEvent.name}</h2>
                <div className="text-white/70 text-sm mt-2">
                  {selectedEvent.month}월 {selectedEvent.date}일 ~ {selectedEvent.date + selectedEvent.duration - 1}일
                </div>
              </div>

              <p className="text-white/90 mb-4">{selectedEvent.description}</p>

              {/* Requirements */}
              {selectedEvent.requirements && (
                <div className="bg-black/30 rounded-lg p-3 mb-4">
                  <div className="text-sm font-bold text-white mb-2">참가 조건</div>
                  {selectedEvent.requirements.level && (
                    <div className="text-white/70 text-sm">
                      레벨 {selectedEvent.requirements.level} 이상
                    </div>
                  )}
                  {selectedEvent.requirements.affection && (
                    <div className="text-white/70 text-sm">
                      호감도 조건 필요
                    </div>
                  )}
                </div>
              )}

              {/* Rewards */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-sm font-bold text-white mb-2">보상</div>
                <div className="space-y-1">
                  {selectedEvent.rewards.gold && (
                    <div className="text-yellow-400 text-sm">💰 {selectedEvent.rewards.gold} 골드</div>
                  )}
                  {selectedEvent.rewards.exp && (
                    <div className="text-blue-400 text-sm">⭐ {selectedEvent.rewards.exp} EXP</div>
                  )}
                  {selectedEvent.rewards.affection && (
                    <div className="text-pink-400 text-sm">❤️ 호감도 상승</div>
                  )}
                  {selectedEvent.rewards.items && (
                    <div className="text-green-400 text-sm">📦 특별 아이템</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => participateInEvent(selectedEvent)}
                  disabled={participatedEvents.includes(selectedEvent.id)}
                  className={`
                    flex-1 py-3 rounded-lg font-bold transition-all
                    ${participatedEvents.includes(selectedEvent.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    }
                  `}
                >
                  {participatedEvents.includes(selectedEvent.id) ? '참가 완료' : '참가하기'}
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;