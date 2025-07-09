"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ContactFormContent {
  title: string
  description: string
  labels: Record<string, string>
  placeholders: Record<string, string>
  submitButtonText: string
  submittingText: string
  googleSignUpText?: string
  alreadyHaveAccountText?: string
  orText?: string
  responseNote: string
  termsText?: string
  successMessage: {
    title: string
    description: string
    buttonText: string
  }
  validationMessages?: {
    invalidEmail: string
    loading: string
  }
}

interface FullContactContent {
  form: ContactFormContent
  pageTitle: string
  pageSubtitle: string
  features: Array<{ iconName: string; text: string }>
  contactNote: string
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [content, setContent] = useState<ContactFormContent | null>(null)
  const { language, t } = useLanguage()

  const [emailError, setEmailError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isFormComplete, setIsFormComplete] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/contact-form?lang=${language}`)
        if (!response.ok) throw new Error("Failed to fetch contact form content")
        const data: FullContactContent = await response.json()
        setContent(data.form)
      } catch (error) {
        console.error("Error fetching contact form content:", error)
        // Fallback
        setContent({
          title: t("Join the Ecosystem"),
          description: t("Create your account to access our platforms."),
          labels: {
            firstName: t("First Name"),
            lastName: t("Last Name"),
            email: t("Email Address"),
            company: t("Company/Organization (Optional)"),
            role: t("Role (Optional)"),
          },
          placeholders: {
            firstName: t("John"),
            lastName: t("Doe"),
            email: t("john.doe@company.com"),
            company: t("Acme Inc."),
            role: t("Engineer"),
          },
          submitButtonText: "Create Account",
          submittingText: t("Creating Account..."),
          googleSignUpText: t("Sign up with Google"),
          alreadyHaveAccountText: t("I already have an account"),
          orText: t("or"),
          termsText: language === "es" ? "Acepto los términos y condiciones" : "I agree to the terms and conditions",
          responseNote: "",
          successMessage: {
            title: t("Welcome!"),
            description: t("Your account has been created."),
            buttonText: t("Get Started"),
          },
        })
      }
    }
    fetchContent()
  }, [language, t])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    setEmail(emailValue)
    if (!emailValue) {
      setEmailError(null)
    } else if (!validateEmail(emailValue)) {
      setEmailError(
        content?.validationMessages?.invalidEmail ||
          (language === "es"
            ? "Por favor ingresa una dirección de email válida."
            : "Please enter a valid email address."),
      )
    } else {
      setEmailError(null)
    }
  }

  const checkFormCompletion = () => {
    const isComplete =
      firstName.trim() !== "" && lastName.trim() !== "" && email.trim() !== "" && validateEmail(email) && acceptTerms
    setIsFormComplete(isComplete)
  }

  const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailInput = form.email as HTMLInputElement

    if (emailInput.value && !validateEmail(emailInput.value)) {
      setEmailError(
        content?.validationMessages?.invalidEmail ||
          (language === "es"
            ? "Por favor ingresa una dirección de email válida."
            : "Please enter a valid email address."),
      )
      return false
    }

    setEmailError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm(e)) {
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  const handleGoogleSignUp = () => {
    // Simulate Google sign-up process
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  const handleAlreadyHaveAccount = () => {
    // This would typically redirect to login page
    console.log("Redirect to login page")
  }

  useEffect(() => {
    checkFormCompletion()
  }, [firstName, lastName, email, acceptTerms])

  if (!content) {
    return (
      <Card>
        <CardContent className="pt-6 min-h-[400px]">
          <LoadingSpinner text={language === "es" ? "Cargando..." : "Loading..."} className="min-h-[400px]" />
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <Card className="bg-gradient-to-br from-[#68DBFF]/10 via-background/90 to-[#315F8C]/10 backdrop-blur-md border-[#68DBFF]/30 shadow-2xl">
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center min-h-[500px] text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#68DBFF]/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#68DBFF]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#315F8C]/10 rounded-full blur-2xl"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 p-4 rounded-full bg-gradient-radial-primary/20 border border-[#68DBFF]/30">
              <RenderIcon iconName="Rocket" className="h-16 w-16 text-[#68DBFF]" />
            </div>

            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#68DBFF] to-[#315F8C] bg-clip-text text-transparent">
              {language === "es" ? `¡Bienvenido a bordo, ${firstName}!` : `Welcome aboard, ${firstName}!`}
            </h3>

            <div className="max-w-md mb-6">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {language === "es"
                  ? `Gracias por registrarte. Estás en lista de espera para unirte a nuestro ecosistema de aplicaciones inteligentes, diseñado para impulsar la productividad empresarial y optimizar los flujos de trabajo. Nuestra plataforma aún se encuentra en desarrollo y nos esforzamos por ofrecerte una experiencia impecable y confiable.`
                  : `Thank you for signing up. You're now on the waitlist to join our ecosystem of intelligent applications, designed to boost enterprise productivity and streamline workflows. Our platform is still in active development, and we're working hard to bring you a polished, reliable experience.`}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {language === "es"
                  ? `En cuanto haya una plaza disponible, te enviaremos una invitación por correo electrónico con los pasos a seguir. Mientras tanto, si quieres conocer más sobre nosotros, puedes visitar nuestra oficina virtual.`
                  : `As soon as your spot opens up, we'll send you an email invitation with next steps. In the meantime, if you'd like to learn more about us, you can visit our virtual office.`}
              </p>
            </div>

            {/* Only show the Visit our science lab button */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <Button
                onClick={() => window.open("https://hermes.science", "_blank")}
                className="w-full h-[60px] py-6 bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white shadow-none hover:shadow-[0_0_30px_rgba(104,219,255,0.6)] transition-all duration-300 rounded-xl"
              >
                {language === "es" ? "Visitar nuestro laboratorio" : "Visit our science lab"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background/80 backdrop-blur-md border-[#68DBFF]/20 shadow-2xl">
      <CardContent className="pt-6">
        {/* Google Sign Up Button */}
        <Button
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className="w-full h-[60px] py-6 mb-4 bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 shadow-none hover:shadow-md transition-all duration-300 rounded-xl flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {content.googleSignUpText || "Sign up with Google"}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{content.orText || "or"}</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{content.labels.firstName || "First Name"}</Label>
              <Input
                id="firstName"
                placeholder={content.placeholders.firstName || "John"}
                required
                className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{content.labels.lastName || "Last Name"}</Label>
              <Input
                id="lastName"
                placeholder={content.placeholders.lastName || "Doe"}
                required
                className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{content.labels.email || "Email Address"}</Label>
            <Input
              id="email"
              type="email"
              placeholder={content.placeholders.email || "john.doe@company.com"}
              onChange={handleEmailChange}
              required
              className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                emailError ? "!border-[#FFB338]" : ""
              }`}
              value={email}
            />
            {emailError && <p className="text-[#FFB338] text-xs mt-1">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{content.labels.company || "Company/Organization (Optional)"}</Label>
            <Input
              id="company"
              placeholder={content.placeholders.company || "Acme Inc."}
              className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value)
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{content.labels.role || "Role (Optional)"}</Label>
            <Input
              id="role"
              placeholder={content.placeholders.role || "Engineer"}
              className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
              }}
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start space-x-3 py-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-1 border-slate-300 data-[state=checked]:bg-[#68DBFF] data-[state=checked]:border-[#68DBFF]"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              {content.termsText && content.termsText.split("términos y condiciones").length > 1 ? (
                <>
                  {content.termsText.split("términos y condiciones")[0]}
                  <a
                    href={`/${language}/terms-and-conditions`}
                    className="text-[#68DBFF] hover:text-[#68DBFF]/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    términos y condiciones
                  </a>
                </>
              ) : content.termsText && content.termsText.split("terms and conditions").length > 1 ? (
                <>
                  {content.termsText.split("terms and conditions")[0]}
                  <a
                    href={`/${language}/terms-and-conditions`}
                    className="text-[#68DBFF] hover:text-[#68DBFF]/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    terms and conditions
                  </a>
                </>
              ) : (
                <>
                  {language === "es" ? "Acepto los " : "I agree to the "}
                  <a
                    href={`/${language}/terms-and-conditions`}
                    className="text-[#68DBFF] hover:text-[#68DBFF]/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {language === "es" ? "términos y condiciones" : "terms and conditions"}
                  </a>
                </>
              )}
            </Label>
          </div>

          <Button
            type="submit"
            className={`w-full h-[60px] py-6 bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white shadow-none hover:shadow-[0_0_30px_rgba(104,219,255,0.6)] transition-all duration-300 rounded-xl ${!isFormComplete ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isSubmitting || !isFormComplete}
          >
            {isSubmitting ? content.submittingText : content.submitButtonText}
          </Button>

          {/* Already have account button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleAlreadyHaveAccount}
            className="w-full h-[60px] text-muted-foreground hover:text-foreground hover:bg-black/30 transition-colors rounded-xl"
          >
            {content.alreadyHaveAccountText || "I already have an account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
