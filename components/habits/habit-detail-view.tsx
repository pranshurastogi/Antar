"use client"

import { useHabit } from "@/lib/hooks/useHabits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Calendar, Target, TrendingUp, Clock, Zap, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils/dates"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

interface HabitDetailViewProps {
  habitId: string
  userId: string
  isEditMode?: boolean
}

export function HabitDetailView({ habitId, userId, isEditMode }: HabitDetailViewProps) {
  const router = useRouter()
  const { data: habit, isLoading } = useHabit(habitId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!habit) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Habit not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const streak = habit.habit_streaks
  const completions = habit.habit_completions || []
  const recentCompletions = completions.slice(0, 10).reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {habit.name}
          </h1>
          <p className="text-muted-foreground mt-1">{habit.description || "No description"}</p>
        </div>
      </motion.div>

      {/* Main Stats Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg"
              style={{ backgroundColor: habit.color || "#6366f1" }}
            >
              <span className="text-4xl">{habit.icon || "✨"}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{habit.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{habit.category}</Badge>
                {habit.difficulty_level && (
                  <Badge variant="secondary">{habit.difficulty_level}</Badge>
                )}
                {habit.xp_value && (
                  <Badge className="bg-indigo-600">
                    <Zap className="h-3 w-3 mr-1" />
                    +{habit.xp_value} XP
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Streak Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streak?.current_streak || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-muted-foreground">Best Streak</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {streak?.longest_streak || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {streak?.total_completions || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {streak?.completion_rate ? Math.round(streak.completion_rate) : 0}%
              </p>
            </div>
          </div>

          {/* Completion Rate Progress */}
          {streak?.completion_rate && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">{Math.round(streak.completion_rate)}%</span>
              </div>
              <Progress value={streak.completion_rate} className="h-3" />
            </div>
          )}

          {/* Habit Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            {habit.preferred_time && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Time</p>
                  <p className="font-semibold">{habit.preferred_time}</p>
                </div>
              </div>
            )}
            {habit.estimated_duration && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Duration</p>
                  <p className="font-semibold">~{habit.estimated_duration} minutes</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-semibold capitalize">{habit.frequency_type.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">XP per Completion</p>
                <p className="font-semibold">+{habit.xp_value || 10} XP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Completions */}
      {recentCompletions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
            <CardDescription>Your last 10 completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompletions.map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-medium">{formatDate(completion.completion_date, "MMM dd, yyyy")}</p>
                      {completion.completed_time && (
                        <p className="text-xs text-muted-foreground">{completion.completed_time}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {completion.mood_rating && (
                      <Badge variant="outline">
                        {Array(completion.mood_rating).fill("😊").join("")}
                      </Badge>
                    )}
                    {completion.xp_earned && (
                      <Badge className="bg-indigo-600">
                        +{completion.xp_earned} XP
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

