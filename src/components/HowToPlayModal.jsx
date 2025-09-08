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
                <h3>Invite Your Friends</h3>
                <p>Click "Options" in the top right of Beemi app, then "Show Room Info", and share the room code with your friends</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">2</div>
              <div className="rule-content">
                <h3>Join the Lobby</h3>
                <p>Enter your name and join the lobby. Wait for other players to join.</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">3</div>
              <div className="rule-content">
                <h3>Receive Your Role</h3>
                <p>Everyone gets the same word except the Impostor, who gets a slightly different word.</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">4</div>
              <div className="rule-content">
                <h3>Describe the Word</h3>
                <p>Take turns describing your word. The Impostor must blend in without knowing the real word!</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">5</div>
              <div className="rule-content">
                <h3>Vote Out the Impostor</h3>
                <p>Vote for who you think is the Impostor. Your live audience can vote via the chat too.</p>
              </div>
            </div>
            
            <div className="rule-section">
              <div className="rule-number">6</div>
              <div className="rule-content">
                <h3>Win Conditions</h3>
                <p><strong>Citizens win:</strong> If the Impostor is voted out.<br/>
                <strong>Impostor wins:</strong> If they survive the vote.</p>
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