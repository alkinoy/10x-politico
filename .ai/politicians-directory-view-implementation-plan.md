# View Implementation Plan: Politicians Directory

## 1. Overview

The Politicians Directory is a browsable and searchable listing of all politicians in the system. It serves as the main discovery interface for users wanting to find specific politicians to research their statement history. The view displays politicians in alphabetical order (by last name), includes a search feature for filtering by name, and provides quick access to each politician's detail page. This view fulfills user stories US-002 (View politician directory) and US-009 (Basic search by politician).

## 2. View Routing

**Path:** `/politicians`

**Authentication Required:** No (public view)

**Access Level:** Public (all users)

## 3. Component Structure

The Politicians Directory follows a feed/list layout pattern with search functionality:

```
PoliticiansDirectoryPage (Astro page)
├── Layout (Astro layout)
│   ├── Header (Global navigation)
│   ├── Main Content
│   │   └── PoliticiansDirectory (React component)
│   │       ├── PageHeader
│   │       ├── SearchSection
│   │       │   ├── SearchForm
│   │       │   │   ├── SearchInput
│   │       │   │   ├── SearchButton
│   │       │   │   └── ClearButton (conditional)
│   │       │   └── ActiveSearchDisplay (conditional)
│   │       ├── ResultsCount
│   │       ├── PoliticiansLoadingState (conditional)
│   │       ├── PoliticiansErrorState (conditional)
│   │       ├── PoliticiansEmptyState (conditional)
│   │       └── PoliticiansGrid (conditional)
│   │           ├── PoliticianCard[] (multiple instances)
│   │           │   ├── PoliticianAvatar
│   │           │   ├── PoliticianNameLink
│   │           │   ├── PartyBadge
│   │           │   ├── BiographyPreview
│   │           │   └── StatementCount
│   │           └── PaginationControls
│   └── Footer (Global footer)
```

## 4. Component Details

### PoliticiansDirectoryPage (Astro Page Component)

**Component description:**  
The main Astro page component that renders the Politicians Directory. Handles SSR data fetching including search query and page number from URL parameters. Passes initial data to the client-side React component.

**Main elements:**
- `<Layout>` wrapper with page title and meta tags
- `<main>` element with semantic HTML
- `<PoliticiansDirectory>` React component with hydration directive

**Handled events:**  
None (server-side component)

**Handled validation:**  
Query parameter validation (page number, search query sanitization)

**Types:**
- `PaginatedResponse<PoliticianDTO>` (from API)
- URL query parameters for page and search

**Props:**  
None (Astro page component, receives data from SSR fetch)

---

### PoliticiansDirectory (React Component)

**Component description:**  
The main interactive container component for the politicians directory. Manages search state, data fetching, pagination, and orchestrates child components. Handles both search and browse modes.

**Main elements:**
- `<div>` container with semantic class names
- `<PageHeader>` for title
- `<SearchSection>` with search form
- `<ResultsCount>` showing total politicians
- Conditional rendering of loading/error/empty/content states
- `<PoliticiansGrid>` with politician cards
- `<PaginationControls>` at bottom

**Handled events:**
- Search form submission
- Clear search action
- Page change events from pagination
- Initial page load

**Handled validation:**  
Search query sanitization before URL encoding

**Types:**
- `PaginatedResponse<PoliticianDTO>` (response type)
- `DirectoryState` (view model for component state)

**Props:**
```typescript
interface PoliticiansDirectoryProps {
  initialData: PaginatedResponse<PoliticianDTO>;
  initialPage: number;
  initialSearchQuery?: string;
}
```

---

### PageHeader (React Component)

**Component description:**  
Presentational component displaying the page title for the directory.

