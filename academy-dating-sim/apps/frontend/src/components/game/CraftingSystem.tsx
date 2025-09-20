import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Recipe {
  id: string;
  name: string;
  description: string;
  result: { id: string; quantity: number };
  materials: { id: string; quantity: number }[];
  category: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  requiredLevel: number;
  icon: string;
}

const CraftingSystem: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recipes: Recipe[] = [
    {
      id: 'health_potion_large',
      name: '대형 체력 포션',
      description: 'HP를 100 회복한다',
      result: { id: 'health_potion_large', quantity: 1 },
      materials: [
        { id: 'health_potion', quantity: 3 },
        { id: 'herb', quantity: 2 }
      ],
      category: 'consumable',
      requiredLevel: 5,
      icon: '🧪'
    },
    {
      id: 'iron_sword',
      name: '철검',
      description: '기본적인 철제 무기',
      result: { id: 'iron_sword', quantity: 1 },
      materials: [
        { id: 'iron_ore', quantity: 5 },
        { id: 'wood', quantity: 2 }
      ],
      category: 'weapon',
      requiredLevel: 3,
      icon: '⚔️'
    },
    {
      id: 'magic_staff',
      name: '마법 지팡이',
      description: '마법 공격력을 증가시킨다',
      result: { id: 'magic_staff', quantity: 1 },
      materials: [
        { id: 'magic_crystal', quantity: 3 },
        { id: 'ancient_wood', quantity: 2 },
        { id: 'gold', quantity: 100 }
      ],
      category: 'weapon',
      requiredLevel: 10,
      icon: '🔮'
    },
    {
      id: 'leather_armor',
      name: '가죽 갑옷',
      description: '방어력을 증가시킨다',
      result: { id: 'leather_armor', quantity: 1 },
      materials: [
        { id: 'leather', quantity: 5 },
        { id: 'thread', quantity: 3 }
      ],
      category: 'armor',
      requiredLevel: 5,
      icon: '🦺'
    },
    {
      id: 'crystal_ring',
      name: '크리스탈 반지',
      description: '마나를 증가시킨다',
      result: { id: 'crystal_ring', quantity: 1 },
      materials: [
        { id: 'crystal', quantity: 2 },
        { id: 'silver', quantity: 3 }
      ],
      category: 'accessory',
      requiredLevel: 8,
      icon: '💍'
    },
    {
      id: 'dragon_scale_armor',
      name: '드래곤 비늘 갑옷',
      description: '최강의 방어구',
      result: { id: 'dragon_scale_armor', quantity: 1 },
      materials: [
        { id: 'dragon_scale', quantity: 10 },
        { id: 'mythril', quantity: 5 },
        { id: 'gold', quantity: 1000 }
      ],
      category: 'armor',
      requiredLevel: 25,
      icon: '🐉'
    },
    {
      id: 'phoenix_feather_accessory',
      name: '불사조 깃털 부적',
      description: '한 번 부활할 수 있다',
      result: { id: 'phoenix_feather_accessory', quantity: 1 },
      materials: [
        { id: 'phoenix_feather', quantity: 1 },
        { id: 'holy_water', quantity: 5 }
      ],
      category: 'accessory',
      requiredLevel: 20,
      icon: '🪶'
    },
    {
      id: 'elixir',
      name: '엘릭서',
      description: 'HP와 MP를 완전 회복',
      result: { id: 'elixir', quantity: 1 },
      materials: [
        { id: 'health_potion_large', quantity: 2 },
        { id: 'mana_potion_large', quantity: 2 },
        { id: 'unicorn_horn', quantity: 1 }
      ],
      category: 'consumable',
      requiredLevel: 15,
      icon: '🏺'
    }
  ];

  const categories = [
    { id: 'all', name: '전체', icon: '📦' },
    { id: 'weapon', name: '무기', icon: '⚔️' },
    { id: 'armor', name: '방어구', icon: '🛡️' },
    { id: 'accessory', name: '액세서리', icon: '💎' },
    { id: 'consumable', name: '소비', icon: '🧪' }
  ];

  const hasRequiredMaterials = (recipe: Recipe): boolean => {
    return recipe.materials.every(material => {
      const inventoryItem = player.inventory?.find(item => item.id === material.id);
      return inventoryItem && inventoryItem.quantity >= material.quantity;
    });
  };

  const craftItem = (recipe: Recipe) => {
    if (player.level < recipe.requiredLevel) {
      alert(`레벨 ${recipe.requiredLevel} 이상이어야 제작할 수 있습니다.`);
      return;
    }

    if (!hasRequiredMaterials(recipe)) {
      alert('재료가 부족합니다!');
      return;
    }

    // 재료 소비
    let newInventory = [...(player.inventory || [])];
    recipe.materials.forEach(material => {
      const index = newInventory.findIndex(item => item.id === material.id);
      if (index !== -1) {
        newInventory[index].quantity -= material.quantity;
        if (newInventory[index].quantity <= 0) {
          newInventory.splice(index, 1);
        }
      }
    });

    // 아이템 추가
    const existingItem = newInventory.find(item => item.id === recipe.result.id);
    if (existingItem) {
      existingItem.quantity += recipe.result.quantity;
    } else {
      newInventory.push({ ...recipe.result });
    }

    updatePlayer({ inventory: newInventory });
    soundManager.playSuccessSound();
    alert(`${recipe.name}을(를) 제작했습니다!`);
  };

  const filteredRecipes = selectedCategory === 'all'
    ? recipes
    : recipes.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-brown-800 to-orange-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">🔨 크래프팅</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>

          {/* Player Resources */}
          <div className="bg-white/10 rounded-lg p-3 flex gap-4">
            <div className="text-white">
              <span className="text-sm opacity-80">레벨</span>
              <div className="font-bold">{player.level}</div>
            </div>
            <div className="text-yellow-400">
              <span className="text-sm opacity-80">골드</span>
              <div className="font-bold">{player.gold || 0}</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => {
            const canCraft = player.level >= recipe.requiredLevel && hasRequiredMaterials(recipe);

            return (
              <div
                key={recipe.id}
                className={`bg-black/30 backdrop-blur rounded-xl p-4 transition-all ${
                  canCraft ? 'border-2 border-amber-400/50 hover:border-amber-400' : 'border-2 border-white/10 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{recipe.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{recipe.name}</h3>
                    <p className="text-sm text-white/70">{recipe.description}</p>
                    <div className="text-xs text-amber-400 mt-1">
                      Lv.{recipe.requiredLevel} 필요
                    </div>
                  </div>
                </div>

                {/* Materials */}
                <div className="bg-black/20 rounded-lg p-2 mb-3">
                  <div className="text-sm font-bold text-white/80 mb-1">재료</div>
                  <div className="space-y-1">
                    {recipe.materials.map(material => {
                      const hasItem = player.inventory?.find(i => i.id === material.id);
                      const hasEnough = hasItem && hasItem.quantity >= material.quantity;

                      return (
                        <div key={material.id} className="flex justify-between text-sm">
                          <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                            {material.id}
                          </span>
                          <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                            {hasItem?.quantity || 0} / {material.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Craft Button */}
                <button
                  onClick={() => craftItem(recipe)}
                  disabled={!canCraft}
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    canCraft
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canCraft ? '제작하기' : player.level < recipe.requiredLevel ? '레벨 부족' : '재료 부족'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CraftingSystem;