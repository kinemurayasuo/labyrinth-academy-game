import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { Button, Card } from '../ui';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
    window.location.reload();
  }, [onLogout]);

  const handleStartGame = useCallback(() => {
    resetGame();
    navigate('/character-creation');
  }, [resetGame, navigate]);

  const handleLoadGame = useCallback(() => {
    loadGame();
    navigate('/game');
  }, [loadGame, navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleAccountCreation = useCallback(() => {
    navigate('/account-creation');
  }, [navigate]);

  // Background animation elements
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

      <div className="relative z-10 max-w-6xl w-full space-y-8">
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

        {/* Main Menu Card */}
        <Card variant="glass" className="p-8">
          {/* Login Status */}
          {isLoggedIn && user && (
            <div className="mb-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-accent text-sm">현재 로그인 상태</div>
                  <div className="text-text-primary font-medium text-lg">{user.username}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          )}

          {/* Menu Content Based on Login State */}
          {isLoggedIn ? (
            // 로그인 상태 메뉴
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasSavedGame ? (
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={handleLoadGame}
                    leftIcon={<span className="text-2xl">📂</span>}
                    fullWidth
                  >
                    게임 불러오기
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={handleStartGame}
                    leftIcon={<span className="text-2xl">🎮</span>}
                    fullWidth
                  >
                    새 게임 시작
                  </Button>
                )}

                {hasSavedGame && (
                  <Button
                    variant="secondary"
                    size="xl"
                    onClick={handleStartGame}
                    leftIcon={<span className="text-2xl">🆕</span>}
                    fullWidth
                  >
                    처음부터 시작
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // 비로그인 상태 메뉴
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-text-secondary text-lg">
                  게임을 시작하려면 먼저 로그인해주세요
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleLogin}
                  leftIcon={<span className="text-2xl">🔐</span>}
                  fullWidth
                >
                  로그인
                </Button>

                <Button
                  variant="accent"
                  size="xl"
                  onClick={handleAccountCreation}
                  leftIcon={<span className="text-2xl">👤</span>}
                  fullWidth
                >
                  계정 생성
                </Button>
              </div>
            </div>
          )}

          {/* Game Features (Always Visible) */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-lg font-bold text-text-primary mb-4">게임 특징</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="glass" padding="sm" className="text-center hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">💕</div>
                <div className="text-text-primary font-semibold">로맨스</div>
                <div className="text-text-secondary text-sm">다양한 캐릭터와의 특별한 인연</div>
              </Card>

              <Card variant="glass" padding="sm" className="text-center hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-text-primary font-semibold">파티 던전</div>
                <div className="text-text-secondary text-sm">4인 파티로 던전 공략</div>
              </Card>

              <Card variant="glass" padding="sm" className="text-center hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-text-primary font-semibold">학원 생활</div>
                <div className="text-text-secondary text-sm">마법 학원에서의 일상</div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-text-secondary">
          <p>© 2024 Labyrinth Academy Dating Sim</p>
        </div>
      </div>
    </div>
  );
});

Homepage.displayName = 'Homepage';

export default Homepage;