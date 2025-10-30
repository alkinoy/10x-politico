# View Implementation Plans Summary

## Overview

This document provides an index of all view implementation plans created for the SpeechKarma web application. Each plan provides comprehensive guidance for implementing a specific view, including component structure, types, state management, API integration, user interactions, validation, error handling, and step-by-step implementation instructions.

## Completed Implementation Plans

### 1. Recent Statements Feed (Home Page)
**File:** `.ai/recent-statements-view-implementation-plan.md`
**Path:** `/`
**User Stories:** US-001, US-010, US-011
**Estimated Time:** 19-26 hours
**Description:** Landing page displaying most recently added political statements in reverse chronological order. Features statement cards with truncation/expansion, pagination, and edit/delete controls for statement owners within the grace period.

**Key Features:**
- Paginated statement feed (50 per page)
- Statement card with read more/less toggle
- Report statement functionality
- Edit/delete within 15-minute grace period
- Politician navigation links

---

### 2. Politicians Directory
**File:** `.ai/politicians-directory-view-implementation-plan.md`
**Path:** `/politicians`
**User Stories:** US-002, US-009
**Estimated Time:** 16-20 hours
**Description:** Browsable and searchable directory of all politicians, sorted alphabetically by last name. Features search functionality with real-time filtering and pagination.

**Key Features:**
- Alphabetically sorted politician list
- Search by name (first or last)
- Politician cards with party badges
- Biography preview (truncated to ~150 chars)
- Statement count indicator
- Pagination

---

### 3. Politician Detail Page
**File:** `.ai/politician-detail-view-implementation-plan.md`
**Path:** `/politicians/:id`
**User Stories:** US-003, US-010, US-011
**Estimated Time:** 18-24 hours
**Description:** Comprehensive view of a single politician's profile and complete statement timeline. Features profile header with biography and filterable timeline with time range options.

**Key Features:**
- Profile header (name, party, biography, statement count)
- Time range filter (7d, 30d, 365d, all)
- Paginated statement timeline
- Reuses statement cards from home page
- URL parameters for filter state

---

### 4. Authentication Page
**File:** `.ai/authentication-view-implementation-plan.md`
**Path:** `/auth`
**User Stories:** US-004
**Estimated Time:** 18-24 hours
**Description:** Unified authentication page with tabbed interface for both sign-in and sign-up. Integrates with Supabase Auth for user management.

**Key Features:**
- Tab interface (Sign In | Sign Up)
- Email and password fields
- Password visibility toggle
- Optional display name for sign-up
- Return URL handling
- Session management via Supabase

---

### 5. New Statement Page
**File:** `.ai/new-statement-view-implementation-plan.md`
**Path:** `/statements/new`
**User Stories:** US-005
**Estimated Time:** 22-29 hours
**Description:** Dedicated form page for authenticated users to submit new political statements. Features searchable politician selector, date/time picker, and textarea with character counter.

**Key Features:**
- Searchable politician dropdown (combobox pattern)
- Date/time picker (no future dates)
- Statement textarea (min 10, max 5000 chars)
- Real-time character counter
- Field validation
- Success redirect to politician page

---

### 6. Edit Statement Page
**File:** `.ai/edit-statement-view-implementation-plan.md`
**Path:** `/statements/:id/edit`
**User Stories:** US-006
**Estimated Time:** 12-16 hours
**Description:** Form page allowing statement owners to edit their statements within the 15-minute grace period. Features pre-filled form with read-only politician field and prominent grace period indicator.

**Key Features:**
- Pre-filled form fields
- Grace period indicator (updates every minute)
- Read-only politician display
- Editable text and timestamp
- Ownership and grace period validation
- PATCH request to update statement

**Note:** Heavily reuses components from New Statement Page.

---

### 7. User Profile Page
**File:** `.ai/user-profile-view-implementation-plan.md`
**Path:** `/profile`
**User Stories:** US-004 (Sign out), implicit profile management
**Estimated Time:** 12-15 hours
**Description:** User profile page for viewing and editing profile information, seeing contribution history, and signing out. Shows all user-submitted statements with grace period indicators.

**Key Features:**
- Profile header (avatar, name, email, member since)
- Edit display name inline
- List of user's submitted statements
- Grace period indicators on statements
- Sign out button
- Paginated statements list

---

### 8. Legal Pages (Terms of Use & Privacy Policy)
**File:** `.ai/legal-pages-view-implementation-plan.md`
**Paths:** `/terms` and `/privacy`
**User Stories:** US-012
**Estimated Time:** 3-5 hours (both pages)
**Description:** Static content pages for legal compliance. Both pages share the same structure and implementation approach, differing only in content.

**Key Features:**
- Simple static content layout
- Proper heading hierarchy
- Last updated date
- Markdown or HTML content
- Print-friendly styling
- Accessibility compliant
- Footer links

**Note:** Single implementation plan covers both pages due to shared structure.

---

## Implementation Plan Structure

Each implementation plan follows a consistent structure:

