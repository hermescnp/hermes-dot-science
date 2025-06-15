"use client"

import type { ReactNode } from "react"

interface FrostedGlassIconProps {
  icon: ReactNode
  color?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function FrostedGlassIcon({
  icon,
  color = "rgba(36, 101, 237, 0.8)",
  size = "md",
  className = "",
}: FrostedGlassIconProps) {
  const isDark = true
  const isSelected = className.includes("selected-tab-icon")

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  }

  return (
    <div
      className={`relative rounded-xl flex items-center justify-center ${sizeClasses[size]} ${className}`}
      style={{
        background: isDark
          ? `linear-gradient(135deg, 
              rgba(20, 24, 35, 0.95) 0%, 
              rgba(20, 24, 35, 0.98) 50%, 
              rgba(20, 24, 35, 0.95) 100%)`
          : `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 255, 255, 0.98) 50%, 
              rgba(255, 255, 255, 0.95) 100%)`,
        border: isSelected
          ? "2px solid #68DBFF"
          : `2px solid ${isDark ? "rgba(104, 219, 255, 0.4)" : "rgba(49, 95, 140, 0.3)"}`,
        boxShadow: isSelected
          ? "0 4px 16px rgba(104, 219, 255, 0.4), 0 0 15px rgba(104, 219, 255, 0.3)"
          : isDark
            ? `0 4px 16px rgba(0, 0, 0, 0.3), 
               0 0 0 1px rgba(255, 255, 255, 0.1), 
               0 0 15px rgba(104, 219, 255, 0.3),
               inset 0 1px 0 rgba(255, 255, 255, 0.15)`
            : `0 4px 16px rgba(0, 0, 0, 0.1), 
               0 0 0 1px rgba(255, 255, 255, 0.9), 
               0 0 15px rgba(49, 95, 140, 0.2),
               inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
        color: isDark ? "#68DBFF" : "#315F8C",
      }}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${isDark ? "#68DBFF" : "#315F8C"}, transparent 70%)`,
          }}
        />
      </div>
      <div className="relative z-10">{icon}</div>
    </div>
  )
}

export default FrostedGlassIcon
