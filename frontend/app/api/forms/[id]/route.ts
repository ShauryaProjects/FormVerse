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
const Form = require(path.join(projectRoot, "../../../models/Form.js"))
const { cache } = require(path.join(projectRoot, "../../../lib/redis.js"))

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

// GET /api/forms/[id] - Get a specific form by ID
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
    const cacheKey = `form:${id}`
    let form = await cache.get(cacheKey)
    
    if (!form) {
      // If not in cache, get from database
      form = await Form.findById(id)
      
      if (!form) {
        return NextResponse.json({
          success: false,
          message: "Form not found",
        }, { status: 404 })
      }

      // Cache for 10 minutes
      await cache.set(cacheKey, form, 600)
    }

    // Transform the form data to match frontend expectations
    const transformedForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      steps: form.steps.map((step: any, stepIndex: number) => ({
        id: `step-${stepIndex + 1}`,
        title: step.title
      })),
      questions: form.steps.flatMap((step: any, stepIndex: number) => 
        step.questions.map((question: any, questionIndex: number) => ({
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

    return NextResponse.json({
      success: true,
      data: transformedForm,
      message: "Form retrieved successfully",
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
