# View Implementation Plan: Politician Detail Page

## 1. Overview

The Politician Detail Page provides a comprehensive view of a single politician's profile and complete statement timeline. It enables voters to research a politician's positions over time, understand their consistency, and evaluate their public statements. The view combines a profile header with biography and metadata, alongside a filterable and paginated timeline of all statements attributed to that politician. This view fulfills user stories US-003 (View politician's timeline), US-010 (Statement readability), and US-011 (View party).

## 2. View Routing

**Path:** `/politicians/:id`

**Authentication Required:** No (public view)

**Access Level:** Public (all users)

**Dynamic Parameters:**
- `:id` - UUID of the politician

## 3. Component Structure

The Politician Detail Page follows a detail layout pattern with profile header and timeline:

```
PoliticianDetailPage (Astro page)
├── Layout (Astro layout)
│   ├── Header (Global navigation)
│   ├── Main Content
│   │   └── PoliticianDetail (React component)
│   │       ├── PoliticianNotFound (conditional - 404 state)
│   │       ├── PoliticianLoadingState (conditional)
│   │       ├── PoliticianErrorState (conditional)
│   │       └── PoliticianContent (conditional)
│   │           ├── PoliticianHeader
│   │           │   ├── PoliticianAvatar
│   │           │   ├── PoliticianName
│   │           │   ├── PartyBadge
│   │           │   ├── Biography
│   │           │   └── StatementCountBadge
│   │           ├── TimelineSection
│   │           │   ├── SectionHeader
│   │           │   ├── TimeRangeFilter
│   │           │   │   └── FilterButton[] (4 options)
│   │           │   ├── StatementsLoadingState (conditional)
│   │           │   ├── StatementsErrorState (conditional)
│   │           │   ├── StatementsEmptyState (conditional)
│   │           │   └── StatementsList (conditional)
│   │           │       ├── StatementCard[] (reused component)
│   │           │       └── PaginationControls
│   └── Footer (Global footer)
```

## 4. Component Details

### PoliticianDetailPage (Astro Page Component)

**Component description:**  
The main Astro page component that handles SSR fetching of both politician profile and initial statements data. Validates politician ID, handles 404 cases, and passes data to client-side React component.

**Main elements:**
- `<Layout>` wrapper with dynamic page title
- `<main>` element with semantic HTML
- `<PoliticianDetail>` React component with hydration directive

**Handled events:**  
None (server-side component)

**Handled validation:**
- Politician ID format validation (UUID)
- 404 handling if politician not found
- Time range and page parameter validation from URL

**Types:**
- `PoliticianDetailDTO` (politician with full data)
- `PaginatedResponse<StatementDetailDTO>` (statements with permissions)
- URL parameters (id, time_range, page)

**Props:**  
None (Astro page component)

---

### PoliticianDetail (React Component)

**Component description:**  
Main container component orchestrating the politician detail view. Manages timeline filtering, pagination, and statement refresh after delete actions.

**Main elements:**
- `<div>` container with semantic structure
- Conditional rendering for 404/loading/error/content states
- `<PoliticianHeader>` with profile information
- `<TimelineSection>` with filter and statements

**Handled events:**
- Time range filter changes
- Page navigation
- Statement deletion (refreshes timeline)

**Handled validation:**  
None (displays validated data from API)

**Types:**
- `PoliticianDetailDTO` (politician data)
- `DetailState` (view model for component state)

**Props:**
```typescript
interface PoliticianDetailProps {
  politicianId: string;
  initialPolitician: PoliticianDetailDTO;
  initialStatements: PaginatedResponse<StatementDetailDTO>;
  initialTimeRange: TimeRange;
  initialPage: number;
  currentUserId?: string | null;
}
```

---

### PoliticianHeader (React Component)

**Component description:**  
Profile information card displaying comprehensive politician details. Shows avatar, name, party affiliation, biography, and statement count in a visually prominent layout.

**Main elements:**
- `<header>` or `<section>` container
- `<PoliticianAvatar>` (larger size than list view)
- `<h1>` for politician name
- `<PartyBadge>` (prominent display)
- `<p>` tags for biography paragraphs
- `<StatementCountBadge>` showing total statements

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `PoliticianDetailDTO` (complete politician data)

**Props:**
```typescript
interface PoliticianHeaderProps {
  politician: PoliticianDetailDTO;
}
```

---

### PoliticianAvatar (React Component)

**Component description:**  
Larger version of avatar component showing politician initials. Used in header for prominent display.

**Main elements:**
- `<div>` with circular styling
- Text content showing initials

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `firstName: string`, `lastName: string`

**Props:**
```typescript
interface PoliticianAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // xl for detail page
}
```

---

### Biography (React Component)

**Component description:**  
Displays full biography text with proper paragraph formatting. Handles null/empty biography gracefully.

**Main elements:**
- `<div>` container
- `<p>` tags for biography text
- Placeholder text if no biography

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `biography: string | null`

**Props:**
```typescript
interface BiographyProps {
  biography: string | null;
}
```

---

### StatementCountBadge (React Component)

**Component description:**  
Badge or label displaying total number of statements attributed to politician. Provides quick overview of politician's activity level.

**Main elements:**
- `<span>` or `<div>` styled as badge
- Count number and label text

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `count: number`

**Props:**
```typescript
interface StatementCountBadgeProps {
  count: number;
}
```

---

### TimelineSection (React Component)

**Component description:**  
Container section for the statement timeline, including filter controls and statement list. Manages timeline-specific state.

**Main elements:**
- `<section>` container
- `<SectionHeader>` with "Statement Timeline" heading
- `<TimeRangeFilter>` component
- Conditional rendering of loading/error/empty/content states
- `<StatementsList>` with statements
- `<PaginationControls>`

**Handled events:**
- Filter selection changes
- Page navigation
- Statement deletion

**Handled validation:**  
None

**Types:**
- `StatementDetailDTO[]` (statements array)
- `TimelineState` (timeline-specific state)

**Props:**
```typescript
interface TimelineSectionProps {
  politicianId: string;
  statements: StatementDetailDTO[];
  pagination: PaginationDTO;
  currentPage: number;
  timeRange: TimeRange;
  currentUserId?: string | null;
  onFilterChange: (timeRange: TimeRange) => void;
  onPageChange: (page: number) => void;
  onStatementDeleted: (statementId: string) => void;
}
```

---

### SectionHeader (React Component)

**Component description:**  
Simple header for the timeline section with descriptive heading.

**Main elements:**
- `<header>` element
- `<h2>` for "Statement Timeline" heading

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface SectionHeaderProps {
  title: string;
}
```

---

### TimeRangeFilter (React Component)

**Component description:**  
Segmented control or button group allowing users to filter statements by time period. Displays four options with clear visual indication of active selection. Updates URL when changed.

**Main elements:**
- `<div>` container with role="group" or role="radiogroup"
- Four `<FilterButton>` components for each time range option
- ARIA attributes for accessibility

**Handled events:**
- Filter button click (changes active filter)

**Handled validation:**  
None (predefined options)

**Types:**
- `TimeRange` enum/type: `'7d' | '30d' | '365d' | 'all'`
- `activeFilter: TimeRange`

**Props:**
```typescript
interface TimeRangeFilterProps {
  activeFilter: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}
```

---

### FilterButton (React Component)

**Component description:**  
Individual filter option button within TimeRangeFilter. Shows active/inactive state clearly.

**Main elements:**
- `<button>` element with appropriate ARIA attributes
- Text label (e.g., "Last 7 Days", "All Time")

**Handled events:**
- Click event (triggers filter change)

**Handled validation:**  
None

**Types:**
- `TimeRange` value

**Props:**
```typescript
interface FilterButtonProps {
  timeRange: TimeRange;
  label: string;
  isActive: boolean;
  onClick: (timeRange: TimeRange) => void;
}
```

---

### StatementsList (React Component)

**Component description:**  
Container for statement cards in the timeline. Displays statements in reverse chronological order by statement_timestamp.

**Main elements:**
- `<div>` or `<section>` container
- Array of `<StatementCard>` components (reused from Recent Statements)
- Consistent spacing between cards

**Handled events:**
- Statement deletion events from cards

**Handled validation:**  
None

**Types:**
- `StatementDetailDTO[]` (includes can_edit and can_delete flags)

**Props:**
```typescript
interface StatementsListProps {
  statements: StatementDetailDTO[];
  currentUserId?: string | null;
  onStatementDeleted: (statementId: string) => void;
}
```

---

### StatementCard (React Component)

**Component description:**  
**REUSED FROM RECENT STATEMENTS VIEW** - Same statement card component with all functionality (expand/collapse, report, edit/delete). Includes can_edit and can_delete flags from API for permission display.

**Main elements:**
- All elements from Recent Statements StatementCard
- Uses `StatementDetailDTO` which includes permission flags

**Handled events:**
- All events from Recent Statements StatementCard

**Handled validation:**
- All validation from Recent Statements StatementCard

**Types:**
- `StatementDetailDTO` (extends StatementDTO with can_edit and can_delete)

**Props:**
```typescript
interface StatementCardProps {
  statement: StatementDetailDTO;
  currentUserId?: string | null;
  onDeleted: (statementId: string) => void;
  hidePoliticianInfo?: boolean; // New prop: hide politician section (redundant on detail page)
}
```

---

### StatementsLoadingState (React Component)

**Component description:**  
Skeleton loading state for statement timeline. Shows placeholder statement cards.

**Main elements:**
- Skeleton statement card placeholders
- Shimmer animation

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface StatementsLoadingStateProps {
  count?: number; // Default: 5
}
```

---

### StatementsErrorState (React Component)

**Component description:**  
Error state for timeline when statement fetching fails. Allows retry while maintaining filter selection.

**Main elements:**
- `<div>` container
- Error icon and message
- Retry `<button>`

**Handled events:**
- Retry button click

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
Empty state for timeline when no statements exist in selected time range. Suggests expanding filter or provides context.

**Main elements:**
- `<div>` container
- Icon or illustration
- Context-aware message
- Optional suggestion to change filter

**Handled events:**
- Optional "Show all time" button click

**Handled validation:**  
None

**Types:**
- `TimeRange` (to provide context-aware message)

**Props:**
```typescript
interface StatementsEmptyStateProps {
  timeRange: TimeRange;
  politicianName: string;
  onShowAllTime?: () => void; // Quick action to reset to "all"
}
```

---

### PoliticianNotFound (React Component)

**Component description:**  
404 state displayed when politician ID is invalid or politician doesn't exist. Provides navigation back to directory.

**Main elements:**
- `<div>` container
- 404 message
- Error icon
- Link back to politicians directory

**Handled events:**  
None (just navigation link)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PoliticianNotFoundProps {
  politicianId: string;
}
```

---

### PoliticianLoadingState (React Component)

**Component description:**  
Loading skeleton for initial page load. Shows skeleton for both profile header and timeline.

**Main elements:**
- Skeleton for profile header
- Skeleton for timeline section

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**  
None

---

### PoliticianErrorState (React Component)

**Component description:**  
Error state for entire page when politician data fetch fails. Provides retry option.

**Main elements:**
- `<div>` container
- Error icon and message
- Retry `<button>`

**Handled events:**
- Retry button click

**Handled validation:**  
None

**Types:**
- `error: Error | string`

**Props:**
```typescript
interface PoliticianErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}
```

## 5. Types

### View-Specific Types (ViewModels)

```typescript
/**
 * TimeRange - Enum for time range filter options
 */
