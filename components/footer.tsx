"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

interface FooterLink {
  label: string
  href: string
}
interface FooterSectionContent {
  title: string
  links: FooterLink[]
}
interface SocialLink {
  name: string
  href: string
  iconName: string
}
interface FooterContent {
  companyName: string
  companyDescription: string
  sections: FooterSectionContent[]
  copyrightText: string
  socialLinks: SocialLink[]
}

// SVGs for social icons
const SocialIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  LinkedInSVG: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect width="4" height="12" x="2" y="9"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  TwitterSVG: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  ),
  InstagramSVG: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
  ),
}

export function Footer() {
  const [content, setContent] = useState<FooterContent | null>(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content/footer")
        if (!response.ok) throw new Error("Failed to fetch footer content")
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error("Error fetching footer content:", error)
        setContent({
          companyName: "Hermes Dot Science",
          companyDescription: "Loading description...",
          sections: [],
          copyrightText: "© {year} Hermes Dot Science. All rights reserved.",
          socialLinks: [],
        })
      }
    }
    fetchContent()
  }, [])

  if (!content) {
    return (
      <footer style={{ backgroundColor: "#0A1727" }} className="border-t border-gray-800">
        <div className="container px-4 md:px-6 py-16">
          <p className="text-center text-gray-400">Loading...</p>
        </div>
      </footer>
    )
  }

  const RenderSocialIcon = ({ iconName, ...props }: { iconName: string } & React.SVGProps<SVGSVGElement>) => {
    const IconComponent = SocialIcons[iconName]
    return IconComponent ? <IconComponent {...props} /> : null
  }

  return (
    <footer style={{ backgroundColor: "#0A1727" }} className="border-t border-gray-800">
      <div className="container px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Company Info - Left Side */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">{content.companyName}</h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">{content.companyDescription}</p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {content.socialLinks.map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href}
                    className="w-12 h-12 bg-gray-800/50 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-[#68DBFF] hover:border-[#68DBFF] hover:bg-gray-700/50 transition-all duration-300"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RenderSocialIcon iconName={social.iconName} className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation Links - Center */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              {content.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{section.title}</h4>
                  <nav>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <Link
                            href={link.href}
                            className="text-gray-400 hover:text-[#68DBFF] transition-colors duration-200 text-sm"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>

            {/* Signature - Right Side */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <div className="group">
                <Image
                  src="/images/hermes-sign.svg"
                  alt="Hermes Signature"
                  width={320}
                  height={160}
                  className="opacity-80 hover:opacity-100 transition-opacity duration-500"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(27%) sepia(77%) saturate(1234%) hue-rotate(188deg) brightness(95%) contrast(95%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">{content.copyrightText.replace("{year}", currentYear.toString())}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Crafted with</span>
              <span className="text-red-400">♥</span>
              <span>by Hermes Dot Science</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
