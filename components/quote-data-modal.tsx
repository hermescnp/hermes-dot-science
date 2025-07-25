"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useAnimation } from "@/contexts/animation-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { updateUserData } from "@/lib/auth-service"

interface QuoteDataModalProps {
  isOpen: boolean
  onClose: () => void
  lang: string
  isOnQuotePage?: boolean // Add this new prop
}

interface QuoteFormContent {
  title: string
  description: string
  labels: Record<string, string>
  placeholders: Record<string, string>
  submitButtonText: string
  submittingText: string
  successMessage: {
    title: string
    description: string
    buttonText: string
  }
}

interface FormData {
  firstName: string
  lastName: string
  identificationType: "id" | "ein" | "rnc" | "passport"
  identification: string
  phoneCountryCode: "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other"
  phone: string
  company: string
  role: string
  email: string
}

export default function QuoteDataModal({ isOpen, onClose, lang, isOnQuotePage = false }: QuoteDataModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [content, setContent] = useState<QuoteFormContent | null>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    identificationType: "rnc",
    identification: "",
    phoneCountryCode: "+1 (809)",
    phone: "",
    company: "",
    role: "",
    email: "",
  })
  const { language } = useLanguage()
  const { user, userData, isAuthenticated } = useAuth()
  const { pauseAnimations, resumeAnimations } = useAnimation()
  const router = useRouter()

  const firstNameRef = useRef<HTMLInputElement>(null)
  const companyRef = useRef<HTMLInputElement>(null)

  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    // Set content based on language
    const quoteContent: QuoteFormContent = {
      title: language === "es" ? "Datos para Cotización" : "Quote Information",
      description:
        language === "es"
          ? "Completa estos datos para acceder a la calculadora de cotización personalizada."
          : "Complete this information to access the personalized quote calculator.",
      labels: {
        firstName: language === "es" ? "Nombre" : "First Name",
        lastName: language === "es" ? "Apellido" : "Last Name",
        identification: language === "es" ? "Identificación Empresarial" : "Business Identification",
        idCard: language === "es" ? "Cédula" : "ID Card",
        passport: language === "es" ? "Pasaporte" : "Passport",
        ein: "EIN",
        rnc: "RNC",
        phone: language === "es" ? "Teléfono" : "Phone Number",
        company: language === "es" ? "Empresa/Organización" : "Company/Organization",
        role: language === "es" ? "Tu Rol" : "Your Role",
        email: language === "es" ? "Email de Trabajo" : "Work Email",
      },
      placeholders: {
        firstName: "Juan",
        lastName: "Pérez",
        identificationId: "000-0000000-0",
        identificationPassport: language === "es" ? "A1234567" : "A1234567",
        identificationEin: "00-0000000",
        identificationRnc: "000-00000-0",
        phone: language === "es" ? "+57 300 123 4567" : "+1 (555) 123-4567",
        company: "Acme Inc.",
        role: "CTO, Director de TI, etc.",
        email: "juan.perez@empresa.com",
      },
      submitButtonText: language === "es" ? "Calcular mi Cotización" : "Calculate my Quote",
      submittingText: language === "es" ? "Procesando..." : "Processing...",
      successMessage: {
        title: language === "es" ? "¡Datos Guardados!" : "Data Saved!",
        description:
          language === "es"
            ? isOnQuotePage
              ? "Ahora puedes continuar con la calculadora de cotización."
              : "Ahora serás redirigido a la calculadora de cotización personalizada."
            : isOnQuotePage
              ? "You can now continue with the quote calculator."
              : "You will now be redirected to the personalized quote calculator.",
        buttonText: language === "es" ? "Continuar" : "Continue",
      },
    }
    setContent(quoteContent)
  }, [language, isOnQuotePage])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setIsSubmitted(false)
      setEmailError(null) // Add this line to clear email error state
      setFormData({
        firstName: "",
        lastName: "",
        identificationType: "rnc",
        identification: "",
        phoneCountryCode: "+1 (809)",
        phone: "",
        company: "",
        role: "",
        email: "",
      })
    }
  }, [isOpen])

  // Auto-fill form data when user is authenticated and modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && userData) {
      // Parse phone number and country code
      let phoneCountryCode: "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other" = "+1 (809)"
      let phone = ""
      
      const userPhone = userData.phone || ""
      if (userPhone.startsWith("+1809")) {
        phoneCountryCode = "+1 (809)"
        phone = userPhone.replace("+1809", "")
      } else if (userPhone.startsWith("+1829")) {
        phoneCountryCode = "+1 (829)"
        phone = userPhone.replace("+1829", "")
      } else if (userPhone.startsWith("+1849")) {
        phoneCountryCode = "+1 (849)"
        phone = userPhone.replace("+1849", "")
      } else if (userPhone.startsWith("+1 (809)")) {
        phoneCountryCode = "+1 (809)"
        phone = userPhone.replace("+1 (809) ", "")
      } else if (userPhone.startsWith("+1 (829)")) {
        phoneCountryCode = "+1 (829)"
        phone = userPhone.replace("+1 (829) ", "")
      } else if (userPhone.startsWith("+1 (849)")) {
        phoneCountryCode = "+1 (849)"
        phone = userPhone.replace("+1 (849) ", "")
      } else if (userPhone) {
        phoneCountryCode = "Other"
        phone = userPhone
      }

      setFormData((prev) => ({
        ...prev,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || user?.email || "",
        company: userData.company || "",
        role: userData.role || "",
        phoneCountryCode,
        phone,
      }))
    }
  }, [isOpen, isAuthenticated, userData, user])

  // Auto-focus first field when modal opens
  useEffect(() => {
    if (isOpen && !isSubmitted && currentStep === 1) {
      setTimeout(() => {
        firstNameRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Pause animations when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      pauseAnimations()
    } else {
      resumeAnimations()
    }
  }, [isOpen, pauseAnimations, resumeAnimations])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const formatIdCard = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // Limit to 11 digits
    const limitedNumbers = numbers.slice(0, 11)

    // Apply format: 000-0000000-0
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 10) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 10)}-${limitedNumbers.slice(10)}`
    }
  }

  const formatEin = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // English EIN format: XX-XXXXXXX (9 digits)
    const limitedNumbers = numbers.slice(0, 9)

    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else {
      return `${limitedNumbers.slice(0, 2)}-${limitedNumbers.slice(2)}`
    }
  }

  const formatRnc = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // Spanish RNC format: XXX-XXXXX-X (9 digits)
    const limitedNumbers = numbers.slice(0, 9)

    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 8) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 8)}-${limitedNumbers.slice(8)}`
    }
  }

  const formatPhone = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // If "Other" is selected, return numbers without formatting but limit to reasonable length
    if (formData.phoneCountryCode === "Other") {
      return numbers.slice(0, 15) // Reasonable limit for international numbers
    }

    // Limit to 7 digits for Dominican numbers
    const limitedNumbers = numbers.slice(0, 7)

    // Apply format: 000-0000
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    // Handle identification formatting
    if (field === "identification" && formData.identificationType === "id") {
      value = formatIdCard(value)
    }

    // Handle EIN/RNC formatting
    if (field === "identification" && formData.identificationType === "ein") {
      value = formatEin(value)
    }
    if (field === "identification" && formData.identificationType === "rnc") {
      value = formatRnc(value)
    }

    // Handle phone formatting
    if (field === "phone") {
      value = formatPhone(value)
    }

    // Validate email when it changes
    if (field === "email") {
      if (!value) {
        setEmailError(null)
      } else if (!validateEmail(value)) {
        setEmailError(
          language === "es"
            ? "Por favor ingresa una dirección de email válida."
            : "Please enter a valid email address.",
        )
      } else {
        setEmailError(null)
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateIdCard = (value: string): boolean => {
    // Check if it matches the format 000-0000000-0 (exactly 11 digits)
    const idRegex = /^\d{3}-\d{7}-\d{1}$/
    return idRegex.test(value)
  }

  const validateEin = (value: string): boolean => {
    // English EIN format: XX-XXXXXXX (9 digits)
    const einRegex = /^\d{2}-\d{7}$/
    return einRegex.test(value)
  }

  const validateRnc = (value: string): boolean => {
    // Spanish RNC format: XXX-XXXXX-X (9 digits)
    const rncRegex = /^\d{3}-\d{5}-\d{1}$/
    return rncRegex.test(value)
  }

  const validatePhone = (value: string): boolean => {
    if (formData.phoneCountryCode === "Other") {
      // For "Other", just check if there are at least some digits
      return value.length >= 7
    }
    // Check if it matches the format 000-0000 (exactly 7 digits)
    const phoneRegex = /^\d{3}-\d{4}$/
    return phoneRegex.test(value)
  }

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Update user profile data if user is authenticated and has missing information
      if (isAuthenticated && user?.uid) {
        const updateData: any = {}
        let hasUpdates = false
        
        // Check if any fields are missing from userData and have been filled in the form
        if (!userData?.company && formData.company.trim()) {
          updateData.company = formData.company
          hasUpdates = true
        }
        
        if (!userData?.role && formData.role.trim()) {
          updateData.role = formData.role
          hasUpdates = true
        }
        
        if (!userData?.phone && formData.phone.trim()) {
          // Format phone number for profile update
          const fullPhoneNumber = formData.phoneCountryCode === "Other" ? formData.phone : `${formData.phoneCountryCode.replace(" ", "")}${formData.phone}`
          updateData.phone = fullPhoneNumber
          hasUpdates = true
        }
        
        // Update user profile if there are any new fields
        if (hasUpdates) {
          try {
            await updateUserData(user.uid, updateData)
            console.log('✅ User profile updated with new information')
          } catch (updateError) {
            console.warn('⚠️ Could not update user profile:', updateError)
            // Continue with quote request even if profile update fails
          }
        }
      }

      // Format the full phone number for display
      const fullPhoneNumber =
        formData.phoneCountryCode === "Other" ? formData.phone : `${formData.phoneCountryCode} ${formData.phone}`

      // Create clean numeric phone number for database
      const cleanPhoneNumber = fullPhoneNumber.replace(/[\s\-\(\)]/g, '')

      // Separate lead data from quote data
      const leadData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        language: language,
        timestamp: new Date().toISOString(),
      }

      // Store business identification data locally for quote completion
      const quoteData = {
        identificationType: formData.identificationType,
        identification: formData.identification,
        // This will be completed when the quote is finished
      }

      // Store both lead and quote data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("quoteUserData", JSON.stringify({
          ...leadData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          fullPhone: fullPhoneNumber,
        }))
        localStorage.setItem("quoteBusinessData", JSON.stringify(quoteData))
      }

      // Import the lead capture service
      const { createLead, validateLeadData, storeLeadData } = await import('@/lib/lead-capture-service.js')
      
      // Validate the lead data (excluding business identification)
      const validation = validateLeadData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: fullPhoneNumber
      }) as { isValid: boolean; errors: string[] }
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }
      
      // Store lead data (without business identification)
      storeLeadData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        language: language
      })
      
      // Create the lead using the new cloud function
      console.log('Sending data to createLead:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        language: language
      })
      
      const result = await createLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        language: language
      }) as { success: boolean; leadId?: string; error?: string }
      
      console.log('createLead result:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred')
      }

      // Store the leadId for use in quote calculation
      if (result.leadId && typeof window !== "undefined") {
        localStorage.setItem("quoteLeadId", result.leadId)
      }

      setIsSubmitting(false)
      setIsSubmitted(true)
      
      // Redirect to quote page after a short delay only if not already on quote page
      setTimeout(() => {
        if (!isOnQuotePage) {
          router.push(`/${lang}/quote`)
        }
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting quote request:', error)
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting your request. Please try again.'
      alert(errorMessage)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        const isPhoneValid = validatePhone(formData.phone)
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          !emailError &&
          formData.phone &&
          isPhoneValid
        )
      case 2:
        const isIdValid =
          formData.identificationType === "passport" ||
          (formData.identificationType === "id" && validateIdCard(formData.identification)) ||
          (formData.identificationType === "ein" && validateEin(formData.identification)) ||
          (formData.identificationType === "rnc" && validateRnc(formData.identification))
        return formData.company && formData.role && formData.identification && isIdValid
      default:
        return false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitted) {
      e.preventDefault()

      if (currentStep < 2 && isStepValid(currentStep)) {
        nextStep()
      } else if (currentStep === 2 && !isSubmitting && isStepValid(currentStep)) {
        handleSubmit()
      }
    }
  }

  if (!content) {
    return null
  }

  const progress = (currentStep / 2) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] bg-background/95 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 shadow-xl grid grid-rows-[1fr_auto] p-0"
        onKeyDown={handleKeyDown}
      >
        <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#141823] hover:scrollbar-thumb-[#1a1f2e]">
          <DialogHeader className="relative">
            <DialogTitle className="sr-only">
              {isSubmitted
                ? language === "es"
                  ? "Datos Guardados Exitosamente"
                  : "Data Saved Successfully"
                : language === "es"
                  ? "Obtener Cotización"
                  : "Get a Quote"}
            </DialogTitle>
            {/* Logotype */}
            <div className="flex justify-center mb-6 mt-2">
              <Image src="/images/hermes-logo.svg" alt="Hermes Logo" width={240} height={80} className="w-auto h-16" />
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex justify-center items-center mb-4 mt-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
${
  step < currentStep || (isSubmitted && step <= currentStep)
    ? "bg-gradient-to-br from-[#315F8C] to-[#68DBFF] text-white"
    : step === currentStep && !isSubmitted
      ? "bg-white dark:bg-slate-900 border border-[#68DBFF] text-slate-600 dark:text-slate-300 shadow-[0_0_20px_rgba(104,219,255,0.6)]"
      : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
}
        before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-[#315F8C] before:to-[#68DBFF] before:opacity-0 before:blur-xl
        ${step <= currentStep && step !== currentStep ? "before:opacity-40" : ""}
        relative overflow-hidden
      `}
                >
                  {step < currentStep || (isSubmitted && step <= currentStep) ? (
                    <RenderIcon iconName="Check" className="w-5 h-5 relative z-10" />
                  ) : (
                    <span className="relative z-10 font-semibold">{step}</span>
                  )}
                </div>
                {step < 2 && (
                  <div
                    className={`w-16 h-0.5 transition-colors ${
                      step < currentStep || (isSubmitted && step < 2)
                        ? "bg-gradient-to-r from-[#315F8C] to-[#68DBFF]"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-4 mt-2">
            <h2 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#315F8C] to-[#68DBFF]">
              {isSubmitted
                ? language === "es"
                  ? "Datos Guardados Exitosamente"
                  : "Data Saved Successfully"
                : content.title}
            </h2>
          </div>

          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Form Steps */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onAnimationComplete={() => {
                    // Focus the appropriate input after animation completes
                    if (!isSubmitted) {
                      requestAnimationFrame(() => {
                        switch (currentStep) {
                          case 1:
                            firstNameRef.current?.focus()
                            break
                          case 2:
                            companyRef.current?.focus()
                            break
                        }
                      })
                    }
                  }}
                  className="space-y-4"
                >
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">
                            {content.labels.firstName}
                          </Label>
                          <Input
                            ref={firstNameRef}
                            id="firstName"
                            placeholder={content.placeholders.firstName}
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            required
                            disabled={isAuthenticated && !!userData?.firstName}
                            className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                              isAuthenticated && !!userData?.firstName ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                            }`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">
                            {content.labels.lastName}
                          </Label>
                          <Input
                            id="lastName"
                            placeholder={content.placeholders.lastName}
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            required
                            disabled={isAuthenticated && !!userData?.lastName}
                            className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                              isAuthenticated && !!userData?.lastName ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                            }`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                          {content.labels.email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={content.placeholders.email}
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          required
                          disabled={isAuthenticated && !!userData?.email}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            emailError ? "!border-[#E27D4A]" : ""
                          } ${
                            isAuthenticated && !!userData?.email ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                          }`}
                        />
                        {emailError && <p className="text-[#E27D4A] text-xs mt-1">{emailError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                          {content.labels.phone}
                        </Label>
                        <div className="flex">
                          <div className="relative">
                            <select
                              value={formData.phoneCountryCode}
                              onChange={(e) => {
                                updateFormData(
                                  "phoneCountryCode",
                                  e.target.value as "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other",
                                )
                                // Clear phone when country code changes
                                updateFormData("phone", "")
                              }}
                              disabled={isAuthenticated && !!userData?.phone}
                              className={`h-12 px-3 pr-10 border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-l-md focus:outline-none focus:border-[#315F8C] min-w-[120px] appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 ${
                                isAuthenticated && !!userData?.phone ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                              }`}
                            >
                              <option value="+1 (809)">+1 (809)</option>
                              <option value="+1 (829)">+1 (829)</option>
                              <option value="+1 (849)">+1 (849)</option>
                              <option value="Other">{language === "es" ? "Otro" : "Other"}</option>
                            </select>
                            <RenderIcon
                              iconName="ChevronDown"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                            />
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder={
                              formData.phoneCountryCode === "Other"
                                ? language === "es"
                                  ? "123456789"
                                  : "123456789"
                                : "000-0000"
                            }
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            required
                            disabled={isAuthenticated && !!userData?.phone}
                            className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 rounded-l-none flex-1 ${
                              isAuthenticated && !!userData?.phone ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                            }`}
                            maxLength={formData.phoneCountryCode === "Other" ? 15 : 8}
                          />
                        </div>
                        {formData.phoneCountryCode !== "Other" && formData.phone && !validatePhone(formData.phone) && (
                          <p className="text-[#E27D4A] text-xs mt-1">
                            {language === "es"
                              ? "Asegúrate de proporcionar un número de teléfono válido"
                              : "Make sure to provide a valid phone number"}
                          </p>
                        )}
                        {formData.phoneCountryCode === "Other" && formData.phone && !validatePhone(formData.phone) && (
                          <p className="text-[#E27D4A] text-xs mt-1">
                            {language === "es"
                              ? "Asegúrate de proporcionar un número de teléfono válido"
                              : "Make sure to provide a valid phone number"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-700 dark:text-slate-300">
                          {content.labels.company}
                        </Label>
                        <Input
                          ref={companyRef}
                          id="company"
                          placeholder={content.placeholders.company}
                          value={formData.company}
                          onChange={(e) => updateFormData("company", e.target.value)}
                          required
                          disabled={isAuthenticated && !!userData?.company}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            isAuthenticated && !!userData?.company ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="identification" className="text-slate-700 dark:text-slate-300">
                          {content.labels.identification}
                        </Label>
                        <div className="flex">
                          <div className="relative">
                            <select
                              value={formData.identificationType}
                              onChange={(e) => {
                                updateFormData("identificationType", e.target.value as "id" | "passport" | "ein" | "rnc")
                                // Clear identification when type changes
                                updateFormData("identification", "")
                              }}
                              className="h-12 px-3 pr-10 border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-l-md focus:outline-none focus:border-[#315F8C] min-w-[120px] appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                            >
                              <option value="ein">{content.labels.ein}</option>
                              <option value="rnc">{content.labels.rnc}</option>
                              <option value="id">{content.labels.idCard}</option>
                              <option value="passport">{content.labels.passport}</option>
                            </select>
                            <RenderIcon
                              iconName="ChevronDown"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                            />
                          </div>
                          <Input
                            id="identification"
                            placeholder={
                              formData.identificationType === "id"
                                ? content.placeholders.identificationId
                                : formData.identificationType === "passport"
                                  ? content.placeholders.identificationPassport
                                  : formData.identificationType === "ein"
                                    ? content.placeholders.identificationEin
                                    : formData.identificationType === "rnc"
                                      ? content.placeholders.identificationRnc
                                      : ""
                            }
                            value={formData.identification}
                            onChange={(e) => updateFormData("identification", e.target.value)}
                            required
                            className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 rounded-l-none flex-1"
                            maxLength={
                              formData.identificationType === "id" 
                                ? 13 
                                : formData.identificationType === "passport" 
                                  ? 8 
                                  : formData.identificationType === "ein"
                                    ? 9 
                                    : formData.identificationType === "rnc"
                                      ? 11
                                      : undefined
                            }
                          />
                        </div>
                        {formData.identificationType === "id" &&
                          formData.identification &&
                          !validateIdCard(formData.identification) && (
                            <p className="text-[#E27D4A] text-xs mt-1">
                              {language === "es"
                                ? "Asegúrate de proporcionar un número de cédula dominicana válido"
                                : "Make sure to provide a valid Dominican ID number"}
                            </p>
                          )}
                        {formData.identificationType === "ein" &&
                          formData.identification &&
                          !validateEin(formData.identification) && (
                            <p className="text-[#E27D4A] text-xs mt-1">
                              {language === "es"
                                ? "Asegúrate de proporcionar un número de EIN válido"
                                : "Make sure to provide a valid EIN number"}
                            </p>
                          )}
                        {formData.identificationType === "rnc" &&
                          formData.identification &&
                          !validateRnc(formData.identification) && (
                            <p className="text-[#E27D4A] text-xs mt-1">
                              {language === "es"
                                ? "Asegúrate de proporcionar un número de RNC válido"
                                : "Make sure to provide a valid RNC number"}
                            </p>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                          {content.labels.role}
                        </Label>
                        <Input
                          id="role"
                          placeholder={content.placeholders.role}
                          value={formData.role}
                          onChange={(e) => updateFormData("role", e.target.value)}
                          required
                          disabled={isAuthenticated && !!userData?.role}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            isAuthenticated && !!userData?.role ? "bg-background/50 border-[#68DBFF]/20 text-white/50 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-5 py-6 h-[60px] rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[15px] font-medium"
                >
                  <RenderIcon iconName="ChevronLeft" className="w-4 h-4" />
                  {language === "es" ? "Anterior" : "Previous"}
                </Button>

                {currentStep < 2 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className={`flex items-center gap-3 px-5 py-6 h-[60px] text-white rounded-xl transition-all duration-300 relative overflow-hidden group text-[15px] font-medium ${
                      !isStepValid(currentStep)
                        ? "bg-[#28415E] cursor-not-allowed border border-[#315F8C]"
                        : "bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] border-0"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                    <span className="relative z-10">{language === "es" ? "Siguiente" : "Next"}</span>
                    <RenderIcon iconName="ChevronRight" className="h-5 w-5 text-white relative z-10" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isStepValid(currentStep)}
                    className={`flex items-center gap-2 px-5 py-6 h-[60px] text-white rounded-xl transition-all duration-300 ${
                      isSubmitting || !isStepValid(currentStep)
                        ? "bg-[#28415E] cursor-not-allowed border border-[#315F8C]"
                        : "bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] border-0"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {content.submittingText}
                      </>
                    ) : (
                      <>
                        <RenderIcon iconName="ExternalLink" className="w-4 h-4" />
                        {content.submitButtonText}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#28415E]/20 to-[#315F8C]/20 rounded-full flex items-center justify-center">
                <RenderIcon iconName="CheckCircle" className="w-10 h-10 text-[#68DBFF]" />
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#315F8C] to-[#68DBFF]">
                {content.successMessage.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-sm">{content.successMessage.description}</p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-4 h-4 border-2 border-[#68DBFF] border-t-transparent rounded-full animate-spin" />
                {!isOnQuotePage
                  ? language === "es"
                    ? "Redirigiendo..."
                    : "Redirecting..."
                  : language === "es"
                    ? "Guardando..."
                    : "Saving..."}
              </div>
            </motion.div>
          )}
        </div>
        {/* Progress Bar as Bottom Border */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#315F8C] to-[#68DBFF] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
