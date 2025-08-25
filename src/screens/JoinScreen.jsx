import { useState, useEffect } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './JoinScreen.css'

export default function JoinScreen({ onExit }) {
  const { isConnected, isLeader, userProfile, playerId } = useBeemiSDK()
  const { joinGame, playerNames, resetGame } = useGame()
  const [name, setName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isResetting, setIsResetting] = useState(false)

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
    } else {
      setStatusMessage('')
    }
  }, [isConnected])

  useEffect(() => {
    // Check if player successfully joined
    if (isJoining && playerId && playerNames.has(playerId)) {
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
    if (isResetting) return
    
    if (confirm('Are you sure you want to reset the entire game? This will remove all players and restart from the beginning.')) {
      setIsResetting(true)
      resetGame()
      setStatusMessage('Game has been reset')
      
      // Re-enable button after 2 seconds to prevent rapid clicks
      setTimeout(() => {
        setIsResetting(false)
      }, 2000)
    }
  }

  const handleExit = () => {
    if (onExit) {
      onExit()
    }
  }

  return (
    <section className="join-screen">
      <div className="join-container">
        <div className="join-content">
          <h1 className="game-title">Imposter</h1>
          <p className="game-subtitle">Find the imposter among your friends</p>
          
          {statusMessage && (
            <div className="status-message player-status">
              {statusMessage}
            </div>
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
          
          <div className="bottom-controls">
            {isLeader && (
              <button
                onClick={handleReset}
                className="small-btn reset-btn"
                disabled={isResetting}
                style={{ opacity: isResetting ? 0.5 : 1 }}
              >
                {isResetting ? 'Resetting...' : 'Reset'}
              </button>
            )}
            <button
              onClick={handleExit}
              className="small-btn exit-btn"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}