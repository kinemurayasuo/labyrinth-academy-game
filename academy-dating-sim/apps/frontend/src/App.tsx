import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import GameUI from './components/game/GameUI';
import EndingScreen from './components/pages/EndingScreen';
import Homepage from './components/pages/Homepage';
import Login from './components/pages/Login';
import CharacterCreation from './components/character/CharacterCreation';
import SimpleDungeonPage from './components/game/SimpleDungeonPage';
import DungeonSelection from './components/game/DungeonSelection';
import DiarySystem from './components/game/DiarySystem';
import HeroineStorylines from './components/character/HeroineStorylines';
import SaveLoadSystem from './components/game/SaveLoadSystem';
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
import RhythmGame from './components/game/MiniGames/RhythmGame';
import PuzzleGame from './components/game/MiniGames/PuzzleGame';
import PvPBattleSystem from './components/game/PvPBattleSystem';
import SocialSystem from './components/game/SocialSystem';
import ItemEnhancement from './components/game/ItemEnhancement';
import ApiTestPage from './components/pages/ApiTestPage';
import ClubSystem from './components/game/ClubSystem';
import HeroineGallery from './components/pages/HeroineGallery';
import GameIntro from './components/pages/GameIntro';
import CharacterInitialStates from './components/character/CharacterInitialStates';
import MinigameHub from './components/pages/MinigameHub';
import EnhancedWeatherSystem from './components/game/EnhancedWeatherSystem';
import AchievementRewards from './components/game/AchievementRewards';
import EnhancedDialogueSystem from './components/character/EnhancedDialogueSystem';
import GiftPreferenceSystem from './components/game/GiftPreferenceSystem';
import SeasonalEvents from './components/game/SeasonalEvents';
import EndingVariations from './components/game/EndingVariations';
import RomanceEvents from './components/character/RomanceEvents';
import HiddenContent from './components/game/HiddenContent';

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

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const userData = {
          username: result.user.username,
          email: result.user.email,
          id: result.user.id
        };
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', result.token);
        return true;
      } else {
        alert(result.error || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
  };

  const handleCreateAccount = async (data: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        const userData = {
          username: result.user.username,
          email: result.user.email,
          id: result.user.id
        };
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', result.token);
        return true;
      } else {
        alert(result.error || '계정 생성에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Account creation error:', error);
      alert('서버 연결에 실패했습니다.');
      return false;
    }
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
          <Route path="/dungeon-selection" element={<DungeonSelection />} />
          <Route path="/dungeon" element={<SimpleDungeonPage />} />
          <Route path="/diary" element={<DiarySystem />} />
          <Route path="/heroine-stories" element={<HeroineStorylines />} />
          <Route path="/save-load" element={<SaveLoadSystem />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/characters" element={<CharacterCardPage />} />
          <Route path="/achievements" element={<AchievementRewards />} />
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
          <Route path="/rhythm" element={<RhythmGame />} />
          <Route path="/puzzle" element={<PuzzleGame />} />
          <Route path="/pvp" element={<PvPBattleSystem />} />
          <Route path="/social" element={<SocialSystem />} />
          <Route path="/enhancement" element={<ItemEnhancement />} />
          <Route path="/clubs" element={<ClubSystem />} />
          <Route path="/heroines" element={<HeroineGallery />} />
          <Route path="/character-meeting" element={<CharacterInitialStates />} />
          <Route path="/minigames" element={<MinigameHub />} />
          <Route path="/weather" element={<EnhancedWeatherSystem />} />
          <Route path="/dialogue" element={<EnhancedDialogueSystem />} />
          <Route path="/gifts" element={<GiftPreferenceSystem />} />
          <Route path="/seasonal-events" element={<SeasonalEvents />} />
          <Route path="/ending" element={<EndingVariations />} />
          <Route path="/romance-events" element={<RomanceEvents />} />
          <Route path="/hidden-content" element={<HiddenContent />} />
          <Route
            path="/game"
            element={gameEnding ? <EndingVariations /> : <GameUI />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;