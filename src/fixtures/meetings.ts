export type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string; // e.g. "45:00"
  status: "upcoming" | "recorded";
  attendees: { name: string; avatar?: string }[];
  mediaUrl?: string; // Mocked placeholder
};

export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Executive Q3 Planning Sync",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    duration: "60:00",
    status: "recorded",
    attendees: [
      { name: "Alice (CEO)" },
      { name: "Bob (CTO)" },
      { name: "Charlie (CFO)" },
      { name: "Diana (CMO)" },
      { name: "Evan (VP Sales)" },
      { name: "Fiona (VP Eng)" },
      { name: "George (Product)" },
      { name: "Hannah (HR)" },
    ],
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // generic placeholder
  },
  {
    id: "m2",
    title: "Product Roadmap Review - Mobile App",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    duration: "30:00",
    status: "recorded",
    attendees: [
      { name: "George (Product)" },
      { name: "Fiona (VP Eng)" },
      { name: "Ian (Design)" },
    ],
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "m3",
    title: "Marketing Campaign Kickoff",
    date: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // in 2 hours
    duration: "45:00",
    status: "upcoming",
    attendees: [
      { name: "Diana (CMO)" },
      { name: "Jack (Marketing)" },
      { name: "Kelly (PR)" },
    ],
  },
  {
    id: "m4",
    title: "Weekly Engineering Standup",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // last week
    duration: "15:00",
    status: "recorded",
    attendees: [
      { name: "Fiona (VP Eng)" },
      { name: "Liam (Dev)" },
      { name: "Mia (Dev)" },
    ],
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  }
];
