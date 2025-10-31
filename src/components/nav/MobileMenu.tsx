/**
 * MobileMenu Component
 *
 * Interactive mobile navigation menu with hamburger button and slide-out drawer.
 * Handles open/close state, backdrop clicks, and escape key for accessibility.
 * Shows different navigation items based on authentication state.
 */

import { useState, useEffect } from "react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  userName?: string | null;
  currentPath: string;
  isLoading?: boolean;
  onSignOut?: () => void;
  isSigningOut?: boolean;
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

export default function MobileMenu({
  isAuthenticated,
  userName,
  currentPath,
  isLoading = false,
  onSignOut,
  isSigningOut = false,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Handle escape key and prevent body scroll when menu is open
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {/* Hamburger Icon */}
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`fixed right-0 top-0 z-50 h-full w-4/5 max-w-sm transform bg-background shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <span className="text-lg font-bold text-foreground">Menu</span>
            <button
              onClick={closeMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Mobile navigation">
            <div className="flex flex-col space-y-1">
              <a
                href="/"
                onClick={closeMenu}
                className={`rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted ${
                  isLinkActive("/", currentPath)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isLinkActive("/", currentPath) ? "page" : undefined}
              >
                Recent Statements
              </a>

              <a
                href="/politicians"
                onClick={closeMenu}
                className={`rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted ${
                  isLinkActive("/politicians", currentPath)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isLinkActive("/politicians", currentPath) ? "page" : undefined}
              >
                Politicians
              </a>

              {!isLoading && isAuthenticated && (
                <>
                  <a
                    href="/statements/new"
                    onClick={closeMenu}
                    className={`rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted ${
                      isLinkActive("/statements/new", currentPath)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={isLinkActive("/statements/new", currentPath) ? "page" : undefined}
                  >
                    Submit Statement
                  </a>

                  {/* Divider */}
                  <div className="my-2 border-t" />

                  <a
                    href="/profile"
                    onClick={closeMenu}
                    className={`rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted ${
                      isLinkActive("/profile", currentPath)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={isLinkActive("/profile", currentPath) ? "page" : undefined}
                  >
                    {userName || "Profile"}
                  </a>

                  <button
                    onClick={onSignOut}
                    disabled={isSigningOut}
                    className="w-full rounded-md px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              )}

              {!isLoading && !isAuthenticated && (
                <>
                  <div className="my-2 border-t" />
                  <a
                    href="/auth"
                    onClick={closeMenu}
                    className="rounded-md bg-primary px-3 py-3 text-center text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign In
                  </a>
                </>
              )}

              {isLoading && (
                <>
                  <div className="my-2 border-t" />
                  <div className="px-3 py-3">
                    <div className="h-8 w-full animate-pulse rounded bg-muted" />
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
