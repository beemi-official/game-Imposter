import { useState, useRef, useEffect } from 'react'
import './VoterCircles.css'

export default function VoterCircles({ playerId, voters, hasPlayerVote }) {
  const [selectedCircle, setSelectedCircle] = useState(null)
  const containerRef = useRef(null)
  const labelTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (labelTimeoutRef.current) {
        clearTimeout(labelTimeoutRef.current)
      }
    }
  }, [])

  const handleCircleClick = (e, voter) => {
    e.stopPropagation()
    
    // Clear previous timeout
    if (labelTimeoutRef.current) {
      clearTimeout(labelTimeoutRef.current)
    }
    
    setSelectedCircle(voter.user)
    
    // Auto-hide after 3 seconds
    labelTimeoutRef.current = setTimeout(() => {
      setSelectedCircle(null)
    }, 3000)
  }

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase()
  }

  return (
    <div className="voter-circles-container" ref={containerRef}>
      {voters.map((voter, index) => (
        <div
          key={`${voter.user}-${index}`}
          className={`voter-circle ${voter.imageUrl ? '' : 'initials'} ${selectedCircle === voter.user ? 'selected' : ''}`}
          onClick={(e) => handleCircleClick(e, voter)}
          title={`${voter.user} (${voter.voteWeight} ${voter.voteWeight === 1 ? 'vote' : 'votes'})`}
          data-username={voter.user}
        >
          {voter.imageUrl ? (
            <img src={voter.imageUrl} alt={voter.user} />
          ) : (
            getInitials(voter.user)
          )}
          
          {voter.voteWeight > 1 && (
            <span className="vote-weight">×{voter.voteWeight}</span>
          )}
          
          {selectedCircle === voter.user && (
            <div className="username-label">
              {voter.user}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}