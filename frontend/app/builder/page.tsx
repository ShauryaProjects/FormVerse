"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import FormBuilder from "@/components/form-builder"
import type { FormData } from "@/components/form-builder"

function BuilderPageContent() {
  const searchParams = useSearchParams()
  const formId = searchParams.get('id')
  const [isLoading, setIsLoading] = useState(!!formId)
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null)

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        try {
          const response = await fetch(`/api/forms/${formId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              // Transform the data to match FormData interface
              const formData: FormData = {
                title: data.data.title || "",
                description: data.data.description || "",
                questions: data.data.questions || [],
                steps: data.data.steps || [{ id: "step-1", title: "Step 1" }]
              }
              setInitialFormData(formData)
            }
          }
        } catch (error) {
          console.error("Error fetching form:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchForm()
    }
  }, [formId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <FormBuilder initialFormData={initialFormData} formId={formId} />
    </main>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60">Loading...</p>
        </div>
      </div>
    }>
      <BuilderPageContent />
    </Suspense>
  )
}
