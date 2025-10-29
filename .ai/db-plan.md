# SpeechKarma Database Schema

## Overview

This database schema supports the SpeechKarma MVP - a public, searchable archive of politicians' statements. The design prioritizes performance for the three primary query patterns: recent statements feed, politician timelines, and politician search.

---

## Tables

### 1. parties

Stores political party information to ensure consistency and enable metadata management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | text | NOT NULL, UNIQUE | Full party name |
| abbreviation | text | NULL | Short party abbreviation (e.g., "GOP", "DNC") |
| description | text | NULL | Party description for informational purposes |
| color_hex | varchar(7) | NULL | Hex color code for UI display (e.g., "#FF0000") |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Record last update timestamp |

**Constraints:**
- `UNIQUE(name)` - Prevents duplicate party names
- `CHECK(color_hex ~ '^#[0-9A-Fa-f]{6}$')` - Validates hex color format

---

### 2. politicians

Stores politician profiles with biographical information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| first_name | text | NOT NULL | Politician's first name |
| last_name | text | NOT NULL | Politician's last name |
| party_id | uuid | NOT NULL, REFERENCES parties(id) ON DELETE RESTRICT | Current political party |
| biography | text | NULL | Short biographical description |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Record last update timestamp |

**Constraints:**
- `CHECK(length(trim(first_name)) >= 1)` - Ensures non-empty first name
- `CHECK(length(trim(last_name)) >= 1)` - Ensures non-empty last name
- `UNIQUE(first_name, last_name, party_id)` - Prevents duplicate politician entries within same party

---

### 3. statements

Core entity storing political statements with dual timestamp tracking and soft deletion support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| politician_id | uuid | NOT NULL, REFERENCES politicians(id) ON DELETE RESTRICT | Politician who made the statement |
| statement_text | text | NOT NULL | The actual statement content |
| statement_timestamp | timestamptz | NOT NULL | When the politician made the statement |
| created_by_user_id | uuid | NOT NULL, REFERENCES auth.users(id) ON DELETE RESTRICT | User who submitted this statement |
| created_at | timestamptz | NOT NULL, DEFAULT now() | When the record was created |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | When the record was last updated |
| deleted_at | timestamptz | NULL | Soft delete timestamp (NULL = active) |

**Constraints:**
- `CHECK(length(trim(statement_text)) >= 10)` - Minimum statement length
- `CHECK(length(statement_text) <= 5000)` - Maximum statement length
- `CHECK(statement_timestamp <= created_at)` - Cannot log future statements

---

### 4. profiles

Extends Supabase auth.users with public profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| display_name | text | NOT NULL | Public display name for attribution |
| is_admin | boolean | NOT NULL, DEFAULT false | Admin flag for moderation features |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Profile creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Profile last update timestamp |

**Constraints:**
- `CHECK(length(trim(display_name)) >= 1)` - Ensures non-empty display name
- `CHECK(length(display_name) <= 100)` - Reasonable display name length limit

---

## Relationships

### Entity Relationship Diagram

```
parties (1) ────< (M) politicians
                        │
                        │ (1)
                        │
                        ├──< (M) statements >── (M) auth.users
                        │                            │
                        │                            │ (1)
                        │                            │
                        └────────────────────────────┴──< (1) profiles
```

### Relationship Details

1. **parties → politicians** (One-to-Many)
   - One party can have many politicians
   - Each politician belongs to exactly one party
   - Foreign Key: `politicians.party_id` → `parties.id`
   - On Delete: RESTRICT (cannot delete party with existing politicians)

2. **politicians → statements** (One-to-Many)
   - One politician can have many statements
   - Each statement belongs to exactly one politician
   - Foreign Key: `statements.politician_id` → `politicians.id`
   - On Delete: RESTRICT (preserve statements when politician exists)

