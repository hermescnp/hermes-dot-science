"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, FileText, Menu, X } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface TermsSection {
  title: string
  content: string
}

interface TermsData {
  title: string
  lastUpdated: string
  introduction: {
    content: string
  }
  sections: TermsSection[]
}

export function TermsAndConditionsTemplate({ lang = "en" }: { lang?: string }) {
  const [termsData, setTermsData] = useState<TermsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>("introduction")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`/api/content/terms-and-conditions?lang=${lang}`)
        if (!response.ok) {
          throw new Error("Failed to fetch terms and conditions")
        }
        const data = await response.json()
        setTermsData(data)
      } catch (error) {
        console.error("Error fetching terms and conditions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [lang])

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const scrollPosition = contentRef.current.scrollTop + 150 // Increased offset for better title visibility
      const sections = Object.entries(sectionRefs.current)

      for (let i = sections.length - 1; i >= 0; i--) {
        const [id, element] = sections[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(id)
          break
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [termsData])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && contentRef.current) {
      const offsetTop = element.offsetTop - 80 // Increased offset to show title properly
      contentRef.current.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
      // Close sidebar on mobile after navigation
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
  }

  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 text-gray-300 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  if (loading) {
    return <LoadingSpinner text="Loading documentation..." />
  }

  if (!termsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1727]">
        <div className="text-red-400">Failed to load terms and conditions</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1727] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0A1727]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href={`/${lang}`}>
              <Image
                src="/images/hermes-logo.svg"
                alt="Hermes Dot Science"
                width={240}
                height={60}
                className="h-8 lg:h-10 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-gray-600"></div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Documentation</span>
            </div>
          </div>
          <div className="text-xs lg:text-sm text-gray-500">{termsData.lastUpdated}</div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <div
          className={`
            fixed lg:relative top-0 left-0 h-full w-80 max-w-[80vw] 
            border-r border-gray-800 bg-[#0A1727]/95 backdrop-blur-xl z-50
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-4 lg:p-6 h-full overflow-y-auto">
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#68DBFF] animate-pulse"></div>
                {termsData.title}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop Title */}
            <h2 className="hidden lg:flex text-lg font-semibold text-white mb-6 items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#68DBFF] animate-pulse"></div>
              {termsData.title}
            </h2>

            <nav className="space-y-1">
              {/* Introduction */}
              <button
                onClick={() => scrollToSection("introduction")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeSection === "introduction"
                    ? "bg-[#68DBFF]/10 text-[#68DBFF] border-l-2 border-[#68DBFF]"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${activeSection === "introduction" ? "rotate-90" : ""}`}
                />
                Introduction
              </button>

              {/* Sections */}
              {termsData.sections.map((section, index) => {
                const sectionId = `section-${index}`
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(sectionId)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                      activeSection === sectionId
                        ? "bg-[#68DBFF]/10 text-[#68DBFF] border-l-2 border-[#68DBFF]"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${activeSection === sectionId ? "rotate-90" : ""}`}
                    />
                    <span className="truncate">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={contentRef}
            className="h-full overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#68DBFF #1a1f2e",
            }}
          >
            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
              {/* Page Title */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 lg:mb-12">
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {termsData.title}
                </h1>
                <div className="h-1 w-16 lg:w-20 bg-gradient-to-r from-[#68DBFF] to-[#315f8c] rounded-full"></div>
              </motion.div>

              {/* Introduction */}
              <motion.section
                ref={(el) => (sectionRefs.current["introduction"] = el)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12 lg:mb-16"
              >
                <div className="bg-gradient-to-r from-[#68DBFF]/8 to-[#0A5E95]/5 border border-[#68DBFF]/30 rounded-xl p-4 lg:p-8 backdrop-blur-sm">
                  <div className="prose prose-invert max-w-none text-sm lg:text-base">
                    {formatContent(termsData.introduction.content)}
                  </div>
                </div>
              </motion.section>

              {/* Sections */}
              {termsData.sections.map((section, index) => (
                <motion.section
                  key={index}
                  ref={(el) => (sectionRefs.current[`section-${index}`] = el)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="mb-8 lg:mb-12"
                >
                  <div className="group">
                    <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center gap-3">
                      <div className="h-6 lg:h-8 w-1 bg-gradient-to-b from-[#68DBFF] to-[#0A5E95] rounded-full"></div>
                      {section.title}
                    </h2>
                    <div className="bg-[#0A5E95]/10 border border-gray-800/50 rounded-xl p-4 lg:p-8 backdrop-blur-sm hover:border-[#68DBFF]/40 transition-all duration-300">
                      <div className="prose prose-invert max-w-none text-sm lg:text-base">
                        {formatContent(section.content)}
                      </div>
                    </div>
                  </div>
                </motion.section>
              ))}

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 lg:mt-20 pt-8 lg:pt-12 border-t border-gray-800"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4 lg:mb-6">
                    <Image
                      src="/images/hermes-logo.svg"
                      alt="Hermes Dot Science"
                      width={280}
                      height={70}
                      className="h-12 lg:h-16 w-auto object-contain opacity-60"
                    />
                  </div>
                  <p className="text-gray-500 text-xs lg:text-sm">© 2025 Hermes Dot Science. All rights reserved.</p>
                  <div className="mt-4 flex justify-center">
                    <div className="h-px w-24 lg:w-32 bg-gradient-to-r from-transparent via-[#68DBFF]/50 to-transparent"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          background: #1a1f2e;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: #68DBFF;
          border-radius: 3px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: #5bc9ff;
        }
      `}</style>
    </div>
  )
}
