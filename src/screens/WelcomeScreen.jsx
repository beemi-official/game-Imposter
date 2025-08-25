import { useState } from 'react'
import './WelcomeScreen.css'
import imposterLogo from '../assets/imposter_logo.jpeg'
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
              src={imposterLogo} 
              alt="Imposter Game Logo" 
              className="game-logo"
            />
            <div className="logo-glow"></div>
          </div>
          
          <h1 className="welcome-title">IMPOSTER</h1>
          <p className="welcome-tagline">Can you spot the deceiver?</p>
          
          <div className="welcome-buttons">
            <button 
              className="welcome-btn start-btn"
              onClick={handleStartGame}
            >
              <span className="btn-text">Start Game</span>
              <span className="btn-glow"></span>
            </button>
            
            <button 
              className="welcome-btn how-to-play-btn"
              onClick={handleHowToPlay}
            >
              <span className="btn-text">How to Play</span>
              <span className="btn-glow"></span>
            </button>
          </div>
        </div>
      </div>
      
      {showHowToPlay && (
        <HowToPlayModal onClose={handleCloseModal} />
      )}
    </div>
  )
}