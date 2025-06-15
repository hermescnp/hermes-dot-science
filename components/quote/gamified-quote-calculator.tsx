"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, DollarSign, Zap } from "lucide-react"

interface QuestionOption {
  id: string
  label: string
  basePrice: number
  hours: number
  description?: string
}

interface ComplexityMultiplier {
  id: string
  label: string
  multiplier: number
  description: string
}

interface Question {
  id: string
  title: string
  subtitle: string
  stage: string
  options: QuestionOption[]
  multipliers?: ComplexityMultiplier[]
  requiresMultiplier?: boolean
}

const questions: Question[] = [
  {
    id: "workflows",
    title: "Workflows & Systems Analysis",
    subtitle: "How many distinct workflows need end-to-end process and systems analysis?",
    stage: "Stage 3",
    options: [
      { id: "1-2", label: "1–2 workflows", basePrice: 7500, hours: 150, description: "≈150 hrs at $50/hr" },
      { id: "3-5", label: "3–5 workflows", basePrice: 15000, hours: 300, description: "≈300 hrs" },
      { id: "6+", label: "6+ workflows", basePrice: 22500, hours: 450, description: "≈450 hrs" },
    ],
    multipliers: [
      { id: "low", label: "Low Complexity", multiplier: 0.8, description: "Standard, well-documented processes" },
      { id: "medium", label: "Medium Complexity", multiplier: 1.0, description: "Multi-system, mixed data sources" },
      { id: "high", label: "High Complexity", multiplier: 1.3, description: "Custom protocols, sensitive data" },
    ],
    requiresMultiplier: true,
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base Curation",
    subtitle: "How many data sources must be ingested, cleaned, and structured?",
    stage: "Stage 4",
    options: [
      { id: "1-3", label: "1–3 sources", basePrice: 7500, hours: 150, description: "≈150 hrs" },
      { id: "4-6", label: "4–6 sources", basePrice: 15000, hours: 300, description: "≈300 hrs" },
      { id: "7+", label: "7+ sources", basePrice: 25000, hours: 500, description: "≈500 hrs" },
    ],
    multipliers: [
      { id: "structured", label: "Structured Data", multiplier: 0.8, description: "Databases, spreadsheets" },
      { id: "semi-structured", label: "Semi-structured Data", multiplier: 1.0, description: "XML, JSON files" },
      { id: "unstructured", label: "Unstructured Data", multiplier: 1.3, description: "PDFs, multimedia content" },
    ],
    requiresMultiplier: true,
  },
  {
    id: "implementation",
    title: "Implementation / Development",
    subtitle: "Which AI agent type best matches your requirements?",
    stage: "Stage 5",
    options: [
      { id: "basic-faq", label: "Basic FAQ/Chatbot", basePrice: 15000, hours: 300, description: "~300 hrs" },
      {
        id: "nlp-conversational",
        label: "NLP-powered Conversational Agent",
        basePrice: 35000,
        hours: 700,
        description: "~700 hrs",
      },
      {
        id: "voice-enabled",
        label: "Voice-enabled Agent (STT/TTS)",
        basePrice: 50000,
        hours: 1000,
        description: "~1,000 hrs",
      },
      {
        id: "backend-automation",
        label: "Backend Process Automation",
        basePrice: 60000,
        hours: 1200,
        description: "~1,200 hrs",
      },
      {
        id: "enterprise-grade",
        label: "Enterprise-grade w/ Continual ML Retraining",
        basePrice: 100000,
        hours: 2000,
        description: "~2,000 hrs",
      },
      {
        id: "multi-agent",
        label: "Multi-agent System w/ Planning",
        basePrice: 150000,
        hours: 3000,
        description: "~3,000 hrs",
      },
    ],
  },
  {
    id: "integrations",
    title: "Third-Party Integrations",
    subtitle: "How many external systems (CRM, ERP, custom APIs) to integrate?",
    stage: "Stage 6",
    options: [
      { id: "1-2", label: "1–2 systems", basePrice: 10000, hours: 200, description: "~200 hrs" },
      { id: "3-4", label: "3–4 systems", basePrice: 20000, hours: 400, description: "~400 hrs" },
      { id: "5+", label: "5+ systems", basePrice: 25000, hours: 500, description: "~500 hrs" },
    ],
    multipliers: [
      { id: "standard", label: "Standard APIs", multiplier: 1.0, description: "Well-documented REST/GraphQL APIs" },
      {
        id: "custom",
        label: "Custom/On-prem Connectors",
        multiplier: 1.3,
        description: "Legacy systems, custom protocols",
      },
    ],
    requiresMultiplier: true,
  },
  {
    id: "qa",
    title: "Quality Assurance",
    subtitle: "What level of QA/testing is required?",
    stage: "Stage 7",
    options: [
      { id: "basic", label: "Unit & Integration Only", basePrice: 5000, hours: 100, description: "~100 hrs" },
      {
        id: "full",
        label: "Full Test Suite",
        basePrice: 10000,
        hours: 200,
        description: "Stress, performance, regression (~200 hrs)",
      },
      { id: "continuous", label: "Continuous QA Automation", basePrice: 15000, hours: 300, description: "~300 hrs" },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Monitoring",
    subtitle: "Select your retainer period for ongoing support and KPI reporting.",
    stage: "Stage 8",
    options: [
      { id: "3-months", label: "3 months", basePrice: 12000, hours: 240, description: "≈240 hrs" },
      { id: "6-months", label: "6 months", basePrice: 24000, hours: 480, description: "≈480 hrs" },
      { id: "12-months", label: "12 months", basePrice: 48000, hours: 960, description: "≈960 hrs" },
    ],
    multipliers: [
      { id: "basic", label: "Basic KPI Reporting", multiplier: 0.8, description: "Uptime, error rates" },
      {
        id: "advanced",
        label: "Advanced KPI Reporting",
        multiplier: 1.2,
        description: "User satisfaction, cost savings",
      },
    ],
    requiresMultiplier: true,
  },
]

interface Answer {
  questionId: string
  optionId: string
  multiplierId?: string
  basePrice: number
  finalPrice: number
  hours: number
}

interface GamifiedQuoteCalculatorProps {
  onComplete: (answers: Answer[]) => void
  onBack: () => void
}

export function GamifiedQuoteCalculator({ onComplete, onBack }: GamifiedQuoteCalculatorProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [selectedMultiplier, setSelectedMultiplier] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [showPriceAnimation, setShowPriceAnimation] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  useEffect(() => {
    const total = answers.reduce((sum, answer) => sum + answer.finalPrice, 0)
    setTotalPrice(total)
  }, [answers])

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
    if (!currentQuestion.requiresMultiplier) {
      setSelectedMultiplier("")
    }
  }

  const handleMultiplierSelect = (multiplierId: string) => {
    setSelectedMultiplier(multiplierId)
  }

  const canProceed = () => {
    if (!selectedOption) return false
    if (currentQuestion.requiresMultiplier && !selectedMultiplier) return false
    return true
  }

  const handleNext = () => {
    if (!canProceed()) return

    const option = currentQuestion.options.find((opt) => opt.id === selectedOption)!
    const multiplier = currentQuestion.multipliers?.find((mult) => mult.id === selectedMultiplier)

    const basePrice = option.basePrice
    const finalPrice = multiplier ? Math.round(basePrice * multiplier.multiplier) : basePrice

    const answer: Answer = {
      questionId: currentQuestion.id,
      optionId: selectedOption,
      multiplierId: selectedMultiplier || undefined,
      basePrice,
      finalPrice,
      hours: option.hours,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    // Show price animation
    setShowPriceAnimation(true)
    setTimeout(() => setShowPriceAnimation(false), 1000)

    // Reset selections
    setSelectedOption("")
    setSelectedMultiplier("")

    if (isLastQuestion) {
      setTimeout(() => onComplete(newAnswers), 1500)
    } else {
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 1500)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Remove the last answer
      const newAnswers = answers.slice(0, -1)
      setAnswers(newAnswers)
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelectedOption("")
      setSelectedMultiplier("")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="container max-w-4xl mx-auto px-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-[#68DBFF] to-[#4A9EFF] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </Progress>
      </div>

      {/* Price Display */}
      <motion.div
        className="text-center mb-12"
        animate={showPriceAnimation ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#68DBFF]/20 to-[#4A9EFF]/20 rounded-full border border-[#68DBFF]/30">
          <DollarSign className="h-5 w-5 text-[#68DBFF]" />
          <span className="text-2xl font-bold text-white">{formatPrice(totalPrice)}</span>
          {showPriceAnimation && <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />}
        </div>
        <p className="text-sm text-gray-400 mt-2">Current Estimate</p>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-black/40 backdrop-blur-sm border-[#68DBFF]/20 mb-8">
            <CardContent className="p-8">
              {/* Question Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#68DBFF]/20 rounded-full text-[#68DBFF] text-sm font-medium mb-4">
                  <CheckCircle className="h-4 w-4" />
                  {currentQuestion.stage}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{currentQuestion.title}</h2>
                <p className="text-xl text-gray-300">{currentQuestion.subtitle}</p>
              </div>

              {/* Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option) => (
                  <motion.div key={option.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={() => handleOptionSelect(option.id)}
                      className={`w-full p-6 h-auto justify-between text-left border-2 transition-all duration-300 ${
                        selectedOption === option.id
                          ? "border-[#68DBFF] bg-[#68DBFF]/10 text-white"
                          : "border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-300 hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-lg">{option.label}</div>
                        {option.description && <div className="text-sm text-gray-400 mt-1">{option.description}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{formatPrice(option.basePrice)}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Multipliers */}
              {currentQuestion.requiresMultiplier && selectedOption && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Select Complexity Level:</h3>
                  {currentQuestion.multipliers!.map((multiplier) => {
                    const selectedOptionData = currentQuestion.options.find((opt) => opt.id === selectedOption)!
                    const adjustedPrice = Math.round(selectedOptionData.basePrice * multiplier.multiplier)

                    return (
                      <motion.div key={multiplier.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          onClick={() => handleMultiplierSelect(multiplier.id)}
                          className={`w-full p-4 h-auto justify-between text-left border-2 transition-all duration-300 ${
                            selectedMultiplier === multiplier.id
                              ? "border-[#68DBFF] bg-[#68DBFF]/10 text-white"
                              : "border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-300 hover:text-white"
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{multiplier.label}</div>
                            <div className="text-sm text-gray-400 mt-1">{multiplier.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">×{multiplier.multiplier}</div>
                            <div className="font-bold">{formatPrice(adjustedPrice)}</div>
                          </div>
                        </Button>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
          className="flex items-center gap-2 border-[#68DBFF]/30 text-white hover:bg-[#68DBFF]/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentQuestionIndex === 0 ? "Back to Learn More" : "Previous"}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex items-center gap-2 px-8 py-3 transition-all duration-300 ${
            canProceed()
              ? "bg-gradient-to-r from-[#68DBFF] to-[#4A9EFF] hover:from-[#5BC5FF] hover:to-[#3D8BFF] text-white hover:shadow-[0_0_20px_rgba(104,219,255,0.5)]"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLastQuestion ? "Complete Quote" : "Next Question"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
