// AI Integration for habit tracking
// Priority: Gemini → AI/ML API (Gemma) → Static Fallback
import { GoogleGenAI } from "@google/genai"

// ============= CONFIGURATION =============
const GEMINI_MODEL = "gemini-2.0-flash"
const AIML_BASE_URL = "https://api.aimlapi.com/v1"
// AI/ML API models - try multiple until one works
// Prioritize gpt-4o since we know it works
const AIML_MODELS = [
  "gpt-4o",                             // High quality - confirmed working!
  "gpt-4o-mini",                        // Fast, cheap, reliable
  "gpt-3.5-turbo",                      // Classic, widely available
  "claude-3-haiku-20240307",            // Anthropic fast model
  "mistralai/Mistral-7B-Instruct-v0.2", // Open source
]

// ============= AI PROVIDERS =============

// Provider 1: Google Gemini
async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.log("⚠️ GEMINI_API_KEY not set, skipping Gemini")
    return null
  }

  try {
    console.log("🔷 Trying Gemini API...")
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    })
    
    if (response.text) {
      console.log("✅ Gemini responded successfully!")
      return response.text
    }
    return null
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes("429") || msg.includes("quota")) {
      console.log("⚠️ Gemini rate limited, trying fallback...")
    } else {
      console.error("❌ Gemini error:", msg)
    }
    return null
  }
}

// Provider 2: AI/ML API (GPT/Claude/Mistral models)
async function callAIML(prompt: string, systemPrompt?: string): Promise<string | null> {
  const apiKey = process.env.AI_KEY
  if (!apiKey) {
    console.log("⚠️ AI_KEY not set, skipping AI/ML API")
    return null
  }

  // Try each model until one works
  for (const model of AIML_MODELS) {
    try {
      console.log(`🔶 Trying AI/ML API with ${model}...`)
      
      const response = await fetch(`${AIML_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`⚠️ ${model} failed (${response.status}):`, errorText.substring(0, 150))
        continue // Try next model
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      
      if (text && text.trim()) {
        console.log(`✅ AI/ML API (${model}) responded successfully!`)
        console.log(`📄 Response preview:`, text.substring(0, 100) + "...")
        return text
      } else {
        console.log(`⚠️ ${model} returned empty response`)
      }
    } catch (error) {
      console.error(`❌ ${model} error:`, error instanceof Error ? error.message : error)
      // Continue to next model
    }
  }
  
  console.log("❌ All AI/ML API models failed")
  return null
}

// Combined AI call with fallback chain
async function callAI(prompt: string, systemPrompt?: string): Promise<string | null> {
  // Try Gemini first
  const geminiResult = await callGemini(prompt)
  if (geminiResult) return geminiResult
  
  // Fallback to AI/ML API
  const aimlResult = await callAIML(prompt, systemPrompt)
  if (aimlResult) return aimlResult
  
  console.log("⚠️ All AI providers failed, using static fallback")
  return null
}

// ============= HELPER FUNCTIONS =============

function cleanAIResponse(text: string, maxLength?: number): string {
  if (!text) return ""
  
  let cleaned = text
    .replace(/^["']|["']$/g, '')
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/`/g, '')
    .trim()
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength - 3) + "..."
  }
  
  return cleaned
}

function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    const cleaned = cleanAIResponse(text)
    const startIdx = Math.max(cleaned.indexOf('['), cleaned.indexOf('{'))
    const endIdx = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'))
    
    if (startIdx === -1 || endIdx === -1) {
      return JSON.parse(cleaned)
    }
    
    const jsonStr = cleaned.substring(startIdx, endIdx + 1)
    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error("JSON parse error:", error)
    return fallback
  }
}

// ============= FALLBACK DATA =============

