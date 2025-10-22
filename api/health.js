const { connectRedis } = require("../lib/redis")

// GET /api/health - Health check endpoint
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      // Test Redis connection
      const redisClient = await connectRedis()
      const redisStatus = redisClient ? 'connected' : 'disconnected'
      
      res.status(200).json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        services: {
          redis: redisStatus
        }
      })
    } catch (error) {
      res.status(200).json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        services: {
          redis: 'error'
        },
        error: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

