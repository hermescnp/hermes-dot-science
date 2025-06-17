import { TermsAndConditionsTemplate } from "@/components/terms-and-conditions-template"
import { use } from "react"

export default function TermsAndConditionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  return <TermsAndConditionsTemplate lang={lang} />
}

// Define the valid language parameters
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }]
}
