import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import skillsData from '../../data/skills.json';

const skills = skillsData.skills as Record<string, any>;

interface StatusEffect {
  name: string;
  icon: string;
  duration: number;
  type: 'buff' | 'debuff';
  effect: {
    attack?: number;
    defense?: number;
    speed?: number;
    dotDamage?: number;
    healOverTime?: number;
  };
}

interface BattleState {
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMp: number;
  turn: 'player' | 'enemy';
  battleLog: string[];
  playerEffects: StatusEffect[];
  enemyEffects: StatusEffect[];
  turnCount: number;
  skillCooldowns: Record<string, number>;
  isAnimating: boolean;
  currentAnimation: string | null;
}

interface EnhancedBattleScreenProps {
  enemy: any;
  onVictory: () => void;
  onDefeat: () => void;
  onFlee: () => void;
}

const EnhancedBattleScreen: React.FC<EnhancedBattleScreenProps> = ({
  enemy,
  onVictory,
  onDefeat,
  onFlee,
}) => {
  const player = useGameStore((state: any) => state.player);
  const { updateHpMp, gainExperience, addItem, updateMoney } = useGameStore((state: any) => state.actions);

  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: player.hp,
    playerMp: player.mp,
    enemyHp: enemy.hp || enemy.maxHp,
    enemyMp: enemy.mp || 50,
    turn: 'player',
    battleLog: [`${enemy.name}과(와)의 전투가 시작되었습니다!`],
    playerEffects: [],
    enemyEffects: [],
    turnCount: 0,
    skillCooldowns: {},
    isAnimating: false,
    currentAnimation: null,
  });

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [battleEnded, setBattleEnded] = useState(false);

  // Player available skills
  const playerSkills = [
    skills.fireball,
    skills.heal,
    skills.lightning,
    skills.ice_shard,
    skills.shield,
    skills.poison_blade,
  ].filter(skill => skill && player.level >= (skill.requiredLevel || 1));

  const addLog = (message: string) => {
    setBattleState(prev => ({
      ...prev,
      battleLog: [...prev.battleLog.slice(-4), message],
    }));
  };

  const applyStatusEffect = (target: 'player' | 'enemy', effect: StatusEffect) => {
    setBattleState(prev => {
      const effectsKey = target === 'player' ? 'playerEffects' : 'enemyEffects';
      const existingEffect = prev[effectsKey].find(e => e.name === effect.name);

      if (existingEffect) {
        // Refresh duration
        return {
          ...prev,
          [effectsKey]: prev[effectsKey].map(e =>
            e.name === effect.name ? { ...e, duration: effect.duration } : e
          ),
        };
      } else {
        return {
          ...prev,
          [effectsKey]: [...prev[effectsKey], effect],
        };
      }
    });
  };

  const processStatusEffects = (target: 'player' | 'enemy') => {
    setBattleState(prev => {
      const effectsKey = target === 'player' ? 'playerEffects' : 'enemyEffects';
      const hpKey = target === 'player' ? 'playerHp' : 'enemyHp';
      let newHp = prev[hpKey];
      let messages: string[] = [];

      const updatedEffects = prev[effectsKey].reduce((acc: StatusEffect[], effect) => {
        // Apply DOT/HOT
        if (effect.effect.dotDamage) {
          newHp -= effect.effect.dotDamage;
          messages.push(`${target === 'player' ? '플레이어' : enemy.name}가 ${effect.name}으로 ${effect.effect.dotDamage}의 피해를 입었습니다!`);
        }
        if (effect.effect.healOverTime) {
          const maxHp = target === 'player' ? player.maxHp : enemy.maxHp;
          newHp = Math.min(maxHp, newHp + effect.effect.healOverTime);
          messages.push(`${target === 'player' ? '플레이어' : enemy.name}가 ${effect.name}으로 ${effect.effect.healOverTime}의 HP를 회복했습니다!`);
        }

        // Reduce duration
        const newDuration = effect.duration - 1;
        if (newDuration > 0) {
          acc.push({ ...effect, duration: newDuration });
        } else {
          messages.push(`${effect.name} 효과가 사라졌습니다.`);
        }
        return acc;
      }, []);

      messages.forEach(msg => addLog(msg));

      return {
        ...prev,
        [effectsKey]: updatedEffects,
        [hpKey]: Math.max(0, newHp),
      };
    });
  };

  const calculateDamage = (baseDamage: number, attacker: 'player' | 'enemy') => {
    const attackerEffects = attacker === 'player' ? battleState.playerEffects : battleState.enemyEffects;
    const defenderEffects = attacker === 'player' ? battleState.enemyEffects : battleState.playerEffects;

    let damage = baseDamage;

    // Apply attacker buffs/debuffs
    attackerEffects.forEach(effect => {
      if (effect.effect.attack) {
        damage += effect.effect.attack;
      }
    });

    // Apply defender buffs/debuffs
    defenderEffects.forEach(effect => {
      if (effect.effect.defense) {
        damage = Math.max(1, damage - effect.effect.defense);
      }
    });

    // Add randomness
    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

    return Math.max(1, damage);
  };

  const performAttack = () => {
    if (battleState.isAnimating || battleEnded) return;

    setBattleState(prev => ({ ...prev, isAnimating: true, currentAnimation: 'attack' }));

    const baseDamage = player.stats?.strength || 10;
    const damage = calculateDamage(baseDamage, 'player');

    setTimeout(() => {
      setBattleState(prev => ({
        ...prev,
        enemyHp: Math.max(0, prev.enemyHp - damage),
        isAnimating: false,
        currentAnimation: null,
      }));

      addLog(`일반 공격! ${enemy.name}에게 ${damage}의 데미지!`);

      if (battleState.enemyHp - damage <= 0) {
        handleVictory();
      } else {
        endPlayerTurn();
      }
    }, 500);
  };

  const performSkill = (skillId: string) => {
    if (battleState.isAnimating || battleEnded) return;

    const skill = skills[skillId];
    if (!skill) return;

    // Check MP
    if (battleState.playerMp < skill.mpCost) {
      addLog('MP가 부족합니다!');
      return;
    }

    // Check cooldown
    if (battleState.skillCooldowns[skillId] > 0) {
      addLog(`${skill.name}은(는) 재사용 대기 중입니다! (${battleState.skillCooldowns[skillId]}턴)`);
      return;
    }

    setBattleState(prev => ({
      ...prev,
      isAnimating: true,
      currentAnimation: `skill-${skill.element}`,
      playerMp: prev.playerMp - skill.mpCost,
      skillCooldowns: {
        ...prev.skillCooldowns,
        [skillId]: skill.cooldown || 0,
      },
    }));

    setTimeout(() => {
      let message = `${skill.name} 발동!`;

      if (skill.type === 'attack') {
        const damage = calculateDamage(skill.damage || 20, 'player');
        setBattleState(prev => ({
          ...prev,
          enemyHp: Math.max(0, prev.enemyHp - damage),
        }));
        message += ` ${enemy.name}에게 ${damage}의 ${skill.element} 데미지!`;

        // Apply elemental effects
        if (skill.element === 'fire' && Math.random() < 0.3) {
          applyStatusEffect('enemy', {
            name: '화상',
            icon: '🔥',
            duration: 3,
            type: 'debuff',
            effect: { dotDamage: 5 },
          });
          message += ' 화상 효과 발동!';
        } else if (skill.element === 'ice' && Math.random() < 0.3) {
          applyStatusEffect('enemy', {
            name: '동결',
            icon: '❄️',
            duration: 2,
            type: 'debuff',
            effect: { speed: -5 },
          });
          message += ' 동결 효과 발동!';
        } else if (skill.element === 'electric' && Math.random() < 0.3) {
          applyStatusEffect('enemy', {
            name: '감전',
            icon: '⚡',
            duration: 2,
            type: 'debuff',
            effect: { attack: -3, defense: -3 },
          });
          message += ' 감전 효과 발동!';
        }
      } else if (skill.type === 'heal') {
        const healAmount = skill.healAmount || 30;
        setBattleState(prev => ({
          ...prev,
          playerHp: Math.min(player.maxHp, prev.playerHp + healAmount),
        }));
        message += ` HP를 ${healAmount} 회복!`;
      } else if (skill.type === 'buff') {
        applyStatusEffect('player', {
          name: skill.name,
          icon: skill.icon,
          duration: skill.duration || 3,
          type: 'buff',
          effect: skill.effect || {},
        });
        message += ' 버프 효과 적용!';
      }

      addLog(message);

      setBattleState(prev => ({
        ...prev,
        isAnimating: false,
        currentAnimation: null,
      }));

      if (battleState.enemyHp <= 0) {
        handleVictory();
      } else {
        endPlayerTurn();
      }
    }, 800);
  };

  const performGuard = () => {
    if (battleState.isAnimating || battleEnded) return;

    applyStatusEffect('player', {
      name: '방어 태세',
      icon: '🛡️',
      duration: 1,
      type: 'buff',
      effect: { defense: 10 },
    });

    // Restore some MP
    setBattleState(prev => ({
      ...prev,
      playerMp: Math.min(player.maxMp, prev.playerMp + 5),
    }));

    addLog('방어 태세! 방어력이 증가하고 MP를 5 회복했습니다.');
    endPlayerTurn();
  };

  const endPlayerTurn = () => {
    // Process player status effects
    processStatusEffects('player');

    // Reduce cooldowns
    setBattleState(prev => ({
      ...prev,
      skillCooldowns: Object.entries(prev.skillCooldowns).reduce((acc, [key, value]) => {
        acc[key] = Math.max(0, value - 1);
        return acc;
      }, {} as Record<string, number>),
      turn: 'enemy',
      turnCount: prev.turnCount + 1,
    }));

    setTimeout(() => enemyTurn(), 1000);
  };

  const enemyTurn = () => {
    if (battleEnded) return;

    setBattleState(prev => ({ ...prev, isAnimating: true, currentAnimation: 'enemy-attack' }));

    // Enemy AI
    const action = Math.random();

    setTimeout(() => {
      if (action < 0.6) {
        // Normal attack
        const damage = calculateDamage(enemy.attack || 5, 'enemy');
        setBattleState(prev => ({
          ...prev,
          playerHp: Math.max(0, prev.playerHp - damage),
        }));
        addLog(`${enemy.name}의 공격! ${damage}의 데미지를 받았습니다!`);
      } else if (action < 0.9 && battleState.enemyMp >= 10) {
        // Special attack
        const damage = calculateDamage((enemy.attack || 5) * 1.5, 'enemy');
        setBattleState(prev => ({
          ...prev,
          playerHp: Math.max(0, prev.playerHp - damage),
          enemyMp: prev.enemyMp - 10,
        }));
        addLog(`${enemy.name}의 특수 공격! ${damage}의 큰 데미지를 받았습니다!`);

        // Chance to apply debuff
        if (Math.random() < 0.3) {
          applyStatusEffect('player', {
            name: '약화',
            icon: '💔',
            duration: 2,
            type: 'debuff',
            effect: { attack: -3 },
          });
          addLog('약화 효과에 걸렸습니다!');
        }
      } else {
        // Guard/Heal
        setBattleState(prev => ({
          ...prev,
          enemyHp: Math.min(enemy.maxHp, prev.enemyHp + 10),
        }));
        addLog(`${enemy.name}이(가) 회복했습니다!`);
      }

      // Process enemy status effects
      processStatusEffects('enemy');

      setBattleState(prev => ({
        ...prev,
        isAnimating: false,
        currentAnimation: null,
        turn: 'player',
      }));

      // Check if player is defeated
      if (battleState.playerHp <= 0) {
        handleDefeat();
      }
    }, 800);
  };

  const handleVictory = () => {
    setBattleEnded(true);
    addLog(`승리! ${enemy.name}을(를) 물리쳤습니다!`);

    // Calculate rewards
    const exp = enemy.experience || 10;
    const gold = enemy.gold || Math.floor(Math.random() * 20) + 10;

    gainExperience(exp);
    updateMoney(gold);

    // Random item drop
    if (enemy.drops && Math.random() < 0.5) {
      const drop = enemy.drops[Math.floor(Math.random() * enemy.drops.length)];
      if (drop) {
        addItem(drop.itemId);
        addLog(`${drop.itemId}을(를) 획득했습니다!`);
      }
    }

    addLog(`경험치 +${exp}, 골드 +${gold}`);

    // Update HP/MP in store
    updateHpMp(battleState.playerHp, battleState.playerMp);

    setTimeout(() => {
      onVictory();
    }, 2000);
  };

  const handleDefeat = () => {
    setBattleEnded(true);
    addLog('패배했습니다...');

    // Penalty
    const goldLoss = Math.floor(player.money * 0.1);
    updateMoney(-goldLoss);
    updateHpMp(1, player.mp); // Set HP to 1

    addLog(`골드를 ${goldLoss} 잃었습니다.`);

    setTimeout(() => {
      onDefeat();
    }, 2000);
  };

  const handleFlee = () => {
    if (battleState.isAnimating || battleEnded) return;

    const fleeChance = 0.6 + (player.stats?.agility || 10) * 0.02;

    if (Math.random() < fleeChance) {
      addLog('도망쳤습니다!');
      updateHpMp(battleState.playerHp, battleState.playerMp);
      setTimeout(() => onFlee(), 1000);
    } else {
      addLog('도망치지 못했습니다!');
      endPlayerTurn();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="w-full max-w-6xl h-full max-h-[90vh] glass-card p-6 overflow-hidden">
        {/* Battle Arena */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Player Side */}
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {player.name} (Lv.{player.level})
              </h3>

              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">HP</span>
                  <span className="text-text-secondary">
                    {battleState.playerHp}/{player.maxHp}
                  </span>
                </div>
                <div className="w-full h-4 bg-background-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${(battleState.playerHp / player.maxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* MP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-400">MP</span>
                  <span className="text-text-secondary">
                    {battleState.playerMp}/{player.maxMp}
                  </span>
                </div>
                <div className="w-full h-4 bg-background-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${(battleState.playerMp / player.maxMp) * 100}%` }}
                  />
                </div>
              </div>

              {/* Status Effects */}
              {battleState.playerEffects.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {battleState.playerEffects.map((effect, idx) => (
                    <div
                      key={idx}
                      className={`badge ${effect.type === 'buff' ? 'badge-success' : 'badge-error'}`}
                      title={effect.name}
                    >
                      {effect.icon} {effect.duration}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Player Sprite */}
            <div className={`h-48 flex items-center justify-center ${
              battleState.currentAnimation === 'attack' ? 'animate-pulse' : ''
            }`}>
              <div className="text-8xl">⚔️</div>
            </div>
          </div>

          {/* Enemy Side */}
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {enemy.name}
              </h3>

              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">HP</span>
                  <span className="text-text-secondary">
                    {battleState.enemyHp}/{enemy.maxHp}
                  </span>
                </div>
                <div className="w-full h-4 bg-background-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${(battleState.enemyHp / enemy.maxHp) * 100}%` }}
                  />
                </div>
              </div>

              {/* Status Effects */}
              {battleState.enemyEffects.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {battleState.enemyEffects.map((effect, idx) => (
                    <div
                      key={idx}
                      className={`badge ${effect.type === 'buff' ? 'badge-success' : 'badge-error'}`}
                      title={effect.name}
                    >
                      {effect.icon} {effect.duration}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enemy Sprite */}
            <div className={`h-48 flex items-center justify-center ${
              battleState.currentAnimation === 'enemy-attack' ? 'animate-bounce' : ''
            }`}>
              <div className="text-8xl">{enemy.icon || '👹'}</div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="glass-card p-3 h-24 mb-4 overflow-y-auto">
          {battleState.battleLog.map((log, idx) => (
            <div key={idx} className="text-sm text-text-secondary">
              {log}
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className="glass-card p-4">
          {battleState.turn === 'player' && !battleEnded ? (
            <div className="space-y-3">
              {/* Basic Actions */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={performAttack}
                  disabled={battleState.isAnimating}
                  className="btn-primary px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  ⚔️ 공격
                </button>
                <button
                  onClick={() => setSelectedSkill(selectedSkill ? null : 'skills')}
                  disabled={battleState.isAnimating}
                  className="btn-accent px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  ✨ 스킬
                </button>
                <button
                  onClick={performGuard}
                  disabled={battleState.isAnimating}
                  className="btn-secondary px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  🛡️ 방어
                </button>
                <button
                  onClick={handleFlee}
                  disabled={battleState.isAnimating}
                  className="btn-ghost px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  🏃 도망
                </button>
              </div>

              {/* Skills Panel */}
              {selectedSkill === 'skills' && (
                <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-background-dark rounded-lg">
                  {playerSkills.map(skill => {
                    const onCooldown = battleState.skillCooldowns[skill.id] > 0;
                    const noMp = battleState.playerMp < skill.mpCost;

                    return (
                      <button
                        key={skill.id}
                        onClick={() => performSkill(skill.id)}
                        disabled={battleState.isAnimating || onCooldown || noMp}
                        className={`p-3 rounded-lg text-left transition-all ${
                          onCooldown || noMp
                            ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                            : 'bg-primary/20 hover:bg-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{skill.icon}</span>
                          <div>
                            <div className="font-semibold text-text-primary">{skill.name}</div>
                            <div className="text-xs text-text-secondary">
                              MP: {skill.mpCost}
                              {onCooldown && ` (CD: ${battleState.skillCooldowns[skill.id]})`}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : battleState.turn === 'enemy' && !battleEnded ? (
            <div className="text-center text-text-secondary py-4">
              <div className="animate-pulse">적의 턴...</div>
            </div>
          ) : battleEnded ? (
            <div className="text-center py-4">
              <div className="text-2xl font-bold text-text-primary mb-2">
                전투 종료!
              </div>
              <button
                onClick={battleState.playerHp > 0 ? onVictory : onDefeat}
                className="btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                계속하기
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBattleScreen;