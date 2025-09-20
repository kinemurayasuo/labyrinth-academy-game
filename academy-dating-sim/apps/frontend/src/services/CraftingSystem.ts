export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'cooking' | 'alchemy' | 'smithing' | 'tailoring' | 'enchanting' | 'jewelry';
  level: number;
  skillRequired: number;
  ingredients: Ingredient[];
  tools?: string[];
  result: CraftResult;
  time: number;
  exp: number;
  unlocked: boolean;
  learned: boolean;
  successRate: number;
  qualityFactors: QualityFactor[];
}

export interface Ingredient {
  itemId: string;
  quantity: number;
  quality?: 'low' | 'normal' | 'high' | 'perfect';
  substitutes?: string[];
}

export interface CraftResult {
  itemId: string;
  quantity: number;
  qualityRange: {
    min: number;
    max: number;
  };
  bonusChance?: number;
  bonusItems?: { itemId: string; quantity: number; chance: number }[];
}

export interface QualityFactor {
  type: 'skill' | 'tool' | 'ingredient' | 'timing' | 'luck';
  weight: number;
  description: string;
}

export interface CraftingStation {
  id: string;
  name: string;
  type: 'kitchen' | 'workshop' | 'forge' | 'loom' | 'cauldron' | 'enchanting_table';
  level: number;
  location: string;
  available: boolean;
  upgradeLevel: number;
  maxUpgradeLevel: number;
  bonuses: {
    successRate?: number;
    quality?: number;
    speed?: number;
    expGain?: number;
  };
}

export interface CraftingSkill {
  category: string;
  level: number;
  exp: number;
  expToNext: number;
  masteryPoints: number;
  specializations: string[];
  unlockedRecipes: string[];
  failureCount: number;
  successCount: number;
  perfectCount: number;
}

export class CraftingSystem {
  private recipes: Map<string, Recipe> = new Map();
  private skills: Map<string, CraftingSkill> = new Map();
  private stations: Map<string, CraftingStation> = new Map();
  private inventory: Map<string, number> = new Map();
  private craftingQueue: CraftingTask[] = [];
  private currentTask: CraftingTask | null = null;

  constructor() {
    this.initializeRecipes();
    this.initializeStations();
    this.initializeSkills();
  }

  private initializeRecipes() {
    // Cooking Recipes
    const recipes: Recipe[] = [
      {
        id: 'basic_lunch',
        name: '기본 도시락',
        description: '간단하지만 영양가 있는 도시락',
        category: 'cooking',
        level: 1,
        skillRequired: 0,
        ingredients: [
          { itemId: 'rice', quantity: 1 },
          { itemId: 'vegetable', quantity: 2 },
          { itemId: 'meat', quantity: 1 }
        ],
        tools: ['kitchen_knife', 'cooking_pot'],
        result: {
          itemId: 'lunch_box',
          quantity: 1,
          qualityRange: { min: 60, max: 100 }
        },
        time: 30,
        exp: 10,
        unlocked: true,
        learned: true,
        successRate: 0.9,
        qualityFactors: [
          { type: 'skill', weight: 0.5, description: '요리 스킬 레벨' },
          { type: 'ingredient', weight: 0.3, description: '재료의 품질' },
          { type: 'timing', weight: 0.2, description: '조리 타이밍' }
        ]
      },
      {
        id: 'special_bento',
        name: '특제 도시락',
        description: '사랑을 담은 특별한 도시락',
        category: 'cooking',
        level: 5,
        skillRequired: 20,
        ingredients: [
          { itemId: 'premium_rice', quantity: 1 },
          { itemId: 'fresh_vegetables', quantity: 3 },
          { itemId: 'premium_meat', quantity: 2 },
          { itemId: 'special_sauce', quantity: 1 }
        ],
        tools: ['professional_knife', 'rice_cooker'],
        result: {
          itemId: 'special_bento',
          quantity: 1,
          qualityRange: { min: 80, max: 100 },
          bonusChance: 0.3,
          bonusItems: [{ itemId: 'love_letter', quantity: 1, chance: 0.1 }]
        },
        time: 60,
        exp: 50,
        unlocked: false,
        learned: false,
        successRate: 0.7,
        qualityFactors: [
          { type: 'skill', weight: 0.4, description: '요리 스킬 레벨' },
          { type: 'ingredient', weight: 0.3, description: '재료의 품질' },
          { type: 'tool', weight: 0.2, description: '도구의 품질' },
          { type: 'luck', weight: 0.1, description: '행운' }
        ]
      },
      {
        id: 'chocolate_cake',
        name: '초콜릿 케이크',
        description: '달콤한 수제 초콜릿 케이크',
        category: 'cooking',
        level: 8,
        skillRequired: 35,
        ingredients: [
          { itemId: 'flour', quantity: 2 },
          { itemId: 'chocolate', quantity: 3 },
          { itemId: 'egg', quantity: 2 },
          { itemId: 'milk', quantity: 1 },
          { itemId: 'sugar', quantity: 2 }
        ],
        tools: ['oven', 'mixer', 'cake_mold'],
        result: {
          itemId: 'chocolate_cake',
          quantity: 1,
          qualityRange: { min: 70, max: 100 }
        },
        time: 90,
        exp: 80,
        unlocked: false,
        learned: false,
        successRate: 0.6,
        qualityFactors: [
          { type: 'skill', weight: 0.5, description: '제빵 스킬' },
          { type: 'timing', weight: 0.3, description: '굽기 타이밍' },
          { type: 'ingredient', weight: 0.2, description: '재료 품질' }
        ]
      }
    ];

    // Alchemy Recipes
    recipes.push(
      {
        id: 'health_potion',
        name: '체력 포션',
        description: 'HP를 회복시키는 포션',
        category: 'alchemy',
        level: 1,
        skillRequired: 0,
        ingredients: [
          { itemId: 'herb', quantity: 2 },
          { itemId: 'water', quantity: 1 }
        ],
        tools: ['cauldron', 'stirring_rod'],
        result: {
          itemId: 'health_potion',
          quantity: 3,
          qualityRange: { min: 50, max: 100 }
        },
        time: 20,
        exp: 15,
        unlocked: true,
        learned: false,
        successRate: 0.8,
        qualityFactors: [
          { type: 'skill', weight: 0.6, description: '연금술 스킬' },
          { type: 'ingredient', weight: 0.4, description: '허브의 신선도' }
        ]
      },
      {
        id: 'mana_potion',
        name: '마나 포션',
        description: 'MP를 회복시키는 포션',
        category: 'alchemy',
        level: 3,
        skillRequired: 15,
        ingredients: [
          { itemId: 'magic_herb', quantity: 2 },
          { itemId: 'crystal_water', quantity: 1 },
          { itemId: 'moon_dust', quantity: 1 }
        ],
        tools: ['magic_cauldron', 'crystal_rod'],
        result: {
          itemId: 'mana_potion',
          quantity: 2,
          qualityRange: { min: 60, max: 100 }
        },
        time: 30,
        exp: 25,
        unlocked: false,
        learned: false,
        successRate: 0.7,
        qualityFactors: [
          { type: 'skill', weight: 0.5, description: '연금술 스킬' },
          { type: 'tool', weight: 0.3, description: '도구의 마력' },
          { type: 'ingredient', weight: 0.2, description: '재료의 순도' }
        ]
      },
      {
        id: 'elixir',
        name: '엘릭서',
        description: '모든 상태를 회복시키는 만능약',
        category: 'alchemy',
        level: 10,
        skillRequired: 50,
        ingredients: [
          { itemId: 'phoenix_feather', quantity: 1 },
          { itemId: 'dragon_blood', quantity: 1 },
          { itemId: 'unicorn_hair', quantity: 1 },
          { itemId: 'holy_water', quantity: 1 }
        ],
        tools: ['legendary_cauldron', 'philosopher_stone'],
        result: {
          itemId: 'elixir',
          quantity: 1,
          qualityRange: { min: 90, max: 100 }
        },
        time: 180,
        exp: 200,
        unlocked: false,
        learned: false,
        successRate: 0.3,
        qualityFactors: [
          { type: 'skill', weight: 0.4, description: '연금술 마스터리' },
          { type: 'ingredient', weight: 0.3, description: '전설 재료' },
          { type: 'tool', weight: 0.2, description: '도구의 전설' },
          { type: 'luck', weight: 0.1, description: '운명' }
        ]
      }
    );

    // Smithing Recipes
    recipes.push(
      {
        id: 'iron_sword',
        name: '철검',
        description: '기본적인 철로 만든 검',
        category: 'smithing',
        level: 2,
        skillRequired: 10,
        ingredients: [
          { itemId: 'iron_ore', quantity: 3 },
          { itemId: 'coal', quantity: 2 }
        ],
        tools: ['forge', 'hammer', 'anvil'],
        result: {
          itemId: 'iron_sword',
          quantity: 1,
          qualityRange: { min: 60, max: 100 }
        },
        time: 45,
        exp: 30,
        unlocked: false,
        learned: false,
        successRate: 0.75,
        qualityFactors: [
          { type: 'skill', weight: 0.5, description: '대장간 스킬' },
          { type: 'tool', weight: 0.3, description: '도구 상태' },
          { type: 'timing', weight: 0.2, description: '타격 타이밍' }
        ]
      },
      {
        id: 'mithril_armor',
        name: '미스릴 갑옷',
        description: '가볍고 튼튼한 미스릴 갑옷',
        category: 'smithing',
        level: 8,
        skillRequired: 40,
        ingredients: [
          { itemId: 'mithril_ore', quantity: 5 },
          { itemId: 'magic_coal', quantity: 3 },
          { itemId: 'leather', quantity: 2 }
        ],
        tools: ['magic_forge', 'mithril_hammer', 'enchanted_anvil'],
        result: {
          itemId: 'mithril_armor',
          quantity: 1,
          qualityRange: { min: 75, max: 100 }
        },
        time: 120,
        exp: 100,
        unlocked: false,
        learned: false,
        successRate: 0.5,
        qualityFactors: [
          { type: 'skill', weight: 0.6, description: '미스릴 가공술' },
          { type: 'tool', weight: 0.3, description: '마법 도구' },
          { type: 'ingredient', weight: 0.1, description: '미스릴 순도' }
        ]
      }
    );

    recipes.forEach(recipe => this.recipes.set(recipe.id, recipe));
  }

