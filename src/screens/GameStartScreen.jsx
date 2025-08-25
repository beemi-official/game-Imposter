import { useEffect, useState } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './GameStartScreen.css'

export default function GameStartScreen() {
  const { playerId } = useBeemiSDK()
  const { currentWord, playerRoles, startWordDisplayTimer } = useGame()
  const [displayText, setDisplayText] = useState('')
  const [myWord, setMyWord] = useState('')

  useEffect(() => {
    if (!playerId || !playerRoles[playerId] || !currentWord) return

    const myRole = playerRoles[playerId]
    
    // Get the appropriate word based on role (but don't reveal the role)
    let word = ''
    if (currentWord && currentWord.civilian && currentWord.imposter) {
      // Word pair format - imposters see different word
      word = myRole === 'imposter' ? currentWord.imposter : currentWord.civilian
    } else if (currentWord && typeof currentWord === 'string') {
      // Fallback for old format (shouldn't happen with new implementation)
      word = currentWord
    }
    
    setMyWord(word)
    setDisplayText(`Your word is: ${word}`)

    // Start the 5-second timer
    startWordDisplayTimer(myRole, word)
  }, [playerId, playerRoles, currentWord, startWordDisplayTimer])

  return (
    <section className="role-screen">
      <div className="role-action-bar">
        <div></div>
        <div className="word-display">
          {myWord && (
            <span className="word-badge">{myWord}</span>
          )}
        </div>
        <div></div>
      </div>
      
      <div className="role-container">
        <div className="role-content">
          <div className="role-display">
            <h2 className="role-text">
              {displayText}
            </h2>
          </div>
          
          <div className="role-footer">
            <p className="waiting-msg">
              Game will continue automatically...
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}