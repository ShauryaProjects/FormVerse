const mongoose = require("mongoose")
const Form = require("../../models/Form")
const { cache } = require("../../lib/redis")

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

// GET /api/forms - Get all forms
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

    if (req.method === 'GET') {
      // Try to get from cache first
      const cacheKey = 'forms:all'
      let forms = await cache.get(cacheKey)
      
      if (!forms) {
        // If not in cache, get from database
        forms = await Form.find({})
          .select("title description createdAt _id")
          .sort({ createdAt: -1 })
        
        // Cache for 5 minutes
        await cache.set(cacheKey, forms, 300)
      }

      res.status(200).json({
        success: true,
        data: forms,
        message: "Forms retrieved successfully",
      })
    } else if (req.method === 'POST') {
      const { title, description, questions, steps, createdBy } = req.body

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        })
      }

      // If questions are provided as a flat array, organize them by stepId
      let organizedSteps = steps || []
      
      if (questions && questions.length > 0) {
        // Group questions by stepId
        const questionsByStep = {}
        // Map frontend question types to backend types
        const typeMapping = {
          'short': 'shortAnswer',
          'paragraph': 'paragraph',
          'multiple': 'multipleChoice',
          'checkbox': 'checkbox',
          'dropdown': 'dropdown'
        }

        questions.forEach(q => {
          if (!questionsByStep[q.stepId]) {
            questionsByStep[q.stepId] = []
          }
          questionsByStep[q.stepId].push({
            type: typeMapping[q.type] || q.type,
            label: q.text,
            options: q.options || [],
            required: q.required || false
          })
        })

        // Create steps with their questions
        organizedSteps = Object.keys(questionsByStep).map(stepId => {
          const step = steps?.find(s => s.id === stepId) || { id: stepId, title: `Step ${stepId.split('-')[1] || '1'}` }
          return {
            title: step.title,
            questions: questionsByStep[stepId]
          }
        })
      }

      const form = new Form({
        title,
        description,
        steps: organizedSteps,
        createdBy: createdBy || "anonymous",
      })

      await form.save()

      // Invalidate forms cache when new form is created
      await cache.del('forms:all')

      res.status(201).json({
        success: true,
        data: form,
        message: "Form created successfully",
      })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

