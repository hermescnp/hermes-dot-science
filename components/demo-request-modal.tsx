"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

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
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [content, setContent] = useState<ContactFormContent | null>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    size: "",
    message: "",
  })
  const [sizeSliderValue, setSizeSliderValue] = useState([0])
  const { language, t } = useLanguage()

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
            company: language === "es" ? "Empresa/Organización" : "Company/Organization",
            role: language === "es" ? "Tu Rol" : "Your Role",
            size: language === "es" ? "Tamaño de Organización" : "Organization Size",
            message: language === "es" ? "¿Cómo podemos ayudarte?" : "How can we help?",
          },
          placeholders: {
            firstName: "Juan",
            lastName: "Pérez",
            email: "juan.perez@empresa.com",
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
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        role: "",
        size: organizationSizes[0]?.value || "",
        message: "",
      })
      setSizeSliderValue([0])
    } else {
      // Set initial size when modal opens
      if (!formData.size) {
        setFormData((prev) => ({ ...prev, size: organizationSizes[0]?.value || "" }))
      }
    }
  }, [isOpen])

  // Remove the existing auto-focus useEffect and replace with this:

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // Update the updateFormData function to only show error when email is not empty
  const updateFormData = (field: keyof FormData, value: string) => {
    console.log(`Updating ${field} to ${value}`)

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

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && !emailError
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
            {/* Logotype */}
            <div className="flex justify-center mb-6 mt-2">
              <Image src="/images/hermes-logo.svg" alt="Hermes Logo" width={240} height={80} className="w-auto h-16" />
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex justify-center items-center mb-4">
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
                            className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
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
                            className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
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
                          className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 ${
                            emailError ? "!border-[#E27D4A]" : ""
                          }`}
                        />
                        {emailError && <p className="text-[#E27D4A] text-xs mt-1">{emailError}</p>}
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
                          className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
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
                          className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
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
                        {content.submittingText}
                      </>
                    ) : (
                      <>
                        <RenderIcon iconName="Zap" className="w-4 h-4" />
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
              <Button
                onClick={onClose}
                className="mt-6 bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 shadow-none hover:shadow-[0_0_35px_rgba(104,219,255,0.7)] px-5 py-6 h-[60px] transition-all duration-300"
              >
                Close dialog
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
