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

// GET /api/forms/[id] - Get a specific form
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
    const cachedForm = await cache.get(`form:${id}`)
    if (cachedForm) {
      console.log(`📦 Serving form ${id} from cache`)
      return NextResponse.json({
        success: true,
        data: cachedForm,
        message: "Form retrieved successfully (cached)",
      })
    }

    // Get from database
    const form = await Form.findById(id)
    
    if (!form) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    console.log(`📊 Retrieved form ${id} from database`)

    // Cache for 10 minutes
    await cache.set(`form:${id}`, form, 600)

    return NextResponse.json({
      success: true,
      data: form,
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