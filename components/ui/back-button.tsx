"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <motion.div
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        onClick={handleClick}
        className={`gap-2 ${className || ""}`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </motion.div>
  )
}

