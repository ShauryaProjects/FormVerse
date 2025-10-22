"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Question {
  id: string
  text: string
  type: "short" | "paragraph" | "multiple" | "checkbox" | "dropdown"
  required: boolean
  placeholder?: string
  options?: string[]
  stepId: string
}

interface Step {
  id: string
  title: string
}

interface FormData {
  _id: string
  title: string
  description: string
  questions: Question[]
  steps: Step[]
  createdAt: string
  updatedAt: string
}

export default function FormViewPage() {
  const params = useParams()
  const formId = params.id as string
  
  const [formData, setFormData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formResponses, setFormResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching form with ID:", formId)
        
        const response = await fetch(`/api/forms/${formId}`)
        console.log("📡 API response status:", response.status)
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log("❌ Form not found (404)")
            setError("Form not found")
          } else {
            console.log("❌ API error:", response.status)
            setError("Failed to load form")
          }
          return
        }

        const data = await response.json()
        console.log("📊 API response data:", data)
        
        // Validate the form data structure
        if (!data.data && !data._id) {
          console.error("❌ Invalid form data structure:", data)
          setError("Invalid form data")
          return
        }
        
        const formData = data.data || data
        console.log("✅ Form data received:", {
          id: formData._id,
          title: formData.title,
          stepsCount: formData.steps?.length,
          questionsCount: formData.questions?.length
        })
        
        setFormData(formData)
      } catch (err) {
        console.error("❌ Error fetching form:", err)
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      fetchForm()
    }
  }, [formId])

  // Safe access to form data with fallbacks
  const currentStep = formData?.steps?.[currentStepIndex] || null
  const currentStepQuestions = formData?.questions?.filter(q => q.stepId === currentStep?.id) || []
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === (formData?.steps?.length || 1) - 1

  const handleInputChange = (questionId: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handlePreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: formResponses,
          formId: formData._id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setSubmitSuccess(true)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-black" />
          <p className="text-black/60">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-black mb-4">Form Not Found</h1>
          <p className="text-black/60 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-black/90">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="rounded-full bg-green-100 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-4">Form Submitted!</h1>
          <p className="text-black/60 mb-6">Thank you for your submission.</p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-black/90">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!formData) {
    console.log("❌ No form data available")
    return null
  }

  // Add error boundary for rendering
  try {
    return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Form Preview Container - Same styling as form builder preview */}
        <div className="rounded-2xl bg-neutral-100 p-8 shadow-lg">
          {/* Form Header */}
          <div className="mb-8 space-y-3">
            <h1 className="text-3xl font-bold text-black md:text-4xl">{formData.title}</h1>
            {formData.description && <p className="text-black/60 leading-relaxed">{formData.description}</p>}
            {formData.steps.length > 1 && (
              <div className="text-sm text-black/60 font-medium">
                {currentStep?.title} ({currentStepIndex + 1} of {formData.steps.length})
              </div>
            )}
          </div>

          {/* Questions */}
          {currentStepQuestions.length > 0 ? (
            <div className="space-y-8">
              {currentStepQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-semibold text-black">
                    {index + 1}. {question.text}
                    {question.required && <span className="ml-1 text-red-600">*</span>}
                  </Label>

                {question.type === "short" && (
                  <Input
                    placeholder={question.placeholder || "Your answer"}
                    className="border-black/20 bg-white text-black"
                    value={formResponses[question.id] || ""}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                  />
                )}

                {question.type === "paragraph" && (
                  <Textarea
                    placeholder={question.placeholder || "Your answer"}
                    rows={4}
                    className="border-black/20 bg-white text-black resize-none"
                    value={formResponses[question.id] || ""}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                  />
                )}

                {question.type === "multiple" && (
                  <RadioGroup
                    value={formResponses[question.id] || ""}
                    onValueChange={(value) => handleInputChange(question.id, value)}
                  >
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="font-normal text-black cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "checkbox" && (
                  <div className="space-y-3">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${optionIndex}`}
                          checked={formResponses[question.id]?.includes(option) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = formResponses[question.id] || []
                            if (checked) {
                              handleInputChange(question.id, [...currentValues, option])
                            } else {
                              handleInputChange(question.id, currentValues.filter((v: string) => v !== option))
                            }
                          }}
                        />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="font-normal text-black cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "dropdown" && (
                  <Select
                    value={formResponses[question.id] || ""}
                    onValueChange={(value) => handleInputChange(question.id, value)}
                  >
                    <SelectTrigger className="border-black/20 bg-white text-black">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option, optionIndex) => (
                        <SelectItem key={optionIndex} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}

              <div className="mt-8 flex items-center justify-between gap-4">
                {formData.steps.length > 1 && !isFirstStep && (
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="border-black/20 bg-white text-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="ml-auto bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] py-6 px-8 text-base disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Form"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    className="ml-auto bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] py-6 px-8 text-base"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
          </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-black/40 text-sm">This form has no questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    )
  } catch (renderError) {
    console.error("❌ Render error:", renderError)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-black mb-4">Form Error</h1>
          <p className="text-black/60 mb-6">There was an error loading this form. Please try again.</p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-black/90">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}
