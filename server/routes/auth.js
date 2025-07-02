import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// --- Start of content from middleware/auth.js ---
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Guest user middleware
export const createGuestSession = async (req, res, next) => {
  try {
    if (!req.user) {
      // Create a temporary guest user
      const guestUser = await User.createGuest()
      req.user = guestUser
      req.isGuest = true
    }
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create guest session',
      error: error.message
    })
  }
}

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
  next()
}

// Rate limiting helper
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map()
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!requests.has(key)) {
      requests.set(key, [])
    }
    
    const userRequests = requests.get(key)
    const recentRequests = userRequests.filter(time => time > windowStart)
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
    
    recentRequests.push(now)
    requests.set(key, recentRequests)
    
    next()
  }
}
// --- End of content from middleware/auth.js ---


// Rate limiting for auth routes
const authLimiter = createRateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// Helper function to set auth cookie
const setAuthCookie = (res, token) => {
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

// Sign up
router.post('/signup', authLimiter, signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email,
      password,
      authProvider: 'local'
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)
    setAuthCookie(res, token)

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      preferences: user.preferences,
      stats: user.stats,
      createdAt: user.createdAt
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userData,
      token
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
})

// Login
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password')
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last activity
    user.stats.lastActivity = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)
    setAuthCookie(res, token)

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      preferences: user.preferences,
      stats: user.stats,
      lastActivity: user.stats.lastActivity
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
  }
})

// Logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('authToken')
    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      authProvider: req.user.authProvider,
      preferences: req.user.preferences,
      stats: req.user.stats,
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt
    }

    res.json({
      success: true,
      user: userData
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    })
  }
})

// Update user profile
router.put('/profile', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Invalid theme preference'),
  body('preferences.difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('preferences.preferredTechStack')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tech stack preference is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, preferences } = req.body
    const user = req.user

    if (name) user.name = name
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences }
    }

    await user.save()

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      preferences: user.preferences,
      stats: user.stats
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
})

// Change password
router.put('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    })
  }
})

// Delete account
router.delete('/delete-account', authenticate, async (req, res) => {
  try {
    const user = req.user

    // Mark user as inactive instead of deleting
    user.isActive = false
    user.email = `deleted_${Date.now()}_${user.email}`
    await user.save()

    res.clearCookie('authToken')
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    })
  }
})

export default router