"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-lg">Loading form...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
            <p className="text-gray-600">{error || "The form you're looking for doesn't exist."}</p>
          </div>
        </div>
      </div>
    )
  }

  const currentStep = form.steps[currentStepIndex]
  const currentStepQuestions = form.questions.filter((q: Question) => q.stepId === currentStep.id)
  const progress = ((currentStepIndex + 1) / form.steps.length) * 100

    return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
        {/* Form Header */}
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 text-lg">{form.description}</p>
            )}
          </div>
        </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 max-w-4xl py-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStepIndex + 1} of {form.steps.length}
        </p>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">{currentStep.title}</h2>
          
          <div className="space-y-6">
            {currentStepQuestions.map((question: Question) => {
              const questionId = question.id
              const isRequired = question.required

              return (
                <div key={questionId} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {question.text}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>

                {question.type === "short" && (
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e: { target: HTMLInputElement }) => handleInputChange(questionId, e.target.value)}
                      disabled
                  />
                )}

                {question.type === "paragraph" && (
                    <textarea
                    rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e: { target: HTMLTextAreaElement }) => handleInputChange(questionId, e.target.value)}
                      disabled
                    />
                  )}

                  {question.type === "multiple" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="radio"
                            name={questionId}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            disabled
                          />
                          <label className="ml-2 text-gray-700">{option}</label>
                      </div>
                    ))}
                    </div>
                  )}

                  {question.type === "checkbox" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled
                          />
                          <label className="ml-2 text-gray-700">{option}</label>
                      </div>
                    ))}
                  </div>
                )}

                  {question.type === "dropdown" && question.options && (
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      disabled
                    >
                      <option value="">Select an option</option>
                      {question.options.map((option: string, optIdx: number) => (
                        <option key={optIdx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                )}
              </div>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                    Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === form.steps.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStepIndex === form.steps.length - 1 ? "Done" : "Next"}
            </button>
        </div>
      </div>
        </div>
      </div>
    )
}

