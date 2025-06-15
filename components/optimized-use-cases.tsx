"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FrostedGlassIcon from "@/components/frosted-glass-icon"
import { useActiveSection, useSectionObserver } from "@/hooks/use-active-section"
import { useScrollParallax } from "@/hooks/use-scroll-parallax"
import { RenderIcon } from "@/components/icon-mapper"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UseCaseItem {
  iconName: string
  title: string
  description: string
  accentColor: string
}

interface UseCasesContent {
  badgeText: string
  title: string
  subtitle: string
  items: UseCaseItem[]
  cta: {
    text: string
    buttonText: string
    href: string
  }
}

export default function OptimizedUseCases() {
  useSectionObserver("use-cases")
  const { isActive } = useActiveSection()
  const shouldAnimate = isActive("use-cases")
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="container px-4 md:px-6">
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-2">
          <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
            {content.badgeText}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{content.title}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{content.subtitle}</p>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
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
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">{content.cta.text}</p>
        <Button
          className="px-6 py-3 h-auto bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 relative overflow-hidden group"
          asChild
        >
          <Link href={`/${language}${content.cta.href}`}>
            <span className="text-[15px] font-medium relative z-10">{content.cta.buttonText}</span>
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
