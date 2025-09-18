import React, { useState, useEffect } from 'react';
import type { SaveData } from '../types/game';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onContinue,
}) => {
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Check for saved game data
    const savedGame = localStorage.getItem('academyDatingSim');
    if (savedGame) {
      try {
        const data: SaveData = JSON.parse(savedGame);
        setSaveData(data);
      } catch (error) {
        console.error('Failed to parse save data:', error);
      }
    }
  }, []);

  const handleNewGame = () => {
    setAnimationClass('animate-pulse');
    setTimeout(() => {
      onNewGame();
    }, 300);
  };

  const handleContinue = () => {
    if (saveData) {
      setAnimationClass('animate-pulse');
      setTimeout(() => {
        onContinue();
      }, 300);
    }
  };

  const formatSaveTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR');
  };

  const getSaveProgress = () => {
    if (!saveData) return null;

    const totalAffection = Object.values(saveData.player.affection).reduce((sum, val) => sum + val, 0);
    const maxDay = 30;
    const progressPercent = (saveData.player.day / maxDay) * 100;

    return {
      day: saveData.player.day,
      totalAffection,
      progressPercent,
    };
  };

  const progress = getSaveProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full ${animationClass}`}>
        {/* Game Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Academy Dating Sim
          </h1>
          <p className="text-xl text-purple-300 font-medium">
            학원에서 펼쳐지는 로맨틱 시뮬레이션
          </p>
          <div className="mt-6 flex justify-center space-x-4 text-4xl">
            <span className="animate-bounce delay-0">🌸</span>
            <span className="animate-bounce delay-100">💕</span>
            <span className="animate-bounce delay-200">🏫</span>
            <span className="animate-bounce delay-300">✨</span>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-gradient-to-r from-purple-800/80 to-pink-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/30">
          <div className="space-y-4">
            {/* New Game Button */}
            <button
              onClick={handleNewGame}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 text-lg"
            >
              <span className="text-2xl">🆕</span>
              새로운 게임
            </button>

            {/* Continue Game Button */}
            <button
              onClick={handleContinue}
              disabled={!saveData}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 transform flex items-center justify-center gap-3 text-lg ${
                saveData
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-105 hover:shadow-lg'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">📂</span>
              게임 이어하기
              {!saveData && <span className="text-sm">(저장된 게임 없음)</span>}
            </button>

            {/* Save Data Info */}
            {saveData && progress && (
              <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-600/30">
                <h3 className="text-pink-200 font-semibold mb-3 flex items-center gap-2">
                  <span>💾</span>
                  저장된 게임 정보
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">플레이어</span>
                    <span className="text-white font-medium">{saveData.player.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">진행도</span>
                    <span className="text-white font-medium">{progress.day}/30일</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">총 호감도</span>
                    <span className="text-white font-medium">{progress.totalAffection}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">저장 시간</span>
                    <span className="text-white font-medium text-xs">{formatSaveTime(saveData.timestamp)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-purple-950/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-purple-400 mt-1 text-center">
                      {Math.round(progress.progressPercent)}% 완료
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credits Button */}
            <button
              onClick={() => setShowCredits(true)}
              className="w-full bg-gradient-to-r from-purple-700/60 to-pink-700/60 hover:from-purple-600/60 hover:to-pink-600/60 text-purple-200 font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <span className="text-xl">ℹ️</span>
              게임 정보
            </button>
          </div>
        </div>

        {/* Game Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-600/30">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="text-pink-200 font-semibold">스토리</h3>
            <p className="text-xs text-purple-300 mt-1">다양한 캐릭터와의 로맨스</p>
          </div>

          <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-600/30">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-pink-200 font-semibold">성장</h3>
            <p className="text-xs text-purple-300 mt-1">능력치 향상과 캐릭터 발전</p>
          </div>

          <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-600/30">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-pink-200 font-semibold">선택</h3>
            <p className="text-xs text-purple-300 mt-1">당신의 선택이 만드는 결말</p>
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 text-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-pink-200">게임 정보</h3>
                <button
                  onClick={() => setShowCredits(false)}
                  className="text-purple-300 hover:text-white text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-900/40 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-2">🎮 게임 소개</h4>
                  <p className="text-sm text-purple-200 leading-relaxed">
                    Academy Dating Sim은 학원을 배경으로 한 연애 시뮬레이션 게임입니다.
                    다양한 캐릭터들과 만나고, 능력치를 키우며, 당신만의 로맨스 스토리를 만들어보세요.
                  </p>
                </div>

                <div className="bg-purple-900/40 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-2">🎯 게임 목표</h4>
                  <ul className="text-sm text-purple-200 space-y-1">
                    <li>• 30일 동안 학원 생활을 즐기세요</li>
                    <li>• 캐릭터들과의 호감도를 높이세요</li>
                    <li>• 능력치를 키워 다양한 이벤트를 해결하세요</li>
                    <li>• 여러 엔딩을 경험해보세요</li>
                  </ul>
                </div>

                <div className="bg-purple-900/40 rounded-lg p-4">
                  <h4 className="text-pink-200 font-semibold mb-2">💕 등장인물</h4>
                  <div className="text-sm text-purple-200 space-y-1">
                    <div>🌸 사쿠라 - 활발하고 밝은 성격</div>
                    <div>❄️ 유키 - 차가워 보이지만 따뜻한 마음</div>
                    <div>🌙 루나 - 신비로운 분위기의 소녀</div>
                    <div>❓ ??? - 숨겨진 캐릭터</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-purple-400">
                    Version 1.0.0 • Made with React & TypeScript
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;