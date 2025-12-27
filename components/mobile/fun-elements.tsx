"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Star, Heart } from "lucide-react"

interface FloatingEmojiProps {
  emoji: string
  delay: number
  duration: number
}

function FloatingEmoji({ emoji, delay, duration }: FloatingEmojiProps) {
  const [position, setPosition] = useState(50)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition(Math.random() * 80 + 10)
    }
  }, [])

  return (
    <motion.div
      className="fixed pointer-events-none z-[100] text-3xl md:hidden"
      initial={{ 
        opacity: 0, 
        y: 0, 
        scale: 0,
        x: 0
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: -200,
        x: (Math.random() - 0.5) * 100,
        scale: [0, 1.5, 1.3, 0.8],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
      style={{
        left: `${position}%`,
        bottom: '15%',
      }}
    >
      {emoji}
    </motion.div>
  )
}

export function CelebrationBurst() {
  const [emojis, setEmojis] = useState<string[]>([])

  useEffect(() => {
    const handleCelebration = () => {
      const celebrationEmojis = ['🎉', '✨', '🌟', '💫', '⭐', '🔥', '💪', '🎊']
      const newEmojis = Array.from({ length: 8 }, () => 
        celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]
      )
      setEmojis(newEmojis)
      setTimeout(() => setEmojis([]), 2000)
    }

    // Listen for custom celebration events
    window.addEventListener('celebrate', handleCelebration)
    return () => window.removeEventListener('celebrate', handleCelebration)
  }, [])

  return (
    <AnimatePresence>
      {emojis.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} delay={i * 0.1} duration={2} />
      ))}
    </AnimatePresence>
  )
}

export function MobileFunIndicator() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show on mobile only
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setShow(true)
        const timer = setTimeout(() => setShow(false), 4000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 md:hidden"
    >
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
        <span className="text-xs font-semibold">Swipe to explore! ✨</span>
      </div>
    </motion.div>
  )
}

export function HabitCompletionCelebration() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] md:hidden">
      {/* This will be triggered by habit completion */}
    </div>
  )
}

// Fun mobile-specific animations
export function MobileSwipeHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setVisible(true)
        const timer = setTimeout(() => setVisible(false), 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 md:hidden pointer-events-none"
    >
      <motion.div
        animate={{ x: [0, 12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="bg-gradient-to-r from-blue-500/95 to-purple-500/95 text-white p-3 rounded-full shadow-2xl border-2 border-white/30"
      >
        <Zap className="h-5 w-5" />
      </motion.div>
    </motion.div>
  )
}

