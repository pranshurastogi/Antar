// Custom hooks for leaderboard operations
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardScore, LeaderboardPeriodData } from '@/lib/utils/leaderboard'
import {
  calculateLeaderboardScore,
  calculatePeriodScore,
  getLeaderboardDateRange,
} from '@/lib/utils/leaderboard'

/**
 * Hook to fetch all-time leaderboard
 */
export function useAllTimeLeaderboard(limit: number = 100) {
  return useQuery({
    queryKey: ['leaderboard', 'all-time', limit],
    queryFn: async () => {
      const supabase = createClient()

      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch all habit_streaks to get user stats (this bypasses profile RLS)
      const { data: allStreaks, error: streaksError } = await supabase
        .from('habit_streaks')
        .select('user_id, current_streak, longest_streak, total_completions, completion_rate')

      if (streaksError) throw streaksError

      // Group streaks by user_id
      const userStatsMap = new Map<string, {
        current_streak: number
        longest_streak: number
        total_completions: number
        completion_rate: number
        habits_count: number
      }>()

      allStreaks?.forEach((streak) => {
        const existing = userStatsMap.get(streak.user_id) || {
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
          completion_rate: 0,
          habits_count: 0,
        }
        
        userStatsMap.set(streak.user_id, {
          current_streak: Math.max(existing.current_streak, streak.current_streak),
          longest_streak: Math.max(existing.longest_streak, streak.longest_streak),
          total_completions: existing.total_completions + streak.total_completions,
          completion_rate: existing.completion_rate + streak.completion_rate,
          habits_count: existing.habits_count + 1,
        })
      })

      // Get unique user IDs
      const userIds = Array.from(userStatsMap.keys())

      // Fetch profiles for these users
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_xp, current_level')
        .in('id', userIds)

      let profiles = profilesData

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If RLS blocks us, try getting just the current user's profile
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, total_xp, current_level')
          .eq('id', user.id)
          .single()
        
        if (currentProfile) {
          profiles = [currentProfile]
        } else {
          throw profileError
        }
      }

      if (!profiles || profiles.length === 0) {
        return []
      }

      // For each profile, calculate their leaderboard data
      const leaderboardData = profiles.map((profile) => {
        const userStats = userStatsMap.get(profile.id) || {
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
          completion_rate: 0,
          habits_count: 0,
        }

        const avgCompletionRate = userStats.habits_count > 0 
          ? userStats.completion_rate / userStats.habits_count 
          : 0

        // Calculate leaderboard score
        const leaderboardScore = calculateLeaderboardScore({
          total_xp: profile.total_xp,
          current_streak: userStats.current_streak,
          longest_streak: userStats.longest_streak,
          completion_rate: avgCompletionRate,
          total_completions: userStats.total_completions,
          achievements_count: 0, // We'll fetch this separately if needed
        })

        return {
          user_id: profile.id,
          username: profile.username || profile.full_name || 'Anonymous',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          total_xp: profile.total_xp,
          current_level: profile.current_level,
          current_streak: userStats.current_streak,
          longest_streak: userStats.longest_streak,
          total_completions: userStats.total_completions,
          completion_rate: Math.round(avgCompletionRate),
          habits_count: userStats.habits_count,
          achievements_count: 0,
          leaderboard_score: leaderboardScore,
          rank: 0, // Will be set after sorting
        }
      })

      // Sort by leaderboard score and assign ranks
      const sortedData = leaderboardData
        .sort((a, b) => b.leaderboard_score - a.leaderboard_score)
        .slice(0, limit)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }))

      return sortedData as LeaderboardScore[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch period-based leaderboard (daily, weekly, monthly)
 */
export function usePeriodLeaderboard(
  period: 'daily' | 'weekly' | 'monthly',
  limit: number = 100
) {
  return useQuery({
    queryKey: ['leaderboard', period, limit],
    queryFn: async () => {
      const supabase = createClient()
      const { start, end } = getLeaderboardDateRange(period)

      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch all completions in the period to get active users
      const { data: allCompletions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('user_id, xp_earned, completion_date, habit_id')
        .gte('completion_date', start)
        .lte('completion_date', end)

      if (completionsError) throw completionsError

      // Group completions by user
      const userCompletionsMap = new Map<string, Array<any>>()
      allCompletions?.forEach((completion) => {
        if (!userCompletionsMap.has(completion.user_id)) {
          userCompletionsMap.set(completion.user_id, [])
        }
        userCompletionsMap.get(completion.user_id)?.push(completion)
      })

      const userIds = Array.from(userCompletionsMap.keys())

      if (userIds.length === 0) {
        return []
      }

      // Fetch profiles for these users
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)

      let profiles = profilesData

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If RLS blocks us, try getting just the current user's profile
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (currentProfile && userCompletionsMap.has(user.id)) {
          profiles = [currentProfile]
        } else {
          return []
        }
      }

      if (!profiles || profiles.length === 0) {
        return []
      }

      // For each profile, calculate their stats for the period
      const leaderboardData = profiles.map((profile) => {
        const completions = userCompletionsMap.get(profile.id) || []

        // Calculate XP earned
        const xpEarned = completions.reduce((sum, c) => sum + c.xp_earned, 0)

        // Get unique completion dates
        const uniqueDates = new Set(completions.map((c) => c.completion_date))

        // Calculate average completion rate (simplified)
        const daysInPeriod = uniqueDates.size || 1
        const actualCompletions = completions.length
        const avgCompletionRate = Math.min((actualCompletions / daysInPeriod) * 10, 100) // Simplified rate

        // Get max streak in period (simplified - count consecutive days with completions)
        const sortedDates = Array.from(uniqueDates).sort()
        let maxStreak = 0
        let currentPeriodStreak = 0
        
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            currentPeriodStreak = 1
          } else {
            const prevDate = new Date(sortedDates[i - 1])
            const currDate = new Date(sortedDates[i])
            const diffDays = Math.floor(
              (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (diffDays === 1) {
              currentPeriodStreak++
            } else {
              currentPeriodStreak = 1
            }
          }
          maxStreak = Math.max(maxStreak, currentPeriodStreak)
        }

        // Calculate period score
        const leaderboardScore = calculatePeriodScore({
          xp_earned: xpEarned,
          completions: actualCompletions,
          avg_completion_rate: Math.min(avgCompletionRate, 100),
          max_streak: maxStreak,
        })

        return {
          user_id: profile.id,
          username: profile.username || profile.full_name || 'Anonymous',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          xp_earned: xpEarned,
          completions: actualCompletions,
          avg_completion_rate: Math.round(Math.min(avgCompletionRate, 100)),
          max_streak: maxStreak,
          leaderboard_score: leaderboardScore,
          rank: 0, // Will be set after sorting
        }
      })

      // Filter out users with no activity and sort by score
      const sortedData = leaderboardData
        .filter((item) => item.leaderboard_score > 0)
        .sort((a, b) => b.leaderboard_score - a.leaderboard_score)
        .slice(0, limit)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }))

      return sortedData as LeaderboardPeriodData[]
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for period data
  })
}

/**
 * Hook to get current user's rank in leaderboard
 */
export function useUserRank(userId: string, period: 'all-time' | 'daily' | 'weekly' | 'monthly') {
  const allTimeQuery = useAllTimeLeaderboard(1000)
  const dailyQuery = usePeriodLeaderboard('daily', 1000)
  const weeklyQuery = usePeriodLeaderboard('weekly', 1000)
  const monthlyQuery = usePeriodLeaderboard('monthly', 1000)

  let query
  switch (period) {
    case 'all-time':
      query = allTimeQuery
      break
    case 'daily':
      query = dailyQuery
      break
    case 'weekly':
      query = weeklyQuery
      break
    case 'monthly':
      query = monthlyQuery
      break
  }

  return {
    ...query,
    data: query.data?.find((item) => item.user_id === userId),
  }
}

