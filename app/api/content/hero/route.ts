import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface HeroContent {
  badgeText: string
  title: string
  subtitle: string
  typingPrompts: string[]
  ctaButton1: { text: string; icon?: string }
  ctaButton2: { text: string }
  scrollDownButton: { targetSectionId: string; text: string }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const heroData = await loadJsonContent<HeroContent>(`hero-${lang}.json`)
    return NextResponse.json(heroData)
  } catch (error) {
    console.error("API Error fetching hero.json:", error)
    return NextResponse.json({ error: "Failed to load hero content" }, { status: 500 })
  }
}
