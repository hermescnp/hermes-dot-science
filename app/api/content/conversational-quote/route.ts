import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    // Validate language parameter
    const validLanguages = ["en", "es"]
    const language = validLanguages.includes(lang) ? lang : "en"

    const filePath = path.join(process.cwd(), "content", `conversational-quote-${language}.json`)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Fallback to English if the requested language file doesn't exist
      const fallbackPath = path.join(process.cwd(), "content", "conversational-quote-en.json")
      if (fs.existsSync(fallbackPath)) {
        const fallbackData = fs.readFileSync(fallbackPath, "utf8")
        return NextResponse.json(JSON.parse(fallbackData))
      }

      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContent)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error loading conversational quote content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
