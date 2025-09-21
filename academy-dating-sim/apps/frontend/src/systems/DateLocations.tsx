import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useRomanceSystem, DATE_LOCATIONS, DateLocation, DateActivity } from './RomanceSystem';

// Extended date activities with detailed interactions
export const EXTENDED_DATE_ACTIVITIES: Record<string, DateActivity> = {
  // School Cafe Activities
  coffee_chat: {
    id: 'coffee_chat',
    name: '커피와 대화',
    duration: 60,
    romanticBonus: 10,
    intimacyBonus: 5,
    dialogue: [
      '따뜻한 커피 향이 두 사람 사이에 퍼진다.',
      '"이렇게 여유롭게 대화할 시간이 생겨서 좋아요."',
      '자연스럽게 손이 테이블 위에서 가까워진다.'
    ],
    outcomes: {
      success: {
        affectionChange: 8,
        romanticTensionChange: 12,
        message: '따뜻한 커피와 함께한 대화가 두 사람의 마음을 더 가깝게 만들었습니다.'
      },
      failure: {
        affectionChange: 2,
        romanticTensionChange: 3,
        message: '대화가 어색했지만 그래도 함께한 시간이 소중했습니다.'
      }
    }
  },

  study_date: {
    id: 'study_date',
    name: '함께 공부하기',
    duration: 90,
    romanticBonus: 5,
    intimacyBonus: 8,
    requiredStats: { intelligence: 15 },
    dialogue: [
      '나란히 앉아 책을 펼친다.',
      '"이 문제 어떻게 풀어야 할까요?"',
      '가르쳐주려다 자연스럽게 어깨가 맞닿는다.'
    ],
    outcomes: {
      success: {
        affectionChange: 10,
        romanticTensionChange: 8,
        message: '함께 공부하며 서로의 지적인 면을 발견하고 더 가까워졌습니다.'
      },
      failure: {
        affectionChange: 3,
        romanticTensionChange: 2,
        message: '공부에 집중하느라 로맨틱한 분위기는 별로 나지 않았습니다.'
      }
    }
  },

  dessert_sharing: {
    id: 'dessert_sharing',
    name: '디저트 나눠먹기',
    duration: 45,
    romanticBonus: 15,
    intimacyBonus: 12,
    dialogue: [
      '달콤한 케이크를 주문한다.',
      '"한 입 드셔보세요."',
      '같은 포크를 사용하며 자연스러운 간접키스가 이뤄진다.'
    ],
    outcomes: {
      success: {
        affectionChange: 12,
        romanticTensionChange: 18,
        message: '달콤한 디저트를 나누며 설레는 순간을 만들었습니다.'
      },
      failure: {
        affectionChange: 5,
        romanticTensionChange: 7,
        message: '디저트는 맛있었지만 조금 어색한 분위기였습니다.'
      }
    }
  },

  // Garden Activities
  flower_viewing: {
    id: 'flower_viewing',
    name: '꽃구경하기',
    duration: 75,
    romanticBonus: 20,
    intimacyBonus: 10,
    dialogue: [
      '아름다운 꽃들이 만개한 정원을 거닐다.',
      '"이 꽃만큼 아름다우시네요."',
      '꽃향기에 취해 자연스럽게 가까워진다.'
    ],
    outcomes: {
      success: {
        affectionChange: 15,
        romanticTensionChange: 22,
        message: '아름다운 꽃들 사이에서 로맨틱한 분위기를 만끽했습니다.'
      },
      failure: {
        affectionChange: 8,
        romanticTensionChange: 10,
        message: '꽃은 예뻤지만 특별한 감정은 생기지 않았습니다.'
      }
    }
  },

  romantic_walk: {
    id: 'romantic_walk',
    name: '로맨틱한 산책',
    duration: 90,
    romanticBonus: 25,
    intimacyBonus: 15,
    dialogue: [
      '나란히 걸으며 소소한 이야기를 나눈다.',
      '"당신과 함께 걷는 이 시간이 행복해요."',
      '어느새 손이 자연스럽게 마주잡힌다.'
    ],
    outcomes: {
      success: {
        affectionChange: 18,
        romanticTensionChange: 25,
        message: '손을 잡고 걸으며 진정한 연인의 기분을 느꼈습니다.'
      },
      failure: {
        affectionChange: 8,
        romanticTensionChange: 12,
        message: '산책은 즐거웠지만 로맨틱하지는 못했습니다.'
      }
    }
  },

  bench_talk: {
    id: 'bench_talk',
    name: '벤치에서 깊은 대화',
    duration: 60,
    romanticBonus: 12,
    intimacyBonus: 20,
    dialogue: [
      '조용한 벤치에 나란히 앉는다.',
      '"당신에 대해 더 알고 싶어요."',
      '진솔한 대화를 나누며 마음이 통한다.'
    ],
    outcomes: {
      success: {
        affectionChange: 12,
        romanticTensionChange: 15,
        message: '깊은 대화를 통해 서로의 내면을 이해하게 되었습니다.'
      },
      failure: {
        affectionChange: 5,
        romanticTensionChange: 5,
        message: '대화를 나누었지만 별다른 감정 변화는 없었습니다.'
      }
    }
  },

  // Movie Theater Activities
  movie_watching: {
    id: 'movie_watching',
    name: '영화 감상',
    duration: 120,
    romanticBonus: 15,
    intimacyBonus: 18,
    dialogue: [
      '어둠 속에서 함께 영화를 본다.',
      '무서운 장면에서 자연스럽게 팔짱을 낀다.',
      '감동적인 장면에서 눈물을 훔치는 모습이 사랑스럽다.'
    ],
    outcomes: {
      success: {
        affectionChange: 15,
        romanticTensionChange: 20,
        message: '어둠 속에서 함께한 영화 관람이 특별한 추억이 되었습니다.'
      },
      failure: {
        affectionChange: 8,
        romanticTensionChange: 10,
        message: '영화는 재미있었지만 로맨틱한 분위기는 부족했습니다.'
      }
    }
  },

  popcorn_sharing: {
    id: 'popcorn_sharing',
    name: '팝콘 나눠먹기',
    duration: 30,
    romanticBonus: 8,
    intimacyBonus: 15,
    dialogue: [
      '큰 팝콘 하나를 주문한다.',
      '동시에 손을 뻗어 손가락이 맞닿는다.',
      '"미안해요!" 하며 부끄러워하는 모습이 귀엽다.'
    ],
    outcomes: {
      success: {
        affectionChange: 10,
        romanticTensionChange: 15,
        message: '팝콘을 나누며 설레는 스킨십을 경험했습니다.'
      },
      failure: {
        affectionChange: 5,
        romanticTensionChange: 8,
        message: '팝콘은 맛있었지만 특별한 일은 없었습니다.'
      }
    }
  },

  hand_holding: {
    id: 'hand_holding',
    name: '손잡기',
    duration: 15,
    romanticBonus: 20,
    intimacyBonus: 25,
    dialogue: [
      '조심스럽게 손을 잡는다.',
      '"괜찮을까요?"',
      '따뜻한 손길이 마음을 전해준다.'
    ],
    outcomes: {
      success: {
        affectionChange: 20,
        romanticTensionChange: 30,
        message: '처음으로 손을 잡으며 특별한 관계로 발전했습니다.'
      },
      failure: {
        affectionChange: 5,
        romanticTensionChange: 10,
        message: '아직 손을 잡기에는 어색한 사이인 것 같습니다.'
      }
    }
  },

  // Amusement Park Activities
  roller_coaster: {
    id: 'roller_coaster',
    name: '롤러코스터 타기',
    duration: 90,
    romanticBonus: 18,
    intimacyBonus: 20,
    requiredStats: { strength: 12 },
    dialogue: [
      '스릴 넘치는 롤러코스터에 함께 탄다.',
      '"무서워요!" 하며 팔을 꽉 잡는다.',
      '함께 소리지르며 스릴을 만끽한다.'
    ],
    outcomes: {
      success: {
        affectionChange: 18,
        romanticTensionChange: 22,
        message: '스릴 넘치는 롤러코스터를 함께 타며 더욱 가까워졌습니다.'
      },
      failure: {
        affectionChange: 5,
        romanticTensionChange: 8,
        message: '놀이기구가 너무 무서워서 제대로 즐기지 못했습니다.'
      }
    }
  },

  ferris_wheel: {
    id: 'ferris_wheel',
    name: '관람차 타기',
    duration: 60,
    romanticBonus: 30,
    intimacyBonus: 25,
    dialogue: [
      '높은 곳에서 도시 전체를 내려다본다.',
      '"정말 아름다운 경치네요."',
      '밀폐된 공간에서 둘만의 특별한 시간을 갖는다.'
    ],
    outcomes: {
      success: {
        affectionChange: 25,
        romanticTensionChange: 35,
        message: '관람차 위에서 로맨틱한 분위기 속에 특별한 순간을 보냈습니다.'
      },
      failure: {
        affectionChange: 12,
        romanticTensionChange: 15,
        message: '경치는 좋았지만 어색한 침묵이 흘렀습니다.'
      }
    }
  },

  // Beach Activities
  beach_walk: {
    id: 'beach_walk',
    name: '해변 산책',
    duration: 90,
    romanticBonus: 25,
    intimacyBonus: 20,
    dialogue: [
      '파도 소리를 들으며 모래사장을 걷는다.',
      '시원한 바닷바람이 두 사람을 감싼다.',
      '발자국이 나란히 모래에 새겨진다.'
    ],
    outcomes: {
      success: {
        affectionChange: 20,
        romanticTensionChange: 28,
        message: '파도 소리와 함께한 해변 산책이 로맨틱한 추억이 되었습니다.'
      },
      failure: {
        affectionChange: 10,
        romanticTensionChange: 15,
        message: '해변은 아름다웠지만 특별한 감정은 생기지 않았습니다.'
      }
    }
  },

  sunrise_watching: {
    id: 'sunrise_watching',
    name: '일출 감상',
    duration: 120,
    romanticBonus: 35,
    intimacyBonus: 30,
    dialogue: [
      '새벽 바다에서 일출을 기다린다.',
      '"당신과 함께 보는 일출이라서 더 아름다워요."',
      '태양이 떠오르는 순간 서로를 바라본다.'
    ],
    outcomes: {
      success: {
        affectionChange: 30,
        romanticTensionChange: 40,
        message: '함께 본 일출이 평생 잊지 못할 로맨틱한 순간이 되었습니다.'
      },
      failure: {
        affectionChange: 15,
        romanticTensionChange: 20,
        message: '일출은 아름다웠지만 피곤해서 제대로 즐기지 못했습니다.'
      }
    }
  },

  // Restaurant Activities
  candlelight_dinner: {
    id: 'candlelight_dinner',
    name: '촛불 디너',
    duration: 120,
    romanticBonus: 40,
    intimacyBonus: 35,
    requiredStats: { charm: 20 },
    dialogue: [
      '촛불이 켜진 로맨틱한 테이블에 앉는다.',
      '"이런 멋진 곳에 초대해주셔서 고마워요."',
      '촛불 아래에서 더욱 아름다워 보이는 상대방.'
    ],
    outcomes: {
      success: {
        affectionChange: 35,
        romanticTensionChange: 45,
        message: '촛불 아래에서의 디너가 완벽한 로맨틱 데이트가 되었습니다.'
      },
      failure: {
        affectionChange: 15,
        romanticTensionChange: 20,
        message: '분위기는 좋았지만 너무 긴장해서 어색했습니다.'
      }
    }
  },

  stargazing: {
    id: 'stargazing',
    name: '별 보기',
    duration: 90,
    romanticBonus: 30,
    intimacyBonus: 25,
    dialogue: [
      '옥상에서 밤하늘의 별들을 올려다본다.',
      '"저 별처럼 우리도 영원히 함께 있을까요?"',
      '별빛 아래에서 서로의 손을 꼭 잡는다.'
    ],
    outcomes: {
      success: {
        affectionChange: 25,
        romanticTensionChange: 35,
        message: '별빛 아래에서 로맨틱한 시간을 보내며 더욱 가까워졌습니다.'
      },
      failure: {
        affectionChange: 12,
        romanticTensionChange: 18,
        message: '별은 예뻤지만 구름이 많아서 아쉬웠습니다.'
      }
    }
  }
};

