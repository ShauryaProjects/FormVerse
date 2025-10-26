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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasOptions = ["multiple", "checkbox", "dropdown"].includes(question.type)
  
  // Auto-focus question input when newly added (controlled by parent component timing)
  useEffect(() => {
    // The parent component handles the animation and focusing
    // This effect is kept for any additional setup if needed
  }, [isNewlyAdded])

  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const addOption = () => {
    const options = question.options || []
    const newIndex = options.length
    onUpdate(question.id, { options: [...options, ""] })
    
    // Auto-focus timing strategy:
    // Wait for React to render the new option input in the DOM
    // Then focus it immediately so keyboard stays open on mobile
    setTimeout(() => {
      const input = optionInputRefs.current[newIndex]
      if (input) {
        // Focus the new input field
        input.focus()
        // On mobile devices, this keeps the keyboard open
        // and allows immediate typing
      }
    }, 100) // Small delay to ensure DOM is updated
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
    optionInputRefs.current = optionInputRefs.current.filter((_, i) => i !== optionIndex)
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
              {(question.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    ref={(el) => {
                      optionInputRefs.current[optionIndex] = el
                    }}
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
              ))}
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