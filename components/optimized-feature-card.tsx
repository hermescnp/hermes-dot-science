"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FrostedGlassIcon } from "@/components/frosted-glass-icon"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"
import { useActiveSection } from "@/hooks/use-active-section"
import { useAnimation } from "@/contexts/animation-context"

interface OptimizedFeatureCardProps {
  icon: React.ReactNode
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
  const { isActive } = useActiveSection()
  const { isPaused } = useAnimation()
  const shouldAnimate = isActive("features") && !isPaused
  const parallaxOffset = useScrollParallax({ sectionId: "features", intensity: 0.3, debounceMs: 100 })

  // Memoize gradient position calculations
  const { gradientX, gradientY, adjustedAccentColor } = useMemo(() => {
    const baseX = 30 + (parallaxOffset * 0.1) + index * 5
    const baseY = 30 + parallaxOffset * 0.15
    const adjustedColor = accentColor.replace(/[0-9.]+\)$/, "0.3)")
    
    return {
      gradientX: shouldAnimate ? baseX : 30,
      gradientY: shouldAnimate ? baseY : 30,
      adjustedAccentColor: adjustedColor
    }
  }, [parallaxOffset, index, accentColor, shouldAnimate])

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
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />
      </Card>
    </motion.div>
  )
}
