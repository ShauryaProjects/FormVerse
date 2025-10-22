import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

// Use stable relative imports so they work on Vercel
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
    await connectDB()
    
    const body = await request.json()
    const { title, description, questions, steps, createdBy } = body

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // Create new form
    const newForm = new Form({
      title,
      description: description || "",
      steps: steps || [],
      questions: questions || [],
      createdBy: createdBy || "anonymous",
    })

    const savedForm = await newForm.save()
    console.log(`✅ Form created: ${savedForm._id}`)

    // Invalidate forms cache
    await cache.del('forms:all')

    return NextResponse.json({
      success: true,
      data: savedForm,
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