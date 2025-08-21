# TikTok Chat & Multiplayer Integration Guide

## Overview

This template provides comprehensive integration for TikTok live chat and multiplayer events via the Beemi SDK. Every new game created from this template will automatically include:

- **TikTok Chat Integration**: Receives live chat messages from TikTok streams
- **Multiplayer Support**: Real-time room management and player events
- **Visual Dashboard**: Live display of chat messages, room data, and activity logs
- **Console Forwarding**: All game logs are forwarded to React Native for debugging

## Features Included

### 🔵 TikTok Chat Integration
- Listens for `room-event` (primary method for TikTok messages)
- Supports multiple message formats: `{text, user}`, `{content, username}`, `{message, user}`, `{text, from}`
- Automatic vote detection (A, B, C) with visual styling
- Rating system support (1-10 scale)
- Real-time chat display with timestamps

### 🎮 Multiplayer Events
- **Room State**: Displays Room ID, Join Code, Player Count, Role, Connection Status
- **Real-time Events**: `player-joined`, `player-left`, `leader-changed`
- **Role Management**: Visual indicators for Leader (👑) vs Peer (👥)
- **Activity Log**: Comprehensive event tracking with timestamps

### 🔧 Developer Tools
- **Console Forwarding**: All logs sent to React Native for debugging
- **Test Functions**: Built-in testing for TikTok messages
- **Game Phase Management**: Easy state transitions for different game modes
- **Retry Logic**: Robust SDK connection with 10-second timeout

## Quick Start

### 1. Understanding the Game Phases

The template supports different game phases:
- `ready` - Initial state, chat messages displayed but not processed
- `voting` - Messages like "A", "B", "C" are processed as votes
- `rating` - Numeric messages (1-10) are processed as ratings

```javascript
// Change game phase
window.setGamePhase('voting');
window.setGamePhase('rating');
window.setGamePhase('ready');
```

### 2. Testing TikTok Chat Integration

Use the built-in test functions to simulate TikTok messages:

```javascript
// Test different message formats
window.testTikTokMessage({text: 'A', user: 'TestUser'});
window.testTikTokMessage({content: 'B', username: 'TestUser2'});
window.testTikTokMessage({message: 'option c', user: 'TestUser3'});
window.testTikTokMessage({text: '7', from: 'RatingUser'});
```

### 3. Checking Room State

Monitor the current multiplayer state:

```javascript
const state = window.getRoomState();
console.log('Current room state:', state);
// Returns: { room, playerId, isLeader, playerCount, maxPlayers, isConnected, currentGamePhase }
```

## Customization

### Adding Custom Vote Processing

Modify the `processVote()` method in `app.js`:

```javascript
processVote(text, user, originalText) {
  let vote = null;
  
  // Add your custom vote patterns
  if (text === 'a' || text.includes('option a') || text === 'red') {
    vote = 'A';
  } else if (text === 'b' || text.includes('option b') || text === 'blue') {
    vote = 'B';
  }
  // ... etc
  
  if (vote) {
    // Your custom vote handling logic
    this.handleVote(vote, user);
  }
}
```

### Adding Custom Chat Handlers

```javascript
// Add your own chat processing logic
window.gameApp.addCustomChatHandler((message) => {
  // Custom processing here
  console.log('Custom handler received:', message);
});
```

### Extending Game Phases

Add your own game phases and processing:

```javascript
// In processChatMessage method, add new conditions:
if (this.currentGamePhase === 'trivia') {
  this.processTrivia(normalizedText, user, text);
} else if (this.currentGamePhase === 'emoji') {
  this.processEmoji(normalizedText, user, text);
}
```

## UI Components

The template includes 4 main UI sections:

1. **Room Status Card**: Shows connection state, room info, player count
2. **TikTok Live Chat Card**: Real-time message display with vote styling
3. **Activity Log Card**: System events and game activities
4. **Game State Card**: Current phase and SDK status

All components are responsive and include animations for real-time updates.

## Event Flow

```
TikTok Live Chat → Beemi SDK → React Native → WebView → Game Processing → UI Update
React Native Multiplayer → Beemi SDK → WebView → Event Listeners → UI Update
```

## Debugging

### Console Output
All game logs are automatically forwarded to React Native. Check the React Native debugger for comprehensive logging.

### Activity Log
The in-game activity log shows:
- 🟢 System events (SDK connection, room updates)
- 🔵 Player events (votes, ratings, custom actions)
- 🔴 Error events (invalid messages, connection issues)

### SDK Status
Monitor the SDK connection status in the Game State card:
- 🟡 Loading... - SDK connecting
- 🟢 Connected - Ready for events
- 🔴 Not Available - SDK failed to load

## Best Practices

1. **Always use retry logic** - SDK may not be immediately available
2. **Handle multiple message formats** - TikTok messages can vary in structure
3. **Validate game phase** - Only process relevant messages for current state
4. **Keep chat history manageable** - Template limits to 10 recent messages
5. **Log extensively** - Use the activity log for debugging and user feedback

## Production Deployment

When deploying your game:

1. **Test all vote patterns** with the test functions
2. **Verify multiplayer events** work correctly
3. **Check console forwarding** is working in React Native
4. **Validate game phase transitions** are smooth
5. **Ensure UI updates** happen in real-time

## Support

For issues or questions:
- Check the Activity Log for real-time debugging
- Use browser console for detailed event logging
- Test with the built-in test functions before going live
- Monitor the SDK Status indicator for connection issues 