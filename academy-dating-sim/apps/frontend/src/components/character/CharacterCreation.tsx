import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import CharacterPortrait from './CharacterPortrait';

interface CharacterCreationData {
  playerName: string;
  startingStats: {
    intelligence: number;
    charm: number;
    stamina: number;
    strength: number;
    agility: number;
    luck: number;
  };
}

interface CharacterCreationProps {
  onCancel?: () => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const { resetGame } = useGameStore((state: any) => state.actions);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CharacterCreationData>({
    playerName: '',
    startingStats: {
      intelligence: 10,
      charm: 10,
      stamina: 10,
      strength: 10,
      agility: 10,
      luck: 10,
    },
  });

  const totalStatPoints = Object.values(formData.startingStats).reduce((sum, stat) => sum + stat, 0);
  const maxStatPoints = 80;
  const remainingPoints = maxStatPoints - totalStatPoints;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatChange = (stat: string, value: number) => {
    const newValue = Math.max(5, Math.min(20, value));
    const currentTotal = Object.values(formData.startingStats).reduce((sum, s) => sum + s, 0);
    const otherStats = currentTotal - formData.startingStats[stat as keyof typeof formData.startingStats];

    if (otherStats + newValue <= maxStatPoints) {
      setFormData(prev => ({
        ...prev,
        startingStats: {
          ...prev.startingStats,
          [stat]: newValue,
        },
      }));
    }
  };

