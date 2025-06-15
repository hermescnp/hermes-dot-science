import { NextResponse } from "next/server"
import termsEn from "@/content/terms-and-conditions-en.json"
import termsEs from "@/content/terms-and-conditions-es.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang") || "en"

  const terms = lang === "es" ? termsEs : termsEn

  return NextResponse.json(terms)
}
