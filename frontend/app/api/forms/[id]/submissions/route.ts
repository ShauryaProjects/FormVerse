import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for submissions (will reset on server restart)
let submissionsStorage: any[] = []

// POST /api/forms/[id]/submissions - Submit a form response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // Create new submission
    const newSubmission = {
      _id: `submission-${Date.now()}`,
      formId: id,
      responses: body.responses || {},
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    // Add to storage
    submissionsStorage.push(newSubmission)

    return NextResponse.json({
      success: true,
      data: newSubmission,
      message: "Form submitted successfully",
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

// GET /api/forms/[id]/submissions - Get form submissions
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

    // Find submissions for this form
    const formSubmissions = submissionsStorage.filter(s => s.formId === id)

    return NextResponse.json({
      success: true,
      data: { submissions: formSubmissions },
      message: "Submissions retrieved successfully",
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