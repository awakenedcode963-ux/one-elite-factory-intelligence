const fs = require('fs');
let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

content = content.replace(
  'Routine checks must be logged every 2 hours during active shifts.',
  'Routine checks must be logged every hour during active shifts.'
);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
