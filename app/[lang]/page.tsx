"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import ContactForm from "@/components/contact-form"
import CommunitySection from "@/components/community-section"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import TypingPromptInput from "@/components/typing-prompt-input"
import OptimizedFramerSpotlight from "@/components/optimized-framer-spotlight"
import CssGridBackground from "@/components/css-grid-background"
import StructuredData from "@/components/structured-data"
import OptimizedAIFlowDiagram from "@/components/optimized-ai-flow-diagram"
import { ActiveSectionProvider, useSectionObserver } from "@/hooks/use-active-section"
import dynamic from "next/dynamic"
import PlatformCarousel from "@/components/platform-carousel"
import OptimizedUseCases from "@/components/optimized-use-cases"
import ScrollDownButton from "@/components/scroll-down-button"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import DemoRequestModal from "@/components/demo-request-modal"
import Link from "next/link"
import QuoteDataModal from "@/components/quote-data-modal"
import ElegantSeparator from "@/components/neon-separator"

const ResponsiveFlowWrapper = dynamic(() => import("@/components/responsive-flow-wrapper"), { ssr: false })

interface HeroContent {
  badgeText: string
  title: string
  subtitle: string
  typingPrompts: string[]
  ctaButton1: { text: string; icon?: string }
  ctaButton2: { text: string }
  scrollDownButton: { targetSectionId: string; text: string }
}

interface HowItWorksContent {
  title: string
  subtitle: string
  steps: Array<{ number: string; title: string; description: string }>
  cta: {
    text: string
    buttonText: string
  }
}

interface ContactPageContent {
  pageTitle: string
  pageSubtitle: string
  badgeText: string
  features: Array<{ iconName: string; text: string; color: string }>
  ctaSection: {
    title: string
    subtitle: string
    getQuoteButton: string
    learnMoreButton: string
  }
  formSection: {
    title: string
    subtitle: string
  }
}

function SectionObservers() {
  useSectionObserver("hero")
  useSectionObserver("platforms")
  useSectionObserver("how-it-works")
  useSectionObserver("use-cases")
  useSectionObserver("community")
  useSectionObserver("contact")
  return null
}

