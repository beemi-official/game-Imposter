import { createContext, useContext, useEffect, useState } from 'react'

const BeemiContext = createContext()

export const useBeemi = () => {
  const context = useContext(BeemiContext)
  if (!context) {
    throw new Error('useBeemi must be used within a BeemiProvider')
  }
  return context
}

export default function BeemiProvider({ children }) {
  const [beemi, setBeemi] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Wait for Beemi SDK to be available
    const checkForBeemi = () => {
      if (window.beemi) {
        setBeemi(window.beemi)
        setIsConnected(true)
        console.log('✅ Beemi SDK connected')
      } else {
        setTimeout(checkForBeemi, 100)
      }
    }

    checkForBeemi()
  }, [])

  const value = {
    beemi,
    isConnected
  }

  return (
    <BeemiContext.Provider value={value}>
      {children}
    </BeemiContext.Provider>
  )
} 