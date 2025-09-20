import { Player, Monster } from '../types/game';

export interface BattleUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: {
    attack: number;
    defense: number;
    magic: number;
    resistance: number;
    speed: number;
    luck: number;
  };
  skills: BattleSkill[];
  statusEffects: StatusEffect[];
  equipment?: Equipment[];
  element?: ElementType;
}

export interface BattleSkill {
  id: string;
  name: string;
  description: string;
  type: 'physical' | 'magical' | 'support' | 'healing';
  element?: ElementType;
  mpCost: number;
  cooldown: number;
  currentCooldown: number;
  targetType: 'single' | 'all' | 'self' | 'ally' | 'random';
  effects: SkillEffect[];
  animation: string;
  soundEffect: string;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status';
  value: number;
  scaling?: {
    stat: string;
    ratio: number;
  };
  duration?: number;
  chance?: number;
  status?: StatusEffectType;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: StatusEffectType;
  icon: string;
  duration: number;
  stackable: boolean;
  stacks: number;
  maxStacks: number;
  effects: {
    stat?: string;
    value?: number;
    dotDamage?: number;
    hotHeal?: number;
    skipTurn?: boolean;
  };
}

export type StatusEffectType =
  | 'poison' | 'burn' | 'freeze' | 'paralyze' | 'sleep'
  | 'confuse' | 'silence' | 'blind' | 'slow' | 'haste'
  | 'attack_up' | 'attack_down' | 'defense_up' | 'defense_down'
  | 'regen' | 'barrier' | 'reflect' | 'immune';

export type ElementType =
  | 'fire' | 'water' | 'earth' | 'wind'
  | 'light' | 'dark' | 'neutral';

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  stats: Partial<BattleUnit['stats']>;
  element?: ElementType;
  skills?: string[];
  setBonus?: {
    pieces: number;
    bonus: Partial<BattleUnit['stats']>;
  };
}

export interface BattleState {
  playerTeam: BattleUnit[];
  enemyTeam: BattleUnit[];
  turnOrder: string[];
  currentTurn: number;
  currentUnit: string;
  battleLog: BattleLogEntry[];
  rewards?: BattleRewards;
  status: 'preparing' | 'ongoing' | 'victory' | 'defeat' | 'escaped';
  terrain?: TerrainType;
  weather?: WeatherType;
}

export interface BattleLogEntry {
  timestamp: number;
  unitId: string;
  action: string;
  target?: string;
  damage?: number;
  healing?: number;
  effect?: string;
  critical?: boolean;
  miss?: boolean;
}

export interface BattleRewards {
  exp: number;
  money: number;
  items: { id: string; quantity: number }[];
  unlockedSkills?: string[];
  affinity?: Record<string, number>;
}

export type TerrainType =
  | 'grassland' | 'forest' | 'mountain' | 'desert'
  | 'ocean' | 'dungeon' | 'arena' | 'void';

export type WeatherType =
  | 'clear' | 'rain' | 'storm' | 'snow' | 'fog' | 'sandstorm';

export class BattleSystem {
  private battleState: BattleState;
  private elementChart: Record<ElementType, Record<ElementType, number>>;
  private comboSystem: ComboSystem;
  private formationSystem: FormationSystem;

  constructor() {
    this.battleState = this.initializeBattleState();
    this.elementChart = this.initializeElementChart();
    this.comboSystem = new ComboSystem();
    this.formationSystem = new FormationSystem();
  }

  private initializeBattleState(): BattleState {
    return {
      playerTeam: [],
      enemyTeam: [],
      turnOrder: [],
      currentTurn: 0,
      currentUnit: '',
      battleLog: [],
      status: 'preparing'
    };
  }

  private initializeElementChart(): Record<ElementType, Record<ElementType, number>> {
    return {
      fire: { fire: 1, water: 0.5, earth: 1, wind: 1.5, light: 1, dark: 1, neutral: 1 },
      water: { fire: 1.5, water: 1, earth: 0.5, wind: 1, light: 1, dark: 1, neutral: 1 },
      earth: { fire: 1, water: 1.5, earth: 1, wind: 0.5, light: 1, dark: 1, neutral: 1 },
      wind: { fire: 0.5, water: 1, earth: 1.5, wind: 1, light: 1, dark: 1, neutral: 1 },
      light: { fire: 1, water: 1, earth: 1, wind: 1, light: 1, dark: 1.5, neutral: 1 },
      dark: { fire: 1, water: 1, earth: 1, wind: 1, light: 1.5, dark: 1, neutral: 1 },
      neutral: { fire: 1, water: 1, earth: 1, wind: 1, light: 1, dark: 1, neutral: 1 }
    };
  }