type TimeRange = '7d' | '30d' | '365d' | 'all';

/**
 * DetailState - Main state for the PoliticianDetail component
 */
interface DetailState {
  // Politician profile state
  politician: PoliticianDetailDTO | null;
  profileLoading: boolean;
  profileError: Error | null;
  
  // Timeline state
  statements: StatementDetailDTO[];
  statementsLoading: boolean;
  statementsError: Error | null;
  pagination: PaginationDTO;
  currentPage: number;
  timeRange: TimeRange;
}

/**
 * TimelineState - State specific to timeline section
 */
interface TimelineState {
  statements: StatementDetailDTO[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationDTO;
  currentPage: number;
  timeRange: TimeRange;
}

/**
 * FilterOption - Configuration for time range filter buttons
 */
interface FilterOption {
  value: TimeRange;
  label: string;
  description?: string; // Accessibility description
}
```

### DTOs from API (Already Defined in types.ts)

The following DTOs are used as-is from the API responses:

- `PoliticianDetailDTO`: Complete politician data with statements_count
- `PartyDTO`: Full party information
- `StatementDetailDTO`: Statement with can_edit and can_delete flags
- `PoliticianInStatementDTO`: Politician info in statement (though redundant on this page)
- `PartyInStatementDTO`: Party info in statement
- `CreatedByDTO`: Statement creator info
- `PaginationDTO`: Pagination metadata
- `PaginatedResponse<StatementDetailDTO>`: Paginated statements response
- `PoliticianTimelineQueryParams`: Query parameters for timeline endpoint

## 6. State Management

### State Management Strategy

The Politician Detail Page uses **local React state** within the `PoliticianDetail` component. The politician profile data is relatively static (fetched once on load), while the timeline data is dynamic (changes with filters and pagination).

### Primary State Container: PoliticianDetail Component

**State Variables:**

1. **`detailState: DetailState`** - Complete page state containing:
   - `politician`: PoliticianDetailDTO or null
   - `profileLoading`: Boolean for profile loading
   - `profileError`: Error for profile fetch
   - `statements`: Array of StatementDetailDTO
   - `statementsLoading`: Boolean for timeline loading
   - `statementsError`: Error for timeline fetch
   - `pagination`: Pagination metadata
   - `currentPage`: Current page number
   - `timeRange`: Active time range filter

### State Management Patterns

**Initial State from SSR:**
- Component receives politician, statements, timeRange, and page from Astro props
- Initial state set from props on mount
- No loading state on first render

**State Updates:**
- **Time range change:** Fetch statements with new time range, reset to page 1, update URL
- **Page change:** Fetch statements for new page, maintain time range, update URL
- **Statement deletion:** Remove from local array, potentially refetch if it causes empty page

**Client-Side Data Fetching:**
```typescript
const fetchTimeline = async (
  politicianId: string,
  timeRange: TimeRange = 'all',
  page: number = 1
) => {
  setDetailState(prev => ({
    ...prev,
    statementsLoading: true,
    statementsError: null
  }));
  
  try {
    const params = new URLSearchParams({
      time_range: timeRange,
      page: page.toString(),
      limit: '50'
    });

    const response = await fetch(
      `/api/politicians/${politicianId}/statements?${params}`
    );
    
    const data: PaginatedResponse<StatementDetailDTO> = await response.json();
    
    setDetailState(prev => ({
      ...prev,
      statementsLoading: false,
      statements: data.data,
      pagination: data.pagination,
      currentPage: page,
      timeRange
    }));
    
    // Update URL
    updateURL(timeRange, page);
  } catch (error) {
    setDetailState(prev => ({
      ...prev,
      statementsLoading: false,
      statementsError: error as Error
    }));
  }
};
```

### State Flow Summary

1. **Initial Load:** Astro SSR fetches politician + statements → passes to React → initializes state
2. **Filter Change:** User clicks time range → `fetchTimeline(id, timeRange, 1)` → reset to page 1 → update state and URL
3. **Pagination:** User clicks page → `fetchTimeline(id, currentTimeRange, page)` → maintain filter → update state and URL
4. **Delete Statement:** User deletes → API called → on success, remove from local array → re-render timeline
5. **URL Sync:** Time range and page always reflected in URL for sharing and back-button support

## 7. API Integration

### Primary Endpoint: GET /api/politicians/:id

**Purpose:** Retrieve politician profile with full details and statement count

**Request:**
```typescript
// No query parameters
GET /api/politicians/{politicianId}
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": {
    "id": string,
    "first_name": string,
    "last_name": string,
    "party_id": string,
    "party": {
      "id": string,
      "name": string,
      "abbreviation": string | null,
      "description": string | null,
      "color_hex": string | null
    },
    "biography": string | null,
    "created_at": string,
    "updated_at": string,
    "statements_count": number
  }
}

