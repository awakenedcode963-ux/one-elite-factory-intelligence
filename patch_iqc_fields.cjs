const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIQC.tsx', 'utf8');

// 1. Add fields to useState
const statesInsertion = `
  const [supplierCode, setSupplierCode] = useState('');
  const [requestingDept, setRequestingDept] = useState('');
  const [requestingDeptCode, setRequestingDeptCode] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [acceptedQty, setAcceptedQty] = useState('');
  const [rejectedQty, setRejectedQty] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
`;
code = code.replace(/const \[supplier, setSupplier\] = useState\(''\);/, statesInsertion + `\n  const [supplier, setSupplier] = useState('');`);

// 2. Add to record submission
const submitMatch = code.match(/const record = \{[\s\S]*?createdAt: Date.now\(\)\n\s*\};/);
if (submitMatch) {
  let newSubmit = submitMatch[0].replace(
    /supplier,/, 
    `supplier,\n      supplierCode,\n      requestingDept,\n      requestingDeptCode,\n      poNumber,\n      itemCode,\n      unit,\n      acceptedQty: parseFloat(acceptedQty) || 0,\n      rejectedQty: parseFloat(rejectedQty) || 0,\n      rejectionReason: (decision === 'Rejected' || decision === 'Quarantined') ? rejectionReason : 'N/A',`
  );
  code = code.replace(submitMatch[0], newSubmit);
}

// 3. Add field resets
const resetMatch = code.match(/setSupplier\(''\);/);
if (resetMatch) {
    code = code.replace(/setSupplier\(''\);/, `setSupplier('');\n      setSupplierCode('');\n      setRequestingDept('');\n      setRequestingDeptCode('');\n      setPoNumber('');\n      setItemCode('');\n      setUnit('Kg');\n      setAcceptedQty('');\n      setRejectedQty('');\n      setRejectionReason('');`);
}

// 4. Add UI fields in form
// Look for Supplier field div
const supplierMatch = code.match(/<div>\s*<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">\{language === 'ar' \? 'المورد' : 'Supplier'\}<\/label>\s*<input[^>]*>\s*<\/div>/);
if (supplierMatch) {
    const additionalFields1 = `
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'كود المورد' : 'Supplier Code'}</label>
                    <input type="text" value={supplierCode} onChange={e => setSupplierCode(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'رقم طلب الشراء' : 'PO Number'}</label>
                    <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'القسم الطالب' : 'Requesting Dept'}</label>
                    <input type="text" value={requestingDept} onChange={e => setRequestingDept(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'كود القسم الطالب' : 'Requesting Dept Code'}</label>
                    <input type="text" value={requestingDeptCode} onChange={e => setRequestingDeptCode(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
`;
    code = code.replace(supplierMatch[0], supplierMatch[0] + '\n' + additionalFields1);
}

// Add Item Code after Material Category
const categoryMatch = code.match(/<div>\s*<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">\{language === 'ar' \? 'الصنف' : 'Material Category'\}<\/label>[\s\S]*?<\/select>\s*<\/div>/);
if (categoryMatch) {
    const additionalFields2 = `
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'كود الصنف' : 'Item Code'}</label>
                    <input type="text" value={itemCode} onChange={e => setItemCode(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
`;
    code = code.replace(categoryMatch[0], categoryMatch[0] + '\n' + additionalFields2);
}

// Add Quantity fields and Rejection reason
const quantityMatch = code.match(/<div>\s*<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">\{language === 'ar' \? 'الكمية' : 'Quantity'\}<\/label>\s*<input[^>]*>\s*<\/div>/);
if (quantityMatch) {
    const additionalFields3 = `
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الوحدة' : 'Unit'}</label>
                    <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                      <option value="Kg">Kg</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Meters">Meters</option>
                      <option value="Tons">Tons</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الكمية المقبولة' : 'Accepted Qty'}</label>
                    <input type="number" value={acceptedQty} onChange={e => setAcceptedQty(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'الكمية المرفوضة' : 'Rejected Qty'}</label>
                    <input type="number" value={rejectedQty} onChange={e => setRejectedQty(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                  </div>
`;
    code = code.replace(quantityMatch[0], quantityMatch[0] + '\n' + additionalFields3);
}

// Add Rejection reason if decision is Rejected or Quarantined
const decisionMatch = code.match(/<div>\s*<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">\{language === 'ar' \? 'القرار' : 'Decision'\}<\/label>[\s\S]*?<\/select>\s*<\/div>/);
if (decisionMatch) {
    const additionalFields4 = `
                  {(decision === 'Rejected' || decision === 'Quarantined') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'أسباب عدم القبول' : 'Reasons for Rejection/Quarantine'}</label>
                      <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" rows={2} />
                    </div>
                  )}
`;
    code = code.replace(decisionMatch[0], decisionMatch[0] + '\n' + additionalFields4);
}

fs.writeFileSync('src/pages/ModuleIQC.tsx', code);
