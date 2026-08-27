const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// The dimensions, 5s, packaging, and instrument sections are currently unconditionally rendered for extrusion/injection.
// They are enclosed in top level of the form grid.
// Let's replace the whole dimensions section wrapping
code = code.replace(/\{\/\* Dimensional QC Inspection Card \*\/\}/, "{activeTab !== 'shift_summary' && (\n              <>\n              {/* Dimensional QC Inspection Card */}");
code = code.replace(/\{\/\* Packaging Check \*\/\}\s*<div className="sm:col-span-6 bg-zinc-50 dark:bg-zinc-800\/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700\/50">[\s\S]*?<\/div>\s*<\/div>/, (match) => match + "\n              </>\n              )}");

// Let's hide the Defect Type section too.
code = code.replace(/<div className="sm:col-span-3">\s*<label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1\.5">\{t\('shared\.defect'\) === 'عيب' \? 'نوع العيب' : 'Defect Type'\}<\/label>/, 
"{activeTab !== 'shift_summary' && (\n                <div className=\"sm:col-span-3\">\n                  <label className=\"block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5\">{t('shared.defect') === 'عيب' ? 'نوع العيب' : 'Defect Type'}</label>");
code = code.replace(/<option value="none">\{t\('shared\.none'\)\}<\/option>[\s\S]*?<\/select>\s*<\/div>/, (match) => match + "\n              )}");

// The Instrument selection
code = code.replace(/<div className="sm:col-span-3">\s*<label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1\.5">\{t\('ipqc\.instrument'\)\}<\/label>/, 
"{activeTab !== 'shift_summary' && (\n                <div className=\"sm:col-span-3\">\n                  <label className=\"block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5\">{t('ipqc.instrument')}</label>");
code = code.replace(/<option value="">\{language === 'ar' \? '-- بدون أداة --' : '-- No Instrument --'\}<\/option>[\s\S]*?<\/select>\s*<\/div>/, (match) => match + "\n              )}");

// The Shift Summary fields: Average Weight, Total Accepted, Total Rejected
// We can insert these right before the submit button
const submitBtnRegex = /<div className="sm:col-span-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">/;
const shiftSummaryFields = `
              {activeTab === 'shift_summary' && (
                <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{language === 'ar' ? 'إجمالي الكمية المقبولة' : 'Total Accepted Qty'}</label>
                    <input required type="number" min="0" value={acceptedMeters} onChange={e => setAcceptedMeters(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{language === 'ar' ? 'إجمالي الكمية المرفوضة' : 'Total Rejected Qty'}</label>
                    <input required type="number" min="0" value={rejectedMeters} onChange={e => setRejectedMeters(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{language === 'ar' ? 'متوسط الوزن (كجم)' : 'Average Weight (kg)'}</label>
                    <input required type="number" step="0.001" value={averageWeight} onChange={e => setAverageWeight(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl" />
                  </div>
                </div>
              )}
`;
code = code.replace(submitBtnRegex, shiftSummaryFields + "\n              <div className=\"sm:col-span-6 pt-4 border-t border-zinc-200 dark:border-zinc-800\">");

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
