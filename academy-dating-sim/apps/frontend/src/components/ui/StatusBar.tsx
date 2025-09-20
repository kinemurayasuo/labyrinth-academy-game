import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

const StatusBar: React.FC = React.memo(() => {
  const player = useGameStore((state) => state.player);
  const navigate = useNavigate();

  // Memoize function calculations to prevent recreating on every render
  const getStatColor = useCallback((value: number, max: number = 20) => {
    const percentage = (value / max) * 100;
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 25) return 'text-orange-500';
    return 'text-red-500';
  }, []);

  const getStatBarWidth = useCallback((value: number, max: number = 20) => {
    return Math.min((value / max) * 100, 100);
  }, []);

  // Memoize time formatting map
  const timeMap = useMemo(() => ({
    morning: '아침',
    noon: '점심',
    afternoon: '오후',
    evening: '저녁',
    night: '밤'
  }), []);

  const formatTimeOfDay = useCallback((timeOfDay: string) => {
    return timeMap[timeOfDay as keyof typeof timeMap] || timeOfDay;
  }, [timeMap]);

  // Heroine Korean names mapping
  const heroineNames = useMemo(() => ({
    sakura: '사쿠라',
    yuki: '유키',
    haruka: '하루카',
    ayumi: '아유미',
    miku: '미쿠',
    rina: '리나',
    luna: '루나',
    nova: '노바',
    aria: '아리아'
  }), []);

  // Memoize HP/MP calculations to prevent unnecessary recalculations
  const { currentHP, maxHP, currentMP, maxMP, hpPercentage, mpPercentage } = useMemo(() => {
    const hp = player.hp ?? 100;
    const maxHp = player.maxHp ?? 100;
    const mp = player.mp ?? 50;
    const maxMp = player.maxMp ?? 50;

    return {
      currentHP: hp,
      maxHP: maxHp,
      currentMP: mp,
      maxMP: maxMp,
      hpPercentage: (hp / maxHp) * 100,
      mpPercentage: (mp / maxMp) * 100
    };
  }, [player.hp, player.maxHp, player.mp, player.maxMp]);

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
                  {Math.round(hpPercentage)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-red-950/50 rounded-full h-4 shadow-inner" role="progressbar" aria-valuenow={currentHP} aria-valuemin={0} aria-valuemax={maxHP} aria-label="체력">
              <div
                className="bg-gradient-to-r from-red-500 via-red-400 to-red-300 h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${hpPercentage}%` }}
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
                  {Math.round(mpPercentage)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-blue-950/50 rounded-full h-4 shadow-inner" role="progressbar" aria-valuenow={currentMP} aria-valuemin={0} aria-valuemax={maxMP} aria-label="마나">
              <div
                className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${mpPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player Info, Stamina and Money */}
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

        <div className="flex items-center gap-3">
          {/* Stamina Display */}
          <div className="bg-green-900/30 px-4 py-2 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2">
              <span className="text-green-400">⚡</span>
              <div>
                <div className="text-xs text-green-300">스테미나</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-green-950/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-green-400">
                    {player.stamina}/{player.maxStamina}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Money */}
          <div className="flex items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full">
            <span className="text-yellow-300">💰</span>
            <span className="font-semibold text-yellow-200">{player.money.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mt-4">
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-300">⭐</span>
              <span className="text-sm font-medium text-purple-200">경험치 (Lv.{player.level})</span>
            </div>
            <span className="font-bold text-purple-200">
              {player.experience}/{player.level * 100}
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-2" role="progressbar" aria-valuenow={player.experience} aria-valuemin={0} aria-valuemax={player.level * 100} aria-label="경험치">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(player.experience / (player.level * 100)) * 100}%` }}
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
          <div className="w-full bg-blue-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.intelligence} aria-valuemin={0} aria-valuemax={50} aria-label="지력 스탯">
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
          <div className="w-full bg-pink-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.charm} aria-valuemin={0} aria-valuemax={50} aria-label="매력 스탯">
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
          <div className="w-full bg-green-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.stamina} aria-valuemin={0} aria-valuemax={50} aria-label="체력 스탯">
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
          <div className="w-full bg-orange-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.strength} aria-valuemin={0} aria-valuemax={50} aria-label="힘 스탯">
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
          <div className="w-full bg-cyan-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.agility} aria-valuemin={0} aria-valuemax={50} aria-label="민첩 스탯">
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
          <div className="w-full bg-yellow-950/50 rounded-full h-1.5" role="progressbar" aria-valuenow={player.stats.luck} aria-valuemin={0} aria-valuemax={50} aria-label="행운 스탯">
            <div
              className="bg-gradient-to-r from-yellow-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getStatBarWidth(player.stats.luck, 50)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Affection Summary - Clickable Heroine Cards */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-purple-300">히로인 호감도</h3>
          <button
            onClick={() => navigate('/heroines')}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            갤러리 보기 →
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {Object.entries(player.affection).map(([character, affection]) => {
            const koreanName = heroineNames[character as keyof typeof heroineNames] || character;
            const affectionLevel =
              affection >= 80 ? '💕' :
              affection >= 60 ? '💗' :
              affection >= 40 ? '💖' :
              affection >= 20 ? '💝' :
              '💛';

            return (
              <button
                key={character}
                onClick={() => navigate('/heroines')}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 hover:from-purple-800/50 hover:to-pink-800/50 p-2 rounded-lg transition-all transform hover:scale-105 border border-purple-500/20 hover:border-purple-400/40"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{affectionLevel}</div>
                  <div className="text-xs font-bold text-purple-200">{koreanName}</div>
                  <div className="text-xs text-purple-300">{affection}%</div>
                  <div className="mt-1">
                    <div className="w-full bg-purple-950/50 rounded-full h-1">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${affection}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;