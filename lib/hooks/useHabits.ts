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

export function useHabit(habitId: string, userId?: string) {
  return useQuery({
    queryKey: ['habit', habitId, userId],
    queryFn: async () => {
      const supabase = createClient()

      if (!userId) {
        console.error('useHabit: userId is required for security')
        return null
      }

      // Strategy: Fetch habit first, then relations separately for better error handling
      // This ensures we can handle cases where relations might not exist
      
      // Step 1: Fetch the habit
      const { data: habitData, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .eq('user_id', userId)
        .single()

      if (habitError) {
        if (habitError.code === 'PGRST116') {
          console.warn('Habit not found:', { habitId, userId, error: habitError.message })
          return null
        }
        console.error('Error fetching habit:', { habitId, userId, error: habitError })
        throw habitError
      }

      if (!habitData) {
        console.warn('No habit data returned:', { habitId, userId })
        return null
      }

      // Step 2: Fetch relations in parallel
      const [completionsResult, streaksResult] = await Promise.all([
        supabase
          .from('habit_completions')
          .select('*')
          .eq('habit_id', habitId)
          .eq('user_id', userId)
          .order('completion_date', { ascending: false }),
        supabase
          .from('habit_streaks')
          .select('*')
          .eq('habit_id', habitId)
          .eq('user_id', userId)
          .maybeSingle() // Use maybeSingle since streak might not exist yet
      ])

      // Handle errors in relations (non-critical, can continue without them)
      if (completionsResult.error) {
        console.warn('Error fetching completions (non-critical):', completionsResult.error)
      }
      if (streaksResult.error && streaksResult.error.code !== 'PGRST116') {
        console.warn('Error fetching streaks (non-critical):', streaksResult.error)
      }

      // Combine the data
      const result: HabitWithRelations = {
        ...habitData,
        habit_completions: completionsResult.data || [],
        habit_streaks: streaksResult.data || undefined,
      }

      return result
    },
    enabled: !!habitId && !!userId,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a "not found" error
      if (error?.code === 'PGRST116') {
        return false
      }
      return failureCount < 2
    },
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

