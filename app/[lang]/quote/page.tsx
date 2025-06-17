"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMotionValue, useSpring } from "framer-motion"
import CssGridBackground from "@/components/css-grid-background"
import OptimizedFramerSpotlight from "@/components/optimized-framer-spotlight"
import { ConversationalQuoteChat } from "@/components/quote/conversational-quote-chat"
import QuoteResults from "@/components/quote/quote-results"
import { useLanguage } from "@/contexts/language-context"
import QuoteDataModal from "@/components/quote-data-modal"

type QuoteStep = "chat" | "results"

interface Answer {
  questionId: string
  optionId: string
  multiplierId?: string
  basePrice: number
  finalPrice: number
  hours: number
}

export default function QuotePage({ params: { lang } }: { params: { lang: string } }) {
  const { language } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<QuoteStep>("chat")
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showDataModal, setShowDataModal] = useState(false)
  const [hasUserData, setHasUserData] = useState(false)

  // Replace the existing language detection with:
  const currentLanguage = lang || language || "en"

  // Spotlight effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 })

  const handleMouseMove = (e: MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  // Update the useEffect hook to properly handle language changes
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Check if user data exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("quoteUserData")
      const hasData = userData && userData !== "null"
      setHasUserData(hasData)

      // If no user data exists, show the modal
      if (!hasData) {
        setShowDataModal(true)
      }
    }
  }, [])

  // Make sure the language is properly passed to the components
  const handleQuoteComplete = (quoteAnswers: Answer[]) => {
    setAnswers(quoteAnswers)
    setCurrentStep("results")
  }

  const handleBackToChat = () => {
    setCurrentStep("chat")
  }

  const handleStartOver = () => {
    setAnswers([])
    setCurrentStep("chat")
  }

  const handleBackToLearnMore = () => {
    router.push(`/${currentLanguage}/learn-more`)
  }

  const handleDataModalClose = () => {
    // Check if user data was provided after modal interaction
    const userData = localStorage.getItem("quoteUserData")
    const hasData = userData && userData !== "null"

    if (hasData) {
      setHasUserData(true)
      setShowDataModal(false)
    } else {
      // If user closes modal without completing, redirect back to learn-more
      router.push(`/${currentLanguage}/learn-more`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1727] text-white overflow-x-hidden">
      {/* Background effects container */}
      <div className="fixed inset-0 z-0">
        <CssGridBackground />
        <OptimizedFramerSpotlight showMainSpotlight={false} />
      </div>

      <div className="relative z-10 min-h-screen">
        {currentStep === "chat" ? (
          <ConversationalQuoteChat onComplete={handleQuoteComplete} onBack={handleBackToLearnMore} />
        ) : (
          <div className="py-20">
            <QuoteResults answers={answers} onBack={handleBackToChat} onStartOver={handleStartOver} />
          </div>
        )}
      </div>

      {/* Quote Data Modal - shown when user data is missing */}
      <QuoteDataModal
        isOpen={showDataModal}
        onClose={handleDataModalClose}
        lang={currentLanguage}
        isOnQuotePage={true}
      />
    </div>
  )
}
