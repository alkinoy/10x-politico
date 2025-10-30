# View Implementation Plan: New Statement Page

## 1. Overview

The New Statement Page provides a dedicated interface for authenticated users to submit new political statements. It features a comprehensive form with three required fields: politician selection (searchable dropdown), statement date/time (when the statement was made), and statement text (with character counter). The form includes robust validation, real-time feedback, and clear error messages. After successful submission, users are redirected to view their newly created statement. This view fulfills user story US-005 (Add a statement).

## 2. View Routing

**Path:** `/statements/new`

**Authentication Required:** Yes (authenticated users only)

**Access Level:** Authenticated users

**Redirect Behavior:**
- If not authenticated: Redirect to `/auth?returnUrl=/statements/new`
- If authenticated: Show form

## 3. Component Structure

The New Statement Page follows a form layout pattern:

```
NewStatementPage (Astro page)
├── Layout (Astro layout)
│   ├── Header (Global navigation)
│   ├── Main Content
│   │   └── NewStatementForm (React component)
│   │       ├── PageHeader
│   │       ├── FormContainer
│   │       │   ├── PoliticianSelector
│   │       │   │   ├── SearchInput
│   │       │   │   ├── DropdownList
│   │       │   │   │   └── PoliticianOption[] (multiple)
│   │       │   │   └── ValidationError (conditional)
│   │       │   ├── DateTimePicker
│   │       │   │   ├── DateInput
│   │       │   │   ├── TimeInput
│   │       │   │   └── ValidationError (conditional)
│   │       │   ├── StatementTextarea
│   │       │   │   ├── Textarea
│   │       │   │   ├── CharacterCounter
│   │       │   │   └── ValidationError (conditional)
│   │       │   ├── FormActions
│   │       │   │   ├── SubmitButton
│   │       │   │   │   └── LoadingSpinner (conditional)
│   │       │   │   └── CancelButton
│   │       │   └── FormErrorAlert (conditional)
│   └── Footer (Global footer)
```

## 4. Component Details

### NewStatementPage (Astro Page Component)

**Component description:**  
The main Astro page component that handles authentication check during SSR, fetches list of politicians for the selector, and renders the form component.

**Main elements:**
- `<Layout>` wrapper
- Authentication middleware check
- `<main>` element
- `<NewStatementForm>` React component with hydration

**Handled events:**  
None (server-side component)

**Handled validation:**
- Authentication check (redirect if not authenticated)
- Session validation

**Types:**
- `PoliticianDTO[]` (politicians list for selector)
- User session data

**Props:**  
None (Astro page component)

---

### NewStatementForm (React Component)

**Component description:**  
Main form component managing all form state, validation, submission logic, and user feedback. Coordinates child components and handles Supabase API integration.

**Main elements:**
- `<form>` element with onSubmit handler
- `<PageHeader>` with title and description
- `<FormContainer>` with all form fields
- `<FormActions>` with submit and cancel buttons
- Conditional error alert at form level

**Handled events:**
- Form submission
- Field changes from child components
- Cancel button click
- Validation triggers

**Handled validation:**
- Coordinates validation across all fields
- Prevents submission with validation errors
- Displays field-level and form-level errors

**Types:**
- `NewStatementFormState` (form state)
- `CreateStatementCommand` (API request)

**Props:**
```typescript
interface NewStatementFormProps {
  politicians: PoliticianDTO[];
  currentUserId: string;
}
```

---

### PageHeader (React Component)

**Component description:**  
Header section displaying page title and optional description/instructions for the form.

**Main elements:**
- `<header>` element
- `<h1>` for page title ("Add New Statement")
- Optional `<p>` for description

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
}
```

---

### FormContainer (React Component)

**Component description:**  
Container component organizing form fields with consistent spacing and layout. Groups related fields logically.

**Main elements:**
- `<div>` container with form field spacing
- All form field components as children
- Consistent layout and padding

**Handled events:**  
None (passes through from child components)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface FormContainerProps {
  children: React.ReactNode;
}
```

---

### PoliticianSelector (React Component)

**Component description:**  
Searchable dropdown/combobox allowing users to find and select a politician. Implements ARIA combobox pattern with type-ahead search. Shows politician name and party in each option.

**Main elements:**
- `<label>` element with required indicator (*)
- `<SearchInput>` for type-ahead filtering
- `<DropdownList>` with filtered politician options
- `<ValidationError>` component (conditional)
- Hidden input storing selected politician ID

**Handled events:**
- Search input change (filters list)
- Option click (selects politician)
- Keyboard navigation (arrow keys, Enter to select)
- Blur (close dropdown, validate)

**Handled validation:**
- Required field (must select politician)
- Valid politician ID

**Types:**
- `PoliticianDTO[]` (full politicians list)
- `selectedPoliticianId: string | null`
- `filteredPoliticians: PoliticianDTO[]`

**Props:**
```typescript
interface PoliticianSelectorProps {
  politicians: PoliticianDTO[];
  value: string | null; // Selected politician ID
  onChange: (politicianId: string) => void;
  error?: string | null;
  disabled?: boolean;
}
```

---

### SearchInput (React Component)

**Component description:**  
Text input within PoliticianSelector for searching/filtering politicians by name.

**Main elements:**
- `<input type="text">` with autocomplete attributes
- Placeholder text ("Search for a politician...")
- ARIA attributes for combobox pattern

**Handled events:**
- onChange (filters politician list)
- onFocus (opens dropdown)
- onKeyDown (arrow navigation, Enter to select)

**Handled validation:**  
None (just for filtering)

**Types:**  
None

**Props:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  ariaExpanded: boolean;
  ariaControls: string; // ID of dropdown list
  ariaActiveDescendant?: string; // ID of focused option
}
```

---

### DropdownList (React Component)

**Component description:**  
Dropdown list of politician options within PoliticianSelector. Shows filtered results with politician name and party.

**Main elements:**
- `<ul role="listbox">` container
- Array of `<PoliticianOption>` components
- Empty state message if no results

**Handled events:**
- Option click (selects politician)
- Hover (highlights option)

**Handled validation:**  
None

**Types:**
- `PoliticianDTO[]` (filtered politicians)

**Props:**
```typescript
interface DropdownListProps {
  politicians: PoliticianDTO[];
  onSelect: (politicianId: string) => void;
  highlightedIndex: number;
  isOpen: boolean;
}
```

---

### PoliticianOption (React Component)

**Component description:**  
Individual option within the politician dropdown. Displays politician name and party badge.

**Main elements:**
- `<li role="option">` element
- Politician full name
- `<PartyBadge>` component (small variant)
- Highlight state for keyboard navigation

**Handled events:**
- Click (selects this politician)
- Mouse enter (highlights option)

**Handled validation:**  
None

**Types:**
- `PoliticianDTO`

**Props:**
```typescript
interface PoliticianOptionProps {
  politician: PoliticianDTO;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}
```

---

### DateTimePicker (React Component)

**Component description:**  
Date and time input component allowing users to specify when the statement was made. Prevents future dates. Can use native HTML5 inputs or custom picker library.

**Main elements:**
- `<label>` element with required indicator (*)
- `<DateInput>` component (or native `<input type="date">`)
- `<TimeInput>` component (or native `<input type="time">`)
- `<ValidationError>` component (conditional)
- Optional combined display of selected date/time

**Handled events:**
- Date change
- Time change
- Blur (validation)

**Handled validation:**
- Required fields (both date and time)
- Date cannot be in future
- Combined datetime cannot be in future

**Types:**
- `date: string` (YYYY-MM-DD format)
- `time: string` (HH:MM format)
- `datetime: string` (ISO 8601 timestamp)

**Props:**
```typescript
interface DateTimePickerProps {
  value: string | null; // ISO timestamp
  onChange: (timestamp: string) => void;
  error?: string | null;
  disabled?: boolean;
}
```

---

### DateInput (React Component)

**Component description:**  
Date selection input. Can use native `<input type="date">` or custom date picker library.

**Main elements:**
- `<input type="date">` or custom date picker
- ARIA labels and attributes

**Handled events:**
- onChange (updates date)
- onBlur (validates)

**Handled validation:**
- Date format validation
- Not in future validation

**Types:**  
None

**Props:**
```typescript
interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onBlur?: () => void;
  max?: string; // Today's date (prevent future selection)
  disabled?: boolean;
}
```

---

### TimeInput (React Component)

**Component description:**  
Time selection input. Can use native `<input type="time">` or custom time picker.

**Main elements:**
- `<input type="time">` or custom time picker
- ARIA labels

**Handled events:**
- onChange (updates time)
- onBlur (validates)

**Handled validation:**
- Time format validation

**Types:**  
None

**Props:**
```typescript
interface TimeInputProps {
  value: string; // HH:MM
  onChange: (time: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}
```

---

### StatementTextarea (React Component)

**Component description:**  
Multi-line text input for statement text with real-time character counter. Enforces minimum (10 chars) and maximum (5000 chars) limits.

**Main elements:**
- `<label>` element with required indicator (*)
- `<textarea>` element with character limit
- `<CharacterCounter>` component
- `<ValidationError>` component (conditional)
- Optional helper text about requirements

**Handled events:**
- onChange (updates text, validates length)
- onBlur (validates)

**Handled validation:**
- Required field
- Minimum length: 10 characters (after trim)
- Maximum length: 5000 characters
- Warning visual when approaching limit (>4800)

**Types:**
- `text: string`
- `characterCount: number`

**Props:**
```typescript
interface StatementTextareaProps {
  value: string;
  onChange: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
  minLength?: number; // Default: 10
  maxLength?: number; // Default: 5000
}
```

---

### CharacterCounter (React Component)

**Component description:**  
Displays character count and limit for statement textarea. Shows warning when approaching limit.

**Main elements:**
- `<div>` or `<span>` with count text
- Formatted display: "450 / 5000"
- Color changes based on count (warning at 4800+)

**Handled events:**  
None

**Handled validation:**  
None (just displays count)

**Types:**
- `current: number`
- `max: number`

**Props:**
```typescript
interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold?: number; // Default: 4800 (show warning)
}
```

---

### FormActions (React Component)

**Component description:**  
Container for form action buttons (submit and cancel), providing consistent spacing and layout.

**Main elements:**
- `<div>` container with button layout
- `<SubmitButton>` component
- `<CancelButton>` component

**Handled events:**  
None (buttons handle their own events)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}
```

---

### SubmitButton (React Component)

**Component description:**  
Primary action button for form submission. Shows loading state during API call.

**Main elements:**
- `<button type="submit">` element
- Button text: "Submit Statement"
- `<LoadingSpinner>` (replaces or accompanies text when loading)

**Handled events:**
- Click (triggers form submission via form's onSubmit)

**Handled validation:**  
None (form handles validation)

**Types:**  
None

**Props:**
```typescript
interface SubmitButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  text?: string; // Default: "Submit Statement"
}
```

---

### CancelButton (React Component)

**Component description:**  
Secondary action button that cancels form submission and returns user to previous page.

**Main elements:**
- `<button type="button">` element
- Button text: "Cancel"

**Handled events:**
- Click (navigates back or to default page)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}
```

---

### ValidationError (React Component)

**Component description:**  
Displays validation error messages inline near form fields. Reusable across all form fields.

**Main elements:**
- `<div>` or `<p>` with error styling
- Error icon (optional)
- Error message text
- Red color and appropriate ARIA attributes

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface ValidationErrorProps {
  message: string;
  fieldId?: string; // For aria-describedby association
}
```

---

### FormErrorAlert (React Component)

**Component description:**  
Alert banner at form level displaying general submission errors (API errors, network errors).

**Main elements:**
- `<div role="alert">` element
- Error icon
- Error message text
- Close button (optional)

**Handled events:**
- Close button click (dismisses alert)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface FormErrorAlertProps {
  message: string;
  onClose?: () => void;
}
```

---

### LoadingSpinner (React Component)

**Component description:**  
Animated spinner indicating loading state during form submission.

**Main elements:**
- SVG or CSS-based spinner animation
- Optional loading text

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}
```

## 5. Types

### View-Specific Types (ViewModels)

```typescript
/**
 * NewStatementFormState - Main form state
 */
interface NewStatementFormState {
  // Field values
  politicianId: string | null;
  statementText: string;
  statementTimestamp: string | null; // ISO timestamp
  
  // UI state
  isSubmitting: boolean;
  submitError: string | null;
  
  // Validation errors
  errors: {
    politicianId?: string;
    statementText?: string;
    statementTimestamp?: string;
  };
}

/**
 * PoliticianSelectorState - State for politician dropdown
 */
interface PoliticianSelectorState {
  searchQuery: string;
  isOpen: boolean;
  highlightedIndex: number;
  filteredPoliticians: PoliticianDTO[];
}

/**
 * DateTimeState - State for date/time picker
 */
interface DateTimeState {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

/**
 * CharacterCountState - State for character counter
 */
interface CharacterCountState {
  count: number;
  isNearLimit: boolean; // >4800 characters
  isAtLimit: boolean; // >=5000 characters
}
```

### DTOs from API (Already Defined in types.ts)

The following DTOs are used:

- `PoliticianDTO`: Politician with party info (for selector)
- `CreateStatementCommand`: Request body for POST /api/statements
  ```typescript
  {
    politician_id: string;
    statement_text: string;
    statement_timestamp: string; // ISO 8601
  }
  ```
- `StatementDetailDTO`: Response from POST /api/statements
- `ErrorResponse`: API error response

## 6. State Management

### State Management Strategy

The New Statement Page uses **local React state** within the `NewStatementForm` component. Each complex field (politician selector, date/time picker) may have its own local state.

### Primary State Container: NewStatementForm Component

**State Variables:**

1. **`formState: NewStatementFormState`** - Main form state containing:
   - `politicianId`: Selected politician UUID or null
   - `statementText`: Statement text string
   - `statementTimestamp`: Combined date+time as ISO timestamp
   - `isSubmitting`: Boolean for API call in progress
   - `submitError`: Error message from API or null
   - `errors`: Object with field-specific validation errors

### State Management Patterns

**Field Value Updates:**
```typescript
const handlePoliticianChange = (politicianId: string) => {
  setFormState(prev => ({
    ...prev,
    politicianId,
    errors: { ...prev.errors, politicianId: undefined }
  }));
};

const handleTextChange = (text: string) => {
  setFormState(prev => ({
    ...prev,
    statementText: text,
    errors: { ...prev.errors, statementText: undefined }
  }));
};

const handleDateTimeChange = (timestamp: string) => {
  setFormState(prev => ({
    ...prev,
    statementTimestamp: timestamp,
    errors: { ...prev.errors, statementTimestamp: undefined }
  }));
};
```

**Form Submission:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate all fields
  const validationErrors = validateForm(formState);
  if (Object.keys(validationErrors).length > 0) {
    setFormState(prev => ({ ...prev, errors: validationErrors }));
    // Focus first error field
    focusFirstError(validationErrors);
    return;
  }
  
  // Submit to API
  setFormState(prev => ({ ...prev, isSubmitting: true, submitError: null }));
  
  try {
    const command: CreateStatementCommand = {
      politician_id: formState.politicianId!,
      statement_text: formState.statementText.trim(),
      statement_timestamp: formState.statementTimestamp!
    };
    
    const response = await fetch('/api/statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(command)
    });
    
    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error.message);
    }
    
    const result = await response.json();
    const createdStatement = result.data;
    
    // Redirect to politician page showing new statement
    window.location.href = `/politicians/${createdStatement.politician_id}`;
    
  } catch (error) {
    setFormState(prev => ({
      ...prev,
      isSubmitting: false,
      submitError: error instanceof Error ? error.message : 'Failed to create statement'
    }));
  }
};
```

**Form Validation:**
```typescript
function validateForm(state: NewStatementFormState): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Politician ID validation
  if (!state.politicianId) {
    errors.politicianId = 'Please select a politician';
  }
  
  // Statement text validation
  const trimmedText = state.statementText.trim();
  if (!trimmedText) {
    errors.statementText = 'Statement text is required';
  } else if (trimmedText.length < 10) {
    errors.statementText = 'Statement must be at least 10 characters';
  } else if (state.statementText.length > 5000) {
    errors.statementText = 'Statement cannot exceed 5000 characters';
  }
  
  // Timestamp validation
  if (!state.statementTimestamp) {
    errors.statementTimestamp = 'Please select when the statement was made';
  } else {
    const timestamp = new Date(state.statementTimestamp);
    const now = new Date();
    if (timestamp.getTime() > now.getTime()) {
      errors.statementTimestamp = 'Statement date cannot be in the future';
    }
  }
  
  return errors;
}
```

### State Flow Summary

1. **Initial Load:** Form fields empty, no errors, ready for input
2. **User Input:** Field changes update corresponding state, clear field error
3. **Validation:** On blur or submit, validate field and show error if invalid
4. **Submit:** Validate all fields → if valid, call API → if success, redirect → if error, show message
5. **Cancel:** Navigate back to previous page or home

## 7. API Integration

### Primary Endpoint: POST /api/statements

**Purpose:** Create a new statement with politician, text, and timestamp

**Request:**
```typescript
// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json

// Request body
{
  "politician_id": "uuid",
  "statement_text": "string (min 10, max 5000 chars after trim)",
  "statement_timestamp": "2024-10-15T14:30:00Z" // ISO 8601
}
```

**Response:**
```typescript
// Success response (201 Created)
{
  "data": {
    "id": string,
    "politician_id": string,
    "politician": {
      "id": string,
      "first_name": string,
      "last_name": string,
      "party": {
        "id": string,
        "name": string,
        "abbreviation": string | null,
        "color_hex": string | null
      }
    },
    "statement_text": string,
    "statement_timestamp": string,
    "created_by_user_id": string,
    "created_by": {
      "id": string,
      "display_name": string
    },
    "created_at": string,
    "updated_at": string
  }
}

// Error responses
// 400: Validation errors
// 401: Authentication required
// 404: Politician not found
// 500: Internal server error
```

**Request Type:** `CreateStatementCommand`  
**Response Type:** `SingleResponse<StatementDetailDTO>`  
**Error Type:** `ErrorResponse`

---

### Secondary Endpoint: GET /api/politicians

**Purpose:** Fetch list of politicians for the selector dropdown

**Request:**
```typescript
// Query parameters
GET /api/politicians?sort=last_name&order=asc&limit=1000

