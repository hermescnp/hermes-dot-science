"use client"

import { useEffect, useState, useRef } from "react"
import { useMotionValue, useSpring } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { Footer } from "@/components/footer"
import Navbar from "@/components/navbar"
import DemoRequestModal from "@/components/demo-request-modal"

// Import custom components
import { HeroSection } from "@/components/learn-more/hero-section"
import { CoreOfferingSection } from "@/components/learn-more/core-offering-section"
import { BenefitsSection } from "@/components/learn-more/benefits-section"
import { ProcessSection } from "@/components/learn-more/process-section"
import { CTASection } from "@/components/learn-more/cta-section"
import { NavigationArrows, SectionIndicators, BackButton } from "@/components/learn-more/navigation-ui"
import { BackgroundEffects } from "@/components/learn-more/background-effects"

// Import custom hook
import { useSectionScroll } from "@/hooks/use-section-scroll"

interface LearnMoreContent {
  hero: {
    title: string
    subtitle: string
    description: string
  }
  coreOffering: {
    title: string
    subtitle: string
    description: string
    features: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  benefits: {
    title: string
    subtitle: string
    items: Array<{
      icon: string
      title: string
      description: string
      metric: string
    }>
  }
  process: {
    title: string
    subtitle: string
    steps: Array<{
      number: string
      title: string
      subtitle: string
      description: string
      features: string[]
      icon: string
      color: string
    }>
  }
  cta: {
    title: string
    subtitle: string
    primaryButton: string
    secondaryButton: string
  }
}

export default function LearnMorePage({ params: { lang } }: { params: { lang: string } }) {
  const { language, t } = useLanguage()
  const [content, setContent] = useState<LearnMoreContent | null>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)

  // Spotlight effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 })

  // These are the sections that will have indicators
  const sections = ["hero", "offering", "benefits", "process", "cta"]

  // Use our custom hook for section scrolling
  const { currentSnapPoint, isAtFooter, scrollToSection, nextSection, prevSection } = useSectionScroll({
    sections,
    footerRef,
  })

  const handleMouseMove = (e: MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/learn-more?lang=${language}`)
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error("Error fetching learn-more content:", error)
      }
    }

    fetchContent()

    // Add mouse tracking
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [language])

  useEffect(() => {
    // This effect runs once content is loaded - forces scroll indicators to sync with current position
    if (content) {
      // Force scroll to current position to trigger observers
      const currentPosition = window.scrollY
      window.scrollTo(0, currentPosition + 1)
      setTimeout(() => window.scrollTo(0, currentPosition), 10)

      // Also manually update indicators after a delay to ensure everything is rendered
      const forceUpdateIndicators = () => {
        // Dispatch a synthetic scroll event
        window.dispatchEvent(new CustomEvent("scroll"))
      }

      // Try multiple times to ensure it works
      setTimeout(forceUpdateIndicators, 100)
      setTimeout(forceUpdateIndicators, 500)
      setTimeout(forceUpdateIndicators, 1000)
    }
  }, [content])

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141823] text-white">
        <p>{t("loading") || "Loading..."}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#141823] text-white overflow-x-hidden learn-more-container">
      <Navbar className="relative z-[90]" />

      {/* Snap anchor for very top of page */}
      <div className="hero-snap-anchor" />

      {/* Back Button */}
      <BackButton lang={lang} language={language} />

      {/* Navigation Arrows */}
      <NavigationArrows
        currentSnapPoint={currentSnapPoint}
        totalSnapPoints={sections.length}
        isAtFooter={isAtFooter}
        prevSection={prevSection}
        nextSection={nextSection}
      />

      {/* Section Indicators */}
      <SectionIndicators sections={sections} currentSnapPoint={currentSnapPoint} scrollToSection={scrollToSection} />

      {/* Background Effects */}
      <BackgroundEffects springX={springX} springY={springY} />

      {/* Scrollable Content with CSS Scroll Snap */}
      <div
        className="relative z-[30] scroll-smooth px-0 sm:px-4 md:px-12 lg:px-16"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Hero Section */}
        <div style={{ scrollSnapAlign: "start" }}>
          <HeroSection
            title={content.hero.title}
            subtitle={content.hero.subtitle}
            description={content.hero.description}
            language={language}
          />
        </div>

        {/* Core Offering Section */}
        <div style={{ scrollSnapAlign: "start" }}>
          <CoreOfferingSection
            title={content.coreOffering.title}
            subtitle={content.coreOffering.subtitle}
            description={content.coreOffering.description}
            features={content.coreOffering.features}
          />
        </div>

        {/* Benefits Section */}
        <div style={{ scrollSnapAlign: "start" }}>
          <BenefitsSection
            title={content.benefits.title}
            subtitle={content.benefits.subtitle}
            items={content.benefits.items}
          />
        </div>

        {/* Process Section */}
        <div style={{ scrollSnapAlign: "start" }}>
          <ProcessSection
            title={content.process.title}
            subtitle={content.process.subtitle}
            steps={content.process.steps}
            language={language}
          />
        </div>

        {/* CTA Section */}
        <div style={{ scrollSnapAlign: "start" }}>
          <CTASection
            title={content.cta.title}
            subtitle={content.cta.subtitle}
            primaryButton={content.cta.primaryButton}
            secondaryButton={content.cta.secondaryButton}
            lang={lang}
            onRequestDemo={() => setIsDemoModalOpen(true)}
          />
        </div>

        {/* Footer - Now with ref for snap scrolling */}
        <div ref={footerRef} id="footer-section" className="pt-20" style={{ scrollSnapAlign: "start" }}>
          <Footer />
        </div>

        <DemoRequestModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      </div>
    </div>
  )
}
