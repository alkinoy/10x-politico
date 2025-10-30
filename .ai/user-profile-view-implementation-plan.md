# View Implementation Plan: User Profile Page

## 1. Overview

The User Profile Page allows authenticated users to view and manage their profile information, see their contribution history (submitted statements), and sign out. Users can edit their display name, view their email and account creation date, and see all statements they've created with indicators for which are still editable. This view fulfills part of US-004 (Sign out) and provides implicit profile management functionality.

## 2. View Routing

**Path:** `/profile`

**Authentication Required:** Yes (authenticated users only)

**Access Level:** User can only view/edit their own profile

## 3. Component Structure

```
UserProfilePage (Astro page)
├── Layout
│   └── Main Content
│       └── UserProfile (React component)
│           ├── ProfileHeader
│           │   ├── Avatar
│           │   ├── DisplayName
│           │   ├── EmailDisplay
│           │   └── MemberSince
│           ├── EditProfileSection
│           │   └── EditProfileForm
│           │       ├── DisplayNameInput
│           │       ├── SaveButton
│           │       └── ValidationError (conditional)
│           ├── UserStatementsSection
│           │   ├── SectionHeader
│           │   ├── StatementsList
│           │   │   └── StatementCard[] (reused)
│           │   └── PaginationControls (conditional)
│           └── SignOutButton
```

## 4. Key Component Details

### ProfileHeader
**Purpose:** Displays user's profile information (avatar, name, email, member since date)
**Props:**
```typescript
interface ProfileHeaderProps {
  profile: ProfileDTO;
}
```

### EditProfileForm
**Purpose:** Inline form to edit display name
**Props:**
```typescript
interface EditProfileFormProps {
  currentDisplayName: string;
  onSave: (newDisplayName: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}
```

### UserStatementsSection
**Purpose:** Lists all statements created by the user with edit/delete controls
**Props:**
```typescript
interface UserStatementsSectionProps {
  statements: StatementDetailDTO[];
  pagination: PaginationDTO;
  currentUserId: string;
  onStatementDeleted: (id: string) => void;
  onPageChange: (page: number) => void;
}
```

### SignOutButton
**Purpose:** Prominent button to sign out and end session
**Props:**
```typescript
interface SignOutButtonProps {
  onSignOut: () => Promise<void>;
  isLoading: boolean;
}
```

## 5. Types

```typescript
interface UserProfileState {
  profile: ProfileDTO | null;
  statements: StatementDetailDTO[];
  pagination: PaginationDTO;
  isLoadingProfile: boolean;
  isLoadingStatements: boolean;
  isSavingProfile: boolean;
  isSigningOut: boolean;
  profileError: string | null;
  statementsError: string | null;
}

interface EditProfileFormState {
  displayName: string;
  error?: string;
  isEditing: boolean;
}
```

## 6. State Management

**Initial Load:**
- Fetch user profile: GET `/api/profiles/me`
- Fetch user's statements: GET `/api/statements?created_by_user_id={id}&sort_by=created_at&order=desc`

**Update Display Name:**
- PATCH `/api/profiles/me` with `{ display_name: "New Name" }`
- Update local state on success
- Show success message

**Sign Out:**
- Call Supabase: `supabase.auth.signOut()`
- Clear local state
- Redirect to home page

## 7. API Integration

**Get Profile:** GET `/api/profiles/me`
**Response:** `ProfileDTO` (includes email)

**Update Profile:** PATCH `/api/profiles/me`
**Request:** `{ display_name?: string }`
**Response:** Updated `ProfileDTO`

**Get User's Statements:** GET `/api/statements?created_by_user_id={id}`
**Response:** `PaginatedResponse<StatementDetailDTO>`

**Sign Out:** `supabase.auth.signOut()` (Supabase client method)

## 8. User Interactions

1. **View Profile:** See display name, email, member since date, avatar
2. **Edit Display Name:** Click edit icon/button, modify name inline, save
3. **View Own Statements:** Scroll through list of submitted statements
4. **Edit/Delete Own Statement:** Use buttons on statements still within grace period
5. **Navigate to Politician:** Click politician name in statement card
6. **Paginate Statements:** Navigate through pages if many statements
7. **Sign Out:** Click sign out button, confirm (optional), redirect to home

## 9. Conditions and Validation

**Display Name Validation:**
- Required (cannot be empty after trim)
- Min length: 1 character
- Max length: 100 characters

**Grace Period on Statements:**
- Show edit/delete buttons only on statements where `can_edit === true` and `can_delete === true`
- These flags are calculated server-side and included in response

**Sign Out Confirmation:**
- Optional: Show confirmation dialog before signing out
- Or immediate sign out (simpler UX)

## 10. Error Handling

**Profile Load Failure:**
- Display error state
- Provide retry button
- Message: "Failed to load profile"

**Profile Update Failure:**
- Display error near form
- Keep form open for retry
- Message: "Failed to update profile. Please try again."

**Statements Load Failure:**
- Display error in statements section
- Profile header remains visible
- Provide retry button

**Sign Out Failure:**
- Rare, but handle gracefully
- Show error toast
- Allow retry

## 11. Implementation Steps (Estimated: 12-15 hours)

### Phase 1: Profile Header (3-4 hours)
1. Create page with auth check
2. Fetch profile data
3. Create ProfileHeader component
4. Display avatar (initials), name, email, member since
5. Style header section

### Phase 2: Edit Profile Form (2-3 hours)
6. Create EditProfileForm component
7. Implement inline editing or modal
8. Add validation
9. Implement PATCH request
10. Show success/error feedback

### Phase 3: User Statements (4-5 hours)
11. Fetch user's statements with pagination
12. Reuse StatementCard components
13. Show grace period indicators
14. Implement pagination
15. Handle statement deletion

### Phase 4: Sign Out (1-2 hours)
16. Create SignOutButton component
17. Implement Supabase sign out
18. Handle redirect
19. Optional: Add confirmation dialog

### Phase 5: Polish and Testing (2-3 hours)
20. Implement responsive design
21. Add accessibility features
22. Test all interactions
23. Test error scenarios
24. Cross-browser testing

**Dependencies:**
- API endpoints (GET /api/profiles/me, PATCH /api/profiles/me, GET /api/statements)
- StatementCard component (reused)
- PaginationControls component (reused)
- Supabase auth client
- Layout components

