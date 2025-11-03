# Authentication Documentation

## Overview

This document describes the authentication implementation in the SpeechKarma application.

## Client-Side Sign Out (Primary Method)

The application uses **client-side sign-out** to ensure proper cleanup of browser session storage.

**Implementation Location:** `src/components/nav/NavContent.tsx`

**How it works:**
1. User clicks "Sign Out" button in desktop or mobile navigation
2. `handleSignOut` function is called
3. Creates a Supabase browser client
4. Calls `supabase.auth.signOut()` which:
   - Invalidates the session on the server
   - Clears localStorage (where Supabase stores the session)
   - Triggers `onAuthStateChange` listeners
5. Redirects to home page (`/`)

**Key Features:**
- Properly clears browser localStorage
- UI updates immediately via auth state listeners
- Handles errors gracefully
- Shows "Signing out..." loading state
- Button is disabled during sign-out to prevent duplicate requests

**Code Example:**

```tsx
const handleSignOut = async () => {
  try {
    setIsSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  } catch (error) {
    console.error("Error signing out:", error);
    setIsSigningOut(false);
    window.location.href = "/";
  }
};

// Usage in component
<button
  onClick={handleSignOut}
  disabled={isSigningOut}
  className="..."
>
  {isSigningOut ? "Signing out..." : "Sign Out"}
</button>
```

## API Endpoint (Backup/Alternative Method)

A server-side sign-out endpoint is also available but not currently used by the UI.

**Endpoint:** `POST /api/auth/signout`

**Authentication:** Not required

**Success Response:**
- **Status Code:** `303 See Other`
- **Headers:** `Location: /`
- **Description:** User is signed out and redirected to the home page

**Note:** This endpoint clears server-side cookies but does not clear browser localStorage, which is why the client-side method is preferred.

## Why Client-Side Sign Out?

Supabase stores the user session in browser localStorage by default. Server-side sign-out can clear cookies and invalidate the session on the server, but the browser's localStorage remains populated. This causes the UI to still show the user as authenticated until the page is manually reloaded and the stale localStorage data is detected as invalid.

Client-side sign-out solves this by:
1. Directly clearing the localStorage via Supabase's client library
2. Triggering auth state change listeners immediately
3. Ensuring the UI updates reflect the sign-out instantly

**Security Considerations:**
- Client-side sign-out properly invalidates the session on both client and server
- The approach is recommended by Supabase for browser-based applications
- Errors are handled gracefully with automatic redirect to home page
- No sensitive data is exposed in the process

## Testing

### Client-Side Sign Out
Manual testing:
1. Sign in to the application
2. Click "Sign Out" in the navigation menu (desktop or mobile)
3. Verify the UI immediately updates to show "Sign In" button
4. Verify you're redirected to the home page
5. Verify localStorage is cleared (check in browser DevTools)

### API Endpoint Tests
The sign-out API endpoint includes comprehensive tests covering:
- Successful sign-out flow
- Cookie cleanup verification
- Error handling when Supabase sign-out fails
- Graceful handling of unexpected errors

Run tests with:
```bash
npm test -- src/pages/api/auth/signout.test.ts
```

## Related Files

- **Primary Implementation:** `src/components/nav/NavContent.tsx` (client-side sign-out handler)
- **Mobile Navigation:** `src/components/nav/MobileMenu.tsx` (uses sign-out handler via props)
- **API Endpoint (Backup):** `src/pages/api/auth/signout.ts`
- **API Tests:** `src/pages/api/auth/signout.test.ts`
- **Supabase Browser Client:** `src/lib/supabase-browser.ts`

