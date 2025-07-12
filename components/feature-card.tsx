"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { FrostedGlassIcon } from "@/components/frosted-glass-icon"
import { useTheme } from "next-themes"
import { useAnimation } from "@/contexts/animation-context"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  accentColor = "rgba(120, 120, 255, 0.5)",
}: FeatureCardProps) {
  const { resolvedTheme } = useTheme()
  const { isPaused } = useAnimation()
  const isDark = resolvedTheme === "dark"

  // Adjust accent color opacity for dark mode
  const adjustedAccentColor = isDark
    ? accentColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, "rgba($1, $2, $3, 0.3)")
    : accentColor

  return (
    <motion.div
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card className="h-full overflow-hidden bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg dark:bg-background/80">
        <div className="p-6 h-full flex flex-col relative z-10">
          <FrostedGlassIcon icon={icon} color={accentColor} className="mb-4 self-start" />

          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground flex-grow">{description}</p>
        </div>

        {/* Always visible animated gradient background */}
        {!isPaused && (
          <motion.div
            className="absolute inset-0 z-0 opacity-20 dark:opacity-30"
            initial={{ opacity: 0 }}
            animate={{
              background: [
                `radial-gradient(circle at 30% 30%, ${adjustedAccentColor} 0%, transparent 60%)`,
                `radial-gradient(circle at 70% 70%, ${adjustedAccentColor} 0%, transparent 60%)`,
              ],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        )}

        {/* Static gradient when animations are paused */}
        {isPaused && (
          <div
            className="absolute inset-0 z-0 opacity-20 dark:opacity-30"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${adjustedAccentColor} 0%, transparent 60%)`,
            }}
          />
        )}
      </Card>
    </motion.div>
  )
}
