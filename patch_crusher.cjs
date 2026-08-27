const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleCrusher.tsx', 'utf8');

if (!code.includes('useAuth')) {
    code = code.replace(/import \{ useLanguage \} from '\.\.\/lib\/LanguageContext';/, "import { useLanguage } from '../lib/LanguageContext';\nimport { useAuth } from '../lib/AuthContext';");
}
code = code.replace(/export function ModuleCrusher\(\) \{/, "export function ModuleCrusher() {\n  const { user } = useAuth();");

code = code.replace(/const \[operatorName, setOperatorName\] = useState\(''\);/, "const operatorName = user?.name || '';");

code = code.replace(/<input required type="text" value=\{operatorName\} onChange=\{e => setOperatorName\(e\.target\.value\)\} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1\.5 text-sm outline-none focus:border-amber-500" \/>/, `<input type="text" disabled value={operatorName} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-500 cursor-not-allowed" />`);

// Remove setOperatorName from reset
code = code.replace(/setOperatorName\(''\);\n/, "");

fs.writeFileSync('src/pages/ModuleCrusher.tsx', code);
