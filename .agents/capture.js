const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', chunk => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const context = JSON.parse(input);
    const transcriptPath = context.transcriptPath.replace('transcript.jsonl', 'transcript_full.jsonl');
    
    if (!fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({}));
      return;
    }

    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    
    const userInputs = [];
    const plannerResponses = [];
    
    for (const line of lines) {
      if (!line) continue;
      try {
        const step = JSON.parse(line);
        if (step.type === 'USER_INPUT') {
          userInputs.push(step);
        } else if (step.type === 'PLANNER_RESPONSE') {
          plannerResponses.push(step);
        }
      } catch (e) {}
    }
    
    if (userInputs.length === 0) {
        console.log(JSON.stringify({}));
        return;
    }
    
    const firstPrompt = userInputs[0];
    const firstPromptTime = new Date(firstPrompt.created_at);
    
    const yyyy = firstPromptTime.getUTCFullYear();
    const mm = String(firstPromptTime.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(firstPromptTime.getUTCDate()).padStart(2, '0');
    const hh = String(firstPromptTime.getUTCHours()).padStart(2, '0');
    const min = String(firstPromptTime.getUTCMinutes()).padStart(2, '0');
    const ss = String(firstPromptTime.getUTCSeconds()).padStart(2, '0');
    
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timestampStr = `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
    const shortSession = context.conversationId.split('-')[0];
    
    const logDir = path.join(context.workspacePaths[0], '.agent-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `${timestampStr}_${context.conversationId}.md`);
    
    const turns = [];
    for (const p of userInputs) {
        turns.push({ prompt: p, responses: [] });
    }
    
    for (const r of plannerResponses) {
        let currentTurn = null;
        for (let i = turns.length - 1; i >= 0; i--) {
            if (turns[i].prompt.step_index < r.step_index) {
                currentTurn = turns[i];
                break;
            }
        }
        if (currentTurn) {
            currentTurn.responses.push(r);
        }
    }
    
    let totalExchanges = userInputs.length;
    let lastPromptTime = userInputs[userInputs.length - 1].created_at;
    let modelName = context.modelName;
    if (modelName === "auto") {
        modelName = "gemini-3.1-pro"; // fallback
    }
    
    let markdown = `---
session_id: ${context.conversationId}
date: ${dateStr}
author: rehan
model: ${modelName}
tool: antigravity-ide
project: ${path.basename(context.workspacePaths[0])}
total_exchanges: ${totalExchanges}
first_prompt_time: ${firstPrompt.created_at}
last_prompt_time: ${lastPromptTime}
---

# Session Log - ${dateStr}

Session: \`${shortSession}\` | Project: \`${path.basename(context.workspacePaths[0])}\` | Author: \`rehan\`

---
`;

    for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        // Clean prompt: The prompt contains <USER_REQUEST>...</USER_REQUEST>. We should ideally extract everything inside, but keeping it verbatim is safer as requested.
        markdown += `\n[LOG_ENTRY type=PROMPT num=${i+1} session=${shortSession}]
timestamp: ${turn.prompt.created_at}
model: ${modelName}

${turn.prompt.content}
\n`;

        if (turn.responses.length > 0) {
            const finalResponse = turn.responses[turn.responses.length - 1];
            const responseText = finalResponse.content || '';
            
            markdown += `\n[LOG_ENTRY type=RESPONSE num=${i+1} session=${shortSession}]
timestamp: ${finalResponse.created_at}
model: ${modelName}

${responseText}
\n`;
        }
    }
    
    fs.writeFileSync(logFile, markdown);
    
    console.log(JSON.stringify({}));
  } catch (err) {
    fs.writeFileSync(path.join(process.env.USERPROFILE || 'C:\\', 'capture_error.log'), err.toString());
    console.log(JSON.stringify({}));
  }
});
