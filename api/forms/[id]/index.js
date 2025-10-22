const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")

// Find the project root by looking for package.json
function findProjectRoot() {
  let currentDir = __dirname
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir
    }
    currentDir = path.dirname(currentDir)
  }
  return __dirname
}

const projectRoot = findProjectRoot()
const Form = require(path.join(projectRoot, "models/Form.js"))
const { cache } = require(path.join(projectRoot, "lib/redis.js"))

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

// GET /api/forms/[id] - Get a specific form by ID
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
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Form ID is required",
        })
      }

      // Try to get from cache first
      const cacheKey = `form:${id}`
      let form = await cache.get(cacheKey)
      
      if (!form) {
        // If not in cache, get from database
        form = await Form.findById(id)
        
        if (!form) {
          return res.status(404).json({
            success: false,
            message: "Form not found",
          })
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, form, 600)
      }

      // Transform the form data to match frontend expectations
      const transformedForm = {
        _id: form._id,
        title: form.title,
        description: form.description,
        steps: form.steps.map((step, stepIndex) => ({
          id: `step-${stepIndex + 1}`,
          title: step.title
        })),
        questions: form.steps.flatMap((step, stepIndex) => 
          step.questions.map((question, questionIndex) => ({
            id: `question-${stepIndex}-${questionIndex}`,
            text: question.label,
            type: question.type === 'shortAnswer' ? 'short' : 
                  question.type === 'multipleChoice' ? 'multiple' : 
                  question.type,
            required: question.required,
            placeholder: question.placeholder,
            options: question.options || [],
            stepId: `step-${stepIndex + 1}`
          }))
        ),
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }

      res.status(200).json({
        success: true,
        data: transformedForm,
        message: "Form retrieved successfully",
      })
    } else {
      res.setHeader('Allow', ['GET'])
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