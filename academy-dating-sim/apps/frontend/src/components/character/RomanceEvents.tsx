import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';

interface EventChoice {
  text: string;
  affectionChange: number;
  response: string;
  flag?: string;
  unlocks?: string;
}

interface RomanceEvent {
  id: string;
  characterId: string;
  name: string;
  icon: string;
  requiredAffection: number;
  requiredFlags?: string[];
  excludeFlags?: string[];
  location?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  description: string;
  dialogue: string[];
  choices: EventChoice[];
  cg?: string;
  bgm?: string;
  rewards?: {
    items?: { id: string; quantity: number }[];
    achievement?: string;
    memory?: string;
    title?: string;
  };
  isRepeatable?: boolean;
  priority?: number;
}

const romanceEvents: RomanceEvent[] = [
  // Sakura Romance Events
  {
    id: 'sakura_first_date',
    characterId: 'sakura',
    name: '첫 데이트',
    icon: '💕',
    requiredAffection: 30,
    location: 'park',
    timeOfDay: 'afternoon',
    season: 'spring',
    description: '사쿠라와의 첫 공식 데이트',
    dialogue: [
      '사쿠라가 수줍게 웃으며 당신에게 다가옵니다.',
      '"오늘... 날씨가 정말 좋네. 같이 산책할래?"',
      '벚꽃이 흩날리는 공원을 함께 걷습니다.',
      '"있잖아... 너와 이렇게 있으니까 정말 행복해."'
    ],
    choices: [
      {
        text: '나도 정말 행복해',
        affectionChange: 10,
        response: '사쿠라의 얼굴이 붉게 물들며 당신의 손을 살짝 잡습니다.',
        flag: 'sakura_held_hands'
      },
      {
        text: '벚꽃이 정말 예쁘네',
        affectionChange: 5,
        response: '"응... 하지만 난 네가 더 좋아." 사쿠라가 속삭입니다.'
      },
      {
        text: '배고픈데 뭐 먹으러 갈까?',
        affectionChange: -5,
        response: '"아... 그래, 그럼 카페라도 가자." 사쿠라가 조금 실망한 듯 합니다.'
      }
    ],
    rewards: {
      memory: 'sakura_first_date_memory',
      achievement: 'first_date'
    },
    priority: 10
  },
  {
    id: 'sakura_confession',
    characterId: 'sakura',
    name: '벚꽃 아래의 고백',
    icon: '🌸',
    requiredAffection: 70,
    requiredFlags: ['sakura_held_hands'],
    location: 'school_rooftop',
    timeOfDay: 'evening',
    season: 'spring',
    description: '사쿠라가 중요한 이야기가 있다며 옥상으로 불렀습니다',
    dialogue: [
      '석양이 지는 옥상, 사쿠라가 긴장한 표정으로 서 있습니다.',
      '"저기... 오늘 불러낸 이유는..."',
      '사쿠라가 심호흡을 하고 당신을 똑바로 바라봅니다.',
      '"나... 나는 네가 좋아! 정말 많이 좋아해!"',
      '"처음 만났을 때부터 계속... 네 생각뿐이었어."'
    ],
    choices: [
      {
        text: '나도 사쿠라를 사랑해',
        affectionChange: 20,
        response: '사쿠라가 눈물을 글썽이며 당신에게 안깁니다. "정말... 정말 고마워!"',
        flag: 'sakura_lovers',
        unlocks: 'sakura_true_route'
      },
      {
        text: '좀 더 시간이 필요해',
        affectionChange: 0,
        response: '"알았어... 기다릴게. 네 마음이 준비될 때까지." 사쿠라가 씁쓸하게 웃습니다.',
        flag: 'sakura_pending'
      },
      {
        text: '미안, 친구로 남자',
        affectionChange: -30,
        response: '사쿠라의 눈에서 눈물이 흘러내립니다. "그래... 이해해. 미안해..."',
        flag: 'sakura_rejected'
      }
    ],
    rewards: {
      achievement: 'love_confession',
      title: '사쿠라의 연인'
    },
    cg: 'sakura_confession_cg',
    bgm: 'romantic_theme',
    priority: 20
  },

  // Yuki Romance Events
  {
    id: 'yuki_library_encounter',
    characterId: 'yuki',
    name: '도서관의 만남',
    icon: '📚',
    requiredAffection: 25,
    location: 'library',
    timeOfDay: 'evening',
    description: '늦은 시간 도서관에서 유키를 발견했습니다',
    dialogue: [
      '조용한 도서관, 유키가 책 더미에 파묻혀 있습니다.',
      '"어? 너도 이런 시간에 도서관에?"',
      '유키가 살짝 미소를 지으며 옆자리를 가리킵니다.',
      '"같이 공부할래? 혼자보다는... 나을 것 같아서."'
    ],
    choices: [
      {
        text: '좋아, 같이 공부하자',
        affectionChange: 8,
        response: '유키가 만족스럽게 미소 짓습니다. "고마워. 네가 있으니 집중이 더 잘 되네."',
        flag: 'yuki_study_buddy'
      },
      {
        text: '뭘 읽고 있어?',
        affectionChange: 10,
        response: '"고전 문학이야. 너도 관심 있어?" 유키가 열정적으로 책에 대해 설명합니다.',
        flag: 'yuki_book_interest'
      },
      {
        text: '나는 그냥 지나가던 중이었어',
        affectionChange: -3,
        response: '"아... 그렇구나." 유키가 다시 책으로 시선을 돌립니다.'
      }
    ],
    rewards: {
      items: [{ id: 'bookmark', quantity: 1 }],
      memory: 'yuki_library_memory'
    },
    isRepeatable: false,
    priority: 8
  },
  {
    id: 'yuki_snow_walk',
    characterId: 'yuki',
    name: '눈 오는 날의 산책',
    icon: '❄️',
    requiredAffection: 60,
    requiredFlags: ['yuki_study_buddy'],
    season: 'winter',
    timeOfDay: 'evening',
    description: '유키가 눈 오는 날 산책을 제안했습니다',
    dialogue: [
      '하얀 눈이 소복이 내리는 저녁, 유키가 당신 곁을 걷습니다.',
      '"눈... 정말 좋아해. 모든 게 조용하고 평화로워져."',
      '유키가 장갑 낀 손으로 눈을 받아봅니다.',
      '"너도... 이런 고요함이 좋아?"',
      '갑자기 유키가 당신을 바라봅니다.',
      '"있잖아... 너와 있으면 차가운 겨울도 따뜻하게 느껴져."'
    ],
    choices: [
      {
        text: '손을 잡아준다',
        affectionChange: 15,
        response: '유키가 놀라면서도 당신의 손을 꼭 잡습니다. "따뜻해... 고마워."',
        flag: 'yuki_held_hands',
        unlocks: 'yuki_romance_route'
      },
      {
        text: '목도리를 둘러준다',
        affectionChange: 12,
        response: '"어... 고마워." 유키의 뺨이 붉게 물듭니다. "네 냄새가 나... 좋아."',
        flag: 'yuki_scarf_given'
      },
      {
        text: '추우니까 들어가자',
        affectionChange: -5,
        response: '"벌써...? 그래, 알았어." 유키가 아쉬운 표정을 짓습니다.'
      }
    ],
    rewards: {
      achievement: 'winter_romance',
      memory: 'yuki_snow_walk_memory'
    },
    cg: 'yuki_snow_scene',
    bgm: 'winter_melody',
    priority: 15
  },

  // Hikari Romance Events
  {
    id: 'hikari_sports_festival',
    characterId: 'hikari',
    name: '체육대회의 영웅',
    icon: '🏃‍♀️',
    requiredAffection: 20,
    location: 'sports_field',
    timeOfDay: 'afternoon',
    season: 'autumn',
    description: '체육대회에서 히카리가 당신을 파트너로 선택했습니다',
    dialogue: [
      '"야! 너 나랑 2인 3각 할래?" 히카리가 활짝 웃으며 다가옵니다.',
      '"우리가 함께하면 무조건 1등이야!"',
      '경기가 시작되고, 히카리와 호흡을 맞춰 달립니다.',
      '"잘하고 있어! 조금만 더!"'
    ],
    choices: [
      {
        text: '전력을 다해 달린다',
        affectionChange: 10,
        response: '"우와! 우리가 1등이야! 역시 너야!" 히카리가 기뻐하며 당신을 안습니다.',
        flag: 'hikari_sports_win'
      },
      {
        text: '히카리의 페이스에 맞춘다',
        affectionChange: 7,
        response: '"고마워! 네가 맞춰줘서 편했어!" 히카리가 감사하게 웃습니다.'
      },
      {
        text: '넘어진다',
        affectionChange: 5,
        response: '"괜찮아? 다치지 않았어?" 히카리가 걱정스럽게 당신을 일으킵니다.',
        flag: 'hikari_cared'
      }
    ],
    rewards: {
      items: [{ id: 'sports_medal', quantity: 1 }],
      achievement: 'sports_partner'
    },
    priority: 7
  },
  {
    id: 'hikari_training_together',
    characterId: 'hikari',
    name: '특별 훈련',
    icon: '💪',
    requiredAffection: 50,
    requiredFlags: ['hikari_sports_win'],
    location: 'training_ground',
    timeOfDay: 'morning',
    description: '히카리가 특별 훈련을 제안했습니다',
    dialogue: [
      '이른 아침, 훈련장에 히카리가 기다리고 있습니다.',
      '"왔구나! 오늘은 특별한 훈련을 준비했어!"',
      '격렬한 훈련 후, 두 사람은 땀을 흘리며 쉬고 있습니다.',
      '"너... 정말 강해졌네. 처음 봤을 때보다 훨씬."',
      '히카리가 갑자기 진지한 표정으로 당신을 봅니다.',
      '"있잖아... 나는 강한 사람을 좋아해. 특히... 너처럼."'
    ],
    choices: [
      {
        text: '나도 히카리가 좋아',
        affectionChange: 18,
        response: '히카리의 얼굴이 새빨개집니다. "정... 정말? 그럼 우리... 연인?"',
        flag: 'hikari_confession',
        unlocks: 'hikari_romance_route'
      },
      {
        text: '좋은 훈련 파트너야',
        affectionChange: 5,
        response: '"그래... 파트너. 응, 좋아!" 히카리가 조금 실망한 듯하지만 밝게 웃습니다.'
      },
      {
        text: '갑자기 무슨 소리야?',
        affectionChange: -10,
        response: '"아... 아무것도 아니야! 그냥 잊어!" 히카리가 당황하며 도망갑니다.',
        flag: 'hikari_embarrassed'
      }
    ],
    rewards: {
      achievement: 'training_bond',
      title: '히카리의 파트너'
    },
    cg: 'hikari_training_cg',
    priority: 12
  },

  // Luna Romance Events
  {
    id: 'luna_moonlight_magic',
    characterId: 'luna',
    name: '달빛의 마법',
    icon: '🌙',
    requiredAffection: 35,
    location: 'magic_tower',
    timeOfDay: 'night',
    description: '루나가 특별한 마법을 보여주겠다고 했습니다',
    dialogue: [
      '달이 밝은 밤, 마법 탑 꼭대기에 루나가 서 있습니다.',
      '"와줬구나. 오늘 보름달이라 특별한 마법을 보여주고 싶었어."',
      '루나가 주문을 외우자 주변에 환상적인 빛이 춤춥니다.',
      '"어때? 이건 너에게만 보여주는 특별한 마법이야."'
    ],
    choices: [
      {
        text: '정말 아름다워',
        affectionChange: 12,
        response: '"후후, 네가 좋아해줘서 기뻐." 루나가 신비롭게 미소 짓습니다.',
        flag: 'luna_magic_appreciation'
      },
      {
        text: '나도 마법을 배우고 싶어',
        affectionChange: 10,
        response: '"정말? 그럼 내가 가르쳐줄게. 특별히 너에게만." 루나가 당신의 손을 잡습니다.',
        flag: 'luna_magic_student'
      },
      {
        text: '위험하지 않아?',
        affectionChange: -2,
        response: '"걱정하지 마. 내가 완벽하게 통제하고 있어." 루나가 조금 서운해 보입니다.'
      }
    ],
    rewards: {
      items: [{ id: 'moon_charm', quantity: 1 }],
      memory: 'luna_moonlight_memory'
    },
    cg: 'luna_magic_scene',
    bgm: 'mystical_night',
    priority: 9
  },
  {
    id: 'luna_stargazing',
    characterId: 'luna',
    name: '별이 빛나는 밤에',
    icon: '⭐',
    requiredAffection: 65,
    requiredFlags: ['luna_magic_appreciation'],
    location: 'observatory',
    timeOfDay: 'night',
    season: 'summer',
    description: '루나가 천문대에서 기다리고 있습니다',
    dialogue: [
      '천문대에서 루나와 함께 별을 보고 있습니다.',
      '"저 별자리 보여? 그게 내가 제일 좋아하는 별자리야."',
      '"전설에 따르면, 저 별자리 아래서 사랑을 고백하면 이루어진대."',
      '루나가 당신을 향해 돌아봅니다.',
      '"나... 너에게 하고 싶은 말이 있어."',
      '"너를 만나고부터 내 세계가 더 밝아졌어. 너는 내 별이야."'
    ],
    choices: [
      {
        text: '키스한다',
        affectionChange: 25,
        response: '루나가 놀라면서도 키스를 받아들입니다. "나... 너를 사랑해."',
        flag: 'luna_first_kiss',
        unlocks: 'luna_true_route'
      },
      {
        text: '루나도 나의 별이야',
        affectionChange: 20,
        response: '"정말...? 그럼 우리는 서로의 별인 거네." 루나가 행복하게 웃습니다.',
        flag: 'luna_mutual_love'
      },
      {
        text: '별이 정말 예쁘다',
        affectionChange: 0,
        response: '"그래... 별이 예쁘네." 루나가 씁쓸하게 웃으며 하늘을 봅니다.'
      }
    ],
    rewards: {
      achievement: 'star_crossed_lovers',
      title: '별의 연인',
      memory: 'luna_confession_memory'
    },
    cg: 'luna_stargazing_cg',
    bgm: 'romantic_stars',
    priority: 18
  },

  // Aria Romance Events
  {
    id: 'aria_music_lesson',
    characterId: 'aria',
    name: '음악 레슨',
    icon: '🎵',
    requiredAffection: 30,
    location: 'music_room',
    timeOfDay: 'afternoon',
    description: '아리아가 음악을 가르쳐주겠다고 제안했습니다',
    dialogue: [
      '음악실에서 아리아가 피아노 앞에 앉아 있습니다.',
      '"와줬네! 오늘은 특별히 너에게 피아노를 가르쳐주고 싶어."',
      '아리아가 당신 옆에 앉아 손의 위치를 잡아줍니다.',
      '"이렇게... 부드럽게. 음악은 마음으로 연주하는 거야."'
    ],
    choices: [
      {
        text: '손이 닿는 게 설렌다',
        affectionChange: 12,
        response: '아리아가 살짝 붉어지며 "나... 나도야." 하고 속삭입니다.',
        flag: 'aria_hand_touch'
      },
      {
        text: '열심히 배운다',
        affectionChange: 8,
        response: '"잘하고 있어! 재능이 있는 것 같아!" 아리아가 칭찬합니다.'
      },
      {
        text: '음악은 어려워',
        affectionChange: -3,
        response: '"괜찮아, 천천히 하자." 아리아가 격려하지만 조금 실망한 듯합니다.'
      }
    ],
    rewards: {
      items: [{ id: 'music_sheet', quantity: 1 }],
      memory: 'aria_lesson_memory'
    },
    priority: 8
  },
  {
    id: 'aria_concert',
    characterId: 'aria',
    name: '너를 위한 연주회',
    icon: '🎹',
    requiredAffection: 75,
    requiredFlags: ['aria_hand_touch'],
    location: 'concert_hall',
    timeOfDay: 'evening',
    description: '아리아가 특별한 연주회에 초대했습니다',
    dialogue: [
      '텅 빈 콘서트홀, 아리아가 무대 위에서 당신을 바라봅니다.',
      '"오늘은... 너만을 위한 연주회야."',
      '아리아가 피아노를 연주하기 시작합니다. 감동적인 멜로디가 홀을 채웁니다.',
      '연주가 끝나고 아리아가 당신에게 다가옵니다.',
      '"이 곡은... 너를 생각하며 작곡한 거야. 제목은 \'나의 사랑\'이야."'
    ],
    choices: [
      {
        text: '나도 아리아를 사랑해',
        affectionChange: 25,
        response: '아리아가 눈물을 글썽이며 당신을 꼭 안습니다. "드디어... 기다렸어!"',
        flag: 'aria_lovers',
        unlocks: 'aria_true_route'
      },
      {
        text: '감동적이야, 고마워',
        affectionChange: 10,
        response: '"네가 좋아해줘서 다행이야." 아리아가 수줍게 웃습니다.'
      },
      {
        text: '부담스러워',
        affectionChange: -20,
        response: '아리아의 표정이 어두워집니다. "미... 미안. 내가 너무 앞서갔구나..."',
        flag: 'aria_rejected'
      }
    ],
    rewards: {
      achievement: 'melody_of_love',
      title: '음악의 뮤즈',
      items: [{ id: 'love_song_cd', quantity: 1 }]
    },
    cg: 'aria_concert_cg',
    bgm: 'aria_love_theme',
    priority: 20
  },

  // Special Cross-Character Events
  {
    id: 'beach_episode',
    characterId: 'all',
    name: '여름 해변 이벤트',
    icon: '🏖️',
    requiredAffection: 40,
    season: 'summer',
    location: 'beach',
    description: '모두와 함께 해변으로 놀러왔습니다',
    dialogue: [
      '여름 해변, 모든 히로인들이 수영복을 입고 있습니다.',
      '"와! 바다다!" 히카리가 신나게 뛰어다닙니다.',
      '"자외선 조심해야 해..." 유키가 그늘을 찾습니다.',
      '"모래성 만들래?" 사쿠라가 제안합니다.',
      '"수박 게임하자!" 루나가 수박을 들고 옵니다.'
    ],
    choices: [
      {
        text: '히카리와 비치발리볼',
        affectionChange: 8,
        response: '히카리와 신나게 비치발리볼을 즐깁니다.',
        flag: 'beach_hikari'
      },
      {
        text: '유키와 파라솔 아래서',
        affectionChange: 8,
        response: '유키와 조용히 책을 읽으며 시간을 보냅니다.',
        flag: 'beach_yuki'
      },
      {
        text: '모두와 함께 물놀이',
        affectionChange: 5,
        response: '모두와 함께 즐거운 시간을 보냅니다.',
        flag: 'beach_all'
      }
    ],
    rewards: {
      memory: 'summer_beach_memory',
      achievement: 'beach_episode',
      items: [{ id: 'beach_photo', quantity: 1 }]
    },
    cg: 'beach_episode_cg',
    isRepeatable: false,
    priority: 15
  },
  {
    id: 'festival_fireworks',
    characterId: 'all',
    name: '축제의 불꽃',
    icon: '🎆',
    requiredAffection: 50,
    season: 'summer',
    location: 'festival',
    timeOfDay: 'night',
    description: '여름 축제에서 불꽃놀이를 보러 왔습니다',
    dialogue: [
      '축제 현장, 모두가 유카타를 입고 있습니다.',
      '"불꽃놀이 곧 시작한대!" 사쿠라가 설렙니다.',
      '"어떤 히로인과 함께 불꽃놀이를 볼까요?"'
    ],
    choices: [
      {
        text: '사쿠라와 함께',
        affectionChange: 10,
        response: '사쿠라와 손을 잡고 불꽃놀이를 봅니다. "최고의 여름이야..."',
        flag: 'fireworks_sakura'
      },
      {
        text: '유키와 함께',
        affectionChange: 10,
        response: '유키가 조용히 당신 어깨에 기댑니다. "이런 순간이 영원했으면..."',
        flag: 'fireworks_yuki'
      },
      {
        text: '혼자 본다',
        affectionChange: -5,
        response: '혼자 불꽃놀이를 보니 조금 쓸쓸합니다.',
        flag: 'fireworks_alone'
      }
    ],
    rewards: {
      memory: 'festival_memory',
      achievement: 'summer_festival'
    },
    cg: 'fireworks_cg',
    bgm: 'festival_theme',
    priority: 14
  },

  // Hidden/Secret Romance Events
  {
    id: 'midnight_encounter',
    characterId: 'mystery',
    name: '한밤의 만남',
    icon: '🌌',
    requiredAffection: 80,
    requiredFlags: ['explored_hidden_area'],
    location: 'secret_garden',
    timeOfDay: 'night',
    description: '비밀의 정원에서 누군가를 만났습니다',
    dialogue: [
      '달빛이 비치는 비밀의 정원, 신비로운 소녀가 서 있습니다.',
      '"드디어 왔구나... 기다리고 있었어."',
      '"나는 이 학교의 비밀을 지키는 자... 하지만 너에겐 특별히 보여주고 싶어."',
      '"나와 함께 가겠어? 아무도 모르는 곳으로..."'
    ],
    choices: [
      {
        text: '함께 간다',
        affectionChange: 20,
        response: '신비로운 소녀가 미소 지으며 당신의 손을 잡습니다. 새로운 이야기가 시작됩니다.',
        flag: 'mystery_route_start',
        unlocks: 'hidden_character_route'
      },
      {
        text: '정체를 묻는다',
        affectionChange: 5,
        response: '"때가 되면 알게 될 거야. 지금은... 그저 나를 믿어줘."',
        flag: 'mystery_curious'
      },
      {
        text: '거절한다',
        affectionChange: -10,
        response: '"그래... 아직은 때가 아닌가 보네." 소녀가 사라집니다.',
        flag: 'mystery_declined'
      }
    ],
    rewards: {
      achievement: 'hidden_encounter',
      memory: 'mystery_meeting',
      title: '비밀의 수호자'
    },
    cg: 'mystery_garden_cg',
    bgm: 'mysterious_theme',
    priority: 25
  }
];

