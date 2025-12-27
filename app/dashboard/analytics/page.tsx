import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-28 md:pb-32">
      <DashboardHeader user={user} />
      
      <div className="mt-6 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Track your progress and discover insights about your habits
          </p>
        </div>

        <AnalyticsDashboard userId={user.id} />
      </div>
    </main>
  )
}

