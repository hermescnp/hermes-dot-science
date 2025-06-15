import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface ContactContent {
  pageTitle: string
  pageSubtitle: string
  features: Array<{ iconName: string; text: string }>
  contactNote: string
  form: any
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const contactData = await loadJsonContent<ContactContent>(`contact-${lang}.json`)
    return NextResponse.json(contactData)
  } catch (error) {
    console.error("API Error fetching contact.json:", error)
    return NextResponse.json({ error: "Failed to load contact content" }, { status: 500 })
  }
}
