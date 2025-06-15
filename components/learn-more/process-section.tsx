"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RenderIcon } from "@/components/icon-mapper"
import { ProcessTimeline } from "./process-timeline"

interface ProcessStep {
  number: string
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: string
  color: string
}

interface ProcessSectionProps {
  title: string
  subtitle: string
  steps: ProcessStep[]
  language: string
}

// Guaranteed unique icons for each step
const UNIQUE_ICONS = ["Brain", "Wrench", "Cpu", "Shield", "Rocket", "Zap", "Target", "Lightbulb"]

export function ProcessSection({ title, subtitle, steps, language }: ProcessSectionProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [processSteps, setProcessSteps] = useState(steps)

  // Assign unique icons to steps on component mount
  useEffect(() => {
    const stepsWithUniqueIcons = steps.map((step, index) => ({
      ...step,
      uniqueIcon: UNIQUE_ICONS[index % UNIQUE_ICONS.length],
    }))
    setProcessSteps(stepsWithUniqueIcons)
  }, [steps])

  const nextStep = () => {
    if (currentStep < processSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <section id="process" className="min-h-screen flex items-center justify-center py-20 learn-more-section">
      <div className="container px-6 sm:px-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* Timeline Component */}
        <ProcessTimeline
          steps={processSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          nextStep={nextStep}
          prevStep={prevStep}
          language={language}
        />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-background/60 backdrop-blur-sm border border-[#68DBFF]/20">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div
                    className={`text-6xl font-bold bg-gradient-to-r ${processSteps[currentStep].color} bg-clip-text text-transparent`}
                  >
                    {processSteps[currentStep].number}
                  </div>
                  <div className={`p-4 rounded-full bg-gradient-to-r ${processSteps[currentStep].color} bg-opacity-20`}>
                    <RenderIcon
                      iconName={processSteps[currentStep].uniqueIcon || "Check"}
                      className="h-12 w-12 text-white"
                    />
                  </div>
                </div>
                <CardTitle className="text-3xl mb-2">{processSteps[currentStep].title}</CardTitle>
                <p
                  className={`text-lg font-medium bg-gradient-to-r ${processSteps[currentStep].color} bg-clip-text text-transparent`}
                >
                  {processSteps[currentStep].subtitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground text-center">{processSteps[currentStep].description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {processSteps[currentStep].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/40"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#68DBFF]" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
