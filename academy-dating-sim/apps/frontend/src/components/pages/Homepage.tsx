import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import CharacterPortrait from '../character/CharacterPortrait';

interface HomepageProps {
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = React.memo(({
  isLoggedIn,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { resetGame, loadGame } = useGameStore((state: any) => state.actions);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const savedGame = localStorage.getItem('academyDatingSim');
    setHasSavedGame(!!savedGame);
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    onLogout();
    window.location.reload();
  }, [onLogout]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartGame = useCallback(() => {
    resetGame();
    navigate('/character-creation');
  }, [resetGame, navigate]);

  const handleLoadGame = useCallback(() => {
    loadGame();
    navigate('/game');
  }, [loadGame, navigate]);

  const handleAccountCreation = useCallback(() => {
    navigate('/account-creation');
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const handleGameInfo = useCallback(() => {
    navigate('/game-info');
  }, [navigate]);

  // Memoize background animation elements to prevent recalculation on every render
  const backgroundElements = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
        aria-hidden="true"
      >
        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
      </div>
    )), []
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {backgroundElements}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-4 animate-pulse-glow">
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
        <div className="glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">게임 시작</h3>
              {isLoggedIn && user && (
                <div className="glass-card p-3 mb-4 border-accent/30">
                  <div className="text-accent text-sm">로그인됨</div>
                  <div className="text-text-primary font-medium">{user.username}</div>
                </div>
              )}

              <button
                onClick={handleStartGame}
                disabled={!isLoggedIn}
                className={`w-full py-4 px-6 font-bold rounded-xl transition-all duration-300 transform ${
                  isLoggedIn
                    ? "btn-primary hover:scale-105"
                    : "bg-gray-500 cursor-not-allowed opacity-50 text-gray-300"
                }`}
                aria-label={isLoggedIn ? "새로운 게임 시작하기" : "로그인 후 게임 시작 가능"}
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl" aria-hidden="true">🎮</span>
                  <span>{isLoggedIn ? "새 게임 시작" : "로그인 후 이용 가능"}</span>
                </div>
              </button>

              {hasSavedGame && (
                <button
                  onClick={handleLoadGame}
                  className="w-full py-4 px-6 btn-glass font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  aria-label="저장된 게임 불러오기"
                  role="button"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl" aria-hidden="true">📂</span>
                    <span>게임 불러오기</span>
                  </div>
                </button>
              )}

              <button
                onClick={handleAccountCreation}
                className="w-full py-4 px-6 btn-accent font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                aria-label="새 계정 생성하기"
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl" aria-hidden="true">👤</span>
                  <span>계정 생성</span>
                </div>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">계정 관리</h3>

              <button
                onClick={isLoggedIn ? handleLogout : handleLogin}
                className="w-full py-4 px-6 btn-secondary font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                aria-label={isLoggedIn ? '계정에서 로그아웃하기' : '계정에 로그인하기'}
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{isLoggedIn ? '🚪' : '🔐'}</span>
                  <span>{isLoggedIn ? '로그아웃' : '로그인'}</span>
                </div>
              </button>

              <button
                onClick={handleSettings}
                className="w-full py-3 px-6 btn-ghost font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border border-border"
                aria-label="게임 설정 페이지로 이동"
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl" aria-hidden="true">⚙️</span>
                  <span>설정</span>
                </div>
              </button>

              <button
                onClick={handleGameInfo}
                className="w-full py-3 px-6 btn-ghost font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border border-border"
                aria-label="게임 정보 페이지로 이동"
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl" aria-hidden="true">ℹ️</span>
                  <span>게임 정보</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/api-test')}
                className="w-full py-3 px-6 btn-ghost font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border border-primary/30"
                aria-label="API 연결 테스트 페이지로 이동"
                role="button"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl" aria-hidden="true">🔗</span>
                  <span>API 테스트</span>
                </div>
              </button>
            </div>
          </div>

          {/* Game Features */}
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="text-lg font-bold text-text-primary mb-4">게임 특징</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="glass-card p-4 hover:shadow-glow-sm transition-all duration-300">
                <div className="text-2xl mb-2">💕</div>
                <div className="text-text-primary font-semibold">로맨스</div>
                <div className="text-text-secondary text-sm">다양한 캐릭터와의 특별한 인연</div>
              </div>
              <div className="glass-card p-4 hover:shadow-glow-sm transition-all duration-300">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="text-text-primary font-semibold">던전 탐험</div>
                <div className="text-text-secondary text-sm">신비한 던전에서의 모험</div>
              </div>
              <div className="glass-card p-4 hover:shadow-glow-sm transition-all duration-300">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-text-primary font-semibold">학원 생활</div>
                <div className="text-text-secondary text-sm">마법 학원에서의 일상</div>
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
});

Homepage.displayName = 'Homepage';

export default Homepage;