**Main elements:**
- `<header>` element
- `<h1>` for page title ("Politicians Directory")

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
}
```

---

### SearchSection (React Component)

**Component description:**  
Container for search form and active search indicator. Groups search-related UI elements.

**Main elements:**
- `<section>` or `<div>` container
- `<SearchForm>` component
- `<ActiveSearchDisplay>` component (when search is active)

**Handled events:**  
Passes events from child components up to parent

**Handled validation:**  
None (delegated to SearchForm)

**Types:**  
None

**Props:**
```typescript
interface SearchSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}
```

---

### SearchForm (React Component)

**Component description:**  
Form component allowing users to search politicians by name. Includes text input, submit button, and conditional clear button.

**Main elements:**
- `<form>` element with onSubmit handler
- `<label>` for search input (can be visually hidden)
- `<input type="text">` for search query
- `<button type="submit">` for search
- `<button type="button">` for clear (conditional)

**Handled events:**
- Form submission (Enter key or button click)
- Clear button click
- Input change (updates local state)

**Handled validation:**
- Trim whitespace from query
- Prevent submission of empty/whitespace-only query

**Types:**
- `searchQuery: string` (controlled input state)

**Props:**
```typescript
interface SearchFormProps {
  initialQuery?: string;
  onSubmit: (query: string) => void;
  onClear: () => void;
}
```

---

### ActiveSearchDisplay (React Component)

**Component description:**  
Displays the current active search query with option to clear it. Shows users what they're searching for.

**Main elements:**
- `<div>` container
- `<span>` or `<p>` showing search query text
- `<button>` to clear search

**Handled events:**
- Clear button click

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface ActiveSearchDisplayProps {
  query: string;
  onClear: () => void;
}
```

---

### ResultsCount (React Component)

**Component description:**  
Displays the total number of politicians in current results. Provides context for pagination.

**Main elements:**
- `<div>` or `<p>` with count text
- Formatted message (e.g., "Showing 42 politicians")

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `total: number` (from pagination metadata)

**Props:**
```typescript
interface ResultsCountProps {
  total: number;
  searchQuery?: string;
}
```

---

### PoliticiansGrid (React Component)

**Component description:**  
Grid container that displays politician cards in a responsive layout. Adapts from single column on mobile to multi-column on desktop.

**Main elements:**
- `<section>` or `<div>` container with grid layout
- Array of `<PoliticianCard>` components
- CSS Grid or Flexbox for responsive layout

**Handled events:**  
None (cards handle their own click events)

**Handled validation:**  
None

**Types:**
- `PoliticianDTO[]` (array of politicians)

**Props:**
```typescript
interface PoliticiansGridProps {
  politicians: PoliticianDTO[];
}
```

---

### PoliticianCard (React Component)

**Component description:**  
Card component displaying politician summary information. Shows avatar, name, party, biography preview, and statement count. Entire card is clickable and links to politician detail page.

**Main elements:**
- `<article>` wrapper for semantic HTML
- `<a>` link wrapping card content (or clickable div with link inside)
- `<PoliticianAvatar>` component
- `<h2>` or `<h3>` for politician name
- `<PartyBadge>` component
- `<p>` for biography preview
- `<span>` for statement count

**Handled events:**
- Click/navigation to politician detail page

**Handled validation:**  
None

**Types:**
- `PoliticianDTO` (politician data with nested party)

**Props:**
```typescript
interface PoliticianCardProps {
  politician: PoliticianDTO;
}
```

---

### PoliticianAvatar (React Component)

**Component description:**  
Displays politician avatar as initials from first and last name. Provides visual identification.

**Main elements:**
- `<div>` or `<span>` with circular styling
- Text content showing initials

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `firstName: string`, `lastName: string` for generating initials

**Props:**
```typescript
interface PoliticianAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}
```

---

### BiographyPreview (React Component)

**Component description:**  
Displays truncated biography text (approximately 150 characters). Provides quick context about the politician.

**Main elements:**
- `<p>` element with truncated text

**Handled events:**  
None

**Handled validation:**  
Text truncation to ~150 characters with ellipsis

**Types:**
- `biography: string | null`

**Props:**
```typescript
interface BiographyPreviewProps {
  biography: string | null;
  maxLength?: number; // Default: 150
}
```

---

### StatementCount (React Component)

**Component description:**  
Displays the number of statements attributed to the politician. Provides indicator of politician activity.

**Main elements:**
- `<span>` or `<div>` with count text
- Formatted message (e.g., "42 statements")

**Handled events:**  
None

**Handled validation:**  
None

**Types:**
- `count: number`

**Props:**
```typescript
interface StatementCountProps {
  count: number;
}
```

---

### PaginationControls (React Component)

**Component description:**  
Navigation controls for moving between pages of politicians. Same component as used in Recent Statements view.

**Main elements:**
- `<nav>` element with aria-label
- Previous `<button>`
- Page number `<button>`s
- Next `<button>`
- Current page indicator

**Handled events:**
- Previous button click
- Page number button click
- Next button click

**Handled validation:**
- Disable Previous when on page 1
- Disable Next when on last page

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

### PoliticiansLoadingState (React Component)

