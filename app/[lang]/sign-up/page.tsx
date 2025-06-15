import type { Metadata } from "next"
import SignUpPage from "@/components/sign-up-page"

export const metadata: Metadata = {
  title: "Sign Up | Hermes Dot Science",
  description: "Create your Hermes Dot Science account to access our AI platforms and services.",
}

export default function SignUp({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const validLang = lang === "en" || lang === "es" ? lang : "en"

  return <SignUpPage lang={validLang} />
}
