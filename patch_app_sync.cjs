const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SyncProvider')) {
  code = code.replace(/import \{ ThemeProvider \} from '\.\/lib\/ThemeContext';/, "import { ThemeProvider } from './lib/ThemeContext';\nimport { SyncProvider } from './lib/SyncContext';");
  code = code.replace(/<LanguageProvider>/, "<LanguageProvider>\n      <SyncProvider>");
  code = code.replace(/<\/LanguageProvider>/, "      </SyncProvider>\n    </LanguageProvider>");
}

fs.writeFileSync('src/App.tsx', code);
