"use client"

import { usePathname, useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { href: "/dashboard", icon: Icons.home, label: "Home" },
  { href: "/dashboard/analytics", icon: Icons.chartLine, label: "Analytics" },
  { href: "/dashboard/achievements", icon: Icons.trophy, label: "Achievements" },
  { href: "/dashboard/leaderboard", icon: Icons.crown, label: "Leaderboard" },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 via-blue-50/80 to-purple-50/80 dark:from-slate-950/95 dark:via-blue-950/60 dark:to-purple-950/60 backdrop-blur-xl border-t border-blue-200/50 dark:border-blue-800/50 shadow-2xl md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative",
                isActive && "text-blue-600 dark:text-blue-400"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-b-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <FontAwesomeIcon 
                icon={item.icon} 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

