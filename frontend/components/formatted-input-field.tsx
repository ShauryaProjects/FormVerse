"use client"

import { useState, useRef, useEffect } from "react"
import { Bold, Italic, Underline } from "lucide-react"

interface FormattedInputFieldProps {
  value?: string
  onChange?: (htmlValue: string) => void
  placeholder?: string
  className?: string
}

export default function FormattedInputField({
  value = "",
  onChange,
  placeholder = "Start typing here…",
  className = ""
}: FormattedInputFieldProps) {
  const [formattedValue, setFormattedValue] = useState(value)
  const [boldActive, setBoldActive] = useState(false)
  const [italicActive, setItalicActive] = useState(false)
  const [underlineActive, setUnderlineActive] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Update internal state when value prop changes
  useEffect(() => {
    setFormattedValue(value)
    if (editorRef.current) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const htmlContent = e.currentTarget.innerHTML
    setFormattedValue(htmlContent)
    onChange?.(htmlContent)
  }

  const handleFormat = (command: string, activeState: boolean, setActiveState: (active: boolean) => void) => {
    // Focus the editor first
    editorRef.current?.focus()
    
    // Execute the formatting command
    document.execCommand(command, false)
    
    // Toggle the active state
    setActiveState(!activeState)
  }

  const handleBold = () => {
    handleFormat("bold", boldActive, setBoldActive)
  }

  const handleItalic = () => {
    handleFormat("italic", italicActive, setItalicActive)
  }

  const handleUnderline = () => {
    handleFormat("underline", underlineActive, setUnderlineActive)
  }

  const isPlaceholderVisible = formattedValue === "" || formattedValue === "<br>" || formattedValue === "<div><br></div>"

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex gap-2 p-2 bg-gray-100 rounded-t-lg">
        <button
          type="button"
          onClick={handleBold}
          className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
            boldActive ? "bg-blue-200 text-blue-600" : "text-gray-600"
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
            italicActive ? "bg-blue-200 text-blue-600" : "text-gray-600"
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
            underlineActive ? "bg-blue-200 text-blue-600" : "text-gray-600"
          }`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="border-t border-gray-300 p-3 min-h-[100px] outline-none rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          suppressContentEditableWarning={true}
        />
        {isPlaceholderVisible && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