3. **auth.users → statements** (One-to-Many)
   - One user can submit many statements
   - Each statement is submitted by exactly one user
   - Foreign Key: `statements.created_by_user_id` → `auth.users.id`
   - On Delete: RESTRICT (preserve attribution)

4. **auth.users → profiles** (One-to-One)
   - Each user has exactly one profile
   - Each profile belongs to exactly one user
   - Foreign Key: `profiles.id` → `auth.users.id`
   - On Delete: CASCADE (delete profile when user is deleted)

---

## Indexes

### Performance-Critical Indexes

```sql
-- parties table
CREATE INDEX idx_parties_name ON parties(name);

-- politicians table
CREATE INDEX idx_politicians_last_name_first_name 
  ON politicians(last_name, first_name);

CREATE INDEX idx_politicians_party_id 
  ON politicians(party_id);

CREATE INDEX idx_politicians_fulltext_search 
  ON politicians USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- statements table (primary query patterns)
CREATE INDEX idx_statements_recent_feed 
  ON statements(created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_statements_politician_timeline 
  ON statements(politician_id, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_statements_politician_statement_time 
  ON statements(politician_id, statement_timestamp DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_statements_created_by_user 
  ON statements(created_by_user_id, created_at DESC);

CREATE INDEX idx_statements_deleted 
  ON statements(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- profiles table
CREATE INDEX idx_profiles_display_name 
  ON profiles(display_name);
```

### Index Usage Patterns

1. **Recent Statements Feed (US-001)**
   - Query: `SELECT * FROM statements WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50`
   - Index: `idx_statements_recent_feed`

2. **Politician Timeline (US-003)**
   - Query: `SELECT * FROM statements WHERE politician_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`
   - Index: `idx_statements_politician_timeline`

3. **Politician Search (US-002, US-009)**
   - Query: `SELECT * FROM politicians WHERE to_tsvector('english', first_name || ' ' || last_name) @@ plainto_tsquery('english', $1)`
   - Index: `idx_politicians_fulltext_search`

4. **Alphabetical Politicians List**
   - Query: `SELECT * FROM politicians ORDER BY last_name, first_name`
   - Index: `idx_politicians_last_name_first_name`

---

## Triggers and Functions

### Auto-Update Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_parties_updated_at 
  BEFORE UPDATE ON parties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_politicians_updated_at 
  BEFORE UPDATE ON politicians 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statements_updated_at 
  BEFORE UPDATE ON statements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-Create Profile on User Signup

```sql
-- Function to create profile when new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Row-Level Security (RLS) Policies

### Note on RLS Implementation

Based on planning decisions, RLS policies are **not implemented for the MVP** to keep the application layer responsible for business logic enforcement. The grace period for edit/delete operations will be handled at the application level.

### Future RLS Considerations (Post-MVP)

When implementing RLS in future iterations, consider these policies:

```sql
-- Example policies (NOT IMPLEMENTED IN MVP)

-- parties: public read
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public parties are viewable by everyone" 
  ON parties FOR SELECT USING (true);

-- politicians: public read
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public politicians are viewable by everyone" 
  ON politicians FOR SELECT USING (true);

-- statements: public read for non-deleted, ownership for modifications
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public statements are viewable by everyone" 
  ON statements FOR SELECT 
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own statements" 
  ON statements FOR INSERT 
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can update own statements within grace period" 
  ON statements FOR UPDATE 
  USING (
    auth.uid() = created_by_user_id 
    AND deleted_at IS NULL 
    AND created_at > now() - interval '15 minutes'
  );

-- profiles: public read, users can update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

---

## Design Decisions and Rationale

### 1. Dual Timestamp Strategy

**Decision:** Separate `statement_timestamp` (when politician spoke) from `created_at` (when submitted)

**Rationale:**
- Enables accurate historical timelines
- Tracks contributor activity patterns
- Supports backdating verification via CHECK constraint
- Meets US-001, US-003, US-005 requirements

### 2. Soft Deletion Pattern

