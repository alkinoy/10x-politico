# View Implementation Plan: Authentication Page

## 1. Overview

The Authentication Page is the unified entry point for user authentication in SpeechKarma. It provides both sign-in and sign-up functionality through a tabbed interface on a single page. Users can switch between tabs to either log in to an existing account or create a new one. The page handles Supabase authentication, manages form validation, displays error messages, and redirects users to their intended destination after successful authentication. This view fulfills user story US-004 (Sign up / Sign in).

## 2. View Routing

**Path:** `/auth`

**Authentication Required:** No (public page, but redirects if already authenticated)

**Access Level:** Public (unauthenticated users)

**URL Hash Parameters:**
- `#signin` - Show sign-in tab (default)
- `#signup` - Show sign-up tab

## 3. Component Structure

The Authentication Page follows a form layout pattern with tabbed interface:

```
AuthenticationPage (Astro page)
├── Layout (Astro layout, possibly simplified)
│   ├── Header (Optional minimal header)
│   ├── Main Content
│   │   └── AuthenticationContainer (React component)
│   │       ├── PageHeader
│   │   ├── AuthTabs
│   │       │   ├── TabList
│   │       │   │   ├── TabButton (Sign In)
│   │       │   │   └── TabButton (Sign Up)
│   │       │   └── TabPanels
│   │       │       ├── SignInPanel (TabPanel)
│   │       │       │   └── SignInForm
│   │       │       │       ├── EmailInput
│   │       │       │       ├── PasswordInput
│   │       │       │       │   └── PasswordToggle
│   │       │       │       ├── ValidationError (conditional)
│   │       │       │       ├── SubmitButton
│   │       │       │       └── LoadingSpinner (conditional)
│   │       │       └── SignUpPanel (TabPanel)
│   │       │           └── SignUpForm
│   │       │               ├── EmailInput
│   │       │               ├── PasswordInput
│   │       │               │   └── PasswordToggle
│   │       │               ├── DisplayNameInput (optional)
│   │       │               ├── ValidationError (conditional)
│   │       │               ├── SubmitButton
│   │       │               └── LoadingSpinner (conditional)
│   │       └── AlertMessage (conditional)
│   └── Footer (Optional minimal footer)
```

## 4. Component Details

### AuthenticationPage (Astro Page Component)

**Component description:**  
The main Astro page component for authentication. Checks if user is already authenticated and redirects if so. Reads URL hash to determine initial active tab. Uses simplified or minimal layout to focus attention on auth forms.

**Main elements:**
- `<Layout>` wrapper (possibly simplified without full navigation)
- `<main>` element with centered form container
- `<AuthenticationContainer>` React component with hydration

**Handled events:**  
None (server-side component)

**Handled validation:**
- Check for existing session (redirect to home if authenticated)
- Parse URL hash for initial tab state

**Types:**
- Initial tab state from URL hash
- Return URL from query params (optional)

**Props:**  
None (Astro page component)

---

### AuthenticationContainer (React Component)

**Component description:**  
Main container component managing authentication state, tab switching, form submissions, and Supabase auth integration. Orchestrates the entire authentication flow.

**Main elements:**
- `<div>` container with centered layout
- `<PageHeader>` with dynamic title
- `<AuthTabs>` with tab interface
- `<AlertMessage>` for success/error feedback (conditional)

**Handled events:**
- Tab switch events
- Form submission events from child forms
- Authentication success/failure from Supabase

**Handled validation:**  
None (delegated to form components)

**Types:**
- `AuthState` (view model for auth state)
- `ActiveTab` (sign-in or sign-up)

**Props:**
```typescript
interface AuthenticationContainerProps {
  initialTab?: 'signin' | 'signup'; // From URL hash
  returnUrl?: string; // Redirect destination after auth
}
```

---

### PageHeader (React Component)

**Component description:**  
Simple header displaying the page title that changes based on active tab.

**Main elements:**
- `<header>` element
- `<h1>` with dynamic title

