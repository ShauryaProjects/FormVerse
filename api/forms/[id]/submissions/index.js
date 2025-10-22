const mongoose = require("mongoose")
const Submission = require("../../../../models/Submission")
const Form = require("../../../../models/Form")
const { cache } = require("../../../../lib/redis")

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

// GET /api/forms/[id]/submissions - Get all submissions for a form
// POST /api/forms/[id]/submissions - Submit a form response
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
      const cacheKey = `submissions:${formId}`
      let cachedData = await cache.get(cacheKey)
      
      if (!cachedData) {
        // Verify form exists
        const form = await Form.findById(formId)
        if (!form) {
          return res.status(404).json({
            success: false,
            message: "Form not found",
          })
        }

        const submissions = await Submission.find({ formId }).sort({ submittedAt: -1 })
        
        cachedData = {
          form: {
            id: form._id,
            title: form.title,
            description: form.description,
          },
          submissions,
          count: submissions.length,
        }
        
        // Cache for 2 minutes
        await cache.set(cacheKey, cachedData, 120)
      }

      res.status(200).json({
        success: true,
        data: cachedData,
        message: "Submissions retrieved successfully",
      })
    } else if (req.method === 'POST') {
      const { answers } = req.body

      // Verify form exists
      const form = await Form.findById(formId)
      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found",
        })
      }

      if (!answers || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Answers are required",
        })
      }

      const submission = new Submission({
        formId,
        answers,
      })

      await submission.save()

      // Invalidate submissions cache when new submission is created
      await cache.del(`submissions:${formId}`)

      res.status(201).json({
        success: true,
        data: submission,
        message: "Form submitted successfully",
      })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
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

