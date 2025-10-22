import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms - Get all forms
export async function GET() {
  try {
    // For now, just return mock data to avoid database connection issues
    const mockForms = [
      {
        _id: "mock-form-1",
        title: "Sample Form 1",
        description: "This is a sample form",
        createdAt: new Date().toISOString()
      },
      {
        _id: "mock-form-2",
        title: "Sample Form 2", 
        description: "Another sample form",
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockForms,
      message: "Forms retrieved successfully (mock data)",
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
    const body = await request.json()
    const { title, description, questions, steps, createdBy } = body

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // Return mock response for now
    const mockForm = {
      _id: `mock-form-${Date.now()}`,
      title,
      description,
      steps: steps || [],
      questions: questions || [],
      createdBy: createdBy || "anonymous",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockForm,
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
