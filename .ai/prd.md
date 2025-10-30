# SpeechKarma — Product Requirements Document (PRD)

## TL;DR
SpeechKarma is a public, searchable archive of politicians’ statements. It helps voters quickly assess a politician’s consistency over time. MVP includes politician profiles, authenticated statement submissions, and public browsing of recent statements and per-politician timelines. Success = engaged contributors, growing corpus, and frequent voter lookups pre-election.

---

## 1) Product Description

**SpeechKarma** is a web application that captures and publishes public statements made by politicians. Authenticated users can submit statements (who/when/what). Anyone can browse recent statements and review each politician’s timeline to understand positions over time.

---

## 2) Problem & Goal

**Problem:** Voters often hear conflicting or shifting positions from politicians. Before voting, people need a fast way to verify what a politician has said and when.

**Goal:** Provide a simple, trustworthy, and searchable record of public statements so that voters can quickly evaluate consistency and context ahead of elections or key votes.

---

## 3) Functional Requirements (MVP)

### 3.1 Core Entities
- **Politician**
  - First name, last name
  - Current political party
  - Short biography/description
- **Statement**
  - Politician reference (who)
  - Timestamp (when)
  - Statement text (what)
  - *(Optional, post-MVP)* Source link (URL), media attachment, tags
- **User**
  - Authentication (sign up / sign in / sign out)
  - Profile with display name

### 3.2 Core Features
- **Public browsing**
  - View *Recent Statements* feed (most recent first)
  - View *Politicians* list
  - View *Politician detail* page with that politician’s statements (reverse chronological), basic profile, and party
- **Contribution**
  - Authenticated users can add a statement: select politician, enter date/time, paste statement text
  - Edit/delete own statements (within a short grace period or until moderated — see MVP boundaries)
- **Findability & Usability**
  - Basic search by politician name
  - Basic filtering on a politician page by time range (e.g., last 7/30/365 days)
  - Pagination or infinite scroll on feeds
- **Quality & Safety (minimal)**
  - Required fields validation
  - Simple “Report/Flag” button on any statement (stores a flag for admin review; full moderation is post-MVP)
- **Legal & Transparency**
  - Public disclaimer that content is user-submitted and must relate to public statements
  - Terms of Use and Privacy Policy pages

---

## 4) MVP Boundaries

**In Scope (MVP):**
- Politician directory with required fields
- Public feed of recent statements
- Politician timelines
- Authenticated submission of statements (who/when/what)
- Basic performance (pages load under ~2s on typical broadband) and mobile-friendly UI

**Out of Scope (Post-MVP / Nice-to-Have):**
- Basic search (by politician name) and per-politician date filters
- Edit/delete own statements within a short window (e.g., 15 minutes) to correct mistakes
- Simple reporting (flag) mechanism (stores flags for later review)
- Full moderation console and workflows (triage/resolve/appeals)
- Source verification workflows and credibility scoring
- Advanced search (full-text across statement body, tags, party, topics)
- Topic tagging and stance summaries
- Multimedia attachments (videos, audio, screenshots)
- Automated AI extraction, classification, or summarization
- Internationalization and multi-language content
- Notifications, subscriptions, or email digests
- Public APIs and bulk export
- Complex role types (editor, verifier, curator)

---

## 5) User Stories

US-001  
**Title:** Browse recent statements  
**Description:** As a visitor, I want to see the most recently added statements so I can quickly scan what’s new.  
**Acceptance criterias:**  
- Recent statements page shows statements sorted by newest first.  
- Each item shows politician name, party, date/time, and statement text (truncated with “Read more”).  
- Pagination or infinite scroll loads more items.  

US-002  
**Title:** View politician directory  
**Description:** As a visitor, I want to browse a list of politicians so I can pick one to research.  
**Acceptance criterias:**  
- Politicians list shows name, party, and a short description.  
- List is alphabetically sorted by last name.  
- Basic search box filters by name in real time or on submit.  

US-003  
**Title:** View politician’s timeline  
**Description:** As a visitor, I want to open a politician’s page to see their statements in chronological order.  
**Acceptance criterias:**  
- Politician page shows profile (name, party, short bio).  
- Timeline lists statements newest first with date/time and text.  
- Date range filter (Last 7 / 30 / 365 days, All) narrows results.  

