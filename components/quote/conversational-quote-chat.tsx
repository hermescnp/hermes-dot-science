"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, User, Clock, Send, HelpCircle } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

interface QuestionOption {
  id: string
  label: string
  basePrice: number
  hours: number
  description?: string
  conversationalText: string
  subOptions?: QuestionOption[]
}

interface ComplexityMultiplier {
  id: string
  label: string
  multiplier: number
  description: string
  conversationalText: string
}

interface Question {
  id: string
  botMessage: string
  followUpMessage?: string
  stage: string
  options?: QuestionOption[]
  multipliers?: ComplexityMultiplier[]
  requiresMultiplier?: boolean
  isCompanySizeQuestion?: boolean
}

interface CompanySize {
  id: string
  label: string
  description: string
  multiplier: number
  icon: string
}

interface ConversationalQuoteContent {
  companySizes: CompanySize[]
  questions: Question[]
  ui: {
    sliderLabels: {
      startup: string
      enterprise: string
    }
    buttons: {
      confirmCompanySize: string
      back: string
    }
    messages: {
      subQuestionPrompt: string
      complexityPrompt: string
      priceUpdate: string
      finalMessage: string
      explanationIntro: string
      greeting: string
    }
    headers: {
      currentEstimate: string
      estimatedHours: string
    }
  }
  explanations: { [key: string]: string }
}

interface ChatMessage {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: Date
  isTyping?: boolean
  isGreeting?: boolean
}

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

