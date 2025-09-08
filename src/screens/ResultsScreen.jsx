import { useState, useEffect } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './ResultsScreen.css'

export default function ResultsScreen() {
  const { isLeader, setCRDT } = useBeemiSDK()
  const { 
    votingResults, 
    currentWord, 
    playerNames,
    playerRoles,
    deadPlayers 
  } = useGame()
  
  const [eliminationMessage, setEliminationMessage] = useState('')
  const [winnerMessage, setWinnerMessage] = useState('')
  const [winnerClass, setWinnerClass] = useState('')
  const [showWord, setShowWord] = useState(false)

  useEffect(() => {
    if (!votingResults) {
      // If no results yet, show loading or default message
      setEliminationMessage('Processing results...')
      setWinnerMessage('')
      setShowWord(false)
      return
    }

    const { 
      eliminatedPlayer, 
      eliminatedRole, 
      gameOver, 
      winner,
      isTie 
    } = votingResults

    if (isTie) {
      setEliminationMessage('It\'s a tie! No one was eliminated.')
      setWinnerMessage('')
      setShowWord(false)
      
      // Auto-restart voting after showing tie message
      if (isLeader) {
        setTimeout(() => {
          continueGame()
        }, 3000)
      }
    } else if (eliminatedPlayer) {
      const playerName = playerNames.get(eliminatedPlayer)
      const role = eliminatedRole || playerRoles[eliminatedPlayer]
      
      setEliminationMessage(`${playerName} was ${role === 'impostor' ? 'an Impostor' : 'a Civilian'}`)
      
      if (gameOver) {
        if (winner === 'impostors') {
          setWinnerMessage('🕵️ The Impostors Win!')
          setWinnerClass('impostor-win')
        } else {
          setWinnerMessage('👥 The Civilians Win!')
          setWinnerClass('civilian-win')
        }
        setShowWord(true)
      } else {
        setWinnerMessage('The game continues...')
        setWinnerClass('')
        setShowWord(false)
        
        // Auto-continue after delay if leader
        if (isLeader) {
          setTimeout(() => {
            continueGame()
          }, 5000)
        }
      }
    }
  }, [votingResults, playerNames, playerRoles, isLeader])

  const handleReturnToLobby = () => {
    if (!isLeader) return
    
    // Reset game state
    setCRDT('game-phase', 'lobby')
    setCRDT('player-roles', {})
    setCRDT('current-word', null)
    setCRDT('speaking-order', [])
    setCRDT('voting-results', null)
    setCRDT('game-end', null)
    
    // Clear all player votes
    playerNames.forEach((_, playerId) => {
      setCRDT(`player-votes-${playerId}`, null)
    })
  }

  const continueGame = () => {
    // Add eliminated player to dead players before continuing
    if (votingResults?.eliminatedPlayer) {
      const updatedDeadPlayers = new Set([...deadPlayers, votingResults.eliminatedPlayer])
      setCRDT('dead-players', Array.from(updatedDeadPlayers))
    }
    
    // Clear all player votes for fresh start
    playerNames.forEach((_, playerId) => {
      setCRDT(`player-votes-${playerId}`, null)
    })
    
    // Continue to next round
    setCRDT('game-phase', 'description-voting')
    setCRDT('voting-results', null)
    
    // Reset voting timer
    const timerData = {
      startTime: Date.now(),
      duration: 300000
    }
    setCRDT('voting-timer', timerData)
  }

  return (
    <section className="voting-results-screen">
      <div className="results-container">
        <div className="results-content">
          {eliminationMessage && (
            <h2 className={`elimination-title ${votingResults?.eliminatedRole || ''}`}>
              {eliminationMessage}
            </h2>
          )}
          
          {winnerMessage && (
            <h3 className={`winner-title ${winnerClass}`}>
              {winnerMessage}
            </h3>
          )}
          
          {showWord && currentWord && (
            <p className="word-reveal">
              {currentWord.civilian && currentWord.imposter ? (
                <>
                  The words were: <strong>{currentWord.civilian}</strong> (Civilians) / <strong>{currentWord.impostor}</strong> (Impostors)
                </>
              ) : (
                <>
                  The word was: <strong>{currentWord}</strong>
                </>
              )}
            </p>
          )}
          
          <div className="results-footer">
            {isLeader && votingResults?.gameOver && (
              <button 
                onClick={handleReturnToLobby}
                className="return-btn"
              >
                Return to Lobby
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}