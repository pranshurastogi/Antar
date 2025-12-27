// Custom hooks for habit completions
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { HabitCompletion } from '@/lib/types/database'
import { getToday, formatDateForDB } from '@/lib/utils/dates'
import { toast } from 'react-hot-toast'

export function useCompletions(userId: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['completions', userId, dateRange],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false })

      if (dateRange) {
        query = query.gte('completion_date', dateRange.start).lte('completion_date', dateRange.end)
      }

      const { data, error } = await query

      if (error) throw error
      return data as HabitCompletion[]
    },
    enabled: !!userId,
  })
}

export function useCompleteHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (completion: Partial<HabitCompletion>) => {
      const now = new Date()
      const completionDate = completion.completion_date || getToday()
      
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          ...completion,
          completion_date: completionDate,
          completed_at: completion.completed_at || now.toISOString(),
          completed_time: completion.completed_time || now.toTimeString().split(' ')[0],
          xp_earned: completion.xp_earned || 10, // Default from schema
          is_streak_freeze: completion.is_streak_freeze || false, // Default from schema
        })
        .select()
        .single()

      if (error) {
        // Check if it's a duplicate completion error
        if (error.code === '23505') {
          throw new Error('Already completed today')
        }
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['completions', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['profile', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['stats', data.user_id] })

      toast.success(`+${data.xp_earned} XP earned! 🎉`, {
        icon: '✅',
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete habit')
    },
  })
}

export function useUncompleteHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ habitId, userId, date }: { habitId: string; userId: string; date?: string }) => {
      const completionDate = date || getToday()

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('completion_date', completionDate)

      if (error) throw error

      return { habitId, userId, completionDate }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits', data.userId] })
      queryClient.invalidateQueries({ queryKey: ['completions', data.userId] })
      queryClient.invalidateQueries({ queryKey: ['profile', data.userId] })

      toast.success('Completion removed')
    },
  })
}

export function useUpdateCompletion() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HabitCompletion> }) => {
      const { data, error } = await supabase
        .from('habit_completions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['completions', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['habit', data.habit_id] })
      toast.success('Notes updated')
    },
  })
}

export function useTodaysCompletions(userId: string) {
  return useQuery({
    queryKey: ['completions-today', userId],
    queryFn: async () => {
      const supabase = createClient()
      const today = getToday()

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completion_date', today)

      if (error) throw error
      return data as HabitCompletion[]
    },
    enabled: !!userId,
  })
}

