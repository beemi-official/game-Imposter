import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useBeemiSDK } from './BeemiSDKProvider'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const WORD_PAIRS = [
  { civilian: 'Pizza', imposter: 'Burger' },
  { civilian: 'Dog', imposter: 'Cat' },
  { civilian: 'Ocean', imposter: 'Lake' },
  { civilian: 'Mountain', imposter: 'Hill' },
  { civilian: 'Coffee', imposter: 'Tea' },
  { civilian: 'Book', imposter: 'Magazine' },
  { civilian: 'Phone', imposter: 'Tablet' },
  { civilian: 'Car', imposter: 'Bus' },
  { civilian: 'House', imposter: 'Apartment' },
  { civilian: 'Sun', imposter: 'Moon' },
  { civilian: 'Rain', imposter: 'Snow' },
  { civilian: 'Fire', imposter: 'Ice' },
  { civilian: 'Music', imposter: 'Podcast' },
  { civilian: 'Dance', imposter: 'Sing' },
  { civilian: 'Football', imposter: 'Basketball' },
  { civilian: 'Apple', imposter: 'Orange' },
  { civilian: 'Banana', imposter: 'Mango' },
  { civilian: 'Chair', imposter: 'Sofa' },
  { civilian: 'Table', imposter: 'Desk' },
  { civilian: 'School', imposter: 'University' },
  { civilian: 'Hospital', imposter: 'Clinic' },
  { civilian: 'Airport', imposter: 'Train Station' },
  { civilian: 'Beach', imposter: 'Pool' },
  { civilian: 'Forest', imposter: 'Jungle' },
  { civilian: 'Desert', imposter: 'Prairie' },
  { civilian: 'River', imposter: 'Stream' },
  { civilian: 'Bridge', imposter: 'Tunnel' },
  { civilian: 'Castle', imposter: 'Palace' },
  { civilian: 'Tower', imposter: 'Skyscraper' },
  { civilian: 'Garden', imposter: 'Park' },
  { civilian: 'Kitchen', imposter: 'Dining Room' },
  { civilian: 'Bedroom', imposter: 'Living Room' },
  { civilian: 'Library', imposter: 'Bookstore' },
  { civilian: 'Museum', imposter: 'Gallery' },
  { civilian: 'Theater', imposter: 'Cinema' },
  { civilian: 'Restaurant', imposter: 'Cafe' },
  { civilian: 'Hotel', imposter: 'Motel' },
  { civilian: 'Bicycle', imposter: 'Motorcycle' },
  { civilian: 'Train', imposter: 'Subway' },
  { civilian: 'Airplane', imposter: 'Helicopter' },
  { civilian: 'Boat', imposter: 'Ship' },
  { civilian: 'Camera', imposter: 'Video Camera' },
  { civilian: 'Computer', imposter: 'Laptop' },
  { civilian: 'Television', imposter: 'Monitor' },
  { civilian: 'Radio', imposter: 'Podcast Player' },
  { civilian: 'Flower', imposter: 'Tree' },
  { civilian: 'Butterfly', imposter: 'Moth' },
  { civilian: 'Bird', imposter: 'Bat' },
  { civilian: 'Fish', imposter: 'Dolphin' },
  { civilian: 'Lion', imposter: 'Tiger' },
  { civilian: 'Elephant', imposter: 'Rhino' },
  { civilian: 'Bear', imposter: 'Panda' },
  { civilian: 'Chocolate', imposter: 'Candy' },
  { civilian: 'Ice cream', imposter: 'Frozen Yogurt' },
  { civilian: 'Cake', imposter: 'Pie' },
  { civilian: 'Sandwich', imposter: 'Wrap' },
  { civilian: 'Soup', imposter: 'Stew' },
  { civilian: 'Salad', imposter: 'Coleslaw' },
  { civilian: 'Pasta', imposter: 'Noodles' },
  { civilian: 'Winter', imposter: 'Fall' },
  { civilian: 'Summer', imposter: 'Spring' },
  { civilian: 'Morning', imposter: 'Afternoon' },
  { civilian: 'Evening', imposter: 'Night' },
  { civilian: 'China', imposter: 'Japan' },
  { civilian: 'Water', imposter: 'Juice' },
  { civilian: 'Midnight', imposter: 'Dawn' }
]

