const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/pages/ModuleIPQC.tsx', 'utf8');

// Also update product localization
content = content.replace(
  /{p.Product_Code} - {p.Product_Name_EN}/g,
  "{p.Product_Code} - {t('shared.approved') === 'معتمد' ? p.Product_Name_AR : p.Product_Name_EN}"
);

// Update defect localization
content = content.replace(
  /{d.Defect_Code} - {d.Defect_Name_EN}/g,
  "{d.Defect_Code} - {t('shared.approved') === 'معتمد' ? d.Defect_Name_AR : d.Defect_Name_EN}"
);

fs.writeFileSync('/app/applet/src/pages/ModuleIPQC.tsx', content);
