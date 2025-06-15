import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface HowItWorksContent {
  title: string
  subtitle: string
  steps: Array<{ number: string; title: string; description: string }>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const howItWorksData = await loadJsonContent<HowItWorksContent>(`how-it-works-${lang}.json`)
    return NextResponse.json(howItWorksData)
  } catch (error) {
    console.error("API Error fetching how-it-works.json:", error)
    return NextResponse.json({ error: "Failed to load how-it-works content" }, { status: 500 })
  }
}
