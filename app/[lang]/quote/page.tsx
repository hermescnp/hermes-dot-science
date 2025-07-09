"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMotionValue, useSpring } from "framer-motion"
import CssGridBackground from "@/components/css-grid-background"
import OptimizedFramerSpotlight from "@/components/optimized-framer-spotlight"
import { ConversationalQuoteChat } from "@/components/quote/conversational-quote-chat"
import QuoteResults from "@/components/quote/quote-results"
import { useLanguage } from "@/contexts/language-context"
import { use } from "react"
import QuoteDataModal from "@/components/quote-data-modal"

type QuoteStep = "chat" | "results"

interface Answer {
  questionId: string
  optionId: string
  multiplierId?: string
  basePrice: number
  finalPrice: number
  hours: number
  // Detailed step information
  stepDetails: {
    question: {
      id: string
      stage: string
      botMessage: string
      followUpMessage?: string
    }
    selectedOption: {
      id: string
      label: string
      description?: string
      conversationalText: string
      basePrice: number
      hours: number
    }
    selectedMultiplier?: {
      id: string
      label: string
      description: string
      conversationalText: string
      multiplier: number
    }
    pricing: {
      basePrice: number
      priceAfterComplexity: number
      companySizeMultiplier: number
      finalPrice: number
    }
    companySize?: {
      id: string
      label: string
      description: string
      multiplier: number
      icon: string
    }
  }
}

