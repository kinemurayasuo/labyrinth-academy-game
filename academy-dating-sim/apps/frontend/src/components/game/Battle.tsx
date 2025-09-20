import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  agility: number;
  experience: number;
  gold: number;
  sprite: string;
  description: string;
  skills?: string[];
}

interface BattleProps {
  enemy: Monster;
  onVictory: (rewards: { exp: number; gold: number; items: string[] }) => void;
  onDefeat: () => void;
  onFlee: () => void;
}

const Battle: React.FC<BattleProps> = ({ enemy, onVictory, onDefeat, onFlee }) => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { updateHpMp, gainExperience, addGold } = useGameStore((state: any) => state.actions);

  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([`${enemy.name}이(가) 나타났다!`]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [playerAnimation, setPlayerAnimation] = useState('');
  const [enemyAnimation, setEnemyAnimation] = useState('');
  const [battleEnded, setBattleEnded] = useState(false);

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const calculateDamage = (attacker: any, defender: any) => {
    const baseDamage = attacker.attack || attacker.strength;
    const defense = defender.defense || 0;
    const variance = Math.random() * 0.4 + 0.8; // 80% ~ 120%
    const damage = Math.max(1, Math.floor((baseDamage - defense / 2) * variance));
    return damage;
  };

  const playerAttack = () => {
    if (!playerTurn || isAnimating || battleEnded) return;

    setIsAnimating(true);
    setPlayerAnimation('attack');

    const damage = calculateDamage(player.stats, enemy);
    const critical = Math.random() < 0.1;
    const finalDamage = critical ? damage * 2 : damage;

    setTimeout(() => {
      setEnemyAnimation('hurt');
      setEnemyHp(prev => {
        const newHp = Math.max(0, prev - finalDamage);
        addLog(`플레이어의 공격! ${critical ? '크리티컬!' : ''} ${finalDamage}의 데미지!`);

        if (newHp <= 0) {
          addLog(`${enemy.name}을(를) 물리쳤다!`);
          handleVictory();
        }

        return newHp;
      });

      setTimeout(() => {
        setPlayerAnimation('');
        setEnemyAnimation('');
        setIsAnimating(false);
        if (enemyHp > finalDamage) {
          setPlayerTurn(false);
          setTimeout(() => enemyAttack(), 1000);
        }
      }, 500);
    }, 500);
  };

  const enemyAttack = () => {
    if (playerTurn || isAnimating || battleEnded) return;

    setIsAnimating(true);
    setEnemyAnimation('attack');

    const damage = calculateDamage(enemy, player.stats);

    setTimeout(() => {
      setPlayerAnimation('hurt');
      updateHpMp(-damage, 0);
      addLog(`${enemy.name}의 공격! ${damage}의 데미지!`);

      if (player.hp - damage <= 0) {
        addLog('플레이어가 쓰러졌다...');
        handleDefeat();
      }

      setTimeout(() => {
        setPlayerAnimation('');
        setEnemyAnimation('');
        setIsAnimating(false);
        setPlayerTurn(true);
      }, 500);
    }, 500);
  };

  const useSkill = (skillName: string) => {
    if (!playerTurn || isAnimating || battleEnded) return;

    setIsAnimating(true);
    setPlayerAnimation('skill');

    let damage = 0;
    let mpCost = 0;

    switch(skillName) {
      case 'fireball':
        damage = Math.floor(player.stats.intelligence * 2);
        mpCost = 10;
        break;
      case 'heal':
        const healAmount = Math.floor(player.stats.intelligence * 1.5);
        updateHpMp(healAmount, -10);
        addLog(`회복 마법! HP를 ${healAmount} 회복했다!`);
        setPlayerTurn(false);
        setTimeout(() => enemyAttack(), 1000);
        return;
      default:
        damage = calculateDamage(player.stats, enemy);
    }

    if (player.mp < mpCost) {
      addLog('MP가 부족합니다!');
      setIsAnimating(false);
      setPlayerAnimation('');
      return;
    }

    updateHpMp(0, -mpCost);

    setTimeout(() => {
      setEnemyAnimation('hurt');
      setEnemyHp(prev => {
        const newHp = Math.max(0, prev - damage);
        addLog(`${skillName} 사용! ${damage}의 데미지!`);

        if (newHp <= 0) {
          addLog(`${enemy.name}을(를) 물리쳤다!`);
          handleVictory();
        }

        return newHp;
      });

      setTimeout(() => {
        setPlayerAnimation('');
        setEnemyAnimation('');
        setIsAnimating(false);
        if (enemyHp > damage) {
          setPlayerTurn(false);
          setTimeout(() => enemyAttack(), 1000);
        }
      }, 500);
    }, 500);
  };

  const attemptFlee = () => {
    if (!playerTurn || isAnimating || battleEnded) return;

    const fleeChance = player.stats.agility / (player.stats.agility + enemy.agility);

    if (Math.random() < fleeChance) {
      addLog('성공적으로 도망쳤다!');
      setBattleEnded(true);
      setTimeout(() => onFlee(), 1500);
    } else {
      addLog('도망칠 수 없었다!');
      setPlayerTurn(false);
      setTimeout(() => enemyAttack(), 1000);
    }
  };

  const handleVictory = () => {
    setBattleEnded(true);
    const rewards = {
      exp: enemy.experience,
      gold: enemy.gold || Math.floor(Math.random() * 50) + 20,
      items: []
    };

    gainExperience(rewards.exp);
    addGold(rewards.gold);

    setTimeout(() => {
      onVictory(rewards);
    }, 2000);
  };

  const handleDefeat = () => {
    setBattleEnded(true);
    setTimeout(() => {
      onDefeat();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-red-900 via-black to-purple-900 z-50">
      <div className="h-full flex flex-col">
        {/* Battle Arena */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/battle-bg.jpg')] bg-cover bg-center opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>

          {/* Battle Characters */}
          <div className="relative h-full flex items-center justify-between px-8 md:px-20">
            {/* Player */}
            <div className={`flex flex-col items-center ${playerAnimation}`}>
              <div className={`text-8xl mb-4 transition-all duration-300 ${
                playerAnimation === 'attack' ? 'translate-x-10 scale-125' : ''
              } ${
                playerAnimation === 'hurt' ? 'animate-pulse text-red-500' : ''
              } ${
                playerAnimation === 'skill' ? 'animate-spin' : ''
              }`}>
                🗡️
              </div>
              <div className="bg-black/60 backdrop-blur rounded-lg p-4 border-2 border-blue-500">
                <div className="text-white font-bold mb-2">{player.name}</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">HP</span>
                    <div className="w-32 bg-gray-800 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                        {player.hp}/{player.maxHp}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">MP</span>
                    <div className="w-32 bg-gray-800 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                        {player.mp}/{player.maxMp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VS Indicator */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl font-bold text-yellow-500 animate-pulse drop-shadow-2xl">
                VS
              </div>
            </div>

            {/* Enemy */}
            <div className={`flex flex-col items-center ${enemyAnimation}`}>
              <div className={`text-8xl mb-4 transition-all duration-300 ${
                enemyAnimation === 'attack' ? '-translate-x-10 scale-125' : ''
              } ${
                enemyAnimation === 'hurt' ? 'animate-pulse text-red-500' : ''
              }`}>
                {enemy.sprite}
              </div>
              <div className="bg-black/60 backdrop-blur rounded-lg p-4 border-2 border-red-500">
                <div className="text-white font-bold mb-2">{enemy.name}</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">HP</span>
                    <div className="w-32 bg-gray-800 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                        {enemyHp}/{enemy.maxHp}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    공격력: {enemy.attack} | 방어력: {enemy.defense}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-black/80 backdrop-blur border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 rounded-lg p-3 h-24 overflow-y-auto mb-4">
              {battleLog.slice(-4).map((log, index) => (
                <div key={index} className="text-sm text-gray-300 mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Battle Actions */}
        <div className="bg-gradient-to-t from-purple-900 to-black/80 backdrop-blur border-t border-purple-700 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={playerAttack}
                disabled={!playerTurn || isAnimating || battleEnded}
                className={`p-4 rounded-lg font-bold text-white transition-all ${
                  !playerTurn || isAnimating || battleEnded
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
                }`}
              >
                ⚔️ 공격
              </button>

              <button
                onClick={() => useSkill('fireball')}
                disabled={!playerTurn || isAnimating || battleEnded || player.mp < 10}
                className={`p-4 rounded-lg font-bold text-white transition-all ${
                  !playerTurn || isAnimating || battleEnded || player.mp < 10
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                }`}
              >
                🔥 파이어볼 (10 MP)
              </button>

              <button
                onClick={() => useSkill('heal')}
                disabled={!playerTurn || isAnimating || battleEnded || player.mp < 10}
                className={`p-4 rounded-lg font-bold text-white transition-all ${
                  !playerTurn || isAnimating || battleEnded || player.mp < 10
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'
                }`}
              >
                💚 회복 (10 MP)
              </button>

              <button
                onClick={attemptFlee}
                disabled={!playerTurn || isAnimating || battleEnded}
                className={`p-4 rounded-lg font-bold text-white transition-all ${
                  !playerTurn || isAnimating || battleEnded
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 hover:scale-105 active:scale-95'
                }`}
              >
                🏃 도망
              </button>
            </div>

            {/* Turn Indicator */}
            <div className="mt-4 text-center">
              <div className={`inline-block px-6 py-2 rounded-full font-bold ${
                playerTurn ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {playerTurn ? '플레이어 턴' : '적 턴'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battle;