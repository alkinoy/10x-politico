# SpeechKarma

A public, searchable archive of politicians' statements that helps voters quickly assess a politician's consistency over time.

## 📋 Overview

**SpeechKarma** is a web application that captures and publishes public statements made by politicians. Authenticated users can submit statements (who/when/what), while anyone can browse recent statements and review each politician's timeline to understand their positions over time.

### The Problem

Voters often hear conflicting or shifting positions from politicians. Before voting, people need a fast way to verify what a politician has said and when.

### Our Goal

Provide a simple, trustworthy, and searchable record of public statements so that voters can quickly evaluate consistency and context ahead of elections or key votes.

## ✨ Key Features

### Public Access
- **Recent Statements Feed** - View the most recently added statements sorted chronologically
- **Politicians Directory** - Browse a comprehensive list of politicians with basic search
- **Politician Timelines** - View detailed pages showing each politician's statements over time with filtering capabilities

### User Contributions
- **Authenticated Submissions** - Registered users can add new statements with politician, date/time, and text
- **Edit/Delete Grace Period** - Contributors can correct mistakes within a 15-minute window
- **Statement Reporting** - Flag statements that may violate guidelines

### Quality & Trust
- User-submitted content with required field validation
- Simple flagging mechanism for community moderation
- Public disclaimer and transparency about content sources
- Terms of Use and Privacy Policy

## 🛠️ Tech Stack

### Frontend
- **Astro 5** - Fast, efficient web framework with minimal JavaScript
- **React 19** - Interactive components where needed
- **TypeScript 5** - Static typing and better IDE support
- **Tailwind CSS 4** - Convenient and consistent styling
- **Shadcn/ui** - Accessible React component library

### Backend
- **Supabase** - Comprehensive backend solution
  - PostgreSQL database
  - Built-in authentication
  - Multi-language SDKs (Backend-as-a-Service)
  - Open source with self-hosting capability

### AI Integration
- **Openrouter.ai** - Access to multiple AI models
  - OpenAI, Anthropic, Google, and others
  - Cost-effective solutions with financial limits

### DevOps
- **GitHub Actions** - CI/CD pipelines
- **DigitalOcean** - Application hosting via Docker

## 📁 Project Structure

```
src/
├── assets/          # Static internal assets
├── components/      # Client-side components
│   └── ui/          # Shadcn/ui components
├── db/              # Supabase clients and types
├── layouts/         # Astro layouts
├── lib/             # Services and helpers
├── middleware/      # Astro middleware
│   └── index.ts
├── pages/           # Astro pages
│   └── api/         # API endpoints
├── styles/          # Global styles
└── types.ts         # Shared types (Entities, DTOs)

public/              # Public assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- npm or yarn package manager
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd politico/src
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with required variables
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# OPENROUTER_API_KEY=your_openrouter_key (if using AI features)
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4321`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code with Prettier

## 🎯 MVP Success Criteria

### Quantitative KPIs
- ≥ 200 unique politicians profiled within 2 months of launch
- ≥ 2,000 statements published within 3 months
- ≥ 35% of sessions include a visit to a Politician detail page
- Median page load ≤ 2.0s on Recent and Politician pages
- < 1% error rate on statement submissions
- ≥ 20% returning visitors within 30 days

### Qualitative Outcomes
- Voters use SpeechKarma to understand politician consistency before voting
- Contributors find it easy to add and correct statements
- Journalists/analysts reference SpeechKarma timelines in their research

## 🧪 Development Guidelines

### Clean Code Principles

- Use linter feedback to improve code quality
- Prioritize error handling and edge cases
- Handle errors at the beginning of functions
- Use early returns for error conditions
- Place the happy path last in functions
- Avoid unnecessary else statements
- Use guard clauses for preconditions
- Implement proper error logging
- Provide user-friendly error messages

### Code Review Checklist

- [ ] All required fields validated
- [ ] Error handling implemented
- [ ] Accessible UI (WCAG AA contrast, keyboard navigation)
- [ ] Mobile-responsive design
- [ ] Performance optimized (< 2s load time)
- [ ] TypeScript types defined
- [ ] Linter warnings resolved

## 🗺️ Roadmap

### MVP (Current Phase)
- ✅ Politician directory and profiles
- ✅ Public statement feeds
- ✅ Politician timelines
- ✅ User authentication
- ✅ Statement submissions
- ✅ Basic search and filtering

### Post-MVP Features
- Advanced search (full-text, tags, topics)
- Source verification workflows
- Topic tagging and stance summaries
- Multimedia attachments (videos, audio, screenshots)
- AI-powered extraction and classification
- Internationalization
- Email notifications and subscriptions
- Public APIs and bulk export
- Advanced moderation console
- Complex role types (editor, verifier, curator)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Follows the project's coding guidelines
- Passes all linting checks (`npm run lint`)
- Is properly formatted (`npm run format`)
- Includes appropriate error handling
- Maintains accessibility standards

## 📄 License

[Add your license information here]

## 🔗 Links

- [Full Product Requirements Document](.ai/prd.md)
- [Tech Stack Details](.ai/tech-stack.md)
- [Terms of Use](#) (Coming soon)
- [Privacy Policy](#) (Coming soon)

## 📞 Contact

[Add contact information or links to issue tracker]

---

**Note:** SpeechKarma is a platform for user-submitted content related to public statements. All content must relate to publicly made statements by politicians. Users are responsible for the accuracy of their submissions.

