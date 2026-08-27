const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleCrusher.tsx', 'utf8');

if (!code.includes("showSuccess")) {
    code = code.replace(/const \[isSyncing, setIsSyncing\] = useState\(false\);/, "const [isSyncing, setIsSyncing] = useState(false);\n  const [showSuccess, setShowSuccess] = useState(false);");
    
    code = code.replace(/alert\("✅ تم ترحيل سجل الكسارة لقاعدة البيانات بنجاح"\);/, "setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);");
    
    const successMsg = `
            {showSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-start gap-2 text-sm font-semibold ui-transition">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>تم ترحيل سجل الكسارة لقاعدة البيانات بنجاح</span>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">`;
    
    code = code.replace(/<div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">/, successMsg);
    
    fs.writeFileSync('src/pages/ModuleCrusher.tsx', code);
}
