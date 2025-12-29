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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import "@/components/habits/notebook-theme.css"

interface StreakCalendarProps {
  userId: string
  months?: number
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function StreakCalendar({ userId, months = 1 }: StreakCalendarProps) {
  const { data: completions, isLoading: completionsLoading, error: completionsError } = useCompletions(userId)
  const { data: habits, isLoading: habitsLoading, error: habitsError } = useHabits(userId)
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const isLoading = completionsLoading || habitsLoading
  const error = completionsError || habitsError
  const today = new Date()

  // Generate dates for the current month view
  const days: Date[] = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month
    const firstDay = new Date(year, month, 1)
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from the first day of the week (Sunday = 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    // End on the last day of the week
    const endDate = new Date(lastDay)
    const daysToAdd = 6 - endDate.getDay()
    endDate.setDate(endDate.getDate() + daysToAdd)
    
    const dateArray: Date[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dateArray
  }, [currentMonth])

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

  // Calculate stats for current month
  const stats = useMemo(() => {
    // Filter days to only current month (exclude padding days from previous/next month)
    const currentMonthDays = days.filter(day => 
      day.getMonth() === currentMonth.getMonth() && 
      day.getFullYear() === currentMonth.getFullYear()
    )
    
    const totalDays = currentMonthDays.length
    const activeDays = currentMonthDays.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = completionMap.get(dateStr)
      return dayData && dayData.count > 0
    }).length
    
    const monthCompletions = currentMonthDays.reduce((sum, day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = completionMap.get(dateStr) || { count: 0, habits: [], xp: 0 }
      return sum + dayData.count
    }, 0)
    
    const totalXP = currentMonthDays.reduce((sum, day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = completionMap.get(dateStr) || { count: 0, habits: [], xp: 0 }
      return sum + dayData.xp
    }, 0)
    
    const currentStreak = calculateCurrentStreak(days, completionMap)
    const longestStreak = calculateLongestStreak(days, completionMap)
    const completionRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0

    return {
      totalDays,
      activeDays,
      totalCompletions: monthCompletions,
      totalXP,
      currentStreak,
      longestStreak,
      completionRate
    }
  }, [days, completionMap, filteredCompletions, currentMonth])

  // Get dart hit style based on completion count (dart board theme)
  const getDartStyle = (count: number) => {
    if (count === 0) return {
      bg: 'bg-slate-200 dark:bg-slate-700',
      ring: '',
      emoji: ''
    }
    if (count === 1) return {
      bg: 'bg-[#06D6A0] dark:bg-[#06D6A0]/80',
      ring: 'ring-2 ring-[#06D6A0]/50',
      emoji: '🎯'
    }
    if (count === 2) return {
      bg: 'bg-[#26547C] dark:bg-[#60A5FA]',
      ring: 'ring-2 ring-[#26547C]/50 dark:ring-[#60A5FA]/50',
      emoji: '🎯'
    }
    if (count === 3) return {
      bg: 'bg-[#EF476F] dark:bg-[#FB7185]',
      ring: 'ring-2 ring-[#EF476F]/50 dark:ring-[#FB7185]/50',
      emoji: '🎯'
    }
    if (count >= 4) return {
      bg: 'bg-[#FFD166] dark:bg-[#FFD166]',
      ring: 'ring-2 ring-[#FFD166]/50 animate-pulse',
      emoji: '🎯'
    }
    return {
      bg: 'bg-slate-200 dark:bg-slate-700',
      ring: '',
      emoji: ''
    }
  }

  // Group days by week
  const weeks: { days: Date[] }[] = []
  let currentWeek: Date[] = []
  
  days.forEach((day, index) => {
    currentWeek.push(day)
    
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push({ days: [...currentWeek] })
      currentWeek = []
    }
  })

  // Helper functions for month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() && 
                         currentMonth.getFullYear() === new Date().getFullYear()
  
  const monthYearLabel = format(currentMonth, 'MMMM yyyy')

  if (isLoading) {
    return (
      <div className="notebook-container bg-white/95 dark:bg-slate-900/95 rounded-lg p-4 border-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-[#EF476F]/10 border-[#EF476F] dark:bg-[#EF476F]/20 dark:border-[#FB7185]">
        <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
        <AlertDescription className="handwritten-text">
          Couldn't load your journey. Try refreshing!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Dart Board Decoration */}
      <div className="absolute -top-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 opacity-10 dark:opacity-5 pointer-events-none">
        <div className="relative w-full h-full">
          {/* Dart board circles */}
          <div className="absolute inset-0 rounded-full border-4 border-[#26547C]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-[#EF476F]"></div>
          <div className="absolute inset-4 rounded-full border-2 border-[#06D6A0]"></div>
          <div className="absolute inset-6 rounded-full bg-[#FFD166]"></div>
          {/* Dart */}
          <div className="absolute top-1/2 left-1/2 w-2 h-8 bg-[#EF476F] transform -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-sm"></div>
        </div>
      </div>

      <Card className="notebook-container bg-white/95 dark:bg-slate-900/95 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl overflow-hidden relative">
        <div className="sticker pink" style={{ top: '10px', right: '10px', zIndex: 20 }}>
          🎯 Bullseye
        </div>
        
        <CardHeader className="bg-gradient-to-r from-[#26547C]/10 via-[#EF476F]/10 to-[#06D6A0]/10 dark:from-[#26547C]/20 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="handwritten-title text-xl sm:text-2xl md:text-3xl text-[#26547C] dark:text-[#60A5FA] flex items-center gap-2">
                <FontAwesomeIcon icon={Icons.target} className="h-5 w-5 sm:h-6 sm:w-6 text-[#EF476F]" />
                Your Habit Journey
              </CardTitle>
              <CardDescription className="handwritten-text mt-1 text-sm sm:text-base">
                Visualize your consistency and track your progress 🎯
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                  <FontAwesomeIcon icon={Icons.bars} className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900">
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
        <CardContent className="pt-4 sm:pt-6">
          {/* Stats Summary - Dart Score Style - Enhanced */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <motion.div 
              className="notebook-entry p-3 sm:p-4 border-[#EF476F]/40 dark:border-[#FB7185]/60 bg-gradient-to-br from-[#EF476F]/5 to-[#EF476F]/10 dark:from-[#EF476F]/10 dark:to-[#EF476F]/20"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              whileHover={{ scale: 1.08, rotate: 1, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FontAwesomeIcon icon={Icons.fire} className="h-4 w-4 sm:h-5 sm:w-5 text-[#EF476F] dark:text-[#FB7185]" />
                </motion.div>
                <span className="handwritten-label text-xs sm:text-sm text-muted-foreground">Current Streak</span>
              </div>
              <p className="stats-badge text-[#EF476F] dark:text-[#FB7185] text-lg sm:text-xl md:text-2xl">{stats.currentStreak} days</p>
            </motion.div>
            
            <motion.div 
              className="notebook-entry p-3 sm:p-4 border-[#26547C]/40 dark:border-[#60A5FA]/60 bg-gradient-to-br from-[#26547C]/5 to-[#26547C]/10 dark:from-[#26547C]/10 dark:to-[#26547C]/20"
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring" }}
              whileHover={{ scale: 1.08, rotate: -1, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-4 w-4 sm:h-5 sm:w-5 text-[#26547C] dark:text-[#60A5FA]" />
                <span className="handwritten-label text-xs sm:text-sm text-muted-foreground">Best Streak</span>
              </div>
              <p className="stats-badge text-[#26547C] dark:text-[#60A5FA] text-lg sm:text-xl md:text-2xl">{stats.longestStreak} days</p>
            </motion.div>
            
            <motion.div 
              className="notebook-entry p-3 sm:p-4 border-[#06D6A0]/40 dark:border-[#34D399]/60 bg-gradient-to-br from-[#06D6A0]/5 to-[#06D6A0]/10 dark:from-[#06D6A0]/10 dark:to-[#06D6A0]/20"
              initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ scale: 1.08, rotate: 1, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={Icons.target} className="h-4 w-4 sm:h-5 sm:w-5 text-[#06D6A0] dark:text-[#34D399]" />
                <span className="handwritten-label text-xs sm:text-sm text-muted-foreground">Hit Rate</span>
              </div>
              <p className="stats-badge text-[#06D6A0] dark:text-[#34D399] text-lg sm:text-xl md:text-2xl">{stats.completionRate}%</p>
            </motion.div>
            
            <motion.div 
              className="notebook-entry p-3 sm:p-4 border-[#FFD166]/40 bg-gradient-to-br from-[#FFD166]/5 to-[#FFD166]/10 dark:from-[#FFD166]/10 dark:to-[#FFD166]/20"
              initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: "spring" }}
              whileHover={{ scale: 1.08, rotate: -1, y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FontAwesomeIcon icon={Icons.bolt} className="h-4 w-4 sm:h-5 sm:w-5 text-[#FFD166]" />
                </motion.div>
                <span className="handwritten-label text-xs sm:text-sm text-muted-foreground">Total Score</span>
              </div>
              <p className="stats-badge text-[#FFD166] text-lg sm:text-xl md:text-2xl">{stats.totalXP}</p>
            </motion.div>
          </div>

          <TooltipProvider>
            <div className="space-y-2 sm:space-y-3">
              {/* Day Labels - Scribble Style - Enhanced */}
              <div className="flex gap-1 sm:gap-1.5 ml-6 sm:ml-8 mb-2 sm:mb-3">
                {DAY_LABELS.map((label, idx) => (
                  <div 
                    key={idx} 
                    className="w-4 sm:w-5 md:w-6 handwritten-label text-xs sm:text-sm text-muted-foreground text-center font-semibold"
                    style={{ transform: `rotate(${idx % 2 === 0 ? '-1' : '1'}deg)` }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Month Header - Enhanced */}
              <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
                <motion.div
                  className="handwritten-title text-2xl sm:text-3xl md:text-4xl text-[#26547C] dark:text-[#60A5FA] text-center relative z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={monthYearLabel}
                >
                  {monthYearLabel}
                </motion.div>
                {/* Decorative underline */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-[#EF476F] to-transparent w-32 sm:w-48"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </div>

              {/* Calendar Grid - Dart Board Style - Enhanced */}
              <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <div className="inline-flex gap-1 sm:gap-1.5">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 sm:gap-1.5">
                      {/* Week Days - Dart Hits - Larger and Better */}
                      {week.days.map((day, dayIndex) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const dayData = completionMap.get(dateStr) || { count: 0, habits: [], xp: 0 }
                        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                        const dartStyle = getDartStyle(dayData.count)

                        return (
                          <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={`dart-hit w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full cursor-pointer transition-all hover:scale-175 hover:z-10 relative ${dartStyle.bg} ${dartStyle.ring} ${
                                  isToday ? 'ring-2 ring-[#FFD166] ring-offset-2 animate-pulse shadow-lg shadow-[#FFD166]/50' : ''
                                } ${dayData.count >= 4 ? 'bullseye' : ''} ${
                                  !isCurrentMonth ? 'opacity-30' : ''
                                }`}
                                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                                animate={{ opacity: isCurrentMonth ? 1 : 0.3, scale: 1, rotate: 0 }}
                                transition={{ 
                                  delay: weekIndex * 0.01 + dayIndex * 0.005,
                                  type: "spring",
                                  stiffness: 200
                                }}
                                whileHover={{ scale: 1.8, zIndex: 10, rotate: 360 }}
                                style={{
                                  boxShadow: dayData.count > 0 ? `0 0 ${dayData.count * 3}px ${dartStyle.bg.includes('#') ? dartStyle.bg.split('bg-')[1] : 'currentColor'}, inset 0 0 ${dayData.count * 2}px rgba(255,255,255,0.3)` : 'none'
                                }}
                              >
                                {dayData.count > 0 && (
                                  <motion.span
                                    className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] md:text-xs font-bold"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 + 0.2, type: "spring" }}
                                  >
                                    {dartStyle.emoji}
                                  </motion.span>
                                )}
                                {isToday && (
                                  <motion.div
                                    className="absolute -inset-1 rounded-full border-2 border-[#FFD166]"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs bg-white dark:bg-slate-900 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                              <div className="space-y-2">
                                <p className="handwritten-text font-semibold text-sm">{format(day, 'EEEE, MMMM dd, yyyy')}</p>
                                {dayData.count > 0 ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{dartStyle.emoji}</span>
                                      <p className="handwritten-text text-xs text-muted-foreground">
                                        {dayData.count} {dayData.count === 1 ? 'hit' : 'hits'} - {dayData.count} {dayData.count === 1 ? 'habit' : 'habits'} completed
                                      </p>
                                    </div>
                                    {dayData.habits.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        <p className="handwritten-label text-xs font-medium">Completed:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {dayData.habits.map((habit, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] bg-white dark:bg-slate-800 border-[#26547C]/30">
                                              {habit}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {dayData.xp > 0 && (
                                      <p className="handwritten-text text-xs text-[#06D6A0] dark:text-[#34D399] font-medium mt-1 flex items-center gap-1">
                                        <FontAwesomeIcon icon={Icons.bolt} className="h-3 w-3" />
                                        +{dayData.xp} XP earned
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="handwritten-text text-xs text-muted-foreground">Missed this day - No completions</p>
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

              {/* Legend and Controls - Dart Score Style */}
              <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#26547C]/20 dark:border-[#60A5FA]/20">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30 hover:bg-[#26547C]/10 hover:border-[#26547C]/50 dark:hover:bg-[#26547C]/20"
                  >
                    <FontAwesomeIcon icon={Icons.chevronLeft} className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="handwritten-text text-xs sm:text-sm hidden sm:inline">Previous</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    disabled={isCurrentMonth}
                    className={`bg-white dark:bg-slate-800 border-[#FFD166]/30 hover:bg-[#FFD166]/10 hover:border-[#FFD166]/50 dark:hover:bg-[#FFD166]/20 ${
                      isCurrentMonth ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FontAwesomeIcon icon={Icons.calendar} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="handwritten-text text-xs sm:text-sm">Today</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30 hover:bg-[#26547C]/10 hover:border-[#26547C]/50 dark:hover:bg-[#26547C]/20"
                  >
                    <span className="handwritten-text text-xs sm:text-sm hidden sm:inline mr-1 sm:mr-2">Next</span>
                    <FontAwesomeIcon icon={Icons.chevronRight} className="h-4 w-4" />
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="handwritten-label text-[10px] sm:text-xs text-muted-foreground">Hit Intensity:</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="handwritten-text text-[10px] sm:text-xs text-muted-foreground">Miss</span>
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#06D6A0] dark:bg-[#06D6A0]/80 rounded-full ring-1 ring-[#06D6A0]/30" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#26547C] dark:bg-[#60A5FA] rounded-full ring-1 ring-[#26547C]/30" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EF476F] dark:bg-[#FB7185] rounded-full ring-1 ring-[#EF476F]/30" />
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FFD166] rounded-full ring-1 ring-[#FFD166]/30 animate-pulse" />
                    </div>
                    <span className="handwritten-text text-[10px] sm:text-xs text-muted-foreground">Bullseye! 🎯</span>
                  </div>
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

