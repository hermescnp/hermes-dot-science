"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

interface Option {
  value: string
  label: string
}

interface SimpleSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  className?: string
}

export function SimpleSelect({ options, value, onValueChange, placeholder, className }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0, openUpward: false })
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const selectedOption = options.find((option) => option.value === value)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200 // Approximate max height
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top

    // Determine if we should open upward
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    setPosition({
      top: openUpward ? triggerRect.top - 5 : triggerRect.bottom + 5,
      left: triggerRect.left,
      width: triggerRect.width,
      openUpward,
    })
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isOpen) {
      calculatePosition()
    }
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Option clicked:", optionValue)
    onValueChange(optionValue)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside both the trigger and dropdown
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Recalculate position on scroll or resize
  React.useEffect(() => {
    if (!isOpen) return

    const handlePositionUpdate = () => {
      calculatePosition()
    }

    window.addEventListener("scroll", handlePositionUpdate, true)
    window.addEventListener("resize", handlePositionUpdate)

    return () => {
      window.removeEventListener("scroll", handlePositionUpdate, true)
      window.removeEventListener("resize", handlePositionUpdate)
    }
  }, [isOpen, calculatePosition])

  return (
    <div className="relative w-full">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between h-12 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-[#315F8C] focus:bg-[#141823]",
          !value && "text-muted-foreground",
          className,
        )}
        onClick={handleToggle}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Render dropdown in a portal to avoid clipping */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed bg-[#141823] border border-[#315F8C] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm max-h-[200px] overflow-auto z-[9999]"
            style={{
              top: position.openUpward ? `${position.top}px` : `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              transform: position.openUpward ? "translateY(-100%)" : "none",
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full text-left relative flex cursor-pointer select-none items-center rounded-sm py-2.5 px-3 text-sm text-white outline-none hover:bg-[#315F8C]/20 focus:bg-[#315F8C]/30 transition-colors",
                  value === option.value && "bg-[#315F8C]/30",
                )}
                onClick={(e) => handleOptionClick(option.value, e)}
              >
                <span className="flex-1">{option.label}</span>
                {value === option.value && <Check className="h-4 w-4 ml-2" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
