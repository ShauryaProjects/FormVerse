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
import { auth } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth"
import toast from "react-hot-toast"

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
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success("Signed in successfully!")
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error("Failed to sign in. Please try again.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success("Signed out successfully!")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out.")
    }
  }

  const handleChooseDifferentAccount = async () => {
    try {
      await signOut(auth)
      // Small delay to ensure sign out completes
      setTimeout(() => {
        handleGoogleSignIn()
      }, 100)
    } catch (error) {
      console.error("Error switching accounts:", error)
      toast.error("Failed to switch accounts.")
    }
  }

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
          questionsCount: formData.questions?.length,
          steps: formData.steps,
          questions: formData.questions
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

  // Debug logging
  console.log("🔍 Form rendering debug:", {
    formData: !!formData,
    steps: formData?.steps,
    questions: formData?.questions,
    currentStepIndex,
    currentStep,
    currentStepQuestions,
    allQuestionsCount: formData?.questions?.length || 0,
    currentStepQuestionsCount: currentStepQuestions.length
  })

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
    
    if (!user) {
      toast.error("Please sign in with Google to submit the form")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: formResponses,
          email: user?.email || null,
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

  if (loading || isAuthLoading) {
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
        {/* Form Header and Auth Section - Black Background */}
        <div className="rounded-2xl bg-black p-8 shadow-lg mb-8">
          {/* Form Header */}
          <div className="mb-6 space-y-3">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{formData.title}</h1>
            {formData.description && <p className="text-white/80 leading-relaxed">{formData.description}</p>}
            {formData.steps.length > 1 && (
              <div className="text-sm text-white/70 font-medium">
                {currentStep?.title} ({currentStepIndex + 1} of {formData.steps.length})
              </div>
            )}
          </div>

          {/* Dark Grey Separator Line */}
          <div className="border-t border-gray-600 mb-6"></div>

          {/* Google Authentication */}
          <div className="space-y-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.photoURL || ""} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{user.displayName}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleChooseDifferentAccount}
                  variant="outline"
                  size="sm"
                  className="border-black/50 text-black hover:bg-white/10 hover:border-white/50 hover:text-white"
                >
                  Switch Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
                <p className="text-xs text-white/70">Your email will be shown in the responses.</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Questions Container - Original styling */}
        <div className="rounded-2xl bg-neutral-100 p-8 shadow-lg">

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
                    disabled={isSubmitting || !user}
                    className="ml-auto bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-[1.02] py-6 px-8 text-base disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : !user ? (
                      "Sign in to Submit"
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
