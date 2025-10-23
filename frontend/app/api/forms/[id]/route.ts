import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

// Use stable relative imports so they work on Vercel
const Form = require("../../../../models/Form.js")
const { cache } = require("../../../../lib/redis.js")

// Connect to MongoDB Atlas (via Vercel environment variables)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("🔄 MongoDB Atlas already connected")
    return
  }
  
  try {
    console.log("🔗 Attempting MongoDB Atlas connection...")
    
    // Connect to MongoDB Atlas using Vercel environment variable
    await mongoose.connect(process.env.mongo_MONGODB_URI!, {
      // MongoDB Atlas specific options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    console.log("✅ MongoDB Atlas connected successfully via Vercel")
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error)
    throw error
  }
}

// GET /api/forms/[id] - Get a specific form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔍 Form viewing request for ID:", params.id)
    
    await connectDB()
    
    const { id } = params

    if (!id) {
      console.log("❌ No form ID provided")
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    console.log("🔍 Searching for form with ID:", id)

    // Try to get from cache first
    try {
      const cachedForm = await cache.get(`form:${id}`)
      if (cachedForm) {
        console.log(`📦 Serving form ${id} from cache`)
        return NextResponse.json({
          success: true,
          data: cachedForm,
          message: "Form retrieved successfully (cached)",
        })
      }
    } catch (cacheError) {
      console.warn("⚠️ Cache lookup failed (Redis may not be available):", cacheError)
    }

    // Get from database
    console.log("🔍 Querying database for form:", id)
    const form = await Form.findById(id)
    
    if (!form) {
      console.log("❌ Form not found in database for ID:", id)
      
      // Let's also check if there are any forms in the database
      const allForms = await Form.find().limit(5)
      console.log("📊 Available forms in database:", allForms.map(f => ({ id: f._id, title: f.title })))
      
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    console.log(`✅ Retrieved form ${id} from database:`, { id: form._id, title: form.title })

    // Transform data structure to match frontend expectations
    const transformedForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      steps: form.steps.map(step => ({
        id: step._id || `step-${Math.random()}`,
        title: step.title
      })),
      questions: form.steps.flatMap(step => 
        step.questions.map(q => ({
          id: q._id || `question-${Math.random()}`,
          text: q.label,
          type: q.type === 'shortAnswer' ? 'short' :
                q.type === 'multipleChoice' ? 'multiple' :
                q.type, // paragraph, checkbox, dropdown are already correct
          required: q.required,
          options: q.options || [],
          stepId: step._id || `step-${Math.random()}`
        }))
      ),
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }
    
    console.log("🔄 Transformed form for frontend:", {
      id: transformedForm._id,
      title: transformedForm.title,
      stepsCount: transformedForm.steps.length,
      questionsCount: transformedForm.questions.length
    })

    // Try to cache for 10 minutes (don't fail if Redis is not available)
    try {
      await cache.set(`form:${id}`, transformedForm, 600)
      console.log("💾 Form cached successfully")
    } catch (cacheError) {
      console.warn("⚠️ Cache storage failed (Redis may not be available):", cacheError)
    }

    return NextResponse.json({
      success: true,
      data: transformedForm,
      message: "Form retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Form viewing error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}

// PUT /api/forms/[id] - Update a specific form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔄 Form update request for ID:", params.id)
    
    await connectDB()
    
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    console.log("📝 Form update data:", {
      id,
      title: body.title,
      stepsCount: body.steps?.length || 0,
      questionsCount: body.questions?.length || 0
    })

    // Transform frontend data to MongoDB schema
    const transformedSteps = body.steps.map((step: any, index: number) => ({
      title: step.title || `Step ${index + 1}`,
      questions: body.questions
        .filter((q: any) => q.stepId === step.id)
        .map((question: any) => ({
          label: question.text,
          type: question.type === 'short' ? 'shortAnswer' :
                question.type === 'multiple' ? 'multipleChoice' :
                question.type, // paragraph, checkbox, dropdown are already correct
          required: question.required || false,
          options: question.options || [],
          placeholder: question.placeholder || ""
        }))
    }))

    console.log("🔄 Transformed steps for MongoDB:", transformedSteps)

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description || "",
        steps: transformedSteps,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedForm) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    console.log(`✅ Form updated successfully: ${id}`)

    // Invalidate caches
    await cache.del('forms:all')
    await cache.del(`form:${id}`)

    return NextResponse.json({
      success: true,
      data: updatedForm,
      message: "Form updated successfully",
    })
  } catch (error) {
    console.error("❌ Form update error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}

// DELETE /api/forms/[id] - Delete a specific form
export async function DELETE(
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

    const deletedForm = await Form.findByIdAndDelete(id)
    
    if (!deletedForm) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    console.log(`🗑️ Form deleted: ${id}`)

    // Invalidate caches
    await cache.del('forms:all')
    await cache.del(`form:${id}`)

    return NextResponse.json({
      success: true,
      data: deletedForm,
      message: "Form deleted successfully",
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