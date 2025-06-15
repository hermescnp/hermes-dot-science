import type { Metadata } from "next"
import SignInPage from "@/components/sign-in-page"

export const metadata: Metadata = {
  title: "Sign In | Hermes Dot Science",
  description: "Sign in to your Hermes Dot Science account to access our AI platforms and services.",
}

export default function SignIn({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  return <SignInPage lang={validLang} />
}
