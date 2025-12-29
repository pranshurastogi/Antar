import { NextRequest, NextResponse } from "next/server"
import { generateProgressReport } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.period || !body.stats) {
      return NextResponse.json(
        { error: "Period and stats are required" },
        { status: 400 }
      )
    }

    const report = await generateProgressReport(
      body.period,
      body.stats
    )
    
    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error in progress report API:", error)
    return NextResponse.json(
      { error: "Failed to generate progress report" },
      { status: 500 }
    )
  }
}

