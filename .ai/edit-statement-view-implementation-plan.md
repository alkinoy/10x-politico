# View Implementation Plan: Edit Statement Page

## 1. Overview

The Edit Statement Page allows authenticated users to modify their own statements within a 15-minute grace period after creation. The page displays a pre-filled form similar to the New Statement page, with the politician field disabled (cannot be changed) and a prominent grace period indicator showing remaining edit time. This view fulfills user story US-006 (Edit my statement).

## 2. View Routing

**Path:** `/statements/:id/edit`

**Authentication Required:** Yes (must be statement owner)

**Access Level:** Statement owner only, within grace period

**Dynamic Parameters:**
- `:id` - UUID of the statement to edit

**Redirect Behavior:**
- If not authenticated: Redirect to `/auth?returnUrl=/statements/:id/edit`
- If not owner: Redirect to statement view with error message
- If grace period expired: Redirect with error message

## 3. Component Structure

```
EditStatementPage (Astro page)
├── Layout
│   └── Main Content
│       └── EditStatementForm (React component)
│           ├── PageHeader
│           ├── GracePeriodIndicator
│           ├── FormContainer
│           │   ├── PoliticianDisplay (read-only, not selector)
│           │   ├── DateTimePicker (editable, pre-filled)
│           │   ├── StatementTextarea (editable, pre-filled)
│           │   └── FormActions (Save/Cancel buttons)
│           └── FormErrorAlert (conditional)
```

## 4. Key Component Details

### GracePeriodIndicator
**Purpose:** Displays remaining time for editing (updates every 60 seconds)
**Elements:** Time text, optional clock icon, warning styling when < 5 minutes
**Props:**
```typescript
interface GracePeriodIndicatorProps {
  createdAt: string; // ISO timestamp
  onExpired?: () => void; // Callback when grace period expires
}
```

### PoliticianDisplay  
**Purpose:** Shows selected politician (read-only, not editable)
**Elements:** Politician name, party badge, "Cannot be changed" hint text
**Props:**
```typescript
interface PoliticianDisplayProps {
  politician: PoliticianInStatementDTO;
}
```

### EditStatementForm
**Purpose:** Main form component with pre-filled values
**State:** Similar to NewStatementForm but includes loaded statement data
**Differences from New Statement:**
- Pre-fills all fields from existing statement
- Politician field is disabled/read-only
- Submit button text: "Save Changes"
- API endpoint: PATCH instead of POST

## 5. Types

```typescript
interface EditStatementFormState {
  // Loaded statement
  statement: StatementDetailDTO | null;
  
  // Editable fields
  statementText: string;
  statementTimestamp: string;
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  
  // Validation
  errors: {
    statementText?: string;
    statementTimestamp?: string;
  };
  
  // Grace period
  gracePeriodExpired: boolean;
}
```

## 6. State Management

**Initial State from API:**
- Fetch statement data: GET `/api/statements/:id`
- Check `can_edit` flag - if false, redirect with error
- Pre-fill form fields from statement data
- Start grace period timer

**Grace Period Timer:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = calculateRemainingTime(statement.created_at);
    if (remaining <= 0) {
      setGracePeriodExpired(true);
      clearInterval(interval);
    }
  }, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, [statement.created_at]);
```

## 7. API Integration

**Load Statement:** GET `/api/statements/:id`
**Response:** `StatementDetailDTO` with `can_edit` and `can_delete` flags

**Update Statement:** PATCH `/api/statements/:id`
**Request Body:**
```typescript
{
  statement_text?: string;
  statement_timestamp?: string;
}
```
**Response:** Updated `StatementDetailDTO`

**Error Responses:**
- 401: Not authenticated
- 403: Not owner or grace period expired
- 404: Statement not found

## 8. User Interactions

1. **Land on Edit Page:** Load form with pre-filled data, show grace period indicator
2. **View Grace Period:** See "X minutes remaining" at top, updates every minute
3. **View Read-Only Politician:** Politician name/party displayed, clearly not editable
4. **Edit Text:** Modify statement text, character counter updates
5. **Edit Timestamp:** Change date/time
6. **Save Changes:** Submit PATCH request, redirect to statement view on success
7. **Cancel:** Return to previous page without saving
8. **Grace Period Expires:** If expired during edit, show error on submit attempt

## 9. Conditions and Validation

**Grace Period Check (Page Load):**
```typescript
if (!statement.can_edit) {
  // Redirect with error: "The grace period for editing has expired"
  navigate('/politicians/:id', { state: { error: 'Cannot edit statement' }});
}
```

**Ownership Check (Page Load):**
```typescript
if (statement.created_by_user_id !== currentUserId) {
  // Redirect with error: "You don't have permission to edit this statement"
  navigate('/', { state: { error: 'Permission denied' }});
}
```

**Field Validation:** Same as New Statement (min 10, max 5000 chars, no future dates)

**Grace Period Warning:** Show warning color when < 5 minutes remaining

**Submit Validation:** Check grace period hasn't expired during edit

## 10. Error Handling

**Grace Period Expired During Edit:**
- User is editing, grace period runs out
- On submit: Server returns 403
- Display error: "The grace period has expired while you were editing"
- Offer to view statement (read-only)

**Ownership Lost (Edge Case):**
- Extremely rare, but handle gracefully
- Display error, redirect to home

**Network Error:**
- Preserve edited data
- Show error with retry option
- Don't lose user's changes

**Statement Not Found:**
- Statement was deleted while editing
- Display error: "Statement no longer exists"
- Redirect to home

## 11. Implementation Steps (Estimated: 12-16 hours)

### Phase 1: Setup and Data Loading (2-3 hours)
1. Create page with auth and ownership checks
2. Fetch statement data
3. Validate can_edit flag
4. Handle 404/403 errors

### Phase 2: Form with Pre-filling (3-4 hours)
5. Reuse form components from New Statement
6. Pre-fill all fields from statement data
7. Create PoliticianDisplay (read-only)
8. Test pre-filling accuracy

### Phase 3: Grace Period Indicator (2-3 hours)
9. Create GracePeriodIndicator component
10. Implement countdown timer (updates every 60s)
11. Add warning styling (< 5 min)
12. Handle expiration during edit

### Phase 4: Save Logic (2-3 hours)
13. Implement PATCH request
14. Handle validation
15. Handle success (redirect)
16. Handle errors (403, network, etc.)

### Phase 5: Polish and Testing (3-4 hours)
17. Implement responsive design
18. Add accessibility features
19. Test all error scenarios
20. Test grace period expiration timing

**Dependencies:**
- Completed API implementation (GET /api/statements/:id, PATCH /api/statements/:id)
- NewStatementForm components (reused with modifications)
- Authentication system
- Layout components

**Note:** This view heavily reuses components from New Statement Page, significantly reducing implementation time.

