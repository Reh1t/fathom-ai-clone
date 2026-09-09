export type SummaryTemplate = "Standard" | "Executive" | "ActionItems";

export type Summary = {
  meetingId: string;
  template: SummaryTemplate;
  contentMarkdown: string;
};

export const summaries: Summary[] = [
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
  { id: "a1", meetingId: "m1", task: "Map out headcount for migration", assignee: "Bob (CTO)", isCompleted: false },
  { id: "a2", meetingId: "m1", task: "Create resource plan", assignee: "Fiona (VP Eng)", isCompleted: true },
  { id: "a3", meetingId: "m1", task: "Finalize sales collateral", assignee: "George (Product)", isCompleted: false },
  { id: "a4", meetingId: "m2", task: "Implement new onboarding UI", assignee: "Fiona (VP Eng)", isCompleted: false },
];
