import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

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
const Form = require(path.join(projectRoot, "../../../../models/Form.js"))
const Submission = require(path.join(projectRoot, "../../../../models/Submission.js"))
const { cache } = require(path.join(projectRoot, "../../../../lib/redis.js"))

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
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
    const { responses, formId } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({
        success: false,
        message: "Form responses are required",
      }, { status: 400 })
    }

    // Verify the form exists
    const form = await Form.findById(id)
    if (!form) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    // Create the submission
    const submission = new Submission({
      formId: id,
      responses: responses,
      submittedAt: new Date(),
    })

    await submission.save()

    // Invalidate form cache when new submission is created
    await cache.del(`form:${id}`)

    return NextResponse.json({
      success: true,
      data: submission,
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

    // Get all submissions for this form
    const submissions = await Submission.find({ formId: id })
      .sort({ submittedAt: -1 })

    return NextResponse.json({
      success: true,
      data: submissions,
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
