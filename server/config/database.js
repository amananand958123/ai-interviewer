import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer'

// Connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true
}

// Database connection
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options)
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB')
    })
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB')
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('🛑 MongoDB connection closed through app termination')
        process.exit(0)
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error)
        process.exit(1)
      }
    })
    
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying MongoDB connection in 5 seconds...')
    setTimeout(connectDB, 5000)
  }
}

// Check if MongoDB is connected
export const isConnected = () => {
  return mongoose.connection.readyState === 1
}

// Get connection status
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  
  return {
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  }
}

// Close connection
export const closeConnection = async () => {
  try {
    await mongoose.connection.close()
    console.log('🔌 MongoDB connection closed')
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
    throw error
  }
}

// Health check for database
export const healthCheck = async () => {
  try {
    if (!isConnected()) {
      throw new Error('Database not connected')
    }
    
    // Simple ping to check if database is responsive
    await mongoose.connection.db.admin().ping()
    
    return {
      status: 'healthy',
      connection: getConnectionStatus(),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: getConnectionStatus(),
      timestamp: new Date().toISOString()
    }
  }
}

export default {
  connectDB,
  isConnected,
  getConnectionStatus,
  closeConnection,
  healthCheck
}
