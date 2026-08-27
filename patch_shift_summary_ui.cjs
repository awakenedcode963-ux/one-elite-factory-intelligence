const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// Add the 3rd tab to the header text
code = code.replace(/\{activeTab === 'extrusion' \? t\('ipqc\.tabs\.extrusion'\) : t\('ipqc\.tabs\.injection'\)\}/, "{activeTab === 'extrusion' ? t('ipqc.tabs.extrusion') : activeTab === 'injection' ? t('ipqc.tabs.injection') : language === 'ar' ? 'تقرير الوردية النهائي' : 'Shift End Report'}");

// Add the 3rd tab button
const tab2Match = code.indexOf("{t('ipqc.tabs.injection')}</button>");
if (tab2Match !== -1) {
  const insertPos = tab2Match + "{t('ipqc.tabs.injection')}</button>".length;
  const newTabButton = `
              <button
                type="button"
                onClick={() => handleTabChange('shift_summary')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-md ui-transition",
                  activeTab === 'shift_summary' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {language === 'ar' ? 'تقرير الوردية' : 'Shift Report'}
              </button>
  `;
  code = code.substring(0, insertPos) + newTabButton + code.substring(insertPos);
}

// Ensure the Machine options logic handles 'shift_summary'
// In Machine selection, it filters by Line_Type based on activeTab. For shift_summary we can show all machines or remove the filter.
code = code.replace(
  /\.filter\(m => m\.Line_Type === \(activeTab === 'extrusion' \? 'Extrusion' : 'Injection'\)\)/,
  ".filter(m => activeTab === 'shift_summary' ? true : m.Line_Type === (activeTab === 'extrusion' ? 'Extrusion' : 'Injection'))"
);

// We need to conditionally render the fields inside the form
// The form has Common fields first (Machine, Shift, JobOrder, Material, etc.), which are valid for shift_summary.
// We also need Inspector Name for shift_summary (since Supervisor types it).
// Currently `inspectorName` is disabled and populated from `user?.name`. We will replace it conditionally.

const inspectorFieldRegex = /<div className="sm:col-span-2">\s*<label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1\.5">\{t\('shared\.approved'\) === 'معتمد' \? 'مفتش الجودة' : 'QA Inspector'\}<\/label>\s*<input type="text" disabled value=\{inspectorName\}[^>]*>\s*<\/div>/;
const inspectorFieldReplacement = `
              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('shared.approved') === 'معتمد' ? 'مفتش الجودة' : 'QA Inspector'}</label>
                {activeTab === 'shift_summary' ? (
                   <input required type="text" value={reportedInspectorName} onChange={e => setReportedInspectorName(e.target.value)} className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 sm:text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" placeholder={language === 'ar' ? 'اسم المراقب الفعلي' : 'Actual Inspector Name'} />
                ) : (
                   <input type="text" disabled value={inspectorName} className="block w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 sm:text-sm text-zinc-500 cursor-not-allowed" />
                )}
              </div>
`;
code = code.replace(inspectorFieldRegex, inspectorFieldReplacement);

// For Shift summary, we need a Date field
// Let's inject it after Shift
const shiftFieldMatch = code.match(/<option value="Shift 3">\{language === 'ar' \? 'الوردية الثالثة' : 'Shift 3'\}<\/option>\s*<\/select>\s*<\/div>/);
if (shiftFieldMatch) {
  const shiftDateUI = `
                  {activeTab === 'shift_summary' && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{language === 'ar' ? 'تاريخ الوردية' : 'Shift Date'}</label>
                      <input required type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl" />
                    </div>
                  )}
  `;
  code = code.replace(shiftFieldMatch[0], shiftFieldMatch[0] + '\n' + shiftDateUI);
}

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
