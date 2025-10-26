"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GripVertical, Trash2, Plus, X } from "lucide-react"
import type { Question, QuestionType } from "./form-builder"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import FormattedInputField from "./formatted-input-field"

interface QuestionCardProps {
  question: Question
  index: number
  onUpdate: (id: string, updates: Partial<Question>) => void
  onDelete: (id: string) => void
  isNewlyAdded?: boolean
}

export default function QuestionCard({ question, index, onUpdate, onDelete, isNewlyAdded }: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })
  const questionInputRef = useRef<HTMLDivElement>(null)
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [shouldFocusIndex, setShouldFocusIndex] = useState<number | null>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasOptions = ["multiple", "checkbox", "dropdown"].includes(question.type)
  
  // AUTO-ADD DEFAULT: When question type changes to one that requires options
  // This creates the first option so users can immediately start typing
  useEffect(() => {
    if (hasOptions && (!question.options || question.options.length === 0)) {
      console.log("➕ Adding default option for", question.type)
      onUpdate(question.id, { options: [""] })
      // Auto-focus the first option
      setTimeout(() => setShouldFocusIndex(0), 100)
    }
  }, [hasOptions, question.id, onUpdate])
  
  // Reset focus flag after focusing is done
  useEffect(() => {
    if (shouldFocusIndex !== null) {
      const timer = setTimeout(() => setShouldFocusIndex(null), 500)
      return () => clearTimeout(timer)
    }
  }, [shouldFocusIndex])
  
  // Auto-focus when the question is newly added and animation is likely complete
  useEffect(() => {
    if (isNewlyAdded) {
      // Wait for both the card render and any GSAP animations
      // The animation takes 600ms, plus 100ms buffer = 700ms total
      const focusTimer = setTimeout(() => {
        console.log("🔍 Attempting to focus newly added question")
        
        if (questionInputRef.current) {
          // Find the contentEditable div
          const editableDiv = questionInputRef.current.querySelector('div[contenteditable="true"]') as HTMLElement
          if (editableDiv) {
            console.log("✅ Found editable div, focusing now")
            editableDiv.focus()
            
            // Set cursor position
            try {
              const range = document.createRange()
              const selection = window.getSelection()
              if (selection) {
                range.selectNodeContents(editableDiv)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
              }
            } catch (e) {
              console.warn("Cursor positioning failed:", e)
            }
          } else {
            console.warn("⚠️ contentEditable div not found in questionInputRef")
          }
        } else {
          console.warn("⚠️ questionInputRef.current is null")
        }
      }, 500) // Wait for GSAP animation (600ms) + buffer (100ms)
      
      return () => clearTimeout(focusTimer)
    }
  }, [isNewlyAdded])

  const addOption = () => {
    const options = question.options || []
    const newIndex = options.length
    
    // OPTION-ADD-LOGIC: Add new empty option to the array
    // Then trigger auto-focus on the newly added option
    onUpdate(question.id, { options: [...options, ""] })
    
    // AUTO-FOCUS TRIGGER: Set the index that should receive focus
    // This is handled in the ref callback of the Input component
    // The small delay preserves the fade-in animation
    setTimeout(() => {
      setShouldFocusIndex(newIndex)
      console.log(`🎯 Setting focus target to index ${newIndex}`)
    }, 150)
  }

  const updateOption = (optionIndex: number, value: string) => {
    const options = [...(question.options || [])]
    options[optionIndex] = value
    onUpdate(question.id, { options })
  }

  const removeOption = (optionIndex: number) => {
    const options = question.options?.filter((_, i) => i !== optionIndex) || []
    onUpdate(question.id, { options })
    // Update refs array to match the new options array
    const newRefs = optionInputRefs.current.filter((_, i) => i !== optionIndex)
    optionInputRefs.current.length = 0
    newRefs.forEach(ref => optionInputRefs.current.push(ref))
  }

  const handleTextChange = (htmlValue: string) => {
    onUpdate(question.id, { text: htmlValue })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-black/40" />
      </div>

      {/* Delete Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(question.id)}
        className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="space-y-3 pt-6">
        <div className="space-y-1">
          <Label htmlFor={`question-${question.id}`} className="text-sm text-black">
            Question Text
          </Label>
          <div ref={questionInputRef} data-question-input>
          <FormattedInputField
            value={question.text}
            onChange={handleTextChange}
            placeholder="Enter your question..."
            className="min-h-[60px]"
          />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`type-${question.id}`} className="text-sm text-black">
              Question Type
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                className="scale-75"
              />
              <Label htmlFor={`required-${question.id}`} className="text-xs text-black/60">
                Required
              </Label>
            </div>
          </div>
          <Select
            value={question.type}
            onValueChange={(value: QuestionType) => onUpdate(question.id, { type: value })}
          >
            <SelectTrigger className="h-8 text-sm border-black/20 bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short Answer</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="multiple">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Checkboxes</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options for multiple choice, checkbox, and dropdown */}
        {hasOptions && (
          <div className="space-y-2">
            <Label className="text-sm text-black">Options</Label>
            <div className="space-y-2">
              {(question.options || []).map((option, optionIndex) => {
                const inputRef = (el: HTMLInputElement | null) => {
                  // Store ref for programmatic focus access
                  optionInputRefs.current[optionIndex] = el
                  
                  // AUTO-FOCUS: When this is the target index and element exists, focus it
                  // This happens immediately when React attaches the ref to the DOM element
                  // The delay from addOption ensures animations play before focus
                  if (optionIndex === shouldFocusIndex && el) {
                    console.log(`🎯 Attempting to focus option ${optionIndex + 1}`)
                    // Use requestAnimationFrame to ensure element is fully mounted
                    requestAnimationFrame(() => {
                      el.focus()
                      el.setSelectionRange(0, 0)
                      console.log(`✅ Successfully focused option ${optionIndex + 1}`)
                    })
                  }
                }
                
                return (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(optionIndex, e.target.value)}
                      className="h-7 text-sm border-black/20 bg-white text-black placeholder:text-black/40"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="h-7 text-xs text-black/60 hover:text-black hover:bg-black/5"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Placeholder for short answer and paragraph */}
        {!hasOptions && (
          <div className="space-y-1">
            <Label htmlFor={`placeholder-${question.id}`} className="text-sm text-black">
              Placeholder Text
            </Label>
            <Input
              id={`placeholder-${question.id}`}
              placeholder="Enter placeholder text..."
              value={question.placeholder || ""}
              onChange={(e) => onUpdate(question.id, { placeholder: e.target.value })}
              className="h-8 text-sm border-black/20 bg-white text-black placeholder:text-black/40"
            />
          </div>
        )}
      </div>
    </div>
  )
}