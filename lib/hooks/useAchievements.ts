// Custom hooks for achievements
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Achievement, UserAchievement } from '@/lib/types/database'

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: false })

      if (error) throw error
      return data as Achievement[]
    },
  })
}

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      if (error) throw error
      return data as UserAchievement[]
    },
    enabled: !!userId,
  })
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, achievementId }: { userId: string; achievementId: string }) => {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements', variables.userId] })
    },
  })
}

