import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface FooterLink {
  label: string
  href: string
}
interface FooterSectionContent {
  title: string
  links: FooterLink[]
}
interface SocialLink {
  name: string
  href: string
  iconName: string
}
interface FooterContent {
  companyName: string
  companyDescription: string
  sections: FooterSectionContent[]
  copyrightText: string
  socialLinks: SocialLink[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const footerData = await loadJsonContent<FooterContent>(`footer-${lang}.json`)
    return NextResponse.json(footerData)
  } catch (error) {
    console.error("API Error fetching footer.json:", error)
    return NextResponse.json({ error: "Failed to load footer content" }, { status: 500 })
  }
}
