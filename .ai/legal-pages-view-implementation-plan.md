# View Implementation Plan: Legal Pages (Terms of Use & Privacy Policy)

## 1. Overview

The Legal Pages (Terms of Use and Privacy Policy) are static content pages that display legal information required for compliance and user transparency. Both pages share the same layout structure and implementation approach, differing only in content. They are accessible to all users (no authentication required) and linked from the footer. Both pages fulfill user story US-012 (Minimal legal pages).

## 2. View Routing

**Terms of Use Path:** `/terms`
**Privacy Policy Path:** `/privacy`

**Authentication Required:** No (public pages)

**Access Level:** Public (all users)

## 3. Component Structure

Both pages use the same structure:

```
LegalPage (Astro page - separate for /terms and /privacy)
├── Layout
│   └── Main Content
│       └── LegalPageContent (Astro component or React)
│           ├── PageHeader
│           │   ├── Title (h1)
│           │   └── LastUpdated
│           ├── ContentSection
│           │   └── FormattedContent (HTML from markdown)
│           └── BackToHomeLink
```

## 4. Component Details

### LegalPageContent
**Purpose:** Container for legal page content with consistent formatting
**Elements:**
- Page header with title
- Last updated date
- Content area with formatted text (headings, paragraphs, lists)
- Back to home link

**Props (if React component):**
```typescript
interface LegalPageContentProps {
  title: string;
  lastUpdated: string;
  content: string; // HTML content
}
```

### PageHeader
**Purpose:** Display page title and last updated date
**Elements:**
- `<h1>` for page title
- `<p>` or `<time>` for last updated date

### ContentSection
**Purpose:** Display formatted legal content
**Elements:**
- `<div>` with prose styling (Tailwind Typography plugin or custom)
- Rendered HTML content with proper semantic elements

### BackToHomeLink
**Purpose:** Navigation back to main site
**Elements:**
- `<a>` link to home page
- Arrow or icon (optional)
- Text: "Back to Home" or "Return to SpeechKarma"

## 5. Content Management

### Option 1: Markdown Files (Recommended)
- Store content in `.md` files: `src/content/terms.md`, `src/content/privacy.md`
- Use Astro Content Collections or markdown parser
- Render to HTML during build
- Easy to edit and version control

### Option 2: HTML Files
- Store content as HTML in separate files
- Import and render in Astro pages
- More control over formatting

### Option 3: Database (Overkill for MVP)
- Store in database for dynamic editing
- Not recommended for MVP (adds complexity)

## 6. Implementation Approach

### Astro-Only Implementation (Simplest)
- Create `/src/pages/terms.astro`
- Create `/src/pages/privacy.astro`
- Each page renders static content
- No React hydration needed (fully static)

### With Markdown (Recommended)
```typescript
// src/pages/terms.astro
---
import Layout from '@/layouts/Layout.astro';
import { getEntry } from 'astro:content';

const termsContent = await getEntry('legal', 'terms');
const { Content } = await termsContent.render();
---

<Layout title="Terms of Use">
  <main class="legal-page">
    <div class="container">
      <header>
        <h1>Terms of Use</h1>
        <p class="last-updated">Last updated: {termsContent.data.lastUpdated}</p>
      </header>
      
      <div class="prose">
        <Content />
      </div>
      
      <a href="/" class="back-link">← Back to Home</a>
    </div>
  </main>
</Layout>
```

## 7. Styling Considerations

### Typography
- Use readable font size (16-18px body text)
- Adequate line height (1.6-1.8 for body text)
- Comfortable line length (max 75ch)
- Clear heading hierarchy

### Layout
- Centered content with max-width (700-800px)
- Generous padding and margins
- Clean, minimalist design
- Print-friendly (no unnecessary graphics)

### Tailwind Typography Plugin
```bash
npm install -D @tailwindcss/typography
```

```html
<div class="prose prose-lg max-w-none">
  <!-- Content here -->
</div>
```

## 8. Accessibility

**Heading Hierarchy:**
- `<h1>` for page title
- `<h2>` for major sections
- `<h3>` for subsections
- Never skip heading levels

**Semantic HTML:**
- Use `<article>` for main content
- Use `<ul>` or `<ol>` for lists
- Use `<em>` and `<strong>` for emphasis
- Use `<time>` for dates

**Navigation:**
- Ensure all links are keyboard accessible
- Provide clear link text
- Add skip to main content link if needed

**Color Contrast:**
- Ensure WCAG AA compliance (4.5:1 for body text)
- Test with contrast checker

## 9. Content Structure

### Terms of Use - Suggested Sections
1. **Introduction**
   - What SpeechKarma is
   - Acceptance of terms

2. **User Accounts**
   - Account creation requirements
   - User responsibilities
   - Account security

