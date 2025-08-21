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
  
  console.log('🔑 [GameScreens] playerId from GameContext:', playerId)
  console.log('🔑 [GameScreens] Full game context:', gameContext)
  
  // Check if player has joined the game
  const hasJoined = playerNames.has(playerId)
  
  // Debug logging
  console.log('🎮 [GameScreens] Render check:', {
    gamePhase,
    playerId,
    playerNamesSize: playerNames.size,
    playerNamesKeys: Array.from(playerNames.keys()),
    playerNamesEntries: Array.from(playerNames.entries()),
    hasJoined,
    willShowJoinScreen: !hasJoined
  })
  
  // Render appropriate screen based on game phase
  if (!hasJoined) {
    console.log('📱 [GameScreens] Showing JoinScreen because player not in playerNames')
    return <JoinScreen />
  }
  
  console.log(`📱 [GameScreens] Player joined, showing ${gamePhase || 'lobby'} screen`)
  
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