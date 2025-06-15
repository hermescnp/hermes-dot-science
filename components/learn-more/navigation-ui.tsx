"use client"

import { ArrowUp, ArrowDown, ArrowLeft, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

interface NavigationArrowsProps {
  currentSnapPoint: number
  totalSnapPoints: number
  isAtFooter: boolean
  prevSection: () => void
  nextSection: () => void
}

export function NavigationArrows({
  currentSnapPoint,
  totalSnapPoints,
  isAtFooter,
  prevSection,
  nextSection,
}: NavigationArrowsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Hide on mobile
  if (isMobile) {
    return null
  }

  const handlePrevClick = () => {
    console.log("Up arrow clicked")
    prevSection()
  }

  const handleNextClick = () => {
    console.log("Down arrow clicked")
    nextSection()
  }

  return (
    <div className="fixed right-2 sm:right-3 md:right-6 top-1/2 transform -translate-y-1/2 z-[100] flex flex-col gap-3">
      <Button
        onClick={handlePrevClick}
        disabled={currentSnapPoint <= 0 && !isAtFooter}
        variant="ghost"
        size="sm"
        className={`transition-all duration-300 ${
          currentSnapPoint <= 0 && !isAtFooter
            ? "bg-background/10 backdrop-blur-sm border border-white/5 opacity-30 cursor-not-allowed"
            : "bg-background/20 backdrop-blur-sm border border-white/10 hover:bg-background/30 hover:border-white/20"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleNextClick}
        disabled={currentSnapPoint >= totalSnapPoints - 1 && isAtFooter}
        variant="ghost"
        size="sm"
        className={`transition-all duration-300 ${
          currentSnapPoint >= totalSnapPoints - 1 && isAtFooter
            ? "bg-background/10 backdrop-blur-sm border border-white/5 opacity-30 cursor-not-allowed"
            : "bg-background/20 backdrop-blur-sm border border-white/10 hover:bg-background/30 hover:border-white/20"
        }`}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface SectionIndicatorsProps {
  sections: string[]
  currentSnapPoint: number
  scrollToSection: (index: number) => void
}

export function SectionIndicators({ sections, currentSnapPoint, scrollToSection }: SectionIndicatorsProps) {
  return (
    <div className="fixed left-2 sm:left-3 md:left-6 top-1/2 transform -translate-y-1/2 z-[100] flex flex-col gap-3">
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(index)}
          className={`relative w-3 h-8 rounded-full transition-all duration-500 ease-out ${
            currentSnapPoint === index
              ? "bg-[#68DBFF] shadow-[0_0_15px_rgba(104,219,255,0.8)] scale-110"
              : "bg-white/30 hover:bg-white/50 hover:scale-105"
          }`}
          title={`Go to ${section} section`}
        >
          {/* Active indicator dot */}
          {currentSnapPoint === index && <div className="absolute inset-0 rounded-full bg-[#68DBFF] animate-pulse" />}
        </button>
      ))}
    </div>
  )
}

interface BackButtonProps {
  lang: string
  language: string
}

export function BackButton({ lang, language }: BackButtonProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    // On mobile, return null - the button will be rendered in the navbar
    return null
  }

  // Desktop version - keep the original fixed positioning
  return (
    <div className="fixed top-24 left-2 sm:left-3 md:left-6 z-[100]">
      <Link
        href={`/${lang}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors bg-background/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "es" ? "Volver al inicio" : "Back to home"}
      </Link>
    </div>
  )
}

// New component for mobile back button in navbar
interface MobileBackButtonProps {
  lang: string
  language: string
}

export function MobileBackButton({ lang, language }: MobileBackButtonProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!isMobile) {
    return null
  }

  return (
    <Button
      asChild
      variant="ghost"
      className="h-12 w-12 p-0 bg-background/60 backdrop-blur-sm"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
      aria-label={language === "es" ? "Volver al inicio" : "Back to home"}
    >
      <Link href={`/${lang}`}>
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">{language === "es" ? "Volver al inicio" : "Back to home"}</span>
      </Link>
    </Button>
  )
}
