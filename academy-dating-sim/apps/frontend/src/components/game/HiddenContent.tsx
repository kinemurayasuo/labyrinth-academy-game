import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';

interface HiddenArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: {
    type: 'item' | 'achievement' | 'puzzle' | 'time' | 'sequence';
    requirement: any;
  };
  rewards: {
    items?: { id: string; quantity: number }[];
    achievement?: string;
    characterUnlock?: string;
    memory?: string;
  };
  discovered: boolean;
}

interface HiddenCharacter {
  id: string;
  name: string;
  title: string;
  description: string;
  portrait: string;
  unlockCondition: {
    type: 'quest' | 'affection' | 'hidden_area' | 'special';
    requirement: any;
  };
  initialAffection: number;
  specialAbility: string;
  backstory: string[];
}

interface HiddenItem {
  id: string;
  name: string;
  description: string;
  rarity: 'legendary' | 'mythic' | 'unique';
  icon: string;
  location: string;
  hint: string;
  effects: {
    type: string;
    value: number;
  }[];
  lore: string;
}

interface SecretCode {
  id: string;
  code: string;
  hint: string;
  reward: string;
  used: boolean;
}

const hiddenAreas: HiddenArea[] = [
  {
    id: 'secret_garden',
    name: '비밀의 정원',
    description: '시간이 멈춘 듯한 신비로운 정원',
    icon: '🌺',
    unlockCondition: {
      type: 'puzzle',
      requirement: {
        puzzle: 'moonlight_puzzle',
        solution: ['moon', 'star', 'sun', 'moon']
      }
    },
    rewards: {
      items: [{ id: 'eternal_flower', quantity: 1 }],
      achievement: 'secret_garden_found',
      memory: 'garden_discovery'
    },
    discovered: false
  },
  {
    id: 'underground_library',
    name: '지하 도서관',
    description: '금지된 지식이 잠들어 있는 고대 도서관',
    icon: '📜',
    unlockCondition: {
      type: 'item',
      requirement: { item: 'ancient_key', quantity: 1 }
    },
    rewards: {
      items: [
        { id: 'forbidden_tome', quantity: 1 },
        { id: 'wisdom_crystal', quantity: 3 }
      ],
      achievement: 'forbidden_knowledge'
    },
    discovered: false
  },
  {
    id: 'crystal_cavern',
    name: '수정 동굴',
    description: '무지개빛 수정이 가득한 비밀 동굴',
    icon: '💎',
    unlockCondition: {
      type: 'sequence',
      requirement: {
        locations: ['waterfall', 'cave_entrance', 'hidden_path'],
        timeLimit: 300 // 5 minutes
      }
    },
    rewards: {
      items: [
        { id: 'rainbow_crystal', quantity: 5 },
        { id: 'crystal_armor', quantity: 1 }
      ],
      achievement: 'crystal_explorer'
    },
    discovered: false
  },
  {
    id: 'sky_palace',
    name: '천공의 궁전',
    description: '구름 위에 떠 있는 환상의 궁전',
    icon: '🏰',
    unlockCondition: {
      type: 'achievement',
      requirement: { achievements: ['master_of_sky', 'wind_walker'] }
    },
    rewards: {
      items: [{ id: 'wings_of_heaven', quantity: 1 }],
      characterUnlock: 'celestia',
      achievement: 'sky_ruler'
    },
    discovered: false
  },
  {
    id: 'time_rift',
    name: '시간의 균열',
    description: '과거와 미래가 교차하는 차원의 틈',
    icon: '⏳',
    unlockCondition: {
      type: 'time',
      requirement: {
        realTime: '03:33:33', // Must access at 3:33:33 AM
        gameTime: 'night'
      }
    },
    rewards: {
      items: [{ id: 'chronos_watch', quantity: 1 }],
      achievement: 'time_traveler',
      memory: 'time_rift_experience'
    },
    discovered: false
  }
];

