// Custom hooks for habit operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitWithRelations } from '@/lib/types/database'
import { getToday } from '@/lib/utils/dates'

export function useHabits(userId: string) {
  return useQuery({
    queryKey: ['habits', userId],
    queryFn: async () => {
      const supabase = createClient()
      const today = getToday()

      const { data, error } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions!left(id, completion_date, xp_earned, mood_rating, energy_level),
          habit_streaks(current_streak, longest_streak, total_completions, completion_rate)
        `)
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as HabitWithRelations[]
    },
    enabled: !!userId,
  })
}

export function useHabit(habitId: string) {
  return useQuery({
    queryKey: ['habit', habitId],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions(*),
          habit_streaks(*)
        `)
        .eq('id', habitId)
        .single()

      if (error) throw error
      return data as HabitWithRelations
    },
    enabled: !!habitId,
  })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (habit: Partial<Habit>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits', variables.user_id] })
    },
  })
}

export function useUpdateHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Habit> }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['habit', data.id] })
    },
  })
}

export function useDeleteHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)

      if (error) throw error
      return { id, userId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits', data.userId] })
    },
  })
}

export function useArchiveHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data, error} = await supabase
        .from('habits')
        .update({ is_archived: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits', data.user_id] })
    },
  })
}

