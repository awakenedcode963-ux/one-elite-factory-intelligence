const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// 1. Interface
const interfaceMatch = code.match(/interface IPQCRecord \{[\s\S]*?\n\}/);
if (interfaceMatch) {
  let newInterface = interfaceMatch[0].replace(
    /nominalWeight\?: number;/, 
    `nominalWeight?: number;\n  extrusionTemp?: string;\n  waterPressure?: string;\n  weightPerMeter?: number;`
  );
  code = code.replace(interfaceMatch[0], newInterface);
}

// 2. States
const statesInsertion = `
  const [extrusionTemp, setExtrusionTemp] = useState('');
  const [waterPressure, setWaterPressure] = useState('');
  const [weightPerMeter, setWeightPerMeter] = useState('');
`;
code = code.replace(/const \[actualWeight, setActualWeight\] = useState\(''\);/, statesInsertion + `\n  const [actualWeight, setActualWeight] = useState('');`);

// 3. Update Extrusion record
const extrusionRecordMatch = code.match(/newRecord = \{\s*\.\.\.baseRecord,\s*nominalWeight,/);
if (extrusionRecordMatch) {
  code = code.replace(/newRecord = \{\s*\.\.\.baseRecord,\s*nominalWeight,/, `newRecord = {\n          ...baseRecord,\n          nominalWeight,\n          extrusionTemp: extrusionTemp || undefined,\n          waterPressure: waterPressure || undefined,\n          weightPerMeter: weightPerMeter ? Number(weightPerMeter) : undefined,`);
}

// 4. Reset states
const resetMatch = code.match(/setActualWeight\(''\);/);
if (resetMatch) {
  code = code.replace(/setActualWeight\(''\);/, `setActualWeight('');\n      setExtrusionTemp('');\n      setWaterPressure('');\n      setWeightPerMeter('');`);
}

// 5. Add UI Inputs
// The weight inputs are enclosed in a grid.
// Let's insert the new inputs right after actual weight.
const insertUI = `
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'درجة حرارة البثق' : 'Extrusion Temp (°C)'}</label>
                    <input
                      required
                      type="text"
                      value={extrusionTemp}
                      onChange={(e) => setExtrusionTemp(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'ضغط الماء' : 'Water Pressure (Bar)'}</label>
                    <input
                      required
                      type="text"
                      value={waterPressure}
                      onChange={(e) => setWaterPressure(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'الوزن لكل متر' : 'Weight per Meter (kg/m)'}</label>
                    <input
                      required
                      type="number"
                      step="0.001"
                      value={weightPerMeter}
                      onChange={(e) => setWeightPerMeter(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
`;

// we will append to `onChange={(e) => setActualWeight(e.target.value)} ... />\n                  </div>`
const matchUI = code.indexOf('setActualWeight(e.target.value)}');
if (matchUI !== -1) {
  const closeDiv = code.indexOf('</div>', matchUI) + 6;
  code = code.substring(0, closeDiv) + '\n' + insertUI + code.substring(closeDiv);
}

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
