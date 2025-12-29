"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FunLoader, SkeletonLoader } from "@/components/ui/fun-loader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  useAllTimeLeaderboard,
  usePeriodLeaderboard,
  useUserRank,
} from "@/lib/hooks/useLeaderboard"
import {
  getRankBadgeColor,
  getRankIcon,
  formatScore,
  getPeriodDisplayName,
} from "@/lib/utils/leaderboard"
import { cn } from "@/lib/utils"
import "@/components/habits/notebook-theme.css"

interface LeaderboardViewProps {
  userId: string
}

export function LeaderboardView({ userId }: LeaderboardViewProps) {
  const [period, setPeriod] = useState<"all-time" | "daily" | "weekly" | "monthly">("weekly")

  const allTimeQuery = useAllTimeLeaderboard(100)
  const dailyQuery = usePeriodLeaderboard("daily", 100)
  const weeklyQuery = usePeriodLeaderboard("weekly", 100)
  const monthlyQuery = usePeriodLeaderboard("monthly", 100)

  const userRank = useUserRank(userId, period)

  let currentQuery
  switch (period) {
    case "all-time":
      currentQuery = allTimeQuery
      break
    case "daily":
      currentQuery = dailyQuery
      break
    case "weekly":
      currentQuery = weeklyQuery
      break
    case "monthly":
      currentQuery = monthlyQuery
      break
  }

  const { data: leaderboardData, isLoading } = currentQuery

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Background decorations */}
      <div className="scribble-decoration scribble-1" style={{ top: '5%', right: '2%', opacity: 0.1 }} />
      <div className="scribble-decoration scribble-2" style={{ bottom: '10%', left: '3%', opacity: 0.1 }} />
      
      {/* User's Rank Card - Notebook Style */}
      <div className="relative">
        <div className="sticker blue" style={{ top: '-8px', right: '10px', zIndex: 20 }}>
          👑 Your Rank
        </div>
        <Card className="notebook-container border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 bg-white/95 dark:bg-slate-900/95 shadow-xl relative">
          <CardHeader className="border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20 bg-gradient-to-r from-[#26547C]/10 via-[#EF476F]/10 to-[#06D6A0]/10 dark:from-[#26547C]/20 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/20">
            <CardTitle className="handwritten-title text-xl sm:text-2xl flex items-center gap-2 text-[#26547C] dark:text-[#60A5FA]">
              <FontAwesomeIcon icon={Icons.crown} className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD166]" />
              Your Rank
            </CardTitle>
            <CardDescription className="handwritten-text">See how you stack up against others 🎯</CardDescription>
          </CardHeader>
        <CardContent>
          {userRank.isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : userRank.data ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl sm:text-2xl font-bold text-white shadow-lg",
                    getRankBadgeColor(userRank.data.rank)
                  )}
                >
                  #{userRank.data.rank}
                </div>
                <div>
                  <p className="handwritten-label text-xs sm:text-sm text-muted-foreground">
                    {getPeriodDisplayName(period)}
                  </p>
                  <p className="stats-badge text-xl sm:text-2xl text-[#26547C] dark:text-[#60A5FA]">
                    {formatScore(userRank.data.leaderboard_score)} pts
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-3xl sm:text-4xl">{getRankIcon(userRank.data.rank)}</p>
              </div>
            </div>
          ) : (
            <p className="handwritten-text text-center text-muted-foreground">
              Complete some habits to appear on the leaderboard! 🚀
            </p>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Leaderboard Tabs - Notebook Style */}
      <div className="relative">
        <div className="sticker pink" style={{ top: '-8px', left: '10px', zIndex: 20 }}>
          🏆 Leaderboard
        </div>
        <Card className="notebook-container border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 bg-white/95 dark:bg-slate-900/95 shadow-xl relative">
          <CardHeader className="border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20 bg-gradient-to-r from-[#FFD166]/10 via-[#EF476F]/10 to-[#06D6A0]/10 dark:from-[#FFD166]/20 dark:via-[#EF476F]/20 dark:to-[#06D6A0]/20">
            <CardTitle className="handwritten-title text-xl sm:text-2xl flex items-center gap-2 text-[#26547C] dark:text-[#60A5FA]">
              <FontAwesomeIcon icon={Icons.trophy} className="h-6 w-6 text-[#FFD166]" />
              Leaderboard
            </CardTitle>
            <CardDescription className="handwritten-text">
              Compete with others and climb the ranks 📈
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 border border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <TabsTrigger value="daily" className="handwritten-text data-[state=active]:bg-[#26547C] data-[state=active]:text-white dark:data-[state=active]:bg-[#60A5FA]">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="handwritten-text data-[state=active]:bg-[#EF476F] data-[state=active]:text-white dark:data-[state=active]:bg-[#FB7185]">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="handwritten-text data-[state=active]:bg-[#06D6A0] data-[state=active]:text-white dark:data-[state=active]:bg-[#34D399]">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="all-time" className="handwritten-text data-[state=active]:bg-[#FFD166] data-[state=active]:text-white">
                All-Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-6">
              <LeaderboardList
                data={dailyQuery.data}
                isLoading={dailyQuery.isLoading}
                period="daily"
                currentUserId={userId}
              />
            </TabsContent>

            <TabsContent value="weekly" className="mt-6">
              <LeaderboardList
                data={weeklyQuery.data}
                isLoading={weeklyQuery.isLoading}
                period="weekly"
                currentUserId={userId}
              />
            </TabsContent>

            <TabsContent value="monthly" className="mt-6">
              <LeaderboardList
                data={monthlyQuery.data}
                isLoading={monthlyQuery.isLoading}
                period="monthly"
                currentUserId={userId}
              />
            </TabsContent>

            <TabsContent value="all-time" className="mt-6">
              <LeaderboardList
                data={allTimeQuery.data}
                isLoading={allTimeQuery.isLoading}
                period="all-time"
                currentUserId={userId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>

      {/* Leaderboard Info - Notebook Style */}
      <div className="relative">
        <div className="sticker teal" style={{ top: '-8px', right: '10px', zIndex: 20 }}>
          📊 Scoring
        </div>
        <Card className="notebook-container border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 bg-white/95 dark:bg-slate-900/95 shadow-xl relative">
          <CardHeader className="border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20 bg-gradient-to-r from-[#06D6A0]/10 via-[#26547C]/10 to-[#EF476F]/10 dark:from-[#06D6A0]/20 dark:via-[#26547C]/20 dark:to-[#EF476F]/20">
            <CardTitle className="handwritten-title text-xl sm:text-2xl flex items-center gap-2 text-[#26547C] dark:text-[#60A5FA]">
              <FontAwesomeIcon icon={Icons.medal} className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD166]" />
              How Scoring Works
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {period === "all-time" ? (
            <>
              <div className="notebook-entry p-3 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-5 w-5 mt-0.5 text-[#26547C] dark:text-[#60A5FA]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#26547C] dark:text-[#60A5FA]">Total XP (30%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Your lifetime experience points from completing habits
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#EF476F]/30 dark:border-[#FB7185]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.fire} className="h-5 w-5 mt-0.5 text-[#EF476F] dark:text-[#FB7185]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#EF476F] dark:text-[#FB7185]">Streaks (30%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Current streak (20%) and longest streak (10%)
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#06D6A0]/30 dark:border-[#34D399]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.target} className="h-5 w-5 mt-0.5 text-[#06D6A0] dark:text-[#34D399]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#06D6A0] dark:text-[#34D399]">Completion Rate (20%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      How consistently you complete your habits
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#FFD166]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.trophy} className="h-5 w-5 mt-0.5 text-[#FFD166]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#FFD166]">Achievements (10%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Unlocked achievements and milestones
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="notebook-entry p-3 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-5 w-5 mt-0.5 text-[#26547C] dark:text-[#60A5FA]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#26547C] dark:text-[#60A5FA]">XP Earned (45%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Experience points earned during the period
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#06D6A0]/30 dark:border-[#34D399]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.target} className="h-5 w-5 mt-0.5 text-[#06D6A0] dark:text-[#34D399]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#06D6A0] dark:text-[#34D399]">Completions (30%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Number of habits completed during the period
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#FFD166]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.trophy} className="h-5 w-5 mt-0.5 text-[#FFD166]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#FFD166]">Completion Rate (15%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Consistency during the period
                    </p>
                  </div>
                </div>
              </div>
              <div className="notebook-entry p-3 border-[#EF476F]/30 dark:border-[#FB7185]/30">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={Icons.fire} className="h-5 w-5 mt-0.5 text-[#EF476F] dark:text-[#FB7185]" />
                  <div>
                    <p className="handwritten-label font-medium text-[#EF476F] dark:text-[#FB7185]">Best Streak (10%)</p>
                    <p className="handwritten-text text-sm text-muted-foreground">
                      Longest streak achieved during the period
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

interface LeaderboardListProps {
  data: any[] | undefined
  isLoading: boolean
  period: "daily" | "weekly" | "monthly" | "all-time"
  currentUserId: string
}

function LeaderboardList({ data, isLoading, period, currentUserId }: LeaderboardListProps) {
  if (isLoading) {
    return <SkeletonLoader count={10} />
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center notebook-container rounded-lg border-2 border-dashed border-[#26547C]/30 dark:border-[#60A5FA]/30 bg-white/50 dark:bg-slate-900/50">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FontAwesomeIcon icon={Icons.trophy} className="mx-auto h-12 w-12 text-muted-foreground/50" />
        </motion.div>
        <p className="handwritten-text mt-4 text-muted-foreground">
          No one on the leaderboard yet. Be the first! 🏆
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map((entry, index) => {
        const isCurrentUser = entry.user_id === currentUserId
        const isTopThree = entry.rank <= 3

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "notebook-entry flex items-center gap-3 sm:gap-4 rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-[1.02]",
              isCurrentUser &&
                "border-[#26547C] bg-gradient-to-r from-[#26547C]/10 to-[#26547C]/5 dark:border-[#60A5FA] dark:from-[#60A5FA]/20 dark:to-[#60A5FA]/10",
              isTopThree && !isCurrentUser && "bg-gradient-to-r from-[#FFD166]/20 to-[#FFD166]/10 dark:from-[#FFD166]/30 dark:to-[#FFD166]/20 border-[#FFD166]/40"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-md",
                getRankBadgeColor(entry.rank)
              )}
            >
              {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
            </div>

            {/* User Info */}
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30">
                <AvatarImage src={entry.avatar_url} alt={entry.username} />
                <AvatarFallback className="bg-[#26547C]/10 dark:bg-[#60A5FA]/10 text-[#26547C] dark:text-[#60A5FA] font-bold">
                  {entry.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="handwritten-text font-medium truncate text-base sm:text-lg">
                  {entry.username}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-[#26547C] dark:bg-[#60A5FA] text-white">
                      You
                    </Badge>
                  )}
                </p>
                <div className="flex gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                  {period === "all-time" ? (
                    <>
                      <span className="flex items-center gap-1 handwritten-text">
                        <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-3 w-3 text-[#26547C] dark:text-[#60A5FA]" />
                        {entry.total_xp} XP
                      </span>
                      <span className="flex items-center gap-1 handwritten-text">
                        <FontAwesomeIcon icon={Icons.fire} className="h-3 w-3 text-[#EF476F] dark:text-[#FB7185]" />
                        {entry.current_streak} day streak
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 handwritten-text">
                        <FontAwesomeIcon icon={Icons.arrowTrendUp} className="h-3 w-3 text-[#26547C] dark:text-[#60A5FA]" />
                        {entry.xp_earned} XP
                      </span>
                      <span className="flex items-center gap-1 handwritten-text">
                        <FontAwesomeIcon icon={Icons.target} className="h-3 w-3 text-[#06D6A0] dark:text-[#34D399]" />
                        {entry.completions} completed
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="stats-badge text-lg sm:text-xl font-bold text-[#26547C] dark:text-[#60A5FA]">{formatScore(entry.leaderboard_score)}</p>
              <p className="handwritten-text text-xs text-muted-foreground">points</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

