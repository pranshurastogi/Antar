import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single()

    // If no profile or no username, redirect to onboarding
    if (!profile || !profile.username) {
      redirect("/auth/onboarding")
    } else {
      redirect("/dashboard")
    }
  } else {
    redirect("/auth/login")
  }
}

