const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('polo_toast')) {
  // Add state for toast
  code = code.replace(/export function Layout\(\) \{/, `export function Layout() {
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 5000);
    };
    window.addEventListener('polo_toast', handleToast);
    return () => window.removeEventListener('polo_toast', handleToast);
  }, []);
`);
  // Import useState and useEffect if not present
  if (!code.includes('useState')) {
    code = code.replace(/import React/, "import React, { useState, useEffect }");
  } else if (!code.includes('useEffect')) {
    code = code.replace(/useState([^\}]*)\}/, "useState, useEffect$1}");
  }

  // Inject toast UI
  const toastUI = `
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-5 ui-transition
          \${toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'}"
        >
          {toast.type === 'success' ? <span className="text-xl">🚀</span> : <AlertOctagon className="w-5 h-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
  `;
  
  code = code.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);/, `    ${toastUI}\n    </div>\n    </div>\n    </div>\n  );`);
}

fs.writeFileSync('src/components/Layout.tsx', code);
