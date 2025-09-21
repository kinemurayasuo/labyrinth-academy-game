import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import { PageLoader } from './components/ui/Skeleton';

// Critical components (loaded immediately)
import Homepage from './components/pages/Homepage';
import Login from './components/pages/Login';
import GameUI from './components/game/GameUI';

// Lazy load non-critical routes (code splitting)
const CharacterCreation = lazy(() => import('./components/character/CharacterCreation'));
const AccountCreation = lazy(() => import('./components/pages/AccountCreation'));
const GameInfo = lazy(() => import('./components/pages/GameInfo'));
const GameIntro = lazy(() => import('./components/pages/GameIntro'));
const Settings = lazy(() => import('./components/pages/Settings'));

// Game Systems (lazy loaded)
const SimpleDungeonPage = lazy(() => import('./components/game/SimpleDungeonPage'));
const DungeonSelection = lazy(() => import('./components/game/DungeonSelection'));
const DiarySystem = lazy(() => import('./components/game/DiarySystem'));
const HeroineStorylines = lazy(() => import('./components/character/HeroineStorylines'));
const SaveLoadSystem = lazy(() => import('./components/game/SaveLoadSystem'));
const ShoppingPage = lazy(() => import('./components/game/ShoppingPage'));
const CharacterCardPage = lazy(() => import('./components/character/CharacterCardPage'));

// Additional Features (lowest priority)
const Achievements = lazy(() => import('./components/game/Achievements'));
const Collection = lazy(() => import('./components/game/Collection'));
const DailyQuests = lazy(() => import('./components/game/DailyQuests'));
const EventCalendar = lazy(() => import('./components/game/EventCalendar'));
const CraftingSystem = lazy(() => import('./components/game/CraftingSystem'));
const GuildSystem = lazy(() => import('./components/game/GuildSystem'));
const PetSystem = lazy(() => import('./components/game/PetSystem'));

// Mini Games (separate chunks)
const FishingGame = lazy(() => import('./components/game/MiniGames/FishingGame'));
const CardMatchingGame = lazy(() => import('./components/game/MiniGames/CardMatchingGame'));
const QuizGame = lazy(() => import('./components/game/MiniGames/QuizGame'));
const RhythmGame = lazy(() => import('./components/game/MiniGames/RhythmGame'));
const PuzzleGame = lazy(() => import('./components/game/MiniGames/PuzzleGame'));

// Social Features
const PvPBattleSystem = lazy(() => import('./components/game/PvPBattleSystem'));
const SocialSystem = lazy(() => import('./components/game/SocialSystem'));
const ClubSystem = lazy(() => import('./components/game/ClubSystem'));

// Additional Systems
const FarmingSystem = lazy(() => import('./components/game/FarmingSystem'));
const HousingSystem = lazy(() => import('./components/game/HousingSystem'));
const ItemEnhancement = lazy(() => import('./components/game/ItemEnhancement'));
const EnhancedWeatherSystem = lazy(() => import('./components/game/EnhancedWeatherSystem'));
const AchievementRewards = lazy(() => import('./components/game/AchievementRewards'));
const EnhancedDialogueSystem = lazy(() => import('./components/character/EnhancedDialogueSystem'));
const GiftPreferenceSystem = lazy(() => import('./components/game/GiftPreferenceSystem'));
const SeasonalEvents = lazy(() => import('./components/game/SeasonalEvents'));
const EndingVariations = lazy(() => import('./components/game/EndingVariations'));
const RomanceEvents = lazy(() => import('./components/character/RomanceEvents'));
const HiddenContent = lazy(() => import('./components/game/HiddenContent'));

// Other Pages
const ApiTestPage = lazy(() => import('./components/pages/ApiTestPage'));
const HeroineGallery = lazy(() => import('./components/pages/HeroineGallery'));
const GameMenu = lazy(() => import('./components/pages/GameMenu'));
const Tutorial = lazy(() => import('./components/Tutorial'));
const CharacterInitialStates = lazy(() => import('./components/character/CharacterInitialStates'));
const MinigameHub = lazy(() => import('./components/pages/MinigameHub'));

