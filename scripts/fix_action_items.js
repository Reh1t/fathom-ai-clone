const fs = require('fs');
let code = fs.readFileSync('src/fixtures/summaries.ts', 'utf-8');

// Strip out all existing m5 tasks
code = code.replace(/\{\s*id:\s*"t_m5_ai_[^}]*\},\s*/g, '');

// The exact 8 tasks
const newTasks = [
  'Finalize introductions and agenda documentation',
  'Finalize engineering status documentation',
  'Finalize design and ux review documentation',
  'Finalize marketing and gtm strategy documentation',
  'Finalize qa and testing pipeline documentation',
  'Finalize infrastructure and devops documentation',
  'Finalize data and analytics documentation',
  'Finalize sales readiness documentation'
].map((t, i) => `  { id: "t_m5_ai_clean_${i}", meetingId: "m5", task: "${t}", assignee: "Sarah Chen (VP Product)", isCompleted: false },`).join('\n') + '\n';

// Inject the clean ones at the top of the array
code = code.replace('export const actionItems: ActionItem[] = [\n', 'export const actionItems: ActionItem[] = [\n' + newTasks);

fs.writeFileSync('src/fixtures/summaries.ts', code);
console.log('Cleaned up m5 tasks!');
