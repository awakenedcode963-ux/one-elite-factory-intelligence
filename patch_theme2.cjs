const fs = require('fs');
let content = fs.readFileSync('src/lib/ThemeContext.tsx', 'utf8');

const regex = /const stored = localStorage\.getItem\('polo_qms_theme'\);/g;
content = content.replace(regex, "const stored = localStorage.getItem('theme');");

fs.writeFileSync('src/lib/ThemeContext.tsx', content);
