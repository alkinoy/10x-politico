# View Implementation Plan: Recent Statements Feed

## 1. Overview

The Recent Statements Feed is the landing page and primary discovery interface for SpeechKarma. It displays the most recently added political statements in reverse chronological order, allowing both anonymous visitors and authenticated users to browse new content. The view enables users to quickly scan what's new, expand statements to read full text, navigate to politician profiles, and access edit/delete controls for their own statements (within the grace period). This view fulfills user stories US-001 (Browse recent statements), US-010 (Statement readability), and US-011 (View party on statement items).

## 2. View Routing

**Path:** `/`

**Authentication Required:** No (public view)

**Access Level:** Public (all users)

## 3. Component Structure

The Recent Statements Feed follows a feed/list layout pattern with the following component hierarchy:

```
RecentStatementsPage (Astro page)
├── Layout (Astro layout)
│   ├── Header (Global navigation)
│   ├── Main Content
│   │   └── RecentStatementsFeed (React component)
│   │       ├── PageHeader
│   │       ├── StatementsLoadingState (conditional)
│   │       ├── StatementsErrorState (conditional)
│   │       ├── StatementsEmptyState (conditional)
│   │       └── StatementsList (conditional)
│   │           ├── StatementCard[] (multiple instances)
│   │           │   ├── PoliticianHeader
│   │           │   │   ├── Avatar
│   │           │   │   ├── PoliticianLink
│   │           │   │   └── PartyBadge
│   │           │   ├── StatementContent
│   │           │   │   ├── Timestamp
│   │           │   │   ├── StatementText (expandable)
│   │           │   │   └── ReadMoreToggle
│   │           │   ├── StatementMetadata
│   │           │   │   ├── ContributorInfo
│   │           │   │   └── SubmissionTime
│   │           │   └── StatementActions
│   │           │       ├── ReportButton
│   │           │       ├── EditButton (conditional)
│   │           │       ├── DeleteButton (conditional)
│   │           │       └── GracePeriodIndicator (conditional)
│   │           └── PaginationControls
│   └── Footer (Global footer)
```

## 4. Component Details

### RecentStatementsPage (Astro Page Component)

**Component description:**  
The main Astro page component that renders the Recent Statements Feed. This server-side component handles initial data fetching during SSR and passes the data to client-side React components for interactivity. It wraps the feed in the global Layout component.

**Main elements:**
- `<Layout>` wrapper with page title and meta tags
- `<main>` element with semantic HTML
- `<RecentStatementsFeed>` React component with hydration directive

**Handled events:**  
None (server-side component)

**Handled validation:**  
None (delegated to API endpoint)

**Types:**
- `PaginatedResponse<StatementDTO>` (from API)
- Initial page number from URL query params

**Props:**  
None (Astro page component, receives data from SSR fetch)

---

### RecentStatementsFeed (React Component)

**Component description:**  
The main interactive container component for the statements feed. Manages data fetching, pagination state, loading states, and orchestrates child components. Handles client-side navigation when users change pages.

**Main elements:**
- `<div>` container with semantic class names
- `<PageHeader>` for title and context
- Conditional rendering of loading/error/empty/content states
- `<StatementsList>` with statements array
- `<PaginationControls>` at bottom

**Handled events:**
- Page change events from PaginationControls
- Statement deletion events (refreshes feed)
- Statement edit navigation events

**Handled validation:**  
None (displays data from validated API response)

**Types:**
- `PaginatedResponse<StatementDTO>` (response type)
- `FeedState` (view model for component state)

**Props:**
```typescript
interface RecentStatementsFeedProps {
  initialData: PaginatedResponse<StatementDTO>;
  initialPage: number;
  currentUserId?: string | null;
}
```

---

### PageHeader (React Component)

**Component description:**  
Simple presentational component displaying the page title and optional subtitle/context for the feed.

