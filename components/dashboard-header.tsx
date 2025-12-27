"use client"

import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Trophy, BookTemplate, Home } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { BackButton } from "@/components/ui/back-button"

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0]
  const isDashboard = pathname === "/dashboard"
  const showBackButton = !isDashboard

  return (
    <header className="flex items-center justify-between pb-4 md:pb-6 border-b border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-white/90 via-blue-50/60 to-purple-50/60 dark:from-slate-950/90 dark:via-blue-950/40 dark:to-purple-950/40 backdrop-blur-md sticky top-0 z-50 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8 pt-2 shadow-sm">
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        {showBackButton && (
          <BackButton className="mr-2" />
        )}
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Image
              src="/logo-antar.png"
              alt="Antar Logo"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
              priority
            />
          </motion.div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
            Antar
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link href="/dashboard">
            <Button 
              variant={pathname === "/dashboard" ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm font-medium"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button 
              variant={pathname === "/dashboard/analytics" ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/dashboard/achievements">
            <Button 
              variant={pathname === "/dashboard/achievements" ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm font-medium"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button 
              variant={pathname === "/dashboard/templates" ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm font-medium"
            >
              <BookTemplate className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
        </nav>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName || ""} />
              <AvatarFallback>{displayName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
