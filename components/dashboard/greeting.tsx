"use client"

import { useProfile } from "@/lib/hooks/useProfile"
import { getTimeBasedGreeting } from "@/lib/utils/dates"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface DashboardGreetingProps {
  userId: string
}

const motivationalMessages = [
  "Let's make today count. Every small step forward is progress.",
  "Small habits, big changes. You've got this! 💪",
  "Consistency is the key. Keep going! ✨",
  "Every completion is a victory. Celebrate the journey! 🎉",
  "Your future self will thank you. Keep building! 🌱",
  "Progress, not perfection. You're doing great! 🌟",
  "Each day is a fresh start. Make it count! 🚀",
  "You're stronger than you think. Keep pushing! 💫",
  "The best time to start was yesterday. The second best is now! ⚡",
  "Your consistency will compound. Trust the process! 📈",
]

export function DashboardGreeting({ userId }: DashboardGreetingProps) {
  const { data: profile, isLoading } = useProfile(userId)
  const greeting = getTimeBasedGreeting()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayName, setDisplayName] = useState<string>('Friend')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || profile.username || 'Friend')
    }
  }, [profile])

  // Cycle through messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % motivationalMessages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-lg" />
  }

  const currentMessage = motivationalMessages[currentMessageIndex]

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
        {greeting}, {displayName}{" "}
        <motion.span
          animate={{ 
            rotate: [0, 14, -8, 14, -8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.5,
            delay: 0.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="inline-block"
        >
          👋
        </motion.span>
      </motion.h1>
      
      <div className="relative h-8 sm:h-10 md:h-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            className="text-sm sm:text-base md:text-lg text-muted-foreground absolute inset-0"
            initial={{ opacity: 0, y: 20, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 10 }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

