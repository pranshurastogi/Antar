"use client"

import { useAchievements, useUserAchievements } from "@/lib/hooks/useAchievements"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Lock } from "lucide-react"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils/dates"
import { FunLoader } from "@/components/ui/fun-loader"

interface AchievementsGridProps {
  userId: string
}

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  rare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  epic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  legendary: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export function AchievementsGrid({ userId }: AchievementsGridProps) {
  const { data: allAchievements, isLoading: achievementsLoading } = useAchievements()
  const { data: userAchievements, isLoading: userLoading } = useUserAchievements(userId)

  if (achievementsLoading || userLoading) {
    return <FunLoader message="Loading achievements..." size="md" />
  }

  const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id))
  const unlocked = allAchievements?.filter(a => unlockedIds.has(a.id)) || []
  const locked = allAchievements?.filter(a => !unlockedIds.has(a.id)) || []

  const renderAchievementCard = (achievement: any, isUnlocked: boolean) => {
    const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id)

    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden ${!isUnlocked && 'opacity-50 grayscale'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className={`text-4xl mb-2 ${!isUnlocked && 'filter blur-sm'}`}>
                {achievement.icon}
              </div>
              {!isUnlocked && (
                <div className="p-2 rounded-full bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardTitle className="text-base">{achievement.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {achievement.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge className={RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]}>
                {achievement.rarity}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                +{achievement.xp_reward} XP
              </span>
            </div>
            {isUnlocked && userAchievement && (
              <p className="text-xs text-muted-foreground">
                Unlocked {formatDate(userAchievement.unlocked_at, 'MMM dd, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">{unlocked.length}</div>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">{locked.length}</div>
              <p className="text-sm text-muted-foreground">Locked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">
                {Math.round((unlocked.length / (allAchievements?.length || 1)) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({allAchievements?.length})</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked ({unlocked.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({locked.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {unlocked.map(a => renderAchievementCard(a, true))}
            {locked.map(a => renderAchievementCard(a, false))}
          </div>
        </TabsContent>
        <TabsContent value="unlocked" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unlocked.length > 0 ? (
              unlocked.map(a => renderAchievementCard(a, true))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No achievements unlocked yet. Keep building habits!
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="locked" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map(a => renderAchievementCard(a, false))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