**Main elements:**
- `<header>` element
- `<h1>` for page title ("Recent Statements")
- Optional `<p>` for subtitle/context

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None (static content)

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}
```

---

### StatementsList (React Component)

**Component description:**  
Container component that maps over the statements array and renders individual StatementCard components. Provides a consistent list structure and spacing.

**Main elements:**
- `<section>` or `<div>` container with ARIA label
- Array of `<StatementCard>` components
- Proper list semantics

**Handled events:**  
Passes events from child StatementCards up to parent

**Handled validation:**  
None

**Types:**
- `StatementDTO[]` (array of statements)

**Props:**
```typescript
interface StatementsListProps {
  statements: StatementDTO[];
  currentUserId?: string | null;
  onStatementDeleted: (statementId: string) => void;
}
```

---

### StatementCard (React Component)

**Component description:**  
The core reusable component displaying a single statement with all metadata, politician information, and available actions. Handles text truncation/expansion, displays party badges, and conditionally shows edit/delete controls for statement owners within the grace period.

**Main elements:**
- `<article>` wrapper for semantic HTML
- `<PoliticianHeader>` with avatar, name link, and party badge
- `<StatementContent>` with timestamp and expandable text
- `<StatementMetadata>` with contributor info
- `<StatementActions>` with report/edit/delete buttons

**Handled events:**
- Read more/less toggle click
- Navigate to politician detail page
- Report button click (opens modal)
- Edit button click (navigates to edit page)
- Delete button click (opens confirmation, calls delete API)

**Handled validation:**
- Grace period validation for showing edit/delete buttons
- Ownership validation for showing edit/delete buttons

**Types:**
- `StatementDTO` (statement data)
- `StatementCardState` (local state for expansion)

**Props:**
```typescript
interface StatementCardProps {
  statement: StatementDTO;
  currentUserId?: string | null;
  onDeleted: (statementId: string) => void;
}
```

---

### PoliticianHeader (React Component)

**Component description:**  
Displays politician identification information at the top of each statement card, including avatar, full name as a clickable link, and party affiliation badge.

**Main elements:**
- `<div>` container with flex layout
- `<Avatar>` showing initials or image
- `<a>` link to politician detail page
- `<PartyBadge>` with color and text

**Handled events:**
- Click on politician name (navigation)

**Handled validation:**  
None

**Types:**
- `PoliticianInStatementDTO` (politician data)

**Props:**
```typescript
interface PoliticianHeaderProps {
  politician: PoliticianInStatementDTO;
}
```

---

### Avatar (React Component)

**Component description:**  
Displays politician avatar as initials (first + last name) or image (future enhancement). Provides visual identification with consistent sizing and styling.

**Main elements:**
- `<div>` or `<span>` with circular styling
- Text content (initials) or `<img>` element

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `name: string` for generating initials

**Props:**
```typescript
interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}
```

---

### PartyBadge (React Component)

**Component description:**  
Displays political party affiliation with color accent and text label. Ensures accessibility by not relying on color alone for meaning.

**Main elements:**
- `<span>` or `<div>` with badge styling
- Party name or abbreviation text
- Background or border color from party.color_hex

**Handled events:**  
None

**Handled validation:**  
Color contrast validation against background (ensure 4.5:1 ratio)

**Types:**
- `PartyInStatementDTO` (party data)

**Props:**
```typescript
interface PartyBadgeProps {
  party: PartyInStatementDTO;
  variant?: 'default' | 'compact';
}
```

---

### StatementContent (React Component)

**Component description:**  
Displays the statement timestamp and text with truncation/expansion functionality. Shows "when the statement was made" and the actual statement text, with a "Read more" toggle for long statements.

**Main elements:**
- `<div>` container
- `<time>` element with statement_timestamp
- `<p>` or `<div>` for statement text with conditional truncation
- `<button>` for Read more/less toggle

**Handled events:**
- Click on "Read more" button (toggles expansion state)
- Click on "Read less" button (toggles back to truncated)

**Handled validation:**  
None

**Types:**
- `statement_text: string`
- `statement_timestamp: string`
- Local state for expanded/collapsed

**Props:**
```typescript
interface StatementContentProps {
  statementText: string;
  statementTimestamp: string;
  truncateLines?: number; // Default: 3-4 lines
}
```

---

### StatementMetadata (React Component)

**Component description:**  
Displays metadata about the statement submission, including who added it and when it was added to the platform.

**Main elements:**
- `<div>` container
- `<span>` for contributor display name
- `<time>` element for submission timestamp (created_at)
- Formatted "Added X time ago" text

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `CreatedByDTO` (contributor info)
- `created_at: string` (submission time)

**Props:**
```typescript
interface StatementMetadataProps {
  createdBy: CreatedByDTO;
  createdAt: string;
}
```

---

### StatementActions (React Component)

**Component description:**  
Container for action buttons available on each statement: Report (always visible), Edit and Delete (conditional on ownership and grace period). Displays grace period indicator when user owns the statement.

**Main elements:**
- `<div>` container with button group
- `<ReportButton>` (always visible)
- `<EditButton>` (conditional)
- `<DeleteButton>` (conditional)
- `<GracePeriodIndicator>` (conditional)

**Handled events:**
- Report button click
- Edit button click
- Delete button click

**Handled validation:**
- Ownership check: `statement.created_by_user_id === currentUserId`
- Grace period check: `created_at > now() - 15 minutes`
- Deleted check: Statement not deleted

**Types:**
- `statement: StatementDTO`
- `currentUserId: string | null`

**Props:**
```typescript
interface StatementActionsProps {
  statement: StatementDTO;
  currentUserId?: string | null;
  onEdit: (statementId: string) => void;
  onDelete: (statementId: string) => void;
  onReport: (statementId: string) => void;
}
```

---

### ReportButton (React Component)

**Component description:**  
Discreet button allowing any user to flag a statement for moderation. Opens a ReportModal when clicked.

**Main elements:**
- `<button>` element with icon or text
- Accessible label

**Handled events:**
- Click event (opens report modal)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface ReportButtonProps {
  statementId: string;
  onReport: (statementId: string) => void;
}
```

---

### EditButton (React Component)

**Component description:**  
Button allowing statement owners to edit their statement within the grace period. Navigates to edit statement page.

**Main elements:**
- `<button>` or `<a>` element styled as button
- Icon and/or text label

**Handled events:**
- Click event (navigates to `/statements/:id/edit`)

**Handled validation:**  
None (visibility controlled by parent)

**Types:**  
None

**Props:**
```typescript
interface EditButtonProps {
  statementId: string;
}
```

---

### DeleteButton (React Component)

**Component description:**  
Button allowing statement owners to delete their statement within the grace period. Opens confirmation dialog before proceeding.

**Main elements:**
- `<button>` element
- Icon and/or text label
- Confirmation dialog

**Handled events:**
- Click event (opens confirmation)
- Confirm delete (calls DELETE API)
- Cancel (closes dialog)

**Handled validation:**  
None (visibility controlled by parent)

**Types:**  
None

**Props:**
```typescript
interface DeleteButtonProps {
  statementId: string;
  onDelete: (statementId: string) => void;
}
```

---

### GracePeriodIndicator (React Component)

