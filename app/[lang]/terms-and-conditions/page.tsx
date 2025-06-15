import { TermsAndConditionsTemplate } from "@/components/terms-and-conditions-template"

export default function TermsAndConditionsPage({ params }: { params: { lang: string } }) {
  return <TermsAndConditionsTemplate lang={params.lang} />
}

// Define the valid language parameters
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }]
}
