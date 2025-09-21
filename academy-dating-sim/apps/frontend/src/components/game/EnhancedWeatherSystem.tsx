import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface Weather {
  id: string;
  name: string;
  icon: string;
  description: string;
  effects: {
    movementSpeed?: number;
    staminaDrain?: number;
    moodModifier?: number;
    encounterRate?: number;
    cropGrowth?: number;
    fishingBonus?: number;
    combatModifier?: number;
  };
  particleEffect?: 'rain' | 'snow' | 'leaves' | 'petals' | 'fog' | 'dust';
  bgFilter?: string;
  activities: string[];
  blockedActivities?: string[];
  specialEvents?: string[];
}

interface SeasonalWeather {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  commonWeathers: string[];
  rareWeathers: string[];
  specialEvents: string[];
  seasonalBonus: {
    stat: string;
    value: number;
  };
}

interface WeatherEvent {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: any;
  rewards?: {
    exp?: number;
    money?: number;
    items?: string[];
    affection?: { character: string; amount: number }[];
  };
}

const EnhancedWeatherSystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const gameDate = useGameStore((state: any) => state.gameDate);
  const { updateStats, advanceTime, updateAffection, addItem, gainExperience, addGold } = useGameStore((state: any) => state.actions);

  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Weather[]>([]);
  const [weatherHistory, setWeatherHistory] = useState<string[]>([]);
  const [activeEvent, setActiveEvent] = useState<WeatherEvent | null>(null);
  const [weatherStreak, setWeatherStreak] = useState({ type: '', count: 0 });
  const [particleAnimation, setParticleAnimation] = useState(true);

  // Enhanced weather types
  const weathers: Record<string, Weather> = {
    sunny: {
      id: 'sunny',
      name: '맑음',
      icon: '☀️',
      description: '화창한 날씨입니다. 야외 활동하기 좋은 날이에요.',
      effects: {
        moodModifier: 10,
        staminaDrain: -5,
        encounterRate: 1.2,
        combatModifier: 5
      },
      activities: ['산책', '피크닉', '운동', '사진촬영', '테니스'],
      bgFilter: 'brightness(1.1) contrast(1.05) saturate(1.1)'
    },
    cloudy: {
      id: 'cloudy',
      name: '흐림',
      icon: '☁️',
      description: '구름이 많은 날입니다. 선선한 바람이 불어요.',
      effects: {
        moodModifier: 0,
        staminaDrain: 0
      },
      activities: ['독서', '카페', '쇼핑', '미술'],
      bgFilter: 'brightness(0.9) contrast(0.95)'
    },
    rainy: {
      id: 'rainy',
      name: '비',
      icon: '🌧️',
      description: '비가 내리고 있습니다. 우산을 꼭 챙기세요.',
      effects: {
        movementSpeed: -20,
        moodModifier: -5,
        encounterRate: 0.7,
        cropGrowth: 1.5,
        combatModifier: -10
      },
      particleEffect: 'rain',
      activities: ['도서관', '실내 데이트', '영화관람', '요리', '보드게임'],
      blockedActivities: ['피크닉', '야외운동', '테니스'],
      bgFilter: 'brightness(0.7) contrast(1.1) saturate(0.8)'
    },
    stormy: {
      id: 'stormy',
      name: '폭풍',
      icon: '⛈️',
      description: '강한 폭풍이 몰아치고 있습니다. 외출을 자제하세요.',
      effects: {
        movementSpeed: -50,
        moodModifier: -15,
        staminaDrain: 20,
        encounterRate: 0.3,
        combatModifier: -25
      },
      particleEffect: 'rain',
      activities: ['휴식', '요리', '게임', '음악감상'],
      blockedActivities: ['산책', '피크닉', '야외운동', '낚시', '쇼핑'],
      specialEvents: ['정전', '번개구경'],
      bgFilter: 'brightness(0.5) contrast(1.2) saturate(0.6)'
    },
    snowy: {
      id: 'snowy',
      name: '눈',
      icon: '❄️',
      description: '눈이 내리고 있습니다. 로맨틱한 분위기가 연출됩니다.',
      effects: {
        movementSpeed: -15,
        moodModifier: 15,
        encounterRate: 0.8,
        cropGrowth: 0.3,
        fishingBonus: -20
      },
      particleEffect: 'snow',
      activities: ['눈사람 만들기', '눈싸움', '따뜻한 음료', '스케이트', '썰매'],
      specialEvents: ['화이트 크리스마스', '눈축제'],
      bgFilter: 'brightness(1.2) contrast(0.9) saturate(0.7)'
    },
    foggy: {
      id: 'foggy',
      name: '안개',
      icon: '🌫️',
      description: '짙은 안개가 끼어있습니다. 시야가 제한됩니다.',
      effects: {
        movementSpeed: -10,
        encounterRate: 1.5,
        moodModifier: 5,
        combatModifier: -15
      },
      particleEffect: 'fog',
      activities: ['미스터리 탐험', '조용한 산책', '명상'],
      specialEvents: ['신비한 만남'],
      bgFilter: 'brightness(0.8) contrast(0.7) blur(0.5px)'
    },
    windy: {
      id: 'windy',
      name: '강풍',
      icon: '💨',
      description: '강한 바람이 불고 있습니다.',
      effects: {
        staminaDrain: 10,
        fishingBonus: -20,
        movementSpeed: -5
      },
      particleEffect: 'leaves',
      activities: ['연날리기', '윈드서핑', '실내활동'],
      bgFilter: 'contrast(1.05)'
    },
    rainbow: {
      id: 'rainbow',
      name: '무지개',
      icon: '🌈',
      description: '비 온 뒤 아름다운 무지개가 떴습니다!',
      effects: {
        moodModifier: 25,
        encounterRate: 2,
        fishingBonus: 30
      },
      activities: ['사진촬영', '소원빌기', '데이트', '보물찾기'],
      specialEvents: ['무지개 축복'],
      bgFilter: 'brightness(1.15) contrast(1.1) saturate(1.3)'
    },
    sakura: {
      id: 'sakura',
      name: '벚꽃',
      icon: '🌸',
      description: '벚꽃이 만개했습니다. 특별한 이벤트가 발생할 수 있습니다.',
      effects: {
        moodModifier: 20,
        encounterRate: 1.5
      },
      particleEffect: 'petals',
      activities: ['벚꽃 구경', '피크닉', '고백', '사진촬영'],
      specialEvents: ['벚꽃축제', '봄 데이트'],
      bgFilter: 'brightness(1.1) saturate(1.2) hue-rotate(5deg)'
    },
    meteor: {
      id: 'meteor',
      name: '유성우',
      icon: '💫',
      description: '밤하늘에 유성우가 쏟아집니다. 소원을 빌어보세요!',
      effects: {
        moodModifier: 30,
        encounterRate: 3
      },
      activities: ['별 관측', '소원빌기', '로맨틱 데이트', '천체 사진'],
      specialEvents: ['유성우 이벤트', '소원 성취'],
      bgFilter: 'brightness(0.6) contrast(1.3) saturate(1.5)'
    },
    heatwave: {
      id: 'heatwave',
      name: '폭염',
      icon: '🔥',
      description: '매우 더운 날씨입니다. 수분 보충을 잊지 마세요!',
      effects: {
        staminaDrain: 25,
        moodModifier: -10,
        combatModifier: -20
      },
      activities: ['수영', '아이스크림', '실내 휴식', '에어컨'],
      blockedActivities: ['운동', '등산'],
      bgFilter: 'brightness(1.2) contrast(1.1) saturate(0.9) sepia(0.1)'
    },
    aurora: {
      id: 'aurora',
      name: '오로라',
      icon: '🌌',
      description: '신비로운 오로라가 하늘을 수놓습니다.',
      effects: {
        moodModifier: 35,
        encounterRate: 2.5
      },
      activities: ['오로라 관측', '명상', '예술 창작'],
      specialEvents: ['오로라 축복', '신비한 힘'],
      bgFilter: 'brightness(0.7) contrast(1.2) saturate(1.5) hue-rotate(180deg)'
    }
  };

  // Weather events
  const weatherEvents: Record<string, WeatherEvent> = {
    rainbowBlessing: {
      id: 'rainbowBlessing',
      name: '무지개의 축복',
      description: '무지개를 본 모든 사람이 행운을 얻습니다!',
      duration: 1,
      effects: { luck: 10 },
      rewards: {
        exp: 100,
        money: 200,
        affection: [
          { character: 'sakura', amount: 5 },
          { character: 'luna', amount: 5 }
        ]
      }
    },
    sakuraFestival: {
      id: 'sakuraFestival',
      name: '벚꽃 축제',
      description: '학원에서 벚꽃 축제가 열립니다!',
      duration: 3,
      effects: { charm: 5 },
      rewards: {
        exp: 200,
        items: ['sakuraPetal', 'festivalTicket'],
        affection: [
          { character: 'sakura', amount: 10 },
          { character: 'yuki', amount: 7 }
        ]
      }
    },
    meteorShower: {
      id: 'meteorShower',
      name: '유성우 이벤트',
      description: '소원을 빌면 이루어질지도?',
      duration: 1,
      effects: { luck: 15, intelligence: 3 },
      rewards: {
        exp: 150,
        items: ['starFragment'],
        affection: [
          { character: 'luna', amount: 15 }
        ]
      }
    },
    snowFestival: {
      id: 'snowFestival',
      name: '눈 축제',
      description: '겨울의 낭만을 즐겨보세요!',
      duration: 2,
      effects: { agility: 3 },
      rewards: {
        exp: 180,
        money: 150,
        items: ['snowflake'],
        affection: [
          { character: 'yuki', amount: 12 }
        ]
      }
    }
  };

  // Seasonal weather patterns
  const seasonalPatterns: Record<string, SeasonalWeather> = {
    spring: {
      season: 'spring',
      commonWeathers: ['sunny', 'cloudy', 'rainy', 'windy'],
      rareWeathers: ['rainbow', 'sakura', 'foggy'],
      specialEvents: ['벚꽃축제', '봄맞이 행사'],
      seasonalBonus: { stat: 'charm', value: 2 }
    },
    summer: {
      season: 'summer',
      commonWeathers: ['sunny', 'heatwave', 'cloudy', 'stormy'],
      rareWeathers: ['rainbow', 'meteor'],
      specialEvents: ['여름축제', '불꽃놀이', '해변 이벤트'],
      seasonalBonus: { stat: 'stamina', value: 5 }
    },
    autumn: {
      season: 'autumn',
      commonWeathers: ['cloudy', 'windy', 'foggy', 'rainy'],
      rareWeathers: ['rainbow', 'aurora'],
      specialEvents: ['단풍축제', '수확제', '할로윈'],
      seasonalBonus: { stat: 'intelligence', value: 2 }
    },
    winter: {
      season: 'winter',
      commonWeathers: ['snowy', 'cloudy', 'foggy', 'stormy'],
      rareWeathers: ['sunny', 'meteor', 'aurora'],
      specialEvents: ['크리스마스', '눈축제', '신년행사'],
      seasonalBonus: { stat: 'defense', value: 3 }
    }
  };

  // Get current season
  const getCurrentSeason = (): string => {
    const month = gameDate?.month || 4;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  // Generate weather with patterns
  const generateWeather = useCallback((): Weather => {
    const season = getCurrentSeason();
    const pattern = seasonalPatterns[season];

    // Check for weather streaks
    if (weatherStreak.count >= 3 && Math.random() < 0.7) {
      // 70% chance to break the streak after 3 days
      const differentWeathers = Object.keys(weathers).filter(w => w !== weatherStreak.type);
      const newWeather = differentWeathers[Math.floor(Math.random() * differentWeathers.length)];
      return weathers[newWeather];
    }

    // Special weather events (10% chance)
    if (Math.random() < 0.1) {
      const rareWeather = pattern.rareWeathers[Math.floor(Math.random() * pattern.rareWeathers.length)];
      return weathers[rareWeather];
    }

    // Common weather (90% chance)
    const commonWeather = pattern.commonWeathers[Math.floor(Math.random() * pattern.commonWeathers.length)];
    return weathers[commonWeather];
  }, [weatherStreak, getCurrentSeason]);

  // Generate forecast
  const generateForecast = useCallback(() => {
    const newForecast: Weather[] = [];
    let lastWeather = currentWeather?.id || 'sunny';

    for (let i = 0; i < 7; i++) {
      const weather = generateWeather();
      newForecast.push(weather);
      lastWeather = weather.id;
    }
    setForecast(newForecast);
  }, [currentWeather, generateWeather]);

  // Apply weather effects
  const applyWeatherEffects = useCallback((weather: Weather) => {
    // Apply stat modifiers
    const effects = weather.effects;

    if (effects.moodModifier) {
      // Positive mood affects random heroine
      if (effects.moodModifier > 0) {
        const heroines = ['sakura', 'yuki', 'luna', 'akane', 'hana', 'rin', 'mei', 'sora'];
        const randomHeroine = heroines[Math.floor(Math.random() * heroines.length)];
        updateAffection(randomHeroine, Math.floor(effects.moodModifier / 5));
      }
    }

    // Check for special events
    if (weather.specialEvents) {
      weather.specialEvents.forEach(eventName => {
        if (Math.random() < 0.3) { // 30% chance for each special event
          const event = Object.values(weatherEvents).find(e => e.name === eventName);
          if (event) {
            setActiveEvent(event);
          }
        }
      });
    }

    // Update weather streak
    setWeatherStreak(prev => ({
      type: weather.id,
      count: prev.type === weather.id ? prev.count + 1 : 1
    }));

    // Store in history
    setWeatherHistory(prev => [...prev.slice(-6), weather.id]);
  }, [updateAffection]);

  // Weather activity handler
  const performWeatherActivity = useCallback((activity: string) => {
    if (!currentWeather) return;

    let statGains: any = {};
    let affectionGains: { character: string; amount: number }[] = [];

    // Activity-specific rewards
    switch (activity) {
      case '벚꽃 구경':
        statGains = { charm: 2, intelligence: 1 };
        affectionGains = [{ character: 'sakura', amount: 10 }];
        break;
      case '눈사람 만들기':
        statGains = { agility: 1, strength: 1 };
        affectionGains = [{ character: 'yuki', amount: 8 }];
        break;
      case '별 관측':
        statGains = { intelligence: 3 };
        affectionGains = [{ character: 'luna', amount: 12 }];
        break;
      case '소원빌기':
        statGains = { luck: 5 };
        break;
      case '수영':
        statGains = { stamina: 3, agility: 2 };
        break;
      case '명상':
        statGains = { intelligence: 2, maxMp: 5 };
        break;
      case '사진촬영':
        statGains = { charm: 2 };
        affectionGains = [{ character: 'mei', amount: 5 }];
        break;
      default:
        statGains = { charm: 1 };
    }

    // Apply seasonal bonus
    const season = seasonalPatterns[getCurrentSeason()];
    if (season.seasonalBonus) {
      statGains[season.seasonalBonus.stat] = (statGains[season.seasonalBonus.stat] || 0) + season.seasonalBonus.value;
    }

    // Apply gains
    updateStats(statGains);
    affectionGains.forEach(gain => updateAffection(gain.character, gain.amount));
    gainExperience(20 + Math.floor(Math.random() * 30));

    advanceTime();
  }, [currentWeather, getCurrentSeason, updateStats, updateAffection, gainExperience, advanceTime]);

  // Handle weather event
  const handleWeatherEvent = useCallback(() => {
    if (!activeEvent) return;

    // Apply event rewards
    if (activeEvent.rewards) {
      if (activeEvent.rewards.exp) gainExperience(activeEvent.rewards.exp);
      if (activeEvent.rewards.money) addGold(activeEvent.rewards.money);
      if (activeEvent.rewards.items) {
        activeEvent.rewards.items.forEach(item => addItem(item));
      }
      if (activeEvent.rewards.affection) {
        activeEvent.rewards.affection.forEach(aff =>
          updateAffection(aff.character, aff.amount)
        );
      }
    }

    // Apply event effects
    if (activeEvent.effects) {
      updateStats(activeEvent.effects);
    }

    setActiveEvent(null);
  }, [activeEvent, gainExperience, addGold, addItem, updateAffection, updateStats]);

  // Initialize weather
  useEffect(() => {
    const weather = generateWeather();
    setCurrentWeather(weather);
    generateForecast();
    applyWeatherEffects(weather);
  }, [player.day]);

  // Render weather particles
  const renderWeatherParticles = () => {
    if (!currentWeather?.particleEffect || !particleAnimation) return null;

    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 2;
      const size = Math.random() * 20 + 10;
      const left = Math.random() * 100;

      const particleStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        animation: `fall ${duration}s linear ${delay}s infinite`
      };

      switch (currentWeather.particleEffect) {
        case 'rain':
          particles.push(
            <div
              key={i}
              style={{
                ...particleStyle,
                width: '2px',
                height: `${size}px`,
                background: 'linear-gradient(to bottom, transparent, #6B7FD7)',
                opacity: 0.3
              }}
            />
          );
          break;
        case 'snow':
          particles.push(
            <div
              key={i}
              style={{
                ...particleStyle,
                fontSize: `${size}px`,
                opacity: 0.7,
                animation: `fall ${duration * 2}s linear ${delay}s infinite`
              }}
            >
              ❄
            </div>
          );
          break;
        case 'petals':
          particles.push(
            <div
              key={i}
              style={{
                ...particleStyle,
                fontSize: `${size}px`,
                color: '#FFC0CB',
                opacity: 0.6,
                animation: `fall-rotate ${duration * 1.5}s linear ${delay}s infinite`
              }}
            >
              🌸
            </div>
          );
          break;
        case 'leaves':
          particles.push(
            <div
              key={i}
              style={{
                ...particleStyle,
                fontSize: `${size}px`,
                color: '#FF8C00',
                opacity: 0.5,
                animation: `fall-rotate ${duration * 1.5}s linear ${delay}s infinite`
              }}
            >
              🍂
            </div>
          );
          break;
      }
    }

    return (
      <>
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {particles}
        </div>
        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh);
            }
          }
          @keyframes fall-rotate {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-background p-4"
         style={{ filter: currentWeather?.bgFilter }}>
      {/* Weather Particles */}
      {renderWeatherParticles()}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                🌤️ 날씨 & 계절 시스템
              </h1>
              <p className="text-text-secondary">
                날씨에 따라 다양한 활동과 이벤트를 즐겨보세요!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setParticleAnimation(!particleAnimation)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {particleAnimation ? '🎬 효과 ON' : '🎬 효과 OFF'}
              </button>
              <button
                onClick={() => navigate('/game')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                🏠 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* Active Event Banner */}
        {activeEvent && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h2 className="text-2xl font-bold">{activeEvent.name}</h2>
                <p>{activeEvent.description}</p>
              </div>
              <button
                onClick={handleWeatherEvent}
                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-yellow-100 transition"
              >
                참여하기
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Display */}
          <div className="lg:col-span-2">
            {currentWeather && (
              <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-400">
                {/* Current Weather */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-7xl">{currentWeather.icon}</span>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{currentWeather.name}</h2>
                        <p className="text-gray-300">{currentWeather.description}</p>
                        <div className="text-sm text-gray-400 mt-1">
                          {getCurrentSeason() === 'spring' && '🌸 봄'}
                          {getCurrentSeason() === 'summer' && '☀️ 여름'}
                          {getCurrentSeason() === 'autumn' && '🍂 가을'}
                          {getCurrentSeason() === 'winter' && '❄️ 겨울'} · Day {player.day}
                        </div>
                      </div>
                    </div>
                    {weatherStreak.count >= 3 && (
                      <div className="bg-purple-500/20 rounded-lg px-3 py-1 border border-purple-500/50">
                        <span className="text-purple-300 text-sm">
                          {weatherStreak.count}일 연속
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Weather Effects Grid */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">날씨 효과</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(currentWeather.effects).map(([key, value]) => {
                        const effectNames: Record<string, string> = {
                          moodModifier: '😊 기분',
                          movementSpeed: '🏃 이동속도',
                          staminaDrain: '💪 스태미나',
                          encounterRate: '👥 만남 확률',
                          cropGrowth: '🌱 작물 성장',
                          fishingBonus: '🎣 낚시',
                          combatModifier: '⚔️ 전투력'
                        };

                        return (
                          <div key={key} className="flex items-center justify-between bg-blue-900/30 rounded px-2 py-1">
                            <span className="text-gray-300">{effectNames[key]}</span>
                            <span className={value > 0 ? 'text-green-400 font-bold' : value < 0 ? 'text-red-400 font-bold' : 'text-gray-400'}>
                              {value > 0 ? '+' : ''}{typeof value === 'number' ? value : `x${value}`}
                              {key.includes('Bonus') || key.includes('Speed') || key.includes('Rate') ? '%' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Activities Section */}
                <div className="space-y-4">
                  {/* Recommended Activities */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">🎯 추천 활동</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {currentWeather.activities.map(activity => (
                        <button
                          key={activity}
                          onClick={() => performWeatherActivity(activity)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white transition-all hover:scale-105"
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Activities */}
                  {currentWeather.blockedActivities && currentWeather.blockedActivities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">🚫 불가능한 활동</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentWeather.blockedActivities.map(activity => (
                          <div
                            key={activity}
                            className="px-4 py-2 bg-red-900/30 rounded-lg text-red-400 line-through"
                          >
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weather Statistics */}
            <div className="mt-6 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
              <h2 className="text-xl font-bold text-purple-400 mb-4">📊 날씨 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-purple-900/30 rounded-lg p-3">
                  <div className="text-gray-400">맑은 날</div>
                  <div className="text-xl font-bold text-white">
                    {weatherHistory.filter(w => w === 'sunny').length}일
                  </div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3">
                  <div className="text-gray-400">비온 날</div>
                  <div className="text-xl font-bold text-white">
                    {weatherHistory.filter(w => w === 'rainy').length}일
                  </div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3">
                  <div className="text-gray-400">특별한 날</div>
                  <div className="text-xl font-bold text-white">
                    {weatherHistory.filter(w => ['rainbow', 'sakura', 'meteor', 'aurora'].includes(w)).length}일
                  </div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3">
                  <div className="text-gray-400">현재 연속</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {weatherStreak.count}일
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 7-Day Forecast */}
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-blue-500">
              <h2 className="text-xl font-bold text-blue-400 mb-4">📅 주간 예보</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {forecast.map((weather, index) => (
                  <div key={index} className={`flex items-center justify-between bg-blue-900/30 rounded-lg p-2 ${
                    ['rainbow', 'sakura', 'meteor', 'aurora'].includes(weather.id) ? 'ring-2 ring-yellow-400' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{weather.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{weather.name}</div>
                        <div className="text-xs text-gray-400">Day {player.day + index + 1}</div>
                      </div>
                    </div>
                    {['rainbow', 'sakura', 'meteor', 'aurora'].includes(weather.id) && (
                      <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded text-yellow-300">특별</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Season Info */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-400">
              <h2 className="text-xl font-bold text-white mb-4">
                {getCurrentSeason() === 'spring' && '🌸 봄'}
                {getCurrentSeason() === 'summer' && '☀️ 여름'}
                {getCurrentSeason() === 'autumn' && '🍂 가을'}
                {getCurrentSeason() === 'winter' && '❄️ 겨울'}
              </h2>
              <div className="space-y-3">
                <div className="text-sm text-gray-300">
                  <div className="font-bold text-white mb-1">계절 보너스</div>
                  <div className="bg-black/30 rounded px-2 py-1">
                    {seasonalPatterns[getCurrentSeason()].seasonalBonus.stat} +
                    {seasonalPatterns[getCurrentSeason()].seasonalBonus.value}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <div className="font-bold text-white mb-1">특별 이벤트</div>
                  {seasonalPatterns[getCurrentSeason()].specialEvents.map(event => (
                    <div key={event} className="bg-black/30 rounded px-2 py-1 mb-1">
                      • {event}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Tips */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-lg p-4 border border-green-400">
              <h3 className="text-lg font-bold text-green-400 mb-3">💡 날씨 팁</h3>
              <ul className="text-xs text-gray-300 space-y-2">
                <li>• 특별한 날씨에는 희귀 이벤트가 발생할 확률이 높습니다</li>
                <li>• 날씨에 맞는 활동을 하면 추가 보상을 얻을 수 있어요</li>
                <li>• 같은 날씨가 3일 이상 지속되면 특별 보너스가 있습니다</li>
                <li>• 계절마다 고유한 보너스 스탯이 있으니 활용하세요</li>
                <li>• 무지개, 벚꽃, 유성우는 매우 희귀한 날씨입니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWeatherSystem;