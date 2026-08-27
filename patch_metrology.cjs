const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/pages/ModuleMetrology.tsx', 'utf8');

// Imports
content = content.replace(
  "import { SOPReference } from '../components/SOPReference';",
  "import { SOPReference } from '../components/SOPReference';\nimport { fetchMasterData } from '../services/api';"
);

// Fetch modification
content = content.replace(
  /useEffect\(\(\) => \{\n    const q = query\(collection\(db, 'metrology_instruments'\), orderBy\('createdAt', 'desc'\)\);\n    const unsubscribe = onSnapshot\(q, \(snapshot\) => \{\n      const data = snapshot\.docs\.map\(doc => \(\{\n        id: doc\.id,\n        \.\.\.doc\.data\(\)\n      \}\)\) as InstrumentRecord\[\];\n      setInstruments\(data\);\n      setLoading\(false\);\n    \}\);\n    return \(\) => unsubscribe\(\);\n  \}, \[\]\);/m,
  `useEffect(() => {
    setLoading(true);
    fetchMasterData().then(data => {
      const mapped = data.calibration.map(c => ({
        id: c.Equipment_Tag,
        name: c.Equipment_Name,
        serialNumber: c.Equipment_Tag,
        dueDate: c.Next_Due_Date.substring(0, 10),
        createdAt: Date.now()
      }));
      setInstruments(mapped);
      setLoading(false);
    }).catch(console.error);
  }, []);`
);

fs.writeFileSync('/app/applet/src/pages/ModuleMetrology.tsx', content);
