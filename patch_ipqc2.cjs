const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/pages/ModuleIPQC.tsx', 'utf8');

content = content.replace(
  /useEffect\(\(\) => \{\n    const q = query\(collection\(db, 'metrology_instruments'\)\);\n    const unsubscribe = onSnapshot\(q, \(snapshot\) => \{\n      const data = snapshot\.docs\.map\(doc => \(\{\n        id: doc\.id,\n        \.\.\.doc\.data\(\)\n      \}\)\) as InstrumentRecord\[\];\n      setInstruments\(data\);\n    \}\);\n    return \(\) => unsubscribe\(\);\n  \}, \[\]\);/m,
  ""
);

content = content.replace(
  "setInstruments(data.calibration as any);",
  `setInstruments(data.calibration.map(c => ({
        id: c.Equipment_Tag,
        name: c.Equipment_Name,
        serialNumber: c.Equipment_Tag,
        dueDate: c.Next_Due_Date.substring(0, 10),
        createdAt: Date.now()
      })));`
);

fs.writeFileSync('/app/applet/src/pages/ModuleIPQC.tsx', content);
