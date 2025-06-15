"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { ChatbotKPIDemo } from "./chatbot-kpi-demo"

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  language: string
}

export function HeroSection({ title, subtitle, description, language }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center learn-more-section pt-20 sm:pt-24 md:pt-16 lg:pt-8"
    >
      <motion.div
        className="container px-6 sm:px-8 md:px-10 relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 md:py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-10 md:space-y-12 text-center w-full max-w-7xl">
          <motion.div
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-radial from-white to-[#68DBFF] bg-clip-text text-transparent leading-tight pb-2">
              {title}
            </h1>
            <p className="mx-auto max-w-[800px] text-lg sm:text-xl md:text-2xl text-muted-foreground">{subtitle}</p>
            <p className="mx-auto max-w-[600px] text-base sm:text-lg text-muted-foreground/80">{description}</p>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full"
          >
            <ChatbotKPIDemo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-2 text-muted-foreground/60 mt-4 sm:mt-6 md:mt-8"
          >
            <span className="text-sm sm:text-base">
              {language === "es" ? "Desliza hacia abajo para explorar" : "Scroll down to explore"}
            </span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
