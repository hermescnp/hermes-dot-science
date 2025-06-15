"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, animate } from "framer-motion"

// Create a safe version of useActiveSection that doesn't throw errors
function useSafeActiveSection() {
  let activeSectionHook
  let useActiveSection
  try {
    useActiveSection = require("@/hooks/use-active-section").useActiveSection
  } catch {
    useActiveSection = () => ({
      activeSection: "hero",
      setActiveSection: () => {},
      isActive: (section: string) => section === "hero",
    })
  }

  activeSectionHook = useActiveSection()

  return activeSectionHook
}

interface OptimizedFramerSpotlightProps {
  showMainSpotlight?: boolean
}

export default function OptimizedFramerSpotlight({ showMainSpotlight = true }: OptimizedFramerSpotlightProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isMouseInHero, setIsMouseInHero] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const defaultPositionRef = useRef({ x: 0, y: 0 })

  // Use the safe version of the hook
  const { isActive } = useSafeActiveSection()
  const isDark = true

  // Only run animations if the hero section is active or if we're on a standalone page
  const shouldAnimate = isActive("hero") || true // Always animate for now

  // Motion values for the spotlight position with spring physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Add spring physics for smoother movement
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 })

  // Define multiple spotlight colors
  const spotlightColors = [
    { color: "rgba(10, 94, 149, 0.2)", darkColor: "rgba(10, 94, 149, 0.25)" }, // Updated from #315F8C to #0A5E95
    { color: "rgba(255, 179, 56, 0.5)", darkColor: "rgba(255, 179, 56, 0.5)" }, // Orange spotlight
    { color: "rgba(10, 94, 149, 0.15)", darkColor: "rgba(10, 94, 149, 0.2)" }, // Primary variant
  ]

  // Update default position without causing re-renders
  const updateDefaultPosition = () => {
    if (typeof window !== "undefined") {
      // Look for hero section or use the viewport center
      const heroElement = document.getElementById("hero") || document.querySelector("section")
      if (heroElement) {
        const heroRect = heroElement.getBoundingClientRect()
        const centerX = heroRect.left + heroRect.width / 2
        const centerY = heroRect.top + heroRect.height / 3

        defaultPositionRef.current = { x: centerX, y: centerY }

        // Set initial position
        mouseX.set(centerX)
        mouseY.set(centerY)
      } else {
        // Fallback to viewport center
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 3

        defaultPositionRef.current = { x: centerX, y: centerY }
        mouseX.set(centerX)
        mouseY.set(centerY)
      }
    }
  }

  // Handle mouse enter/leave for hero section
  const handleMouseEnter = () => {
    if (shouldAnimate) {
      setIsMouseInHero(true)
    }
  }

  const handleMouseLeave = () => {
    setIsMouseInHero(false)

    if (shouldAnimate) {
      // Animate back to default position
      animate(mouseX, defaultPositionRef.current.x, {
        duration: 1.2,
        ease: "easeInOut",
      })

      animate(mouseY, defaultPositionRef.current.y, {
        duration: 1.2,
        ease: "easeInOut",
      })
    }
  }

  // Handle mouse movement only when inside hero and animations are enabled
  const handleMouseMove = (e: MouseEvent) => {
    if (isMouseInHero && shouldAnimate) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
  }

  // Setup effect - runs once on mount and cleans up on unmount
  useEffect(() => {
    setIsMounted(true)

    // Find the hero section element or use the first section
    heroRef.current = document.getElementById("hero") || document.querySelector("section")

    // Initial setup
    updateDefaultPosition()

    // Event listeners
    window.addEventListener("resize", updateDefaultPosition)
    window.addEventListener("mousemove", handleMouseMove)

    if (heroRef.current) {
      heroRef.current.addEventListener("mouseenter", handleMouseEnter)
      heroRef.current.addEventListener("mouseleave", handleMouseLeave)
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDefaultPosition)
      window.removeEventListener("mousemove", handleMouseMove)

      if (heroRef.current) {
        heroRef.current.removeEventListener("mouseenter", handleMouseEnter)
        heroRef.current.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [isMouseInHero, shouldAnimate])

  if (!isMounted) {
    return null
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary spotlight that follows mouse/animation - only show if showMainSpotlight is true */}
      {showMainSpotlight && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${
              isDark ? spotlightColors[0].darkColor : spotlightColors[0].color
            } 0%, transparent 70%)`,
            width: "1000px",
            height: "1000px",
            borderRadius: "50%",
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Floating ash-like particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute pointer-events-none"
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + Math.random() * 100, // Start below the screen
          }}
          animate={{
            opacity: [0, 0.6, 0.8, 0.4, 0],
            x: [
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1, // Keep horizontal movement more centered
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1 + (Math.random() * 100 - 50), // Slight horizontal drift
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1 + (Math.random() * 100 - 50),
            ],
            y: [
              window.innerHeight + Math.random() * 100, // Start below the screen
              window.innerHeight * 0.7 - Math.random() * 100, // Move upward
              window.innerHeight * 0.4 - Math.random() * 100, // Continue upward
              window.innerHeight * 0.1 - Math.random() * 100, // End near top
            ],
            rotate: [0, 180, 360],
            scale: [0.5, 1, 0.8, 0.5, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10, // Much slower: 15-25 seconds
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 8, // Staggered start up to 8 seconds
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle, #E27D4A 0%, rgba(226, 125, 74, 0.6) 30%, transparent 70%)`,
            width: `${4 + Math.random() * 8}px`, // Random size between 4-12px
            height: `${4 + Math.random() * 8}px`,
            borderRadius: "50%",
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Additional smaller particles for more density */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`small-particle-${i}`}
          className="absolute pointer-events-none"
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + Math.random() * 50, // Start below the screen
          }}
          animate={{
            opacity: [0, 0.4, 0.6, 0.2, 0],
            x: [
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1, // Keep horizontal movement more centered
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1 + (Math.random() * 60 - 30), // Slight horizontal drift
              Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1 + (Math.random() * 60 - 30),
            ],
            y: [
              window.innerHeight + Math.random() * 50, // Start below the screen
              window.innerHeight * 0.6 - Math.random() * 100, // Move upward
              window.innerHeight * 0.3 - Math.random() * 100, // Continue upward
              -50 - Math.random() * 50, // End above the screen
            ],
            rotate: [0, -90, -180],
            scale: [0.3, 0.8, 0.5, 0.2],
          }}
          transition={{
            duration: 18 + Math.random() * 12, // Even slower: 18-30 seconds
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 10, // Staggered start up to 10 seconds
            ease: "linear",
          }}
          style={{
            background: `#E27D4A`,
            width: `${2 + Math.random() * 4}px`, // Random size between 2-6px
            height: `${2 + Math.random() * 4}px`,
            borderRadius: "50%",
            filter: "blur(0.3px)",
            boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(226, 125, 74, 0.8)`,
          }}
        />
      ))}
    </div>
  )
}
