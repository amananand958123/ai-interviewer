import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'
import { useSpeechStore } from '../stores/speechStore'
import { Save, Mic, Palette, Bell, Shield, User, Home } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, setTheme } = useThemeStore()
  const { isSupported } = useSpeechStore()
  const navigate = useNavigate()
  
  const [settings, setSettings] = useState({
    // User Profile
    name: 'User',
    email: 'user@example.com',
    timezone: 'UTC',
    
    // Speech Settings
    speechRate: 0.9,
    speechPitch: 1.0,
    speechVolume: 0.8,
    autoListen: true,
    voiceCommands: true,
    
    // Interview Settings
    difficultyLevel: 'medium',
    sessionReminders: true,
    feedbackDetail: 'detailed',
    autoSave: true,
    
    // Accessibility
    highContrast: false,
    fontSize: 'medium',
    keyboardNavigation: true,
    screenReader: false,
    
    // Notifications
    emailNotifications: true,
    practiceReminders: true,
    weeklyReports: true,
    achievementAlerts: true,
  })

  const handleSettingChange = (_category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userSettings', JSON.stringify(settings))
    toast.success('Settings saved successfully!')
  }

  const resetToDefaults = () => {
    setSettings({
      name: 'User',
      email: 'user@example.com',
      timezone: 'UTC',
      speechRate: 0.9,
      speechPitch: 1.0,
      speechVolume: 0.8,
      autoListen: true,
      voiceCommands: true,
      difficultyLevel: 'medium',
      sessionReminders: true,
      feedbackDetail: 'detailed',
      autoSave: true,
      highContrast: false,
      fontSize: 'medium',
      keyboardNavigation: true,
      screenReader: false,
      emailNotifications: true,
      practiceReminders: true,
      weeklyReports: true,
      achievementAlerts: true,
    })
    toast.success('Settings reset to defaults')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your interview experience and preferences
            </p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            title="Go to Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              User Profile
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Appearance
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Light</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Dark</span>
                </label>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highContrast"
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('appearance', 'highContrast', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="highContrast" className="text-sm text-gray-700 dark:text-gray-300">
                  High Contrast Mode
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Speech Settings */}
        {isSupported && (
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Mic className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Speech & Voice
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speech Rate: {settings.speechRate}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) => handleSettingChange('speech', 'speechRate', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pitch: {settings.speechPitch}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.speechPitch}
                    onChange={(e) => handleSettingChange('speech', 'speechPitch', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volume: {settings.speechVolume}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.speechVolume}
                    onChange={(e) => handleSettingChange('speech', 'speechVolume', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoListen}
                    onChange={(e) => handleSettingChange('speech', 'autoListen', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Auto-start listening after AI speaks
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.voiceCommands}
                    onChange={(e) => handleSettingChange('speech', 'voiceCommands', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable voice commands (next, skip, repeat)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Interview Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interview Preferences
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Difficulty Level
              </label>
              <select
                value={settings.difficultyLevel}
                onChange={(e) => handleSettingChange('interview', 'difficultyLevel', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback Detail Level
              </label>
              <select
                value={settings.feedbackDetail}
                onChange={(e) => handleSettingChange('interview', 'feedbackDetail', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="brief">Brief</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.sessionReminders}
                onChange={(e) => handleSettingChange('interview', 'sessionReminders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Send session reminders
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('interview', 'autoSave', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-save responses during interviews
              </span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Email notifications
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.practiceReminders}
                onChange={(e) => handleSettingChange('notifications', 'practiceReminders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Daily practice reminders
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Weekly progress reports
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.achievementAlerts}
                onChange={(e) => handleSettingChange('notifications', 'achievementAlerts', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Achievement alerts
              </span>
            </label>
          </div>
        </div>

        {/* Accessibility */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Accessibility
            </h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => handleSettingChange('accessibility', 'keyboardNavigation', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enhanced keyboard navigation
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.screenReader}
                onChange={(e) => handleSettingChange('accessibility', 'screenReader', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Screen reader optimizations
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={resetToDefaults}
            className="btn btn-outline"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
