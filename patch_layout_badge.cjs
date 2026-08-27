const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('NetworkSyncBadge')) {
  code = code.replace(/import \{ FlowerOfLifeLogo \} from '\.\/FlowerOfLifeLogo';/, "import { FlowerOfLifeLogo } from './FlowerOfLifeLogo';\nimport { NetworkSyncBadge } from './NetworkSyncBadge';");

  const insertPoint = /\{\/\* User & Logout \*\/\}\n(\s*)<div className="flex items-center gap-3">/;
  
  code = code.replace(insertPoint, `{/* Sync Badge */}\n$1<NetworkSyncBadge />\n$1{/* User & Logout */}\n$1<div className="flex items-center gap-3">`);
}

fs.writeFileSync('src/components/Layout.tsx', code);