  startBattle(playerTeam: BattleUnit[], enemyTeam: BattleUnit[], terrain?: TerrainType, weather?: WeatherType) {
    this.battleState = {
      playerTeam,
      enemyTeam,
      turnOrder: this.calculateTurnOrder([...playerTeam, ...enemyTeam]),
      currentTurn: 0,
      currentUnit: '',
      battleLog: [],
      status: 'ongoing',
      terrain,
      weather
    };

    this.applyTerrainEffects();
    this.applyWeatherEffects();
    this.startTurn();
  }

  private calculateTurnOrder(units: BattleUnit[]): string[] {
    return units
      .sort((a, b) => {
        const speedA = a.stats.speed + (Math.random() * a.stats.luck);
        const speedB = b.stats.speed + (Math.random() * b.stats.luck);
        return speedB - speedA;
      })
      .map(unit => unit.id);
  }

  private startTurn() {
    const currentUnitId = this.battleState.turnOrder[this.battleState.currentTurn % this.battleState.turnOrder.length];
    this.battleState.currentUnit = currentUnitId;

    const unit = this.getUnitById(currentUnitId);
    if (!unit) return;

    this.processStatusEffects(unit);
    this.reduceCooldowns(unit);

    if (this.canAct(unit)) {
      if (this.isPlayerUnit(unit)) {
        // Wait for player input
      } else {
        this.executeAITurn(unit);
      }
    } else {
      this.endTurn();
    }
  }

  executeAction(unitId: string, skillId: string, targetId?: string) {
    const unit = this.getUnitById(unitId);
    const skill = unit?.skills.find(s => s.id === skillId);

    if (!unit || !skill) return;

    if (!this.canUseSkill(unit, skill)) return;

    const targets = this.getTargets(skill.targetType, unitId, targetId);

    for (const target of targets) {
      this.applySkillEffects(unit, target, skill);
    }

    unit.mp -= skill.mpCost;
    skill.currentCooldown = skill.cooldown;

    this.checkBattleEnd();
    this.endTurn();
  }

  private applySkillEffects(attacker: BattleUnit, target: BattleUnit, skill: BattleSkill) {
    for (const effect of skill.effects) {
      switch (effect.type) {
        case 'damage':
          this.dealDamage(attacker, target, effect, skill);
          break;
        case 'heal':
          this.healTarget(target, effect, attacker);
          break;
        case 'buff':
        case 'debuff':
          this.applyStatModifier(target, effect);
          break;
        case 'status':
          if (effect.status && Math.random() < (effect.chance || 1)) {
            this.applyStatusEffect(target, effect.status, effect.duration || 3);
          }
          break;
      }
    }
  }

  private dealDamage(attacker: BattleUnit, target: BattleUnit, effect: SkillEffect, skill: BattleSkill) {
    let damage = effect.value;

    if (effect.scaling) {
      const statValue = (attacker.stats as any)[effect.scaling.stat] || 0;
      damage += statValue * effect.scaling.ratio;
    }

    // Apply elemental advantage
    if (skill.element && target.element) {
      const modifier = this.elementChart[skill.element][target.element];
      damage *= modifier;
    }

    // Apply defense
    const defense = skill.type === 'physical' ? target.stats.defense : target.stats.resistance;
    damage = Math.max(1, damage - defense);

    // Critical hit calculation
    const critChance = attacker.stats.luck / 100;
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      damage *= 2;
    }

    // Apply damage
    target.hp = Math.max(0, target.hp - Math.floor(damage));

    this.battleState.battleLog.push({
      timestamp: Date.now(),
      unitId: attacker.id,
      action: skill.name,
      target: target.id,
      damage: Math.floor(damage),
      critical: isCritical
    });