**Component description:**  
Skeleton screen displayed while politicians are being fetched. Mimics the grid structure of actual politician cards.

**Main elements:**
- Grid container with skeleton card placeholders
- Shimmer or pulse animation

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PoliticiansLoadingStateProps {
  count?: number; // Number of skeleton cards (default: 12)
}
```

---

### PoliticiansErrorState (React Component)

**Component description:**  
Error state displayed when politician fetching fails. Shows user-friendly error message and retry option.

**Main elements:**
- `<div>` container
- Error icon
- Error message text
- Retry `<button>`

**Handled events:**
- Retry button click

**Handled validation:**  
None

**Types:**
- `error: Error | string`

**Props:**
```typescript
interface PoliticiansErrorStateProps {
  error: Error | string;
  onRetry: () => void;
}
```

---

### PoliticiansEmptyState (React Component)

**Component description:**  
Empty state displayed when no politicians match search or when directory is empty. Provides contextual message based on whether search is active.

**Main elements:**
- `<div>` container
- Icon or illustration
- Message text (context-aware)
- Optional "Clear search" button if searching

**Handled events:**
- Clear search button click (if searching)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PoliticiansEmptyStateProps {
  isSearching: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}
```

## 5. Types

### View-Specific Types (ViewModels)

```typescript
/**
 * DirectoryState - Main state for the PoliticiansDirectory component
 * Manages loading, error, search, and data states
 */
interface DirectoryState {
  isLoading: boolean;
  error: Error | null;
  politicians: PoliticianDTO[];
  pagination: PaginationDTO;
  currentPage: number;
  searchQuery: string;
}

/**
 * SearchFormState - Local state for SearchForm component
 * Manages search input value
 */
interface SearchFormState {
  inputValue: string;
}
```

### DTOs from API (Already Defined in types.ts)

The following DTOs are used as-is from the API responses:

- `PoliticianDTO`: Politician with nested party information
- `PartyInPoliticianDTO`: Party info in politician context  
- `PaginationDTO`: Pagination metadata
- `PaginatedResponse<PoliticianDTO>`: Complete paginated response
- `PoliticiansQueryParams`: Query parameters for API request

## 6. State Management

### State Management Strategy

The Politicians Directory uses **local React state** managed within the `PoliticiansDirectory` component. No global state management is required.

### Primary State Container: PoliticiansDirectory Component

**State Variables:**

1. **`directoryState: DirectoryState`** - Main state object containing:
   - `isLoading`: Boolean for loading state
   - `error`: Error object or null
   - `politicians`: Array of PoliticianDTO
   - `pagination`: Pagination metadata
   - `currentPage`: Current page number
   - `searchQuery`: Current search query string

### State Management Patterns

**Initial State from SSR:**
- Component receives `initialData`, `initialPage`, and `initialSearchQuery` as props
- These are used to set initial state on mount
- Prevents loading state on first render

**State Updates:**
- Search submission triggers new API fetch with search query
- Clear search triggers fetch without query parameter
- Page changes trigger new API fetch maintaining search query
- URL is updated to reflect current search and page state

**Client-Side Data Fetching:**
```typescript
const fetchPoliticians = async (page: number = 1, search?: string) => {
  setDirectoryState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '50',
      sort: 'last_name',
      order: 'asc'
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`/api/politicians?${params}`);
    const data: PaginatedResponse<PoliticianDTO> = await response.json();
    
    setDirectoryState({
      isLoading: false,
      error: null,
      politicians: data.data,
      pagination: data.pagination,
      currentPage: page,
      searchQuery: search || ''
    });
    
    // Update URL
    updateURL(page, search);
  } catch (error) {
    setDirectoryState(prev => ({
      ...prev,
      isLoading: false,
      error: error as Error
    }));
  }
};
```

### State Flow Summary

1. **Initial Load:** Astro SSR fetches data (with search/page from URL) → passes to React → initializes state
2. **Search:** User submits search → `fetchPoliticians(1, query)` called → reset to page 1 with query → update state and URL
3. **Clear Search:** User clears → `fetchPoliticians(1)` called → reset to page 1 without query → update state and URL
4. **Pagination:** User clicks page → `fetchPoliticians(page, currentSearchQuery)` called → maintain search, change page → update state and URL

## 7. API Integration

### Primary Endpoint: GET /api/politicians

**Purpose:** Retrieve paginated list of politicians with optional search filtering

