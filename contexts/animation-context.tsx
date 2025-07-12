"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AnimationContextType {
  isPaused: boolean
  pauseAnimations: () => void
  resumeAnimations: () => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [isPaused, setIsPaused] = useState(false)

  const pauseAnimations = () => {
    setIsPaused(true)
  }

  const resumeAnimations = () => {
    setIsPaused(false)
  }

  return (
    <AnimationContext.Provider value={{ isPaused, pauseAnimations, resumeAnimations }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
} 