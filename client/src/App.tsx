import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './stores/themeStore'
import { useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
// import GlobalInterviewGuidelinesOverlay from './components/GlobalInterviewGuidelinesOverlay'
import Home from './pages/Home'
import TechnicalInterview from './pages/TechnicalInterview'
import CodingTest from './pages/CodingTest'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import './utils/clearOldTestData' // Auto-clear old coding test completion flags

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/technical-interview" 
              element={
                <ProtectedRoute>
                  <TechnicalInterview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coding-test" 
              element={
                <ProtectedRoute>
                  <CodingTest />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-dark-800 dark:text-white',
          }}
        />
        
        
      </div>
    </Router>
  )
}

export default App
