"use client"

import { useState } from "react"
import { useCompletions } from "@/lib/hooks/useCompletions"
import { useHabits } from "@/lib/hooks/useHabits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { subDays, format, parseISO, getHours } from "date-fns"
import { TrendingUp, Target, Calendar, Zap } from "lucide-react"

interface AnalyticsDashboardProps {
  userId: string
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | '3months'>('month')
  
  const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const endDate = format(new Date(), 'yyyy-MM-dd')

  const { data: completions, isLoading: completionsLoading } = useCompletions(userId, { start: startDate, end: endDate })
  const { data: habits, isLoading: habitsLoading } = useHabits(userId)

  if (completionsLoading || habitsLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  // Overview metrics
  const totalCompletions = completions?.length || 0
  const totalHabits = habits?.length || 0
  const completionRate = totalHabits > 0 ? Math.round((totalCompletions / (totalHabits * days)) * 100) : 0
  const totalXp = completions?.reduce((sum, c) => sum + c.xp_earned, 0) || 0

  // Completion trends (daily)
  const trendData: Record<string, number> = {}
  completions?.forEach((comp) => {
    trendData[comp.completion_date] = (trendData[comp.completion_date] || 0) + 1
  })
  const trendChartData = Object.entries(trendData)
    .map(([date, count]) => ({
      date: format(parseISO(date), 'MMM dd'),
      completions: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Category breakdown
  const categoryData: Record<string, number> = {}
  completions?.forEach((comp) => {
    const habit = habits?.find(h => h.id === comp.habit_id)
    if (habit) {
      categoryData[habit.category] = (categoryData[habit.category] || 0) + 1
    }
  })
  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
  }))

  // Time patterns (hourly)
  const timeData: Record<number, number> = {}
  completions?.forEach((comp) => {
    if (comp.completed_at) {
      const hour = getHours(parseISO(comp.completed_at))
      timeData[hour] = (timeData[hour] || 0) + 1
    }
  })
  const timeChartData = Array.from({ length: 24 }, (_, i) => ({
    hour: i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i-12}pm`,
    completions: timeData[i] || 0,
  }))

  // Mood/Energy correlation
  const moodEnergyData = completions
    ?.filter(c => c.mood_rating && c.energy_level)
    .map(c => ({
      mood: c.mood_rating,
      energy: c.energy_level,
    })) || []

  const overviewCards = [
    {
      title: 'Total Completions',
      value: totalCompletions,
      subtitle: `Last ${days} days`,
      icon: Target,
      color: 'text-emerald-600',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: 'Average daily',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      title: 'Active Days',
      value: Object.keys(trendData).length,
      subtitle: `Out of ${days} days`,
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Total XP Earned',
      value: totalXp.toLocaleString(),
      subtitle: 'Experience points',
      icon: Zap,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {overviewCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completions" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Time Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeChartData.filter(d => d.completions > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completions" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

