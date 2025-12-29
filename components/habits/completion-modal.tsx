"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCompleteHabit } from "@/lib/hooks/useCompletions"
import type { Habit } from "@/lib/types/database"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"

interface CompletionModalProps {
  habit: Habit
  userId: string
  isOpen: boolean
  onClose: () => void
}

const MOOD_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Bad' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

const ENERGY_OPTIONS = [
  { value: 1, emoji: '🪫', label: 'Drained' },
  { value: 2, emoji: '🔋', label: 'Low' },
  { value: 3, emoji: '🔋🔋', label: 'Medium' },
  { value: 4, emoji: '🔋🔋🔋', label: 'High' },
  { value: 5, emoji: '🔋🔋🔋🔋', label: 'Energized' },
]

export function CompletionModal({ habit, userId, isOpen, onClose }: CompletionModalProps) {
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const completeHabit = useCompleteHabit()

  const handleComplete = async () => {
    try {
      const now = new Date()
      await completeHabit.mutateAsync({
        habit_id: habit.id,
        user_id: userId,
        xp_earned: habit.xp_value || 10,
        mood_rating: mood || null,
        energy_level: energy || null,
        notes: notes || null,
        completed_time: now.toTimeString().split(' ')[0],
        is_streak_freeze: false,
      })

      // Enhanced confetti celebration
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      // Final burst with Coolors theme colors
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#26547C', '#EF476F', '#FFD166', '#06D6A0', '#FCFCFC']
        })
      }, 100)

      // Trigger celebration event for mobile fun elements
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celebrate'))
      }

      onClose()
      setMood(null)
      setEnergy(null)
      setNotes('')
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#26547C] via-[#EF476F] to-[#06D6A0] bg-clip-text text-transparent">
            Complete Habit ✨
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 py-2 sm:py-4">
          {/* Habit Name */}
          <motion.div
            className="text-center p-6 rounded-xl bg-gradient-to-br from-[#26547C]/10 via-[#EF476F]/10 to-[#06D6A0]/10 dark:from-[#26547C]/20 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/20 border-2 border-[#26547C]/30 dark:border-[#26547C]/50 backdrop-blur-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-5xl sm:text-6xl mb-3"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {habit.icon}
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-[#26547C] dark:text-[#60A5FA]">{habit.name}</h3>
            <motion.div
              className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#EF476F] dark:text-[#FB7185]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <FontAwesomeIcon icon={Icons.bolt} className="h-4 w-4" />
              <span>+{habit.xp_value} XP</span>
            </motion.div>
          </motion.div>

          {/* Mood Rating */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">How are you feeling? (Optional)</Label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {MOOD_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all min-h-[65px] sm:min-h-[75px] bg-white dark:bg-slate-800 ${
                    mood === option.value
                      ? 'border-[#EF476F] bg-[#EF476F]/10 dark:bg-[#EF476F]/20 shadow-md scale-105'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#EF476F]/50 dark:hover:border-[#EF476F]/50 hover:bg-[#EF476F]/5 dark:hover:bg-[#EF476F]/10'
                  }`}
                >
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    animate={mood === option.value ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {option.emoji}
                  </motion.div>
                  <div className="text-[10px] sm:text-xs mt-1 text-center leading-tight font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">Energy level? (Optional)</Label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {ENERGY_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setEnergy(option.value)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all min-h-[65px] sm:min-h-[75px] bg-white dark:bg-slate-800 ${
                    energy === option.value
                      ? 'border-[#06D6A0] bg-[#06D6A0]/10 dark:bg-[#06D6A0]/20 shadow-md scale-105'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#06D6A0]/50 dark:hover:border-[#06D6A0]/50 hover:bg-[#06D6A0]/5 dark:hover:bg-[#06D6A0]/10'
                  }`}
                >
                  <motion.div
                    className="text-lg sm:text-xl"
                    animate={energy === option.value ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {option.emoji}
                  </motion.div>
                  <div className="text-[10px] sm:text-xs mt-1 text-center leading-tight font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did it go? Any reflections?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{notes.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleComplete}
                disabled={completeHabit.isPending}
                className="w-full bg-gradient-to-r from-[#26547C] via-[#EF476F] to-[#06D6A0] hover:from-[#1e4260] hover:via-[#d63d62] hover:to-[#05c18f] text-white shadow-lg font-semibold"
              >
                {completeHabit.isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FontAwesomeIcon icon={Icons.sparkles} className="h-4 w-4" />
                    </motion.div>
                    Completing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={Icons.bolt} className="h-4 w-4" />
                    Complete
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

