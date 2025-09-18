import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterPortrait from './CharacterPortrait';

interface HomepageProps {
  onStartGame: () => void;
  onLoadGame: () => void;
  hasSavedGame: boolean;
}

const Homepage: React.FC<HomepageProps> = ({
  onStartGame,
  onLoadGame,
  hasSavedGame,
}) => {
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    onStartGame();
    navigate('/game');
  };

  const handleLoadGame = () => {
    onLoadGame();
    navigate('/game');
  };

  const handleCharacterCreation = () => {
    navigate('/character-creation');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Labyrinth Academy
          </h1>
          <h2 className="text-2xl md:text-3xl text-white/90 mb-2">
            데이팅 시뮬레이션 게임
          </h2>
          <p className="text-lg text-purple-200">
            마법과 모험이 가득한 학원에서 특별한 인연을 만나보세요
          </p>
        </div>

        {/* Character Showcase */}
        <div className="flex justify-center items-center gap-8 mb-12">
          <div className={`transition-all duration-1000 ${animationPhase === 0 ? 'scale-110' : 'scale-100'}`}>
            <CharacterPortrait
              characterId="sakura"
              emotion={animationPhase === 0 ? 'happy' : 'neutral'}
              size="large"
              className="hover:scale-110 transition-transform cursor-pointer"
            />
            <div className="text-center mt-2">
              <div className="text-white font-semibold">사쿠라</div>
              <div className="text-purple-300 text-sm">검술부 에이스</div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ${animationPhase === 1 ? 'scale-110' : 'scale-100'}`}>
            <CharacterPortrait
              characterId="yuki"
              emotion={animationPhase === 1 ? 'happy' : 'neutral'}
              size="large"
              className="hover:scale-110 transition-transform cursor-pointer"
            />
            <div className="text-center mt-2">
              <div className="text-white font-semibold">유키</div>
              <div className="text-purple-300 text-sm">도서부 부장</div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ${animationPhase === 2 ? 'scale-110' : 'scale-100'}`}>
            <CharacterPortrait
              characterId="luna"
              emotion={animationPhase === 2 ? 'happy' : 'neutral'}
              size="large"
              className="hover:scale-110 transition-transform cursor-pointer"
            />
            <div className="text-center mt-2">
              <div className="text-white font-semibold">루나</div>
              <div className="text-purple-300 text-sm">마법학부 수석</div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ${animationPhase === 3 ? 'scale-110' : 'scale-100'}`}>
            <CharacterPortrait
              characterId="mystery"
              emotion={animationPhase === 3 ? 'happy' : 'neutral'}
              size="large"
              className="hover:scale-110 transition-transform cursor-pointer"
            />
            <div className="text-center mt-2">
              <div className="text-white font-semibold">???</div>
              <div className="text-purple-300 text-sm">수수께끼의 전학생</div>
            </div>
          </div>
        </div>

        {/* Game Menu */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">게임 시작</h3>

              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <span>새 게임 시작</span>
                </div>
              </button>

              {hasSavedGame && (
                <button
                  onClick={handleLoadGame}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📂</span>
                    <span>게임 불러오기</span>
                  </div>
                </button>
              )}

              <button
                onClick={handleCharacterCreation}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">👤</span>
                  <span>캐릭터 생성</span>
                </div>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">계정 관리</h3>

              <button
                onClick={handleLogin}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <span>로그인</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <span>설정</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/about')}
                className="w-full py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">ℹ️</span>
                  <span>게임 정보</span>
                </div>
              </button>
            </div>
          </div>

          {/* Game Features */}
          <div className="mt-8 border-t border-white/20 pt-6">
            <h4 className="text-lg font-bold text-white mb-4">게임 특징</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-purple-500/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">💕</div>
                <div className="text-white font-semibold">로맨스</div>
                <div className="text-purple-200 text-sm">다양한 캐릭터와의 특별한 인연</div>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="text-white font-semibold">던전 탐험</div>
                <div className="text-blue-200 text-sm">신비한 던전에서의 모험</div>
              </div>
              <div className="bg-green-500/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-white font-semibold">학원 생활</div>
                <div className="text-green-200 text-sm">마법 학원에서의 일상</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-purple-300">
          <p>© 2024 Labyrinth Academy Dating Sim. Made with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;