**Request:**
```typescript
// Query parameters
interface PoliticiansQueryParams {
  search?: string;      // Search by first or last name
  party_id?: string;    // Filter by party (not used in directory view)
  sort?: "last_name" | "created_at"; // Default: "last_name"
  order?: "asc" | "desc"; // Default: "asc"
  page?: number;        // Default: 1
  limit?: number;       // Default: 50, max: 100
}

// Example requests
GET /api/politicians?sort=last_name&order=asc&page=1&limit=50
GET /api/politicians?search=smith&sort=last_name&order=asc&page=1&limit=50
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": PoliticianDTO[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}

// PoliticianDTO structure
{
  "id": string,
  "first_name": string,
  "last_name": string,
  "party_id": string,
  "party": {
    "id": string,
    "name": string,
    "abbreviation": string | null,
    "color_hex": string | null
  },
  "biography": string | null,
  "created_at": string,
  "updated_at": string
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

**Request Type:** `PoliticiansQueryParams`  
**Response Type:** `PaginatedResponse<PoliticianDTO>`  
**Error Type:** `ErrorResponse`

### API Integration Implementation

**Fetch Politicians:**
```typescript
async function fetchPoliticians(
  page: number = 1,
  search?: string,
  limit: number = 50
): Promise<PaginatedResponse<PoliticianDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort: "last_name",
    order: "asc"
  });

  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  const response = await fetch(`/api/politicians?${params}`);
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

**URL State Management:**
```typescript
function updateURL(page: number, search?: string) {
  const params = new URLSearchParams();
  
  if (page > 1) {
    params.set('page', page.toString());
  }
  
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  
  const queryString = params.toString();
  const newURL = queryString ? `/politicians?${queryString}` : '/politicians';
  
  window.history.pushState({}, '', newURL);
}
```

## 8. User Interactions

### Primary Interactions

**1. Browse Politicians Directory**
- **User Action:** User navigates to `/politicians`
- **System Response:** Display politicians directory with first page (50 items), sorted by last name
- **UI Feedback:** Skeleton loading if data not yet loaded, then smooth transition to grid

**2. Search for Politician by Name**
- **User Action:** User enters name in search field and clicks "Search" or presses Enter
- **System Response:** Fetch politicians matching search query, reset to page 1, update URL with search parameter
- **UI Feedback:** Loading state, then grid updates with filtered results, results count updates, active search indicator appears

**3. Search with No Results**
- **User Action:** User searches for non-existent politician
- **System Response:** API returns empty results array
- **UI Feedback:** Empty state with message "No politicians match your search", shows search query, provides clear search button

**4. Clear Search**
- **User Action:** User clicks "Clear" button in search form or active search display
- **System Response:** Fetch all politicians (remove search filter), reset to page 1, update URL
- **UI Feedback:** Loading state, grid updates with full directory, search input cleared, active search indicator removed

**5. Navigate to Politician Detail**
- **User Action:** User clicks on politician card
- **System Response:** Navigate to `/politicians/:id` page
- **UI Feedback:** Standard browser navigation, new page loads with politician profile

**6. Navigate Between Pages**
- **User Action:** User clicks page number or Previous/Next in pagination
- **System Response:** Fetch new page while maintaining search query, update URL with page parameter
- **UI Feedback:** Loading skeleton, grid updates with new politicians, scroll to top

**7. Direct URL Access with Search/Page**
- **User Action:** User accesses URL like `/politicians?search=smith&page=2`
- **System Response:** Astro SSR fetches data with search and page parameters
- **UI Feedback:** Page loads directly with search results and correct page

### Error Interactions

**8. Retry Failed Load**
- **User Action:** User clicks "Retry" button in error state
- **System Response:** Re-fetch politicians data with current search and page
- **UI Feedback:** Loading state, either show content or error state again

**9. Handle Search Validation**
- **User Action:** User tries to search with empty/whitespace-only input
- **System Response:** Prevent form submission
- **UI Feedback:** No action taken, input remains focused

**10. Share Search Results**
- **User Action:** User copies URL from address bar while viewing search results
- **System Response:** URL contains search query parameter
- **UI Feedback:** When URL is shared, recipient sees same search results

## 9. Conditions and Validation

### Display Conditions

**1. Active Search Display Visibility**

**Components Affected:** `ActiveSearchDisplay`, `SearchSection`

**Conditions:**
- Search query is not empty: `searchQuery.trim() !== ""`

**Interface Impact:** Show active search indicator with query text and clear button when searching. Hide when not searching.

---

**2. Clear Button in Search Form**

**Components Affected:** `SearchForm`

**Conditions:**
- Search input has content: `inputValue.trim() !== ""`

**Interface Impact:** Show clear button when input has text. Hide when input is empty.

---

**3. Empty State Context**

**Components Affected:** `PoliticiansEmptyState`

**Conditions:**
- No politicians in results: `politicians.length === 0`
- **If searching:** Show "No politicians match your search for '[query]'"
- **If not searching:** Show "No politicians in the directory"

**Validation Logic:**
```typescript
function getEmptyStateMessage(isSearching: boolean, searchQuery?: string): string {
  if (isSearching && searchQuery) {
    return `No politicians match your search for "${searchQuery}"`;
  }
  return "No politicians have been added to the directory yet";
}
```

**Interface Impact:** Contextual message based on search state. Show "Clear search" button only when searching.

---

**4. Results Count Display**

**Components Affected:** `ResultsCount`

**Conditions:**
- Has results: `pagination.total > 0`

**Validation Logic:**
```typescript
function getResultsCountMessage(total: number, searchQuery?: string): string {
  if (searchQuery) {
    return `Found ${total} politician${total !== 1 ? 's' : ''} matching "${searchQuery}"`;
  }
  return `Showing ${total} politician${total !== 1 ? 's' : ''}`;
}
```

**Interface Impact:** Show total count with contextual message. Hide if no results.

---

**5. Loading State Display**

**Components Affected:** `PoliticiansDirectory`, `PoliticiansLoadingState`

**Conditions:**
- API request in progress: `directoryState.isLoading === true`

**Interface Impact:** Show skeleton grid instead of actual content. Hide search results and pagination.

---

**6. Error State Display**

**Components Affected:** `PoliticiansDirectory`, `PoliticiansErrorState`

**Conditions:**
- API request failed: `directoryState.error !== null`

**Interface Impact:** Show error message with retry button. Hide politicians grid and pagination.

---

**7. Pagination Controls State**

**Components Affected:** `PaginationControls`

**Conditions:**
- **Disable Previous:** `currentPage === 1`
- **Disable Next:** `currentPage === pagination.total_pages`
- **Show pagination:** `total_pages > 1`

**Interface Impact:** Disabled buttons have visual disabled state. Hide pagination if only one page or no results.

---

**8. Biography Truncation**

**Components Affected:** `BiographyPreview`

**Conditions:**
- Biography exists and is longer than max length (150 chars)

**Validation Logic:**
```typescript
function truncateBiography(biography: string | null, maxLength: number = 150): string {
  if (!biography) return "No biography available";
  
  if (biography.length <= maxLength) return biography;
  
  // Truncate and add ellipsis
  return biography.substring(0, maxLength).trim() + "...";
}
```

**Interface Impact:** Show truncated biography with ellipsis. If no biography, show placeholder text.

### Form Validation

**9. Search Query Validation**

**Components Affected:** `SearchForm`

**Conditions:**
- Query must not be empty after trimming whitespace
- Query should be sanitized before URL encoding

**Validation Logic:**
```typescript
function validateSearchQuery(query: string): { isValid: boolean; sanitized: string } {
  const sanitized = query.trim();
  return {
    isValid: sanitized.length > 0,
    sanitized
  };
}
```

**Interface Impact:** Disable submit button or prevent submission if query is invalid (empty). Sanitize before passing to API.

## 10. Error Handling

### Error Categories and Handling Strategies

**1. Network Errors (Failed API Requests)**

**Scenarios:**
- Server unreachable
- Network timeout
- DNS resolution failure

**Handling:**
- Display `PoliticiansErrorState` with message: "Unable to load politicians. Please check your connection."
- Provide "Retry" button to refetch data
- Maintain current search query for retry

**User Experience:**
- Clear error message
- Retry preserves search context
- System remains usable

---

**2. API Validation Errors (400 Bad Request)**

**Scenarios:**
- Invalid page number
- Invalid search query format
- Limit exceeds maximum

**Handling:**
- For pagination errors: Reset to page 1 and retry
- For search errors: Show error toast, keep search form open
- Display specific error message from API

**User Experience:**
- Specific, actionable error messages
- Automatic recovery where possible
- User can correct and retry

---

**3. Search No Results (Empty Response)**

**Scenarios:**
- User searches for politician that doesn't exist
- Typo in search query
- Very specific search criteria

**Handling:**
- Display `PoliticiansEmptyState` with context-aware message
- Show current search query
- Provide "Clear search" button to return to full directory

**User Experience:**
- Clear explanation that search has no matches
- Easy way to try again or browse all
- No confusion about empty state

---

**4. Invalid URL Parameters**

**Scenarios:**
- Manually entered invalid page number (page=abc)
- Invalid search characters
- Out of range page number

**Handling:**
- Sanitize and validate URL parameters in Astro SSR
- Fallback to default values (page 1, no search)
- Log warning for debugging

**User Experience:**
- Page loads successfully with defaults
- No broken state from bad URLs
- Correct URL is updated after load

---

**5. Server Errors (500 Internal Server Error)**

**Scenarios:**
- Database connection failure
- Service unavailable
- Unexpected server exception

**Handling:**
- Display generic error message: "Something went wrong. Please try again later."
- Provide "Retry" button
- Log error for debugging

**User Experience:**
- Non-technical error message
- Option to retry
- Graceful degradation

---

**6. Client-Side Errors (JavaScript Exceptions)**

**Scenarios:**
- React rendering error
- Unexpected null/undefined
- Type mismatch

**Handling:**
- Use React Error Boundary
- Display fallback UI
- Log error to console
- Provide "Reload page" option

**User Experience:**
- Partial functionality preserved
- Clear recovery option
- No complete page crash

### Error Recovery Strategies

**Automatic Recovery:**
- Retry failed requests after brief delay (3-5 seconds)
- Maximum 2-3 automatic retries before showing error
- Exponential backoff for retries

**User-Initiated Recovery:**
- "Retry" button for failed fetches (maintains search context)
- "Clear search" button to reset to known good state
- "Reload page" for critical errors

**Graceful Degradation:**
- Show cached data if available during retry
- Keep search form functional even if results fail
- Preserve user input during errors

## 10. Implementation Steps

### Phase 1: Setup and Basic Structure (Estimated: 2-3 hours)

**Step 1: Create Basic Page Structure**
- Create `src/pages/politicians/index.astro`
- Import Layout component
- Add basic HTML structure with semantic elements
- Set page title and meta tags

**Step 2: Setup API Data Fetching in Astro**
- Add server-side data fetch in Astro frontmatter
- Parse URL query parameters (search, page)
- Call GET `/api/politicians?sort=last_name&order=asc&page={page}&search={query}`
- Handle errors gracefully on SSR
- Pass data and initial query params to client component

**Step 3: Create Main Directory Component**
- Create `src/components/PoliticiansDirectory.tsx`
- Setup component structure with TypeScript
- Define props interface
- Setup initial state from props
- Add placeholder rendering

**Step 4: Implement Loading, Error, and Empty States**
- Create `PoliticiansLoadingState.tsx` with grid of skeleton cards
- Create `PoliticiansErrorState.tsx` with error message and retry
- Create `PoliticiansEmptyState.tsx` with context-aware messages
- Wire up conditional rendering in main component

---

### Phase 2: Politician Card Display (Estimated: 3-4 hours)

**Step 5: Create PoliticianCard Component**
- Create `src/components/PoliticianCard.tsx`
- Define props interface accepting `PoliticianDTO`
- Setup card layout with semantic HTML (`<article>`)
- Make entire card clickable (link to `/politicians/:id`)
- Add Tailwind styling for card appearance

**Step 6: Implement Avatar Component**
- Create `PoliticianAvatar.tsx` component
- Generate initials from first and last name
- Style as circular avatar
- Add size variants (sm, md, lg)

**Step 7: Implement Biography Preview**
- Create `BiographyPreview.tsx` component
- Implement truncation logic (~150 characters)
- Handle null/empty biography gracefully
- Add ellipsis for truncated text

**Step 8: Implement Statement Count Display**
- Create `StatementCount.tsx` component
- Display count with proper pluralization
- Style as badge or indicator
- Handle zero statements gracefully

**Step 9: Create Politicians Grid Layout**
- Create `PoliticiansGrid.tsx` container component
- Implement responsive grid layout
  - Single column on mobile (< 640px)
  - 2 columns on tablet (640px - 1024px)
  - 3 columns on desktop (≥ 1024px)
- Add proper spacing and gaps
- Ensure consistent card heights