export default function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const { language, t } = useLanguage()
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [howItWorksContent, setHowItWorksContent] = useState<HowItWorksContent | null>(null)
  const [contactContent, setContactContent] = useState<ContactPageContent | null>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  // Fetch content when language changes
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [heroRes, howItWorksRes, contactRes] = await Promise.all([
          fetch(`/api/content/hero?lang=${language}`),
          fetch(`/api/content/how-it-works?lang=${language}`),
          fetch(`/api/content/contact?lang=${language}`),
        ])

        if (heroRes.ok) {
          const heroData = await heroRes.json()
          setHeroContent(heroData)
        }

        if (howItWorksRes.ok) {
          const howItWorksData = await howItWorksRes.json()
          setHowItWorksContent(howItWorksData)
        }

        if (contactRes.ok) {
          const contactData = await contactRes.json()
          setContactContent(contactData)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        // Set fallback content
        setHeroContent({
          badgeText: "AI-Powered Platform",
          title: "Secure AI Solutions for Enterprise",
          subtitle: "Enterprise-grade AI platform with advanced security and customization",
          typingPrompts: ["How can I analyze my data?", "Generate a report", "Create a presentation"],
          ctaButton1: { text: "Request Demo", icon: "Play" },
          ctaButton2: { text: "Learn More" },
          scrollDownButton: { targetSectionId: "platforms", text: "Explore" },
        })
        setHowItWorksContent({
          title: "How It Works",
          subtitle: "Simple steps to get started",
          steps: [
            { number: "1", title: "Connect", description: "Connect your data sources" },
            { number: "2", title: "Configure", description: "Set up your AI agents" },
            { number: "3", title: "Deploy", description: "Launch your solution" },
          ],
          cta: {
            text: "Want to dive deeper into our process and capabilities?",
            buttonText: "Learn More",
          },
        })
        setContactContent({
          pageTitle: "Custom Enterprise Pricing",
          pageSubtitle: "Tailored AI solutions designed for your organization's specific needs and scale",
          badgeText: "Enterprise Solution",
          features: [
            { iconName: "Shield", text: "Enterprise-grade security & compliance", color: "text-green-400" },
            { iconName: "Database", text: "Custom knowledge base integration", color: "text-blue-400" },
            { iconName: "Bot", text: "Advanced LLM conversations & agents", color: "text-purple-400" },
            { iconName: "Users", text: "Dedicated support & training", color: "text-orange-400" },
            { iconName: "Server", text: "MCP server support & customization", color: "text-cyan-400" },
          ],
          ctaSection: {
            title: "Ready to transform your business?",
            subtitle: "Get a personalized quote based on your requirements",
            getQuoteButton: "Get a Quote",
            learnMoreButton: "Learn More",
          },
          formSection: {
            title: "Start Your Journey",
            subtitle: "Tell us about your project and we'll get back to you within 24 hours",
          },
        })
      }
    }

    fetchContent()
  }, [language])

  if (!heroContent || !howItWorksContent || !contactContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1727] text-white">
        <p>{t("loading")}</p>
      </div>
    )
  }

  return (
    <ActiveSectionProvider>
      <SectionObservers />
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-[#0A1727] text-white">
        <Navbar />
        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-[calc(100vh-400px)] flex items-center justify-center overflow-hidden z-[60] bg-background mt-20 pb-20 md:pb-0"
          style={{
            borderRadius: "25px",
            boxShadow: "0 0 30px 5px rgba(0, 0, 0, 0.1)",
            border: "0.5px solid #68DBFF",
          }}
        >
          <CssGridBackground />
          <OptimizedFramerSpotlight />
          <div className="w-full max-w-none px-6 md:px-12 py-12 md:py-16">
            <div className="grid grid-cols-1 xl:grid-cols-2 items-center justify-center">
              <div className="relative z-10 flex flex-col justify-center w-auto pl-4 md:pl-8 space-y-10 text-center xl:text-left">
                <div className="inline-block rounded-lg bg-gradient-to-r from-[#68DBFF] via-[#0A5E95] to-[#E27D4A] p-[1px] w-fit mx-auto xl:mx-0">
                  <div className="rounded-lg px-5 py-2.5 text-sm" style={{ backgroundColor: "#0B1E33" }}>
                    Powered by Hermes Dot Science
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-radial from-white to-[#68DBFF] bg-clip-text text-transparent">
                  {heroContent.title}
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {heroContent.subtitle}
                </p>

                <div className="w-full max-w-2xl mx-auto xl:mx-0">
                  <TypingPromptInput prompts={heroContent.typingPrompts} />
                </div>

                <div className="flex flex-wrap gap-3 justify-center xl:justify-start">
                  <Button
                    onClick={() => setIsDemoModalOpen(true)}
                    className="flex items-center gap-3 px-5 py-6 h-[60px] bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                    <RenderIcon iconName={heroContent.ctaButton1.icon} className="h-5 w-5 text-white relative z-10" />
                    <span className="text-[15px] font-medium relative z-10">{heroContent.ctaButton1.text}</span>
                  </Button>
                  <Button
                    className="px-5 py-6 h-[60px] rounded-xl border border-[#416679] bg-transparent hover:bg-black/30 text-[15px] font-medium text-foreground"
                    style={{ borderWidth: "1px" }}
                    asChild
                  >
                    <Link href={`/${language}/learn-more`}>{heroContent.ctaButton2.text}</Link>
                  </Button>
                </div>
              </div>

              <div className="relative z-10 hidden md:flex items-center justify-center w-full">
                <div className="w-full max-w-full">
                  <ResponsiveFlowWrapper>
                    <OptimizedAIFlowDiagram />
                  </ResponsiveFlowWrapper>
                </div>
              </div>
            </div>
          </div>
          <ScrollDownButton
            targetSectionId={heroContent.scrollDownButton.targetSectionId}
            buttonText={heroContent.scrollDownButton.text}
          />
        </section>

        <PlatformCarousel />

        {/* Neon Separator between Platforms and How It Works */}
        <ElegantSeparator width="240px" />

        {/* How It Works */}
        <section className="pt-20 pb-20" id="how-it-works" aria-labelledby="how-it-works-heading">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 id="how-it-works-heading" className="text-2xl font-medium tracking-tighter sm:text-3xl md:text-4xl">
                  {howItWorksContent.title}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{howItWorksContent.subtitle}</p>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12 items-start">
              {howItWorksContent.steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center space-y-4 text-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-white relative"
                    style={{
                      backgroundColor: "#0A1727",
                      boxShadow:
                        "0 0 30px #68DBFF, 0 0 60px rgba(104, 219, 255, 0.5), 0 0 90px rgba(104, 219, 255, 0.3)",
                    }}
                  >
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            {/* Add CTA section */}
            <div className="flex flex-col items-center justify-center space-y-4 text-center mt-12">
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">{howItWorksContent.cta.text}</p>
              <Button
                className="px-6 py-3 h-auto bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 relative overflow-hidden group"
                asChild
              >
                <Link href={`/${language}/learn-more`}>
                  <span className="text-[15px] font-medium relative z-10">{howItWorksContent.cta.buttonText}</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Neon Separator between How It Works and Use Cases */}
        <ElegantSeparator width="280px" />

        {/* Use Cases Section - Now with consistent background color */}
        <section className="pt-20 pb-20" id="use-cases">
          <div className="w-full">
            <OptimizedUseCases />
          </div>
        </section>

        {/* Neon Separator between Use Cases and Community */}
        <ElegantSeparator width="260px" />

        <section id="community" className="relative pt-20 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, #0A1727 0%, transparent 100%)",
              zIndex: 40,
            }}
          />
          <CommunitySection />
        </section>

        {/* Neon Separator between Community and Contact/Pricing */}
        <ElegantSeparator width="320px" />

        {/* Contact/Pricing Section */}
        <section
          id="contact"
          className="pt-20 pb-20 relative overflow-hidden bg-gradient-to-b from-[#0A1727] to-[#0B1E33]"
          aria-labelledby="contact-heading"
        >
          {/* Background Effects - Similar to Hero */}
          <CssGridBackground />

          {/* Subtle spotlight effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-[#68DBFF]/5 via-[#68DBFF]/2 to-transparent rounded-full blur-3xl" />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
              {/* Left Column - Enhanced Pricing Info */}
              <div className="relative">
                {/* Soft glowing shadow */}
                <div
                  className="absolute -inset-4 rounded-2xl opacity-30"
                  style={{
                    background: "linear-gradient(135deg, rgba(104, 219, 255, 0.1), rgba(10, 94, 149, 0.1))",
                    filter: "blur(15px)",
                  }}
                />

                <div
                  className="relative bg-background/40 backdrop-blur-md border border-[#68DBFF]/15 rounded-2xl p-8 space-y-6"
                  style={{
                    boxShadow: "0 0 30px rgba(104, 219, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#68DBFF]/20 to-[#0A5E95]/20 border border-[#68DBFF]/30">
                      <RenderIcon iconName="Sparkles" className="h-4 w-4 text-[#68DBFF]" />
                      <span className="text-sm font-medium text-[#68DBFF]">{contactContent.badgeText}</span>
                    </div>
                    <h2
                      id="contact-heading"
                      className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-[#68DBFF] bg-clip-text text-transparent pb-1 leading-tight"
                    >
                      {contactContent.pageTitle}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{contactContent.pageSubtitle}</p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {contactContent.features.map((feature, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#68DBFF]/20 to-[#0A5E95]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <RenderIcon iconName={feature.iconName} className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors duration-300 leading-relaxed">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Section */}
                  <div className="pt-6 space-y-6 border-t border-[#68DBFF]/20">
                    <div className="text-center space-y-2">
                      <p className="font-semibold text-lg">{contactContent.ctaSection.title}</p>
                      <p className="text-muted-foreground">{contactContent.ctaSection.subtitle}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="flex items-center justify-center gap-3 px-6 py-3 h-auto bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 relative overflow-hidden group"
                      >
                        <RenderIcon iconName="Calculator" className="h-5 w-5 text-white" />
                        <span className="text-[15px] font-medium">{contactContent.ctaSection.getQuoteButton}</span>
                      </Button>
                      <Button
                        className="px-6 py-3 h-auto rounded-xl border border-[#416679] bg-transparent hover:bg-black/30 text-[15px] font-medium text-foreground"
                        style={{ borderWidth: "1px" }}
                        asChild
                      >
                        <Link href={`/${language}/learn-more`}>{contactContent.ctaSection.learnMoreButton}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Enhanced Contact Form */}
              <div className="relative">
                {/* Soft glowing shadow for contact form */}
                <div
                  className="absolute -inset-4 rounded-2xl opacity-30"
                  style={{
                    background: "linear-gradient(135deg, rgba(104, 219, 255, 0.1), rgba(10, 94, 149, 0.1))",
                    filter: "blur(15px)",
                  }}
                />

                <div
                  className="relative bg-background/40 backdrop-blur-md border border-[#68DBFF]/15 rounded-2xl p-8"
                  style={{
                    boxShadow: "0 0 30px rgba(104, 219, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">{contactContent.formSection.title}</h3>
                    <p className="text-muted-foreground text-sm">{contactContent.formSection.subtitle}</p>
                  </div>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <DemoRequestModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        <QuoteDataModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} lang={lang} />
      </div>
    </ActiveSectionProvider>
  )
}
