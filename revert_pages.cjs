const fs = require('fs');

const pages = [
  { file: 'src/pages/ModuleIPQC.tsx', collection: 'ipqc_inspections' },
  { file: 'src/pages/ModuleCrusher.tsx', collection: 'crusher_logs' },
  { file: 'src/pages/ModuleComplaints.tsx', collection: 'customer_complaints' },
  { file: 'src/pages/ModuleMetrology.tsx', collection: 'metrology_instruments' }
];

pages.forEach(page => {
  let code = fs.readFileSync(page.file, 'utf8');
  
  if (code.includes('enqueueRecord')) {
    code = code.replace(/import \{ enqueueRecord \} from '\.\.\/services\/offlineSyncService';\n/, "");
    code = code.replace(/await enqueueRecord\('([^']+)', newRecord, [^)]+\);/g, `await addDoc(collection(db, '$1'), newRecord);`);
    fs.writeFileSync(page.file, code);
  }
});
