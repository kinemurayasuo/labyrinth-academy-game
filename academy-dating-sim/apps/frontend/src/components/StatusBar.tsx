import React from 'react';
import { useGameStore } from '../../store/useGameStore';

const StatusBar: React.FC = () => {
  const player = useGameStore((state) => state.player);
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

  // Ensure HP/MP have default values
  const currentHP = player.hp ?? 100;
  const maxHP = player.maxHp ?? 100;
  const currentMP = player.mp ?? 50;
  const maxMP = player.maxMp ?? 50;

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-xl border border-border text-text-primary p-6 mb-6">
      {/* Prominent HP/MP Display at Top */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prominent HP Bar */}
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 p-4 rounded-xl border border-red-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-red-400">체력</span>
                  <div className="text-xs text-red-300">Health Points</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-red-400">
                  {currentHP}
                </span>
                <span className="text-red-300 text-xl">/{maxHP}</span>
                <div className="text-xs text-red-300">
                  {Math.round((currentHP / maxHP) * 100)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-red-950/50 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-red-500 via-red-400 to-red-300 h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentHP / maxHP) * 100}%` }}
              />
            </div>
          </div>

          {/* Prominent MP Bar */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-4 rounded-xl border border-blue-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💙</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-blue-400">마나</span>
                  <div className="text-xs text-blue-300">Magic Points</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-400">
                  {currentMP}
                </span>
                <span className="text-blue-300 text-xl">/{maxMP}</span>
                <div className="text-xs text-blue-300">
                  {Math.round((currentMP / maxMP) * 100)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-blue-950/50 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentMP / maxMP) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player Info and Money */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Player Info */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-pink-200">
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
    </div>
  );
};

export default StatusBar;