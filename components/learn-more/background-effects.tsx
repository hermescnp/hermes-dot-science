"use client"

import { motion } from "framer-motion"
import CssGridBackground from "@/components/css-grid-background"
import { useAnimation } from "@/contexts/animation-context"

interface BackgroundEffectsProps {
  springX: any
  springY: any
}

export function BackgroundEffects({ springX, springY }: BackgroundEffectsProps) {
  const { isPaused } = useAnimation()

  return (
    <section className="fixed inset-0 overflow-hidden z-[20] bg-background">
      <CssGridBackground />

      {/* Custom Spotlight Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!isPaused && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(10, 94, 149, 0.25) 0%, transparent 70%)`,
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

        {/* Additional animated spotlights */}
        {!isPaused && (
          <>
            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                x: ["0%", "10%", "5%", "0%"],
                y: ["0%", "5%", "10%", "0%"],
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                background: `radial-gradient(circle, rgba(104, 219, 255, 0.2) 0%, transparent 70%)`,
                width: "800px",
                height: "800px",
                borderRadius: "50%",
                left: "20%",
                top: "30%",
              }}
            />

            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                x: ["0%", "-10%", "-5%", "0%"],
                y: ["0%", "-5%", "-10%", "0%"],
              }}
              transition={{
                duration: 18,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                background: `radial-gradient(circle, rgba(49, 95, 140, 0.2) 0%, transparent 70%)`,
                width: "700px",
                height: "700px",
                borderRadius: "50%",
                right: "20%",
                bottom: "30%",
              }}
            />

            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.15, 0.3, 0.15],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                background: `radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)`,
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                left: "60%",
                top: "20%",
              }}
            />

            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 0.25, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: 2,
              }}
              style={{
                background: `radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)`,
                width: "550px",
                height: "550px",
                borderRadius: "50%",
                left: "30%",
                bottom: "15%",
              }}
            />
          </>
        )}
      </div>
    </section>
  )
}
