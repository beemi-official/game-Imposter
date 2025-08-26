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
    let playerVoteTotals = {}
    Object.entries(playerVotes).forEach(([voterId, votes]) => {
      if (!deadPlayers.has(voterId) && typeof votes === 'object') {
        Object.entries(votes).forEach(([targetId, count]) => {
          if (counts.has(targetId)) {
            counts.set(targetId, counts.get(targetId) + count)
            playerVoteTotals[targetId] = (playerVoteTotals[targetId] || 0) + count
          }
        })
      }
    })
    
    // Add audience votes
    let audienceVoteTotals = {}
    audienceVotes.forEach((votes, targetId) => {
      if (counts.has(targetId)) {
        const audienceTotal = votes.reduce((sum, v) => sum + v.voteWeight, 0)
        counts.set(targetId, counts.get(targetId) + audienceTotal)
        audienceVoteTotals[targetId] = audienceTotal
      }
    })
    
    // Log final vote counts
    console.log('📊 Vote Count Calculation:', {
      playerVotes: playerVoteTotals,
      audienceVotes: audienceVoteTotals,
      totalCounts: Object.fromEntries(counts),
      playerNames: Object.fromEntries(
        Array.from(counts.entries()).map(([id, count]) => 
          [playerNames.get(id), count]
        )
      )
    })
    
    setVoteCounts(counts)
  }, [playerVotes, audienceVotes, speakingOrder, deadPlayers, playerNames])

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

  // Calculate total audience votes across ALL players in the game
  const totalAudienceVotesInGame = Array.from(audienceVotes.values()).reduce((total, voterList) => {
    return total + voterList.reduce((sum, v) => sum + v.voteWeight, 0)
  }, 0)
  
  // Calculate total player votes (each player vote is worth 5)
  const totalPlayerVotes = Array.from(playerVotes).reduce((total, [voterId, votes]) => {
    if (!deadPlayers.has(voterId) && typeof votes === 'object') {
      // Sum all the vote values for this player
      return total + Object.values(votes).reduce((sum, count) => sum + count, 0)
    }
    return total
  }, 0)
  
  // Total votes in game includes both player and audience votes
  const totalVotesInGame = totalAudienceVotesInGame + totalPlayerVotes

  console.log('🎯 Vote totals:', {
    audience: totalAudienceVotesInGame,
    players: totalPlayerVotes,
    total: totalVotesInGame
  })

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
          
          // Function to calculate relative circle size based on GLOBAL vote weight
          const getCircleScale = (weight) => {
            if (totalVotesInGame === 0) return 1
            const percentage = weight / totalVotesInGame
            // Use square root for more gradual scaling
            // Scale from 0.8x (minimum) to 1.5x (maximum)
            // Gentler range prevents any circle from being too dominant
            return 0.8 + (Math.sqrt(percentage) * 0.7)
          }
          
          return (
            <div key={id} className="player-vote-slot">
              <div className="player-info-header">
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
                <div className="voter-circles-container" id={`voter-circles-${id}`}>
                  {isSelected && (
                    <div 
                      className="voter-circle player-vote" 
                      title="Your vote (worth 5)"
                      style={{ transform: `scale(${getCircleScale(5)})` }}
                    >
                      YOU
                    </div>
                  )}
                  {voterList.map((voter, index) => {
                    const scale = getCircleScale(voter.voteWeight)
                    console.log(`Circle scale for ${voter.user}: ${scale.toFixed(2)} (${voter.voteWeight}/${totalVotesInGame})`)
                    return (
                      <div
                        key={`${voter.user}-${index}`}
                        className={`voter-circle ${voter.imageUrl ? '' : 'initials'}`}
                        title={`${voter.user} (${voter.voteWeight} ${voter.voteWeight === 1 ? 'vote' : 'votes'})`}
                        style={{ transform: `scale(${scale})` }}
                      >
                        {voter.imageUrl ? (
                          <img src={voter.imageUrl} alt={voter.user} />
                        ) : (
                          voter.user.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}