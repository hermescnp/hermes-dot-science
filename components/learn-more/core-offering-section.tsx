"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RenderIcon } from "@/components/icon-mapper"
import FrostedGlassIcon from "@/components/frosted-glass-icon"

interface Feature {
  icon: string
  title: string
  description: string
}

interface CoreOfferingSectionProps {
  title: string
  subtitle: string
  description: string
  features: Feature[]
}

export function CoreOfferingSection({ title, subtitle, description, features }: CoreOfferingSectionProps) {
  return (
    <section id="offering" className="min-h-screen flex items-center justify-center py-20 learn-more-section">
      <div className="container px-6 sm:px-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground mb-6">{subtitle}</p>
          <p className="mx-auto max-w-[800px] text-lg text-muted-foreground/80">{description}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-background/60 backdrop-blur-sm border border-[#68DBFF]/20 hover:border-[#68DBFF]/40 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <FrostedGlassIcon
                      icon={<RenderIcon iconName={feature.icon} className="h-6 w-6" />}
                      color="rgba(104, 219, 255, 0.5)"
                      className="mb-0"
                    />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
