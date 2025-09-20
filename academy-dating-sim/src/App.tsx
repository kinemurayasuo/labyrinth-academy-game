import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import GameUI from './components/game/GameUI';
import EndingScreen from './components/pages/EndingScreen';
import Homepage from './components/pages/Homepage';
import Login from './components/pages/Login';
import CharacterCreation from './components/character/CharacterCreation';
import DungeonPage from './components/game/DungeonPage';
import ShoppingPage from './components/game/ShoppingPage';
import CharacterCardPage from './components/character/CharacterCardPage';
import AccountCreation from './components/pages/AccountCreation';
import GameInfo from './components/pages/GameInfo';
import Settings from './components/pages/Settings';
import Achievements from './components/game/Achievements';
import Collection from './components/game/Collection';
import DailyQuests from './components/game/DailyQuests';
import EventCalendar from './components/game/EventCalendar';
import CraftingSystem from './components/game/CraftingSystem';
import GuildSystem from './components/game/GuildSystem';
import PetSystem from './components/game/PetSystem';
import FishingGame from './components/game/MiniGames/FishingGame';
import FarmingSystem from './components/game/FarmingSystem';
import HousingSystem from './components/game/HousingSystem';
import GameMenu from './components/pages/GameMenu';
import Tutorial from './components/Tutorial';
import VisualNovelDialog from './components/ui/VisualNovelDialog';
import CardMatchingGame from './components/game/MiniGames';
import QuizGame from './components/game/MiniGames/QuizGame';
import PvPBattleSystem from './components/game/PvPBattleSystem';
import SocialSystem from './components/game/SocialSystem';
import ItemEnhancement from './components/game/ItemEnhancement';
import ApiTestPage from './components/pages/ApiTestPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const gameEnding = useGameStore(state => state.gameEnding);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === 'demo' && password === 'password') {
      const userData = { username, email: 'demo@example.com' };
      setIsLoggedIn(true);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const handleCreateAccount = (data: any) => {
    const userData = {
      username: data.username,
      email: data.email,
    };
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/dungeon" element={<DungeonPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/characters" element={<CharacterCardPage />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/quests" element={<DailyQuests />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/crafting" element={<CraftingSystem />} />
          <Route path="/guild" element={<GuildSystem />} />
          <Route path="/pets" element={<PetSystem />} />
          <Route path="/fishing" element={<FishingGame />} />
          <Route path="/farming" element={<FarmingSystem />} />
          <Route path="/housing" element={<HousingSystem />} />
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