**Handled events:**  
None

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PageHeaderProps {
  title: string; // "Sign In to SpeechKarma" or "Sign Up for SpeechKarma"
}
```

---

### AuthTabs (React Component)

**Component description:**  
Tabbed interface component implementing ARIA tabs pattern. Manages tab selection and displays appropriate form panel.

**Main elements:**
- `<div>` wrapper with `role="tablist"`
- Two `<TabButton>` components for Sign In and Sign Up
- Two `<TabPanel>` components for form content
- Proper ARIA attributes for accessibility

**Handled events:**
- Tab button click (switches active tab)
- Updates URL hash when tab changes
- Arrow key navigation (left/right)

**Handled validation:**  
None

**Types:**
- `ActiveTab`: 'signin' | 'signup'

**Props:**
```typescript
interface AuthTabsProps {
  initialTab: 'signin' | 'signup';
  onTabChange: (tab: 'signin' | 'signup') => void;
  onSignInSubmit: (email: string, password: string) => Promise<void>;
  onSignUpSubmit: (email: string, password: string, displayName?: string) => Promise<void>;
}
```

---

### TabButton (React Component)

**Component description:**  
Individual tab button within the tab list. Shows active/inactive state and handles selection.

**Main elements:**
- `<button>` with `role="tab"`
- ARIA attributes: `aria-selected`, `aria-controls`
- Text label ("Sign In" or "Sign Up")

**Handled events:**
- Click event (switches to this tab)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  ariaControls: string; // ID of associated panel
  onClick: () => void;
}
```

---

### TabPanel (React Component)

**Component description:**  
Container for tab content (form). Implements ARIA tabpanel pattern and shows/hides based on active tab.

**Main elements:**
- `<div>` with `role="tabpanel"`
- ARIA attributes: `aria-labelledby`, `hidden`
- Child form content

**Handled events:**  
None (passes through to child form)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface TabPanelProps {
  id: string;
  isActive: boolean;
  ariaLabelledBy: string; // ID of associated tab button
  children: React.ReactNode;
}
```

---

### SignInForm (React Component)

**Component description:**  
Form for existing users to sign in. Includes email and password fields with validation and submission logic. Handles Supabase sign-in API call.

**Main elements:**
- `<form>` element with onSubmit handler
- `<EmailInput>` component
- `<PasswordInput>` component with visibility toggle
- `<ValidationError>` for field errors (conditional)
- `<SubmitButton>` ("Sign In")
- `<LoadingSpinner>` during submission (conditional)

**Handled events:**
- Form submission
- Input change events (updates state)
- Password visibility toggle

**Handled validation:**
- Email format validation
- Password required validation
- Display API errors

**Types:**
- `SignInFormState` (form state)
- `ValidationErrors` (error messages)

**Props:**
```typescript
interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

---

### SignUpForm (React Component)

**Component description:**  
Form for new users to create an account. Includes email, password, and optional display name fields. Handles Supabase sign-up API call.

**Main elements:**
- `<form>` element with onSubmit handler
- `<EmailInput>` component
- `<PasswordInput>` component with visibility toggle and min length hint
- `<DisplayNameInput>` component (optional field)
- `<ValidationError>` for field errors (conditional)
- `<SubmitButton>` ("Create Account")
- `<LoadingSpinner>` during submission (conditional)

**Handled events:**
- Form submission
- Input change events
- Password visibility toggle

**Handled validation:**
- Email format validation
- Password minimum length (6 characters)
- Display name max length (100 characters)
- Display API errors

**Types:**
- `SignUpFormState` (form state)
- `ValidationErrors` (error messages)

