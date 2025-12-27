"use client"

import { createClient } from "@/lib/supabase/client"
import type { AuthError } from "@supabase/supabase-js"

export interface SignUpData {
  email: string
  password: string
  username?: string
  full_name?: string
}

export interface SignUpResult {
  success: boolean
  error?: string
  needsEmailVerification?: boolean
}

/**
 * Sign up a new user with email and password
 * The database trigger will automatically create the profile
 */
export async function signUpUser(data: SignUpData): Promise<SignUpResult> {
  const supabase = createClient()

  try {
    // Security: Don't log sensitive user data
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/onboarding`,
        data: {
          username: data.username || data.email.split("@")[0],
          full_name: data.full_name || data.email.split("@")[0],
        },
      },
    })

    if (signUpError) {
      console.error("Auth signup error:", signUpError)
      return {
        success: false,
        error: getReadableErrorMessage(signUpError),
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account. Please try again.",
      }
    }

    // Check if email verification is required
    if (authData.user && !authData.session) {
      return {
        success: true,
        needsEmailVerification: true,
      }
    }
    return {
      success: true,
      needsEmailVerification: false,
    }
  } catch (error) {
    console.error("Unexpected signup error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during sign up",
    }
  }
}

/**
 * Convert Supabase auth errors to user-friendly messages
 */
function getReadableErrorMessage(error: AuthError): string {
  const message = error.message.toLowerCase()

  if (message.includes("user already registered")) {
    return "This email is already registered. Please sign in instead."
  }

  if (message.includes("password")) {
    if (message.includes("short")) {
      return "Password must be at least 6 characters long."
    }
    if (message.includes("weak")) {
      return "Please choose a stronger password."
    }
    return "Invalid password. Please check and try again."
  }

  if (message.includes("email")) {
    if (message.includes("invalid")) {
      return "Please enter a valid email address."
    }
    return "Email error. Please check your email and try again."
  }

  if (message.includes("database error")) {
    return "Server error during signup. Please try again in a moment. If the problem persists, contact support."
  }

  if (message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again."
  }

  // Return original message if we can't make it more readable
  return error.message
}

/**
 * Validate signup form data
 */
export function validateSignUpData(
  email: string,
  password: string,
  repeatPassword: string
): { valid: boolean; error?: string } {
  if (!email || !email.includes("@")) {
    return { valid: false, error: "Please enter a valid email address" }
  }

  if (!password) {
    return { valid: false, error: "Please enter a password" }
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long" }
  }

  if (password !== repeatPassword) {
    return { valid: false, error: "Passwords do not match" }
  }

  return { valid: true }
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single()

    if (error && error.code === "PGRST116") {
      // No rows returned - username is available
      return true
    }

    // Username exists
    return false
  } catch (error) {
    console.error("Error checking username:", error)
    return false
  }
}
