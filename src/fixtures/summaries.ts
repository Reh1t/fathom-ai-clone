export type SummaryTemplate = "Standard" | "Executive" | "ActionItems";

export type Summary = {
  meetingId: string;
  template: SummaryTemplate;
  contentMarkdown: string;
};

export const summaries: Summary[] = [
  {
    meetingId: "m5",
    template: "Standard",
    contentMarkdown: `# Q4 Product Launch Kickoff
    
## Executive Summary
The team met to review the final critical path for the Q4 product launch. Engineering and Design are on track, Marketing is fully prepped, and Infra is provisioned to handle 10x traffic.

## Key Decisions
- Strict code freeze begins next Monday.
- Load testing will occur this weekend.
- Sales has 15 enterprise clients lined up for early access.`
  },

  {
    meetingId: "m1",
    template: "Standard",
    contentMarkdown: `## Q3 Planning Sync Overview
The executive team met to discuss targets and strategies for Q3. Key focus areas include financial growth, infrastructure migration, and upcoming marketing campaigns.

### Key Discussion Points:
- **Financial Targets:** Aiming for a 15% increase in ARR.
- **Engineering Blockers:** Infrastructure migration is currently constraining resources.
- **Marketing & Sales:** New campaign launching next week; sales collateral needs finalization.`
  },
  {
    meetingId: "m1",
    template: "Executive",
    contentMarkdown: `## Executive Summary - Q3 Planning
**Goal:** 15% ARR Growth in Q3.
**Status:** At Risk due to Engineering constraints.
**Next Steps:**
1. Unblock infrastructure migration (Bob/Fiona).
2. Finalize sales collateral for new marketing campaign (Diana/Evan/George).`
  },
  {
    meetingId: "m1",
    template: "ActionItems",
    contentMarkdown: `## Action Items
- [ ] **Bob & Fiona**: Map out headcount needed to unblock infrastructure migration by end of month.
- [ ] **Fiona**: Create resource plan and share by Friday.
- [ ] **George**: Sync with Marketing tomorrow to finalize product messaging for sales collateral.`
  },
  {
    meetingId: "m2",
    template: "Standard",
    contentMarkdown: `## Mobile App Roadmap Review
The team discussed the upcoming mobile app release, focusing heavily on improving the onboarding flow based on new design mockups. Engineering confirmed feasibility for the next sprint.`
  }
];

export type ActionItem = {
  id: string;
  meetingId: string;
  task: string;
  assignee: string;
  isCompleted: boolean;
};

export const actionItems: ActionItem[] = [
  { id: "t_m5_ai_clean_0", meetingId: "m5", task: "Finalize introductions and agenda documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_1", meetingId: "m5", task: "Finalize engineering status documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_2", meetingId: "m5", task: "Finalize design and ux review documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_3", meetingId: "m5", task: "Finalize marketing and gtm strategy documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_4", meetingId: "m5", task: "Finalize qa and testing pipeline documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_5", meetingId: "m5", task: "Finalize infrastructure and devops documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_6", meetingId: "m5", task: "Finalize data and analytics documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "t_m5_ai_clean_7", meetingId: "m5", task: "Finalize sales readiness documentation", assignee: "Sarah Chen (VP Product)", isCompleted: false },
  { id: "a1", meetingId: "m1", task: "Map out headcount for migration", assignee: "Bob (CTO)", isCompleted: false },
  { id: "a2", meetingId: "m1", task: "Create resource plan", assignee: "Fiona (VP Eng)", isCompleted: true },
  { id: "a3", meetingId: "m1", task: "Finalize sales collateral", assignee: "George (Product)", isCompleted: false },
  { id: "a4", meetingId: "m2", task: "Implement new onboarding UI", assignee: "Fiona (VP Eng)", isCompleted: false },
];
