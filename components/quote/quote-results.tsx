"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Download,
  Mail,
  Share2,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  User,
  Calendar,
  Info,
} from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

interface Answer {
  questionId: string
  optionId: string
  multiplierId?: string
  basePrice: number
  finalPrice: number
  hours: number
}

interface QuoteResultsProps {
  answers: Answer[]
  onBack: () => void
  onStartOver: () => void
}

interface UserData {
  firstName: string
  lastName: string
  fullName: string
  company: string
  role: string
  email: string
  fullPhone: string
  [key: string]: any
}

interface QuoteResultsTranslations {
  meta: {
    title: string
    description: string
  }
  header: {
    quoteCompleted: string
    customQuoteTitle: string
    customQuoteTitleWithName: string
    preparedFor: string
  }
  serviceDescription: string
  summary: {
    totalInvestment: string
    completeSolutionCost: string
    developmentTime: string
    weeks: string
    hours: string
    estimatedCompletion: string
    projectedDeliveryDate: string
  }
  breakdown: {
    title: string
    description: string
    free: string
    noCharge: string
    adjustedForComplexity: string
    perHour: string
    totalProjectInvestment: string
    completeSolution: string
    totalHours: string
  }
  stages: {
    [key: string]: {
      title: string
      description: string
    }
  }
  nextSteps: {
    title: string
    description: string
    disclaimer: {
      title: string
      content: string
    }
    termsCheckbox: {
      before: string
      link: string
      after: string
    }
    requestQuote: string
    downloadPDF: string
    shareQuote: string
  }
  clientInfo: {
    title: string
    name: string
    company: string
    role: string
    email: string
  }
  whatsIncluded: {
    title: string
    description: string
    items: string[]
  }
  contactForm: {
    title: string
    description: string
    fullName: string
    emailAddress: string
    company: string
    phoneNumber: string
    additionalRequirements: string
    placeholder: string
    submitButton: string
  }
  navigation: {
    backToHome: string
    startNewQuote: string
  }
  timeLabels: {
    hours: string
    week: string
    weeks: string
  }
}

// Fixed 8 stages with their titles and descriptions
const allStageDefinitions = [
  {
    id: "organizational-assessment",
    title: "Organizational Assessment",
    description:
      "A high-level review of your enterprise or agency's structure, team interactions, and existing processes to pinpoint pain points, bottlenecks, and opportunities for AI-driven efficiency gains.",
    isFree: true,
    hours: 8,
    price: 0,
  },
  {
    id: "demo-proposal",
    title: "Demo Proposal & Roadmap",
    description:
      "A tailored proof-of-concept plan, complete with a MoSCoW prioritization matrix (Must-have, Should-have, Could-have, Won't-have), a phased rollout roadmap, and a ballpark budget estimate to align on scope and expectations.",
    isFree: true,
    hours: 12,
    price: 0,
  },
  {
    id: "workflow-analysis",
    title: "Detailed Workflow & Systems Architecture Analysis",
    description:
      "Deep dive into the selected process(es): map end-to-end workflows, data flows, and system dependencies; define security, compliance, and scalability requirements; and produce a technical architecture blueprint.",
    isFree: false,
    hours: 0,
    price: 0,
  },
  {
    id: "knowledge-base",
    title: "Knowledge-Base Curation & Input Preparation",
    description:
      "Inventory, ingest, and preprocess all relevant data sources—structured, semi-structured, and unstructured—cleaning and organizing content so it can be reliably ingested into your AI models.",
    isFree: false,
    hours: 0,
    price: 0,
  },
  {
    id: "implementation",
    title: "Implementation / Development",
    description:
      "Build and train your custom AI agent(s), whether a rule-based chatbot, an NLP-driven conversational assistant, a voice interface, or an automated backend workflow, following best practices for security and maintainability.",
    isFree: false,
    hours: 0,
    price: 0,
  },
  {
    id: "integrations",
    title: "Integrations",
    description:
      "Connect the AI agent to your core systems (CRM, ERP, ticketing, custom APIs, on-premise databases, etc.), developing any necessary adapters or middleware to ensure seamless, bi-directional data exchange.",
    isFree: false,
    hours: 0,
    price: 0,
  },
  {
    id: "qa",
    title: "Quality Assurance (QA)",
    description:
      "Execute test plans covering unit tests, integration tests, performance and stress tests, security audits, and—if required—automated regression suites to validate functionality, reliability, and compliance.",
    isFree: false,
    hours: 0,
    price: 0,
  },
  {
    id: "maintenance",
    title: "Maintenance & Monitoring (KPIs)",
    description:
      "Ongoing support and system monitoring, with dashboards and reports tracking uptime, response accuracy, user satisfaction, cost-savings metrics, and other agreed KPIs; includes model retraining, patching, and performance tuning.",
    isFree: false,
    hours: 0,
    price: 0,
  },
]

