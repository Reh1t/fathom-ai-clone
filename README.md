# Fathom AI Clone

A production-oriented prototype of an AI meeting assistant inspired by Fathom Video. It focuses on turning recorded meetings into searchable transcripts, summaries, decisions, highlights, and action items.

## The Problem
Building a high-fidelity, interactive meeting intelligence dashboard is difficult to demonstrate to evaluators because it usually requires setting up complex OAuth flows, paying for LLM API usage, and manually recording hour-long meetings to populate the UI. 

The challenge was: *How do we build a complex, production-grade AI clone that runs entirely locally, is fully populated with realistic data instantly, and requires zero configuration to evaluate?*

## The Solution
We built a Next.js App Router application with a dedicated **Offline Demo Mode**. Instead of relying on real external APIs, the app uses procedural data generation and stitched text-to-speech (TTS) audio to simulate an authentic 60-minute, 8-person corporate meeting. 

Evaluators can instantly bypass authentication, drop into a fully populated workspace, and interact with timeline scrubbing, live transcript syncing, AI summaries, and an "Ask AI" chat interface—all running deterministic, pre-computed data locally without requiring a credit card or active internet connection.

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Database**: SQLite & [Prisma ORM](https://www.prisma.io/) (optimized for zero-config local testing)
- **State & UI**: React, Tailwind CSS, Zustand (global state management)
- **Audio Simulation Pipeline**: Node.js (procedural JSON script generation), Python, `edge-tts` (Microsoft Neural Voices), and `ffmpeg`/`ffprobe` (audio stitching and frame-perfect duration measurement).
- **Testing**: Jest & React Testing Library (100% passing test coverage).

## Problems Faced While Building
1. **Testing Complex Server Components**: Mocking Next.js App Router hooks (`useSearchParams`, `useRouter`) alongside third-party ESM libraries (`react-markdown`) required advanced Jest configurations and custom mock components to achieve full test coverage without environment errors.
2. **Database Transaction Limits**: Provisioning the 60-minute demo meeting required inserting over 4,000 relational transcript rows simultaneously. This triggered SQLite variable limits and Prisma transaction timeouts (`Error P2028`). We engineered a robust chunking system to insert data in batches of 500 while extending Prisma's interactive timeout limits.
3. **Audio-Transcript Sync Drift**: Initially, we used math estimations (`wordCount * 0.4s`) to guess when a transcript line would be spoken in the UI. Over a 60-minute file, slight variations in the TTS speaking rate caused the audio and visual transcript to drift minutes out of sync. We fixed this by building a Python script (`regenerate_audio_sync.py`) to measure the exact byte-length duration of every generated audio chunk using `ffprobe`, injecting frame-perfect timings directly into the UI fixtures.

## Lessons Learned
- **High-Performance Audio Syncing**: We learned that using `requestAnimationFrame` to tie an HTML5 `<audio>` element's `currentTime` to a Zustand global store is the most performant way to drive complex UI updates (like bouncing speaker avatars and auto-scrolling text) without triggering costly React re-render loops.
- **Local Mocking Strategies**: We discovered the immense value of decoupling business logic from third-party APIs. By mocking the NextAuth session and Gemini endpoints entirely in the route handlers, we made the project infinitely more testable and demo-friendly.

## Summary of Major Updates
- **Migrated to SQLite**: Swapped PostgreSQL for SQLite for instantaneous, zero-config local setup.
- **Removed Hard API Dependencies**: Bypassed Google OAuth and Gemini API requirements via localized mocking and demo auth routes.
- **Realistic Meeting Simulation**: Replaced placeholder UI videos with a fully synthesized 60-minute, 8-speaker audio file (`launch-meeting.mp3`) mapped to perfectly synced transcript data.
- **Test Coverage**: Achieved fully green test suites across all intelligent UI components.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Reh1t/fathom-ai-clone.git
   cd fathom-ai-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory. Because we optimized for an offline demo, the requirements are vastly simplified:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="super-secret-local-key-for-development"
   # No external API keys (Google/Gemini) are required for the core demo!
   ```

4. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Login**
   Navigate to `http://localhost:3000/api/auth/demo` to instantly provision the database and bypass authentication.
