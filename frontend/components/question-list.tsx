"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import QuestionCard from "./question-card"
import { Plus } from "lucide-react"
import gsap from "gsap"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Question } from "./form-builder"

interface QuestionListProps {
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
  stepId: string // Added stepId prop
}

export default function QuestionList({ questions, onQuestionsChange, stepId }: QuestionListProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const newlyAddedQuestionId = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out" },
      )
    }
  }, [])

  const addQuestion = () => {
    const questionId = `question-${Date.now()}`
    const newQuestion: Question = {
      id: questionId,
      text: "",
      type: "short",
      required: false,
      placeholder: "",
      stepId: stepId,
    }
    
    // Track this question as newly added
    newlyAddedQuestionId.current = questionId
    
    onQuestionsChange([...questions, newQuestion])

    // Wait for React to render the new question, then animate
    setTimeout(() => {
      const newCard = listRef.current?.lastElementChild as HTMLElement
      if (newCard) {
        // Set initial state for animation
        gsap.set(newCard, { 
          opacity: 0, 
          y: 30, 
          scale: 0.95,
          transformOrigin: "center"
        })
        
        // Find the scrollable parent container
        const scrollContainer = newCard.closest('.overflow-y-auto')
        if (scrollContainer) {
          // Scroll completely to the bottom to show the new question
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        } else {
          // Fallback to scroll into view at the end
          newCard.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
        
        // Animate in with a nice bounce effect
        gsap.to(newCard, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        })
        
        // Auto-focus timing strategy:
        // 1. Wait for GSAP animation to complete (600ms duration)
        // 2. Add small buffer (100ms) for scroll to complete
        // 3. Then focus the contentEditable div to trigger keyboard on mobile
        setTimeout(() => {
          const questionInput = newCard.querySelector('[data-question-input]') as HTMLDivElement
          if (questionInput) {
            // Find the contentEditable div inside FormattedInputField
            const editableDiv = questionInput.querySelector('div[contenteditable="true"]') as HTMLElement
            if (editableDiv) {
              // Force focus on the contentEditable element
              // This ensures the keyboard stays open on mobile devices
              editableDiv.focus()
              // Set cursor to end of text
              const range = document.createRange()
              range.selectNodeContents(editableDiv)
              range.collapse(false)
              const selection = window.getSelection()
              selection?.removeAllRanges()
              selection?.addRange(range)
            }
          }
          newlyAddedQuestionId.current = null // Reset after focusing
        }, 700) // 600ms animation + 100ms buffer for smooth transition
      }
    }, 0) // Use 0ms timeout to ensure DOM is updated
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onQuestionsChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    const element = document.querySelector(`[data-question-id="${id}"]`)
    if (element) {
      gsap.to(element, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          onQuestionsChange(questions.filter((q) => q.id !== id))
        },
      })
    } else {
      onQuestionsChange(questions.filter((q) => q.id !== id))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      onQuestionsChange(arrayMove(questions, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <div ref={listRef} className="space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                isNewlyAdded={newlyAddedQuestionId.current === question.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Button
        ref={buttonRef}
        onClick={addQuestion}
        className="w-full rounded-xl border-2 border-dashed border-black/20 bg-transparent py-4 text-sm text-black hover:border-black/40 hover:bg-black/5 transition-all duration-300 hover:scale-[1.02]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  )
}
