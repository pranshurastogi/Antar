"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import Image from "next/image"

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'auto'>('auto')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      const profileData = {
        id: user.id,
        username,
        full_name: fullName || null,
        timezone: timezone || 'UTC',
        theme_preference: themePreference || 'light',
        updated_at: new Date().toISOString(),
      }

      // If profile doesn't exist, include all defaults
      if (!existingProfile) {
        Object.assign(profileData, {
          avatar_url: null,
          notification_enabled: true,
          streak_freeze_count: 3,
          total_xp: 0,
          current_level: 1,
          pet_type: 'seed',
          pet_growth_stage: 0,
        })
      }

      // Upsert profile (create or update)
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
        })

      if (error) {
        console.error('Profile error:', error)
        throw error
      }

      toast.success('Welcome to Antar! 🎉')
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Image
              src="/logo-antar.png"
              alt="Antar Logo"
              width={100}
              height={100}
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
              priority
            />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Antar 🌱
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Let's set up your journey to better habits
          </p>
        </motion.div>

        <Progress value={progress} className="mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Tell us about yourself'}
                  {step === 2 && 'Customize your experience'}
                  {step === 3 && 'Your Philosophy'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && 'This helps personalize your experience'}
                  {step === 2 && 'Set your preferences'}
                  {step === 3 && 'Understanding your journey'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => {
                          const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 30)
                          setUsername(sanitized)
                        }}
                        maxLength={30}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Theme Preference</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => setThemePreference(theme as any)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              themePreference === theme
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="capitalize">{theme}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg">
                      <div className="text-6xl mb-4">🌱</div>
                      <h3 className="text-xl font-bold mb-2">The Antar Philosophy</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Antar is Sanskrit for "within" or "inner". This app is not just about tracking habits—it's about discovering yourself through consistent practice. Every habit is a mirror reflecting your commitment to growth.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>✨ Start small, stay consistent</p>
                      <p>🔥 Build streaks, build character</p>
                      <p>📈 Track progress, gain insights</p>
                      <p>🌳 Grow your inner garden</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={step === 1 && (!username || !fullName)}
                  >
                    {step === 3 ? 'Start Your Journey' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