  private initializeStations() {
    const stations: CraftingStation[] = [
      {
        id: 'basic_kitchen',
        name: '기본 주방',
        type: 'kitchen',
        level: 1,
        location: 'home',
        available: true,
        upgradeLevel: 1,
        maxUpgradeLevel: 5,
        bonuses: {}
      },
      {
        id: 'school_kitchen',
        name: '학교 요리실',
        type: 'kitchen',
        level: 3,
        location: 'school_cooking_club',
        available: false,
        upgradeLevel: 1,
        maxUpgradeLevel: 3,
        bonuses: {
          successRate: 0.1,
          quality: 10,
          expGain: 1.2
        }
      },
      {
        id: 'alchemy_lab',
        name: '연금술 실험실',
        type: 'cauldron',
        level: 2,
        location: 'magic_tower',
        available: false,
        upgradeLevel: 1,
        maxUpgradeLevel: 5,
        bonuses: {
          successRate: 0.15,
          quality: 15
        }
      },
      {
        id: 'blacksmith_forge',
        name: '대장간',
        type: 'forge',
        level: 2,
        location: 'market_district',
        available: false,
        upgradeLevel: 1,
        maxUpgradeLevel: 5,
        bonuses: {
          quality: 20,
          speed: 0.8
        }
      }
    ];

    stations.forEach(station => this.stations.set(station.id, station));
  }

  private initializeSkills() {
    const categories = ['cooking', 'alchemy', 'smithing', 'tailoring', 'enchanting', 'jewelry'];

    categories.forEach(category => {
      this.skills.set(category, {
        category,
        level: 1,
        exp: 0,
        expToNext: 100,
        masteryPoints: 0,
        specializations: [],
        unlockedRecipes: [],
        failureCount: 0,
        successCount: 0,
        perfectCount: 0
      });
    });
  }