**Decision:** Use `deleted_at` timestamp instead of hard deletes

**Rationale:**
- Preserves data for audit trails
- Enables potential recovery/undo features
- Simplifies application logic (just set timestamp)
- Partial indexes maintain query performance
- Meets US-007 requirement while preserving integrity

### 3. Party Normalization

**Decision:** Separate `parties` table instead of inline text field

**Rationale:**
- Ensures spelling consistency
- Enables party metadata (colors, abbreviations) for UI
- Facilitates party-based filtering and analytics
- Prevents duplicate entries with variations
- Supports US-002, US-011 requirements

### 4. Profile Table Separation

**Decision:** Separate `profiles` table linked to `auth.users`

**Rationale:**
- Supabase best practice (auth schema isolation)
- Allows custom user metadata without touching auth
- Supports public attribution (display_name)
- Enables future admin roles (is_admin)
- Meets US-004, US-005 requirements

### 5. No Edit History (MVP)

**Decision:** Track only `updated_at` without full revision history

**Rationale:**
- MVP scope limitation (US-006)
- Reduces complexity and storage
- Application-level grace period enforcement
- Post-MVP: can add `statement_revisions` table if needed

### 6. Indexing Strategy

**Decision:** Multiple specialized indexes for query patterns

**Rationale:**
- Optimizes three primary access patterns (feed, timeline, search)
- Partial indexes reduce index size and improve performance
- Full-text search index enables US-009 politician search
- Meets US-013 performance requirement (< 2s load time)

### 7. UUID Primary Keys

**Decision:** Use `uuid` type with `gen_random_uuid()` for all primary keys

**Rationale:**
- Prevents enumeration attacks
- Enables distributed ID generation
- Standard Supabase practice
- Better security for public-facing application
- No sequential ID disclosure

### 8. Constraint Enforcement

**Decision:** Database-level constraints for data validation

**Rationale:**
- Defense-in-depth (validates even if application logic bypassed)
- Data integrity guarantees
- Clear error messages from database
- Meets US-005 validation requirements
- Follows clean code practices from project rules

### 9. Foreign Key Actions

**Decision:** RESTRICT on most deletions, CASCADE only for profiles

**Rationale:**
- Prevents accidental data loss
- Forces explicit handling of relationships
- Profiles are user-owned (CASCADE appropriate)
- Preserves attribution and statement history
- Meets data integrity requirements

### 10. Timestamp Timezone Awareness

**Decision:** Use `timestamptz` for all timestamp fields

**Rationale:**
- PostgreSQL best practice
- Handles global user base correctly
- Automatic timezone conversion
- Prevents ambiguity in statement timelines
- Supports future internationalization (post-MVP)

---

## Migration Strategy

### Recommended Migration Order

1. **parties** (no dependencies)
2. **politicians** (depends on parties)
3. **profiles** (depends on auth.users, requires trigger)
4. **statements** (depends on politicians and auth.users)
5. **indexes** (after data population for better performance)
6. **triggers** (updated_at triggers after tables exist)

### Sample Data Considerations

For development and testing:
- Create seed data for major parties (Democrat, Republican, Independent, etc.)
- Include sample politicians from various parties
- Generate test statements with varied timestamps
- Ensure test data covers edge cases (grace period boundaries, soft deletes, etc.)

---

## Performance Considerations

### Expected Query Performance

Based on US-013 requirements (< 2s page load):

1. **Recent Statements Feed**
   - Target: < 200ms for 50 records
   - Index: `idx_statements_recent_feed`
   - Optimization: Partial index excludes deleted records

2. **Politician Timeline**
   - Target: < 300ms for 100 records
   - Index: `idx_statements_politician_timeline`
   - Optimization: Composite index on politician_id + timestamp

3. **Politician Search**
   - Target: < 500ms for text search
   - Index: `idx_politicians_fulltext_search`
   - Optimization: GIN index for full-text search

