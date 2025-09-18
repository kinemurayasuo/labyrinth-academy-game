import React from 'react';
import { Player } from '../types/game';

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
            {player.day}일차 • {formatTimeOfDay(player.timeOfDay)}
          </div>
        </div>

        {/* Money */}
        <div className="flex items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full">
          <span className="text-yellow-300">💰</span>
          <span className="font-semibold text-yellow-200">{player.money.toLocaleString()}원</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Intelligence */}
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-300">🧠</span>
              <span className="text-sm font-medium text-blue-200">지력</span>
            </div>
            <span className={`font-bold ${getStatColor(player.stats.intelligence)}`}>
              {player.stats.intelligence}/20
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.intelligence)}%` }}
            />
          </div>
        </div>

        {/* Charm */}
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-pink-300">✨</span>
              <span className="text-sm font-medium text-pink-200">매력</span>
            </div>
            <span className={`font-bold ${getStatColor(player.stats.charm)}`}>
              {player.stats.charm}/20
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.charm)}%` }}
            />
          </div>
        </div>

        {/* Stamina */}
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-300">💪</span>
              <span className="text-sm font-medium text-green-200">체력</span>
            </div>
            <span className={`font-bold ${getStatColor(player.stats.stamina)}`}>
              {player.stats.stamina}/20
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.stamina)}%` }}
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