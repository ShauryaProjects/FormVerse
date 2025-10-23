import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log("🧪 Testing forms API endpoint...")
    
    // Test if we can reach the forms API
    const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Forms API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: "Forms API is working",
      formsCount: data.data?.length || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Forms API test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Forms API test failed",
      error: (error as Error).message,
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log("🧪 Testing form creation...")
    
    const testForm = {
      title: "Test Form " + Date.now(),
      description: "This is a test form",
      steps: [
        {
          id: "step-1",
          title: "Test Step"
        }
      ],
      questions: [
        {
          id: "q1",
          text: "What is your name?",
          type: "short",
          stepId: "step-1",
          required: true
        }
      ]
    }
    
    const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testForm),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Form creation failed: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: "Form creation test successful",
      formId: data.data?._id || data._id,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Form creation test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Form creation test failed",
      error: (error as Error).message,
    }, { status: 500 })
  }
}