**Props:**
```typescript
interface SignUpFormProps {
  onSubmit: (email: string, password: string, displayName?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

---

### EmailInput (React Component)

**Component description:**  
Controlled email input field with label and validation error display.

**Main elements:**
- `<label>` element
- `<input type="email">` with validation attributes
- `<ValidationError>` component (conditional)

**Handled events:**
- onChange event (updates parent state)
- onBlur event (triggers validation)

**Handled validation:**
- Email format validation (HTML5 + custom)
- Required field validation

**Types:**  
None

**Props:**
```typescript
interface EmailInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
}
```

---

### PasswordInput (React Component)

**Component description:**  
Controlled password input field with visibility toggle, label, and validation error display.

**Main elements:**
- `<label>` element
- `<div>` container with input and toggle button
- `<input type="password">` (or type="text" when visible)
- `<PasswordToggle>` button
- `<ValidationError>` component (conditional)
- Optional hint text (e.g., "Minimum 6 characters" for sign up)

**Handled events:**
- onChange event (updates parent state)
- onBlur event (triggers validation)
- Visibility toggle click

**Handled validation:**
- Required field validation
- Minimum length validation (for sign up: 6 chars)

**Types:**
- Local state for visibility (boolean)

**Props:**
```typescript
interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  showHint?: boolean; // Show "Min 6 characters" hint
  minLength?: number;
}
```

---

### PasswordToggle (React Component)

**Component description:**  
Button to toggle password visibility between masked and visible states.

**Main elements:**
- `<button type="button">` element
- Icon showing eye (visible) or eye-slash (hidden)
- ARIA label for accessibility

**Handled events:**
- Click event (toggles visibility)

**Handled validation:**  
None

**Types:**  
None

**Props:**
```typescript
interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}
```

---

### DisplayNameInput (React Component)

**Component description:**  
Optional text input for display name during sign up. Helps personalize the user experience.

**Main elements:**
- `<label>` element (with "optional" indicator)
- `<input type="text">` with maxlength
- `<ValidationError>` component (conditional)

**Handled events:**
- onChange event (updates parent state)
- onBlur event (triggers validation)

**Handled validation:**
- Max length validation (100 characters)
- No minimum (optional field)

**Types:**  
None

**Props:**
```typescript
interface DisplayNameInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
}
```

---

### ValidationError (React Component)

**Component description:**  
Displays validation or API error messages near form fields or at form level.

**Main elements:**
- `<div>` or `<p>` with error styling
- Error icon (optional)
- Error message text

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

### SubmitButton (React Component)

**Component description:**  
Form submit button with loading state indication.

**Main elements:**
- `<button type="submit">` element
- Button text (changes based on form: "Sign In" or "Create Account")
- Loading spinner (replaces or accompanies text when loading)

**Handled events:**
- Click event (triggers form submission)

**Handled validation:**  
None (form handles validation)

**Types:**  
None

**Props:**
```typescript
interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
  text: string;
}
```

---

### LoadingSpinner (React Component)

**Component description:**  
Animated spinner indicating loading state during authentication API calls.

**Main elements:**
- SVG or CSS-based spinner animation
- Optional "Loading..." text (can be visually hidden)

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

---

### AlertMessage (React Component)

**Component description:**  
Alert banner displaying success or error messages at page level (above forms). Auto-dismissible or manually closable.

**Main elements:**
- `<div role="alert">` element
- Icon indicating type (success/error/info)
- Message text
- Close button (optional)

**Handled events:**
- Close button click (dismisses alert)
- Auto-dismiss after timeout (optional)

**Handled validation:**  
None

**Types:**
- `AlertType`: 'success' | 'error' | 'info'

**Props:**
```typescript
interface AlertMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  autoDismiss?: boolean;
  duration?: number; // milliseconds
}
```

## 5. Types

### View-Specific Types (ViewModels)

```typescript
/**
 * ActiveTab - Which authentication tab is currently active
 */
type ActiveTab = 'signin' | 'signup';

/**
 * AuthState - Main state for the authentication container
 */
interface AuthState {
  activeTab: ActiveTab;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

/**
 * SignInFormState - State for sign-in form
 */
interface SignInFormState {
  email: string;
  password: string;
  showPassword: boolean;
  errors: {
    email?: string;
    password?: string;
    form?: string; // General form error
  };
}

/**
 * SignUpFormState - State for sign-up form
 */
interface SignUpFormState {
  email: string;
  password: string;
  displayName: string;
  showPassword: boolean;
  errors: {
    email?: string;
    password?: string;
    displayName?: string;
    form?: string; // General form error
  };
}

/**
 * ValidationErrors - Generic validation error structure
 */
interface ValidationErrors {
  [field: string]: string | undefined;
}
```

### Supabase Auth Types

```typescript
/**
 * Sign In Request (Supabase)
 */
interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign Up Request (Supabase)
 */
interface SignUpRequest {
  email: string;
  password: string;
  options?: {
    data?: {
      display_name?: string;
    };
  };
}

/**
 * Auth Response (Supabase)
 */
interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

/**
 * Supabase User
 */
interface User {
  id: string;
  email?: string;
  // ... other Supabase user fields
}

/**
 * Supabase Session
 */
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  // ... other session fields
}

