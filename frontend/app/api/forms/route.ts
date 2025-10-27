import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

// Use stable relative imports so they work on Vercel
const Form = require("../../../models/Form.js")
const { cache } = require("../../../lib/redis.js")

// Connect to MongoDB Atlas (via Vercel environment variables)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("🔄 MongoDB Atlas already connected")
    return
  }
  
  try {
    console.log("🔗 Attempting MongoDB Atlas connection...")
    console.log("📍 mongo_MONGODB_URI:", process.env.mongo_MONGODB_URI ? "Set (Vercel MongoDB Atlas)" : "Not set")
    
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
    console.error("❌ Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      code: (error as any).code
    })
    throw error
  }
}

// GET /api/forms - Get all forms for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Extract userId from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // USER ISOLATION: Build query to filter by userId
    // This ensures users can only see their own forms, preventing data mix-up
    // For backward compatibility with old forms without userId, we also fetch those
    const query = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : { userId: { $exists: false } }
    
    const cacheKey = userId ? `forms:user:${userId}` : 'forms:all'
    
    // Try to get from cache first
    const cachedForms = await cache.get(cacheKey)
    if (cachedForms) {
      console.log("📦 Serving forms from cache")
      return NextResponse.json({
        success: true,
        data: cachedForms,
        message: "Forms retrieved successfully (cached)",
      })
    }

    // Get from database - only forms belonging to the current user
    const forms = await Form.find(query).sort({ createdAt: -1 })
    
    // Debug log showing user isolation in action
    console.log(`📄 Forms fetched for user: ${userId || 'no-auth'} (${forms.length} forms)`)
    console.log("🔒 User data isolation: Each user can only access their own forms")

    // Cache for 5 minutes
    await cache.set(cacheKey, forms, 300)

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
    console.log("🔄 Starting form creation...")
    
    // Check if MongoDB URI is available
    if (!process.env.mongo_MONGODB_URI) {
      console.error("❌ mongo_MONGODB_URI environment variable not set")
      return NextResponse.json({
        success: false,
        message: "Database configuration error",
        error: "mongo_MONGODB_URI not configured"
      }, { status: 500 })
    }

    console.log("🔗 Connecting to MongoDB...")
    await connectDB()
    console.log("✅ MongoDB connected successfully")
    
    // Log the actual environment variable value (first few chars for security)
    const mongoUri = process.env.mongo_MONGODB_URI
    console.log("🔍 MongoDB URI preview:", mongoUri ? `${mongoUri.substring(0, 20)}...` : "undefined")
    
    const body = await request.json()
    console.log("📝 Form data received:", { title: body.title, stepsCount: body.steps?.length, questionsCount: body.questions?.length })
    
    const { title, description, questions, steps, createdBy, userId } = body
    
    // USER ISOLATION: Validate that userId is provided
    // Without this, we can't associate forms with specific users and risk data leakage
    if (!userId) {
      console.warn("⚠️ Form creation attempted without userId - this is a security risk")
    }

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // Transform data structure to match MongoDB schema
    console.log("📋 Creating form document...")
    console.log("📊 Original data:", { title, steps: steps?.length, questions: questions?.length })
    
    // Transform questions to be nested inside steps
    const transformedSteps = (steps || []).map(step => {
      const stepQuestions = (questions || []).filter(q => q.stepId === step.id)
      return {
        title: step.title,
        questions: stepQuestions.map(q => ({
          type: q.type === 'short' ? 'shortAnswer' : 
                q.type === 'multiple' ? 'multipleChoice' : 
                q.type, // paragraph, checkbox, dropdown are already correct
          label: q.text,
          options: q.options || [],
          required: q.required || false
        }))
      }
    })
    
    console.log("🔄 Transformed steps:", transformedSteps.map(s => ({ 
      title: s.title, 
      questionsCount: s.questions.length 
    })))
    
    const newForm = new Form({
      title,
      description: description || "",
      steps: transformedSteps,
      createdBy: createdBy || "anonymous",
      userId, // USER ISOLATION: Associate form with the logged-in user's UID
    })

    console.log("💾 Saving form to database...")
    const savedForm = await newForm.save()
    
    // Debug log showing user-specific form creation
    console.log(`✅ Form saved for user: ${userId || 'anonymous'} (Form ID: ${savedForm._id})`)

    // Try to invalidate cache (don't fail if Redis is not available)
    try {
      await cache.del('forms:all')
      if (userId) {
        await cache.del(`forms:user:${userId}`)
      }
      console.log("🗑️ Forms cache invalidated")
    } catch (cacheError) {
      console.warn("⚠️ Cache invalidation failed (Redis may not be available):", cacheError)
    }

    return NextResponse.json({
      success: true,
      data: savedForm,
      message: "Form created successfully",
    }, { status: 201 })
  } catch (error) {
    console.error("❌ Form creation error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to save form. Please try again.",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}

// DELETE /api/forms - Delete a form by ID (for admin dashboard)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // USER ISOLATION: Verify form ownership before deleting
    if (userId) {
      const existingForm = await Form.findById(formId)
      if (existingForm && existingForm.userId && existingForm.userId !== userId) {
        console.warn(`⚠️ User ${userId} attempted to delete form ${formId} owned by ${existingForm.userId}`)
        return NextResponse.json({
          success: false,
          message: "Unauthorized: You can only delete your own forms",
        }, { status: 403 })
      }
    }

    const deletedForm = await Form.findByIdAndDelete(formId)
    
    if (!deletedForm) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    console.log(`🗑️ Form deleted: ${formId}`)

    // Invalidate caches
    await cache.del('forms:all')
    await cache.del(`form:${formId}`)

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