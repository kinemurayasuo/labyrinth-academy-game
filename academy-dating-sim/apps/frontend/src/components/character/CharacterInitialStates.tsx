import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import VisualNovelDialog from '../ui/VisualNovelDialog';

interface MeetingScenario {
  id: string;
  characterId: string;
  title: string;
  description: string;
  location: string;
  dialogue: string[];
  initialAffection: number;
  initialState: {
    mood?: string;
    relationship?: string;
    specialFlag?: string;
  };
  choices: {
    text: string;
    affectionBonus: number;
    response: string;
    stateChange?: any;
  }[];
}

const CharacterInitialStates: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const player = useGameStore((state: any) => state.player);
  const { updateAffection, markCharacterAsMet } = useGameStore((state: any) => state.actions);
  const [currentScenario, setCurrentScenario] = useState<MeetingScenario | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [dialogueComplete, setDialogueComplete] = useState(false);

  // Meeting scenarios for each character
  const meetingScenarios: MeetingScenario[] = [
    // Sakura scenarios
    {
      id: 'sakura_training',
      characterId: 'sakura',
      title: '훈련장에서의 만남',
      description: '검술 훈련장에서 사쿠라를 처음 만나다',
      location: 'gym',
      dialogue: [
        '(훈련장에서 혼자 검술 연습을 하는 소녀를 발견한다)',
        '그녀의 움직임은 날카롭고 정확했다.',
        '???: "누구야? 훈련장에 허락 없이 들어오다니."',
        '(차가운 눈빛으로 당신을 바라본다)',
        '???: "나는 사쿠라. 검술부 부장이야."'
      ],
      initialAffection: 5,
      initialState: {
        mood: 'cautious',
        relationship: 'stranger',
        specialFlag: 'met_at_training'
      },
      choices: [
        {
          text: '미안, 구경하고 싶어서...',
          affectionBonus: 3,
          response: '사쿠라: "흥... 검술에 관심이 있는 건가?"',
          stateChange: { mood: 'curious' }
        },
        {
          text: '너의 검술이 인상적이야',
          affectionBonus: 5,
          response: '사쿠라: "...고맙다. 매일 연습한 결과야."',
          stateChange: { mood: 'pleased' }
        },
        {
          text: '나도 검술을 배우고 싶어',
          affectionBonus: 7,
          response: '사쿠라: "진심이라면... 가르쳐줄 수도 있어."',
          stateChange: { relationship: 'potential_student' }
        }
      ]
    },
    {
      id: 'sakura_accident',
      characterId: 'sakura',
      title: '우연한 충돌',
      description: '복도에서 사쿠라와 부딪히다',
      location: 'classroom',
      dialogue: [
        '(복도를 급히 걷다가 누군가와 부딪힌다)',
        '책들이 바닥에 흩어진다.',
        '???: "아! 조심해!"',
        '(붉은 머리의 소녀가 떨어진 책들을 줍는다)',
        '???: "나는 사쿠라... 너는?"'
      ],
      initialAffection: 0,
      initialState: {
        mood: 'annoyed',
        relationship: 'accident_meet'
      },
      choices: [
        {
          text: '미안해! 내가 도와줄게',
          affectionBonus: 5,
          response: '사쿠라: "...괜찮아. 고마워."',
          stateChange: { mood: 'neutral' }
        },
        {
          text: '다치지 않았어?',
          affectionBonus: 8,
          response: '사쿠라: "어... 난 괜찮아. 네가 나를 걱정해주다니."',
          stateChange: { mood: 'surprised', relationship: 'caring_stranger' }
        }
      ]
    },

    // Yuki scenarios
    {
      id: 'yuki_library',
      characterId: 'yuki',
      title: '도서관의 조용한 만남',
      description: '도서관에서 책을 읽는 유키를 만나다',
      location: 'library',
      dialogue: [
        '(도서관 구석에서 책에 몰두한 소녀를 본다)',
        '그녀 주변에는 마법 관련 서적들이 쌓여있다.',
        '(당신이 다가가자 그녀가 고개를 든다)',
        '???: "아... 안녕하세요..."',
        '???: "저는 유키예요. 도서부원이죠."'
      ],
      initialAffection: 3,
      initialState: {
        mood: 'shy',
        relationship: 'library_acquaintance'
      },
      choices: [
        {
          text: '무슨 책 읽고 있어?',
          affectionBonus: 4,
          response: '유키: "고대 마법에 관한 책이에요... 관심 있으세요?"',
          stateChange: { mood: 'hopeful' }
        },
        {
          text: '방해해서 미안',
          affectionBonus: 2,
          response: '유키: "아니에요... 가끔은 대화도 좋아요."',
          stateChange: { mood: 'gentle' }
        },
        {
          text: '같이 읽어도 될까?',
          affectionBonus: 6,
          response: '유키: "정말요? 기뻐요... 같이 읽어요."',
          stateChange: { relationship: 'reading_partner' }
        }
      ]
    },

    // Luna scenarios
    {
      id: 'luna_magic_show',
      characterId: 'luna',
      title: '마법 시연회',
      description: '루나의 화려한 마법 시연을 보다',
      location: 'classroom',
      dialogue: [
        '(강당에서 화려한 마법 시연이 펼쳐지고 있다)',
        '빛나는 마법진과 함께 환상적인 광경이 펼쳐진다.',
        '???: "어때? 멋지지?"',
        '(밝은 미소의 소녀가 당신에게 다가온다)',
        '???: "나는 루나! 마법학부 수석이야!"'
      ],
      initialAffection: 5,
      initialState: {
        mood: 'excited',
        relationship: 'impressed_viewer',
        specialFlag: 'saw_magic_show'
      },
      choices: [
        {
          text: '정말 대단해!',
          affectionBonus: 5,
          response: '루나: "헤헤, 고마워! 더 보여줄까?"',
          stateChange: { mood: 'happy' }
        },
        {
          text: '나도 마법을 배울 수 있을까?',
          affectionBonus: 7,
          response: '루나: "물론이지! 내가 가르쳐줄게!"',
          stateChange: { relationship: 'magic_student' }
        }
      ]
    },

    // Haruka scenarios
    {
      id: 'haruka_welcome',
      characterId: 'haruka',
      title: '활기찬 환영',
      description: '하루카가 신입생인 당신을 환영하다',
      location: 'classroom',
      dialogue: [
        '(교실에 들어서자 밝은 목소리가 들린다)',
        '???: "아! 신입생이구나!"',
        '(해바라기처럼 밝은 미소의 소녀가 다가온다)',
        '???: "나는 하루카! 반가워!"',
        '하루카: "학교 안내해줄까? 재미있는 곳이 많아!"'
      ],
      initialAffection: 10,
      initialState: {
        mood: 'cheerful',
        relationship: 'friendly_guide'
      },
      choices: [
        {
          text: '고마워! 부탁할게',
          affectionBonus: 5,
          response: '하루카: "좋아! 가자가자! 재미있을 거야!"',
          stateChange: { relationship: 'tour_guide' }
        },
        {
          text: '너 정말 친절하구나',
          affectionBonus: 7,
          response: '하루카: "에헤헤~ 칭찬 고마워!"',
          stateChange: { mood: 'delighted' }
        }
      ]
    },

    // Miku scenarios
    {
      id: 'miku_concert',
      characterId: 'miku',
      title: '작은 콘서트',
      description: '미쿠의 노래를 우연히 듣다',
      location: 'classroom',
      dialogue: [
        '(음악실에서 아름다운 노랫소리가 들린다)',
        '문틈으로 보니 한 소녀가 노래하고 있다.',
        '(노래가 끝나고 그녀가 당신을 발견한다)',
        '???: "어머! 듣고 있었어요?"',
        '???: "저는 미쿠... 부끄럽네요."'
      ],
      initialAffection: 4,
      initialState: {
        mood: 'embarrassed',
        relationship: 'secret_listener'
      },
      choices: [
        {
          text: '목소리가 정말 아름다워',
          affectionBonus: 8,
          response: '미쿠: "정말요? 너무 기뻐요!"',
          stateChange: { mood: 'happy' }
        },
        {
          text: '미안, 몰래 들어서',
          affectionBonus: 3,
          response: '미쿠: "괜찮아요. 누군가 들어주니 좋아요."',
          stateChange: { mood: 'understanding' }
        },
        {
          text: '다음에도 들을 수 있을까?',
          affectionBonus: 6,
          response: '미쿠: "네! 언제든지 와요!"',
          stateChange: { relationship: 'regular_listener' }
        }
      ]
    },

    // Rina scenarios
    {
      id: 'rina_sparring',
      characterId: 'rina',
      title: '스파링 제안',
      description: '리나가 대련을 제안하다',
      location: 'gym',
      dialogue: [
        '(훈련장에서 격렬하게 운동하는 소녀를 본다)',
        '???: "오! 너도 훈련하러 왔어?"',
        '(에너지 넘치는 소녀가 다가온다)',
        '???: "나는 리나! 한판 붙어볼래?"'
      ],
      initialAffection: 5,
      initialState: {
        mood: 'energetic',
        relationship: 'sparring_partner'
      },
      choices: [
        {
          text: '좋아! 한판 해보자',
          affectionBonus: 8,
          response: '리나: "그래! 이런 근성 좋아!"',
          stateChange: { relationship: 'rival' }
        },
        {
          text: '난 초보인데...',
          affectionBonus: 4,
          response: '리나: "괜찮아! 내가 가르쳐줄게!"',
          stateChange: { relationship: 'trainer' }
        }
      ]
    },

    // Ayumi scenarios
    {
      id: 'ayumi_fortune',
      characterId: 'ayumi',
      title: '운명의 점술',
      description: '아유미가 당신의 운명을 점치다',
      location: 'classroom',
      dialogue: [
        '(점술 동아리 방 앞을 지나가는데)',
        '???: "기다려요."',
        '(신비로운 분위기의 소녀가 문을 열고 있다)',
        '???: "당신... 특별한 운명을 가지고 있네요."',
        '???: "저는 아유미. 당신의 미래가 궁금해요."'
      ],
      initialAffection: 6,
      initialState: {
        mood: 'mysterious',
        relationship: 'fated_meeting',
        specialFlag: 'destiny_revealed'
      },
      choices: [
        {
          text: '내 운명이 뭔데?',
          affectionBonus: 5,
          response: '아유미: "사랑... 여러 갈래의 사랑이 보여요."',
          stateChange: { mood: 'prophetic' }
        },
        {
          text: '운명은 스스로 만드는 거야',
          affectionBonus: 7,
          response: '아유미: "흥미로운 생각이에요... 당신이 더 궁금해져요."',
          stateChange: { mood: 'intrigued' }
        }
      ]
    }
  ];

  // Load scenario based on URL params
  useEffect(() => {
    const characterId = searchParams.get('character');
    const location = searchParams.get('location');

    if (characterId && location) {
      // Find matching scenario
      const scenario = meetingScenarios.find(
        s => s.characterId === characterId && s.location === location
      );

      if (scenario) {
        setCurrentScenario(scenario);
        setDialogueIndex(0);
      } else {
        // Create a default scenario if none found
        const defaultScenario: MeetingScenario = {
          id: `${characterId}_default`,
          characterId,
          title: '우연한 만남',
          description: '처음 만나는 순간',
          location,
          dialogue: [
            '(처음 보는 얼굴이다)',
            '???: "안녕하세요?"',
            `???: "저는 ${characterId}예요."`
          ],
          initialAffection: 5,
          initialState: { mood: 'neutral', relationship: 'just_met' },
          choices: [
            {
              text: '반가워요',
              affectionBonus: 3,
              response: '좋은 첫인상을 남겼다.',
              stateChange: { mood: 'friendly' }
            },
            {
              text: '잘 부탁해요',
              affectionBonus: 2,
              response: '평범한 인사를 나눴다.',
              stateChange: { mood: 'neutral' }
            }
          ]
        };
        setCurrentScenario(defaultScenario);
        setDialogueIndex(0);
      }
    }
  }, [searchParams]);

  // Get available meeting scenarios
  const getAvailableScenarios = () => {
    return meetingScenarios.filter(scenario => {
      // Check if character hasn't been met yet
      if (metCharacters.has(scenario.characterId)) return false;

      // Check if player has 0 affection with this character
      if ((player.affection[scenario.characterId] || 0) > 0) return false;

      // Check location match
      if (scenario.location !== player.location) return false;

      return true;
    });
  };

  // Start a meeting scenario
  const startScenario = (scenario: MeetingScenario) => {
    setCurrentScenario(scenario);
    setDialogueIndex(0);
    setShowChoices(false);
    setDialogueComplete(false);
  };

  // Handle dialogue progression
  const handleNextDialogue = () => {
    if (!currentScenario) return;

    if (dialogueIndex < currentScenario.dialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else if (!showChoices) {
      setShowChoices(true);
    }
  };

  // Handle choice selection
  const handleChoice = (choiceIndex: number) => {
    if (!currentScenario || dialogueComplete) return;

    const choice = currentScenario.choices[choiceIndex];
    if (!choice) return;

    // Apply initial affection + bonus
    const totalAffection = currentScenario.initialAffection + choice.affectionBonus;
    updateAffection(currentScenario.characterId, totalAffection);

    // Save character initial state
    const characterStates = JSON.parse(localStorage.getItem('characterStates') || '{}');
    characterStates[currentScenario.characterId] = {
      ...currentScenario.initialState,
      ...choice.stateChange,
      meetingScenario: currentScenario.id,
      firstChoice: choice.text
    };
    localStorage.setItem('characterStates', JSON.stringify(characterStates));

    // Mark character as met in store
    markCharacterAsMet(currentScenario.characterId);

    // Show response and complete
    setDialogueComplete(true);

    // Return to game after short delay
    setTimeout(() => {
      navigate('/game');
    }, 2000);
  };

  // Remove the location change effect as we're handling it differently now

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Loading...</h2>
          <p className="text-text-secondary">캐릭터 만남 시나리오를 준비 중입니다...</p>
        </div>
      </div>
    );
  }

  // Format choices for VisualNovelDialog
  const dialogChoices = showChoices ? currentScenario.choices.map((choice, index) => ({
    text: choice.text,
    callback: () => handleChoice(index)
  })) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <VisualNovelDialog
        character={currentScenario.characterId}
        dialogue={currentScenario.dialogue}
        onNext={handleNextDialogue}
        choices={dialogChoices}
        showSpeaker={false}
      />
      {dialogueComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              ✨ {currentScenario.characterId}와(과) 만났습니다!
            </div>
            <div className="text-lg text-gray-200">
              호감도가 상승했습니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterInitialStates;