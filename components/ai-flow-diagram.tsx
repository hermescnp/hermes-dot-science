"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { MessageSquare, Brain, Database, GitBranch, Cpu, Wrench, CheckCircle } from 'lucide-react'

interface FlowNode {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  type: "input" | "process" | "decision" | "tool" | "output"
  width: number
  icon: React.ReactNode
}

interface FlowEdge {
  id: string
  from: string
  to: string
}

export default function AIFlowDiagram() {
  const [mounted, setMounted] = useState(false)
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [flowProgress, setFlowProgress] = useState(0)
  const [pulseNodes, setPulseNodes] = useState<Set<string>>(new Set())
  const [nodeHeights, setNodeHeights] = useState<Record<string, number>>({})
  const [rotationAngle, setRotationAngle] = useState(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Refs for the icons to apply counter-rotation
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])

  const nodes: FlowNode[] = [
    {
      id: "1",
      x: 40,
      y: 60,
      label: "User Query",
      sublabel: "Natural language input processing",
      type: "input",
      width: 160,
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      id: "2",
      x: 40,
      y: 300,
      label: "Intent Analysis",
      sublabel: "Advanced NLP processing and understanding",
      type: "process",
      width: 160,
      icon: <Brain className="w-6 h-6" />,
    },
    {
      id: "3",
      x: 320,
      y: 60,
      label: "Knowledge Base",
      sublabel: "Vector search and retrieval",
      type: "process",
      width: 160,
      icon: <Database className="w-6 h-6" />,
    },
    {
      id: "4",
      x: 320,
      y: 300,
      label: "Agent Router",
      sublabel: "Intelligent decision logic and routing",
      type: "decision",
      width: 160,
      icon: <GitBranch className="w-6 h-6" />,
    },
    {
      id: "5",
      x: 600,
      y: 180,
      label: "LLM Processing",
      sublabel: "GPT-4, Claude, and other models",
      type: "process",
      width: 160,
      icon: <Cpu className="w-6 h-6" />,
    },
    {
      id: "6",
      x: 320,
      y: 540,
      label: "Tool Selection",
      sublabel: "API calls and external integrations",
      type: "tool",
      width: 160,
      icon: <Wrench className="w-6 h-6" />,
    },
    {
      id: "7",
      x: 600,
      y: 420,
      label: "Response",
      sublabel: "Formatted output and delivery",
      type: "output",
      width: 160,
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const edges: FlowEdge[] = [
    { id: "e1-2", from: "1", to: "2" },
    { id: "e2-3", from: "2", to: "3" },
    { id: "e2-4", from: "2", to: "4" },
    { id: "e4-5", from: "4", to: "5" },
    { id: "e4-6", from: "4", to: "6" },
    { id: "e3-5", from: "3", to: "5" },
    { id: "e5-7", from: "5", to: "7" },
    { id: "e6-7", from: "6", to: "7" },
  ]

  // Manual rotation control
  useEffect(() => {
    if (!mounted) return

    const startTime = Date.now()
    const rotationDuration = 80000 // 80 seconds in milliseconds

    const updateRotation = () => {
      const elapsed = Date.now() - startTime
      const progress = (elapsed % rotationDuration) / rotationDuration
      const angle = progress * 360

      setRotationAngle(angle)

      // Apply counter-rotation to all icons
      iconRefs.current.forEach((iconRef) => {
        if (iconRef) {
          iconRef.style.transform = `rotate(${-angle}deg)`
        }
      })

      requestAnimationFrame(updateRotation)
    }

    updateRotation()
  }, [mounted])

  // Calculate perpendicular connection points between nodes
  const getPerpendicularConnectionPoints = (fromNode: FlowNode, toNode: FlowNode) => {
    const iconOffset = 24 // Half of icon container height
    const defaultNodeHeight = 140
    const fromNodeHeight = nodeHeights[fromNode.id] || defaultNodeHeight
    const toNodeHeight = nodeHeights[toNode.id] || defaultNodeHeight

    // Calculate actual node boundaries (accounting for overlapping icon)
    const fromBounds = {
      left: fromNode.x,
      right: fromNode.x + fromNode.width,
      top: fromNode.y + iconOffset,
      bottom: fromNode.y + iconOffset + fromNodeHeight,
      centerX: fromNode.x + fromNode.width / 2,
      centerY: fromNode.y + iconOffset + fromNodeHeight / 2,
    }

    const toBounds = {
      left: toNode.x,
      right: toNode.x + toNode.width,
      top: toNode.y + iconOffset,
      bottom: toNode.y + iconOffset + toNodeHeight,
      centerX: toNode.x + toNode.width / 2,
      centerY: toNode.y + iconOffset + toNodeHeight / 2,
    }

    // Calculate direction and distance
    const deltaX = toBounds.centerX - fromBounds.centerX
    const deltaY = toBounds.centerY - fromBounds.centerY

    let fromX, fromY, fromDirection, toX, toY, toDirection

    // Determine connection type more clearly
    const isHorizontalPrimary = Math.abs(deltaX) > Math.abs(deltaY)

    if (isHorizontalPrimary) {
      // Horizontal connection is primary
      if (deltaX > 0) {
        // Left to right
        fromX = fromBounds.right
        fromY = fromBounds.centerY
        fromDirection = "right"
        toX = toBounds.left
        toY = toBounds.centerY
        toDirection = "left"
      } else {
        // Right to left
        fromX = fromBounds.left
        fromY = fromBounds.centerY
        fromDirection = "left"
        toX = toBounds.right
        toY = toBounds.centerY
        toDirection = "right"
      }
    } else {
      // Vertical connection is primary
      if (deltaY > 0) {
        // Top to bottom
        fromX = fromBounds.centerX
        fromY = fromBounds.bottom
        fromDirection = "down"
        toX = toBounds.centerX
        toY = toBounds.top
        toDirection = "up"
      } else {
        // Bottom to top
        fromX = fromBounds.centerX
        fromY = fromBounds.top
        fromDirection = "up"
        toX = toBounds.centerX
        toY = toBounds.bottom
        toDirection = "down"
      }
    }

    return { fromX, fromY, fromDirection, toX, toY, toDirection }
  }

  // Create perpendicular spline path with improved control points
  const createPerpendicularSpline = (
    fromX: number,
    fromY: number,
    fromDirection: string,
    toX: number,
    toY: number,
    toDirection: string,
  ) => {
    // Calculate the distance between points
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2))

    // Use a more conservative control distance to ensure visibility
    const controlDistance = Math.min(Math.max(distance * 0.3, 40), 100)

    // Calculate control points based on directions
    let fromControlX = fromX
    let fromControlY = fromY
    let toControlX = toX
    let toControlY = toY

    // From control point (perpendicular to exit direction)
    switch (fromDirection) {
      case "right":
        fromControlX = fromX + controlDistance
        break
      case "left":
        fromControlX = fromX - controlDistance
        break
      case "down":
        fromControlY = fromY + controlDistance
        break
      case "up":
        fromControlY = fromY - controlDistance
        break
    }

    // To control point (perpendicular to entry direction)
    switch (toDirection) {
      case "right":
        toControlX = toX + controlDistance
        break
      case "left":
        toControlX = toX - controlDistance
        break
      case "down":
        toControlY = toY + controlDistance
        break
      case "up":
        toControlY = toY - controlDistance
        break
    }

    // Create cubic Bezier curve
    return `M ${fromX} ${fromY} C ${fromControlX} ${fromControlY} ${toControlX} ${toControlY} ${toX} ${toY}`
  }

  const getNodeStyle = (type: string, isActive: boolean, isPulsing: boolean) => {
    const intensity = isActive || isPulsing ? 1 : 0.7

    return {
      background: isDark
        ? `linear-gradient(135deg, 
        rgba(255, 255, 255, ${0.05 * intensity}) 0%, 
        rgba(255, 255, 255, ${0.02 * intensity}) 50%, 
        rgba(255, 255, 255, ${0.08 * intensity}) 100%)`
        : `linear-gradient(135deg, 
        rgba(255, 255, 255, ${0.9 * intensity}) 0%, 
        rgba(255, 255, 255, ${0.6 * intensity}) 50%, 
        rgba(255, 255, 255, ${0.95 * intensity}) 100%)`,
      border: isActive
        ? `0.5px solid #68DBFF`
        : `0.5px solid ${isDark ? `rgba(104, 219, 255, ${0.3 * intensity})` : `rgba(49, 95, 140, ${0.2 * intensity})`}`,
      boxShadow:
        isActive || isPulsing
          ? isDark
            ? `0 8px 32px rgba(0, 0, 0, 0.3), 
           0 0 0 1px rgba(255, 255, 255, 0.1), 
           0 0 20px rgba(104, 219, 255, 0.4),
           inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            : `0 8px 32px rgba(0, 0, 0, 0.1), 
           0 0 0 1px rgba(255, 255, 255, 0.8), 
           0 0 20px rgba(49, 95, 140, 0.3),
           inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          : isDark
            ? `0 4px 16px rgba(0, 0, 0, 0.2), 
           0 0 0 1px rgba(255, 255, 255, 0.05), 
           inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : `0 4px 16px rgba(0, 0, 0, 0.05), 
           0 0 0 1px rgba(255, 255, 255, 0.6), 
           inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }
  }

  const getIconStyle = (isActive: boolean, isPulsing: boolean) => {
    return {
      background: isDark
        ? `linear-gradient(135deg, 
          rgba(20, 24, 35, 0.95) 0%, 
          rgba(20, 24, 35, 0.98) 50%, 
          rgba(20, 24, 35, 0.95) 100%)`
        : `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(255, 255, 255, 0.98) 50%, 
          rgba(255, 255, 255, 0.95) 100%)`,
      border: `2px solid ${isDark ? "rgba(104, 219, 255, 0.4)" : "rgba(49, 95, 140, 0.3)"}`,
      boxShadow: isDark
        ? `0 4px 16px rgba(0, 0, 0, 0.3), 
         0 0 0 1px rgba(255, 255, 255, 0.1), 
         0 0 15px rgba(104, 219, 255, 0.3),
         inset 0 1px 0 rgba(255, 255, 255, 0.15)`
        : `0 4px 16px rgba(0, 0, 0, 0.1), 
         0 0 0 1px rgba(255, 255, 255, 0.9), 
         0 0 15px rgba(49, 95, 140, 0.2),
         inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
      color: isDark ? "#68DBFF" : "#315F8C",
    }
  }

  // Enhanced animation effect
  useEffect(() => {
    setMounted(true)

    const flowSequence = [
      { nodes: ["1"], delay: 0 },
      { nodes: ["2"], delay: 800 },
      { nodes: ["3", "4"], delay: 1600 },
      { nodes: ["5", "6"], delay: 2400 },
      { nodes: ["7"], delay: 3200 },
    ]

    const animateFlow = () => {
      flowSequence.forEach(({ nodes: nodeIds, delay }) => {
        setTimeout(() => {
          setPulseNodes(new Set(nodeIds))
          setTimeout(() => {
            setPulseNodes(new Set())
          }, 600)
        }, delay)
      })
    }

    animateFlow()
    const interval = setInterval(animateFlow, 5000)

    return () => clearInterval(interval)
  }, [])

  // Function to update node height
  const updateNodeHeight = (nodeId: string, height: number) => {
    setNodeHeights((prev) => ({
      ...prev,
      [nodeId]: height,
    }))
  }

  if (!mounted) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading AI Flow...</div>
      </div>
    )
  }

  // Wire colors based on theme
  const primaryColor = isDark ? "#315F8C" : "#315F8C"
  const highlightColor = isDark ? "#68DBFF" : "#68DBFF"

  return (
    <div className="w-full h-full relative" style={{ width: "780px", height: "800px" }}>
      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: 1 }}>
        <defs>
          {/* Smaller arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="5"
            markerHeight="4"
            refX="4.5"
            refY="2"
            orient="auto"
            fill={highlightColor}
          >
            <polygon points="0 0, 5 2, 0 4" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from)!
          const toNode = nodes.find((n) => n.id === edge.to)!

          if (!fromNode || !toNode) return null

          const connectionData = getPerpendicularConnectionPoints(fromNode, toNode)
          const { fromX, fromY, fromDirection, toX, toY, toDirection } = connectionData
          const path = createPerpendicularSpline(fromX, fromY, fromDirection, toX, toY, toDirection)

          return (
            <g key={edge.id}>
              {/* Base wire with solid color for visibility */}
              <path
                d={path}
                stroke={primaryColor}
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />

              {/* Energy flow effect overlay */}
              <path
                d={path}
                stroke={highlightColor}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.6}
                strokeDasharray="4 8"
              >
                <animate attributeName="stroke-dashoffset" values="12;0" dur="2s" repeatCount="indefinite" />
              </path>

              {/* Animated particle */}
              <circle r="3" fill={highlightColor} opacity="0.7">
                <animateMotion dur="3s" repeatCount="indefinite" path={path} />
                <animate attributeName="opacity" values="0;0.7;0.7;0" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          )
        })}
      </svg>

      {/* Glass nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {nodes.map((node) => {
          const isActive = activeNode === node.id
          const isPulsing = pulseNodes.has(node.id)

          return (
            <div
              key={node.id}
              className={`absolute transition-all duration-500 ${
                isActive ? "scale-110" : isPulsing ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                left: node.x,
                top: node.y + 24, // Offset down by half icon height to account for overlapping icon
                width: node.width,
                transform: `${isActive ? "scale(1.1)" : isPulsing ? "scale(1.05)" : ""} ${
                  isPulsing ? "translateY(-4px)" : ""
                }`,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {/* Main node container */}
              <div
                ref={(el) => {
                  if (el) {
                    const height = el.offsetHeight
                    if (height > 0 && nodeHeights[node.id] !== height) {
                      updateNodeHeight(node.id, height)
                    }
                  }
                }}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  minHeight: "140px",
                  ...getNodeStyle(node.type, isActive, isPulsing),
                }}
              >
                {/* Glass reflection effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 50%, rgba(255, 255, 255, 0.6) 100%)",
                  }}
                />

                {/* Content container with top padding for overlapping icon */}
                <div className="flex flex-col items-center w-full pt-8 pb-6 px-6">
                  {/* Text container with proper spacing */}
                  <div className="flex flex-col items-center justify-center w-full space-y-2">
                    <div
                      className={`font-semibold text-sm text-center ${isDark ? "text-white" : "text-gray-800"}`}
                      style={{
                        maxWidth: "100%",
                        lineHeight: "1.3",
                        wordBreak: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      className={`text-xs text-center ${isDark ? "text-white/70" : "text-gray-600"}`}
                      style={{
                        maxWidth: "100%",
                        lineHeight: "1.3",
                        wordBreak: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {node.sublabel}
                    </div>
                  </div>
                </div>

                {/* Active pulse ring */}
                {(isActive || isPulsing) && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{
                      borderColor: isDark ? "rgba(104, 219, 255, 0.5)" : "rgba(49, 95, 140, 0.4)",
                      animation: "pulse-ring 2s infinite",
                    }}
                  />
                )}
              </div>

              {/* Overlapping icon container - positioned absolutely */}
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  isActive || isPulsing ? "scale-110" : ""
                }`}
                style={{
                  top: -24, // Position so middle of icon aligns with top border of node
                  zIndex: 10,
                  ...getIconStyle(isActive, isPulsing),
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center">{node.icon}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Visualization with 6 orbiting elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 3 }}>
        {/* Center - Hermes Dot Science Logo */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <img src="/images/hermes-logo-icon.svg" alt="Hermes Dot Science" className="w-24 h-24" />
        </div>

        {/* Orbiting Elements Container - This rotates using inline style */}
        <div 
          className="absolute inset-0"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          {/* Element 1 - Top */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-soft-scale-1">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[0] = el)}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Element 2 - Top Right */}
          <div className="absolute -top-6 -right-6 transform translate-x-1/2 animate-soft-scale-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[1] = el)}>
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Element 3 - Bottom Right */}
          <div className="absolute -bottom-6 -right-6 transform translate-x-1/2 animate-soft-scale-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[2] = el)}>
                <Database className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Element 4 - Bottom */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-soft-scale-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[3] = el)}>
                <GitBranch className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Element 5 - Bottom Left */}
          <div className="absolute -bottom-6 -left-6 transform -translate-x-1/2 animate-soft-scale-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[4] = el)}>
                <Cpu className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Element 6 - Top Left */}
          <div className="absolute -top-6 -left-6 transform -translate-x-1/2 animate-soft-scale-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0B1E33" }}
            >
              <div ref={(el) => (iconRefs.current[5] = el)}>
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating status indicator */}
      <div className="absolute bottom-6 right-6 z-20">
        <div
          className="rounded-2xl px-4 py-3 border backdrop-blur-md flex items-center gap-3"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)",
            border: `1px solid ${isDark ? "rgba(104, 219, 255, 0.3)" : "rgba(49, 95, 140, 0.2)"}`,
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: highlightColor,
              boxShadow: `0 0 12px ${highlightColor}`,
              animation: "pulse 2s infinite",
            }}
          />
          <div className={`text-sm ${isDark ? "text-white/80" : "text-gray-600"}`}>Processing</div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 0.4; }
        100% { transform: scale(1.1); opacity: 0; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
    </div>
  )
}
