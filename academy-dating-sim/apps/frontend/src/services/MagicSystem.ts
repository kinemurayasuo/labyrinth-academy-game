import { EventEmitter } from 'events';

interface Element {
  id: string;
  name: string;
  strongAgainst: string[];
  weakAgainst: string[];
  affinityBonus: Record<string, number>;
}

interface Spell {
  id: string;
  name: string;
  category: string;
  element: string;
  tier: number;
  manaCost: number;
  damage?: number;
  healing?: number;
  castTime: number;
  cooldown: number;
  range?: number | string;
  aoe?: boolean;
  aoeRadius?: number;
  description: string;
  requirements: {
    level?: number;
    intelligence?: number;
    spell?: string;
    item?: string;
  };
}

interface SpellCombo {
  id: string;
  name: string;
  spells: string[];
  timing: 'simultaneous' | 'sequential' | 'channeled';
  damage?: number;
  effect?: Record<string, any>;
}

interface MagicSchool {
  name: string;
  description: string;
  bonuses: Record<string, any>;
  restrictedSpells?: string[];
  unlockRequirement?: Record<string, any>;
}

interface MagicDuel {
  id: string;
  participants: string[];
  arena: string;
  turn: number;
  currentPlayer: string;
  mana: Map<string, number>;
  hp: Map<string, number>;
  status: 'preparing' | 'active' | 'ended';
  winner?: string;
}

export class MagicSystem extends EventEmitter {
  private elements: Map<string, Element> = new Map();
  private spells: Map<string, Spell> = new Map();
  private learnedSpells: Map<string, Set<string>> = new Map();
  private spellMastery: Map<string, Map<string, number>> = new Map();
  private combos: Map<string, SpellCombo> = new Map();
  private schools: Map<string, MagicSchool> = new Map();
  private activeDuels: Map<string, MagicDuel> = new Map();
  private cooldowns: Map<string, Map<string, number>> = new Map();
  private mana: Map<string, number> = new Map();
  private maxMana: Map<string, number> = new Map();
  private elementAffinity: Map<string, Map<string, number>> = new Map();

  constructor() {
    super();
    this.loadMagicData();
  }

  private loadMagicData(): void {
    console.log('Loading magic system data...');
  }

  public learnSpell(characterId: string, spellId: string): boolean {
    const spell = this.spells.get(spellId);
    if (!spell) return false;

    if (!this.checkRequirements(characterId, spell.requirements)) {
      this.emit('spell-learn-failed', { characterId, spellId, reason: 'requirements' });
      return false;
    }

    if (!this.learnedSpells.has(characterId)) {
      this.learnedSpells.set(characterId, new Set());
    }

    this.learnedSpells.get(characterId)!.add(spellId);
    this.initializeSpellMastery(characterId, spellId);

    this.emit('spell-learned', { characterId, spellId, spell });
    return true;
  }

  private checkRequirements(characterId: string, requirements: any): boolean {
    // Check level, intelligence, items, etc.
    return true;
  }

  private initializeSpellMastery(characterId: string, spellId: string): void {
    if (!this.spellMastery.has(characterId)) {
      this.spellMastery.set(characterId, new Map());
    }
    this.spellMastery.get(characterId)!.set(spellId, 0);
  }

  public castSpell(
    casterId: string,
    spellId: string,
    targetId?: string,
    position?: { x: number, y: number }
  ): boolean {
    const spell = this.spells.get(spellId);
    if (!spell) return false;

    // Check if spell is learned
    if (!this.learnedSpells.get(casterId)?.has(spellId)) {
      this.emit('cast-failed', { casterId, spellId, reason: 'not-learned' });
      return false;
    }

    // Check mana
    const currentMana = this.mana.get(casterId) || 0;
    if (currentMana < spell.manaCost) {
      this.emit('cast-failed', { casterId, spellId, reason: 'insufficient-mana' });
      return false;
    }

    // Check cooldown
    if (this.isOnCooldown(casterId, spellId)) {
      this.emit('cast-failed', { casterId, spellId, reason: 'cooldown' });
      return false;
    }

    // Cast the spell
    this.mana.set(casterId, currentMana - spell.manaCost);
    this.setCooldown(casterId, spellId, spell.cooldown);
    this.increaseSpellMastery(casterId, spellId);

    // Calculate damage/effect with elemental affinity
    const elementalBonus = this.calculateElementalBonus(casterId, spell.element);
    const mastery = this.spellMastery.get(casterId)?.get(spellId) || 0;
    const finalDamage = (spell.damage || 0) * (1 + elementalBonus + mastery * 0.01);

    this.emit('spell-cast', {
      casterId,
      targetId,
      spellId,
      spell,
      finalDamage,
      position
    });

    // Apply spell effects
    this.applySpellEffects(spell, casterId, targetId, finalDamage);

    return true;
  }

