-- ============================================================================
-- Migration: Initial Schema for SpeechKarma MVP
-- Created: 2025-10-29 14:30:00 UTC
-- Description: Creates the core database schema for SpeechKarma including
--              parties, politicians, profiles, and statements tables with
--              full-text search, soft deletion, and optimized indexing.
--
-- Affected Tables:
--   - parties (new)
--   - politicians (new)
--   - profiles (new)
--   - statements (new)
--
-- Special Considerations:
--   - Soft deletion implemented via deleted_at timestamp on statements
--   - Dual timestamp tracking (statement_timestamp vs created_at)
--   - Full-text search on politician names
--   - Auto-updating timestamp triggers
--   - Auto-profile creation on user signup
--   - RLS enabled on all tables (enforced at application layer for MVP)
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- enable uuid generation
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLE: parties
-- ============================================================================
-- Stores political party information to ensure consistency across politicians.
-- Prevents typos and enables party metadata for UI display (colors, abbreviations).
-- Referenced by: politicians table
-- ============================================================================

create table parties (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    abbreviation text,
    description text,
    color_hex varchar(7) check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- add comment to table
comment on table parties is 'Political parties with metadata for UI consistency and data normalization';
comment on column parties.name is 'Full party name (unique constraint prevents duplicates)';
comment on column parties.abbreviation is 'Short party code (e.g., GOP, DNC)';
comment on column parties.color_hex is 'Hex color code for UI display, validated by check constraint';

-- ============================================================================
-- TABLE: politicians
-- ============================================================================
-- Stores politician profiles with biographical information.
-- Each politician belongs to exactly one party (current affiliation).
-- Referenced by: statements table
-- ============================================================================

create table politicians (
    id uuid primary key default gen_random_uuid(),
    first_name text not null check (length(trim(first_name)) >= 1),
    last_name text not null check (length(trim(last_name)) >= 1),
    party_id uuid not null references parties(id) on delete restrict,
    biography text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(first_name, last_name, party_id)
);

-- add comments to table
comment on table politicians is 'Politician profiles with current party affiliation';
comment on column politicians.first_name is 'First name (trimmed, non-empty)';
comment on column politicians.last_name is 'Last name (trimmed, non-empty)';
comment on column politicians.party_id is 'Current party affiliation (foreign key to parties)';
comment on column politicians.biography is 'Short biographical description for profile pages';

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Extends Supabase auth.users with public profile information.
-- One-to-one relationship with auth.users (id is both PK and FK).
-- Auto-created via trigger when user signs up.
-- ============================================================================

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null check (length(trim(display_name)) >= 1 and length(display_name) <= 100),
    is_admin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- add comments to table
comment on table profiles is 'User profiles extending Supabase auth with public display information';
comment on column profiles.id is 'Links to auth.users.id (one-to-one relationship)';
comment on column profiles.display_name is 'Public display name for statement attribution (1-100 characters)';
comment on column profiles.is_admin is 'Admin flag for future moderation features';

-- ============================================================================
-- TABLE: statements
-- ============================================================================
-- Core entity storing political statements with dual timestamp tracking.
-- - statement_timestamp: when the politician actually made the statement
-- - created_at: when the record was submitted to the platform
-- - deleted_at: soft deletion timestamp (null = active, non-null = deleted)
-- Referenced by: (future) statement_flags table
-- ============================================================================

create table statements (
    id uuid primary key default gen_random_uuid(),
    politician_id uuid not null references politicians(id) on delete restrict,
    statement_text text not null check (length(trim(statement_text)) >= 10 and length(statement_text) <= 5000),
    statement_timestamp timestamptz not null,
    created_by_user_id uuid not null references profiles(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    check (statement_timestamp <= created_at)
);

-- add comments to table
comment on table statements is 'Political statements with dual timestamp tracking and soft deletion';
comment on column statements.politician_id is 'Politician who made the statement (foreign key)';
comment on column statements.statement_text is 'The actual statement content (10-5000 characters)';
comment on column statements.statement_timestamp is 'When the politician actually made the statement (user-provided)';
comment on column statements.created_by_user_id is 'User who submitted this statement (foreign key to profiles for ownership tracking)';
comment on column statements.created_at is 'When the record was created in the database';
comment on column statements.deleted_at is 'Soft delete timestamp (null = active, non-null = deleted)';

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimized for three primary query patterns:
-- 1. Recent statements feed (US-001)
-- 2. Politician timeline (US-003)
-- 3. Politician search (US-002, US-009)
-- ============================================================================

-- parties indexes
create index idx_parties_name on parties(name);

-- politicians indexes
-- alphabetical sorting for politicians list
create index idx_politicians_last_name_first_name on politicians(last_name, first_name);

-- join optimization for politician-party queries
create index idx_politicians_party_id on politicians(party_id);

-- full-text search for politician names (us-002, us-009)
create index idx_politicians_fulltext_search on politicians 
  using gin(to_tsvector('english', first_name || ' ' || last_name));

-- statements indexes
-- recent feed query optimization (us-001)
-- partial index excludes soft-deleted records
create index idx_statements_recent_feed on statements(created_at desc) 
  where deleted_at is null;

-- politician timeline by submission time (us-003)
-- composite index for efficient filtering and sorting
create index idx_statements_politician_timeline on statements(politician_id, created_at desc) 
  where deleted_at is null;

-- politician timeline by actual statement time
-- enables filtering by when politician actually spoke
create index idx_statements_politician_statement_time on statements(politician_id, statement_timestamp desc) 
  where deleted_at is null;

-- user's statement history (for edit/delete grace period checks)
create index idx_statements_created_by_user on statements(created_by_user_id, created_at desc);

-- deleted statements tracking (for admin/audit purposes)
create index idx_statements_deleted on statements(deleted_at) 
  where deleted_at is not null;

-- profiles indexes
-- display name lookup for attribution
create index idx_profiles_display_name on profiles(display_name);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- ============================================================================
-- FUNCTION: update_updated_at_column()
-- ============================================================================
-- Automatically updates the updated_at timestamp when any row is modified.
-- Applied to all tables with updated_at columns via triggers.
-- ============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- apply updated_at trigger to all tables
create trigger update_parties_updated_at 
  before update on parties 
  for each row execute function update_updated_at_column();

create trigger update_politicians_updated_at 
  before update on politicians 
  for each row execute function update_updated_at_column();

create trigger update_statements_updated_at 
  before update on statements 
  for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at 
  before update on profiles 
  for each row execute function update_updated_at_column();

-- ============================================================================
-- FUNCTION: handle_new_user()
-- ============================================================================
-- Automatically creates a profile when a new user signs up.
-- Uses display_name from metadata if provided, otherwise uses email prefix.
-- SECURITY DEFINER allows function to insert into profiles table.
-- ============================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, display_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    );
    return new;
end;
$$ language 'plpgsql' security definer;

-- trigger to auto-create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS is enabled on all tables but policies are intentionally simple for MVP.
-- Business logic enforcement (grace period, ownership) handled at application layer.
-- Future iterations may implement more granular database-level policies.
-- ============================================================================

-- ============================================================================
-- RLS: parties
-- ============================================================================
-- Public table - all users can read party information.
-- Only admins can modify (enforced at application layer).
-- ============================================================================

alter table parties enable row level security;

-- anon users can select parties
create policy "anon_users_select_parties"
  on parties
  for select
  to anon
  using (true);

-- authenticated users can select parties
create policy "authenticated_users_select_parties"
  on parties
  for select
  to authenticated
  using (true);

-- authenticated users can insert parties (application enforces admin check)
create policy "authenticated_users_insert_parties"
  on parties
  for insert
  to authenticated
  with check (true);

-- authenticated users can update parties (application enforces admin check)
create policy "authenticated_users_update_parties"
  on parties
  for update
  to authenticated
  using (true);

-- authenticated users can delete parties (application enforces admin check)
create policy "authenticated_users_delete_parties"
  on parties
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- RLS: politicians
-- ============================================================================
-- Public table - all users can read politician information.
-- Only admins can modify (enforced at application layer).
-- ============================================================================

alter table politicians enable row level security;

-- anon users can select politicians
create policy "anon_users_select_politicians"
  on politicians
  for select
  to anon
  using (true);

-- authenticated users can select politicians
create policy "authenticated_users_select_politicians"
  on politicians
  for select
  to authenticated
  using (true);

-- authenticated users can insert politicians (application enforces admin check)
create policy "authenticated_users_insert_politicians"
  on politicians
  for insert
  to authenticated
  with check (true);

-- authenticated users can update politicians (application enforces admin check)
create policy "authenticated_users_update_politicians"
  on politicians
  for update
  to authenticated
  using (true);

-- authenticated users can delete politicians (application enforces admin check)
create policy "authenticated_users_delete_politicians"
  on politicians
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- RLS: profiles
-- ============================================================================
-- Public read access for statement attribution.
-- Users can only update their own profiles.
-- Profiles are auto-created and should not be manually inserted/deleted.
-- ============================================================================

alter table profiles enable row level security;

-- anon users can select profiles (for public statement attribution)
create policy "anon_users_select_profiles"
  on profiles
  for select
  to anon
  using (true);

-- authenticated users can select all profiles
create policy "authenticated_users_select_profiles"
  on profiles
  for select
  to authenticated
  using (true);

-- authenticated users can update only their own profile
create policy "authenticated_users_update_own_profile"
  on profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- RLS: statements
-- ============================================================================
-- Public read access for non-deleted statements.
-- Authenticated users can insert statements.
-- Edit/delete operations allowed with ownership check.
-- Note: Grace period (15 minutes) enforced at application layer, not database.
-- ============================================================================

alter table statements enable row level security;

-- anon users can select non-deleted statements
create policy "anon_users_select_statements"
  on statements
  for select
  to anon
  using (deleted_at is null);

-- authenticated users can select non-deleted statements
create policy "authenticated_users_select_statements"
  on statements
  for select
  to authenticated
  using (deleted_at is null);

-- authenticated users can insert statements
-- ownership is established via created_by_user_id (set to auth.uid() at application layer)
-- note: profiles.id = auth.users.id, so auth.uid() = created_by_user_id is valid
create policy "authenticated_users_insert_statements"
  on statements
  for insert
  to authenticated
  with check (auth.uid() = created_by_user_id);

-- authenticated users can update their own non-deleted statements
-- note: grace period (15 minutes) is enforced at application layer
-- note: application must prevent changes to critical fields like politician_id
create policy "authenticated_users_update_own_statements"
  on statements
  for update
  to authenticated
  using (auth.uid() = created_by_user_id and deleted_at is null)
  with check (auth.uid() = created_by_user_id and deleted_at is null);

-- authenticated users can delete (soft delete) their own statements
-- note: grace period (15 minutes) is enforced at application layer
-- note: application sets deleted_at timestamp rather than hard deleting
create policy "authenticated_users_delete_own_statements"
  on statements
  for delete
  to authenticated
  using (auth.uid() = created_by_user_id and deleted_at is null);

-- ============================================================================
-- SEED DATA (Optional)
-- ============================================================================
-- Uncomment the following to insert common political parties.
-- This provides a baseline set of parties for initial testing and development.
-- ============================================================================

-- insert into parties (name, abbreviation, description, color_hex) values
--   ('Democratic Party', 'DEM', 'One of the two major political parties in the United States', '#0015BC'),
--   ('Republican Party', 'REP', 'One of the two major political parties in the United States', '#E81B23'),
--   ('Independent', 'IND', 'Politicians not affiliated with any major party', '#808080'),
--   ('Libertarian Party', 'LIB', 'Third party advocating for limited government', '#FED105'),
--   ('Green Party', 'GRN', 'Third party focused on environmentalism and social justice', '#17AA5C');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