const hiddenCharacters: HiddenCharacter[] = [
  {
    id: 'celestia',
    name: '셀레스티아',
    title: '천상의 수호자',
    description: '하늘에서 내려온 신비로운 존재',
    portrait: '👼',
    unlockCondition: {
      type: 'hidden_area',
      requirement: { area: 'sky_palace' }
    },
    initialAffection: 50,
    specialAbility: '천상의 축복 - 모든 스탯 +20%',
    backstory: [
      '천 년 전 하늘에서 내려온 천사',
      '인간 세계를 관찰하며 수호하는 존재',
      '당신에게서 특별한 운명을 느꼈다'
    ]
  },
  {
    id: 'shadow',
    name: '섀도우',
    title: '그림자 속의 소녀',
    description: '어둠 속에서만 나타나는 미스터리한 소녀',
    portrait: '🌑',
    unlockCondition: {
      type: 'special',
      requirement: {
        condition: 'defeat_shadow_boss_without_light'
      }
    },
    initialAffection: 30,
    specialAbility: '그림자 은신 - 회피율 +50%',
    backstory: [
      '빛과 어둠 사이에 존재하는 소녀',
      '과거의 저주로 인해 그림자가 되었다',
      '진정한 사랑만이 저주를 풀 수 있다'
    ]
  },
  {
    id: 'alice',
    name: '앨리스',
    title: '꿈의 여행자',
    description: '이상한 나라에서 온 호기심 많은 소녀',
    portrait: '🎩',
    unlockCondition: {
      type: 'quest',
      requirement: { quest: 'wonderland_mystery' }
    },
    initialAffection: 40,
    specialAbility: '원더랜드 - 랜덤 이벤트 확률 +100%',
    backstory: [
      '다른 차원에서 온 방문자',
      '토끼를 쫓다가 이 세계로 오게 되었다',
      '집으로 돌아가는 방법을 찾고 있다'
    ]
  },
  {
    id: 'phoenix',
    name: '피닉스',
    title: '불사조의 화신',
    description: '불꽃처럼 열정적인 전설의 소녀',
    portrait: '🔥',
    unlockCondition: {
      type: 'affection',
      requirement: {
        character: 'hikari',
        affection: 100,
        specialItem: 'phoenix_feather'
      }
    },
    initialAffection: 60,
    specialAbility: '불사 - 전투 패배 시 1회 부활',
    backstory: [
      '전설의 불사조가 인간의 모습으로 환생',
      '천 년마다 다시 태어나는 운명',
      '이번 생에서 진정한 사랑을 찾고자 한다'
    ]
  }
];

const hiddenItems: HiddenItem[] = [
  {
    id: 'eternal_flower',
    name: '영원의 꽃',
    description: '시들지 않는 신비로운 꽃',
    rarity: 'mythic',
    icon: '🌸',
    location: 'secret_garden',
    hint: '시간이 멈춘 곳에서 피어난다',
    effects: [
      { type: 'affection_boost', value: 20 },
      { type: 'immortality', value: 1 }
    ],
    lore: '신들의 정원에서만 피어나는 전설의 꽃. 이 꽃을 가진 자는 영원한 사랑을 얻는다고 한다.'
  },
  {
    id: 'dragon_heart',
    name: '용의 심장',
    description: '고대 용의 힘이 깃든 보석',
    rarity: 'legendary',
    icon: '🐉',
    location: 'dragon_lair',
    hint: '가장 강한 용을 쓰러뜨려야 한다',
    effects: [
      { type: 'attack_power', value: 100 },
      { type: 'fire_immunity', value: 1 }
    ],
    lore: '천년을 산 용의 심장. 엄청난 힘을 부여하지만, 사용자의 마음도 용처럼 변할 수 있다.'
  },
  {
    id: 'chronos_watch',
    name: '크로노스의 시계',
    description: '시간을 조작할 수 있는 고대 유물',
    rarity: 'unique',
    icon: '⌚',
    location: 'time_rift',
    hint: '시간의 균열에서만 발견된다',
    effects: [
      { type: 'time_control', value: 1 },
      { type: 'speed', value: 50 }
    ],
    lore: '시간의 신 크로노스가 만든 유일무이한 시계. 과거로 돌아가거나 시간을 멈출 수 있다.'
  },
  {
    id: 'soul_gem',
    name: '영혼의 보석',
    description: '영혼을 담을 수 있는 신비한 보석',
    rarity: 'mythic',
    icon: '💠',
    location: 'soul_altar',
    hint: '영혼의 제단에서 100개의 영혼을 바쳐야 한다',
    effects: [
      { type: 'resurrection', value: 1 },
      { type: 'soul_link', value: 1 }
    ],
    lore: '죽은 자를 되살릴 수 있는 금단의 보석. 하지만 대가 없는 부활은 없다.'
  },
  {
    id: 'void_blade',
    name: '허공의 검',
    description: '차원을 가르는 검',
    rarity: 'legendary',
    icon: '⚔️',
    location: 'dimension_rift',
    hint: '차원의 틈새에서 1000번째 적을 쓰러뜨려라',
    effects: [
      { type: 'dimension_slash', value: 1 },
      { type: 'critical_rate', value: 100 }
    ],
    lore: '공간 자체를 베어버리는 검. 이 검의 일격은 어떤 방어도 무시한다.'
  }
];

