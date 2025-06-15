"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface BasicSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  className?: string
}

export function BasicSelect({ options, value, onValueChange, placeholder, className }: BasicSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value)

  // Handle toggle dropdown
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Toggle clicked")
    setIsOpen(!isOpen)
  }

  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    console.log("Option clicked:", optionValue)
    onValueChange(optionValue)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative w-full" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onMouseDown={handleToggle}
        className={cn(
          "w-full justify-between h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-[#141823]",
          !value && "text-muted-foreground",
          className,
        )}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div
          className="absolute z-[9999] w-full mt-1 bg-[#141823] border border-[#315F8C] rounded-md shadow-lg max-h-[200px] overflow-auto"
          style={{ pointerEvents: "auto" }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleOptionClick(option.value)
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-[#315F8C]/20 text-white text-sm flex items-center justify-between",
                value === option.value && "bg-[#315F8C]/30",
              )}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
