"use client"

import { useState, useEffect } from "react"
import { useAISuggestHabits } from "@/lib/hooks/useAI"
import { useHabits } from "@/lib/hooks/useHabits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { motion, AnimatePresence } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "react-hot-toast"
import "@/components/habits/notebook-theme.css"

interface AIHabitSuggestionsProps {
  userId: string
}

const CATEGORY_COLORS: Record<string, string> = {
  health: "#06D6A0",
  productivity: "#26547C",
  mindfulness: "#EF476F",
  learning: "#FFD166",
  social: "#8B5CF6",
  custom: "#6366F1",
}

export function AIHabitSuggestions({ userId }: AIHabitSuggestionsProps) {
  const { data: habits } = useHabits(userId)
  const { suggest, isLoading, suggestions } = useAISuggestHabits()
  const [hasSuggested, setHasSuggested] = useState(false)

  const handleSuggest = async () => {
    if (!habits || habits.length === 0) {
      toast.error("Create some habits first to get personalized suggestions!")
      return
    }

    const currentHabits = habits.map(h => ({
      name: h.name,
      category: h.category,
    }))

    await suggest(currentHabits)
    setHasSuggested(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="notebook-container relative"
    >
      <div className="sticker pink" style={{ top: '10px', right: '10px', zIndex: 20 }}>
        💡 AI Suggestions
      </div>
      <Card className="border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl bg-white/95 dark:bg-slate-900/95">
        <CardHeader className="bg-gradient-to-r from-[#EF476F]/10 via-[#26547C]/10 to-[#06D6A0]/10 dark:from-[#EF476F]/20 dark:via-[#26547C]/20 dark:to-[#06D6A0]/20 border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={Icons.sparkles} className="h-5 w-5 text-[#FFD166]" />
            <CardTitle className="handwritten-title text-xl sm:text-2xl text-[#26547C] dark:text-[#60A5FA]">
              Smart Habit Suggestions
            </CardTitle>
          </div>
          <CardDescription className="handwritten-text">
            Get AI-powered habit recommendations based on your current routine
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!hasSuggested && !isLoading && (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🤖
              </motion.div>
              <p className="handwritten-text text-muted-foreground mb-4">
                Get personalized habit suggestions based on your current routine
              </p>
              <Button
                onClick={handleSuggest}
                className="bg-[#26547C] hover:bg-[#26547C]/90 dark:bg-[#60A5FA] dark:hover:bg-[#60A5FA]/90"
              >
                <FontAwesomeIcon icon={Icons.sparkles} className="h-4 w-4 mr-2" />
                Get Suggestions
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Spinner className="h-8 w-8 text-[#26547C] dark:text-[#60A5FA]" />
              <p className="handwritten-text text-muted-foreground">Analyzing your habits...</p>
            </div>
          )}

          {hasSuggested && suggestions.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="notebook-entry p-4 border-2"
                    style={{
                      borderColor: `${CATEGORY_COLORS[suggestion.category] || '#26547C'}/30`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="handwritten-text font-bold text-lg">{suggestion.name}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: `${CATEGORY_COLORS[suggestion.category] || '#26547C'}/50`,
                              color: CATEGORY_COLORS[suggestion.category] || '#26547C',
                            }}
                          >
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="handwritten-text text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <p className="handwritten-label text-xs text-muted-foreground italic">
                          💡 {suggestion.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasSuggested && suggestions.length === 0 && !isLoading && (
            <Alert className="bg-[#FFD166]/10 border-[#FFD166]">
              <FontAwesomeIcon icon={Icons.circleInfo} className="h-4 w-4" />
              <AlertDescription className="handwritten-text">
                No suggestions available at the moment. Try again later!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

