"use client"

import { useProfile } from "@/lib/hooks/useProfile"
import { getTimeBasedGreeting } from "@/lib/utils/dates"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface DashboardGreetingProps {
  userId: string
}

const motivationalMessages = [
  "Let's make today count. Every small step forward is progress.",
  "Small habits, big changes. You've got this! 💪",
  "Consistency is the key. Keep going! ✨",
  "Every completion is a victory. Celebrate the journey! 🎉",
  "Your future self will thank you. Keep building! 🌱",
]

export function DashboardGreeting({ userId }: DashboardGreetingProps) {
  const { data: profile, isLoading } = useProfile(userId)
  const greeting = getTimeBasedGreeting()
  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-lg" />
  }

  const displayName = profile?.full_name || profile?.username || 'Friend'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2 sm:space-y-3"
    >
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {greeting}, {displayName} 👋
      </motion.h1>
      <motion.p
        className="text-sm sm:text-base md:text-lg text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}

