# UI Architecture for SpeechKarma

## 1. UI Structure Overview

SpeechKarma is a public archive web application designed to provide transparent access to politician statements. The UI architecture follows a **mobile-first, accessibility-first approach** that supports both anonymous browsing and authenticated contributions.

### Core Architecture Principles

1. **Progressive Disclosure**: Information is revealed progressively through truncation and expansion patterns
2. **Clear Hierarchy**: Visual hierarchy guides users from high-level browsing to detailed exploration
3. **Responsive Design**: Single-column mobile layouts scale to constrained desktop widths (max 1280px)
4. **Accessibility**: WCAG AA compliant with semantic HTML, keyboard navigation, and screen reader support
5. **Performance**: Server-side rendering for initial loads (<2s target), client-side interactivity for dynamic features
6. **Trust & Transparency**: Clear attribution, time context, and user-driven quality mechanisms

### Information Architecture

```
├── Home / Recent Statements (/)
├── Politicians Directory (/politicians)
│   └── Politician Detail (/politicians/:id)
├── Authentication (/auth)
├── Statement Management
│   ├── New Statement (/statements/new)
│   └── Edit Statement (/statements/:id/edit)
├── User Profile (/profile)
└── Legal
    ├── Terms of Use (/terms)
    └── Privacy Policy (/privacy)
```

### Technical Architecture Pattern

- **Astro 5** for SSR pages and routing
- **React 19** for interactive components (forms, modals, dynamic lists)
- **TypeScript 5** for type safety
- **Tailwind 4** for styling with mobile-first approach
- **Shadcn/ui** as component foundation

---

## 2. View List

### 2.1 Home / Recent Statements Feed

**Path**: `/`

**Main Purpose**: Serve as the landing page and primary discovery interface for recent political statements. Allows visitors to quickly scan newest content and access deeper research paths.

**Key Information to Display**:
- Statement cards (paginated, 50 per page default)
  - Politician name (linked to detail page)
  - Political party with badge (color-coded, text label)
  - Statement timestamp (when statement was made)
  - Statement text (truncated to 3-4 lines)
  - Contributor display name
  - Submission timestamp ("Added 2 hours ago")
- Page title and context ("Recent Statements")
- Pagination controls or "Load More" button

**Key View Components**:
- `StatementCard` - Reusable card component for statement display
  - Politician avatar/initials
  - Politician name link
  - Party badge with color accent
  - Statement timestamp
  - Statement text with truncation
  - "Read more" toggle button
  - Report button (discreet, secondary)
  - Edit/Delete buttons (conditional: owner + grace period)
- `PaginationControls` - Navigate between pages
- `EmptyState` - Displayed when no statements exist
- `LoadingState` - Skeleton screens during fetch

**UX Considerations**:
- **Truncation Pattern**: Statement text truncates after 3-4 lines with "Read more" toggle. Clicking expands inline without navigation, preserving context
- **Scannability**: Card design enables quick scanning with clear visual hierarchy (politician name prominent, statement text secondary)
- **Touch Targets**: All interactive elements ≥44x44px for mobile usability
- **Reading Flow**: Left-aligned text, adequate line height (1.5-1.6), comfortable line length

**Accessibility Considerations**:
- Each `StatementCard` wrapped in `<article>` semantic element
- Politician links have descriptive text, not just "View profile"
- "Read more" buttons have aria-expanded state
- Report buttons have aria-label describing action
- Pagination has proper ARIA labels and keyboard navigation
- Loading states use aria-live="polite" regions

**Security Considerations**:
- Statement text rendered with XSS protection (React's built-in escaping)
- Edit/Delete buttons only visible to statement owners
- Grace period validation performed on both client and server

**Data Requirements**:
- GET /api/statements?page={n}&limit=50&sort_by=created_at&order=desc
- Response includes: statement data, politician with party info, contributor profile, pagination metadata

**User Stories Fulfilled**: US-001 (Browse recent statements), US-010 (Statement readability), US-011 (View party)

---

### 2.2 Politicians Directory

**Path**: `/politicians`

**Main Purpose**: Provide browsable and searchable directory of all politicians in the system, enabling users to find specific politicians for timeline research.

**Key Information to Display**:
- Page title ("Politicians Directory")
- Search input with submit button
- Active search query display (if searching)
- Politician cards (paginated)
  - Full name (First Last)
  - Political party badge
  - Biography snippet (truncated to ~150 chars)
  - Statement count indicator
- Results count ("Showing X politicians")
- Pagination controls

**Key View Components**:
- `SearchForm` - Search input with submit button
  - Text input for name search
  - Submit button
  - Clear button (when search active)
- `PoliticianCard` - Card displaying politician summary
  - Politician name (clickable, links to detail)
  - Party badge
  - Biography preview
  - Statement count ("X statements")
- `PaginationControls` - Standard pagination
- `EmptyState` - "No politicians found" with contextual message
- `LoadingState` - Skeleton cards during fetch

**UX Considerations**:
- **Submit-Based Search**: Search triggers on button click or Enter key, updates URL with query parameter (?search=name), allows sharing search results
- **Clear Search**: Easy way to return to full directory
- **Alphabetical Sorting**: Default sort by last name (ascending) provides predictable browsing
- **Card Layout**: Grid on desktop (2-3 columns), single column on mobile

**Accessibility Considerations**:
- Search form has proper `<label>` for input
- Search button has descriptive text ("Search Politicians")
- Each politician card is `<article>` with heading for name
- Party information not reliant on color alone (includes text label)
- Keyboard navigation through cards maintains logical order
- No results state is announced to screen readers

**Security Considerations**:
- Search query sanitized before URL encoding
- No sensitive information displayed in directory view

**Data Requirements**:
- GET /api/politicians?search={query}&sort=last_name&order=asc&page={n}&limit=50
- Response includes: politician data with party info, statement counts, pagination metadata

**User Stories Fulfilled**: US-002 (View politician directory), US-009 (Basic search by politician)

---

### 2.3 Politician Detail Page

**Path**: `/politicians/:id`

**Main Purpose**: Provide comprehensive view of a single politician's profile and complete statement timeline, enabling voters to understand consistency and positions over time.

**Key Information to Display**:
- Politician profile header
  - Full name (prominent heading)
  - Current party badge (larger, color-coded)
  - Biography (full text)
  - Total statement count
- Time range filter controls
  - Options: "Last 7 Days", "Last 30 Days", "Last Year", "All Time"
  - Active filter indicator
- Statement timeline (paginated)
  - Same card format as Recent Statements feed
  - Sorted by statement_timestamp (newest first)
  - Shows when statement was made, not when it was added
- Empty state when no statements in selected time range

**Key View Components**:
- `PoliticianHeader` - Profile information card
  - Politician avatar (larger)
  - Name as `<h1>`
  - Party badge
  - Biography paragraph
  - Statement count badge
- `TimeRangeFilter` - Segmented control / button group
  - Four options: 7d, 30d, 365d, all
  - Visual indicator of active selection
  - Updates URL query parameter (?time_range=30d)
- `StatementCard` - Reusable statement display (same as feed)
- `PaginationControls` - Navigate through timeline
- `EmptyState` - "No statements in this period" with suggestion to expand range
- `LoadingState` - Skeleton for profile and timeline

**UX Considerations**:
- **Single View Layout**: Profile and timeline on same scrollable page keeps context visible
- **Sticky Filter Controls**: Time range filter may be sticky on scroll for easy access (optional enhancement)
- **Filter Persistence**: Time range selection stored in URL for sharing and back-button support
- **Default View**: "All Time" selected by default to show complete history
- **Visual Continuity**: Statement cards identical to feed maintains mental model

**Accessibility Considerations**:
- Profile header uses proper heading hierarchy (`<h1>` for name)
- Time range filter implemented as radio button group or ARIA tabs pattern
- Active filter communicated to screen readers (aria-selected or aria-current)
- Biography uses `<p>` tags, not `<div>`
- Timeline section has descriptive heading ("Statement Timeline")

**Security Considerations**:
- Profile data sanitized (especially biography, which is admin-entered)
- Edit/Delete buttons only shown to statement owners within grace period

**Data Requirements**:
- GET /api/politicians/:id (profile data)
- GET /api/politicians/:id/statements?time_range={7d|30d|365d|all}&page={n}&limit=50
- Response includes: politician with party, statements with creator profiles, can_edit/can_delete flags

**User Stories Fulfilled**: US-003 (View politician's timeline), US-010 (Statement readability), US-011 (View party)

---

### 2.4 Authentication Page

**Path**: `/auth`

**Main Purpose**: Unified entry point for user authentication, supporting both new user registration and existing user sign-in through a single interface.

**Key Information to Display**:
- Page title ("Sign In to SpeechKarma" or "Sign Up for SpeechKarma" based on active tab)
- Tabbed interface with two tabs: "Sign In" and "Sign Up"
- Form fields appropriate to selected tab
- Form validation errors
- Loading state during authentication
- Success/error messages

**Key View Components**:
- `AuthTabs` - Tab switcher component
  - Two tabs: "Sign In" | "Sign Up"
  - Visual indicator of active tab
  - Updates URL hash or state (not navigation)
- `SignInForm` - Sign in form
  - Email input (type="email")
  - Password input (type="password", with show/hide toggle)
  - Submit button ("Sign In")
  - Validation error display
- `SignUpForm` - Sign up form
  - Email input (type="email")
  - Password input (type="password", min 6 chars, with show/hide toggle)
  - Display name input (text, optional)
  - Submit button ("Create Account")
  - Validation error display
- `LoadingSpinner` - Shows during API call
- `AlertMessage` - Success or error feedback

**UX Considerations**:
- **Unified Interface**: Single page reduces navigation complexity
- **Tab Persistence**: Active tab reflected in URL hash (#signin, #signup) for direct linking
- **Password Visibility**: Toggle to show/hide password improves usability and reduces errors
- **Clear CTAs**: Action buttons clearly labeled with expected outcome
- **Redirect Logic**: After successful auth, redirect to:
  - Stored intended destination (if user was redirected to auth), OR
  - Recent Statements feed (default)
- **Error Clarity**: Authentication errors displayed prominently ("Invalid credentials" not "Error 401")

**Accessibility Considerations**:
- Tab interface implemented with proper ARIA roles (tablist, tab, tabpanel)
- Form fields have associated `<label>` elements
- Password visibility toggle is keyboard accessible with aria-label
- Error messages associated with fields via aria-describedby
- Form submission disabled during loading with aria-busy
- Success/error alerts use role="alert" for screen reader announcement

**Security Considerations**:
- Password field uses type="password" (masked by default)
- No password requirements displayed inline to avoid giving attackers hints
- Form submission over HTTPS only
- CSRF protection via Supabase
- No sensitive data in URL
- Clear session management

**Data Requirements**:
- Sign In: POST /auth/v1/token?grant_type=password (Supabase)
- Sign Up: POST /auth/v1/signup (Supabase)
- Responses: JWT tokens stored in httpOnly cookies
- User profile created automatically via database trigger

**User Stories Fulfilled**: US-004 (Sign up / Sign in)

---

### 2.5 New Statement Page

**Path**: `/statements/new`

**Authentication Required**: Yes

**Main Purpose**: Provide dedicated interface for authenticated users to submit new political statements with required metadata.

**Key Information to Display**:
- Page title ("Add New Statement")
- Form with three required fields
- Clear field labels and validation requirements
- Character counter for statement text
- Submit and cancel actions
- Validation errors (inline, per field)
- Loading state during submission

**Key View Components**:
- `StatementForm` - Complete form component
  - `PoliticianSelector` - Searchable dropdown/combobox
    - Search input to filter politicians
    - Dropdown list of results
    - Shows name and party for each option
    - Required field indicator
  - `DateTimePicker` - Date and time input
    - Date picker component
    - Time picker component (or combined datetime)
    - Validation: cannot be in future
    - Required field indicator
  - `StatementTextarea` - Multi-line text input
    - Textarea with min 10, max 5000 characters
    - Character counter display (e.g., "450 / 5000")
    - Auto-resize or fixed height with scroll
    - Required field indicator
  - Submit button ("Submit Statement")
  - Cancel button ("Cancel", returns to previous page)
- `ValidationError` - Inline error messages per field
- `LoadingSpinner` - During submission
- `SuccessMessage` - Confirmation after successful submission

**UX Considerations**:
- **Dedicated Page**: Provides adequate space for complex form without modal constraints
- **Politician Search**: Searchable dropdown improves usability over long select list
  - Client-side filtering if list is cached
  - Or API-backed search for large datasets
- **Character Counter**: Real-time feedback prevents surprises at submission
  - Visual indication when approaching limit (e.g., turns warning color at 4900)
  - Prevents input beyond 5000 characters
- **Date Validation**: Clear error if future date selected
- **Cancel Action**: Returns to previous page (browser back or Recent Statements)
- **Success Flow**: After submission, redirect to:
  - Politician detail page showing new statement, OR
  - Recent Statements feed with success message

**Accessibility Considerations**:
- All form fields have visible `<label>` elements
- Required fields indicated with asterisk and aria-required="true"
- Politician selector is keyboard navigable (arrow keys, type-ahead)
- Date/time picker is keyboard accessible (not just calendar click)
- Character counter updates aria-live region for screen readers
- Validation errors associated with fields via aria-describedby
- Submit button disabled during submission with aria-busy
- Focus management: errors focus first invalid field

**Security Considerations**:
- Form only accessible to authenticated users (middleware check)
- User ID extracted from session token (not user input)
- Date validation on both client and server
- Statement text sanitized before storage
- CSRF protection on form submission

**Data Requirements**:
- GET /api/politicians?sort=last_name (for politician selector)
- POST /api/statements
  - Request body: {politician_id, statement_text, statement_timestamp}
  - Response: Created statement with full details
- Authenticated request: JWT token in Authorization header

**User Stories Fulfilled**: US-005 (Add a statement)

---

### 2.6 Edit Statement Page

**Path**: `/statements/:id/edit`

**Authentication Required**: Yes (must be statement owner)

**Main Purpose**: Allow statement owners to correct errors in their submissions within a 15-minute grace period.

**Key Information to Display**:
- Page title ("Edit Statement")
- Grace period indicator ("X minutes remaining to edit")
- Pre-filled form (same structure as New Statement)
- Politician field (read-only or disabled, cannot be changed)
- Statement text and timestamp (editable)
- Character counter
- Save and cancel actions
- Validation errors

**Key View Components**:
- `GracePeriodIndicator` - Time remaining display
  - Shows "X minutes remaining"
  - Updates every 60 seconds
  - Warning color if < 5 minutes
  - Prominent placement at top of form
- `StatementForm` - Form with pre-filled values
  - Politician selector (disabled/read-only)
  - DateTimePicker (editable, pre-filled)
  - StatementTextarea (editable, pre-filled)
  - Character counter
  - Save button ("Save Changes")
  - Cancel button ("Cancel")
- `ValidationError` - Inline error messages
- `LoadingSpinner` - During save
- `SuccessMessage` - After successful update

**UX Considerations**:
- **Pre-filled Values**: Form loads with current statement data
- **Grace Period Visibility**: Time remaining shown prominently
- **Read-only Politician**: Prevents associating statement with wrong politician
- **Auto-save Option** (future): Could implement auto-save draft to localStorage
- **Grace Period Expiration**: If time expires during edit, show error on submit
- **Cancel Behavior**: Returns to previous view without saving
- **Success Flow**: After save, redirect to statement's location (feed or politician page)

**Accessibility Considerations**:
- Grace period indicator uses aria-live="polite" for updates
- Disabled politician field has aria-disabled and visual styling
- All other accessibility requirements same as New Statement form
- Clear error message if grace period expired

**Security Considerations**:
- Ownership check on page load (redirect if not owner)
- Grace period validation on page load (show error if expired)
- Server-side validation of ownership and grace period on submit
- Statement text sanitized before update
- User cannot modify politician_id or created_by_user_id

**Data Requirements**:
- GET /api/statements/:id (load current statement data)
  - Check can_edit flag from response
  - If false, redirect with error
- PATCH /api/statements/:id
  - Request body: {statement_text?, statement_timestamp?}
  - Response: Updated statement
- Error responses: 403 if grace period expired or not owner

**User Stories Fulfilled**: US-006 (Edit my statement)

---

### 2.7 User Profile Page

**Path**: `/profile`

**Authentication Required**: Yes

**Main Purpose**: Allow users to view and manage their profile information, see their contribution history, and sign out.

**Key Information to Display**:
- Page title ("My Profile")
- User information
  - Display name (editable)
  - Email address (read-only)
  - Account creation date
- User's submitted statements section
  - List of statements created by user
  - Show which are still editable (grace period)
- Edit profile form
- Sign out button

**Key View Components**:
- `ProfileHeader` - User information display
  - Avatar (initials or image)
  - Display name as heading
  - Email address
  - "Member since [date]"
- `EditProfileForm` - Form to update profile
  - Display name input
  - Save button
  - Validation for display name (1-100 chars, required)
- `UserStatementsSection` - List of user's statements
  - Statement cards (same format as feed)
  - Shows edit/delete controls if within grace period
  - Paginated if many statements
  - Link to politician pages
- `SignOutButton` - Prominent sign out action
- `LoadingState` - Skeleton during profile load
- `SuccessMessage` - After profile update

**UX Considerations**:
- **Inline Editing**: Display name can be edited inline or via small form
- **Contribution Visibility**: Seeing own statements builds engagement
- **Grace Period Clarity**: Clear indication of which statements are still editable
- **Sign Out Prominence**: Easy to find sign out action
- **Email Read-only**: Email managed through Supabase, not editable here (future: link to Supabase profile)

**Accessibility Considerations**:
- Profile section has clear heading structure
- Edit form has proper labels
- Sign out button clearly labeled
- Statements list uses semantic HTML (article elements)
- Keyboard navigation through all interactive elements

**Security Considerations**:
- Page only accessible to authenticated users
- User can only view/edit their own profile
- Email address verified by Supabase
- Session token validated on page load
- Sign out clears session and redirects to home

**Data Requirements**:
- GET /api/profiles/me (user profile data)
- PATCH /api/profiles/me (update display name)
- GET /api/statements?created_by_user_id={user_id} (user's statements)
- POST /auth/v1/logout (Supabase sign out)

**User Stories Fulfilled**: US-004 (Sign out), implicit profile management

---

### 2.8 Terms of Use Page

**Path**: `/terms`

**Main Purpose**: Display Terms of Use for legal compliance and user understanding.

**Key Information to Display**:
- Page title ("Terms of Use")
- Last updated date
- Terms content (formatted text)
- Link back to main site

**Key View Components**:
- `LegalPageLayout` - Simple content layout
  - Title heading
  - Last updated date
  - Content area with formatted text
  - Back to home link

**UX Considerations**:
- **Readability**: Clear typography, adequate line spacing
- **Scannability**: Headings, lists, emphasis for key points
- **Access**: Linked from footer, accessible without authentication
- **Print-friendly**: Clean layout suitable for printing

**Accessibility Considerations**:
- Proper heading hierarchy (h1 > h2 > h3)
- Semantic HTML for lists and emphasis
- Sufficient color contrast
- Keyboard navigation to all links

**Security Considerations**:
- Content should be static and sanitized
- No user input or dynamic content

**Data Requirements**:
- Static content, no API calls
- Could be markdown rendered to HTML

**User Stories Fulfilled**: US-012 (Minimal legal pages)

---

### 2.9 Privacy Policy Page

**Path**: `/privacy`

**Main Purpose**: Display Privacy Policy for legal compliance and transparency.

**Key Information to Display**:
- Page title ("Privacy Policy")
- Last updated date
- Privacy policy content (formatted text)
- Link back to main site

**Key View Components**:
- `LegalPageLayout` - Same as Terms of Use
  - Title heading
  - Last updated date
  - Content area
  - Back to home link

**UX Considerations**:
- Same as Terms of Use page
- Clear explanation of data collection and usage
- Contact information for privacy concerns

**Accessibility Considerations**:
- Same as Terms of Use page

**Security Considerations**:
- Static content, sanitized
- May include information about security practices

**Data Requirements**:
- Static content, no API calls
- Could be markdown rendered to HTML

**User Stories Fulfilled**: US-012 (Minimal legal pages)

---

## 3. User Journey Map

### Journey 1: Anonymous Visitor Discovers Platform

**Goal**: Browse recent statements and understand the platform

**Steps**:
1. **Land on Home Page** (/)
   - See recent statements feed
   - Understand platform purpose from context
   - Scan statement cards
   
2. **Expand Statement** (Same page)
   - Click "Read more" on truncated statement
   - Statement expands inline
   - Read full text
   - See contributor and submission time

3. **Navigate to Politician** (Click politician name)
   - Transition to /politicians/:id
   - See politician profile (name, party, bio)
   - See complete statement timeline
   - Understand politician's positions over time

4. **Filter Timeline** (Same page)
   - Click time range filter (e.g., "Last 30 Days")
   - Timeline updates to show filtered results
   - URL updates with query parameter
   - Can share filtered view

**Key Touchpoints**:
- Clear, scannable statement cards
- One-click navigation to politician details
- Inline expansion maintains context
- Time filtering provides focused research

---

### Journey 2: Voter Researches Specific Politician

**Goal**: Find and evaluate a specific politician's statement history

**Steps**:
1. **Navigate to Politicians Directory** (Click "Politicians" in header)
   - Arrive at /politicians
   - See alphabetical list of all politicians

2. **Search for Politician** (Submit search form)
   - Enter name in search box
   - Click "Search" or press Enter
   - Results filter to matching politicians
   - URL updates with search query

3. **View Politician Detail** (Click politician card)
   - Transition to /politicians/:id
   - See profile information
   - See all statements (default: All Time)

4. **Filter by Time Period** (Click filter button)
   - Select "Last Year" to see recent positions
   - Timeline updates
   - Compare statements across time

5. **Evaluate Consistency** (Read and analyze)
   - Read multiple statements
   - Note dates and context
   - Form opinion on consistency

**Key Touchpoints**:
- Effective search functionality
- Clear politician profiles
- Time-based filtering for context
- Chronological organization

---

### Journey 3: Contributor Signs Up and Submits Statement

**Goal**: Create account and add a new statement to the archive

**Steps**:
1. **Initiate Sign Up** (Click "Sign In" in header)
   - Navigate to /auth
   - See tabbed interface (Sign In | Sign Up)
   - "Sign Up" tab selected

2. **Complete Registration** (Fill and submit form)
   - Enter email address
   - Create password (min 6 chars)
   - Optionally enter display name
   - Submit form
   - Account created via Supabase
   - Automatically signed in
   - Redirected to home page

3. **Access Statement Form** (Click "Add Statement" in user menu)
   - User menu now visible in header (avatar/name)
   - Click "Add Statement" option
   - Navigate to /statements/new

4. **Fill Statement Form** (Complete all required fields)
   - Search for politician in dropdown
   - Select politician from results
   - Select date when statement was made
   - Select time
   - Paste or type statement text
   - See character counter update
   - Review form

5. **Submit Statement** (Click "Submit Statement")
   - Form validates client-side
   - Loading indicator shows
   - POST request to API
   - Success: Redirect to politician page or feed
   - New statement visible with edit controls

6. **Confirm Submission** (See success state)
   - Statement appears in feed/timeline
   - Grace period indicator shows "15 minutes remaining"
   - Edit and Delete buttons available

**Key Touchpoints**:
- Simple, clear sign-up process
- Obvious path to add statement
- Searchable politician selector
- Real-time character counting
- Immediate feedback on submission
- Clear edit window

---

### Journey 4: Contributor Edits Recent Statement

**Goal**: Correct a typo in recently submitted statement

**Steps**:
1. **Navigate to Statement** (View own statement)
   - Could be on Recent Statements feed
   - Or on Politician detail page
   - Or from Profile page
   - Statement shows "12 minutes remaining"
   - Edit button visible and enabled

2. **Initiate Edit** (Click "Edit" button)
   - Navigate to /statements/:id/edit
   - Form loads with current data
   - Grace period indicator at top: "12 minutes remaining"

3. **Make Correction** (Modify text)
   - Text is pre-filled
   - Find typo
   - Correct mistake
   - Character counter updates
   - Politician field is disabled (cannot change)

4. **Save Changes** (Click "Save Changes")
   - Form validates
   - Loading indicator shows
   - PATCH request to API
   - Success: Redirect back to statement location
   - Updated text displayed

5. **Confirm Update** (See success state)
   - Statement shows updated text
   - updated_at timestamp reflects change
   - Grace period continues (based on created_at)
   - Can edit again if time remains

**Key Touchpoints**:
- Clear grace period indication
- Pre-filled form reduces friction
- Disabled politician prevents errors
- Success confirmation

---

### Journey 5: User Reports Problematic Statement

**Goal**: Flag a statement that violates platform rules

**Steps**:
1. **Identify Problem** (While browsing)
   - User sees statement on any feed/timeline
   - Recognizes policy violation
   - Sees "Report" button on statement card

2. **Open Report Form** (Click "Report" button)
   - Modal dialog opens
   - Statement context visible in background (dimmed)
   - Form has reason dropdown and comment field

3. **Complete Report** (Fill form)
   - Select reason from dropdown:
     - Spam
     - Inaccurate
     - Inappropriate
     - Off Topic
     - Other
   - Optionally add comment (max 500 chars)
   - Review submission

4. **Submit Report** (Click "Submit Report")
   - Loading indicator shows
   - POST request to API
   - Success: Modal closes
   - Confirmation message shows (toast or inline)

5. **Continue Browsing** (After submission)
   - Modal dismissed
   - Statement still visible (no change in MVP)
   - User can continue browsing
   - Report logged for admin review

**Key Touchpoints**:
- Discreet but accessible report button
- Clear reason categories
- Optional comment for context
- Confirmation of submission
- No disruptive UI change

---

### Journey 6: Returning User Signs In

**Goal**: Access authenticated features after being away

**Steps**:
1. **Navigate to Sign In** (Click "Sign In" in header)
   - Navigate to /auth
   - "Sign In" tab selected by default

2. **Enter Credentials** (Fill form)
   - Enter email
   - Enter password
   - Click "Sign In"

3. **Authenticate** (Supabase auth)
   - Loading indicator shows
   - JWT token received and stored
   - Profile loaded
   - Redirected to intended destination or home

4. **Access Authenticated Features** (Header updates)
   - User menu now visible (name/avatar)
   - Can access Add Statement
   - Can access Profile
   - Can edit own statements (if within grace period)

**Key Touchpoints**:
- Quick sign-in flow
- Persistent session
- Header updates reflect auth state
- Smooth transition to authenticated experience

---

## 4. Layout and Navigation Structure

### 4.1 Global Layout Structure

All pages share a consistent layout structure:

```
┌─────────────────────────────────────┐
│         Global Header               │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│       (View-specific content)       │
│                                     │
├─────────────────────────────────────┤
│         Global Footer               │
└─────────────────────────────────────┘
```

### 4.2 Global Header

**Always Visible**: Yes (sticky or static)

**Components**:
- **Brand/Logo** (left side)
  - Text: "SpeechKarma" or logo image
  - Links to home (/)
  - Always visible

- **Primary Navigation** (center/right on desktop, menu on mobile)
  - "Recent Statements" or "Home" → /
  - "Politicians" → /politicians

- **Authentication State UI** (right side)
  - **If Not Authenticated**:
    - "Sign In" button → /auth
  
  - **If Authenticated**:
    - User avatar/initials or name
    - Dropdown menu on click:
      - "Profile" → /profile
      - "Add Statement" → /statements/new
      - Divider
      - "Sign Out" (action)

**Responsive Behavior**:
- **Desktop** (≥ 1024px):
  - Horizontal layout
  - All links visible
  - User menu as dropdown

- **Mobile** (< 1024px):
  - Logo on left
  - Hamburger menu icon on right
  - Menu click reveals navigation drawer/overlay
  - Authentication state in menu

**Accessibility**:
- Navigation wrapped in `<nav>` element
- Skip to main content link (visually hidden, keyboard accessible)
- Current page indicated with aria-current="page"
- Menu button has aria-label and aria-expanded
- Dropdown menus keyboard navigable

---

### 4.3 Global Footer

**Always Visible**: Yes (bottom of page)

**Components**:
- **Legal Links**
  - "Terms of Use" → /terms
  - "Privacy Policy" → /privacy
  - Separator (|) between links

- **Copyright Notice**
  - Text: "© 2025 SpeechKarma"

- **Optional Future Elements**:
  - Social media links
  - Contact link
  - About link

**Layout**:
- Centered content
- Single line on desktop
- Stacked on mobile if needed
- Light background, minimal visual weight

**Accessibility**:
- Footer wrapped in `<footer>` element
- Links have sufficient contrast
- Focus indicators on links

---

### 4.4 Main Content Area Layout Patterns

#### Pattern A: Feed/List Layout
**Used By**: Recent Statements Feed, Politicians Directory, Politician Timeline

**Structure**:
```
┌─────────────────────────────────────┐
│  Page Title / Context               │
├─────────────────────────────────────┤
│  Filters/Controls (if applicable)   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │     Card Item 1             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │     Card Item 2             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │     Card Item 3             │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Pagination Controls                │
└─────────────────────────────────────┘
```

**Responsive**:
- Cards: Full width on mobile, max-width on desktop
- Pagination: Horizontal on desktop, stacked on mobile

---

#### Pattern B: Detail Layout
**Used By**: Politician Detail Page

**Structure**:
```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │   Profile Header Card         │ │
│  │   (Name, Party, Bio, Count)   │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Time Range Filter Controls         │
├─────────────────────────────────────┤
│  Statement Timeline (Feed Layout)   │
└─────────────────────────────────────┘
```

---

#### Pattern C: Form Layout
**Used By**: Authentication, New Statement, Edit Statement, Profile Edit

**Structure**:
```
┌─────────────────────────────────────┐
│  Page Title / Context               │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  Form Container Card          │ │
│  │                               │ │
│  │  [Label]                      │ │
│  │  [Input Field]                │ │
│  │  [Error Message]              │ │
│  │                               │ │
│  │  [Label]                      │ │
│  │  [Input Field]                │ │
│  │                               │ │
│  │  [Submit]  [Cancel]           │ │
│  │                               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Responsive**:
- Form width: Constrained (max 600px) and centered
- Inputs: Full width of container
- Buttons: Full width on mobile, inline on desktop

---

#### Pattern D: Legal Content Layout
**Used By**: Terms of Use, Privacy Policy

**Structure**:
```
┌─────────────────────────────────────┐
│  Page Title                         │
│  Last Updated                       │
├─────────────────────────────────────┤
│                                     │
│  Formatted Content                  │
│  (Headings, paragraphs, lists)      │
│                                     │
└─────────────────────────────────────┘
```

**Responsive**:
- Content width: Optimized for reading (max 700px)
- Typography: Larger, comfortable spacing

---

### 4.5 Navigation Paradigms

#### Primary Navigation
- **Type**: Global header navigation
- **Purpose**: Move between main sections
- **Pattern**: Always accessible, consistent across site

#### Contextual Navigation
- **Type**: Inline links within content
- **Examples**: 
  - Politician name links in statement cards
  - "Back to Politicians" links
  - Breadcrumbs (optional future enhancement)

#### Action Navigation
- **Type**: Buttons and CTAs that initiate actions
- **Examples**:
  - "Add Statement" button
  - "Edit" / "Delete" buttons on statements
  - "Submit" buttons in forms

#### Pagination Navigation
- **Type**: Move through large datasets
- **Pattern**: Previous / Page Numbers / Next
- **Accessibility**: Keyboard navigable, clear labels

---

### 4.6 Navigation State Management

**URL Structure and Routing**:
- Clean, RESTful URLs
- Query parameters for filters, search, pagination
- Hash for UI state (like auth tabs)

**Examples**:
- `/` - Home
- `/politicians?search=smith&page=2` - Search results
- `/politicians/abc-123` - Politician detail
- `/politicians/abc-123?time_range=30d` - Filtered timeline
- `/auth#signup` - Auth page, signup tab
- `/statements/new` - New statement form

**Browser Back Button**:
- All navigation respects browser history
- Filters update URL, back button restores previous filter
- Modal closes on back (if history entry added)

**Authentication Redirects**:
- Protected routes redirect to /auth with return URL
- After auth, redirect back to intended page
- Sign out redirects to home (/)

---

## 5. Key Components

### 5.1 StatementCard

**Purpose**: Display individual statement with all relevant metadata and actions. Core component used across multiple views.

**Composition**:
- **Header Section**
  - Politician avatar/initials
  - Politician name (linked to detail page)
  - Party badge (color-coded with text label)
  - Statement timestamp (when statement was made)

- **Content Section**
  - Statement text (truncated or full)
  - "Read more" / "Read less" toggle (if truncated)

- **Metadata Section**
  - Contributor display name
  - Submission timestamp ("Added 2 hours ago")

- **Actions Section**
  - Report button (always visible, discreet)
  - Edit button (conditional: owner + grace period)
  - Delete button (conditional: owner + grace period)
  - Grace period indicator (if applicable)

**States**:
- Default (truncated)
- Expanded (full text visible)
- Loading (skeleton)
- Error (if action fails)

**Accessibility**:
- Wrapped in `<article>` element
- Heading for politician name
- Buttons have descriptive labels
- Timestamps have full datetime in title attribute

**Reusability**:
- Used in Recent Statements Feed
- Used in Politician Timeline
- Used in User Profile (own statements)

---

### 5.2 PoliticianCard

**Purpose**: Display politician summary in directory listing.

**Composition**:
- Politician avatar/initials
- Full name (as heading, linked to detail)
- Party badge
- Biography snippet (truncated to ~150 chars)
- Statement count indicator ("X statements")

**States**:
- Default
- Hover (if desktop)
- Focus (keyboard navigation)
- Loading (skeleton)

**Accessibility**:
- `<article>` element
- Heading for name
- Party info not reliant on color alone

**Reusability**:
- Used in Politicians Directory

---

### 5.3 PoliticianHeader

**Purpose**: Display comprehensive politician profile at top of detail page.

**Composition**:
- Large politician avatar
- Full name (h1 heading)
- Party badge (larger, prominent)
- Full biography text
- Statement count badge

**States**:
- Default
- Loading (skeleton)
- Error (if politician not found)

**Accessibility**:
- Proper heading hierarchy
- Biography in paragraph elements
- Party badge has text, not just color

**Reusability**:
- Used on Politician Detail Page

---

### 5.4 TimeRangeFilter

**Purpose**: Allow users to filter statement timelines by time range.

**Composition**:
- Four button options: "Last 7 Days", "Last 30 Days", "Last Year", "All Time"
- Visual indicator of active selection (background color, border, etc.)
- Implemented as button group or segmented control

**Behavior**:
- Click option to activate
- URL updates with query parameter
- Timeline re-fetches with new filter
- "All Time" is default

**States**:
- Option active (one at a time)
- Option inactive
- Loading during filter change

**Accessibility**:
- Implemented as radio button group or ARIA tabs
- Active option has aria-selected="true" or aria-current
- Keyboard navigable (arrow keys or tab)
- Label for group: "Filter by time range"

**Reusability**:
- Used on Politician Detail Page

---

### 5.5 SearchForm

**Purpose**: Allow users to search politicians by name.

**Composition**:
- Text input (placeholder: "Search politicians...")
- Submit button (text: "Search" or magnifying glass icon)
- Clear button (when search active, returns to full list)

**Behavior**:
- Submit on button click or Enter key
- Updates URL with search query parameter
- Page navigates/reloads with results
- Clear returns to unfiltered list

**States**:
- Empty (no search)
- Active search (with clear button)
- Loading (during search)
- Error (if search fails)

**Accessibility**:
- Form has proper label
- Submit button has descriptive text or aria-label
- Clear button has aria-label
- Results count announced to screen readers

**Reusability**:
- Used in Politicians Directory

---

### 5.6 PoliticianSelector

**Purpose**: Searchable dropdown for selecting a politician in statement forms.

**Composition**:
- Text input for search/filter
- Dropdown list of politicians
- Each option shows name and party
- Selected politician display

**Behavior**:
- Type to filter list (client-side or server-side)
- Click or Enter to select
- Selected politician shown in input
- Clear to start over

**States**:
- Empty (no selection)
- Searching (filtered results)
- Selected (politician chosen)
- Loading (if server-side search)
- Error (if load fails)

**Accessibility**:
- Implemented with combobox ARIA pattern
- Keyboard navigable (arrow keys, Enter to select)
- aria-autocomplete="list"
- aria-expanded indicates dropdown state
- Selected option has aria-selected="true"

**Reusability**:
- Used in New Statement form
- Used in Edit Statement form (disabled/read-only state)

---

### 5.7 DateTimePicker

**Purpose**: Allow users to select date and time for statements.

**Composition**:
- Date picker component (calendar or native input)
- Time picker component (dropdown or native input)
- Combined datetime display

**Behavior**:
- Select date from calendar or type
- Select time from dropdowns or type
- Validation: cannot be in future
- Default to current date/time (optional)

**States**:
- Empty (no selection)
- Valid selection
- Invalid selection (future date/time)
- Error state with message

**Accessibility**:
- Keyboard accessible (not just mouse clicks)
- Date input has label and format hint
- Time input has label and format hint
- Error message associated via aria-describedby
- Native inputs preferred for accessibility (type="date", type="time")

**Reusability**:
- Used in New Statement form
- Used in Edit Statement form

---

### 5.8 StatementTextarea

**Purpose**: Multi-line text input for statement text with character counting.

**Composition**:
- Textarea element
- Character counter display (e.g., "450 / 5000")
- Visual indicator when approaching limit

**Behavior**:
- Real-time character counting
- Prevents input beyond max (5000 chars)
- Shows warning color when > 4800 chars
- Auto-resize height (optional) or fixed with scroll

**States**:
- Normal (< 4800 chars)
- Warning (4800-5000 chars)
- Error (< 10 chars or other validation)

**Accessibility**:
- Textarea has label
- Character counter updates aria-live region
- Max length enforced (maxlength attribute)
- Error messages associated via aria-describedby

**Reusability**:
- Used in New Statement form
- Used in Edit Statement form

---

### 5.9 GracePeriodIndicator

**Purpose**: Show remaining time for edit/delete actions on statements.

**Composition**:
- Time remaining text ("X minutes remaining")
- Optional icon (clock)
- Optional countdown (updates every 60 seconds)

**Behavior**:
- Calculates time from created_at
- Updates display every minute
- Shows warning color when < 5 minutes
- Transitions to "Edit period expired" after 15 minutes

**States**:
- Active (time remaining)
- Warning (< 5 minutes)
- Expired (no actions available)

**Accessibility**:
- Updates announced with aria-live="polite"
- Expired state clearly communicated
- Associated with edit/delete buttons

**Reusability**:
- Used on StatementCard (when user is owner)
- Used on Edit Statement page

---

### 5.10 ReportModal

**Purpose**: Allow users to report problematic statements.

**Composition**:
- Modal dialog overlay
- Form with two fields:
  - Reason dropdown (required)
    - Options: Spam, Inaccurate, Inappropriate, Off Topic, Other
  - Comment textarea (optional, max 500 chars)
- Submit button ("Submit Report")
- Cancel button ("Cancel")

**Behavior**:
- Opens on "Report" button click
- Backdrop click or Escape key closes
- Form validation before submit
- Success: Close modal, show confirmation message
- Error: Show error in modal

**States**:
- Open (displaying form)
- Submitting (loading state)
- Success (confirmation)
- Error (validation or API error)

**Accessibility**:
- Dialog has role="dialog" and aria-modal="true"
- Focus trapped within modal
- Focus returns to trigger button on close
- Escape key closes modal
- Cancel button visible and keyboard accessible

**Reusability**:
- Used across all views where statements are displayed

---

### 5.11 AuthTabs

**Purpose**: Provide tabbed interface for sign in and sign up on single page.

**Composition**:
- Two tabs: "Sign In" | "Sign Up"
- Visual indicator of active tab
- Tab panels with respective forms

**Behavior**:
- Click tab to switch
- Updates URL hash (#signin, #signup)
- Maintains form state when switching (optional)

**States**:
- Sign In tab active (default)
- Sign Up tab active

**Accessibility**:
- Implemented with ARIA tabs pattern
- role="tablist" on container
- role="tab" on each tab button
- role="tabpanel" on each content area
- aria-selected on active tab
- Keyboard navigation (left/right arrows or tab)

**Reusability**:
- Used on Authentication page

---

### 5.12 PaginationControls

**Purpose**: Navigate through paginated lists.

**Composition**:
- Previous button
- Page number buttons (e.g., 1, 2, 3, ... 10)
- Next button
- Current page indicator

**Behavior**:
- Click page number to jump to page
- Previous/Next buttons navigate sequentially
- Disabled state when on first/last page
- URL updates with page parameter

**States**:
- First page (Previous disabled)
- Middle page (both enabled)
- Last page (Next disabled)
- Loading (during page change)

**Accessibility**:
- Navigation wrapped in `<nav>` with aria-label="Pagination"
- Current page has aria-current="page"
- Disabled buttons have aria-disabled="true"
- Page numbers are buttons, not links (unless using full page reload pattern)

**Reusability**:
- Used on Recent Statements Feed
- Used on Politicians Directory
- Used on Politician Timeline
- Used on User Profile (statements list)

---

### 5.13 PartyBadge

**Purpose**: Display political party affiliation with visual identity.

**Composition**:
- Party name text
- Color accent (background or border)
- Optional abbreviation

**Behavior**:
- Display party.name or party.abbreviation
- Apply party.color_hex as accent
- Ensure sufficient contrast for accessibility

**States**:
- Default
- Compact (abbreviation only, for tight spaces)

**Accessibility**:
- Party information conveyed through text, not color alone
- Sufficient contrast ratio (4.5:1 minimum)
- No reliance on color for meaning

**Reusability**:
- Used in StatementCard
- Used in PoliticianCard
- Used in PoliticianHeader
- Used in form displays

---

### 5.14 EmptyState

**Purpose**: Communicate when no results or content is available.

**Composition**:
- Icon or illustration (optional)
- Message text explaining why empty
- Optional action button (e.g., "Add first statement")

**Variations**:
- "No statements found" (Recent Feed, empty database)
- "No statements in this time period" (Filtered timeline)
- "No politicians match your search" (Search results)
- "You haven't submitted any statements yet" (Profile)

**States**:
- Default empty
- With suggested action

**Accessibility**:
- Message clearly communicated
- Not hidden from screen readers
- Action button (if present) is keyboard accessible

**Reusability**:
- Used across all list/feed views

---

### 5.15 LoadingState

**Purpose**: Indicate that content is loading.

**Composition**:
- Skeleton screens (preferred)
  - Placeholder shapes mimicking actual content
  - Subtle animation (shimmer or pulse)
- Or spinner (for actions)

**Variations**:
- Statement card skeleton (for feeds)
- Politician card skeleton (for directory)
- Form submit spinner (for actions)
- Full page loading (for page transitions)

**States**:
- Loading (animated)

**Accessibility**:
- Loading state announced to screen readers
- aria-live="polite" or aria-busy="true"
- "Loading..." text (can be visually hidden)

**Reusability**:
- Used across all views during data fetch

---

### 5.16 ErrorState

**Purpose**: Communicate errors and provide recovery options.

**Composition**:
- Error icon
- Error message (user-friendly, specific)
- Retry button (for transient errors)
- Support/help link (for persistent errors)

**Variations**:
- Network error: "Unable to load content" + Retry
- 404 error: "Politician not found" + Back to Directory
- 403 error: "You don't have permission" + Sign In
- Validation error: Inline near field
- Generic error: "Something went wrong" + Retry + Contact Support

**States**:
- Error displayed
- Retrying (after retry button click)

**Accessibility**:
- Error message announced with role="alert"
- Error clearly associated with context
- Retry button keyboard accessible

**Reusability**:
- Used across all views for error handling

---

### 5.17 ValidationError

**Purpose**: Display form validation errors inline.

**Composition**:
- Error icon (optional)
- Error message text (specific, actionable)
- Red color accent (with sufficient contrast)

**Behavior**:
- Appears near associated field
- Shows on blur, on submit, or real-time (depending on field)
- Clears when field becomes valid

**States**:
- Error visible
- Error cleared (field valid)

**Accessibility**:
- Error message associated with field via aria-describedby
- Field has aria-invalid="true" when error shown
- Red color is supplemented with icon and text

**Reusability**:
- Used in all form views

---

## 6. Component Interaction Patterns

### 6.1 Statement Expansion Pattern
- **Trigger**: "Read more" button on StatementCard
- **Action**: Toggle expanded state (local React state)
- **Result**: Statement text expands inline, button changes to "Read less"
- **No Navigation**: Maintains context, no API call needed

### 6.2 Politician Navigation Pattern
- **Trigger**: Click on politician name link in StatementCard
- **Action**: Navigate to /politicians/:id
- **Result**: Full page load of Politician Detail Page
- **Data**: SSR fetch of politician data and statements

### 6.3 Filter Update Pattern
- **Trigger**: Click TimeRangeFilter option
- **Action**: Update URL query parameter, re-fetch statements
- **Result**: Timeline updates with filtered results
- **State**: Active filter visually indicated, shareable URL

### 6.4 Search Submission Pattern
- **Trigger**: Submit SearchForm (button click or Enter)
- **Action**: Update URL with search query, navigate/reload
- **Result**: Filtered results displayed, search query shown
- **Recovery**: Clear button returns to unfiltered view

### 6.5 Modal Dialog Pattern
- **Trigger**: Click "Report" button
- **Action**: Open ReportModal, trap focus, dim background
- **Result**: Form displayed, user completes or cancels
- **Close**: Submit, Cancel, Escape key, or backdrop click
- **Cleanup**: Focus returns to trigger button

### 6.6 Form Submission Pattern
- **Trigger**: Submit button in any form
- **Action**: Validate, show loading state, POST/PATCH to API
- **Success**: Redirect to relevant view, show success message
- **Error**: Show error inline, maintain form state for retry
- **Recovery**: Clear errors when user edits field

### 6.7 Grace Period Countdown Pattern
- **Trigger**: Page load when user is statement owner
- **Action**: Calculate remaining time, update every 60 seconds
- **Result**: Display "X minutes remaining"
- **Transition**: When time expires, disable edit/delete, update message

### 6.8 Authentication Flow Pattern
- **Trigger**: Access protected route without auth
- **Action**: Redirect to /auth with return URL stored
- **Login**: Complete authentication, store token
- **Result**: Redirect to intended destination, update header UI
- **Persistence**: Session maintained via httpOnly cookie

---

## 7. Responsive Design Strategy

### 7.1 Breakpoints

Following Tailwind default breakpoints:
- **Mobile**: < 640px (base styles)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: ≥ 1024px (xl)

### 7.2 Layout Adaptations

**Header**:
- Mobile: Logo + Hamburger menu
- Desktop: Logo + Horizontal links + User menu

**Statement Cards**:
- Mobile: Full width, stacked vertically
- Desktop: Max width 800px, centered

**Politician Cards**:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3 columns

**Forms**:
- Mobile: Full width inputs, stacked buttons
- Desktop: Constrained width (max 600px), inline buttons

**Time Range Filter**:
- Mobile: Scrollable horizontal if needed, or stacked
- Desktop: Single horizontal row

**Pagination**:
- Mobile: Previous/Next with limited page numbers
- Desktop: Full pagination with more page numbers visible

### 7.3 Typography Scaling

- **Base**: 16px (mobile)
- **Headings**: Scale proportionally
- **Statements**: 16-18px for readability
- **Legal Text**: 14-16px with generous line height

### 7.4 Touch Targets

- Minimum 44x44px for all interactive elements on mobile
- Adequate spacing between adjacent buttons
- Larger click areas for primary actions

---

## 8. Accessibility Requirements Summary

### 8.1 Semantic HTML
- Use appropriate elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<button>`, `<a>`, etc.
- Proper heading hierarchy (h1 > h2 > h3)
- Forms use `<label>`, `<fieldset>`, `<legend>`

### 8.2 Keyboard Navigation
- All interactive elements accessible via Tab key
- Logical tab order
- Visible focus indicators (2px outline, sufficient contrast)
- Skip to main content link
- Escape key closes modals
- Arrow keys in custom components (tabs, radio groups)

### 8.3 Screen Reader Support
- ARIA labels for icon buttons
- ARIA live regions for dynamic updates
- ARIA states (expanded, selected, invalid, busy)
- Alt text for images (if/when added)
- Form errors associated with fields

### 8.4 Visual Accessibility
- Color contrast ≥ 4.5:1 for text (WCAG AA)
- Color contrast ≥ 3:1 for UI components
- Don't rely on color alone to convey information
- Text resizable to 200% without loss of functionality
- Sufficient text size (16px minimum for body)

### 8.5 Error Handling
- Clear, specific error messages
- Errors announced to screen readers (role="alert")
- Errors associated with form fields
- Recovery options provided

---

## 9. Security Considerations Summary

### 9.1 Authentication
- JWT tokens in httpOnly cookies (managed by Supabase)
- No tokens in localStorage
- Session validation on protected routes
- Clear sign-out flow that invalidates session

### 9.2 Authorization
- Edit/Delete buttons only shown to owners
- Grace period validation on client and server
- Ownership checks on all mutations
- Admin features hidden from non-admin users (post-MVP)

### 9.3 Input Handling
- All user input sanitized before display
- React's built-in XSS protection
- Form validation on client and server
- Character limits enforced

### 9.4 API Communication
- All requests over HTTPS in production
- CSRF protection via Supabase
- Rate limiting feedback (when approaching limits)

### 9.5 Data Privacy
- Only display public information in unauthenticated views
- User emails only visible to account owner
- Clear privacy policy linked in footer

---

## 10. Performance Optimization Summary

### 10.1 Initial Load
- Server-side rendering for first paint
- Minimal JavaScript for static pages
- Code splitting for authenticated features
- Lazy loading of non-critical components

### 10.2 Runtime Performance
- React.memo for expensive components (StatementCard)
- useCallback for event handlers
- useMemo for calculations
- Debounced inputs where applicable

### 10.3 Data Management
- Pagination to limit response sizes
- Caching of static data (parties list)
- Optimistic updates for mutations
- Skeleton screens prevent layout shift

### 10.4 Asset Optimization
- Compress and optimize images
- Minimize CSS and JavaScript
- Use Astro's built-in optimizations

**Target**: < 2 seconds for initial page load

---

## 11. User Story to UI Mapping

| User Story | Primary View(s) | Components | Navigation |
|------------|----------------|------------|------------|
| US-001: Browse recent statements | Recent Statements Feed | StatementCard, PaginationControls | Header → Home |
| US-002: View politician directory | Politicians Directory | PoliticianCard, SearchForm, PaginationControls | Header → Politicians |
| US-003: View politician's timeline | Politician Detail | PoliticianHeader, TimeRangeFilter, StatementCard | Click politician from any card |
| US-004: Sign up / Sign in | Authentication Page | AuthTabs, SignInForm, SignUpForm | Header → Sign In |
| US-005: Add a statement | New Statement Page | StatementForm, PoliticianSelector, DateTimePicker, StatementTextarea | User menu → Add Statement |
| US-006: Edit my statement | Edit Statement Page | StatementForm (pre-filled), GracePeriodIndicator | Edit button on own statement |
| US-007: Delete my statement | Statement Card | Delete button (within grace period) | Delete button on own statement |
| US-008: Report a statement | Report Modal | ReportModal | Report button on any statement |
| US-009: Basic search by politician | Politicians Directory | SearchForm | Header → Politicians → Search |
| US-010: Statement readability | Statement Card | Truncation + Read more toggle | All statement displays |
| US-011: View party on statement items | Statement Card | PartyBadge | All statement displays |
| US-012: Minimal legal pages | Terms, Privacy | LegalPageLayout | Footer links |
| US-013: Performance & reliability | All views | SSR, optimization, loading states | N/A |
| US-014: Accessibility basics | All views | Semantic HTML, ARIA, keyboard nav | N/A |

---

## 12. Future Enhancements (Post-MVP)

### Potential UI Improvements
1. **Statement Detail Page**: Dedicated view for single statement with full context, comments (future)
2. **Advanced Search**: Full-text search across statement text, party filter, date range
3. **Notifications**: Toast notifications for success/error feedback
4. **User Dashboard**: Enhanced profile with statistics, contribution history
5. **Subscriptions**: Follow politicians, receive updates
6. **Comparison View**: Side-by-side statement comparison for consistency checking
7. **Topic Tags**: Visual tags for statement categorization
8. **Multimedia**: Support for video/audio attachments, screenshots
9. **Dark Mode**: Theme toggle for visual preference
10. **Infinite Scroll**: Alternative to pagination for certain views
11. **Progressive Web App**: Install prompt, offline support
12. **Social Sharing**: Share statement cards to social media
13. **Print Views**: Optimized layouts for printing timelines
14. **Breadcrumbs**: Navigation aid for deep pages
15. **Moderation Console**: Admin UI for reviewing reports (admin only)

---

## 13. Conclusion

This UI architecture provides a comprehensive, accessible, and user-friendly interface for SpeechKarma MVP. The design prioritizes:

- **Public Access**: Anonymous browsing of statements and politician timelines
- **Easy Contribution**: Simple, clear flow for authenticated users to add statements
- **Research Utility**: Effective tools for voters to evaluate politician consistency
- **Trust & Safety**: Transparent attribution, reporting mechanism, grace period for corrections
- **Accessibility**: WCAG AA compliance ensures inclusive access
- **Performance**: < 2 second page loads via SSR and optimization
- **Mobile-First**: Responsive design optimized for all devices
- **Security**: Proper authentication, authorization, and input handling

The architecture is built on modern web technologies (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui) and integrates seamlessly with the defined API plan. All user stories from the PRD are mapped to specific views and components, ensuring comprehensive coverage of MVP requirements.

