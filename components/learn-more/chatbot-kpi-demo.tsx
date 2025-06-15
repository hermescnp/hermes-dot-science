"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ChatMessage {
  id: number
  type: "user" | "bot"
  message: string
  timestamp: string
}

interface KPIData {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}

export function ChatbotKPIDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot",
      message: "Hello! I'm your AI business assistant. I can help you analyze your KPIs and business metrics.",
      timestamp: "10:30 AM",
    },
  ])

  const [currentKPIs, setCurrentKPIs] = useState<KPIData[]>([
    {
      title: "Revenue",
      value: "$124,500",
      change: "+12.5%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Active Users",
      value: "8,429",
      change: "+8.2%",
      trend: "up",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-2.1%",
      trend: "down",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: "Growth Rate",
      value: "15.8%",
      change: "+5.3%",
      trend: "up",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ])

  const [animatedValues, setAnimatedValues] = useState<string[]>(["$0", "0", "0%", "0%"])

  const [isTyping, setIsTyping] = useState(false)
  const [currentDemo, setCurrentDemo] = useState(0)
  const [highlightedKPI, setHighlightedKPI] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const demoScenarios = [
    {
      userMessage: "What's our revenue performance this month?",
      botResponse:
        "Your revenue is performing excellently! You've generated $124,500 this month, which is a 12.5% increase from last month. The growth is primarily driven by increased user engagement and improved conversion rates.",
      highlightKPI: "Revenue",
    },
    {
      userMessage: "Why is our conversion rate dropping?",
      botResponse:
        "I've analyzed the data and found that conversion rate dropped by 2.1% due to increased traffic from lower-intent sources. However, your absolute conversions are still up 6.3% due to higher traffic volume.",
      highlightKPI: "Conversion Rate",
    },
    {
      userMessage: "Show me our user growth trends",
      botResponse:
        "Great news! Your active user base has grown to 8,429 users, up 8.2% from last month. The growth rate is accelerating at 15.8%, indicating strong product-market fit and user retention.",
      highlightKPI: "Active Users",
    },
  ]

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start the first message quickly
    const firstMessageTimeout = setTimeout(() => {
      if (currentDemo === 0) {
        const scenario = demoScenarios[0]

        // Add user message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            message: scenario.userMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])

        // Show typing indicator and start scanning
        setIsTyping(true)
        setIsScanning(true)

        // Add bot response after delay
        setTimeout(() => {
          setIsTyping(false)
          setIsScanning(false)
          setHighlightedKPI(scenario.highlightKPI)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              message: scenario.botResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ])

          // Clear highlight after 3 seconds
          setTimeout(() => setHighlightedKPI(null), 3000)
        }, 2000)

        setCurrentDemo(1)
      }
    }, 2000) // Start first message after 2 seconds

    // Continue with regular interval for subsequent messages
    const interval = setInterval(() => {
      if (currentDemo > 0 && currentDemo < demoScenarios.length) {
        const scenario = demoScenarios[currentDemo]

        // Add user message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            message: scenario.userMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])

        // Show typing indicator and start scanning
        setIsTyping(true)
        setIsScanning(true)

        // Add bot response after delay
        setTimeout(() => {
          setIsTyping(false)
          setIsScanning(false)
          setHighlightedKPI(scenario.highlightKPI)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              message: scenario.botResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ])

          // Clear highlight after 3 seconds
          setTimeout(() => setHighlightedKPI(null), 3000)
        }, 2000)

        setCurrentDemo((prev) => prev + 1)
      } else if (currentDemo >= demoScenarios.length) {
        // Reset demo
        setTimeout(() => {
          setMessages([
            {
              id: 1,
              type: "bot",
              message: "Hello! I'm your AI business assistant. I can help you analyze your KPIs and business metrics.",
              timestamp: "10:30 AM",
            },
          ])
          setCurrentDemo(0)
          setHighlightedKPI(null)
        }, 3000)
      }
    }, 6000)

    return () => {
      clearTimeout(firstMessageTimeout)
      clearInterval(interval)
    }
  }, [currentDemo])

  useEffect(() => {
    if (chatContainerRef.current) {
      // Add a small delay to let the message animation start first
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }, 100) // Small delay to sync with message animation
    }
  }, [messages, isTyping])

  // Animate KPI values on mount and periodically update
  useEffect(() => {
    const animateValue = (
      start: number,
      end: number,
      duration: number,
      callback: (value: string) => void,
      prefix = "",
      suffix = "",
    ) => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const current = start + (end - start) * progress
        callback(prefix + Math.floor(current).toLocaleString() + suffix)
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }

    // Initial animation
    setTimeout(() => {
      animateValue(0, 124500, 2000, (value) => setAnimatedValues((prev) => [value, prev[1], prev[2], prev[3]]), "$")
      animateValue(0, 8429, 2000, (value) => setAnimatedValues((prev) => [prev[0], value, prev[2], prev[3]]))
      animateValue(0, 3.24, 2000, (value) => setAnimatedValues((prev) => [prev[0], prev[1], value + "%", prev[3]]))
      animateValue(0, 15.8, 2000, (value) => setAnimatedValues((prev) => [prev[0], prev[1], prev[2], value + "%"]))
    }, 500)

    // Periodic small updates to simulate real-time data
    const interval = setInterval(() => {
      setCurrentKPIs((prev) =>
        prev.map((kpi) => {
          const randomChange = (Math.random() - 0.5) * 0.1
          let newValue = kpi.value

          if (kpi.title === "Revenue") {
            const current = Number.parseInt(kpi.value.replace(/[$,]/g, ""))
            const updated = Math.max(current + Math.floor(randomChange * 1000), 100000)
            newValue = `$${updated.toLocaleString()}`
            animateValue(
              current,
              updated,
              1000,
              (value) => setAnimatedValues((prev) => [value, prev[1], prev[2], prev[3]]),
              "$",
            )
          } else if (kpi.title === "Active Users") {
            const current = Number.parseInt(kpi.value.replace(/,/g, ""))
            const updated = Math.max(current + Math.floor(randomChange * 100), 5000)
            newValue = updated.toLocaleString()
            animateValue(current, updated, 1000, (value) =>
              setAnimatedValues((prev) => [prev[0], value, prev[2], prev[3]]),
            )
          }

          return { ...kpi, value: newValue }
        }),
      )
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 cursor-default">
      {/* KPI Dashboard */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-4 relative"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 cursor-default">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Business Dashboard
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="ml-2 text-xs bg-[#68DBFF]/20 text-[#68DBFF] px-2 py-1 rounded-full"
            >
              Analyzing...
            </motion.div>
          )}
        </h3>

        {/* Scanning overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10"
            >
              <motion.div
                animate={{
                  background: [
                    "linear-gradient(90deg, transparent 0%, rgba(104, 219, 255, 0.1) 50%, transparent 100%)",
                    "linear-gradient(90deg, transparent 20%, rgba(104, 219, 255, 0.1) 70%, transparent 100%)",
                    "linear-gradient(90deg, transparent 40%, rgba(104, 219, 255, 0.1) 90%, transparent 100%)",
                    "linear-gradient(90deg, transparent 60%, rgba(104, 219, 255, 0.1) 100%, transparent 100%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-full h-full rounded-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3">
          {currentKPIs.map((kpi, index) => {
            const isHighlighted = highlightedKPI === kpi.title
            const isScanningCard = isScanning

            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isHighlighted ? 1.05 : 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  scale: { duration: 0.3 },
                }}
                whileHover={{ scale: isHighlighted ? 1.05 : 1.02 }}
                className="cursor-default relative"
              >
                <Card
                  className={`transition-all duration-300 ${
                    isHighlighted
                      ? "bg-[#68DBFF]/20 border-[#68DBFF] shadow-lg shadow-[#68DBFF]/20"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                  }`}
                >
                  <CardContent className="p-4 cursor-default relative overflow-hidden">
                    {/* Scanning effect for individual cards */}
                    <AnimatePresence>
                      {isScanningCard && (
                        <motion.div
                          initial={{ x: "-100%", opacity: 0 }}
                          animate={{ x: "100%", opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1,
                            delay: index * 0.2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatDelay: 1.5,
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#68DBFF]/20 to-transparent pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    {/* Highlight pulse effect */}
                    <AnimatePresence>
                      {isHighlighted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0.8, 1.2, 1.4],
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.5,
                            repeat: 2,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 bg-[#68DBFF]/10 rounded-lg pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <motion.div
                        className={`transition-colors duration-300 ${
                          isHighlighted ? "text-[#68DBFF]" : "text-gray-400"
                        }`}
                        animate={{
                          rotate: isHighlighted ? [0, 5, -5, 0] : [0, 5, -5, 0],
                          scale: isHighlighted ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          duration: isHighlighted ? 0.5 : 4,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: isHighlighted ? 0 : 8,
                        }}
                      >
                        {kpi.icon}
                      </motion.div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          kpi.trend === "up" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        <motion.div
                          animate={{ y: kpi.trend === "up" ? [-2, 0] : [0, 2] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                        >
                          {kpi.trend === "up" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                        </motion.div>
                        {kpi.change}
                      </div>
                    </div>
                    <motion.div
                      className={`font-semibold text-lg cursor-default transition-colors duration-300 relative z-10 ${
                        isHighlighted ? "text-[#A8EAFF]" : "text-white"
                      }`}
                      key={animatedValues[index]}
                      initial={{ scale: 1.1, color: "#60a5fa" }}
                      animate={{
                        scale: 1,
                        color: isHighlighted ? "#A8EAFF" : "#ffffff",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {animatedValues[index]}
                    </motion.div>
                    <div
                      className={`text-sm cursor-default transition-colors duration-300 relative z-10 ${
                        isHighlighted ? "text-[#D6F5FF]" : "text-gray-400"
                      }`}
                    >
                      {kpi.title}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Chatbot Interface */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 cursor-default">
          <Bot className="h-5 w-5 text-green-400" />
          AI Assistant
        </h3>

        <Card className="bg-gray-800/50 border-gray-700 h-80">
          <CardContent className="p-4 h-full flex flex-col cursor-default">
            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide scroll-smooth cursor-default"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                      opacity: { duration: 0.3 },
                      y: { duration: 0.4 },
                      scale: { duration: 0.3 },
                    }}
                    className={`flex gap-3 cursor-default ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 cursor-default">
                        <Bot className="h-4 w-4 text-green-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-3 cursor-default ${
                        message.type === "user" ? "bg-[#0A5E95] text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-sm cursor-default">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1 cursor-default">{message.timestamp}</p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 cursor-default">
                        <User className="h-4 w-4 text-blue-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex gap-3 justify-start cursor-default"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 cursor-default">
                      <Bot className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 cursor-default">
                      <div className="flex gap-1 cursor-default">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce cursor-default"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce cursor-default"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce cursor-default"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-600 pt-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-default">
                  Ask about your business metrics...
                </div>
                <button className="bg-[#0A5E95] rounded-lg px-4 py-2 text-white text-sm cursor-default">Send</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