  private isOnCooldown(characterId: string, spellId: string): boolean {
    const charCooldowns = this.cooldowns.get(characterId);
    if (!charCooldowns) return false;

    const cooldown = charCooldowns.get(spellId);
    return cooldown ? cooldown > Date.now() : false;
  }

  private setCooldown(characterId: string, spellId: string, duration: number): void {
    if (!this.cooldowns.has(characterId)) {
      this.cooldowns.set(characterId, new Map());
    }
    this.cooldowns.get(characterId)!.set(spellId, Date.now() + duration * 1000);
  }

  private increaseSpellMastery(characterId: string, spellId: string): void {
    const current = this.spellMastery.get(characterId)?.get(spellId) || 0;
    this.spellMastery.get(characterId)?.set(spellId, Math.min(100, current + 1));
  }

  private calculateElementalBonus(characterId: string, element: string): number {
    const affinity = this.elementAffinity.get(characterId)?.get(element) || 0;
    return affinity * 0.01;
  }

  private applySpellEffects(
    spell: Spell,
    casterId: string,
    targetId?: string,
    damage?: number
  ): void {
    if (spell.damage && targetId && damage) {
      this.dealDamage(targetId, damage);
    }

    if (spell.healing && targetId) {
      this.healTarget(targetId, spell.healing);
    }
  }

  private dealDamage(targetId: string, damage: number): void {
    this.emit('damage-dealt', { targetId, damage });
  }

  private healTarget(targetId: string, amount: number): void {
    this.emit('healing-done', { targetId, amount });
  }

  public executeCombo(casterId: string, spellIds: string[]): boolean {
    const comboKey = spellIds.sort().join(',');
    const combo = Array.from(this.combos.values()).find(
      c => c.spells.sort().join(',') === comboKey
    );

    if (!combo) return false;

    // Check if all spells are learned
    const learned = this.learnedSpells.get(casterId);
    if (!learned || !spellIds.every(id => learned.has(id))) {
      return false;
    }

    // Execute combo with bonus effects
    this.emit('combo-executed', {
      casterId,
      combo,
      spellIds
    });

    return true;
  }

  public startDuel(participant1: string, participant2: string, arenaId: string): string {
    const duelId = `duel_${Date.now()}`;
    const duel: MagicDuel = {
      id: duelId,
      participants: [participant1, participant2],
      arena: arenaId,
      turn: 0,
      currentPlayer: participant1,
      mana: new Map([
        [participant1, this.maxMana.get(participant1) || 500],
        [participant2, this.maxMana.get(participant2) || 500]
      ]),
      hp: new Map([
        [participant1, 1000],
        [participant2, 1000]
      ]),
      status: 'preparing'
    };

    this.activeDuels.set(duelId, duel);

    setTimeout(() => {
      duel.status = 'active';
      this.emit('duel-started', { duelId, duel });
    }, 3000);

    return duelId;
  }

  public duelAction(
    duelId: string,
    playerId: string,
    action: { type: 'spell' | 'defend' | 'surrender', spellId?: string }
  ): boolean {
    const duel = this.activeDuels.get(duelId);
    if (!duel || duel.status !== 'active') return false;
    if (duel.currentPlayer !== playerId) return false;

    const opponentId = duel.participants.find(p => p !== playerId)!;

    switch (action.type) {
      case 'spell':
        if (action.spellId) {
          const success = this.castSpellInDuel(duelId, playerId, action.spellId, opponentId);
          if (!success) return false;
        }
        break;

      case 'defend':
        this.defendInDuel(playerId);
        break;

      case 'surrender':
        this.endDuel(duelId, opponentId);
        return true;
    }

    // Check win conditions
    if ((duel.hp.get(opponentId) || 0) <= 0) {
      this.endDuel(duelId, playerId);
      return true;
    }

    // Switch turns
    duel.turn++;
    duel.currentPlayer = opponentId;

    this.emit('duel-turn', { duelId, currentPlayer: duel.currentPlayer, turn: duel.turn });
    return true;
  }

