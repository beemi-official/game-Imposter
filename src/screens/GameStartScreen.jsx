import { useEffect, useState } from 'react'
import { useBeemiSDK } from '../providers/BeemiSDKProvider'
import { useGame } from '../providers/GameProvider'
import './GameStartScreen.css'

export default function GameStartScreen() {
  const { playerId } = useBeemiSDK()
  const { currentWord, playerRoles, startWordDisplayTimer } = useGame()
  const [displayText, setDisplayText] = useState('')
  const [roleClass, setRoleClass] = useState('')

  useEffect(() => {
    if (!playerId || !playerRoles[playerId] || !currentWord) return

    const myRole = playerRoles[playerId]
    const isImposter = myRole === 'imposter'
    
    // Set display text based on role
    if (isImposter) {
      setDisplayText('You are an IMPOSTER')
      setRoleClass('imposter')
    } else {
      setDisplayText(`The word is: ${currentWord}`)
      setRoleClass('civilian')
    }

    // Start the 5-second timer
    startWordDisplayTimer(myRole, currentWord)
  }, [playerId, playerRoles, currentWord, startWordDisplayTimer])

  return (
    <section className="role-screen">
      <div className="role-action-bar">
        <div></div>
        <div className="word-display">
          {currentWord && playerRoles[playerId] !== 'imposter' && (
            <span className="word-badge">{currentWord}</span>
          )}
        </div>
        <div></div>
      </div>
      
      <div className="role-container">
        <div className="role-content">
          <div className="role-display">
            <h2 className={`role-text ${roleClass}`}>
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