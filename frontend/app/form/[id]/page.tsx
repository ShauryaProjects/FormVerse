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
import { auth } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth"

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
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

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

  // Track current user for authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData((prev: Record<string, string | string[]>) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setFormData((prev: Record<string, string | string[]>) => {
      const currentValues = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, option] }
      } else {
        return { ...prev, [questionId]: currentValues.filter(v => v !== option) }
      }
    })
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

  const handleSubmit = async () => {
    if (!form) return

    setIsSubmitting(true)
    try {
      // Extract email from form responses if user filled an email field
      let submissionEmail = currentUser?.email || ""
      let submissionName = currentUser?.displayName || ""
      
      // Look for email field in form responses
      Object.entries(formData).forEach(([questionId, response]) => {
        const question = form.questions.find(q => q.id === questionId)
        if (question && question.text.toLowerCase().includes('email') && typeof response === 'string') {
          submissionEmail = response || submissionEmail
        }
        if (question && (question.text.toLowerCase().includes('name') || question.text.toLowerCase().includes('full name')) && typeof response === 'string') {
          submissionName = response || submissionName
        }
      })

      console.log('📤 Submitting form with:', {
        email: submissionEmail,
        name: submissionName,
        responsesCount: Object.keys(formData).length
      })

      const response = await fetch(`/api/forms/${formId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          responses: formData,
          email: submissionEmail,
          name: submissionName,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setIsSubmitted(true)
      console.log('✅ Form submitted successfully')
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      setError('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      console.log('✅ User signed in successfully')
    } catch (error) {
      console.error('❌ Error signing in:', error)
      setError('Failed to sign in. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ Error signing out:', error)
      setError('Failed to sign out. Please try again.')
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

          {/* Google Authentication */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-white">
                    {currentUser?.displayName || "Your Name"}
                  </p>
                  <p className="text-xs text-white/70">
                    {currentUser?.email || "hey@gmail.com"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={currentUser ? handleSignOut : handleSignIn}
                disabled={isSigningIn}
                className="h-7 text-xs border-black/50 text-black hover:bg-white/10 hover:border-white/50 hover:text-white disabled:opacity-50"
              >
                {isSigningIn ? "Signing in..." : currentUser ? "Sign Out" : "Sign In"}
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
                      value={(formData[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                    />
                  )}

                  {question.type === "paragraph" && (
                    <Textarea
                      placeholder={question.placeholder && question.placeholder.length > 0 ? question.placeholder : "Your answer"}
                      rows={3}
                      className="text-sm border-black/20 bg-white text-black resize-none"
                      value={(formData[question.id] as string) || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                    />
                  )}

                  {question.type === "multiple" && (
                    <RadioGroup
                      value={(formData[question.id] as string) || ""}
                      onValueChange={(value) => handleInputChange(question.id, value)}
                    >
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
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
                      {question.options?.map((option, optionIndex) => {
                        const currentValues = (formData[question.id] as string[]) || []
                        const isChecked = currentValues.includes(option)
                        return (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${question.id}-${optionIndex}`} 
                              checked={isChecked}
                              onCheckedChange={(checked) => handleCheckboxChange(question.id, option, checked as boolean)}
                            />
                            <Label
                              htmlFor={`${question.id}-${optionIndex}`}
                              className="font-normal text-black cursor-pointer"
                            >
                              {option || `Option ${optionIndex + 1}`}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <Select
                      value={(formData[question.id] as string) || ""}
                      onValueChange={(value) => handleInputChange(question.id, value)}
                    >
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
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="ml-auto h-8 text-sm bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] px-4 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Form"}
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

      {/* Success Message - Full Screen */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">Success!</h1>
            <p className="text-lg text-gray-600">Your form has been submitted successfully.</p>
          </div>
        </div>
      )}
    </div>
  )
}

