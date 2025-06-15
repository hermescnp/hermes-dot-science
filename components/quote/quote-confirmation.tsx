"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"

interface QuoteConfirmationProps {
  content: any
  onBackToHome: () => void
}

export function QuoteConfirmation({ content, onBackToHome }: QuoteConfirmationProps) {
  const confirmation = content?.confirmation || {
    title: "Quote Request Submitted!",
    message: "Thank you for your interest. Our team will review your requirements and get back to you within 24 hours.",
    nextSteps: [
      "Our team will review your requirements",
      "We'll prepare a customized proposal",
      "Schedule a consultation call",
      "Finalize project details",
    ],
    button: "Back to Home",
  }

  return (
    <div className="container max-w-2xl mx-auto px-6">
      <Card className="bg-black/40 backdrop-blur-sm border-[#68DBFF]/20 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-white mb-4">{confirmation.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-300">{confirmation.message}</p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">What happens next?</h3>
            <div className="space-y-3">
              {confirmation.nextSteps.map((step: string, index: number) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#68DBFF]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#68DBFF] font-semibold">{index + 1}</span>
                  </div>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onBackToHome}
            className="flex items-center gap-2 bg-gradient-to-r from-[#68DBFF] to-[#4A9EFF] hover:from-[#5BC5FF] hover:to-[#3D8BFF] text-white mt-8"
          >
            <Home className="h-4 w-4" />
            {confirmation.button}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
