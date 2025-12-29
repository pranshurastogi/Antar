"use client"

import { useDashboardStats } from "@/lib/hooks/useProfile"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { levelProgress } from "@/lib/utils/xp"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DashboardStatsProps {
  userId: string
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: stats, isLoading, error } = useDashboardStats(userId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 sm:h-24 md:h-28 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-[#EF476F]/10 border-[#EF476F] dark:bg-[#EF476F]/20 dark:border-[#FB7185]">
        <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
        <AlertDescription className="handwritten-text text-sm">
          Couldn't load stats. Try refreshing!
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert className="bg-[#FFD166]/10 border-[#FFD166] dark:bg-[#FFD166]/20">
        <FontAwesomeIcon icon={Icons.circleInfo} className="h-4 w-4" />
        <AlertDescription className="handwritten-text text-sm">
          No stats available yet. Complete some habits to see your progress!
        </AlertDescription>
      </Alert>
    )
  }

  const xpInfo = levelProgress(stats.total_xp)

  const statCards = [
    {
      label: 'Completed Today',
      value: `${stats.completed_today}/${stats.total_habits}`,
      subtitle: `${stats.completion_rate}% complete`,
      icon: Icons.target,
      color: 'text-[#06D6A0]',
      bgColor: 'bg-[#06D6A0]/10 dark:bg-[#06D6A0]/20',
      borderColor: 'border-[#06D6A0]/30 dark:border-[#06D6A0]/50',
    },
    {
      label: 'Active Streaks',
      value: stats.active_streaks,
      subtitle: 'Keep it going! 🔥',
      icon: Icons.fire,
      color: 'text-[#EF476F]',
      bgColor: 'bg-[#EF476F]/10 dark:bg-[#EF476F]/20',
      borderColor: 'border-[#EF476F]/30 dark:border-[#EF476F]/50',
    },
    {
      label: 'Total XP',
      value: stats.total_xp.toLocaleString(),
      subtitle: `Level ${stats.current_level}`,
      icon: Icons.bolt,
      color: 'text-[#26547C]',
      bgColor: 'bg-[#26547C]/10 dark:bg-[#26547C]/20',
      borderColor: 'border-[#26547C]/30 dark:border-[#60A5FA]/50',
    },
    {
      label: 'XP to Next',
      value: `${xpInfo.xp_current}/${xpInfo.xp_for_next}`,
      subtitle: `${Math.round(xpInfo.progress * 100)}%`,
      icon: Icons.arrowTrendUp,
      color: 'text-[#FFD166]',
      bgColor: 'bg-[#FFD166]/10 dark:bg-[#FFD166]/20',
      borderColor: 'border-[#FFD166]/30 dark:border-[#FFD166]/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {statCards.map((stat, index) => {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2, rotate: -0.5 }}
            className="h-full"
          >
            <Card className={`overflow-hidden h-full border-2 ${stat.borderColor} bg-white/95 dark:bg-slate-900/95 hover:shadow-xl transition-all notebook-entry`}>
              <CardContent className="p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <motion.div
                    className={`p-2 rounded-lg ${stat.bgColor} shrink-0`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FontAwesomeIcon icon={stat.icon} className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="handwritten-label text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                    <motion.p
                      className={`stats-badge text-base sm:text-lg md:text-xl lg:text-2xl ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="handwritten-text text-[10px] sm:text-xs text-muted-foreground truncate">{stat.subtitle}</p>
                  </div>
                </div>
                {index === 3 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                    className="mt-2 sm:mt-3 relative"
                  >
                    <Progress 
                      value={xpInfo.progress * 100} 
                      className="h-1.5 sm:h-2"
                    />
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

