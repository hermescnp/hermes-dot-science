"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RenderIcon } from "@/components/icon-mapper"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface ProcessStep {
  number: string
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: string
  color: string
  uniqueIcon?: string
}

interface ProcessTimelineProps {
  steps: ProcessStep[]
  currentStep: number
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  language: string
}

export function ProcessTimeline({
  steps,
  currentStep,
  setCurrentStep,
  nextStep,
  prevStep,
  language,
}: ProcessTimelineProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "medium" | "mobile">("desktop")

  // Check screen size and determine view mode
  useEffect(() => {
    const checkViewMode = () => {
      const width = window.innerWidth

      if (width < 768) {
        setViewMode("mobile") // True mobile: 3 items, scaled down
      } else if (width < 1200 && steps.length > 6) {
        setViewMode("medium") // Medium screens: 5 items, original size
      } else if (width < 1024 && steps.length > 4) {
        setViewMode("medium") // Small tablets: 5 items, original size
      } else {
        setViewMode("desktop") // Desktop: all items
      }
    }

    checkViewMode()
    window.addEventListener("resize", checkViewMode)

    return () => window.removeEventListener("resize", checkViewMode)
  }, [steps.length])

  // Calculate visible steps based on view mode
  const getVisibleSteps = () => {
    if (viewMode === "desktop") {
      return steps.map((step, index) => ({ step, originalIndex: index }))
    }

    const totalSteps = steps.length
    const maxVisible = viewMode === "mobile" ? 3 : 5

    // If we have fewer steps than max visible, show all
    if (totalSteps <= maxVisible) {
      return steps.map((step, index) => ({ step, originalIndex: index }))
    }

    const visibleSteps = []
    let startIndex, endIndex

    // Calculate range to keep current step centered when possible
    const halfVisible = Math.floor(maxVisible / 2)

    if (currentStep < halfVisible) {
      // Near the beginning: show first maxVisible steps
      startIndex = 0
      endIndex = maxVisible - 1
    } else if (currentStep >= totalSteps - halfVisible) {
      // Near the end: show last maxVisible steps
      startIndex = totalSteps - maxVisible
      endIndex = totalSteps - 1
    } else {
      // In the middle: center around current step
      startIndex = currentStep - halfVisible
      endIndex = currentStep + halfVisible
    }

    // Create the visible steps array
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < totalSteps) {
        visibleSteps.push({
          step: steps[i],
          originalIndex: i,
        })
      }
    }

    return visibleSteps
  }

  const visibleSteps = getVisibleSteps()

  return (
    <div className="flex justify-center items-center gap-3 sm:gap-6 mb-12">
      {/* Previous Arrow */}
      <Button
        onClick={prevStep}
        disabled={currentStep === 0}
        variant="ghost"
        size="sm"
        className="bg-background/20 backdrop-blur-sm border border-white/10 disabled:opacity-30 hover:bg-background/30 flex-shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Timeline */}
      <div className="flex items-center overflow-hidden">
        {/* Show step counter for compressed views */}
        {viewMode !== "desktop" && (
          <div className="text-xs text-white/60 mr-3 flex-shrink-0">
            {currentStep + 1}/{steps.length}
          </div>
        )}

        {visibleSteps.map((item, index) => (
          <div key={item.originalIndex} className="flex items-center">
            {/* Step Circle */}
            <div className="relative p-2">
              <button
                onClick={() => setCurrentStep(item.originalIndex)}
                className={`relative flex items-center justify-center transition-all duration-300 w-12 h-12 rounded-full ${
                  currentStep === item.originalIndex
                    ? `bg-gradient-to-r ${item.step.color} shadow-lg scale-110`
                    : currentStep > item.originalIndex
                      ? "bg-[#68DBFF]/30 border border-[#68DBFF]"
                      : "bg-white/20 border border-white/30 hover:bg-white/30"
                }`}
              >
                {currentStep > item.originalIndex ? (
                  <div className="rounded-full bg-[#68DBFF] w-3 h-3" />
                ) : (
                  <RenderIcon
                    iconName={item.step.uniqueIcon || "Check"}
                    className={`h-5 w-5 ${currentStep === item.originalIndex ? "text-white" : "text-white/70"}`}
                  />
                )}

                {/* Active pulse effect */}
                {currentStep === item.originalIndex && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#68DBFF]/20 to-[#FF6B9D]/20 animate-pulse" />
                )}
              </button>

              {/* Show step number below active step for compressed views */}
              {viewMode !== "desktop" && currentStep === item.originalIndex && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/80 font-medium">
                  {item.step.number}
                </div>
              )}
            </div>

            {/* Connector Line - only show if not the last visible step */}
            {index < visibleSteps.length - 1 && (
              <div
                className={`transition-colors duration-300 w-8 h-0.5 ${
                  currentStep > item.originalIndex ? "bg-[#68DBFF]" : "bg-white/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Next Arrow */}
      <Button
        onClick={nextStep}
        disabled={currentStep === steps.length - 1}
        variant="ghost"
        size="sm"
        className="bg-background/20 backdrop-blur-sm border border-white/10 disabled:opacity-30 hover:bg-background/30 flex-shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
