import { NextRequest, NextResponse } from "next/server"
import { generateMotivationalMessage } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.stats) {
      return NextResponse.json(
        { error: "Stats are required" },
        { status: 400 }
      )
    }

    const message = await generateMotivationalMessage(body.stats)
    
    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in motivational API:", error)
    return NextResponse.json(
      { error: "Failed to generate motivational message" },
      { status: 500 }
    )
  }
}

