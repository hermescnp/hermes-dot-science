"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
}: CustomSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-[#315F8C] focus:bg-[#141823]",
            !value && "text-muted-foreground",
            triggerClassName,
          )}
          onClick={() => setOpen(!open)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-full p-0 bg-[#141823] border-[#315F8C] text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm z-[100]",
          contentClassName,
        )}
        align="start"
      >
        <div className="max-h-[200px] overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm py-2.5 px-3 text-sm outline-none hover:bg-[#315F8C]/20 focus:bg-[#315F8C]/30",
                value === option.value && "bg-[#315F8C]/30",
              )}
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
            >
              <span className="flex-1">{option.label}</span>
              {value === option.value && <Check className="h-4 w-4 ml-2" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
