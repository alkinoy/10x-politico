/**
 * Authentication Error Utilities
 * Maps Supabase auth errors to user-friendly messages
 */

/**
 * Maps Supabase auth error messages to user-friendly messages
 */
export function mapAuthError(error: string): string {
  const errorLower = error.toLowerCase();

  // Invalid credentials
  if (errorLower.includes("invalid login credentials") || errorLower.includes("invalid email or password")) {
    return "Invalid email or password. Please try again.";
  }

  // Email already exists
  if (
    errorLower.includes("user already registered") ||
    errorLower.includes("email already exists") ||
    errorLower.includes("already been registered")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  // Weak password
  if (
    errorLower.includes("password") &&
    (errorLower.includes("weak") || errorLower.includes("short") || errorLower.includes("at least"))
  ) {
    return "Password must be at least 6 characters long.";
  }

  // Invalid email format
  if (errorLower.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  // Rate limiting
  if (errorLower.includes("rate limit") || errorLower.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  // Email confirmation required
  if (errorLower.includes("email not confirmed") || errorLower.includes("confirm your email")) {
    return "Please check your email and confirm your account before signing in.";
  }

  // Network errors
  if (errorLower.includes("network") || errorLower.includes("fetch") || errorLower.includes("connection")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  // Default to original message or generic error
  if (error && error.length > 0) {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}
