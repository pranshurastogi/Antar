// Custom hooks for AI features with React Query caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from "react-hot-toast"

// Cache keys
const AI_KEYS = {
  motivational: (userId: string, statsHash: string) => ['ai', 'motivational', userId, statsHash],
  habitDescription: (habitName: string, category: string) => ['ai', 'habit-description', habitName, category],
  habitSuggestions: (userId: string, habitsHash: string) => ['ai', 'habit-suggestions', userId, habitsHash],
  patternAnalysis: (habitId: string, completionsHash: string) => ['ai', 'pattern-analysis', habitId, completionsHash],
  streakAlert: (habitId: string, streakDays: number) => ['ai', 'streak-alert', habitId, streakDays],
  progressReport: (userId: string, period: string, statsHash: string) => ['ai', 'progress-report', userId, period, statsHash],
}

// Helper to create a hash from an object for cache keys
function createHash(obj: any): string {
  return JSON.stringify(obj)
}

/**
 * Hook for generating motivational messages with caching
 * Cache duration: 1 hour (same stats = same message)
 */
export function useAIMotivationalMessage(userId: string, stats: {
  currentStreak: number
  completionRate: number
  recentCompletions: number
  userName: string
  timeOfDay: string
}, enabled: boolean = true) {
  const statsHash = createHash(stats)
  
  return useQuery({
    queryKey: AI_KEYS.motivational(userId, statsHash),
    queryFn: async () => {
      const response = await fetch("/api/ai/motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to generate message" }))
        throw new Error(error.error || "Failed to generate message")
      }

      const data = await response.json()
      return data.message as string
    },
    enabled: enabled && !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour - same stats = same message
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    retry: 1, // Only retry once on failure
    retryDelay: 1000,
  })
}

/**
 * Hook for generating habit descriptions with caching
 * Cache duration: 24 hours (same habit name + category = same description)
 */
export function useAIHabitDescription(habitName: string, category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: AI_KEYS.habitDescription(habitName, category),
    queryFn: async () => {
      const response = await fetch("/api/ai/habit-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitName, category }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to generate description" }))
        throw new Error(error.error || "Failed to generate description")
      }

      const data = await response.json()
      return data.description as string
    },
    enabled: enabled && !!habitName && !!category,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - same habit = same description
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days in cache
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Hook for suggesting habits with caching
 * Cache duration: 6 hours (same habits = same suggestions)
 */
export function useAISuggestHabits(
  userId: string,
  currentHabits: Array<{ name: string; category: string }>,
  userGoals?: string,
  enabled: boolean = true
) {
  const habitsHash = createHash({ habits: currentHabits, goals: userGoals })
  
  return useQuery({
    queryKey: AI_KEYS.habitSuggestions(userId, habitsHash),
    queryFn: async () => {
      const response = await fetch("/api/ai/suggest-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentHabits, userGoals }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to suggest habits" }))
        throw new Error(error.error || "Failed to suggest habits")
      }

      const data = await response.json()
      return data.suggestions as Array<{
        name: string
        description: string
        category: string
        reason: string
        insight?: string
        funFact?: string
      }>
    },
    enabled: enabled && !!userId,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours - same habits = same suggestions
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Hook for analyzing habit patterns with caching
 * Cache duration: 1 hour (same completions = same analysis)
 */
export function useAIAnalyzePatterns(
  habitId: string,
  completions: Array<{
    date: string
    time: string
    mood?: number
    energy?: number
    habitName: string
  }> | undefined,
  enabled: boolean = true
) {
  // Safely handle undefined or empty completions
  const safeCompletions = completions && Array.isArray(completions) ? completions : []
  const completionsHash = createHash(safeCompletions.slice(-50)) // Only hash last 50 for cache key
  
  return useQuery({
    queryKey: AI_KEYS.patternAnalysis(habitId, completionsHash),
    queryFn: async () => {
      const response = await fetch("/api/ai/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completions: safeCompletions }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to analyze patterns" }))
        throw new Error(error.error || "Failed to analyze patterns")
      }

      const data = await response.json()
      return data.analysis as {
        insights: string[]
        recommendations: string[]
        bestTime: string
        patterns: string[]
      }
    },
    enabled: enabled && !!habitId && safeCompletions.length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour - same completions = same analysis
    gcTime: 6 * 60 * 60 * 1000, // 6 hours in cache
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Hook for generating streak alerts (mutation - no caching needed)
 */
export function useAIStreakAlert() {
  return useMutation({
    mutationFn: async ({
      habitName,
      streakDays,
      lastCompletion,
      preferredTime,
    }: {
      habitName: string
      streakDays: number
      lastCompletion: string
      preferredTime?: string
    }) => {
      const response = await fetch("/api/ai/streak-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitName,
          streakDays,
          lastCompletion,
          preferredTime,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to generate streak alert" }))
        throw new Error(error.error || "Failed to generate streak alert")
      }

      const data = await response.json()
      return data.alert as string
    },
    retry: 1,
    retryDelay: 1000,
  })
}

