import { useEffect } from 'react'
import { useBeemi } from './BeemiProvider'
import CommentItem from './CommentItem'

export default function CommentList({ comments, setComments }) {
  const { beemi, isConnected } = useBeemi()

  useEffect(() => {
    if (!isConnected || !beemi) return

    // Handle streaming chat events (modular approach)
    const handleStreamChat = (event) => {
      console.log('📺 Stream chat event received:', event)
      // Fix: Check for the correct field names from bridge emulator
      if (event.data && event.data.user && event.data.message) {
        setComments(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: event.data.user.username || event.data.user.displayName || event.data.user,
          text: event.data.message, // Fix: use 'message' field instead of 'text'
          timestamp: event.data.timestamp ? new Date(event.data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          platform: event.data.platform || 'unknown',
          imageUrl: event.data.user.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.data.user.username || 'anonymous'}`
        }])
      }
      // Fallback for legacy 'text' field format
      else if (event.data && event.data.user && event.data.text) {
        setComments(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: event.data.user.username || event.data.user.displayName || event.data.user,
          text: event.data.text,
          timestamp: event.data.timestamp ? new Date(event.data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          platform: event.data.platform || 'unknown',
          imageUrl: event.data.user.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.data.user.username || 'anonymous'}`
        }])
      }
    }

    const handleRoomEvent = (event) => {
      console.log('🎮 Room event received:', event)
      
      // Handle Beemi SDK message events with structure: {payload: {user, text, timestamp}}
      if (event.payload && event.payload.user && event.payload.text) {
        setComments(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: event.payload.user,
          text: event.payload.text,
          timestamp: event.payload.timestamp ? new Date(event.payload.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.payload.user || 'anonymous'}`
        }])
      }
      // Handle direct message events with structure: {user, text, timestamp} (fallback)
      else if (event.user && event.text) {
        setComments(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: event.user,
          text: event.text,
          timestamp: event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.user || 'anonymous'}`
        }])
      }
      // Also handle legacy message structure for compatibility
      else if (event.type === 'message') {
        setComments(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: event.username || 'Player',
          text: event.text,
          timestamp: new Date().toLocaleTimeString(),
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.username || 'Player'}`
        }])
      }
    }

    const handlePlayerJoined = (data) => {
      console.log('👤 Player joined:', data)
    }

    const handlePlayerLeft = (data) => {
      console.log('👋 Player left:', data)
    }

    const handleRoomReady = (data) => {
      console.log('🎮 Room ready:', data)
    }

    // Use proper modular event handlers
    if (beemi.streams) {
      beemi.streams.onChat(handleStreamChat)
    }
    
    if (beemi.multiplayer) {
      beemi.multiplayer.on('player-joined', handlePlayerJoined)
      beemi.multiplayer.on('player-left', handlePlayerLeft)
      beemi.multiplayer.on('room-ready', handleRoomReady)
    }

    return () => {
      if (beemi && beemi.streams) {
        // Note: streams.onChat doesn't have an off method, it's a one-time registration
      }
      
      if (beemi && beemi.multiplayer) {
        beemi.multiplayer.off('player-joined', handlePlayerJoined)
        beemi.multiplayer.off('player-left', handlePlayerLeft)
        beemi.multiplayer.off('room-ready', handleRoomReady)
      }
    }
  }, [beemi, isConnected])

  return (
    <div className="comment-list">
      {comments.length === 0 ? (
        <p className="no-comments">No messages yet</p>
      ) : (
        <div className="comments-container">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
} 