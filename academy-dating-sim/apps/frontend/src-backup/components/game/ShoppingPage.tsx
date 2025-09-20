import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import itemsData from '../../data/items.json';

const items = itemsData.items as Record<string, any>;

const ShoppingPage: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { buyItem, updateMoney, sellItem } = useGameStore((state: any) => state.actions);

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // --- Buy Mode Data ---
  const shopItems = Object.values(items).filter(item =>
    item.type === 'gift' || item.type === 'consumable'
  );
  const categories = ['전체', '선물', '소모품', '특별'];
  const filteredItems = shopItems.filter(item => {
    if (selectedCategory === '전체') return true;
    if (selectedCategory === '선물') return item.category === '선물';
    if (selectedCategory === '소모품') return item.category === '소모품';
    if (selectedCategory === '특별') return item.rarity === 'rare' || item.rarity === 'legendary';
    return true;
  });

  // --- Sell Mode Data ---
  const playerInventory = useGameStore((state: any) => state.player.inventory);
  const processedInventory = useMemo(() => {
    const itemCounts = playerInventory.reduce((acc: { [key: string]: number }, itemId: string) => {
      acc[itemId] = (acc[itemId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(itemCounts).map(([itemId, count]) => ({
      ...items[itemId],
      count,
    }));
  }, [playerInventory]);

  // --- Handlers ---
  const handlePurchase = (item: any) => {
    if (player.money < item.value) {
      alert('골드가 부족합니다!');
      return;
    }
    updateMoney(-item.value);
    buyItem(item.id);
    alert(`${item.name}을(를) 구매했습니다!`);
  };

  const handleSell = (item: any) => {
    const sellPrice = Math.floor(item.value / 2);
    sellItem(item.id, sellPrice);
    alert(`${item.name}을(를) ${sellPrice}G에 판매했습니다!`);
    setSelectedItem(null);
  };

  const handleModeChange = (newMode: 'buy' | 'sell') => {
    setMode(newMode);
    setSelectedItem(null); // Reset selection when changing mode
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return '일반';
      case 'uncommon': return '고급';
      case 'rare': return '희귀';
      case 'epic': return '영웅';
      case 'legendary': return '전설';
      default: return '일반';
    }
  };

  const currentItem = selectedItem ? items[selectedItem] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                🏪 아카데미 상점
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-600">💰</span>
                <span className="font-semibold text-gray-800">{player.money} 골드</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              게임으로 돌아가기
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-md">
            <button
              onClick={() => handleModeChange('buy')}
              className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 ${
                mode === 'buy' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span role="img" aria-label="buy">🛍️</span> 구매
            </button>
            <button
              onClick={() => handleModeChange('sell')}
              className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 ${
                mode === 'sell' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span role="img" aria-label="sell">💸</span> 판매
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item List */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            {mode === 'buy' ? (
              <>
                <div className="flex gap-2 mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                        selectedItem === item.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Item content */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                              item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getRarityText(item.rarity)}
                            </span>
                            <span className="font-bold text-yellow-700">{item.value} G</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Sell Mode View
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {processedInventory.length > 0 ? (
                  processedInventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                        selectedItem === item.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Item content */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name} <span className="text-sm text-gray-500">x{item.count}</span></h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                              item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getRarityText(item.rarity)}
                            </span>
                            <span className="font-bold text-green-700">판매가: {Math.floor(item.value / 2)} G</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    <span className="text-4xl mb-4 block">🎒</span>
                    <p>판매할 아이템이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item Detail */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">상세 정보</h3>
            {currentItem ? (
              <div>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{currentItem.icon}</div>
                  <h4 className="text-xl font-bold text-gray-800">{currentItem.name}</h4>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">설명</h5>
                    <p className="text-sm text-gray-600">{currentItem.description}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">효과</h5>
                    <div className="space-y-1 text-sm">
                      {currentItem.effects?.map((effect: any, index: number) => (
                        <div key={index} className="text-gray-600">• {effect.type}: {effect.value}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3">
                  {mode === 'buy' ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">가격</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600">💰</span>
                          <span className="font-bold text-yellow-800">{currentItem.value} 골드</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase(currentItem)}
                        disabled={player.money < currentItem.value}
                        className={`w-full py-3 rounded-lg font-bold transition ${
                          player.money >= currentItem.value
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {player.money >= currentItem.value ? '구매하기' : '골드 부족'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">판매 가격</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600">💰</span>
                          <span className="font-bold text-green-800">{Math.floor(currentItem.value / 2)} 골드</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSell(currentItem)}
                        className="w-full py-3 rounded-lg font-bold transition bg-red-500 hover:bg-red-600 text-white"
                      >
                        판매하기
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-4 block">📦</span>
                <p>상품을 선택하면 상세 정보를 볼 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;