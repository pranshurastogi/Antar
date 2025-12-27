"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-pink-50 via-blue-50 via-purple-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Image
              src="/logo-antar.png"
              alt="Antar Logo"
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
              priority
            />
          </motion.div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Thank you for signing up!</CardTitle>
              <CardDescription className="text-center">Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