// Date planning and execution system
interface DatePlan {
  id: string;
  characterId: string;
  locationId: string;
  activities: string[];
  totalDuration: number;
  totalCost: number;
  plannedDate: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  results?: DateResults;
}

interface DateResults {
  overallSuccess: boolean;
  totalAffectionGained: number;
  totalRomanticTensionGained: number;
  memoriesCreated: string[];
  relationshipProgression?: string;
}

// Hook for date management
export const useDateSystem = () => {
  const { player, actions } = useGameStore();
  const {
    getRelationshipStage,
    getAvailableDateLocations,
    calculateDateSuccess,
    addRomanceMemory,
    updateRelationshipProgression
  } = useRomanceSystem();

  const [currentDatePlan, setCurrentDatePlan] = useState<DatePlan | null>(null);
  const [isOnDate, setIsOnDate] = useState(false);

  const planDate = (characterId: string, locationId: string, activityIds: string[]): DatePlan | null => {
    const location = DATE_LOCATIONS.find(loc => loc.id === locationId);
    if (!location) return null;

    const activities = activityIds.map(id => EXTENDED_DATE_ACTIVITIES[id]).filter(Boolean);
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCost = Math.ceil(totalDuration / 60) * location.costPerHour;

    // Check if player can afford the date
    if (player.money < totalCost) {
      actions.updatePlayer({
        gameMessage: `데이트 비용이 부족합니다. 필요한 금액: ${totalCost}원, 보유 금액: ${player.money}원`
      });
      return null;
    }

    // Check relationship stage requirement
    const currentStage = getRelationshipStage(characterId);
    const requiredStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.status === location.requiredRelationshipStage);
    const currentStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.status === currentStage.status);

    if (currentStageIndex < requiredStageIndex) {
      actions.updatePlayer({
        gameMessage: `아직 ${location.name}에서 데이트하기에는 관계가 충분히 발전하지 않았습니다.`
      });
      return null;
    }

    const datePlan: DatePlan = {
      id: `date_${characterId}_${Date.now()}`,
      characterId,
      locationId,
      activities: activityIds,
      totalDuration,
      totalCost,
      plannedDate: Date.now(),
      status: 'planned'
    };

    return datePlan;
  };

  const executeDate = async (datePlan: DatePlan): Promise<DateResults> => {
    setCurrentDatePlan(datePlan);
    setIsOnDate(true);

    const location = DATE_LOCATIONS.find(loc => loc.id === datePlan.locationId)!;
    let totalAffectionGained = 0;
    let totalRomanticTensionGained = 0;
    const memoriesCreated: string[] = [];

    // Deduct cost
    actions.updateMoney(-datePlan.totalCost);

    // Execute each activity
    for (const activityId of datePlan.activities) {
      const activity = EXTENDED_DATE_ACTIVITIES[activityId];
      if (!activity) continue;

      const success = calculateDateSuccess(datePlan.characterId, activityId);
      const outcome = success ? activity.outcomes.success : activity.outcomes.failure;

      totalAffectionGained += outcome.affectionChange;
      totalRomanticTensionGained += outcome.romanticTensionChange;

      // Update affection
      updateRelationshipProgression(datePlan.characterId, outcome.affectionChange);

      // Create memory
      addRomanceMemory(datePlan.characterId, {
        characterId: datePlan.characterId,
        title: `${location.name}에서의 ${activity.name}`,
        description: outcome.message,
        type: 'date',
        emotionalWeight: Math.max(3, outcome.affectionChange)
      });

      memoriesCreated.push(activity.name);

      // Simulate time passage
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate overall success
    const overallSuccess = totalAffectionGained > datePlan.activities.length * 5;

    // Check for relationship progression
    const newStage = getRelationshipStage(datePlan.characterId);
    const relationshipProgression = `${newStage.name} 단계`;

    const results: DateResults = {
      overallSuccess,
      totalAffectionGained,
      totalRomanticTensionGained,
      memoriesCreated,
      relationshipProgression
    };

    // Update date plan
    const completedPlan = {
      ...datePlan,
      status: 'completed' as const,
      results
    };

    setCurrentDatePlan(completedPlan);
    setIsOnDate(false);

    // Store completed date in game state
    const completedDates = player.flags.completed_dates || [];
    actions.updatePlayer({
      flags: {
        ...player.flags,
        completed_dates: [...completedDates, completedPlan]
      }
    });

    return results;
  };

  const getDateHistory = (characterId: string): DatePlan[] => {
    const completedDates = player.flags.completed_dates || [];
    return completedDates.filter((date: DatePlan) => date.characterId === characterId);
  };

  const getDateSuggestions = (characterId: string): { location: DateLocation; activities: DateActivity[] }[] => {
    const availableLocations = getAvailableDateLocations(characterId);
    const stage = getRelationshipStage(characterId);

    return availableLocations.map(location => {
      // Filter activities based on relationship stage and player stats
      const suitableActivities = location.availableActivities
        .map(actId => EXTENDED_DATE_ACTIVITIES[typeof actId === 'string' ? actId : actId.id])
        .filter(activity => {
          if (!activity) return false;

          // Check stat requirements
          if (activity.requiredStats) {
            if (activity.requiredStats.charm && player.stats.charm < activity.requiredStats.charm) return false;
            if (activity.requiredStats.intelligence && player.stats.intelligence < activity.requiredStats.intelligence) return false;
            if (activity.requiredStats.strength && player.stats.strength < activity.requiredStats.strength) return false;
          }

          return true;
        });

      return {
        location,
        activities: suitableActivities
      };
    }).filter(suggestion => suggestion.activities.length > 0);
  };

  return {
    planDate,
    executeDate,
    getDateHistory,
    getDateSuggestions,
    currentDatePlan,
    isOnDate,
    EXTENDED_DATE_ACTIVITIES,
    DATE_LOCATIONS
  };
};