const RomanceEvents: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameStore();
  const [currentEvent, setCurrentEvent] = useState<RomanceEvent | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<RomanceEvent[]>([]);
  const [eventGallery, setEventGallery] = useState<string[]>([]);
  const [choiceResult, setChoiceResult] = useState<string | null>(null);

  useEffect(() => {
    loadCompletedEvents();
    checkAvailableEvents();
  }, [gameState.characterStates]);

  const loadCompletedEvents = () => {
    const saved = localStorage.getItem('completedRomanceEvents');
    if (saved) {
      setCompletedEvents(JSON.parse(saved));
    }

    const gallery = localStorage.getItem('eventGallery');
    if (gallery) {
      setEventGallery(JSON.parse(gallery));
    }
  };

  const saveCompletedEvent = (eventId: string) => {
    const updated = [...completedEvents, eventId];
    setCompletedEvents(updated);
    localStorage.setItem('completedRomanceEvents', JSON.stringify(updated));
  };

  const saveToGallery = (cg: string) => {
    const updated = [...new Set([...eventGallery, cg])];
    setEventGallery(updated);
    localStorage.setItem('eventGallery', JSON.stringify(updated));
  };

  const checkEventConditions = (event: RomanceEvent): boolean => {
    // Check if already completed and not repeatable
    if (completedEvents.includes(event.id) && !event.isRepeatable) {
      return false;
    }

    // Check affection requirement
    if (event.characterId === 'all' || event.characterId === 'mystery') {
      // For special events, check max affection
      const maxAffection = Math.max(
        ...Object.values(gameState.characterStates).map(c => c.affection || 0)
      );
      if (maxAffection < event.requiredAffection) return false;
    } else {
      const character = gameState.characterStates[event.characterId];
      if (!character || (character.affection || 0) < event.requiredAffection) {
        return false;
      }
    }

    // Check required flags
    if (event.requiredFlags) {
      const flags = gameState.eventFlags || [];
      if (!event.requiredFlags.every(flag => flags.includes(flag))) {
        return false;
      }
    }

    // Check excluded flags
    if (event.excludeFlags) {
      const flags = gameState.eventFlags || [];
      if (event.excludeFlags.some(flag => flags.includes(flag))) {
        return false;
      }
    }

    // Check location
    if (event.location && gameState.currentLocation !== event.location) {
      return false;
    }

    // Check time of day
    if (event.timeOfDay && gameState.timeOfDay !== event.timeOfDay) {
      return false;
    }

    // Check season
    if (event.season && gameState.season !== event.season) {
      return false;
    }

    return true;
  };

  const checkAvailableEvents = () => {
    const available = romanceEvents
      .filter(checkEventConditions)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    setAvailableEvents(available);
  };

  const startEvent = (event: RomanceEvent) => {
    setCurrentEvent(event);
    setDialogueIndex(0);
    setShowChoices(false);
    setChoiceResult(null);

    // Play BGM if specified
    if (event.bgm) {
      // gameState.playMusic(event.bgm);
    }
  };

  const handleNextDialogue = () => {
    if (!currentEvent) return;

    if (choiceResult) {
      // Show choice result then complete event
      completeEvent();
      return;
    }

    if (dialogueIndex < currentEvent.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setShowChoices(true);
    }
  };

  const handleChoice = (choice: EventChoice) => {
    if (!currentEvent) return;

    // Apply affection change
    if (currentEvent.characterId === 'all') {
      // Apply to all characters
      Object.keys(gameState.characterStates).forEach(charId => {
        gameState.updateCharacterState(charId, {
          affection: Math.min(100, (gameState.characterStates[charId].affection || 0) + choice.affectionChange)
        });
      });
    } else if (currentEvent.characterId !== 'mystery') {
      gameState.updateCharacterState(currentEvent.characterId, {
        affection: Math.min(100, (gameState.characterStates[currentEvent.characterId].affection || 0) + choice.affectionChange)
      });
    }

    // Set flag if specified
    if (choice.flag) {
      const flags = gameState.eventFlags || [];
      gameState.setEventFlags?.([...flags, choice.flag]);
    }

    // Unlock content if specified
    if (choice.unlocks) {
      // Handle unlock logic
      console.log('Unlocked:', choice.unlocks);
    }

    setChoiceResult(choice.response);
  };

  const completeEvent = () => {
    if (!currentEvent) return;

    // Save completed event
    if (!currentEvent.isRepeatable) {
      saveCompletedEvent(currentEvent.id);
    }

    // Save CG to gallery
    if (currentEvent.cg) {
      saveToGallery(currentEvent.cg);
    }

    // Give rewards
    if (currentEvent.rewards) {
      if (currentEvent.rewards.items) {
        currentEvent.rewards.items.forEach(item => {
          gameState.addToInventory(item.id, item.quantity);
        });
      }

      if (currentEvent.rewards.achievement) {
        // gameState.unlockAchievement(currentEvent.rewards.achievement);
      }

      if (currentEvent.rewards.memory) {
        const memories = gameState.memories || [];
        gameState.setMemories?.([...memories, currentEvent.rewards.memory]);
      }

      if (currentEvent.rewards.title) {
        const titles = gameState.unlockedTitles || [];
        gameState.setUnlockedTitles?.([...titles, currentEvent.rewards.title]);
      }
    }

    // Reset event state
    setCurrentEvent(null);
    setDialogueIndex(0);
    setShowChoices(false);
    setChoiceResult(null);

    // Refresh available events
    checkAvailableEvents();
  };

  const renderEvent = () => {
    if (!currentEvent) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-pink-900/90 to-purple-900/90 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Event Header */}
          <div className="bg-black/30 p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentEvent.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentEvent.name}</h2>
                  <p className="text-pink-200 text-sm">{currentEvent.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Content */}
          <div className="p-6">
            {currentEvent.cg && (
              <div className="mb-4 rounded-lg overflow-hidden bg-black/20 p-2">
                <div className="aspect-video bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded flex items-center justify-center">
                  <span className="text-white/50 text-lg">[CG: {currentEvent.cg}]</span>
                </div>
              </div>
            )}

            {/* Dialogue */}
            {!showChoices && !choiceResult && (
              <div className="bg-black/30 rounded-lg p-6 mb-4">
                <p className="text-white text-lg leading-relaxed">
                  {currentEvent.dialogue[dialogueIndex]}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-white/50 text-sm">
                    {dialogueIndex + 1} / {currentEvent.dialogue.length}
                  </span>
                  <button
                    onClick={handleNextDialogue}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    다음 ▶
                  </button>
                </div>
              </div>
            )}

            {/* Choice Result */}
            {choiceResult && (
              <div className="bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-lg p-6 mb-4">
                <p className="text-white text-lg italic">{choiceResult}</p>
                <div className="mt-4 text-right">
                  <button
                    onClick={completeEvent}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
                  >
                    계속하기
                  </button>
                </div>
              </div>
            )}

            {/* Choices */}
            {showChoices && !choiceResult && (
              <div className="space-y-3">
                <p className="text-white/80 text-center mb-4">어떻게 반응할까요?</p>
                {currentEvent.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 rounded-lg text-white text-left transition-all transform hover:scale-[1.02] border border-white/20"
                  >
                    <div className="flex justify-between items-center">
                      <span>{choice.text}</span>
                      <span className={`text-sm ${
                        choice.affectionChange > 0 ? 'text-pink-300' :
                        choice.affectionChange < 0 ? 'text-red-300' :
                        'text-gray-300'
                      }`}>
                        {choice.affectionChange > 0 && '+'}
                        {choice.affectionChange !== 0 && `${choice.affectionChange} ❤️`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            💕 Romance Events
          </h1>
          <button
            onClick={() => navigate('/game')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white"
          >
            돌아가기
          </button>
        </div>

        {/* Available Events */}
        <div className="bg-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Available Events</h2>

          {availableEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableEvents.slice(0, 6).map(event => (
                <button
                  key={event.id}
                  onClick={() => startEvent(event)}
                  className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 p-4 rounded-lg text-left transition-all transform hover:scale-105 border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{event.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <p className="text-sm text-pink-200 mt-1">{event.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-pink-500/30 rounded text-pink-200">
                          {event.requiredAffection} ❤️
                        </span>
                        {event.season && (
                          <span className="px-2 py-1 bg-blue-500/30 rounded text-blue-200">
                            {event.season}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">
              현재 이용 가능한 이벤트가 없습니다. 캐릭터 호감도를 올리거나 특정 조건을 달성해보세요!
            </p>
          )}
        </div>

        {/* Event Gallery */}
        <div className="bg-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Event Gallery</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {completedEvents.map(eventId => {
              const event = romanceEvents.find(e => e.id === eventId);
              if (!event) return null;

              return (
                <div
                  key={eventId}
                  className="bg-black/30 rounded-lg p-3 border border-white/20"
                >
                  <div className="text-center">
                    <span className="text-2xl">{event.icon}</span>
                    <p className="text-sm text-white mt-2">{event.name}</p>
                    <p className="text-xs text-pink-200 mt-1">
                      {event.characterId === 'all' ? '전체' : event.characterId}
                    </p>
                  </div>
                </div>
              );
            })}

            {completedEvents.length === 0 && (
              <div className="col-span-full text-center text-white/40 py-8">
                아직 완료한 이벤트가 없습니다
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-white/60">
              Completed: {completedEvents.length} / {romanceEvents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Render current event */}
      {renderEvent()}
    </div>
  );
};

export default RomanceEvents;