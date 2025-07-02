import { ReactNode, useState, useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Moon, 
  Sun,
  Brain,
  User,
  ChevronDown,
  Settings,
  BarChart3,
  LogIn,
  UserPlus,
  LogOut,
  Loader2,
  Wifi,
  WifiOff,
  Menu,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useThemeStore()
  const { user, isAuthenticated, logout, getCurrentUser } = useAuthStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing session on load
  useEffect(() => {
    setIsLoading(true)
    getCurrentUser().finally(() => setIsLoading(false))
  }, [getCurrentUser])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdowns when clicking outside
      if (showUserDropdown || showMobileMenu) {
        const target = event.target as Element
        if (!target.closest('[data-dropdown]') && !target.closest('[data-mobile-menu]')) {
          setShowUserDropdown(false)
          setShowMobileMenu(false)
        }
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserDropdown, showMobileMenu])

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      setShowUserDropdown(false)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center group cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI Interviewer
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Master Your Skills
                  </p>
                </div>
              </motion.div>
            </Link>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-300"
                data-mobile-menu
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Online Status Indicator */}
              <div className="hidden sm:flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs font-medium">Offline</span>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative">
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {theme === 'light' ? 'Light' : 'Dark'}
                </span>
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  disabled={isLoading}
                  className="flex items-center space-x-3 bg-gray-100/50 dark:bg-gray-700/50 rounded-2xl px-4 py-2 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-dropdown
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {isAuthenticated && user ? user.name : 'Interview Candidate'}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isLoading ? 'Loading...' : 'Ready to Practice'}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
                    >
                      <div className="p-2">
                        {isAuthenticated ? (
                          // Authenticated user options
                          <>
                            <Link
                              to="/dashboard"
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div>
                                <div className="font-semibold">Dashboard</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">View your progress</div>
                              </div>
                            </Link>

                            <Link
                              to="/settings"
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <div>
                                <div className="font-semibold">Settings</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Preferences</div>
                              </div>
                            </Link>

                            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                            
                            <button
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleLogout}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 text-red-600 dark:text-red-400 animate-spin" />
                              ) : (
                                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                              <div>
                                <div className="font-semibold">
                                  {isLoading ? 'Signing Out...' : 'Sign Out'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {isLoading ? 'Please wait' : 'End session'}
                                </div>
                              </div>
                            </button>
                          </>
                        ) : (
                          // Non-authenticated user options
                          <>
                            <Link
                              to="/signup"
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <div className="font-semibold">Sign Up</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Create an account</div>
                              </div>
                            </Link>
                            
                            <Link
                              to="/login"
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div>
                                <div className="font-semibold">Login</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Access your account</div>
                              </div>
                            </Link>

                            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            data-mobile-menu
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                    {isAuthenticated && user ? user.name : 'Interview Candidate'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Loading...' : 'Ready to Practice'}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="font-semibold">Dashboard</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">View your progress</div>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="font-semibold">Settings</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Preferences</div>
                      </div>
                    </Link>

                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                    
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        handleLogout()
                        setShowMobileMenu(false)
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 text-red-600 dark:text-red-400 animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <div className="font-semibold">
                          {isLoading ? 'Signing Out...' : 'Sign Out'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isLoading ? 'Please wait' : 'End session'}
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-semibold">Sign Up</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Create an account</div>
                      </div>
                    </Link>
                    
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 rounded-xl"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="font-semibold">Login</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Access your account</div>
                      </div>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Theme Toggle */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    toggleTheme()
                    setShowMobileMenu(false)
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gray-100/50 dark:bg-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative">
                    {theme === 'light' ? (
                      <Sun className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative"
      >
        {children}
      </motion.main>
    </div>
  )
}
