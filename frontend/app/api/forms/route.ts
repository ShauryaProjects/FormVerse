import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms - Get all forms
export async function GET() {
  try {
    // Return mock data for now
    const mockForms = [
      {
        _id: "form-1",
        title: "Test Form 1",
        description: "This is a test form",
        createdAt: new Date().toISOString()
      },
      {
        _id: "form-2", 
        title: "Test Form 2",
        description: "Another test form",
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockForms,
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
    const body = await request.json()
    const { title, description, questions, steps, createdBy } = body

    if (!title) {
      return NextResponse.json({
        success: false,
        message: "Title is required",
      }, { status: 400 })
    }

    // Return mock created form
    const mockForm = {
      _id: `form-${Date.now()}`,
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
