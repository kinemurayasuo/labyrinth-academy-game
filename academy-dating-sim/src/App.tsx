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
import Settings from './components/Settings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const gameEnding = useGameStore(state => state.gameEnding);
  const loadInitialGame = useGameStore(state => state.actions.loadInitialGame);

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
          <Route path="/settings" element={<Settings />} />
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