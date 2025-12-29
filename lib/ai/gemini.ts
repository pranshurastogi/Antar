// Google Gemini AI integration for habit tracking
import { GoogleGenAI } from "@google/genai"

// Initialize Gemini AI
// The client automatically gets the API key from the environment variable GEMINI_API_KEY
let aiInstance: GoogleGenAI | null = null

const getGenAI = () => {
  if (aiInstance) {
    return aiInstance
  }
  
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables")
  }
  
  // Reuse the same instance for better performance
  aiInstance = new GoogleGenAI({ apiKey })
  return aiInstance
}

// Fallback messages for when AI fails
const FALLBACK_MOTIVATIONAL_MESSAGES = [
  "Let's make today count. Every small step forward is progress.",
  "Small habits, big changes. You've got this! 💪",
  "Consistency is the key. Keep going! ✨",
  "Every completion is a victory. Celebrate the journey! 🎉",
  "Your future self will thank you. Keep building! 🌱",
]

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  health: "A healthy habit to improve your physical and mental well-being.",
  productivity: "A productivity habit to help you achieve your goals efficiently.",
  mindfulness: "A mindfulness habit to enhance your awareness and peace.",
  learning: "A learning habit to expand your knowledge and skills.",
  social: "A social habit to strengthen your relationships and connections.",
  custom: "A personalized habit tailored to your unique goals.",
}

// Helper function to clean and validate AI responses
function cleanAIResponse(text: string, maxLength?: number): string {
  if (!text) return ""
  
  // Remove quotes, markdown code blocks, and extra whitespace
  let cleaned = text
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/```json\n?/g, '') // Remove markdown code blocks
    .replace(/```\n?/g, '')
    .trim()
  
  // Limit length if specified
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength - 3) + "..."
  }
  
  return cleaned
}

// Helper function to parse JSON safely
function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = cleanAIResponse(text)
    const parsed = JSON.parse(cleaned)
    return parsed as T
  } catch (error) {
    console.error("JSON parse error:", error)
    return fallback
  }
}

/**
 * Generate personalized motivational message with improved prompt
 */
export async function generateMotivationalMessage(
  userStats: {
    currentStreak: number
    completionRate: number
    recentCompletions: number
    userName: string
    timeOfDay: string
  }
): Promise<string> {
  try {
    const ai = getGenAI()

    // Improved prompt with better structure and context
    const prompt = `You are a motivational coach for a habit-tracking app called "Antar". 
Generate a personalized, encouraging message for ${userStats.userName}.

Context:
- Current streak: ${userStats.currentStreak} days
- Completion rate: ${userStats.completionRate}%
- Recent completions today: ${userStats.recentCompletions}
- Time of day: ${userStats.timeOfDay}

Requirements:
- Maximum 80 characters
- Friendly, warm, and encouraging tone
- Reference their specific progress (streak or completion rate)
- Match the time of day context
- Use emojis sparingly (0-1 max)
- No quotes, no markdown, just the message text

Generate the message now:`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const text = response.text?.trim() || ""
    const cleaned = cleanAIResponse(text, 100)
    
    return cleaned || FALLBACK_MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * FALLBACK_MOTIVATIONAL_MESSAGES.length)]
  } catch (error) {
    console.error("Error generating motivational message:", error)
    // Return random fallback
    return FALLBACK_MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * FALLBACK_MOTIVATIONAL_MESSAGES.length)]
  }
}

/**
 * Suggest new habits based on existing ones with improved prompt
 */
