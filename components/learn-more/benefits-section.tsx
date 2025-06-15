"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RenderIcon } from "@/components/icon-mapper"

interface Benefit {
  icon: string
  title: string
  description: string
  metric: string
}

interface BenefitsSectionProps {
  title: string
  subtitle: string
  items: Benefit[]
}

// Map benefit types to appropriate icons
const getBenefitIcon = (title: string, originalIcon: string) => {
  const titleLower = title.toLowerCase()

  if (titleLower.includes("efficiency") || titleLower.includes("speed") || titleLower.includes("fast")) {
    return "Rocket"
  } else if (titleLower.includes("cost") || titleLower.includes("save") || titleLower.includes("reduce")) {
    return "DollarSign"
  } else if (titleLower.includes("accuracy") || titleLower.includes("precise") || titleLower.includes("quality")) {
    return "Target"
  } else if (titleLower.includes("user") || titleLower.includes("experience") || titleLower.includes("satisfaction")) {
    return "Smile"
  } else if (titleLower.includes("time") || titleLower.includes("quick") || titleLower.includes("rapid")) {
    return "Clock"
  } else if (titleLower.includes("scal") || titleLower.includes("growth") || titleLower.includes("expand")) {
    return "TrendingUp"
  }

  return originalIcon
}

export function BenefitsSection({ title, subtitle, items }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="min-h-screen flex items-center justify-center py-20 learn-more-section">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((benefit, index) => {
            const iconName = getBenefitIcon(benefit.title, benefit.icon)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border border-[#68DBFF]/20 hover:border-[#68DBFF]/40 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(104,219,255,0.3)]">
                  <CardHeader className="text-center">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#315f8c] to-[#68dbff] opacity-20"></div>
                      <div className="absolute inset-0.5 rounded-full bg-background/80 backdrop-blur-sm"></div>
                      <div className="relative flex items-center justify-center w-full h-full">
                        <RenderIcon iconName={iconName} className="h-8 w-8 text-[#68DBFF]" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <div className="text-2xl font-bold text-[#68DBFF]">{benefit.metric}</div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base text-muted-foreground">{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
