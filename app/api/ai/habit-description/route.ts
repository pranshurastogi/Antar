import { NextRequest, NextResponse } from "next/server"
import { generateHabitDescription } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.habitName || !body.category) {
      return NextResponse.json(
        { error: "Habit name and category are required" },
        { status: 400 }
      )
    }

    const description = await generateHabitDescription(
      body.habitName,
      body.category
    )
    
    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error in habit description API:", error)
    return NextResponse.json(
      { error: "Failed to generate habit description" },
      { status: 500 }
    )
  }
}

