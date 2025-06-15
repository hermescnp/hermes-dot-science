"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, animate } from "framer-motion"

export default function SignInSpotlight() {
  const [isMounted, setIsMounted] = useState(false)
  const [isMouseActive, setIsMouseActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const defaultPositionRef = useRef({ x: 0, y: 0 })

  // Motion values for the spotlight position with spring physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Add spring physics for smoother movement
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 })

  // Define spotlight colors
  const spotlightColors = [
    { color: "rgba(10, 94, 149, 0.2)", darkColor: "rgba(10, 94, 149, 0.25)" },
    { color: "rgba(255, 179, 56, 0.5)", darkColor: "rgba(255, 179, 56, 0.5)" },
    { color: "rgba(10, 94, 149, 0.15)", darkColor: "rgba(10, 94, 149, 0.2)" },
  ]

  // Update default position
  const updateDefaultPosition = () => {
    if (typeof window !== "undefined") {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 3

      defaultPositionRef.current = { x: centerX, y: centerY }
      mouseX.set(centerX)
      mouseY.set(centerY)
    }
  }

  // Handle mouse movement across the entire page
  const handleMouseMove = (e: MouseEvent) => {
    setIsMouseActive(true)
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  // Handle mouse leave (when cursor leaves the window)
  const handleMouseLeave = () => {
    setIsMouseActive(false)
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

  // Setup effect
  useEffect(() => {
    setIsMounted(true)
    updateDefaultPosition()

    // Event listeners for the entire document
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", updateDefaultPosition)

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", updateDefaultPosition)
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary spotlight that follows mouse */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${spotlightColors[0].darkColor} 0%, transparent 70%)`,
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

      {/* Floating ash-like particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute pointer-events-none"
          initial={{
            opacity: 0,
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
            y: (typeof window !== "undefined" ? window.innerHeight : 1080) + Math.random() * 100,
          }}
          animate={{
            opacity: [0, 0.6, 0.8, 0.4, 0],
            x: [
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192) +
                (Math.random() * 100 - 50),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192) +
                (Math.random() * 100 - 50),
            ],
            y: [
              (typeof window !== "undefined" ? window.innerHeight : 1080) + Math.random() * 100,
              (typeof window !== "undefined" ? window.innerHeight * 0.7 : 756) - Math.random() * 100,
              (typeof window !== "undefined" ? window.innerHeight * 0.4 : 432) - Math.random() * 100,
              (typeof window !== "undefined" ? window.innerHeight * 0.1 : 108) - Math.random() * 100,
            ],
            rotate: [0, 180, 360],
            scale: [0.5, 1, 0.8, 0.5, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 8,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle, #E27D4A 0%, rgba(226, 125, 74, 0.6) 30%, transparent 70%)`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            borderRadius: "50%",
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Additional smaller particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`small-particle-${i}`}
          className="absolute pointer-events-none"
          initial={{
            opacity: 0,
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
            y: (typeof window !== "undefined" ? window.innerHeight : 1080) + Math.random() * 50,
          }}
          animate={{
            opacity: [0, 0.4, 0.6, 0.2, 0],
            x: [
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192) +
                (Math.random() * 60 - 30),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth * 0.8 : 1536) +
                (typeof window !== "undefined" ? window.innerWidth * 0.1 : 192) +
                (Math.random() * 60 - 30),
            ],
            y: [
              (typeof window !== "undefined" ? window.innerHeight : 1080) + Math.random() * 50,
              (typeof window !== "undefined" ? window.innerHeight * 0.6 : 648) - Math.random() * 100,
              (typeof window !== "undefined" ? window.innerHeight * 0.3 : 324) - Math.random() * 100,
              -50 - Math.random() * 50,
            ],
            rotate: [0, -90, -180],
            scale: [0.3, 0.8, 0.5, 0.2],
          }}
          transition={{
            duration: 18 + Math.random() * 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 10,
            ease: "linear",
          }}
          style={{
            background: `#E27D4A`,
            width: `${2 + Math.random() * 4}px`,
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
