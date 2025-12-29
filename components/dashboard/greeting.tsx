"use client"

import { useProfile, useDashboardStats } from "@/lib/hooks/useProfile"
import { useAIMotivationalMessageLegacy } from "@/lib/hooks/useAI"
import { getTimeBasedGreeting } from "@/lib/utils/dates"
import { FunLoader } from "@/components/ui/fun-loader"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"

interface DashboardGreetingProps {
  userId: string
}

// Fallback messages if AI fails
const fallbackMessages = [
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
  const { data: profile, isLoading, error } = useProfile(userId)
  const { data: stats } = useDashboardStats(userId)
  const { generate, isLoading: aiLoading } = useAIMotivationalMessageLegacy()
  const greeting = getTimeBasedGreeting()
  const [currentMessage, setCurrentMessage] = useState<string>(fallbackMessages[0])
  const [messageIndex, setMessageIndex] = useState(0)
  const [displayName, setDisplayName] = useState<string>('Friend')
  const [useAI, setUseAI] = useState(true)
  const [aiGenerated, setAiGenerated] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || profile.username || 'Friend')
    }
  }, [profile])

  // Generate AI message when stats are available
  useEffect(() => {
    if (profile && stats && useAI && !aiLoading && !aiGenerated) {
      generate({
        currentStreak: stats.active_streaks || 0,
        completionRate: stats.completion_rate || 0,
        recentCompletions: stats.completed_today || 0,
        userName: displayName,
        timeOfDay: greeting,
      }).then((message) => {
        if (message) {
          setCurrentMessage(message)
          setAiGenerated(true)
        } else {
          // Fallback to static messages
          setCurrentMessage(fallbackMessages[messageIndex])
          setUseAI(false)
        }
      }).catch((error) => {
        console.error("Error generating AI message:", error)
        // Fallback to static messages
        setCurrentMessage(fallbackMessages[messageIndex])
        setUseAI(false) // Disable AI for this session if it fails
      })
    } else if (!useAI || !stats || !profile) {
      // Use fallback messages
      setCurrentMessage(fallbackMessages[messageIndex])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, stats, displayName, greeting, useAI, aiLoading, messageIndex, aiGenerated, generate])

  // Cycle through fallback messages if AI is disabled or fails
  useEffect(() => {
    if (!useAI) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const newIndex = (prev + 1) % fallbackMessages.length
          setCurrentMessage(fallbackMessages[newIndex])
          return newIndex
        })
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [useAI])

  if (isLoading) {
    return (
      <div className="notebook-container bg-white/95 dark:bg-slate-900/95 rounded-lg p-4 sm:p-6 border-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
        <FunLoader message="Loading your personalized greeting..." size="sm" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-[#EF476F]/10 border-[#EF476F] dark:bg-[#EF476F]/20 dark:border-[#FB7185]">
        <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
        <AlertDescription className="handwritten-text">
          Oops! Couldn't load your profile. Don't worry, you can still use the app!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="notebook-container bg-white/95 dark:bg-slate-900/95 rounded-lg p-4 sm:p-6 border-2 border-[#26547C]/20 dark:border-[#60A5FA]/20 shadow-lg relative"
    >
      <motion.h1
        className="handwritten-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#26547C] dark:text-[#60A5FA] mb-2 sm:mb-3"
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
        {aiLoading ? (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FontAwesomeIcon icon={Icons.sparkles} className="h-4 w-4 text-[#FFD166]" />
            </motion.div>
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              className="handwritten-text text-sm sm:text-base md:text-lg text-muted-foreground absolute inset-0"
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
        )}
      </div>
    </motion.div>
  )
}

