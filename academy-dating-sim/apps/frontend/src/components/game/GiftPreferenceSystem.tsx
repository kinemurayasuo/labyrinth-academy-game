import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface Gift {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'flower' | 'food' | 'accessory' | 'book' | 'toy' | 'special';
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  obtainMethod?: string;
}

interface CharacterPreference {
  characterId: string;
  loves: string[];        // +20 affection
  likes: string[];        // +10 affection
  neutral: string[];      // +5 affection
  dislikes: string[];     // -5 affection
  hates: string[];        // -10 affection
  specialReactions: Record<string, string>;
  birthdayGift?: string;
}

interface GiftHistory {
  characterId: string;
  giftId: string;
  date: number;
  reaction: string;
  affectionChange: number;
}

const GiftPreferenceSystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { updateAffection, updateMoney, advanceTime, addItem } = useGameStore((state: any) => state.actions);

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([]);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [discoveredPreferences, setDiscoveredPreferences] = useState<Record<string, Set<string>>>({});

  // Gift catalog
  const gifts: Gift[] = [
    // Flowers
    { id: 'rose', name: '장미', icon: '🌹', description: '사랑의 상징', category: 'flower', price: 50, rarity: 'common' },
    { id: 'sakura_petal', name: '벚꽃', icon: '🌸', description: '봄의 전령', category: 'flower', price: 60, rarity: 'uncommon' },
    { id: 'sunflower', name: '해바라기', icon: '🌻', description: '밝은 에너지', category: 'flower', price: 40, rarity: 'common' },
    { id: 'blue_rose', name: '파란 장미', icon: '💙', description: '불가능의 상징', category: 'flower', price: 200, rarity: 'rare' },
    { id: 'rainbow_flower', name: '무지개 꽃', icon: '🌈', description: '희귀한 마법의 꽃', category: 'flower', price: 500, rarity: 'legendary' },

    // Food
    { id: 'chocolate', name: '초콜릿', icon: '🍫', description: '달콤한 선물', category: 'food', price: 30, rarity: 'common' },
    { id: 'cake', name: '케이크', icon: '🍰', description: '특별한 날을 위해', category: 'food', price: 80, rarity: 'uncommon' },
    { id: 'cookies', name: '쿠키', icon: '🍪', description: '수제 쿠키', category: 'food', price: 25, rarity: 'common' },
    { id: 'tea_set', name: '차 세트', icon: '🍵', description: '고급 차와 다구', category: 'food', price: 150, rarity: 'uncommon' },
    { id: 'bento', name: '도시락', icon: '🍱', description: '정성스런 도시락', category: 'food', price: 45, rarity: 'common' },
    { id: 'rare_wine', name: '희귀 와인', icon: '🍷', description: '100년된 빈티지', category: 'food', price: 1000, rarity: 'legendary' },

    // Accessories
    { id: 'necklace', name: '목걸이', icon: '📿', description: '우아한 액세서리', category: 'accessory', price: 200, rarity: 'uncommon' },
    { id: 'bracelet', name: '팔찌', icon: '⌚', description: '세련된 팔찌', category: 'accessory', price: 150, rarity: 'uncommon' },
    { id: 'earrings', name: '귀걸이', icon: '💎', description: '반짝이는 귀걸이', category: 'accessory', price: 180, rarity: 'uncommon' },
    { id: 'hair_pin', name: '머리핀', icon: '🎀', description: '귀여운 머리핀', category: 'accessory', price: 60, rarity: 'common' },
    { id: 'ring', name: '반지', icon: '💍', description: '특별한 의미의 반지', category: 'accessory', price: 500, rarity: 'rare' },
    { id: 'crown', name: '왕관', icon: '👑', description: '전설의 왕관', category: 'accessory', price: 2000, rarity: 'legendary' },

    // Books
    { id: 'novel', name: '소설책', icon: '📖', description: '베스트셀러 소설', category: 'book', price: 40, rarity: 'common' },
    { id: 'manga', name: '만화책', icon: '📚', description: '인기 만화', category: 'book', price: 35, rarity: 'common' },
    { id: 'poetry', name: '시집', icon: '📜', description: '아름다운 시집', category: 'book', price: 45, rarity: 'common' },
    { id: 'magic_tome', name: '마법서', icon: '📕', description: '고대의 마법서', category: 'book', price: 300, rarity: 'rare' },
    { id: 'diary', name: '일기장', icon: '📔', description: '고급 가죽 일기장', category: 'book', price: 70, rarity: 'uncommon' },

    // Toys
    { id: 'teddy_bear', name: '곰인형', icon: '🧸', description: '포근한 곰인형', category: 'toy', price: 50, rarity: 'common' },
    { id: 'doll', name: '인형', icon: '🪆', description: '정교한 인형', category: 'toy', price: 80, rarity: 'uncommon' },
    { id: 'puzzle', name: '퍼즐', icon: '🧩', description: '1000조각 퍼즐', category: 'toy', price: 60, rarity: 'common' },
    { id: 'music_box', name: '오르골', icon: '🎵', description: '멜로디가 흐르는 오르골', category: 'toy', price: 150, rarity: 'uncommon' },
    { id: 'crystal_ball', name: '수정구', icon: '🔮', description: '신비한 수정구', category: 'toy', price: 250, rarity: 'rare' },

    // Special
    { id: 'love_letter', name: '러브레터', icon: '💌', description: '마음을 담은 편지', category: 'special', price: 0, rarity: 'uncommon', obtainMethod: '직접 작성' },
    { id: 'photo_album', name: '사진첩', icon: '📸', description: '추억이 담긴 앨범', category: 'special', price: 100, rarity: 'uncommon' },
    { id: 'handmade_gift', name: '수제 선물', icon: '🎁', description: '정성스럽게 만든 선물', category: 'special', price: 0, rarity: 'rare', obtainMethod: '제작' },
    { id: 'promise_ring', name: '약속의 반지', icon: '💝', description: '영원을 약속하는 반지', category: 'special', price: 1000, rarity: 'legendary' },
    { id: 'star_fragment', name: '별조각', icon: '⭐', description: '하늘에서 떨어진 별', category: 'special', price: 0, rarity: 'legendary', obtainMethod: '특별 이벤트' }
  ];

  // Character preferences
  const characterPreferences: CharacterPreference[] = [
    {
      characterId: 'sakura',
      loves: ['rose', 'ring', 'promise_ring', 'handmade_gift'],
      likes: ['sunflower', 'chocolate', 'hair_pin', 'teddy_bear'],
      neutral: ['novel', 'cookies', 'bracelet'],
      dislikes: ['magic_tome', 'crystal_ball', 'rare_wine'],
      hates: ['doll', 'poetry'],
      specialReactions: {
        'sakura_petal': '벚꽃...? 내 이름과 같네. 특별한 의미가 있는 거야?',
        'blue_rose': '파란 장미라니... 불가능을 가능하게 만들겠다는 거야?',
        'love_letter': '편지... 읽어봐도 돼? ...정말 고마워.'
      },
      birthdayGift: 'cake'
    },
    {
      characterId: 'yuki',
      loves: ['magic_tome', 'crystal_ball', 'blue_rose', 'star_fragment'],
      likes: ['chocolate', 'music_box', 'necklace', 'tea_set'],
      neutral: ['novel', 'puzzle', 'earrings'],
      dislikes: ['sunflower', 'bento', 'teddy_bear'],
      hates: ['rare_wine', 'crown'],
      specialReactions: {
        'rainbow_flower': '무지개 꽃! 마법의 재료로 완벽해!',
        'diary': '일기장? 마법 연구 노트로 쓸게!',
        'handmade_gift': '직접 만든 거야? 마법보다 더 특별해...'
      },
      birthdayGift: 'magic_tome'
    },
    {
      characterId: 'luna',
      loves: ['poetry', 'music_box', 'star_fragment', 'diary'],
      likes: ['tea_set', 'novel', 'earrings', 'blue_rose'],
      neutral: ['chocolate', 'necklace', 'doll'],
      dislikes: ['sunflower', 'bento', 'puzzle'],
      hates: ['rare_wine', 'crown'],
      specialReactions: {
        'teddy_bear': '곰인형... 같이 잘 수 있겠네.',
        'love_letter': '편지... 처음 받아봐. 소중히 간직할게.',
        'photo_album': '추억... 나도 여기 있어. 고마워.'
      },
      birthdayGift: 'poetry'
    },
    {
      characterId: 'akane',
      loves: ['sunflower', 'cookies', 'teddy_bear', 'photo_album'],
      likes: ['chocolate', 'cake', 'hair_pin', 'puzzle'],
      neutral: ['novel', 'bracelet', 'rose'],
      dislikes: ['poetry', 'rare_wine', 'crown'],
      hates: ['magic_tome', 'crystal_ball'],
      specialReactions: {
        'bento': '도시락! 같이 먹자! 피크닉 가자!',
        'handmade_gift': '우와! 직접 만든 거야? 최고!',
        'promise_ring': '약속... 평생 친구하자는 거지?'
      },
      birthdayGift: 'cake'
    },
    {
      characterId: 'hana',
      loves: ['sakura_petal', 'sunflower', 'rainbow_flower', 'tea_set'],
      likes: ['rose', 'poetry', 'music_box', 'diary'],
      neutral: ['chocolate', 'necklace', 'novel'],
      dislikes: ['rare_wine', 'crown', 'puzzle'],
      hates: ['doll', 'crystal_ball'],
      specialReactions: {
        'blue_rose': '파란 장미... 자연에는 없는 색이에요. 신기해요.',
        'handmade_gift': '정성이 느껴져요. 꽃보다 아름다워요.',
        'star_fragment': '별조각으로 특별한 꽃을 키울 수 있을 것 같아요.'
      },
      birthdayGift: 'rainbow_flower'
    },
    {
      characterId: 'rin',
      loves: ['crystal_ball', 'magic_tome', 'crown', 'star_fragment'],
      likes: ['rare_wine', 'necklace', 'poetry', 'blue_rose'],
      neutral: ['chocolate', 'novel', 'earrings'],
      dislikes: ['sunflower', 'cookies', 'teddy_bear'],
      hates: ['bento', 'puzzle'],
      specialReactions: {
        'promise_ring': '약속... 흥미로운 제안이네요.',
        'diary': '비밀을 적는 곳... 제 비밀도 적어도 될까요?',
        'love_letter': '편지... 숨겨진 감정이 느껴져요.'
      },
      birthdayGift: 'crystal_ball'
    },
    {
      characterId: 'mei',
      loves: ['bento', 'cake', 'cookies', 'chocolate'],
      likes: ['tea_set', 'recipe_book', 'hair_pin', 'photo_album'],
      neutral: ['rose', 'bracelet', 'novel'],
      dislikes: ['magic_tome', 'crystal_ball', 'crown'],
      hates: ['rare_wine', 'poetry'],
      specialReactions: {
        'handmade_gift': '수제라니! 나도 뭔가 만들어줄게!',
        'rare_wine': '요리에는 좋지만... 선물로는 글쎄...',
        'love_letter': '편지보다 맛있는 걸 만들어줄래?'
      },
      birthdayGift: 'cake'
    },
    {
      characterId: 'sora',
      loves: ['novel', 'poetry', 'diary', 'magic_tome'],
      likes: ['tea_set', 'music_box', 'earrings', 'blue_rose'],
      neutral: ['chocolate', 'necklace', 'puzzle'],
      dislikes: ['sunflower', 'bento', 'teddy_bear'],
      hates: ['crown', 'rare_wine'],
      specialReactions: {
        'manga': '만화책도 나름 재미있네요.',
        'photo_album': '사진으로 남은 이야기... 좋아요.',
        'love_letter': '편지... 책보다 더 설레요.'
      },
      birthdayGift: 'novel'
    }
  ];

  // Calculate affection change based on preference
  const calculateAffectionChange = (characterId: string, giftId: string): { change: number; reaction: string } => {
    const preference = characterPreferences.find(p => p.characterId === characterId);
    if (!preference) return { change: 5, reaction: '고마워요.' };

    // Check special reactions first
    if (preference.specialReactions[giftId]) {
      return { change: 15, reaction: preference.specialReactions[giftId] };
    }

    // Birthday gift
    const today = new Date();
    const isBirthday = false; // Would need to implement birthday system
    if (isBirthday && giftId === preference.birthdayGift) {
      return { change: 30, reaction: '생일 선물이야? 정말 최고의 선물이야!' };
    }

    // Regular preferences
    if (preference.loves.includes(giftId)) {
      return { change: 20, reaction: '우와! 정말 좋아하는 거야! 어떻게 알았어?' };
    }
    if (preference.likes.includes(giftId)) {
      return { change: 10, reaction: '고마워! 마음에 들어!' };
    }
    if (preference.dislikes.includes(giftId)) {
      return { change: -5, reaction: '음... 고맙긴 한데...' };
    }
    if (preference.hates.includes(giftId)) {
      return { change: -10, reaction: '이건... 별로야...' };
    }

    return { change: 5, reaction: '고마워. 소중히 할게.' };
  };

  // Give gift to character
  const giveGift = () => {
    if (!selectedCharacter || !selectedGift) return;

    // Check if player has the gift
    if (!player.inventory?.includes(selectedGift.id)) {
      // Check if player can afford to buy it
      if (selectedGift.price > 0 && player.money < selectedGift.price) {
        setShowReaction('돈이 부족합니다!');
        return;
      }

      // Buy the gift
      if (selectedGift.price > 0) {
        updateMoney(-selectedGift.price);
      }
    }

    // Calculate affection change
    const { change, reaction } = calculateAffectionChange(selectedCharacter, selectedGift.id);
    updateAffection(selectedCharacter, change);

    // Show reaction
    setShowReaction(reaction);

    // Save to history
    const historyEntry: GiftHistory = {
      characterId: selectedCharacter,
      giftId: selectedGift.id,
      date: Date.now(),
      reaction,
      affectionChange: change
    };
    setGiftHistory(prev => [...prev, historyEntry]);

    // Discover preference
    const preference = characterPreferences.find(p => p.characterId === selectedCharacter);
    if (preference) {
      setDiscoveredPreferences(prev => ({
        ...prev,
        [selectedCharacter]: new Set([...(prev[selectedCharacter] || []), selectedGift.id])
      }));
    }

    // Clear reaction after delay
    setTimeout(() => {
      setShowReaction(null);
      setSelectedGift(null);
    }, 3000);

    advanceTime();
  };

  // Get preference icon
  const getPreferenceIcon = (characterId: string, giftId: string): string => {
    const preference = characterPreferences.find(p => p.characterId === characterId);
    if (!preference) return '❓';

    if (preference.loves.includes(giftId)) return '💖';
    if (preference.likes.includes(giftId)) return '💗';
    if (preference.dislikes.includes(giftId)) return '💔';
    if (preference.hates.includes(giftId)) return '🖤';
    return '🤍';
  };

  // Get rarity color
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-gray-600 to-gray-500';
      case 'uncommon': return 'from-green-600 to-green-500';
      case 'rare': return 'from-blue-600 to-blue-500';
      case 'legendary': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900 via-purple-900 to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-pink-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🎁 선물 시스템
              </h1>
              <p className="text-text-secondary">
                캐릭터의 취향에 맞는 선물을 주고 호감도를 높이세요!
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl text-yellow-400">💰 {player.money}</div>
              <button
                onClick={() => navigate('/game')}
                className="mt-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gift Catalog */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-bold text-white mb-4">선물 목록</h2>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['all', 'flower', 'food', 'accessory', 'book', 'toy', 'special'].map(category => (
                  <button
                    key={category}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-white text-sm"
                  >
                    {category === 'all' ? '전체' :
                     category === 'flower' ? '🌹 꽃' :
                     category === 'food' ? '🍰 음식' :
                     category === 'accessory' ? '💎 액세서리' :
                     category === 'book' ? '📚 책' :
                     category === 'toy' ? '🧸 장난감' : '⭐ 특별'}
                  </button>
                ))}
              </div>

              {/* Gift Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {gifts.map(gift => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={`relative p-4 rounded-lg border transition-all hover:scale-105 ${
                      selectedGift?.id === gift.id
                        ? 'border-pink-500 bg-pink-900/50'
                        : 'border-gray-600 bg-gray-800/50 hover:border-purple-500'
                    }`}
                  >
                    <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs text-white bg-gradient-to-r ${getRarityColor(gift.rarity)}`}>
                      {gift.rarity}
                    </div>
                    <div className="text-3xl mb-2">{gift.icon}</div>
                    <div className="text-sm font-bold text-white">{gift.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{gift.description}</div>
                    <div className="text-sm text-yellow-400">
                      {gift.price > 0 ? `💰 ${gift.price}` : gift.obtainMethod}
                    </div>
                    {selectedCharacter && discoveredPreferences[selectedCharacter]?.has(gift.id) && (
                      <div className="absolute bottom-1 left-1 text-lg">
                        {getPreferenceIcon(selectedCharacter, gift.id)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Selection & Gift Giving */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-pink-500">
              <h2 className="text-xl font-bold text-white mb-4">캐릭터 선택</h2>
              <div className="space-y-2">
                {Object.keys(player.affection || {}).map(characterId => (
                  <button
                    key={characterId}
                    onClick={() => setSelectedCharacter(characterId)}
                    className={`w-full p-3 rounded-lg transition ${
                      selectedCharacter === characterId
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{characterId}</span>
                      <span className="text-pink-300">❤️ {player.affection[characterId]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gift Action */}
            {selectedCharacter && selectedGift && (
              <div className="bg-gradient-to-br from-pink-800/50 to-purple-800/50 backdrop-blur-md rounded-lg p-6 border border-pink-400">
                <h3 className="text-lg font-bold text-white mb-4">선물 주기</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{selectedGift.icon}</div>
                  <div className="text-white font-bold">{selectedGift.name}</div>
                  <div className="text-sm text-gray-300">→ {selectedCharacter}</div>
                </div>
                <button
                  onClick={giveGift}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold transition"
                >
                  선물하기
                </button>
              </div>
            )}

            {/* Reaction Display */}
            {showReaction && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 animate-bounce">
                <div className="text-yellow-300 text-center font-bold">{showReaction}</div>
              </div>
            )}

            {/* Gift History */}
            <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
              <h3 className="text-lg font-bold text-purple-400 mb-3">선물 기록</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {giftHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="text-sm bg-purple-900/30 rounded p-2">
                    <div className="flex justify-between text-white">
                      <span>{entry.characterId}</span>
                      <span className={entry.affectionChange > 0 ? 'text-green-400' : 'text-red-400'}>
                        {entry.affectionChange > 0 ? '+' : ''}{entry.affectionChange}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {gifts.find(g => g.id === entry.giftId)?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preference Discovery Guide */}
        <div className="mt-6 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-purple-500">
          <h2 className="text-xl font-bold text-purple-400 mb-4">💡 선호도 가이드</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <span className="text-2xl">💖</span>
              <div className="text-sm text-white">매우 좋아함</div>
              <div className="text-xs text-green-400">+20</div>
            </div>
            <div>
              <span className="text-2xl">💗</span>
              <div className="text-sm text-white">좋아함</div>
              <div className="text-xs text-green-400">+10</div>
            </div>
            <div>
              <span className="text-2xl">🤍</span>
              <div className="text-sm text-white">보통</div>
              <div className="text-xs text-gray-400">+5</div>
            </div>
            <div>
              <span className="text-2xl">💔</span>
              <div className="text-sm text-white">싫어함</div>
              <div className="text-xs text-red-400">-5</div>
            </div>
            <div>
              <span className="text-2xl">🖤</span>
              <div className="text-sm text-white">매우 싫어함</div>
              <div className="text-xs text-red-400">-10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftPreferenceSystem;