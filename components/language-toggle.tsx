"use client"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function LanguageToggle() {
  const { language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [animationLanguage, setAnimationLanguage] = useState(language)

  console.log(`LanguageToggle: Current language from context: ${language}, pathname: ${pathname}`)

  // Ensure animation state is synced with actual language
  useEffect(() => {
    console.log(`LanguageToggle: Language changed to ${language}, updating animation`)
    setAnimationLanguage(language)
  }, [language])

  const toggleLanguage = () => {
    // Get current language from URL path as a backup
    const pathLang = pathname.split("/")[1]
    const currentLang = pathLang === "en" || pathLang === "es" ? pathLang : language
    const newLanguage = currentLang === "en" ? "es" : "en"

    console.log(`LanguageToggle: Toggling from ${currentLang} to ${newLanguage}`)
    console.log(`LanguageToggle: Path language: ${pathLang}, Context language: ${language}`)

    // Immediately update animation state for smooth visual feedback
    setAnimationLanguage(newLanguage)

    // Extract the current path without the language prefix
    const pathSegments = pathname.split("/")
    const pathWithoutLang = pathSegments.slice(2).join("/")

    // Construct the new path
    const newPath = `/${newLanguage}${pathWithoutLang ? `/${pathWithoutLang}` : ""}`

    console.log(`LanguageToggle: Navigating from ${pathname} to ${newPath}`)

    // Force a hard navigation to ensure the language change takes effect
    setTimeout(() => {
      window.location.href = newPath
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center h-full">
      <button
        onClick={toggleLanguage}
        className="relative rounded-full overflow-hidden group bg-white/5 hover:bg-[#0B1E33] border border-white/10 hover:border-[#68DBFF]/50 hover:shadow-[0_0_20px_rgba(104,219,255,0.4)] transition-all duration-300"
        style={{
          width: "100px",
          height: "48px",
        }}
        aria-label={`Switch language to ${language === "en" ? "Spanish" : "English"}`}
      >
        {/* Sliding indicator with gradient background */}
        <motion.div
          className="absolute rounded-full overflow-hidden flex items-center justify-center"
          initial={{ x: animationLanguage === "en" ? 4 : 56, y: "-50%" }}
          animate={{ x: animationLanguage === "en" ? 4 : 56, y: "-50%" }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
          style={{
            width: "40px",
            height: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "radial-gradient(circle, #172E49 0%, #0A5E95 100%)",
            border: "0.5px solid #68dbff",
          }}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>

          {/* Selected text inside the circle */}
          <span className="text-sm font-medium text-white relative z-10">{animationLanguage.toUpperCase()}</span>
        </motion.div>

        {/* Background text containers */}
        <div className="absolute inset-0 flex">
          {/* EN container */}
          <div className="flex items-center justify-center w-1/2 h-full">
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                animationLanguage === "en" ? "text-transparent" : "text-white/60"
              }`}
            >
              EN
            </span>
          </div>

          {/* ES container */}
          <div className="flex items-center justify-center w-1/2 h-full">
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                animationLanguage === "es" ? "text-transparent" : "text-white/60"
              }`}
            >
              ES
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
