// Modular login logic with comprehensive error handling
import { createClient } from '@/lib/supabase/client'

export interface LoginData {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  error?: string
  userId?: string
}

/**
 * Log in an existing user
 */
export async function loginUser(data: LoginData): Promise<LoginResult> {
  const supabase = createClient()

  try {
    // Security: Don't log sensitive data like email addresses
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (loginError) {
      console.error('Login error:', loginError)
      
      // Provide user-friendly error messages
      if (loginError.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password',
        }
      }
      
      if (loginError.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address before logging in',
        }
      }

      return {
        success: false,
        error: loginError.message || 'Failed to log in',
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No user data returned from login',
      }
    }

    // Login successful - user ID is logged for debugging but not exposed to client

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile check error:', profileError)
      // Continue anyway - they might need to complete onboarding
    }

    if (!profile) {
      console.warn('No profile found for user - they may need to complete onboarding')
    }

    return {
      success: true,
      userId: authData.user.id,
    }
  } catch (error) {
    console.error('Unexpected login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Validate login form data
 */
export function validateLoginData(email: string, password: string): { valid: boolean; error?: string } {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  if (!password) {
    return { valid: false, error: 'Please enter your password' }
  }

  return { valid: true }
}