1. **Overview** - Brief summary of the view and its purpose
2. **View Routing** - Path, authentication requirements, access level
3. **Component Structure** - Hierarchy diagram of components
4. **Component Details** - Detailed description of each component
   - Component description and purpose
   - Main HTML elements
   - Handled events
   - Validation conditions
   - Required types
   - Props interface
5. **Types** - ViewModels and DTOs required
6. **State Management** - How state is managed, patterns, and flow
7. **API Integration** - Endpoints used, request/response types, implementation
8. **User Interactions** - Detailed description of all user interactions
9. **Conditions and Validation** - Validation rules and display conditions
10. **Error Handling** - Error categories and handling strategies
11. **Implementation Steps** - Phase-by-phase step-by-step guide with time estimates

## Total Estimated Implementation Time

| View | Estimated Hours |
|------|----------------|
| Recent Statements Feed | 19-26 |
| Politicians Directory | 16-20 |
| Politician Detail Page | 18-24 |
| Authentication Page | 18-24 |
| New Statement Page | 22-29 |
| Edit Statement Page | 12-16 |
| User Profile Page | 12-15 |
| Legal Pages (both) | 3-5 |
| **TOTAL** | **120-159 hours** |

**Average:** ~140 hours (~3.5 weeks for one developer)

## Dependencies Between Views

### Reusable Components
Several components are built once and reused across multiple views:

- **StatementCard** - Used in:
  - Recent Statements Feed
  - Politician Detail Page (timeline)
  - User Profile Page (user's statements)

- **PaginationControls** - Used in:
  - Recent Statements Feed
  - Politicians Directory
  - Politician Detail Page (timeline)
  - User Profile Page (statements)

- **PartyBadge** - Used in:
  - Recent Statements Feed (in statement cards)
  - Politicians Directory (in politician cards)
  - Politician Detail Page (header and statement cards)
  - New Statement Page (in politician selector)

- **ValidationError** - Used in:
  - Authentication Page (all forms)
  - New Statement Page
  - Edit Statement Page
  - User Profile Page (edit form)

- **LoadingSpinner** - Used in:
  - All views during data fetching
  - All forms during submission

### Recommended Implementation Order

1. **Phase 1: Core Infrastructure**
   - Layout components
   - Reusable UI components (buttons, badges, etc.)
   - Authentication system setup

2. **Phase 2: Public Browsing (Anonymous Users)**
   - Recent Statements Feed (includes creating StatementCard, PaginationControls, PartyBadge)
   - Politicians Directory (reuses PaginationControls, PartyBadge)
   - Politician Detail Page (reuses StatementCard, PaginationControls, PartyBadge)
   - Legal Pages (simple, can be done anytime)

3. **Phase 3: Authentication**
   - Authentication Page

4. **Phase 4: User Actions (Authenticated Users)**
   - New Statement Page (creates form components, ValidationError, etc.)
   - Edit Statement Page (reuses New Statement components)
   - User Profile Page (reuses StatementCard)

This order maximizes component reuse and allows for early testing of public features before implementing authenticated features.

## Technology Stack Reminder

- **Frontend Framework:** Astro 5 (SSR) + React 19 (client-side interactivity)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn/ui (base components)
- **Backend:** Supabase (PostgreSQL + Auth)
- **API:** Custom REST API built with Astro endpoints

## Additional Resources

- **PRD:** `.ai/prd.md` - Product Requirements Document
- **UI Plan:** `.ai/ui-plan.md` - Complete UI architecture document
- **API Plan:** `.ai/api-plan.md` - REST API specification
- **Tech Stack:** `.ai/tech-stack.md` - Technology choices
- **Types:** `src/types.ts` - All DTOs and type definitions

## Notes for Implementation

1. **Authentication Checks:** Ensure middleware properly checks authentication for protected routes
2. **Grace Period Logic:** The 15-minute window is crucial for edit/delete operations
3. **Error Handling:** Each view has comprehensive error handling strategies documented
4. **Accessibility:** All views must meet WCAG AA compliance standards
5. **Responsive Design:** Mobile-first approach for all views
6. **Performance:** Target < 2 seconds for page loads, < 1 second for pagination
7. **Testing:** Each implementation plan includes testing phases and considerations

## Maintenance and Updates

These implementation plans should be:
- **Updated** when requirements change
- **Referenced** during code reviews
- **Used as templates** for future similar views
- **Kept in sync** with actual implementation (note deviations)

## Success Criteria

Each view implementation is complete when:
- ✅ All components from the plan are implemented
- ✅ All user interactions work as described
- ✅ All validation rules are enforced
- ✅ All error scenarios are handled
- ✅ Accessibility requirements are met
- ✅ Responsive design works on all devices
- ✅ Manual testing passes
- ✅ Cross-browser testing passes
- ✅ Integration with API is complete and tested
- ✅ Code is reviewed and meets project standards

---

**Document Created:** October 30, 2024
**Total Implementation Plans:** 9 (covering all views)
**Status:** ✅ Complete - All plans created and ready for implementation

