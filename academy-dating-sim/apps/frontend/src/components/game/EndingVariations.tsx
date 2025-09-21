import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';

interface EndingCondition {
  type: 'affection' | 'achievement' | 'item' | 'quest' | 'stat';
  target?: string;
  value: number;
  comparison: 'greater' | 'less' | 'equal';
}

interface EndingVariation {
  id: string;
  name: string;
  type: 'true' | 'normal' | 'bad' | 'secret' | 'friendship';
  priority: number;
  conditions: EndingCondition[];
  characterId?: string;
  title: string;
  description: string[];
  epilogue: string[];
  image?: string;
  unlockables?: {
    achievements?: string[];
    titles?: string[];
    costumes?: string[];
    gallery?: string[];
  };
  bgm?: string;
  specialEffects?: string[];
}

const endingVariations: EndingVariation[] = [
  // True Endings (캐릭터별 진엔딩)
  {
    id: 'sakura_true',
    name: '벚꽃의 약속',
    type: 'true',
    priority: 10,
    characterId: 'sakura',
    conditions: [
      { type: 'affection', target: 'sakura', value: 100, comparison: 'greater' },
      { type: 'quest', target: 'sakura_final', value: 1, comparison: 'equal' },
      { type: 'item', target: 'promise_ring', value: 1, comparison: 'greater' }
    ],
    title: '영원한 벚꽃',
    description: [
      '벚꽃이 만개한 봄날, 사쿠라와 함께 언덕 위에 서 있습니다.',
      '\"처음 만났을 때를 기억해? 이 벚꽃나무 아래서...\"',
      '사쿠라가 수줍게 미소 지으며 당신의 손을 잡습니다.',
      '\"이제 우리의 약속을 지킬 때가 왔네. 영원히 함께하자.\"'
    ],
    epilogue: [
      '몇 년 후, 당신과 사쿠라는 같은 벚꽃나무 아래서 결혼식을 올립니다.',
      '매년 봄, 두 사람은 이곳으로 돌아와 첫 만남을 기념합니다.',
      '벚꽃 꽃잎이 춤추는 가운데, 영원한 사랑을 약속합니다.'
    ],
    unlockables: {
      achievements: ['true_love_sakura', 'perfect_ending'],
      titles: ['벚꽃의 연인', '영원한 약속'],
      costumes: ['wedding_dress_sakura', 'tuxedo'],
      gallery: ['sakura_wedding', 'sakura_epilogue']
    },
    bgm: 'sakura_true_ending',
    specialEffects: ['sakura_petals', 'golden_light']
  },
  {
    id: 'yuki_true',
    name: '겨울의 온기',
    type: 'true',
    priority: 10,
    characterId: 'yuki',
    conditions: [
      { type: 'affection', target: 'yuki', value: 100, comparison: 'greater' },
      { type: 'quest', target: 'yuki_final', value: 1, comparison: 'equal' },
      { type: 'achievement', target: 'ice_queen_heart', value: 1, comparison: 'equal' }
    ],
    title: '녹아내린 얼음',
    description: [
      '겨울밤, 유키가 당신을 도서관 옥상으로 이끕니다.',
      '\"난 항상 혼자였어... 하지만 네가 내 마음을 녹여줬어.\"',
      '별이 빛나는 하늘 아래, 유키가 처음으로 진심을 털어놓습니다.',
      '\"이제 더 이상 추위를 두려워하지 않아. 네가 있으니까.\"'
    ],
    epilogue: [
      '유키는 베스트셀러 작가가 되었고, 당신은 그녀의 첫 독자입니다.',
      '두 사람은 조용한 서재에서 함께 책을 읽으며 시간을 보냅니다.',
      '차가웠던 그녀의 마음은 이제 당신을 향한 따뜻한 사랑으로 가득합니다.'
    ],
    unlockables: {
      achievements: ['true_love_yuki', 'melted_heart'],
      titles: ['얼음공주의 기사', '따뜻한 겨울'],
      costumes: ['winter_formal_yuki', 'winter_coat'],
      gallery: ['yuki_confession', 'yuki_epilogue']
    },
    bgm: 'yuki_true_ending',
    specialEffects: ['snow_fall', 'aurora']
  },

  // Normal Endings
  {
    id: 'normal_sakura',
    name: '봄의 추억',
    type: 'normal',
    priority: 5,
    characterId: 'sakura',
    conditions: [
      { type: 'affection', target: 'sakura', value: 70, comparison: 'greater' },
      { type: 'affection', target: 'sakura', value: 100, comparison: 'less' }
    ],
    title: '좋은 친구',
    description: [
      '졸업식 날, 사쿠라와 함께 교정을 걷습니다.',
      '\"우리 좋은 친구로 남자. 앞으로도 연락하면서 지내자!\"',
      '사쿠라가 밝게 웃으며 손을 흔듭니다.',
      '아쉬움이 남지만, 소중한 추억을 간직하게 되었습니다.'
    ],
    epilogue: [
      '졸업 후에도 가끔 만나며 우정을 이어갑니다.',
      '각자의 길을 걸어가지만, 학창시절의 추억은 영원합니다.'
    ],
    unlockables: {
      achievements: ['normal_ending_sakura'],
      titles: ['사쿠라의 친구'],
      gallery: ['sakura_normal_ending']
    },
    bgm: 'graduation_theme'
  },

  // Bad Endings
  {
    id: 'bad_general',
    name: '외로운 졸업',
    type: 'bad',
    priority: 1,
    conditions: [
      { type: 'stat', target: 'max_affection', value: 30, comparison: 'less' }
    ],
    title: '혼자만의 길',
    description: [
      '졸업식 날, 당신은 혼자 교문을 나섭니다.',
      '아무도 작별 인사를 하러 오지 않았습니다.',
      '학창시절은 그저 스쳐 지나간 시간일 뿐...',
      '쓸쓸한 발걸음으로 학교를 떠납니다.'
    ],
    epilogue: [
      '가끔 학창시절을 떠올리지만, 특별한 추억은 없습니다.',
      '그저 평범한 일상으로 돌아갑니다.'
    ],
    unlockables: {
      achievements: ['lonely_ending'],
      titles: ['고독한 늑대']
    },
    bgm: 'sad_theme'
  },

  // Secret Endings
  {
    id: 'harem_ending',
    name: '모두의 사랑',
    type: 'secret',
    priority: 15,
    conditions: [
      { type: 'affection', target: 'sakura', value: 80, comparison: 'greater' },
      { type: 'affection', target: 'yuki', value: 80, comparison: 'greater' },
      { type: 'affection', target: 'hikari', value: 80, comparison: 'greater' },
      { type: 'affection', target: 'luna', value: 80, comparison: 'greater' },
      { type: 'achievement', target: 'popular_guy', value: 1, comparison: 'equal' }
    ],
    title: '인기남의 고민',
    description: [
      '졸업 파티에서 모든 히로인들이 당신을 둘러쌉니다.',
      '\"우리 모두 네가 좋아!\" 그들이 동시에 외칩니다.',
      '당신은 행복한 비명을 지르며 도망칩니다.',
      '\"잠깐! 나 아직 결정 못했다고!\"'
    ],
    epilogue: [
      '결국 모두와 좋은 친구로 남기로 했습니다.',
      '매주 다른 사람과 데이트를 즐기는 행복한(?) 나날들...',
      '하지만 언젠가는 선택해야 할 날이 올 것입니다.'
    ],
    unlockables: {
      achievements: ['harem_master', 'popular_ending'],
      titles: ['하렘왕', '모두의 친구'],
      gallery: ['harem_ending_cg']
    },
    bgm: 'comedy_theme',
    specialEffects: ['heart_explosion', 'rainbow']
  },
  {
    id: 'villain_ending',
    name: '어둠의 지배자',
    type: 'secret',
    priority: 20,
    conditions: [
      { type: 'achievement', target: 'defeat_all_bosses', value: 1, comparison: 'equal' },
      { type: 'item', target: 'dark_crown', value: 1, comparison: 'greater' },
      { type: 'stat', target: 'dark_points', value: 100, comparison: 'greater' }
    ],
    title: '새로운 마왕',
    description: [
      '최종 보스를 쓰러뜨린 당신은 어둠의 왕관을 손에 넣습니다.',
      '\"이제 내가 새로운 지배자다!\"',
      '모든 던전이 당신의 명령에 복종합니다.',
      '아카데미는 이제 당신의 왕국입니다.'
    ],
    epilogue: [
      '마왕이 된 당신은 의외로 자비로운 통치자가 됩니다.',
      '던전과 인간이 공존하는 새로운 시대를 열었습니다.',
      '히로인들은 당신의 충실한 기사가 되었습니다.'
    ],
    unlockables: {
      achievements: ['dark_lord', 'villain_ending'],
      titles: ['어둠의 군주', '자비로운 마왕'],
      costumes: ['dark_armor', 'demon_wings'],
      gallery: ['villain_coronation', 'dark_kingdom']
    },
    bgm: 'epic_villain_theme',
    specialEffects: ['dark_aura', 'lightning']
  },

  // Friendship Endings
  {
    id: 'friendship_all',
    name: '영원한 우정',
    type: 'friendship',
    priority: 7,
    conditions: [
      { type: 'affection', target: 'sakura', value: 50, comparison: 'greater' },
      { type: 'affection', target: 'yuki', value: 50, comparison: 'greater' },
      { type: 'affection', target: 'hikari', value: 50, comparison: 'greater' },
      { type: 'affection', target: 'luna', value: 50, comparison: 'greater' },
      { type: 'affection', target: 'max', value: 70, comparison: 'less' }
    ],
    title: '최고의 친구들',
    description: [
      '졸업식 후, 모두가 모여 파티를 엽니다.',
      '\"우리 평생 친구하자!\" 다같이 건배를 외칩니다.',
      '연애는 안 됐지만, 최고의 친구들을 얻었습니다.',
      '이것도 나름 행복한 결말입니다.'
    ],
    epilogue: [
      '10년 후, 모두 각자의 분야에서 성공했습니다.',
      '매년 동창회에서 만나 추억을 나눕니다.',
      '우정은 영원합니다.'
    ],
    unlockables: {
      achievements: ['friendship_forever'],
      titles: ['모두의 친구', '우정의 챔피언'],
      gallery: ['friendship_party']
    },
    bgm: 'friendship_theme'
  }
];

