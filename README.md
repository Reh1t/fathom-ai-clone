# Fathom AI Clone

## What it is
An AI meeting assistant inspired by Fathom, focused on turning recorded meetings into searchable transcripts, summaries, decisions, highlights, and action items.

## How it works
1. **Google Auth**: Secure authentication and identity.
2. **Calendar**: Read-only integration to pull upcoming events.
3. **Meeting Capture**: Autonomous recording layer.
4. **Transcript**: Speaker diarization and transcription.
5. **Gemini**: Generative AI processing of the raw transcript.
6. **Structured Intelligence**: Extraction of action items, summaries, and key decisions using JSON schemas.
7. **Searchable Workspace**: A responsive dashboard to review past meetings and search transcripts.

## Evaluation Note
> **The meeting-capture layer is simulated for this submission, per the challenge allowance. The post-meeting intelligence workflow is implemented natively in the application.**
> After signing in, the workspace is automatically provisioned with representative meeting data so the core product can be evaluated immediately without needing to set up external infrastructure. The Google Calendar integration is connected to the real Google API.

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL / [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI Models**: Google Gemini 2.5 Flash via `@google/genai`

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
