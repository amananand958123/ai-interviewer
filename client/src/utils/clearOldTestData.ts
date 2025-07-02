// Utility to clear old coding test completion data
export const clearOldCodingTestData = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage)
    
    // Find and remove old completion flags
    const oldCompletionKeys = keys.filter(key => 
      key.startsWith('coding-test-completed-')
    )
    
    oldCompletionKeys.forEach(key => {
      console.log('🧹 Removing old coding test completion flag:', key)
      localStorage.removeItem(key)
    })
    
    // Also clean up any stale active sessions older than 1 hour
    const activeSessionKeys = keys.filter(key => 
      key.startsWith('coding-test-active-')
    )
    
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    activeSessionKeys.forEach(key => {
      try {
        const sessionData = localStorage.getItem(key)
        if (sessionData) {
          const parsed = JSON.parse(sessionData)
          const sessionTime = new Date(parsed.timestamp || parsed)
          
          if (sessionTime < hourAgo) {
            console.log('🧹 Removing stale active session:', key)
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        // If we can't parse it, remove it
        console.log('🧹 Removing unparseable session data:', key)
        localStorage.removeItem(key)
      }
    })
    
    console.log('✅ Old coding test data cleared')
    return {
      removedCompletionFlags: oldCompletionKeys.length,
      removedActiveSessions: activeSessionKeys.length
    }
  } catch (error) {
    console.error('❌ Error clearing old test data:', error)
    return null
  }
}

// Auto-clear on import
clearOldCodingTestData()
