import { NextRequest, NextResponse } from 'next/server'
import { findFormById, deleteFormById } from '../../../../lib/forms-storage'

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

    // Find form in storage
    const form = findFormById(id)
    
    if (!form) {
      return NextResponse.json({
        success: false,
        message: "Form not found",
      }, { status: 404 })
    }

    // Transform the form data to match frontend expectations
    const transformedForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      steps: form.steps?.map((step: any, stepIndex: number) => ({
        id: `step-${stepIndex + 1}`,
        title: step.title
      })) || [],
      questions: form.steps?.flatMap((step: any, stepIndex: number) => 
        step.questions?.map((question: any, questionIndex: number) => ({
          id: `question-${stepIndex}-${questionIndex}`,
          text: question.label,
          type: question.type === 'shortAnswer' ? 'short' : 
                question.type === 'multipleChoice' ? 'multiple' : 
                question.type,
          required: question.required,
          placeholder: question.placeholder,
          options: question.options || [],
          stepId: `step-${stepIndex + 1}`
        })) || []
      ) || [],
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: transformedForm,
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
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Form ID is required",
      }, { status: 400 })
    }

    // Find and remove form from storage
    const deletedForm = deleteFormById(id)
    
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