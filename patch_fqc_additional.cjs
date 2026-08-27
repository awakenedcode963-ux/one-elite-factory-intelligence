const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleFinalQC.tsx', 'utf8');

const statesInsertion = `
  const [color, setColor] = useState('');
  const [specification, setSpecification] = useState('');
  const [toolRecipe, setToolRecipe] = useState('');
  const [machineNo, setMachineNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [outsideDiameter, setOutsideDiameter] = useState('');
  const [wallThickness, setWallThickness] = useState('');
`;
code = code.replace(/const \[productionDate, setProductionDate\] = useState\(''\);/, statesInsertion + `\n  const [productionDate, setProductionDate] = useState('');`);

const submitMatch = code.match(/const record = \{[\s\S]*?createdAt: Date.now\(\)\n\s*\};/);
if (submitMatch) {
  let newSubmit = submitMatch[0].replace(
    /batchNumber,/, 
    `batchNumber,\n      color,\n      specification,\n      toolRecipe,\n      machineNo,\n      orderNo,\n      outsideDiameter,\n      wallThickness,`
  );
  code = code.replace(submitMatch[0], newSubmit);
}

const resetMatch = code.match(/setBatchNumber\(''\);/);
if (resetMatch) {
    code = code.replace(/setBatchNumber\(''\);/, `setBatchNumber('');\n      setColor('');\n      setSpecification('');\n      setToolRecipe('');\n      setMachineNo('');\n      setOrderNo('');\n      setOutsideDiameter('');\n      setWallThickness('');`);
}

const uiMatch = code.match(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/);
if (uiMatch) {
  const fieldsUI = `
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'اللون' : 'Color'}</label>
                    <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'المواصفة' : 'Specification'}</label>
                    <input type="text" value={specification} onChange={e => setSpecification(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'تركيبة الخلطة' : 'Tool Recipe'}</label>
                    <input type="text" value={toolRecipe} onChange={e => setToolRecipe(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم الماكينة' : 'Machine No.'}</label>
                    <input type="text" value={machineNo} onChange={e => setMachineNo(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم أمر التشغيل' : 'Order No.'}</label>
                    <input type="text" value={orderNo} onChange={e => setOrderNo(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'القطر الخارجي' : 'Outside Diameter'}</label>
                    <input type="text" value={outsideDiameter} onChange={e => setOutsideDiameter(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'سمك الجدار' : 'Wall Thickness'}</label>
                    <input type="text" value={wallThickness} onChange={e => setWallThickness(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
`;
  code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/, `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n${fieldsUI}`);
}
fs.writeFileSync('src/pages/ModuleFinalQC.tsx', code);
