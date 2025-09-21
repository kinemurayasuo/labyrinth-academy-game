import React, { useState } from 'react';
import type { Item } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import itemsData from '../../data/items.json';
import charactersData from '../../data/characters.json';

interface InventoryProps {
  onClose?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({
  onClose: _onClose,
}) => {
  const { player, unlockedCharacters } = useGameStore();
  const useItemAction = useGameStore((state) => state.actions.useItem);
  const items = itemsData.items as Record<string, Item>;
  const characters = charactersData as Record<string, any>;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailedItem, setDetailedItem] = useState<Item | null>(null);
  const [showGiftTarget, setShowGiftTarget] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gift' | 'consumable' | 'special' | 'weapon' | 'armor' | 'accessory'>('all');
  const [clickedItem, setClickedItem] = useState<string | null>(null); // Issue #29: Track clicked item
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'type' | 'value'>('type');
  const [showDetails, setShowDetails] = useState(true);

  const getItemRarity = (item: Item) => {
    const rarityColors = {
      common: { color: 'border-gray-400 bg-gray-500/10', text: 'text-gray-400', name: '일반' },
      uncommon: { color: 'border-green-400 bg-green-500/10', text: 'text-green-400', name: '고급' },
      rare: { color: 'border-blue-400 bg-blue-500/10', text: 'text-blue-400', name: '희귀' },
      epic: { color: 'border-purple-400 bg-purple-500/10', text: 'text-purple-400', name: '영웅' },
      legendary: { color: 'border-yellow-400 bg-yellow-500/10', text: 'text-yellow-400', name: '전설' },
    };

    return item.rarity ? rarityColors[item.rarity] : rarityColors.common;
  };

  // Group items by id and count them
  const inventoryItems = player.inventory.reduce((acc, itemId) => {
    if (items[itemId]) {
      if (acc[itemId]) {
        acc[itemId].count++;
      } else {
        acc[itemId] = { item: items[itemId], count: 1 };
      }
    }
    return acc;
  }, {} as Record<string, { item: Item; count: number }>);

