import { NextRequest, NextResponse } from "next/server"
import { suggestHabits } from "@/lib/ai/gemini"

export async function POST(request: NextRequest) {
  console.log("\n🌐 ============= API ROUTE: /api/ai/suggest-habits =============")
  
  try {
    const body = await request.json()
    console.log("📥 Request body:", body)
    
    if (!body.currentHabits || !Array.isArray(body.currentHabits)) {
      console.error("❌ Invalid request: currentHabits missing or not an array")
      return NextResponse.json(
        { error: "Current habits array is required" },
        { status: 400 }
      )
    }

    console.log("✅ Request validated, calling suggestHabits...")
    const suggestions = await suggestHabits(
      body.currentHabits,
      body.userGoals
    )
    
    console.log("✅ Suggestions generated:", suggestions.length, "items")
    console.log("📤 Returning suggestions to client")
    console.log("🌐 ============= API ROUTE END =============\n")
    
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("❌ ============= API ROUTE ERROR =============")
    console.error("❌ Error in suggest habits API:", error)
    console.error("❌ Error type:", error instanceof Error ? error.name : typeof error)
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error))
    console.error("❌ ============= API ROUTE ERROR END =============\n")
    
    return NextResponse.json(
      { error: "Failed to suggest habits", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