interface ConversationalQuoteChatProps {
  onComplete: (answers: Answer[]) => void
  onBack: () => void
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

export function ConversationalQuoteChat({ onComplete, onBack }: ConversationalQuoteChatProps) {
  const { language } = useLanguage()
  const [content, setContent] = useState<ConversationalQuoteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showMultipliers, setShowMultipliers] = useState(false)
  const [showSubOptions, setShowSubOptions] = useState(false)
  const [showCompanySizeSlider, setShowCompanySizeSlider] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [selectedMainOption, setSelectedMainOption] = useState<QuestionOption | null>(null)
  const [selectedCompanySize, setSelectedCompanySize] = useState(5) // Default to middle range
  const [companySizeMultiplier, setCompanySizeMultiplier] = useState(1.0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isExplainingOption, setIsExplainingOption] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [hasShownFirstQuestion, setHasShownFirstQuestion] = useState(false)
  const [shouldShowSlider, setShouldShowSlider] = useState(false)
  const [totalStepsCompleted, setTotalStepsCompleted] = useState(0)

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("quoteUserData")
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData)
          setUserData(parsedData)
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }
  }, [])

  // Load content based on language
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/content/conversational-quote?lang=${language}`)
        const data = await response.json()

        // Add greeting message template if it doesn't exist
        if (!data.ui.messages.greeting) {
          data.ui.messages.greeting =
            language === "es"
              ? "¡Hola {{name}}! Bienvenido/a a nuestra calculadora de cotización. Vamos a crear una cotización personalizada para {{company}}."
              : "Hello {{name}}! Welcome to our quote calculator. Let's create a personalized quote for {{company}}."
        }

        setContent(data)
      } catch (error) {
        console.error("Error loading conversational quote content:", error)
        // Fallback to English if there's an error
        try {
          const response = await fetch(`/api/content/conversational-quote?lang=en`)
          const data = await response.json()

          // Add greeting message template if it doesn't exist
          if (!data.ui.messages.greeting) {
            data.ui.messages.greeting =
              "Hello {{name}}! Welcome to our quote calculator. Let's create a personalized quote for {{company}}."
          }

          setContent(data)
        } catch (fallbackError) {
          console.error("Error loading fallback content:", fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [language])

  const currentQuestion = content?.questions[currentQuestionIndex]

  // Calculate total steps in the conversation
  const calculateTotalSteps = (): number => {
    if (!content) return 0

    let totalSteps = 0

    // Company size question counts as 1 step
    totalSteps += 1

    // Count each question and its potential complexity follow-up
    content.questions.forEach((question) => {
      // Main question counts as 1 step
      totalSteps += 1

      // If any option has sub-options, add 1 more step for the sub-option selection
      const hasSubOptions = question.options?.some((option) => option.subOptions && option.subOptions.length > 0)
      if (hasSubOptions) {
        totalSteps += 1
      }

      // If the question requires a complexity multiplier, add another step
      if (question.requiresMultiplier && question.multipliers && question.multipliers.length > 0) {
        totalSteps += 1
      }
    })

    return totalSteps
  }

  // Calculate progress with equal distribution, completing on the last answer
  const totalSteps = calculateTotalSteps()
  const stepSize = totalSteps > 1 ? 100 / (totalSteps - 1) : 100
  const progress = Math.min(totalStepsCompleted * stepSize, 100)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, showOptions, showMultipliers, showSubOptions, showCompanySizeSlider])

  // Effect to show slider when shouldShowSlider is true
  useEffect(() => {
    if (shouldShowSlider) {
      console.log("Setting showCompanySizeSlider to true")
      setShowCompanySizeSlider(true)
      setShouldShowSlider(false) // Reset the flag
    }
  }, [shouldShowSlider])

  useEffect(() => {
    // Start the conversation when content is loaded
    if (content && messages.length === 0 && currentQuestion) {
      setTimeout(() => {
        // If we have user data, start with a personalized greeting
        if (userData && userData.firstName) {
          const greeting = content.ui.messages.greeting
            .replace("{{name}}", userData.firstName)
            .replace("{{company}}", userData.company || "your company")

          // Add greeting with isGreeting flag
          const greetingMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "bot",
            content: greeting,
            timestamp: new Date(),
            isGreeting: true,
          }

          setMessages([greetingMessage])
          console.log("Added greeting message")

          // Set flag to show slider after the greeting (don't add first question here)
          setTimeout(() => {
            console.log("Setting shouldShowSlider flag")
            setShouldShowSlider(true)
          }, 2000)
        } else {
          // Default behavior without user data - just set flag to show slider
          console.log("Setting shouldShowSlider flag (no greeting)")
          setShouldShowSlider(true)
        }
      }, 1000)
    }
  }, [content, messages.length, currentQuestion, userData])

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderValue(e)
  }

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderValue(e)
    }
  }

  const handleSliderMouseUp = () => {
    setIsDragging(false)
  }

  const updateSliderValue = (e: React.MouseEvent) => {
    if (!sliderRef.current || !content) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newValue = Math.round(percentage * (content.companySizes.length - 1))
    setSelectedCompanySize(newValue)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && sliderRef.current && content) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, x / rect.width))
        const newValue = Math.round(percentage * (content.companySizes.length - 1))
        setSelectedCompanySize(newValue)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, content])

  const addBotMessage = (
    messageContent: string,
    delay = 0,
    isFollowUp = false,
    isSubQuestion = false,
    questionIndex?: number,
  ) => {
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "bot",
          content: messageContent,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, newMessage])
        setIsTyping(false)

        setTimeout(() => {
          // Use the provided questionIndex or fall back to currentQuestionIndex
          const qIndex = questionIndex !== undefined ? questionIndex : currentQuestionIndex

          // Reset all UI states first
          setShowOptions(false)
          setShowMultipliers(false)
          setShowSubOptions(false)
          setShowCompanySizeSlider(false)

          if (isSubQuestion) {
            setShowSubOptions(true)
          } else if (isFollowUp) {
            setShowMultipliers(true)
          } else if (qIndex > 0) {
            // Show regular options for questions after the first one
            setShowOptions(true)
          }

          // Scroll after options appear
          scrollToBottom()
        }, 1000)
      }, 1500) // Typing delay
    }, delay)
  }

  // Separate function for adding explanation messages that doesn't interfere with questionnaire flow
  const addExplanationMessage = (messageContent: string) => {
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: `explanation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "bot",
          content: messageContent,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, newMessage])
        setIsTyping(false)
        scrollToBottom()
      }, 1500) // Typing delay
    }, 0)
  }

  const addUserMessage = (messageContent: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleCompanySizeSubmit = () => {
    if (!content) return

    const selectedSize = content.companySizes[selectedCompanySize]
    setCompanySizeMultiplier(selectedSize.multiplier)
    addUserMessage(`${selectedSize.icon} ${selectedSize.label} - ${selectedSize.description}`)
    setShowCompanySizeSlider(false)
    setIsWaitingForResponse(true)

    // Create a special answer for company size selection
    const companySizeAnswer: Answer = {
      questionId: "company-size",
      optionId: selectedSize.id,
      multiplierId: undefined,
      basePrice: 0,
      finalPrice: 0,
      hours: 0,
      stepDetails: {
        question: {
          id: "company-size",
          stage: "Company Profile",
          botMessage: "Before we dive into your AI agent requirements, I'd love to understand the scale we're working with. What's the size of your organization?",
          followUpMessage: undefined,
        },
        selectedOption: {
          id: selectedSize.id,
          label: selectedSize.label,
          description: selectedSize.description,
          conversationalText: `${selectedSize.icon} ${selectedSize.label} - ${selectedSize.description}`,
          basePrice: 0,
          hours: 0,
        },
        selectedMultiplier: undefined,
        pricing: {
          basePrice: 0,
          priceAfterComplexity: 0,
          companySizeMultiplier: selectedSize.multiplier,
          finalPrice: 0,
        },
        companySize: selectedCompanySize !== undefined ? {
          id: content.companySizes[selectedCompanySize].id,
          label: content.companySizes[selectedCompanySize].label,
          description: content.companySizes[selectedCompanySize].description,
          multiplier: content.companySizes[selectedCompanySize].multiplier,
          icon: content.companySizes[selectedCompanySize].icon
        } : undefined
      },
    }

    // Add company size answer to the answers array
    const newAnswers = [...answers, companySizeAnswer]
    setAnswers(newAnswers)

    // Increment steps completed (company size selection counts as 1 step)
    setTotalStepsCompleted((prev) => prev + 1)

    // Move to next question
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1)
      setIsWaitingForResponse(false)
      setShowOptions(false)
      setShowMultipliers(false)
      setShowSubOptions(false)
      setShowCompanySizeSlider(false)
      if (content.questions[currentQuestionIndex + 1]) {
        addBotMessage(content.questions[currentQuestionIndex + 1].botMessage, 0, false, false, currentQuestionIndex + 1)
      }
    }, 2000)
  }

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return

    const option = currentQuestion.options?.find((opt) => opt.id === optionId)
    if (!option) return

    // Check if this option has sub-options
    if (option.subOptions && option.subOptions.length > 0) {
      setSelectedMainOption(option)
      addUserMessage(option.conversationalText)
      setShowOptions(false)
      setIsWaitingForResponse(true)

      // Increment steps completed (main option selection with sub-options counts as 1 step)
      setTotalStepsCompleted((prev) => prev + 1)

      // Show sub-options
      setTimeout(() => {
        addBotMessage(
          content?.ui.messages.subQuestionPrompt ||
            "Perfect! Now let me get more specific - which of these best describes what you need?",
          0,
          false,
          true,
        )
        setIsWaitingForResponse(false)
      }, 2000)
      return
    }

    // Regular option without sub-options
    setSelectedOption(optionId)
    addUserMessage(option.conversationalText)
    setShowOptions(false)
    setIsWaitingForResponse(true)

    // Increment steps completed (main question answer counts as 1 step)
    setTotalStepsCompleted((prev) => prev + 1)

    if (currentQuestion.requiresMultiplier && currentQuestion.multipliers) {
      // Show follow-up question for complexity
      setTimeout(() => {
        setShowMultipliers(false)
        addBotMessage(
          currentQuestion.followUpMessage ||
            content?.ui.messages.complexityPrompt ||
            "Great! Now let me ask about the complexity level:",
          0,
          true,
        )
        setIsWaitingForResponse(false)
      }, 2000)
    } else {
      // Process answer and move to next question
      processAnswer(optionId, "")
    }
  }

  const handleSubOptionSelect = (subOptionId: string) => {
    if (!selectedMainOption) return

    const subOption = selectedMainOption.subOptions?.find((opt) => opt.id === subOptionId)
    if (!subOption) return

    setSelectedOption(subOptionId)
    addUserMessage(subOption.conversationalText)
    setShowSubOptions(false)
    setIsWaitingForResponse(true)

    // Increment steps completed (sub-option selection counts as 1 step)
    setTotalStepsCompleted((prev) => prev + 1)

    if (currentQuestion?.requiresMultiplier && currentQuestion.multipliers) {
      // Show follow-up question for complexity
      setTimeout(() => {
        setShowMultipliers(false)
        addBotMessage(
          currentQuestion.followUpMessage ||
            content?.ui.messages.complexityPrompt ||
            "Great! Now let me ask about the complexity level:",
          0,
          true,
        )
        setIsWaitingForResponse(false)
      }, 2000)
    } else {
      // Process answer and move to next question
      processAnswer(subOptionId, "")
    }
  }

  const handleMultiplierSelect = (multiplierId: string) => {
    if (!currentQuestion) return

    const multiplier = currentQuestion.multipliers?.find((mult) => mult.id === multiplierId)
    if (!multiplier) return

    addUserMessage(multiplier.conversationalText)
    setShowMultipliers(false)
    setIsWaitingForResponse(true)

    // Increment steps completed (complexity selection counts as 1 step)
    setTotalStepsCompleted((prev) => prev + 1)

    processAnswer(selectedOption, multiplierId)
  }

  const handleQuoteComplete = () => {
    // Personalize the final message if we have user data
    let finalMessage = content?.ui.messages.finalMessage || "Thank you! Your quote calculation is complete."
    if (userData && userData.firstName) {
      finalMessage = finalMessage.replace("Thank you", `Thank you, ${userData.firstName}`)
      finalMessage = finalMessage.replace("Gracias", `Gracias, ${userData.firstName}`)
    }

    addBotMessage(finalMessage)
    setTimeout(() => {
      onComplete(answers)
    }, 2000)
  }

  const processAnswer = (optionId: string, multiplierId: string) => {
    if (!currentQuestion || !content) return

    // Find the option (could be in main options or sub-options)
    let option: QuestionOption | undefined

    // First check main options
    option = currentQuestion.options?.find((opt) => opt.id === optionId)

    // If not found, check sub-options
    if (!option && currentQuestion.options) {
      for (const mainOption of currentQuestion.options) {
        if (mainOption.subOptions) {
          option = mainOption.subOptions.find((subOpt) => subOpt.id === optionId)
          if (option) break
        }
      }
    }

    if (!option) return

    const multiplierItem = currentQuestion.multipliers?.find((mult) => mult.id === multiplierId)

    const basePrice = option.basePrice
    const priceAfterComplexity = multiplierItem ? Math.round(basePrice * multiplierItem.multiplier) : basePrice
    const finalPrice = Math.round(priceAfterComplexity * companySizeMultiplier)
    const hours = option.hours

    // Create detailed step information that matches the results page structure
    const stepDetails = {
      question: {
        id: currentQuestion.id,
        stage: currentQuestion.stage,
        botMessage: currentQuestion.botMessage,
        followUpMessage: currentQuestion.followUpMessage
      },
      selectedOption: {
        id: option.id,
        label: option.label,
        description: option.description,
        conversationalText: option.conversationalText,
        basePrice: option.basePrice,
        hours: option.hours
      },
      selectedMultiplier: multiplierItem ? {
        id: multiplierItem.id,
        label: multiplierItem.label,
        description: multiplierItem.description,
        conversationalText: multiplierItem.conversationalText,
        multiplier: multiplierItem.multiplier
      } : undefined,
      pricing: {
        basePrice: basePrice,
        priceAfterComplexity: priceAfterComplexity,
        companySizeMultiplier: companySizeMultiplier,
        finalPrice: finalPrice
      },
      companySize: selectedCompanySize !== undefined ? {
        id: content.companySizes[selectedCompanySize].id,
        label: content.companySizes[selectedCompanySize].label,
        description: content.companySizes[selectedCompanySize].description,
        multiplier: content.companySizes[selectedCompanySize].multiplier,
        icon: content.companySizes[selectedCompanySize].icon
      } : undefined
    }

    // Create the answer with detailed step information
    const answer: Answer = {
      questionId: currentQuestion.id,
      optionId: optionId,
      multiplierId: multiplierId,
      basePrice: basePrice,
      finalPrice: finalPrice,
      hours: hours,
      stepDetails: stepDetails
    }

    setAnswers((prev) => [...prev, answer])
    setTotalPrice((prev) => prev + finalPrice)
    setTotalStepsCompleted((prev) => prev + 1)

    // User message was already added in the selection handlers, so we don't need to add it again
    setIsWaitingForResponse(true)

    // Move to next question
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1)
      setIsWaitingForResponse(false)
      setShowOptions(false)
      setShowMultipliers(false)
      setShowSubOptions(false)
      setShowCompanySizeSlider(false)

      if (content.questions[currentQuestionIndex + 1]) {
        addBotMessage(content.questions[currentQuestionIndex + 1].botMessage, 0, false, false, currentQuestionIndex + 1)
      } else {
        // Quote calculation is complete
        handleQuoteComplete()
      }
    }, 1000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Show loading state
  if (loading || !content) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const handleExplanationRequest = (optionId: string, isSubOption = false) => {
    let option: QuestionOption | undefined

    if (isSubOption && selectedMainOption) {
      option = selectedMainOption.subOptions?.find((opt) => opt.id === optionId)
    } else {
      option = currentQuestion?.options?.find((opt) => opt.id === optionId)
    }

    if (!option || !content) return

    setIsExplainingOption(true)
    setShowOptions(false)
    setShowSubOptions(false)
    setShowMultipliers(false)

    const explanation =
      content.explanations[optionId] ||
      "This option represents a specific approach that may fit your particular business situation and needs."

    const introMessage = content.ui.messages.explanationIntro.replace("{{option}}", option.label)

    setTimeout(() => {
      addExplanationMessage(`${introMessage}

${explanation}`)

      setTimeout(() => {
        setIsExplainingOption(false)
        if (isSubOption) {
          setShowSubOptions(true)
        } else {
          setShowOptions(true)
        }
      }, 2000)
    }, 1500)
  }

  const handleMultiplierExplanation = (multiplierId: string) => {
    const multiplier = currentQuestion?.multipliers?.find((mult) => mult.id === multiplierId)

    if (!multiplier || !content) return

    setIsExplainingOption(true)
    setShowOptions(false)
    setShowSubOptions(false)
    setShowMultipliers(false)

    const explanation =
      content.explanations[multiplierId] ||
      "This option represents a specific approach that may fit your particular business situation and needs."

    const introMessage = content.ui.messages.explanationIntro.replace("{{option}}", multiplier.label)

    setTimeout(() => {
      addExplanationMessage(`${introMessage}

${explanation}`)

      setTimeout(() => {
        setIsExplainingOption(false)
        setShowMultipliers(true)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Fixed at the top */}
      <div className="w-full border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between py-6 px-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 border-[#68DBFF]/30 text-white hover:bg-[#68DBFF]/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{content.ui.buttons.back}</span>
          </Button>

          {/* Logotype in center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center justify-center">
              <Image
                src="/images/hermes-logo.svg"
                alt="Hermes Dot Science"
                width={240}
                height={60}
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-center hidden sm:block">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">{content.ui.headers.currentEstimate}</div>
              <div className="flex items-center gap-1 sm:gap-2 text-lg sm:text-2xl font-bold text-[#68DBFF]">
                <span className="text-xs sm:text-sm">US$</span>
                <span className="text-sm sm:text-2xl">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/20 hidden lg:block" />
            <div className="text-center hidden lg:block">
              <div className="text-sm text-gray-400 mb-1">{content.ui.headers.estimatedHours}</div>
              <div className="text-lg font-semibold text-white flex items-center gap-1">
                <Clock className="h-4 w-4 text-[#68DBFF]" />
                {answers.reduce((sum, ans) => sum + ans.hours, 0).toLocaleString()}h
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar at bottom of header */}
        <div className="w-full">
          <Progress value={progress} className="bg-gray-800 rounded-none" />
        </div>
      </div>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 48px, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 48px, black 100%)",
        }}
      >
        <div className="container max-w-4xl mx-auto px-6 py-6">
          {/* Chat Messages */}
          <div className="relative">
            <div className="h-full overflow-y-auto py-6 space-y-6 scrollbar-hide">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot Avatar */}
                  {message.type === "bot" && (
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      <Image
                        src="/images/hermes-logo-icon.svg"
                        alt="Hermes Bot"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                    <Card
                      className={`${
                        message.type === "bot"
                          ? "bg-[#0B1E33] border-[#68DBFF]/20"
                          : "bg-gradient-to-r from-[#68DBFF]/30 to-[#003564]/70 border-[#68DBFF]/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <p className="text-white leading-relaxed">{message.content}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {message.type === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  {/* Typing Indicator Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    <Image
                      src="/images/hermes-logo-icon.svg"
                      alt="Hermes Bot"
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <Card className="bg-black/40 border-[#68DBFF]/20">
                    <CardContent className="p-4">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-[#68DBFF] rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-[#68DBFF] rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-[#68DBFF] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Company Size Slider */}
              {showCompanySizeSlider && !isWaitingForResponse && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-2xl">
                    <CardContent className="p-0">
                      {/* Company Size Display */}
                      <div className="text-center mb-8">
                        <motion.div
                          className="text-6xl mb-4"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                        >
                          {content.companySizes[selectedCompanySize].icon}
                        </motion.div>
                        <motion.div
                          key={`company-size-${content.companySizes[selectedCompanySize].id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#315F8C] to-[#68DBFF] mb-2"
                        >
                          {content.companySizes[selectedCompanySize].label}
                        </motion.div>
                        <div className="text-gray-300 text-lg">
                          {content.companySizes[selectedCompanySize].description}
                        </div>
                      </div>

                      {/* Gamified Slider Track */}
                      <div className="relative mb-10">
                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-[#68DBFF] rounded-full"></div>
                            {content.ui.sliderLabels.startup}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-[#315F8C] rounded-full"></div>
                            {content.ui.sliderLabels.enterprise}
                          </span>
                        </div>

                        {/* Slider Track with Glow Effect */}
                        <div
                          ref={sliderRef}
                          className="relative h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full cursor-pointer select-none shadow-inner"
                          onMouseDown={handleSliderMouseDown}
                          onMouseMove={handleSliderMouseMove}
                          onMouseUp={handleSliderMouseUp}
                        >
                          {/* Progress Fill with Animated Glow */}
                          <div
                            className="absolute h-full bg-gradient-to-r from-[#315F8C] to-[#68DBFF] rounded-full transition-all duration-300 shadow-lg"
                            style={{
                              width: `${(selectedCompanySize / (content.companySizes.length - 1)) * 100}%`,
                              boxShadow: "0 0 20px rgba(104, 219, 255, 0.5)",
                            }}
                          />

                          {/* Animated Particles */}
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                animate={{
                                  x: [0, sliderRef.current?.offsetWidth || 300],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.7,
                                  ease: "linear",
                                }}
                                style={{
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            ))}
                          </div>

                          {/* Slider Handle with Pulse Effect */}
                          <motion.div
                            className="absolute w-8 h-8 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-xl border-2 border-[#68DBFF] cursor-grab active:cursor-grabbing"
                            style={{
                              left: `calc(${(selectedCompanySize / (content.companySizes.length - 1)) * 100}% - 16px)`,
                              top: "-8px", // This centers the 32px handle on the 16px track (16px - 32px) / 2 = -8px
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{
                              scale: isDragging ? 1.3 : 1,
                              boxShadow: isDragging
                                ? "0 0 30px rgba(104, 219, 255, 0.8)"
                                : "0 0 15px rgba(104, 219, 255, 0.4)",
                            }}
                          >
                            {/* Inner Glow */}
                            <div className="absolute inset-1 bg-gradient-to-br from-[#315F8C] to-[#68DBFF] rounded-full opacity-20"></div>

                            {/* Pulse Ring */}
                            <motion.div
                              className="absolute border-2 border-[#68DBFF] rounded-full"
                              style={{
                                inset: "-2px", // Expand slightly beyond the handle
                              }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            />
                          </motion.div>
                        </div>

                        {/* Size Indicators */}
                        <div className="flex justify-between mt-4 px-0 relative">
                          {content.companySizes.map((size, index) => {
                            // Calculate position as percentage of the slider width
                            const position = `${(index / (content.companySizes.length - 1)) * 100}%`
                            return (
                              <motion.div
                                key={size.id}
                                className={`absolute w-2 h-2 rounded-full transition-all duration-300 ${
                                  index <= selectedCompanySize
                                    ? "bg-gradient-to-r from-[#315F8C] to-[#68DBFF] shadow-lg"
                                    : "bg-gray-600"
                                }`}
                                style={{
                                  left: position,
                                  transform: "translateX(-50%)",
                                }}
                                animate={{
                                  scale: index === selectedCompanySize ? 1.5 : 1,
                                  boxShadow:
                                    index === selectedCompanySize
                                      ? "0 0 10px rgba(104, 219, 255, 0.8)"
                                      : "0 0 0px rgba(104, 219, 255, 0)",
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>

                      {/* Confirm Button - Styled like Request Demo */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex justify-center"
                      >
                        <Button
                          onClick={handleCompanySizeSubmit}
                          className="relative overflow-hidden group bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white font-semibold px-8 py-6 h-[60px] rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] transition-all duration-300 text-[15px]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                          <div className="flex items-center gap-3 relative z-10">
                            <Send className="h-5 w-5 text-white" />
                            <span>{content.ui.buttons.confirmCompanySize}</span>
                          </div>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Main Options */}
              {showOptions &&
                !isWaitingForResponse &&
                !showMultipliers &&
                !showSubOptions &&
                !isExplainingOption &&
                currentQuestion?.options && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex gap-3 items-stretch">
                          <Button
                            onClick={() => handleOptionSelect(option.id)}
                            variant="outline"
                            className="flex-1 p-6 h-auto justify-start text-left border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-300 hover:text-white hover:bg-[#68DBFF]/10 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-lg mb-1">{option.label}</div>
                              {option.description && <div className="text-sm text-gray-400">{option.description}</div>}
                            </div>
                          </Button>
                          <Button
                            onClick={() => handleExplanationRequest(option.id)}
                            variant="outline"
                            className="min-w-[40px] min-h-[40px] px-2 py-2 border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-400 hover:text-[#68DBFF] hover:bg-[#68DBFF]/10 transition-all duration-300"
                            title="Get detailed explanation"
                          >
                            <HelpCircle style={{ width: "24px", height: "24px" }} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

              {/* Sub Options */}
              {showSubOptions &&
                !isWaitingForResponse &&
                !isExplainingOption &&
                selectedMainOption &&
                selectedMainOption.subOptions && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {selectedMainOption.subOptions.map((subOption, index) => (
                      <motion.div
                        key={subOption.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex gap-3 items-stretch">
                          <Button
                            onClick={() => handleSubOptionSelect(subOption.id)}
                            variant="outline"
                            className="flex-1 p-6 h-auto justify-start text-left border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-300 hover:text-white hover:bg-[#68DBFF]/10 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-lg mb-1">{subOption.label}</div>
                              {subOption.description && (
                                <div className="text-sm text-gray-400">{subOption.description}</div>
                              )}
                            </div>
                          </Button>
                          <Button
                            onClick={() => handleExplanationRequest(subOption.id, true)}
                            variant="outline"
                            className="min-w-[40px] min-h-[40px] px-2 py-2 border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-400 hover:text-[#68DBFF] hover:bg-[#68DBFF]/10 transition-all duration-300"
                            title="Get detailed explanation"
                          >
                            <HelpCircle style={{ width: "24px", height: "24px" }} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

              {/* Multiplier Options */}
              {showMultipliers && !isWaitingForResponse && !isExplainingOption && currentQuestion?.multipliers && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {currentQuestion.multipliers.map((multiplier, index) => (
                    <motion.div
                      key={multiplier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex gap-3 items-stretch">
                        <Button
                          onClick={() => handleMultiplierSelect(multiplier.id)}
                          variant="outline"
                          className="flex-1 p-4 h-auto justify-start text-left border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-300 hover:text-white hover:bg-[#68DBFF]/10 transition-all duration-300"
                        >
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{multiplier.label}</div>
                            <div className="text-sm text-gray-400">{multiplier.description}</div>
                          </div>
                        </Button>
                        <Button
                          onClick={() => handleMultiplierExplanation(multiplier.id)}
                          variant="outline"
                          className="min-w-[40px] min-h-[40px] px-2 py-2 border-2 border-gray-600 hover:border-[#68DBFF]/50 bg-black/20 text-gray-400 hover:text-[#68DBFF] hover:bg-[#68DBFF]/10 transition-all duration-300"
                          title="Get detailed explanation"
                        >
                          <HelpCircle style={{ width: "24px", height: "24px" }} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
