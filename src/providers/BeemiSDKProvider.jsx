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
    
    // Log the actual structure for debugging
    if (roomState) {
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
      }
      
      const gamePhase = window.beemi.multiplayer.crdt.get('game-phase')
      if (gamePhase) {
      }
      
      retryCount.current = 0 // Reset retry count on success
    } else {
      retryCount.current++
      if (retryCount.current < maxRetries) {
        setTimeout(initializeFromSDKState, 500)
      } else {
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
        setUserProfile(user)
      }
    }
  }, [])

  const watchCRDT = useCallback((key, callback) => {
    if (!window.beemi || !window.beemi.multiplayer || !window.beemi.multiplayer.crdt) {
      return () => {}
    }

    const watcher = (data) => {
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
      return
    }
    window.beemi.multiplayer.crdt.set(key, value)
  }, [])

  const getCRDT = useCallback((key) => {
    if (!window.beemi || !window.beemi.multiplayer || !window.beemi.multiplayer.crdt) {
      return null
    }
    return window.beemi.multiplayer.crdt.get(key)
  }, [])

  const onStreamChat = useCallback((callback) => {
    if (!window.beemi || !window.beemi.streams) {
      return () => {}
    }

    window.beemi.streams.onChat(callback)
    return () => {
      // Cleanup if needed
    }
  }, [])

  const onStreamGift = useCallback((callback) => {
    if (!window.beemi || !window.beemi.streams) {
      return () => {}
    }
    
    // Wrap callback to extract data from event structure if needed
    const wrappedCallback = (data) => {
      // Extract the actual gift data if it's wrapped in an event structure
      let giftData = data
      if (data && data.type === 'stream-gift' && data.data) {
        giftData = data.data
      }
      
      callback(giftData)
    }
    
    window.beemi.streams.onGift(wrappedCallback)
    return () => {
      // Cleanup if needed
    }
  }, [])

  useEffect(() => {
    const checkForBeemi = () => {
      if (window.beemi && window.beemi.multiplayer && window.beemi.multiplayer.crdt) {
        setBeemi(window.beemi)
        setIsConnected(true)
        
        // Listen for room-state events (from React Native or SDK)
        window.beemi.core.on('room-state', (state) => {
          
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
            
          }
        })
        
        initializeUserProfile()
        initializeFromSDKState()
      } else {
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