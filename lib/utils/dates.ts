// Date and Time Utilities
import { format, formatDistance, isToday, isYesterday, parseISO, startOfDay, endOfDay, subDays, addDays, differenceInDays } from 'date-fns'

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

/**
 * Format time for display
 */
export function formatTime(time: string | Date): string {
  const dateObj = typeof time === 'string' ? parseISO(time) : time
  return format(dateObj, 'h:mm a')
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

/**
 * Check if date is today
 */
export function isDateToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isToday(dateObj)
}

/**
 * Check if date is yesterday
 */
export function isDateYesterday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isYesterday(dateObj)
}

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Format date as YYYY-MM-DD for database
 */
export function formatDateForDB(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday(): string {
  return formatDateForDB()
}

/**
 * Get date range for analytics
 */
export function getDateRange(range: 'week' | 'month' | '3months' | 'all'): { start: Date; end: Date } {
  const end = new Date()
  let start: Date

  switch (range) {
    case 'week':
      start = subDays(end, 7)
      break
    case 'month':
      start = subDays(end, 30)
      break
    case '3months':
      start = subDays(end, 90)
      break
    case 'all':
      start = new Date(2020, 0, 1) // Arbitrary old date
      break
  }

  return { start, end }
}

/**
 * Calculate streak from completion dates
 */
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0

  // Sort dates descending
  const sorted = completionDates
    .map((d) => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  let currentDate = new Date()

  // Check if there's a completion today or yesterday to start the streak
  const lastCompletion = sorted[0]
  const daysSinceLastCompletion = differenceInDays(currentDate, lastCompletion)

  if (daysSinceLastCompletion > 1) {
    return 0 // Streak is broken
  }

  // Count consecutive days
  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = subDays(currentDate, streak)
    const completionDate = sorted[i]

    if (differenceInDays(expectedDate, completionDate) === 0) {
      streak++
    } else if (differenceInDays(expectedDate, completionDate) < 0) {
      // Skip this date, it's from an older streak
      continue
    } else {
      // Gap found, streak ends
      break
    }
  }

  return streak
}

/**
 * Generate array of dates for calendar heatmap
 */
export function generateCalendarDates(months: number = 12): Date[] {
  const dates: Date[] = []
  const today = new Date()

  for (let i = months * 30; i >= 0; i--) {
    dates.push(subDays(today, i))
  }

  return dates
}

/**
 * Check if time is in the past for today
 */
export function isTimePassedToday(preferredTime: string | null): boolean {
  if (!preferredTime) return false

  const now = new Date()
  const [hours, minutes] = preferredTime.split(':').map(Number)
  const preferredDate = new Date()
  preferredDate.setHours(hours, minutes, 0, 0)

  return now > preferredDate
}

