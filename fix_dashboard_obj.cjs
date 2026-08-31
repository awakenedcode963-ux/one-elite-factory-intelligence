const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleExecutiveDashboard.tsx', 'utf-8');

// I need to change back ONLY the ones inside the fallback object
code = code.replace(/setDashboardData\(\{\s*(?:\(dashboardData\?\.[A-Z_]+\):\s*[^,]+,\s*)+\(dashboardData\?\.CRITICAL_ESCALATIONS\):\s*\[\]\s*\}\);/g, `setDashboardData({
            HEALTH_SCORE: 92.4,
            FPY: 96.8,
            CALIBRATION_COMPLIANCE: 98.5,
            CLOSED_CAPA: 85.0,
            SCRAP_PERCENTAGE: 2.1,
            COPQ: 245000,
            BUDGETED_COPQ: 300000,
            ISO_SCORE: 91.75,
            SHIFT_DATA: [
              { name: 'Shift A', output: 12500, scrapRate: 1.8 },
              { name: 'Shift B', output: 11200, scrapRate: 2.3 },
              { name: 'Shift C', output: 9800, scrapRate: 2.1 },
            ],
            COPQ_BREAKDOWN: [
              { name: 'Extrusion', value: 95000, color: '#f59e0b' },
              { name: 'Injection', value: 85000, color: '#d97706' },
              { name: 'Dimensions', value: 45000, color: '#b45309' },
              { name: 'Claims', value: 20000, color: '#ef4444' },
            ],
            CRITICAL_ESCALATIONS: []
          });`);

fs.writeFileSync('src/pages/ModuleExecutiveDashboard.tsx', code);
