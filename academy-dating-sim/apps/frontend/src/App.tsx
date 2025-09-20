import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import GameUI from './components/game/GameUI';
import EndingScreen from './components/pages/EndingScreen';
import Homepage from './components/pages/Homepage';
import Login from './components/pages/Login';
import CharacterCreation from './components/character/CharacterCreation';
import SimpleDungeonPage from './components/game/SimpleDungeonPage';
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
import CardMatchingGame from './components/game/MiniGames/CardMatchingGame';
import QuizGame from './components/game/MiniGames/QuizGame';
import PvPBattleSystem from './components/game/PvPBattleSystem';
import SocialSystem from './components/game/SocialSystem';
import ItemEnhancement from './components/game/ItemEnhancement';
import ApiTestPage from './components/pages/ApiTestPage';
import ClubSystem from './components/game/ClubSystem';
import HeroineGallery from './components/pages/HeroineGallery';
import GameIntro from './components/pages/GameIntro';

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
      <div className="min-h-screen">
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
          <Route path="/game-intro" element={<GameIntro />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/dungeon" element={<SimpleDungeonPage />} />
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
          <Route path="/game-menu" element={<GameMenu />} />
          <Route path="/tutorial" element={<Tutorial onComplete={() => {}} onSkip={() => {}} />} />
          <Route path="/card-matching" element={<CardMatchingGame />} />
          <Route path="/quiz" element={<QuizGame onComplete={(score: number) => console.log('Quiz completed with score:', score)} />} />
          <Route path="/pvp" element={<PvPBattleSystem />} />
          <Route path="/social" element={<SocialSystem />} />
          <Route path="/enhancement" element={<ItemEnhancement />} />
          <Route path="/clubs" element={<ClubSystem />} />
          <Route path="/heroines" element={<HeroineGallery />} />
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