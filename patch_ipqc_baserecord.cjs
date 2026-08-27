const fs = require('fs');

let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

const baseRecordRegex = /const baseRecord = {\s*type: activeTab,\s*machine,\s*productCode,/;
const baseRecordReplacement = `const baseRecord = {
        inspectorName,
        type: activeTab,
        machine,
        productCode,`;

content = content.replace(baseRecordRegex, baseRecordReplacement);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
