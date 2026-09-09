# Fathom AI Clone - Product Specifications

## 1. End-to-End User Journey

1. **Dashboard & Calendar Integration**: 
   - The user lands on a premium, dark-mode-first bento-grid dashboard.
   - Upcoming meetings (stubbed calendar data) are displayed prominently alongside recent recordings and key metric summaries.
2. **Live Meeting Recording (Simulation)**:
   - The user initiates a recording from an upcoming meeting.
   - The UI transitions to an active recording state with a pulsing "Bot Active" indicator.
   - Real-time transcription is simulated via a mock polling/SSE feed, displaying incoming text with speaker tags.
3. **Meeting Playback & Review**:
   - Post-meeting, the user accesses the Meeting Details view.
   - An audio/video player interface is provided, synchronized with a scrolling transcript.
   - Clicking on any transcript line instantly seeks the media player to the corresponding timestamp.
4. **Summary Templates**:
   - A dedicated tab allows the user to switch between AI-generated summary templates (e.g., "Executive Summary", "Q&A", "Action Items").
   - Changing the template triggers a simulated LLM generation state (skeleton loaders) before displaying the new format.
5. **Action Items & Clips**:
   - Extracted action items are presented as an interactive checklist.
   - Users can highlight sections of the transcript to create shareable "clips" (simulated).
6. **Cross-Meeting Search**:
   - A global omnibar allows users to search for keywords across all historical meeting transcripts, titles, and summaries, returning highlighted results.

---

## 2. Feature Matrix

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Bento Dashboard** | Premium layout showing calendar events, recent recordings, and stats. | High |
| **Playback Sync** | Media player synchronized with timestamped, auto-scrolling transcript. | High |
| **Live Recording** | Simulation of an active bot session with real-time transcript streaming. | High |
| **Smart Summaries** | Template-based meeting summaries (Standard, Exec, Action Items). | High |
| **Action Extraction** | Interactive checklist of tasks extracted from the meeting. | Medium |
| **Global Search** | Full-text search across all meetings and transcripts. | Medium |
| **Clipping** | Ability to highlight transcript sections to generate shareable clips. | Low |

---

## 3. Architecture Breakdown Plan

### Tech Stack
*   **Frontend**: Next.js 14+ (App Router), React, TypeScript.
*   **Styling**: Tailwind CSS, Shadcn UI (for accessible, premium components), Framer Motion (for micro-animations).
*   **State Management**: Zustand (for global player state and transcript sync).
*   **Icons**: Lucide React.
*   **Media**: Standard HTML5 Video/Audio API with custom wrapper for transcript seeking.

### Data Models
*   `Meeting`: `{ id, title, date, duration, mediaUrl, status (upcoming|recorded) }`
*   `TranscriptLine`: `{ id, meetingId, speaker, text, startTime, endTime }`
*   `Summary`: `{ meetingId, templateId, content_markdown }`
*   `ActionItem`: `{ id, meetingId, task, assignee, isCompleted }`

### Component Architecture
*   `DashboardLayout`: Sidebar navigation and global search omnibar.
*   `BentoGrid`: Reusable grid layout for dashboard widgets.
*   `MediaPlayer`: Custom media controls with `seekTo` imperative handles.
*   `TranscriptViewer`: Virtualized list of `TranscriptLine` components that auto-scroll based on the `MediaPlayer`'s current time.
*   `SummaryPanel`: Markdown renderer with template switching tabs.

---

## 4. Stubbing Protocol

Since we are focusing on the core value proposition and UI/UX, the backend recording bot and LLM layers will be fully mocked to ensure a realistic but self-contained frontend experience.

**1. Data Fixtures**
We will create a robust set of static JSON fixtures (`/fixtures/meetings.ts`, `/fixtures/transcripts.ts`) containing realistic meeting data (e.g., a product sync, a sales call).

**2. Media Mocking**
We will use a placeholder audio/video file for the media player. Transcript timestamps in our fixtures will map precisely to the timing of this placeholder media.

**3. Simulated Real-Time Bot (Live Recording)**
For the "Live Recording" view, we will implement a mock hook (`useLiveTranscript`) that reads from a static array of transcript lines and emits them sequentially on a timer (e.g., every 3-5 seconds), simulating the progressive arrival of transcription data from a websocket.

**4. Simulated LLM Generation**
When a user requests a different summary template, the application will set an `isGenerating` state for 1.5 seconds, displaying premium shimmer/skeleton loaders, before resolving with the pre-written fixture data for that specific template.
