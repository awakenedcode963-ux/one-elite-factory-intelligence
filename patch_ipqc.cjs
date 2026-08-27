const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

if (!code.includes('useAuth')) {
    code = code.replace(/import \{ useLanguage \} from '\.\.\/lib\/LanguageContext';/, "import { useLanguage } from '../lib/LanguageContext';\nimport { useAuth } from '../lib/AuthContext';");
}
code = code.replace(/export function ModuleIPQC\(\) \{/, "export function ModuleIPQC() {\n  const { user } = useAuth();");

code = code.replace(/const \[inspectorName, setInspectorName\] = useState\(''\);/, "const inspectorName = user?.name || '';");

code = code.replace(/<select[\s\S]*?value=\{inspectorName\}[\s\S]*?onChange=\{\(e\) => setInspectorName\(e\.target\.value\)\}[\s\S]*?>[\s\S]*?<\/select>/, `<input type="text" disabled value={inspectorName} className="block w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 sm:text-sm text-zinc-500 cursor-not-allowed" />`);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
