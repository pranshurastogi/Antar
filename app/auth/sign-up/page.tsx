"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { signUpUser, validateSignUpData } from "@/lib/auth/signup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import Image from "next/image"
import { motion } from "framer-motion"
import "@/components/habits/notebook-theme.css"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form data
    const validation = validateSignUpData(email, password, repeatPassword)
    if (!validation.valid) {
      setError(validation.error || 'Invalid form data')
      setIsLoading(false)
      return
    }

    try {
      // Use modular signup function
      const result = await signUpUser({ email, password })

      if (!result.success) {
        setError(result.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Success!
      if (result.needsEmailVerification) {
        toast.success('Account created! Please check your email to verify.')
      } else {
        toast.success('Account created successfully!')
      }
      
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.error('Unexpected sign up error:', error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10 notebook-container relative">
      {/* Background decorations */}
      <div className="scribble-decoration scribble-1" style={{ top: '10%', right: '5%' }} />
      <div className="scribble-decoration scribble-2" style={{ bottom: '15%', left: '5%' }} />
      
      {/* Motivational illustrations */}
      <div className="absolute top-10 left-10 hidden lg:block opacity-20 dark:opacity-10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl transform -rotate-12"
        >
          🌱
        </motion.div>
      </div>
      <div className="absolute top-20 right-20 hidden lg:block opacity-20 dark:opacity-10">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          📝
        </motion.div>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block opacity-20 dark:opacity-10">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-6xl transform rotate-12"
        >
          ✨
        </motion.div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Logo with sticker */}
          <motion.div
            className="flex flex-col items-center mb-2 sm:mb-4 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticker pink" style={{ top: '-10px', right: '20px' }}>
              Start Here!
            </div>
            <Image
              src="/logo-antar.png"
              alt="Antar Logo"
              width={100}
              height={100}
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
              priority
            />
            <motion.h1
              className="handwritten-title text-3xl sm:text-4xl text-[#26547C] dark:text-[#60A5FA] mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Start Your Journey!
            </motion.h1>
            <p className="handwritten-text text-sm sm:text-base text-muted-foreground text-center mt-1">
              Create your account and begin building better habits 🚀
            </p>
          </motion.div>
          
          <Card className="notebook-container bg-white/95 dark:bg-slate-900/95 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl">
            <div className="sticker teal" style={{ top: '10px', right: '10px' }}>
              ✍️ Sign Up
            </div>
            <CardHeader className="border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <CardTitle className="handwritten-title text-2xl sm:text-3xl text-center text-[#26547C] dark:text-[#60A5FA]">
                Sign up
              </CardTitle>
              <CardDescription className="handwritten-text text-center mt-2">
                Create a new account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="handwritten-label text-sm sm:text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30 focus:border-[#26547C] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="handwritten-label text-sm sm:text-base">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30 focus:border-[#26547C] dark:focus:border-[#60A5FA]"
                    />
                    <p className="handwritten-text text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="handwritten-label text-sm sm:text-base">
                      Repeat Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-[#26547C]/30 dark:border-[#60A5FA]/30 focus:border-[#26547C] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-[#EF476F]/10 border-[#EF476F]">
                      <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
                      <AlertDescription className="handwritten-text">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#06D6A0] hover:bg-[#06D6A0]/90 dark:bg-[#34D399] dark:hover:bg-[#34D399]/90 text-white font-semibold py-6 text-base sm:text-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Creating an account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.userPlus} className="h-4 w-4" />
                        Sign up
                      </span>
                    )}
                  </Button>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="handwritten-text text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-[#26547C] dark:text-[#60A5FA] font-semibold hover:underline">
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
