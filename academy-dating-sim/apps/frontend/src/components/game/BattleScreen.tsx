import React, { useState } from 'react';
import type { Player, Monster } from '../../types/game';

interface BattleScreenProps {
  player: Player;
  enemy: Monster;
  onVictory: (rewards: { exp: number; gold: number; items: string[] }) => void;
  onDefeat: () => void;
  onFlee: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({
  player,
  enemy: initialEnemy,
  onVictory,
  onDefeat,
  onFlee,
}) => {
  const enemy = initialEnemy;
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [playerMp, setPlayerMp] = useState(player.mp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleEnded, setBattleEnded] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [animation, setAnimation] = useState<'playerAttack' | 'enemyAttack' | null>(null);
  const [isKnockedOut, setIsKnockedOut] = useState(false);
  const [canEscape, setCanEscape] = useState(true);

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const calculateDamage = (attacker: any, defender: any) => {
    const baseDamage = attacker.attack || attacker.stats?.strength || 10;
    const defense = defender.defense || defender.stats?.stamina || 5;
    const damage = Math.max(1, baseDamage - Math.floor(defense / 2) + Math.floor(Math.random() * 5));
    return damage;
  };

  const handlePlayerAttack = () => {
    if (!isPlayerTurn || battleEnded) return;

    setAnimation('playerAttack');
    const damage = calculateDamage(player, enemy);
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    addLog(`당신의 공격! ${enemy.name}에게 ${damage}의 데미지!`);

    setTimeout(() => {
      setAnimation(null);
      if (newEnemyHp <= 0) {
        handleVictory();
      } else {
        setIsPlayerTurn(false);
        setTimeout(() => enemyTurn(), 1000);
      }
    }, 500);
  };

  const handleSkillAttack = () => {
    if (!isPlayerTurn || battleEnded || playerMp < 10) return;

    setAnimation('playerAttack');
    const damage = calculateDamage(player, enemy) * 1.5;
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    setPlayerMp(prev => Math.max(0, prev - 10));
    addLog(`스킬 발동! ${enemy.name}에게 ${Math.floor(damage)}의 큰 데미지!`);

    setTimeout(() => {
      setAnimation(null);
      if (newEnemyHp <= 0) {
        handleVictory();
      } else {
        setIsPlayerTurn(false);
        setTimeout(() => enemyTurn(), 1000);
      }
    }, 500);
  };

  const handleHeal = () => {
    if (!isPlayerTurn || battleEnded || playerMp < 5) return;

    const healAmount = 20;
    setPlayerHp(prev => Math.min(player.maxHp, prev + healAmount));
    setPlayerMp(prev => Math.max(0, prev - 5));
    addLog(`회복 마법! HP가 ${healAmount} 회복되었습니다.`);

    setIsPlayerTurn(false);
    setTimeout(() => enemyTurn(), 1000);
  };

  const enemyTurn = () => {
    if (battleEnded) return;

    setAnimation('enemyAttack');
    const damage = calculateDamage(enemy, player);
    const newPlayerHp = Math.max(0, playerHp - damage);
    setPlayerHp(newPlayerHp);
    addLog(`${enemy.name}의 공격! ${damage}의 데미지를 받았습니다!`);

    setTimeout(() => {
      setAnimation(null);
      if (newPlayerHp <= 0) {
        handleKnockOut();
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);
  };

  const handleVictory = () => {
    setBattleEnded(true);
    setShowRewards(true);
    addLog(`승리! ${enemy.name}을(를) 물리쳤습니다!`);

    const rewards = {
      exp: enemy.experience || 20,
      gold: Math.floor(Math.random() * 50) + 20,
      items: enemy.drops?.map(d => d.itemId) || []
    };

    setTimeout(() => {
      onVictory(rewards);
    }, 2000);
  };

  const handleKnockOut = () => {
    setIsKnockedOut(true);
    addLog('당신은 쓰러졌습니다! 도망칠 수 있는 기회가 있습니다.');
    setCanEscape(true);
    setIsPlayerTurn(true);
  };

  const handleDefeat = () => {
    setBattleEnded(true);
    addLog('완전히 패배했습니다... 던전 입구로 돌아갑니다.');
    setTimeout(() => {
      onDefeat();
    }, 2000);
  };

  const handleRecoverAttempt = () => {
    if (!isPlayerTurn || battleEnded || playerMp < 20) return;

    const recoverChance = Math.random();
    if (recoverChance > 0.5) {
      const recoverHp = Math.floor(player.maxHp * 0.3);
      setPlayerHp(recoverHp);
      setPlayerMp(prev => Math.max(0, prev - 20));
      setIsKnockedOut(false);
      addLog(`회복에 성공했습니다! HP가 ${recoverHp} 회복되었습니다.`);
      setIsPlayerTurn(false);
      setTimeout(() => enemyTurn(), 1000);
    } else {
      setPlayerMp(prev => Math.max(0, prev - 20));
      addLog('회복에 실패했습니다...');
      setIsPlayerTurn(false);
      setTimeout(() => {
        // Enemy attacks again
        if (!canEscape) {
          handleDefeat();
        } else {
          setCanEscape(false);
          enemyTurn();
        }
      }, 1000);
    }
  };

  const handleFlee = () => {
    if (!isPlayerTurn || battleEnded) return;

    // Knocked out state has higher escape chance
    const fleeChance = Math.random();
    const escapeThreshold = isKnockedOut ? 0.2 : 0.5;

    if (fleeChance > escapeThreshold) {
      addLog(isKnockedOut ? '간신히 도망쳤습니다!' : '도망쳤습니다!');
      setTimeout(() => onFlee(), 1000);
    } else {
      addLog('도망치지 못했습니다!');
      if (isKnockedOut && !canEscape) {
        // If knocked out and failed to escape twice, it's defeat
        handleDefeat();
      } else {
        setIsPlayerTurn(false);
        if (isKnockedOut) setCanEscape(false);
        setTimeout(() => enemyTurn(), 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Battle Arena */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        </div>

        <div className="relative h-full flex items-center justify-between px-20">
          {/* Player Side */}
          <div className={`transform transition-all duration-300 ${animation === 'playerAttack' ? 'translate-x-10 scale-110' : ''} ${animation === 'enemyAttack' ? 'scale-95' : ''}`}>
            <div className="text-center">
              <div className="text-8xl mb-4 filter drop-shadow-2xl">⚔️</div>
              <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 border border-border">
                <div className="text-text-primary font-bold mb-2">{player.name}</div>
                <div className="space-y-2">
                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>HP</span>
                      <span>{playerHp}/{player.maxHp}</span>
                    </div>
                    <div className="w-48 bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                  {/* MP Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>MP</span>
                      <span>{playerMp}/{player.maxMp}</span>
                    </div>
                    <div className="w-48 bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(playerMp / player.maxMp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VS Indicator */}
          <div className="text-6xl text-accent font-bold animate-pulse">VS</div>

          {/* Enemy Side */}
          <div className={`transform transition-all duration-300 ${animation === 'enemyAttack' ? '-translate-x-10 scale-110' : ''} ${animation === 'playerAttack' ? 'scale-95' : ''}`}>
            <div className="text-center">
              <div className="text-8xl mb-4 filter drop-shadow-2xl animate-bounce">
                {enemy.sprite || '👾'}
              </div>
              <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 border border-border">
                <div className="text-text-primary font-bold mb-2">{enemy.name}</div>
                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>HP</span>
                    <span>{enemyHp}/{enemy.maxHp}</span>
                  </div>
                  <div className="w-48 bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-black/70 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/50 rounded-lg p-3 mb-4 h-24 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div key={index} className="text-sm text-text-secondary mb-1">
                ▶ {log}
              </div>
            ))}
          </div>

          {/* Knocked Out Warning */}
          {isKnockedOut && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-center font-bold">
                ⚠️ 위험! 당신은 쓰러진 상태입니다!
                {canEscape ? ' (도망 기회 남음)' : ' (마지막 기회!)'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {!isKnockedOut ? (
              <>
                <button
                  onClick={handlePlayerAttack}
                  disabled={!isPlayerTurn || battleEnded}
                  className={`px-4 py-3 rounded-lg font-bold transition-all ${
                    isPlayerTurn && !battleEnded
                      ? 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ⚔️ 공격
                </button>

                <button
                  onClick={handleSkillAttack}
                  disabled={!isPlayerTurn || battleEnded || playerMp < 10}
                  className={`px-4 py-3 rounded-lg font-bold transition-all ${
                    isPlayerTurn && !battleEnded && playerMp >= 10
                      ? 'bg-primary hover:bg-secondary text-white transform hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ✨ 스킬 (10 MP)
                </button>

                <button
                  onClick={handleHeal}
                  disabled={!isPlayerTurn || battleEnded || playerMp < 5}
                  className={`px-4 py-3 rounded-lg font-bold transition-all ${
                    isPlayerTurn && !battleEnded && playerMp >= 5
                      ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  💚 회복 (5 MP)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRecoverAttempt}
                  disabled={!isPlayerTurn || battleEnded || playerMp < 20}
                  className={`px-4 py-3 rounded-lg font-bold transition-all col-span-2 ${
                    isPlayerTurn && !battleEnded && playerMp >= 20
                      ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  💫 회복 시도 (20 MP)
                </button>
                <div className="col-span-1"></div>
              </>
            )}

            <button
              onClick={handleFlee}
              disabled={!isPlayerTurn || battleEnded}
              className={`px-4 py-3 rounded-lg font-bold transition-all ${
                isPlayerTurn && !battleEnded
                  ? isKnockedOut
                    ? 'bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105 animate-pulse'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              🏃 {isKnockedOut ? '긴급 탈출!' : '도망'}
            </button>
          </div>
        </div>
      </div>

      {/* Victory Rewards Modal */}
      {showRewards && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
          <div className="bg-gradient-to-br from-accent to-yellow-400 rounded-2xl p-8 text-background text-center animate-bounce">
            <h2 className="text-4xl font-bold mb-4">🎉 승리! 🎉</h2>
            <div className="space-y-2 text-xl">
              <div>경험치: +{enemy.experience || 20}</div>
              <div>골드: +{Math.floor(Math.random() * 50) + 20}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleScreen;