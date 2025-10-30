# Navigation Menu Implementation Plan

## 1. Overview

The Navigation Menu is a global component that appears on all pages of SpeechKarma, providing primary navigation and authentication status/controls. It enables users to quickly access key sections of the application (Recent Statements, Politicians Directory, Submit Statement) and manage their authentication state (Sign In, Sign Out, Profile). The menu adapts its content based on authentication status, showing appropriate options for authenticated vs. anonymous users. It provides consistent navigation patterns across the entire application and maintains visual hierarchy while being responsive across all device sizes.

This component fulfills multiple user stories by providing easy access to core features: US-001 (Browse recent statements), US-002 (View politician directory), US-004 (Sign up/Sign in), and US-005 (Add a statement).

## 2. Component Location

**Path:** `src/components/Header.astro` (main navigation component)  
**Sub-components:** `src/components/nav/` directory

**Integration Point:** `src/layouts/Layout.astro`

**Authentication Required:** No (public component, adapts based on auth state)

**Access Level:** Public (all users, authenticated and anonymous)

## 3. Component Structure

The Navigation Menu follows a header/navigation pattern with the following component hierarchy:

```
Layout (Astro layout) - Modified
├── Header (Astro component) - New
│   ├── Logo/Brand Link
│   ├── Desktop Navigation
│   │   ├── NavLink (Home)
│   │   ├── NavLink (Politicians)
│   │   └── AuthSection
│   │       ├── NavLink (New Statement) [authenticated only]
│   │       ├── NavLink (Profile) [authenticated only]
│   │       ├── SignOutButton [authenticated only]
│   │       └── NavLink (Sign In) [unauthenticated only]
│   └── Mobile Navigation
│       ├── MobileMenuButton
│       └── MobileMenu (React component for interactivity)
│           ├── NavLink (Home)
│           ├── NavLink (Politicians)
│           ├── NavLink (New Statement) [authenticated only]
│           ├── NavLink (Profile) [authenticated only]
│           ├── SignOutButton [authenticated only]
│           └── NavLink (Sign In) [unauthenticated only]
├── Main Content
└── Footer
```

## 4. Component Details

### Header (Astro Component)

**Component description:**  
The main navigation header component that wraps all navigation elements. This is a server-side rendered Astro component that checks authentication status and passes it to child components. It provides both desktop and mobile navigation layouts.

**Main elements:**
- `<header>` semantic element with fixed or sticky positioning
- Logo/brand link to home page
- Desktop navigation (visible on larger screens)
- Mobile menu button and drawer (visible on mobile/tablet)
- Conditional authentication state handling

**Handled events:**  
None (server-side component; events handled by React components)

**Handled validation:**  
None (authentication check only)

**Types:**
- User session data from Supabase (null if unauthenticated)

**Props:**  
None (Astro component in layout, no props required)

---

### MobileMenu (React Component)

**Component description:**  
Interactive mobile menu drawer that slides in from the side when the hamburger button is clicked. Handles open/close state, backdrop clicks, and escape key for accessibility.

**Main elements:**
- Mobile menu button (hamburger icon)
- Drawer/panel that slides in
- Backdrop overlay
- Navigation links
- Close button

**Handled events:**
- Menu toggle (open/close)
- Backdrop click (close menu)
- Escape key press (close menu)
- Link click (close menu and navigate)

**Handled validation:**  
None

**Types:**
- `MobileMenuState` (open/closed)
- Navigation items array

**Props:**
```typescript
interface MobileMenuProps {
  isAuthenticated: boolean;
  userName?: string | null;
}
```

---

### NavLink (Component Pattern)

**Component description:**  
Reusable navigation link component that handles active state styling and accessibility. Can be used in both desktop and mobile contexts.

**Main elements:**
- `<a>` element with appropriate href
- Active state styling based on current page
- Icon (optional)
- Label text

**Handled events:**
- Click (standard navigation)

**Handled validation:**  
None

**Types:**
```typescript
interface NavLinkProps {
  href: string;
  label: string;
  icon?: string;
  isActive?: boolean;
  onClick?: () => void; // For mobile menu close
}
```

---

### AuthSection (Astro Component)

**Component description:**  
Container for authentication-related navigation items. Shows different content based on authentication state.

**Main elements:**
- Conditional rendering based on auth state
- Sign In button/link (unauthenticated)
- User menu/profile link (authenticated)
- Sign Out button (authenticated)

**Handled events:**  
Delegated to child components

**Handled validation:**  
None

**Types:**
- User session data

**Props:**
```typescript
interface AuthSectionProps {
  isAuthenticated: boolean;
  userName?: string | null;
}
```

## 5. Types

### View-Specific Types

```typescript
/**
 * MobileMenuState - State for mobile menu drawer
 */
interface MobileMenuState {
  isOpen: boolean;
}

/**
 * NavigationItem - Structure for navigation links
 */
interface NavigationItem {
  href: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean; // Only show when authenticated
  hideWhenAuth?: boolean; // Only show when not authenticated
}

/**
 * UserNavigationData - User data needed for navigation
 */
interface UserNavigationData {
  isAuthenticated: boolean;
  userId?: string | null;
  displayName?: string | null;
}
```

### Navigation Configuration

```typescript
/**
 * Primary navigation items
 */
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/",
    label: "Recent Statements",
    icon: "home"
  },
  {
    href: "/politicians",
    label: "Politicians",
    icon: "users"
  },
  {
    href: "/statements/new",
    label: "Submit Statement",
    icon: "plus",
    requiresAuth: true
  }
];

/**
 * User menu items (authenticated)
 */
const USER_MENU_ITEMS: NavigationItem[] = [
  {
    href: "/profile",
    label: "My Profile",
    icon: "user"
  }
];
```

## 6. State Management

### State Management Strategy

The Navigation Menu uses a hybrid approach:
- **Server-side state:** Authentication status determined in Astro component via Supabase session
- **Client-side state:** Mobile menu open/close state managed in React component

### Primary State: MobileMenu Component

**State Variables:**

1. **`isMenuOpen: boolean`** - Tracks mobile menu open/closed state
   - Default: `false`
   - Updated on toggle button click, backdrop click, or escape key

**State Management Patterns:**

**Server-Side Authentication Check:**
```typescript
// In Header.astro
const { data: { session } } = await supabase.auth.getSession();
const isAuthenticated = !!session?.user;
const userName = session?.user?.user_metadata?.display_name || null;
```

**Client-Side Menu State:**
```typescript
// In MobileMenu.tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);

const toggleMenu = () => setIsMenuOpen(prev => !prev);
const closeMenu = () => setIsMenuOpen(false);

useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeMenu();
  };
  
  if (isMenuOpen) {
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when menu open
    document.body.style.overflow = 'hidden';
  }
  
  return () => {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  };
}, [isMenuOpen]);
```

### State Flow Summary

1. **Page Load:** Astro SSR checks auth → determines nav items to show → renders header
2. **Mobile Menu Toggle:** User clicks hamburger → React state updates → menu slides in
3. **Navigation:** User clicks link → navigation occurs → menu closes (on mobile)
4. **Sign Out:** User clicks sign out → POST to auth API → redirect → auth state changes

## 7. Navigation Items Configuration

### Primary Navigation Links

**Recent Statements (Home)**
- **Route:** `/`
- **Label:** "Recent Statements" or "Home"
- **Icon:** Home icon
- **Visibility:** Always visible
- **Active State:** Current path === "/"

**Politicians Directory**
- **Route:** `/politicians`
- **Label:** "Politicians"
- **Icon:** Users icon
- **Visibility:** Always visible
- **Active State:** Current path starts with "/politicians"

**Submit Statement**
- **Route:** `/statements/new`
- **Label:** "Submit Statement" or "New Statement"
- **Icon:** Plus icon
- **Visibility:** Authenticated users only
- **Active State:** Current path === "/statements/new"

### Authentication Navigation

**When Unauthenticated:**
- **Sign In/Sign Up**
  - **Route:** `/auth`
  - **Label:** "Sign In"
  - **Icon:** User icon
  - **Visibility:** Unauthenticated only
  - **Styling:** Primary button or emphasized link

**When Authenticated:**
- **Profile**
  - **Route:** `/profile`
  - **Label:** "Profile" or display name
  - **Icon:** User icon or avatar
  - **Visibility:** Authenticated only
  - **Active State:** Current path === "/profile"

- **Sign Out**
  - **Action:** POST to `/api/auth/signout`
  - **Label:** "Sign Out"
  - **Icon:** Log out icon
  - **Visibility:** Authenticated only
  - **Behavior:** Button (not link) that triggers sign out

## 8. User Interactions

### Primary Interactions

**1. Navigate to Section**
- **User Action:** User clicks navigation link (e.g., "Politicians")
- **System Response:** Browser navigates to target page
- **UI Feedback:** Link shows active state, page transition occurs

**2. Open Mobile Menu**
- **User Action:** User clicks hamburger menu button (mobile/tablet)
- **System Response:** Mobile menu drawer slides in from right/left
- **UI Feedback:** Backdrop appears, menu animates in, button changes to X icon

**3. Close Mobile Menu - Backdrop Click**
- **User Action:** User clicks backdrop while menu is open
- **System Response:** Menu closes
- **UI Feedback:** Menu slides out, backdrop fades, body scroll restored

**4. Close Mobile Menu - Escape Key**
- **User Action:** User presses Escape key while menu is open
- **System Response:** Menu closes
- **UI Feedback:** Menu slides out, backdrop fades

**5. Close Mobile Menu - Link Click**
- **User Action:** User clicks any navigation link in mobile menu
- **System Response:** Menu closes, navigation begins
- **UI Feedback:** Menu slides out immediately, page navigation starts

**6. Sign Out**
- **User Action:** User clicks "Sign Out" button
- **System Response:** Call sign out API, clear session, redirect to home
- **UI Feedback:** Loading state on button, then redirect

**7. Access Authenticated Route (Unauthenticated)**
- **User Action:** Unauthenticated user tries to access /statements/new
- **System Response:** Redirect to /auth with return URL
- **UI Feedback:** Navigation to auth page with message

### Responsive Behavior

**Desktop (≥ 768px):**
- Full horizontal navigation bar
- All links visible inline
- No hamburger menu
- Hover states on links
- Sign out as button in header

**Mobile/Tablet (< 768px):**
- Hamburger menu button
- Logo remains visible
- Navigation links in drawer
- Full-screen or partial drawer overlay
- Touch-optimized tap targets (≥ 44x44px)

## 9. Conditions and Validation

### Display Conditions

**1. Submit Statement Link Visibility**

**Condition:**
```typescript
function shouldShowSubmitLink(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}
```

**Interface Impact:** Link only appears in navigation when user is authenticated.

---

**2. Profile Link Visibility**

**Condition:**
```typescript
function shouldShowProfileLink(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}
```

**Interface Impact:** Profile link only appears for authenticated users.

---

**3. Sign In Link Visibility**

**Condition:**
```typescript
function shouldShowSignInLink(isAuthenticated: boolean): boolean {
  return !isAuthenticated;
}
```

**Interface Impact:** Sign In link only appears for unauthenticated users.

---

**4. Sign Out Button Visibility**

**Condition:**
```typescript
function shouldShowSignOutButton(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}
```

**Interface Impact:** Sign Out button only appears for authenticated users.

---

**5. Active Link Styling**

**Condition:**
```typescript
function isLinkActive(linkHref: string, currentPath: string): boolean {
  if (linkHref === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(linkHref);
}
```

**Interface Impact:** Active link shows distinct styling (color, underline, background).

---

**6. Mobile Menu Display**

**Condition:**
```typescript
function shouldShowMobileMenu(screenWidth: number): boolean {
  return screenWidth < 768; // Tailwind md breakpoint
}
```

**Interface Impact:** Mobile menu button shown on small screens, desktop nav on large screens.

## 10. Error Handling

### Error Scenarios

**1. Session Check Failure**

**Scenario:** Supabase session check fails during SSR

**Handling:**
- Default to unauthenticated state
- Show sign in link
- Log error for debugging
- Allow navigation to continue

**User Experience:**
- User sees standard unauthenticated nav
- No visual error
- Can still navigate and sign in

---

**2. Sign Out Failure**

**Scenario:** Sign out API call fails

**Handling:**
- Show error toast message
- Keep user on current page
- Retry option available
- Log error details

**User Experience:**
- Error message: "Sign out failed. Please try again."
- Retry button in toast
- User remains signed in

---

**3. Network Error During Navigation**

**Scenario:** Link click during network issues

**Handling:**
- Browser handles standard navigation error
- No special handling needed
- User sees browser error page

**User Experience:**
- Standard browser offline/error page
- Browser back button works

## 11. Accessibility Requirements

### Keyboard Navigation
- All links and buttons keyboard accessible
- Tab order follows visual order
- Focus indicators clearly visible
- Mobile menu focus trap when open

### Screen Reader Support
- Proper ARIA labels on all controls
- `aria-current="page"` on active link
- `aria-expanded` on mobile menu button
- `aria-label` for icon-only buttons
- Landmark roles (`<nav>`, `<header>`)

### Visual Accessibility
- Color contrast ≥ 4.5:1 for text
- Focus indicators ≥ 3:1 contrast
- Touch targets ≥ 44x44px on mobile
- Clear hover/focus states

### Example ARIA Implementation
```html
<button 
  aria-label="Open navigation menu"
  aria-expanded="false"
  aria-controls="mobile-menu"
>
  <svg aria-hidden="true"><!-- icon --></svg>
</button>

<nav id="mobile-menu" aria-label="Primary navigation">
  <a href="/" aria-current="page">Home</a>
  <a href="/politicians">Politicians</a>
</nav>
```

## 12. Implementation Steps

### Phase 1: Basic Header Structure (Estimated: 1-2 hours)

**Step 1: Create Header Component**
- Create `src/components/Header.astro`
- Add semantic `<header>` element
- Setup basic layout structure (logo + nav container)
- Import Supabase client for auth check
- Check session and extract auth state

**Step 2: Integrate Header into Layout**
- Update `src/layouts/Layout.astro`
- Import Header component
- Place Header above main content slot
- Ensure proper semantic structure (`header` → `main` → `footer`)

**Step 3: Add Logo/Brand**
- Add site logo or text branding
- Link to home page (/)
- Style with appropriate size and spacing
- Ensure good contrast and readability

---

### Phase 2: Desktop Navigation (Estimated: 2-3 hours)

**Step 4: Create Desktop Navigation**
- Add `<nav>` element with primary navigation
- Create array of navigation items
- Render links using map/loop
- Apply flexbox layout for horizontal arrangement

**Step 5: Style Navigation Links**
- Apply Tailwind classes for link styling
- Add hover states
- Implement active link detection logic
- Add active state styling (color/underline/background)
- Ensure proper spacing between links

**Step 6: Implement Authentication Section**
- Add conditional rendering based on auth state
- For unauthenticated: Show "Sign In" link
- For authenticated: Show "Profile" link and "Sign Out" button
- Style Sign Out as button rather than link
- Ensure proper alignment and spacing

---

### Phase 3: Mobile Navigation (Estimated: 3-4 hours)

**Step 7: Create Mobile Menu Button**
- Create `src/components/nav/MobileMenuButton.tsx`
- Implement hamburger icon (three lines)
- Add click handler prop
- Style with proper touch target size (44x44px minimum)
- Add ARIA labels and controls attributes

**Step 8: Create Mobile Menu Drawer**
- Create `src/components/nav/MobileMenu.tsx`
- Setup component state for open/closed
- Implement drawer container with slide animation
- Add backdrop overlay
- Create close button (X icon)

**Step 9: Implement Mobile Menu State Management**
- Add open/closed state with useState
- Implement toggle handler
- Add backdrop click handler to close
- Add escape key handler to close
- Prevent body scroll when menu open
- Clean up event listeners on unmount

**Step 10: Add Navigation Items to Mobile Menu**
- Render same navigation items as desktop
- Add click handlers to close menu on navigation
- Style for vertical layout
- Ensure proper spacing and touch targets
- Add dividers between sections if needed

---

### Phase 4: Responsive Behavior (Estimated: 2 hours)

**Step 11: Implement Responsive Breakpoints**
- Hide mobile menu button on desktop (md:hidden)
- Hide desktop nav on mobile (hidden md:flex)
- Test at various breakpoints (mobile, tablet, desktop)
- Adjust spacing and sizes for each breakpoint

**Step 12: Add Transitions and Animations**
- Smooth slide-in animation for mobile menu (transform/translate)
- Fade in/out for backdrop
- Hover transitions for desktop links
- Active state transitions
- Test animation performance

---

### Phase 5: Authentication Integration (Estimated: 1-2 hours)

**Step 13: Implement Auth State Passing**
- Check Supabase session in Header.astro
- Extract user data (ID, display name)
- Pass auth state to components as props
- Handle null/undefined session gracefully

**Step 14: Implement Sign Out Functionality**
- Update SignOutButton component to call sign out
- Handle loading state during sign out
- Redirect to home after successful sign out
- Show error message if sign out fails

**Step 15: Test Auth Flows**
- Test navigation as unauthenticated user
- Test navigation as authenticated user
- Test sign out functionality
- Verify correct links show for each state
- Test auth state changes across page navigations

---

### Phase 6: Polish and Accessibility (Estimated: 2-3 hours)

**Step 16: Implement Accessibility Features**
- Add proper ARIA labels to all interactive elements
- Add aria-current to active links
- Add aria-expanded to mobile menu button
- Implement focus trap in mobile menu
- Test keyboard navigation (Tab, Enter, Escape)
- Verify focus indicators visible

**Step 17: Style Refinement**
- Ensure consistent spacing and sizing
- Verify color contrast ratios (WCAG AA)
- Polish hover and focus states
- Add subtle shadows or borders for depth
- Ensure responsive font sizes

**Step 18: Test Across Devices and Browsers**
- Test on mobile (iOS Safari, Android Chrome)
- Test on tablet (both orientations)
- Test on desktop (Chrome, Firefox, Safari, Edge)
- Test with keyboard only
- Test with screen reader (basic verification)

---

### Phase 7: Testing and Refinement (Estimated: 1-2 hours)

**Step 19: User Flow Testing**
- Test all navigation links work correctly
- Test active states update properly
- Test mobile menu open/close behaviors
- Test sign out flow
- Test authentication state changes

**Step 20: Performance Check**
- Verify no unnecessary re-renders
- Check mobile menu animation smoothness
- Test on slower devices if possible
- Ensure header doesn't block content

**Step 21: Final Polish**
- Add comments to complex logic
- Clean up unused code
- Verify consistent naming conventions
- Update documentation if needed
- Take screenshots for documentation

---

### Estimated Total Time: 12-17 hours

**Note:** Time estimates assume:
- Developer is familiar with Astro and React
- Tailwind CSS is already configured
- Supabase auth is functional
- Design system guidelines are established

**Dependencies:**
- Supabase auth system functional
- Basic layout structure exists
- Tailwind CSS configured
- Icon system decided (Heroicons, Lucide, etc.)

## 13. Visual Design Specifications

### Layout Specifications

**Desktop Header:**
- Height: 64px (4rem)
- Padding: 0 24px (0 1.5rem)
- Background: White (light mode) / Dark (dark mode)
- Border bottom: 1px solid border color
- Position: Sticky top with shadow on scroll

**Mobile Header:**
- Height: 56px (3.5rem)
- Padding: 0 16px (0 1rem)
- Same background and border as desktop

**Mobile Menu Drawer:**
- Width: 80% of screen (max 320px)
- Height: 100vh
- Position: Fixed, right side
- Background: Same as header
- Shadow: Large shadow for depth

### Typography

**Logo/Brand:**
- Font weight: Bold (700)
- Font size: 20px (desktop), 18px (mobile)
- Color: Primary brand color

**Navigation Links:**
- Font weight: Medium (500)
- Font size: 16px (desktop), 18px (mobile)
- Color: Muted foreground (default), Primary (active/hover)

### Color Scheme (using Tailwind/Shadcn)

**Light Mode:**
- Background: `bg-background` (white)
- Border: `border-border` (light gray)
- Link default: `text-muted-foreground`
- Link active: `text-foreground`
- Link hover: `text-foreground`

**Dark Mode:**
- Background: `bg-background` (dark gray)
- Border: `border-border` (dark border)
- Link default: `text-muted-foreground`
- Link active: `text-foreground`
- Link hover: `text-foreground`

### Interactive States

**Desktop Links:**
- Default: Muted foreground color
- Hover: Foreground color, subtle background
- Active: Foreground color, underline or border-bottom
- Focus: Visible focus ring (2px, primary color)

**Mobile Menu Button:**
- Default: Muted foreground
- Hover: Foreground color
- Active: Pressed state (slightly darker)
- Focus: Visible focus ring

**Sign Out Button:**
- Style as secondary button
- Hover: Subtle background change
- Loading: Disabled state with spinner

## 14. Future Enhancements (Post-MVP)

**Advanced Features:**
- User avatar display in navigation
- Dropdown menu for user actions
- Notification badge/indicator
- Search bar in navigation
- Dark mode toggle
- Breadcrumb navigation on sub-pages
- Mega menu for large sections
- Keyboard shortcuts indicator

**Technical Improvements:**
- Preload routes on hover
- Animated transitions between pages
- Progressive enhancement
- Service worker for offline menu
- Analytics tracking on nav interactions

## 15. Testing Checklist

### Functional Testing
- [ ] All links navigate to correct pages
- [ ] Active states update correctly
- [ ] Mobile menu opens and closes
- [ ] Sign out works correctly
- [ ] Auth-only links hidden when not authenticated
- [ ] Auth links hidden when authenticated

### Responsive Testing
- [ ] Mobile layout works (< 768px)
- [ ] Tablet layout works (768px - 1024px)
- [ ] Desktop layout works (> 1024px)
- [ ] Logo and branding visible at all sizes
- [ ] No horizontal scroll at any breakpoint

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces navigation correctly
- [ ] ARIA labels present and correct
- [ ] Color contrast meets WCAG AA
- [ ] Mobile menu focus trap works

### Browser Testing
- [ ] Chrome (desktop and mobile)
- [ ] Firefox
- [ ] Safari (desktop and iOS)
- [ ] Edge
- [ ] Android Chrome

### Performance Testing
- [ ] No layout shift on load
- [ ] Mobile menu animation smooth
- [ ] No unnecessary re-renders
- [ ] Fast sign out response

