// Custom hooks for user profile
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile, DashboardStats } from '@/lib/types/database'
import { getToday } from '@/lib/utils/dates'
import { levelProgress } from '@/lib/utils/xp'

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] })
    },
  })
}

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      const supabase = createClient()
      const today = getToday()

      // Get habits count
      const { count: totalHabits } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_archived', false)

      // Get today's completions
      const { data: todayCompletions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completion_date', today)

      // Get active streaks
      const { data: streaks } = await supabase
        .from('habit_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .gt('current_streak', 0)

      // Get profile for XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, current_level')
        .eq('id', userId)
        .single()

      const completedToday = todayCompletions?.length || 0
      const completionRate = totalHabits ? (completedToday / totalHabits) * 100 : 0
      const activeStreaks = streaks?.length || 0

      const xpProgress = profile ? levelProgress(profile.total_xp) : null

      const stats: DashboardStats = {
        total_habits: totalHabits || 0,
        completed_today: completedToday,
        completion_rate: Math.round(completionRate),
        active_streaks: activeStreaks,
        total_xp: profile?.total_xp || 0,
        current_level: profile?.current_level || 1,
        xp_for_next_level: xpProgress?.xp_for_next || 100,
      }

      return stats
    },
    enabled: !!userId,
  })
}

