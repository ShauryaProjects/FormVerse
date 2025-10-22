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
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
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

// GET /api/forms - Get all forms
export async function GET() {
  try {
    await connectDB()
    
    // Try to get from cache first
    const cachedForms = await cache.get('forms:all')
    if (cachedForms) {
      console.log("📦 Serving forms from cache")
      return NextResponse.json({
        success: true,
        data: cachedForms,
        message: "Forms retrieved successfully (cached)",
      })
    }

    // Get from database
    const forms = await Form.find().sort({ createdAt: -1 })
    console.log(`📊 Retrieved ${forms.length} forms from database`)

    // Cache for 5 minutes
    await cache.set('forms:all', forms, 300)

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
    
    const body = await request.json()
    console.log("📝 Form data received:", { title: body.title, stepsCount: body.steps?.length, questionsCount: body.questions?.length })
    
    const { title, description, questions, steps, createdBy } = body

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // Create new form
    console.log("📋 Creating form document...")
    const newForm = new Form({
      title,
      description: description || "",
      steps: steps || [],
      questions: questions || [],
      createdBy: createdBy || "anonymous",
    })

    console.log("💾 Saving form to database...")
    const savedForm = await newForm.save()
    console.log(`✅ Form created successfully: ${savedForm._id}`)

    // Try to invalidate cache (don't fail if Redis is not available)
    try {
      await cache.del('forms:all')
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

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
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