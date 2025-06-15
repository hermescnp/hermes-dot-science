"use client"

import { useState, useEffect } from "react"
import { useActiveSection } from "@/hooks/use-active-section"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"

interface FlowNodeData {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  type: "input" | "process" | "decision" | "tool" | "output"
  width: number
  iconName: string
}

interface FlowEdgeData {
  id: string
  from: string
  to: string
}

interface AIFlowDiagramContent {
  nodes: FlowNodeData[]
  edges: FlowEdgeData[]
  statusIndicatorText: string
}

export default function OptimizedAIFlowDiagram() {
  const [mounted, setMounted] = useState(false)
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [pulseNodes, setPulseNodes] = useState<Set<string>>(new Set())
  const [nodeHeights, setNodeHeights] = useState<Record<string, number>>({})
  const { isActive } = useActiveSection()
  const { language, t } = useLanguage()
  const isDark = true
  const [content, setContent] = useState<AIFlowDiagramContent | null>(null)

  const shouldAnimate = isActive("hero")

  useEffect(() => {
    const fetchDiagramContent = async () => {
      try {
        const response = await fetch(`/api/content/ai-flow-diagram?lang=${language}`)
        if (!response.ok) {
          throw new Error("Failed to fetch AI flow diagram content")
        }
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error("Error fetching AI flow diagram content:", error)
        setContent({
          nodes: [],
          edges: [],
          statusIndicatorText: t("loading"),
        })
      }
    }
    fetchDiagramContent()
  }, [language, t])

  // Calculate perpendicular connection points between nodes
  const getPerpendicularConnectionPoints = (fromNode: FlowNodeData, toNode: FlowNodeData) => {
    const iconOffset = 24
    const defaultNodeHeight = 140
    const fromNodeHeight = nodeHeights[fromNode.id] || defaultNodeHeight
    const toNodeHeight = nodeHeights[toNode.id] || defaultNodeHeight

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

    const deltaX = toBounds.centerX - fromBounds.centerX
    const deltaY = toBounds.centerY - fromBounds.centerY

    let fromX, fromY, fromDirection, toX, toY, toDirection
    const isHorizontalPrimary = Math.abs(deltaX) > Math.abs(deltaY)

    if (isHorizontalPrimary) {
      if (deltaX > 0) {
        fromX = fromBounds.right
        fromY = fromBounds.centerY
        fromDirection = "right"
        toX = toBounds.left
        toY = toBounds.centerY
        toDirection = "left"
      } else {
        fromX = fromBounds.left
        fromY = fromBounds.centerY
        fromDirection = "left"
        toX = toBounds.right
        toY = toBounds.centerY
        toDirection = "right"
      }
    } else {
      if (deltaY > 0) {
        fromX = fromBounds.centerX
        fromY = fromBounds.bottom
        fromDirection = "down"
        toX = toBounds.centerX
        toY = toBounds.top
        toDirection = "up"
      } else {
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

  const createPerpendicularSpline = (
    fromX: number,
    fromY: number,
    fromDirection: string,
    toX: number,
    toY: number,
    toDirection: string,
  ) => {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2))
    const controlDistance = Math.min(Math.max(distance * 0.3, 40), 100)
    let fromControlX = fromX,
      fromControlY = fromY,
      toControlX = toX,
      toControlY = toY

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
    return `M ${fromX} ${fromY} C ${fromControlX} ${fromControlY} ${toControlX} ${toControlY} ${toX} ${toY}`
  }

  const getNodeStyle = (type: string, isActiveNode: boolean, isPulsing: boolean) => {
    const intensity = isActiveNode || isPulsing ? 1 : 0.7
    return {
      background: isDark
        ? `linear-gradient(135deg, rgba(255, 255, 255, ${0.05 * intensity}) 0%, rgba(255, 255, 255, ${0.02 * intensity}) 50%, rgba(255, 255, 255, ${0.08 * intensity}) 100%)`
        : `linear-gradient(135deg, rgba(255, 255, 255, ${0.9 * intensity}) 0%, rgba(255, 255, 255, ${0.6 * intensity}) 50%, rgba(255, 255, 255, ${0.95 * intensity}) 100%)`,
      border: isActiveNode
        ? `0.5px solid #68DBFF`
        : `0.5px solid ${isDark ? `rgba(104, 219, 255, ${0.3 * intensity})` : `rgba(49, 95, 140, ${0.2 * intensity})`}`,
      boxShadow:
        isActiveNode || isPulsing
          ? isDark
            ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(104, 219, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 20px rgba(49, 95, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)`
          : isDark
            ? `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : `0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }
  }

  const getIconStyle = (isActiveNode: boolean, isPulsing: boolean) => {
    return {
      background: isDark
        ? `linear-gradient(135deg, rgba(20, 24, 35, 0.95) 0%, rgba(20, 24, 35, 0.98) 50%, rgba(20, 24, 35, 0.95) 100%)`
        : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)`,
      boxShadow: isDark
        ? `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 15px rgba(104, 219, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)`
        : `0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 15px rgba(49, 95, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
      color: isDark ? "#68DBFF" : "#315F8C",
    }
  }

  useEffect(() => {
    setMounted(true)
    if (!shouldAnimate || !content) {
      setPulseNodes(new Set())
      return
    }

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
          if (shouldAnimate) {
            setPulseNodes(new Set(nodeIds))
            setTimeout(() => {
              setPulseNodes(new Set())
            }, 600)
          }
        }, delay)
      })
    }
    animateFlow()
    const interval = setInterval(() => {
      if (shouldAnimate) {
        animateFlow()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [shouldAnimate, content])

  const updateNodeHeight = (nodeId: string, height: number) => {
    setNodeHeights((prev) => ({ ...prev, [nodeId]: height }))
  }

  if (!mounted || !content) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  const { nodes, edges, statusIndicatorText } = content
  const primaryColor = isDark ? "#315F8C" : "#315F8C"
  const highlightColor = isDark ? "#68DBFF" : "#68DBFF"

  return (
    <div className="w-full h-full relative" style={{ width: "780px", height: "800px" }}>
      <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: 1 }}>
        <defs>
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
          const { fromX, fromY, fromDirection, toX, toY, toDirection } = getPerpendicularConnectionPoints(
            fromNode,
            toNode,
          )
          const path = createPerpendicularSpline(fromX, fromY, fromDirection, toX, toY, toDirection)
          return (
            <g key={edge.id}>
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
                {shouldAnimate && (
                  <animate attributeName="stroke-dashoffset" values="12;0" dur="2s" repeatCount="indefinite" />
                )}
              </path>
              {shouldAnimate && (
                <circle r="3" fill={highlightColor} opacity="0.7">
                  <animateMotion dur="3s" repeatCount="indefinite" path={path} />
                  <animate attributeName="opacity" values="0;0.7;0.7;0" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {nodes.map((node) => {
          const isActiveNode = activeNode === node.id
          const isPulsing = pulseNodes.has(node.id)
          return (
            <div
              key={node.id}
              className={`absolute transition-all duration-500 ${isActiveNode ? "scale-110" : isPulsing ? "scale-105" : "hover:scale-105"}`}
              style={{
                left: node.x,
                top: node.y + 24,
                width: node.width,
                transform: `${isActiveNode ? "scale(1.1)" : isPulsing ? "scale(1.05)" : ""} ${isPulsing ? "translateY(-4px)" : ""}`,
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
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
                style={{ minHeight: "140px", ...getNodeStyle(node.type, isActiveNode, isPulsing) }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 50%, rgba(255, 255, 255, 0.6) 100%)",
                  }}
                />
                <div className="flex flex-col items-center w-full pt-8 pb-6 px-6">
                  <div className="flex flex-col items-center justify-center w-full space-y-2">
                    <div
                      className={`font-semibold text-sm text-center ${isDark ? "text-white" : "text-gray-800"}`}
                      style={{ maxWidth: "100%", lineHeight: "1.3", wordBreak: "break-word", hyphens: "auto" }}
                    >
                      {node.label}
                    </div>
                    <div
                      className={`text-xs text-center ${isDark ? "text-white/70" : "text-gray-600"}`}
                      style={{ maxWidth: "100%", lineHeight: "1.3", wordBreak: "break-word", hyphens: "auto" }}
                    >
                      {node.sublabel}
                    </div>
                  </div>
                </div>
                {(isActiveNode || isPulsing) && shouldAnimate && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{
                      borderColor: isDark ? "rgba(104, 219, 255, 0.5)" : "rgba(49, 95, 140, 0.4)",
                      animation: "pulse-ring 2s infinite",
                    }}
                  />
                )}
              </div>
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActiveNode || isPulsing ? "scale-110" : ""}`}
                style={{ top: -24, zIndex: 10, ...getIconStyle(isActiveNode, isPulsing) }}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <RenderIcon iconName={node.iconName} className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {shouldAnimate && (
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
            <div className={`text-sm ${isDark ? "text-white/80" : "text-gray-600"}`}>{statusIndicatorText}</div>
          </div>
        </div>
      )}
      <style jsx>{`
      @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 0.4; } 100% { transform: scale(1.1); opacity: 0; } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    `}</style>
    </div>
  )
}
