import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

// Use stable relative imports so they work on Vercel
const Form = require("../../../models/Form.js")

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
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    })
    console.log("✅ MongoDB Atlas connected successfully via Vercel")
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error)
    throw error
  }
}

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    console.log("🧪 Testing database connection...")
    
    // Check environment variable
    const mongoUri = process.env.mongo_MONGODB_URI
    console.log("📍 mongo_MONGODB_URI:", mongoUri ? "Set" : "Not set")
    console.log("🔍 MongoDB URI preview:", mongoUri ? `${mongoUri.substring(0, 30)}...` : "undefined")
    
    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        message: "mongo_MONGODB_URI environment variable not set",
        error: "Environment variable missing"
      }, { status: 500 })
    }

    // Test connection
    await connectDB()
    console.log("✅ Database connection successful")

    // Test a simple query
    const formCount = await Form.countDocuments()
    console.log(`📊 Found ${formCount} forms in database`)

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connectionStatus: "connected",
        formCount: formCount,
        mongoUriPreview: mongoUri.substring(0, 30) + "..."
      }
    })
  } catch (error) {
    console.error("❌ Database test error:", error)
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      details: {
        name: (error as Error).name,
        message: (error as Error).message,
        code: (error as any).code
      }
    }, { status: 500 })
  }
}
