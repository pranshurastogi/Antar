import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HabitDetailView } from "@/components/habits/habit-detail-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { MobileNav } from "@/components/mobile-nav"

export default async function HabitDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { edit?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Verify the habit exists and belongs to the user
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('id, user_id, name')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  // If habit doesn't exist or doesn't belong to user, redirect to dashboard
  // (The client component will show a nice error message, but we can also handle it server-side)
  if (habitError || !habit) {
    // Still render the page - let the client component handle the error gracefully
    // This allows for better UX with loading states
  }

  const isEditMode = searchParams.edit === "true"

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-28 md:pb-32">
      <DashboardHeader user={user} />
      
      <div className="mt-6 max-w-4xl mx-auto w-full">
        <HabitDetailView habitId={params.id} userId={user.id} isEditMode={isEditMode} />
      </div>

      <MobileNav />
    </main>
  )
}

