import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HabitList } from "@/components/habit-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { AddHabitButton } from "@/components/add-habit-button"
import { DashboardStats } from "@/components/dashboard/stats-bar"
import { DashboardGreeting } from "@/components/dashboard/greeting"
import { PetWidget } from "@/components/gamification/pet-widget"
import { StreakCalendar } from "@/components/habits/streak-calendar"
import { XPBar } from "@/components/gamification/xp-bar"
import { AIHabitSuggestions } from "@/components/habits/ai-habit-suggestions"
import { MobileNav } from "@/components/mobile-nav"
import "@/components/habits/notebook-theme.css"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <main className="flex min-h-[calc(100vh-200px)] flex-col notebook-container relative p-2 sm:p-4 md:p-6 lg:p-8 pb-20 sm:pb-24 md:pb-28">
      {/* Background decorations */}
      <div className="scribble-decoration scribble-1" style={{ top: '5%', right: '2%' }} />
      <div className="scribble-decoration scribble-2" style={{ bottom: '10%', left: '3%' }} />
      
      <DashboardHeader user={user} />

      <div className="mt-2 sm:mt-4 md:mt-6 space-y-3 sm:space-y-4 md:space-y-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Greeting with sticker */}
        <div className="relative">
          <div className="sticker blue" style={{ top: '-8px', right: '5px', zIndex: 20 }}>
            📅 Today
          </div>
          <DashboardGreeting userId={user.id} />
        </div>

        {/* Today's Habits - Notebook Style */}
        <section className="relative">
          <div className="sticker teal" style={{ top: '-8px', left: '5px', zIndex: 20 }}>
            ✅ Habits
          </div>
          <h2 className="handwritten-title text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 sm:mb-3 md:mb-4 text-[#26547C] dark:text-[#60A5FA] pl-2">
            Today's Habits
          </h2>
          <div className="notebook-container bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 lg:p-6 border-2 border-[#26547C]/20 dark:border-[#60A5FA]/20 shadow-lg">
            <HabitList userId={user.id} />
          </div>
        </section>

        {/* XP Bar */}
        <div className="relative">
          <div className="sticker pink" style={{ top: '-8px', right: '5px', zIndex: 20 }}>
            ⭐ XP
          </div>
          <XPBar userId={user.id} />
        </div>

        {/* Stats Bar */}
        <div className="relative">
          <div className="sticker" style={{ top: '-8px', left: '5px', zIndex: 20 }}>
            📊 Stats
          </div>
          <DashboardStats userId={user.id} />
        </div>

        {/* Pet Widget & Streak Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="relative">
            <div className="sticker teal" style={{ top: '-8px', right: '5px', zIndex: 20 }}>
              🐾 Pet
            </div>
            <PetWidget userId={user.id} />
          </div>
          <div className="relative">
            <div className="sticker pink" style={{ top: '-8px', left: '5px', zIndex: 20 }}>
              🔥 Streak
            </div>
            <StreakCalendar userId={user.id} />
          </div>
        </div>

        {/* AI Habit Suggestions */}
        <div className="relative">
          <AIHabitSuggestions userId={user.id} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      <AddHabitButton userId={user.id} />
    </main>
  )
}
