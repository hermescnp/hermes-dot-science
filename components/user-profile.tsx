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
  
  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false)

  // Update form state when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "")
      setLastName(userData.lastName || "")
      setCompany(userData.company || "")
      setRole(userData.role || "")
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
        emailVerified: language === "es" ? "Email Verificado" : "Email Verified",
      },
      placeholders: {
        firstName: language === "es" ? "Tu nombre" : "Your first name",
        lastName: language === "es" ? "Tu apellido" : "Your last name",
        company: language === "es" ? "Tu empresa" : "Your company",
        role: language === "es" ? "Tu rol" : "Your role",
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

  // Check if form has changes compared to original userData
  const checkForChanges = () => {
    if (!userData) return false
    
    return (
      firstName !== (userData.firstName || "") ||
      lastName !== (userData.lastName || "") ||
      company !== (userData.company || "") ||
      role !== (userData.role || "")
    )
  }

  // Update hasChanges whenever form fields change
  useEffect(() => {
    setHasChanges(checkForChanges())
  }, [firstName, lastName, company, role, userData])

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
        role
      }) as { success: boolean; message?: string; error?: string }

      if (result.success) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
        // Refresh user data to get the updated information
        await refreshUserData()
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