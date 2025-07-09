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
import Link from "next/link"
import HeroParticles from "@/components/hero-particles"
import CssGridBackground from "@/components/css-grid-background"
import Image from "next/image"
import SignInSpotlight from "@/components/sign-in-spotlight"
import { BackButton, MobileBackButton } from "@/components/learn-more/navigation-ui"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SignUpContent {
  title: string
  subtitle: string
  labels: Record<string, string>
  placeholders: Record<string, string>
  signUpButtonText: string
  signingUpText: string
  googleSignUpText: string
  alreadyHaveAccountText: string
  signInText: string
  orText: string
  welcomeTitle: string
  welcomeSubtitle: string
  termsText?: string
  selectOptions: {
    organizationSize: Array<{ value: string; label: string }>
  }
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

interface SignUpPageProps {
  lang: "en" | "es"
}

export default function SignUpPage({ lang }: SignUpPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [content, setContent] = useState<SignUpContent | null>(null)
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
        const response = await fetch(`/api/content/contact?lang=${language}`)
        if (!response.ok) throw new Error("Failed to fetch contact content")
        const data = await response.json()

        // Transform contact form data to sign-up format
        const signUpContent: SignUpContent = {
          title: language === "es" ? "¡Únete al Ecosistema!" : "Join the Ecosystem!",
          subtitle:
            language === "es"
              ? "Crea tu cuenta para acceder a nuestras plataformas"
              : "Create your account to access our platforms",
          welcomeTitle: language === "es" ? "¡Bienvenido!" : "Welcome!",
          welcomeSubtitle:
            language === "es"
              ? "Descubre el poder de la inteligencia artificial con Hermes Science"
              : "Discover the power of artificial intelligence with Hermes Science",
          labels: data.form.labels,
          placeholders: data.form.placeholders,
          selectOptions: data.form.selectOptions,
          signUpButtonText: language === "es" ? "Crear Cuenta" : "Create Account",
          signingUpText: data.form.submittingText,
          googleSignUpText: language === "es" ? "Registrarse con Google" : "Sign up with Google",
          alreadyHaveAccountText: language === "es" ? "¿Ya tienes una cuenta?" : "Already have an account?",
          signInText: language === "es" ? "Iniciar sesión" : "Sign in",
          orText: language === "es" ? "o" : "or",
          termsText: language === "es" ? "Acepto los términos y condiciones" : "I agree to the terms and conditions",
          successMessage: data.form.successMessage,
          validationMessages: data.form.validationMessages,
        }
        setContent(signUpContent)
      } catch (error) {
        console.error("Error fetching sign-up content:", error)
        // Fallback content
        const fallbackContent: SignUpContent = {
          title: language === "es" ? "¡Únete al Ecosistema!" : "Join the Ecosystem!",
          subtitle:
            language === "es"
              ? "Crea tu cuenta para acceder a nuestras plataformas"
              : "Create your account to access our platforms",
          welcomeTitle: language === "es" ? "¡Bienvenido!" : "Welcome!",
          welcomeSubtitle:
            language === "es"
              ? "Descubre el poder de la inteligencia artificial con Hermes Science"
              : "Discover the power of artificial intelligence with Hermes Science",
          labels: {
            firstName: language === "es" ? "Nombre" : "First Name",
            lastName: language === "es" ? "Apellido" : "Last Name",
            email: language === "es" ? "Email de Trabajo" : "Work Email",
            company: language === "es" ? "Empresa/Organización" : "Company/Organization",
            role: language === "es" ? "Tu Rol" : "Your Role",
            size: language === "es" ? "Tamaño de Organización" : "Organization Size",
          },
          placeholders: {
            firstName: language === "es" ? "Juan" : "John",
            lastName: language === "es" ? "Pérez" : "Doe",
            email: language === "es" ? "juan.perez@empresa.com" : "john.doe@company.com",
            company: "Acme Inc.",
            role: language === "es" ? "CTO, Director de TI, etc." : "CTO, IT Director, etc.",
            organizationSize: language === "es" ? "Seleccionar tamaño de organización" : "Select organization size",
          },
          selectOptions: {
            organizationSize: [
              { value: "1-50", label: language === "es" ? "1-50 empleados" : "1-50 employees" },
              { value: "51-200", label: language === "es" ? "51-200 empleados" : "51-200 employees" },
              { value: "201-500", label: language === "es" ? "201-500 empleados" : "201-500 employees" },
              { value: "501-1000", label: language === "es" ? "501-1000 empleados" : "501-1000 employees" },
              { value: "1001+", label: language === "es" ? "1001+ empleados" : "1001+ employees" },
              { value: "government", label: language === "es" ? "Agencia Gubernamental" : "Government Agency" },
            ],
          },
          signUpButtonText: language === "es" ? "Crear Cuenta" : "Create Account",
          signingUpText: language === "es" ? "Creando cuenta..." : "Creating account...",
          googleSignUpText: language === "es" ? "Registrarse con Google" : "Sign up with Google",
          alreadyHaveAccountText: language === "es" ? "¿Ya tienes una cuenta?" : "Already have an account?",
          signInText: language === "es" ? "Iniciar sesión" : "Sign in",
          orText: language === "es" ? "o" : "or",
          termsText: language === "es" ? "Acepto los términos y condiciones" : "I agree to the terms and conditions",
          successMessage: {
            title: language === "es" ? "¡Bienvenido!" : "Welcome!",
            description:
              language === "es"
                ? "Tu cuenta ha sido creada exitosamente."
                : "Your account has been created successfully.",
            buttonText: language === "es" ? "Comenzar" : "Get Started",
          },
        }
        setContent(fallbackContent)
      }
    }
    fetchContent()
  }, [language, t])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setEmail(email)
    if (!email) {
      setEmailError(null)
    } else if (!validateEmail(email)) {
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

  const checkFormCompletion = () => {
    const isComplete =
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      company.trim() !== "" &&
      validateEmail(email) &&
      acceptTerms
    setIsFormComplete(isComplete)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  useEffect(() => {
    checkFormCompletion()
  }, [firstName, lastName, email, company, acceptTerms])

  if (!content) {
    return <LoadingSpinner text={language === "es" ? "Cargando..." : "Loading..."} />
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background Effects */}
        <CssGridBackground />
        <HeroParticles />
        <SignInSpotlight />

        {/* Back Button */}
        <BackButton lang={lang} language={language} />

        {/* Logo */}
        <div className="absolute top-8 left-8 z-20">
          <Link href={`/${lang}`}>
            <Image
              src="/images/hermes-logo.svg"
              alt="Hermes Dot Science"
              width={200}
              height={50}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-center p-4">
            <Link href={`/${lang}`}>
              <Image
                src="/images/hermes-logo.svg"
                alt="Hermes Dot Science"
                width={120}
                height={30}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Success Content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
          <Card className="bg-gradient-to-br from-[#68DBFF]/10 via-background/90 to-[#315F8C]/10 backdrop-blur-md border-[#68DBFF]/30 shadow-2xl">
            <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden">
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

                <div className="max-w-lg mb-6">
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <CssGridBackground />
      <HeroParticles />
      <SignInSpotlight />

      {/* Back Button */}
      <BackButton lang={lang} language={language} />

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <MobileBackButton lang={lang} language={language} />
          <Link href={`/${lang}`}>
            <Image
              src="/images/hermes-logo.svg"
              alt="Hermes Dot Science"
              width={120}
              height={30}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 lg:overflow-hidden">
        {/* Left Side - Visual Content (Same as Sign In) */}
        <div className="hidden lg:flex flex-col justify-center items-center pl-24 py-12 relative lg:h-screen lg:overflow-hidden">
          {/* Logo */}
          <div className="absolute top-8 left-8">
            <Link href={`/${lang}`}>
              <Image
                src="/images/hermes-logo.svg"
                alt="Hermes Dot Science"
                width={200}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Enhanced AI Visualization - Centered */}
          <div className="relative w-96 h-96">
            {/* Central Hermes Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/hermes-logo-icon.svg"
                alt="Hermes Dot Science"
                className="w-32 h-32 drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(104, 219, 255, 0.5))",
                }}
              />
            </div>

            {/* Inner Dashed Circle */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 384 384">
                <circle
                  cx="192"
                  cy="192"
                  r="120"
                  fill="none"
                  stroke="url(#innerGradient)"
                  strokeWidth="1"
                  strokeDasharray="3,6"
                  className="animate-pulse opacity-40"
                />
                <defs>
                  <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#68DBFF" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#0A5E95" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#68DBFF" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Main Orbiting Elements - Perfect hexagon at 144px radius */}
            <div className="absolute inset-0 animate-slow-spin">
              {/* Top (0 degrees) - Bot */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-1"
                style={{
                  left: "50%",
                  top: "3.125%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="Bot" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>

              {/* Top Right (60 degrees) - MessageSquare */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-2"
                style={{
                  left: "90.625%",
                  top: "21.875%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="MessageSquare" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>

              {/* Bottom Right (120 degrees) - Zap */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-3"
                style={{
                  left: "90.625%",
                  top: "78.125%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="Zap" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>

              {/* Bottom (180 degrees) - Database */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-4"
                style={{
                  left: "50%",
                  top: "96.875%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="Database" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>

              {/* Bottom Left (240 degrees) - Network */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-5"
                style={{
                  left: "9.375%",
                  top: "78.125%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="Network" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>

              {/* Top Left (300 degrees) - Cpu */}
              <div
                className="absolute w-16 h-16 rounded-full bg-[#0B1E33] backdrop-blur-md border border-[#68DBFF]/50 flex items-center justify-center animate-counter-spin animate-soft-scale-6"
                style={{
                  left: "9.375%",
                  top: "21.875%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="animate-counter-spin">
                  <RenderIcon iconName="Cpu" className="w-6 h-6 text-[#68DBFF]" />
                </div>
              </div>
            </div>

            {/* Main Dashed Circle */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 384 384">
                <circle
                  cx="192"
                  cy="192"
                  r="180"
                  fill="none"
                  stroke="url(#mainGradient)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#68DBFF" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#0A5E95" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#68DBFF" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Outer Soft Rotating Elements */}
            <div className="absolute inset-0 animate-ultra-slow-spin">
              {/* Small dots at outer positions */}
              <div
                className="absolute w-2 h-2 rounded-full bg-[#68DBFF]/40"
                style={{
                  left: "50%",
                  top: "2%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full bg-[#68DBFF]/40"
                style={{
                  left: "93%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full bg-[#68DBFF]/40"
                style={{
                  left: "50%",
                  top: "98%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full bg-[#68DBFF]/40"
                style={{
                  left: "7%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            {/* Outer Dashed Circle */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 384 384">
                <circle
                  cx="192"
                  cy="192"
                  r="220"
                  fill="none"
                  stroke="url(#outerGradient)"
                  strokeWidth="0.5"
                  strokeDasharray="2,8"
                  className="animate-pulse opacity-30"
                />
                <defs>
                  <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#68DBFF" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#0A5E95" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#68DBFF" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Counter-rotating Inner Elements */}
            <div className="absolute inset-0 animate-counter-spin">
              {/* Small glowing dots */}
              <div
                className="absolute w-1 h-1 rounded-full bg-[#68DBFF]/60 animate-pulse"
                style={{
                  left: "75%",
                  top: "15%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-1 h-1 rounded-full bg-[#68DBFF]/60 animate-pulse"
                style={{
                  left: "85%",
                  top: "85%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-1 h-1 rounded-full bg-[#68DBFF]/60 animate-pulse"
                style={{
                  left: "25%",
                  top: "85%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                className="absolute w-1 h-1 rounded-full bg-[#68DBFF]/60 animate-pulse"
                style={{
                  left: "15%",
                  top: "15%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex flex-col px-8 py-12 lg:px-12 pt-20 lg:pt-12 lg:h-screen lg:overflow-y-auto lg:justify-start">
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="w-full max-w-md mx-auto" style={{ paddingBottom: "120px" }}>
            {/* Header */}
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-2"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #68DBFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {content.title}
              </h2>
              <p className="text-white/70">{content.subtitle}</p>
            </div>

            {/* Sign Up Form Card */}
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
                  {content.googleSignUpText}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{content.orText}</span>
                  </div>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{content.labels.firstName}</Label>
                      <Input
                        id="firstName"
                        placeholder={content.placeholders.firstName}
                        required
                        className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{content.labels.lastName}</Label>
                      <Input
                        id="lastName"
                        placeholder={content.placeholders.lastName}
                        required
                        className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{content.labels.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={content.placeholders.email}
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
                    <Label htmlFor="company">{content.labels.company}</Label>
                    <Input
                      id="company"
                      placeholder={content.placeholders.company}
                      required
                      className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">{content.labels.role}</Label>
                    <Input
                      id="role"
                      placeholder={content.placeholders.role}
                      className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
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
                            href={`/${lang}/terms-and-conditions`}
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
                            href={`/${lang}/terms-and-conditions`}
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
                            href={`/${lang}/terms-and-conditions`}
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
                    {isSubmitting ? content.signingUpText : content.signUpButtonText}
                  </Button>

                  {/* Already have account Link */}
                  <div className="text-center pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">{content.alreadyHaveAccountText}</p>
                    <Link href={`/${lang}/sign-in`}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-[#68DBFF] hover:text-[#68DBFF]/80 hover:bg-[#0A1727] transition-colors font-medium"
                      >
                        {content.signInText}
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
