"use client"

import { HabitCard } from "@/components/habit-card"
import { useHabits } from "@/lib/hooks/useHabits"
import { useCompleteHabit, useUncompleteHabit } from "@/lib/hooks/useCompletions"
import { getToday } from "@/lib/utils/dates"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { MobileSwipeHint } from "@/components/mobile/fun-elements"

interface HabitListProps {
  userId: string
}

export function HabitList({ userId }: HabitListProps) {
  const { data: habits, isLoading } = useHabits(userId)
  const completeHabit = useCompleteHabit()
  const uncompleteHabit = useUncompleteHabit()
  const today = getToday()

  const toggleHabit = async (habitId: string, isCompleted: boolean) => {
    if (isCompleted) {
      uncompleteHabit.mutate({ habitId, userId })
    } else {
      completeHabit.mutate({
        habit_id: habitId,
        user_id: userId,
        xp_earned: habits?.find(h => h.id === habitId)?.xp_value || 10,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!habits || habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-48 sm:h-56 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-6 sm:p-8"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="mb-4"
        >
          <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
        </motion.div>
        <p className="text-sm sm:text-base text-center text-muted-foreground font-medium">
          No habits added yet.
        </p>
        <p className="text-xs sm:text-sm text-center text-muted-foreground/70 mt-1">
          Create your first habit to begin your journey! 🌱
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