export default function QuoteResults({ answers, onBack, onStartOver }: QuoteResultsProps) {
  // Add language context and translations state
  const { language } = useLanguage()
  const [translations, setTranslations] = useState<QuoteResultsTranslations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create the final stages array by mapping the 6 prices to stages 3-8
  const allStages = allStageDefinitions.map((stage, index) => {
    if (stage.isFree) {
      return stage
    } else {
      // Map the 6 answers to stages 3-8 (indices 2-7)
      const answerIndex = index - 2 // Convert stage index to answer index
      const answer = answers[answerIndex]

      if (answer) {
        return {
          ...stage,
          hours: answer.hours,
          price: answer.finalPrice,
          basePrice: answer.basePrice,
        }
      } else {
        // Fallback if no answer found
        return stage
      }
    }
  })

  const [showContactForm, setShowContactForm] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  // Add useEffect to fetch translations
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/content/quote-results?lang=${language}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`)
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error fetching translations:", error)
        // Fallback to English if there's an error
        try {
          const fallbackResponse = await fetch(`/api/content/quote-results?lang=en`)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback translations:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [language])

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("quoteUserData")
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData)
          setUserData(parsedData)
          // Pre-fill contact form with user data
          setContactData({
            name: parsedData.fullName || `${parsedData.firstName} ${parsedData.lastName}`.trim(),
            email: parsedData.email || "",
            company: parsedData.company || "",
            phone: parsedData.fullPhone || "",
            message: "",
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }
  }, [])

  const totalPrice = answers.reduce((sum, answer) => sum + answer.finalPrice, 0)
  const totalHours = answers.reduce((sum, answer) => sum + answer.hours, 0) + 20 // Add free hours
  const estimatedWeeks = Math.ceil(totalHours / 40)

  // Updated formatPrice function to include $ with US and make it slightly larger
  const formatPrice = (price: number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

    // Remove the $ sign from the formatted number
    const numberWithoutCurrency = formattedNumber.replace("$", "")

    // Return JSX with US$ in smaller but not too small font
    return (
      <span className="whitespace-nowrap">
        <span className="text-sm align-super mr-1 font-medium">US$</span>
        {numberWithoutCurrency}
      </span>
    )
  }

  // Simple format for crossed-out prices
  const formatPricePlain = (price: number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

    // Replace $ with US$
    return formattedNumber.replace("$", "US$ ")
  }

  const formatDate = (weeksFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + weeksFromNow * 7)
    return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Function to get the title with the user's name
  const getQuoteTitle = () => {
    if (!userData?.firstName || !translations) return translations?.header.customQuoteTitle || ""

    return translations.header.customQuoteTitleWithName.replace("{name}", userData.firstName)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Quote submitted:", { answers, contactData, totalPrice, userData })
    alert("Quote request submitted! We'll get back to you within 24 hours.")
  }

  const generateQuotePDF = () => {
    console.log("Generating PDF quote...")
    alert("PDF quote generation would be implemented here")
  }

  // Update the shareQuote function to use the plain text version for sharing
  const shareQuote = () => {
    const plainTextPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(totalPrice)
      .replace("$", "US$ ")

    if (navigator.share) {
      navigator.share({
        title: "AI Solution Quote",
        text: `Custom AI solution quote: ${plainTextPrice}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`AI Solution Quote: ${plainTextPrice} - ${window.location.href}`)
      alert("Quote link copied to clipboard!")
    }
  }

  // Show loading state if translations aren't loaded yet
  if (isLoading || !translations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#68DBFF] mx-auto mb-4"></div>
          <p className="text-[#68DBFF]">Loading...</p>
        </div>
      </div>
    )
  }

  // Now replace all hardcoded text with translations
  return (
    <div className="container max-w-7xl mx-auto px-6 pt-1 overflow-visible">
      {/* Header with Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/images/hermes-logo.svg"
              alt="Hermes Dot Science"
              width={350}
              height={100}
              className="h-20 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm font-medium mb-3">
          <CheckCircle className="h-4 w-4" />
          {translations.header.quoteCompleted}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{getQuoteTitle()}</h1>
        {userData?.company && (
          <p className="text-xl text-gray-300 mb-2">
            {translations.header.preparedFor} {userData.company}
          </p>
        )}
      </motion.div>

      {/* Service Description Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="bg-transparent backdrop-blur-md border-[#68DBFF]/20">
          <CardContent className="p-6">
            <p className="text-gray-300 leading-relaxed">{translations.serviceDescription}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quote Summary and Breakdown */}
        <div className="xl:col-span-2 space-y-8">
          {/* Executive Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-[#003564]/50 to-[#68DBFF]/10 backdrop-blur-md border-[#68DBFF]/30 overflow-hidden relative">
              <CardContent className="p-8 bg-transparent">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-[#68DBFF] mb-2">
                      <DollarSign className="h-6 w-6" />
                      <span className="text-sm font-medium">{translations.summary.totalInvestment}</span>
                    </div>
                    <div className="text-4xl font-bold text-white">{formatPrice(totalPrice)}</div>
                    <div className="text-sm text-gray-300">{translations.summary.completeSolutionCost}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-[#68DBFF] mb-2">
                      <Clock className="h-6 w-6" />
                      <span className="text-sm font-medium">{translations.summary.developmentTime}</span>
                    </div>
                    <div className="text-4xl font-bold text-white">{estimatedWeeks}</div>
                    <div className="text-sm text-gray-300">
                      {translations.summary.weeks} ({totalHours.toLocaleString()} {translations.summary.hours})
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-center justify-center gap-2 text-[#68DBFF] mb-2">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm font-medium">{translations.summary.estimatedCompletion}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatDate(estimatedWeeks)}</div>
                    <div className="text-sm text-gray-300">{translations.summary.projectedDeliveryDate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/20 backdrop-blur-md border-[#68DBFF]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#68DBFF]" />
                  {translations.breakdown.title}
                </CardTitle>
                <p className="text-gray-400 text-sm">{translations.breakdown.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {allStages.map((stage, index) => {
                  // Get the translation key for this stage
                  const stageKey = stage.id as keyof typeof translations.stages
                  // Add fallback in case translation is missing
                  const stageTranslation = translations.stages[stageKey] || {
                    title: stage.title,
                    description: stage.description,
                  }

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="relative"
                    >
                      <div className="p-6 bg-white/3 backdrop-blur-sm rounded-xl border border-white/10 hover:border-[#68DBFF]/30 transition-all duration-300">
                        <div className="flex justify-between items-start gap-6">
                          {/* Left side - Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-white text-lg">{stageTranslation.title}</h3>
                              {stage.isFree && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                  {translations.breakdown.free}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">{stageTranslation.description}</p>

                            {/* Time and duration info */}
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {stage.hours} {translations.timeLabels.hours}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {Math.ceil(stage.hours / 40)}{" "}
                                  {Math.ceil(stage.hours / 40) === 1
                                    ? translations.timeLabels.week
                                    : translations.timeLabels.weeks}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right side - Pricing */}
                          <div className="text-right min-w-[120px]">
                            {stage.isFree ? (
                              <div className="space-y-1">
                                <div className="text-2xl font-bold text-green-400">{translations.breakdown.free}</div>
                                <div className="text-xs text-gray-400">{translations.breakdown.noCharge}</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {stage.basePrice && stage.basePrice !== stage.price && (
                                  <div className="text-sm text-gray-400 line-through">
                                    {formatPricePlain(stage.basePrice)}
                                  </div>
                                )}
                                <div className="text-2xl font-bold text-[#68DBFF]">{formatPrice(stage.price)}</div>
                                {stage.basePrice && stage.basePrice !== stage.price && (
                                  <div className="text-xs text-green-400">
                                    {translations.breakdown.adjustedForComplexity}
                                  </div>
                                )}
                                {stage.hours > 0 && (
                                  <div className="text-xs text-gray-400">
                                    <span className="text-xs font-medium">US$</span>
                                    {Math.round(stage.price / stage.hours)}
                                    {translations.breakdown.perHour}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Total Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + allStages.length * 0.1 }}
                  className="border-t border-white/20 pt-6 mt-6"
                >
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#68DBFF]/5 to-[#4A9EFF]/5 backdrop-blur-sm rounded-lg border border-[#68DBFF]/20">
                    <div>
                      <h3 className="text-xl font-bold text-white">{translations.breakdown.totalProjectInvestment}</h3>
                      <p className="text-gray-300 text-sm">{translations.breakdown.completeSolution}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#68DBFF]">{formatPrice(totalPrice)}</div>
                      <div className="text-sm text-gray-300">
                        {totalHours.toLocaleString()} {translations.breakdown.totalHours}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/15 backdrop-blur-md border-[#68DBFF]/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">{translations.nextSteps.title}</CardTitle>
                <p className="text-gray-400 text-sm">{translations.nextSteps.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-100">
                      <p className="font-medium mb-2">{translations.nextSteps.disclaimer.title}</p>
                      <p className="text-yellow-200/90 leading-relaxed">{translations.nextSteps.disclaimer.content}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg mb-4 overflow-visible">
                  <input
                    type="checkbox"
                    id="disclaimer-checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-[#68DBFF] bg-transparent border-2 border-[#68DBFF]/50 rounded focus:ring-[#68DBFF] focus:ring-2"
                  />
                  <label htmlFor="disclaimer-checkbox" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                    {translations.nextSteps.termsCheckbox.before}
                    <a
                      href={`/${language}/terms-and-conditions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#68DBFF] hover:underline inline-block"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/${language}/terms-and-conditions`, "_blank", "noopener,noreferrer")
                      }}
                    >
                      {translations.nextSteps.termsCheckbox.link}
                    </a>
                    {translations.nextSteps.termsCheckbox.after}
                  </label>
                </div>
                <Button
                  onClick={() => setShowContactForm(true)}
                  disabled={!disclaimerAccepted}
                  className={`w-full font-semibold py-3 h-[50px] rounded-xl border-0 shadow-none transition-all duration-300 relative overflow-hidden group ${
                    disclaimerAccepted
                      ? "bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white hover:shadow-[0_0_35px_rgba(104,219,255,0.7)]"
                      : "bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {disclaimerAccepted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  )}
                  <Mail className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">{translations.nextSteps.requestQuote}</span>
                </Button>

                <Button
                  onClick={generateQuotePDF}
                  disabled={!disclaimerAccepted}
                  className={`w-full h-[50px] rounded-xl border text-[15px] font-medium transition-all duration-300 ${
                    disclaimerAccepted
                      ? "border-[#416679] bg-transparent hover:bg-[#0A1727] text-foreground"
                      : "border-gray-600 text-gray-400 bg-transparent opacity-50 cursor-not-allowed"
                  }`}
                  style={{ borderWidth: "1px" }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {translations.nextSteps.downloadPDF}
                </Button>

                <Button
                  onClick={shareQuote}
                  disabled={!disclaimerAccepted}
                  className={`w-full h-[50px] rounded-xl border text-[15px] font-medium transition-all duration-300 ${
                    disclaimerAccepted
                      ? "border-[#416679] bg-transparent hover:bg-[#0A1727] text-foreground"
                      : "border-gray-600 text-gray-400 bg-transparent opacity-50 cursor-not-allowed"
                  }`}
                  style={{ borderWidth: "1px" }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {translations.nextSteps.shareQuote}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Client Information */}
          {userData && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-black/15 backdrop-blur-md border-[#68DBFF]/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-[#68DBFF]" />
                    {translations.clientInfo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">{translations.clientInfo.name}</div>
                    <div className="text-white font-medium">
                      {userData.fullName || `${userData.firstName} ${userData.lastName}`.trim()}
                    </div>
                  </div>
                  {userData.company && (
                    <div>
                      <div className="text-sm text-gray-400">{translations.clientInfo.company}</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-[#68DBFF]" />
                        {userData.company}
                      </div>
                    </div>
                  )}
                  {userData.role && (
                    <div>
                      <div className="text-sm text-gray-400">{translations.clientInfo.role}</div>
                      <div className="text-white font-medium">{userData.role}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-400">{translations.clientInfo.email}</div>
                    <div className="text-white font-medium">{userData.email}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* What's Included Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-black/20 backdrop-blur-md border-[#68DBFF]/20">
              <CardHeader>
                <CardTitle className="text-white">{translations.whatsIncluded.title}</CardTitle>
                <p className="text-gray-400 text-sm">{translations.whatsIncluded.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {translations.whatsIncluded.items.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-white/3 backdrop-blur-sm rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          {showContactForm && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{translations.contactForm.title}</CardTitle>
                  <p className="text-gray-400 text-sm">{translations.contactForm.description}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        {translations.contactForm.fullName}
                      </Label>
                      <Input
                        id="name"
                        required
                        value={contactData.name}
                        onChange={(e) => setContactData((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">
                        {translations.contactForm.emailAddress}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={contactData.email}
                        onChange={(e) => setContactData((prev) => ({ ...prev, email: e.target.value }))}
                        className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-white">
                        {translations.contactForm.company}
                      </Label>
                      <Input
                        id="company"
                        value={contactData.company}
                        onChange={(e) => setContactData((prev) => ({ ...prev, company: e.target.value }))}
                        className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">
                        {translations.contactForm.phoneNumber}
                      </Label>
                      <Input
                        id="phone"
                        value={contactData.phone}
                        onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                        className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-white">
                        {translations.contactForm.additionalRequirements}
                      </Label>
                      <Textarea
                        id="message"
                        value={contactData.message}
                        onChange={(e) => setContactData((prev) => ({ ...prev, message: e.target.value }))}
                        className="bg-black/10 backdrop-blur-sm border-[#68DBFF]/30 text-white"
                        placeholder={translations.contactForm.placeholder}
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#68DBFF] to-[#4A9EFF] hover:from-[#5BC5FF] hover:to-[#3D8BFF] text-white font-semibold py-3"
                    >
                      {translations.contactForm.submitButton}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
        <Button
          onClick={onStartOver}
          variant="outline"
          className="flex items-center gap-2 border-[#68DBFF]/30 text-white hover:bg-[#68DBFF]/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {translations.navigation.startNewQuote}
        </Button>

        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="border-[#68DBFF]/30 text-white hover:bg-[#68DBFF]/10"
        >
          {translations.navigation.backToHome}
        </Button>
      </div>
    </div>
  )
}
