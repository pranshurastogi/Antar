"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Flame, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CompletionModal } from "@/components/habits/completion-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { HabitWithRelations } from "@/lib/types/database"
import { isTimePassedToday } from "@/lib/utils/dates"

interface HabitCardProps {
  habit: HabitWithRelations
  isCompleted: boolean
  onToggle: () => void
}

export function HabitCard({ habit, isCompleted, onToggle }: HabitCardProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const isOverdue = isTimePassedToday(habit.preferred_time)
  const currentStreak = habit.habit_streaks?.current_streak || 0

  const handleQuickComplete = () => {
    if (!isCompleted) {
      setShowCompletionModal(true)
    } else {
      onToggle()
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
            "transition-all duration-300 relative overflow-hidden",
            isCompleted && "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-300 dark:border-emerald-700 shadow-md",
            !isCompleted && isOverdue && "border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20",
            !isCompleted && !isOverdue && "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg"
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

          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Icon */}
                <motion.div
                  className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 shadow-sm"
                  style={{ backgroundColor: habit.color || "#6366f1" }}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-xl sm:text-2xl">{habit.icon || "✨"}</span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-semibold text-sm sm:text-base leading-tight truncate",
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
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                      {habit.category}
                    </Badge>
                    {currentStreak > 0 && (
                      <motion.div
                        className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <Flame className="h-3 w-3" />
                        <span className="font-mono">{currentStreak}</span>
                      </motion.div>
                    )}
                    {habit.preferred_time && (
                      <span className="truncate">{habit.preferred_time}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleQuickComplete}
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-md border-2 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>Edit Habit</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
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
