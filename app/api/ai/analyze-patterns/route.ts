import { NextRequest, NextResponse } from "next/server"
import { analyzeHabitPatterns } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.completions || !Array.isArray(body.completions)) {
      return NextResponse.json(
        { error: "Completions array is required" },
        { status: 400 }
      )
    }

    const analysis = await analyzeHabitPatterns(body.completions)
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error in analyze patterns API:", error)
    return NextResponse.json(
      { error: "Failed to analyze patterns" },
      { status: 500 }
    )
  }
}

