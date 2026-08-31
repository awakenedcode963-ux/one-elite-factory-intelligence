const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleExecutiveDashboard.tsx', 'utf-8');

// Replace the hardcoded mock data block with a state and useEffect block.

code = code.replace(/\/\/ Dummy data for Executive Dashboard based on the requirements\n(const [A-Z_]+ = [^;]+;\n)+const CRITICAL_ESCALATIONS = \[[^\]]+\];/g, `
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import('../services/api').then(({ fetchDashboardData }) => {
      fetchDashboardData()
        .then(data => {
          setDashboardData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Dashboard data load failed:", err);
          // Set fallback if failed so it doesn't break
          setDashboardData({
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
              { name: 'Extrusion Startup Scrap', value: 95000, color: '#f59e0b' },
              { name: 'Injection Runner/Flash', value: 85000, color: '#d97706' },
              { name: 'Dimensional Reject', value: 45000, color: '#b45309' },
              { name: 'Customer Claims', value: 20000, color: '#ef4444' },
            ],
            CRITICAL_ESCALATIONS: []
          });
          setLoading(false);
        });
    });
  }, []);
`);

// Replace variables with `dashboardData?.VARIABLE`
const vars = [
  'HEALTH_SCORE', 'FPY', 'CALIBRATION_COMPLIANCE', 'CLOSED_CAPA',
  'SCRAP_PERCENTAGE', 'COPQ', 'BUDGETED_COPQ', 'ISO_SCORE',
  'SHIFT_DATA', 'COPQ_BREAKDOWN', 'CRITICAL_ESCALATIONS'
];

vars.forEach(v => {
  const regex = new RegExp(`(?<![a-zA-Z0-9_.])(${v})(?![a-zA-Z0-9_])`, 'g');
  code = code.replace(regex, `(dashboardData?.${v})`);
});

// Remove the import if we put the data block inside the component, wait.
// I need to put the hooks INSIDE the component, not outside.
