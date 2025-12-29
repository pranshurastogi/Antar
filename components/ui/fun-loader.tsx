"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { cn } from "@/lib/utils"

const habitFacts = [
  "It takes an average of 66 days to form a new habit! 🌱",
  "Small wins compound into remarkable results over time! 🎯",
  "Your brain creates new neural pathways with each repeated action! 🧠",
  "Morning routines set the tone for your entire day! ☀️",
  "Habit stacking makes new habits 2x easier to maintain! 🔗",
  "Celebrating small victories releases dopamine! 🎉",
  "Consistency beats perfection every single time! 💪",
  "Your future self will thank you for today's efforts! 🚀",
  "Habits are the compound interest of self-improvement! 📈",
  "Environment shapes behavior more than willpower! 🏠",
  "Tracking progress increases success rates by 40%! 📊",
  "The best time to start was yesterday. The next best? Now! ⏰",
  "Atomic habits create atomic results! ⚛️",
  "Identity change is the deepest form of behavior change! 🦋",
  "Habits free up mental energy for creativity! 💡",
  "You don't rise to your goals, you fall to your systems! 🎯",
  "Every action is a vote for the person you want to become! 🗳️",
  "Motivation gets you started, habits keep you going! 🔥",
  "The secret of change is to focus energy on building the new! 🌟",
  "Success is the sum of small efforts repeated daily! ✨",
]

const icons = [
  { icon: Icons.sparkles, color: "text-purple-500" },
  { icon: Icons.leaf, color: "text-green-500" },
  { icon: Icons.target, color: "text-blue-500" },
  { icon: Icons.fire, color: "text-orange-500" },
  { icon: Icons.trophy, color: "text-yellow-500" },
  { icon: Icons.brain, color: "text-pink-500" },
  { icon: Icons.heart, color: "text-red-500" },
  { icon: Icons.bolt, color: "text-cyan-500" },
]

interface FunLoaderProps {
  message?: string
  fullScreen?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function FunLoader({ 
  message, 
  fullScreen = false, 
  size = "md",
  className 
}: FunLoaderProps) {
  const [currentFact, setCurrentFact] = useState("")
  const [currentIcon, setCurrentIcon] = useState(icons[0])

  useEffect(() => {
    // Set initial random fact and icon
    const randomFact = habitFacts[Math.floor(Math.random() * habitFacts.length)]
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]
    setCurrentFact(randomFact)
    setCurrentIcon(randomIcon)

    // Change fact every 4 seconds
    const interval = setInterval(() => {
      const newFact = habitFacts[Math.floor(Math.random() * habitFacts.length)]
      const newIcon = icons[Math.floor(Math.random() * icons.length)]
      setCurrentFact(newFact)
      setCurrentIcon(newIcon)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const loaderContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-6 p-8",
      fullScreen && "min-h-screen",
      className
    )}>
      {/* Animated Icon with Orbiting Dots */}
      <div className="relative">
        {/* Center Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg",
            sizeClasses[size]
          )}
        >
          <FontAwesomeIcon 
            icon={currentIcon.icon} 
            className={cn("text-white", iconSizeClasses[size])} 
          />
        </motion.div>

        {/* Orbiting Dots */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.3,
            }}
          >
            <motion.div
              className={cn(
                "absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400",
                size === "sm" && "h-2 w-2",
                size === "md" && "h-3 w-3",
                size === "lg" && "h-4 w-4"
              )}
              style={{
                top: "0%",
                left: "50%",
                marginLeft: size === "sm" ? "-4px" : size === "md" ? "-6px" : "-8px",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3,
              }}
            />
          </motion.div>
        ))}

        {/* Pulsing Ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-purple-400/30",
            size === "sm" && "-m-4",
            size === "md" && "-m-6",
            size === "lg" && "-m-8"
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </div>

      {/* Loading Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}
        >
          {message}
        </motion.p>
      )}

      {/* Fun Fact with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFact}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center"
        >
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 p-6 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FontAwesomeIcon icon={Icons.sparkles} className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                Did You Know?
              </p>
              <FontAwesomeIcon icon={Icons.sparkles} className="h-4 w-4 text-purple-500" />
            </div>
            <p className={cn(
              "text-muted-foreground leading-relaxed",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}>
              {currentFact}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 via-purple-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

// Compact version for inline loading states
export function CompactLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

// Skeleton loader with fun animation
export function SkeletonLoader({ 
  count = 3, 
  className 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 p-4"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

