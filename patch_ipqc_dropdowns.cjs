const fs = require('fs');

let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

const machineDropdownRegex = /<div className="sm:col-span-2">\s*<label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1\.5">\{t\('ipqc.machine'\)\}<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

const replacement = `<div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('shared.approved') === 'معتمد' ? 'مفتش الجودة' : 'QA Inspector'}</label>
                <select
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                >
                  <option value="" disabled>{t('shared.approved') === 'معتمد' ? 'اختر المفتش' : 'Select Inspector'}</option>
                  {masterData.employees.map((emp, index) => (
                    <option key={\`emp-\${index}\`} value={emp.Employee_Name}>{emp.Employee_Name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.machine')}</label>
                <select
                  required
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                >
                  {masterData.machines
                    .filter(m => m.Line_Type === (activeTab === 'extrusion' ? 'Extrusion' : 'Injection'))
                    .map((m, index) => (
                      <option key={\`mach-\${index}\`} value={m.Machine_ID}>{m.Machine_Name}</option>
                  ))}
                </select>
              </div>`;

content = content.replace(machineDropdownRegex, replacement);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