const FALLBACK_MOTIVATIONAL = [
  "Let's make today count. Every small step is progress. 💪",
  "Small habits, big changes. You've got this! ✨",
  "Consistency is your superpower. Keep going! 🔥",
  "Every completion is a victory. Celebrate! 🎉",
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

const FALLBACK_SUGGESTIONS = [
  {
    name: "Morning Meditation",
    description: "Start your day with 5 minutes of mindfulness",
    category: "mindfulness",
    reason: "Builds mental clarity for your routine",
    insight: "Morning meditation increases focus by 20% according to neuroscience research",
    funFact: "Just 5 minutes can reduce stress hormones by 15%"
  },
  {
    name: "Evening Walk",
    description: "Take a 15-minute walk to reflect on your day",
    category: "health",
    reason: "Complements indoor habits with movement",
    insight: "Walking after meals improves digestion and blood sugar regulation",
    funFact: "Evening walks can improve sleep quality by 65%"
  },
  {
    name: "Daily Reading",
    description: "Read 10 pages before bed",
    category: "learning",
    reason: "Adds knowledge to your daily routine",
    insight: "Reading before bed activates different brain regions than screen time",
    funFact: "6 minutes of reading can reduce stress by 68%"
  },
  {
    name: "Water Tracking",
    description: "Drink 8 glasses of water throughout the day",
    category: "health",
    reason: "Hydration boosts energy and focus",
    insight: "Even 2% dehydration can impair cognitive performance significantly",
    funFact: "Your brain is 75% water - stay hydrated to think clearly!"
  }
]

// ============= EXPORTED FUNCTIONS =============

export async function generateMotivationalMessage(
  userStats: {
    currentStreak: number
    completionRate: number
    recentCompletions: number
    userName: string
    timeOfDay: string
  }
): Promise<string> {
  console.log("\n🎯 generateMotivationalMessage called")
  
  const prompt = `Generate a short motivational message (max 80 chars) for ${userStats.userName} who has a ${userStats.currentStreak}-day streak and ${userStats.completionRate}% completion rate. Time: ${userStats.timeOfDay}. Use 1 emoji. Be warm and encouraging.`

  const result = await callAI(prompt)
  
  if (result) {
    return cleanAIResponse(result, 100)
  }
  
  return FALLBACK_MOTIVATIONAL[Math.floor(Math.random() * FALLBACK_MOTIVATIONAL.length)]
}

export async function suggestHabits(
  currentHabits: Array<{ name: string; category: string }>,
  userGoals?: string
): Promise<Array<{ name: string; description: string; category: string; reason: string; insight?: string; funFact?: string }>> {
  console.log("\n🎯 ============= suggestHabits START =============")
  console.log("📊 Current habits:", currentHabits.length)
  console.log("🎯 User goals:", userGoals || "None")
  
  const habitsSummary = currentHabits.length > 0
    ? currentHabits.map(h => `${h.name} (${h.category})`).join(", ")
    : "No existing habits"
  
  const missingCategories = ['health', 'productivity', 'mindfulness', 'learning', 'social']
    .filter(cat => !currentHabits.map(h => h.category).includes(cat))

  const systemPrompt = `You are an expert habit formation coach. Analyze user habits and suggest complementary ones with scientific insights.`
  
  const prompt = `Analyze these habits: ${habitsSummary}
${missingCategories.length > 0 ? `Missing categories: ${missingCategories.join(', ')}` : 'All categories covered'}
${userGoals ? `User goals: ${userGoals}` : ''}

Suggest 4-5 personalized, complementary habits. Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "name": "Specific habit name",
    "description": "What to do (30-80 chars)",
    "category": "health|productivity|mindfulness|learning|social",
    "reason": "Why it complements their routine (40-80 chars)",
    "insight": "Behavioral science insight (50-100 chars)",
    "funFact": "Interesting fact (40-80 chars)"
  }
]

Make suggestions SPECIFIC and PERSONALIZED to their current habits.`

  console.log("📤 Calling AI (Gemini → AI/ML API → Fallback)...")
  const result = await callAI(prompt, systemPrompt)
  
  if (result) {
    console.log("📥 AI Response received:", result.substring(0, 200) + "...")
    const suggestions = safeJSONParse<Array<any>>(result, [])
    
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      const validSuggestions = suggestions
        .filter(s => s && s.name && s.category)
        .slice(0, 5)
        .map(s => ({
          name: String(s.name || "").trim().substring(0, 50),
          description: String(s.description || "").trim().substring(0, 100),
          category: String(s.category || "productivity").trim(),
          reason: String(s.reason || "").trim().substring(0, 80),
          insight: s.insight ? String(s.insight).trim().substring(0, 100) : undefined,
          funFact: s.funFact ? String(s.funFact).trim().substring(0, 80) : undefined,
        }))
      
      if (validSuggestions.length > 0) {
        console.log("✅ Returning", validSuggestions.length, "AI-GENERATED suggestions")
        console.log("🎉 ============= SUCCESS: USING AI =============\n")
        return validSuggestions
      } else {
        console.log("⚠️ AI returned suggestions but none were valid")
      }
    } else {
      console.log("⚠️ AI response was not a valid array")
    }
  } else {
    console.log("⚠️ No AI response received")
  }
  
  console.log("⚠️ Using static fallback suggestions")
  console.log("❌ ============= FALLBACK USED =============\n")
  return FALLBACK_SUGGESTIONS
}

