"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FrostedGlassIcon } from "@/components/frosted-glass-icon"
import { RenderIcon } from "@/components/icon-mapper"
import { useSectionObserver } from "@/hooks/use-active-section"
import { useActiveSection } from "@/hooks/use-active-section"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"
import { useLanguage } from "@/contexts/language-context"
import { useAnimation } from "@/contexts/animation-context"

interface UseCasesContent {
  badgeText: string
  title: string
  subtitle: string
  items: Array<{
    title: string
    description: string
    iconName: string
    accentColor: string
  }>
  cta: {
    text: string
    buttonText: string
    href: string
  }
}

export default function OptimizedUseCases() {
  useSectionObserver("use-cases")
  const { isActive } = useActiveSection()
  const { isPaused } = useAnimation()
  const shouldAnimate = isActive("use-cases") && !isPaused
  const parallaxOffset = useScrollParallax({ sectionId: "use-cases", intensity: 0.2, debounceMs: 120 })
  const { language } = useLanguage()
  const [content, setContent] = useState<UseCasesContent | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/use-cases?lang=${language}`)
        if (!response.ok) throw new Error("Failed to fetch use cases content")
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error("Error fetching use cases content:", error)
        setContent({
          badgeText: "Use Cases",
          title: "Transforming Industries",
          subtitle: "Loading...",
          items: [],
          cta: { text: "", buttonText: "", href: "" },
        })
      }
    }
    fetchContent()
  }, [language])

  if (!content) {
    return (
      <div className="container px-4 md:px-6">
        <div className="py-20 flex items-center justify-center">
          <p>Loading use cases...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldAnimate ? 0.1 : 0, delayChildren: shouldAnimate ? 0.2 : 0 },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  }

  return (
    <section id="use-cases" className="py-20 relative">
      <div className="container px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-block rounded-lg bg-gradient-to-r from-[#68DBFF] via-[#0A5E95] to-[#E27D4A] p-[1px] mb-6"
          >
            <div className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "#0B1E33" }}>
              {content.badgeText}
            </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </motion.h2>

          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {content.items.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className="h-full bg-background/60 backdrop-blur-sm border border-[#68DBFF] transition-all duration-300 dark:bg-background/80 relative overflow-hidden"
                style={{ borderWidth: "0.5px" }}
              >
                <CardHeader className="pb-2">
                  <FrostedGlassIcon
                    icon={<RenderIcon iconName={useCase.iconName} />}
                    color={useCase.accentColor}
                    className="mb-4"
                  />
                  <CardTitle>{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardContent>
                <div
                  className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none transition-opacity duration-500"
                  style={{
                    background: shouldAnimate
                      ? `radial-gradient(circle at ${30 + (parallaxOffset * 0.1) + index * 5}% ${30 + parallaxOffset * 0.15}%, ${useCase.accentColor} 0%, transparent 70%)`
                      : `radial-gradient(circle at 30% 30%, ${useCase.accentColor} 0%, transparent 70%)`,
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
