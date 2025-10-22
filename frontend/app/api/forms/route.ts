import { NextRequest, NextResponse } from 'next/server'
import { getForms, addForm, deleteFormById } from '../../../lib/forms-storage'

// GET /api/forms - Get all forms
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: getForms(),
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

// DELETE /api/forms - Delete a form by ID (for admin dashboard)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    const deletedForm = deleteFormById(formId)
    
    if (!deletedForm) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

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

    // Create new form and add to storage
    const newForm = {
      _id: `form-${Date.now()}`,
      title,
      description: description || "",
      steps: steps || [],
      questions: questions || [],
      createdBy: createdBy || "anonymous",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to storage
    addForm(newForm)

    return NextResponse.json({
      success: true,
      data: newForm,
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
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    const deletedForm = deleteFormById(formId)
    
    if (!deletedForm) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

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