import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const contactData = await loadJsonContent<any>(`contact-${lang}.json`)
    return NextResponse.json(contactData)
  } catch (error) {
    console.error("API Error fetching contact form content:", error)
    return NextResponse.json({ error: "Failed to load contact form content" }, { status: 500 })
  }
}
