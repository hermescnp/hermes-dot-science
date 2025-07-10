"use client"

import { useAuth } from "@/contexts/auth-context"
import { signOutUser, updateUserData } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { RenderIcon } from "@/components/icon-mapper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"
import Link from "next/link"

interface ProfileContent {
  title: string
  subtitle: string
  labels: Record<string, string>
  placeholders: Record<string, string>
  saveButtonText: string
  savingText: string
  signOutButtonText: string
  signingOutText: string
  successMessage: {
    title: string
    description: string
  }
}

export default function UserProfile() {
  const { user, userData, isAuthenticated, refreshUserData } = useAuth()
  const { language } = useLanguage()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [content, setContent] = useState<ProfileContent | null>(null)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState<"+1 (809)" | "+1 (829)" | "+1 (849)" | "Other">("+1 (809)")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isRefreshingAfterSave, setIsRefreshingAfterSave] = useState(false)
  
  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false)

  // Update form state when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "")
      setLastName(userData.lastName || "")
      setCompany(userData.company || "")
      setRole(userData.role || "")
      
      // Parse phone number and country code
      const userPhone = userData.phone || ""
      if (userPhone.startsWith("+1809")) {
        setPhoneCountryCode("+1 (809)")
        setPhone(userPhone.replace("+1809", ""))
      } else if (userPhone.startsWith("+1829")) {
        setPhoneCountryCode("+1 (829)")
        setPhone(userPhone.replace("+1829", ""))
      } else if (userPhone.startsWith("+1849")) {
        setPhoneCountryCode("+1 (849)")
        setPhone(userPhone.replace("+1849", ""))
      } else if (userPhone.startsWith("+1 (809)")) {
        setPhoneCountryCode("+1 (809)")
        setPhone(userPhone.replace("+1 (809) ", ""))
      } else if (userPhone.startsWith("+1 (829)")) {
        setPhoneCountryCode("+1 (829)")
        setPhone(userPhone.replace("+1 (829) ", ""))
      } else if (userPhone.startsWith("+1 (849)")) {
        setPhoneCountryCode("+1 (849)")
        setPhone(userPhone.replace("+1 (849) ", ""))
      } else if (userPhone) {
        setPhoneCountryCode("Other")
        setPhone(userPhone)
      } else {
        setPhoneCountryCode("+1 (809)")
        setPhone("")
      }
      
      // Reset changes when userData is loaded
      setHasChanges(false)
    }
  }, [userData])

  // Initialize content
  useEffect(() => {
    const profileContent: ProfileContent = {
      title: language === "es" ? "Mi Perfil" : "My Profile",
      subtitle: language === "es" ? "Gestiona tu información personal" : "Manage your personal information",
      labels: {
        firstName: language === "es" ? "Nombre" : "First Name",
        lastName: language === "es" ? "Apellido" : "Last Name",
        email: language === "es" ? "Correo Electrónico" : "Email",
        company: language === "es" ? "Empresa" : "Company",
        role: language === "es" ? "Rol" : "Role",
        phone: language === "es" ? "Teléfono" : "Phone",
        emailVerified: language === "es" ? "Email Verificado" : "Email Verified",
      },
      placeholders: {
        firstName: language === "es" ? "Tu nombre" : "Your first name",
        lastName: language === "es" ? "Tu apellido" : "Your last name",
        company: language === "es" ? "Tu empresa" : "Your company",
        role: language === "es" ? "Tu rol" : "Your role",
        phone: language === "es" ? "Tu teléfono" : "Your phone number",
      },
      saveButtonText: language === "es" ? "Guardar Cambios" : "Save Changes",
      savingText: language === "es" ? "Guardando..." : "Saving...",
      signOutButtonText: language === "es" ? "Cerrar Sesión" : "Sign Out",
      signingOutText: language === "es" ? "Cerrando sesión..." : "Signing out...",
      successMessage: {
        title: language === "es" ? "¡Perfil Actualizado!" : "Profile Updated!",
        description: language === "es" ? "Tu información ha sido guardada exitosamente." : "Your information has been saved successfully.",
      },
    }
    setContent(profileContent)
  }, [language])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutUser()
      // The auth context will automatically update when the user signs out
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Phone formatting function
  const formatPhone = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // If "Other" is selected, return numbers without formatting but limit to reasonable length
    if (phoneCountryCode === "Other") {
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

  // Phone validation function
  const validatePhone = (value: string): boolean => {
    if (phoneCountryCode === "Other") {
      // For "Other", just check if there are at least some digits
      return value.length >= 7
    }
    // Check if it matches the format 000-0000 (exactly 7 digits)
    const phoneRegex = /^\d{3}-\d{4}$/
    return phoneRegex.test(value)
  }

  // Handle phone change with formatting and validation
  const handlePhoneChange = (value: string) => {
    const formattedValue = formatPhone(value)
    setPhone(formattedValue)
    
    if (!formattedValue) {
      setPhoneError(null)
    } else if (!validatePhone(formattedValue)) {
      setPhoneError(
        language === "es"
          ? "Asegúrate de proporcionar un número de teléfono válido"
          : "Make sure to provide a valid phone number"
      )
    } else {
      setPhoneError(null)
    }
  }

  // Handle phone country code change
  const handlePhoneCountryCodeChange = (value: "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other") => {
    setPhoneCountryCode(value)
    // Clear phone when country code changes
    setPhone("")
    setPhoneError(null)
  }

  // Check if form has changes compared to original userData
  const checkForChanges = () => {
    if (!userData) return false
    
    // Format full phone number for comparison
    const fullPhoneNumber = phoneCountryCode === "Other" ? phone : `${phoneCountryCode.replace(" ", "")}${phone}`
    
    return (
      firstName !== (userData.firstName || "") ||
      lastName !== (userData.lastName || "") ||
      company !== (userData.company || "") ||
      role !== (userData.role || "") ||
      fullPhoneNumber !== (userData.phone || "")
    )
  }

  // Update hasChanges whenever form fields change
  useEffect(() => {
    const newHasChanges = checkForChanges()
    setHasChanges(newHasChanges)
    
    // Hide success banner when user makes new changes (but not when refreshing after save)
    if (newHasChanges && isSaved && !isRefreshingAfterSave) {
      setIsSaved(false)
    }
  }, [firstName, lastName, company, role, phone, phoneCountryCode, userData, isSaved, isRefreshingAfterSave])

  const handleSave = async () => {
    if (!user?.uid) {
      console.error('No user UID available')
      return
    }

    setIsSaving(true)
    try {
      // Update user data in Firestore
      const result = await updateUserData(user.uid, {
        firstName,
        lastName,
        company,
        role,
        phone: phoneCountryCode === "Other" ? phone : `${phoneCountryCode.replace(" ", "")}${phone}`
      }) as { success: boolean; message?: string; error?: string }

      if (result.success) {
        setIsSaved(true)
        // Remove the setTimeout - banner will stay visible until user makes new changes
        // Refresh user data to get the updated information
        setIsRefreshingAfterSave(true)
        await refreshUserData()
        setIsRefreshingAfterSave(false)
      } else {
        console.error('Error updating user data:', result.error)
        // You could add error state handling here if needed
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (!content) {
    return <LoadingSpinner text={language === "es" ? "Cargando..." : "Loading..."} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Logo */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/">
          <Image
            src="/images/hermes-logo.svg"
            alt="Hermes Dot Science"
            width={200}
            height={50}
            className="h-12 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Centered Profile Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto">
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

          {/* Profile Form Card */}
          <Card className="bg-background/80 backdrop-blur-md border-[#68DBFF]/20 shadow-2xl">
            <CardContent className="pt-6">
              {/* Success Message */}
              {isSaved && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-green-400 font-medium">{content.successMessage.title}</h4>
                      <p className="text-green-400/80 text-sm">{content.successMessage.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{content.labels.firstName}</Label>
                    <Input
                      id="firstName"
                      placeholder={content.placeholders.firstName}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{content.labels.lastName}</Label>
                    <Input
                      id="lastName"
                      placeholder={content.placeholders.lastName}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{content.labels.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 bg-gray-800/50 text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">{content.labels.company}</Label>
                  <Input
                    id="company"
                    placeholder={content.placeholders.company}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">{content.labels.role}</Label>
                  <Input
                    id="role"
                    placeholder={content.placeholders.role}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{content.labels.phone}</Label>
                  <div className="flex">
                    <div className="relative">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => {
                          handlePhoneCountryCodeChange(
                            e.target.value as "+1 (809)" | "+1 (829)" | "+1 (849)" | "Other",
                          )
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
                        phoneCountryCode === "Other"
                          ? language === "es"
                            ? "123456789"
                            : "123456789"
                          : "000-0000"
                      }
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`h-12 border-slate-200 dark:border-slate-700 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none focus:!border-[#315F8C] focus:!bg-black/30 rounded-l-none flex-1 ${
                        phoneError ? "!border-[#E27D4A]" : ""
                      }`}
                      maxLength={phoneCountryCode === "Other" ? 15 : 8}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[#E27D4A] text-xs mt-1">{phoneError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{content.labels.emailVerified}</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-white/70">
                      {user.emailVerified 
                        ? (language === "es" ? "Verificado" : "Verified")
                        : (language === "es" ? "No verificado" : "Not verified")
                      }
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className={`w-full h-[60px] py-6 transition-all duration-300 rounded-xl ${
                      hasChanges && !isSaving
                        ? "bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white shadow-none hover:shadow-[0_0_30px_rgba(104,219,255,0.6)]"
                        : "bg-background/50 border border-[#68DBFF]/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? content.savingText : content.saveButtonText}
                  </Button>

                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    variant="outline"
                    className="w-full h-[60px] py-6 border-[#E27D4A] text-[#E27D4A] hover:bg-[#E27D4A]/10 hover:border-[#E27D4A]/80 transition-all duration-300 rounded-xl"
                  >
                    {isSigningOut ? content.signingOutText : content.signOutButtonText}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 