/**
 * Hook for generating progress reports with caching
 * Cache duration: 1 hour (same stats = same report)
 */
export function useAIProgressReport(
  userId: string,
  period: 'weekly' | 'monthly',
  stats: {
    totalCompletions: number
    streaks: number[]
    completionRate: number
    topHabits: string[]
    improvements: string[]
  },
  enabled: boolean = true
) {
  const statsHash = createHash(stats)
  
  return useQuery({
    queryKey: AI_KEYS.progressReport(userId, period, statsHash),
    queryFn: async () => {
      const response = await fetch("/api/ai/progress-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, stats }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to generate progress report" }))
        throw new Error(error.error || "Failed to generate progress report")
      }

      const data = await response.json()
      return data.report as {
        summary: string
        achievements: string[]
        encouragement: string
        nextSteps: string[]
      }
    },
    enabled: enabled && !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour - same stats = same report
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    retry: 1,
    retryDelay: 1000,
  })
}

// Legacy hooks for backward compatibility (using mutations for manual triggers)
export function useAIMotivationalMessageLegacy() {
  const queryClient = useQueryClient()
  
  return {
    generate: async (stats: {
      currentStreak: number
      completionRate: number
      recentCompletions: number
      userName: string
      timeOfDay: string
    }) => {
      const statsHash = createHash(stats)
      const queryKey = ['ai', 'motivational', 'legacy', statsHash]
      
      // Check cache first
      const cached = queryClient.getQueryData<string>(queryKey)
      if (cached) {
        return cached
      }
      
      // Fetch if not cached
      const response = await fetch("/api/ai/motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate message")
      }

      const data = await response.json()
      const message = data.message as string
      
      // Cache the result
      queryClient.setQueryData(queryKey, message)
      
      return message
    },
    isLoading: false,
    message: null,
  }
}

/**
 * Legacy hook for habit suggestions with manual trigger
 */
export function useAISuggestHabitsLegacy() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{
    name: string
    description: string
    category: string
    reason: string
    insight?: string
    funFact?: string
  }>>([])
  
  return {
    suggest: async (currentHabits: Array<{ name: string; category: string }>, userGoals?: string) => {
      const habitsHash = createHash({ habits: currentHabits, goals: userGoals })
      const queryKey = ['ai', 'habit-suggestions', 'legacy', habitsHash]
      
      // Re-enabled caching to reduce API calls and avoid rate limits
      const cached = queryClient.getQueryData<typeof suggestions>(queryKey)
      if (cached) {
        console.log("✅ Using cached suggestions (saving API quota)")
        setSuggestions(cached)
        return cached
      }
      
      console.log("🔄 Fetching fresh AI suggestions...")
      setIsLoading(true)
      try {
        // Fetch if not cached
        const response = await fetch("/api/ai/suggest-habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentHabits, userGoals }),
        })

        if (!response.ok) {
          throw new Error("Failed to suggest habits")
        }

        const data = await response.json()
        const newSuggestions = data.suggestions
        
        // Cache the result
        queryClient.setQueryData(queryKey, newSuggestions)
        setSuggestions(newSuggestions)
        
        return newSuggestions
      } catch (error) {
        console.error("Error suggesting habits:", error)
        toast.error("Failed to generate suggestions. Please try again.")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
    suggestions,
  }
}

/**
 * Legacy hook for pattern analysis with manual trigger
 */
export function useAIAnalyzePatternsLegacy() {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    insights: string[]
    recommendations: string[]
    bestTime: string
    patterns: string[]
  } | null>(null)
  
  return {
    analyze: async (completions: Array<{
      date: string
      time: string
      mood?: number
      energy?: number
      habitName: string
    }>) => {
      const completionsHash = createHash(completions.slice(-50))
      const queryKey = ['ai', 'pattern-analysis', 'legacy', completionsHash]
      
      // Check cache first
      const cached = queryClient.getQueryData<typeof analysis>(queryKey)
      if (cached) {
        setAnalysis(cached)
        return cached
      }
      
      setIsLoading(true)
      try {
        const response = await fetch("/api/ai/analyze-patterns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completions }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze patterns")
        }

        const data = await response.json()
        const newAnalysis = data.analysis
        
        // Cache the result
        queryClient.setQueryData(queryKey, newAnalysis)
        setAnalysis(newAnalysis)
        
        return newAnalysis
      } catch (error) {
        console.error("Error analyzing patterns:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
    analysis,
  }
}
