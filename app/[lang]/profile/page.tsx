import type { Metadata } from "next"
import ProtectedRoute from "@/components/protected-route"
import UserProfile from "@/components/user-profile"
import { BackButton } from "@/components/learn-more/navigation-ui"
import Link from "next/link"
import Image from "next/image"
import CssGridBackground from "@/components/css-grid-background"
import HeroParticles from "@/components/hero-particles"
import SignInSpotlight from "@/components/sign-in-spotlight"

export const metadata: Metadata = {
  title: "Profile | Hermes Dot Science",
  description: "Your user profile and account settings.",
}

interface ProfilePageProps {
  params: {
    lang: "en" | "es"
  }
}

export default function ProfilePage({ params: { lang } }: ProfilePageProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <CssGridBackground />
        <HeroParticles />
        <SignInSpotlight />

        {/* Back Button */}
        <BackButton lang={lang} language={lang} />

        {/* Profile Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20 lg:pt-12">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  )
} 