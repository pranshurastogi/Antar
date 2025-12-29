"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { loginUser, validateLoginData } from "@/lib/auth/login"
import { sendPasswordResetEmail, validateEmail } from "@/lib/auth/forgot-password"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import { motion } from "framer-motion"
import "@/components/habits/notebook-theme.css"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form data
    const validation = validateLoginData(email, password)
    if (!validation.valid) {
      setError(validation.error || 'Invalid form data')
      setIsLoading(false)
      return
    }

    try {
      // Use modular login function
      const result = await loginUser({ email, password })

      if (!result.success) {
        setError(result.error || 'Failed to log in')
        setIsLoading(false)
        return
      }

      // Success!
      toast.success('Logged in successfully!')
      router.push("/")
    } catch (error: unknown) {
      console.error('Unexpected login error:', error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)
    setResetSuccess(false)

    const validation = validateEmail(resetEmail)
    if (!validation.valid) {
      setResetError(validation.error || 'Invalid email')
      setResetLoading(false)
      return
    }

    try {
      const result = await sendPasswordResetEmail(resetEmail)
      if (!result.success) {
        setResetError(result.error || 'Failed to send reset email')
      } else {
        setResetSuccess(true)
        toast.success(result.message || 'Password reset email sent!')
        setTimeout(() => {
          setForgotPasswordOpen(false)
          setResetEmail("")
          setResetSuccess(false)
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('Unexpected password reset error:', error)
      setResetError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10 notebook-container relative">
      {/* Background decorations */}
      <div className="scribble-decoration scribble-1" style={{ top: '10%', right: '5%' }} />
      <div className="scribble-decoration scribble-2" style={{ bottom: '15%', left: '5%' }} />
      
      {/* Motivational illustration */}
      <div className="absolute top-10 left-10 hidden lg:block opacity-20 dark:opacity-10">
        <div className="text-6xl transform -rotate-12">🌱</div>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block opacity-20 dark:opacity-10">
        <div className="text-6xl transform rotate-12">✨</div>
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
            <div className="sticker blue" style={{ top: '-10px', right: '20px' }}>
              Welcome!
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
              Welcome Back!
            </motion.h1>
            <p className="handwritten-text text-sm sm:text-base text-muted-foreground text-center mt-1">
              Continue your journey to better habits 🌟
            </p>
          </motion.div>
          
          <Card className="notebook-container bg-white/95 dark:bg-slate-900/95 border-2 border-[#26547C]/30 dark:border-[#60A5FA]/30 shadow-xl">
            <div className="sticker teal" style={{ top: '10px', right: '10px' }}>
              📝 Login
            </div>
            <CardHeader className="border-b-2 border-[#26547C]/20 dark:border-[#60A5FA]/20">
              <CardTitle className="handwritten-title text-2xl sm:text-3xl text-center text-[#26547C] dark:text-[#60A5FA]">
                Login
              </CardTitle>
              <CardDescription className="handwritten-text text-center mt-2">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin}>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="handwritten-label text-sm sm:text-base">
                        Password
                      </Label>
                      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="handwritten-text text-xs sm:text-sm text-[#26547C] dark:text-[#60A5FA] hover:underline"
                          >
                            Forgot password?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="notebook-container bg-white dark:bg-slate-900 border-2 border-[#26547C]/30">
                          <DialogHeader>
                            <DialogTitle className="handwritten-title text-xl sm:text-2xl text-[#26547C] dark:text-[#60A5FA]">
                              Reset Password
                            </DialogTitle>
                            <DialogDescription className="handwritten-text">
                              Enter your email and we&apos;ll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="reset-email" className="handwritten-label">
                                Email
                              </Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="bg-white dark:bg-slate-800"
                              />
                            </div>
                            {resetError && (
                              <Alert variant="destructive" className="bg-[#EF476F]/10 border-[#EF476F]">
                                <FontAwesomeIcon icon={Icons.circleExclamation} className="h-4 w-4" />
                                <AlertDescription className="handwritten-text">{resetError}</AlertDescription>
                              </Alert>
                            )}
                            {resetSuccess && (
                              <Alert className="bg-[#06D6A0]/10 border-[#06D6A0]">
                                <FontAwesomeIcon icon={Icons.circleCheck} className="h-4 w-4" />
                                <AlertDescription className="handwritten-text">
                                  Password reset email sent! Check your inbox.
                                </AlertDescription>
                              </Alert>
                            )}
                            <Button type="submit" className="w-full" disabled={resetLoading}>
                              {resetLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    className="w-full bg-[#26547C] hover:bg-[#26547C]/90 dark:bg-[#60A5FA] dark:hover:bg-[#60A5FA]/90 text-white font-semibold py-6 text-base sm:text-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={Icons.arrowRight} className="h-4 w-4" />
                        Login
                      </span>
                    )}
                  </Button>
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="handwritten-text text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="text-[#26547C] dark:text-[#60A5FA] font-semibold hover:underline">
                      Sign up
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
