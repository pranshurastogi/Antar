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
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-background via-indigo-50/20 to-purple-50/20 dark:from-background dark:via-indigo-950/10 dark:to-purple-950/10 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-28 md:pb-32">
      <DashboardHeader user={user} />

      <div className="mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        {/* Greeting */}
        <DashboardGreeting userId={user.id} />

        {/* XP Bar */}
        <XPBar userId={user.id} />

        {/* Stats Bar */}
        <DashboardStats userId={user.id} />

        {/* Today's Habits */}
        <section>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Today's Habits
          </h2>
          <HabitList userId={user.id} />
        </section>

        {/* Pet Widget & Streak Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <PetWidget userId={user.id} />
          <StreakCalendar userId={user.id} months={3} />
        </div>
      </div>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <AddHabitButton userId={user.id} />
      </div>
    </main>
  )
}
