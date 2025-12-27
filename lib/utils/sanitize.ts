/**
 * Security utilities for input sanitization
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove script tags and event handlers
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous characters
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .trim()
  
  return sanitized
}

/**
 * Sanitize text for display (allows basic formatting but removes scripts)
 */
export function sanitizeText(input: string, maxLength?: number): string {
  let sanitized = sanitizeInput(input)
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }
  
  // Basic email validation and sanitization
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(trimmed)) {
    return ''
  }
  
  return trimmed
}

/**
 * Sanitize username (alphanumeric, underscore, hyphen only)
 */
export function sanitizeUsername(username: string): string {
  if (typeof username !== 'string') {
    return ''
  }
  
  // Only allow alphanumeric, underscore, and hyphen
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 30) // Max length
}