  const filteredItems = Object.values(inventoryItems)
    .filter(({ item }) => {
      if (filter === 'all') return true;
      return item.type === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'rarity':
          const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
          const aRarity = rarityOrder[a.item.rarity as keyof typeof rarityOrder] || 0;
          const bRarity = rarityOrder[b.item.rarity as keyof typeof rarityOrder] || 0;
          return bRarity - aRarity;
        case 'value':
          return (b.item.value || 0) - (a.item.value || 0);
        case 'type':
        default:
          return a.item.type.localeCompare(b.item.type);
      }
    });

  // Count items per category
  const categoryCounts = Object.values(inventoryItems).reduce((acc, { item, count }) => {
    acc.all = (acc.all || 0) + count;
    acc[item.type] = (acc[item.type] || 0) + count;
    return acc;
  }, {} as Record<string, number>);

  const handleUseItem = (item: Item) => {
    if (item.type === 'gift') {
      setSelectedItem(item);
      setShowGiftTarget(true);
    } else if (['weapon', 'armor', 'accessory'].includes(item.type)) {
      // Equipment items - check requirements first
      const canEquip = checkRequirements(item);
      if (canEquip) {
        useItemAction(item.id);
        setSelectedItem(null);
      } else {
        alert('장비 요구 조건을 만족하지 않습니다.');
      }
    } else {
      useItemAction(item.id);
      setSelectedItem(null);
    }
  };

  const checkRequirements = (item: Item) => {
    if (!item.requirements) return true;

    if (item.requirements.level && player.level < item.requirements.level) {
      return false;
    }

    if (item.requirements.stats) {
      for (const [stat, requiredValue] of Object.entries(item.requirements.stats)) {
        const playerStat = player.stats[stat as keyof typeof player.stats];
        if (playerStat < requiredValue) {
          return false;
        }
      }
    }

    return true;
  };

  const handleGiftToCharacter = (characterId: string) => {
    if (selectedItem) {
      useItemAction(selectedItem.id, characterId);
      setSelectedItem(null);
      setShowGiftTarget(false);
    }
  };

  const getStatName = (stat: string) => {
    const statNames: Record<string, string> = {
      intelligence: '지력',
      charm: '매력',
      stamina: '체력',
      strength: '힘',
      agility: '민첩',
      luck: '행운',
    };
    return statNames[stat] || stat;
  };

  const getCharacterEmoji = (characterId: string) => {
    const emojis: Record<string, string> = {
      sakura: '🌸',
      yuki: '❄️',
      luna: '🌙',
      mystery: '❓',
    };
    return emojis[characterId] || '👤';
  };

  return (
    <div className="bg-background text-text-primary rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
          <span>🎒</span>
          인벤토리
        </h2>

        <div className="flex gap-4 items-center">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/30 text-text-primary px-3 py-1 rounded-lg text-sm border border-border"
          >
            <option value="type">종류순</option>
            <option value="name">이름순</option>
            <option value="rarity">희귀도순</option>
            <option value="value">가치순</option>
          </select>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${showDetails ? 'bg-primary/50' : 'bg-black/30'} text-text-primary border border-border`}
          >
            {showDetails ? '📋 상세보기' : '📝 간단보기'}
          </button>

          <div className="text-sm text-text-secondary">
            총 {Object.values(inventoryItems).reduce((sum, { count }) => sum + count, 0)}개 아이템
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: '전체', icon: '📦', count: categoryCounts.all || 0 },
          { key: 'gift', label: '선물', icon: '🎁', count: categoryCounts.gift || 0 },
          { key: 'consumable', label: '소모품', icon: '💊', count: categoryCounts.consumable || 0 },
          { key: 'weapon', label: '무기', icon: '⚔️', count: categoryCounts.weapon || 0 },
          { key: 'armor', label: '방어구', icon: '🛡️', count: categoryCounts.armor || 0 },
          { key: 'accessory', label: '장신구', icon: '💍', count: categoryCounts.accessory || 0 },
          { key: 'special', label: '특별', icon: '⭐', count: categoryCounts.special || 0 },
        ].map(({ key, label, icon, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === key
                ? 'bg-primary text-white shadow-lg'
                : 'bg-black/30 text-text-secondary hover:bg-primary/50'
            }`}
          >
            <span>{icon}</span>
            {label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                filter === key ? 'bg-white/20' : 'bg-primary/30'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {Object.keys(inventoryItems).length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <div className="text-4xl mb-3">📦</div>
          <p>인벤토리가 비어있습니다</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <div className="text-4xl mb-3">🔍</div>
          <p>해당 종류의 아이템이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(({ item, count }) => {
            const rarity = getItemRarity(item);

            return (
              <div
                key={item.id}
                onClick={() => {
                  // Issue #29: Toggle clicked item to show/hide details
                  if (clickedItem === item.id) {
                    setClickedItem(null);
                    setDetailedItem(null);
                  } else {
                    setClickedItem(item.id);
                    setDetailedItem(item);
                  }
                }}
                className={`bg-black/30 rounded-lg p-4 border transition-all duration-200 hover:scale-105 cursor-pointer ${rarity.color} ${
                  clickedItem === item.id ? 'ring-2 ring-primary' : ''
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-text-primary">{item.name}</h3>
                      <p className={`text-xs ${rarity.text} capitalize`}>{item.type}</p>
                    </div>
                  </div>

                  {count > 1 && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                      ×{count}
                    </div>
                  )}
                </div>

                {/* Issue #29: Only show description and details when clicked */}
                {clickedItem === item.id && (
                  <>
                    <p className="text-sm text-text-secondary mb-4 animate-fadeIn">
                      {item.description}
                    </p>
                  </>
                )}

                {/* Item Effects - Only show when clicked */}
                {clickedItem === item.id && showDetails && (
                <div className="space-y-1 mb-4">
                  {item.effect.affection && (
                    <div className="text-xs text-pink-300 flex items-center gap-1">
                      💕 <span>호감도 +{item.effect.affection}</span>
                    </div>
                  )}
                  {item.effect.hp && (
                    <div className="text-xs text-red-300 flex items-center gap-1">
                      ❤️ <span>체력 +{item.effect.hp}</span>
                    </div>
                  )}
                  {item.effect.mp && (
                    <div className="text-xs text-blue-300 flex items-center gap-1">
                      💙 <span>마나 +{item.effect.mp}</span>
                    </div>
                  )}
                  {item.effect.intelligence && (
                    <div className="text-xs text-blue-300 flex items-center gap-1">
                      🧠 <span>지력 +{item.effect.intelligence}</span>
                    </div>
                  )}
                  {item.effect.charm && (
                    <div className="text-xs text-pink-300 flex items-center gap-1">
                      ✨ <span>매력 +{item.effect.charm}</span>
                    </div>
                  )}
                  {item.effect.stamina && (
                    <div className="text-xs text-green-300 flex items-center gap-1">
                      💪 <span>체력 +{item.effect.stamina}</span>
                    </div>
                  )}
                  {item.effect.strength && (
                    <div className="text-xs text-orange-300 flex items-center gap-1">
                      💪 <span>힘 +{item.effect.strength}</span>
                    </div>
                  )}
                  {item.effect.agility && (
                    <div className="text-xs text-cyan-300 flex items-center gap-1">
                      🏃 <span>민첩 +{item.effect.agility}</span>
                    </div>
                  )}
                  {item.effect.luck && (
                    <div className="text-xs text-yellow-300 flex items-center gap-1">
                      🍀 <span>행운 +{item.effect.luck}</span>
                    </div>
                  )}
                  {item.effect.experience && (
                    <div className="text-xs text-purple-300 flex items-center gap-1">
                      ⭐ <span>경험치 +{item.effect.experience}</span>
                    </div>
                  )}
                  {item.effect.unlockSecret && (
                    <div className="text-xs text-yellow-300 flex items-center gap-1">
                      🔓 <span>비밀 해제</span>
                    </div>
                  )}
                </div>
                )}

                {/* Item Requirements - Only show when clicked */}
                {clickedItem === item.id && showDetails && item.requirements && (
                  <div className="mb-4 p-2 bg-red-900/20 rounded border border-red-500/30">
                    <div className="text-xs text-red-300 font-medium mb-1">필요 조건:</div>
                    <div className="space-y-1">
                      {item.requirements.level && (
                        <div className="text-xs text-red-400">레벨 {item.requirements.level} 이상</div>
                      )}
                      {item.requirements.stats && Object.entries(item.requirements.stats).map(([stat, value]) => (
                        <div key={stat} className="text-xs text-red-400">
                          {getStatName(stat)} {value} 이상
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Item Value and Rarity Badge */}
                <div className="flex justify-between items-center mb-3">
                  {item.value && (
                    <div className="text-xs text-yellow-300 flex items-center gap-1">
                      💰 <span>{item.value}G</span>
                    </div>
                  )}
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${rarity.color} ${rarity.text}`}>
                    {rarity.name}
                  </div>
                </div>

                {/* Preferred By */}
                {showDetails && item.preferredBy && item.preferredBy.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-yellow-300 mb-1">⭐ 선호 캐릭터:</div>
                    <div className="flex flex-wrap gap-1">
                      {item.preferredBy.map(charId => (
                        <span key={charId} className="text-xs bg-yellow-600/20 text-yellow-200 px-2 py-1 rounded-full">
                          {characters[charId]?.name || charId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Use Button */}
                <button
                  onClick={() => handleUseItem(item)}
                  disabled={!checkRequirements(item)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !checkRequirements(item)
                      ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      : item.type === 'gift'
                      ? 'bg-secondary hover:bg-secondary/80 text-white'
                      : item.type === 'consumable'
                      ? 'bg-green-600/80 hover:bg-green-500/80 text-white'
                      : ['weapon', 'armor', 'accessory'].includes(item.type)
                      ? 'bg-blue-600/80 hover:bg-blue-500/80 text-white'
                      : 'bg-yellow-600/80 hover:bg-yellow-500/80 text-white'
                  }`}
                >
                  {item.type === 'gift'
                    ? '선물하기'
                    : item.type === 'consumable'
                    ? '사용하기'
                    : ['weapon', 'armor', 'accessory'].includes(item.type)
                    ? '장착하기'
                    : '확인하기'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Details Modal */}
      {detailedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDetailedItem(null)}>
          <div className="bg-background rounded-lg shadow-2xl max-w-md w-full border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">아이템 정보</h3>
                <button
                  onClick={() => setDetailedItem(null)}
                  className="text-text-secondary hover:text-text-primary text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{detailedItem.icon}</span>
                  <div>
                    <div className="font-bold text-text-primary">{detailedItem.name}</div>
                    <div className="text-sm text-text-secondary">{detailedItem.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Target Selection Modal */}
      {showGiftTarget && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-md w-full border border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">선물할 대상 선택</h3>
                <button
                  onClick={() => setShowGiftTarget(false)}
                  className="text-text-secondary hover:text-text-primary text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{selectedItem.icon}</span>
                  <div>
                    <div className="font-bold text-text-primary">{selectedItem.name}</div>
                    <div className="text-sm text-text-secondary">{selectedItem.description}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {unlockedCharacters.map(characterId => {
                  const character = characters[characterId];
                  if (!character) return null;

                  const isPreferred = selectedItem.preferredBy?.includes(characterId);

                  return (
                    <button
                      key={characterId}
                      onClick={() => handleGiftToCharacter(characterId)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 flex items-center gap-3 ${
                        isPreferred
                          ? 'bg-accent/60 hover:bg-accent/50 border border-accent/50'
                          : 'bg-primary/60 hover:bg-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{getCharacterEmoji(characterId)}</span>
                      <div>
                        <div className="font-medium text-text-primary">{character.name}</div>
                        <div className="text-xs text-text-secondary">{character.role}</div>
                        {isPreferred && (
                          <div className="text-xs text-accent font-medium">⭐ 선호 아이템!</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;