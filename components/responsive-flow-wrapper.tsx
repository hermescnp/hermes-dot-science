"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"

interface ResponsiveFlowWrapperProps {
  children: ReactNode
}

export default function ResponsiveFlowWrapper({ children }: ResponsiveFlowWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [containerWidth, setContainerWidth] = useState(0)

  // The original width of the flow diagram
  const originalWidth = 780

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Get the available width of the container
        const availableWidth = containerRef.current.offsetWidth
        setContainerWidth(availableWidth)

        // Calculate the scale factor
        const newScale = Math.min(1, availableWidth / originalWidth)
        setScale(newScale)
      }
    }

    // Initial calculation
    updateScale()

    // Update on resize
    window.addEventListener("resize", updateScale)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateScale)
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${originalWidth}px`,
          height: "800px",
          maxWidth: `${originalWidth}px`,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  )
}
