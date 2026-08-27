const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleFinalQC.tsx', 'utf8');

// 1. Add useStates
const statesInsertion = `
  const [productionDate, setProductionDate] = useState('');
  const [sampleNo, setSampleNo] = useState('');
  const [stationNo, setStationNo] = useState('');
  const [medium, setMedium] = useState('Water');
  const [actualCreep, setActualCreep] = useState('');
`;
code = code.replace(/const \[batchNumber, setBatchNumber\] = useState\(''\);/, statesInsertion + `\n  const [batchNumber, setBatchNumber] = useState('');`);

// 2. Add to record object in handleSubmit
const submitMatch = code.match(/const record = \{[\s\S]*?createdAt: Date.now\(\)\n\s*\};/);
if (submitMatch) {
  let newSubmit = submitMatch[0].replace(
    /batchNumber,/, 
    `batchNumber,\n      productionDate,\n      sampleNo,\n      stationNo,\n      medium: isHydro ? medium : 'N/A',\n      actualCreep: isHydro ? actualCreep : 'N/A',`
  );
  code = code.replace(submitMatch[0], newSubmit);
}

// 3. Reset states after submit
code = code.replace(/setBatchNumber\(''\);/, `setBatchNumber('');\n      setProductionDate('');\n      setSampleNo('');\n      setStationNo('');\n      setMedium('Water');\n      setActualCreep('');`);

// 4. Add UI fields
// Find the general fields area. We can look for `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">` containing `Lot/Batch No.`
const uiMatch = code.match(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<label className="block text-sm font-medium text-zinc-700/);
if (uiMatch) {
  const fieldsUI = `
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'تاريخ الإنتاج' : 'Production Date'}</label>
                    <input
                      type="date"
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم العينة' : 'Sample No.'}</label>
                    <input
                      type="text"
                      value={sampleNo}
                      onChange={(e) => setSampleNo(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
`;
  code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/, `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n${fieldsUI}`);
}

// 5. Add UI fields to Hydrostatic specific section
// Look for `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">` inside the Hydrostatic section.
// Usually after `{isHydro && (`
const hydroMatch = code.indexOf('{isHydro && (');
if (hydroMatch !== -1) {
    const hydroSpecificsUI = `
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم المحطة' : 'Station No.'}</label>
                        <input type="text" value={stationNo} onChange={e => setStationNo(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الوسط' : 'Medium'}</label>
                        <select value={medium} onChange={e => setMedium(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                          <option value="Water">Water / ماء</option>
                          <option value="Air">Air / هواء</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الزحف الفعلي' : 'Actual Creep'}</label>
                        <input type="text" value={actualCreep} onChange={e => setActualCreep(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                      </div>
`;
    // We can inject it right after the first `grid-cols-1 sm:grid-cols-2 gap-4` in the isHydro section
    const targetDiv = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">';
    const targetIdx = code.indexOf(targetDiv, hydroMatch);
    if (targetIdx !== -1) {
        code = code.substring(0, targetIdx + targetDiv.length) + '\n' + hydroSpecificsUI + code.substring(targetIdx + targetDiv.length);
    }
}

fs.writeFileSync('src/pages/ModuleFinalQC.tsx', code);
