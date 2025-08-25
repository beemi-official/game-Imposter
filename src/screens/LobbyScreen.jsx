import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './LobbyScreen.css'

export default function LobbyScreen() {
  const { isLeader, maxPlayers } = useBeemiSDK()
  const { playerNames, gamePlayerCount, leaveGame, startGame } = useGame()

  const handleBack = () => {
    leaveGame()
  }

  const handleStart = () => {
    startGame()
  }

  const renderPlayerCards = () => {
    const cards = []
    const players = Array.from(playerNames.entries())
    const maxSlots = 4 // Fixed 2x2 grid like the original game
    
    for (let i = 0; i < maxSlots; i++) {
      const [playerId, name] = players[i] || []
      
      cards.push(
        <div key={i} className={`player-card ${name ? '' : 'empty'}`}>
          {name ? (
            <span className="player-name">{name}</span>
          ) : (
            <span className="waiting-text">Waiting for player...</span>
          )}
        </div>
      )
    }
    
    return cards
  }

  return (
    <section className="lobby-screen">
      <div className="lobby-action-bar">
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
        <div></div>
        {isLeader && (
          <span className="status-badge leader-badge">
            Leader
          </span>
        )}
      </div>
      
      <div className="lobby-container">
        <div className="lobby-content">
          <h1 className="lobby-title">Game Lobby</h1>
          <div className="players-section">
            <h2 className="section-title">Players</h2>
            <div className="players-grid">
              {renderPlayerCards()}
            </div>
          </div>
          
          <div className="lobby-footer">
            {isLeader ? (
              <button
                onClick={handleStart}
                className="start-btn"
                disabled={gamePlayerCount < 3}
              >
                {gamePlayerCount < 3 
                  ? `Need ${3 - gamePlayerCount} more player${3 - gamePlayerCount === 1 ? '' : 's'}`
                  : 'Start Game'
                }
              </button>
            ) : (
              <p className="waiting-msg">
                Waiting for leader to start...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}