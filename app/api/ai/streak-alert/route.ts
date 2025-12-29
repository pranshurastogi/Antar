import { NextRequest, NextResponse } from "next/server"
import { generateStreakAlert } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.habitName || !body.streakDays || !body.lastCompletion) {
      return NextResponse.json(
        { error: "Habit name, streak days, and last completion are required" },
        { status: 400 }
      )
    }

    const alert = await generateStreakAlert(
      body.habitName,
      body.streakDays,
      body.lastCompletion,
      body.preferredTime
    )
    
    return NextResponse.json({ alert })
  } catch (error) {
    console.error("Error in streak alert API:", error)
    return NextResponse.json(
      { error: "Failed to generate streak alert" },
      { status: 500 }
    )
  }
}

