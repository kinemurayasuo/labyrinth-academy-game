import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import itemsData from '../../data/items.json';

const items = itemsData.items as Record<string, any>;

interface EquipmentSlot {
  type: 'weapon' | 'armor' | 'accessory';
  equipped: string | null;
}

const CharacterEquipment: React.FC = () => {
  const player = useGameStore((state: any) => state.player);
  const updatePlayer = useGameStore((state: any) => state.actions.updatePlayer);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);

  // Initialize equipment slots from player data
  const equipment: Record<string, EquipmentSlot> = {
    weapon: { type: 'weapon', equipped: player.equipment?.weapon || null },
    armor: { type: 'armor', equipped: player.equipment?.armor || null },
    accessory: { type: 'accessory', equipped: player.equipment?.accessory || null },
  };

  // Filter inventory items by type
  const getEquippableItems = (type: string) => {
    return player.inventory.filter((itemId: string) => {
      const item = items[itemId];
      return item && item.type === type;
    });
  };

  const equipItem = (slot: string, itemId: string) => {
    const item = items[itemId];
    if (!item) return;

    // Check requirements
    if (item.requirements) {
      if (item.requirements.level && player.level < item.requirements.level) {
        alert(`레벨 ${item.requirements.level} 이상이 필요합니다!`);
        return;
      }
      if (item.requirements.stats) {
        for (const [stat, value] of Object.entries(item.requirements.stats)) {
          if (player.stats[stat as keyof typeof player.stats] < value) {
            alert(`${stat} ${value} 이상이 필요합니다!`);
            return;
          }
        }
      }
    }

    // Equip the item
    const newEquipment = { ...player.equipment, [slot]: itemId };
    updatePlayer({ equipment: newEquipment });
    setShowInventory(false);
    setSelectedSlot(null);
  };

  const unequipItem = (slot: string) => {
    const newEquipment = { ...player.equipment, [slot]: null };
    updatePlayer({ equipment: newEquipment });
  };

  const getEquipmentBonus = () => {
    let bonus = {
      strength: 0,
      agility: 0,
      intelligence: 0,
      charm: 0,
      luck: 0,
      hp: 0,
      mp: 0,
    };

    Object.values(equipment).forEach((slot) => {
      if (slot.equipped) {
        const item = items[slot.equipped];
        if (item && item.effect) {
          Object.entries(item.effect).forEach(([stat, value]) => {
            if (bonus.hasOwnProperty(stat)) {
              bonus[stat as keyof typeof bonus] += value as number;
            }
          });
        }
      }
    });

    return bonus;
  };

  const totalBonus = getEquipmentBonus();

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
        <span>⚔️</span>
        장비 관리
      </h2>

      {/* Equipment Slots */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(equipment).map(([slotName, slot]) => {
          const equippedItem = slot.equipped ? items[slot.equipped] : null;
          const slotIcons = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍',
          };

          return (
            <div key={slotName} className="bg-black/30 rounded-lg p-4 border border-border">
              <div className="text-sm text-text-secondary mb-2 capitalize">
                {slotIcons[slot.type]} {slotName}
              </div>
              {equippedItem ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{equippedItem.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-text-primary text-sm">
                        {equippedItem.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {Object.entries(equippedItem.effect || {}).map(([stat, value]) => (
                          <span key={stat} className="mr-2">
                            +{value} {stat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unequipItem(slotName)}
                    className="w-full py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                  >
                    해제
                  </button>
                </div>
              ) : (
                <div>
                  <div className="h-12 bg-black/20 rounded border-2 border-dashed border-border/50 flex items-center justify-center mb-2">
                    <span className="text-text-secondary text-sm">비어있음</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSlot(slot.type);
                      setShowInventory(true);
                    }}
                    className="w-full py-1 bg-primary hover:bg-secondary text-white rounded text-sm transition"
                  >
                    장착
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Equipment Bonus */}
      <div className="bg-black/30 rounded-lg p-4 border border-border">
        <h3 className="text-lg font-bold text-text-primary mb-3">총 장비 보너스</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Object.entries(totalBonus).map(([stat, value]) => (
            value > 0 && (
              <div key={stat} className="text-accent">
                +{value} {stat}
              </div>
            )
          ))}
          {Object.values(totalBonus).every(v => v === 0) && (
            <div className="col-span-3 text-text-secondary">장비 보너스 없음</div>
          )}
        </div>
      </div>

      {/* Character Total Stats with Equipment */}
      <div className="mt-4 bg-black/30 rounded-lg p-4 border border-border">
        <h3 className="text-lg font-bold text-text-primary mb-3">총 능력치</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-text-primary">
            💪 힘: {player.stats.strength} <span className="text-accent">{totalBonus.strength > 0 && `(+${totalBonus.strength})`}</span>
          </div>
          <div className="text-text-primary">
            🏃 민첩: {player.stats.agility} <span className="text-accent">{totalBonus.agility > 0 && `(+${totalBonus.agility})`}</span>
          </div>
          <div className="text-text-primary">
            🧠 지력: {player.stats.intelligence} <span className="text-accent">{totalBonus.intelligence > 0 && `(+${totalBonus.intelligence})`}</span>
          </div>
          <div className="text-text-primary">
            ✨ 매력: {player.stats.charm} <span className="text-accent">{totalBonus.charm > 0 && `(+${totalBonus.charm})`}</span>
          </div>
          <div className="text-text-primary">
            🍀 행운: {player.stats.luck} <span className="text-accent">{totalBonus.luck > 0 && `(+${totalBonus.luck})`}</span>
          </div>
        </div>
      </div>

      {/* Equipment Inventory Modal */}
      {showInventory && selectedSlot && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-background/90 backdrop-blur-md p-4 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-primary">
                  {selectedSlot === 'weapon' && '⚔️ 무기 선택'}
                  {selectedSlot === 'armor' && '🛡️ 방어구 선택'}
                  {selectedSlot === 'accessory' && '💍 장신구 선택'}
                </h3>
                <button
                  onClick={() => {
                    setShowInventory(false);
                    setSelectedSlot(null);
                  }}
                  className="text-text-secondary hover:text-text-primary text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              {getEquippableItems(selectedSlot).length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  장착 가능한 {selectedSlot === 'weapon' ? '무기' : selectedSlot === 'armor' ? '방어구' : '장신구'}가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getEquippableItems(selectedSlot).map((itemId: string) => {
                    const item = items[itemId];
                    if (!item) return null;

                    const canEquip = !item.requirements || (
                      (!item.requirements.level || player.level >= item.requirements.level) &&
                      (!item.requirements.stats || Object.entries(item.requirements.stats).every(
                        ([stat, value]) => player.stats[stat as keyof typeof player.stats] >= value
                      ))
                    );

                    return (
                      <div
                        key={itemId}
                        className={`bg-black/30 rounded-lg p-4 border ${
                          canEquip ? 'border-border hover:border-primary' : 'border-red-500/50 opacity-60'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{item.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-text-primary">{item.name}</h4>
                            <p className="text-xs text-text-secondary">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-accent mb-2">
                          {Object.entries(item.effect || {}).map(([stat, value]) => (
                            <span key={stat} className="mr-2">
                              +{value} {stat}
                            </span>
                          ))}
                        </div>
                        {item.requirements && (
                          <div className="text-xs text-red-400 mb-2">
                            {item.requirements.level && `레벨 ${item.requirements.level} 필요 `}
                            {item.requirements.stats && Object.entries(item.requirements.stats).map(
                              ([stat, value]) => `${stat} ${value} 필요 `
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => equipItem(selectedSlot, itemId)}
                          disabled={!canEquip}
                          className={`w-full py-2 rounded-lg font-medium transition ${
                            canEquip
                              ? 'bg-primary hover:bg-secondary text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canEquip ? '장착하기' : '요구사항 미달'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterEquipment;