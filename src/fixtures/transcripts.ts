export type TranscriptLine = {
  id: string;
  meetingId: string;
  speaker: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
};

export const generateLongTranscript = (meetingId: string): TranscriptLine[] => {
  const lines: TranscriptLine[] = [];
  let currentTime = 0;
  const speakers = ["Alice (CEO)", "Bob (CTO)", "Charlie (CFO)", "Diana (CMO)", "Evan (VP Sales)", "Fiona (VP Eng)", "George (Product)", "Hannah (HR)"];
  
  for (let i = 0; i < 200; i++) { // ~200 lines for a dense transcript
    const speaker = speakers[i % speakers.length];
    const duration = Math.floor(Math.random() * 10) + 5; // 5-15 seconds per line
    
    lines.push({
      id: `t_${meetingId}_${i}`,
      meetingId,
      speaker,
      text: `This is a simulated statement for line ${i + 1}. We are discussing the Q3 metrics and how they relate to our overall growth strategy. ${speaker} believes we need to focus more on retention. I agree, but acquisition is also key.`,
      startTime: currentTime,
      endTime: currentTime + duration,
    });
    currentTime += duration + 1;
  }
  return lines;
};

// Dense 1-hour executive sync
const m1Transcript: TranscriptLine[] = [
  { id: "t_m1_0", meetingId: "m1", speaker: "Alice (CEO)", text: "Alright everyone, let's get started with the Q3 Planning Sync. We have a lot of ground to cover today.", startTime: 0, endTime: 5 },
  { id: "t_m1_1", meetingId: "m1", speaker: "Charlie (CFO)", text: "Before we dive into the product updates, I want to quickly review our financial targets for the quarter. We're aiming for a 15% increase in ARR.", startTime: 6, endTime: 14 },
  { id: "t_m1_2", meetingId: "m1", speaker: "Bob (CTO)", text: "That sounds ambitious. From an engineering standpoint, we're currently constrained by the infrastructure migration. We need to allocate more resources there.", startTime: 15, endTime: 24 },
  { id: "t_m1_3", meetingId: "m1", speaker: "Alice (CEO)", text: "Understood. Bob, can you work with Fiona to map out exactly what headcount you need to unblock the migration by end of month?", startTime: 25, endTime: 32 },
  { id: "t_m1_4", meetingId: "m1", speaker: "Fiona (VP Eng)", text: "Yes, I'll put together a resource plan by this Friday and share it with the team.", startTime: 33, endTime: 38 },
  { id: "t_m1_5", meetingId: "m1", speaker: "Diana (CMO)", text: "On the marketing front, our new campaign is set to launch next week. We're expecting a significant bump in top-of-funnel leads.", startTime: 39, endTime: 46 },
  { id: "t_m1_6", meetingId: "m1", speaker: "Evan (VP Sales)", text: "That's great, Diana. My team is ready to capitalize on those leads, but we need the new sales collateral finalized.", startTime: 47, endTime: 54 },
  { id: "t_m1_7", meetingId: "m1", speaker: "George (Product)", text: "I can help with the collateral. I'll sync with Marketing tomorrow to ensure the product messaging is accurate.", startTime: 55, endTime: 62 },
  ...generateLongTranscript("m1").map(l => ({...l, startTime: l.startTime + 63, endTime: l.endTime + 63}))
];

const m2Transcript: TranscriptLine[] = [
  { id: "t_m2_0", meetingId: "m2", speaker: "George (Product)", text: "Let's review the mobile app roadmap. We need to prioritize the new onboarding flow.", startTime: 0, endTime: 6 },
  { id: "t_m2_1", meetingId: "m2", speaker: "Ian (Design)", text: "I have the new mockups ready. We've simplified the steps significantly.", startTime: 7, endTime: 12 },
  { id: "t_m2_2", meetingId: "m2", speaker: "Fiona (VP Eng)", text: "The engineering team reviewed them. It looks feasible for the next sprint, assuming no major backend changes.", startTime: 13, endTime: 20 },
];

export const transcripts: TranscriptLine[] = [
  ...m1Transcript,
  ...m2Transcript
];
