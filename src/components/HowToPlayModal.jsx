import './HowToPlayModal.css'

export default function HowToPlayModal({ onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
          
          <h2 className="modal-title">How to Play</h2>
          
          <div className="rules-container">
            <div className="rule-section">
              <div className="rule-number">1</div>
              <div className="rule-content">
                <h3>Join the Game</h3>
                <p>Enter your name and join the lobby. Wait for other players to join.</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">2</div>
              <div className="rule-content">
                <h3>Receive Your Role</h3>
                <p>Everyone gets the same word except the Imposter, who gets "Imposter".</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">3</div>
              <div className="rule-content">
                <h3>Describe the Word</h3>
                <p>Take turns describing your word. The Imposter must blend in without knowing the real word!</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">4</div>
              <div className="rule-content">
                <h3>Vote Out the Imposter</h3>
                <p>After everyone describes, vote for who you think is the Imposter.</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">5</div>
              <div className="rule-content">
                <h3>Win Conditions</h3>
                <p><strong>Citizens win:</strong> If the Imposter is voted out.<br/>
                <strong>Imposter wins:</strong> If they survive the vote or correctly guess the word!</p>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="got-it-btn" onClick={onClose}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}