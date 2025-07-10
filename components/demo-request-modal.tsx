"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useAnimation } from "@/contexts/animation-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { updateUserData } from "@/lib/auth-service"

interface DemoRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ContactFormContent {
  title: string
  description: string
  labels: Record<string, string>
  placeholders: Record<string, string>
  selectOptions: {
    organizationSize: Array<{ value: string; label: string }>
  }
  submitButtonText: string
  submittingText: string
  responseNote: string
  successMessage: {
    title: string
    description: string
    buttonText: string
  }
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  company: string
  role: string
  size: string
  message: string
  phoneCountryCode: "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other"
  phone: string
  language?: string
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [content, setContent] = useState<ContactFormContent | null>(null)
  const { language, t } = useLanguage()
  const { user, userData, isAuthenticated } = useAuth()
  const { pauseAnimations, resumeAnimations } = useAnimation()
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    size: "",
    message: "",
    phoneCountryCode: "+1 (809)",
    phone: "",
  })
  const [sizeSliderValue, setSizeSliderValue] = useState([0])

  const firstNameRef = useRef<HTMLInputElement>(null)
  const companyRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // Organization size options
  const organizationSizes = [
    { value: "1-50", label: language === "es" ? "1-50 empleados" : "1-50 employees" },
    { value: "51-200", label: language === "es" ? "51-200 empleados" : "51-200 employees" },
    { value: "201-500", label: language === "es" ? "201-500 empleados" : "201-500 employees" },
    { value: "501-1000", label: language === "es" ? "501-1000 empleados" : "501-1000 employees" },
    { value: "1001+", label: language === "es" ? "1001+ empleados" : "1001+ employees" },
    { value: "government", label: language === "es" ? "Agencia Gubernamental" : "Government Agency" },
  ]

  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/contact-form?lang=${language}`)
        if (!response.ok) throw new Error("Failed to fetch contact form content")
        const data = await response.json()
        setContent(data.form)
      } catch (error) {
        console.error("Error fetching contact form content:", error)
        setContent({
          title: language === "es" ? "Solicitar Demo" : "Request Demo",
          description:
            language === "es"
              ? "Completa este formulario para solicitar una demo personalizada."
              : "Complete this form to request a personalized demo.",
          labels: {
            firstName: language === "es" ? "Nombre" : "First Name",
            lastName: language === "es" ? "Apellido" : "Last Name",
            email: language === "es" ? "Email de Trabajo" : "Work Email",
            phone: language === "es" ? "Teléfono" : "Phone Number",
            company: language === "es" ? "Empresa/Organización" : "Company/Organization",
            role: language === "es" ? "Tu Rol" : "Your Role",
            size: language === "es" ? "Tamaño de Organización" : "Organization Size",
            message: language === "es" ? "¿Cómo podemos ayudarte?" : "How can we help?",
          },
          placeholders: {
            firstName: "Juan",
            lastName: "Pérez",
            email: "juan.perez@empresa.com",
            phone: language === "es" ? "+57 300 123 4567" : "+1 (555) 123-4567",
            company: "Acme Inc.",
            role: "CTO, Director de TI, etc.",
            message:
              language === "es"
                ? "Cuéntanos sobre tus requisitos específicos..."
                : "Tell us about your specific requirements...",
            organizationSize: language === "es" ? "Seleccionar tamaño de organización" : "Select organization size",
          },
          selectOptions: {
            organizationSize: organizationSizes,
          },
          submitButtonText: language === "es" ? "Solicitar Demo" : "Request Demo",
          submittingText: language === "es" ? "Enviando..." : "Submitting...",
          responseNote: "",
          successMessage: {
            title: language === "es" ? "¡Demo Solicitada!" : "Demo Requested!",
            description:
              language === "es"
                ? "Nuestro equipo te contactará pronto para programar tu demo personalizada."
                : "Our team will contact you soon to schedule your personalized demo.",
            buttonText: language === "es" ? "Cerrar" : "Close",
          },
        })
      }
    }
    fetchContent()
  }, [language])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setIsSubmitted(false)
      setEmailError(null) // Add this line to clear email error state
      setPhoneError(null) // Clear phone error state
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        role: "",
        size: organizationSizes[0]?.value || "",
        message: "",
        phoneCountryCode: "+1 (809)",
        phone: "",
      })
      setSizeSliderValue([0])
    } else {
      // Set initial size when modal opens
      if (!formData.size) {
        setFormData((prev) => ({ ...prev, size: organizationSizes[0]?.value || "" }))
      }
    }
  }, [isOpen])

  // Auto-fill form data when user is authenticated and modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && userData) {
      setFormData((prev) => ({
        ...prev,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || user?.email || "",
        company: userData.company || "",
        role: userData.role || "",
        phone: userData.phone || "",
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

  // Focus first input when modal opens
  // useEffect(() => {
  //   if (isOpen && !isSubmitted) {
  //     setTimeout(() => {
  //       if (currentStep === 1) {
  //         firstNameRef.current?.focus()
  //       } else if (currentStep === 2) {
  //         companyRef.current?.focus()
  //       } else if (currentStep === 3) {
  //         messageRef.current?.focus()
  //       }
  //     }, 300)
  //   }
  // }, [isOpen])

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

  const validatePhone = (value: string): boolean => {
    if (formData.phoneCountryCode === "Other") {
      // For "Other", just check if there are at least some digits
      return value.length >= 7
    }
    // Check if it matches the format 000-0000 (exactly 7 digits)
    const phoneRegex = /^\d{3}-\d{4}$/
    return phoneRegex.test(value)
  }

  // Update the updateFormData function to only show error when email is not empty
  const updateFormData = (field: keyof FormData, value: string) => {
    console.log(`Updating ${field} to ${value}`)

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

    // Validate phone when it changes
    if (field === "phone") {
      if (!value) {
        setPhoneError(null)
      } else if (!validatePhone(value)) {
        setPhoneError(
          language === "es"
            ? "Asegúrate de proporcionar un número de teléfono válido"
            : "Make sure to provide a valid phone number"
        )
      } else {
        setPhoneError(null)
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSizeSliderChange = (value: number[]) => {
    setSizeSliderValue(value)
    const selectedSize = organizationSizes[value[0]]
    if (selectedSize) {
      updateFormData("size", selectedSize.value)
    }
  }

  const decreaseSize = () => {
    const newValue = Math.max(0, sizeSliderValue[0] - 1)
    handleSizeSliderChange([newValue])
  }

  const increaseSize = () => {
    const newValue = Math.min(organizationSizes.length - 1, sizeSliderValue[0] + 1)
    handleSizeSliderChange([newValue])
  }

  const nextStep = () => {
    if (currentStep < 3) {
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
      // Import the lead capture service
      const { createDemoRequest, validateLeadData, storeLeadData } = await import('@/lib/lead-capture-service.js')
      
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
          const fullPhoneNumber = formData.phoneCountryCode === "Other" ? formData.phone : `${formData.phoneCountryCode} ${formData.phone}`
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
            // Continue with demo request even if profile update fails
          }
        }
      }
      
            // Format phone number for display
      // If phone is auto-filled from user data, use it as is (it already contains the full number)
      // Otherwise, combine country code with phone number
      const fullPhoneNumber = isAuthenticated && userData?.phone && userData.phone.trim() !== "" 
        ? formData.phone 
        : (formData.phoneCountryCode === "Other" ? formData.phone : `${formData.phoneCountryCode} ${formData.phone}`)
      
      // Create clean numeric phone number for database
      const cleanPhoneNumber = fullPhoneNumber.replace(/[\s\-\(\)]/g, '')
      
      // Validate the data with the full phone number
      const validation = validateLeadData({
        ...formData,
        phone: fullPhoneNumber
      }) as { isValid: boolean; errors: string[] }
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }
      
      // Store lead data for potential future use
      storeLeadData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        organizationSize: formData.size,
        language: language
      })
      
      // Create the demo request
      const result = await createDemoRequest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: cleanPhoneNumber,
        message: formData.message,
        organizationSize: formData.size,
        language: language
      }) as { success: boolean; data?: any; error?: string }
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred')
      }
      
      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting demo request:', error)
      setIsSubmitting(false)
      // You can add error handling UI here if needed
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting your request. Please try again.'
      alert(errorMessage)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && !emailError && !phoneError
      case 2:
        return formData.company && formData.role
      case 3:
        return true // Message is optional
      default:
        return false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitted) {
      e.preventDefault()

      if (currentStep < 3 && isStepValid(currentStep)) {
        nextStep()
      } else if (currentStep === 3 && !isSubmitting) {
        handleSubmit()
      }
    }
  }

  if (!content) {
    return null
  }

  const progress = (currentStep / 3) * 100
  const selectedSizeLabel = organizationSizes[sizeSliderValue[0]]?.label || content.placeholders.organizationSize

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
                  ? "Demo Solicitada Exitosamente"
                  : "Demo Requested Successfully"
                : language === "es"
                  ? "Solicitar una Demo"
                  : "Request a Demo"}
            </DialogTitle>
            {/* Logotype */}
            <div className="flex justify-center mb-8 mt-2">
              <Image src="/images/hermes-logo.svg" alt="Hermes Logo" width={240} height={80} className="w-auto h-16" />
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex justify-center items-center mb-4 mt-4">
            {[1, 2, 3].map((step) => (
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
                {step < 3 && (
                  <div
                    className={`w-16 h-0.5 transition-colors ${
                      step < currentStep || (isSubmitted && step < 3)
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
                  ? "Demo Solicitada Exitosamente"
                  : "Demo Requested Successfully"
                : language === "es"
                  ? "Solicitar una Demo"
                  : "Request a Demo"}
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
                          case 3:
                            messageRef.current?.focus()
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
                            disabled={isAuthenticated}
                            className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                              isAuthenticated ? "bg-gray-800/50 text-gray-400 cursor-not-allowed" : ""
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
                            disabled={isAuthenticated}
                            className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                              isAuthenticated ? "bg-gray-800/50 text-gray-400 cursor-not-allowed" : ""
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
                          disabled={isAuthenticated}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            emailError ? "!border-[#E27D4A]" : ""
                          } ${
                            isAuthenticated ? "bg-gray-800/50 text-gray-400 cursor-not-allowed" : ""
                          }`}
                        />
                        {emailError && <p className="text-[#E27D4A] text-xs mt-1">{emailError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                          {content.labels.phone}
                        </Label>
                        {isAuthenticated && userData?.phone && userData.phone.trim() !== "" ? (
                          // Simple input field for auto-filled phone
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            disabled
                            className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 bg-gray-800/50 text-gray-400 cursor-not-allowed"
                          />
                        ) : (
                          // Dropdown + input combination for manual entry
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
                                className="h-12 px-3 pr-10 border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-l-md focus:outline-none focus:border-[#315F8C] min-w-[120px] appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
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
                              className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 rounded-l-none flex-1 ${
                                phoneError ? "!border-[#E27D4A]" : ""
                              }`}
                              maxLength={formData.phoneCountryCode === "Other" ? 15 : 8}
                            />
                          </div>
                        )}
                        {phoneError && <p className="text-[#E27D4A] text-xs mt-1">{phoneError}</p>}
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
                          disabled={!!(isAuthenticated && userData?.company && userData.company.trim() !== "")}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            isAuthenticated && userData?.company && userData.company.trim() !== "" ? "bg-gray-800/50 text-gray-400 cursor-not-allowed" : ""
                          }`}
                        />
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
                          disabled={!!(isAuthenticated && userData?.role && userData.role.trim() !== "")}
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            isAuthenticated && userData?.role && userData.role.trim() !== "" ? "bg-gray-800/50 text-gray-400 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-slate-700 dark:text-slate-300">{content.labels.size}</Label>
                        <div className="space-y-4">
                          {/* Selected Value Display */}
                          <div className="text-center h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-lg font-normal bg-clip-text text-transparent bg-gradient-to-r from-[#315F8C] to-[#68DBFF]">
                              {selectedSizeLabel}
                            </div>
                          </div>

                          {/* Slider with Arrow Controls */}
                          <div className="flex items-center space-x-4">
                            {/* Left Arrow */}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={decreaseSize}
                              disabled={sizeSliderValue[0] === 0}
                              className="h-10 w-10 rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={
                                language === "es" ? "Disminuir tamaño de organización" : "Decrease organization size"
                              }
                            >
                              <RenderIcon iconName="ChevronLeft" className="w-4 h-4" />
                            </Button>

                            {/* Slider */}
                            <div className="flex-1 px-3">
                              <Slider
                                value={sizeSliderValue}
                                onValueChange={handleSizeSliderChange}
                                max={organizationSizes.length - 1}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            {/* Right Arrow */}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={increaseSize}
                              disabled={sizeSliderValue[0] === organizationSizes.length - 1}
                              className="h-10 w-10 rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={
                                language === "es" ? "Aumentar tamaño de organización" : "Increase organization size"
                              }
                            >
                              <RenderIcon iconName="ChevronRight" className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Size Labels */}
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                            <span>{organizationSizes[0]?.label}</span>
                            <span>{organizationSizes[organizationSizes.length - 1]?.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-700 dark:text-slate-300">
                          {content.labels.message}
                        </Label>
                        <Textarea
                          ref={messageRef}
                          id="message"
                          placeholder={content.placeholders.message}
                          value={formData.message}
                          onChange={(e) => updateFormData("message", e.target.value)}
                          rows={4}
                          className="border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                        />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {language === "es"
                          ? "Este campo es opcional. Puedes dejarlo en blanco si no tienes requisitos específicos."
                          : "This field is optional. You can leave it blank if you don't have specific requirements."}
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

                {currentStep < 3 ? (
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
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-5 py-6 h-[60px] text-white rounded-xl transition-all duration-300 ${
                      isSubmitting
                        ? "bg-[#28415E] cursor-not-allowed border border-[#315F8C]"
                        : "bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] border-0"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === "es" ? "Enviando Solicitud..." : "Sending Request..."}
                      </>
                    ) : (
                      <>
                        <RenderIcon iconName="Zap" className="w-4 h-4" />
                        {language === "es" ? "Enviar Solicitud" : "Send Request"}
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
              <Button
                onClick={onClose}
                className="mt-6 bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] px-5 py-6 h-[60px] transition-all duration-300"
              >
                {language === "es" ? "Cerrar diálogo" : "Close dialog"}
              </Button>
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
