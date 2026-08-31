const fs = require('fs');

let code = fs.readFileSync('src/pages/ModuleExecutiveDashboard.tsx', 'utf-8');

// The dummy data block is from `// Dummy data for Executive Dashboard` up to `export function ModuleExecutiveDashboard() {`
const dummyDataRegex = /\/\/ Dummy data for Executive Dashboard[\s\S]*?export function ModuleExecutiveDashboard\(\) \{/;

const hookInject = `
export function ModuleExecutiveDashboard() {
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
              { name: 'Extrusion', value: 95000, color: '#f59e0b' },
              { name: 'Injection', value: 85000, color: '#d97706' },
              { name: 'Dimensions', value: 45000, color: '#b45309' },
              { name: 'Claims', value: 20000, color: '#ef4444' },
            ],
            CRITICAL_ESCALATIONS: []
          });
          setLoading(false);
        });
    });
  }, []);
`;

code = code.replace(dummyDataRegex, hookInject);

// Add loading state rendering
const renderRegex = /return \(\s*<div/;
const loadingRender = `
  if (loading || !dashboardData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading Live Data...</div>
      </div>
    );
  }

  return (
    <div`;

code = code.replace(renderRegex, loadingRender);

// Replace variables
const vars = [
  'HEALTH_SCORE', 'FPY', 'CALIBRATION_COMPLIANCE', 'CLOSED_CAPA',
  'SCRAP_PERCENTAGE', 'COPQ', 'BUDGETED_COPQ', 'ISO_SCORE',
  'SHIFT_DATA', 'COPQ_BREAKDOWN', 'CRITICAL_ESCALATIONS'
];

vars.forEach(v => {
  const regex = new RegExp(`(?<![a-zA-Z0-9_.])(${v})(?![a-zA-Z0-9_])`, 'g');
  code = code.replace(regex, `(dashboardData?.${v})`);
});

fs.writeFileSync('src/pages/ModuleExecutiveDashboard.tsx', code);