// Date Planning UI Component
export const DatePlanningInterface: React.FC<{
  characterId: string;
  onDatePlanned: (datePlan: DatePlan) => void;
}> = ({ characterId, onDatePlanned }) => {
  const { player } = useGameStore();
  const { planDate, getDateSuggestions } = useDateSystem();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const suggestions = getDateSuggestions(characterId);
  const selectedLocationData = suggestions.find(s => s.location.id === selectedLocation);

  const handlePlanDate = () => {
    if (!selectedLocation || selectedActivities.length === 0) {
      alert('장소와 활동을 선택해주세요.');
      return;
    }

    const datePlan = planDate(characterId, selectedLocation, selectedActivities);
    if (datePlan) {
      onDatePlanned(datePlan);
    }
  };

  const calculateTotalCost = () => {
    if (!selectedLocationData) return 0;
    const totalDuration = selectedActivities
      .map(id => EXTENDED_DATE_ACTIVITIES[id])
      .filter(Boolean)
      .reduce((sum, activity) => sum + activity.duration, 0);
    return Math.ceil(totalDuration / 60) * selectedLocationData.location.costPerHour;
  };

  return (
    <div className="date-planning bg-gradient-to-br from-rose-100 to-pink-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-rose-800 mb-4">데이트 계획하기</h2>

      {/* Location Selection */}
      <div className="location-selection mb-6">
        <h3 className="text-lg font-semibold text-rose-700 mb-3">장소 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map(({ location }) => (
            <button
              key={location.id}
              onClick={() => {
                setSelectedLocation(location.id);
                setSelectedActivities([]);
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedLocation === location.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-rose-200 bg-white hover:border-rose-300'
              }`}
            >
              <div className="font-semibold text-rose-800">{location.name}</div>
              <div className="text-sm text-gray-600">{location.description}</div>
              <div className="text-sm text-rose-600 mt-2">
                {location.costPerHour}원/시간 | {location.mood} 분위기
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Selection */}
      {selectedLocationData && (
        <div className="activity-selection mb-6">
          <h3 className="text-lg font-semibold text-rose-700 mb-3">활동 선택</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedLocationData.activities.map(activity => (
              <label
                key={activity.id}
                className="flex items-start p-3 border border-rose-200 rounded-lg hover:bg-rose-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedActivities([...selectedActivities, activity.id]);
                    } else {
                      setSelectedActivities(selectedActivities.filter(id => id !== activity.id));
                    }
                  }}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-rose-800">{activity.name}</div>
                  <div className="text-sm text-gray-600">{activity.duration}분</div>
                  <div className="text-sm text-rose-600">
                    로맨틱 +{activity.romanticBonus} | 친밀도 +{activity.intimacyBonus}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Date Summary */}
      {selectedLocation && selectedActivities.length > 0 && (
        <div className="date-summary bg-white p-4 rounded-lg shadow-sm mb-4">
          <h4 className="font-semibold text-rose-700 mb-2">데이트 요약</h4>
          <div className="text-sm text-gray-700">
            <div>장소: {selectedLocationData?.location.name}</div>
            <div>활동 수: {selectedActivities.length}개</div>
            <div>예상 소요시간: {selectedActivities
              .map(id => EXTENDED_DATE_ACTIVITIES[id])
              .filter(Boolean)
              .reduce((sum, activity) => sum + activity.duration, 0)}분</div>
            <div>예상 비용: {calculateTotalCost()}원</div>
            <div className="mt-2">
              <span className="font-medium">보유 금액: {player.money}원</span>
              {player.money < calculateTotalCost() && (
                <span className="text-red-600 ml-2">(부족함)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Date Button */}
      <button
        onClick={handlePlanDate}
        disabled={!selectedLocation || selectedActivities.length === 0 || player.money < calculateTotalCost()}
        className="w-full py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        데이트 계획하기
      </button>
    </div>
  );
};

// Date Execution UI Component
export const DateExecutionInterface: React.FC<{
  datePlan: DatePlan;
  onDateComplete: (results: DateResults) => void;
}> = ({ datePlan, onDateComplete }) => {
  const { executeDate } = useDateSystem();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const location = DATE_LOCATIONS.find(loc => loc.id === datePlan.locationId)!;
  const currentActivity = EXTENDED_DATE_ACTIVITIES[datePlan.activities[currentActivityIndex]];

  const handleStartDate = async () => {
    setIsExecuting(true);
    const results = await executeDate(datePlan);
    onDateComplete(results);
    setIsExecuting(false);
  };

  return (
    <div className="date-execution bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">
        {location.name}에서의 데이트
      </h2>

      {!isExecuting ? (
        <div className="date-preview">
          <div className="location-info bg-white p-4 rounded-lg shadow-sm mb-4">
            <h3 className="font-semibold text-purple-700 mb-2">장소 정보</h3>
            <p className="text-gray-700">{location.description}</p>
            <div className="mt-2 text-sm text-purple-600">
              {location.mood} 분위기 | 총 비용: {datePlan.totalCost}원
            </div>
          </div>

          <div className="activities-preview bg-white p-4 rounded-lg shadow-sm mb-4">
            <h3 className="font-semibold text-purple-700 mb-2">예정된 활동</h3>
            <div className="space-y-2">
              {datePlan.activities.map((activityId, index) => {
                const activity = EXTENDED_DATE_ACTIVITIES[activityId];
                return (
                  <div key={activityId} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="font-medium">{index + 1}. {activity?.name}</span>
                    <span className="text-sm text-gray-600">{activity?.duration}분</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStartDate}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            데이트 시작하기
          </button>
        </div>
      ) : (
        <div className="date-progress">
          <div className="progress-bar bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((currentActivityIndex + 1) / datePlan.activities.length) * 100}%` }}
            />
          </div>

          {currentActivity && (
            <div className="current-activity bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-700 mb-2">{currentActivity.name}</h3>
              <div className="dialogue space-y-2">
                {currentActivity.dialogue.map((line, index) => (
                  <p key={index} className="text-gray-700 italic">"{line}"</p>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-4 text-purple-600">
            데이트 진행 중... ({currentActivityIndex + 1}/{datePlan.activities.length})
          </div>
        </div>
      )}
    </div>
  );
};

// Date Results Display Component
export const DateResultsDisplay: React.FC<{ results: DateResults; characterId: string }> = ({ results, characterId }) => {
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
    <div className="date-results bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-green-800 mb-4">
        {results.overallSuccess ? '성공적인 데이트!' : '아쉬운 데이트'}
      </h2>

      <div className="results-summary bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{results.totalAffectionGained}</div>
            <div className="text-sm text-gray-600">호감도 증가</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">+{results.totalRomanticTensionGained}</div>
            <div className="text-sm text-gray-600">로맨틱 텐션 증가</div>
          </div>
        </div>
      </div>

      <div className="relationship-status bg-white p-4 rounded-lg shadow-sm mb-4">
        <h3 className="font-semibold text-green-700 mb-2">관계 변화</h3>
        <p className="text-gray-700">
          {characterName}와의 관계가 <span className="font-semibold text-green-600">{results.relationshipProgression}</span>로 발전했습니다.
        </p>
      </div>

      <div className="memories-created bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-green-700 mb-2">만들어진 추억</h3>
        <div className="flex flex-wrap gap-2">
          {results.memoriesCreated.map((memory, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {memory}
            </span>
          ))}
        </div>
      </div>

      {results.overallSuccess && (
        <div className="success-message mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-center font-medium">
            💕 {characterName}와 함께한 멋진 데이트였습니다!
          </p>
        </div>
      )}
    </div>
  );
};

export default {
  useDateSystem,
  DatePlanningInterface,
  DateExecutionInterface,
  DateResultsDisplay,
  EXTENDED_DATE_ACTIVITIES
};