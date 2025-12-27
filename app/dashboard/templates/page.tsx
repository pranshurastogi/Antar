import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TemplatesBrowser } from "@/components/templates/templates-browser"
import { DashboardHeader } from "@/components/dashboard-header"
import { MobileNav } from "@/components/mobile-nav"

export default async function TemplatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-pink-50 via-blue-50 via-purple-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-28 md:pb-32">
      <DashboardHeader user={user} />
      
      <div className="mt-6 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Habit Templates
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Start with pre-built routines or create your own custom habits
          </p>
        </div>

        <TemplatesBrowser userId={user.id} />
      </div>

      <MobileNav />
    </main>
  )
}

