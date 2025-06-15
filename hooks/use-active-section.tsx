"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ActiveSectionContextType {
  activeSection: string | null
  setActiveSection: (section: string | null) => void
  isActive: (section: string) => boolean
}

const ActiveSectionContext = createContext<ActiveSectionContextType | undefined>(undefined)

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const isActive = (section: string) => activeSection === section

  return (
    <ActiveSectionContext.Provider value={{ activeSection, setActiveSection, isActive }}>
      {children}
    </ActiveSectionContext.Provider>
  )
}

export function useActiveSection() {
  const context = useContext(ActiveSectionContext)
  if (context === undefined) {
    throw new Error("useActiveSection must be used within an ActiveSectionProvider")
  }
  return context
}

export function useSectionObserver(sectionId: string, options?: IntersectionObserverInit) {
  const { setActiveSection } = useActiveSection()

  useEffect(() => {
    const element = document.getElementById(sectionId)
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId)
          }
        })
      },
      {
        threshold: 0.3, // Section is considered active when 30% is visible
        rootMargin: "-20% 0px -20% 0px", // Reduce the active area slightly
        ...options,
      },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [sectionId, setActiveSection])
}