**Component description:**  
Displays remaining time for edit/delete actions when user owns the statement. Updates every minute and shows warning color when < 5 minutes remain.

**Main elements:**
- `<div>` or `<span>` with time text
- Optional icon (clock)

**Handled events:**  
Timer updates (every 60 seconds)

**Handled validation:**
- Calculate remaining time from `created_at`
- Show warning style when < 5 minutes
- Show "expired" when time is up

**Types:**
- `created_at: string`
- Local state for remaining minutes

**Props:**
```typescript
interface GracePeriodIndicatorProps {
  createdAt: string;
}
```

---

### PaginationControls (React Component)

**Component description:**  
Navigation controls for moving between pages of statements. Displays page numbers, Previous/Next buttons, and current page indicator.

**Main elements:**
- `<nav>` element with aria-label
- Previous `<button>`
- Page number `<button>`s (1, 2, 3, ... N)
- Next `<button>`
- Current page indicator

**Handled events:**
- Previous button click (page - 1)
- Page number button click (go to page N)
- Next button click (page + 1)

**Handled validation:**
- Disable Previous when on page 1
- Disable Next when on last page
- Validate page numbers are within valid range

**Types:**
- `PaginationDTO` (pagination metadata)

**Props:**
```typescript
interface PaginationControlsProps {
  pagination: PaginationDTO;
  currentPage: number;
  onPageChange: (page: number) => void;
}
```

---

### StatementsLoadingState (React Component)

**Component description:**  
Skeleton screen displayed while statements are being fetched from the API. Mimics the structure of actual statement cards.

**Main elements:**
- Multiple skeleton card placeholders
- Shimmer or pulse animation

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface StatementsLoadingStateProps {
  count?: number; // Number of skeleton cards to show (default: 5)
}
```

---

### StatementsErrorState (React Component)

**Component description:**  
Error state displayed when statement fetching fails. Shows user-friendly error message and retry option.

**Main elements:**
- `<div>` container
- Error icon
- Error message text
- Retry `<button>`

**Handled events:**
- Retry button click (refetches data)

**Handled validation:**  
None

**Types:**
- `error: Error | string`

**Props:**
```typescript
interface StatementsErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}
```

---

### StatementsEmptyState (React Component)

**Component description:**  
Empty state displayed when no statements exist in the system. Provides context and optional call-to-action for authenticated users.

**Main elements:**
- `<div>` container
- Icon or illustration
- Message text
- Optional "Add first statement" button for authenticated users

**Handled events:**
- Optional CTA button click (navigates to add statement page)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface StatementsEmptyStateProps {
  isAuthenticated: boolean;
}
```

---

### ReportModal (React Component)

**Component description:**  
Modal dialog for reporting problematic statements. Contains form with reason dropdown and optional comment field.

**Main elements:**
- Modal backdrop
- Modal dialog with `role="dialog"`
- `<form>` element
- Reason `<select>` dropdown
- Comment `<textarea>`
- Submit and Cancel `<button>`s

**Handled events:**
- Open/close modal
- Form submission (POST to report API)
- Cancel button click
- Backdrop click (close)
- Escape key (close)

**Handled validation:**
- Reason is required
- Comment max length: 500 characters

**Types:**
- `CreateReportCommand` (request type)
- `ReportDTO` (response type)

**Props:**
```typescript
interface ReportModalProps {
  statementId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

## 5. Types

### View-Specific Types (ViewModels)

```typescript
/**
 * FeedState - Main state for the RecentStatementsFeed component
 * Manages loading, error, and data states for the feed
 */
interface FeedState {
  isLoading: boolean;
  error: Error | null;
  statements: StatementDTO[];
  pagination: PaginationDTO;
  currentPage: number;
}

/**
 * StatementCardState - Local state for StatementCard component
 * Manages expansion/collapse of statement text
 */
interface StatementCardState {
  isExpanded: boolean;
}

/**
 * GracePeriodState - Computed state for grace period indicator
 * Calculates remaining time for edit/delete actions
 */
interface GracePeriodState {
  remainingMinutes: number;
  isExpired: boolean;
  isWarning: boolean; // true when < 5 minutes
}

/**
 * DeleteConfirmationState - State for delete confirmation dialog
 */
interface DeleteConfirmationState {
  isOpen: boolean;
  statementId: string | null;
}

/**
 * ReportModalState - State for report modal
 */
