/**
 * SignOutButton Component
 *
 * Button to sign out the current user and clear their session.
 * Uses Supabase client for authentication.
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseClientAnon } from "@/db/client";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function SignOutButton({ variant = "outline", size = "default", className }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClientAnon();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      // Redirect to home page after successful sign out
      window.location.href = "/";
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out. Please try again.");
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleSignOut}
        disabled={isLoading}
        aria-busy={isLoading}
        className={className}
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
