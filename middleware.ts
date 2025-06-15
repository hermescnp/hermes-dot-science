import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const locales = ["en", "es"]
const defaultLocale = "en"

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return pathname.split("/")[1]

  // Only check Accept-Language header if there's no locale in the URL
  // This prevents overriding explicit user language choices
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim())
      .find((lang) => locales.includes(lang.split("-")[0]))

    if (preferredLocale) {
      return preferredLocale.split("-")[0]
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  // If URL already has a valid locale, don't redirect - respect the explicit language choice
  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Only redirect if there is no locale in the URL
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)

  console.log(`Middleware: Redirecting ${pathname} to ${newUrl.pathname}`)

  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files
    "/((?!_next|favicon.ico|.*\\..*|images|videos).*)",
  ],
}
