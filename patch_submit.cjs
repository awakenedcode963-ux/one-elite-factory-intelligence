const fs = require('fs');
let content = fs.readFileSync('/app/applet/src/pages/ModuleIPQC.tsx', 'utf8');

content = content.replace(
  "defectType: selectedDefect.label,\n        defectSeverity: selectedDefect.severity,",
  "defectType: defectType === 'none' ? 'None (Conforming)' : String(selectedDefect.Defect_Code) + ' - ' + selectedDefect.Defect_Name_EN,\n        defectSeverity: defectType === 'none' ? 'none' : String(selectedDefect.Severity_Level).toLowerCase(),"
);

fs.writeFileSync('/app/applet/src/pages/ModuleIPQC.tsx', content);
