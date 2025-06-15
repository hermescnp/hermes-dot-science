"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RenderIcon } from "@/components/icon-mapper"
import { useRouter } from "next/navigation"
import { useState } from "react"
import QuoteDataModal from "@/components/quote-data-modal"

interface CTASectionProps {
  title: string
  subtitle: string
  primaryButton: string
  secondaryButton: string
  lang: string
  onRequestDemo: () => void
}

export function CTASection({ title, subtitle, primaryButton, secondaryButton, lang, onRequestDemo }: CTASectionProps) {
  const router = useRouter()
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  // Define the correct button text based on language
  const quoteButtonText = lang === "es" ? "Obtener Cotización" : "Get a Quote"

  return (
    <section id="cta" className="min-h-screen flex items-center justify-center py-20 learn-more-section">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container px-6 sm:px-8 md:px-10 text-center"
      >
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">{title}</h2>
        <p className="mx-auto max-w-[700px] text-xl text-muted-foreground mb-12">{subtitle}</p>

        <div className="flex flex-wrap justify-center gap-6">
          <Button
            onClick={onRequestDemo}
            className="flex items-center gap-3 px-8 py-6 h-[60px] bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 text-lg"
          >
            <RenderIcon iconName="Play" className="h-6 w-6 text-white" />
            <span className="font-medium">{primaryButton}</span>
          </Button>
          <Button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-8 py-6 h-[60px] rounded-xl border border-[#416679] bg-transparent hover:bg-[#141823] text-lg font-medium text-foreground"
            style={{ borderWidth: "1px" }}
          >
            {quoteButtonText}
          </Button>
        </div>
        <QuoteDataModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} lang={lang} />
      </motion.div>
    </section>
  )
}
