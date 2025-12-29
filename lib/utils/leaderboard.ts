// Leaderboard Scoring and Calculations

export interface LeaderboardScore {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_xp: number
  current_level: number
  current_streak: number
  longest_streak: number
  total_completions: number
  completion_rate: number
  habits_count: number
  achievements_count: number
  leaderboard_score: number
  rank: number
}

export interface LeaderboardPeriodData {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  xp_earned: number
  completions: number
  avg_completion_rate: number
  max_streak: number
  leaderboard_score: number
  rank: number
}

/**
 * Calculate comprehensive leaderboard score
 * Formula considers multiple factors:
 * - Total XP (40% weight)
 * - Current Streak (25% weight)
 * - Completion Rate (20% weight)
 * - Total Completions (10% weight)
 * - Achievements (5% weight)
 */
export function calculateLeaderboardScore(data: {
  total_xp: number
  current_streak: number
  longest_streak: number
  completion_rate: number
  total_completions: number
  achievements_count: number
}): number {
  const {
    total_xp,
    current_streak,
    longest_streak,
    completion_rate,
    total_completions,
    achievements_count,
  } = data

  // Normalize each metric to a 0-100 scale
  const xpScore = Math.min(total_xp / 50, 100) // Max out at 5000 XP for this component
  const streakScore = Math.min(current_streak * 2, 100) // Max out at 50 day streak
  const longestStreakScore = Math.min(longest_streak * 1.5, 100) // Max at ~66 days
  const completionScore = completion_rate // Already 0-100
  const completionsScore = Math.min(total_completions / 2, 100) // Max at 200 completions
  const achievementScore = Math.min(achievements_count * 10, 100) // Max at 10 achievements

  // Weighted calculation
  const score =
    xpScore * 0.3 + // 30% weight on XP
    streakScore * 0.2 + // 20% weight on current streak
    longestStreakScore * 0.1 + // 10% weight on longest streak
    completionScore * 0.2 + // 20% weight on completion rate
    completionsScore * 0.1 + // 10% weight on total completions
    achievementScore * 0.1 // 10% weight on achievements

  return Math.round(score * 10) / 10 // Round to 1 decimal place
}

/**
 * Calculate period-based leaderboard score (daily, weekly, monthly)
 * Formula focuses on recent activity:
 * - XP earned in period (45% weight)
 * - Completions in period (30% weight)
 * - Average completion rate (15% weight)
 * - Maximum streak achieved (10% weight)
 */
export function calculatePeriodScore(data: {
  xp_earned: number
  completions: number
  avg_completion_rate: number
  max_streak: number
}): number {
  const { xp_earned, completions, avg_completion_rate, max_streak } = data

  // Normalize each metric
  const xpScore = Math.min(xp_earned / 10, 100) // Max at 1000 XP per period
  const completionScore = Math.min(completions * 5, 100) // Max at 20 completions
  const rateScore = avg_completion_rate // Already 0-100
  const streakScore = Math.min(max_streak * 10, 100) // Max at 10 day streak for period

  // Weighted calculation
  const score =
    xpScore * 0.45 +
    completionScore * 0.3 +
    rateScore * 0.15 +
    streakScore * 0.1

  return Math.round(score * 10) / 10
}

/**
 * Get date range for leaderboard period
 */
export function getLeaderboardDateRange(period: 'daily' | 'weekly' | 'monthly'): {
  start: string
  end: string
} {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start: Date

  switch (period) {
    case 'daily':
      start = new Date(now)
      start.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      break
  }

  return {
    start: start.toISOString().split('T')[0],
    end,
  }
}

/**
 * Get rank badge color based on rank
 */
export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'from-yellow-400 to-yellow-600' // Gold
  if (rank === 2) return 'from-gray-300 to-gray-500' // Silver
  if (rank === 3) return 'from-orange-400 to-orange-600' // Bronze
  if (rank <= 10) return 'from-blue-400 to-blue-600' // Top 10
  if (rank <= 50) return 'from-green-400 to-green-600' // Top 50
  return 'from-purple-400 to-purple-600' // Everyone else
}

/**
 * Get rank icon/emoji based on rank
 */
export function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  if (rank <= 10) return '⭐'
  if (rank <= 50) return '✨'
  return '🎯'
}

/**
 * Format leaderboard score for display
 */
export function formatScore(score: number): string {
  return score.toFixed(1)
}

/**
 * Get period display name
 */
export function getPeriodDisplayName(period: 'daily' | 'weekly' | 'monthly' | 'all-time'): string {
  switch (period) {
    case 'daily':
      return 'Today'
    case 'weekly':
      return 'This Week'
    case 'monthly':
      return 'This Month'
    case 'all-time':
      return 'All Time'
  }
}

