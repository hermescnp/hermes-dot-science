import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lang = searchParams.get("lang") || "en"

  // Validate language parameter
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  try {
    // Read the appropriate JSON file based on language
    const filePath = path.join(process.cwd(), "content", `quote-results-${validLang}.json`)
    const fileContents = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error loading quote results content for language ${validLang}:`, error)
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 })
  }
}
