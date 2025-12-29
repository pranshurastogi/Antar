"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CompletionModal } from "@/components/habits/completion-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { HabitWithRelations } from "@/lib/types/database"
import { isTimePassedToday, formatDate } from "@/lib/utils/dates"
import { useArchiveHabit } from "@/lib/hooks/useHabits"
import { toast } from "react-hot-toast"
import "@/components/habits/notebook-theme.css"

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
            "notebook-entry transition-all duration-300 relative overflow-hidden border-2",
            // Completed - Teal/Green theme
            isCompleted && "bg-gradient-to-br from-[#06D6A0]/15 via-white to-[#06D6A0]/10 dark:from-[#06D6A0]/25 dark:via-slate-900 dark:to-[#06D6A0]/15 border-[#06D6A0]/40 dark:border-[#34D399]/50 shadow-lg",
            // Overdue - Yellow/Orange theme
            !isCompleted && isOverdue && "bg-gradient-to-br from-[#FFD166]/15 via-white to-[#FFD166]/10 dark:from-[#FFD166]/25 dark:via-slate-900 dark:to-[#FFD166]/15 border-[#FFD166]/40 dark:border-[#FFD166]/50",
            // Normal - Blue theme (today's habits)
            !isCompleted && !isOverdue && "bg-gradient-to-br from-[#26547C]/10 via-white to-[#26547C]/5 dark:from-[#26547C]/20 dark:via-slate-900 dark:to-[#26547C]/10 border-[#26547C]/30 dark:border-[#60A5FA]/40 hover:border-[#26547C]/50 dark:hover:border-[#60A5FA]/60 hover:shadow-xl"
          )}
        >
          {/* Paper clip decoration */}
          <div className="paper-clip" />
          {/* Completion indicator bar */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#06D6A0] via-[#06D6A0] to-[#06D6A0]"
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
                        "handwritten-text font-bold text-base sm:text-lg leading-tight",
                        isCompleted && "text-muted-foreground line-through",
                        !isCompleted && isOverdue && "text-[#FFD166]",
                        !isCompleted && !isOverdue && "text-[#26547C] dark:text-[#60A5FA]"
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
                          <FontAwesomeIcon icon={Icons.circleCheck} className="h-5 w-5 text-[#06D6A0] dark:text-[#34D399] shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="handwritten-label text-xs bg-white/80 dark:bg-slate-800/80 border-[#26547C]/20 dark:border-[#60A5FA]/20">
                      {habit.category}
                    </Badge>
                    {currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-[#EF476F] dark:text-[#FB7185] font-semibold">
                        <FontAwesomeIcon icon={Icons.fire} className="h-3.5 w-3.5" />
                        <span className="text-xs sm:text-sm font-mono">{currentStreak}</span>
                      </div>
                    )}
                    {habit.preferred_time && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FontAwesomeIcon icon={Icons.clock} className="h-3 w-3" />
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
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 data-[state=checked]:bg-[#06D6A0] data-[state=checked]:border-[#06D6A0] shadow-sm"
                  />
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <FontAwesomeIcon icon={Icons.ellipsisVertical} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DropdownMenuItem onClick={handleViewDetails} className="bg-white dark:bg-slate-900">
                      <FontAwesomeIcon icon={Icons.target} className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit} className="bg-white dark:bg-slate-900">
                      <FontAwesomeIcon icon={Icons.edit} className="h-4 w-4 mr-2" />
                      Edit Habit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} className="text-[#EF476F] dark:text-[#FB7185] bg-white dark:bg-slate-900">
                      <FontAwesomeIcon icon={Icons.archive} className="h-4 w-4 mr-2" />
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
