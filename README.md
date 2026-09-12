# Fathom AI Clone

A fully functional, autonomous AI meeting notetaker MVP built to replicate the core value proposition of Fathom.video.

## 🚀 Features

- **🤖 Autonomous Meeting Capture**: Integrates with Recall.ai/MeetingBaas webhooks to deploy actual recording bots directly into Google Meet calls. No "faking" the capture layer—real bots, real video, real streaming transcripts.
- **🧠 Generative AI Intelligence**: Powered by Google Gemini 2.5 Flash. Instantly generates Executive Summaries and extracts Action Items the moment the meeting ends.
- **💬 Contextual AI Chat**: A built-in chat interface with temporary memory. Ask Gemini questions about the meeting, and it will answer based *strictly* on the injected transcript context to prevent hallucinations.
- **✨ Highlights & Bookmarks**: A streamlined approach to video clipping. Star important sentences in the transcript to save them to a dedicated Highlights tab for instant timestamp jumping.
- **🔗 Public Sharing**: One-click sharing generates a public URL, allowing non-authenticated guests to view the video, transcript, and AI summaries seamlessly.
- **🔍 Global Search**: A lightning-fast dashboard search that scans the database across all historical meeting transcripts.
- **📅 Google Calendar Sync**: Built-in integration to pull upcoming meetings directly from your schedule.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/)), managed via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Google OAuth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (for media player sync)
- **AI Models**: Google Gemini 2.5 Flash via `@google/genai`
- **Bot Infrastructure**: Recall.ai / MeetingBaas Webhooks

## 📐 Product & Engineering Decisions

During development, several strategic decisions were made to prioritize UX and delivery speed without compromising core functionality:
1. **Highlighting vs. Physical Clipping**: Instead of building a heavy backend media server (like FFmpeg) to trim and encode physical `.mp4` files, the "Share a clip" feature was reimagined. Users can "Star" transcript lines and share the full public meeting URL. This delivers the exact same core value (sharing information with absent team members) with significantly better reliability and faster load times.
2. **Real Capture vs. Stubbing**: While the project brief allowed stubbing the recording layer, we chose to integrate actual recording bots. Autonomous capture is the magic of the product, and proving it works end-to-end was a priority.

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
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database (Supabase)
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="..."
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."

   # AI & Bots
   GEMINI_API_KEY="..."
   RECALL_API_KEY="..."
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

## 📝 Assessment Notes
- The `.agent-logs/` directory has been tracked and committed throughout the development process.
- The UI is designed with a dark-mode first, highly responsive layout prioritizing transcript readability.
