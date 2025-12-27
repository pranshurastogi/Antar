"use client"

import Link from "next/link"
import { Heart, Mail, ExternalLink, Sparkles, Github, Twitter } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-white/80 via-blue-50/40 to-purple-50/40 dark:from-slate-950/80 dark:via-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Antar
              </h3>
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Build better habits, discover your inner self. Every small step forward is progress.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Made with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              </motion.span>
              <span>by</span>
              <Link
                href="https://pranshurastogi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Pranshu Rastogi
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/dashboard/achievements" className="text-muted-foreground hover:text-foreground transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/dashboard/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Feedback */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Get in Touch</h4>
            <p className="text-sm text-muted-foreground">
              Have feedback or suggestions? We'd love to hear from you!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-300/50 dark:border-blue-700/50 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50"
              >
                <a
                  href={`mailto:pranshurastog3196@gmail.com?subject=Antar App Feedback&body=Hi Pranshu,%0D%0A%0D%0AI wanted to share some feedback about Antar:%0D%0A%0D%0A`}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Feedback</span>
                </a>
              </Button>
            </motion.div>
            <div className="flex items-center gap-3 pt-2">
              <motion.a
                href="https://pranshurastogi.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/30 hover:bg-blue-200/50 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-blue-200/30 dark:border-blue-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Antar</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://pranshurastogi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>pranshurastogi.com</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

