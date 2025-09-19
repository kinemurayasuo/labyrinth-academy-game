import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import GameUI from './components/GameUI';
import EndingScreen from './components/EndingScreen';
import Homepage from './components/Homepage';
import Login from './components/Login';
import CharacterCreation from './components/CharacterCreation';
import CharacterManagement from './components/CharacterManagement';
import DungeonMap from './components/DungeonMap';
import DungeonPage from './components/DungeonPage';
import ShoppingPage from './components/ShoppingPage';
import CharacterCardPage from './components/CharacterCardPage';
import AccountCreation from './components/AccountCreation';
import GameInfo from './components/GameInfo';
import Settings from './components/Settings';
import itemsData from './data/items.json';
import dungeonsData from './data/dungeons.json';
import type { DungeonFloor, Item } from './types/game';

const items = itemsData.items as Record<string, Item>;
const dungeonFloors = dungeonsData.floors as DungeonFloor[];

function App() {
  // Force rebuild - v0.0.1
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showCharacterManagement, setShowCharacterManagement] = useState(false);
  const [showDungeonMap, setShowDungeonMap] = useState(false);

  const gameState = useGameState();

  const handleLogin = (username: string, password: string) => {
    // Simple demo authentication
    if (username === 'demo' && password === 'password') {
      setIsLoggedIn(true);
      setUser({ username, email: 'demo@example.com' });
      return true;
    }
    return false;
  };

  const handleCreateAccount = (data: any) => {
    // Simulate account creation
    setIsLoggedIn(true);
    setUser({
      username: data.username,
      email: data.email,
    });
    return true;
  };

  const handleCreateCharacter = (data: any) => {
    // Apply character data to game state
    gameState.actions.resetGame(data);
    return true;
  };

  const handleStartGame = () => {
    if (!isLoggedIn) {
      alert('게임을 시작하려면 먼저 로그인해주세요.');
      return false;
    }
    // This will be handled by the Homepage component
    return true;
  };

  const handleLoadGame = () => {
    gameState.actions.loadGame();
  };

  const hasSavedGame = () => {
    return localStorage.getItem('academyDatingSim') !== null;
  };

  const handleTalkToCharacter = (characterId: string) => {
    const character = gameState.characters[characterId];
    if (!character) return;

    // Calculate dialogue based on affection
    const affection = gameState.player.affection[characterId] || 0;
    const dialogueKey = Object.keys(character.dialogues)
      .reverse()
      .find(key => affection >= parseInt(key)) || '0';

    const dialogue = character.dialogues[dialogueKey as keyof typeof character.dialogues];

    // Update affection
    gameState.actions.updateAffection(characterId, 5);

    // Show message (this would be better with a proper dialogue system)
    alert(`${character.name}: ${dialogue}`);
  };

  const handleEquipItem = (itemId: string, slot: string) => {
    // Handle equipment logic
    console.log(`Equipping ${itemId} to ${slot}`);
  };

  const handleUnequipItem = (slot: string) => {
    // Handle unequip logic
    console.log(`Unequipping from ${slot}`);
  };

  const handleMovePlayer = (newX: number, newY: number) => {
    // Handle player movement in dungeon
    console.log(`Moving player to ${newX}, ${newY}`);
    // TODO: Implement actual movement logic
  };

  const handleInteract = (x: number, y: number) => {
    // Handle interaction with dungeon cells
    console.log(`Interacting with cell at ${x}, ${y}`);
  };

  const handlePurchaseItem = (itemId: string, price: number) => {
    return gameState.actions.purchaseItem(itemId, price);
  };

  // Get current dungeon floor
  const getCurrentDungeonFloor = () => {
    return dungeonFloors.find(floor => floor.id === gameState.player.dungeonProgress.currentFloor) || dungeonFloors[0];
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Routes>
          <Route
            path="/"
            element={
              <Homepage
                onStartGame={handleStartGame}
                onLoadGame={handleLoadGame}
                hasSavedGame={hasSavedGame()}
                isLoggedIn={isLoggedIn}
                user={user}
              />
            }
          />

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route
            path="/account-creation"
            element={<AccountCreation onCreateAccount={handleCreateAccount} />}
          />

          <Route
            path="/character-creation"
            element={<CharacterCreation onCreateCharacter={handleCreateCharacter} />}
          />

          <Route
            path="/game-info"
            element={<GameInfo />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/dungeon"
            element={
              <DungeonPage
                player={gameState.player}
                currentFloor={getCurrentDungeonFloor()}
                onMovePlayer={handleMovePlayer}
                onInteract={handleInteract}
                onExitDungeon={() => {
                  // Handle exiting dungeon
                  console.log('Exiting dungeon...');
                }}
              />
            }
          />

          <Route
            path="/shopping"
            element={
              <ShoppingPage
                player={gameState.player}
                items={items}
                onPurchaseItem={handlePurchaseItem}
                onBackToGame={() => {
                  // Handle returning to game
                  console.log('Returning to game...');
                }}
              />
            }
          />

          <Route
            path="/characters"
            element={
              <CharacterCardPage
                characters={gameState.characters}
                player={gameState.player}
                unlockedCharacters={gameState.unlockedCharacters}
              />
            }
          />

          <Route
            path="/game"
            element={
              gameState.gameEnding ? (
                <EndingScreen
                  endingType={gameState.gameEnding}
                  player={gameState.player}
                  characters={gameState.characters}
                  completedEvents={gameState.completedEvents}
                  onRestart={() => {
                    gameState.actions.resetGame();
                    window.location.reload();
                  }}
                  onMainMenu={() => window.location.href = '/'}
                />
              ) : (
                <div className="relative">
                  <GameUI
                    player={gameState.player}
                    characters={gameState.characters}
                    locations={gameState.locations}
                    unlockedCharacters={gameState.unlockedCharacters}
                    currentLocation={gameState.locations[gameState.player.location]}
                    gameMessage={gameState.gameMessage}
                    currentEvent={gameState.currentEvent}
                    onMoveLocation={gameState.actions.moveToLocation}
                    onPerformActivity={(activityName: string) => gameState.actions.performActivity(activityName)}
                    onAdvanceTime={gameState.actions.advanceTime}
                    onHandleEventChoice={gameState.actions.handleEventChoice}
                    onTalkToCharacter={handleTalkToCharacter}
                    onUseItem={gameState.actions.useItem}
                    onSaveGame={gameState.actions.saveGame}
                    onLoadGame={gameState.actions.loadGame}
                  />


                  {/* Character Management Modal */}
                  {showCharacterManagement && (
                    <CharacterManagement
                      player={gameState.player}
                      characters={gameState.characters}
                      items={items}
                      unlockedCharacters={gameState.unlockedCharacters}
                      onEquipItem={handleEquipItem}
                      onUnequipItem={handleUnequipItem}
                      onClose={() => setShowCharacterManagement(false)}
                    />
                  )}

                  {/* Dungeon Map Modal */}
                  {showDungeonMap && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">던전 지도</h2>
                          <button
                            onClick={() => setShowDungeonMap(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                        <DungeonMap
                          player={gameState.player}
                          currentFloor={getCurrentDungeonFloor()}
                          onMovePlayer={handleMovePlayer}
                          onInteract={handleInteract}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;