export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'social' | 'academic' | 'athletic' | 'special';
  tier: number;
  maxLevel: number;
  currentLevel: number;
  prerequisites: string[];
  cost: {
    skillPoints: number;
    money?: number;
    items?: { id: string; quantity: number }[];
  };
  effects: SkillEffect[];
  unlocked: boolean;
  learned: boolean;
}

export interface SkillEffect {
  type: 'stat' | 'ability' | 'passive' | 'active';
  target: string;
  value: number;
  scaling?: number;
  duration?: number;
  cooldown?: number;
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  skills: Map<string, Skill>;
  connections: Map<string, string[]>;
  totalPoints: number;
  spentPoints: number;
  unlockedTiers: Set<number>;
}

export class SkillTreeManager {
  private skillTrees: Map<string, SkillTree> = new Map();
  private activeSkills: Set<string> = new Set();
  private passiveSkills: Set<string> = new Set();
  private skillPoints: number = 0;
  private levelUpPoints: number = 1;
  private specializations: Set<string> = new Set();

  constructor() {
    this.initializeSkillTrees();
  }

  private initializeSkillTrees() {
    // Combat Tree
    const combatTree: SkillTree = {
      id: 'combat',
      name: '전투 마스터리',
      description: '전투 능력을 향상시키는 스킬 트리',
      skills: new Map([
        ['combat_basics', {
          id: 'combat_basics',
          name: '기초 전투술',
          description: '기본 공격력 증가',
          icon: '⚔️',
          category: 'combat',
          tier: 1,
          maxLevel: 5,
          currentLevel: 0,
          prerequisites: [],
          cost: { skillPoints: 1 },
          effects: [{
            type: 'stat',
            target: 'strength',
            value: 2,
            scaling: 2
          }],
          unlocked: true,
          learned: false
        }],
        ['power_strike', {
          id: 'power_strike',
          name: '파워 스트라이크',
          description: '강력한 일격을 가한다',
          icon: '💥',
          category: 'combat',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['combat_basics'],
          cost: { skillPoints: 2, money: 500 },
          effects: [{
            type: 'active',
            target: 'damage',
            value: 150,
            scaling: 25,
            cooldown: 30
          }],
          unlocked: false,
          learned: false
        }],
        ['defensive_stance', {
          id: 'defensive_stance',
          name: '방어 자세',
          description: '방어력 증가',
          icon: '🛡️',
          category: 'combat',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['combat_basics'],
          cost: { skillPoints: 2 },
          effects: [{
            type: 'passive',
            target: 'defense',
            value: 10,
            scaling: 5
          }],
          unlocked: false,
          learned: false
        }],
        ['dual_wield', {
          id: 'dual_wield',
          name: '이중 무기술',
          description: '두 개의 무기를 사용',
          icon: '⚔️⚔️',
          category: 'combat',
          tier: 3,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['power_strike'],
          cost: { skillPoints: 3, money: 1500 },
          effects: [{
            type: 'ability',
            target: 'attack_speed',
            value: 50
          }, {
            type: 'stat',
            target: 'agility',
            value: 10
          }],
          unlocked: false,
          learned: false
        }],
        ['berserker_rage', {
          id: 'berserker_rage',
          name: '광전사의 분노',
          description: '체력이 낮을수록 공격력 증가',
          icon: '😤',
          category: 'combat',
          tier: 4,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['dual_wield', 'defensive_stance'],
          cost: { skillPoints: 5, money: 3000 },
          effects: [{
            type: 'passive',
            target: 'critical_damage',
            value: 100
          }],
          unlocked: false,
          learned: false
        }]
      ]),
      connections: new Map([
        ['combat_basics', ['power_strike', 'defensive_stance']],
        ['power_strike', ['dual_wield']],
        ['defensive_stance', ['berserker_rage']],
        ['dual_wield', ['berserker_rage']]
      ]),
      totalPoints: 0,
      spentPoints: 0,
      unlockedTiers: new Set([1])
    };

    // Social Tree
    const socialTree: SkillTree = {
      id: 'social',
      name: '사교술',
      description: '대인관계와 매력을 향상시키는 스킬',
      skills: new Map([
        ['charisma', {
          id: 'charisma',
          name: '카리스마',
          description: '기본 매력 증가',
          icon: '✨',
          category: 'social',
          tier: 1,
          maxLevel: 5,
          currentLevel: 0,
          prerequisites: [],
          cost: { skillPoints: 1 },
          effects: [{
            type: 'stat',
            target: 'charm',
            value: 3,
            scaling: 2
          }],
          unlocked: true,
          learned: false
        }],
        ['smooth_talker', {
          id: 'smooth_talker',
          name: '달변가',
          description: '대화 선택지 추가',
          icon: '💬',
          category: 'social',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['charisma'],
          cost: { skillPoints: 2 },
          effects: [{
            type: 'ability',
            target: 'dialogue_options',
            value: 1,
            scaling: 1
          }],
          unlocked: false,
          learned: false
        }],
        ['empathy', {
          id: 'empathy',
          name: '공감 능력',
          description: '호감도 획득량 증가',
          icon: '💕',
          category: 'social',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['charisma'],
          cost: { skillPoints: 2 },
          effects: [{
            type: 'passive',
            target: 'affection_gain',
            value: 10,
            scaling: 5
          }],
          unlocked: false,
          learned: false
        }],
        ['gift_mastery', {
          id: 'gift_mastery',
          name: '선물의 달인',
          description: '선물 효과 증가',
          icon: '🎁',
          category: 'social',
          tier: 3,
          maxLevel: 2,
          currentLevel: 0,
          prerequisites: ['empathy'],
          cost: { skillPoints: 3 },
          effects: [{
            type: 'passive',
            target: 'gift_effectiveness',
            value: 25,
            scaling: 25
          }],
          unlocked: false,
          learned: false
        }],
        ['heartbreaker', {
          id: 'heartbreaker',
          name: '하트브레이커',
          description: '모든 캐릭터에게 매력적으로 보임',
          icon: '💔',
          category: 'social',
          tier: 4,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['smooth_talker', 'gift_mastery'],
          cost: { skillPoints: 5, money: 5000 },
          effects: [{
            type: 'passive',
            target: 'universal_charm',
            value: 1
          }, {
            type: 'stat',
            target: 'charm',
            value: 20
          }],
          unlocked: false,
          learned: false
        }]
      ]),
      connections: new Map([
        ['charisma', ['smooth_talker', 'empathy']],
        ['smooth_talker', ['heartbreaker']],
        ['empathy', ['gift_mastery']],
        ['gift_mastery', ['heartbreaker']]
      ]),
      totalPoints: 0,
      spentPoints: 0,
      unlockedTiers: new Set([1])
    };

    // Academic Tree
    const academicTree: SkillTree = {
      id: 'academic',
      name: '학술',
      description: '지식과 학습 능력 향상',
      skills: new Map([
        ['study_habits', {
          id: 'study_habits',
          name: '학습 습관',
          description: '경험치 획득량 증가',
          icon: '📚',
          category: 'academic',
          tier: 1,
          maxLevel: 5,
          currentLevel: 0,
          prerequisites: [],
          cost: { skillPoints: 1 },
          effects: [{
            type: 'passive',
            target: 'exp_gain',
            value: 5,
            scaling: 5
          }],
          unlocked: true,
          learned: false
        }],
        ['speed_reading', {
          id: 'speed_reading',
          name: '속독',
          description: '독서 시간 단축',
          icon: '📖',
          category: 'academic',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['study_habits'],
          cost: { skillPoints: 2 },
          effects: [{
            type: 'passive',
            target: 'reading_speed',
            value: 20,
            scaling: 10
          }, {
            type: 'stat',
            target: 'intelligence',
            value: 3,
            scaling: 2
          }],
          unlocked: false,
          learned: false
        }],
        ['photographic_memory', {
          id: 'photographic_memory',
          name: '사진 기억력',
          description: '모든 대화와 이벤트 기록',
          icon: '🧠',
          category: 'academic',
          tier: 3,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['speed_reading'],
          cost: { skillPoints: 4, money: 2000 },
          effects: [{
            type: 'ability',
            target: 'perfect_recall',
            value: 1
          }],
          unlocked: false,
          learned: false
        }],
        ['genius', {
          id: 'genius',
          name: '천재',
          description: '모든 스킬 포인트 비용 감소',
          icon: '🎓',
          category: 'academic',
          tier: 4,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['photographic_memory'],
          cost: { skillPoints: 6, money: 10000 },
          effects: [{
            type: 'passive',
            target: 'skill_cost_reduction',
            value: 20
          }, {
            type: 'stat',
            target: 'intelligence',
            value: 30
          }],
          unlocked: false,
          learned: false
        }]
      ]),
      connections: new Map([
        ['study_habits', ['speed_reading']],
        ['speed_reading', ['photographic_memory']],
        ['photographic_memory', ['genius']]
      ]),
      totalPoints: 0,
      spentPoints: 0,
      unlockedTiers: new Set([1])
    };

    // Athletic Tree
    const athleticTree: SkillTree = {
      id: 'athletic',
      name: '운동 능력',
      description: '신체 능력과 체력 향상',
      skills: new Map([
        ['endurance_training', {
          id: 'endurance_training',
          name: '지구력 훈련',
          description: '최대 체력 증가',
          icon: '🏃',
          category: 'athletic',
          tier: 1,
          maxLevel: 5,
          currentLevel: 0,
          prerequisites: [],
          cost: { skillPoints: 1 },
          effects: [{
            type: 'stat',
            target: 'stamina',
            value: 5,
            scaling: 3
          }],
          unlocked: true,
          learned: false
        }],
        ['sprint', {
          id: 'sprint',
          name: '전력 질주',
          description: '이동 속도 증가',
          icon: '💨',
          category: 'athletic',
          tier: 2,
          maxLevel: 3,
          currentLevel: 0,
          prerequisites: ['endurance_training'],
          cost: { skillPoints: 2 },
          effects: [{
            type: 'active',
            target: 'movement_speed',
            value: 50,
            duration: 10,
            cooldown: 60
          }],
          unlocked: false,
          learned: false
        }],
        ['iron_body', {
          id: 'iron_body',
          name: '강철 체력',
          description: '피해 감소',
          icon: '💪',
          category: 'athletic',
          tier: 3,
          maxLevel: 2,
          currentLevel: 0,
          prerequisites: ['sprint'],
          cost: { skillPoints: 3, money: 1500 },
          effects: [{
            type: 'passive',
            target: 'damage_reduction',
            value: 10,
            scaling: 5
          }],
          unlocked: false,
          learned: false
        }],
        ['olympian', {
          id: 'olympian',
          name: '올림피언',
          description: '모든 신체 능력 극대화',
          icon: '🏅',
          category: 'athletic',
          tier: 4,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['iron_body'],
          cost: { skillPoints: 5, money: 7500 },
          effects: [{
            type: 'stat',
            target: 'stamina',
            value: 30
          }, {
            type: 'stat',
            target: 'agility',
            value: 20
          }, {
            type: 'stat',
            target: 'strength',
            value: 20
          }],
          unlocked: false,
          learned: false
        }]
      ]),
      connections: new Map([
        ['endurance_training', ['sprint']],
        ['sprint', ['iron_body']],
        ['iron_body', ['olympian']]
      ]),
      totalPoints: 0,
      spentPoints: 0,
      unlockedTiers: new Set([1])
    };

    // Special Tree (Unlocked through story)
    const specialTree: SkillTree = {
      id: 'special',
      name: '특수 능력',
      description: '특별한 조건으로 해금되는 능력',
      skills: new Map([
        ['time_manipulation', {
          id: 'time_manipulation',
          name: '시간 조작',
          description: '시간을 되돌린다',
          icon: '⏰',
          category: 'special',
          tier: 1,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: [],
          cost: { skillPoints: 10 },
          effects: [{
            type: 'ability',
            target: 'time_rewind',
            value: 1,
            cooldown: 86400
          }],
          unlocked: false,
          learned: false
        }],
        ['dimension_walk', {
          id: 'dimension_walk',
          name: '차원 이동',
          description: '평행 세계로 이동',
          icon: '🌌',
          category: 'special',
          tier: 2,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['time_manipulation'],
          cost: { skillPoints: 15 },
          effects: [{
            type: 'ability',
            target: 'dimension_travel',
            value: 1
          }],
          unlocked: false,
          learned: false
        }],
        ['fate_breaker', {
          id: 'fate_breaker',
          name: '운명 파괴자',
          description: '정해진 결말을 바꾼다',
          icon: '🔮',
          category: 'special',
          tier: 3,
          maxLevel: 1,
          currentLevel: 0,
          prerequisites: ['dimension_walk'],
          cost: { skillPoints: 20 },
          effects: [{
            type: 'ability',
            target: 'change_fate',
            value: 1
          }, {
            type: 'stat',
            target: 'luck',
            value: 100
          }],
          unlocked: false,
          learned: false
        }]
      ]),
      connections: new Map([
        ['time_manipulation', ['dimension_walk']],
        ['dimension_walk', ['fate_breaker']]
      ]),
      totalPoints: 0,
      spentPoints: 0,
      unlockedTiers: new Set()
    };

    this.skillTrees.set('combat', combatTree);
    this.skillTrees.set('social', socialTree);
    this.skillTrees.set('academic', academicTree);
    this.skillTrees.set('athletic', athleticTree);
    this.skillTrees.set('special', specialTree);
  }