const EndingVariations: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameStore();
  const [currentEnding, setCurrentEnding] = useState<EndingVariation | null>(null);
  const [displayPhase, setDisplayPhase] = useState<'intro' | 'main' | 'epilogue' | 'credits'>('intro');
  const [textIndex, setTextIndex] = useState(0);
  const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);
  const [showEndingList, setShowEndingList] = useState(false);

  useEffect(() => {
    determineEnding();
    loadUnlockedEndings();
  }, []);

  const loadUnlockedEndings = () => {
    const saved = localStorage.getItem('unlockedEndings');
    if (saved) {
      setUnlockedEndings(JSON.parse(saved));
    }
  };

  const saveUnlockedEnding = (endingId: string) => {
    const updated = [...new Set([...unlockedEndings, endingId])];
    setUnlockedEndings(updated);
    localStorage.setItem('unlockedEndings', JSON.stringify(updated));
  };

  const checkCondition = (condition: EndingCondition): boolean => {
    switch (condition.type) {
      case 'affection':
        if (condition.target === 'max') {
          const maxAffection = Math.max(
            ...Object.values(gameState.characterStates).map(c => c.affection)
          );
          return compareValue(maxAffection, condition.value, condition.comparison);
        }
        if (condition.target === 'max_affection') {
          const maxAffection = Math.max(
            ...Object.values(gameState.characterStates).map(c => c.affection)
          );
          return compareValue(maxAffection, condition.value, condition.comparison);
        }
        const character = gameState.characterStates[condition.target!];
        return character ? compareValue(character.affection, condition.value, condition.comparison) : false;

      case 'achievement':
        const hasAchievement = gameState.achievements?.includes(condition.target!) || false;
        return condition.comparison === 'equal' ? hasAchievement : !hasAchievement;

      case 'item':
        const itemCount = gameState.inventory.find(i => i.id === condition.target)?.quantity || 0;
        return compareValue(itemCount, condition.value, condition.comparison);

      case 'quest':
        const questCompleted = gameState.completedQuests?.includes(condition.target!) ? 1 : 0;
        return compareValue(questCompleted, condition.value, condition.comparison);

      case 'stat':
        if (condition.target === 'dark_points') {
          return compareValue(gameState.darkPoints || 0, condition.value, condition.comparison);
        }
        if (condition.target === 'max_affection') {
          const maxAffection = Math.max(
            ...Object.values(gameState.characterStates).map(c => c.affection)
          );
          return compareValue(maxAffection, condition.value, condition.comparison);
        }
        return false;

      default:
        return false;
    }
  };

  const compareValue = (actual: number, expected: number, comparison: string): boolean => {
    switch (comparison) {
      case 'greater': return actual >= expected;
      case 'less': return actual < expected;
      case 'equal': return actual === expected;
      default: return false;
    }
  };

  const determineEnding = () => {
    const possibleEndings = endingVariations
      .filter(ending => ending.conditions.every(checkCondition))
      .sort((a, b) => b.priority - a.priority);

    const selectedEnding = possibleEndings[0] || endingVariations.find(e => e.id === 'bad_general')!;

    setCurrentEnding(selectedEnding);
    saveUnlockedEnding(selectedEnding.id);

    // Unlock rewards
    if (selectedEnding.unlockables) {
      // Save unlocked rewards to game state
      if (selectedEnding.unlockables.achievements) {
        gameState.unlockAchievements?.(selectedEnding.unlockables.achievements);
      }
    }
  };

  const handleNextText = () => {
    if (!currentEnding) return;

    switch (displayPhase) {
      case 'intro':
        setDisplayPhase('main');
        setTextIndex(0);
        break;

      case 'main':
        if (textIndex < currentEnding.description.length - 1) {
          setTextIndex(textIndex + 1);
        } else {
          setDisplayPhase('epilogue');
          setTextIndex(0);
        }
        break;

      case 'epilogue':
        if (textIndex < currentEnding.epilogue.length - 1) {
          setTextIndex(textIndex + 1);
        } else {
          setDisplayPhase('credits');
        }
        break;

      case 'credits':
        setShowEndingList(true);
        break;
    }
  };

  const handleRestart = () => {
    gameState.resetGame();
    navigate('/');
  };

  const handleNewGamePlus = () => {
    // Keep some progress for new game+
    const keepData = {
      unlockedEndings,
      achievements: gameState.achievements,
      gallery: gameState.gallery
    };

    localStorage.setItem('newGamePlusData', JSON.stringify(keepData));
    gameState.resetGame();
    navigate('/character-creation');
  };

  const getEndingTypeColor = (type: string) => {
    switch (type) {
      case 'true': return 'text-yellow-400 bg-yellow-900/20';
      case 'normal': return 'text-blue-400 bg-blue-900/20';
      case 'bad': return 'text-red-400 bg-red-900/20';
      case 'secret': return 'text-purple-400 bg-purple-900/20';
      case 'friendship': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const renderSpecialEffects = () => {
    if (!currentEnding?.specialEffects) return null;

    return currentEnding.specialEffects.map(effect => {
      switch (effect) {
        case 'sakura_petals':
          return (
            <div key={effect} className="fixed inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${10 + Math.random() * 10}s`
                  }}
                >
                  🌸
                </div>
              ))}
            </div>
          );

        case 'snow_fall':
          return (
            <div key={effect} className="fixed inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${5 + Math.random() * 5}s`
                  }}
                >
                  ❄️
                </div>
              ))}
            </div>
          );

        case 'golden_light':
          return (
            <div key={effect} className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 to-transparent animate-pulse" />
            </div>
          );

        default:
          return null;
      }
    });
  };

  if (showEndingList) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">엔딩 컬렉션</h1>

          <div className="grid gap-4 mb-8">
            {endingVariations.map(ending => {
              const isUnlocked = unlockedEndings.includes(ending.id);
              return (
                <div
                  key={ending.id}
                  className={`p-4 rounded-lg border-2 ${
                    isUnlocked
                      ? `${getEndingTypeColor(ending.type)} border-current`
                      : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {isUnlocked ? ending.name : '???'}
                      </h3>
                      <p className="text-sm opacity-75">
                        {isUnlocked ? ending.title : '아직 보지 못한 엔딩'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      getEndingTypeColor(ending.type)
                    }`}>
                      {ending.type.toUpperCase()}
                    </span>
                  </div>

                  {isUnlocked && ending.unlockables && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {ending.unlockables.achievements?.map(ach => (
                        <span key={ach} className="text-xs bg-yellow-900/30 px-2 py-1 rounded">
                          🏆 {ach}
                        </span>
                      ))}
                      {ending.unlockables.titles?.map(title => (
                        <span key={title} className="text-xs bg-blue-900/30 px-2 py-1 rounded">
                          📜 {title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg mb-4">
              달성률: {unlockedEndings.length} / {endingVariations.length} (
              {Math.round((unlockedEndings.length / endingVariations.length) * 100)}%)
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                새 게임 시작
              </button>

              {unlockedEndings.length > 0 && (
                <button
                  onClick={handleNewGamePlus}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
                >
                  뉴 게임+ 시작
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
              >
                메인 메뉴
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEnding) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {renderSpecialEffects()}

      <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
        <div className="max-w-3xl w-full">
          {displayPhase === 'intro' && (
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl font-bold mb-4">ENDING</h1>
              <h2 className={`text-3xl mb-8 ${getEndingTypeColor(currentEnding.type)}`}>
                {currentEnding.name}
              </h2>
              <button
                onClick={handleNextText}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                계속하기
              </button>
            </div>
          )}

          {displayPhase === 'main' && (
            <div className="bg-black/50 backdrop-blur p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{currentEnding.title}</h2>
              <p className="text-lg leading-relaxed mb-6">
                {currentEnding.description[textIndex]}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-50">
                  {textIndex + 1} / {currentEnding.description.length}
                </span>
                <button
                  onClick={handleNextText}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
                >
                  다음 ▶
                </button>
              </div>
            </div>
          )}

          {displayPhase === 'epilogue' && (
            <div className="bg-black/50 backdrop-blur p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">에필로그</h2>
              <p className="text-lg leading-relaxed mb-6 italic">
                {currentEnding.epilogue[textIndex]}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-50">
                  {textIndex + 1} / {currentEnding.epilogue.length}
                </span>
                <button
                  onClick={handleNextText}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
                >
                  다음 ▶
                </button>
              </div>
            </div>
          )}

          {displayPhase === 'credits' && (
            <div className="text-center animate-fade-in">
              <h2 className="text-4xl font-bold mb-8">The End</h2>

              {currentEnding.unlockables && (
                <div className="mb-8 space-y-4">
                  <h3 className="text-xl font-semibold mb-4">🎁 획득한 보상</h3>

                  {currentEnding.unlockables.achievements && (
                    <div>
                      <p className="text-sm opacity-75 mb-2">업적</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {currentEnding.unlockables.achievements.map(ach => (
                          <span key={ach} className="px-3 py-1 bg-yellow-900/30 rounded">
                            🏆 {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentEnding.unlockables.titles && (
                    <div>
                      <p className="text-sm opacity-75 mb-2">칭호</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {currentEnding.unlockables.titles.map(title => (
                          <span key={title} className="px-3 py-1 bg-blue-900/30 rounded">
                            📜 {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentEnding.unlockables.costumes && (
                    <div>
                      <p className="text-sm opacity-75 mb-2">코스튬</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {currentEnding.unlockables.costumes.map(costume => (
                          <span key={costume} className="px-3 py-1 bg-purple-900/30 rounded">
                            👗 {costume}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleNextText}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-lg font-semibold"
              >
                엔딩 컬렉션 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndingVariations;