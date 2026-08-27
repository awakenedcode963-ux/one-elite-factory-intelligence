const fs = require('fs');

const pages = [
  { file: 'src/pages/ModuleIPQC.tsx', collection: 'ipqc_inspections' },
  { file: 'src/pages/ModuleCrusher.tsx', collection: 'crusher_logs' },
  { file: 'src/pages/ModuleComplaints.tsx', collection: 'customer_complaints' },
  { file: 'src/pages/ModuleMetrology.tsx', collection: 'metrology_instruments' }
];

pages.forEach(page => {
  let code = fs.readFileSync(page.file, 'utf8');
  
  if (!code.includes('enqueueRecord')) {
    code = code.replace(/import \{ ([^}]+) \} from 'firebase\/firestore';/, "import { $1 } from 'firebase/firestore';\nimport { enqueueRecord } from '../services/offlineSyncService';");
    
    // Replace addDoc with enqueueRecord
    code = code.replace(/await addDoc\(collection\(db, '([^']+)'\), newRecord\);/, `await enqueueRecord('$1', newRecord, user?.name || 'Unknown');`);
    code = code.replace(/await addDoc\(collection\(db, '([^']+)'\), newRecord\)/, `await enqueueRecord('$1', newRecord, user?.name || 'Unknown')`);
    
    fs.writeFileSync(page.file, code);
  }
});
