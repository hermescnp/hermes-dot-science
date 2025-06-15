import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface UseCaseItem {
  iconName: string
  title: string
  description: string
  accentColor: string
}
interface UseCasesContent {
  badgeText: string
  title: string
  subtitle: string
  items: UseCaseItem[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const useCasesData = await loadJsonContent<UseCasesContent>(`use-cases-${lang}.json`)
    return NextResponse.json(useCasesData)
  } catch (error) {
    console.error("API Error fetching use-cases.json:", error)
    return NextResponse.json({ error: "Failed to load use cases content" }, { status: 500 })
  }
}
