"use client"

import { HabitCard } from "@/components/habit-card"
import { useHabits } from "@/lib/hooks/useHabits"
import { useCompleteHabit, useUncompleteHabit } from "@/lib/hooks/useCompletions"
import { getToday } from "@/lib/utils/dates"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { MobileSwipeHint } from "@/components/mobile/fun-elements"
import { CompactLoader } from "@/components/ui/fun-loader"
import "@/components/habits/notebook-theme.css"

interface HabitListProps {
  userId: string
}

export function HabitList({ userId }: HabitListProps) {
  const { data: habits, isLoading, error } = useHabits(userId)
  const completeHabit = useCompleteHabit()
  const uncompleteHabit = useUncompleteHabit()
  const today = getToday()

  const toggleHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        uncompleteHabit.mutate({ habitId, userId })
      } else {
        completeHabit.mutate({
          habit_id: habitId,
          user_id: userId,
          xp_earned: habits?.find(h => h.id === habitId)?.xp_value || 10,
        })
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center py-12">
        <CompactLoader />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-[#EF476F]/10 border-[#EF476F] dark:bg-[#EF476F]/20 dark:border-[#FB7185]">
        <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
        <AlertDescription className="handwritten-text">
          Couldn&apos;t load your habits. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (!habits || habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="notebook-container flex flex-col items-center justify-center h-48 sm:h-56 rounded-xl border-2 border-dashed border-[#26547C]/30 dark:border-[#60A5FA]/30 bg-white/50 dark:bg-slate-900/50 p-6 sm:p-8 relative"
      >
        <div className="sticker" style={{ top: '-10px', right: '20px' }}>
          📝
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="mb-4 text-5xl sm:text-6xl"
        >
          🌱
        </motion.div>
        <p className="handwritten-text text-sm sm:text-base text-center text-muted-foreground font-medium">
          No habits added yet.
        </p>
        <p className="handwritten-text text-xs sm:text-sm text-center text-muted-foreground/70 mt-2">
          Create your first habit to begin your journey! 🚀
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <MobileSwipeHint />
      <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit, index) => {
          const isCompletedToday = habit.habit_completions?.some(
            (comp) => comp.completion_date === today
          )
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="notebook-entry relative"
            >
              <HabitCard
                habit={habit}
                isCompleted={isCompletedToday || false}
                onToggle={() => toggleHabit(habit.id, isCompletedToday || false)}
              />
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