export async function suggestHabits(
  currentHabits: Array<{ name: string; category: string }>,
  userGoals?: string
): Promise<Array<{ name: string; description: string; category: string; reason: string }>> {
  try {
    const ai = getGenAI()

    const habitsSummary = currentHabits.length > 0
      ? currentHabits.map(h => `${h.name} (${h.category})`).join(", ")
      : "No existing habits"
    
    // Improved prompt with structured output guidance
    const prompt = `You are a habit formation expert. Analyze the user's current habits and suggest complementary new habits.

Current habits: ${habitsSummary}
${userGoals ? `User goals: ${userGoals}` : "No specific goals mentioned"}

Task: Suggest 3-5 new habits that would complement their existing routine.

Requirements:
- Each habit should fill a gap or enhance their current routine
- Categories must be one of: health, productivity, mindfulness, learning, social
- Descriptions should be brief (1 sentence, max 100 chars)
- Reasons should explain why it complements their routine (max 80 chars)
- Make suggestions practical and achievable

Return ONLY a valid JSON array in this exact format (no markdown, no code blocks):
[
  {
    "name": "Habit Name",
    "description": "Brief description",
    "category": "health|productivity|mindfulness|learning|social",
    "reason": "Why this complements their routine"
  }
]`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    let text = response.text?.trim() || ""
    const suggestions = safeJSONParse<Array<{ name: string; description: string; category: string; reason: string }>>(
      text,
      []
    )
    
    // Validate and sanitize suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error("Invalid response format")
    }
    
    // Validate each suggestion
    const validSuggestions = suggestions
      .filter(s => 
        s.name && 
        s.description && 
        s.category && 
        s.reason &&
        ['health', 'productivity', 'mindfulness', 'learning', 'social'].includes(s.category)
      )
      .slice(0, 5) // Limit to 5
      .map(s => ({
        name: s.name.trim().substring(0, 50),
        description: s.description.trim().substring(0, 100),
        category: s.category.trim(),
        reason: s.reason.trim().substring(0, 80),
      }))
    
    return validSuggestions.length > 0 ? validSuggestions : [
      {
        name: "Morning Meditation",
        description: "Start your day with 5 minutes of mindfulness",
        category: "mindfulness",
        reason: "Complements your existing routine with mental clarity"
      },
      {
        name: "Evening Reflection",
        description: "Reflect on your day and plan tomorrow",
        category: "productivity",
        reason: "Helps you stay organized and mindful"
      }
    ]
  } catch (error) {
    console.error("Error suggesting habits:", error)
    // Return fallback suggestions
    return [
      {
        name: "Morning Meditation",
        description: "Start your day with 5 minutes of mindfulness",
        category: "mindfulness",
        reason: "Complements your existing routine with mental clarity"
      },
      {
        name: "Evening Reflection",
        description: "Reflect on your day and plan tomorrow",
        category: "productivity",
        reason: "Helps you stay organized and mindful"
      }
    ]
  }
}

/**
 * Generate habit description with improved prompt
 */
export async function generateHabitDescription(
  habitName: string,
  category: string
): Promise<string> {
  try {
    const ai = getGenAI()

    const prompt = `You are a habit formation coach. Generate an inspiring description for a habit.

Habit name: "${habitName}"
Category: ${category}

Requirements:
- 2-3 sentences maximum
- Maximum 150 characters total
- Encouraging and specific to habit formation
- Explain why this habit matters
- No quotes, no markdown, just the description text

Generate the description now:`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const text = response.text?.trim() || ""
    const cleaned = cleanAIResponse(text, 150)
    
    return cleaned || FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS.custom
  } catch (error) {
    console.error("Error generating habit description:", error)
    return FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS.custom
  }
}

/**
 * Analyze habit patterns and provide insights with improved prompt
 */
