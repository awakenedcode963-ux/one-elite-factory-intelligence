const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleNCR.tsx', 'utf8');

const canPrintLogic = `
                      {(user?.role === 'QA Manager' || user?.role === 'Executive') && (
                        <button onClick={() => handlePrint(record)} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-4 inline-flex">
                          <Printer className="w-3.5 h-3.5" /> طباعة تقرير NCR
                        </button>
                      )}
`;

code = code.replace(/<button onClick=\{\(\) => handlePrint\(record\)\} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-4 inline-flex">\s*?<Printer className="w-3\.5 h-3\.5" \/> طباعة تقرير NCR\s*?<\/button>/, canPrintLogic);

// Replace creator field to match new user
code = code.replace(/creator: user\?\.displayName \|\| user\?\.email \|\| 'Unknown',/, "creator: user?.name || 'Unknown',");

fs.writeFileSync('src/pages/ModuleNCR.tsx', code);
