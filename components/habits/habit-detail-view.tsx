"use client"

import { useHabit } from "@/lib/hooks/useHabits"
import { useCompletions } from "@/lib/hooks/useCompletions"
import { useAIAnalyzePatternsLegacy } from "@/lib/hooks/useAI"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils/dates"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { HabitFormContent } from "@/components/habits/habit-form"
import { FunLoader } from "@/components/ui/fun-loader"
import "@/components/habits/notebook-theme.css"

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
  const { data: allCompletions } = useCompletions(userId)
  const { analyze, isLoading: aiAnalyzing, analysis } = useAIAnalyzePatternsLegacy()
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showEditDialog, setShowEditDialog] = useState(isEditMode)
  const [insightsLoaded, setInsightsLoaded] = useState(false)

  useEffect(() => {
    setShowEditDialog(isEditMode)
  }, [isEditMode])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Load AI insights when completions are available
  useEffect(() => {
    if (allCompletions && allCompletions.length > 0 && !insightsLoaded && habit) {
      const habitCompletions = allCompletions
        .filter(c => c.habit_id === habitId)
        .slice(-30) // Last 30 completions
        .map(c => ({
          date: c.completion_date,
          time: c.completed_time || "Unknown",
          mood: c.mood_rating || undefined,
          energy: c.energy_level || undefined,
          habitName: habit.name,
        }))

      if (habitCompletions.length > 0) {
        analyze(habitCompletions)
        setInsightsLoaded(true)
      }
    }
  }, [allCompletions, habit, habitId, analyze, insightsLoaded])

  // Show edit dialog when in edit mode
  // We render it alongside the detail view so the dialog can overlay

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FunLoader message="Loading your habit details..." />
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
            <FontAwesomeIcon icon={Icons.arrowLeft} className="h-4 w-4 mr-2" />
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
            <FontAwesomeIcon icon={Icons.arrowLeft} className="h-5 w-5" />
          </Button>
        </motion.div>
        <div className="flex-1 relative">
          <motion.h1 
            className="handwritten-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {habit.name}
          </motion.h1>
          <motion.p 
            className="handwritten-text text-muted-foreground mt-2 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {habit.description || "No description yet..."}
          </motion.p>
          <div className="scribble-decoration scribble-1" />
          <div className="scribble-decoration scribble-2" />
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            className="bg-white dark:bg-slate-900 border-2 border-[#26547C] dark:border-[#60A5FA]"
            onClick={() => {
              setShowEditDialog(true)
              router.push(`/dashboard/habits/${habitId}?edit=true`)
            }}
          >
            <FontAwesomeIcon icon={Icons.edit} className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </motion.div>
      </motion.div>

      {/* Motivational Quote Banner - Notebook Style */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FFD166]/20 via-[#EF476F]/10 to-[#06D6A0]/20 dark:from-[#FFD166]/30 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/30 border-2 border-[#FFD166]/30 dark:border-[#FFD166]/50 p-4 bg-white/80 dark:bg-slate-900/80"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <FontAwesomeIcon icon={Icons.sparkles} className="h-5 w-5 text-[#FFD166]" />
            </motion.div>
            <p className="handwritten-text text-sm sm:text-base font-medium text-foreground flex-1">
              {motivationalQuotes[quoteIndex]}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Stats Card - Notebook Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="notebook-container relative"
      >
        <div className="sticker" style={{ top: '10px', right: '20px' }}>
          📊 Stats
        </div>
        <Card className="overflow-hidden border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#26547C]/10 via-[#EF476F]/10 to-[#06D6A0]/10 dark:from-[#26547C]/20 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
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
                    <Badge className="bg-[#26547C] dark:bg-[#60A5FA]">
                      <FontAwesomeIcon icon={Icons.bolt} className="h-3 w-3 mr-1" />
                      +{habit.xp_value} XP
                    </Badge>
                  )}
                  {isOnFire && (
                    <Badge className="bg-[#EF476F] dark:bg-[#FB7185] animate-pulse">
                      <FontAwesomeIcon icon={Icons.fire} className="h-3 w-3 mr-1" />
                      On Fire!
                    </Badge>
                  )}
                  {isConsistent && (
                    <Badge className="bg-[#06D6A0] dark:bg-[#34D399]">
                      <FontAwesomeIcon icon={Icons.star} className="h-3 w-3 mr-1" />
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
                className="p-4 rounded-xl bg-gradient-to-br from-[#EF476F]/20 to-[#EF476F]/10 dark:from-[#EF476F]/30 dark:to-[#EF476F]/20 border-2 border-[#EF476F]/30 dark:border-[#FB7185]/50 relative overflow-hidden"
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
                    <FontAwesomeIcon icon={Icons.fire} className="h-8 w-8 text-[#EF476F] opacity-30" />
                  </motion.div>
                )}
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <FontAwesomeIcon icon={Icons.fire} className="h-5 w-5 text-[#EF476F] dark:text-[#FB7185]" />
                  <span className="handwritten-label text-sm text-muted-foreground">Current Streak</span>
                </div>
                <motion.p 
                  className="stats-badge text-[#EF476F] dark:text-[#FB7185] relative z-10"
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
                  <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-5 w-5 text-[#EF476F] dark:text-[#FB7185]" />
                  <span className="handwritten-label text-sm text-muted-foreground">Best Streak</span>
                </div>
                <motion.p 
                  className="stats-badge text-[#EF476F] dark:text-[#FB7185]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.45, type: "spring", stiffness: 200 }}
                >
                  {streak?.longest_streak || 0}
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-[#06D6A0]/20 to-[#06D6A0]/10 dark:from-[#06D6A0]/30 dark:to-[#06D6A0]/20 border-2 border-[#06D6A0]/30 dark:border-[#06D6A0]/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={Icons.target} className="h-5 w-5 text-[#06D6A0] dark:text-[#34D399]" />
                  <span className="handwritten-label text-sm text-muted-foreground">Total</span>
                </div>
                <motion.p 
                  className="stats-badge text-[#06D6A0] dark:text-[#34D399]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {streak?.total_completions || 0}
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-[#26547C]/20 to-[#26547C]/10 dark:from-[#26547C]/30 dark:to-[#26547C]/20 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={Icons.calendar} className="h-5 w-5 text-[#26547C] dark:text-[#60A5FA]" />
                  <span className="handwritten-label text-sm text-muted-foreground">Rate</span>
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
                    <FontAwesomeIcon icon={Icons.trophy} className="h-4 w-4 text-[#FFD166]" />
                    <span className="handwritten-label text-sm text-muted-foreground">Completion Rate</span>
                  </div>
                  <span className="stats-badge text-[#FFD166]">{Math.round(streak.completion_rate)}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={streak.completion_rate} 
                    className="h-4 bg-muted"
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-4 bg-gradient-to-r from-[#26547C] via-[#EF476F] to-[#06D6A0] rounded-full"
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
                    className="handwritten-text text-sm text-[#06D6A0] dark:text-[#34D399] font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={Icons.star} className="h-4 w-4" />
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
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-[#26547C]/20 dark:border-[#60A5FA]/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <FontAwesomeIcon icon={Icons.clock} className="h-5 w-5 text-[#26547C] dark:text-[#60A5FA]" />
                  <div>
                    <p className="handwritten-label text-sm text-muted-foreground">Preferred Time</p>
                    <p className="handwritten-text font-semibold">{habit.preferred_time}</p>
                  </div>
                </motion.div>
              )}
              {habit.estimated_duration && (
                <motion.div 
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-[#EF476F]/20 dark:border-[#FB7185]/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <FontAwesomeIcon icon={Icons.clock} className="h-5 w-5 text-[#EF476F] dark:text-[#FB7185]" />
                  <div>
                    <p className="handwritten-label text-sm text-muted-foreground">Estimated Duration</p>
                    <p className="handwritten-text font-semibold">~{habit.estimated_duration} minutes</p>
                  </div>
                </motion.div>
              )}
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-[#06D6A0]/20 dark:border-[#34D399]/20"
                whileHover={{ scale: 1.02 }}
              >
                <FontAwesomeIcon icon={Icons.calendar} className="h-5 w-5 text-[#06D6A0] dark:text-[#34D399]" />
                <div>
                  <p className="handwritten-label text-sm text-muted-foreground">Frequency</p>
                  <p className="handwritten-text font-semibold capitalize">{habit.frequency_type.replace('_', ' ')}</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-[#FFD166]/20"
                whileHover={{ scale: 1.02 }}
              >
                <FontAwesomeIcon icon={Icons.bolt} className="h-5 w-5 text-[#FFD166]" />
                <div>
                  <p className="handwritten-label text-sm text-muted-foreground">XP per Completion</p>
                  <p className="handwritten-text font-semibold">+{habit.xp_value || 10} XP</p>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notebook Insights - Notebook Style */}
      {habit && recentCompletions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="notebook-container relative"
        >
          <div className="sticker teal" style={{ top: '10px', right: '20px' }}>
            📝 Notebook Insights
          </div>
          <Card className="border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#06D6A0]/10 via-[#26547C]/10 to-[#EF476F]/10 dark:from-[#06D6A0]/20 dark:via-[#26547C]/20 dark:to-[#EF476F]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={Icons.brain} className="h-5 w-5 text-[#26547C] dark:text-[#60A5FA]" />
                <CardTitle className="handwritten-title text-xl sm:text-2xl">Smart Notebook Insights</CardTitle>
              </div>
              <CardDescription className="handwritten-text">Discover patterns and optimize your habit journey</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {aiAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Spinner className="h-8 w-8 text-[#26547C] dark:text-[#60A5FA]" />
                  <p className="handwritten-text text-muted-foreground">Analyzing your patterns...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="notebook-entry p-4 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                      <h4 className="handwritten-label font-semibold text-[#26547C] dark:text-[#60A5FA] mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.circleInfo} className="h-4 w-4" />
                        Key Insights
                      </h4>
                      <ul className="space-y-2">
                        {analysis.insights.map((insight, idx) => (
                          <li key={idx} className="handwritten-text text-sm flex items-start gap-2">
                            <span className="text-[#06D6A0] mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="notebook-entry p-4 border-[#06D6A0]/30 dark:border-[#34D399]/30">
                      <h4 className="handwritten-label font-semibold text-[#06D6A0] dark:text-[#34D399] mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.target} className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="handwritten-text text-sm flex items-start gap-2">
                            <span className="text-[#06D6A0] mt-1">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.bestTime && (
                    <div className="notebook-entry p-4 border-[#FFD166]/30">
                      <h4 className="handwritten-label font-semibold text-[#FFD166] mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.clock} className="h-4 w-4" />
                        Optimal Time
                      </h4>
                      <p className="handwritten-text text-sm">{analysis.bestTime}</p>
                    </div>
                  )}

                  {analysis.patterns && analysis.patterns.length > 0 && (
                    <div className="notebook-entry p-4 border-[#EF476F]/30 dark:border-[#FB7185]/30">
                      <h4 className="handwritten-label font-semibold text-[#EF476F] dark:text-[#FB7185] mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.chartLine} className="h-4 w-4" />
                        Patterns
                      </h4>
                      <ul className="space-y-2">
                        {analysis.patterns.map((pattern, idx) => (
                          <li key={idx} className="handwritten-text text-sm flex items-start gap-2">
                            <span className="text-[#EF476F] mt-1">📊</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="bg-[#FFD166]/10 border-[#FFD166]">
                  <FontAwesomeIcon icon={Icons.circleInfo} className="h-4 w-4" />
                  <AlertDescription className="handwritten-text">
                    Complete more habits to unlock notebook insights! 🚀
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Completions - Notebook Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="notebook-container relative"
      >
        <div className="sticker" style={{ top: '10px', right: '20px' }}>
          📝 Journal
        </div>
        {recentCompletions.length > 0 ? (
          <Card className="border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#06D6A0]/10 via-[#26547C]/10 to-[#EF476F]/10 dark:from-[#06D6A0]/20 dark:via-[#26547C]/20 dark:to-[#EF476F]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={Icons.circleCheck} className="h-5 w-5 text-[#06D6A0] dark:text-[#34D399]" />
                <CardTitle className="handwritten-title text-2xl">Recent Completions</CardTitle>
              </div>
              <CardDescription className="handwritten-text">Your last 10 completions - Keep up the amazing work! 🎉</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {recentCompletions.map((completion, index) => (
                    <motion.div
                      key={completion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="notebook-entry relative"
                    >
                      <div className="paper-clip" />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className="h-3 w-3 rounded-full bg-[#06D6A0]"
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
                              <p className="handwritten-text font-semibold text-lg">{formatDate(completion.completion_date, "MMM dd, yyyy")}</p>
                              {completion.completed_time && (
                                <p className="handwritten-text text-xs text-muted-foreground">{completion.completed_time}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {completion.mood_rating && (
                              <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 border-[#EF476F]/30">
                                {Array(completion.mood_rating).fill("😊").join("")}
                              </Badge>
                            )}
                            {completion.energy_level && (
                              <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 border-[#FFD166]/30">
                                {Array(completion.energy_level).fill("🔋").join("")}
                              </Badge>
                            )}
                            {completion.xp_earned && (
                              <Badge className="bg-[#26547C] dark:bg-[#60A5FA] text-xs">
                                <FontAwesomeIcon icon={Icons.bolt} className="h-3 w-3 mr-1" />
                                +{completion.xp_earned} XP
                              </Badge>
                            )}
                          </div>
                        </div>
                        {completion.notes && (
                          <div className="notebook-note">
                            <p className="handwritten-text">{completion.notes}</p>
                          </div>
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
            className="text-center py-12 px-6 rounded-xl bg-white/90 dark:bg-slate-900/90 border-2 border-dashed border-[#26547C]/30 dark:border-[#60A5FA]/30 notebook-container"
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
            <h3 className="handwritten-title text-2xl mb-2 text-[#26547C] dark:text-[#60A5FA]">
              Ready to Start?
            </h3>
            <p className="handwritten-text text-muted-foreground max-w-md mx-auto">
              Complete this habit for the first time to see your progress here! Every journey begins with a single step. 💪
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
    </>
  )
}

