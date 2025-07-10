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

        {/* Profile Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20 lg:pt-12">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  )
} 