const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// 1. Update interface
code = code.replace(/type: 'extrusion' \| 'injection';/, "type: 'extrusion' | 'injection' | 'shift_summary';\n  reportedInspectorName?: string;\n  shiftDate?: string;\n  averageWeight?: number;");

// 2. Add shift summary tab to activeTab state
code = code.replace(/useState\<'extrusion' \| 'injection'\>\('extrusion'\);/, "useState<'extrusion' | 'injection' | 'shift_summary'>('extrusion');");

// 3. Add states for shift summary
const stateInsertion = `
  const [reportedInspectorName, setReportedInspectorName] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [averageWeight, setAverageWeight] = useState('');
`;
code = code.replace(/const \[actualCavity, setActualCavity\] = useState\(''\);/, "const [actualCavity, setActualCavity] = useState('');" + stateInsertion);

// 4. Update HandleTabChange
const handleTabChangeMatch = code.match(/const handleTabChange = \(tab: 'extrusion' \| 'injection'\) => \{/);
if (handleTabChangeMatch) {
  code = code.replace(/const handleTabChange = \(tab: 'extrusion' \| 'injection'\) => \{/, "const handleTabChange = (tab: 'extrusion' | 'injection' | 'shift_summary') => {");
}

// 5. Submit Record logic
const submitInsertion = `
      let newRecord;
      if (activeTab === 'shift_summary') {
        newRecord = {
          ...baseRecord,
          type: 'shift_summary',
          reportedInspectorName,
          shiftDate,
          averageWeight: averageWeight ? Number(averageWeight) : undefined,
          acceptedMeters: Number(acceptedMeters), // reuse state for accepted qty
          rejectedMeters: Number(rejectedMeters), // reuse state for rejected qty
        };
      } else if (activeTab === 'extrusion') {
`;
code = code.replace(/let newRecord;\n\s*if \(activeTab === 'extrusion'\) \{/, submitInsertion);

// 6. Reset states
code = code.replace(/setActualWeight\(''\);/, "setActualWeight('');\n      setReportedInspectorName('');\n      setAverageWeight('');\n      setShiftDate(new Date().toISOString().split('T')[0]);");

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
