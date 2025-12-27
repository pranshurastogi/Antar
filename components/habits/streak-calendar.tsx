"use client"

import { useState } from "react"
import { useCompletions } from "@/lib/hooks/useCompletions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays, parseISO, startOfDay } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StreakCalendarProps {
  userId: string
  months?: number
}

export function StreakCalendar({ userId, months = 6 }: StreakCalendarProps) {
  const { data: completions, isLoading } = useCompletions(userId)

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  // Generate last N months of dates
  const today = new Date()
  const days: Date[] = []
  for (let i = months * 30; i >= 0; i--) {
    days.push(subDays(today, i))
  }

  // Create completion map
  const completionMap = new Map<string, number>()
  completions?.forEach((comp) => {
    const count = completionMap.get(comp.completion_date) || 0
    completionMap.set(comp.completion_date, count + 1)
  })

  // Get color intensity based on completion count
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900'
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700'
    if (count >= 3) return 'bg-emerald-600 dark:bg-emerald-500'
    return 'bg-gray-100 dark:bg-gray-800'
  }

  // Group days by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  days.forEach((day, index) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Your Habit Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const count = completionMap.get(dateStr) || 0
                    const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-indigo-400 ${getColorClass(count)} ${
                              isToday ? 'ring-2 ring-indigo-600' : ''
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-semibold">{format(day, 'MMM dd, yyyy')}</p>
                            <p>{count} habits completed</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
              <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900 rounded-sm" />
              <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm" />
              <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

