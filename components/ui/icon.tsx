// Unified icon component wrapper for consistent styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { cn } from "@/lib/utils"

interface IconProps {
  icon: IconDefinition
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  spin?: boolean
  pulse?: boolean
  fixedWidth?: boolean
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
}

export function Icon({ 
  icon, 
  className, 
  size = "md",
  spin = false,
  pulse = false,
  fixedWidth = false
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={cn(sizeClasses[size], className)}
      spin={spin}
      pulse={pulse}
      fixedWidth={fixedWidth}
    />
  )
}

