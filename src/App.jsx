import { useEffect, useState } from 'react'
import './App.css'
import BeemiSDKProvider, { useBeemiSDK } from './providers/BeemiSDKProvider'
import GameProvider, { useGame } from './providers/GameProvider'
import WelcomeScreen from './screens/WelcomeScreen'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'
import GameStartScreen from './screens/GameStartScreen'
import VotingScreen from './screens/VotingScreen'
import ResultsScreen from './screens/ResultsScreen'
import DebugConsole from './components/DebugConsole'

function GameScreens() {
  const gameContext = useGame()
  const { gamePhase, playerNames, playerId } = gameContext
  const [showWelcome, setShowWelcome] = useState(true)
  
  // Handle start game from welcome screen
  const handleStartGame = () => {
    setShowWelcome(false)
  }
  
  // Handle exit from join screen back to welcome
  const handleExit = () => {
    setShowWelcome(true)
  }
  
  // Show welcome screen first
  if (showWelcome) {
    return <WelcomeScreen onStartGame={handleStartGame} />
  }
  
  // Check if player has joined the game
  const hasJoined = playerNames.has(playerId)
  
  // Render appropriate screen based on game phase
  if (!hasJoined) {
    return <JoinScreen onExit={handleExit} />
  }
  
  switch (gamePhase) {
    case 'lobby':
      return <LobbyScreen />
    case 'game-start':
      return <GameStartScreen />
    case 'description-voting':
      return <VotingScreen />
    case 'voting-results':
      return <ResultsScreen />
    default:
      return <LobbyScreen />
  }
}

function App() {
  return (
    <BeemiSDKProvider>
      <GameProvider>
        <div className="app">
          <GameScreens />
          <DebugConsole />
        </div>
      </GameProvider>
    </BeemiSDKProvider>
  )
}

export default App 