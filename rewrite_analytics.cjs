const fs = require('fs');

let code = fs.readFileSync('src/pages/ModuleAnalytics.tsx', 'utf-8');

const dummyDataRegex = /const paretoData = [\s\S]*?export function ModuleAnalytics\(\) \{/;

const hookInject = `
export function ModuleAnalytics() {
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import('../services/api').then(({ fetchAnalyticsData }) => {
      fetchAnalyticsData()
        .then(data => {
          setAnalyticsData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Analytics data load failed:", err);
          // Fallback
          setAnalyticsData({
            paretoData: [
              { name: 'Wall Thickness', count: 120, cumulative: 35 },
              { name: 'Burned', count: 80, cumulative: 58 },
              { name: 'Reich', count: 50, cumulative: 73 },
            ],
            scrapData: [
              { machine: 'Ext-101', Extrusion: 45, Target: 50 },
            ],
            trendData: [
              { date: 'Mon', FPY: 96, Target: 95 },
            ]
          });
          setLoading(false);
        });
    });
  }, []);
`;

code = code.replace(dummyDataRegex, hookInject);

const renderRegex = /return \(\s*<div/;
const loadingRender = `
  if (loading || !analyticsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading Live Analytics...</div>
      </div>
    );
  }

  const { paretoData, scrapData, trendData } = analyticsData;

  return (
    <div`;

code = code.replace(renderRegex, loadingRender);

fs.writeFileSync('src/pages/ModuleAnalytics.tsx', code);
