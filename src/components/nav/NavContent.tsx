/**
 * NavContent Component
 *
 * Main navigation content with client-side authentication state.
 * Handles both desktop and mobile navigation layouts.
 */

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import MobileMenu from "./MobileMenu";

interface NavContentProps {
  currentPath: string;
}

/**
 * Helper function to determine if a link is active
 */
function isLinkActive(href: string, current: string): boolean {
  if (href === "/") {
    return current === "/";
  }
  return current.startsWith(href);
}

export default function NavContent({ currentPath }: NavContentProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthenticated(!!session?.user);
      setUserName(session?.user?.user_metadata?.display_name || null);
      setIsLoading(false);
    };

    checkAuth();

    // Subscribe to auth changes
    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserName(session?.user?.user_metadata?.display_name || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      // Redirect to home page after sign-out
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
      // Still redirect even on error
      window.location.href = "/";
    }
  };

  return (
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      {/* Logo/Brand */}
      <div className="flex items-center">
        <a href="/" className="text-xl font-bold text-foreground transition-colors hover:text-primary">
          SpeechKarma
        </a>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
        <a
          href="/"
          className={`text-sm font-medium transition-colors hover:text-foreground ${
            isLinkActive("/", currentPath) ? "text-foreground" : "text-muted-foreground"
          }`}
          aria-current={isLinkActive("/", currentPath) ? "page" : undefined}
        >
          Recent Statements
        </a>
        <a
          href="/politicians"
          className={`text-sm font-medium transition-colors hover:text-foreground ${
            isLinkActive("/politicians", currentPath) ? "text-foreground" : "text-muted-foreground"
          }`}
          aria-current={isLinkActive("/politicians", currentPath) ? "page" : undefined}
        >
          Politicians
        </a>

        {!isLoading && isAuthenticated && (
          <a
            href="/statements/new"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              isLinkActive("/statements/new", currentPath) ? "text-foreground" : "text-muted-foreground"
            }`}
            aria-current={isLinkActive("/statements/new", currentPath) ? "page" : undefined}
          >
            Submit Statement
          </a>
        )}
      </nav>

      {/* Desktop Auth Section */}
      <div className="hidden items-center gap-4 md:flex">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : isAuthenticated ? (
          <>
            <a
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isLinkActive("/profile", currentPath) ? "text-foreground" : "text-muted-foreground"
              }`}
              aria-current={isLinkActive("/profile", currentPath) ? "page" : undefined}
            >
              {userName || "Profile"}
            </a>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <a
            href="/auth"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </a>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <MobileMenu
          isAuthenticated={isAuthenticated}
          userName={userName}
          currentPath={currentPath}
          isLoading={isLoading}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </div>
  );
}