// Error responses
// 404: Politician not found
// 500: Internal server error
```

**Request Type:** None (just politicianId in URL)  
**Response Type:** `SingleResponse<PoliticianDetailDTO>`  
**Error Type:** `ErrorResponse`

---

### Secondary Endpoint: GET /api/politicians/:politician_id/statements

**Purpose:** Retrieve paginated statements for politician with time range filtering

**Request:**
```typescript
// Query parameters
interface PoliticianTimelineQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 50, max: 100
  time_range?: '7d' | '30d' | '365d' | 'all'; // Default: 'all'
  sort_by?: "created_at" | "statement_timestamp"; // Default: "created_at"
  order?: "asc" | "desc"; // Default: "desc"
}

// Example request
GET /api/politicians/{politicianId}/statements?time_range=30d&page=1&limit=50
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": [
    {
      "id": string,
      "politician_id": string,
      "statement_text": string,
      "statement_timestamp": string,
      "created_by_user_id": string,
      "created_by": {
        "id": string,
        "display_name": string
      },
      "created_at": string,
      "updated_at": string,
      "can_edit": boolean,
      "can_delete": boolean
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}

// Error responses
// 400: Invalid query parameters
// 404: Politician not found
// 500: Internal server error
```

**Request Type:** `PoliticianTimelineQueryParams`  
**Response Type:** `PaginatedResponse<StatementDetailDTO>`  
**Error Type:** `ErrorResponse`

---

### Tertiary Endpoint: DELETE /api/statements/:id

**Purpose:** Delete a statement (same as Recent Statements view)

**Request:**
```typescript
// Headers
Authorization: Bearer <jwt_token>

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
```

**Request Type:** None (just statementId in URL)  
**Response Type:** `SingleResponse<DeletedStatementDTO>`  
**Error Type:** `ErrorResponse`

### API Integration Implementation

**Fetch Politician Profile:**
```typescript
async function fetchPolitician(
  politicianId: string
): Promise<PoliticianDetailDTO> {
  const response = await fetch(`/api/politicians/${politicianId}`);
  
  if (response.status === 404) {
    throw new Error('POLITICIAN_NOT_FOUND');
  }
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  const result: SingleResponse<PoliticianDetailDTO> = await response.json();
  return result.data;
}
```

**Fetch Timeline Statements:**
```typescript
async function fetchTimeline(
  politicianId: string,
  timeRange: TimeRange = 'all',
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<StatementDetailDTO>> {
  const params = new URLSearchParams({
    time_range: timeRange,
    page: page.toString(),
    limit: limit.toString(),
    sort_by: "statement_timestamp",
    order: "desc"
  });

  const response = await fetch(
    `/api/politicians/${politicianId}/statements?${params}`
  );
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

**URL State Management:**
```typescript
function updateURL(timeRange: TimeRange, page: number) {
  const params = new URLSearchParams();
  
  if (timeRange !== 'all') {
    params.set('time_range', timeRange);
  }
  
  if (page > 1) {
    params.set('page', page.toString());
  }
  
  const queryString = params.toString();
  const newURL = queryString 
    ? `${window.location.pathname}?${queryString}` 
    : window.location.pathname;
  
  window.history.pushState({}, '', newURL);
}
```

## 8. User Interactions

### Primary Interactions

**1. View Politician Profile**
- **User Action:** User navigates to `/politicians/:id` from directory or link
- **System Response:** Display politician profile header with timeline below
- **UI Feedback:** Skeleton loading (if client-side), then smooth transition to content

**2. Read Politician Biography**
- **User Action:** User views profile header
- **System Response:** Display full biography text
- **UI Feedback:** Text formatted with proper paragraphs and spacing

**3. View All Statements (Default)**
- **User Action:** User lands on politician page
- **System Response:** Display all statements in timeline, "All Time" filter active
- **UI Feedback:** Statement cards displayed in reverse chronological order

**4. Filter by Time Range**
- **User Action:** User clicks time range filter button (e.g., "Last 30 Days")
- **System Response:** Fetch statements filtered by time range, reset to page 1, update URL
- **UI Feedback:** Button shows active state, loading skeleton, timeline updates, pagination resets

**5. View Filtered Results**
- **User Action:** After filtering, user views timeline
- **System Response:** Display only statements within selected time range
- **UI Feedback:** Active filter button highlighted, results reflect filter

**6. Paginate Through Timeline**
- **User Action:** User clicks page number or Next/Previous
- **System Response:** Fetch new page while maintaining time filter, update URL
- **UI Feedback:** Loading skeleton, timeline updates, scroll to top, active page indicated

**7. Expand Statement (Same as Recent Statements)**
- **User Action:** User clicks "Read more" on statement card
- **System Response:** Statement expands inline
- **UI Feedback:** Smooth height animation, button changes to "Read less"

**8. Edit Own Statement (Authenticated)**
- **User Action:** User clicks "Edit" on their own statement (within grace period)
- **System Response:** Navigate to `/statements/:id/edit`
- **UI Feedback:** Standard navigation

**9. Delete Own Statement (Authenticated)**
- **User Action:** User clicks "Delete" and confirms
- **System Response:** Call DELETE API, remove statement from timeline on success
- **UI Feedback:** Confirmation dialog, loading state, statement removed, success message

**10. Report Statement**
- **User Action:** User clicks "Report" on any statement
- **System Response:** Open report modal
- **UI Feedback:** Modal appears, same as Recent Statements view

**11. Share Filtered Timeline**
- **User Action:** User copies URL while viewing filtered timeline
- **System Response:** URL contains time_range and page parameters
- **UI Feedback:** When shared URL is accessed, recipient sees same filtered view

### Error Interactions

**12. Handle 404 (Politician Not Found)**
- **User Action:** User accesses invalid politician ID
- **System Response:** Display 404 state
- **UI Feedback:** Clear message "Politician not found", link back to directory

**13. Retry Failed Timeline Load**
- **User Action:** User clicks "Retry" in error state
- **System Response:** Re-fetch timeline with current filter and page
- **UI Feedback:** Loading state, then success or error

**14. Handle Empty Time Range**
- **User Action:** User filters to time range with no statements
- **System Response:** Display empty state
- **UI Feedback:** Message "No statements in the last X days", suggestion to view "All Time"

**15. Quick Reset to All Time**
- **User Action:** User clicks "Show all time" in empty state
- **System Response:** Change filter to "all", fetch unfiltered timeline
- **UI Feedback:** Filter updates, timeline displays all statements

## 9. Conditions and Validation

### Display Conditions

**1. Profile Header Visibility**

**Components Affected:** `PoliticianHeader`

**Conditions:**
- Politician data successfully loaded: `politician !== null`
- No 404 error

**Interface Impact:** Show full profile header when politician exists. Show 404 state otherwise.

---

**2. Time Range Filter Active State**

**Components Affected:** `TimeRangeFilter`, `FilterButton`

**Conditions:**
- Button value matches active filter: `button.value === activeTimeRange`

**Interface Impact:** Active button has distinct visual style (background color, bold text, etc.). Only one button active at a time.

---

**3. Timeline Empty State Context**

**Components Affected:** `StatementsEmptyState`

**Conditions:**
- No statements in timeline: `statements.length === 0`
- **If filtered (not "all"):** Show "No statements in the last X days/year"
- **If "all":** Show "[Politician name] hasn't made any public statements yet"

**Validation Logic:**
```typescript
function getEmptyStateMessage(
  timeRange: TimeRange,
  politicianName: string
): string {
  const timeRangeLabels = {
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    '365d': 'last year',
    'all': ''
  };
  
  if (timeRange === 'all') {
    return `${politicianName} hasn't made any public statements yet.`;
  }
  
  return `No statements found in the ${timeRangeLabels[timeRange]}. Try expanding your search to see more.`;
}
```

**Interface Impact:** Contextual message based on active filter. Show "Show all time" button only when filtered (not on "all").

---

**4. Statement Permission Flags**

**Components Affected:** `StatementCard`

**Conditions:**
- Use `can_edit` and `can_delete` flags from API response
- Flags already calculated server-side based on ownership and grace period

**Validation Logic:**
```typescript
// Server-side calculation (in API response)
// can_edit = (statement.created_by_user_id === currentUserId) 
//            && (now() - statement.created_at < 15 minutes)
// can_delete = (same as can_edit)

