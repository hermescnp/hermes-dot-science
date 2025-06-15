import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface PlatformFeature {
  title: string
  description: string
}
interface PlatformData {
  id: string
  name: string
  description: string
  image?: string
  imageSlides?: string[]
  video?: string
  features: PlatformFeature[]
  animationType?: "scroll" | "slideshow" | "video"
}
interface PlatformsContent {
  sectionBadge: string
  platforms: PlatformData[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const platformsData = await loadJsonContent<PlatformsContent>(`platforms-${lang}.json`)
    return NextResponse.json(platformsData)
  } catch (error) {
    console.error("API Error fetching platforms.json:", error)
    return NextResponse.json({ error: "Failed to load platforms content" }, { status: 500 })
  }
}
