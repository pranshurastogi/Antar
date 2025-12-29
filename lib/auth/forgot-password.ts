// Forgot password functionality
import { createClient } from '@/lib/supabase/client'

export interface ForgotPasswordResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<ForgotPasswordResult> {
  const supabase = createClient()

  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      
      // Provide user-friendly error messages
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Too many attempts. Please wait a moment and try again.',
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to send reset email',
      }
    }

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    }
  } catch (error) {
    console.error('Unexpected password reset error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Validate email for password reset
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

