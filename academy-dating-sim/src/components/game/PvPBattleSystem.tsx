import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface BattlePlayer {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: string[];
  ranking: number;
  wins: number;
  losses: number;
  streak: number;
  avatar?: string;
}

interface BattleLog {
  attacker: string;
  action: string;
  damage?: number;
  effect?: string;
  timestamp: number;
}

const PvPBattleSystem: React.FC = () => {
  const { player } = useGameStore();
  const [currentBattle, setCurrentBattle] = useState<{
    player: BattlePlayer;
    opponent: BattlePlayer;
    turn: 'player' | 'opponent';
    logs: BattleLog[];
    status: 'preparing' | 'battling' | 'victory' | 'defeat';
  } | null>(null);
  const [matchmaking, setMatchmaking] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<BattlePlayer[]>([]);
  const [battleMode, setBattleMode] = useState<'ranked' | 'casual' | 'tournament'>('ranked');

  const opponents: BattlePlayer[] = [
    {
      id: 'opponent1',
      name: 'Shadow Knight',
      level: 15,
      hp: 200,
      maxHp: 200,
      mp: 50,
      maxMp: 50,
      attack: 40,
      defense: 30,
      speed: 25,
      skills: ['slash', 'shadowstrike'],
      ranking: 1500,
      wins: 45,
      losses: 12,
      streak: 5,
      avatar: '⚔️'
    },
    {
      id: 'opponent2',
      name: 'Fire Mage',
      level: 14,
      hp: 150,
      maxHp: 150,
      mp: 100,
      maxMp: 100,
      attack: 50,
      defense: 20,
      speed: 30,
      skills: ['fireball', 'meteor'],
      ranking: 1450,
      wins: 38,
      losses: 15,
      streak: 3,
      avatar: '🔥'
    },
    {
      id: 'opponent3',
      name: 'Holy Priest',
      level: 16,
      hp: 180,
      maxHp: 180,
      mp: 80,
      maxMp: 80,
      attack: 30,
      defense: 40,
      speed: 20,
      skills: ['heal', 'holylight'],
      ranking: 1600,
      wins: 52,
      losses: 8,
      streak: 8,
      avatar: '✨'
    },
    {
      id: 'opponent4',
      name: 'Assassin',
      level: 13,
      hp: 140,
      maxHp: 140,
      mp: 40,
      maxMp: 40,
      attack: 55,
      defense: 15,
      speed: 40,
      skills: ['backstab', 'poisondagger'],
      ranking: 1400,
      wins: 30,
      losses: 20,
      streak: 1,
      avatar: '🗡️'
    },
    {
      id: 'opponent5',
      name: 'Tank Warrior',
      level: 17,
      hp: 250,
      maxHp: 250,
      mp: 30,
      maxMp: 30,
      attack: 35,
      defense: 50,
      speed: 15,
      skills: ['shieldbash', 'ironwall'],
      ranking: 1550,
      wins: 40,
      losses: 10,
      streak: 4,
      avatar: '🛡️'
    }
  ];

  const battleSkills = {
    slash: { name: '슬래시', damage: 35, mpCost: 5, description: '기본 검격' },
    fireball: { name: '파이어볼', damage: 45, mpCost: 10, description: '화염 마법' },
    heal: { name: '힐', damage: -40, mpCost: 15, description: 'HP 회복' },
    backstab: { name: '백스탭', damage: 60, mpCost: 8, description: '치명적 일격' },
    shieldbash: { name: '실드 배쉬', damage: 25, mpCost: 5, description: '기절 효과' },
    shadowstrike: { name: '그림자 공격', damage: 50, mpCost: 12, description: '암흑 공격' },
    meteor: { name: '메테오', damage: 70, mpCost: 20, description: '광역 마법' },
    holylight: { name: '홀리 라이트', damage: 40, mpCost: 10, description: '신성 공격' },
    poisondagger: { name: '독칼', damage: 30, mpCost: 6, description: '지속 피해' },
    ironwall: { name: '철벽', damage: 0, mpCost: 10, description: '방어력 증가' }
  };

  useEffect(() => {
    // Initialize leaderboard
    const initialLeaderboard = [...opponents].sort((a, b) => b.ranking - a.ranking);
    setLeaderboard(initialLeaderboard);
  }, []);

  const findMatch = () => {
    setMatchmaking(true);
    setTimeout(() => {
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
      const playerBattle: BattlePlayer = {
        id: 'player',
        name: player.name,
        level: player.level || 10,
        hp: 100 + (player.level || 10) * 10,
        maxHp: 100 + (player.level || 10) * 10,
        mp: 50 + (player.level || 10) * 5,
        maxMp: 50 + (player.level || 10) * 5,
        attack: 20 + (player.level || 10) * 2,
        defense: 15 + (player.level || 10),
        speed: 20 + Math.floor((player.level || 10) / 2),
        skills: ['slash', 'fireball', 'heal'],
        ranking: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
        avatar: '🗡️'
      };

      setCurrentBattle({
        player: playerBattle,
        opponent: { ...randomOpponent },
        turn: playerBattle.speed >= randomOpponent.speed ? 'player' : 'opponent',
        logs: [],
        status: 'preparing'
      });
      setMatchmaking(false);

      setTimeout(() => {
        setCurrentBattle(prev => prev ? { ...prev, status: 'battling' } : null);
      }, 2000);
    }, 2000);
  };

  const performAction = (skillId: string) => {
    if (!currentBattle || currentBattle.status !== 'battling' || currentBattle.turn !== 'player') return;

    const skill = battleSkills[skillId as keyof typeof battleSkills];
    if (!skill) return;

    // Check MP
    if (skill.mpCost > currentBattle.player.mp) {
      return;
    }

    let damage = skill.damage;
    if (damage > 0) {
      damage = Math.max(1, damage + currentBattle.player.attack - currentBattle.opponent.defense);
    }

    const newOpponentHp = damage > 0
      ? Math.max(0, currentBattle.opponent.hp - damage)
      : currentBattle.opponent.hp;

    const newPlayerHp = damage < 0
      ? Math.min(currentBattle.player.maxHp, currentBattle.player.hp - damage)
      : currentBattle.player.hp;

    const newLog: BattleLog = {
      attacker: player.name,
      action: skill.name,
      damage: Math.abs(damage),
      effect: damage < 0 ? 'heal' : 'damage',
      timestamp: Date.now()
    };

    setCurrentBattle({
      ...currentBattle,
      player: {
        ...currentBattle.player,
        mp: currentBattle.player.mp - skill.mpCost,
        hp: newPlayerHp
      },
      opponent: {
        ...currentBattle.opponent,
        hp: newOpponentHp
      },
      turn: 'opponent',
      logs: [...currentBattle.logs, newLog]
    });

    // Check victory
    if (newOpponentHp <= 0) {
      setTimeout(() => {
        setCurrentBattle(prev => prev ? { ...prev, status: 'victory' } : null);
      }, 1000);
      return;
    }

    // Opponent turn
    setTimeout(() => {
      performOpponentAction();
    }, 1500);
  };

  const performOpponentAction = () => {
    if (!currentBattle || currentBattle.status !== 'battling') return;

    const availableSkills = currentBattle.opponent.skills.filter(skillId => {
      const skill = battleSkills[skillId as keyof typeof battleSkills];
      return skill && skill.mpCost <= currentBattle.opponent.mp;
    });

    if (availableSkills.length === 0) return;

    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const skill = battleSkills[randomSkill as keyof typeof battleSkills];

    let damage = skill.damage;
    if (damage > 0) {
      damage = Math.max(1, damage + currentBattle.opponent.attack - currentBattle.player.defense);
    }

    const newPlayerHp = damage > 0
      ? Math.max(0, currentBattle.player.hp - damage)
      : currentBattle.player.hp;

    const newOpponentHp = damage < 0
      ? Math.min(currentBattle.opponent.maxHp, currentBattle.opponent.hp - damage)
      : currentBattle.opponent.hp;

    const newLog: BattleLog = {
      attacker: currentBattle.opponent.name,
      action: skill.name,
      damage: Math.abs(damage),
      effect: damage < 0 ? 'heal' : 'damage',
      timestamp: Date.now()
    };

    setCurrentBattle({
      ...currentBattle,
      opponent: {
        ...currentBattle.opponent,
        mp: currentBattle.opponent.mp - skill.mpCost,
        hp: newOpponentHp
      },
      player: {
        ...currentBattle.player,
        hp: newPlayerHp
      },
      turn: 'player',
      logs: [...currentBattle.logs, newLog]
    });

    // Check defeat
    if (newPlayerHp <= 0) {
      setTimeout(() => {
        setCurrentBattle(prev => prev ? { ...prev, status: 'defeat' } : null);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-800 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">⚔️ PvP 배틀 아레나</h1>
            <div className="flex gap-2">
              {['ranked', 'casual', 'tournament'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setBattleMode(mode as any)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    battleMode === mode
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {mode === 'ranked' ? '랭크전' : mode === 'casual' ? '일반전' : '토너먼트'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!currentBattle ? (
          <>
            {/* Matchmaking */}
            <div className="bg-black/30 backdrop-blur rounded-xl p-8 mb-6">
              <div className="text-center">
                {matchmaking ? (
                  <>
                    <div className="text-6xl mb-4 animate-pulse">⚔️</div>
                    <div className="text-2xl font-bold text-white mb-2">매칭 중...</div>
                    <div className="text-white/70">상대를 찾고 있습니다</div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-2xl font-bold text-white mb-4">배틀 준비 완료!</div>
                    <button
                      onClick={findMatch}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-all"
                    >
                      매치 찾기
                    </button>
                    <div className="mt-4 text-white/70">
                      현재 랭킹: #{player.pvpRanking || 1000} | 승률: {player.pvpWins || 0}W {player.pvpLosses || 0}L
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-black/30 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 리더보드</h2>
              <div className="space-y-2">
                {leaderboard.map((p, idx) => (
                  <div key={p.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <div className="text-2xl">{p.avatar}</div>
                      <div>
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-sm text-white/70">Lv.{p.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{p.ranking} RP</div>
                      <div className="text-sm text-white/70">{p.wins}W {p.losses}L</div>
                      {p.streak > 0 && (
                        <div className="text-sm text-orange-400">🔥 {p.streak} 연승</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Battle Screen */}
            {currentBattle.status === 'preparing' ? (
              <div className="bg-black/30 backdrop-blur rounded-xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                  <div className="text-3xl font-bold text-white mb-4">VS</div>
                  <div className="flex justify-center items-center gap-8">
                    <div>
                      <div className="text-4xl mb-2">{currentBattle.player.avatar}</div>
                      <div className="text-xl font-bold text-white">{currentBattle.player.name}</div>
                      <div className="text-white/70">Lv.{currentBattle.player.level}</div>
                    </div>
                    <div className="text-4xl text-yellow-400">VS</div>
                    <div>
                      <div className="text-4xl mb-2">{currentBattle.opponent.avatar}</div>
                      <div className="text-xl font-bold text-white">{currentBattle.opponent.name}</div>
                      <div className="text-white/70">Lv.{currentBattle.opponent.level}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentBattle.status === 'battling' ? (
              <div className="space-y-6">
                {/* Battle Field */}
                <div className="bg-black/30 backdrop-blur rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Player */}
                    <div className={`${currentBattle.turn === 'player' ? 'ring-4 ring-green-400' : ''} rounded-xl p-4`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{currentBattle.player.avatar}</div>
                        <div className="flex-1">
                          <div className="text-white font-bold">{currentBattle.player.name}</div>
                          <div className="text-sm text-white/70">Lv.{currentBattle.player.level}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm text-white mb-1">
                            <span>HP</span>
                            <span>{currentBattle.player.hp}/{currentBattle.player.maxHp}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all"
                              style={{ width: `${(currentBattle.player.hp / currentBattle.player.maxHp) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm text-white mb-1">
                            <span>MP</span>
                            <span>{currentBattle.player.mp}/{currentBattle.player.maxMp}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all"
                              style={{ width: `${(currentBattle.player.mp / currentBattle.player.maxMp) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className={`${currentBattle.turn === 'opponent' ? 'ring-4 ring-red-400' : ''} rounded-xl p-4`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{currentBattle.opponent.avatar}</div>
                        <div className="flex-1">
                          <div className="text-white font-bold">{currentBattle.opponent.name}</div>
                          <div className="text-sm text-white/70">Lv.{currentBattle.opponent.level}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm text-white mb-1">
                            <span>HP</span>
                            <span>{currentBattle.opponent.hp}/{currentBattle.opponent.maxHp}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-red-500 to-red-400 h-full transition-all"
                              style={{ width: `${(currentBattle.opponent.hp / currentBattle.opponent.maxHp) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm text-white mb-1">
                            <span>MP</span>
                            <span>{currentBattle.opponent.mp}/{currentBattle.opponent.maxMp}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-400 h-full transition-all"
                              style={{ width: `${(currentBattle.opponent.mp / currentBattle.opponent.maxMp) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentBattle.turn === 'player' && (
                    <div className="mt-6">
                      <div className="text-white font-bold mb-2">당신의 턴!</div>
                      <div className="grid grid-cols-3 gap-2">
                        {currentBattle.player.skills.map(skillId => {
                          const skill = battleSkills[skillId as keyof typeof battleSkills];
                          const canUse = skill && skill.mpCost <= currentBattle.player.mp;
                          return (
                            <button
                              key={skillId}
                              onClick={() => canUse && performAction(skillId)}
                              disabled={!canUse}
                              className={`p-3 rounded-lg font-bold transition-all ${
                                canUse
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105'
                                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <div>{skill?.name}</div>
                              <div className="text-xs">MP: {skill?.mpCost}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentBattle.turn === 'opponent' && (
                    <div className="mt-6 text-center">
                      <div className="text-white/70">상대방의 턴...</div>
                    </div>
                  )}
                </div>

                {/* Battle Log */}
                <div className="bg-black/30 backdrop-blur rounded-xl p-4">
                  <div className="text-white font-bold mb-2">전투 로그</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {currentBattle.logs.slice(-5).map((log, idx) => (
                      <div key={idx} className="text-sm text-white/80">
                        <span className="font-bold">{log.attacker}</span>의
                        <span className="text-yellow-400"> {log.action}</span>!
                        {log.effect === 'damage' && <span className="text-red-400"> -{log.damage} 데미지</span>}
                        {log.effect === 'heal' && <span className="text-green-400"> +{log.damage} 회복</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Victory/Defeat Screen */
              <div className="bg-black/30 backdrop-blur rounded-xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {currentBattle.status === 'victory' ? '🏆' : '💀'}
                  </div>
                  <div className="text-4xl font-bold text-white mb-4">
                    {currentBattle.status === 'victory' ? 'VICTORY!' : 'DEFEAT'}
                  </div>
                  <div className="text-white/70 mb-6">
                    {currentBattle.status === 'victory'
                      ? `${currentBattle.opponent.name}을(를) 물리쳤습니다!`
                      : `${currentBattle.opponent.name}에게 패배했습니다...`}
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <div className="text-white font-bold mb-2">전투 보상</div>
                    <div className="space-y-1 text-white/80">
                      {currentBattle.status === 'victory' ? (
                        <>
                          <div>🏆 랭킹 포인트: +25 RP</div>
                          <div>💰 골드: +100 G</div>
                          <div>⭐ 경험치: +50 EXP</div>
                        </>
                      ) : (
                        <>
                          <div>📉 랭킹 포인트: -10 RP</div>
                          <div>💰 골드: +25 G</div>
                          <div>⭐ 경험치: +10 EXP</div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentBattle(null)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-all"
                  >
                    로비로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PvPBattleSystem;