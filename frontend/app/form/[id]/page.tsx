"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Step = {
  id: string
  title: string
}

type Question = {
  id: string
  text: string
  type: string
  required: boolean
  options?: string[]
  stepId: string
  placeholder?: string
}

type Form = {
  _id: string
  title: string
  description: string
  steps: Step[]
  questions: Question[]
  createdAt: string
}

export default function FormViewPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch form")
        }
        const result = await response.json()
        setForm(result.data)
      } catch (err) {
        setError("Failed to load form")
        console.error("Error fetching form:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (formId) {
      fetchForm()
    }
  }, [formId])

  const handleInputChange = (questionId: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (form && currentStepIndex < form.steps.length - 1) {
      setCurrentStepIndex((step: number) => step + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const renderFormattedText = (text: string) => {
    // If the text is already HTML (contains HTML tags), use it directly
    if (text.includes('<') && text.includes('>')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />
    }
    
    // Fallback for plain text
    return <span>{text}</span>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-lg">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
          <p className="text-gray-600">{error || "The form you're looking for doesn't exist."}</p>
        </div>
      </div>
    )
  }

  const currentStep = form.steps[currentStepIndex]
  const currentStepQuestions = form.questions.filter((q: Question) => q.stepId === currentStep.id)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === form.steps.length - 1

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Form Header and Auth Section - Black Background */}
        <div className="rounded-2xl bg-black p-6 shadow-lg">
          {/* Form Header */}
          <div className="mb-4 space-y-2">
            <h1 className="text-2xl font-bold text-white md:text-3xl wrap-break-word overflow-wrap-anywhere">{form.title || "Untitled Form"}</h1>
            {form.description && (
              <div className="text-sm text-white/80 leading-relaxed whitespace-pre-line wrap-break-word overflow-wrap-anywhere">
                {form.description}
              </div>
            )}
            {form.steps.length > 1 && (
              <div className="text-xs text-white/70 font-medium">
                {currentStep?.title} ({currentStepIndex + 1} of {form.steps.length})
              </div>
            )}
          </div>

          {/* Dark Grey Separator Line */}
          <div className="border-t border-gray-600 mb-4"></div>

          {/* Google Authentication Mockup */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Your Name</p>
                  <p className="text-xs text-white/70">hey@gmail.com</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-black/50 text-black hover:bg-white/10 hover:border-white/50 hover:text-white"
              >
                Switch Account
              </Button>
            </div>
          </div>
        </div>

        {/* Form Questions Container - Original styling */}
        <div className="rounded-2xl bg-neutral-100 p-6 shadow-lg">
          {/* Questions */}
          {currentStepQuestions.length > 0 ? (
            <div className="space-y-6">
              {currentStepQuestions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-sm font-semibold text-black">
                    {index + 1}. {renderFormattedText(question.text || "Untitled Question")}
                    {question.required && <span className="ml-1 text-red-600">*</span>}
                  </Label>

                  {question.type === "short" && (
                    <Input
                      placeholder={question.placeholder && question.placeholder.length > 0 ? question.placeholder : "Your answer"}
                      className="h-8 text-sm border-black/20 bg-white text-black"
                      disabled
                    />
                  )}

                  {question.type === "paragraph" && (
                    <Textarea
                      placeholder={question.placeholder && question.placeholder.length > 0 ? question.placeholder : "Your answer"}
                      rows={3}
                      className="text-sm border-black/20 bg-white text-black resize-none"
                      disabled
                    />
                  )}

                  {question.type === "multiple" && (
                    <RadioGroup>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} disabled />
                          <Label
                            htmlFor={`${question.id}-${optionIndex}`}
                            className="font-normal text-black cursor-pointer"
                          >
                            {option || `Option ${optionIndex + 1}`}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "checkbox" && (
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Checkbox id={`${question.id}-${optionIndex}`} disabled />
                          <Label
                            htmlFor={`${question.id}-${optionIndex}`}
                            className="font-normal text-black cursor-pointer"
                          >
                            {option || `Option ${optionIndex + 1}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <Select disabled>
                      <SelectTrigger className="h-8 text-sm border-black/20 bg-white text-black">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option, optionIndex) => (
                          <SelectItem key={optionIndex} value={option}>
                            {option || `Option ${optionIndex + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              <div className="mt-6 flex items-center justify-between gap-3">
                {form.steps.length > 1 && !isFirstStep && (
                  <Button
                    onClick={handlePrev}
                    variant="outline"
                    className="h-8 text-sm border-black/20 bg-white text-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <ChevronLeft className="mr-1 h-3 w-3" />
                    Previous
                  </Button>
                )}

                {isLastStep ? (
                  <Button className="ml-auto h-8 text-sm bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] px-4">
                    Submit Form
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="ml-auto h-8 text-sm bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] px-4"
                  >
                    Next Step
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-black/40 text-sm">No questions yet. Add questions to see the preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

