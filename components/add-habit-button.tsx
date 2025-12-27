"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 10px 25px -5px rgba(99, 102, 241, 0.3), 0 0 0 0 rgba(99, 102, 241, 0.4)",
              "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 0 0 8px rgba(99, 102, 241, 0)",
              "0 10px 25px -5px rgba(99, 102, 241, 0.3), 0 0 0 0 rgba(99, 102, 241, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Button
            size="icon"
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0"
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.div>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <HabitFormContent userId={userId} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
