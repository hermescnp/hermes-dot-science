"use client"

import { useState, useEffect, useRef, useCallback, type RefObject } from "react"

interface UseSectionScrollOptions {
  sections: string[]
  footerRef: RefObject<HTMLDivElement>
}

interface UseSectionScrollResult {
  currentSnapPoint: number
  isAtFooter: boolean
  scrollY: number
  scrollToSection: (sectionIndex: number) => void
  nextSection: () => void
  prevSection: () => void
  getCurrentSection: () => number
}

export function useSectionScroll({ sections, footerRef }: UseSectionScrollOptions): UseSectionScrollResult {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0)
  const [isAtFooter, setIsAtFooter] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const isScrollingRef = useRef(false)

  // All sections including footer for navigation
  const allSections = [...sections, "footer"]

  // Get current section including footer
  const getCurrentSection = useCallback(() => {
    if (typeof window === "undefined") return 0

    const scrollPosition = window.scrollY
    const viewportHeight = window.innerHeight

    // Check if we're at the footer
    if (footerRef.current) {
      const footerTop = footerRef.current.offsetTop - 100 // Add some buffer
      if (scrollPosition >= footerTop) {
        return sections.length // Footer is after all other sections
      }
    }

    // Get actual section elements and their positions
    const sectionElements = sections.map((id) => document.getElementById(id))

    // Find which section is currently most visible
    let currentSection = 0
    let maxVisibility = 0

    sectionElements.forEach((element, index) => {
      if (!element) return

      const rect = element.getBoundingClientRect()
      const elementTop = rect.top
      const elementBottom = rect.bottom
      const elementHeight = rect.height

      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, -elementTop)
      const visibleBottom = Math.min(elementHeight, viewportHeight - elementTop)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      const visibilityRatio = visibleHeight / viewportHeight

      // Section is considered active if it's more than 30% visible
      if (visibilityRatio > 0.3 && visibilityRatio > maxVisibility) {
        maxVisibility = visibilityRatio
        currentSection = index
      }
    })

    return currentSection
  }, [sections, footerRef])

  // Scroll to a specific section using snap scroll
  const scrollToSection = useCallback(
    (sectionIndex: number) => {
      console.log("scrollToSection called with index:", sectionIndex)

      const sectionId = allSections[sectionIndex]
      console.log("Target section ID:", sectionId)

      let targetElement: HTMLElement | null = null

      if (sectionId === "footer") {
        targetElement = footerRef.current
      } else {
        targetElement = document.getElementById(sectionId)
      }

      console.log("Target element:", targetElement)

      if (targetElement) {
        // Use scrollIntoView which works better with CSS scroll-snap
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      } else {
        console.error("Target element not found for section:", sectionId)
      }
    },
    [sections, footerRef],
  )

  // Trigger snap scroll to next section
  const nextSection = useCallback(() => {
    console.log("nextSection called")

    // Get the current section in real-time
    const realTimeCurrentSection = getCurrentSection()
    const realTimeIsAtFooter = footerRef.current ? window.scrollY >= footerRef.current.offsetTop - 100 : false

    console.log("Current section:", realTimeCurrentSection, "Is at footer:", realTimeIsAtFooter)

    // If we're at the last visible section (CTA) and not at footer yet
    if (realTimeCurrentSection === sections.length - 1 && !realTimeIsAtFooter) {
      console.log("Moving to footer")
      scrollToSection(sections.length) // Scroll to footer
      return
    }

    // Otherwise, go to next section if not at the end
    const nextSnapPoint = Math.min(realTimeCurrentSection + 1, sections.length - 1)
    console.log("Next snap point:", nextSnapPoint)

    if (nextSnapPoint !== realTimeCurrentSection) {
      console.log("Scrolling to next section:", nextSnapPoint)
      scrollToSection(nextSnapPoint)
    } else {
      console.log("Already at the last section")
    }
  }, [getCurrentSection, scrollToSection, sections.length, footerRef])

  // Trigger snap scroll to previous section
  const prevSection = useCallback(() => {
    console.log("prevSection called")

    // Get the current section in real-time
    const realTimeCurrentSection = getCurrentSection()
    const realTimeIsAtFooter = footerRef.current ? window.scrollY >= footerRef.current.offsetTop - 100 : false

    console.log("Current section:", realTimeCurrentSection, "Is at footer:", realTimeIsAtFooter)

    // If we're at the footer, go back to CTA section
    if (realTimeIsAtFooter) {
      console.log("Moving from footer to CTA")
      scrollToSection(sections.length - 1) // CTA section
      return
    }

    // Otherwise, go to previous section if not at the beginning
    const prevSnapPoint = Math.max(realTimeCurrentSection - 1, 0)
    console.log("Previous snap point:", prevSnapPoint)

    if (prevSnapPoint !== realTimeCurrentSection) {
      console.log("Scrolling to previous section:", prevSnapPoint)
      scrollToSection(prevSnapPoint)
    } else {
      console.log("Already at the first section")
    }
  }, [getCurrentSection, scrollToSection, sections.length, footerRef])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const updateScrollState = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      // Update current snap point based on actual section visibility
      const currentSection = getCurrentSection()

      if (currentSection < sections.length) {
        setCurrentSnapPoint(currentSection)
        setIsAtFooter(false)
      } else {
        // If we're at the footer, keep the last section highlighted
        setCurrentSnapPoint(sections.length - 1)
        setIsAtFooter(true)
      }
    }

    // Initial call with multiple attempts to ensure sections are properly detected
    const initialUpdateAttempts = [100, 300, 500, 1000]
    initialUpdateAttempts.forEach((delay) => {
      setTimeout(updateScrollState, delay)
    })

    // Also add a listener for the 'load' event to ensure everything is fully loaded
    window.addEventListener("load", updateScrollState)

    const handleScroll = () => {
      // Mark that we're currently scrolling
      isScrollingRef.current = true

      // Update state immediately for responsive feedback
      updateScrollState()

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Set timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false

        // Final state update when scrolling stops
        updateScrollState()
      }, 150)
    }

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", updateScrollState)

    // Intersection Observer for more accurate section tracking
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px", // Only trigger when section is 20% visible from top/bottom
      threshold: [0.3, 0.7], // Trigger at 30% and 70% visibility
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const sectionId = entry.target.id
          const sectionIndex = sections.indexOf(sectionId)
          if (sectionIndex !== -1 && !isScrollingRef.current) {
            setCurrentSnapPoint(sectionIndex)
            setIsAtFooter(false)
          }
        }
      })
    }, observerOptions)

    // Special observer for footer
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            if (!isScrollingRef.current) {
              setCurrentSnapPoint(sections.length - 1) // Keep CTA highlighted
              setIsAtFooter(true)
            }
          }
        })
      },
      { threshold: 0.3 },
    )

    // Observe all sections when they're available
    const observeSections = () => {
      sections.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          sectionObserver.observe(element)
        }
      })

      // Observe footer
      if (footerRef.current) {
        footerObserver.observe(footerRef.current)
      }
    }

    // Start observing after a short delay to ensure elements are rendered
    setTimeout(observeSections, 500)

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", updateScrollState)
      window.removeEventListener("load", updateScrollState)
      sectionObserver.disconnect()
      footerObserver.disconnect()
    }
  }, [sections, getCurrentSection])

  return {
    currentSnapPoint,
    isAtFooter,
    scrollY,
    scrollToSection,
    nextSection,
    prevSection,
    getCurrentSection,
  }
}
