import { useEffect } from 'react'
import './App.css'
import BeemiSDKProvider, { useBeemiSDK } from './providers/BeemiSDKProvider'
import GameProvider, { useGame } from './providers/GameProvider'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'
import GameStartScreen from './screens/GameStartScreen'
import VotingScreen from './screens/VotingScreen'
import ResultsScreen from './screens/ResultsScreen'
import DebugConsole from './components/DebugConsole'

function GameScreens() {
  const gameContext = useGame()
  const { gamePhase, playerNames, playerId } = gameContext
  
  // Check if player has joined the game
  const hasJoined = playerNames.has(playerId)
  
  // Render appropriate screen based on game phase
  if (!hasJoined) {
    return <JoinScreen />
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