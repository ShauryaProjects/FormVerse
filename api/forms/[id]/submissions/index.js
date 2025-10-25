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
const Submission = require(path.join(projectRoot, "models/Submission.js"))
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

    if (req.method === 'POST') {
      const { id } = req.query
      const { responses, formId, email, name } = req.body

      if (!id) {
        return res.status(400).json({
            success: false,
          message: "Form ID is required",
        })
      }

      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({
          success: false,
          message: "Form responses are required",
        })
      }

      // Verify the form exists
      const form = await Form.findById(id)
      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found",
        })
      }

      // Create the submission
      const submission = new Submission({
        formId: id,
        email: email || null,
        name: name || null,
        responses: responses,
        submittedAt: new Date(),
      })

      await submission.save()

      // Invalidate form cache when new submission is created
      await cache.del(`form:${id}`)

      res.status(201).json({
        success: true,
        data: submission,
        message: "Form submitted successfully",
      })
    } else if (req.method === 'GET') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Form ID is required",
        })
      }

      // Get all submissions for this form
      const submissions = await Submission.find({ formId: id })
        .sort({ submittedAt: -1 })

      res.status(200).json({
        success: true,
        data: submissions,
        message: "Submissions retrieved successfully",
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