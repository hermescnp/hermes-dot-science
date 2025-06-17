import type { Metadata } from "next"
import SignInPage from "@/components/sign-in-page"
import { use } from "react"

export const metadata: Metadata = {
  title: "Sign In | Hermes Dot Science",
  description: "Sign in to your Hermes Dot Science account to access our AI platforms and services.",
}

export default function SignIn({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  return <SignInPage lang={validLang} />
}
