// XP and Leveling Calculations

/**
 * Calculate level from total XP
 * Formula: Level = floor(sqrt(total_xp / 100)) + 1
 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

/**
 * Calculate XP required for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1)
}

/**
 * Calculate progress to next level (0-1)
 */
export function levelProgress(totalXp: number): {
  current_level: number
  xp_current: number
  xp_for_next: number
  progress: number
} {
  const current_level = calculateLevel(totalXp)
  const xp_current = xpForLevel(current_level)
  const xp_for_next = xpForLevel(current_level + 1)
  const xp_in_level = totalXp - xp_current
  const xp_needed = xp_for_next - xp_current
  const progress = xp_in_level / xp_needed

  return {
    current_level,
    xp_current: xp_in_level,
    xp_for_next: xp_needed,
    progress,
  }
}

/**
 * Get XP value based on difficulty
 */
export function getXpForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
  const xpMap = {
    easy: 10,
    medium: 20,
    hard: 30,
  }
  return xpMap[difficulty]
}

/**
 * Calculate bonus XP for streaks
 */
export function getStreakBonusXp(streakDays: number): number {
  if (streakDays === 7) return 50
  if (streakDays === 30) return 200
  if (streakDays === 100) return 500
  if (streakDays === 365) return 1000
  return 0
}

/**
 * Get pet type based on total completions
 */
export function getPetType(completions: number): 'seed' | 'sprout' | 'plant' | 'tree' | 'forest' {
  if (completions < 10) return 'seed'
  if (completions < 30) return 'sprout'
  if (completions < 60) return 'plant'
  if (completions < 90) return 'tree'
  return 'forest'
}

/**
 * Get pet growth stage (0-100)
 */
export function getPetGrowthStage(completions: number): number {
  return Math.min(completions, 100)
}

