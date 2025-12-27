"use client"

import { useDashboardStats } from "@/lib/hooks/useProfile"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, Target, TrendingUp, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { levelProgress } from "@/lib/utils/xp"
import { motion } from "framer-motion"

interface DashboardStatsProps {
  userId: string
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: stats, isLoading } = useDashboardStats(userId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const xpInfo = levelProgress(stats.total_xp)

  const statCards = [
    {
      label: 'Completed Today',
      value: `${stats.completed_today}/${stats.total_habits}`,
      subtitle: `${stats.completion_rate}% complete`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Active Streaks',
      value: stats.active_streaks,
      subtitle: 'Keep it going! 🔥',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: 'Total XP',
      value: stats.total_xp.toLocaleString(),
      subtitle: `Level ${stats.current_level}`,
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      label: 'XP to Next Level',
      value: `${xpInfo.xp_current}/${xpInfo.xp_for_next}`,
      subtitle: `${Math.round(xpInfo.progress * 100)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="h-full"
          >
            <Card className="overflow-hidden h-full border-2 bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-slate-900/50 dark:via-blue-950/20 dark:to-purple-950/20 hover:border-blue-400/70 dark:hover:border-blue-600/70 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    className={`p-2 sm:p-2.5 rounded-lg ${stat.bgColor} shrink-0`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                    <motion.p
                      className="text-lg sm:text-xl md:text-2xl font-bold font-mono"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.subtitle}</p>
                  </div>
                </div>
                {index === 3 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                    className="mt-2 sm:mt-3"
                  >
                    <Progress value={xpInfo.progress * 100} className="h-1.5 sm:h-2" />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