  const startIncrement = (stat: string, increment: number) => {
    // 첫 클릭
    handleStatChange(stat, formData.startingStats[stat as keyof typeof formData.startingStats] + increment);

    // 300ms 후부터 연속 증가 시작
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setFormData(prev => {
          const currentValue = prev.startingStats[stat as keyof typeof prev.startingStats];
          const newValue = currentValue + increment;
          const bounded = Math.max(5, Math.min(20, newValue));
          const currentTotal = Object.values(prev.startingStats).reduce((sum, s) => sum + s, 0);
          const otherStats = currentTotal - currentValue;

          if (otherStats + bounded <= maxStatPoints) {
            return {
              ...prev,
              startingStats: {
                ...prev.startingStats,
                [stat]: bounded,
              },
            };
          }
          return prev;
        });
      }, 100); // 100ms마다 증가
    }, 300);
  };

  const stopIncrement = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const validateStep1 = () => {
    if (!formData.playerName.trim()) return '캐릭터 이름을 입력해주세요.';
    if (formData.playerName.length < 2) return '캐릭터 이름은 최소 2자 이상이어야 합니다.';
    return null;
  };

  const handleNext = () => {
    setError('');

    if (currentStep === 1) {
      const error = validateStep1();
      if (error) {
        setError(error);
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Simulate character creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      resetGame(formData);
      navigate('/game');
    } catch (err) {
      setError('캐릭터 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">캐릭터 설정</h2>
        <p className="text-purple-200">게임에서 사용할 캐릭터 이름을 설정하세요</p>
      </div>

      <div className="text-center mb-6">
        <CharacterPortrait characterId="hero" size="large" />
      </div>

      <div>
        <label className="block text-white text-sm font-semibold mb-2">캐릭터 이름</label>
        <input
          type="text"
          value={formData.playerName}
          onChange={(e) => handleInputChange('playerName', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
          placeholder="캐릭터 이름을 입력하세요"
        />
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-2">캐릭터 정보</h4>
        <div className="text-blue-200 text-sm space-y-1">
          <p>• 학원의 신입생으로 시작합니다</p>
          <p>• 다양한 활동을 통해 능력치를 성장시킬 수 있습니다</p>
          <p>• 히로인들과의 관계를 발전시켜 특별한 엔딩을 볼 수 있습니다</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">능력치 분배</h2>
        <p className="text-purple-200">
          총 {maxStatPoints}포인트를 각 능력치에 분배하세요 (남은 포인트: {remainingPoints})
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(formData.startingStats).map(([stat, value]) => {
          const statNames = {
            intelligence: { name: '지력', icon: '🧠', color: 'blue' },
            charm: { name: '매력', icon: '✨', color: 'pink' },
            stamina: { name: '체력', icon: '🏃', color: 'green' },
            strength: { name: '힘', icon: '💪', color: 'orange' },
            agility: { name: '민첩', icon: '🏃‍♂️', color: 'cyan' },
            luck: { name: '행운', icon: '🍀', color: 'yellow' },
          };

          const statInfo = statNames[stat as keyof typeof statNames];

          return (
            <div key={stat} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-24">
                <span className="text-lg">{statInfo.icon}</span>
                <span className="text-white font-medium">{statInfo.name}</span>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <button
                  onPointerDown={() => startIncrement(stat, -1)}
                  onPointerUp={stopIncrement}
                  onPointerLeave={stopIncrement}
                  disabled={value <= 5}
                  className="w-8 h-8 bg-red-500/50 hover:bg-red-500/70 disabled:bg-gray-500/30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors select-none"
                  title="길게 누르면 연속 감소"
                >
                  -
                </button>

                <div className="flex-1 mx-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{value}</span>
                    <span className="text-gray-400">{value}/20</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r from-${statInfo.color}-400 to-${statInfo.color}-600 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onPointerDown={() => startIncrement(stat, 1)}
                  onPointerUp={stopIncrement}
                  onPointerLeave={stopIncrement}
                  disabled={value >= 20 || remainingPoints <= 0}
                  className="w-8 h-8 bg-green-500/50 hover:bg-green-500/70 disabled:bg-gray-500/30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors select-none"
                  title="길게 누르면 연속 증가"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-purple-300 font-semibold mb-2">능력치 안내</h4>
        <div className="text-purple-200 text-sm space-y-1">
          <p>• 지력: 학습 활동과 마법 관련 이벤트에 영향</p>
          <p>• 매력: 캐릭터와의 관계 발전에 중요</p>
          <p>• 체력: 활동할 수 있는 시간과 체력 관리</p>
          <p>• 힘: 전투와 물리적 활동에 영향</p>
          <p>• 민첩: 전투 순서와 회피율에 영향</p>
          <p>• 행운: 랜덤 이벤트와 드롭률에 영향</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">🎮 게임 소개</h2>
        <p className="text-purple-200">Labyrinth Academy에 오신 것을 환영합니다!</p>
      </div>

      <div className="space-y-4">
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">📅 기본 진행</h3>
          <div className="text-purple-200 text-sm space-y-1">
            <p>• 총 30일 동안 학원 생활을 진행합니다</p>
            <p>• 하루는 아침, 점심, 오후, 저녁, 밤 5개 시간대로 나뉘어집니다</p>
            <p>• 각 시간대마다 다양한 활동을 선택할 수 있습니다</p>
          </div>
        </div>

        <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-300 mb-2">💕 연애 시스템</h3>
          <div className="text-pink-200 text-sm space-y-1">
            <p>• 7명의 히로인과 관계를 발전시킬 수 있습니다</p>
            <p>• 대화와 선물로 호감도를 올릴 수 있습니다</p>
            <p>• 호감도가 높아지면 특별한 이벤트가 발생합니다</p>
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">⚔️ 던전 탐험</h3>
          <div className="text-blue-200 text-sm space-y-1">
            <p>• 7개의 던전을 탐험할 수 있습니다</p>
            <p>• 히로인들과 파티를 구성하여 함께 도전합니다</p>
            <p>• 던전에서 아이템과 경험치를 얻을 수 있습니다</p>
          </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">💡 게임 팁</h3>
          <div className="text-yellow-200 text-sm space-y-1">
            <p>• 스탯을 균형있게 키우면 유리합니다</p>
            <p>• 각 히로인의 선호하는 선물을 파악하세요</p>
            <p>• 시간을 효율적으로 관리하세요</p>
            <p>• 자주 저장하여 다양한 선택지를 탐색하세요</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-lg w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-purple-300 mb-2">
            <span>단계 {currentStep}/3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              이전
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || remainingPoints !== 0}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                '캐릭터 생성'
              )}
            </button>
          )}
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => onCancel ? onCancel() : navigate('/')}
            className="text-purple-300 hover:text-white text-sm transition-colors"
          >
            {onCancel ? '취소' : '홈으로 돌아가기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;