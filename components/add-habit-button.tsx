"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { HabitFormContent } from "@/components/habits/habit-form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { motion } from "framer-motion"
import "@/components/habits/notebook-theme.css"

export function AddHabitButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render animations during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        size="icon"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-2xl bg-gradient-to-br from-[#26547C] via-[#EF476F] to-[#06D6A0] text-white border-4 border-white/30 dark:border-white/20"
        aria-label="Add new habit"
      >
        <FontAwesomeIcon icon={Icons.plus} className="h-8 w-8 sm:h-9 sm:w-9" />
      </Button>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                "0 10px 40px -5px rgba(38, 84, 124, 0.4), 0 0 0 0 rgba(38, 84, 124, 0.5)",
                "0 10px 40px -5px rgba(38, 84, 124, 0.5), 0 0 0 12px rgba(38, 84, 124, 0)",
                "0 10px 40px -5px rgba(38, 84, 124, 0.4), 0 0 0 0 rgba(38, 84, 124, 0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            {/* Sticker decoration */}
            <div className="sticker pink absolute -top-2 -left-2 z-10 text-xs sm:text-sm pointer-events-none">
              New!
            </div>
            
            <div className="relative">
              {/* Animated sparkles around the button - only render on client */}
              {mounted && [...Array(3)].map((_, i) => {
                // Pre-calculate positions to avoid hydration issues
                const angle = (i * 2 * Math.PI) / 3
                const top = Math.round(Math.cos(angle) * 35 * 10) / 10 // Round to 1 decimal
                const left = Math.round(Math.sin(angle) * 35 * 10) / 10 // Round to 1 decimal
                
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.5,
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={Icons.sparkles}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-[#FFD166] opacity-70"
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        left: `${left}px`,
                      }}
                    />
                  </motion.div>
                )
              })}
              
              <Button
                size="icon"
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-2xl bg-gradient-to-br from-[#26547C] via-[#EF476F] to-[#06D6A0] hover:from-[#26547C]/90 hover:via-[#EF476F]/90 hover:to-[#06D6A0]/90 text-white border-4 border-white/30 dark:border-white/20 backdrop-blur-sm notebook-entry"
                aria-label="Add new habit"
                onClick={() => setIsOpen(true)}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 90, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <FontAwesomeIcon icon={Icons.plus} className="h-8 w-8 sm:h-9 sm:w-9" />
                </motion.div>
              </Button>
            </div>
          </motion.div>
        </DialogTrigger>
      <DialogContent 
        className="notebook-container sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing when clicking the floating button
          const target = e.target as HTMLElement
          if (target.closest('[data-slot="dialog-trigger"]')) {
            e.preventDefault()
          }
        }}
      >
        <div className="sticker teal" style={{ top: '10px', right: '10px', zIndex: 10 }}>
          ✍️ New Habit
        </div>
        <HabitFormContent userId={userId} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
      </Dialog>
    </>
  )
}
