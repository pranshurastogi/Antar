"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, TrendingUp, Flame, Target, Award, Crown } from "lucide-react"
import { motion } from "framer-motion"
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
    <div className="space-y-6">
      {/* User's Rank Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Your Rank
          </CardTitle>
          <CardDescription>See how you stack up against others</CardDescription>
        </CardHeader>
        <CardContent>
          {userRank.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : userRank.data ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg",
                    getRankBadgeColor(userRank.data.rank)
                  )}
                >
                  #{userRank.data.rank}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getPeriodDisplayName(period)}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatScore(userRank.data.leaderboard_score)} pts
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl">{getRankIcon(userRank.data.rank)}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Complete some habits to appear on the leaderboard!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Compete with others and climb the ranks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all-time">All-Time</TabsTrigger>
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

      {/* Leaderboard Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            How Scoring Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {period === "all-time" ? (
            <>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium">Total XP (30%)</p>
                  <p className="text-sm text-muted-foreground">
                    Your lifetime experience points from completing habits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flame className="h-5 w-5 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium">Streaks (30%)</p>
                  <p className="text-sm text-muted-foreground">
                    Current streak (20%) and longest streak (10%)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium">Completion Rate (20%)</p>
                  <p className="text-sm text-muted-foreground">
                    How consistently you complete your habits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 mt-0.5 text-yellow-500" />
                <div>
                  <p className="font-medium">Achievements (10%)</p>
                  <p className="text-sm text-muted-foreground">
                    Unlocked achievements and milestones
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium">XP Earned (45%)</p>
                  <p className="text-sm text-muted-foreground">
                    Experience points earned during the period
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium">Completions (30%)</p>
                  <p className="text-sm text-muted-foreground">
                    Number of habits completed during the period
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 mt-0.5 text-yellow-500" />
                <div>
                  <p className="font-medium">Completion Rate (15%)</p>
                  <p className="text-sm text-muted-foreground">
                    Consistency during the period
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flame className="h-5 w-5 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium">Best Streak (10%)</p>
                  <p className="text-sm text-muted-foreground">
                    Longest streak achieved during the period
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
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
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">
          No one on the leaderboard yet. Be the first!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
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
              "flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md",
              isCurrentUser &&
                "border-blue-500 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20",
              isTopThree && !isCurrentUser && "bg-gradient-to-r from-yellow-50/30 to-orange-50/30 dark:from-yellow-950/10 dark:to-orange-950/10"
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
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar_url} alt={entry.username} />
                <AvatarFallback>{entry.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  {entry.username}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {period === "all-time" ? (
                    <>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {entry.total_xp} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {entry.current_streak} day streak
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {entry.xp_earned} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {entry.completions} completed
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-xl font-bold">{formatScore(entry.leaderboard_score)}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