  private castSpellInDuel(
    duelId: string,
    casterId: string,
    spellId: string,
    targetId: string
  ): boolean {
    const duel = this.activeDuels.get(duelId);
    if (!duel) return false;

    const spell = this.spells.get(spellId);
    if (!spell) return false;

    const casterMana = duel.mana.get(casterId) || 0;
    if (casterMana < spell.manaCost) return false;

    duel.mana.set(casterId, casterMana - spell.manaCost);

    if (spell.damage) {
      const targetHp = duel.hp.get(targetId) || 0;
      duel.hp.set(targetId, Math.max(0, targetHp - spell.damage));
    }

    this.emit('duel-spell-cast', { duelId, casterId, targetId, spellId, spell });
    return true;
  }

  private defendInDuel(playerId: string): void {
    this.emit('duel-defend', { playerId });
  }

  private endDuel(duelId: string, winnerId: string): void {
    const duel = this.activeDuels.get(duelId);
    if (!duel) return;

    duel.status = 'ended';
    duel.winner = winnerId;

    this.emit('duel-ended', {
      duelId,
      winner: winnerId,
      loser: duel.participants.find(p => p !== winnerId)
    });

    setTimeout(() => {
      this.activeDuels.delete(duelId);
    }, 5000);
  }

  public trainMagic(characterId: string, trainingType: string, duration: number): void {
    this.emit('magic-training-started', { characterId, trainingType, duration });

    setTimeout(() => {
      const rewards = this.calculateTrainingRewards(trainingType, duration);

      if (rewards.manaIncrease) {
        const current = this.maxMana.get(characterId) || 100;
        this.maxMana.set(characterId, current + rewards.manaIncrease);
      }

      if (rewards.elementAffinity) {
        this.increaseElementAffinity(characterId, rewards.elementAffinity.element, rewards.elementAffinity.amount);
      }

      if (rewards.newSpell) {
        this.learnSpell(characterId, rewards.newSpell);
      }

      this.emit('magic-training-completed', { characterId, trainingType, rewards });
    }, duration * 1000);
  }

  private calculateTrainingRewards(trainingType: string, duration: number): any {
    const baseRewards: Record<string, any> = {
      meditation: { manaIncrease: 10, elementAffinity: { element: 'random', amount: 5 } },
      practice: { spellMasteryIncrease: 10 },
      research: { newSpell: this.getRandomUnlearnedSpell() },
      ritual: { manaIncrease: 50, permanentBoost: true }
    };

    return baseRewards[trainingType] || {};
  }

  private getRandomUnlearnedSpell(): string {
    const allSpells = Array.from(this.spells.keys());
    return allSpells[Math.floor(Math.random() * allSpells.length)];
  }

  private increaseElementAffinity(characterId: string, element: string, amount: number): void {
    if (!this.elementAffinity.has(characterId)) {
      this.elementAffinity.set(characterId, new Map());
    }

    const current = this.elementAffinity.get(characterId)!.get(element) || 0;
    this.elementAffinity.get(characterId)!.set(element, Math.min(100, current + amount));
  }

  public enchantItem(itemId: string, enchantmentSpellId: string): boolean {
    const spell = this.spells.get(enchantmentSpellId);
    if (!spell || spell.category !== 'enchantment') return false;

    this.emit('item-enchanted', { itemId, enchantmentSpellId, spell });
    return true;
  }

  public getManaPercentage(characterId: string): number {
    const current = this.mana.get(characterId) || 0;
    const max = this.maxMana.get(characterId) || 100;
    return (current / max) * 100;
  }

  public regenerateMana(characterId: string, amount: number): void {
    const current = this.mana.get(characterId) || 0;
    const max = this.maxMana.get(characterId) || 100;
    this.mana.set(characterId, Math.min(max, current + amount));
  }

  public getLearnedSpells(characterId: string): string[] {
    return Array.from(this.learnedSpells.get(characterId) || []);
  }

  public getSpellMastery(characterId: string, spellId: string): number {
    return this.spellMastery.get(characterId)?.get(spellId) || 0;
  }

  public getElementAffinity(characterId: string, element: string): number {
    return this.elementAffinity.get(characterId)?.get(element) || 0;
  }

  public checkMagicEvent(): void {
    const events = ['mana_surge', 'eclipse', 'ley_line_activation'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    if (Math.random() < 0.1) {
      this.emit('magic-event', { event: randomEvent });
    }
  }
}