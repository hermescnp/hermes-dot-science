"use client"

import type React from "react"

import type { LucideProps, LucideIcon } from "lucide-react"
import {
  Zap,
  MessageSquare,
  Bot,
  Database,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  Repeat2,
  Share,
  ExternalLink,
  Calendar,
  UserIcon as UserIconLucide,
  CheckCircle,
  Cpu,
  GitBranch,
  Brain,
  ChevronDown,
  Wrench,
  HelpCircle,
  Check,
  Rocket,
  DollarSign,
  Target,
  Smile,
  Clock,
  TrendingUp,
} from "lucide-react"

// Assuming FeatureIcons are not used for now based on current issue scope,
// but if they are, ensure the import path and usage are correct.
// import * as FeatureIcons from "@/components/feature-icons"
import * as UseCaseIcons from "@/components/use-case-icons"

// Define the type for the icon map, ensuring values are LucideIcon compatible
type IconMap = {
  [key: string]: LucideIcon
}

const iconMap: IconMap = {
  // Lucide direct icons
  Zap,
  MessageSquare,
  MessageCircle: MessageSquare, // Map "MessageCircle" (if used in any JSON) to MessageSquare
  Bot,
  Database,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  Repeat2,
  Share,
  ExternalLink,
  Calendar,
  UserIcon: UserIconLucide, // Map "UserIcon" to the aliased Lucide UserIcon
  CheckCircle,
  Cpu,
  GitBranch,
  Brain,
  ChevronDown,
  Wrench,
  HelpCircle, // Default fallback icon
  Rocket,
  DollarSign,
  Target,
  Smile,
  Clock,
  TrendingUp,

  // Custom Use Case Icons from use-case-icons.tsx
  // These expect string keys that match `iconName` in your use-cases.json
  BuildingIcon: UseCaseIcons.BuildingIcon,
  GovernmentIcon: UseCaseIcons.GovernmentIcon,
  FinanceIcon: UseCaseIcons.FinanceIcon,
  HealthcareIcon: UseCaseIcons.HealthcareIcon,
  LegalIcon: UseCaseIcons.LegalIcon,
  EducationIcon: UseCaseIcons.EducationIcon,

  // Example for FeatureIcons if you were using them:
  // Make sure these keys match what's in your JSON if you use FeatureIcons
  // BotIcon: FeatureIcons.BotIcon,
  // SparklesIcon: FeatureIcons.SparklesIcon,
  // DatabaseIcon: FeatureIcons.DatabaseIcon, // Custom DatabaseIcon from FeatureIcons
  // ShieldIcon: FeatureIcons.ShieldIcon, // Custom ShieldIcon from FeatureIcons
  // FileTextIcon: FeatureIcons.FileTextIcon,
  // ServerIcon: FeatureIcons.ServerIcon,
  // LockIcon: FeatureIcons.LockIcon,
  // ZapIcon: FeatureIcons.ZapIcon, // Custom ZapIcon from FeatureIcons
}

interface RenderIconProps extends LucideProps {
  iconName?: string // Make iconName optional to handle cases where it might be missing
}

export const RenderIcon: React.FC<RenderIconProps> = ({ iconName, className, size, ...props }) => {
  if (!iconName) {
    // console.warn("RenderIcon called with no iconName. Rendering fallback Check.");
    return <Check className={className} size={size} {...props} aria-label="Icon not specified" />
  }

  const IconComponent = iconMap[iconName]

  if (!IconComponent) {
    // console.warn(`Icon "${iconName}" not found in iconMap. Rendering fallback Check.`);
    return <Check className={className} size={size} {...props} aria-label={`Icon ${iconName} not found`} />
  }

  return <IconComponent className={className} size={size} {...props} />
}
