import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms/[id] - Get a specific form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // For now, return a mock form to test the API route
    const mockForm = {
      _id: id,
      title: "Test Form",
      description: "This is a test form",
      steps: [
        { id: "step-1", title: "Step 1" }
      ],
      questions: [
        {
          id: "question-0-0",
          text: "What is your name?",
          type: "short",
          required: true,
          placeholder: "Enter your name",
          options: [],
          stepId: "step-1"
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockForm,
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