    // Check for combo
    this.comboSystem.registerHit(attacker.id, skill.id, damage);
  }

  private healTarget(target: BattleUnit, effect: SkillEffect, healer: BattleUnit) {
    let healing = effect.value;

    if (effect.scaling) {
      const statValue = (healer.stats as any)[effect.scaling.stat] || 0;
      healing += statValue * effect.scaling.ratio;
    }

    target.hp = Math.min(target.maxHp, target.hp + healing);

    this.battleState.battleLog.push({
      timestamp: Date.now(),
      unitId: healer.id,
      action: 'Heal',
      target: target.id,
      healing
    });
  }

  private applyStatModifier(target: BattleUnit, effect: SkillEffect) {
    const statusType = effect.type === 'buff'
      ? `${effect.value > 0 ? 'attack' : 'defense'}_up`
      : `${effect.value > 0 ? 'attack' : 'defense'}_down`;

    this.applyStatusEffect(target, statusType as StatusEffectType, effect.duration || 3);
  }

  private applyStatusEffect(target: BattleUnit, type: StatusEffectType, duration: number) {
    const existingEffect = target.statusEffects.find(e => e.type === type);

    if (existingEffect && existingEffect.stackable) {
      existingEffect.stacks = Math.min(existingEffect.maxStacks, existingEffect.stacks + 1);
      existingEffect.duration = Math.max(existingEffect.duration, duration);
    } else if (!existingEffect) {
      target.statusEffects.push({
        id: `${type}_${Date.now()}`,
        name: this.getStatusName(type),
        type,
        icon: this.getStatusIcon(type),
        duration,
        stackable: this.isStackable(type),
        stacks: 1,
        maxStacks: 5,
        effects: this.getStatusEffects(type)
      });
    }
  }

  private processStatusEffects(unit: BattleUnit) {
    for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
      const effect = unit.statusEffects[i];

      // Apply effect
      if (effect.effects.dotDamage) {
        unit.hp = Math.max(0, unit.hp - effect.effects.dotDamage * effect.stacks);
      }
      if (effect.effects.hotHeal) {
        unit.hp = Math.min(unit.maxHp, unit.hp + effect.effects.hotHeal * effect.stacks);
      }

      // Reduce duration
      effect.duration--;
      if (effect.duration <= 0) {
        unit.statusEffects.splice(i, 1);
      }
    }
  }

  private canAct(unit: BattleUnit): boolean {
    const blockingEffects = ['paralyze', 'sleep', 'freeze'];
    return !unit.statusEffects.some(e => blockingEffects.includes(e.type));
  }

  private canUseSkill(unit: BattleUnit, skill: BattleSkill): boolean {
    if (unit.mp < skill.mpCost) return false;
    if (skill.currentCooldown > 0) return false;
    if (unit.statusEffects.some(e => e.type === 'silence' && skill.type === 'magical')) return false;
    return true;
  }

  private reduceCooldowns(unit: BattleUnit) {
    for (const skill of unit.skills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    }
  }

  private getTargets(targetType: string, attackerId: string, targetId?: string): BattleUnit[] {
    const isPlayer = this.isPlayerUnit({ id: attackerId } as BattleUnit);

    switch (targetType) {
      case 'single':
        return targetId ? [this.getUnitById(targetId)!].filter(Boolean) : [];
      case 'all':
        return isPlayer ? this.battleState.enemyTeam : this.battleState.playerTeam;
      case 'self':
        return [this.getUnitById(attackerId)!].filter(Boolean);
      case 'ally':
        const allies = isPlayer ? this.battleState.playerTeam : this.battleState.enemyTeam;
        return targetId ? [allies.find(u => u.id === targetId)!].filter(Boolean) : [];
      case 'random':
        const enemies = isPlayer ? this.battleState.enemyTeam : this.battleState.playerTeam;
        const alive = enemies.filter(u => u.hp > 0);
        return alive.length > 0 ? [alive[Math.floor(Math.random() * alive.length)]] : [];
      default:
        return [];
    }
  }

  private executeAITurn(unit: BattleUnit) {
    const availableSkills = unit.skills.filter(s => this.canUseSkill(unit, s));
    if (availableSkills.length === 0) {
      this.endTurn();
      return;
    }

    // Simple AI: Use random available skill
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    let target: string | undefined;

    if (skill.targetType === 'single') {
      const enemies = this.battleState.playerTeam.filter(u => u.hp > 0);
      if (enemies.length > 0) {
        target = enemies[Math.floor(Math.random() * enemies.length)].id;
      }
    }

    this.executeAction(unit.id, skill.id, target);
  }

  private applyTerrainEffects() {
    if (!this.battleState.terrain) return;

    const terrainEffects: Record<TerrainType, () => void> = {
      'grassland': () => {
        // Heal 5 HP per turn for nature units
      },
      'forest': () => {
        // Increase evasion by 10%
      },
      'mountain': () => {
        // Increase defense by 20%
      },
      'desert': () => {
        // Reduce water damage by 30%
      },
      'ocean': () => {
        // Increase water damage by 50%
      },
      'dungeon': () => {
        // Reduce healing by 30%
      },
      'arena': () => {
        // No special effects
      },
      'void': () => {
        // Random effects each turn
      }
    };

    const effect = terrainEffects[this.battleState.terrain];
    if (effect) effect();
  }

  private applyWeatherEffects() {
    if (!this.battleState.weather) return;

    const weatherEffects: Record<WeatherType, () => void> = {
      'clear': () => {
        // Normal conditions
      },
      'rain': () => {
        // Fire damage -30%, Water damage +30%
      },
      'storm': () => {
        // Lightning damage chance each turn
      },
      'snow': () => {
        // Speed -20% for all units
      },
      'fog': () => {
        // Accuracy -30% for all attacks
      },
      'sandstorm': () => {
        // 5 damage per turn to all units
      }
    };

    const effect = weatherEffects[this.battleState.weather];
    if (effect) effect();
  }

  private checkBattleEnd() {
    const playerAlive = this.battleState.playerTeam.some(u => u.hp > 0);
    const enemyAlive = this.battleState.enemyTeam.some(u => u.hp > 0);

    if (!playerAlive) {
      this.battleState.status = 'defeat';
      this.endBattle();
    } else if (!enemyAlive) {
      this.battleState.status = 'victory';
      this.calculateRewards();
      this.endBattle();
    }
  }

  private calculateRewards() {
    let totalExp = 0;
    let totalMoney = 0;
    const items: { id: string; quantity: number }[] = [];

    for (const enemy of this.battleState.enemyTeam) {
      totalExp += 50 * enemy.stats.attack;
      totalMoney += 100 * Math.floor(Math.random() * 5 + 1);

      // Random item drops
      if (Math.random() < 0.3) {
        items.push({
          id: 'potion',
          quantity: Math.floor(Math.random() * 3 + 1)
        });
      }
    }

    this.battleState.rewards = {
      exp: totalExp,
      money: totalMoney,
      items
    };
  }

  private endTurn() {
    this.battleState.currentTurn++;
    this.startTurn();
  }

  private endBattle() {
    // Clean up battle state
    // Trigger battle end events
  }

  private getUnitById(id: string): BattleUnit | undefined {
    return [...this.battleState.playerTeam, ...this.battleState.enemyTeam].find(u => u.id === id);
  }

  private isPlayerUnit(unit: BattleUnit): boolean {
    return this.battleState.playerTeam.some(u => u.id === unit.id);
  }

  private getStatusName(type: StatusEffectType): string {
    const names: Record<StatusEffectType, string> = {
      'poison': '중독',
      'burn': '화상',
      'freeze': '빙결',
      'paralyze': '마비',
      'sleep': '수면',
      'confuse': '혼란',
      'silence': '침묵',
      'blind': '실명',
      'slow': '둔화',
      'haste': '가속',
      'attack_up': '공격력 상승',
      'attack_down': '공격력 하락',
      'defense_up': '방어력 상승',
      'defense_down': '방어력 하락',
      'regen': '재생',
      'barrier': '방벽',
      'reflect': '반사',
      'immune': '면역'
    };
    return names[type] || type;
  }

  private getStatusIcon(type: StatusEffectType): string {
    const icons: Record<StatusEffectType, string> = {
      'poison': '🟢',
      'burn': '🔥',
      'freeze': '❄️',
      'paralyze': '⚡',
      'sleep': '😴',
      'confuse': '💫',
      'silence': '🤐',
      'blind': '👁️',
      'slow': '🐌',
      'haste': '💨',
      'attack_up': '⬆️',
      'attack_down': '⬇️',
      'defense_up': '🛡️',
      'defense_down': '💔',
      'regen': '💚',
      'barrier': '🔰',
      'reflect': '🪞',
      'immune': '✨'
    };
    return icons[type] || '❓';
  }

  private isStackable(type: StatusEffectType): boolean {
    const stackable = ['poison', 'burn', 'attack_up', 'attack_down', 'defense_up', 'defense_down'];
    return stackable.includes(type);
  }

  private getStatusEffects(type: StatusEffectType): StatusEffect['effects'] {
    const effects: Record<StatusEffectType, StatusEffect['effects']> = {
      'poison': { dotDamage: 5 },
      'burn': { dotDamage: 8 },
      'freeze': { skipTurn: true },
      'paralyze': { skipTurn: true },
      'sleep': { skipTurn: true },
      'confuse': {},
      'silence': {},
      'blind': {},
      'slow': { stat: 'speed', value: -50 },
      'haste': { stat: 'speed', value: 50 },
      'attack_up': { stat: 'attack', value: 20 },
      'attack_down': { stat: 'attack', value: -20 },
      'defense_up': { stat: 'defense', value: 20 },
      'defense_down': { stat: 'defense', value: -20 },
      'regen': { hotHeal: 10 },
      'barrier': {},
      'reflect': {},
      'immune': {}
    };
    return effects[type] || {};
  }

  getBattleState(): BattleState {
    return this.battleState;
  }

  escape(): boolean {
    const escapeChance = 0.5;
    if (Math.random() < escapeChance) {
      this.battleState.status = 'escaped';
      this.endBattle();
      return true;
    }
    this.endTurn();
    return false;
  }
}

