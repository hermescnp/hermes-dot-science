"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface TypingPromptInputProps {
  prompts: string[] // Accept prompts as a prop
}

export default function TypingPromptInput({ prompts = [] }: TypingPromptInputProps) {
  // const defaultPrompts = [ // Removed default prompts, will come from props
  //   "Analyze our customer feedback and identify key trends...",
  //   // ...
  // ];
  // const effectivePrompts = prompts && prompts.length > 0 ? prompts : defaultPrompts;
  const effectivePrompts = prompts

  const [displayText, setDisplayText] = useState("")
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  const typingSpeed = 50
  const deletingSpeed = 20
  const pauseBeforeDelete = 2000
  const pauseBeforeNextPrompt = 500

  useEffect(() => {
    if (!effectivePrompts || effectivePrompts.length === 0) return

    let timeout: NodeJS.Timeout

    if (isTyping) {
      if (currentCharIndex < effectivePrompts[currentPromptIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(effectivePrompts[currentPromptIndex].substring(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, pauseBeforeDelete)
      }
    } else {
      if (currentCharIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(effectivePrompts[currentPromptIndex].substring(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        }, deletingSpeed)
      } else {
        timeout = setTimeout(() => {
          setCurrentPromptIndex((currentPromptIndex + 1) % effectivePrompts.length)
          setIsTyping(true)
        }, pauseBeforeNextPrompt)
      }
    }

    return () => clearTimeout(timeout)
  }, [
    currentCharIndex,
    currentPromptIndex,
    isTyping,
    effectivePrompts,
    typingSpeed,
    deletingSpeed,
    pauseBeforeDelete,
    pauseBeforeNextPrompt,
  ])

  if (!effectivePrompts || effectivePrompts.length === 0) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <Input
          className="pl-6 pr-24 py-8 text-base rounded-full backdrop-blur-md border-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default dark:bg-background/20 dark:text-white bg-white/80 text-gray-800 shadow-[0_4px_20px_rgba(10,94,149,0.2)]"
          placeholder="Enter your prompt..."
          value=""
          readOnly
        />
        <Button
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover shadow-[0_0_15px_rgba(104,219,255,0.4)] hover:shadow-[0_0_25px_rgba(104,219,255,0.6)] transition-all duration-300 backdrop-blur-md cursor-default"
          aria-label="Send message"
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div
          className="absolute -inset-0.5 rounded-full border border-[#416679] opacity-75 group-hover:opacity-100 transition duration-1000"
          style={{ borderWidth: "1px" }}
        ></div>
        <div className="relative">
          <Input
            className="pl-6 pr-24 py-8 text-base rounded-full backdrop-blur-md border-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default
dark:bg-background/20 dark:text-white
bg-white/80 text-gray-800 shadow-[0_4px_20px_rgba(10,94,149,0.2)]"
            placeholder="" // Placeholder is dynamic via typing
            value={displayText}
            readOnly
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full
bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover 
shadow-[0_0_15px_rgba(104,219,255,0.4)] hover:shadow-[0_0_25px_rgba(104,219,255,0.6)] 
transition-all duration-300 backdrop-blur-md cursor-default"
            aria-label="Send message"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