### Scalability Thresholds

- Up to 10,000 politicians: Current schema optimal
- Up to 1,000,000 statements: Indexes handle efficiently
- Beyond 1M statements: Consider partitioning by date
- High write volume: Monitor index maintenance overhead

### Monitoring Recommendations

- Track query execution times for primary patterns
- Monitor index usage with `pg_stat_user_indexes`
- Watch for table bloat from soft deletes
- Set up alerts for queries exceeding 1 second

---

## Security Considerations

### Application-Level Security (MVP)

Since RLS is not implemented in MVP, the application layer must enforce:

1. **Authentication checks** before statement submission
2. **Ownership validation** for edit/delete operations
3. **Grace period enforcement** (15-minute window)
4. **Soft delete** instead of hard delete
5. **Input sanitization** to prevent SQL injection

### Database-Level Security

1. **Constraints** validate data integrity
2. **Foreign keys** maintain referential integrity
3. **CHECK constraints** enforce business rules
4. **Unique constraints** prevent duplicates
5. **NOT NULL** ensures required fields

### Future Security Enhancements (Post-MVP)

- Implement full RLS policies (see section above)
- Add admin-only policies for moderation
- Consider statement verification workflow
- Implement source URL validation
- Add rate limiting at database level

---

## Appendix: SQL Schema Creation Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PARTIES TABLE
CREATE TABLE parties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    abbreviation text,
    description text,
    color_hex varchar(7) CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. POLITICIANS TABLE
CREATE TABLE politicians (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL CHECK (length(trim(first_name)) >= 1),
    last_name text NOT NULL CHECK (length(trim(last_name)) >= 1),
    party_id uuid NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    biography text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(first_name, last_name, party_id)
);

-- 3. PROFILES TABLE
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NOT NULL CHECK (length(trim(display_name)) >= 1 AND length(display_name) <= 100),
    is_admin boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. STATEMENTS TABLE
CREATE TABLE statements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id uuid NOT NULL REFERENCES politicians(id) ON DELETE RESTRICT,
    statement_text text NOT NULL CHECK (length(trim(statement_text)) >= 10 AND length(statement_text) <= 5000),
    statement_timestamp timestamptz NOT NULL,
    created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CHECK (statement_timestamp <= created_at)
);

-- INDEXES
CREATE INDEX idx_parties_name ON parties(name);

CREATE INDEX idx_politicians_last_name_first_name ON politicians(last_name, first_name);
CREATE INDEX idx_politicians_party_id ON politicians(party_id);
CREATE INDEX idx_politicians_fulltext_search ON politicians USING gin(to_tsvector('english', first_name || ' ' || last_name));

CREATE INDEX idx_statements_recent_feed ON statements(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_statements_politician_timeline ON statements(politician_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_statements_politician_statement_time ON statements(politician_id, statement_timestamp DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_statements_created_by_user ON statements(created_by_user_id, created_at DESC);
CREATE INDEX idx_statements_deleted ON statements(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_profiles_display_name ON profiles(display_name);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_politicians_updated_at BEFORE UPDATE ON politicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_statements_updated_at BEFORE UPDATE ON statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AUTO-CREATE PROFILE
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Next Steps

1. **Review and Approval**
   - Review schema with stakeholders
   - Validate against all user stories
   - Confirm performance expectations

2. **Migration Implementation**
   - Create Supabase migration files
   - Test migrations in development environment
   - Prepare rollback scripts

3. **Seed Data**
   - Create initial parties data
   - Add sample politicians for testing
   - Generate test statements

4. **Application Integration**
   - Generate TypeScript types from schema
   - Implement data access layer
   - Add validation logic for grace period

5. **Testing**
   - Unit tests for constraints
   - Performance tests for query patterns
   - Load testing for scalability validation

6. **Documentation**
   - API documentation for database operations
   - Developer guide for common queries
   - Migration guide for future schema changes

