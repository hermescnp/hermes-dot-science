"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Simple translations for UI elements not in JSON files
const translations = {
  en: {
    loading: "Loading...",
    error: "Error loading content",
    noData: "No data available",
  },
  es: {
    loading: "Cargando...",
    error: "Error al cargar contenido",
    noData: "No hay datos disponibles",
  },
}

interface LanguageProviderProps {
  children: ReactNode
  initialLanguage?: Language
}

export function LanguageProvider({ children, initialLanguage = "en" }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  console.log(`LanguageProvider: Initialized with ${initialLanguage}, current state: ${language}`)

  // Update language when initialLanguage changes (for route changes)
  useEffect(() => {
    console.log(`LanguageProvider: initialLanguage changed to ${initialLanguage}, updating state`)
    setLanguage(initialLanguage)
  }, [initialLanguage])

  const t = (key: string): string => {
    const langTranslations = translations[language]
    if (!langTranslations) {
      return key
    }
    return langTranslations[key as keyof typeof translations.en] || key
  }

  const contextValue = { language, setLanguage, t }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    console.warn("useLanguage must be used within a LanguageProvider, returning fallback")
    // Return a fallback context instead of throwing an error
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    }
  }
  return context
}
