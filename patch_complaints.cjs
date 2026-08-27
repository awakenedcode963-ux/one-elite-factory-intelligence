const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleComplaints.tsx', 'utf8');

if (!code.includes('useAuth')) {
    code = code.replace(/import \{ useLanguage \} from '\.\.\/lib\/LanguageContext';/, "import { useLanguage } from '../lib/LanguageContext';\nimport { useAuth } from '../lib/AuthContext';");
}
code = code.replace(/export function ModuleComplaints\(\) \{/, "export function ModuleComplaints() {\n  const { user } = useAuth();\n  const loggerName = user?.name || '';");

// add to newRecord
code = code.replace(/description,(\s+)status,/, "description,\n        status,\n        loggedBy: loggerName,");

// add to form
code = code.replace(/<form onSubmit=\{handleSubmit\} className="space-y-4">/, `<form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Logged By / Inspector</label>
              <input type="text" disabled value={loggerName} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-500 cursor-not-allowed" />
            </div>`);

fs.writeFileSync('src/pages/ModuleComplaints.tsx', code);
