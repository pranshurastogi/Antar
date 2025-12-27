"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Flame, CheckCircle2, Clock, Target, TrendingUp, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CompletionModal } from "@/components/habits/completion-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { HabitWithRelations } from "@/lib/types/database"
import { isTimePassedToday, formatDate } from "@/lib/utils/dates"
import { useArchiveHabit } from "@/lib/hooks/useHabits"
import { toast } from "react-hot-toast"

interface HabitCardProps {
  habit: HabitWithRelations
  isCompleted: boolean
  onToggle: () => void
}

export function HabitCard({ habit, isCompleted, onToggle }: HabitCardProps) {
  const router = useRouter()
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const isOverdue = isTimePassedToday(habit.preferred_time)
  const currentStreak = habit.habit_streaks?.current_streak || 0
  const longestStreak = habit.habit_streaks?.longest_streak || 0
  const totalCompletions = habit.habit_streaks?.total_completions || 0
  const completionRate = habit.habit_streaks?.completion_rate || 0
  const archiveHabit = useArchiveHabit()

  const handleQuickComplete = () => {
    if (!isCompleted) {
      setShowCompletionModal(true)
    } else {
      onToggle()
    }
  }

  const handleViewDetails = () => {
    router.push(`/dashboard/habits/${habit.id}`)
  }

  const handleEdit = () => {
    router.push(`/dashboard/habits/${habit.id}?edit=true`)
  }

  const handleArchive = async () => {
    try {
      await archiveHabit.mutateAsync({ id: habit.id, userId: habit.user_id })
      toast.success("Habit archived successfully")
    } catch (error) {
      toast.error("Failed to archive habit")
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            "transition-all duration-300 relative overflow-hidden border-2",
            isCompleted && "bg-gradient-to-br from-emerald-100/80 via-green-100/60 to-teal-100/80 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40 border-emerald-300/50 dark:border-emerald-700/50 shadow-lg",
            !isCompleted && isOverdue && "border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-br from-orange-50/60 to-amber-50/60 dark:from-orange-950/30 dark:to-amber-950/30",
            !isCompleted && !isOverdue && "bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-slate-900/50 dark:via-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400/70 dark:hover:border-blue-600/70 hover:shadow-xl"
          )}
        >
          {/* Completion indicator bar */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"
              />
            )}
          </AnimatePresence>

          <CardContent className="p-4 sm:p-5">
            {/* Minimal Design - Single Row */}
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Icon */}
                <motion.div
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shrink-0 shadow-lg"
                  style={{ 
                    backgroundColor: habit.color || "#6366f1",
                    boxShadow: `0 4px 14px 0 ${habit.color || "#6366f1"}40`
                  }}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-2xl sm:text-3xl">{habit.icon || "✨"}</span>
                </motion.div>

                {/* Name + Minimal Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-bold text-base sm:text-lg leading-tight",
                        isCompleted && "text-muted-foreground line-through",
                      )}
                    >
                      {habit.name}
                    </h3>
                    <AnimatePresence>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-white/60 dark:bg-slate-800/60">
                      {habit.category}
                    </Badge>
                    {currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                        <Flame className="h-3.5 w-3.5" />
                        <span className="text-xs sm:text-sm font-mono">{currentStreak}</span>
                      </div>
                    )}
                    {habit.preferred_time && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {habit.preferred_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Checkbox + Menu */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleQuickComplete}
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shadow-sm"
                  />
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleViewDetails}>
                      <Target className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Edit Habit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} className="text-orange-600 dark:text-orange-400">
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CompletionModal
        habit={habit}
        userId={habit.user_id}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </>
  )
}