  canCraft(recipeId: string): { canCraft: boolean; reason?: string } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { canCraft: false, reason: '레시피를 찾을 수 없습니다' };
    }

    if (!recipe.unlocked) {
      return { canCraft: false, reason: '레시피가 잠겨있습니다' };
    }

    if (!recipe.learned) {
      return { canCraft: false, reason: '레시피를 배우지 않았습니다' };
    }

    const skill = this.skills.get(recipe.category);
    if (!skill || skill.level < recipe.level) {
      return { canCraft: false, reason: `${recipe.category} 스킬 레벨이 부족합니다` };
    }

    for (const ingredient of recipe.ingredients) {
      const quantity = this.inventory.get(ingredient.itemId) || 0;
      if (quantity < ingredient.quantity) {
        return { canCraft: false, reason: `재료가 부족합니다: ${ingredient.itemId}` };
      }
    }

    if (recipe.tools) {
      for (const tool of recipe.tools) {
        if (!this.hasTool(tool)) {
          return { canCraft: false, reason: `도구가 필요합니다: ${tool}` };
        }
      }
    }

    return { canCraft: true };
  }

  startCrafting(recipeId: string, stationId?: string): boolean {
    const canCraftResult = this.canCraft(recipeId);
    if (!canCraftResult.canCraft) {
      console.error(canCraftResult.reason);
      return false;
    }

    const recipe = this.recipes.get(recipeId)!;
    const station = stationId ? this.stations.get(stationId) : null;

    // Consume ingredients
    for (const ingredient of recipe.ingredients) {
      this.consumeItem(ingredient.itemId, ingredient.quantity);
    }

    const task: CraftingTask = {
      id: `craft_${Date.now()}`,
      recipeId,
      stationId,
      startTime: Date.now(),
      duration: this.calculateDuration(recipe, station),
      quality: this.calculateQuality(recipe, station),
      successChance: this.calculateSuccessRate(recipe, station)
    };

    if (this.currentTask) {
      this.craftingQueue.push(task);
    } else {
      this.currentTask = task;
      this.processCrafting(task);
    }

    return true;
  }

  private processCrafting(task: CraftingTask) {
    setTimeout(() => {
      this.completeCrafting(task);
    }, task.duration * 1000);
  }

  private completeCrafting(task: CraftingTask) {
    const recipe = this.recipes.get(task.recipeId)!;
    const skill = this.skills.get(recipe.category)!;

    const success = Math.random() < task.successChance;

    if (success) {
      // Create item with quality
      const item = {
        id: recipe.result.itemId,
        quantity: recipe.result.quantity,
        quality: task.quality
      };

      this.addToInventory(item.id, item.quantity);

      // Check for bonus items
      if (recipe.result.bonusItems) {
        for (const bonus of recipe.result.bonusItems) {
          if (Math.random() < bonus.chance) {
            this.addToInventory(bonus.itemId, bonus.quantity);
          }
        }
      }

      // Update skill
      skill.successCount++;
      if (task.quality >= 95) {
        skill.perfectCount++;
      }

      this.gainExp(recipe.category, recipe.exp);
    } else {
      skill.failureCount++;
      this.gainExp(recipe.category, Math.floor(recipe.exp * 0.3));
    }

    // Process next task in queue
    this.currentTask = null;
    if (this.craftingQueue.length > 0) {
      const nextTask = this.craftingQueue.shift()!;
      this.currentTask = nextTask;
      this.processCrafting(nextTask);
    }
  }

  private calculateDuration(recipe: Recipe, station: CraftingStation | null): number {
    let duration = recipe.time;

    if (station && station.bonuses.speed) {
      duration *= station.bonuses.speed;
    }

    const skill = this.skills.get(recipe.category)!;
    duration *= (1 - skill.level * 0.01); // 1% faster per level

    return Math.max(duration, 5); // Minimum 5 seconds
  }

  private calculateQuality(recipe: Recipe, station: CraftingStation | null): number {
    let quality = recipe.qualityRange.min;
    const range = recipe.qualityRange.max - recipe.qualityRange.min;

    for (const factor of recipe.qualityFactors) {
      let contribution = 0;

      switch (factor.type) {
        case 'skill':
          const skill = this.skills.get(recipe.category)!;
          contribution = (skill.level / 100) * factor.weight;
          break;
        case 'tool':
          contribution = station ? 0.8 * factor.weight : 0.5 * factor.weight;
          break;
        case 'ingredient':
          contribution = 0.7 * factor.weight; // Average quality
          break;
        case 'timing':
          contribution = Math.random() * factor.weight;
          break;
        case 'luck':
          contribution = Math.random() * factor.weight;
          break;
      }

      quality += range * contribution;
    }

    if (station && station.bonuses.quality) {
      quality += station.bonuses.quality;
    }

    return Math.min(100, Math.max(recipe.qualityRange.min, quality));
  }

  private calculateSuccessRate(recipe: Recipe, station: CraftingStation | null): number {
    let successRate = recipe.successRate;

    const skill = this.skills.get(recipe.category)!;
    successRate += skill.level * 0.005; // 0.5% per level

    if (station && station.bonuses.successRate) {
      successRate += station.bonuses.successRate;
    }

    // Mastery bonus
    if (skill.masteryPoints > 0) {
      successRate += skill.masteryPoints * 0.01;
    }

    return Math.min(1, successRate);
  }

  private gainExp(category: string, amount: number) {
    const skill = this.skills.get(category)!;
    skill.exp += amount;

    while (skill.exp >= skill.expToNext) {
      skill.exp -= skill.expToNext;
      skill.level++;
      skill.expToNext = Math.floor(skill.expToNext * 1.5);
      skill.masteryPoints++;

      // Unlock new recipes at certain levels
      this.checkRecipeUnlocks(category, skill.level);
    }
  }

  private checkRecipeUnlocks(category: string, level: number) {
    this.recipes.forEach(recipe => {
      if (recipe.category === category &&
          recipe.level <= level &&
          !recipe.unlocked) {
        recipe.unlocked = true;
        console.log(`새로운 레시피 해금: ${recipe.name}`);
      }
    });
  }

  learnRecipe(recipeId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe || !recipe.unlocked || recipe.learned) {
      return false;
    }

    recipe.learned = true;
    const skill = this.skills.get(recipe.category)!;
    skill.unlockedRecipes.push(recipeId);

    return true;
  }

  upgradeStation(stationId: string): boolean {
    const station = this.stations.get(stationId);
    if (!station || station.upgradeLevel >= station.maxUpgradeLevel) {
      return false;
    }

    const cost = station.upgradeLevel * 1000;
    // Check if player has enough money
    // if (playerMoney < cost) return false;

    station.upgradeLevel++;

    // Improve bonuses
    station.bonuses.successRate = (station.bonuses.successRate || 0) + 0.05;
    station.bonuses.quality = (station.bonuses.quality || 0) + 5;
    station.bonuses.speed = (station.bonuses.speed || 1) * 0.9;
    station.bonuses.expGain = (station.bonuses.expGain || 1) * 1.1;

    return true;
  }

  private hasTool(toolId: string): boolean {
    return this.inventory.has(toolId);
  }

  private consumeItem(itemId: string, quantity: number) {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, Math.max(0, current - quantity));
  }

  private addToInventory(itemId: string, quantity: number) {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }

  setInventory(inventory: Map<string, number>) {
    this.inventory = inventory;
  }

  getRecipes(category?: string): Recipe[] {
    const recipes = Array.from(this.recipes.values());
    if (category) {
      return recipes.filter(r => r.category === category);
    }
    return recipes;
  }

  getLearnedRecipes(): Recipe[] {
    return Array.from(this.recipes.values()).filter(r => r.learned);
  }

  getSkill(category: string): CraftingSkill | undefined {
    return this.skills.get(category);
  }

  getAllSkills(): CraftingSkill[] {
    return Array.from(this.skills.values());
  }

  getStation(stationId: string): CraftingStation | undefined {
    return this.stations.get(stationId);
  }

  getCurrentTask(): CraftingTask | null {
    return this.currentTask;
  }

  getCraftingQueue(): CraftingTask[] {
    return this.craftingQueue;
  }

  export() {
    return {
      skills: Array.from(this.skills.entries()),
      recipes: Array.from(this.recipes.values()).map(r => ({
        id: r.id,
        unlocked: r.unlocked,
        learned: r.learned
      })),
      stations: Array.from(this.stations.values()),
      currentTask: this.currentTask,
      craftingQueue: this.craftingQueue
    };
  }

  import(data: any) {
    if (data.skills) {
      this.skills = new Map(data.skills);
    }
    if (data.recipes) {
      data.recipes.forEach((r: any) => {
        const recipe = this.recipes.get(r.id);
        if (recipe) {
          recipe.unlocked = r.unlocked;
          recipe.learned = r.learned;
        }
      });
    }
    if (data.stations) {
      data.stations.forEach((s: CraftingStation) => {
        this.stations.set(s.id, s);
      });
    }
    this.currentTask = data.currentTask || null;
    this.craftingQueue = data.craftingQueue || [];
  }
}

interface CraftingTask {
  id: string;
  recipeId: string;
  stationId?: string;
  startTime: number;
  duration: number;
  quality: number;
  successChance: number;
}