---

### Phase 3: Search Functionality (Estimated: 3-4 hours)

**Step 10: Create Search Form Component**
- Create `SearchForm.tsx` component
- Add controlled text input with label
- Add submit button with accessible label
- Implement form submission handler
- Add Enter key submission

**Step 11: Implement Clear Search**
- Add clear button to search form (conditional on input value)
- Create `ActiveSearchDisplay.tsx` component
- Show current search query when searching
- Implement clear handlers in both places

**Step 12: Implement Search Logic**
- Add search submission handler in main component
- Implement `fetchPoliticians(page, search)` function
- Reset to page 1 on new search
- Update URL with search parameter
- Show loading state during search

**Step 13: Add Results Count Display**
- Create `ResultsCount.tsx` component
- Display total politicians count
- Show different message when searching vs browsing
- Update count when search/page changes

**Step 14: Handle Search Edge Cases**
- Implement empty query validation (prevent submission)
- Handle special characters in search query (sanitize)
- Test very long search queries
- Test search with no results

---

### Phase 4: Pagination (Estimated: 2-3 hours)

**Step 15: Integrate Pagination Controls**
- Reuse `PaginationControls.tsx` from Recent Statements view
- Pass pagination metadata and handlers
- Ensure pagination maintains search query

**Step 16: Implement Pagination Logic**
- Add page change handler in main component
- Update `fetchPoliticians` to maintain search on page change
- Update URL with page parameter
- Scroll to top on page change
- Show loading state during page fetch

**Step 17: Handle URL State**
- Implement URL update function
- Sync URL with current search and page
- Handle browser back/forward navigation
- Test direct URL access with query parameters

---

### Phase 5: Polish and Optimization (Estimated: 2-3 hours)

**Step 18: Implement Responsive Design**
- Test grid layout on all breakpoints
- Adjust card sizes and spacing for mobile
- Ensure touch targets ≥ 44x44px
- Test search form on small screens
- Optimize pagination controls for mobile

**Step 19: Implement Accessibility Features**
- Add proper ARIA labels to search form
- Ensure keyboard navigation works
- Add screen reader announcements for search results
- Verify color contrast on party badges
- Test focus management
- Ensure search form is keyboard-accessible

**Step 20: Add Loading Skeletons**
- Design skeleton cards matching real cards
- Implement shimmer animation
- Show correct number of skeletons (12 for desktop grid)
- Test skeleton state on slow network

**Step 21: Performance Optimization**
- Memoize politician cards if needed
- Debounce search input (optional, since we have submit button)
- Optimize re-renders with React.memo where appropriate
- Lazy load images if avatars use images (future)

**Step 22: Error Handling Polish**
- Implement Error Boundary
- Test all error scenarios
- Ensure retry maintains context
- Add user-friendly error messages
- Test recovery flows

---

### Phase 6: Testing and Refinement (Estimated: 2-3 hours)

**Step 23: Manual Testing**
- Test search functionality with various queries
- Test pagination with and without search
- Test direct URL access with parameters
- Test browser back/forward navigation
- Test on different browsers
- Test on different devices

**Step 24: Accessibility Testing**
- Run automated accessibility audit
- Manual keyboard navigation testing
- Screen reader testing
- Color contrast verification
- Focus indicator visibility

**Step 25: Performance Testing**
- Measure page load time (target < 2 seconds)
- Test with slow 3G network
- Verify pagination load time (target < 1 second)
- Run Lighthouse audit

**Step 26: Cross-Browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers (iOS Safari, Chrome)
- Fix any browser-specific issues

**Step 27: Integration Testing**
- Test navigation from other pages
- Test linking to politician detail pages
- Verify party badge styling consistency
- Test with various data states (empty, few items, many items)

**Step 28: Final Polish**
- Add inline code comments
- Document any important considerations
- Review error messages for clarity
- Ensure consistent styling with other views
- Prepare for code review

---

### Estimated Total Time: 16-20 hours

**Note:** Time estimates assume:
- Developer is familiar with React, TypeScript, Astro, and Tailwind
- PaginationControls and PartyBadge components are already implemented (from Recent Statements view)
- API endpoint is fully functional and tested
- Design system is established

**Dependencies:**
- Completed API implementation (GET /api/politicians)
- PaginationControls component (from Recent Statements view)
- PartyBadge component (from Recent Statements view)
- Layout and navigation components
- Authentication system (for SSR user context)

