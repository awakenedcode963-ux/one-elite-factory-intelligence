const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const regex = /<div className="text-center mb-8">[\s\S]*?<\/p>\s*<\/div>/;

const replacement = `<div className="text-center mb-8 flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 justify-center">
            CODEX ELITE™ <span className="font-normal opacity-70">| QualityOS</span>
          </h2>
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest">
            POLO EGYPT - Industrial Quality Intelligence
          </span>
          
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-400 uppercase">ISO 9001:2015 CERTIFIED</span>
          </div>
        </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/Login.tsx', content);
