import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import MainMenu from './components/MainMenu';
import GameUI from './components/GameUI';
import EndingScreen from './components/EndingScreen';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);

  const gameState = useGameState();

  const handleNewGame = () => {
    gameState.actions.resetGame();
    setGameStarted(true);
    setShowMainMenu(false);
  };

  const handleContinue = () => {
    gameState.actions.loadGame();
    setGameStarted(true);
    setShowMainMenu(false);
  };

  const handleMainMenu = () => {
    setShowMainMenu(true);
    setGameStarted(false);
  };

  const handleRestart = () => {
    gameState.actions.resetGame();
    setGameStarted(true);
    setShowMainMenu(false);
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

  // Show ending screen if game has ended
  if (gameState.gameEnding) {
    return (
      <EndingScreen
        endingType={gameState.gameEnding}
        player={gameState.player}
        characters={gameState.characters}
        completedEvents={gameState.completedEvents}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  }

  // Show main menu
  if (showMainMenu) {
    return (
      <MainMenu
        onNewGame={handleNewGame}
        onContinue={handleContinue}
      />
    );
  }

  // Show game UI
  if (gameStarted) {
    const currentLocation = gameState.locations[gameState.player.location];

    return (
      <GameUI
        player={gameState.player}
        characters={gameState.characters}
        locations={gameState.locations}
        unlockedCharacters={gameState.unlockedCharacters}
        currentLocation={currentLocation}
        gameMessage={gameState.gameMessage}
        currentEvent={gameState.currentEvent}
        onMoveLocation={gameState.actions.moveToLocation}
        onPerformActivity={gameState.actions.performActivity}
        onAdvanceTime={gameState.actions.advanceTime}
        onHandleEventChoice={gameState.actions.handleEventChoice}
        onTalkToCharacter={handleTalkToCharacter}
        onUseItem={gameState.actions.useItem}
        onSaveGame={gameState.actions.saveGame}
        onLoadGame={gameState.actions.loadGame}
      />
    );
  }

  return null;
}

export default App;