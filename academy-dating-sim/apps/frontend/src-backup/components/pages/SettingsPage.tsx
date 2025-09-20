import React from 'react';

interface SettingsPageProps {
  onBack: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onResetGame: () => void;
  onDeleteSaveData: () => void;
  gameMessage: string;
  hasSaveData: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  onSaveGame,
  onLoadGame,
  onResetGame,
  onDeleteSaveData,
  gameMessage,
  hasSaveData
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 text-white hover:text-secondary transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>홈으로 돌아가기</span>
          </button>
          <h1 className="text-4xl font-bold text-white">설정</h1>
        </div>

        {/* Settings Container */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-border">
          {/* Save/Load Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">저장 관리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onSaveGame}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                💾 게임 저장
              </button>
              <button
                onClick={onLoadGame}
                disabled={!hasSaveData}
                className={`w-full px-6 py-3 font-semibold rounded-lg transform transition-all duration-200 shadow-lg ${
                  hasSaveData
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                📂 게임 불러오기
              </button>
            </div>
            {gameMessage && (
              <div className="mt-4 p-3 bg-black/50 rounded-lg text-center text-sm text-yellow-400">
                {gameMessage}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">위험 구역</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onResetGame}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🔄 새 게임 시작
              </button>
              <button
                onClick={onDeleteSaveData}
                disabled={!hasSaveData}
                className={`w-full px-6 py-3 font-semibold rounded-lg transform transition-all duration-200 shadow-lg ${
                  hasSaveData
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                🗑️ 저장 데이터 삭제
              </button>
            </div>
          </div>

          {/* Game Settings */}
          <div className="border-t border-border pt-8 mt-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">게임 설정</h2>
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">자동 저장</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">효과음</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">배경 음악</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-border pt-8 mt-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">게임 정보</h2>
            <div className="bg-black/20 rounded-lg p-4 space-y-2 text-sm text-gray-300">
              <p>버전: 1.0.0</p>
              <p>제작: Academy Dating Sim Team</p>
              <p>라이센스: MIT</p>
              <p className="text-xs text-gray-400 mt-4">
                이 게임은 React와 TypeScript로 제작되었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;