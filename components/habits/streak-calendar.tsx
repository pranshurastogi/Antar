"use client"

import { useState, useMemo } from "react"
import { useCompletions } from "@/lib/hooks/useCompletions"
import { useHabits } from "@/lib/hooks/useHabits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, subDays } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, TrendingUp, Flame, Target, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StreakCalendarProps {
  userId: string
  months?: number
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function StreakCalendar({ userId, months = 6 }: StreakCalendarProps) {
  const { data: completions, isLoading: completionsLoading } = useCompletions(userId)
  const { data: habits, isLoading: habitsLoading } = useHabits(userId)
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all')
  const [viewMonths, setViewMonths] = useState(months)

  const isLoading = completionsLoading || habitsLoading

  // Generate last N months of dates
  const today = new Date()
  const days: Date[] = []
  for (let i = viewMonths * 30; i >= 0; i--) {
    days.push(subDays(today, i))
  }

  // Filter completions by selected habit
  const filteredCompletions = useMemo(() => {
    if (!completions) return []
    if (selectedHabitId === 'all') return completions
    return completions.filter(comp => comp.habit_id === selectedHabitId)
  }, [completions, selectedHabitId])

  // Create completion map with detailed info
  const completionMap = new Map<string, { count: number; habits: string[]; xp: number }>()
  filteredCompletions?.forEach((comp) => {
    const dateStr = comp.completion_date
    const existing = completionMap.get(dateStr) || { count: 0, habits: [], xp: 0 }
    const habitName = habits?.find(h => h.id === comp.habit_id)?.name || 'Unknown'
    completionMap.set(dateStr, {
      count: existing.count + 1,
      habits: [...existing.habits, habitName],
      xp: existing.xp + (comp.xp_earned || 0)
    })
  })

  // Calculate stats
  const stats = useMemo(() => {
    const totalDays = days.length
    const activeDays = completionMap.size
    const totalCompletions = filteredCompletions?.length || 0
    const totalXP = Array.from(completionMap.values()).reduce((sum, day) => sum + day.xp, 0)
    const currentStreak = calculateCurrentStreak(days, completionMap)
    const longestStreak = calculateLongestStreak(days, completionMap)
    const completionRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0

    return {
      totalDays,
      activeDays,
      totalCompletions,
      totalXP,
      currentStreak,
      longestStreak,
      completionRate
    }
  }, [days, completionMap, filteredCompletions])

  // Get color intensity based on completion count
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900'
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700'
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-600'
    if (count >= 4) return 'bg-emerald-600 dark:bg-emerald-500'
    return 'bg-gray-100 dark:bg-gray-800'
  }

  // Group days by week with month labels
  const weeks: { days: Date[]; monthLabel?: string }[] = []
  let currentWeek: Date[] = []
  let lastMonth = -1
  
  days.forEach((day, index) => {
    const dayMonth = day.getMonth()
    const isNewMonth = dayMonth !== lastMonth && index > 0
    
    if (isNewMonth && currentWeek.length > 0) {
      weeks.push({ days: [...currentWeek], monthLabel: MONTH_LABELS[lastMonth] })
      currentWeek = []
    }
    
    currentWeek.push(day)
    lastMonth = dayMonth
    
    if (currentWeek.length === 7 || index === days.length - 1) {
      if (index === days.length - 1 && isNewMonth) {
        weeks.push({ days: [...currentWeek], monthLabel: MONTH_LABELS[dayMonth] })
      } else {
        weeks.push({ days: [...currentWeek] })
      }
      currentWeek = []
    }
  })

  // Add first month label
  if (weeks.length > 0 && !weeks[0].monthLabel) {
    weeks[0].monthLabel = MONTH_LABELS[days[0].getMonth()]
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50/50 via-red-50/50 to-pink-50/50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Flame className="h-6 w-6 text-orange-500" />
                Your Habit Journey
              </CardTitle>
              <CardDescription className="mt-1">
                Visualize your consistency and track your progress
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Habits</SelectItem>
                  {habits?.map(habit => (
                    <SelectItem key={habit.id} value={habit.id}>
                      {habit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
              </div>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak} days</p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-muted-foreground font-medium">Best Streak</span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.longestStreak} days</p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-muted-foreground font-medium">Completion Rate</span>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completionRate}%</p>
            </motion.div>
            
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-muted-foreground font-medium">Total XP</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.totalXP}</p>
            </motion.div>
          </div>

          <TooltipProvider>
            <div className="space-y-2">
              {/* Day Labels */}
              <div className="flex gap-1 ml-8 mb-1">
                {DAY_LABELS.map((label, idx) => (
                  <div key={idx} className="w-4 text-xs text-muted-foreground text-center">
                    {idx % 2 === 0 ? label : ''}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {/* Month Label */}
                      {week.monthLabel && (
                        <div className="text-xs font-semibold text-muted-foreground mb-1 h-4 flex items-center">
                          {week.monthLabel}
                        </div>
                      )}
                      {!week.monthLabel && <div className="h-4" />}
                      
                      {/* Week Days */}
                      {week.days.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const dayData = completionMap.get(dateStr) || { count: 0, habits: [], xp: 0 }
                        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={`w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10 relative ${getColorClass(dayData.count)} ${
                                  isToday ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                                }`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                                whileHover={{ scale: 1.3, zIndex: 10 }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">{format(day, 'EEEE, MMMM dd, yyyy')}</p>
                                {dayData.count > 0 ? (
                                  <>
                                    <p className="text-xs text-muted-foreground">
                                      {dayData.count} {dayData.count === 1 ? 'habit' : 'habits'} completed
                                    </p>
                                    {dayData.habits.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        <p className="text-xs font-medium">Completed:</p>
                                        {dayData.habits.map((habit, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                                            {habit}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    {dayData.xp > 0 && (
                                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                        +{dayData.xp} XP earned
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No completions</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend and Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-600 rounded-sm" />
                    <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-sm" />
                  </div>
                  <span>More</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMonths(Math.max(3, viewMonths - 3))}
                    disabled={viewMonths <= 3}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                    {viewMonths} months
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMonths(Math.min(12, viewMonths + 3))}
                    disabled={viewMonths >= 12}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function to calculate current streak
function calculateCurrentStreak(days: Date[], completionMap: Map<string, any>): number {
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < days.length; i++) {
    const day = days[days.length - 1 - i]
    const dateStr = format(day, 'yyyy-MM-dd')
    const hasCompletion = completionMap.has(dateStr) && completionMap.get(dateStr).count > 0
    
    if (hasCompletion) {
      streak++
    } else if (i === 0) {
      // If today has no completion, check yesterday
      continue
    } else {
      break
    }
  }
  
  return streak
}

// Helper function to calculate longest streak
function calculateLongestStreak(days: Date[], completionMap: Map<string, any>): number {
  let longestStreak = 0
  let currentStreak = 0
  
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const hasCompletion = completionMap.has(dateStr) && completionMap.get(dateStr).count > 0
    
    if (hasCompletion) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  return longestStreak
}