// Fetch all politicians (no pagination for selector)
// Or implement server-side search if dataset is very large
```

**Response:**
```typescript
// Success response (200 OK)
{
  "data": PoliticianDTO[],
  "pagination": { ... }
}
```

**Implementation Note:** For small to medium politician datasets (< 1000), fetch all and do client-side filtering. For larger datasets, implement server-side search in selector.

### API Integration Implementation

**Create Statement:**
```typescript
async function createStatement(
  command: CreateStatementCommand,
  authToken: string
): Promise<StatementDetailDTO> {
  const response = await fetch('/api/statements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(command)
  });
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
  
  const result: SingleResponse<StatementDetailDTO> = await response.json();
  return result.data;
}
```

**Get Auth Token:**
```typescript
// Using Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(/* config */);

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
```

## 8. User Interactions

### Primary Interactions

**1. Land on New Statement Page**
- **User Action:** Authenticated user navigates to `/statements/new`
- **System Response:** Display empty form with all fields ready for input
- **UI Feedback:** Form loads with focus on first field (politician selector)

**2. Search for Politician**
- **User Action:** User types in politician selector search input
- **System Response:** Filter politician list in real-time based on input
- **UI Feedback:** Dropdown opens showing filtered results

**3. Select Politician**
- **User Action:** User clicks politician option or presses Enter on highlighted option
- **System Response:** Set selected politician, close dropdown, show selection
- **UI Feedback:** Selected politician name and party displayed, dropdown closes

**4. Select Date**
- **User Action:** User clicks date input and selects a date from calendar
- **System Response:** Update date value
- **UI Feedback:** Selected date displayed in input

**5. Select Time**
- **User Action:** User clicks time input and selects or types time
- **System Response:** Update time value
- **UI Feedback:** Selected time displayed in input

**6. Type Statement Text**
- **User Action:** User types in textarea
- **System Response:** Update text state, update character counter
- **UI Feedback:** Text appears in textarea, counter updates in real-time

**7. Approach Character Limit**
- **User Action:** User types beyond 4800 characters
- **System Response:** Continue accepting input up to 5000
- **UI Feedback:** Character counter turns warning color (e.g., orange/red)

**8. Reach Character Limit**
- **User Action:** User types 5000th character
- **System Response:** Prevent further input
- **UI Feedback:** Counter shows "5000 / 5000", input cannot accept more characters

**9. Submit Valid Form**
- **User Action:** User clicks "Submit Statement" with all valid data
- **System Response:** Validate, call API, create statement, redirect
- **UI Feedback:** Button shows loading spinner, form disabled, then redirect to politician page

**10. Cancel Form**
- **User Action:** User clicks "Cancel" button
- **System Response:** Navigate back to previous page or home
- **UI Feedback:** Browser navigation, no save

### Validation Interactions

**11. Leave Empty Required Field**
- **User Action:** User leaves politician selector empty and moves to another field
- **System Response:** Validate on form submission
- **UI Feedback:** Show error "Please select a politician" when user tries to submit

**12. Select Future Date**
- **User Action:** User selects tomorrow's date
- **System Response:** Validate on blur or submit
- **UI Feedback:** Show error "Statement date cannot be in the future"

**13. Enter Short Statement Text**
- **User Action:** User types less than 10 characters and blurs field
- **System Response:** Validate minimum length
- **UI Feedback:** Show error "Statement must be at least 10 characters"

**14. Try to Submit Invalid Form**
- **User Action:** User clicks submit with validation errors
- **System Response:** Prevent submission, show all validation errors
- **UI Feedback:** Error messages appear for all invalid fields, focus moves to first error

### Error Interactions

**15. Handle API Error**
- **User Action:** User submits form but API returns error (e.g., politician not found)
- **System Response:** Show error message, re-enable form
- **UI Feedback:** Alert banner with error message, form ready for retry

**16. Handle Network Error**
- **User Action:** User submits form but network request fails
- **System Response:** Catch error, show generic network error message
- **UI Feedback:** Alert: "Unable to submit. Please check your connection and try again."

**17. Handle Authentication Error**
- **User Action:** User's session expired during form fill
- **System Response:** API returns 401, detect and redirect to auth
- **UI Feedback:** Error message, then redirect to sign-in with return URL

## 9. Conditions and Validation

### Form Field Validation

**1. Politician Selection Validation**

**Components Affected:** `PoliticianSelector`

**Conditions:**
- Required field (must select a politician)
- Selected ID must be valid UUID of existing politician

**Validation Logic:**
```typescript
function validatePoliticianId(politicianId: string | null): string | null {
  if (!politicianId || politicianId.trim() === '') {
    return 'Please select a politician';
  }
  
  // Optionally: verify UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(politicianId)) {
    return 'Invalid politician selection';
  }
  
  return null; // Valid
}
```

**Validation Timing:** On form submission (required field)

**Interface Impact:** Show error below selector if validation fails. Prevent form submission.

---

**2. Statement Text Validation**

**Components Affected:** `StatementTextarea`, `CharacterCounter`

**Conditions:**
- Required field (cannot be empty after trim)
- Minimum length: 10 characters (after trim)
- Maximum length: 5000 characters (before trim, to prevent paste exploits)

**Validation Logic:**
```typescript
function validateStatementText(text: string): string | null {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return 'Statement text is required';
  }
  
  if (trimmedText.length < 10) {
    return `Statement must be at least 10 characters (currently ${trimmedText.length})`;
  }
  
  if (text.length > 5000) {
    return 'Statement cannot exceed 5000 characters';
  }
  
  return null; // Valid
}
```

**Validation Timing:**
- Character count: Real-time (on every keystroke)
- Minimum length: On blur or submit
- Maximum length: Enforced on input (maxLength attribute)

**Interface Impact:**
- Character counter shows current count and max
- Counter turns warning color at 4800+ characters
- Input prevented beyond 5000 characters
- Error message shown if less than 10 chars on submit

---

**3. Statement Timestamp Validation**

**Components Affected:** `DateTimePicker`, `DateInput`, `TimeInput`

**Conditions:**
- Required field (both date and time must be selected)
- Combined datetime cannot be in the future
- Must be valid date/time format

**Validation Logic:**
```typescript
function validateStatementTimestamp(timestamp: string | null): string | null {
  if (!timestamp) {
    return 'Please select when the statement was made';
  }
  
  const statementDate = new Date(timestamp);
  
  // Check if valid date
  if (isNaN(statementDate.getTime())) {
    return 'Invalid date/time format';
  }
  
  // Check if in future
  const now = new Date();
  if (statementDate.getTime() > now.getTime()) {
    return 'Statement date cannot be in the future';
  }
  
  return null; // Valid
}
```

**Validation Timing:**
- Future date check: On date selection, on blur, on submit
- Required check: On submit

**Interface Impact:**
- Date input max attribute set to today's date (prevents future selection in picker)
- Error message shown if validation fails
- Clear error message: "Statement date cannot be in the future"

### Display Conditions

**4. Submit Button State**

**Components Affected:** `SubmitButton`

**Conditions:**
- **Disabled when:** Form is submitting OR has validation errors
- **Enabled when:** Form is not submitting AND no validation errors

**Interface Impact:**
- Button disabled state (greyed out, cursor not-allowed)
- Button shows loading spinner when submitting
- Text changes to "Submitting..." during API call

---

**5. Character Counter Warning**

**Components Affected:** `CharacterCounter`

**Conditions:**
- **Normal:** < 4800 characters
- **Warning:** 4800-5000 characters
- **At Limit:** = 5000 characters

**Interface Impact:**
- Normal: Gray or neutral color
- Warning: Orange or amber color
- At Limit: Red color, input blocked

---

**6. Validation Error Display**

**Components Affected:** `ValidationError` for each field

**Conditions:**
- Error exists for field: `errors[fieldName] !== undefined`

**Interface Impact:**
- Show error message below field
- Field has error border (red)
- Field has `aria-invalid="true"`
- Error message associated via `aria-describedby`

---

**7. Form Error Alert**

**Components Affected:** `FormErrorAlert`

**Conditions:**
- API error occurred: `submitError !== null`

**Interface Impact:**
- Alert banner displayed above form
- Error icon and message
- Closeable by user
- Dismissed automatically on retry

---

**8. Politician Dropdown Open State**

**Components Affected:** `PoliticianSelector`, `DropdownList`

**Conditions:**
- **Open when:** Search input focused OR user clicks selector
- **Close when:** User selects option OR clicks outside OR presses Escape

**Interface Impact:**
- Dropdown list visible/hidden
- ARIA attributes updated (`aria-expanded`)
- Focus management

---

**9. Required Field Indicators**

**Components Affected:** All required field labels

**Conditions:**
- Field is required

**Interface Impact:**
- Asterisk (*) next to label
- `aria-required="true"` on input
- Visual indication (color, symbol)

## 10. Error Handling

### Error Categories and Handling Strategies

**1. Validation Errors (Client-Side)**

**Scenarios:**
- Empty required fields
- Text too short (< 10 chars)
- Text too long (> 5000 chars)
- Future date selected
- No politician selected

**Handling:**
- Prevent form submission
- Display field-specific error messages
- Focus first invalid field
- Clear error when user corrects field

**User Experience:**
- Immediate feedback (on blur or submit)
- Specific error messages
- Clear path to correction
- No API call made

---

**2. Politician Not Found (404)**

**Scenarios:**
- Selected politician was deleted between page load and submit
- Invalid politician ID somehow selected

**Handling:**
- API returns 404
- Display error: "Selected politician no longer exists. Please select another."
- Clear politician selection
- Re-enable form for retry

**User Experience:**
- Clear explanation
- Form preserved (text and date still filled)
- User can select different politician and resubmit

---

**3. Authentication Error (401)**

**Scenarios:**
- User's session expired during form fill
- Invalid or missing JWT token

**Handling:**
- Detect 401 response
- Save form state to sessionStorage (optional)
- Redirect to `/auth?returnUrl=/statements/new`
- After re-auth, restore form state (optional)

**User Experience:**
- Minimal data loss (form state preserved)
- Clear explanation: "Your session expired. Please sign in again."
- Redirected to sign-in
- Can return to form after auth

---

**4. Network Error**

**Scenarios:**
- No internet connection
- Server unreachable
- Request timeout

**Handling:**
- Catch network exception
- Display error: "Unable to submit. Please check your connection."
- Keep form state intact
- Provide retry option

**User Experience:**
- Clear network error message
- Form data preserved
- Can retry when connection restored
- No data loss

---

**5. Server Error (500)**

**Scenarios:**
- Database error
- Unexpected server exception
- Service unavailable

**Handling:**
- Display generic error: "Something went wrong. Please try again."
- Log error for debugging
- Keep form state intact
- Provide retry option

**User Experience:**
- Non-technical error message
- Form preserved
- Can retry
- Option to contact support if persistent

---

**6. Duplicate Statement (Potential)**

**Scenarios:**
- User accidentally submits twice
- Network delay causes retry
- Same statement already exists

**Handling:**
- API might detect and return conflict error
- Display error: "This statement may already exist"
- Offer to view existing statement
- Or allow proceed with warning

**User Experience:**
- Prevented from creating true duplicates
- Option to review before deciding
- Clear next steps

---

**7. Text Sanitization Issues**

**Scenarios:**
- User pastes text with unusual characters
- Text contains HTML/scripts
- Encoding issues

**Handling:**
- Client-side: Prevent script injection (React handles this)
- Server-side: Sanitize before storage
- If server rejects: Show sanitization error

**User Experience:**
- Seamless (React prevents XSS)
- If issue: Clear message about unsupported characters
- User can correct and resubmit

---

**8. Browser/JavaScript Errors**

**Scenarios:**
- React component error
- Unexpected exception
- Browser incompatibility

**Handling:**
- Error Boundary catches React errors
- Display fallback UI
- Log error for debugging
- Provide page reload option

**User Experience:**
- Graceful degradation
- Not left with blank screen
- Can reload to recover
- Form state may be lost (warn user)

### Error Recovery Patterns

**Automatic Recovery:**
- Clear field errors when user edits field
- Dismiss form error when user retries
- Re-validate on change after submission attempt

**User-Initiated Recovery:**
- Retry button for API errors
- Clear/reset form option
- Cancel to abandon and start over

**Data Preservation:**
- Keep form state on network errors
- Optionally save to sessionStorage on auth redirect
- Warn before navigating away with unsaved changes

## 11. Implementation Steps

### Phase 1: Setup and Basic Structure (Estimated: 2-3 hours)

**Step 1: Create Page and Auth Check**
- Create `src/pages/statements/new.astro`
- Implement authentication middleware check
- Redirect to `/auth?returnUrl=/statements/new` if not authenticated
- Fetch politicians list for selector

**Step 2: Create Main Form Component**
- Create `src/components/NewStatementForm.tsx`
- Define form state interface
- Setup initial state
- Add basic form structure

**Step 3: Create Form Container and Header**
- Create `PageHeader.tsx` component
- Create `FormContainer.tsx` layout component
- Add page title and description
- Style container layout

---

### Phase 2: Politician Selector (Estimated: 4-5 hours)

**Step 4: Create Politician Selector Structure**
- Create `PoliticianSelector.tsx` component
- Implement ARIA combobox pattern
- Add search input and dropdown list structure
- Setup local state for dropdown

**Step 5: Implement Search Functionality**
- Create `SearchInput.tsx` component
- Implement filter logic (client-side)
- Show/hide dropdown based on focus and input
- Handle keyboard navigation (arrow keys)

**Step 6: Create Politician Options**
- Create `DropdownList.tsx` component
- Create `PoliticianOption.tsx` component
- Display politician name and party badge
- Implement selection logic

**Step 7: Handle Keyboard Navigation**
- Implement arrow key navigation (up/down)
- Implement Enter to select
- Implement Escape to close
- Implement Tab to close and move to next field

**Step 8: Style Politician Selector**
- Design dropdown appearance
- Style selected state
- Style highlighted state (keyboard nav)
- Ensure mobile-friendly touch targets

---

### Phase 3: Date/Time Picker (Estimated: 2-3 hours)

**Step 9: Create DateTimePicker Component**
- Create `DateTimePicker.tsx` component
- Decide: native inputs vs custom library
- Create `DateInput` and `TimeInput` sub-components
- Combine date + time into ISO timestamp

**Step 10: Implement Date Selection**
- Use `<input type="date">` or custom picker
- Set max attribute to today's date
- Validate date format
- Test across browsers

**Step 11: Implement Time Selection**
- Use `<input type="time">` or custom picker
- Handle time format (24h vs 12h)
- Validate time format
- Test across browsers

**Step 12: Validate DateTime**
- Combine date and time into timestamp
- Validate not in future
- Show error if invalid
- Test edge cases (timezone, midnight, etc.)

---

### Phase 4: Statement Textarea (Estimated: 2-3 hours)

**Step 13: Create Statement Textarea**
- Create `StatementTextarea.tsx` component
- Add textarea with maxLength
- Implement auto-resize or fixed height
- Style for readability

**Step 14: Create Character Counter**
- Create `CharacterCounter.tsx` component
- Calculate character count in real-time
- Display "X / 5000" format
- Update on every keystroke

**Step 15: Implement Warning States**
- Turn counter warning color at 4800 chars
- Turn counter danger color at 5000 chars
- Test character counting accuracy
- Handle paste operations

**Step 16: Validate Text Input**
- Validate minimum length (10 chars after trim)
- Validate maximum length (5000 chars)
- Show validation errors
- Test with various inputs

---

### Phase 5: Form Submission (Estimated: 3-4 hours)

**Step 17: Implement Form Validation**
- Create comprehensive validation function
- Validate all fields together
- Return errors object
- Focus first invalid field on error

**Step 18: Create Form Actions**
- Create `FormActions.tsx` container
- Create `SubmitButton.tsx` with loading state
- Create `CancelButton.tsx`
- Wire up handlers

**Step 19: Implement Submit Logic**
- Create submit handler
- Build API request payload
- Get auth token from Supabase
- Make POST request to `/api/statements`

**Step 20: Handle Success**
- Parse successful response
- Extract created statement ID
- Redirect to politician detail page
- Show statement in context

**Step 21: Handle Errors**
- Catch API errors
- Map to user-friendly messages
- Display in FormErrorAlert
- Re-enable form for retry

---

### Phase 6: Validation and Feedback (Estimated: 2-3 hours)

**Step 22: Create ValidationError Component**
- Create `ValidationError.tsx` component
- Style error messages
- Add error icon
- Associate with fields via aria-describedby

**Step 23: Create FormErrorAlert**
- Create `FormErrorAlert.tsx` component
- Display API/network errors
- Add close button
- Style as alert banner

**Step 24: Create LoadingSpinner**
- Create `LoadingSpinner.tsx` component
- Add animated spinner (SVG or CSS)
- Integrate in submit button
- Show during API call

**Step 25: Implement Field-Level Validation**
- Validate on blur for each field
- Clear errors on field change
- Show errors immediately
- Test validation timing

---

### Phase 7: Polish and Optimization (Estimated: 3-4 hours)

**Step 26: Implement Responsive Design**
- Test form on mobile, tablet, desktop
- Adjust input sizes for touch
- Ensure dropdowns work on mobile
- Test date/time pickers on mobile

**Step 27: Implement Accessibility**
- Add all ARIA attributes
- Verify keyboard navigation
- Test with screen reader
- Check focus management
- Verify color contrast

**Step 28: Add Cancel Functionality**
- Implement cancel handler
- Navigate back to previous page or home
- Optionally confirm if form has data
- Test navigation flow

**Step 29: Optimize Performance**
- Memoize expensive operations
- Debounce search input if needed
- Optimize re-renders
- Test with large politician list

**Step 30: Add Polish**
- Add helpful hint text
- Improve error messages
- Add smooth transitions
- Test animations

---

### Phase 8: Testing and Refinement (Estimated: 2-3 hours)

**Step 31: Manual Testing**
- Test complete submission flow
- Test all validation scenarios
- Test error handling
- Test cancel flow
- Test with various data

**Step 32: Accessibility Testing**
- Run automated audit
- Manual keyboard testing
- Screen reader testing
- Test ARIA implementation
- Verify focus management

**Step 33: Cross-Browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test native date/time inputs across browsers
- Test on mobile browsers
- Fix browser-specific issues

**Step 34: Integration Testing**
- Test auth requirement
- Test API integration
- Test redirect after success
- Verify created statement appears correctly

**Step 35: Final Polish and Cleanup**
- Add code comments
- Document complex logic
- Clean up console logs
- Review error messages
- Prepare for code review

---

### Estimated Total Time: 22-29 hours

**Note:** Time estimates assume:
- Developer is familiar with React, TypeScript, Astro, and Tailwind
- Decision on native vs custom date/time picker is made early
- API endpoints are fully functional
- Design system is established
- PartyBadge component exists from previous views

**Dependencies:**
- Completed API implementation (POST /api/statements, GET /api/politicians)
- PartyBadge component (from previous views)
- ValidationError component (can be shared with other forms)
- LoadingSpinner component (can be shared)
- Authentication system functional (Supabase)
- Layout and navigation components

