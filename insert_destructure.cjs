const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleExecutiveDashboard.tsx', 'utf-8');

const regex = /return \(\s*<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 print:bg-white"/;
const replacement = `
  const { HEALTH_SCORE, FPY, CALIBRATION_COMPLIANCE, CLOSED_CAPA, SCRAP_PERCENTAGE, COPQ, BUDGETED_COPQ, ISO_SCORE, SHIFT_DATA, COPQ_BREAKDOWN, CRITICAL_ESCALATIONS } = dashboardData;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 print:bg-white"`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/ModuleExecutiveDashboard.tsx', code);
