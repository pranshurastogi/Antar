"use client"

import { useState } from "react"
import { useCompletions } from "@/lib/hooks/useCompletions"
import { useHabits } from "@/lib/hooks/useHabits"
import { useAIAnalyzePatterns } from "@/lib/hooks/useAI"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { motion } from "framer-motion"
import { subDays, format, parseISO, getHours } from "date-fns"
import { TrendingUp, Target, Calendar, Zap } from "lucide-react"
import { FunLoader } from "@/components/ui/fun-loader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { Spinner } from "@/components/ui/spinner"
import "@/components/habits/notebook-theme.css"

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

  // Prepare completion data for AI analysis
  const completionData = completions && habits
    ? completions
        .slice(-50) // Last 50 completions
        .map(c => {
          const habit = habits.find(h => h.id === c.habit_id)
          return {
            date: c.completion_date,
            time: c.completed_time || (c.completed_at ? format(parseISO(c.completed_at), 'HH:mm') : 'Unknown'),
            mood: c.mood_rating || undefined,
            energy: c.energy_level || undefined,
            habitName: habit?.name || 'Unknown',
          }
        })
    : undefined

  // Use the new React Query-based hook
  const { data: analysis, isLoading: aiAnalyzing } = useAIAnalyzePatterns(
    'all-habits', // Use a generic ID for all habits analysis
    completionData,
    !!completionData && completionData.length > 0
  )

  if (completionsLoading || habitsLoading) {
    return <FunLoader message="Analyzing your progress..." size="md" />
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

      {/* Notebook Insights Section */}
      {completions && completions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="notebook-container relative"
        >
          <div className="sticker teal" style={{ top: '10px', right: '10px', zIndex: 20 }}>
            📝 Notebook Insights
          </div>
          <Card className="border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl bg-white/95 dark:bg-slate-900/95">
            <CardHeader className="bg-gradient-to-r from-[#06D6A0]/10 via-[#26547C]/10 to-[#EF476F]/10 dark:from-[#06D6A0]/20 dark:via-[#26547C]/20 dark:to-[#EF476F]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={Icons.brain} className="h-5 w-5 text-[#26547C] dark:text-[#60A5FA]" />
                <CardTitle className="handwritten-title text-xl sm:text-2xl text-[#26547C] dark:text-[#60A5FA]">
                  Smart Notebook Pattern Analysis
                </CardTitle>
              </div>
              <CardDescription className="handwritten-text">
                Discover insights about your habit completion patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {aiAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Spinner className="h-8 w-8 text-[#26547C] dark:text-[#60A5FA]" />
                  <p className="handwritten-text text-muted-foreground">Analyzing your patterns...</p>
                </div>
              ) : analysis ? (
                <div className="grid md:grid-cols-2 gap-4">
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
                        Optimal Completion Time
                      </h4>
                      <p className="handwritten-text text-sm">{analysis.bestTime}</p>
                    </div>
                  )}

                  {analysis.patterns && analysis.patterns.length > 0 && (
                    <div className="notebook-entry p-4 border-[#EF476F]/30 dark:border-[#FB7185]/30">
                      <h4 className="handwritten-label font-semibold text-[#EF476F] dark:text-[#FB7185] mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.chartLine} className="h-4 w-4" />
                        Notable Patterns
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
    </div>
  )
}

