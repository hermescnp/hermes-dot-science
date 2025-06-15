"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"
import { useActiveSection } from "@/hooks/use-active-section"
import { FrostedGlassIcon } from "@/components/frosted-glass-icon"

interface OptimizedFeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  accentColor?: string
  index?: number
}

export default function OptimizedFeatureCard({
  icon,
  title,
  description,
  accentColor = "rgba(120, 120, 255, 0.5)",
  index = 0,
}: OptimizedFeatureCardProps) {
  const isDark = true
  const { isActive } = useActiveSection()

  // Only animate when features section is active
  const shouldAnimate = isActive("features")

  // Get parallax offset for this card with slight variation based on index
  const parallaxOffset = useScrollParallax({
    sectionId: "features",
    intensity: 0.3 + index * 0.1, // Vary intensity per card
    debounceMs: 100,
  })

  // Adjust accent color opacity for dark mode
  const adjustedAccentColor = isDark
    ? accentColor.replace(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/, "rgba($1, $2, $3, 0.3)")
    : accentColor

  // Calculate gradient position based on parallax offset
  const gradientX = 30 + parallaxOffset * 0.2
  const gradientY = 30 + parallaxOffset * 0.3

  return (
    <motion.div
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card className="h-full overflow-hidden bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg dark:bg-background/80">
        <div className="p-6 h-full flex flex-col relative z-10">
          <FrostedGlassIcon icon={icon} color={accentColor} className="mb-4 self-start" />

          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground flex-grow">{description}</p>
        </div>

        {/* Optimized animated gradient background with parallax */}
        <motion.div
          className="absolute inset-0 z-0 opacity-20 dark:opacity-30 transition-opacity duration-500"
          style={{
            background: shouldAnimate
              ? `radial-gradient(circle at ${gradientX}% ${gradientY}%, ${adjustedAccentColor} 0%, transparent 60%)`
              : `radial-gradient(circle at 30% 30%, ${adjustedAccentColor} 0%, transparent 60%)`,
          }}
          animate={
            shouldAnimate
              ? {
                  opacity: [0.15, 0.25, 0.15],
                }
              : {}
          }
          transition={{
            duration: 8 + index * 2, // Vary duration per card
            repeat: shouldAnimate ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Static gradient overlay for when animations are disabled */}
        {!shouldAnimate && (
          <div
            className="absolute inset-0 z-0 opacity-15 dark:opacity-25"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${adjustedAccentColor} 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent" />
      </Card>
    </motion.div>
  )
}
