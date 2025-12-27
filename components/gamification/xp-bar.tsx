"use client"

import { useProfile } from "@/lib/hooks/useProfile"
import { Progress } from "@/components/ui/progress"
import { Zap, Sparkles } from "lucide-react"
import { levelProgress } from "@/lib/utils/xp"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface XPBarProps {
  userId: string
}

export function XPBar({ userId }: XPBarProps) {
  const { data: profile, isLoading } = useProfile(userId)

  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-lg" />
  }

  if (!profile) return null

  const xpInfo = levelProgress(profile.total_xp)
  const isNearLevelUp = xpInfo.progress > 0.8

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 shadow-sm"
    >
      <motion.div
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md relative"
        whileHover={{ scale: 1.15, rotate: 360 }}
        animate={isNearLevelUp ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0 rgba(99, 102, 241, 0.4)",
            "0 0 0 8px rgba(99, 102, 241, 0)",
            "0 0 0 0 rgba(99, 102, 241, 0)",
          ],
        } : {}}
        transition={{ duration: 2, repeat: isNearLevelUp ? Infinity : 0 }}
      >
        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        {isNearLevelUp && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <motion.span
            className="text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            animate={isNearLevelUp ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: isNearLevelUp ? Infinity : 0 }}
          >
            Level {xpInfo.current_level}
          </motion.span>
          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
            {xpInfo.xp_current.toLocaleString()} / {xpInfo.xp_for_next.toLocaleString()} XP
          </span>
        </div>
        <div className="relative">
          <Progress
            value={xpInfo.progress * 100}
            className="h-2.5 sm:h-3 bg-indigo-100 dark:bg-indigo-900"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: xpInfo.progress }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </div>
    </motion.div>
  )
}

