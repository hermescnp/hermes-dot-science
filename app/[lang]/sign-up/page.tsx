import type { Metadata } from "next"
import SignUpPage from "@/components/sign-up-page"
import { use } from "react"

export const metadata: Metadata = {
  title: "Sign Up | Hermes Dot Science",
  description: "Create your Hermes Dot Science account to access our AI platforms and services.",
}

export default function SignUp({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  return <SignUpPage lang={validLang} />
}
