import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useGameStore } from '../../store/useGameStore';

interface NewHomepageProps {
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
}

const NewHomepage: React.FC<NewHomepageProps> = React.memo(({
  isLoggedIn,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  // const { resetGame, loadGame } = useGameStore((state: any) => state.actions);

  // Temporary mock functions until store is connected
  const resetGame = () => {
    localStorage.removeItem('academyDatingSim');
  };
  
  const loadGame = () => {
    const savedGame = localStorage.getItem('academyDatingSim');
    if (savedGame) {
      console.log('Loading game:', savedGame);
    }
  };
  const [activeCharacter, setActiveCharacter] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const savedGame = localStorage.getItem('academyDatingSim');
    setHasSavedGame(!!savedGame);
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
    window.location.reload();
  }, [onLogout]);

  // Character cycling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCharacter((prev) => (prev + 1) % 4);
    }, 3000);

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

  const characters = [
    {
      id: 'sakura',
      name: '사쿠라',
      role: '검술부 에이스',
      emoji: '⚔️',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      id: 'yuki',
      name: '유키',
      role: '도서부 부장',
      emoji: '📚',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'luna',
      name: '루나',
      role: '마법학부 수석',
      emoji: '🌙',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 'mystery',
      name: '???',
      role: '수수께끼의 전학생',
      emoji: '❓',
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
    },
  ];

  // Background particle animation
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-pulse opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${4 + Math.random() * 3}s`,
        }}
      >
        <div className={`w-1 h-1 ${i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'} rounded-full`}></div>
      </div>
    )), []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">LA</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Labyrinth Academy</h1>
                <p className="text-gray-400 text-sm">Dating Simulation Game</p>
              </div>
            </div>

            {/* User Status */}
            <div className="flex items-center gap-4">
              {isLoggedIn && user && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">{user.username}</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/api-test')}
                className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                🔗 API Test
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16">
              <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
                Labyrinth
                <br />
                Academy
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
                마법과 모험이 가득한 신비로운 학원에서 특별한 인연을 만나보세요
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></span>
                <span>Dating Simulation × RPG Adventure</span>
                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
              </div>
            </div>

            {/* Character Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              {characters.map((character, index) => (
                <div
                  key={character.id}
                  className={`relative group transition-all duration-500 transform ${
                    activeCharacter === index ? 'scale-110 z-10' : 'scale-100 hover:scale-105'
                  }`}
                >
                  <div className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 border ${character.borderColor} ${character.bgColor} hover:bg-white/10 transition-all duration-300`}>
                    <div className="text-center">
                      <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {character.emoji}
                      </div>
                      <h3 className={`text-xl font-bold bg-gradient-to-r ${character.color} bg-clip-text text-transparent mb-2`}>
                        {character.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{character.role}</p>
                      
                      {activeCharacter === index && (
                        <div className="mt-4 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30">
                          <span className="text-cyan-300 text-xs font-medium">Now Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Glow effect for active character */}
                  {activeCharacter === index && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${character.color} rounded-2xl opacity-20 blur-xl -z-10 animate-pulse`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Game Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Primary Actions */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎮</span>
                  Game Start
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleStartGame}
                    disabled={!isLoggedIn}
                    className={`w-full py-4 px-6 text-white font-bold rounded-2xl transition-all duration-300 transform ${
                      isLoggedIn
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                        : "bg-gray-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">✨</span>
                      <span>{isLoggedIn ? "새로운 모험 시작" : "로그인 후 이용 가능"}</span>
                    </div>
                  </button>

                  {hasSavedGame && (
                    <button
                      onClick={handleLoadGame}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">📂</span>
                        <span>저장된 모험 계속하기</span>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/account-creation')}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xl">👤</span>
                      <span>새 계정 만들기</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">⚙️</span>
                  Settings
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={isLoggedIn ? handleLogout : () => navigate('/login')}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">{isLoggedIn ? '🚪' : '🔐'}</span>
                      <span>{isLoggedIn ? '로그아웃' : '로그인'}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 border border-white/20"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xl">⚙️</span>
                      <span>게임 설정</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Game Features */}
            <div className="mt-16 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h4 className="text-2xl font-bold text-white mb-8 text-center">🌟 게임 특징</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 p-6 rounded-2xl border border-pink-500/30 text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💕</div>
                  <div className="text-xl font-bold text-pink-300 mb-2">Romance System</div>
                  <div className="text-gray-300 text-sm">다양한 캐릭터와의 깊이 있는 관계 발전</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-2xl border border-blue-500/30 text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚔️</div>
                  <div className="text-xl font-bold text-blue-300 mb-2">Dungeon Adventure</div>
                  <div className="text-gray-300 text-sm">신비한 던전에서의 스릴 넘치는 모험</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-green-500/30 text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏫</div>
                  <div className="text-xl font-bold text-green-300 mb-2">Academy Life</div>
                  <div className="text-gray-300 text-sm">마법 학원에서의 일상과 성장</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-400 text-sm">
              © 2024 Labyrinth Academy Dating Sim. Crafted with ❤️ & ✨
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>React + TypeScript</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>Zustand</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

NewHomepage.displayName = 'NewHomepage';

export default NewHomepage;