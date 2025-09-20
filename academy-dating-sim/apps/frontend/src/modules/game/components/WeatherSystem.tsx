import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface Weather {
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
  name: string;
  icon: string;
  effects: {
    mood: number;
    farmingBonus: number;
    fishingBonus: number;
    combatPenalty: number;
  };
  description: string;
}

const WeatherSystem: React.FC = () => {
  const { player, gameDate } = useGameStore();
  const [currentWeather, setCurrentWeather] = useState<Weather>();
  const [forecast, setForecast] = useState<Weather[]>([]);

  const weatherTypes: Weather[] = [
    {
      type: 'sunny',
      name: '맑음',
      icon: '☀️',
      effects: {
        mood: 10,
        farmingBonus: 20,
        fishingBonus: 0,
        combatPenalty: 0
      },
      description: '화창한 날씨입니다. 모두가 행복해집니다!'
    },
    {
      type: 'cloudy',
      name: '흐림',
      icon: '☁️',
      effects: {
        mood: -5,
        farmingBonus: 10,
        fishingBonus: 10,
        combatPenalty: 0
      },
      description: '구름이 많은 날씨입니다.'
    },
    {
      type: 'rainy',
      name: '비',
      icon: '🌧️',
      effects: {
        mood: -10,
        farmingBonus: 30,
        fishingBonus: 20,
        combatPenalty: 10
      },
      description: '비가 내립니다. 농작물에게는 좋지만 전투는 어렵습니다.'
    },
    {
      type: 'snowy',
      name: '눈',
      icon: '❄️',
      effects: {
        mood: 5,
        farmingBonus: -20,
        fishingBonus: -10,
        combatPenalty: 20
      },
      description: '눈이 내립니다. 로맨틱하지만 활동이 제한됩니다.'
    },
    {
      type: 'stormy',
      name: '폭풍',
      icon: '⛈️',
      effects: {
        mood: -20,
        farmingBonus: -30,
        fishingBonus: -20,
        combatPenalty: 30
      },
      description: '폭풍이 몰아칩니다! 실내에 있는 것이 안전합니다.'
    },
    {
      type: 'foggy',
      name: '안개',
      icon: '🌫️',
      effects: {
        mood: -5,
        farmingBonus: 0,
        fishingBonus: 15,
        combatPenalty: 15
      },
      description: '짙은 안개가 끼었습니다. 시야가 제한됩니다.'
    }
  ];

  useEffect(() => {
    // 날씨 변경 (하루마다)
    updateWeather();
    generateForecast();
  }, [gameDate?.day]);

  const updateWeather = () => {
    const month = gameDate?.month || 4;
    let weatherChances: number[];

    // 계절별 날씨 확률
    if (month >= 3 && month <= 5) {
      // 봄
      weatherChances = [40, 20, 25, 0, 10, 5];
    } else if (month >= 6 && month <= 8) {
      // 여름
      weatherChances = [50, 15, 15, 0, 15, 5];
    } else if (month >= 9 && month <= 11) {
      // 가을
      weatherChances = [30, 25, 20, 5, 10, 10];
    } else {
      // 겨울
      weatherChances = [10, 20, 10, 40, 10, 10];
    }

    const random = Math.random() * 100;
    let accumulated = 0;
    let selectedWeather = weatherTypes[0];

    for (let i = 0; i < weatherChances.length; i++) {
      accumulated += weatherChances[i];
      if (random < accumulated) {
        selectedWeather = weatherTypes[i];
        break;
      }
    }

    setCurrentWeather(selectedWeather);
  };

  const generateForecast = () => {
    const newForecast: Weather[] = [];
    for (let i = 0; i < 7; i++) {
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      newForecast.push(randomWeather);
    }
    setForecast(newForecast);
  };

  return (
    <div className="bg-black/30 backdrop-blur rounded-xl p-4">
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{currentWeather?.icon}</div>
          <div>
            <div className="text-lg font-bold text-white">{currentWeather?.name}</div>
            <div className="text-sm text-white/70">{currentWeather?.description}</div>
          </div>
        </div>

        {/* Weather Effects */}
        {currentWeather && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`${currentWeather.effects.mood >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              기분 {currentWeather.effects.mood > 0 ? '+' : ''}{currentWeather.effects.mood}
            </div>
            <div className={`${currentWeather.effects.farmingBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              농사 {currentWeather.effects.farmingBonus > 0 ? '+' : ''}{currentWeather.effects.farmingBonus}%
            </div>
            <div className={`${currentWeather.effects.fishingBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              낚시 {currentWeather.effects.fishingBonus > 0 ? '+' : ''}{currentWeather.effects.fishingBonus}%
            </div>
            <div className={`${currentWeather.effects.combatPenalty <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              전투 -{currentWeather.effects.combatPenalty}%
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Forecast */}
      <div>
        <div className="text-sm font-bold text-white/80 mb-2">7일 예보</div>
        <div className="flex gap-2">
          {forecast.map((weather, idx) => (
            <div key={idx} className="bg-white/10 rounded-lg p-2 text-center flex-1">
              <div className="text-xs text-white/60">Day {idx + 1}</div>
              <div className="text-2xl">{weather.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherSystem;