import React from 'react';
import type { Player } from '../types/game';

interface StatusBarProps {
  player: Player;
}

const StatusBar: React.FC<StatusBarProps> = ({ player }) => {
  const getStatColor = (value: number, max: number = 20) => {
    const percentage = (value / max) * 100;
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStatBarWidth = (value: number, max: number = 20) => {
    return Math.min((value / max) * 100, 100);
  };

  const formatTimeOfDay = (timeOfDay: string) => {
    const timeMap: Record<string, string> = {
      morning: '아침',
      noon: '점심',
      afternoon: '오후',
      evening: '저녁',
      night: '밤'
    };
    return timeMap[timeOfDay] || timeOfDay;
  };

  return (
    <div className="bg-gradient-to-r from-purple-800 via-pink-700 to-purple-800 text-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Player Info */}
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-pink-200">
            {player.name}
          </div>
          <div className="text-sm bg-purple-900/50 px-3 py-1 rounded-full">
            레벨 {player.level} • {player.day}일차 • {formatTimeOfDay(player.timeOfDay)}
          </div>
        </div>

        {/* Money */}
        <div className="flex items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full">
          <span className="text-yellow-300">💰</span>
          <span className="font-semibold text-yellow-200">{player.money.toLocaleString()}원</span>
        </div>
      </div>

      {/* HP/MP Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* HP Bar */}
        <div className="bg-red-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-red-300">❤️</span>
              <span className="text-sm font-medium text-red-200">체력</span>
            </div>
            <span className="font-bold text-red-200">
              {player.hp}/{player.maxHp}
            </span>
          </div>
          <div className="w-full bg-red-950/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* MP Bar */}
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-300">💙</span>
              <span className="text-sm font-medium text-blue-200">마나</span>
            </div>
            <span className="font-bold text-blue-200">
              {player.mp}/{player.maxMp}
            </span>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mt-4">
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-300">⭐</span>
              <span className="text-sm font-medium text-purple-200">경험치</span>
            </div>
            <span className="font-bold text-purple-200">
              {player.experience}/100
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(player.experience % 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {/* Intelligence */}
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-300">🧠</span>
              <span className="text-xs font-medium text-blue-200">지력</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.intelligence)}`}>
              {player.stats.intelligence}
            </span>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.intelligence, 50)}%` }}
            />
          </div>
        </div>

        {/* Charm */}
        <div className="bg-pink-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-pink-300">✨</span>
              <span className="text-xs font-medium text-pink-200">매력</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.charm)}`}>
              {player.stats.charm}
            </span>
          </div>
          <div className="w-full bg-pink-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.charm, 50)}%` }}
            />
          </div>
        </div>

        {/* Stamina */}
        <div className="bg-green-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-300">🏃</span>
              <span className="text-xs font-medium text-green-200">체력</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.stamina)}`}>
              {player.stats.stamina}
            </span>
          </div>
          <div className="w-full bg-green-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.stamina, 50)}%` }}
            />
          </div>
        </div>

        {/* Strength */}
        <div className="bg-orange-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-orange-300">💪</span>
              <span className="text-xs font-medium text-orange-200">힘</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.strength)}`}>
              {player.stats.strength}
            </span>
          </div>
          <div className="w-full bg-orange-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.strength, 50)}%` }}
            />
          </div>
        </div>

        {/* Agility */}
        <div className="bg-cyan-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-300">🏃‍♂️</span>
              <span className="text-xs font-medium text-cyan-200">민첩</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.agility)}`}>
              {player.stats.agility}
            </span>
          </div>
          <div className="w-full bg-cyan-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.agility, 50)}%` }}
            />
          </div>
        </div>

        {/* Luck */}
        <div className="bg-yellow-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">🍀</span>
              <span className="text-xs font-medium text-yellow-200">행운</span>
            </div>
            <span className={`font-bold text-xs ${getStatColor(player.stats.luck)}`}>
              {player.stats.luck}
            </span>
          </div>
          <div className="w-full bg-yellow-950/50 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.luck, 50)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Affection Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        {Object.entries(player.affection).map(([character, affection]) => (
          <div key={character} className="flex items-center justify-between bg-purple-900/20 px-3 py-2 rounded-lg">
            <span className="text-sm text-purple-200 capitalize">{character}</span>
            <div className="flex items-center gap-2">
              <div className="w-12 bg-purple-950/50 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${affection}%` }}
                />
              </div>
              <span className="text-xs text-purple-300 font-medium">{affection}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;