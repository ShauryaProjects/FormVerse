"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GripVertical, Trash2, Plus, X, Bold, Italic } from "lucide-react"
import type { Question, QuestionType } from "./form-builder"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface QuestionCardProps {
  question: Question
  index: number
  onUpdate: (id: string, updates: Partial<Question>) => void
  onDelete: (id: string) => void
}

export default function QuestionCard({ question, index, onUpdate, onDelete }: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasOptions = ["multiple", "checkbox", "dropdown"].includes(question.type)

  const addOption = () => {
    const options = question.options || []
    onUpdate(question.id, { options: [...options, ""] })
  }

  const updateOption = (optionIndex: number, value: string) => {
    const options = [...(question.options || [])]
    options[optionIndex] = value
    onUpdate(question.id, { options })
  }

  const removeOption = (optionIndex: number) => {
    const options = question.options?.filter((_, i) => i !== optionIndex) || []
    onUpdate(question.id, { options })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    const cleanText = getCleanText(question.text)
    
    // If formatting is active, apply it to the new text
    if (isBold && isItalic) {
      onUpdate(question.id, { text: `***${newText}***` })
    } else if (isBold) {
      onUpdate(question.id, { text: `**${newText}**` })
    } else if (isItalic) {
      onUpdate(question.id, { text: `*${newText}*` })
    } else {
      onUpdate(question.id, { text: newText })
    }
  }

  const applyFormatting = (text: string) => {
    if (isBold && isItalic) {
      return `***${text}***`
    } else if (isBold) {
      return `**${text}**`
    } else if (isItalic) {
      return `*${text}*`
    }
    return text
  }

  const toggleBold = () => {
    if (isBold) {
      // Turn off bold
      setIsBold(false)
    } else {
      // Turn on bold
      setIsBold(true)
      setIsItalic(false)
    }
  }

  const toggleItalic = () => {
    if (isItalic) {
      // Turn off italic
      setIsItalic(false)
    } else {
      // Turn on italic
      setIsItalic(true)
      setIsBold(false)
    }
  }

  // Get clean text without formatting symbols for display in input
  const getCleanText = (text: string) => {
    return text.replace(/\*\*\*(.*?)\*\*\*/g, '$1').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
  }

  // Detect formatting state from text
  useEffect(() => {
    const text = question.text
    if (text.includes('***') && text.match(/\*\*\*.*\*\*\*/)) {
      setIsBold(true)
      setIsItalic(true)
    } else if (text.includes('**') && text.match(/\*\*.*\*\*/)) {
      setIsBold(true)
      setIsItalic(false)
    } else if (text.includes('*') && text.match(/\*.*\*/)) {
      setIsBold(false)
      setIsItalic(true)
    } else {
      setIsBold(false)
      setIsItalic(false)
    }
  }, [question.text])

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-question-id={question.id}
      className="rounded-xl border border-white/10 bg-white p-4 shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-black/40 hover:text-black transition-colors active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-black">Q{index + 1}</span>
        </div>
        <Button
          onClick={() => onDelete(question.id)}
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-black/40 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`question-${question.id}`} className="text-sm text-black">
            Question Text
          </Label>
          <Input
            id={`question-${question.id}`}
            placeholder="Enter your question..."
            value={getCleanText(question.text)}
            onChange={handleTextChange}
            className="h-8 text-sm border-black/20 bg-white text-black placeholder:text-black/40"
          />
          {/* Formatting buttons */}
          <div className="flex items-center gap-1 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleBold}
              className={`h-6 w-6 p-0 ${isBold ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-100'}`}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleItalic}
              className={`h-6 w-6 p-0 ${isItalic ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-100'}`}
            >
              <Italic className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`type-${question.id}`} className="text-sm text-black">
              Question Type
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor={`required-${question.id}`} className="text-xs text-black/60">
                Required
              </Label>
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                className="h-4 w-8 [&>span]:h-4 [&>span]:w-4"
              />
            </div>
          </div>

          <Select
            value={question.type}
            onValueChange={(value: QuestionType) => {
              const updates: Partial<Question> = { type: value }
              if (!["multiple", "checkbox", "dropdown"].includes(value)) {
                updates.options = undefined
              } else if (!question.options) {
                updates.options = ["Option 1"]
              }
              onUpdate(question.id, updates)
            }}
          >
            <SelectTrigger className="h-8 text-sm border-black/20 bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short Answer</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="multiple">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasOptions && (
          <div className="space-y-2">
            <Label className="text-sm text-black">Options</Label>
            <div className="space-y-1">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(optionIndex, e.target.value)}
                    className="h-7 text-sm flex-1 border-black/20 bg-white text-black placeholder:text-black/40"
                  />
                  <Button
                    onClick={() => removeOption(optionIndex)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-black/40 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={addOption}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-black/20 bg-transparent text-black hover:bg-black/5"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor={`placeholder-${question.id}`} className="text-sm text-black">
            Placeholder
          </Label>
          <Input
            id={`placeholder-${question.id}`}
            placeholder="Enter a placeholder shown in the input"
            value={question.placeholder ?? ""}
            onChange={(e) => onUpdate(question.id, { placeholder: e.target.value })}
            className="h-8 text-sm border-black/20 bg-white text-black placeholder:text-black/40"
          />
        </div>
      </div>
    </div>
  )
}