  addSkillPoints(points: number) {
    this.skillPoints += points;
  }

  learnSkill(treeId: string, skillId: string): boolean {
    const tree = this.skillTrees.get(treeId);
    if (!tree) return false;

    const skill = tree.skills.get(skillId);
    if (!skill || skill.learned || !skill.unlocked) return false;

    if (skill.currentLevel >= skill.maxLevel) return false;

    const actualCost = this.getSkillCost(skill);
    if (this.skillPoints < actualCost.skillPoints) return false;

    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = tree.skills.get(prereq);
      if (!prereqSkill || prereqSkill.currentLevel === 0) return false;
    }

    // Learn the skill
    skill.currentLevel++;
    if (skill.currentLevel === 1) {
      skill.learned = true;
    }

    this.skillPoints -= actualCost.skillPoints;
    tree.spentPoints += actualCost.skillPoints;

    // Unlock connected skills
    const connections = tree.connections.get(skillId);
    if (connections) {
      for (const connectedId of connections) {
        const connectedSkill = tree.skills.get(connectedId);
        if (connectedSkill && !connectedSkill.unlocked) {
          connectedSkill.unlocked = this.checkPrerequisites(tree, connectedId);
        }
      }
    }

    // Apply skill effects
    this.applySkillEffects(skill);

