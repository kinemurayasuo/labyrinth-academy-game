import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterPortrait from './CharacterPortrait';

interface HomepageProps {
  onStartGame: () => boolean;
  onLoadGame: () => void;
  hasSavedGame: boolean;
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = ({
  onStartGame,
  onLoadGame,
  hasSavedGame,
  isLoggedIn,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState(0);

  const handleLogout = () => {
    onLogout();
    window.location.reload();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    const result = onStartGame();
    if (result) {
      navigate('/character-creation');
    }
  };

  const handleLoadGame = () => {
    onLoadGame();
    navigate('/game');
  };

  const handleAccountCreation = () => {
    navigate('/account-creation');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-text-primary">
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
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent mb-4 animate-pulse">
            Labyrinth Academy
          </h1>
          <h2 className="text-2xl md:text-3xl text-text-primary mb-2">
            데이팅 시뮬레이션 게임
          </h2>
          <p className="text-lg text-text-secondary">
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
              <div className="text-text-primary font-semibold">사쿠라</div>
              <div className="text-text-secondary text-sm">검술부 에이스</div>
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
              <div className="text-text-primary font-semibold">유키</div>
              <div className="text-text-secondary text-sm">도서부 부장</div>
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
              <div className="text-text-primary font-semibold">루나</div>
              <div className="text-text-secondary text-sm">마법학부 수석</div>
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
              <div className="text-text-primary font-semibold">???</div>
              <div className="text-text-secondary text-sm">수수께끼의 전학생</div>
            </div>
          </div>
        </div>

        {/* Game Menu */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">게임 시작</h3>
              {isLoggedIn && user && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-4">
                  <div className="text-green-300 text-sm">로그인됨</div>
                  <div className="text-text-primary font-medium">{user.username}</div>
                </div>
              )}

              <button
                onClick={handleStartGame}
                disabled={!isLoggedIn}
                className={`w-full py-4 px-6 text-text-primary font-bold rounded-xl transition-all duration-300 transform shadow-lg ${
                  isLoggedIn
                    ? "bg-primary hover:bg-secondary hover:scale-105"
                    : "bg-gray-500 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <span>{isLoggedIn ? "새 게임 시작" : "로그인 후 이용 가능"}</span>
                </div>
              </button>

              {hasSavedGame && (
                <button
                  onClick={handleLoadGame}
                  className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📂</span>
                    <span>게임 불러오기</span>
                  </div>
                </button>
              )}

              <button
                onClick={handleAccountCreation}
                className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">👤</span>
                  <span>계정 생성</span>
                </div>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">계정 관리</h3>

              <button
                onClick={isLoggedIn ? handleLogout : handleLogin}
                className="w-full py-4 px-6 bg-orange-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{isLoggedIn ? '🚪' : '🔐'}</span>
                  <span>{isLoggedIn ? '로그아웃' : '로그인'}</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <span>설정</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/game-info')}
                className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">ℹ️</span>
                  <span>게임 정보</span>
                </div>
              </button>
            </div>
          </div>

          {/* Game Features */}
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="text-lg font-bold text-text-primary mb-4">게임 특징</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-primary/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">💕</div>
                <div className="text-text-primary font-semibold">로맨스</div>
                <div className="text-text-secondary text-sm">다양한 캐릭터와의 특별한 인연</div>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="text-text-primary font-semibold">던전 탐험</div>
                <div className="text-blue-200 text-sm">신비한 던전에서의 모험</div>
              </div>
              <div className="bg-green-500/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-text-primary font-semibold">학원 생활</div>
                <div className="text-green-200 text-sm">마법 학원에서의 일상</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-text-secondary">
          <p>© 2024 Labyrinth Academy Dating Sim. Made with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;