interface ReportModalState {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
}
```

### DTOs from API (Already Defined in types.ts)

The following DTOs are used as-is from the API responses:

- `StatementDTO`: Complete statement with nested politician and creator info
- `PoliticianInStatementDTO`: Politician info in statement context
- `PartyInStatementDTO`: Party info in statement context
- `CreatedByDTO`: Statement creator info
- `PaginationDTO`: Pagination metadata
- `PaginatedResponse<StatementDTO>`: Complete paginated response
- `CreateReportCommand`: Request type for reporting statements
- `ReportDTO`: Response type after creating report

## 6. State Management

### State Management Strategy

The Recent Statements Feed uses **local React state** managed within the `RecentStatementsFeed` component. No global state management (Redux, Zustand, etc.) is required for MVP.

### Primary State Container: RecentStatementsFeed Component

**State Variables:**

1. **`feedState: FeedState`** - Main state object containing:
   - `isLoading`: Boolean for loading state
   - `error`: Error object or null
   - `statements`: Array of StatementDTO
   - `pagination`: Pagination metadata
   - `currentPage`: Current page number

2. **`reportModalState: ReportModalState`** - State for report modal:
   - `isOpen`: Boolean
   - `isSubmitting`: Boolean
   - `error`: Error message or null

3. **`deleteConfirmation: DeleteConfirmationState`** - State for delete confirmation:
   - `isOpen`: Boolean
   - `statementId`: ID of statement to delete or null

### State Management Patterns

**Initial State from SSR:**
- Component receives `initialData` and `initialPage` as props from Astro SSR
- These are used to set initial state on mount
- Prevents loading state on first render

**State Updates:**
- Page changes trigger new API fetch and update `feedState`
- Successful delete removes statement from local array
- Failed operations update `error` state and display error message

**Client-Side Data Fetching:**
```typescript
const fetchStatements = async (page: number) => {
  setFeedState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const response = await fetch(`/api/statements?page=${page}&limit=50`);
    const data: PaginatedResponse<StatementDTO> = await response.json();
    
    setFeedState({
      isLoading: false,
      error: null,
      statements: data.data,
      pagination: data.pagination,
      currentPage: page
    });
  } catch (error) {
    setFeedState(prev => ({
      ...prev,
      isLoading: false,
      error: error as Error
    }));
  }
};
```

### Custom Hook: useGracePeriod (Optional)

To encapsulate grace period calculation logic:

```typescript
/**
 * Custom hook for calculating grace period state
 * @param createdAt - Statement creation timestamp
 * @returns Grace period state with remaining time and flags
 */