export default function QuotePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
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
      setHasUserData(!!hasData)

      // If no user data exists, show the modal
      if (!hasData) {
        setShowDataModal(true)
      }
    }
  }, [])

  // Make sure the language is properly passed to the components
  const handleQuoteComplete = async (quoteAnswers: Answer[]) => {
    setAnswers(quoteAnswers)
    setCurrentStep("results")
    
    // Submit the quote data immediately when calculation is completed
    try {
      // Get the leadId and business data from localStorage
      const leadId = typeof window !== "undefined" ? localStorage.getItem("quoteLeadId") : null
      const businessData = typeof window !== "undefined" ? 
        JSON.parse(localStorage.getItem("quoteBusinessData") || "{}") : {}
      const userData = typeof window !== "undefined" ? 
        JSON.parse(localStorage.getItem("quoteUserData") || "{}") : {}
      
      if (!leadId) {
        console.error("No leadId found in localStorage")
        return
      }

      // Calculate totals
      const totalPrice = quoteAnswers.reduce((sum, answer) => sum + answer.finalPrice, 0)
      const totalHours = quoteAnswers.reduce((sum, answer) => sum + answer.hours, 0)

      // Create simplified clientInfo by merging user data and business data
      const clientInfo = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        fullName: userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        company: userData.company || "",
        role: userData.role || "",
        email: userData.email || "",
        phone: userData.fullPhone || "",
        identificationType: businessData.identificationType || "",
        identification: businessData.identification || "",
        language: currentLanguage
      }

      // Create simplified quoteDetails array matching the results page structure (8 stages total)
      const allStageDefinitions = [
        {
          id: "organizational-assessment",
          title: "Organizational Assessment",
          description: "A high-level review of your enterprise or agency's structure, team interactions, and existing processes to pinpoint pain points, bottlenecks, and opportunities for AI-driven efficiency gains.",
          isFree: true,
          hours: 8,
          price: 0
        },
        {
          id: "demo-proposal",
          title: "Demo Proposal & Roadmap",
          description: "A tailored proof-of-concept plan, complete with a MoSCoW prioritization matrix (Must-have, Should-have, Could-have, Won't-have), a phased rollout roadmap, and a ballpark budget estimate to align on scope and expectations.",
          isFree: true,
          hours: 12,
          price: 0
        },
        {
          id: "workflow-analysis",
          title: "Detailed Workflow & Systems Architecture Analysis",
          description: "Deep dive into the selected process(es): map end-to-end workflows, data flows, and system dependencies; define security, compliance, and scalability requirements; and produce a technical architecture blueprint."
        },
        {
          id: "knowledge-base", 
          title: "Knowledge-Base Curation & Input Preparation",
          description: "Inventory, ingest, and preprocess all relevant data sources—structured, semi-structured, and unstructured—cleaning and organizing content so it can be reliably ingested into your AI models."
        },
        {
          id: "implementation",
          title: "Implementation / Development", 
          description: "Build and train your custom AI agent(s), whether a rule-based chatbot, an NLP-driven conversational assistant, a voice interface, or an automated backend workflow, following best practices for security and maintainability."
        },
        {
          id: "integrations",
          title: "Integrations",
          description: "Connect the AI agent to your core systems (CRM, ERP, ticketing, custom APIs, on-premise databases, etc.), developing any necessary adapters or middleware to ensure seamless, bi-directional data exchange."
        },
        {
          id: "qa",
          title: "Quality Assurance (QA)",
          description: "Execute test plans covering unit tests, integration tests, performance and stress tests, security audits, and—if required—automated regression suites to validate functionality, reliability, and compliance."
        },
        {
          id: "maintenance",
          title: "Maintenance & Monitoring (KPIs)",
          description: "Ongoing support and system monitoring, with dashboards and reports tracking uptime, response accuracy, user satisfaction, cost-savings metrics, and other agreed KPIs; includes model retraining, patching, and performance tuning."
        }
      ]

      // Create quoteDetails array with all 8 stages
      const quoteDetails = allStageDefinitions.map((stage, index) => {
        // Check if this is a company size answer (first answer with questionId "company-size")
        const companySizeAnswer = quoteAnswers.find(answer => answer.questionId === "company-size")
        
        // For free stages (index 0 and 1)
        if (stage.isFree) {
          return {
            subject: stage.title,
            subjectDetail: stage.description,
            clientDetail: "Included at no cost",
            basePrice: 0,
            complexityMultiplier: 1,
            totalPrice: 0,
            estimatedWorkTime: stage.hours
          }
        }
        
        // For paid stages (index 2-7), map to questionnaire answers (index 0-5)
        const answerIndex = index - 2 // Convert stage index to answer index
        const answer = quoteAnswers[answerIndex]
        
        if (answer && answer.questionId === "company-size") {
          // Handle company size answer
          return {
            subject: "Company Size Assessment",
            subjectDetail: "Understanding the scale and complexity of your organization to tailor the solution appropriately.",
            clientDetail: `${answer.stepDetails?.selectedOption?.label || ""} - ${answer.stepDetails?.selectedOption?.description || ""}`,
            basePrice: answer.basePrice,
            complexityMultiplier: answer.stepDetails?.selectedMultiplier?.multiplier || 1,
            totalPrice: answer.finalPrice,
            estimatedWorkTime: answer.hours
          }
        } else if (answer) {
          // Handle regular questionnaire answers
          return {
            subject: stage.title,
            subjectDetail: stage.description,
            clientDetail: answer.stepDetails?.selectedOption?.description || "",
            basePrice: answer.basePrice,
            complexityMultiplier: answer.stepDetails?.selectedMultiplier?.multiplier || 1,
            totalPrice: answer.finalPrice,
            estimatedWorkTime: answer.hours
          }
        } else {
          // Fallback for missing answers
          return {
            subject: stage.title,
            subjectDetail: stage.description,
            clientDetail: "Not specified",
            basePrice: 0,
            complexityMultiplier: 1,
            totalPrice: 0,
            estimatedWorkTime: 0
          }
        }
      })

      // Debug logging for quoteDetails
      console.log('Quote answers:', quoteAnswers)
      console.log('Quote details:', quoteDetails)

      // Create simplified quote data structure
      const simplifiedQuoteData = {
        leadId,
        clientInfo,
        quoteDetails,
        totalPrice,
        totalHours,
        language: currentLanguage,
        summary: {
          totalInvestment: totalPrice,
          totalHours: totalHours,
          estimatedWeeks: Math.ceil(totalHours / 40),
          estimatedCompletion: new Date(Date.now() + Math.ceil(totalHours / 40) * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      // Debug logging
      console.log('Sending quote data:', JSON.stringify(simplifiedQuoteData, null, 2))

      // Import the lead capture service
      const { createQuotation } = await import('@/lib/lead-capture-service.js')
      
      // Create the quotation
      const result = await createQuotation(simplifiedQuoteData) as { success: boolean; quoteId?: string; error?: string }

      if (result.success) {
        console.log("Quote submitted successfully:", result.quoteId)
        // Store the quoteId for reference
        if (typeof window !== "undefined" && result.quoteId) {
          localStorage.setItem("quoteId", result.quoteId)
        }
      } else {
        console.error("Failed to submit quote:", result.error)
      }
    } catch (error) {
      console.error("Error submitting quote:", error)
    }
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
            <QuoteResults answers={answers} onBack={handleBackToChat} onStartOver={handleStartOver} quoteSubmitted={true} />
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