export default function GameProvider({ children }) {
  const { 
    isConnected, 
    playerId, 
    isLeader, 
    roomPlayerCount,
    watchCRDT, 
    setCRDT, 
    getCRDT,
    onStreamChat,
    onStreamGift
  } = useBeemiSDK()
  

  // Game state
  const [gamePhase, setGamePhase] = useState('lobby')
  const [playerNames, setPlayerNames] = useState(new Map())
  const [gamePlayerCount, setGamePlayerCount] = useState(0)
  const [deadPlayers, setDeadPlayers] = useState(new Set())
  const [selectedVote, setSelectedVote] = useState(null)
  const [myLocalVote, setMyLocalVote] = useState(null)
  const [currentWord, setCurrentWord] = useState(null)
  const [playerRoles, setPlayerRoles] = useState({})
  const [playerVotes, setPlayerVotes] = useState({})
  const [votingResults, setVotingResults] = useState(null)
  const [speakingOrder, setSpeakingOrder] = useState([])
  const [audienceVotes, setAudienceVotes] = useState(new Map())
  const [audienceCurrentVote, setAudienceCurrentVote] = useState(new Map())
  const [audienceGiftCoins, setAudienceGiftCoins] = useState(new Map())
  
  // Refs for timers and state
  const votingTimerRef = useRef(null)
  const wordDisplayTimerRef = useRef(null)
  const autoSelectionTriggered = useRef(false)
  const wordTimerActive = useRef(false)
  const gamePlayers = useRef({})

  // Handle players update from CRDT
  const handlePlayersUpdate = useCallback((playersData) => {
    
    if (!playersData || typeof playersData !== 'object') {
      return
    }

    // Check if this looks like a partial update (only 1 player when we had more)
    const currentSize = playerNames.size
    const updateSize = Object.keys(playersData).length
    

    const newPlayerNames = new Map()
    Object.entries(playersData).forEach(([id, name]) => {
      newPlayerNames.set(id, name)
    })

    
    setPlayerNames(newPlayerNames)
    setGamePlayerCount(newPlayerNames.size)

    if (isLeader) {
      gamePlayers.current = playersData
    }

    // Setup vote watchers for all players
    setupVoteWatchers(newPlayerNames)
  }, [isLeader, playerNames.size])

  // Setup vote watchers
  const setupVoteWatchers = useCallback((players) => {
    if (!players || players.size === 0) return
    
    players.forEach((name, playerId) => {
      const aggregatedKey = `player-votes-${playerId}`
      
      watchCRDT(aggregatedKey, (votes) => {
        if (votes) {
          setPlayerVotes(prev => ({
            ...prev,
            [playerId]: votes
          }))
        } else {
          setPlayerVotes(prev => {
            const newVotes = { ...prev }
            delete newVotes[playerId]
            return newVotes
          })
        }
      })
    })
  }, [watchCRDT])

  // Handle game phase updates
  const handleGamePhaseUpdate = useCallback((phase) => {
    setGamePhase(phase)
    
    // Clear votes when starting a new voting round (but keep gift coins)
    if (phase === 'description-voting') {
      setSelectedVote(null)
      setMyLocalVote(null)
      setAudienceVotes(new Map())
      setAudienceCurrentVote(new Map())
      // Don't clear audienceGiftCoins - they should persist across rounds
    }
  }, [])

  // Handle role assignments
  const handleRoleAssignments = useCallback((roles) => {
    setPlayerRoles(roles || {})
  }, [])

  // Handle current word updates
  const handleCurrentWordUpdate = useCallback((word) => {
    setCurrentWord(word)
    
    if (gamePhase === 'game-start' && !wordTimerActive.current && word) {
      const myRole = playerRoles[playerId]
      if (myRole) {
        startWordDisplayTimer(myRole, word)
      }
    }
  }, [gamePhase, playerId, playerRoles])

  // Handle speaking order updates
  const handleSpeakingOrderUpdate = useCallback((order) => {
    setSpeakingOrder(order || [])
  }, [])

  // Handle voting results
  const handleVotingResults = useCallback((resultsData) => {
    setVotingResults(resultsData)
  }, [])

  // Handle game end updates
  const handleGameEndUpdate = useCallback((gameEndData) => {
    if (gameEndData && gameEndData.eliminatedPlayer) {
      setDeadPlayers(prev => new Set([...prev, gameEndData.eliminatedPlayer]))
    }
  }, [])

  // Handle game reset from leader
  const handleGameReset = useCallback(() => {
    
    // Clear all local state for every player
    setGamePhase('lobby')
    setPlayerRoles({})
    setCurrentWord(null)
    setSpeakingOrder([])
    setVotingResults(null)
    setDeadPlayers(new Set())
    setSelectedVote(null)
    setMyLocalVote(null)
    setAudienceVotes(new Map())
    setAudienceCurrentVote(new Map())
    setAudienceGiftCoins(new Map())
    setPlayerVotes({})
    
    // IMPORTANT: Clear player names to force everyone back to join screen
    setPlayerNames(new Map())
    setGamePlayerCount(0)
    
    // Clear refs
    autoSelectionTriggered.current = false
    wordTimerActive.current = false
    gamePlayers.current = {}
    
    // Clear any active timers
    if (votingTimerRef.current) {
      clearInterval(votingTimerRef.current)
      votingTimerRef.current = null
    }
    if (wordDisplayTimerRef.current) {
      clearTimeout(wordDisplayTimerRef.current)
      wordDisplayTimerRef.current = null
    }
    
  }, [])

  // Join game
  const joinGame = useCallback((name) => {
    if (!isConnected || !playerId) return false

    
    // If player is the leader, join immediately
    if (isLeader) {
      
      // Leader maintains the authoritative state locally
      gamePlayers.current[playerId] = name
      
      setCRDT('game-players', gamePlayers.current)
      
      // Clear any pending requests
      setCRDT('player-requests', {})
      
      return true
    }
    
    // Non-leaders send join request
    const requests = getCRDT('player-requests') || {}
    requests[playerId] = {
      playerId,
      name,
      action: 'join',
      timestamp: Date.now()
    }
    
    setCRDT('player-requests', requests)
    return true
  }, [isConnected, playerId, isLeader, getCRDT, setCRDT])

  // Leave game
  const leaveGame = useCallback(() => {
    if (!isConnected || !playerId) return

    
    if (isLeader) {
      // Leader leaves immediately
      delete gamePlayers.current[playerId]
      setCRDT('game-players', gamePlayers.current)
    } else {
      // Non-leader sends leave request
      const requests = getCRDT('player-requests') || {}
      requests[playerId] = {
        playerId,
        action: 'leave',
        timestamp: Date.now()
      }
      setCRDT('player-requests', requests)
    }
  }, [isConnected, playerId, isLeader, getCRDT, setCRDT])

  // Start game (leader only)
  const startGame = useCallback(() => {
    if (!isLeader || gamePlayerCount < 3) {
      return
    }

    
    // Assign roles
    const players = Array.from(playerNames.keys())
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const imposterCount = gamePlayerCount <= 4 ? 1 : 2
    
    const roles = {}
    shuffled.forEach((id, index) => {
      roles[id] = index < imposterCount ? 'imposter' : 'civilian'
    })
    
    // Select random word pair
    const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]
    
    // Create speaking order
    const order = [...players].sort(() => Math.random() - 0.5)
    
    // Update CRDT state
    setCRDT('player-roles', roles)
    setCRDT('current-word', wordPair)
    setCRDT('speaking-order', order)
    setCRDT('game-phase', 'game-start')
    
  }, [isLeader, gamePlayerCount, playerNames, setCRDT])

  // Submit vote
  const submitVote = useCallback((targetId) => {
    if (!playerId || deadPlayers.has(playerId)) return

    setSelectedVote(targetId)
    setMyLocalVote(targetId)
    
    // Calculate vote counts
    const voteCounts = {}
    voteCounts[targetId] = 5 // Player vote worth 5
    
    // Add audience votes
    audienceVotes.forEach((votes, targetPlayerId) => {
      if (targetPlayerId === targetId) {
        votes.forEach(vote => {
          voteCounts[targetId] = (voteCounts[targetId] || 0) + vote.voteWeight
        })
      }
    })
    
    setCRDT(`player-votes-${playerId}`, voteCounts)
  }, [playerId, deadPlayers, audienceVotes, setCRDT])

  // Process stream message (for audience voting)
  const processStreamMessage = useCallback((chatData) => {
    
    if (gamePhase !== 'description-voting') {
      return
    }
    
    const text = (chatData.message || chatData.text || '').trim()
    const username = chatData.user?.username || chatData.user?.name || 'Anonymous'
    const imageUrl = chatData.user?.imageUrl
    
    if (!text) {
      return
    }
    
    
    // Try to match text to player name (case insensitive)
    let matchedPlayer = null
    playerNames.forEach((name, id) => {
      if (!deadPlayers.has(id) && name.toLowerCase() === text.toLowerCase()) {
        matchedPlayer = { id, name }
      }
    })
    
    if (matchedPlayer) {
      const { id: targetId, name: targetName } = matchedPlayer
      
      // Calculate vote weight based on gifts
      const giftCoins = audienceGiftCoins.get(username) || 0
      const voteWeight = 1 + giftCoins
      
      // Update audience current vote
      setAudienceCurrentVote(prev => new Map(prev).set(username, targetId))
      
      // Update audience votes
      setAudienceVotes(prev => {
        const newVotes = new Map(prev)
        
        // Remove previous vote from this user
        prev.forEach((votes, playerId) => {
          const filtered = votes.filter(v => v.user !== username)
          if (filtered.length !== votes.length) {
            newVotes.set(playerId, filtered)
          }
        })
        
        // Add new vote with correct weight
        const targetVotes = newVotes.get(targetId) || []
        targetVotes.push({
          user: username,
          imageUrl: imageUrl,
          voteWeight: voteWeight
        })
        newVotes.set(targetId, targetVotes)
        
        return newVotes
      })
    } else {
    }
  }, [gamePhase, playerNames, deadPlayers, audienceGiftCoins])

  // Process gift event
  const processGiftEvent = useCallback((giftData) => {
    const username = giftData.user?.username || giftData.user?.name || 'Anonymous'
    const giftValue = giftData.gift?.coin_value || giftData.gift?.value || 0
    
    
    if (giftValue > 0) {
      // Update gift coins tracking
      setAudienceGiftCoins(prev => {
        const newCoins = new Map(prev)
        const currentCoins = newCoins.get(username) || 0
        const newTotal = currentCoins + giftValue
        newCoins.set(username, newTotal)
        return newCoins
      })
      
      // If user has already voted, update their vote weight
      if (gamePhase === 'description-voting') {
        const targetId = audienceCurrentVote.get(username)
        if (targetId && !deadPlayers.has(targetId)) {
          setAudienceVotes(prev => {
            const newVotes = new Map(prev)
            const targetVotes = newVotes.get(targetId) || []
            
            // Find and update existing vote
            const existingVoteIndex = targetVotes.findIndex(v => v.user === username)
            if (existingVoteIndex >= 0) {
              // Recalculate total vote weight
              const totalCoins = (audienceGiftCoins.get(username) || 0) + giftValue
              const newVoteWeight = 1 + totalCoins
              targetVotes[existingVoteIndex].voteWeight = newVoteWeight
            }
            
            newVotes.set(targetId, targetVotes)
            return newVotes
          })
        } else {
        }
      }
    }
  }, [gamePhase, audienceCurrentVote, deadPlayers, audienceGiftCoins])

  // Reset entire game (leader only)
  const resetGame = useCallback(() => {
    if (!isLeader) return
    
    
    // Clear all CRDT data
    setCRDT('game-phase', 'lobby')
    setCRDT('player-roles', null)
    setCRDT('current-word', null)
    setCRDT('speaking-order', null)
    setCRDT('voting-results', null)
    setCRDT('voting-timer', null)
    setCRDT('game-end', null)
    
    // Clear all player vote keys
    playerNames.forEach((_, playerId) => {
      setCRDT(`player-votes-${playerId}`, null)
    })
    
    // IMPORTANT: Clear all players to force everyone back to join screen
    setCRDT('game-players', {})
    setCRDT('player-requests', {})
    gamePlayers.current = {}
    
    // Trigger reset for all players
    setCRDT('game-reset', Date.now())
    
  }, [isLeader, setCRDT, playerNames])

  // Start word display timer
  const startWordDisplayTimer = useCallback((role, word) => {
    wordTimerActive.current = true
    
    wordDisplayTimerRef.current = setTimeout(() => {
      wordTimerActive.current = false
      
      if (isLeader) {
        setCRDT('game-phase', 'description-voting')
        
        // Start voting timer
        const timerData = {
          startTime: Date.now(),
          duration: 300000
        }
        setCRDT('voting-timer', timerData)
      }
    }, 5000)
  }, [isLeader, setCRDT])

  // Setup CRDT watchers
  useEffect(() => {
    if (!isConnected) return

    const unwatchers = []
    
    unwatchers.push(watchCRDT('game-players', handlePlayersUpdate))
    unwatchers.push(watchCRDT('game-phase', handleGamePhaseUpdate))
    unwatchers.push(watchCRDT('player-roles', handleRoleAssignments))
    unwatchers.push(watchCRDT('current-word', handleCurrentWordUpdate))
    unwatchers.push(watchCRDT('speaking-order', handleSpeakingOrderUpdate))
    unwatchers.push(watchCRDT('voting-results', handleVotingResults))
    unwatchers.push(watchCRDT('game-end', handleGameEndUpdate))
    unwatchers.push(watchCRDT('game-reset', handleGameReset))
    
    // Leader handles player requests
    if (isLeader) {
      unwatchers.push(watchCRDT('player-requests', (requests) => {
        handlePlayerRequests(requests)
      }))
    }
    
    return () => {
      unwatchers.forEach(unwatch => unwatch())
    }
  }, [
    isConnected, 
    isLeader,
    watchCRDT,
    setCRDT
  ])

  // Handle player requests (leader only)
  const handlePlayerRequests = useCallback((requests) => {
    if (!isLeader || !requests) return
    
    
    let updated = false
    
    Object.entries(requests).forEach(([id, request]) => {
      if (request.action === 'join' && !gamePlayers.current[id]) {
        // Add to leader's authoritative local state
        gamePlayers.current[id] = request.name
        updated = true
      } else if (request.action === 'leave' && gamePlayers.current[id]) {
        const leavingPlayerName = gamePlayers.current[id]
        delete gamePlayers.current[id]
        updated = true
      }
    })
    
    if (updated) {
      
      // Send the COMPLETE players list from leader's authoritative state
      setCRDT('game-players', gamePlayers.current)
      setCRDT('player-requests', {})
    }
  }, [isLeader, setCRDT])

  // Setup streaming integration
  useEffect(() => {
    if (!isConnected) return
    
    const unsubChat = onStreamChat((event) => {
      let chatData = event?.data || event
      if (chatData) {
        processStreamMessage(chatData)
      }
    })
    
    const unsubGift = onStreamGift((data) => {
      if (data) {
        processGiftEvent(data)
      }
    })
    
    return () => {
      if (unsubChat) unsubChat()
      if (unsubGift) unsubGift()
    }
  }, [isConnected, onStreamChat, onStreamGift, processStreamMessage, processGiftEvent])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (votingTimerRef.current) clearInterval(votingTimerRef.current)
      if (wordDisplayTimerRef.current) clearTimeout(wordDisplayTimerRef.current)
    }
  }, [])

  const value = {
    // Game state
    gamePhase,
    playerNames,
    gamePlayerCount,
    deadPlayers,
    selectedVote,
    myLocalVote,
    currentWord,
    playerRoles,
    playerVotes,
    votingResults,
    speakingOrder,
    audienceVotes,
    audienceGiftCoins,
    playerId,  // Add playerId to context value
    
    // Actions
    joinGame,
    leaveGame,
    startGame,
    submitVote,
    resetGame,
    
    // Helper functions
    startWordDisplayTimer
  }
  

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}