const fs = require('fs');
let code = fs.readFileSync('src/lib/i18n.ts', 'utf8');

code = code.replace(/ncr: 'NCR & CAPA'\s*}/, "ncr: 'NCR & CAPA', crusher: 'Crusher & Regrind', complaints: 'Customer Complaints' }");

fs.writeFileSync('src/lib/i18n.ts', code);
