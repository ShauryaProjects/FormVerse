import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
// Use stable relative imports so they work on Vercel
// File path: frontend/app/api/forms/route.ts
const Form = require("../../../models/Form.js")
const { cache } = require("../../../lib/redis.js")

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

// GET /api/forms - Get all forms
export async function GET() {
  try {
    await connectDB()

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

    return NextResponse.json({
      success: true,
      data: forms,
      message: "Forms retrieved successfully",
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

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { title, description, questions, steps, createdBy } = body

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // If questions are provided as a flat array, organize them by stepId
    let organizedSteps = steps || []
    
    if (questions && questions.length > 0) {
      // Group questions by stepId
      const questionsByStep: Record<string, any[]> = {}
      // Map frontend question types to backend types
      const typeMapping: Record<string, string> = {
        'short': 'shortAnswer',
        'paragraph': 'paragraph',
        'multiple': 'multipleChoice',
        'checkbox': 'checkbox',
        'dropdown': 'dropdown'
      }

      questions.forEach((q: any) => {
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
        const step = steps?.find((s: any) => s.id === stepId) || { id: stepId, title: `Step ${stepId.split('-')[1] || '1'}` }
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

    return NextResponse.json({
      success: true,
      data: form,
      message: "Form created successfully",
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
