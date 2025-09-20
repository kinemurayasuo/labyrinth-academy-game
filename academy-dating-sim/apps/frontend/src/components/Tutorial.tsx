import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  image?: string;
  highlightElement?: string;
  action?: () => void;
}

const Tutorial: React.FC<{ onComplete: () => void; onSkip: () => void }> = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "라비린스 아카데미에 오신 것을 환영합니다!",
      content: "이곳은 마법과 로맨스가 공존하는 특별한 학원입니다. 당신의 선택이 운명을 결정합니다.",
      image: "🏫"
    },
    {
      id: 2,
      title: "캐릭터 생성",
      content: "먼저 당신의 캐릭터를 만들어보세요. 이름, 성별, 외모를 선택하고 시작 스탯을 설정할 수 있습니다.",
      image: "👤",
      highlightElement: ".character-creation"
    },
    {
      id: 3,
      title: "스탯 시스템",
      content: "체력(HP), 마나(MP), 힘, 지능, 매력, 운 등 다양한 스탯이 있습니다. 각 스탯은 게임 플레이에 영향을 줍니다.",
      image: "📊"
    },
    {
      id: 4,
      title: "히로인과의 만남",
      content: "5명의 매력적인 히로인이 당신을 기다리고 있습니다. 각자 고유한 성격과 스토리를 가지고 있죠.",
      image: "💕"
    },
    {
      id: 5,
      title: "호감도 시스템",
      content: "대화, 선물, 데이트를 통해 히로인들과의 호감도를 올릴 수 있습니다. 높은 호감도는 특별한 이벤트를 열어줍니다.",
      image: "❤️"
    },
    {
      id: 6,
      title: "일정 관리",
      content: "매일 아침, 점심, 저녁으로 나뉘어 있습니다. 각 시간대에 다양한 활동을 선택할 수 있습니다.",
      image: "📅"
    },
    {
      id: 7,
      title: "수업 참여",
      content: "수업에 참여하여 스탯을 올리고 새로운 스킬을 배울 수 있습니다. 집중도에 따라 효과가 달라집니다.",
      image: "📚"
    },
    {
      id: 8,
      title: "던전 탐험",
      content: "학원 지하에는 신비한 던전이 있습니다. 몬스터를 물리치고 보물을 찾아보세요!",
      image: "⚔️",
      highlightElement: ".dungeon-button"
    },
    {
      id: 9,
      title: "전투 시스템",
      content: "턴제 전투 시스템으로 전략적인 전투를 즐길 수 있습니다. 스킬을 적절히 사용하여 승리하세요.",
      image: "🗡️"
    },
    {
      id: 10,
      title: "상점",
      content: "골드로 아이템을 구매할 수 있습니다. 선물, 장비, 소비 아이템 등 다양한 상품이 준비되어 있습니다.",
      image: "🏪",
      highlightElement: ".shop-button"
    },
    {
      id: 11,
      title: "미니게임",
      content: "카드 매칭, 퀴즈 등 다양한 미니게임을 즐길 수 있습니다. 보상도 받을 수 있어요!",
      image: "🎮"
    },
    {
      id: 12,
      title: "엔딩",
      content: "당신의 선택에 따라 다양한 엔딩을 볼 수 있습니다. 각 히로인과의 특별한 엔딩도 준비되어 있습니다.",
      image: "🎊"
    },
    {
      id: 13,
      title: "저장 & 불러오기",
      content: "언제든지 게임을 저장하고 나중에 이어서 플레이할 수 있습니다. 자동 저장 기능도 있습니다.",
      image: "💾"
    },
    {
      id: 14,
      title: "팁",
      content: "• 매일 히로인과 대화하세요\n• 스탯을 균형있게 올리세요\n• 던전에서 레벨업을 잊지 마세요\n• 이벤트를 놓치지 마세요",
      image: "💡"
    },
    {
      id: 15,
      title: "모험을 시작하세요!",
      content: "이제 라비린스 아카데미에서의 모험을 시작할 준비가 되었습니다. 행운을 빕니다!",
      image: "🚀",
      action: () => {
        onComplete();
        navigate('/character-creation');
      }
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      tutorialSteps[currentStep].action?.();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const skipTutorial = () => {
    if (window.confirm('튜토리얼을 건너뛰시겠습니까? 나중에 설정에서 다시 볼 수 있습니다.')) {
      onSkip();
      navigate('/character-creation');
    }
  };

  useEffect(() => {
    // Highlight element if specified
    const step = tutorialSteps[currentStep];
    if (step.highlightElement) {
      const element = document.querySelector(step.highlightElement);
      if (element) {
        element.classList.add('tutorial-highlight');
        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className={`p-8 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {/* Step Counter */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-gray-500">
              단계 {currentStep + 1} / {tutorialSteps.length}
            </span>
            <button
              onClick={skipTutorial}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              건너뛰기
            </button>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            {tutorialSteps[currentStep].image && (
              <div className="text-6xl mb-6 animate-bounce">
                {tutorialSteps[currentStep].image}
              </div>
            )}
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {tutorialSteps[currentStep].title}
            </h2>
            <p className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">
              {tutorialSteps[currentStep].content}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              이전
            </button>

            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${index === currentStep
                      ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                      : index < currentStep
                      ? 'bg-purple-300 cursor-pointer hover:bg-purple-400'
                      : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              {currentStep === tutorialSteps.length - 1 ? '시작하기' : '다음'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 20px 9999px rgba(0, 0, 0, 0.3);
          }
          100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default Tutorial;