/**
 * Supabase Auth Error
 */
interface AuthError {
  message: string;
  status: number;
}
```

## 6. State Management

### State Management Strategy

The Authentication Page uses **local React state** within the `AuthenticationContainer` component. No global state management is required.

### Primary State Container: AuthenticationContainer Component

**State Variables:**

1. **`authState: AuthState`** - Main authentication state:
   - `activeTab`: Currently active tab ('signin' or 'signup')
   - `isLoading`: Boolean indicating auth API call in progress
   - `error`: Error message string or null
   - `success`: Success message string or null

2. **Form-Specific State** (within individual form components):
   - Sign-in form manages its own field values and validation errors
   - Sign-up form manages its own field values and validation errors

### State Management Patterns

**Initial State from URL:**
- Read URL hash (#signin or #signup) to determine initial tab
- Default to sign-in tab if no hash or invalid hash

**Tab Switching:**
- Update local state `activeTab`
- Update URL hash to match active tab
- Clear any existing error/success messages
- Don't reset form fields (preserve user input)

**Form Submission:**
```typescript
const handleSignIn = async (email: string, password: string) => {
  setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      return;
    }

    // Success - redirect
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    window.location.href = returnUrl || '/';
    
  } catch (error) {
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      error: 'An unexpected error occurred. Please try again.'
    }));
  }
};

const handleSignUp = async (
  email: string,
  password: string,
  displayName?: string
) => {
  setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });

    if (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      return;
    }

    // Success - show success message or redirect
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      success: 'Account created successfully! Redirecting...'
    }));
    
    // Redirect after short delay
    setTimeout(() => {
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      window.location.href = returnUrl || '/';
    }, 2000);
    
  } catch (error) {
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      error: 'An unexpected error occurred. Please try again.'
    }));
  }
};
```

### State Flow Summary

1. **Initial Load:** Parse URL hash → set initial tab → render appropriate form
2. **Tab Switch:** User clicks tab → update activeTab → update URL hash → show corresponding form
3. **Form Input:** User types → update form-local state → validate on blur
4. **Submit:** User submits → set isLoading → call Supabase API → handle success/error → redirect or show message
5. **Success:** Auth succeeds → redirect to returnUrl or home
6. **Error:** Auth fails → show error message → user can retry

## 7. API Integration

### Authentication Provider: Supabase Auth

**Sign In:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

**Sign Up:**
```typescript
async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0]
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

**Session Management:**
- Supabase automatically stores session in localStorage
- Session includes JWT access token and refresh token
- Session is automatically refreshed by Supabase client
- Server-side code can validate session using Supabase service role key

**Redirect After Auth:**
```typescript
// Check for return URL in query params
const urlParams = new URLSearchParams(window.location.search);
const returnUrl = urlParams.get('returnUrl');

// Redirect after successful auth
window.location.href = returnUrl || '/';
```

## 8. User Interactions

### Primary Interactions

**1. Land on Sign In Tab (Default)**
- **User Action:** User navigates to `/auth` or clicks "Sign In" link
- **System Response:** Display authentication page with sign-in tab active
- **UI Feedback:** Sign-in form visible, sign-in tab highlighted

**2. Switch to Sign Up Tab**
- **User Action:** User clicks "Sign Up" tab
- **System Response:** Switch to sign-up tab, update URL hash to #signup
- **UI Feedback:** Tab indicator moves, sign-up form replaces sign-in form smoothly

**3. Switch to Sign In Tab**
- **User Action:** User clicks "Sign In" tab (from sign-up)
- **System Response:** Switch to sign-in tab, update URL hash to #signin
- **UI Feedback:** Tab indicator moves, sign-in form replaces sign-up form

**4. Enter Email and Password (Sign In)**
- **User Action:** User types email and password
- **System Response:** Update form state
- **UI Feedback:** Fields show typed content, password is masked

**5. Toggle Password Visibility**
- **User Action:** User clicks password visibility toggle (eye icon)
- **System Response:** Toggle password field type between "password" and "text"
- **UI Feedback:** Password text becomes visible or hidden, icon changes

**6. Submit Sign In Form**
- **User Action:** User clicks "Sign In" button or presses Enter
- **System Response:** Validate form, call Supabase sign-in API
- **UI Feedback:** Button shows loading state, form inputs disabled

