const fs = require('fs');
const path = require('path');

const transcriptFile = path.join(__dirname, 'launch_transcript.json');
const data = JSON.parse(fs.readFileSync(transcriptFile, 'utf-8'));

// 1. Update meetings.ts
const meetingsPath = path.join(__dirname, '../src/fixtures/meetings.ts');
let meetingsCode = fs.readFileSync(meetingsPath, 'utf-8');

const newMeeting = `  {
    id: "m5",
    title: "Q4 Product Launch Kickoff",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    duration: "60:00",
    status: "recorded",
    attendees: [
      { name: "Sarah Chen (VP Product)" },
      { name: "Marcus Johnson (Engineering)" },
      { name: "Priya Patel (Design)" },
      { name: "David Kim (Marketing)" },
      { name: "Rachel Torres (QA)" },
      { name: "James Wright (DevOps)" },
      { name: "Aisha Mohammed (Data)" },
      { name: "Tom Bradley (Sales)" }
    ],
    mediaUrl: "/audio/launch-meeting.mp3",
  },
];`;

meetingsCode = meetingsCode.replace(/\];$/, newMeeting);
fs.writeFileSync(meetingsPath, meetingsCode);

// 2. Update transcripts.ts
const transcriptsPath = path.join(__dirname, '../src/fixtures/transcripts.ts');
let transcriptsCode = fs.readFileSync(transcriptsPath, 'utf-8');

const m5TranscriptsStr = data.transcripts.map(t => {
  return `  { id: "${t.id}", meetingId: "m5", speaker: "${t.speaker}", text: ${JSON.stringify(t.text)}, startTime: ${t.startTime}, endTime: ${t.endTime} }`;
}).join(',\n');

const m5Declaration = `\nconst m5Transcript: TranscriptLine[] = [\n${m5TranscriptsStr}\n];\n`;

transcriptsCode = transcriptsCode.replace(/export const transcripts:/, m5Declaration + '\nexport const transcripts:');
transcriptsCode = transcriptsCode.replace(/\];$/, '  ...m5Transcript\n];');
fs.writeFileSync(transcriptsPath, transcriptsCode);

// 3. Update summaries.ts
const summariesPath = path.join(__dirname, '../src/fixtures/summaries.ts');
let summariesCode = fs.readFileSync(summariesPath, 'utf-8');

const newSummary = `
  {
    meetingId: "m5",
    template: "Standard",
    contentMarkdown: \`# Q4 Product Launch Kickoff
    
## Executive Summary
The team met to review the final critical path for the Q4 product launch. Engineering and Design are on track, Marketing is fully prepped, and Infra is provisioned to handle 10x traffic.

## Key Decisions
- Strict code freeze begins next Monday.
- Load testing will occur this weekend.
- Sales has 15 enterprise clients lined up for early access.\`
  },
`;

summariesCode = summariesCode.replace(/export const summaries.*?\= \[/, 'export const summaries: Summary[] = [' + newSummary);

const m5ActionItemsStr = data.actionItems.map(a => {
  return `  { meetingId: "m5", task: ${JSON.stringify(a.task)}, assignee: "${a.assignee}", isCompleted: false }`;
}).join(',\n');

summariesCode = summariesCode.replace(/export const actionItems.*?\= \[/, 'export const actionItems: ActionItem[] = [\n' + m5ActionItemsStr + ',');
fs.writeFileSync(summariesPath, summariesCode);

console.log('Fixtures patched with m5 (Product Launch Kickoff).');
