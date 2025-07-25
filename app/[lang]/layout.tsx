import type React from "react"
import type { Metadata } from "next"
import { LanguageProvider } from "@/contexts/language-context"
import { AnimationProvider } from "@/contexts/animation-context"
import { use } from "react"

export const metadata: Metadata = {
  title: "Hermes Dot Science | Secure AI Solutions for Business & Government",
  description:
    "Enterprise-grade AI platform with LLM conversations, customizable agents, secure knowledge base, and MCP server support for businesses and government agencies.",
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  // Ensure lang is a valid language, fallback to 'en' if not
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  console.log(`LocaleLayout: Received lang param: ${lang}, using: ${validLang}`)

  return (
    <AnimationProvider>
      <LanguageProvider initialLanguage={validLang as "en" | "es"}>
        {children}
      </LanguageProvider>
    </AnimationProvider>
  )
}

// Define the valid language parameters
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }]
}
