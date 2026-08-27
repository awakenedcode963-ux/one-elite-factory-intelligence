const fs = require('fs');
let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// Update IPQCRecord
content = content.replace(
  "  defectType: string;",
  "  inspectorName?: string;\n  defectType: string;"
);

// Update api imports
content = content.replace(
  "import { fetchMasterData, submitInspection, ProductMaster, DefectMaster } from '../services/api';",
  "import { fetchMasterData, submitInspection, ProductMaster, DefectMaster, MachineMaster, EmployeeMaster } from '../services/api';"
);

// Update masterData state type
content = content.replace(
  "useState<{ products: ProductMaster[], defects: DefectMaster[] }>({ products: [], defects: [] });",
  "useState<{ products: ProductMaster[], defects: DefectMaster[], machines: MachineMaster[], employees: EmployeeMaster[] }>({ products: [], defects: [], machines: [], employees: [] });"
);

// Add inspectorName state
content = content.replace(
  "const [machine, setMachine] = useState('101');",
  "const [inspectorName, setInspectorName] = useState('');\n  const [machine, setMachine] = useState('101');"
);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
