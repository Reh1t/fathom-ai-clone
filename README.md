# Fathom AI Clone

## What it is
An enterprise-grade AI meeting assistant inspired by Fathom. It focuses on turning recorded meetings into searchable transcripts, summaries, decisions, highlights, and action items.

## How it works
1. **Google Auth**: Secure authentication and identity provisioning.
2. **Calendar**: Read-only integration to pull upcoming events.
3. **Meeting Capture**: Autonomous recording layer (simulated for assessment).
4. **Transcript**: Speaker diarization and timestamped transcription.
5. **Gemini**: Generative AI processing of the raw transcript via `@google/genai`.
6. **Structured Intelligence**: Extraction of action items, executive summaries, and key decisions using JSON schemas.
7. **Searchable Workspace**: A clean, light-themed responsive dashboard to review past meetings and search transcripts.

## Evaluation Note
> **The meeting-capture layer is simulated for this submission, per the challenge allowance. The post-meeting intelligence workflow is implemented natively in the application.**
> 
> After signing in, the workspace is automatically provisioned with representative meeting data. Clicking **"Join"** on an upcoming meeting on the dashboard triggers a real-time simulation that injects a mocked transcript and routes you to the meeting intelligence view.

## 🛠️ Architecture & Tech Stack
The codebase follows a strict **Domain-Driven MVC Architecture**:
- **Services (Model)**: `src/services/` (Prisma DB operations and Gemini logic)
- **Controllers**: Thin `/api/` routes that delegate business logic to services.
- **Views**: Server Components that fetch data and orchestrate pure Feature Slices (`src/features/`).

**Tech Stack**:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Database**: PostgreSQL / [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google)
- **Styling**: Light Theme via [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI Models**: Google Gemini 2.5 Flash

## 💻 Running Locally

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
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GEMINI_API_KEY="..."
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

## 📝 Assessment Compliance
- Agent capture verification is documented in `CAPTURE-TEST.md`.
- Original agent transcripts are preserved in `.agent-logs/`.
