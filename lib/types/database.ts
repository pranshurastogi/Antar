// Database Types for ANTAR

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  theme_preference: 'light' | 'dark' | 'auto'
  notification_enabled: boolean
  streak_freeze_count: number
  total_xp: number
  current_level: number
  pet_type: 'seed' | 'sprout' | 'plant' | 'tree' | 'forest'
  pet_growth_stage: number
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'custom'
  color: string
  icon: string
  frequency_type: 'daily' | 'weekly' | 'specific_days' | 'custom'
  frequency_config: {
    days?: number[]
    times_per_week?: number
    custom_dates?: string[]
  }
  preferred_time: string | null
  time_flexibility: number
  estimated_duration: number | null
  stack_order: number | null
  depends_on: string | null
  xp_value: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  is_archived: boolean
  is_template: boolean
  template_name: string | null
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  completion_date: string
  mood_rating: number | null
  energy_level: number | null
  notes: string | null
  completed_time: string | null
  duration_minutes: number | null
  is_streak_freeze: boolean
  xp_earned: number
}

export interface HabitStreak {
  id: string
  habit_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_completions: number
  completion_rate: number
  last_completed_date: string | null
  streak_start_date: string | null
  updated_at: string
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string | null
  criteria: {
    type: string
    value: number
    [key: string]: any
  }
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

export interface Challenge {
  id: string
  name: string
  description: string
  challenge_type: 'daily' | 'weekly' | 'community'
  target_metric: string
  target_value: number
  xp_reward: number
  badge_reward: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  progress: number
  is_completed: boolean
  completed_at: string | null
  joined_at: string
  challenge?: Challenge
}

export interface HabitTemplate {
  id: string
  name: string
  description: string | null
  category: string
  difficulty: string
  habits: any[]
  estimated_time_minutes: number | null
  use_count: number
  rating: number
  is_featured: boolean
  created_by: string | null
  created_at: string
}

export interface AccountabilityPartner {
  id: string
  user_id: string
  partner_id: string
  status: 'pending' | 'accepted' | 'declined'
  shared_habits: string[]
  created_at: string
  accepted_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: 'reminder' | 'achievement' | 'challenge' | 'social'
  title: string
  message: string | null
  action_url: string | null
  is_read: boolean
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
}

export interface AnalyticsSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  habits_completed: number
  completion_rate: number
  total_xp_earned: number
  active_streaks: number
  most_productive_hour: number | null
  average_completion_time: string | null
  avg_mood: number | null
  avg_energy: number | null
  created_at: string
}

// Extended types with relations
export interface HabitWithRelations extends Habit {
  habit_completions?: HabitCompletion[]
  habit_streaks?: HabitStreak
}

export interface CompletionStats {
  total: number
  today: number
  this_week: number
  this_month: number
  completion_rate: number
}

export interface DashboardStats {
  total_habits: number
  completed_today: number
  completion_rate: number
  active_streaks: number
  total_xp: number
  current_level: number
  xp_for_next_level: number
}

