import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// Models to try on AI/ML API
const AIML_MODELS_TO_TRY = [
  "gpt-4o-mini",
  "gpt-4o", 
  "gpt-3.5-turbo",
  "claude-3-haiku-20240307",
  "mistralai/Mistral-7B-Instruct-v0.2",
]

// Test endpoint to verify all AI providers
export async function GET(request: NextRequest) {
  console.log("\n🧪 ============= AI PROVIDERS TEST =============")
  
  const results: any = {
    timestamp: new Date().toISOString(),
    providers: {}
  }
  
  // Test 1: Gemini API
  const geminiKey = process.env.GEMINI_API_KEY
  console.log("Testing Gemini:", geminiKey ? `Key found (${geminiKey.substring(0, 8)}...)` : "No key")
  
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Say 'Hello from Gemini!' with one emoji.",
      })
      results.providers.gemini = {
        status: "✅ Working",
        response: response.text
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      results.providers.gemini = {
        status: msg.includes("429") ? "⚠️ Rate Limited" : "❌ Failed",
        error: msg.substring(0, 200)
      }
    }
  } else {
    results.providers.gemini = { status: "⚠️ No GEMINI_API_KEY in .env" }
  }
  
  // Test 2: AI/ML API - try multiple models
  const aimlKey = process.env.AI_KEY
  console.log("Testing AI/ML API:", aimlKey ? `Key found (${aimlKey.substring(0, 8)}...)` : "No key")
  
  if (aimlKey) {
    let foundWorkingModel = false
    
    for (const model of AIML_MODELS_TO_TRY) {
      if (foundWorkingModel) break
      
      try {
        console.log(`  Trying model: ${model}...`)
        const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${aimlKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Say 'Hello!' with one emoji. Max 10 words." }],
            max_tokens: 50,
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            results.providers.aiml = {
              status: "✅ Working",
              model: model,
              response: content
            }
            foundWorkingModel = true
            console.log(`  ✅ ${model} works!`)
          }
        } else {
          console.log(`  ❌ ${model} failed`)
        }
      } catch (error) {
        console.log(`  ❌ ${model} error:`, error instanceof Error ? error.message : error)
      }
    }
    
    if (!foundWorkingModel) {
      results.providers.aiml = {
        status: "❌ No working models found",
        triedModels: AIML_MODELS_TO_TRY,
        hint: "Check AI/ML API docs for available models: https://docs.aimlapi.com"
      }
    }
  } else {
    results.providers.aiml = { status: "⚠️ No AI_KEY in .env" }
  }
  
  // Summary
  const geminiWorking = results.providers.gemini?.status?.includes("Working")
  const aimlWorking = results.providers.aiml?.status?.includes("Working")
  
  results.summary = {
    anyWorking: geminiWorking || aimlWorking,
    recommendation: geminiWorking 
      ? "Gemini is working! AI features should work."
      : aimlWorking 
        ? `AI/ML API working with ${results.providers.aiml.model}! Using as fallback.`
        : "No AI providers working. Check your API keys or wait for Gemini quota reset."
  }
  
  console.log("🧪 ============= TEST COMPLETE =============\n")
  
  return NextResponse.json(results)
}
