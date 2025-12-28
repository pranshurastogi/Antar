"use client"

import { useHabit } from "@/lib/hooks/useHabits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Flame, Calendar, Target, TrendingUp, Clock, Zap, ArrowLeft, CheckCircle2, Trophy, Star, Sparkles, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils/dates"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { HabitFormContent } from "@/components/habits/habit-form"

interface HabitDetailViewProps {
  habitId: string
  userId: string
  isEditMode?: boolean
}

const motivationalQuotes = [
  "You're building something amazing, one day at a time! 🌟",
  "Every completion is a step closer to your goals! 💪",
  "Consistency beats perfection. Keep going! ✨",
  "Your future self is cheering you on! 🎉",
  "Small steps, big impact. You've got this! 🚀",
]

export function HabitDetailView({ habitId, userId, isEditMode }: HabitDetailViewProps) {
  const router = useRouter()
  const { data: habit, isLoading, error } = useHabit(habitId, userId)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showEditDialog, setShowEditDialog] = useState(isEditMode)

  useEffect(() => {
    setShowEditDialog(isEditMode)
  }, [isEditMode])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Show edit dialog when in edit mode
  // We render it alongside the detail view so the dialog can overlay

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </motion.div>
    )
  }

  if (error || !habit) {
    // Log error details for debugging
    if (error) {
      console.error('Habit fetch error:', {
        habitId,
        userId,
        error: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
      })
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
          Habit Not Found
        </h2>
        <div className="space-y-2 text-center max-w-md">
          <p className="text-muted-foreground">
            {error 
              ? "There was an error loading this habit. Please try again or check if you have access to this habit." 
              : "This habit doesn't exist, has been removed, or you don't have permission to view it."}
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
              Error: {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/dashboard')} variant="default" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => router.back()} variant="outline" size="lg">
            Go Back
          </Button>
        </div>
      </motion.div>
    )
  }

  // Handle habit_streaks - it might be an object or null
  const streak = habit.habit_streaks && typeof habit.habit_streaks === 'object' && !Array.isArray(habit.habit_streaks)
    ? habit.habit_streaks
    : null
  
  // Handle habit_completions - ensure it's an array
  const completions = Array.isArray(habit.habit_completions) 
    ? habit.habit_completions 
    : (habit.habit_completions ? [habit.habit_completions] : [])
  const recentCompletions = completions.slice(0, 10).reverse()
  
  // Calculate some motivational stats
  const completionRate = streak?.completion_rate || 0
  const isOnFire = (streak?.current_streak || 0) >= 7
  const isConsistent = completionRate >= 80

  return (
    <>
      {/* Edit Dialog */}
      {habit && (
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) {
            // Remove edit mode from URL when closing
            router.push(`/dashboard/habits/${habitId}`)
          }
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <HabitFormContent
              userId={userId}
              habitId={habitId}
              isEditMode={true}
              initialData={{
                name: habit.name,
                description: habit.description || undefined,
                category: habit.category as any,
                color: habit.color,
                icon: habit.icon,
                frequency_type: habit.frequency_type as any,
                frequency_config: habit.frequency_config as any,
                preferred_time: habit.preferred_time || undefined,
                estimated_duration: habit.estimated_duration || undefined,
                difficulty_level: habit.difficulty_level as any,
              }}
              onSuccess={() => {
                setShowEditDialog(false)
                router.push(`/dashboard/habits/${habitId}`)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-6"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        <div className="flex-1">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {habit.name}
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {habit.description || "No description"}
          </motion.p>
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditDialog(true)
              router.push(`/dashboard/habits/${habitId}?edit=true`)
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </motion.div>
      </motion.div>

      {/* Motivational Quote Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-blue-200/50 dark:border-blue-800/50 p-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </motion.div>
            <p className="text-sm sm:text-base font-medium text-foreground flex-1">
              {motivationalQuotes[quoteIndex]}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="overflow-hidden border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
                style={{ backgroundColor: habit.color || "#6366f1" }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.span 
                  className="text-5xl"
                  animate={{ 
                    rotate: [0, 10, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {habit.icon || "✨"}
                </motion.span>
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{habit.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">{habit.category}</Badge>
                  {habit.difficulty_level && (
                    <Badge variant="secondary" className="capitalize">{habit.difficulty_level}</Badge>
                  )}
                  {habit.xp_value && (
                    <Badge className="bg-indigo-600">
                      <Zap className="h-3 w-3 mr-1" />
                      +{habit.xp_value} XP
                    </Badge>
                  )}
                  {isOnFire && (
                    <Badge className="bg-orange-500 animate-pulse">
                      <Flame className="h-3 w-3 mr-1" />
                      On Fire!
                    </Badge>
                  )}
                  {isConsistent && (
                    <Badge className="bg-emerald-500">
                      <Star className="h-3 w-3 mr-1" />
                      Consistent
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Streak Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-800 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {isOnFire && (
                  <motion.div
                    className="absolute top-0 right-0"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <Flame className="h-8 w-8 text-orange-500 opacity-30" />
                  </motion.div>
                )}
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-muted-foreground font-medium">Current Streak</span>
                </div>
                <motion.p 
                  className="text-3xl font-bold text-orange-600 dark:text-orange-400 relative z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  {streak?.current_streak || 0}
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-muted-foreground font-medium">Best Streak</span>
                </div>
                <motion.p 
                  className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.45, type: "spring", stiffness: 200 }}
                >
                  {streak?.longest_streak || 0}
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground font-medium">Total</span>
                </div>
                <motion.p 
                  className="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {streak?.total_completions || 0}
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-muted-foreground font-medium">Rate</span>
                </div>
                <motion.p 
                  className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.55, type: "spring", stiffness: 200 }}
                >
                  {streak?.completion_rate ? Math.round(streak.completion_rate) : 0}%
                </motion.p>
              </motion.div>
            </div>

            {/* Completion Rate Progress */}
            {streak?.completion_rate !== undefined && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                  </div>
                  <span className="font-bold text-lg">{Math.round(streak.completion_rate)}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={streak.completion_rate} 
                    className="h-4 bg-muted"
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${streak.completion_rate}%` }}
                    transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                  />
                </div>
                {completionRate >= 90 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Outstanding consistency! Keep it up! 🎉
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Habit Details */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {habit.preferred_time && (
                <motion.div 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Time</p>
                    <p className="font-semibold">{habit.preferred_time}</p>
                  </div>
                </motion.div>
              )}
              {habit.estimated_duration && (
                <motion.div 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Duration</p>
                    <p className="font-semibold">~{habit.estimated_duration} minutes</p>
                  </div>
                </motion.div>
              )}
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-semibold capitalize">{habit.frequency_type.replace('_', ' ')}</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-muted-foreground">XP per Completion</p>
                  <p className="font-semibold">+{habit.xp_value || 10} XP</p>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Completions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        {recentCompletions.length > 0 ? (
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle>Recent Completions</CardTitle>
              </div>
              <CardDescription>Your last 10 completions - Keep up the amazing work! 🎉</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <AnimatePresence>
                  {recentCompletions.map((completion, index) => (
                    <motion.div
                      key={completion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-card to-card/50 hover:from-card/80 hover:to-card/60 transition-all"
                      whileHover={{ scale: 1.02, borderColor: "rgb(34, 197, 94)" }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="h-3 w-3 rounded-full bg-emerald-500"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity
                          }}
                        />
                        <div>
                          <p className="font-semibold">{formatDate(completion.completion_date, "MMM dd, yyyy")}</p>
                          {completion.completed_time && (
                            <p className="text-xs text-muted-foreground">{completion.completed_time}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {completion.mood_rating && (
                          <Badge variant="outline" className="text-xs">
                            {Array(completion.mood_rating).fill("😊").join("")}
                          </Badge>
                        )}
                        {completion.xp_earned && (
                          <Badge className="bg-indigo-600 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            +{completion.xp_earned} XP
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5 }}
              className="text-5xl mb-4"
            >
              🎯
            </motion.div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Start?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete this habit for the first time to see your progress here! Every journey begins with a single step. 💪
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
    </>
  )
}