3. **User-Generated Content**
   - Submitting statements
   - Content ownership
   - Content standards
   - Moderation rights

4. **Acceptable Use**
   - Prohibited activities
   - Intellectual property
   - Privacy respect

5. **Disclaimer**
   - "As is" service
   - User-submitted content accuracy
   - No warranty

6. **Limitation of Liability**
   - Service interruptions
   - Data loss
   - Third-party content

7. **Changes to Terms**
   - Right to modify
   - Notification process

8. **Contact Information**
   - Support email
   - Dispute resolution

### Privacy Policy - Suggested Sections
1. **Introduction**
   - Data we collect
   - How we use it
   - Who we share with

2. **Information We Collect**
   - Account information (email, display name)
   - Submitted statements
   - Usage data (analytics)
   - Cookies

3. **How We Use Your Information**
   - Provide service
   - Improve service
   - Communication
   - Legal compliance

4. **Data Sharing**
   - Public data (statements, display name)
   - Service providers (Supabase)
   - Legal requirements

5. **Data Security**
   - Security measures
   - Encryption
   - Access controls

6. **Your Rights**
   - Access your data
   - Correct data
   - Delete account
   - Export data

7. **Cookies**
   - Authentication cookies
   - Analytics cookies
   - How to disable

8. **Children's Privacy**
   - Age requirements
   - COPPA compliance

9. **Changes to Policy**
   - Right to modify
   - Notification

10. **Contact Us**
    - Privacy questions
    - Data requests
    - Email address

## 10. Implementation Steps (Estimated: 3-5 hours total for both pages)

### Phase 1: Setup (1 hour)
1. Create pages: `terms.astro` and `privacy.astro`
2. Setup content storage (markdown or HTML)
3. Choose styling approach (Tailwind Typography or custom)

### Phase 2: Terms of Use (1-2 hours)
4. Write/draft Terms of Use content
5. Structure content with proper headings
6. Render in page template
7. Style for readability
8. Test on various devices

### Phase 3: Privacy Policy (1-2 hours)
9. Write/draft Privacy Policy content
10. Structure content with proper headings
11. Render in page template
12. Apply same styling as Terms
13. Test on various devices

### Phase 4: Polish and Testing (1 hour)
14. Add last updated dates
15. Link from footer
16. Test accessibility (headings, keyboard nav)
17. Test print layout
18. Cross-browser testing
19. Mobile responsiveness

## 11. Example Markdown Structure

```markdown
<!-- src/content/legal/terms.md -->
---
title: Terms of Use
lastUpdated: 2024-10-30
---

# Terms of Use

Last updated: October 30, 2024

## 1. Introduction

Welcome to SpeechKarma. By accessing or using our service, you agree to be bound by these Terms of Use...

## 2. User Accounts

To submit statements, you must create an account...

### 2.1 Account Security

You are responsible for maintaining the confidentiality of your account...

## 3. User-Generated Content

SpeechKarma allows users to submit statements...

...
```

## 12. Footer Integration

Ensure both pages are linked from the global footer:

```html
<footer>
  <div class="footer-links">
    <a href="/terms">Terms of Use</a>
    <span>|</span>
    <a href="/privacy">Privacy Policy</a>
  </div>
  <p>&copy; 2024 SpeechKarma</p>
</footer>
```

## 13. SEO Considerations

**Meta Tags:**
```html
<meta name="description" content="Terms of Use for SpeechKarma" />
<meta name="robots" content="index, follow" />
```

**Sitemap:**
- Include both pages in sitemap.xml
- Helps with discoverability

## 14. Legal Content Sources

**Free Templates:**
- [Termly](https://termly.io/) - Privacy Policy and Terms generator
- [GetTerms](https://getterms.io/) - Free legal documents
- [TermsFeed](https://www.termsfeed.com/) - Policy generators

**Customization:**
- Adapt templates to SpeechKarma's specific use case
- Ensure accuracy (consider legal review)
- Update regularly as features change

## 15. Maintenance

**Regular Updates:**
- Review and update quarterly or when features change
- Update "Last updated" date
- Keep users informed of major changes

**Version Control:**
- Use git to track changes
- Tag versions if significant updates
- Archive old versions for reference

## Summary

Both legal pages follow the same implementation pattern:
1. **Simple Structure:** Static Astro pages with markdown content
2. **Shared Layout:** Use common legal page layout component
3. **Accessibility:** Proper heading hierarchy and semantic HTML
4. **Readability:** Clear typography and spacing
5. **Maintenance:** Easy to update content files
6. **SEO:** Proper meta tags and sitemap inclusion

**Total Estimated Time:** 3-5 hours for both pages
**Complexity:** Low (mostly content writing and basic styling)
**Dependencies:** Layout component, footer integration, content writing

