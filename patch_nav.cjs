const fs = require('fs');
let i18n = fs.readFileSync('src/lib/i18n.ts', 'utf8');
i18n = i18n.replace(/analytics: 'Analytics'/, "analytics: 'Analytics',\n      ncr: 'NCR & CAPA'");
i18n = i18n.replace(/analytics: 'التحليلات'/, "analytics: 'التحليلات',\n      ncr: 'حالات عدم المطابقة (NCR)'");
fs.writeFileSync('src/lib/i18n.ts', i18n);

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
if(!layout.includes('AlertOctagon')) {
  layout = layout.replace(/BarChart3, LogOut/, "BarChart3, AlertOctagon, LogOut");
}
if(!layout.includes('nav.ncr')) {
  layout = layout.replace(/\{ to: '\/analytics', label: t\('nav.analytics'\), icon: BarChart3 \},/, "{ to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },\n    { to: '/ncr', label: t('nav.ncr'), icon: AlertOctagon },");
}
fs.writeFileSync('src/components/Layout.tsx', layout);

let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('ModuleAnalytics')) {
  app = app.replace(/import \{ ModuleMetrology \} from '\.\/pages\/ModuleMetrology';/, "import { ModuleMetrology } from './pages/ModuleMetrology';\nimport { ModuleAnalytics } from './pages/ModuleAnalytics';\nimport { ModuleNCR } from './pages/ModuleNCR';");
}
app = app.replace(/<Route path="analytics" element=\{<div className="font-medium text-zinc-500 p-8">Quality Analytics - Module 5<\/div>\} \/>/, '<Route path="analytics" element={<ModuleAnalytics />} />\n                <Route path="ncr" element={<ModuleNCR />} />');
fs.writeFileSync('src/App.tsx', app);
