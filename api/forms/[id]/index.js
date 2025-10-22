const mongoose = require("mongoose")
const Form = require("../../../models/Form")
const { cache } = require("../../../lib/redis")

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

// GET /api/forms/[id] - Get form by ID
// DELETE /api/forms/[id] - Delete form by ID
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    await connectDB()

    const { id: formId } = req.query

    if (req.method === 'GET') {
      // Try to get from cache first
      const cacheKey = `form:${formId}`
      let form = await cache.get(cacheKey)
      
      if (!form) {
        // If not in cache, get from database
        form = await Form.findById(formId)
        
        if (form) {
          // Cache for 10 minutes
          await cache.set(cacheKey, form, 600)
        }
      }

      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found",
        })
      }

      res.status(200).json({
        success: true,
        data: form,
        message: "Form retrieved successfully",
      })
    } else if (req.method === 'DELETE') {
      const form = await Form.findByIdAndDelete(formId)

      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found",
        })
      }

      // Invalidate caches when form is deleted
      await cache.del(`form:${formId}`)
      await cache.del('forms:all')

      res.status(200).json({
        success: true,
        message: "Form deleted successfully",
      })
    } else {
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error:", error)

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid form ID",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

