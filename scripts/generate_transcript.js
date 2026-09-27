const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const participants = [
  { name: 'Sarah Chen (VP Product)', short: 'Sarah' },
  { name: 'Marcus Johnson (Engineering)', short: 'Marcus' },
  { name: 'Priya Patel (Design)', short: 'Priya' },
  { name: 'David Kim (Marketing)', short: 'David' },
  { name: 'Rachel Torres (QA)', short: 'Rachel' },
  { name: 'James Wright (DevOps)', short: 'James' },
  { name: 'Aisha Mohammed (Data)', short: 'Aisha' },
  { name: 'Tom Bradley (Sales)', short: 'Tom' }
];

const topics = [
  { 
    title: "Introductions and Agenda", 
    duration: 300, 
    lead: 'Sarah',
    phrases: [
      "Alright team, let's get started. Thanks everyone for joining the Q4 launch kickoff.",
      "Today we're going over the critical path for the upcoming launch.",
      "Marcus, Priya, David - I'll need updates from your respective teams.",
      "Let's make sure we're all aligned on the rollout schedule.",
      "Are there any immediate blockers we need to address before we dive in?"
    ]
  },
  { 
    title: "Engineering Status", 
    duration: 900, 
    lead: 'Marcus',
    phrases: [
      "From the engineering side, the backend APIs are mostly stable.",
      "We hit a small snag with the payment gateway integration, but James is looking into the infrastructure side of that.",
      "Frontend integration is tracking well. Priya's team delivered the final assets yesterday.",
      "Rachel, we'll need QA to sign off on the staging environment by Thursday.",
      "Technical debt is manageable right now, but we shouldn't push any major refactors until after launch."
    ]
  },
  { 
    title: "Design and UX Review", 
    duration: 600, 
    lead: 'Priya',
    phrases: [
      "The new user onboarding flow looks great. We've simplified the steps by 30%.",
      "I've shared the Figma links in the channel for final review.",
      "Marcus, your team did a great job implementing those micro-interactions.",
      "We're still waiting on some copy from Marketing for the empty states.",
      "Accessibility audit passed with flying colors this morning."
    ]
  },
  {
    title: "Marketing and GTM Strategy",
    duration: 600,
    lead: 'David',
    phrases: [
      "Marketing is fully prepped. The email sequence is drafted and ready to go.",
      "Tom, the sales enablement decks have been updated with the new feature set.",
      "We're planning a synchronized PR push on TechCrunch and Product Hunt.",
      "Aisha, we need to ensure the conversion tracking pixels are firing correctly.",
      "We have a slight budget increase for paid social this quarter."
    ]
  },
  {
    title: "QA and Testing Pipeline",
    duration: 400,
    lead: 'Rachel',
    phrases: [
      "QA is running automated regression suites nightly now.",
      "We found a few edge cases in Safari, but Marcus's team already patched them.",
      "I need everyone to enforce the code freeze strictly starting next Monday.",
      "Load testing is scheduled for this weekend. James, are the stress test environments spun up?",
      "So far, we're tracking at a 98% pass rate, which is great for this stage."
    ]
  },
  {
    title: "Infrastructure and DevOps",
    duration: 300,
    lead: 'James',
    phrases: [
      "Infra is solid. We've scaled up the read replicas in preparation for the traffic spike.",
      "Rachel, yes, the stress test environments are fully provisioned and ready.",
      "We did notice some latency spikes in the European region, we're looking into CDN caching rules.",
      "Auto-scaling groups are configured to handle up to 10x our normal baseline.",
      "Deployment pipeline is fully automated. One-click rollbacks are tested and working."
    ]
  },
  {
    title: "Data and Analytics",
    duration: 300,
    lead: 'Aisha',
    phrases: [
      "Analytics dashboards are live in Metabase.",
      "David, the tracking pixels are verified. We're seeing no data drop-off in staging.",
      "I've set up automated alerts if the conversion rate drops below our historical baseline.",
      "We still need to finalize the taxonomy for the new event streams.",
      "Data compliance checks for GDPR are completed."
    ]
  },
  {
    title: "Sales Readiness",
    duration: 200,
    lead: 'Tom',
    phrases: [
      "The sales team is hyped for this release. It addresses three of our top feature requests.",
      "David, the new decks are exactly what we needed. Thanks for turning those around so fast.",
      "We have 15 enterprise clients lined up for early access.",
      "Are there any known limitations we should communicate to early adopters?",
      "I'll schedule a training session for the SDRs next week."
    ]
  }
];

