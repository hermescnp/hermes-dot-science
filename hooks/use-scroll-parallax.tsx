"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useActiveSection } from "@/hooks/use-active-section"

interface UseScrollParallaxOptions {
  sectionId: string
  intensity?: number
  debounceMs?: number
}

export function useScrollParallax({ sectionId, intensity = 0.5, debounceMs = 150 }: UseScrollParallaxOptions) {
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const { isActive } = useActiveSection()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const rafRef = useRef<number>()
  const isScrollingRef = useRef(false)

  const shouldAnimate = isActive(sectionId)

  const updateParallax = useCallback(() => {
    if (!shouldAnimate) return

    const element = document.getElementById(sectionId)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const elementTop = rect.top
    const elementHeight = rect.height
    const windowHeight = window.innerHeight

    // Calculate how much of the element is visible and its position
    const elementCenter = elementTop + elementHeight / 2
    const windowCenter = windowHeight / 2

    // Calculate offset based on element position relative to viewport center
    const relativePosition = (windowCenter - elementCenter) / windowHeight
    const offset = relativePosition * intensity * 100

    // Smooth the transition
    rafRef.current = requestAnimationFrame(() => {
      setParallaxOffset(offset)
    })
  }, [shouldAnimate, sectionId, intensity])

  const handleScroll = useCallback(() => {
    if (!shouldAnimate) return

    // Mark as scrolling
    isScrollingRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set timeout to update when scrolling stops
    timeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false
      updateParallax()
    }, debounceMs)
  }, [updateParallax, debounceMs, shouldAnimate])

  useEffect(() => {
    if (!shouldAnimate) {
      setParallaxOffset(0)
      return
    }

    // Initial calculation
    updateParallax()

    // Add scroll listener with passive flag for better performance
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, updateParallax, shouldAnimate])

  return parallaxOffset
}