**7. Sign In Success**
- **User Action:** Valid credentials provided
- **System Response:** Store session, redirect to return URL or home
- **UI Feedback:** Success message (brief), then redirect

**8. Sign In Failure**
- **User Action:** Invalid credentials provided
- **System Response:** Display error message from Supabase
- **UI Feedback:** Error message appears above form, button returns to normal, form re-enabled

**9. Enter Sign Up Details**
- **User Action:** User types email, password, and optional display name
- **System Response:** Update form state, validate on blur
- **UI Feedback:** Fields show content, validation errors appear if invalid

**10. Submit Sign Up Form**
- **User Action:** User clicks "Create Account" button
- **System Response:** Validate form, call Supabase sign-up API
- **UI Feedback:** Button shows loading state, form disabled

**11. Sign Up Success**
- **User Action:** Valid sign-up data provided
- **System Response:** Create account, store session, show success message
- **UI Feedback:** Success message, brief delay, then redirect

**12. Sign Up Failure**
- **User Action:** Invalid data or email already exists
- **System Response:** Display error message from Supabase
- **UI Feedback:** Error message appears, form re-enabled, user can correct

### Validation Interactions

**13. Email Validation on Blur**
- **User Action:** User leaves email field (blur event)
- **System Response:** Validate email format
- **UI Feedback:** Show error message if invalid ("Please enter a valid email address")

**14. Password Validation on Blur (Sign Up)**
- **User Action:** User leaves password field
- **System Response:** Validate password length (min 6 chars)
- **UI Feedback:** Show error if too short ("Password must be at least 6 characters")

**15. Display Name Validation on Blur**
- **User Action:** User leaves display name field
- **System Response:** Validate length (max 100 chars)
- **UI Feedback:** Show error if too long

### Edge Case Interactions

**16. Already Authenticated User**
- **User Action:** Authenticated user navigates to `/auth`
- **System Response:** Redirect immediately to home or previous page
- **UI Feedback:** Brief loading, then redirect (no form shown)

**17. Direct Link to Sign Up Tab**
- **User Action:** User accesses `/auth#signup`
- **System Response:** Load page with sign-up tab active
- **UI Feedback:** Sign-up tab highlighted, sign-up form visible

**18. Browser Back/Forward with Tabs**
- **User Action:** User switches tabs, then uses browser back button
- **System Response:** Restore previous tab based on URL hash
- **UI Feedback:** Appropriate tab becomes active based on history

## 9. Conditions and Validation

### Form Validation Rules

**1. Email Validation**

**Components Affected:** `EmailInput` in both Sign In and Sign Up forms

**Conditions:**
- Required field (cannot be empty)
- Must be valid email format (contains @, valid domain structure)

