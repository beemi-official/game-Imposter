import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

const BeemiSDKContext = createContext()

export const useBeemiSDK = () => {
  const context = useContext(BeemiSDKContext)
  if (!context) {
    throw new Error('useBeemiSDK must be used within a BeemiSDKProvider')
  }
  return context
}

export default function BeemiSDKProvider({ children }) {
  const [beemi, setBeemi] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [isLeader, setIsLeader] = useState(false)
  const [roomPlayerCount, setRoomPlayerCount] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(0)
  const [room, setRoom] = useState(null)
  const [roomDataReceived, setRoomDataReceived] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  
  const crdtWatchers = useRef(new Map())
  const eventListeners = useRef(new Map())
  const retryCount = useRef(0)
  const maxRetries = 20

  const initializeFromSDKState = useCallback(() => {
    if (!window.beemi || !window.beemi.multiplayer) return
    
    const roomState = window.beemi.multiplayer.room.getState()
    console.log('🔍 Initial room state from SDK:', roomState)
    
    // Log the actual structure for debugging
    if (roomState) {
      console.log('📋 Room state keys:', Object.keys(roomState))
      console.log('📋 Room state details:', JSON.stringify(roomState, null, 2))
    }
    
    // Check if roomState exists (not checking for specific field)
    if (roomState) {
      // Map the correct field names from SDK
      const room = {
        id: roomState.roomId || roomState.id,
        playerId: roomState.playerId,
        isLeader: roomState.isLeader,
        playerCount: roomState.playerCount,
        maxPlayers: roomState.maxPlayers
      }
      
      setRoom(room)
      setRoomDataReceived(true)
      setPlayerId(roomState.playerId || roomState.me)
      setIsLeader(roomState.isLeader || false)
      setRoomPlayerCount(roomState.playerCount || 0)
      setMaxPlayers(roomState.maxPlayers || 6)
      
      const players = window.beemi.multiplayer.crdt.get('game-players')
      if (players && Object.keys(players).length > 0) {
        console.log('🔍 Existing players found:', players)
      }
      
      const gamePhase = window.beemi.multiplayer.crdt.get('game-phase')
      if (gamePhase) {
        console.log('🎯 Existing game phase found:', gamePhase)
      }
      
      console.log('✅ Room data received from SDK state')
      retryCount.current = 0 // Reset retry count on success
    } else {
      retryCount.current++
      if (retryCount.current < maxRetries) {
        console.log(`⏳ No room data available yet (attempt ${retryCount.current}/${maxRetries})`)
        setTimeout(initializeFromSDKState, 500)
      } else {
        console.error('❌ Failed to get room data after maximum retries')
        // Still mark as connected if SDK is available
        if (window.beemi && window.beemi.multiplayer) {
          setIsConnected(true)
        }
      }
    }
  }, [])

  const initializeUserProfile = useCallback(() => {
    if (window.beemi && window.beemi.user) {
      const user = window.beemi.user.getUser()
      if (user) {
        console.log('👤 User profile available:', {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          hasImage: !!user.image_url
        })
        setUserProfile(user)
      }
    }
  }, [])

  const watchCRDT = useCallback((key, callback) => {
    if (!window.beemi || !window.beemi.multiplayer || !window.beemi.multiplayer.crdt) {
      console.warn('CRDT not available yet')
      return () => {}
    }

    const watcher = (data) => {
      console.log(`📡 CRDT update for ${key}:`, data)
      callback(data)
    }

    window.beemi.multiplayer.crdt.watch(key, watcher)
    crdtWatchers.current.set(key, watcher)

    return () => {
      if (crdtWatchers.current.has(key)) {
        crdtWatchers.current.delete(key)
      }
    }
  }, [])

  const setCRDT = useCallback((key, value) => {
    if (!window.beemi || !window.beemi.multiplayer || !window.beemi.multiplayer.crdt) {
      console.warn('CRDT not available')
      return
    }
    window.beemi.multiplayer.crdt.set(key, value)
    console.log(`📤 CRDT set ${key}:`, value)
  }, [])

  const getCRDT = useCallback((key) => {
    if (!window.beemi || !window.beemi.multiplayer || !window.beemi.multiplayer.crdt) {
      console.warn('CRDT not available')
      return null
    }
    return window.beemi.multiplayer.crdt.get(key)
  }, [])

  const onStreamChat = useCallback((callback) => {
    if (!window.beemi || !window.beemi.streams) {
      console.warn('Streams not available')
      return () => {}
    }

    window.beemi.streams.onChat(callback)
    return () => {
      // Cleanup if needed
    }
  }, [])

  const onStreamGift = useCallback((callback) => {
    if (!window.beemi || !window.beemi.streams) {
      console.warn('Streams not available')
      return () => {}
    }

    window.beemi.streams.onGift(callback)
    return () => {
      // Cleanup if needed
    }
  }, [])

  useEffect(() => {
    const checkForBeemi = () => {
      if (window.beemi && window.beemi.multiplayer && window.beemi.multiplayer.crdt) {
        console.log('✅ Beemi SDK 2.1.1 detected')
        setBeemi(window.beemi)
        setIsConnected(true)
        
        // Listen for room-state events (from React Native or SDK)
        window.beemi.core.on('room-state', (state) => {
          console.log('🎯 ROOM-STATE EVENT RECEIVED!', state)
          console.log('🎯 Room state details:', JSON.stringify(state, null, 2))
          
          if (state) {
            // Update room state from event
            const room = {
              id: state.roomId || state.id,
              playerId: state.playerId,
              isLeader: state.isLeader,
              playerCount: state.playerCount,
              maxPlayers: state.maxPlayers
            }
            
            setRoom(room)
            setRoomDataReceived(true)
            setPlayerId(state.playerId || state.me)
            setIsLeader(state.isLeader || false)
            setRoomPlayerCount(state.playerCount || 0)
            setMaxPlayers(state.maxPlayers || 6)
            
            console.log('✅ Room data received from room-state event')
          }
        })
        
        initializeUserProfile()
        initializeFromSDKState()
      } else {
        console.log('⏳ Waiting for Beemi SDK 2.1.1...')
        setTimeout(checkForBeemi, 500)
      }
    }

    checkForBeemi()

    return () => {
      crdtWatchers.current.clear()
      eventListeners.current.clear()
    }
  }, [initializeFromSDKState, initializeUserProfile])

  const value = {
    beemi,
    isConnected,
    playerId,
    isLeader,
    roomPlayerCount,
    maxPlayers,
    room,
    roomDataReceived,
    userProfile,
    watchCRDT,
    setCRDT,
    getCRDT,
    onStreamChat,
    onStreamGift
  }

  return (
    <BeemiSDKContext.Provider value={value}>
      {children}
    </BeemiSDKContext.Provider>
  )
}