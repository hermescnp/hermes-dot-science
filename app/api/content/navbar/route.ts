import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface NavItem {
  label: string
  href: string
}
interface EnterOfficeButtonContent {
  href: string
  imageSrc: string
  imageAlt: string
  mainText: string
  subText: string
}
interface NavbarContent {
  logoImage: string
  logoAlt: string
  navItems: NavItem[]
  enterOfficeButton: EnterOfficeButtonContent
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const navbarData = await loadJsonContent<NavbarContent>(`navbar-${lang}.json`)
    return NextResponse.json(navbarData)
  } catch (error) {
    console.error("API Error fetching navbar.json:", error)
    return NextResponse.json({ error: "Failed to load navbar content" }, { status: 500 })
  }
}