**Validation Logic:**
```typescript
function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show error message below input if validation fails. Prevent form submission if invalid.

---

**2. Password Validation (Sign In)**

**Components Affected:** `PasswordInput` in Sign In form

**Conditions:**
- Required field (cannot be empty)
- No minimum length check (allow any password for sign-in)

**Validation Logic:**
```typescript
function validateSignInPassword(password: string): string | null {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show error if empty. No other validation for sign-in.

---

**3. Password Validation (Sign Up)**

**Components Affected:** `PasswordInput` in Sign Up form

**Conditions:**
- Required field
- Minimum 6 characters (Supabase requirement)

**Validation Logic:**
```typescript
function validateSignUpPassword(password: string): string | null {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show error if empty or too short. Display hint text: "Minimum 6 characters" below field.

---

**4. Display Name Validation (Sign Up)**

**Components Affected:** `DisplayNameInput` in Sign Up form

**Conditions:**
- Optional field (can be empty)
- If provided, max 100 characters

**Validation Logic:**
```typescript
function validateDisplayName(displayName: string): string | null {
  // Optional field - empty is ok
  if (!displayName || displayName.trim() === '') {
    return null;
  }
  
  if (displayName.length > 100) {
    return 'Display name cannot exceed 100 characters';
  }
  
  return null; // Valid
}
```

**Interface Impact:** Show error only if exceeds max length. Label clearly indicates "(optional)".

### Display Conditions

**5. Loading State**

**Components Affected:** `SubmitButton`, `SignInForm`, `SignUpForm`

**Conditions:**
- Auth API call in progress: `authState.isLoading === true`

**Interface Impact:**
- Submit button shows spinner and "Loading..." text
- All form inputs disabled
- Submit button disabled
- Form has `aria-busy="true"`

---

**6. Error Alert Display**

**Components Affected:** `AlertMessage`

**Conditions:**
- Authentication error occurred: `authState.error !== null`

**Interface Impact:**
- Show alert banner with error message above forms
- Error icon displayed
- Message from Supabase (user-friendly)
- Closeable by user

---

**7. Success Alert Display**

**Components Affected:** `AlertMessage`

**Conditions:**
- Authentication succeeded: `authState.success !== null`

**Interface Impact:**
- Show success alert banner
- Success icon displayed
- Message: "Account created successfully! Redirecting..."
- Auto-dismiss before redirect

---

**8. Tab Active State**

**Components Affected:** `TabButton`, `TabPanel`

**Conditions:**
- Tab matches active tab: `tab === activeTab`

**Interface Impact:**
- Active tab button has distinct style (background, border, color)
- Active tab panel is visible (`hidden={false}`)
- Inactive tab panel is hidden (`hidden={true}`)
- ARIA attributes: `aria-selected="true"` on active tab

---

**9. Password Visibility**

**Components Affected:** `PasswordInput`, `PasswordToggle`

**Conditions:**
- Password visibility toggled: `showPassword === true`

**Interface Impact:**
- Input type changes from "password" to "text"
- Toggle icon changes from eye to eye-slash
- Password text becomes visible

---

**10. Form Submission Disabled**

**Components Affected:** `SubmitButton`

**Conditions:**
- Loading state OR validation errors present
- `isLoading === true || hasValidationErrors === true`

**Interface Impact:**
- Submit button disabled
- Visual disabled state
- Clicking has no effect

## 10. Error Handling

### Error Categories and Handling Strategies

**1. Invalid Credentials (Sign In)**

**Scenarios:**
- Wrong password
- Email doesn't exist
- Supabase returns auth error

**Handling:**
- Display user-friendly error message: "Invalid email or password"
- Don't specify which field is wrong (security)
- Clear password field (optional)
- Keep email field populated
- Re-enable form for retry

**User Experience:**
- Clear error message above form
- Form remains populated except password
- User can immediately retry

---

**2. Email Already Exists (Sign Up)**

**Scenarios:**
- User tries to sign up with existing email
- Supabase returns "User already registered" error

**Handling:**
- Display error: "An account with this email already exists"
- Suggest switching to sign-in: "Already have an account? Sign in instead"
- Optionally provide quick link to switch to sign-in tab

**User Experience:**
- Clear explanation of problem
- Actionable suggestion (switch to sign in)
- One-click solution

---

**3. Weak Password (Sign Up)**

**Scenarios:**
- Password doesn't meet Supabase requirements
- Less than 6 characters

**Handling:**
- Client-side validation prevents submission
- If somehow reaches server, show Supabase error
- Display specific requirement: "Password must be at least 6 characters"

**User Experience:**
- Caught by client-side validation before submission
- Clear requirement stated
- User can fix immediately

---

**4. Invalid Email Format**

**Scenarios:**
- User enters non-email string
- Typo in email (missing @, invalid domain)

**Handling:**
- Client-side validation on blur
- Show error message: "Please enter a valid email address"
- Prevent form submission until fixed

**User Experience:**
- Immediate feedback on blur
- Clear error message
- Cannot submit with invalid email

---

**5. Network Error (Connection Failed)**

**Scenarios:**
- No internet connection
- Supabase service down
- Network timeout

**Handling:**
- Catch network exception
- Display error: "Unable to connect. Please check your internet connection and try again."
- Provide retry button
- Log error for debugging

**User Experience:**
- Clear explanation of network issue
- Retry option
- Form state preserved

---

**6. Rate Limiting (Too Many Attempts)**

**Scenarios:**
- User submits too many times rapidly
- Supabase rate limiting kicks in

**Handling:**
- Display error: "Too many attempts. Please wait a moment and try again."
- Disable submit button temporarily
- Show countdown if available

**User Experience:**
- Clear explanation of rate limit
- Visual indication of when retry is possible
- Prevents frustration from repeated failures

---

**7. Validation Errors (Multiple Fields)**

**Scenarios:**
- User submits form with multiple invalid fields
- Multiple validation rules fail

**Handling:**
- Show error message for each invalid field
- Focus first invalid field
- Prevent form submission
- List all errors at form level (summary)

**User Experience:**
- All problems visible at once
- Focus guides user to first issue
- Can fix all issues before resubmitting

---

**8. Session Conflict (Already Signed In)**

**Scenarios:**
- User tries to sign in but already has valid session
- Race condition with existing session

**Handling:**
- Detect existing session on page load
- Redirect to home immediately
- Clear form (don't show)

**User Experience:**
- Seamless redirect
- No unnecessary form display
- Gets to intended destination

---

**9. Email Confirmation Required (Optional)**

**Scenarios:**
- Supabase configured to require email confirmation
- User signs up but hasn't confirmed email

**Handling:**
- Show success message: "Account created! Please check your email to verify your account."
- Don't auto-redirect
- Provide link to resend confirmation
- Clear instructions

**User Experience:**
- Clear next steps
- No confusion about why not signed in
- Option to resend confirmation

---

**10. Unknown/Unexpected Errors**

**Scenarios:**
- Unexpected Supabase error
- JavaScript exception
- Unhandled edge case

**Handling:**
- Catch all exceptions
- Display generic error: "An unexpected error occurred. Please try again."
- Log full error details for debugging
- Provide retry option

**User Experience:**
- Not left with blank screen
- Can retry
- Error logged for debugging

### Error UI Patterns

**Field-Level Errors:**
- Red border on input
- Error icon next to field
- Error message below field
- Associated via `aria-describedby`

**Form-Level Errors:**
- Alert banner above form
- Error icon and message
- Multiple errors listed
- Closeable by user

**Success Messages:**
- Green alert banner
- Success icon
- Clear message
- Auto-dismiss before redirect

## 11. Implementation Steps

### Phase 1: Setup and Basic Structure (Estimated: 2-3 hours)

**Step 1: Create Authentication Page**
- Create `src/pages/auth.astro`
- Import Layout (consider simplified layout for auth)
- Check for existing session (redirect if authenticated)
- Parse URL hash for initial tab state
- Setup basic structure

**Step 2: Setup Supabase Client**
- Install `@supabase/supabase-js` if not already installed
- Create Supabase client utility in `src/lib/supabase.ts`
- Configure with environment variables
- Test connection

**Step 3: Create Main Container Component**
- Create `src/components/AuthenticationContainer.tsx`
- Define props and state interfaces
- Setup initial state management
- Add placeholder rendering

---

### Phase 2: Tab Interface (Estimated: 2-3 hours)

**Step 4: Implement AuthTabs Component**
- Create `AuthTabs.tsx` with ARIA tabs pattern
- Implement tab list with role="tablist"
- Create TabButton and TabPanel components
- Implement keyboard navigation (arrow keys)

**Step 5: Implement Tab Switching**
- Add tab click handlers
- Update URL hash when tab changes
- Implement active tab state management
- Test tab switching and URL sync

**Step 6: Style Tab Interface**
- Design tab button active/inactive states
- Add smooth transition between panels
- Ensure accessibility (focus indicators, ARIA)
- Test on mobile and desktop

---

### Phase 3: Sign In Form (Estimated: 3-4 hours)

**Step 7: Create Sign In Form Structure**
- Create `SignInForm.tsx` component
- Add form element with onSubmit handler
- Create EmailInput and PasswordInput components
- Add SubmitButton component

**Step 8: Implement Form Fields**
- Implement EmailInput with validation
- Implement PasswordInput with visibility toggle
- Add PasswordToggle component
- Wire up field state management

**Step 9: Implement Sign In Logic**
- Create sign-in handler function
- Integrate with Supabase signInWithPassword
- Handle loading state
- Handle success (redirect)
- Handle errors (display)

**Step 10: Add Validation**
- Implement email validation on blur
- Implement password required validation
- Display validation errors
- Prevent submission with validation errors

---

### Phase 4: Sign Up Form (Estimated: 3-4 hours)

**Step 11: Create Sign Up Form Structure**
- Create `SignUpForm.tsx` component
- Add form element and fields
- Add DisplayNameInput component
- Reuse EmailInput, PasswordInput from sign-in

**Step 12: Implement Sign Up Logic**
- Create sign-up handler function
- Integrate with Supabase signUp
- Pass display_name in metadata
- Handle loading state
- Handle success (show message, then redirect)
- Handle errors (display)

**Step 13: Add Sign Up Validation**
- Implement password minimum length validation (6 chars)
- Add password strength hint text
- Implement display name max length validation (100 chars)
- Display validation errors

**Step 14: Handle Email Confirmation (if enabled)**
- Check if email confirmation is required
- Display appropriate success message
- Optionally add "Resend confirmation" link
- Test confirmation flow

---

### Phase 5: Error Handling and Feedback (Estimated: 2-3 hours)

**Step 15: Create Alert Component**
- Create `AlertMessage.tsx` component
- Implement success, error, and info variants
- Add close button
- Implement auto-dismiss functionality

**Step 16: Create Validation Error Component**
- Create `ValidationError.tsx` component
- Style error messages
- Add error icon
- Associate with form fields via aria-describedby

**Step 17: Implement Error Handling**
- Map Supabase errors to user-friendly messages
- Display errors at form level and field level
- Test all error scenarios
- Implement retry functionality

**Step 18: Add Loading States**
- Create `LoadingSpinner.tsx` component
- Show loading in submit button
- Disable form during loading
- Add aria-busy attribute

---

### Phase 6: Polish and Optimization (Estimated: 2-3 hours)

**Step 19: Implement Return URL Logic**
- Parse returnUrl from query params
- Store return URL in state
- Redirect to return URL after successful auth
- Fallback to home if no return URL

**Step 20: Implement Responsive Design**
- Test forms on mobile, tablet, desktop
- Adjust form width for readability
- Ensure touch targets ≥ 44x44px
- Test tab interface on mobile

**Step 21: Implement Accessibility Features**
- Verify ARIA roles and attributes
- Test keyboard navigation
- Test screen reader announcements
- Verify focus management
- Check color contrast

**Step 22: Add Password Visibility Toggle**
- Implement toggle state
- Change input type dynamically
- Update toggle icon
- Add aria-label to toggle button
- Test accessibility

**Step 23: Style Forms**
- Design clean, modern form layout
- Style input fields with proper focus states
- Design button states (normal, hover, active, disabled)
- Add visual feedback for validation errors
- Ensure consistent spacing

---

### Phase 7: Testing and Refinement (Estimated: 2-3 hours)

**Step 24: Manual Testing**
- Test sign-in flow with valid credentials
- Test sign-in with invalid credentials
- Test sign-up flow with new email
- Test sign-up with existing email
- Test tab switching
- Test URL hash persistence
- Test return URL redirection

**Step 25: Validation Testing**
- Test email validation (various formats)
- Test password validation (length, required)
- Test display name validation (length)
- Test form submission with errors
- Test error display and clearing

**Step 26: Error Scenario Testing**
- Test network error (disconnect internet)
- Test rate limiting (rapid submissions)
- Test invalid credentials
- Test email already exists
- Test weak password
- Test all error messages

**Step 27: Accessibility Testing**
- Run automated accessibility audit
- Manual keyboard navigation
- Screen reader testing
- Test with high contrast mode
- Verify ARIA implementation

**Step 28: Cross-Browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers
- Fix browser-specific issues

**Step 29: Integration Testing**
- Test redirect from protected routes
- Test session persistence after auth
- Verify profile creation (database trigger)
- Test sign-out and return to auth page

**Step 30: Final Polish**
- Add helpful hint text
- Improve error messages
- Add loading feedback
- Optimize animations/transitions
- Code cleanup and comments

---

### Estimated Total Time: 18-24 hours

**Note:** Time estimates assume:
- Developer is familiar with React, TypeScript, Astro, and Tailwind
- Supabase is already configured in the project
- Design system and styling guidelines are established
- Basic form components can be built from scratch or adapted from Shadcn/ui

**Dependencies:**
- Supabase project configured with Auth enabled
- Environment variables set up (Supabase URL and anon key)
- Database trigger for profile creation on user signup
- Layout component (possibly simplified for auth)