// Client-side: just use the flags
function showEditButton(statement: StatementDetailDTO): boolean {
  return statement.can_edit;
}

function showDeleteButton(statement: StatementDetailDTO): boolean {
  return statement.can_delete;
}
```

**Interface Impact:** Edit/delete buttons shown based on API flags, not client-side calculation.

---

**5. Politician Info in Statement Cards**

**Components Affected:** `StatementCard`

**Conditions:**
- On politician detail page: politician info is redundant
- **Option:** Hide politician header section in statement cards

**Interface Impact:** Statement cards could hide politician name/avatar/party since it's shown in page header. This is a UX decision (optional).

---

**6. Loading States**

**Components Affected:** `PoliticianLoadingState`, `StatementsLoadingState`

**Conditions:**
- **Profile loading:** `detailState.profileLoading === true`
- **Timeline loading:** `detailState.statementsLoading === true`

**Interface Impact:** Show skeleton for profile if profile loading. Show skeleton for timeline if timeline loading. Can load independently.

---

**7. Error States**

**Components Affected:** `PoliticianErrorState`, `StatementsErrorState`

**Conditions:**
- **Profile error:** `detailState.profileError !== null`
- **Timeline error:** `detailState.statementsError !== null`

**Interface Impact:** Show profile error state if profile fails (whole page error). Show timeline error state if timeline fails (timeline section only).

---

**8. Pagination Visibility**

**Components Affected:** `PaginationControls`

**Conditions:**
- **Show pagination:** `pagination.total_pages > 1`
- **Disable Previous:** `currentPage === 1`
- **Disable Next:** `currentPage === pagination.total_pages`

**Interface Impact:** Hide pagination if only one page or no results. Disable buttons appropriately.

---

**9. Statement Count Badge**

**Components Affected:** `StatementCountBadge`

**Conditions:**
- Always display count from `politician.statements_count`
- **Note:** Count is total across all time, not filtered

**Interface Impact:** Display total statement count regardless of active filter. Provides context for filtering.

## 10. Error Handling

### Error Categories and Handling Strategies

**1. 404 - Politician Not Found**

**Scenarios:**
- Invalid politician ID in URL
- Politician was deleted
- Typo in politician ID

**Handling:**
- Detect 404 in SSR (Astro) or client-side fetch
- Display `PoliticianNotFound` component
- Provide link back to politicians directory
- Clear, helpful message

**User Experience:**
- "Politician not found" message
- Suggestion: "Browse our politicians directory"
- Link to `/politicians`

---

**2. Invalid Time Range Parameter**

**Scenarios:**
- Manually entered invalid time_range in URL
- Corrupted URL parameter

**Handling:**
- Validate time_range parameter in Astro SSR
- Fallback to 'all' if invalid
- Update URL to correct value

**User Experience:**
- Page loads with "All Time" selected
- No error message (silent correction)

---

**3. Timeline Fetch Failure (Network Error)**

**Scenarios:**
- Server unreachable during filter/page change
- Network timeout
- Connection dropped

**Handling:**
- Display `StatementsErrorState` in timeline section
- Keep profile header visible
- Provide "Retry" button that maintains filter selection
- Show specific error message

**User Experience:**
- Profile remains visible
- Timeline shows error: "Unable to load statements"
- Retry maintains current filter and page
- Rest of page remains functional

---

**4. Profile Fetch Failure (500 Error)**

**Scenarios:**
- Database error
- Service unavailable
- Unexpected server exception

**Handling:**
- Display `PoliticianErrorState` for entire page
- Provide "Retry" button
- Show generic error message
- Log error for debugging

**User Experience:**
- Entire page shows error (no partial content)
- Clear message: "Failed to load politician profile"
- Retry button reloads entire page data

---

**5. Statement Delete Failure**

**Scenarios:**
- Grace period expired during delete dialog
- Network error during delete
- Permission denied (race condition)

**Handling:**
- Show error toast/notification
- Keep statement in timeline
- Close confirmation dialog
- Display specific error message

**User Experience:**
- Clear error message explaining failure
- Statement remains unchanged
- User understands why delete failed
- Can retry if appropriate

---

**6. Empty Timeline (Not an Error)**

**Scenarios:**
- Politician has no statements
- No statements in filtered time range
- All statements were deleted

**Handling:**
- Display `StatementsEmptyState` with context
- Provide helpful message based on filter
- Offer "Show all time" action if filtered

**User Experience:**
- Clear message explaining empty state
- Not presented as an error (neutral tone)
- Actionable suggestion to broaden search

---

**7. Invalid Page Number**

**Scenarios:**
- Manually entered page number beyond total pages
- Page number out of range after statements deleted

**Handling:**
- Validate page number in API response
- If out of range, reset to page 1
- Update URL to correct page
- Display results without error message

**User Experience:**
- Seamlessly corrected to valid page
- No error message (silent correction)
- URL updated to valid state

---

**8. Client-Side Rendering Error**

**Scenarios:**
- React component exception
- Unexpected null/undefined
- Type mismatch

**Handling:**
- Use Error Boundary around PoliticianDetail
- Display fallback UI
- Provide "Reload page" option
- Log error for debugging

**User Experience:**
- Graceful fallback instead of blank screen
- Clear message: "Something went wrong"
- Easy recovery option (reload)

### Error UI Patterns

**Page-Level Error (Profile Failure):**
- Full page error state
- Large error icon
- Clear message
- Prominent retry button

**Section-Level Error (Timeline Failure):**
- Profile header remains visible
- Error state only in timeline section
- Clear boundary between working and failed sections
- Retry maintains filter context

**Action-Level Error (Delete Failure):**
- Toast notification or inline alert
- Specific error message
- Auto-dismiss after few seconds (or manual close)
- Original state preserved

## 11. Implementation Steps

### Phase 1: Setup and Basic Structure (Estimated: 2-3 hours)

**Step 1: Create Page Structure**
- Create `src/pages/politicians/[id].astro`
- Setup dynamic route with `[id]` parameter
- Import Layout component
- Add page structure

**Step 2: Setup Dual API Fetching in Astro**
- Extract politician ID from params
- Validate ID format (UUID)
- Fetch politician profile: GET `/api/politicians/:id`
- Handle 404 if politician not found
- Parse URL query params (time_range, page)
- Fetch statements: GET `/api/politicians/:id/statements`
- Pass both data sets to client component

**Step 3: Create Main Detail Component**
- Create `src/components/PoliticianDetail.tsx`
- Define props interface
- Setup initial state from props
- Add placeholder rendering

**Step 4: Implement Error and Loading States**
- Create `PoliticianNotFound.tsx` (404 state)
- Create `PoliticianLoadingState.tsx` (full page skeleton)
- Create `PoliticianErrorState.tsx` (page-level error)
- Wire up conditional rendering

---

### Phase 2: Profile Header (Estimated: 2-3 hours)

**Step 5: Create Profile Header Component**
- Create `src/components/PoliticianHeader.tsx`
- Define layout structure (flex/grid)
- Add semantic HTML (header, h1, sections)
- Style with Tailwind

**Step 6: Implement Profile Sub-Components**
- Create larger `PoliticianAvatar` (xl size)
- Create `Biography` component with paragraph formatting
- Create `StatementCountBadge` component
- Integrate with `PartyBadge` (reused component)

**Step 7: Style Profile Header**
- Implement responsive layout (stack on mobile, side-by-side on desktop)
- Style biography with readable typography
- Add visual hierarchy (name prominent, other info secondary)
- Ensure proper spacing and padding

---

### Phase 3: Time Range Filter (Estimated: 2-3 hours)

**Step 8: Create TimeRangeFilter Component**
- Create `src/components/TimeRangeFilter.tsx`
- Define filter options configuration
- Implement segmented control layout
- Add ARIA attributes for accessibility

**Step 9: Create FilterButton Component**
- Create `FilterButton.tsx` with active/inactive states
- Implement click handler
- Style active and inactive states clearly
- Add hover and focus states

**Step 10: Implement Filter Logic**
- Add filter change handler in main component
- Implement `fetchTimeline` function with time_range parameter
- Reset to page 1 on filter change
- Update URL with time_range parameter
- Show loading state during filter change

**Step 11: Test Filter Functionality**
- Test all four filter options
- Verify URL updates correctly
- Test filter persistence (URL reload)
- Test filter with browser back/forward

---

### Phase 4: Statement Timeline (Estimated: 3-4 hours)

**Step 12: Create Timeline Section Structure**
- Create `src/components/TimelineSection.tsx`
- Add section header with "Statement Timeline" heading
- Setup layout for filter + statements list
- Add semantic structure

**Step 13: Integrate Statement Cards**
- Reuse `StatementCard` from Recent Statements view
- Pass `StatementDetailDTO` with permission flags
- Optionally hide politician info (redundant on this page)
- Implement deletion handler

**Step 14: Implement Timeline States**
- Create `StatementsLoadingState` (skeleton cards)
- Create `StatementsErrorState` (timeline-specific error)
- Create `StatementsEmptyState` (context-aware empty state)
- Wire up conditional rendering

**Step 15: Handle Statement Deletion**
- Implement delete handler that removes from local array
- Show success toast after deletion
- Handle edge case: deletion causes empty page
- Optionally refetch timeline after deletion

---

### Phase 5: Pagination (Estimated: 2 hours)

**Step 16: Integrate Pagination Controls**
- Reuse `PaginationControls` from other views
- Pass pagination metadata
- Wire up page change handler

**Step 17: Implement Pagination Logic**
- Add page change handler
- Implement `fetchTimeline` to maintain filter on page change
- Update URL with page parameter
- Scroll to timeline top on page change

**Step 18: Test Pagination**
- Test pagination with different filters
- Verify filter + page combination in URL
- Test direct URL access with both parameters
- Test pagination edge cases (last page, single page)

---

### Phase 6: Polish and Optimization (Estimated: 3-4 hours)

**Step 19: Implement Responsive Design**
- Test profile header on all breakpoints
- Adjust timeline for mobile (single column)
- Ensure filter buttons work on small screens
- Test touch targets (≥ 44x44px)

**Step 20: Implement Accessibility Features**
- Add proper heading hierarchy (h1 for name, h2 for timeline)
- Implement ARIA attributes for filter (radiogroup or tabs)
- Test keyboard navigation through entire page
- Test screen reader announcements
- Verify color contrast
- Test focus management

**Step 21: Add Loading Skeletons**
- Design profile header skeleton
- Design timeline skeleton (matching statement cards)
- Add shimmer animation
- Test skeleton states

**Step 22: Performance Optimization**
- Memoize expensive components if needed
- Optimize re-renders (React.memo, useCallback)
- Test loading performance
- Ensure smooth filter transitions

**Step 23: Error Handling Polish**
- Implement Error Boundary
- Test all error scenarios
- Ensure retry works for both profile and timeline
- Test 404 handling
- Add helpful error messages

---

### Phase 7: Testing and Refinement (Estimated: 2-3 hours)

**Step 24: Manual Testing**
- Test all user interactions from section 8
- Test with various politicians (different data)
- Test edge cases (no statements, many statements)
- Test filter combinations
- Test authenticated vs. anonymous users

**Step 25: Accessibility Testing**
- Run automated audit (Lighthouse, axe)
- Manual keyboard navigation
- Screen reader testing
- Verify ARIA implementation on filter
- Check heading hierarchy

**Step 26: Performance Testing**
- Measure page load time (< 2 seconds target)
- Test filter change speed (< 1 second target)
- Run Lighthouse performance audit
- Test on slow network

**Step 27: Cross-Browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers
- Fix browser-specific issues

**Step 28: Integration Testing**
- Test navigation from directory
- Test navigation from statement cards in feed
- Test linking to politician page with filters
- Verify consistency with other views

**Step 29: Final Polish**
- Add code comments for complex logic
- Document filter behavior
- Review error messages
- Ensure styling consistency
- Prepare for code review

---

### Estimated Total Time: 18-24 hours

**Note:** Time estimates assume:
- Developer is familiar with React, TypeScript, Astro, and Tailwind
- StatementCard, PartyBadge, and PaginationControls already implemented
- API endpoints are fully functional
- Design system is established

**Dependencies:**
- Completed API implementation (GET /api/politicians/:id, GET /api/politicians/:id/statements, DELETE /api/statements/:id)
- StatementCard component (from Recent Statements view)
- PartyBadge component (from Recent Statements view)
- PaginationControls component (from Recent Statements view)
- Avatar component (from Politicians Directory, adapted for xl size)
- Layout and navigation components

