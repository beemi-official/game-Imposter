import { useState } from 'react'
import './WelcomeScreen.css'
import impostorLogo from '../assets/impostor_logo.png'
import HowToPlayModal from '../components/HowToPlayModal'

export default function WelcomeScreen({ onStartGame }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const handleStartGame = () => {
    onStartGame()
  }

  const handleHowToPlay = () => {
    setShowHowToPlay(true)
  }

  const handleCloseModal = () => {
    setShowHowToPlay(false)
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-background-layer"></div>
      <div className="welcome-particles"></div>
      
      <div className="welcome-container">
        <div className="welcome-content">
          <div className="logo-container">
            <img 
              src={impostorLogo} 
              alt="Impostor Game Logo" 
              className="game-logo"
            />
            <div className="logo-glow"></div>
          </div>

          <p className="welcome-tagline">Can you spot the deceiver?</p>
          
          <div className="welcome-action-area">
            <button 
              className="welcome-btn start-btn"
              onClick={handleStartGame}
            >
              <span className="btn-text">Start Game</span>
              <span className="btn-glow"></span>
            </button>
            
            <div 
              className="how-to-play-link"
              onClick={handleHowToPlay}
            >
              <span className="question-mark">?</span>
              <span className="link-text">Learn how to play</span>
            </div>
          </div>
        </div>
      </div>
      
      {showHowToPlay && (
        <HowToPlayModal onClose={handleCloseModal} />
      )}
    </div>
  )
}