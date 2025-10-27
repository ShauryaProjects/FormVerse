"use client"

import { useState, useEffect } from "react"
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

type Submission = {
  _id: string
  formId: string
  email?: string
  name?: string
  responses: Record<string, string | string[]>
  submittedAt: string
}

interface SubmittedFormViewProps {
  form: {
    _id: string
    title: string
    description?: string
    steps?: Array<{ id: string; title: string }>
    questions?: Array<{
      id: string
      text: string
      type: string
      required: boolean
      options?: string[]
      stepId: string
      placeholder?: string
    }>
    createdAt: string
  }
  submission: {
    _id: string
    name?: string
    email?: string
    submittedAt: string
    responses?: Record<string, string | string[]>
  }
  onClose: () => void
}

export default function SubmittedFormView({ form, submission, onClose }: SubmittedFormViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const renderFormattedText = (text: string) => {
    // If the text is already HTML (contains HTML tags), use it directly
    if (text.includes('<') && text.includes('>')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />
    }
    
    // Fallback for plain text
    return <span>{text}</span>
  }

  const currentStep = form.steps?.[currentStepIndex]
  const currentStepQuestions = form.questions?.filter((q) => q.stepId === currentStep?.id) || []
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === (form.steps?.length || 1) - 1

  const handleNext = () => {
    if (currentStepIndex < (form.steps?.length || 1) - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{form.title}</h2>
              <p className="text-sm text-white/70">Submission from {new Date(submission.submittedAt).toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
          
          {form.steps && form.steps.length > 1 && (
            <div className="text-xs text-white/70 font-medium">
              {currentStep?.title} ({currentStepIndex + 1} of {form.steps.length})
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Form Questions Container */}
            <div className="rounded-2xl bg-neutral-100 p-6 shadow-lg">
              {currentStepQuestions.length > 0 ? (
                <div className="space-y-6">
                  {currentStepQuestions.map((question, index) => {
                    const response = submission.responses[question.id]
                    
                    return (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-sm font-semibold text-black">
                          {index + 1}. {renderFormattedText(question.text || "Untitled Question")}
                          {question.required && <span className="ml-1 text-red-600">*</span>}
                        </Label>

                        {question.type === "short" && (
                          <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-800">
                              {response ? String(response) : <span className="text-gray-400 italic">No response</span>}
                            </p>
                          </div>
                        )}

                        {question.type === "paragraph" && (
                          <div className="p-3 bg-white border border-gray-200 rounded-lg min-h-[80px]">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {response ? String(response) : <span className="text-gray-400 italic">No response</span>}
                            </p>
                          </div>
                        )}

                        {question.type === "multiple" && (
                          <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-800">
                              {response ? String(response) : <span className="text-gray-400 italic">No response</span>}
                            </p>
                          </div>
                        )}

                        {question.type === "checkbox" && (
                          <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            {Array.isArray(response) && response.length > 0 ? (
                              <div className="space-y-1">
                                {response.map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <Checkbox checked disabled />
                                    <span className="text-sm text-gray-800">{option}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-sm">No response</span>
                            )}
                          </div>
                        )}

                        {question.type === "dropdown" && (
                          <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-800">
                              {response ? String(response) : <span className="text-gray-400 italic">No response</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Navigation */}
                  {form.steps && form.steps.length > 1 && (
                    <div className="mt-6 flex items-center justify-between gap-3">
                      {!isFirstStep && (
                        <Button
                          onClick={handlePrev}
                          variant="outline"
                          className="h-8 text-sm border-black/20 bg-white text-black hover:bg-black hover:text-white transition-all duration-300"
                        >
                          <ChevronLeft className="mr-1 h-3 w-3" />
                          Previous
                        </Button>
                      )}

                      {!isLastStep && (
                        <Button
                          onClick={handleNext}
                          className="ml-auto h-8 text-sm bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] px-4"
                        >
                          Next Step
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-black/40 text-sm">No questions in this step.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
