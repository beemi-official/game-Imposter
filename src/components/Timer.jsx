import './Timer.css'

export default function Timer({ timeRemaining }) {
  const getTimerClass = () => {
    if (timeRemaining <= 10) return 'timer-display danger'
    if (timeRemaining <= 30) return 'timer-display warning'
    return 'timer-display'
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`
  }

  return (
    <div className={getTimerClass()}>
      {formatTime(timeRemaining)}
    </div>
  )
}