class ComboSystem {
  private combos: Map<string, { count: number; damage: number; timestamp: number }> = new Map();
  private comboWindow: number = 3000;

  registerHit(unitId: string, skillId: string, damage: number) {
    const now = Date.now();
    const combo = this.combos.get(unitId);

    if (combo && (now - combo.timestamp) < this.comboWindow) {
      combo.count++;
      combo.damage += damage * (1 + combo.count * 0.1);
      combo.timestamp = now;
    } else {
      this.combos.set(unitId, {
        count: 1,
        damage,
        timestamp: now
      });
    }
  }

  getCombo(unitId: string): number {
    const combo = this.combos.get(unitId);
    if (!combo) return 0;

    if ((Date.now() - combo.timestamp) > this.comboWindow) {
      this.combos.delete(unitId);
      return 0;
    }

    return combo.count;
  }
}

class FormationSystem {
  private formations: Map<string, Formation> = new Map();

  constructor() {
    this.initializeFormations();
  }

  private initializeFormations() {
    this.formations.set('balanced', {
      name: '균형진',
      positions: ['front', 'middle', 'middle', 'back'],
      bonuses: { all: 5 }
    });

    this.formations.set('offensive', {
      name: '공격진',
      positions: ['front', 'front', 'middle', 'back'],
      bonuses: { attack: 20, defense: -10 }
    });

    this.formations.set('defensive', {
      name: '방어진',
      positions: ['back', 'middle', 'middle', 'front'],
      bonuses: { defense: 20, attack: -10 }
    });
  }

  applyFormation(team: BattleUnit[], formationId: string) {
    const formation = this.formations.get(formationId);
    if (!formation) return;

    // Apply formation bonuses to team
    for (const unit of team) {
      if (formation.bonuses.all) {
        Object.keys(unit.stats).forEach(stat => {
          (unit.stats as any)[stat] += formation.bonuses.all!;
        });
      }
      if (formation.bonuses.attack) {
        unit.stats.attack += formation.bonuses.attack;
      }
      if (formation.bonuses.defense) {
        unit.stats.defense += formation.bonuses.defense;
      }
    }
  }
}

interface Formation {
  name: string;
  positions: ('front' | 'middle' | 'back')[];
  bonuses: {
    attack?: number;
    defense?: number;
    speed?: number;
    all?: number;
  };
}