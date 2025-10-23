"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FormSettings from "./form-settings"
import QuestionList from "./question-list"
import FormPreviewLive from "./form-preview-live"
import StepsPanel from "./steps-panel"
import type { Step } from "./steps-panel"
import { ArrowLeft, Save, Eye, X } from "lucide-react"
import Link from "next/link"

export type QuestionType = "short" | "paragraph" | "multiple" | "checkbox" | "dropdown"

export interface Question {
  id: string
  text: string
  type: QuestionType
  required: boolean
  placeholder?: string
  options?: string[]
  stepId: string // Added stepId to associate questions with steps
}

export interface FormData {
  title: string
  description: string
  questions: Question[]
  steps: Step[] // Added steps array
}

interface FormBuilderProps {
  initialFormData?: FormData | null
  formId?: string | null
}

export default function FormBuilder({ initialFormData, formId }: FormBuilderProps = {}) {
  const [steps, setSteps] = useState<Step[]>(initialFormData?.steps || [{ id: "step-1", title: "Step 1" }])
  const [activeStepId, setActiveStepId] = useState<string>(initialFormData?.steps?.[0]?.id || "step-1")

  const [formData, setFormData] = useState<FormData>({
    title: initialFormData?.title || "",
    description: initialFormData?.description || "",
    questions: initialFormData?.questions || [],
    steps: initialFormData?.steps || [{ id: "step-1", title: "Step 1" }],
  })
  const [savedFormId, setSavedFormId] = useState<string | null>(null)
  const [isPreviewOpen, setPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const activeStepQuestions = formData.questions.filter((q) => q.stepId === activeStepId)

  const handleSaveForm = async () => {
    if (!formData.title.trim()) {
      setSaveError("Please enter a form title")
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const url = formId ? `/api/forms/${formId}` : "/api/forms"
      const method = formId ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          questions: formData.questions,
          steps: formData.steps,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save form")
      }

      const savedForm = await response.json()
      console.log("Full API response:", savedForm)
      
      // Handle different response structures
      const newFormId = savedForm.data?._id || savedForm._id || savedForm.data?.id || savedForm.id
      console.log("Extracted form ID:", newFormId)
      
      if (newFormId) {
        setSavedFormId(newFormId)
        console.log("Form saved successfully with ID:", newFormId)
      } else {
        console.error("No form ID found in response:", savedForm)
        setSaveError("Form saved but no ID returned")
      }
    } catch (error) {
      console.error("Error saving form:", error)
      setSaveError("Failed to save form. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuestionsChange = (questions: Question[]) => {
    const otherStepQuestions = formData.questions.filter((q) => q.stepId !== activeStepId)
    setFormData({ ...formData, questions: [...otherStepQuestions, ...questions] })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-black hover:text-black/60 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <Button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="bg-black text-white hover:bg-black/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Success Message - Outside scrollable area */}
        {savedFormId && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-auto px-4">
            <div className="rounded-2xl border-2 border-green-500 bg-green-100 p-6 mb-6 shadow-lg">
              <h3 className="mb-2 text-xl font-bold text-green-900">🎉 Form Saved Successfully!</h3>
              <p className="mb-3 text-sm text-green-700">Share this link with others:</p>
              <div className="flex items-center gap-3">
                <Input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/form/${savedFormId}`}
                  className="flex-1 border-green-400 bg-white text-black font-mono"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/form/${savedFormId}`)
                    setIsLinkCopied(true)
                    setTimeout(() => setIsLinkCopied(false), 2000)
                  }}
                  variant="outline"
                  className="border-green-400 bg-green-200 text-green-800 hover:bg-green-300"
                >
                  {isLinkCopied ? "Copied!!" : "Copy Link"}
                </Button>
              </div>
              <div className="mt-3">
                <Link href="/admin">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    View in Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[18%_42%_40%] gap-0 h-[calc(100vh-8rem)]">
          {/* Left Column: Steps Panel (18%) */}
          <div className="overflow-y-auto pr-3 border-r border-black/10">
            <StepsPanel
              steps={steps}
              activeStepId={activeStepId}
              onStepsChange={(newSteps) => {
                setSteps(newSteps)
                setFormData({ ...formData, steps: newSteps })
              }}
              onActiveStepChange={setActiveStepId}
            />
          </div>

          {/* Middle Column: Form Builder (42%) */}
          <div className="overflow-y-auto px-3 border-r border-black/10">
            <div className="space-y-8">
              {/* Form Settings */}
              <FormSettings
                title={formData.title}
                description={formData.description}
                onTitleChange={(title) => setFormData({ ...formData, title })}
                onDescriptionChange={(description) => setFormData({ ...formData, description })}
              />

              {/* Question List for Active Step */}
              <QuestionList
                questions={activeStepQuestions}
                onQuestionsChange={handleQuestionsChange}
                stepId={activeStepId}
              />

              {/* Save Error */}
              {saveError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="mb-2 text-lg font-semibold text-red-800">Save Failed</h3>
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Live Preview (40%) - hidden on mobile */}
          <div className="overflow-y-auto pl-3 hidden lg:block">
            <div className="sticky top-0 mb-4 pb-4 bg-white/80 backdrop-blur-sm border-b border-black/10">
              <h2 className="text-lg font-semibold text-black">Preview</h2>
              <p className="text-sm text-black/60">
                Step {steps.findIndex((s) => s.id === activeStepId) + 1} of {steps.length}
              </p>
            </div>
            <FormPreviewLive
              formData={formData}
              activeStepId={activeStepId}
              steps={steps}
              onStepChange={setActiveStepId}
            />
          </div>
        </div>
      </div>

      {/* Floating mobile button to open preview */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <Button
          onClick={() => setPreviewOpen(true)}
          className="rounded-xl bg-black text-white shadow-xl px-5 py-6 h-auto hover:bg-black/90 transition-transform duration-200 hover:scale-105"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Preview
        </Button>
      </div>

      {/* Mobile Preview Modal */}
      {isPreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end">
            <div className="w-full rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out">
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                <div className="font-semibold text-black">Preview</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewOpen(false)}
                  className="text-black/60 hover:text-black hover:bg-black/5"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
                <FormPreviewLive
                  formData={formData}
                  activeStepId={activeStepId}
                  steps={steps}
                  onStepChange={setActiveStepId}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
