"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAnimation } from "@/contexts/animation-context"

interface ElegantSeparatorProps {
  width?: string
  variant?: "default" | "delicate" | "minimal"
}

export default function ElegantSeparator({ width = "200px", variant = "default" }: ElegantSeparatorProps) {
  const [mounted, setMounted] = useState(false)
  const { isPaused } = useAnimation()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full flex justify-center py-8 md:py-12 overflow-hidden">
      <div className="relative w-full max-w-7xl px-6 flex justify-center items-center">
        {/* Soft side gradients */}
        <div className="absolute left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#68DBFF]/20 to-[#68DBFF]/40"></div>
        <div className="absolute right-0 w-1/3 h-[1px] bg-gradient-to-l from-transparent via-[#68DBFF]/20 to-[#68DBFF]/40"></div>

        {/* Center elegant line */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Decorative dots */}
          <div className="flex items-center gap-3">
            {!isPaused && (
              <motion.div
                className="w-1 h-1 rounded-full bg-[#68DBFF]/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
              />
            )}
            {!isPaused && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#68DBFF]/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
              />
            )}

            {/* Static dots when animations are paused */}
            {isPaused && (
              <>
                <div className="w-1 h-1 rounded-full bg-[#68DBFF]/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#68DBFF]/80" />
              </>
            )}

            {/* Main elegant line */}
            <div className="relative flex items-center">
              {/* Soft glow background */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-sm opacity-60"
                style={{
                  width,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(104, 219, 255, 0.3) 20%, rgba(104, 219, 255, 0.6) 50%, rgba(104, 219, 255, 0.3) 80%, transparent 100%)",
                }}
              />

              {/* Main line */}
              <div
                className="relative"
                style={{
                  width,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(104, 219, 255, 0.4) 20%, rgba(104, 219, 255, 0.8) 50%, rgba(104, 219, 255, 0.4) 80%, transparent 100%)",
                }}
              >
                {/* Subtle shimmer effect */}
                {!isPaused && (
                  <motion.div
                    className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      left: ["-20%", "100%"],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      duration: 4,
                      ease: "easeInOut",
                      repeatDelay: 6,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Decorative dots on the right */}
            {!isPaused && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#68DBFF]/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
              />
            )}
            {!isPaused && (
              <motion.div
                className="w-1 h-1 rounded-full bg-[#68DBFF]/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.9 }}
              />
            )}

            {/* Static dots when animations are paused */}
            {isPaused && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#68DBFF]/80" />
                <div className="w-1 h-1 rounded-full bg-[#68DBFF]/60" />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