US-004  
**Title:** Sign up / Sign in  
**Description:** As a user, I want to create an account and log in so I can add statements.  
**Acceptance criterias:**  
- Sign up with email and password; confirmation flow (or immediate access if configured).  
- Sign in with email and password.  
- Logged-in state is visible in the header; sign out is available.  

US-005  
**Title:** Add a statement  
**Description:** As an authenticated user, I want to add a new statement with who/when/what.  
**Acceptance criterias:**  
- Form requires politician selection, date/time, and statement text.  
- Validations: all required fields present; text length within limits.  
- On save, the statement appears in Recent and in the politician timeline.  

US-006  
**Title:** Edit my statement (grace window)  
**Description:** As an authenticated user, I want to correct typos in my statement shortly after posting.  
**Acceptance criterias:**  
- User can edit own statement within a 15-minute window from creation.  
- Edit preserves created/updated timestamps.  
- After the window, the edit action is disabled (visible but unavailable).  

US-007  
**Title:** Delete my statement (grace window)  
**Description:** As an authenticated user, I want to delete my statement shortly after posting if I made a mistake.  
**Acceptance criterias:**  
- User can delete own statement within a 15-minute window from creation.  
- Deleting removes it from feeds and politician pages.  
- After the window, the delete action is disabled.  

US-008  
**Title:** Report a statement  
**Description:** As any user (visitor or authenticated), I want to flag a statement I believe violates the rules.  
**Acceptance criterias:**  
- “Report” button is shown on statement items.  
- Click opens a simple form (reason dropdown + optional comment).  
- Submission stores a flag linked to that statement (no public change in MVP).  

US-009  
**Title:** Basic search by politician  
**Description:** As a visitor, I want to search for a politician by name.  
**Acceptance criterias:**  
- Search box on the Politicians page filters results by first/last name.  
- No-results state is shown when nothing matches.  
- Search query is reflected in URL or state to allow sharing.  

US-010  
**Title:** Statement readability  
**Description:** As a visitor, I want statement text to be readable on mobile and desktop.  
**Acceptance criterias:**  
- Statement text wraps correctly and truncates with “Read more” after N lines.  
- Clicking “Read more” expands inline without leaving the page.  
- Layout remains accessible (contrast AA, semantic headings).  

US-011  
**Title:** View party on statement items  
**Description:** As a visitor, I want to see each politician’s current party on their statements.  
**Acceptance criterias:**  
- Each statement item shows politician name and current party.  
- If a politician’s party changes later, historical statements still display the *current* party (MVP behavior).  

US-012  
**Title:** Minimal legal pages  
**Description:** As a visitor, I want to read Terms and Privacy so I understand usage.  
**Acceptance criterias:**  
- Footer links to Terms of Use and Privacy Policy.  
- Pages are publicly accessible and crawlable.  

US-013  
**Title:** Performance & basic reliability  
**Description:** As a visitor, I want pages to load fast.  
**Acceptance criterias:**  
- First view of Recent Statements and a Politician page typically loads under ~2 seconds on standard broadband.  
- Paginated loads complete under ~1 second on average data sets.  

US-014  
**Title:** Accessibility basics  
**Description:** As a visitor using assistive tech, I want to navigate and read content.  
**Acceptance criterias:**  
- Interactive controls are keyboard-navigable and labelled.  
- Color contrast meets WCAG AA for text and controls.  

---

## 6) Success Definition

**Qualitative Outcomes**
- Voters report that SpeechKarma helps them understand a politician’s consistency before voting.
- Contributors find it easy to add and correct statements with minimal friction.
- Journalists/analysts reference SpeechKarma timelines in their research.

**Quantitative KPIs (MVP targets)**
- ≥ 200 unique politicians profiled within 2 months of launch.
- ≥ 2,000 statements published within 3 months.
- ≥ 35% of sessions include a visit to a Politician detail page.
- Median page load ≤ 2.0s on Recent and Politician pages.
- < 1% error rate on statement submissions (validation failures excluded).
- ≥ 20% returning visitors within 30 days (indicates research utility).

**Integrity & Safety Indicators**
- < 5% of statements flagged for policy violations during MVP.
- Time to address high-severity flags (even without full moderation UI): ≤ 7 days via manual admin tools.

---
