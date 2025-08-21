import { useState, useEffect, useRef } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import VotingGrid from '../components/VotingGrid'
import Timer from '../components/Timer'
import './VotingScreen.css'

export default function VotingScreen() {
  const { isLeader, playerId, setCRDT } = useBeemiSDK()
  const { 
    currentWord, 
    playerRoles,
    speakingOrder,
    deadPlayers,
    playerNames,
    playerVotes
  } = useGame()
  
  const [timeRemaining, setTimeRemaining] = useState(90)
  const timerRef = useRef(null)

  useEffect(() => {
    // Start countdown timer
    setTimeRemaining(90)
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])
  
  useEffect(() => {
    if (timeRemaining === 0 && isLeader) {
      console.log('⏰ Timer reached 0, ending voting phase')
      calculateAndPublishResults()
    }
  }, [timeRemaining, isLeader])

  const endVoting = () => {
    if (!isLeader) return
    
    console.log('⏰ Ending voting phase')
    
    // Calculate results and transition to results screen
    calculateAndPublishResults()
  }

  const calculateAndPublishResults = () => {
    // Calculate voting results
    const voteCounts = new Map()
    
    // Count all votes from all players
    Object.entries(playerVotes).forEach(([voterId, votes]) => {
      if (!deadPlayers.has(voterId) && typeof votes === 'object') {
        Object.entries(votes).forEach(([targetId, count]) => {
          const current = voteCounts.get(targetId) || 0
          voteCounts.set(targetId, current + count)
        })
      }
    })
    
    // Find player with most votes
    let maxVotes = 0
    let eliminatedPlayer = null
    let isTie = false
    
    voteCounts.forEach((count, playerId) => {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedPlayer = playerId
        isTie = false
      } else if (count === maxVotes && count > 0) {
        isTie = true
      }
    })
    
    // Determine game outcome
    let gameOver = false
    let winner = null
    
    if (!isTie && eliminatedPlayer) {
      const eliminatedRole = playerRoles[eliminatedPlayer]
      
      // Check win conditions
      const alivePlayers = Array.from(playerNames.keys()).filter(id => !deadPlayers.has(id) && id !== eliminatedPlayer)
      const aliveImposters = alivePlayers.filter(id => playerRoles[id] === 'imposter').length
      const aliveCivilians = alivePlayers.filter(id => playerRoles[id] === 'civilian').length
      
      if (eliminatedRole === 'imposter') {
        if (aliveImposters === 0) {
          gameOver = true
          winner = 'civilians'
        }
      } else {
        if (aliveImposters >= aliveCivilians) {
          gameOver = true
          winner = 'imposters'
        }
      }
      
      // Publish results
      const results = {
        eliminatedPlayer,
        eliminatedRole,
        maxVotes,
        isTie: false,
        gameOver,
        winner
      }
      
      setCRDT('voting-results', results)
    } else if (isTie || maxVotes === 0) {
      // Handle tie or no votes
      const results = {
        eliminatedPlayer: null,
        eliminatedRole: null,
        maxVotes: 0,
        isTie: true,
        gameOver: false,
        winner: null
      }
      
      setCRDT('voting-results', results)
    } else {
      // No votes were cast at all
      const results = {
        eliminatedPlayer: null,
        eliminatedRole: null,
        maxVotes: 0,
        isTie: true,
        gameOver: false,
        winner: null
      }
      
      setCRDT('voting-results', results)
    }
    
    // Transition to results screen
    setCRDT('game-phase', 'voting-results')
  }

  const handleEndVoting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    endVoting()
  }

  const isAlive = !deadPlayers.has(playerId)
  const myRole = playerRoles[playerId]
  const showWord = myRole !== 'imposter'

  return (
    <section className="voting-screen">
      <div className="voting-action-bar">
        {isLeader && (
          <button 
            onClick={handleEndVoting}
            className="leader-btn"
          >
            End Voting
          </button>
        )}
        
        <div className="word-display">
          {showWord && currentWord ? (
            <span className="word-badge">The word is {currentWord}</span>
          ) : myRole === 'imposter' ? (
            <span className="imposter-badge">You're the Imposter</span>
          ) : null}
        </div>
        
        <Timer timeRemaining={timeRemaining} />
      </div>

      {!isAlive && (
        <div className="voting-instructions">
          <p className="dead-message">You have been eliminated and cannot vote.</p>
        </div>
      )}

      <VotingGrid 
        speakingOrder={speakingOrder}
        canVote={isAlive}
      />
    </section>
  )
}