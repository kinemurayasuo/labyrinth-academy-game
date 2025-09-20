import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import GameUI from './components/GameUI';
import EndingScreen from './components/EndingScreen';
import Homepage from './components/Homepage';
import Login from './components/Login';
import CharacterCreation from './components/CharacterCreation';
import DungeonPage from './components/DungeonPage';
import ShoppingPage from './components/ShoppingPage';
import CharacterCardPage from './components/CharacterCardPage';
import AccountCreation from './components/AccountCreation';
import GameInfo from './components/GameInfo';
import SettingsPage from './components/SettingsPage';
import HeroineInfo from './components/HeroineInfo';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [gameMessage, setGameMessage] = useState('');
  const gameEnding = useGameStore(state => state.gameEnding);
  const loadInitialGame = useGameStore(state => state.actions.loadInitialGame);
  const { saveGame, loadGame, resetGame } = useGameStore(state => state.actions);

  useEffect(() => {
    loadInitialGame();
  }, [loadInitialGame]);

  const handleLogin = (username: string, password: string) => {
    if (username === 'demo' && password === 'password') {
      setIsLoggedIn(true);
      setUser({ username, email: 'demo@example.com' });
      return true;
    }
    return false;
  };

  const handleCreateAccount = (data: any) => {
    setIsLoggedIn(true);
    setUser({
      username: data.username,
      email: data.email,
    });
    return true;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSaveGame = () => {
    saveGame();
    setGameMessage('게임이 저장되었습니다!');
    setTimeout(() => setGameMessage(''), 3000);
  };

  const handleLoadGame = () => {
    loadGame();
    setGameMessage('게임을 불러왔습니다!');
    setTimeout(() => setGameMessage(''), 3000);
  };

  const handleResetGame = () => {
    if (window.confirm('정말로 새 게임을 시작하시겠습니까? 현재 진행 상황이 초기화됩니다.')) {
      resetGame();
      setGameMessage('새 게임이 시작되었습니다!');
      setTimeout(() => setGameMessage(''), 3000);
    }
  };

  const handleDeleteSaveData = () => {
    if (window.confirm('정말로 저장 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('academyDatingSim');
      setGameMessage('저장 데이터가 삭제되었습니다.');
      setTimeout(() => setGameMessage(''), 3000);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Routes>
          <Route
            path="/"
            element={
              <Homepage
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/account-creation" element={<AccountCreation onCreateAccount={handleCreateAccount} />} />
          <Route path="/character-creation" element={<CharacterCreation />} />
          <Route path="/game-info" element={<GameInfo />} />
          <Route path="/heroine-info" element={<HeroineInfo />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                onBack={() => window.history.back()}
                onSaveGame={handleSaveGame}
                onLoadGame={handleLoadGame}
                onResetGame={handleResetGame}
                onDeleteSaveData={handleDeleteSaveData}
                gameMessage={gameMessage}
                hasSaveData={!!localStorage.getItem('academyDatingSim')}
              />
            }
          />
          <Route path="/dungeon" element={<DungeonPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/characters" element={<CharacterCardPage />} />
          <Route
            path="/game"
            element={gameEnding ? <EndingScreen /> : <GameUI />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;