"use client"

import { useProfile } from "@/lib/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface PetWidgetProps {
  userId: string
}

const PET_STAGES = {
  seed: { emoji: '🌰', name: 'Seed', description: 'Your journey begins...', range: [0, 9] },
  sprout: { emoji: '🌱', name: 'Sprout', description: 'Growth is emerging!', range: [10, 29] },
  plant: { emoji: '🪴', name: 'Plant', description: 'Thriving with consistency!', range: [30, 59] },
  tree: { emoji: '🌳', name: 'Tree', description: 'Strong and established!', range: [60, 89] },
  forest: { emoji: '🌲🌳🌲', name: 'Forest', description: 'A complete ecosystem!', range: [90, 100] },
}

export function PetWidget({ userId }: PetWidgetProps) {
  const { data: profile, isLoading } = useProfile(userId)

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!profile) return null

  const petType = profile.pet_type || 'seed'
  const growthStage = profile.pet_growth_stage || 0
  const petData = PET_STAGES[petType]
  const progress = Math.min(growthStage, 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300 rounded-full blur-2xl" />
        </div>

        <CardHeader className="relative z-10 pb-3">
          <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
            Your Antar Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Pet Display */}
            <motion.div
              className="text-5xl sm:text-6xl md:text-7xl"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.2, rotate: 10 }}
            >
              {petData.emoji}
            </motion.div>

            {/* Pet Info */}
            <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
              <motion.h3
                className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {petData.name}
              </motion.h3>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mb-3 sm:mb-4">
                {petData.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Growth Progress</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="relative">
                  <Progress
                    value={progress}
                    className="h-2.5 sm:h-3 bg-emerald-200 dark:bg-emerald-900"
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="text-[10px] sm:text-xs text-center text-emerald-600 dark:text-emerald-400 italic px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            "Your Antar grows with your consistency. Every habit completion nurtures its growth."
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