function useGracePeriod(createdAt: string): GracePeriodState {
  const [state, setState] = useState<GracePeriodState>(() => 
    calculateGracePeriod(createdAt)
  );

  useEffect(() => {
    // Update every 60 seconds
    const interval = setInterval(() => {
      setState(calculateGracePeriod(createdAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return state;
}

function calculateGracePeriod(createdAt: string): GracePeriodState {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsed = now - created;
  const gracePeriod = 15 * 60 * 1000; // 15 minutes in ms
  const remaining = Math.max(0, gracePeriod - elapsed);
  const remainingMinutes = Math.ceil(remaining / 60000);

  return {
    remainingMinutes,
    isExpired: remaining <= 0,
    isWarning: remainingMinutes > 0 && remainingMinutes < 5
  };
}
```

### State Flow Summary

1. **Initial Load:** Astro SSR fetches data → passes to React component as props → component initializes state
2. **Pagination:** User clicks page → `fetchStatements(page)` called → updates `feedState`
3. **Delete:** User confirms delete → API called → on success, statement removed from local array → feed re-renders
4. **Grace Period:** Timer updates every minute → `GracePeriodIndicator` re-renders with new time
5. **Report:** User submits report → modal state tracks submission → on success, modal closes with confirmation

## 7. API Integration

### Primary Endpoint: GET /api/statements

**Purpose:** Retrieve paginated list of recent statements for the feed

**Request:**
```typescript
// Query parameters
interface StatementsQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 50, max: 100
  politician_id?: string; // Optional filter (not used in main feed)
  sort_by?: "created_at" | "statement_timestamp"; // Default: "created_at"
  order?: "asc" | "desc"; // Default: "desc"
}

// Example request
GET /api/statements?page=1&limit=50&sort_by=created_at&order=desc
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": StatementDTO[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}

// Error response (400, 500)
{
  "error": {
    "message": string,
    "code": ErrorCode,
    "details"?: Record<string, unknown>
  }
}
```

**Request Type:** `StatementsQueryParams`  
**Response Type:** `PaginatedResponse<StatementDTO>`  
**Error Type:** `ErrorResponse`

### Secondary Endpoint: DELETE /api/statements/:id

**Purpose:** Soft-delete a statement (used by StatementCard delete action)

**Request:**
```typescript
// Headers
Authorization: Bearer <jwt_token>

// No request body
DELETE /api/statements/{statementId}
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": {
    "id": string,
    "deleted_at": string
  }
}

// Error responses
// 401: Authentication required
// 403: Permission denied (not owner or grace period expired)
// 404: Statement not found
// 500: Internal server error
```

**Request Type:** None (just statementId in URL)  
**Response Type:** `SingleResponse<DeletedStatementDTO>`  
**Error Type:** `ErrorResponse`

### Tertiary Endpoint: POST /api/statements/:statement_id/reports

**Purpose:** Submit a report/flag for a statement (used by ReportModal)

**Request:**
```typescript
// Headers (optional auth)
Authorization: Bearer <jwt_token> // Optional

// Request body
{
  "reason": "spam" | "inaccurate" | "inappropriate" | "off_topic" | "other",
  "comment"?: string | null // Max 500 chars
}

POST /api/statements/{statementId}/reports
```

**Response:**
```typescript
// Success response (201 Created)
{
  "data": {
    "id": string,
    "statement_id": string,
    "reason": ReportReason,
    "comment": string | null,
    "reported_by_user_id": string | null,
    "created_at": string
  }
}

// Error responses
// 400: Invalid report data
// 404: Statement not found
// 429: Rate limit exceeded
// 500: Internal server error
```

**Request Type:** `CreateReportCommand`  
**Response Type:** `SingleResponse<ReportDTO>`  
**Error Type:** `ErrorResponse`

### API Integration Implementation

**Fetch Statements:**
```typescript
async function fetchStatements(
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<StatementDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: "created_at",
    order: "desc"
  });

  const response = await fetch(`/api/statements?${params}`);
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

**Delete Statement:**
```typescript
async function deleteStatement(
  statementId: string,
  authToken: string
): Promise<DeletedStatementDTO> {
  const response = await fetch(`/api/statements/${statementId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  const result: SingleResponse<DeletedStatementDTO> = await response.json();
  return result.data;
}
```

**Report Statement:**
```typescript
async function reportStatement(
  statementId: string,
  command: CreateReportCommand,
  authToken?: string
): Promise<ReportDTO> {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`/api/statements/${statementId}/reports`, {
    method: "POST",
    headers,
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  const result: SingleResponse<ReportDTO> = await response.json();
  return result.data;
}
```

## 8. User Interactions

### Primary Interactions

**1. Browse Recent Statements**
- **User Action:** User lands on home page (/)
- **System Response:** Display recent statements feed with first page (50 items)
- **UI Feedback:** Skeleton loading state if data not yet loaded, then smooth transition to content

**2. Read Truncated Statement**
- **User Action:** User views statement card with truncated text
- **System Response:** Display first 3-4 lines of text with "Read more" button
- **UI Feedback:** Text is visually truncated with ellipsis or fade-out effect

**3. Expand Statement**
- **User Action:** User clicks "Read more" button
- **System Response:** Statement text expands inline to show full content, button changes to "Read less"
- **UI Feedback:** Smooth height animation, no page navigation or reload

**4. Collapse Statement**
- **User Action:** User clicks "Read less" button
- **System Response:** Statement text collapses back to truncated view
- **UI Feedback:** Smooth height animation, button changes back to "Read more"

**5. Navigate to Politician Detail**
- **User Action:** User clicks politician name link in statement card
- **System Response:** Navigate to `/politicians/:id` page
- **UI Feedback:** Standard browser navigation, new page loads with politician profile and timeline

**6. Navigate to Next/Previous Page**
- **User Action:** User clicks "Next" or "Previous" button in pagination controls
- **System Response:** Fetch new page of statements, update URL with `?page=N`, scroll to top
- **UI Feedback:** Loading skeleton during fetch, smooth content replacement

**7. Navigate to Specific Page**
- **User Action:** User clicks specific page number in pagination controls
- **System Response:** Fetch that page of statements, update URL
- **UI Feedback:** Loading skeleton, smooth content replacement

### Secondary Interactions (Authenticated Users)

**8. View Own Statement with Grace Period**
- **User Action:** Authenticated user views their own statement within 15 minutes
- **System Response:** Display edit and delete buttons, show grace period indicator
- **UI Feedback:** Buttons are clearly visible and enabled, grace period shows "X minutes remaining"

**9. Edit Own Statement**
- **User Action:** User clicks "Edit" button on their statement
- **System Response:** Navigate to `/statements/:id/edit` page
- **UI Feedback:** Standard navigation to edit form

**10. Delete Own Statement - Initiate**
- **User Action:** User clicks "Delete" button on their statement
- **System Response:** Open confirmation dialog with warning message
- **UI Feedback:** Modal dialog appears with backdrop, focus trapped in dialog

**11. Delete Own Statement - Confirm**
- **User Action:** User clicks "Confirm" in delete dialog
- **System Response:** Call DELETE API, remove statement from feed on success
- **UI Feedback:** Loading state on button, dialog closes, statement smoothly removed from list, success toast message

**12. Delete Own Statement - Cancel**
- **User Action:** User clicks "Cancel" or presses Escape or clicks backdrop
- **System Response:** Close dialog without deleting
- **UI Feedback:** Dialog closes, statement remains unchanged

**13. Report Statement - Open Modal**
- **User Action:** User clicks "Report" button on any statement
- **System Response:** Open report modal with form
- **UI Feedback:** Modal appears with backdrop, focus moves to first form field

**14. Report Statement - Submit**
- **User Action:** User selects reason, optionally adds comment, clicks "Submit Report"
- **System Response:** Validate form, call POST report API, close modal on success
- **UI Feedback:** Loading state on submit button, validation errors shown inline, success message after close

**15. Report Statement - Cancel**
- **User Action:** User clicks "Cancel" or closes modal
- **System Response:** Close modal without submitting
- **UI Feedback:** Modal closes, form resets

### Error Interactions

**16. Retry Failed Load**
- **User Action:** User clicks "Retry" button in error state
- **System Response:** Re-fetch statements data
- **UI Feedback:** Loading state, either show content or error state again

**17. Handle Delete Error**
- **User Action:** Delete API call fails (e.g., grace period expired, network error)
- **System Response:** Display error message, keep statement in feed
- **UI Feedback:** Error toast or inline message, dialog closes, statement unchanged

**18. Handle Report Error**
- **User Action:** Report API call fails (e.g., validation error, rate limit)
- **System Response:** Display error message in modal
- **UI Feedback:** Error message shown in modal, form remains open, user can fix and retry

## 9. Conditions and Validation

### Display Conditions

**1. Edit/Delete Button Visibility**

**Components Affected:** `StatementActions`, `EditButton`, `DeleteButton`

**Conditions:**
- User is authenticated: `currentUserId != null`
- User owns the statement: `statement.created_by_user_id === currentUserId`
- Statement is not deleted: `statement.deleted_at === null` (always true in feed, as deleted statements are filtered)
- Within grace period: `statement.created_at > (now() - 15 minutes)`

**Validation Logic:**
```typescript
function canEditOrDelete(statement: StatementDTO, currentUserId: string | null): boolean {
  if (!currentUserId) return false;
  if (statement.created_by_user_id !== currentUserId) return false;
  
  const created = new Date(statement.created_at).getTime();
  const now = Date.now();
  const gracePeriod = 15 * 60 * 1000; // 15 minutes
  
  return (now - created) < gracePeriod;
}
```

**Interface Impact:** If conditions not met, edit/delete buttons are not rendered. Grace period indicator is also hidden.

---

**2. Grace Period Indicator Display**

**Components Affected:** `GracePeriodIndicator`

**Conditions:**
- User owns statement (same as edit/delete)
- Within grace period
- Grace period not expired

**Validation Logic:**
```typescript
function shouldShowGracePeriod(statement: StatementDTO, currentUserId: string | null): boolean {
  return canEditOrDelete(statement, currentUserId);
}
```

**Interface Impact:** Indicator shows remaining minutes. Updates every 60 seconds. Shows warning color when < 5 minutes.

---

**3. Statement Text Truncation**

**Components Affected:** `StatementContent`

**Conditions:**
- Statement text longer than 3-4 lines (approximately 200-250 characters)
- Component not in expanded state

**Validation Logic:**
```typescript
function shouldTruncate(text: string, maxLines: number = 3): boolean {
  // Estimate: ~70 characters per line
  const estimatedLines = text.length / 70;
  return estimatedLines > maxLines;
}
```

**Interface Impact:** If truncation needed, show truncated text with "Read more" button. If not needed, show full text without button.

---

**4. Empty State Display**

**Components Affected:** `RecentStatementsFeed`, `StatementsEmptyState`

**Conditions:**
- API request succeeded
- Returned data array is empty: `statements.length === 0`
- No error occurred

**Interface Impact:** Show empty state message. If user is authenticated, show "Add first statement" CTA.

---

**5. Loading State Display**

**Components Affected:** `RecentStatementsFeed`, `StatementsLoadingState`

**Conditions:**
- API request in progress: `feedState.isLoading === true`

**Interface Impact:** Show skeleton screens instead of actual content. Hide pagination controls.

---

**6. Error State Display**

**Components Affected:** `RecentStatementsFeed`, `StatementsErrorState`

**Conditions:**
- API request failed: `feedState.error !== null`
- Error occurred during fetch or delete

**Interface Impact:** Show error message with retry button. Hide statements list and pagination.

---

**7. Pagination Controls State**

**Components Affected:** `PaginationControls`

**Conditions:**
- **Disable Previous:** `currentPage === 1`
- **Disable Next:** `currentPage === pagination.total_pages`
- **Show page numbers:** `total_pages > 1`

**Validation Logic:**
```typescript
function getPaginationState(currentPage: number, totalPages: number) {
  return {
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    showPagination: totalPages > 1,
    pageRange: generatePageNumbers(currentPage, totalPages) // e.g., [1, 2, 3, ..., 10]
  };
}
```

**Interface Impact:** Disabled buttons have visual disabled state and `aria-disabled="true"`. Entire pagination hidden if only one page.

### Form Validation (Report Modal)

**8. Report Reason Validation**

**Components Affected:** `ReportModal`

**Conditions:**
- Reason field is required
- Must be one of valid enum values: `spam`, `inaccurate`, `inappropriate`, `off_topic`, `other`

**Validation Logic:**
```typescript
function validateReason(reason: string): string | null {
  if (!reason || reason.trim() === "") {
    return "Please select a reason for reporting";
  }
  
  const validReasons = ["spam", "inaccurate", "inappropriate", "off_topic", "other"];
  if (!validReasons.includes(reason)) {
    return "Invalid reason selected";
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show error message below dropdown if invalid. Disable submit button if invalid.

---

**9. Report Comment Validation**

**Components Affected:** `ReportModal`

**Conditions:**
- Comment is optional
- If provided, max length 500 characters

**Validation Logic:**
```typescript
function validateComment(comment: string): string | null {
  if (comment && comment.length > 500) {
    return `Comment cannot exceed 500 characters (current: ${comment.length})`;
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show character counter. Show error message if exceeds limit. Prevent submission if invalid.

## 10. Error Handling

### Error Categories and Handling Strategies

**1. Network Errors (Failed API Requests)**

**Scenarios:**
- Server unreachable
- Network timeout
- DNS resolution failure

**Handling:**
- Display `StatementsErrorState` with message: "Unable to load statements. Please check your connection."
- Provide "Retry" button to refetch data
- Log error to console for debugging

**User Experience:**
- Clear error message explaining the issue
- Action to resolve (retry)
- System remains usable (header/footer still functional)

---

**2. API Validation Errors (400 Bad Request)**

**Scenarios:**
- Invalid page number (page < 1)
- Limit exceeds maximum (limit > 100)
- Invalid politician_id format

**Handling:**
- For pagination: Reset to page 1 and retry
- For reports: Display validation error inline in modal
- Show specific error message from API response

**User Experience:**
- Specific, actionable error messages
- Form remains open for corrections
- Validation errors appear near relevant fields

---

**3. Authentication Errors (401 Unauthorized)**

**Scenarios:**
- User's session expired during delete action
- Invalid or missing JWT token

**Handling:**
- Display error toast: "Your session has expired. Please sign in again."
- Optionally redirect to `/auth` with return URL
- Clear local auth state

**User Experience:**
- Clear explanation that re-authentication is needed
- Easy path to sign in again
- Preserve user's intended action (return URL)

---

**4. Permission Errors (403 Forbidden)**

**Scenarios:**
- Grace period expired while user had edit/delete dialog open
- User doesn't own statement (shouldn't happen if UI working correctly)

**Handling:**
- For delete: Show error message "The grace period has expired. You can no longer delete this statement."
- Close dialog
- Remove edit/delete buttons from UI
- Provide explanation in toast notification

**User Experience:**
- Clear explanation of why action failed
- Visual update (buttons removed)
- No confusion about capabilities

---

**5. Not Found Errors (404 Not Found)**

**Scenarios:**
- Statement was deleted by another session/device
- Statement ID invalid (shouldn't happen in normal flow)

**Handling:**
- For delete: Show error "Statement not found or already deleted"
- Remove statement from feed
- Close dialog

**User Experience:**
- Statement removed from view (since it no longer exists)
- Brief notification explaining what happened

---

**6. Rate Limit Errors (429 Too Many Requests)**

**Scenarios:**
- User submits too many reports in short time
- General API rate limiting

**Handling:**
- Display error message: "You've submitted too many requests. Please wait a moment and try again."
- Disable submit button temporarily
- Show countdown if `Retry-After` header provided

**User Experience:**
- Clear explanation of rate limit
- Visual indication of when they can try again
- Form remains open with data preserved

---

**7. Server Errors (500 Internal Server Error)**

**Scenarios:**
- Database connection failure
- Unexpected server exception
- Service unavailable

**Handling:**
- Display generic error message: "Something went wrong. Please try again later."
- Provide "Retry" button
- Log error details for debugging
- Show support contact info for persistent issues

**User Experience:**
- Clear but not overly technical error message
- Option to retry
- Path to get help if issue persists

---

**8. Client-Side Errors (JavaScript Exceptions)**

**Scenarios:**
- React rendering error
- Unexpected null/undefined value
- Type mismatch

**Handling:**
- Use React Error Boundary to catch rendering errors
- Display fallback UI: "An unexpected error occurred"
- Log error to console and monitoring service
- Provide "Reload page" button

**User Experience:**
- Graceful degradation instead of blank screen
- Clear action to recover (reload)
- Error doesn't crash entire application

---

### Error UI Components

**Error Toast/Notification:**
```typescript
interface ErrorToastProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number; // Auto-dismiss after N ms
  onClose: () => void;
}
```

**Error Boundary:**
```typescript
class StatementFeedErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Statement feed error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### Error Recovery Strategies

**Automatic Recovery:**
- Retry failed requests after short delay (3-5 seconds)
- Maximum 2-3 automatic retries before showing error to user
- Exponential backoff for retries

**User-Initiated Recovery:**
- "Retry" button for failed fetches
- "Reload page" for critical errors
- Clear cache and retry for persistent issues

**Graceful Degradation:**
- Show cached data if available while retrying
- Allow other parts of UI to remain functional
- Disable only the specific failing feature

## 11. Implementation Steps

### Phase 1: Setup and Basic Structure (Estimated: 2-3 hours)

**Step 1: Create Basic Page Structure**
- Create `src/pages/index.astro` if not exists
- Import Layout component
- Add basic HTML structure with semantic elements
- Set page title and meta tags

**Step 2: Setup API Data Fetching in Astro**
- Add server-side data fetch in Astro frontmatter
- Call GET `/api/statements?page=1&limit=50`
- Handle errors gracefully (show error page if API fails on SSR)
- Pass data to client component as props

**Step 3: Create Main Feed Component**
- Create `src/components/RecentStatementsFeed.tsx`
- Setup basic component structure with TypeScript
- Define props interface
- Setup initial state from props
- Add placeholder rendering

**Step 4: Implement Loading and Error States**
- Create `StatementsLoadingState.tsx` with skeleton cards
- Create `StatementsErrorState.tsx` with error message and retry button
- Create `StatementsEmptyState.tsx` with empty message
- Wire up conditional rendering in main feed component

---

### Phase 2: Core Statement Display (Estimated: 4-5 hours)

**Step 5: Create StatementCard Component**
- Create `src/components/StatementCard.tsx`
- Define props interface accepting `StatementDTO`
- Setup basic card layout with semantic HTML (`<article>`)
- Add Tailwind styling for card appearance

**Step 6: Implement Politician Header Section**
- Create `Avatar.tsx` component for politician initials
- Create `PoliticianHeader.tsx` combining avatar and name link
- Create `PartyBadge.tsx` with dynamic color styling
- Implement proper link to `/politicians/:id`
- Ensure color contrast meets accessibility requirements

**Step 7: Implement Statement Content Section**
- Create `StatementContent.tsx` component
- Display statement timestamp using `<time>` element
- Display statement text with proper formatting
- Implement basic text layout and styling

**Step 8: Implement Statement Metadata Section**
- Create `StatementMetadata.tsx` component
- Display contributor name from `created_by.display_name`
- Display relative submission time ("Added X hours ago")
- Use date-fns or similar library for time formatting

**Step 9: Setup Statement Actions Section**
- Create `StatementActions.tsx` container component
- Create `ReportButton.tsx` with icon and label
- Add basic layout for action buttons
- Add placeholder for conditional edit/delete buttons

---

### Phase 3: Interactive Features (Estimated: 4-5 hours)

**Step 10: Implement Text Truncation and Expansion**
- Add local state to `StatementContent` for expanded/collapsed
- Implement truncation logic (CSS line-clamp or character count)
- Add "Read more" / "Read less" button
- Implement toggle handler
- Add smooth CSS transition for height change

**Step 11: Implement Edit and Delete Buttons**
- Create `EditButton.tsx` linking to `/statements/:id/edit`
- Create `DeleteButton.tsx` with confirmation dialog
- Implement ownership and grace period validation logic
- Conditionally render based on `canEditOrDelete` function
- Add confirmation modal for delete action

**Step 12: Implement Grace Period Indicator**
- Create `GracePeriodIndicator.tsx` component
- Implement `useGracePeriod` custom hook
- Calculate remaining time from `created_at`
- Setup interval to update every 60 seconds
- Add warning styling when < 5 minutes
- Display "X minutes remaining" text

**Step 13: Implement Delete Functionality**
- Create delete confirmation dialog/modal
- Implement DELETE API call with JWT token
- Handle success: remove statement from feed, show toast
- Handle errors: display error message, keep statement in feed
- Cleanup: close dialog, reset state

**Step 14: Implement Report Modal**
- Create `ReportModal.tsx` component with dialog
- Implement modal open/close state and handlers
- Create form with reason dropdown and comment textarea
- Add form validation logic
- Implement POST report API call
- Handle success: close modal, show confirmation
- Handle errors: display error in modal, allow retry
- Implement focus trap and keyboard controls (Escape to close)

---

### Phase 4: Pagination (Estimated: 2-3 hours)

**Step 15: Create Pagination Controls Component**
- Create `PaginationControls.tsx` component
- Define props interface with pagination metadata
- Implement Previous/Next buttons
- Implement page number buttons (with smart range display)
- Add proper ARIA labels and keyboard navigation
- Implement disabled states for first/last page

**Step 16: Implement Pagination Logic**
- Add pagination handler in main feed component
- Implement `fetchStatements(page)` function
- Update URL with query parameter `?page=N`
- Scroll to top on page change
- Update state with new data
- Show loading state during fetch

**Step 17: Handle Browser Back/Forward**
- Read initial page from URL query params in Astro SSR
- Pass initial page to React component
- Ensure URL stays in sync with current page
- Test browser back/forward navigation

---

### Phase 5: Authentication Integration (Estimated: 2-3 hours)

**Step 18: Get Current User from Session**
- Implement auth check in Astro page
- Get current user ID from Supabase session (if exists)
- Pass `currentUserId` to React component as prop
- Handle both authenticated and anonymous states

**Step 19: Conditional Rendering Based on Auth**
- Pass `currentUserId` down to `StatementCard` components
- Implement ownership check in `StatementActions`
- Show/hide edit/delete buttons based on ownership
- Test with multiple users and statements

**Step 20: Implement JWT Token Management**
- Get JWT token from Supabase session for API calls
- Pass token to delete and report functions
- Handle token expiration gracefully
- Redirect to auth page if session expired during action

---

### Phase 6: Polish and Optimization (Estimated: 3-4 hours)

**Step 21: Implement Responsive Design**
- Test layout on mobile, tablet, desktop breakpoints
- Adjust card layout for different screen sizes
- Ensure touch targets are ≥ 44x44px on mobile
- Test horizontal scrolling and overflow
- Optimize pagination controls for mobile

**Step 22: Implement Accessibility Features**
- Add proper ARIA labels to all interactive elements
- Ensure keyboard navigation works for all controls
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Verify color contrast ratios (WCAG AA)
- Add skip links if needed
- Ensure focus management in modals
- Test tab order throughout page

**Step 23: Add Loading Skeletons**
- Design skeleton cards that match actual card structure
- Add subtle shimmer or pulse animation
- Test skeleton state during slow network
- Ensure skeleton count matches expected items per page

**Step 24: Performance Optimization**
- Memoize expensive calculations with `useMemo`
- Wrap event handlers in `useCallback`
- Consider React.memo for StatementCard if re-renders are expensive
- Lazy load ReportModal component
- Test loading performance with large datasets

**Step 25: Error Handling Polish**
- Implement Error Boundary around feed
- Add error toast/notification system
- Test all error scenarios (network, 404, 500, etc.)
- Ensure error messages are user-friendly
- Add retry mechanisms where appropriate

---

### Phase 7: Testing and Refinement (Estimated: 2-3 hours)

**Step 26: Manual Testing**
- Test all user interactions documented in section 8
- Test with and without authentication
- Test edge cases (empty feed, single item, grace period expiration)
- Test browser back/forward navigation
- Test on different browsers (Chrome, Firefox, Safari)
- Test on different devices (mobile, tablet, desktop)

**Step 27: Accessibility Testing**
- Run automated accessibility audit (Lighthouse, axe)
- Manual keyboard navigation testing
- Screen reader testing (at least one screen reader)
- Color contrast verification
- Focus indicator visibility

**Step 28: Performance Testing**
- Measure page load time (target < 2 seconds)
- Test with slow 3G network throttling
- Check for unnecessary re-renders
- Verify pagination load time (target < 1 second)
- Run Lighthouse performance audit

**Step 29: Cross-Browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test on iOS Safari and Chrome (mobile)
- Test on Android Chrome (mobile)
- Fix any browser-specific issues

**Step 30: Final Polish and Documentation**
- Add inline code comments for complex logic
- Document any gotchas or important considerations
- Update any relevant documentation files
- Create screenshots or video demo
- Prepare for code review

---

### Estimated Total Time: 19-26 hours

**Note:** Time estimates assume:
- Developer is familiar with React, TypeScript, Astro, and Tailwind
- Shadcn/ui components are already set up in the project
- API endpoints are fully functional and tested
- Design system and styling guidelines are established

**Dependencies:**
- Completed API implementation (GET /api/statements, DELETE /api/statements/:id, POST /api/statements/:id/reports)
- Shadcn/ui components installed and configured
- Authentication system functional (Supabase)
- Basic layout and navigation components completed

