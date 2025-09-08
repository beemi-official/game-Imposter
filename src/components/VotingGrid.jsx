import { useState, useEffect, useRef } from 'react'
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
  const [clickedUserLabel, setClickedUserLabel] = useState(null) // {user, giftAmount, targetId, x, y}
  const labelTimeoutRef = useRef(null)
  const topGifterRefs = useRef({}) // Store refs to top gifter elements
  const [playerColors] = useState(() => {
    // Generate light pastel colors for each player
    const colors = new Map()
    const lightColors = [
      '#40E0D0', // Turquoise - teal
      '#9370DB', // Medium Purple - violet
      '#32CD32', // Lime Green - bright green
      '#FF6B6B', // Coral Red - salmon
      '#FFD700', // Gold - bright yellow
      '#8A2BE2', // Blue Violet - deep purple
      '#FF1493', // Deep Pink - hot pink
      '#3CB371', // Medium Sea Green - forest green
      '#FF8C00', // Dark Orange - orange
      '#4682B4', // Steel Blue - single blue
      '#DC143C', // Crimson - deep red
      '#9ACD32', // Yellow Green - chartreuse
      '#C71585', // Medium Violet Red - magenta
      '#D2691E', // Chocolate - brown
      '#FF6347', // Tomato - red-orange
      '#708090', // Slate Gray - gray
    ]
    
    speakingOrder.forEach((id, index) => {
      // Use modulo to cycle through colors if more players than colors
      colors.set(id, lightColors[index % lightColors.length])
    })
    
    return colors
  })
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (labelTimeoutRef.current) {
        clearTimeout(labelTimeoutRef.current)
      }
    }
  }, [])

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
  
  const handleVoterClick = (voter, targetId, event) => {
    event.stopPropagation() // Prevent triggering the square's vote handler
    
    // Clear existing timeout
    if (labelTimeoutRef.current) {
      clearTimeout(labelTimeoutRef.current)
    }
    
    // Calculate gift amount (subtract 1 for base vote)
    const giftAmount = voter.voteWeight - 1
    
    // Get click position
    const rect = event.currentTarget.getBoundingClientRect()
    
    // Set label to show
    setClickedUserLabel({
      user: voter.user,
      giftAmount: giftAmount,
      targetId: targetId,
      x: rect.left + rect.width / 2,
      y: rect.top - 35
    })
    
    // Set timeout to hide after 5 seconds
    labelTimeoutRef.current = setTimeout(() => {
      setClickedUserLabel(null)
    }, 5000)
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
          
          // Find top gifter for this square
          const topGifter = voterList.reduce((top, voter) => {
            if (!top || voter.voteWeight > top.voteWeight) {
              return voter
            }
            return top
          }, null)
          
          // Function to calculate relative circle size based on GLOBAL vote weight
          const getCircleScale = (weight) => {
            if (totalVotesInGame === 0) return 1
            
            // Use a hybrid approach: consider both absolute weight and percentage
            // This ensures circles grow as users accumulate more gifts
            const percentage = weight / totalVotesInGame
            
            // Logarithmic component based on absolute weight (grows with more gifts)
            // This ensures viewer circles grow as they gift more
            const absoluteScale = Math.log(weight + 1) / Math.log(101) // log base 101 for 0-100 range
            
            // Combine percentage and absolute scaling
            // 60% weight to absolute scale, 40% to percentage
            const combinedScale = (absoluteScale * 0.6) + (Math.sqrt(percentage) * 0.4)
            
            // Scale from 0.7x to 2.5x to allow more growth
            return 0.7 + (combinedScale * 1.8)
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
                style={{ 
                  backgroundColor: isDead ? '#f8f9fa' : playerColors.get(id),
                  borderColor: isDead ? '#6c757d' : '#e0e0e0'
                }}
              >
                <div className="voter-circles-container" id={`voter-circles-${id}`}>
                  {/* Show placeholder when no votes */}
                  {voteCount === 0 && !isSelected && (
                    <div className="vote-placeholder">
                      <span className="vote-placeholder-icon">💬</span>
                      <span className="vote-placeholder-text">Type {playerName} in the chat to vote</span>
                    </div>
                  )}
                  {isSelected && (
                    <div 
                      className="voter-circle player-vote" 
                      title="Your vote (worth 5)"
                      style={{ transform: `scale(${getCircleScale(5)})` }}
                    >
                      YOU
                    </div>
                  )}
                  {/* Sort voters by weight (ascending) so top gifter renders last (on top) */}
                  {[...voterList].sort((a, b) => a.voteWeight - b.voteWeight).map((voter, index) => {
                    const scale = getCircleScale(voter.voteWeight)
                    const isTopGifter = topGifter && topGifter.user === voter.user
                    const elementId = `${id}-${voter.user}`
                    
                    return (
                      <div
                        key={`${voter.user}-${index}`}
                        ref={isTopGifter ? (el) => { topGifterRefs.current[id] = el } : null}
                        id={elementId}
                        className={`voter-circle ${voter.imageUrl ? '' : 'initials'}`}
                        title={`${voter.user} (${voter.voteWeight} ${voter.voteWeight === 1 ? 'vote' : 'votes'})`}
                        style={{ 
                          transform: `scale(${scale})`,
                          zIndex: isTopGifter ? 50 : 10,
                          position: 'relative'
                        }}
                        onClick={(e) => handleVoterClick(voter, id, e)}
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
      
      {/* Permanent top gifter labels */}
      {speakingOrder.map((targetId) => {
        const voterList = audienceVotes.get(targetId) || []
        const topGifter = voterList.reduce((top, voter) => {
          if (!top || voter.voteWeight > top.voteWeight) {
            return voter
          }
          return top
        }, null)
        
        // Don't show top gifter label if it's currently clicked in this square
        const shouldHideTopGifter = clickedUserLabel && 
          clickedUserLabel.targetId === targetId &&
          clickedUserLabel.user !== topGifter?.user
        
        if (!topGifter || shouldHideTopGifter) return null
        
        const element = topGifterRefs.current[targetId]
        if (!element) return null
        
        const rect = element.getBoundingClientRect()
        
        return (
          <div
            key={`top-${targetId}`}
            className="voter-label"
            style={{
              position: 'fixed',
              left: `${rect.left + rect.width / 2}px`,
              top: `${rect.top - 35}px`,
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              zIndex: 999,
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            @{topGifter.user} 🎁: {topGifter.voteWeight - 1}
          </div>
        )
      })}
      
      {/* Clicked user label (temporary) */}
      {clickedUserLabel && (
        <div 
          className="voter-label clicked"
          style={{
            position: 'fixed',
            left: `${clickedUserLabel.x}px`,
            top: `${clickedUserLabel.y}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 102, 0.95)',
            color: 'black',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '700',
            zIndex: 1001,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          @{clickedUserLabel.user} 🎁: {clickedUserLabel.giftAmount}
        </div>
      )}
    </div>
  )
}