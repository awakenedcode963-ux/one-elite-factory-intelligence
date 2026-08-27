const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleFQC.tsx', 'utf8');

const canPrintLogic = `
                      {(user?.role === 'QA Manager' || user?.role === 'Executive') && (
                        <button onClick={() => handlePrint(record)} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-4 inline-flex">
                          <Printer className="w-3.5 h-3.5" /> طباعة إذن الإفراج
                        </button>
                      )}
`;

code = code.replace(/<button onClick=\{\(\) => handlePrint\(record\)\} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-4 inline-flex">\s*?<Printer className="w-3\.5 h-3\.5" \/> طباعة إذن الإفراج\s*?<\/button>/, canPrintLogic);

fs.writeFileSync('src/pages/ModuleFQC.tsx', code);