// Route wrapper for lazy loaded components
const LazyRoute = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader message="페이지 로딩중..." />}>
    {children}
  </Suspense>
));

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
        headers: { 'Content-Type': 'application/json' },
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
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleCreateAccount = async (data: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
      return false;
    } catch (error) {
      console.error('Account creation error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Critical Routes (no lazy loading) */}
          <Route path="/" element={
            <Homepage isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/game" element={
            gameEnding ?
              <LazyRoute><EndingVariations /></LazyRoute> :
              <GameUI />
          } />

          {/* Lazy Loaded Routes */}
          <Route path="/account-creation" element={
            <LazyRoute><AccountCreation onCreateAccount={handleCreateAccount} /></LazyRoute>
          } />
          <Route path="/character-creation" element={
            <LazyRoute><CharacterCreation /></LazyRoute>
          } />
          <Route path="/game-info" element={
            <LazyRoute><GameInfo /></LazyRoute>
          } />
          <Route path="/game-intro" element={
            <LazyRoute><GameIntro /></LazyRoute>
          } />
          <Route path="/settings" element={
            <LazyRoute><Settings /></LazyRoute>
          } />

          {/* Game Systems */}
          <Route path="/dungeon-selection" element={
            <LazyRoute><DungeonSelection /></LazyRoute>
          } />
          <Route path="/dungeon" element={
            <LazyRoute><SimpleDungeonPage /></LazyRoute>
          } />
          <Route path="/diary" element={
            <LazyRoute><DiarySystem /></LazyRoute>
          } />
          <Route path="/heroine-stories" element={
            <LazyRoute><HeroineStorylines /></LazyRoute>
          } />
          <Route path="/save-load" element={
            <LazyRoute><SaveLoadSystem /></LazyRoute>
          } />
          <Route path="/shopping" element={
            <LazyRoute><ShoppingPage /></LazyRoute>
          } />
          <Route path="/characters" element={
            <LazyRoute><CharacterCardPage /></LazyRoute>
          } />

          {/* Features */}
          <Route path="/achievements" element={
            <LazyRoute><AchievementRewards /></LazyRoute>
          } />
          <Route path="/collection" element={
            <LazyRoute><Collection /></LazyRoute>
          } />
          <Route path="/quests" element={
            <LazyRoute><DailyQuests /></LazyRoute>
          } />
          <Route path="/calendar" element={
            <LazyRoute><EventCalendar /></LazyRoute>
          } />
          <Route path="/crafting" element={
            <LazyRoute><CraftingSystem /></LazyRoute>
          } />
          <Route path="/guild" element={
            <LazyRoute><GuildSystem /></LazyRoute>
          } />
          <Route path="/pets" element={
            <LazyRoute><PetSystem /></LazyRoute>
          } />

          {/* Mini Games */}
          <Route path="/fishing" element={
            <LazyRoute><FishingGame /></LazyRoute>
          } />
          <Route path="/card-matching" element={
            <LazyRoute><CardMatchingGame /></LazyRoute>
          } />
          <Route path="/quiz" element={
            <LazyRoute><QuizGame onComplete={(score) => console.log('Score:', score)} /></LazyRoute>
          } />
          <Route path="/rhythm" element={
            <LazyRoute><RhythmGame /></LazyRoute>
          } />
          <Route path="/puzzle" element={
            <LazyRoute><PuzzleGame /></LazyRoute>
          } />
          <Route path="/minigames" element={
            <LazyRoute><MinigameHub /></LazyRoute>
          } />

          {/* Social */}
          <Route path="/pvp" element={
            <LazyRoute><PvPBattleSystem /></LazyRoute>
          } />
          <Route path="/social" element={
            <LazyRoute><SocialSystem /></LazyRoute>
          } />
          <Route path="/clubs" element={
            <LazyRoute><ClubSystem /></LazyRoute>
          } />

          {/* Other Systems */}
          <Route path="/farming" element={
            <LazyRoute><FarmingSystem /></LazyRoute>
          } />
          <Route path="/housing" element={
            <LazyRoute><HousingSystem /></LazyRoute>
          } />
          <Route path="/enhancement" element={
            <LazyRoute><ItemEnhancement /></LazyRoute>
          } />
          <Route path="/weather" element={
            <LazyRoute><EnhancedWeatherSystem /></LazyRoute>
          } />
          <Route path="/dialogue" element={
            <LazyRoute><EnhancedDialogueSystem /></LazyRoute>
          } />
          <Route path="/gifts" element={
            <LazyRoute><GiftPreferenceSystem /></LazyRoute>
          } />
          <Route path="/seasonal-events" element={
            <LazyRoute><SeasonalEvents /></LazyRoute>
          } />
          <Route path="/ending" element={
            <LazyRoute><EndingVariations /></LazyRoute>
          } />
          <Route path="/romance-events" element={
            <LazyRoute><RomanceEvents /></LazyRoute>
          } />
          <Route path="/hidden-content" element={
            <LazyRoute><HiddenContent /></LazyRoute>
          } />

          {/* Other Pages */}
          <Route path="/heroines" element={
            <LazyRoute><HeroineGallery /></LazyRoute>
          } />
          <Route path="/game-menu" element={
            <LazyRoute><GameMenu /></LazyRoute>
          } />
          <Route path="/tutorial" element={
            <LazyRoute><Tutorial onComplete={() => {}} onSkip={() => {}} /></LazyRoute>
          } />
          <Route path="/character-meeting" element={
            <LazyRoute><CharacterInitialStates /></LazyRoute>
          } />
          <Route path="/api-test" element={
            <LazyRoute><ApiTestPage /></LazyRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;