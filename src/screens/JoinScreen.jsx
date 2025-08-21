import { useState, useEffect } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './JoinScreen.css'

export default function JoinScreen() {
  const { isConnected, isLeader, userProfile, playerId } = useBeemiSDK()
  const { joinGame, playerNames, resetGame } = useGame()
  const [name, setName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    // Pre-fill name from user profile
    if (userProfile && !name) {
      setName(userProfile.display_name || userProfile.username || '')
    }
  }, [userProfile, name])

  useEffect(() => {
    // Update status message
    if (!isConnected) {
      setStatusMessage('Connecting to server...')
    } else if (isLeader) {
      setStatusMessage("You're the room leader")
    } else {
      setStatusMessage('')
    }
  }, [isConnected, isLeader])

  useEffect(() => {
    // Check if player successfully joined
    console.log('🔍 [JoinScreen] Join detection check:', {
      isJoining,
      playerId,
      playerNamesSize: playerNames.size,
      playerNamesKeys: Array.from(playerNames.keys()),
      hasPlayerId: playerNames.has(playerId),
      playerNameValue: playerNames.get(playerId)
    })
    
    if (isJoining && playerId && playerNames.has(playerId)) {
      console.log('✅ [JoinScreen] Player successfully joined, resetting join state')
      setIsJoining(false)
      // The App.jsx will automatically transition to lobby
    }
  }, [isJoining, playerId, playerNames])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !isConnected || isJoining) return

    setIsJoining(true)
    const success = joinGame(name.trim())
    
    if (!success) {
      setStatusMessage('Failed to join game. Please try again.')
      setIsJoining(false)
    }
    // If success, the useEffect above will handle resetting isJoining
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the entire game? This will clear all game data but keep players in the room.')) {
      resetGame()
      setStatusMessage('Game has been reset')
    }
  }

  return (
    <section className="join-screen">
      <div className="join-container">
        <div className="join-content">
          <h1 className="game-title">🕵️‍♂️ Imposter</h1>
          <p className="game-subtitle">Find the imposter among your friends</p>
          
          {statusMessage && (
            <div className={`status-message ${isLeader ? 'leader-status' : 'player-status'}`}>
              {statusMessage}
            </div>
          )}
          
          {isLeader && (
            <button
              onClick={handleReset}
              className="reset-btn"
            >
              🔄 Reset Game
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="join-form">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="join-input"
              placeholder="Enter your name"
              maxLength={24}
              autoComplete="off"
              required
              disabled={!isConnected || isJoining}
            />
            <button
              type="submit"
              className="join-btn"
              disabled={!isConnected || !name.trim() || isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}