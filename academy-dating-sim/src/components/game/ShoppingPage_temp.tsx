import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import itemsData from '../data/items.json';

// Type assertions for JSON data
const items = itemsData.items as Record<string, any>;

const ShoppingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use Zustand store
  const player = useGameStore((state: any) => state.player);
  const { purchaseItem } = useGameStore((state: any) => state.actions);
  const [selectedCategory, setSelectedCategory] = useState<string>('?�체');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Filter purchasable items (gifts and consumables)
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

  const handlePurchase = (item: any) => {
    if (player.money < item.value) {
      alert('골드가 부족합?�다!');
      return;
    }

    const success = purchaseItem(item.id, item.value);
    if (success) {
      alert(`${item.name}??�? 구매?�습?�다!`);
    } else {
      alert('구매???�패?�습?�다.');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return '?�반';
      case 'uncommon': return '고급';
      case 'rare': return '?��?';
      case 'epic': return '?�웅';
      case 'legendary': return '?�설';
      default: return '?�반';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ?���??�카?��? ?�점
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                <span className="text-yellow-600">?��</span>
                <span className="font-bold text-yellow-800">{player.money} 골드</span>
              </div>
              <button
                onClick={() => navigate('/game')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                ?�� 게임?�로 ?�아가�?              </button>
            </div>
          </div>
        </div>

        {/* Store Description */}
        <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-4 rounded">
          <p className="font-medium">?�� ?�비린스 ?�카?��? 공식 ?�점???�신 것을 ?�영?�니??</p>
          <p className="text-sm mt-1">?�기???�로?�들???�한 ?�별???�물�?모험???�용???�이?�들??구매?�실 ???�습?�다.</p>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-lg font-bold mb-3">?�� 카테고리</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-4">?�� ?�품 목록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                      selectedItem === item.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => setSelectedItem(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor(item.rarity)}`}>
                            {getRarityName(item.rarity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">💰</span>
                            <span className="font-bold text-yellow-800">{item.value}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(item);
                            }}
                            disabled={player.money < item.value}
                            className={`px-3 py-1 text-sm rounded transition ${
                              player.money >= item.value
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            구매
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Item Details Panel */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-bold mb-4">?�� ?�세 ?�보</h3>
            {selectedItem && items[selectedItem] ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-6xl">{items[selectedItem].icon}</span>
                  <h4 className="text-xl font-bold mt-2">{items[selectedItem].name}</h4>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full mt-1 ${getRarityColor(items[selectedItem].rarity)}`}>
                    {getRarityName(items[selectedItem].rarity)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">?�� ?�명</h5>
                    <p className="text-sm text-gray-600">{items[selectedItem].description}</p>
                  </div>


                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">?�� ?�과</h5>
                    <div className="space-y-1">
                      {Object.entries(items[selectedItem].effect || {}).map(([stat, value]) => (
                        <div key={stat} className="flex items-center gap-2 text-sm">
                          <span className="text-emerald-600">+{String(value)}</span>
                          <span className="text-gray-700 capitalize">{stat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {items[selectedItem].preferredBy && items[selectedItem].preferredBy!.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">이 선물을 좋아하는 캐릭터</h5>
                      <div className="flex flex-wrap gap-1">
                        {(items[selectedItem].preferredBy || []).map((charId: any) => (
                          <span key={charId} className="bg-pink-100 text-pink-700 px-2 py-1 text-xs rounded">
                            {charId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}


                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">가격</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-600">💰</span>
                        <span className="font-bold text-yellow-800">{items[selectedItem].value} 골드</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePurchase(items[selectedItem])}
                      disabled={player.money < items[selectedItem].value}
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        player.money >= items[selectedItem].value
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {player.money >= items[selectedItem].value ? '구매하기' : '골드 부족'}
                    </button>
                  </div>
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

        {/* Quick Actions */}
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-3">??빠른 ?�동</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedCategory('?�물')}
              className="p-4 bg-pink-100 hover:bg-pink-200 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">?��</div>
              <div className="font-medium">?�물 보기</div>
              <div className="text-sm text-gray-600">?�로?�들???�한 ?�별???�물</div>
            </button>
            <button
              onClick={() => setSelectedCategory('?�모??)}
              className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">?�️</div>
              <div className="font-medium">?�모??보기</div>
              <div className="text-sm text-gray-600">?�력�??�상 ?�이??/div>
            </button>
            <button
              onClick={() => setSelectedCategory('?��???)}
              className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition text-left"
            >
              <div className="text-2xl mb-2">�?/div>
              <div className="font-medium">?��???보기</div>
              <div className="text-sm text-gray-600">?�별???�과???�이??/div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
