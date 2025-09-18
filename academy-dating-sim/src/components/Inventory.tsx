import React, { useState } from 'react';
import { Player, Item, Character } from '../types/game';

interface InventoryProps {
  player: Player;
  items: Record<string, Item>;
  characters: Record<string, Character>;
  unlockedCharacters: string[];
  onUseItem: (itemId: string, targetCharacter?: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({
  player,
  items,
  characters,
  unlockedCharacters,
  onUseItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showGiftTarget, setShowGiftTarget] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gift' | 'consumable' | 'special'>('all');

  const getItemIcon = (item: Item) => {
    if (item.type === 'gift') {
      if (item.name.includes('꽃')) return '🌸';
      if (item.name.includes('초콜릿')) return '🍫';
      if (item.name.includes('편지')) return '💌';
      if (item.name.includes('케이크')) return '🎂';
      return '🎁';
    }
    if (item.type === 'consumable') {
      if (item.name.includes('커피')) return '☕';
      if (item.name.includes('에너지')) return '⚡';
      if (item.name.includes('책')) return '📚';
      if (item.name.includes('음료')) return '🥤';
      return '💊';
    }
    if (item.type === 'special') {
      if (item.name.includes('열쇠')) return '🗝️';
      if (item.name.includes('카드')) return '💳';
      return '⭐';
    }
    return '📦';
  };

  const getItemRarity = (item: Item) => {
    if (item.type === 'special') return { color: 'border-yellow-400 bg-yellow-500/10', text: 'text-yellow-400' };
    if (item.preferredBy && item.preferredBy.length > 0) return { color: 'border-purple-400 bg-purple-500/10', text: 'text-purple-400' };
    return { color: 'border-gray-400 bg-gray-500/10', text: 'text-gray-400' };
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

  const filteredItems = Object.values(inventoryItems).filter(({ item }) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleUseItem = (item: Item) => {
    if (item.type === 'gift') {
      setSelectedItem(item);
      setShowGiftTarget(true);
    } else {
      onUseItem(item.id);
      setSelectedItem(null);
    }
  };

  const handleGiftToCharacter = (characterId: string) => {
    if (selectedItem) {
      onUseItem(selectedItem.id, characterId);
      setSelectedItem(null);
      setShowGiftTarget(false);
    }
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
    <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 text-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-200 flex items-center gap-2">
          <span>🎒</span>
          인벤토리
        </h2>

        <div className="text-sm text-purple-300">
          총 {Object.values(inventoryItems).reduce((sum, { count }) => sum + count, 0)}개 아이템
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: '전체', icon: '📦' },
          { key: 'gift', label: '선물', icon: '🎁' },
          { key: 'consumable', label: '소모품', icon: '💊' },
          { key: 'special', label: '특별', icon: '⭐' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-purple-800/40 text-purple-300 hover:bg-purple-700/40'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {Object.keys(inventoryItems).length === 0 ? (
        <div className="text-center py-12 text-purple-400">
          <div className="text-4xl mb-3">📦</div>
          <p>인벤토리가 비어있습니다</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-purple-400">
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
                className={`bg-purple-900/40 rounded-lg p-4 border transition-all duration-200 hover:scale-105 ${rarity.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getItemIcon(item)}</span>
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className={`text-xs ${rarity.text} capitalize`}>{item.type}</p>
                    </div>
                  </div>

                  {count > 1 && (
                    <div className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ×{count}
                    </div>
                  )}
                </div>

                <p className="text-sm text-purple-200 mb-4">{item.description}</p>

                {/* Item Effects */}
                <div className="space-y-2 mb-4">
                  {item.effect.affection && (
                    <div className="text-xs text-pink-300">💕 호감도 +{item.effect.affection}</div>
                  )}
                  {item.effect.intelligence && (
                    <div className="text-xs text-blue-300">🧠 지력 +{item.effect.intelligence}</div>
                  )}
                  {item.effect.charm && (
                    <div className="text-xs text-pink-300">✨ 매력 +{item.effect.charm}</div>
                  )}
                  {item.effect.stamina && (
                    <div className="text-xs text-green-300">💪 체력 +{item.effect.stamina}</div>
                  )}
                  {item.effect.unlockSecret && (
                    <div className="text-xs text-yellow-300">🔓 비밀 해제</div>
                  )}
                </div>

                {/* Preferred By */}
                {item.preferredBy && item.preferredBy.length > 0 && (
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
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.type === 'gift'
                      ? 'bg-pink-600/80 hover:bg-pink-500/80 text-white'
                      : item.type === 'consumable'
                      ? 'bg-green-600/80 hover:bg-green-500/80 text-white'
                      : 'bg-yellow-600/80 hover:bg-yellow-500/80 text-white'
                  }`}
                >
                  {item.type === 'gift' ? '선물하기' : item.type === 'consumable' ? '사용하기' : '확인하기'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Gift Target Selection Modal */}
      {showGiftTarget && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 text-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-pink-200">선물할 대상 선택</h3>
                <button
                  onClick={() => setShowGiftTarget(false)}
                  className="text-purple-300 hover:text-white text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="bg-purple-900/40 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getItemIcon(selectedItem)}</span>
                  <div>
                    <div className="font-bold text-white">{selectedItem.name}</div>
                    <div className="text-sm text-purple-300">{selectedItem.description}</div>
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
                          ? 'bg-yellow-600/60 hover:bg-yellow-500/60 border border-yellow-400/50'
                          : 'bg-purple-800/60 hover:bg-purple-700/60'
                      }`}
                    >
                      <span className="text-2xl">{getCharacterEmoji(characterId)}</span>
                      <div>
                        <div className="font-medium text-white">{character.name}</div>
                        <div className="text-xs text-purple-300">{character.role}</div>
                        {isPreferred && (
                          <div className="text-xs text-yellow-300 font-medium">⭐ 선호 아이템!</div>
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