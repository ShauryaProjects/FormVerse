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
          onComplete: () => {
            // ANIMATION-FOCUS SYNC: Focus happens after animation completes
            // This ensures the animation plays fully before auto-focusing
            console.log("🎬 GSAP animation completed, starting focus sequence")
            
            // Try to find the contentEditable div with multiple selectors
            const tryFocus = (attempt: number) => {
              // Strategy 1: Find via data attribute wrapper
              let editableDiv = newCard.querySelector('[data-question-input] div[contenteditable="true"]') as HTMLElement
              
              // Strategy 2: Direct search for contentEditable in the card
              if (!editableDiv) {
                editableDiv = newCard.querySelector('div[contenteditable="true"]') as HTMLElement
              }
              
              // Strategy 3: Search all nested contentEditable divs
              if (!editableDiv) {
                const allEditable = newCard.querySelectorAll('div[contenteditable="true"]')
                editableDiv = allEditable[0] as HTMLElement
              }
              
              if (editableDiv) {
                console.log("✅ Found contentEditable div, focusing...")
                
                // Focus the contentEditable element
                // This will open the mobile keyboard and keep it open
                editableDiv.focus()
                
                // Position cursor at the end for immediate typing
                const range = document.createRange()
                const selection = window.getSelection()
                if (editableDiv.childNodes.length > 0) {
                  range.selectNodeContents(editableDiv)
                  range.collapse(false) // Collapse to the end
                } else {
                  range.setStart(editableDiv, 0)
                  range.setEnd(editableDiv, 0)
                }
                selection?.removeAllRanges()
                selection?.addRange(range)
                
                console.log("✅ Auto-focused new question input successfully")
                newlyAddedQuestionId.current = null
              } else if (attempt < 5) {
                console.log(`⚠️ Attempt ${attempt + 1}: contentEditable not found, retrying...`)
                setTimeout(() => tryFocus(attempt + 1), 300)
              } else {
                console.log("ℹ️ Skipping auto-focus - user can manually click the input")
                newlyAddedQuestionId.current = null
              }
            }
            
            // Start the focus attempt with a delay to let DOM settle completely
            // The element needs to be fully rendered and interactive
            setTimeout(() => tryFocus(0), 300)
          }
        })
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
