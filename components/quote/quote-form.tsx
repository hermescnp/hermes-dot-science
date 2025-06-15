"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"

interface QuoteFormProps {
  content: any
  onSubmit: (data: any) => void
  onBack: () => void
}

export function QuoteForm({ content, onSubmit, onBack }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    company: "",
    email: "",
    phone: "",
    industry: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
    requirements: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSubmit(formData)
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formFields = content?.form?.fields || {
    company: "Company Name",
    email: "Email Address",
    phone: "Phone Number",
    industry: "Industry",
    projectType: "Project Type",
    budget: "Budget Range",
    timeline: "Timeline",
    description: "Project Description",
    requirements: "Specific Requirements",
  }

  const buttons = content?.form?.buttons || {
    submit: "Submit Quote Request",
    back: "Back to Learn More",
  }

  return (
    <div className="container max-w-4xl mx-auto px-6">
      <Card className="bg-black/40 backdrop-blur-sm border-[#68DBFF]/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">{content?.form?.title || "Project Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">
                  {formFields.company} *
                </Label>
                <Input
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="bg-black/20 border-[#68DBFF]/30 text-white placeholder:text-gray-400 focus:bg-black/30"
                  placeholder="Enter your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  {formFields.email} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-black/20 border-[#68DBFF]/30 text-white placeholder:text-gray-400 focus:bg-black/30"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  {formFields.phone}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-black/20 border-[#68DBFF]/30 text-white placeholder:text-gray-400 focus:bg-black/30"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-white">
                  {formFields.industry}
                </Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-[#68DBFF]/30 rounded-md text-white"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-white">
                  {formFields.budget}
                </Label>
                <select
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-[#68DBFF]/30 rounded-md text-white"
                >
                  <option value="">Select Budget Range</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="over-100k">Over $100,000</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-white">
                  {formFields.timeline}
                </Label>
                <select
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleChange("timeline", e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-[#68DBFF]/30 rounded-md text-white"
                >
                  <option value="">Select Timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                {formFields.description} *
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-black/20 border-[#68DBFF]/30 text-white placeholder:text-gray-400 min-h-[100px] focus:bg-black/30"
                placeholder="Describe your project goals and what you're looking to achieve..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-white">
                {formFields.requirements}
              </Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
                className="bg-black/20 border-[#68DBFF]/30 text-white placeholder:text-gray-400 min-h-[100px] focus:bg-black/30"
                placeholder="Any specific technical requirements, integrations, or features you need..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2 border-[#68DBFF]/30 text-white hover:bg-[#68DBFF]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                {buttons.back}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-[#68DBFF] to-[#4A9EFF] hover:from-[#5BC5FF] hover:to-[#3D8BFF] text-white flex-1"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : buttons.submit}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
