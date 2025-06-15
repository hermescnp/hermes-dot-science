"use client"

import { motion } from "framer-motion"
import { useActiveSection } from "@/hooks/use-active-section"
import { RenderIcon } from "@/components/icon-mapper"

interface ScrollDownButtonProps {
  targetSectionId: string
  buttonText: string // Added prop for button text
}

export default function ScrollDownButton({ targetSectionId, buttonText }: ScrollDownButtonProps) {
  const { isActive } = useActiveSection()
  const shouldAnimate = isActive("hero")

  const handleClick = () => {
    const targetSection = document.getElementById(targetSectionId)
    if (targetSection) {
      const elementTop = targetSection.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className="absolute bottom-8 left-0 right-0 mx-auto z-20 flex flex-col items-center justify-center cursor-pointer group w-fit"
      aria-label={`Scroll to ${targetSectionId} section`}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: shouldAnimate ? 1 : 0,
        y: shouldAnimate ? 0 : -20,
      }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <span className="text-sm font-medium mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
        {buttonText} {/* Use prop for text */}
      </span>
      <div className="relative">
        <div className="absolute -inset-2 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative h-10 w-10 rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <motion.div
            animate={
              shouldAnimate
                ? {
                    y: [0, 5, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            <RenderIcon iconName="ChevronDown" className="h-5 w-5 text-primary" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}