const secretCodes: SecretCode[] = [
  {
    id: 'konami',
    code: '↑↑↓↓←→←→BA',
    hint: '고전 게임의 전설적인 코드',
    reward: 'infinite_lives',
    used: false
  },
  {
    id: 'developer',
    code: 'DEVMODE2025',
    hint: '개발자만 아는 비밀',
    reward: 'debug_menu',
    used: false
  },
  {
    id: 'true_love',
    code: 'LOVE∞ETERNAL',
    hint: '진정한 사랑의 암호',
    reward: 'all_affection_max',
    used: false
  },
  {
    id: 'matrix',
    code: 'THEREISNOSP00N',
    hint: '현실은 환상일 뿐',
    reward: 'bullet_time',
    used: false
  }
];

const HiddenContent: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameStore();
  const [discoveredAreas, setDiscoveredAreas] = useState<string[]>([]);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([]);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'areas' | 'characters' | 'items' | 'codes'>('areas');
  const [codeInput, setCodeInput] = useState('');
  const [showHint, setShowHint] = useState<string | null>(null);
  const [puzzleMode, setPuzzleMode] = useState<any>(null);

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const loadDiscoveries = () => {
    const areas = localStorage.getItem('discoveredHiddenAreas');
    const chars = localStorage.getItem('unlockedHiddenCharacters');
    const items = localStorage.getItem('foundHiddenItems');
    const codes = localStorage.getItem('usedSecretCodes');

    if (areas) setDiscoveredAreas(JSON.parse(areas));
    if (chars) setUnlockedCharacters(JSON.parse(chars));
    if (items) setFoundItems(JSON.parse(items));
    if (codes) setUsedCodes(JSON.parse(codes));
  };

  const saveDiscovery = (type: string, id: string) => {
    switch (type) {
      case 'area':
        const newAreas = [...discoveredAreas, id];
        setDiscoveredAreas(newAreas);
        localStorage.setItem('discoveredHiddenAreas', JSON.stringify(newAreas));
        break;
      case 'character':
        const newChars = [...unlockedCharacters, id];
        setUnlockedCharacters(newChars);
        localStorage.setItem('unlockedHiddenCharacters', JSON.stringify(newChars));
        break;
      case 'item':
        const newItems = [...foundItems, id];
        setFoundItems(newItems);
        localStorage.setItem('foundHiddenItems', JSON.stringify(newItems));
        break;
      case 'code':
        const newCodes = [...usedCodes, id];
        setUsedCodes(newCodes);
        localStorage.setItem('usedSecretCodes', JSON.stringify(newCodes));
        break;
    }
  };

  const checkAreaUnlock = (area: HiddenArea): boolean => {
    const condition = area.unlockCondition;

    switch (condition.type) {
      case 'item':
        const item = gameState.inventory.find(i => i.id === condition.requirement.item);
        return item ? item.quantity >= condition.requirement.quantity : false;

      case 'achievement':
        return condition.requirement.achievements.every((ach: string) =>
          gameState.achievements?.includes(ach)
        );

      case 'puzzle':
        // Puzzle would be solved through puzzle mode
        return discoveredAreas.includes(area.id);

      case 'time':
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        return timeString === condition.requirement.realTime &&
               gameState.timeOfDay === condition.requirement.gameTime;

      case 'sequence':
        // Would need to track location visit sequence
        return false;

      default:
        return false;
    }
  };

  const attemptAreaUnlock = (area: HiddenArea) => {
    if (discoveredAreas.includes(area.id)) {
      alert('이미 발견한 지역입니다!');
      return;
    }

    if (area.unlockCondition.type === 'puzzle') {
      setPuzzleMode({
        area,
        puzzle: area.unlockCondition.requirement
      });
      return;
    }

    if (checkAreaUnlock(area)) {
      discoverArea(area);
    } else {
      alert('아직 조건을 충족하지 못했습니다.');
      setShowHint(area.id);
    }
  };

  const discoverArea = (area: HiddenArea) => {
    saveDiscovery('area', area.id);

    // Give rewards
    if (area.rewards.items) {
      area.rewards.items.forEach(item => {
        gameState.addToInventory(item.id, item.quantity);
      });
    }

    if (area.rewards.achievement) {
      // gameState.unlockAchievement(area.rewards.achievement);
    }

    if (area.rewards.characterUnlock) {
      saveDiscovery('character', area.rewards.characterUnlock);
    }

    alert(`🎉 ${area.name} 발견! 보상을 획득했습니다!`);
  };

  const checkCharacterUnlock = (character: HiddenCharacter): boolean => {
    const condition = character.unlockCondition;

    switch (condition.type) {
      case 'hidden_area':
        return discoveredAreas.includes(condition.requirement.area);

      case 'quest':
        return gameState.completedQuests?.includes(condition.requirement.quest) || false;

      case 'affection':
        const char = gameState.characterStates[condition.requirement.character];
        const hasItem = gameState.inventory.find(i => i.id === condition.requirement.specialItem);
        return char && char.affection >= condition.requirement.affection && !!hasItem;

      case 'special':
        // Special conditions would be checked elsewhere
        return unlockedCharacters.includes(character.id);

      default:
        return false;
    }
  };

  const attemptCharacterUnlock = (character: HiddenCharacter) => {
    if (unlockedCharacters.includes(character.id)) {
      alert('이미 해금한 캐릭터입니다!');
      return;
    }

    if (checkCharacterUnlock(character)) {
      saveDiscovery('character', character.id);

      // Add character to game state
      gameState.updateCharacterState(character.id, {
        name: character.name,
        affection: character.initialAffection,
        mood: 'neutral'
      });

      alert(`🎉 숨겨진 캐릭터 ${character.name} 해금!`);
    } else {
      alert('아직 조건을 충족하지 못했습니다.');
      setShowHint(character.id);
    }
  };

  const attemptCodeInput = () => {
    const code = secretCodes.find(c => c.code === codeInput.toUpperCase());

    if (!code) {
      alert('잘못된 코드입니다.');
      return;
    }

    if (usedCodes.includes(code.id)) {
      alert('이미 사용한 코드입니다.');
      return;
    }

    saveDiscovery('code', code.id);

    // Apply code reward
    switch (code.reward) {
      case 'infinite_lives':
        gameState.setLives?.(99999);
        break;
      case 'all_affection_max':
        Object.keys(gameState.characterStates).forEach(charId => {
          gameState.updateCharacterState(charId, { affection: 100 });
        });
        break;
      case 'debug_menu':
        gameState.setDebugMode?.(true);
        break;
      case 'bullet_time':
        gameState.setTimeScale?.(0.5);
        break;
    }

    alert(`✨ 비밀 코드 활성화! ${code.hint}`);
    setCodeInput('');
  };

  const solvePuzzle = (solution: string[]) => {
    if (!puzzleMode) return;

    const correctSolution = puzzleMode.puzzle.solution.join(',');
    const userSolution = solution.join(',');

    if (correctSolution === userSolution) {
      discoverArea(puzzleMode.area);
      setPuzzleMode(null);
    } else {
      alert('퍼즐이 틀렸습니다. 다시 시도해보세요.');
    }
  };

  const renderPuzzleMode = () => {
    if (!puzzleMode) return null;

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-purple-900 to-black rounded-xl max-w-2xl w-full p-8">
          <h2 className="text-3xl font-bold text-white mb-6">🧩 퍼즐을 풀어라!</h2>

          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <p className="text-white mb-4">달빛 퍼즐: 올바른 순서로 상징을 배열하세요</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {['moon', 'star', 'sun', 'cloud'].map(symbol => (
                <button
                  key={symbol}
                  className="p-4 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white text-2xl transition-all"
                  onClick={() => {/* Handle puzzle interaction */}}
                >
                  {symbol === 'moon' ? '🌙' :
                   symbol === 'star' ? '⭐' :
                   symbol === 'sun' ? '☀️' : '☁️'}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => solvePuzzle(['moon', 'star', 'sun', 'moon'])}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold mr-4"
              >
                제출
              </button>
              <button
                onClick={() => setPuzzleMode(null)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-purple-300 flex items-center gap-3">
            🔮 Hidden Content
          </h1>
          <button
            onClick={() => navigate('/game')}
            className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-white"
          >
            돌아가기
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {(['areas', 'characters', 'items', 'codes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
              }`}
            >
              {tab === 'areas' ? '🗺️ 숨겨진 지역' :
               tab === 'characters' ? '👤 비밀 캐릭터' :
               tab === 'items' ? '💎 전설 아이템' :
               '🔐 시크릿 코드'}
            </button>
          ))}
        </div>

        {/* Hidden Areas Tab */}
        {activeTab === 'areas' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiddenAreas.map(area => {
              const isDiscovered = discoveredAreas.includes(area.id);

              return (
                <div
                  key={area.id}
                  className={`relative rounded-xl p-6 transition-all transform hover:scale-105 ${
                    isDiscovered
                      ? 'bg-gradient-to-br from-purple-600/50 to-pink-600/50 border-2 border-purple-400'
                      : 'bg-gray-800/50 border-2 border-gray-700'
                  }`}
                >
                  {isDiscovered && (
                    <div className="absolute top-2 right-2 text-yellow-400">
                      ✨ Discovered
                    </div>
                  )}

                  <div className="text-4xl mb-3">{area.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isDiscovered ? area.name : '???'}
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    {isDiscovered ? area.description : '미지의 장소'}
                  </p>

                  {!isDiscovered && (
                    <button
                      onClick={() => attemptAreaUnlock(area)}
                      className="w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white"
                    >
                      탐험하기
                    </button>
                  )}

                  {showHint === area.id && !isDiscovered && (
                    <div className="mt-3 p-3 bg-yellow-900/30 rounded text-yellow-300 text-xs">
                      💡 힌트: {area.unlockCondition.type === 'item' ? '특별한 열쇠가 필요합니다' :
                              area.unlockCondition.type === 'puzzle' ? '퍼즐을 풀어야 합니다' :
                              area.unlockCondition.type === 'time' ? '특정 시간에만 열립니다' :
                              '특별한 조건이 필요합니다'}
                    </div>
                  )}

                  {isDiscovered && area.rewards && (
                    <div className="mt-4 p-3 bg-black/30 rounded">
                      <p className="text-xs text-purple-300 mb-2">획득 보상:</p>
                      <div className="flex flex-wrap gap-2">
                        {area.rewards.items?.map(item => (
                          <span key={item.id} className="text-xs bg-purple-600/30 px-2 py-1 rounded">
                            {item.id} x{item.quantity}
                          </span>
                        ))}
                        {area.rewards.achievement && (
                          <span className="text-xs bg-yellow-600/30 px-2 py-1 rounded">
                            🏆 {area.rewards.achievement}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden Characters Tab */}
        {activeTab === 'characters' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiddenCharacters.map(character => {
              const isUnlocked = unlockedCharacters.includes(character.id);

              return (
                <div
                  key={character.id}
                  className={`relative rounded-xl p-6 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-pink-600/50 to-purple-600/50 border-2 border-pink-400'
                      : 'bg-gray-800/50 border-2 border-gray-700'
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-2 right-2 text-yellow-400">
                      ⭐ Unlocked
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{character.portrait}</div>
                    <h3 className="text-xl font-bold text-white">
                      {isUnlocked ? character.name : '???'}
                    </h3>
                    <p className="text-purple-300 text-sm">
                      {isUnlocked ? character.title : '숨겨진 캐릭터'}
                    </p>
                  </div>

                  {isUnlocked && (
                    <>
                      <p className="text-white text-sm mb-3">{character.description}</p>
                      <div className="p-3 bg-black/30 rounded mb-3">
                        <p className="text-xs text-purple-300 mb-1">특수 능력:</p>
                        <p className="text-white text-sm">{character.specialAbility}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-pink-300">초기 호감도: {character.initialAffection}</span>
                        <button
                          onClick={() => navigate(`/character/${character.id}`)}
                          className="px-3 py-1 bg-pink-600/50 hover:bg-pink-600/70 rounded text-white text-sm"
                        >
                          만나기
                        </button>
                      </div>
                    </>
                  )}

                  {!isUnlocked && (
                    <button
                      onClick={() => attemptCharacterUnlock(character)}
                      className="w-full px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white"
                    >
                      해금 시도
                    </button>
                  )}

                  {showHint === character.id && !isUnlocked && (
                    <div className="mt-3 p-3 bg-yellow-900/30 rounded text-yellow-300 text-xs">
                      💡 힌트: 특별한 조건을 달성해야 합니다
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hidden Items Tab */}
        {activeTab === 'items' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiddenItems.map(item => {
              const isFound = foundItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-6 transition-all ${
                    isFound
                      ? `bg-gradient-to-br ${
                          item.rarity === 'mythic' ? 'from-red-600/50 to-orange-600/50' :
                          item.rarity === 'legendary' ? 'from-yellow-600/50 to-amber-600/50' :
                          'from-blue-600/50 to-cyan-600/50'
                        } border-2 ${
                          item.rarity === 'mythic' ? 'border-red-400' :
                          item.rarity === 'legendary' ? 'border-yellow-400' :
                          'border-blue-400'
                        }`
                      : 'bg-gray-800/50 border-2 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{item.icon}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.rarity === 'mythic' ? 'bg-red-900/50 text-red-300' :
                      item.rarity === 'legendary' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-blue-900/50 text-blue-300'
                    }`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {isFound ? item.name : '???'}
                  </h3>

                  {isFound ? (
                    <>
                      <p className="text-purple-200 text-sm mb-3">{item.description}</p>

                      <div className="p-3 bg-black/30 rounded mb-3">
                        <p className="text-xs text-purple-300 mb-2">효과:</p>
                        {item.effects.map((effect, idx) => (
                          <p key={idx} className="text-white text-sm">
                            • {effect.type}: +{effect.value}
                          </p>
                        ))}
                      </div>

                      <div className="p-3 bg-purple-900/30 rounded">
                        <p className="text-xs text-purple-300 mb-1">전설:</p>
                        <p className="text-white text-xs italic">{item.lore}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm mb-3">미발견 아이템</p>
                      <div className="p-3 bg-yellow-900/30 rounded">
                        <p className="text-yellow-300 text-xs">
                          💡 힌트: {item.hint}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Secret Codes Tab */}
        {activeTab === 'codes' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900/30 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">시크릿 코드 입력</h2>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="비밀 코드를 입력하세요..."
                  className="flex-1 px-4 py-3 bg-black/50 border border-purple-500 rounded-lg text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && attemptCodeInput()}
                />
                <button
                  onClick={attemptCodeInput}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold"
                >
                  입력
                </button>
              </div>

              <div className="text-center text-purple-300 text-sm">
                힌트: 특별한 조합이나 단어를 입력해보세요
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-3">발견한 코드</h3>

              {secretCodes.map(code => {
                const isUsed = usedCodes.includes(code.id);

                return (
                  <div
                    key={code.id}
                    className={`p-4 rounded-lg ${
                      isUsed
                        ? 'bg-green-900/30 border border-green-500'
                        : 'bg-gray-800/30 border border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">
                          {isUsed ? code.code : '???'}
                        </p>
                        <p className="text-purple-300 text-sm mt-1">
                          {code.hint}
                        </p>
                      </div>
                      {isUsed && (
                        <span className="text-green-400">✓ 사용됨</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-purple-300">
                사용한 코드: {usedCodes.length} / {secretCodes.length}
              </p>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div className="mt-8 bg-black/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">전체 진행도</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-purple-300">숨겨진 지역</p>
              <p className="text-white font-bold">
                {discoveredAreas.length} / {hiddenAreas.length}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">👤</div>
              <p className="text-purple-300">비밀 캐릭터</p>
              <p className="text-white font-bold">
                {unlockedCharacters.length} / {hiddenCharacters.length}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <p className="text-purple-300">전설 아이템</p>
              <p className="text-white font-bold">
                {foundItems.length} / {hiddenItems.length}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <p className="text-purple-300">시크릿 코드</p>
              <p className="text-white font-bold">
                {usedCodes.length} / {secretCodes.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000"
                style={{
                  width: `${((discoveredAreas.length + unlockedCharacters.length + foundItems.length + usedCodes.length) /
                    (hiddenAreas.length + hiddenCharacters.length + hiddenItems.length + secretCodes.length)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Render Puzzle Mode */}
      {renderPuzzleMode()}
    </div>
  );
};

export default HiddenContent;