export async function analyzeHabitPatterns(
  completions: Array<{
    date: string
    time: string
    mood?: number
    energy?: number
    habitName: string
  }>
): Promise<{
  insights: string[]
  recommendations: string[]
  bestTime: string
  patterns: string[]
}> {
  try {
    const ai = getGenAI()

    // Limit data to avoid token limits and focus on recent patterns
    const limitedCompletions = completions.slice(-50) // Last 50 completions
    
    if (limitedCompletions.length === 0) {
      throw new Error("No completion data available")
    }

    // Calculate some basic stats for better context
    const completionCount = limitedCompletions.length
    const avgMood = limitedCompletions
      .filter(c => c.mood !== undefined)
      .reduce((sum, c) => sum + (c.mood || 0), 0) / limitedCompletions.filter(c => c.mood !== undefined).length || 0
    
    const timeGroups: Record<string, number> = {}
    limitedCompletions.forEach(c => {
      const hour = parseInt(c.time.split(':')[0]) || 12
      const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
      timeGroups[period] = (timeGroups[period] || 0) + 1
    })
    const bestTimePeriod = Object.entries(timeGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Anytime'

    const prompt = `You are a data analyst specializing in habit formation. Analyze the completion data and provide actionable insights.

Completion Data (${completionCount} entries):
${JSON.stringify(limitedCompletions.slice(-30))} // Last 30 for analysis

Context:
- Total completions analyzed: ${completionCount}
- Average mood rating: ${avgMood > 0 ? avgMood.toFixed(1) : 'N/A'}
- Most common completion time: ${bestTimePeriod}

Task: Analyze patterns and provide insights.

Requirements:
- Insights: 3-5 key findings about their completion patterns (max 100 chars each)
- Recommendations: 2-3 actionable tips to improve consistency (max 80 chars each)
- Best time: Optimal completion time based on data (e.g., "Morning", "Afternoon", "Evening")
- Patterns: 2-3 notable patterns you've identified (max 80 chars each)

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "bestTime": "Morning|Afternoon|Evening|Anytime",
  "patterns": ["pattern 1", "pattern 2"]
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    let text = response.text?.trim() || ""
    const analysis = safeJSONParse<{
      insights: string[]
      recommendations: string[]
      bestTime: string
      patterns: string[]
    }>(text, {
      insights: [],
      recommendations: [],
      bestTime: bestTimePeriod,
      patterns: []
    })
    
    // Validate and sanitize
    return {
      insights: (Array.isArray(analysis.insights) ? analysis.insights : []).slice(0, 5).map(i => i.substring(0, 100)),
      recommendations: (Array.isArray(analysis.recommendations) ? analysis.recommendations : []).slice(0, 3).map(r => r.substring(0, 80)),
      bestTime: analysis.bestTime || bestTimePeriod || "Anytime",
      patterns: (Array.isArray(analysis.patterns) ? analysis.patterns : []).slice(0, 3).map(p => p.substring(0, 80))
    }
  } catch (error) {
    console.error("Error analyzing patterns:", error)
    // Return fallback insights
    return {
      insights: [
        "Keep tracking your habits consistently",
        "Try to maintain your current completion rate"
      ],
      recommendations: [
        "Set reminders for your preferred times",
        "Focus on consistency over perfection"
      ],
      bestTime: "Anytime",
      patterns: ["Continue building your routine"]
    }
  }
}

/**
 * Generate streak risk alert message with improved prompt
 */
export async function generateStreakAlert(
  habitName: string,
  streakDays: number,
  lastCompletion: string,
  preferredTime?: string
): Promise<string> {
  try {
    const ai = getGenAI()

    const prompt = `You are a motivational coach. Generate an urgent but encouraging message for someone at risk of breaking their streak.

Context:
- Habit: "${habitName}"
- Current streak: ${streakDays} days
- Last completed: ${lastCompletion}
${preferredTime ? `- Preferred time: ${preferredTime}` : ''}

Requirements:
- Maximum 100 characters
- Urgent but encouraging tone
- Reference their streak to create urgency
- Motivating and time-sensitive
- Use 0-1 emoji max
- No quotes, no markdown, just the message text

Generate the alert message now:`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const text = response.text?.trim() || ""
    const cleaned = cleanAIResponse(text, 100)
    
    return cleaned || `Don't break your ${streakDays}-day streak on ${habitName}! You've got this! 🔥`
  } catch (error) {
    console.error("Error generating streak alert:", error)
    return `Don't break your ${streakDays}-day streak on ${habitName}! You've got this! 🔥`
  }
}

/**
 * Generate weekly/monthly progress report with improved prompt
 */
export async function generateProgressReport(
  period: 'weekly' | 'monthly',
  stats: {
    totalCompletions: number
    streaks: number[]
    completionRate: number
    topHabits: string[]
    improvements: string[]
  }
): Promise<{
  summary: string
  achievements: string[]
  encouragement: string
  nextSteps: string[]
}> {
  try {
    const ai = getGenAI()

    const prompt = `You are a progress coach. Generate a ${period} progress report based on the user's stats.

Stats:
- Total completions: ${stats.totalCompletions}
- Active streaks: ${stats.streaks.length} (${stats.streaks.join(", ")} days)
- Completion rate: ${stats.completionRate}%
- Top performing habits: ${stats.topHabits.join(", ") || "None yet"}
- Areas of improvement: ${stats.improvements.join(", ") || "None identified"}

Task: Create an encouraging ${period} report.

Requirements:
- Summary: 2-3 sentences highlighting key achievements (max 200 chars)
- Achievements: 3-5 specific accomplishments (max 80 chars each)
- Encouragement: A motivating message (max 120 chars)
- Next steps: 2-3 actionable recommendations (max 80 chars each)

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "summary": "Brief summary of progress",
  "achievements": ["achievement 1", "achievement 2"],
  "encouragement": "Encouraging message",
  "nextSteps": ["step 1", "step 2"]
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    let text = response.text?.trim() || ""
    const report = safeJSONParse<{
      summary: string
      achievements: string[]
      encouragement: string
      nextSteps: string[]
    }>(text, {
      summary: "",
      achievements: [],
      encouragement: "",
      nextSteps: []
    })
    
    // Validate and sanitize
    return {
      summary: report.summary?.substring(0, 200) || `Great progress this ${period}!`,
      achievements: (Array.isArray(report.achievements) ? report.achievements : []).slice(0, 5).map(a => a.substring(0, 80)),
      encouragement: report.encouragement?.substring(0, 120) || "Keep up the amazing work!",
      nextSteps: (Array.isArray(report.nextSteps) ? report.nextSteps : []).slice(0, 3).map(s => s.substring(0, 80))
    }
  } catch (error) {
    console.error("Error generating progress report:", error)
    // Return fallback report
    return {
      summary: `You completed ${stats.totalCompletions} habits this ${period}!`,
      achievements: [
        `Maintained ${stats.streaks.length} active streak${stats.streaks.length !== 1 ? 's' : ''}`,
        `Achieved ${stats.completionRate}% completion rate`
      ],
      encouragement: "Keep building on this momentum!",
      nextSteps: [
        "Continue tracking your habits daily",
        "Focus on maintaining your streaks"
      ]
    }
  }
}