export async function generateHabitDescription(
  habitName: string,
  category: string
): Promise<string> {
  console.log("\n🎯 generateHabitDescription called for:", habitName)
  
  const prompt = `Generate a brief inspiring description (max 150 chars) for habit "${habitName}" (${category}). Explain why it matters. No quotes.`

  const result = await callAI(prompt)
  
  if (result) {
    return cleanAIResponse(result, 150)
  }
  
  return FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS.custom
}

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
  console.log("\n🎯 analyzeHabitPatterns called with", completions.length, "completions")
  
  if (completions.length === 0) {
    return {
      insights: ["Start tracking to see insights!"],
      recommendations: ["Complete your first habit"],
      bestTime: "Anytime",
      patterns: ["Building your routine"]
    }
  }

  const prompt = `Analyze habits: ${JSON.stringify(completions.slice(-20))}
Return JSON: {"insights":["insight1"],"recommendations":["rec1"],"bestTime":"Morning|Afternoon|Evening","patterns":["pattern1"]}`

  const result = await callAI(prompt)
  
  if (result) {
    const analysis = safeJSONParse<any>(result, null)
    if (analysis) {
      return {
        insights: (analysis.insights || []).slice(0, 5).map((i: any) => String(i).substring(0, 100)),
        recommendations: (analysis.recommendations || []).slice(0, 3).map((r: any) => String(r).substring(0, 80)),
        bestTime: analysis.bestTime || "Anytime",
        patterns: (analysis.patterns || []).slice(0, 3).map((p: any) => String(p).substring(0, 80))
      }
    }
  }
  
  return {
    insights: ["You're building consistency!", "Keep tracking daily"],
    recommendations: ["Try completing habits at the same time", "Celebrate small wins"],
    bestTime: "Anytime",
    patterns: ["Developing your routine"]
  }
}

export async function generateStreakAlert(
  habitName: string,
  streakDays: number,
  lastCompletion: string,
  preferredTime?: string
): Promise<string> {
  console.log("\n🎯 generateStreakAlert called for:", habitName, "streak:", streakDays)
  
  const prompt = `Urgent message (max 100 chars) for ${streakDays}-day streak on "${habitName}" at risk. Be motivating! Use 1 emoji.`

  const result = await callAI(prompt)
  
  if (result) {
    return cleanAIResponse(result, 100)
  }
  
  return `Your ${streakDays}-day streak on ${habitName} is waiting! 🔥`
}

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
  console.log("\n🎯 generateProgressReport called for:", period)
  
  const prompt = `Create ${period} report for ${stats.totalCompletions} completions, ${stats.completionRate}% rate, ${stats.streaks.length} streaks.
Return JSON: {"summary":"text","achievements":["ach1"],"encouragement":"text","nextSteps":["step1"]}`

  const result = await callAI(prompt)
  
  if (result) {
    const report = safeJSONParse<any>(result, null)
    if (report) {
      return {
        summary: String(report.summary || "").substring(0, 200) || `Great ${period}!`,
        achievements: (report.achievements || []).slice(0, 5).map((a: any) => String(a).substring(0, 80)),
        encouragement: String(report.encouragement || "").substring(0, 120) || "Keep going!",
        nextSteps: (report.nextSteps || []).slice(0, 3).map((s: any) => String(s).substring(0, 80))
      }
    }
  }
  
  return {
    summary: `You completed ${stats.totalCompletions} habits this ${period}!`,
    achievements: [`Maintained ${stats.streaks.length} streaks`, `${stats.completionRate}% completion`],
    encouragement: "Keep building on this success!",
    nextSteps: ["Continue daily tracking"]
  }
}