    // Check for tier unlock
    this.checkTierUnlock(tree);

    return true;
  }

  private checkPrerequisites(tree: SkillTree, skillId: string): boolean {
    const skill = tree.skills.get(skillId);
    if (!skill) return false;

    for (const prereq of skill.prerequisites) {
      const prereqSkill = tree.skills.get(prereq);
      if (!prereqSkill || prereqSkill.currentLevel === 0) return false;
    }

    return true;
  }

  private applySkillEffects(skill: Skill) {
    for (const effect of skill.effects) {
      const value = effect.value + (effect.scaling || 0) * (skill.currentLevel - 1);

      switch (effect.type) {
        case 'active':
          this.activeSkills.add(skill.id);
          break;
        case 'passive':
          this.passiveSkills.add(skill.id);
          break;
      }
    }
  }

  private checkTierUnlock(tree: SkillTree) {
    const pointsPerTier = [0, 5, 15, 30, 50];

    for (let tier = 2; tier <= 4; tier++) {
      if (tree.spentPoints >= pointsPerTier[tier - 1]) {
        tree.unlockedTiers.add(tier);
      }
    }
  }

  resetSkillTree(treeId: string): boolean {
    const tree = this.skillTrees.get(treeId);
    if (!tree) return false;

    const refundPoints = tree.spentPoints * 0.8; // 80% refund

    tree.skills.forEach(skill => {
      skill.currentLevel = 0;
      skill.learned = false;
      skill.unlocked = skill.tier === 1;
    });

    tree.spentPoints = 0;
    tree.unlockedTiers = new Set([1]);

    this.skillPoints += Math.floor(refundPoints);

    // Remove skill effects
    this.activeSkills.clear();
    this.passiveSkills.clear();

    return true;
  }

  private getSkillCost(skill: Skill): { skillPoints: number; money?: number } {
    let costReduction = 1;

    // Check for genius skill
    if (this.passiveSkills.has('genius')) {
      costReduction = 0.8;
    }

    return {
      skillPoints: Math.ceil(skill.cost.skillPoints * costReduction),
      money: skill.cost.money ? Math.ceil(skill.cost.money * costReduction) : undefined
    };
  }

  getSkillTree(treeId: string): SkillTree | undefined {
    return this.skillTrees.get(treeId);
  }

  getAllTrees(): SkillTree[] {
    return Array.from(this.skillTrees.values());
  }

  getActiveSkills(): string[] {
    return Array.from(this.activeSkills);
  }

  getPassiveSkills(): string[] {
    return Array.from(this.passiveSkills);
  }

  getTotalSkillPoints(): number {
    return this.skillPoints;
  }

  unlockSpecialization(spec: string) {
    this.specializations.add(spec);

    // Unlock special skills based on specialization
    if (spec === 'time_master') {
      const specialTree = this.skillTrees.get('special');
      if (specialTree) {
        const timeSkill = specialTree.skills.get('time_manipulation');
        if (timeSkill) timeSkill.unlocked = true;
      }
    }
  }

  export() {
    return {
      skillPoints: this.skillPoints,
      activeSkills: Array.from(this.activeSkills),
      passiveSkills: Array.from(this.passiveSkills),
      specializations: Array.from(this.specializations),
      trees: Array.from(this.skillTrees.entries()).map(([id, tree]) => ({
        id,
        skills: Array.from(tree.skills.values()),
        spentPoints: tree.spentPoints,
        unlockedTiers: Array.from(tree.unlockedTiers)
      }))
    };
  }

  import(data: any) {
    this.skillPoints = data.skillPoints || 0;
    this.activeSkills = new Set(data.activeSkills || []);
    this.passiveSkills = new Set(data.passiveSkills || []);
    this.specializations = new Set(data.specializations || []);

    if (data.trees) {
      for (const treeData of data.trees) {
        const tree = this.skillTrees.get(treeData.id);
        if (tree) {
          tree.spentPoints = treeData.spentPoints;
          tree.unlockedTiers = new Set(treeData.unlockedTiers);

          for (const skillData of treeData.skills) {
            const skill = tree.skills.get(skillData.id);
            if (skill) {
              skill.currentLevel = skillData.currentLevel;
              skill.learned = skillData.learned;
              skill.unlocked = skillData.unlocked;
            }
          }
        }
      }
    }
  }
}