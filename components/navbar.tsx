"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User } from "lucide-react"
import { LanguageToggle } from "@/components/language-toggle"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { MobileBackButton } from "@/components/learn-more/navigation-ui"
import { createPortal } from "react-dom"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { HERMES_SCIENCE_URL } from "@/lib/config"

interface NavItem {
  label: string
  href: string
}

interface EnterOfficeButtonContent {
  href: string
  imageSrc: string
  imageAlt: string
  mainText: string
  subText: string
}

interface NavbarContent {
  logoImage: string
  logoAlt: string
  navItems: NavItem[]
  enterOfficeButton: EnterOfficeButtonContent
}

export default function Navbar() {
  const { language, t } = useLanguage()
  const { user, userData, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [content, setContent] = useState<NavbarContent | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isPositionReady, setIsPositionReady] = useState(false)
  const router = useRouter()

  const pathname = usePathname()
  const isLearnMorePage = pathname?.includes("/learn-more")

  // Update button position when dropdown opens
  useEffect(() => {
    if (isAuthOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonPosition({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right - 12,
      })
      // Add a small delay to ensure smooth positioning
      setTimeout(() => setIsPositionReady(true), 10)
    } else {
      setIsPositionReady(false)
    }
  }, [isAuthOpen])

  useEffect(() => {
    const fetchNavbarContent = async () => {
      try {
        // Always fetch the main navbar content
        const response = await fetch(`/api/content/navbar?lang=${language}`)
        if (!response.ok) {
          throw new Error("Failed to fetch navbar content")
        }
        const data = await response.json()

        // Override navigation items if on Learn More page
        if (isLearnMorePage) {
          data.navItems = [
            { label: language === "es" ? "Resumen" : "Overview", href: "#hero" },
            { label: language === "es" ? "Oferta" : "Offering", href: "#offering" },
            { label: language === "es" ? "Beneficios" : "Benefits", href: "#benefits" },
            { label: language === "es" ? "Proceso" : "Process", href: "#process" },
          ]
        }

        setContent(data)
      } catch (error) {
        console.error("Error fetching navbar content:", error)
        // Fallback content - different based on page
        const fallbackNavItems = isLearnMorePage
          ? [
              { label: language === "es" ? "Resumen" : "Overview", href: "#hero" },
              { label: language === "es" ? "Oferta" : "Offering", href: "#offering" },
              { label: language === "es" ? "Beneficios" : "Benefits", href: "#benefits" },
              { label: language === "es" ? "Proceso" : "Process", href: "#process" },
            ]
          : [
              { label: language === "es" ? "Plataformas" : "Platforms", href: "#platforms" },
              { label: language === "es" ? "Casos de Uso" : "Use Cases", href: "#use-cases" },
              { label: language === "es" ? "Comunidad" : "Community", href: "#community" },
              { label: language === "es" ? "Contacto" : "Contact", href: "#contact" },
            ]

        setContent({
          logoImage: "/images/hermes-logo.svg",
          logoAlt: "Hermes Dot Science",
          navItems: fallbackNavItems,
          enterOfficeButton: {
            href: HERMES_SCIENCE_URL,
            imageSrc: "/images/office-logo.svg",
            imageAlt: language === "es" ? "Laboratorio Hermes Science" : "Hermes Science Lab",
            mainText: language === "es" ? "ENTRAR OFICINA" : "ENTER OFFICE",
            subText: language === "es" ? "Laboratorio Hermes Science" : "Hermes Science Lab",
          },
        })
      }
    }
    fetchNavbarContent()
  }, [language, isLearnMorePage])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const shouldHaveBorder = currentScrollY > 80
      if (shouldHaveBorder !== hasScrolled) {
        setHasScrolled(shouldHaveBorder)
      }
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [hasScrolled])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isAuthOpen && !target.closest(".auth-dropdown-container") && !target.closest(".auth-dropdown-portal")) {
        setIsAuthOpen(false)
      }
    }

    if (isAuthOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAuthOpen])

  const smoothScrollTo = useCallback((targetPosition: number, duration = 600) => {
    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const startTime = performance.now()
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }
    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)
      window.scrollTo(0, startPosition + distance * easedProgress)
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }
    requestAnimationFrame(animateScroll)
  }, [])

  const handleNavItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Always prevent default behavior first thing
      e.preventDefault()
      e.stopPropagation()

      console.log("Nav item clicked:", href, "Is Learn More page:", isLearnMorePage)

      const targetId = href.replace("#", "")
      let targetElement: HTMLElement | null = null

      if (isLearnMorePage) {
        // For Learn More page, use snap scrolling approach
        console.log("Looking for Learn More section:", targetId)

        // Map the target IDs to actual section indices for snap scrolling
        const sectionMap: { [key: string]: number } = {
          hero: 0,
          offering: 1,
          benefits: 2,
          process: 3,
        }

        const sectionIndex = sectionMap[targetId]
        if (sectionIndex !== undefined) {
          console.log("Scrolling to section index:", sectionIndex)
          // Use the same approach as the Learn More navigation arrows
          const sections = ["hero", "offering", "benefits", "process"]
          const sectionId = sections[sectionIndex]

          // Find the section element
          targetElement =
            document.getElementById(sectionId) ||
            (document.querySelector(`[id*="${sectionId}"]`) as HTMLElement) ||
            (document.querySelectorAll(".min-h-screen")[sectionIndex] as HTMLElement)

          if (targetElement) {
            // Use scrollIntoView for better snap scroll compatibility
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            })
          } else {
            console.warn(`Section element not found for: ${sectionId}`)
          }
        }
      } else {
        // For main page, use the original approach with section-specific offsets
        console.log("Looking for main page section:", targetId)
        targetElement = document.getElementById(targetId)

        if (targetElement) {
          let targetPosition: number
          const elementTop = targetElement.getBoundingClientRect().top + window.scrollY
          const navbarHeight = 80 // Base navbar height

          // Apply different offsets based on section
          let sectionOffset = 0
          if (targetId === "community") {
            // Community section looks good as is (add 30px more)
            sectionOffset = navbarHeight + 30
          } else if (targetId === "platforms") {
            // Platforms section needs to be higher (add 30px more)
            sectionOffset = navbarHeight - 40
          } else if (targetId === "use-cases") {
            // Use cases section needs to be higher (add 30px more)
            sectionOffset = navbarHeight - 60
          } else if (targetId === "contact") {
            // Contact section needs to scroll to show the title "Join Dot Science Ecosystem"
            sectionOffset = navbarHeight - 60
          } else {
            // Default offset for other sections (add 30px more)
            sectionOffset = navbarHeight - 40
          }

          targetPosition = elementTop + sectionOffset
          console.log(`Scrolling to ${targetId} with offset ${sectionOffset}, position: ${targetPosition}`)
          smoothScrollTo(targetPosition, 1000)
        } else {
          console.warn(`Target element not found for: ${targetId}`)
        }
      }

      // Close mobile menu if open
      if (isOpen) {
        setIsOpen(false)
      }
    },
    [isLearnMorePage, isOpen, smoothScrollTo],
  )

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isLearnMorePage) {
        // If on Learn More page, navigate to home page
        // Don't prevent default - let it navigate
      } else {
        // If on home page, scroll to top
        e.preventDefault()
        smoothScrollTo(0, 800)
      }
    },
    [isLearnMorePage, smoothScrollTo],
  )

  const handleSignInClick = () => {
    console.log("Sign In clicked")
    setIsAuthOpen(false)
    router.push(`/${language}/sign-in`)
  }

  const handleSignUpClick = () => {
    console.log("Sign Up clicked")
    setIsAuthOpen(false)
    router.push(`/${language}/sign-up`)
  }

  const handleSignOut = async () => {
    try {
      const { signOutUser } = await import('@/lib/auth-service')
      await signOutUser()
      setIsAuthOpen(false)
      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Get user's first letter for avatar
  const getUserInitial = () => {
    if (userData?.firstName) {
      return userData.firstName.charAt(0).toUpperCase()
    }
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Authentication Dropdown Portal Component
  const AuthDropdown = () => {
    if (!isAuthOpen || !isPositionReady) return null

    return createPortal(
      <div
        className="auth-dropdown-portal fixed"
        style={{
          top: `${buttonPosition.top}px`,
          right: `${buttonPosition.right}px`,
          zIndex: 2147483647,
          opacity: isPositionReady ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
      >
        {/* Main dropdown container with integrated speech bubble design */}
        <div className="relative">
          {/* Speech bubble container - single unified element */}
          <div
            className="relative w-80 rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0A1727 0%, #0D1B2A 100%)",
              border: "1px solid #68DBFF",
              boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.9),
              0 0 0 1px rgba(104, 219, 255, 0.2),
              0 0 30px rgba(104, 219, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
              marginTop: "8px",
            }}
          >
            {/* Speech bubble tail - created with CSS pseudo-elements for seamless integration */}

            {/* Glow effect overlay */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(104, 219, 255, 0.1) 0%, transparent 70%)",
              }}
            />

            {/* Content container */}
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                {isAuthenticated ? (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#68DBFF]/20 border border-[#68DBFF]/40">
                    <div className="text-2xl font-light text-[#68DBFF]">
                      {getUserInitial()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#68DBFF]/20 border border-[#68DBFF]/40">
                    <User className="w-6 h-6 text-[#68DBFF]" strokeWidth={2} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white leading-tight">
                    {isAuthenticated 
                      ? (language === "es" ? "Mi Cuenta" : "My Account")
                      : (language === "es" ? "Acceso de Usuario" : "User Access")
                    }
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    {isAuthenticated
                      ? (language === "es" ? "Gestiona tu perfil" : "Manage your profile")
                      : (language === "es" ? "Gestiona tu cuenta" : "Manage your account")
                    }
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* Profile Button */}
                    <button
                      onClick={() => {
                        setIsAuthOpen(false)
                        router.push(`/${language}/profile`)
                      }}
                      className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(104, 219, 255, 0.08) 0%, rgba(104, 219, 255, 0.03) 100%)",
                        border: "1px solid rgba(104, 219, 255, 0.2)",
                      }}
                    >
                      {/* Hover effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(104, 219, 255, 0.15) 0%, rgba(104, 219, 255, 0.08) 100%)",
                        }}
                      />

                      <div className="relative flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#68DBFF]/10 group-hover:bg-[#68DBFF]/20 transition-colors duration-300">
                            <svg className="w-5 h-5 text-[#68DBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-[#68DBFF] transition-colors duration-300">
                              {language === "es" ? "Mi Perfil" : "My Profile"}
                            </div>
                            <div className="text-sm text-white/60 mt-0.5">
                              {language === "es" ? "Ver y editar perfil" : "View and edit profile"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(226, 125, 74, 0.08) 0%, rgba(226, 125, 74, 0.03) 100%)",
                        border: "1px solid rgba(226, 125, 74, 0.2)",
                      }}
                    >
                      {/* Hover effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(226, 125, 74, 0.15) 0%, rgba(226, 125, 74, 0.08) 100%)",
                        }}
                      />

                      <div className="relative flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E27D4A]/10 group-hover:bg-[#E27D4A]/20 transition-colors duration-300">
                            <svg className="w-5 h-5 text-[#E27D4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-[#E27D4A] transition-colors duration-300">
                              {language === "es" ? "Cerrar Sesión" : "Sign Out"}
                            </div>
                            <div className="text-sm text-white/60 mt-0.5">
                              {language === "es" ? "Salir de tu cuenta" : "Sign out of your account"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Sign In Button */}
                    <button
                      onClick={handleSignInClick}
                      className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(104, 219, 255, 0.08) 0%, rgba(104, 219, 255, 0.03) 100%)",
                        border: "1px solid rgba(104, 219, 255, 0.2)",
                      }}
                    >
                      {/* Hover effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(104, 219, 255, 0.15) 0%, rgba(104, 219, 255, 0.08) 100%)",
                        }}
                      />

                      <div className="relative flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#68DBFF]/10 group-hover:bg-[#68DBFF]/20 transition-colors duration-300">
                            <svg className="w-5 h-5 text-[#68DBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-[#68DBFF] transition-colors duration-300">
                              {language === "es" ? "Iniciar Sesión" : "Sign In"}
                            </div>
                            <div className="text-sm text-white/60 mt-0.5">
                              {language === "es" ? "Accede con tu cuenta" : "Access your account"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Sign Up Button */}
                    <button
                      onClick={handleSignUpClick}
                      className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(104, 219, 255, 0.08) 0%, rgba(104, 219, 255, 0.03) 100%)",
                        border: "1px solid rgba(104, 219, 255, 0.2)",
                      }}
                    >
                      {/* Hover effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(104, 219, 255, 0.15) 0%, rgba(104, 219, 255, 0.08) 100%)",
                        }}
                      />

                      <div className="relative flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#68DBFF]/10 group-hover:bg-[#68DBFF]/20 transition-colors duration-300">
                            <svg className="w-5 h-5 text-[#68DBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-[#68DBFF] transition-colors duration-300">
                              {language === "es" ? "Crear Cuenta" : "Create Account"}
                            </div>
                            <div className="text-sm text-white/60 mt-0.5">
                              {language === "es" ? "Únete a la comunidad" : "Join the community"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                  <div className="w-1 h-1 rounded-full bg-[#68DBFF]/60" />
                  <span>{language === "es" ? "Hermes Dot Science Ecosystem" : "Hermes Dot Science Ecosystem"}</span>
                  <div className="w-1 h-1 rounded-full bg-[#68DBFF]/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  if (!content) {
    return (
      <header className="fixed top-0 w-full h-20 bg-background/50 backdrop-blur-md z-50">
        <div className="flex h-full items-center justify-between px-4 sm:px-8 md:px-12">
          <LoadingSpinner text={t("loading")} className="min-h-0" />
        </div>
      </header>
    )
  }

  const { logoImage, logoAlt, navItems, enterOfficeButton } = content

  return (
    <>
      <header
        className="fixed top-0 w-full transition-all duration-300 z-[60]"
        style={{
          backgroundColor: "rgba(10, 23, 39, 0.5)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(104, 219, 255, 0.2)",
          borderBottomWidth: hasScrolled ? "1px" : "0px",
        }}
      >
        <div className="flex h-20 items-center justify-between px-4 sm:px-8 md:px-12 w-full overflow-hidden">
          {/* Left: Mobile Back Button + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile Back Button - only shows on Learn More page and mobile */}
            {isLearnMorePage && <MobileBackButton lang={language === "es" ? "es" : "en"} language={language} />}

            <Link href="/" className="flex items-center space-x-2" aria-label={logoAlt} onClick={handleLogoClick}>
              <Image
                src={logoImage || "/placeholder.svg"}
                alt={logoAlt}
                width={200}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Middle: Desktop Navigation Links */}
          <nav className="hidden xl:flex flex-grow justify-center items-center h-full" aria-label="Main Navigation">
            <div className="flex h-full">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavItemClick(e, item.href)}
                  className={`relative text-sm font-medium transition-all duration-[400ms] hover:text-[#68DBFF] h-full flex items-center px-10 group overflow-hidden ${
                    index > 0 ? "-ml-10" : ""
                  }`}
                  style={{ zIndex: navItems.length - index }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] pointer-events-none"
                    style={{
                      background: `
                    radial-gradient(ellipse 60% 80% at center bottom, 
                      rgba(104, 219, 255, 0.4) 0%, 
                      rgba(104, 219, 255, 0.25) 20%, 
                      rgba(104, 219, 255, 0.15) 40%, 
                      rgba(104, 219, 255, 0.08) 60%, 
                      rgba(104, 219, 255, 0.03) 80%, 
                      transparent 100%
                    )
                  `,
                      maskImage: `
                    radial-gradient(ellipse 70% 90% at center bottom, 
                      black 0%, 
                      black 40%, 
                      rgba(0, 0, 0, 0.8) 60%, 
                      rgba(0, 0, 0, 0.4) 75%, 
                      transparent 90%
                    )
                  `,
                      WebkitMaskImage: `
                    radial-gradient(ellipse 70% 90% at center bottom, 
                      black 0%, 
                      black 40%, 
                      rgba(0, 0, 0, 0.8) 60%, 
                      rgba(0, 0, 0, 0.4) 75%, 
                      transparent 90%
                    )
                  `,
                    }}
                  />
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute bottom-0 left-[15%] right-[15%] h-0.5 bg-[#68DBFF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-[400ms] ease-out"></div>
                </a>
              ))}
            </div>
          </nav>

          {/* Right: Controls */}
          <div className="flex items-center gap-0 md:gap-2 lg:gap-4 h-full flex-shrink-0">
            <div className="hidden md:flex items-center h-full">
              <LanguageToggle />
            </div>

            {/* User Authentication Button - Circular Icon */}
            <div className="hidden md:flex items-center h-full relative auth-dropdown-container">
              <button
                ref={buttonRef}
                className={`h-12 w-12 rounded-full bg-white/5 hover:bg-[#0B1E33] border border-white/10 hover:border-[#68DBFF]/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(104,219,255,0.4)] flex items-center justify-center backdrop-blur-sm ${
                  isAuthOpen ? "bg-[#0B1E33] border-[#68DBFF]/50 shadow-[0_0_20px_rgba(104,219,255,0.4)]" : ""
                }`}
                onClick={() => {
                  console.log("Auth button clicked, toggling from:", isAuthOpen, "to:", !isAuthOpen)
                  if (!isAuthOpen) {
                    setIsPositionReady(false) // Reset position state when opening
                  }
                  setIsAuthOpen(!isAuthOpen)
                }}
                aria-label={isAuthenticated ? (language === "es" ? "Mi Cuenta" : "My Account") : (language === "es" ? "Iniciar Sesión" : "Sign In")}
                aria-expanded={isAuthOpen}
              >
                {isAuthenticated ? (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#68DBFF]/20 border border-[#68DBFF]/40">
                    <div className="text-2xl font-light text-[#68DBFF]">
                      {getUserInitial()}
                    </div>
                  </div>
                ) : (
                  <User
                    className={`!h-7 !w-7 transition-colors duration-300 ${
                      isAuthOpen ? "text-[#68DBFF]" : "text-white/60 group-hover:text-[#68DBFF]"
                    }`}
                    strokeWidth={1}
                  />
                )}
              </button>
            </div>

            <Button
              asChild
              className="hidden md:flex items-center gap-3 px-[15px] text-white h-20 rounded-none transition-all duration-300 py-0 my-0 enter-space-button"
              style={{
                background: "radial-gradient(circle, #172E49 0%, #0A5E95 100%)",
                borderTop: 0,
                borderBottom: 0,
                borderLeft: "1px solid",
                borderRight: "1px solid",
                borderColor: "#68DBFF",
              }}
            >
              <Link href={enterOfficeButton.href} className="flex items-stretch gap-5 h-full">
                <div className="flex items-end pb-0 mb-0 ml-2 flex-shrink-0">
                  <Image
                    src={enterOfficeButton.imageSrc || "/placeholder.svg"}
                    alt={enterOfficeButton.imageAlt}
                    width={64}
                    height={64}
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="hidden lg:flex flex-col items-start justify-center mr-2" style={{ color: "#141823" }}>
                  <span className="text-xl font-medium uppercase leading-tight">{enterOfficeButton.mainText}</span>
                  <span className="text-sm font-normal leading-tight">{enterOfficeButton.subText}</span>
                </div>
              </Link>
            </Button>

            <div className="flex items-center h-full xl:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-12 w-12 p-0 bg-background/60 backdrop-blur-sm"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    aria-label="Open Menu"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="z-[110] w-[300px] sm:w-[340px] flex flex-col overflow-y-auto max-h-screen"
                >
                  <div className="flex justify-center pt-6 pb-4">
                    <Image
                      src={logoImage || "/placeholder.svg"}
                      alt={logoAlt}
                      width={180}
                      height={45}
                      className="h-10 w-auto object-contain"
                    />
                  </div>

                  <nav className="flex flex-col gap-2 mt-4" aria-label="Mobile Navigation">
                    {navItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="relative text-base font-medium transition-all duration-300 hover:text-[#68DBFF] py-4 px-6 rounded-xl group overflow-hidden border border-transparent hover:border-[#68DBFF]/30"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          backdropFilter: "blur(10px)",
                        }}
                        onClick={(e) => handleNavItemClick(e, item.href)}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(104, 219, 255, 0.1) 0%, rgba(104, 219, 255, 0.05) 100%)",
                          }}
                        />
                        <div className="relative z-10 flex items-center justify-between">
                          <span>{item.label}</span>
                          <div className="w-2 h-2 rounded-full bg-[#68DBFF]/40 group-hover:bg-[#68DBFF] transition-colors duration-300"></div>
                        </div>
                      </a>
                    ))}
                  </nav>

                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-foreground">
                        {language === "es" ? "Idioma" : "Language"}
                      </span>
                      <LanguageToggle />
                    </div>

                    {/* Mobile User Authentication Button */}
                    <div className="space-y-3">
                      {/* Mobile Sign In Button */}
                      <button
                        onClick={() => {
                          handleSignInClick()
                          setIsOpen(false)
                        }}
                        className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(104, 219, 255, 0.08) 0%, rgba(104, 219, 255, 0.03) 100%)",
                          border: "1px solid rgba(104, 219, 255, 0.2)",
                        }}
                      >
                        {/* Hover effect */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(104, 219, 255, 0.15) 0%, rgba(104, 219, 255, 0.08) 100%)",
                          }}
                        />

                        <div className="relative flex items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#68DBFF]/10 group-hover:bg-[#68DBFF]/20 transition-colors duration-300">
                              <svg
                                className="w-5 h-5 text-[#68DBFF]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3
                                  H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-white font-medium group-hover:text-[#68DBFF] transition-colors duration-300">
                                {language === "es" ? "Iniciar Sesión" : "Sign In"}
                              </div>
                              <div className="text-sm text-white/60 mt-0.5">
                                {language === "es" ? "Accede con tu cuenta" : "Access your account"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Mobile Sign Up Button */}
                      <button
                        onClick={() => {
                          handleSignUpClick()
                          setIsOpen(false)
                        }}
                        className="group w-full text-left p-4 rounded-lg transition-all duration-300 relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(104, 219, 255, 0.08) 0%, rgba(104, 219, 255, 0.03) 100%)",
                          border: "1px solid rgba(104, 219, 255, 0.2)",
                        }}
                      >
                        {/* Hover effect */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(104, 219, 255, 0.15) 0%, rgba(104, 219, 255, 0.08) 100%)",
                          }}
                        />

                        <div className="relative flex items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#68DBFF]/10 group-hover:bg-[#68DBFF]/20 transition-colors duration-300">
                              <svg
                                className="w-5 h-5 text-[#68DBFF]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-white font-medium group-hover:text-[#68DBFF] transition-colors duration-300">
                                {language === "es" ? "Crear Cuenta" : "Create Account"}
                              </div>
                              <div className="text-sm text-white/60 mt-0.5">
                                {language === "es" ? "Únete a la comunidad" : "Join the community"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto mb-4 pt-8">
                    <Button
                      asChild
                      className="w-full text-white h-32 transition-all duration-300 relative overflow-hidden p-0 enter-space-button"
                      style={{
                        background: "radial-gradient(circle, #172E49 0%, #0A5E95 100%)",
                        boxShadow: "0 0 20px rgba(104, 219, 255, 0.4)",
                        border: "1px solid #68DBFF",
                      }}
                    >
                      <Link
                        href={enterOfficeButton.href}
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col w-full h-full relative space-y-0"
                      >
                        <div className="flex flex-col items-center justify-center pt-3" style={{ color: "#141823" }}>
                          <span
                            className={`${language === "es" ? "text-2xl" : "text-3xl"} font-medium uppercase leading-tight`}
                          >
                            {enterOfficeButton.mainText}
                          </span>
                          <span className="text-lg font-normal leading-tight">{enterOfficeButton.subText}</span>
                        </div>
                        <div className="flex-1 flex items-end w-full">
                          <Image
                            src={enterOfficeButton.imageSrc || "/placeholder.svg"}
                            alt={enterOfficeButton.imageAlt}
                            width={200}
                            height={80}
                            className="w-full h-auto object-contain object-bottom"
                            style={{ marginLeft: "20px", marginRight: "30px" }}
                          />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Dropdown Portal */}
      <AuthDropdown />
    </>
  )
}
