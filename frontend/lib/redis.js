const { createClient } = require('redis')

let redisClient = null

// Create Redis client
const createRedisClient = () => {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max retries reached, giving up')
            return new Error('Max retries reached')
          }
          return Math.min(retries * 100, 3000)
        }
      }
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redisClient.on('ready', () => {
      console.log('✅ Redis ready for operations')
    })

    redisClient.on('end', () => {
      console.log('❌ Redis connection ended')
    })

    return redisClient
  } catch (error) {
    console.error('Redis connection error:', error)
    return null
  }
}

// Connect to Redis
const connectRedis = async () => {
  if (!redisClient) {
    redisClient = createRedisClient()
  }

  if (redisClient && !redisClient.isOpen) {
    try {
      await redisClient.connect()
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      return null
    }
  }

  return redisClient
}

// Get Redis client
const getRedisClient = () => {
  return redisClient
}

// Cache operations
const cache = {
  // Set cache with TTL (Time To Live) in seconds
  async set(key, value, ttl = 3600) {
    try {
      const client = await connectRedis()
      if (!client) return false

      const serializedValue = JSON.stringify(value)
      await client.setEx(key, ttl, serializedValue)
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  },

  // Get cache
  async get(key) {
    try {
      const client = await connectRedis()
      if (!client) return null

      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  },

  // Delete cache
  async del(key) {
    try {
      const client = await connectRedis()
      if (!client) return false

      await client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  },

  // Delete multiple keys with pattern
  async delPattern(pattern) {
    try {
      const client = await connectRedis()
      if (!client) return false

      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(keys)
      }
      return true
    } catch (error) {
      console.error('Redis DEL pattern error:', error)
      return false
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const client = await connectRedis()
      if (!client) return false

      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  },

  // Set expiration for existing key
  async expire(key, ttl) {
    try {
      const client = await connectRedis()
      if (!client) return false

      await client.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return false
    }
  }
}

// Close Redis connection
const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit()
      console.log('✅ Redis connection closed')
    } catch (error) {
      console.error('Error closing Redis connection:', error)
    }
  }
}

module.exports = {
  createRedisClient,
  connectRedis,
  getRedisClient,
  cache,
  closeRedis
}
