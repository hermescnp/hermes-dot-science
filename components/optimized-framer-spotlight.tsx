"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

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
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Use the safe version of the hook
  const { isActive } = useSafeActiveSection()
  const isDark = true

  // Motion values for the spotlight position with spring physics - same as learn-more page
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 })

  // Define multiple spotlight colors
  const spotlightColors = [
    { color: "rgba(10, 94, 149, 0.2)", darkColor: "rgba(10, 94, 149, 0.25)" },
    { color: "rgba(255, 179, 56, 0.5)", darkColor: "rgba(255, 179, 56, 0.5)" },
    { color: "rgba(10, 94, 149, 0.15)", darkColor: "rgba(10, 94, 149, 0.2)" },
  ]

  // Memoize particle configurations to prevent recreation
  const particleConfigs = useMemo(() => {
    const configs = []

    // Large particles
    for (let i = 0; i < 12; i++) {
      configs.push({
        id: `particle-${i}`,
        type: "large",
        initialX: Math.random() * windowDimensions.width,
        initialY: windowDimensions.height + Math.random() * 100,
        size: 4 + Math.random() * 8,
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 8,
        animationSeed: Math.random(),
      })
    }

    // Small particles
    for (let i = 0; i < 8; i++) {
      configs.push({
        id: `small-particle-${i}`,
        type: "small",
        initialX: Math.random() * windowDimensions.width,
        initialY: windowDimensions.height + Math.random() * 50,
        size: 2 + Math.random() * 4,
        duration: 18 + Math.random() * 12,
        delay: Math.random() * 10,
        animationSeed: Math.random(),
      })
    }

    return configs
  }, [windowDimensions.width, windowDimensions.height])

  // Simple mouse tracking like in learn-more page
  const handleMouseMove = (e: MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  // Initial setup effect - runs only once on mount
  useEffect(() => {
    setIsMounted(true)

    // Set initial window dimensions
    if (typeof window !== "undefined") {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    // Handle window resize
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      }
    }

    // Add mouse tracking - same as learn-more page
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, []) // Empty dependency array - runs only once

  if (!isMounted) {
    return null
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary spotlight that follows mouse - simplified like learn-more page */}
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

      {/* Render particles using memoized configurations with stable keys */}
      {particleConfigs.map((config) => {
        const stableKey = `${config.id}-${windowDimensions.width}-${windowDimensions.height}`
        if (config.type === "large") {
          return (
            <motion.div
              key={stableKey}
              className="absolute pointer-events-none"
              initial={{
                opacity: 0,
                x: config.initialX,
                y: config.initialY,
              }}
              animate={{
                opacity: [0, 0.6, 0.8, 0.4, 0],
                x: [
                  windowDimensions.width * 0.8 * config.animationSeed + windowDimensions.width * 0.1,
                  windowDimensions.width * 0.8 * config.animationSeed +
                    windowDimensions.width * 0.1 +
                    (config.animationSeed * 100 - 50),
                  windowDimensions.width * 0.8 * config.animationSeed +
                    windowDimensions.width * 0.1 +
                    (config.animationSeed * 100 - 50),
                ],
                y: [
                  windowDimensions.height + config.animationSeed * 100,
                  windowDimensions.height * 0.7 - config.animationSeed * 100,
                  windowDimensions.height * 0.4 - config.animationSeed * 100,
                  windowDimensions.height * 0.1 - config.animationSeed * 100,
                ],
                rotate: [0, 180, 360],
                scale: [0.5, 1, 0.8, 0.5, 0.3],
              }}
              transition={{
                duration: config.duration,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: config.delay,
                ease: "easeInOut",
              }}
              style={{
                background: `radial-gradient(circle, #E27D4A 0%, rgba(226, 125, 74, 0.6) 30%, transparent 70%)`,
                width: `${config.size}px`,
                height: `${config.size}px`,
                borderRadius: "50%",
                filter: "blur(0.5px)",
              }}
            />
          )
        } else {
          return (
            <motion.div
              key={stableKey}
              className="absolute pointer-events-none"
              initial={{
                opacity: 0,
                x: config.initialX,
                y: config.initialY,
              }}
              animate={{
                opacity: [0, 0.4, 0.6, 0.2, 0],
                x: [
                  windowDimensions.width * 0.8 * config.animationSeed + windowDimensions.width * 0.1,
                  windowDimensions.width * 0.8 * config.animationSeed +
                    windowDimensions.width * 0.1 +
                    (config.animationSeed * 60 - 30),
                  windowDimensions.width * 0.8 * config.animationSeed +
                    windowDimensions.width * 0.1 +
                    (config.animationSeed * 60 - 30),
                ],
                y: [
                  windowDimensions.height + config.animationSeed * 50,
                  windowDimensions.height * 0.6 - config.animationSeed * 100,
                  windowDimensions.height * 0.3 - config.animationSeed * 100,
                  -50 - config.animationSeed * 50,
                ],
                rotate: [0, -90, -180],
                scale: [0.3, 0.8, 0.5, 0.2],
              }}
              transition={{
                duration: config.duration,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: config.delay,
                ease: "linear",
              }}
              style={{
                background: `#E27D4A`,
                width: `${config.size}px`,
                height: `${config.size}px`,
                borderRadius: "50%",
                filter: "blur(0.3px)",
                boxShadow: `0 0 ${config.size / 2}px rgba(226, 125, 74, 0.8)`,
              }}
            />
          )
        }
      })}
    </div>
  )
}
