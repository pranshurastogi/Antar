import { NextRequest, NextResponse } from "next/server"
import { suggestHabits } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.currentHabits || !Array.isArray(body.currentHabits)) {
      return NextResponse.json(
        { error: "Current habits array is required" },
        { status: 400 }
      )
    }

    const suggestions = await suggestHabits(
      body.currentHabits,
      body.userGoals
    )
    
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error in suggest habits API:", error)
    return NextResponse.json(
      { error: "Failed to suggest habits" },
      { status: 500 }
    )
  }
}

