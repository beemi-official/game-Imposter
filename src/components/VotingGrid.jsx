import { useState, useEffect } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import VoterCircles from './VoterCircles'
import './VotingGrid.css'

export default function VotingGrid({ speakingOrder, canVote }) {
  const { playerId } = useBeemiSDK()
  const { 
    playerNames, 
    deadPlayers,
    selectedVote,
    submitVote,
    playerVotes,
    audienceVotes
  } = useGame()
  
  const [voteCounts, setVoteCounts] = useState(new Map())

  useEffect(() => {
    // Calculate vote counts from all sources
    const counts = new Map()
    
    // Initialize counts
    speakingOrder.forEach(id => {
      counts.set(id, 0)
    })
    
    // Sum player votes
    Object.entries(playerVotes).forEach(([voterId, votes]) => {
      if (!deadPlayers.has(voterId) && typeof votes === 'object') {
        Object.entries(votes).forEach(([targetId, count]) => {
          if (counts.has(targetId)) {
            counts.set(targetId, counts.get(targetId) + count)
          }
        })
      }
    })
    
    // Add audience votes
    audienceVotes.forEach((votes, targetId) => {
      if (counts.has(targetId)) {
        const audienceTotal = votes.reduce((sum, v) => sum + v.voteWeight, 0)
        counts.set(targetId, counts.get(targetId) + audienceTotal)
      }
    })
    
    setVoteCounts(counts)
  }, [playerVotes, audienceVotes, speakingOrder, deadPlayers])

  const handleVote = (targetId) => {
    if (!canVote || deadPlayers.has(targetId)) return
    submitVote(targetId)
  }

  const getGridClass = () => {
    const playerCount = speakingOrder.length
    if (playerCount === 2) return 'voting-grid players-2'
    if (playerCount <= 4) return 'voting-grid players-4'
    return 'voting-grid'
  }

  return (
    <div className="voting-grid-container">
      <div className={getGridClass()}>
        {speakingOrder.map((id, index) => {
          const playerName = playerNames.get(id)
          const isDead = deadPlayers.has(id)
          const isMe = id === playerId
          const isSelected = selectedVote === id
          const voteCount = voteCounts.get(id) || 0
          const voterList = audienceVotes.get(id) || []
          
          return (
            <div key={id} className="player-card">
              <div className="player-header">
                <span className="player-square-name">{playerName}</span>
                <span className={`player-vote-badge ${voteCount > 0 ? '' : 'empty'}`}>
                  {voteCount}
                </span>
              </div>
              <div 
                className={`player-square ${isDead ? 'is-dead' : ''}`}
                onClick={() => handleVote(id)}
                data-player-id={id}
              >
                <VoterCircles 
                  playerId={id}
                  voters={voterList}
                  hasPlayerVote={isSelected}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}