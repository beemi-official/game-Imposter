import { useState, useEffect, useRef } from 'react'
import './DebugConsole.css'

const DEBUG_MODE = true // Set to true during development

export default function DebugConsole() {
  const [logs, setLogs] = useState([])
  const [isVisible, setIsVisible] = useState(true)
  const consoleRef = useRef(null)
  const originalConsole = useRef({})
  const logCounter = useRef(0)

  useEffect(() => {
    if (!DEBUG_MODE) return

    // Store original console methods
    originalConsole.current = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.current.log(...args)
      addLog('debug', args.join(' '))
    }

    console.info = (...args) => {
      originalConsole.current.info(...args)
      addLog('info', args.join(' '))
    }

    console.warn = (...args) => {
      originalConsole.current.warn(...args)
      addLog('warn', args.join(' '))
    }

    console.error = (...args) => {
      originalConsole.current.error(...args)
      addLog('error', args.join(' '))
    }

    // Initial log
    addLog('info', '🚀 Imposter Game Debug Console')

    // Cleanup
    return () => {
      console.log = originalConsole.current.log
      console.info = originalConsole.current.info
      console.warn = originalConsole.current.warn
      console.error = originalConsole.current.error
    }
  }, [])

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString()
    logCounter.current += 1
    const newLog = {
      id: `log-${logCounter.current}-${Date.now()}`,
      type,
      message,
      timestamp
    }

    setLogs(prev => {
      const updated = [...prev, newLog]
      // Keep only last 100 logs
      if (updated.length > 100) {
        return updated.slice(-100)
      }
      return updated
    })
  }

  useEffect(() => {
    // Auto-scroll to bottom
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const handleClear = () => {
    setLogs([])
    addLog('info', 'Console cleared')
  }

  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  if (!DEBUG_MODE) {
    return null
  }

  return (
    <div className="debug-console">
      <div className="debug-header">
        <span>Console Logs</span>
        <button onClick={handleToggle} className="console-btn">
          {isVisible ? 'Hide' : 'Show'}
        </button>
        <button onClick={handleClear} className="console-btn">
          Clear
        </button>
      </div>
      
      {isVisible && (
        <div className="console-content" ref={consoleRef}>
          {logs.map(log => (
            <div key={log.id} className={`console-log ${log.type}`}>
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}