import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

// Use stable relative imports so they work on Vercel
const Form = require("../../../../../models/Form.js")
const Submission = require("../../../../../models/Submission.js")
const { cache } = require("../../../../../lib/redis.js")

// Connect to MongoDB Atlas (via Vercel environment variables)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("🔄 MongoDB Atlas already connected")
    return
  }
  
  try {
    console.log("🔗 Attempting MongoDB Atlas connection...")
    
    // Connect to MongoDB Atlas using Vercel environment variable
    await mongoose.connect(process.env.MONGODB_URI!, {
      // MongoDB Atlas specific options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    })
    console.log("✅ MongoDB Atlas connected successfully via Vercel")
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error)
    throw error
  }
}

// POST /api/forms/[id]/submissions - Submit a form response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // Verify form exists
    const form = await Form.findById(id)
    if (!form) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    // Create new submission
    const newSubmission = new Submission({
      formId: id,
      responses: body.responses || {},
    })

    const savedSubmission = await newSubmission.save()
    console.log(`✅ Submission created for form ${id}`)

    // Invalidate submissions cache
    await cache.del(`submissions:${id}`)

    return NextResponse.json({
      success: true,
      data: savedSubmission,
      message: "Form submitted successfully",
    }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}

// GET /api/forms/[id]/submissions - Get form submissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // Try to get from cache first
    const cachedSubmissions = await cache.get(`submissions:${id}`)
    if (cachedSubmissions) {
      console.log(`📦 Serving submissions for form ${id} from cache`)
      return NextResponse.json({
        success: true,
        data: { submissions: cachedSubmissions },
        message: "Submissions retrieved successfully (cached)",
      })
    }

    // Get from database
    const submissions = await Submission.find({ formId: id }).sort({ submittedAt: -1 })
    console.log(`📊 Retrieved ${submissions.length} submissions for form ${id}`)

    // Cache for 2 minutes
    await cache.set(`submissions:${id}`, submissions, 120)

    return NextResponse.json({
      success: true,
      data: { submissions },
      message: "Submissions retrieved successfully",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}