const generalResponses = [
  "That makes sense.", "I agree completely.", "Let's take that offline.", 
  "Can you elaborate on that?", "Sounds good to me.", "Got it.", 
  "Are we sure about those numbers?", "I'll follow up on that.", 
  "Good catch.", "Thanks for the update.", "I have a quick question about that."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomParticipantExcept(excludeName) {
  const others = participants.filter(p => p.short !== excludeName);
  return getRandomItem(others);
}

const TOTAL_DURATION_SECONDS = 3600; // 60 minutes

function generateMeeting() {
  let currentTime = 0;
  const transcripts = [];
  const actionItems = [];
  
  // Distribute topics roughly across the hour
  const timePerTopic = Math.floor(TOTAL_DURATION_SECONDS / topics.length);

  for (const topic of topics) {
    let topicEndTime = currentTime + timePerTopic;
    if (topicEndTime > TOTAL_DURATION_SECONDS) topicEndTime = TOTAL_DURATION_SECONDS;
    
    // Topic Intro
    const leadParticipant = participants.find(p => p.short === topic.lead);
    
    let leadIntro = getRandomItem(topic.phrases);
    
    // Simulate words -> duration (roughly 2.5 words per second)
    let duration = Math.max(2, Math.floor(leadIntro.split(' ').length / 2.5));
    
    transcripts.push({
      id: randomUUID(),
      speaker: leadParticipant.name,
      text: leadIntro,
      startTime: currentTime,
      endTime: currentTime + duration
    });
    
    currentTime += duration + 1;

    // Generate back and forth until topic ends
    while (currentTime < topicEndTime - 10) {
      // 70% chance the lead speaks, 30% chance someone else responds
      const isLead = Math.random() > 0.3;
      let speaker, text;
      
      if (isLead) {
        speaker = leadParticipant.name;
        text = getRandomItem(topic.phrases);
        
        // Sometimes generate an action item from the lead
        if (Math.random() > 0.8) {
          const assignee = getRandomParticipantExcept(topic.lead);
          text = `Let's make sure we track this. ${assignee.short}, can you take point on finalizing the ${topic.title.toLowerCase()} documentation by Friday?`;
          actionItems.push({
            id: randomUUID(),
            task: `Finalize ${topic.title.toLowerCase()} documentation`,
            assignee: assignee.name,
            isCompleted: false
          });
        }
      } else {
        const responder = getRandomParticipantExcept(topic.lead);
        speaker = responder.name;
        text = getRandomItem(generalResponses);
      }

      duration = Math.max(2, Math.floor(text.split(' ').length / 2.5));
      transcripts.push({
        id: randomUUID(),
        speaker: speaker,
        text: text,
        startTime: currentTime,
        endTime: currentTime + duration
      });
      
      // Add natural pause between speakers
      currentTime += duration + (Math.random() * 2 + 0.5);
    }
  }

  // Wrap up meeting
  const lastLine = "Alright, looks like we're out of time. Great work everyone, let's keep the momentum going for launch!";
  const lastDur = Math.max(2, Math.floor(lastLine.split(' ').length / 2.5));
  transcripts.push({
    id: randomUUID(),
    speaker: "Sarah Chen (VP Product)",
    text: lastLine,
    startTime: currentTime,
    endTime: currentTime + lastDur
  });

  return { transcripts, actionItems };
}

const data = generateMeeting();
fs.writeFileSync(path.join(__dirname, 'launch_transcript.json'), JSON.stringify(data, null, 2));
console.log(`Generated ${data.transcripts.length} transcript lines and ${data.actionItems.length} action items.`);
