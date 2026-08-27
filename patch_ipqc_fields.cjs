const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// 1. Add fields to interface IPQCRecord
const interfaceMatch = code.match(/interface IPQCRecord \{[\s\S]*?\n\}/);
if (interfaceMatch) {
  let newInterface = interfaceMatch[0].replace(
    /machine: string;/, 
    `machine: string;\n  shift?: string;\n  jobOrder?: string;\n  materialSupplier?: string;\n  actualCavity?: number;`
  );
  code = code.replace(interfaceMatch[0], newInterface);
}

// 2. Add useStates
const statesInsertion = `
  const [shift, setShift] = useState('Shift 1');
  const [jobOrder, setJobOrder] = useState('');
  const [materialSupplier, setMaterialSupplier] = useState('');
  const [actualCavity, setActualCavity] = useState('');
`;
code = code.replace(/const \[machine, setMachine\] = useState\('101'\);/, statesInsertion + `\n  const [machine, setMachine] = useState('101');`);

// 3. Add to submit record
const submitMatch = code.match(/const record: IPQCRecord = \{[\s\S]*?scrapRate\n\s*\};/);
if (submitMatch) {
  let newSubmit = submitMatch[0].replace(
    /machine,/, 
    `machine,\n      shift,\n      jobOrder,\n      materialSupplier,\n      actualCavity: actualCavity ? parseFloat(actualCavity) : undefined,`
  );
  code = code.replace(submitMatch[0], newSubmit);
}

// 4. Add reset fields
code = code.replace(/setMachine\('101'\);/, `setMachine('101');\n      setShift('Shift 1');\n      setJobOrder('');\n      setMaterialSupplier('');\n      setActualCavity('');`);

// 5. Add form fields UI
// Look for where the machine dropdown is.
const formMatch = code.match(/<div className="space-y-4">[\s\S]*?<label className="block text-sm font-medium text-zinc-700/);
if (formMatch) {
  const fieldsUI = `
                {/* NEW FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الوردية' : 'Shift'}</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    >
                      <option value="Shift 1">{language === 'ar' ? 'الوردية الأولى' : 'Shift 1'}</option>
                      <option value="Shift 2">{language === 'ar' ? 'الوردية الثانية' : 'Shift 2'}</option>
                      <option value="Shift 3">{language === 'ar' ? 'الوردية الثالثة' : 'Shift 3'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم أمر الشغل' : 'Job Order'}</label>
                    <input
                      type="text"
                      value={jobOrder}
                      onChange={(e) => setJobOrder(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                      placeholder={language === 'ar' ? 'مثال: JO-2023-01' : 'e.g. JO-2023-01'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'مورد ونوع الخامة / الخلطة' : 'Material Supplier / Recipe'}</label>
                    <input
                      type="text"
                      value={materialSupplier}
                      onChange={(e) => setMaterialSupplier(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                </div>
                {type === 'injection' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'عدد العيون الفعلية (الفريز)' : 'Actual Cavities'}</label>
                    <input
                      type="number"
                      value={actualCavity}
                      onChange={(e) => setActualCavity(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                )}
`;
  // We need to insert this before or after the Machine Select. 
  // Let's replace `<div className="space-y-4">` with `<div className="space-y-4">` + fieldsUI
  code = code.replace(/<div className="space-y-4">/, `<div className="space-y-4">\n${fieldsUI}`);
}

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
