"use client"

import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { HabitFormContent } from "@/components/habits/habit-form"
import { motion } from "framer-motion"

export function AddHabitButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60] md:z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: [
              "0 10px 40px -5px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0.5)",
              "0 10px 40px -5px rgba(99, 102, 241, 0.5), 0 0 0 12px rgba(99, 102, 241, 0)",
              "0 10px 40px -5px rgba(99, 102, 241, 0.4), 0 0 0 0 rgba(99, 102, 241, 0)",
            ],
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="relative">
            {/* Animated sparkles around the button */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5,
                }}
              >
                <Sparkles 
                  className="h-4 w-4 text-yellow-400 opacity-60"
                  style={{
                    position: 'absolute',
                    top: `${Math.cos((i * 2 * Math.PI) / 3) * 30}px`,
                    left: `${Math.sin((i * 2 * Math.PI) / 3) * 30}px`,
                  }}
                />
              </motion.div>
            ))}
            
            <Button
              size="icon"
              className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-2 border-white/20 dark:border-white/10 backdrop-blur-sm"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 90, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <Plus className="h-8 w-8 sm:h-9 sm:w-9 stroke-[3]" />
              </motion.div>
            </Button>
          </div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <HabitFormContent userId={userId} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
