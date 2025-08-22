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
  { civilian: 'UK', imposter: 'Ireland' },
  { civilian: 'Lightbulb', imposter: 'Candle' },
  { civilian: 'Beyoncé', imposter: 'Rihanna' },
  { civilian: 'Stockholm', imposter: 'Gothenburg' },
  { civilian: 'Rome', imposter: 'Milan' },
  { civilian: 'Brazil', imposter: 'Argentina' },
  { civilian: 'Wi-Fi', imposter: 'Bluetooth' },
  { civilian: 'Rain', imposter: 'Snow' },
  { civilian: 'Victoria Falls', imposter: 'Angel Falls' },
  { civilian: 'Jeff Bezos', imposter: 'Elon Musk' },
  { civilian: 'Paris', imposter: 'London' },
  { civilian: 'Neil deGrasse Tyson', imposter: 'Stephen Hawking' },
  { civilian: 'Apple', imposter: 'Samsung' },
  { civilian: 'Deep', imposter: 'Shallow' },
  { civilian: 'Munich', imposter: 'Frankfurt' },
  { civilian: 'Neil Armstrong', imposter: 'Buzz Aldrin' },
  { civilian: 'Berlin', imposter: 'Munich' },
  { civilian: 'Day', imposter: 'Night' },
  { civilian: 'Book', imposter: 'Newspaper' },
  { civilian: 'Paris', imposter: 'Lyon' },
  { civilian: 'Soap', imposter: 'Detergent' },
  { civilian: 'George Washington', imposter: 'Abraham Lincoln' },
  { civilian: 'Sydney', imposter: 'Melbourne' },
  { civilian: 'Doha', imposter: 'Dubai' },
  { civilian: 'Barcelona', imposter: 'Seville' },
  { civilian: 'Spain', imposter: 'Portugal' },
  { civilian: 'Amazon River', imposter: 'Nile River' },
  { civilian: 'Osaka', imposter: 'Nagoya' },
  { civilian: 'Lisbon', imposter: 'Porto' },
  { civilian: 'Mount Everest', imposter: 'Mount Kilimanjaro' },
  { civilian: 'Addis Ababa', imposter: 'Nairobi' },
  { civilian: 'Key', imposter: 'Card' },
  { civilian: 'Toronto', imposter: 'Vancouver' },
  { civilian: 'Open', imposter: 'Close' },
  { civilian: 'Sahara Desert', imposter: 'Amazon Rainforest' },
  { civilian: 'Cash', imposter: 'Card' },
  { civilian: 'KFC', imposter: 'McDonald\'s' },
  { civilian: 'Chair', imposter: 'Sofa' },
  { civilian: 'Tram', imposter: 'Bus' },
  { civilian: 'Camera', imposter: 'Camcorder' },
  { civilian: 'Tokyo', imposter: 'Seoul' },
  { civilian: 'Madrid', imposter: 'Barcelona' },
  { civilian: 'Clock', imposter: 'Watch' },
  { civilian: 'Sofia', imposter: 'Plovdiv' },
  { civilian: 'Sweden', imposter: 'Norway' },
  { civilian: 'Shoe', imposter: 'Sock' },
  { civilian: 'Kanye West', imposter: 'Jay-Z' },
  { civilian: 'Doha', imposter: 'Al Rayyan' },
  { civilian: 'Beijing', imposter: 'Shanghai' },
  { civilian: 'Teacher', imposter: 'Student' },
  { civilian: 'Kylian Mbappé', imposter: 'Erling Haaland' },
  { civilian: 'Machu Picchu', imposter: 'Chichen Itza' },
  { civilian: 'Laptop', imposter: 'Tablet' },
  { civilian: 'Clock', imposter: 'Calendar' },
  { civilian: 'Queen Elizabeth II', imposter: 'King Charles III' },
  { civilian: 'Mexico City', imposter: 'Monterrey' },
  { civilian: 'Strong', imposter: 'Weak' },
  { civilian: 'Victoria Falls', imposter: 'Niagara Falls' },
  { civilian: 'Greece', imposter: 'Turkey' },
  { civilian: 'Johannesburg', imposter: 'Cape Town' },
  { civilian: 'Bike', imposter: 'Motorcycle' },
  { civilian: 'Coldplay', imposter: 'Maroon 5' },
  { civilian: 'Window', imposter: 'Door' },
  { civilian: 'Italy', imposter: 'Greece' },
  { civilian: 'Mexico', imposter: 'Brazil' },
  { civilian: 'Taxi', imposter: 'Uber' },
  { civilian: 'Germany', imposter: 'France' },
  { civilian: 'Paris', imposter: 'Marseille' },
  { civilian: 'Johannesburg', imposter: 'Pretoria' },
  { civilian: 'Toronto', imposter: 'Montreal' },
  { civilian: 'Singapore', imposter: 'Hong Kong' },
  { civilian: 'Cat', imposter: 'Dog' },
  { civilian: 'Hot', imposter: 'Warm' },
  { civilian: 'Washington, D.C.', imposter: 'New York City' },
  { civilian: 'Mount Fuji', imposter: 'Mount Everest' },
  { civilian: 'Serena Williams', imposter: 'Venus Williams' },
  { civilian: 'Tea', imposter: 'Coffee' },
  { civilian: 'Riyadh', imposter: 'Jeddah' },
  { civilian: 'Lagos', imposter: 'Abuja' },
  { civilian: 'Africa', imposter: 'Asia' },
  { civilian: 'Madrid', imposter: 'Seville' },
  { civilian: 'Guitar', imposter: 'Piano' },
  { civilian: 'Knife', imposter: 'Spoon' },
  { civilian: 'Apple', imposter: 'Banana' },
  { civilian: 'Bacteria', imposter: 'Virus' },
  { civilian: 'Leonardo DiCaprio', imposter: 'Brad Pitt' },
  { civilian: 'Istanbul', imposter: 'Ankara' },
  { civilian: 'Cairo', imposter: 'Alexandria' },
  { civilian: 'Drake', imposter: 'Kendrick Lamar' },
  { civilian: 'Gentle', imposter: 'Harsh' },
  { civilian: 'Michael Jackson', imposter: 'Prince' },
  { civilian: 'United States', imposter: 'Mexico' },
  { civilian: 'China', imposter: 'Japan' },
  { civilian: 'Beijing', imposter: 'Guangzhou' },
  { civilian: 'MrBeast', imposter: 'PewDiePie' },
  { civilian: 'Sushi', imposter: 'Pizza' },
  { civilian: 'Taylor Swift', imposter: 'Adele' },
  { civilian: 'Open', imposter: 'Closed' },
  { civilian: 'Phone', imposter: 'Watch' },
  { civilian: 'Mexico City', imposter: 'Guadalajara' },
  { civilian: 'Bangkok', imposter: 'Phuket' },
  { civilian: 'Inside', imposter: 'Outside' },
  { civilian: 'Bag', imposter: 'Box' },
  { civilian: 'Machu Picchu', imposter: 'Petra' },
  { civilian: 'Run', imposter: 'Walk' },
  { civilian: 'Athens', imposter: 'Rome' },
  { civilian: 'Bike', imposter: 'Scooter' },
  { civilian: 'Ethiopia', imposter: 'Kenya' },
  { civilian: 'Camera', imposter: 'Phone' },
  { civilian: 'LeBron James', imposter: 'Michael Jordan' },
  { civilian: 'Cairo', imposter: 'Giza' },
  { civilian: 'Sydney Opera House', imposter: 'Harbour Bridge' },
  { civilian: 'Oprah Winfrey', imposter: 'Ellen DeGeneres' },
  { civilian: 'New York', imposter: 'Los Angeles' },
  { civilian: 'Washington', imposter: 'Lincoln' },
  { civilian: 'Amsterdam', imposter: 'Rotterdam' },
  { civilian: 'Seoul', imposter: 'Busan' },
  { civilian: 'Bread', imposter: 'Rice' },
  { civilian: 'Happy', imposter: 'Sad' },
  { civilian: 'Swamp', imposter: 'Grassland' },
  { civilian: 'Berlin', imposter: 'Hamburg' },
  { civilian: 'Blue', imposter: 'Red' },
  { civilian: 'Gandhi', imposter: 'Nehru' },
  { civilian: 'Rafael Nadal', imposter: 'Roger Federer' },
  { civilian: 'Hat', imposter: 'Scarf' },
  { civilian: 'Dwayne Johnson', imposter: 'Kevin Hart' },
  { civilian: 'Cup', imposter: 'Bowl' },
  { civilian: 'Saudi Arabia', imposter: 'United Arab Emirates' },
  { civilian: 'Pen', imposter: 'Pencil' },
  { civilian: 'Grand Canyon', imposter: 'Great Barrier Reef' },
  { civilian: 'Chris Evans', imposter: 'Robert Downey Jr.' },
  { civilian: 'Tokyo', imposter: 'Osaka' },
  { civilian: 'Early', imposter: 'Late' },
  { civilian: 'Sahara Desert', imposter: 'Kalahari Desert' },
  { civilian: 'Qatar', imposter: 'Bahrain' },
  { civilian: 'United Kingdom', imposter: 'Ireland' },
  { civilian: 'Pen', imposter: 'Marker' },
  { civilian: 'City', imposter: 'Village' },
  { civilian: 'Madrid', imposter: 'Valencia' },
  { civilian: 'Serengeti', imposter: 'Maasai Mara' },
  { civilian: 'Fork', imposter: 'Spoon' },
  { civilian: 'Winston Churchill', imposter: 'Franklin D. Roosevelt' },
  { civilian: 'Burger King', imposter: 'McDonald\'s' },
  { civilian: 'Pepsi', imposter: 'Coca-Cola' },
  { civilian: 'India', imposter: 'Pakistan' },
  { civilian: 'Cup', imposter: 'Mug' },
  { civilian: 'Canada', imposter: 'USA' },
  { civilian: 'Road', imposter: 'Path' },
  { civilian: 'Nairobi', imposter: 'Mombasa' },
  { civilian: 'Eiffel Tower', imposter: 'Statue of Liberty' },
  { civilian: 'Switzerland', imposter: 'Austria' },
  { civilian: 'India', imposter: 'Bangladesh' },
  { civilian: 'Taylor Swift', imposter: 'Ed Sheeran' },
  { civilian: 'Bank', imposter: 'Market' },
  { civilian: 'Push', imposter: 'Pull' },
  { civilian: 'Steve Jobs', imposter: 'Bill Gates' },
  { civilian: 'Battery', imposter: 'Charger' },
  { civilian: 'Water', imposter: 'Juice' },
  { civilian: 'Read', imposter: 'Write' },
  { civilian: 'Dubai', imposter: 'Abu Dhabi' },
  { civilian: 'Russia', imposter: 'Ukraine' },
  { civilian: 'Salt', imposter: 'Pepper' },
  { civilian: 'Hot', imposter: 'Cold' },
  { civilian: 'Japan', imposter: 'South Korea' },
  { civilian: 'Lionel Messi', imposter: 'Cristiano Ronaldo' },
  { civilian: 'Times Square', imposter: 'Piccadilly Circus' },
  { civilian: 'Bank', imposter: 'Money' }
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
  
  console.log('🎯 [GameProvider] Current playerId from BeemiSDK:', playerId)

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
    console.log('👥 [handlePlayersUpdate] Players data updated:', playersData)
    console.log('👥 [handlePlayersUpdate] Data type:', typeof playersData)
    console.log('👥 [handlePlayersUpdate] Data keys:', playersData ? Object.keys(playersData) : 'null')
    console.log('👥 [handlePlayersUpdate] Number of players in update:', playersData ? Object.keys(playersData).length : 0)
    
    if (!playersData || typeof playersData !== 'object') {
      console.log('❌ [handlePlayersUpdate] Invalid players data received')
      return
    }

    // Check if this looks like a partial update (only 1 player when we had more)
    const currentSize = playerNames.size
    const updateSize = Object.keys(playersData).length
    
    if (currentSize > 1 && updateSize === 1 && !isLeader) {
      console.log('⚠️ [handlePlayersUpdate] Received partial update, this might be a bug')
    }

    const newPlayerNames = new Map()
    Object.entries(playersData).forEach(([id, name]) => {
      console.log(`  - Adding player: ${id} -> ${name}`)
      newPlayerNames.set(id, name)
    })

    console.log('📊 [handlePlayersUpdate] Created Map with entries:', Array.from(newPlayerNames.entries()))
    console.log('📊 [handlePlayersUpdate] Map size:', newPlayerNames.size)
    
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
        console.log(`📊 Vote counts received from ${playerId}:`, votes)
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
    console.log(`🎯 Game phase changed to: ${phase}`)
    setGamePhase(phase)
    
    // Clear votes when starting a new voting round (but keep gift coins)
    if (phase === 'description-voting') {
      setSelectedVote(null)
      setMyLocalVote(null)
      setAudienceVotes(new Map())
      setAudienceCurrentVote(new Map())
      // Don't clear audienceGiftCoins - they should persist across rounds
      console.log('🔄 Cleared votes for new voting round (gift coins preserved)')
    }
  }, [])

  // Handle role assignments
  const handleRoleAssignments = useCallback((roles) => {
    console.log('🎭 Player roles updated:', roles)
    setPlayerRoles(roles || {})
  }, [])

  // Start word display timer
  const startWordDisplayTimer = useCallback((role, word) => {
    wordTimerActive.current = true
    
    wordDisplayTimerRef.current = setTimeout(() => {
      console.log('⏰ Word display timer ended, transitioning to voting phase')
      wordTimerActive.current = false
      
      if (isLeader) {
        setCRDT('game-phase', 'description-voting')
        
        // Start voting timer
        const timerData = {
          startTime: Date.now(),
          duration: 90000
        }
        setCRDT('voting-timer', timerData)
      }
    }, 5000)
  }, [isLeader, setCRDT])

  // Handle current word updates
  const handleCurrentWordUpdate = useCallback((wordData) => {
    console.log('📝 Current word updated:', wordData)
    setCurrentWord(wordData)
    
    if (gamePhase === 'game-start' && !wordTimerActive.current && wordData) {
      console.log('⏰ Word received late, starting timer now')
      const myRole = playerRoles[playerId]
      if (myRole) {
        // Get the appropriate word for this player
        let word = ''
        if (wordData.civilian && wordData.imposter) {
          word = myRole === 'imposter' ? wordData.imposter : wordData.civilian
        } else {
          word = myRole === 'imposter' ? 'IMPOSTER' : wordData
        }
        startWordDisplayTimer(myRole, word)
      }
    }
  }, [gamePhase, playerId, playerRoles, startWordDisplayTimer])

  // Handle speaking order updates
  const handleSpeakingOrderUpdate = useCallback((order) => {
    console.log('📋 Speaking order updated:', order)
    setSpeakingOrder(order || [])
  }, [])

  // Handle voting results
  const handleVotingResults = useCallback((resultsData) => {
    console.log('📊 Voting results updated:', resultsData)
    setVotingResults(resultsData)
  }, [])

  // Handle game end updates
  const handleGameEndUpdate = useCallback((gameEndData) => {
    console.log('🎬 Game end updated:', gameEndData)
    if (gameEndData && gameEndData.eliminatedPlayer) {
      setDeadPlayers(prev => new Set([...prev, gameEndData.eliminatedPlayer]))
    }
  }, [])

  // Handle game reset from leader
  const handleGameReset = useCallback(() => {
    console.log('🔄 Game reset received - clearing all local state')
    
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
    
    console.log('🔄 All local state cleared - players must rejoin')
  }, [])

  // Join game
  const joinGame = useCallback((name) => {
    if (!isConnected || !playerId) return false

    console.log(`🎮 Requesting to join game as: ${name}`)
    
    // If player is the leader, join immediately
    if (isLeader) {
      console.log('👑 Leader joining game directly')
      
      // Leader maintains the authoritative state locally
      gamePlayers.current[playerId] = name
      
      console.log('👑 Leader updating game-players directly:', gamePlayers.current)
      console.log('👑 Leader game-players keys:', Object.keys(gamePlayers.current))
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

    console.log('👋 Leaving game...')
    
    if (isLeader) {
      // Leader leaves immediately
      delete gamePlayers.current[playerId]
      console.log('👑 Leader updating game-players after leaving:', gamePlayers.current)
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
      console.log('❌ Cannot start game: not leader or not enough players')
      return
    }

    console.log('🚀 Starting game...')
    
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
    setCRDT('current-word', wordPair)  // Store both civilian and imposter words
    setCRDT('speaking-order', order)
    setCRDT('game-phase', 'game-start')
    
    console.log('✅ Game started with roles:', roles)
  }, [isLeader, gamePlayerCount, playerNames, setCRDT])

  // Submit vote
  const submitVote = useCallback((targetId) => {
    if (!playerId || deadPlayers.has(playerId)) return

    console.log(`🗳️ [VOTE] Player ${playerId} voting for ${targetId}`)
    setSelectedVote(targetId)
    setMyLocalVote(targetId)
    
    // Calculate vote counts
    const voteCounts = {}
    voteCounts[targetId] = 5 // Player vote worth 5
    console.log(`🗳️ [VOTE] Base player vote: 5 points`)
    
    // Add audience votes
    let audienceTotal = 0
    audienceVotes.forEach((votes, targetPlayerId) => {
      if (targetPlayerId === targetId) {
        console.log(`🗳️ [VOTE] Found ${votes.length} audience votes for ${targetId}`)
        votes.forEach(vote => {
          console.log(`🗳️ [VOTE]   - ${vote.user}: weight ${vote.voteWeight}`)
          audienceTotal += vote.voteWeight
          voteCounts[targetId] = (voteCounts[targetId] || 0) + vote.voteWeight
        })
      }
    })
    
    console.log(`🗳️ [VOTE] Total for ${targetId}: ${voteCounts[targetId]} (5 player + ${audienceTotal} audience)`)
    setCRDT(`player-votes-${playerId}`, voteCounts)
  }, [playerId, deadPlayers, audienceVotes, setCRDT])

  // Process stream message (for audience voting)
  const processStreamMessage = useCallback((chatData) => {
    console.log('💬 Stream message received:', chatData)
    
    if (gamePhase !== 'description-voting') {
      console.log('⏸️ Not processing - game phase is:', gamePhase)
      return
    }
    
    const text = (chatData.message || chatData.text || '').trim()
    const username = chatData.user?.username || chatData.user?.name || 'Anonymous'
    const imageUrl = chatData.user?.imageUrl
    
    if (!text) {
      console.log('❌ No text in message')
      return
    }
    
    console.log(`🔍 Trying to match "${text}" to a player name`)
    
    // Try to match text to player name (case insensitive)
    let matchedPlayer = null
    playerNames.forEach((name, id) => {
      if (!deadPlayers.has(id) && name.toLowerCase() === text.toLowerCase()) {
        matchedPlayer = { id, name }
      }
    })
    
    if (matchedPlayer) {
      const { id: targetId, name: targetName } = matchedPlayer
      console.log(`✅ Matched! "${text}" -> ${targetName} (${targetId})`)
      
      // Calculate vote weight based on gifts
      const giftCoins = audienceGiftCoins.get(username) || 0
      const voteWeight = 1 + giftCoins
      console.log(`💰 [AUDIENCE VOTE] ${username} voting for ${targetName}`)
      console.log(`💰 [AUDIENCE VOTE] ${username} has ${giftCoins} gift coins`)
      console.log(`💰 [AUDIENCE VOTE] Vote weight: ${voteWeight} (1 base + ${giftCoins} coins)`)
      
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
        
        console.log(`📺 Audience vote recorded: ${username} voted for ${targetName} with weight ${voteWeight}`)
        return newVotes
      })
    } else {
      console.log(`❌ No match found for "${text}"`)
      console.log('Available players:', Array.from(playerNames.values()))
    }
  }, [gamePhase, playerNames, deadPlayers, audienceGiftCoins])

  // Process gift event
  const processGiftEvent = useCallback((giftData) => {
    console.log('🎁 Gift event received:', giftData)
    
    const username = giftData.user?.username || giftData.user?.name || 'Anonymous'
    const giftValue = giftData.gift?.coin_value || giftData.gift?.value || 0
    
    console.log(`🎁 Gift from ${username}: ${giftValue} coins`)
    
    if (giftValue > 0) {
      // Calculate new total coins for this user
      const currentCoins = audienceGiftCoins.get(username) || 0
      const newTotal = currentCoins + giftValue
      
      console.log(`💰 [GIFT] ${username} gifted ${giftValue} coins`)
      console.log(`💰 [GIFT] ${username} previous total: ${currentCoins} coins`)
      console.log(`💰 [GIFT] ${username} new total: ${newTotal} coins`)
      
      // Update gift coins tracking
      setAudienceGiftCoins(prev => {
        const newCoins = new Map(prev)
        newCoins.set(username, newTotal)
        return newCoins
      })
      
      // If user has already voted, update their vote weight
      if (gamePhase === 'description-voting') {
        const targetId = audienceCurrentVote.get(username)
        console.log(`🎁 [GIFT] Checking if ${username} has voted: ${targetId ? 'Yes' : 'No'}`)
        
        if (targetId && !deadPlayers.has(targetId)) {
          setAudienceVotes(prev => {
            const newVotes = new Map(prev)
            const targetVotes = newVotes.get(targetId) || []
            
            // Find and update existing vote
            const existingVoteIndex = targetVotes.findIndex(v => v.user === username)
            if (existingVoteIndex >= 0) {
              // Use the correctly calculated newTotal (not reading from state)
              const newVoteWeight = 1 + newTotal
              const oldVoteWeight = targetVotes[existingVoteIndex].voteWeight
              targetVotes[existingVoteIndex].voteWeight = newVoteWeight
              console.log(`🎁 [GIFT] Updated ${username}'s vote weight: ${oldVoteWeight} -> ${newVoteWeight} (base 1 + ${newTotal} coins)`)
            }
            
            newVotes.set(targetId, targetVotes)
            return newVotes
          })
        } else {
          console.log(`🎁 [GIFT] ${username} hasn't voted yet, ${newTotal} coins saved for when they vote`)
        }
      }
    }
  }, [gamePhase, audienceCurrentVote, deadPlayers, audienceGiftCoins])

  // Reset entire game (leader only)
  const resetGame = useCallback(() => {
    if (!isLeader) return
    
    console.log('🔄 Resetting entire game...')
    
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
    
    console.log('🔄 Game reset triggered for all players - all players cleared')
  }, [isLeader, setCRDT, playerNames])

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
        console.log('📨 Player requests updated:', requests)
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
    
    console.log('🎯 [handlePlayerRequests] Processing requests:', requests)
    console.log('🎯 [handlePlayerRequests] Current gamePlayers.current:', gamePlayers.current)
    
    let updated = false
    
    Object.entries(requests).forEach(([id, request]) => {
      if (request.action === 'join' && !gamePlayers.current[id]) {
        // Add to leader's authoritative local state
        gamePlayers.current[id] = request.name
        updated = true
        console.log(`✅ Player ${request.name} joined`)
      } else if (request.action === 'leave' && gamePlayers.current[id]) {
        const leavingPlayerName = gamePlayers.current[id]
        delete gamePlayers.current[id]
        updated = true
        console.log(`👋 Player ${leavingPlayerName} left`)
      }
    })
    
    if (updated) {
      console.log('🎯 [handlePlayerRequests] Sending updated players list:', gamePlayers.current)
      console.log('🎯 [handlePlayerRequests] Players in update:', Object.entries(gamePlayers.current))
      console.log('🎯 [handlePlayerRequests] Total players in update:', Object.keys(gamePlayers.current).length)
      
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
  
  console.log('📦 [GameProvider] Context value being provided:', {
    gamePhase,
    playerNamesSize: playerNames.size,
    playerNamesEntries: Array.from(playerNames.entries()),
    playerId
  })

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}